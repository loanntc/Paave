# SRD-17: Market Board (Bảng Giá)

**Version:** 1.0
**Date:** 2026-05-30
**Author:** BA Spec Writer — Paave Product Team
**Status:** Ready for Development
**Linked FRD:** `docs/business/frd/17-market-board.md`
**Linked BRD:** `docs/business/BRD.md` §BO-03, §BO-06, §BO-08
**Linked SRD:** `docs/business/SRD.md` (base system rules)

---

## Table of Contents

1. [System Flow](#1-system-flow)
2. [Data Model and Handling Rules](#2-data-model-and-handling-rules)
3. [API Contracts](#3-api-contracts)
4. [Error Handling Matrix](#4-error-handling-matrix)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Related Documents](#6-related-documents)

---

## 1. System Flow

### 1.1 Price Board Load (HOSE / HNX / UPCOM)

```
1. Client mounts Markets screen → Price Board tab is active by default.

2. Client calls GET /api/v1/market/board?exchange=HOSE&limit=50&cursor=&sort_by=pct_change&sort_dir=desc

3. Server:
   a. Validate `exchange` parameter: must be one of 'HOSE', 'HNX', 'UPCOM'.
      - Invalid value → HTTP 400, error_code = E-MB-001.
   b. Validate `sort_by`: must be one of 'pct_change', 'last_price', 'total_volume', 'code'.
      - Invalid value → HTTP 400, error_code = E-MB-002.
   c. Validate `sort_dir`: must be 'asc' or 'desc'.
      - Invalid value → HTTP 400, error_code = E-MB-002.
   d. Validate `limit`: must be integer in [1, 100]. Default = 50 if absent.
      - Invalid value → HTTP 400, error_code = E-MB-002.

   e. Query:
      SELECT
        s.code,
        s.short_name,
        s.exchange,
        q.last_price,
        q.ref_price,
        q.ceiling_price,
        q.floor_price,
        q.pct_change,
        q.total_volume,
        q.session,
        q.quote_time,
        CASE
          WHEN q.last_price = q.ceiling_price THEN 'CEILING'
          WHEN q.last_price = q.floor_price   THEN 'FLOOR'
          WHEN q.last_price > q.ref_price     THEN 'UP'
          WHEN q.last_price = q.ref_price     THEN 'REF'
          WHEN q.last_price < q.ref_price     THEN 'DOWN'
          ELSE NULL
        END AS price_status
      FROM symbols s
      JOIN symbol_quotes_latest q ON q.symbol_code = s.code
      WHERE s.exchange = {exchange}
        AND s.symbol_type IN ('STOCK', 'EQUITY')
        AND q.quote_time >= CURRENT_DATE AT TIME ZONE 'Asia/Ho_Chi_Minh'
      ORDER BY {sort_by} {sort_dir}
      LIMIT {limit + 1}
      [cursor: WHERE (sort_by_col, code) > (cursor_sort_val, cursor_code)]

   f. `price_status` is computed server-side using the CASE expression above.
      The client MUST NOT recompute this field independently.
      If q.ref_price IS NULL or q.last_price IS NULL: price_status = NULL.

   g. Detect next_cursor:
      - If rows returned = limit + 1: strip the extra row, set next_cursor = encode(last_row.sort_val, last_row.code).
      - If rows returned ≤ limit: next_cursor = null.

   h. Return HTTP 200 with payload (see §3.1).

4. Client renders list. If rows = 0: renders empty state (not an error — see §4).

5. Market hours check (parallel to step 2):
   Client calls GET /api/v1/market/session?exchange=HOSE to get current session state.
   - If session = 'CLOSED': WebSocket connection is NOT initiated. Polling suspended.
   - If session in ('ATO', 'CONT', 'ATC'): WebSocket subscription initiated after REST load.
```

### 1.2 Watchlist Tab Load

```
1. User taps "Watchlist" tab. Client is authenticated.

2. Client calls GET /api/v1/market/watchlist
   - Authorization: Bearer <access_token> (required; HTTP 401 if absent or invalid).

3. Server:
   a. Decode user_id from JWT.
   b. Query:
      SELECT
        s.code,
        s.short_name,
        s.exchange,
        q.last_price,
        q.ref_price,
        q.ceiling_price,
        q.floor_price,
        q.pct_change,
        q.total_volume,
        q.session,
        q.quote_time,
        CASE
          WHEN q.last_price = q.ceiling_price THEN 'CEILING'
          WHEN q.last_price = q.floor_price   THEN 'FLOOR'
          WHEN q.last_price > q.ref_price     THEN 'UP'
          WHEN q.last_price = q.ref_price     THEN 'REF'
          WHEN q.last_price < q.ref_price     THEN 'DOWN'
          ELSE NULL
        END AS price_status
      FROM watchlist_items wi
      JOIN symbols s ON s.code = wi.symbol_code
      LEFT JOIN symbol_quotes_latest q ON q.symbol_code = wi.symbol_code
      WHERE wi.user_id = {user_id}
      ORDER BY q.pct_change DESC NULLS LAST

   c. No pagination on watchlist (max 50 items per BR-MB-06; full list returned in one response).
   d. Return HTTP 200 with payload (see §3.2).
   e. If watchlist has 0 items: return empty array — NOT an error.

4. Unauthenticated user reaching this endpoint: HTTP 401.
   Client intercepts 401 and redirects to login screen.
```

### 1.3 Holdings Tab Load

```
1. User taps "Holdings" tab. Client is authenticated.

2. Client calls GET /api/v1/market/holdings
   - Authorization: Bearer <access_token> (required; HTTP 401 if absent).

3. Server:
   a. Decode user_id from JWT.
   b. Lookup active sub_account_id for user (from sub_accounts table WHERE user_id = {user_id}
      AND is_active = true LIMIT 1).
      - No active sub-account → return HTTP 200 with empty array (not an error).
   c. Query:
      SELECT
        vh.symbol_code,
        s.short_name,
        s.exchange,
        vh.quantity,
        vh.avg_cost,
        q.last_price,
        q.ref_price,
        q.ceiling_price,
        q.floor_price,
        q.session,
        q.quote_time,
        CASE
          WHEN q.last_price = q.ceiling_price THEN 'CEILING'
          WHEN q.last_price = q.floor_price   THEN 'FLOOR'
          WHEN q.last_price > q.ref_price     THEN 'UP'
          WHEN q.last_price = q.ref_price     THEN 'REF'
          WHEN q.last_price < q.ref_price     THEN 'DOWN'
          ELSE NULL
        END AS price_status,
        CASE
          WHEN q.last_price IS NOT NULL AND vh.avg_cost IS NOT NULL AND vh.avg_cost != 0
            THEN (q.last_price - vh.avg_cost) * vh.quantity
          ELSE NULL
        END AS unrealized_pnl_vnd,
        CASE
          WHEN q.last_price IS NOT NULL AND vh.avg_cost IS NOT NULL AND vh.avg_cost != 0
            THEN (q.last_price - vh.avg_cost)::numeric / vh.avg_cost * 100
          ELSE NULL
        END AS unrealized_pnl_pct
      FROM virtual_holdings vh
      JOIN symbols s ON s.code = vh.symbol_code
      LEFT JOIN symbol_quotes_latest q ON q.symbol_code = vh.symbol_code
      WHERE vh.sub_account_id = {sub_account_id}
        AND vh.quantity > 0
      ORDER BY unrealized_pnl_pct DESC NULLS LAST

   d. `unrealized_pnl_vnd` and `unrealized_pnl_pct` are computed server-side.
      - If last_price IS NULL: both fields = null. Client renders "N/A".
      - If avg_cost = 0: both fields = null. Client renders "N/A". Server logs a data quality warning.
   e. Return HTTP 200 with payload (see §3.3).
```

### 1.4 WebSocket Real-Time Tick Updates

```
[PENDING: WS spec] — The WebSocket protocol, message schema, channel naming, and
authentication mechanism are pending finalization in the backend WebSocket specification.
The following defines client-side behavior once the WS contract is delivered.

Client-side behavior on WebSocket connection:

1. After REST load completes, if session is NOT 'CLOSED':
   a. Open WebSocket connection using auth token (mechanism TBD per WS spec).
   b. Subscribe to exchange channel for visible symbols.
      - Price Board tab: subscribe to all symbols on active exchange.
      - Watchlist tab: subscribe to watchlisted symbols only.
      - Holdings tab: subscribe to held symbols only.
   c. On subscription confirmation: begin processing tick events.

2. On tick event received { symbol_code, last_price, pct_change, total_volume, session }:
   a. Look up the symbol_code in the in-memory quote cache.
   b. If symbol is currently rendered on screen (visible, not scrolled off):
      - Compare new last_price to cached last_price.
      - If last_price increased: trigger 300ms green flash animation on last_price cell.
      - If last_price decreased: trigger 300ms red flash animation on last_price cell.
      - Update in-place: last_price, pct_change, total_volume cells.
      - Recompute: change_vnd = new_last_price - ref_price (ref_price does not change intra-day).
      - Recompute: price_status using same CASE logic as server-side.
      - For Holdings tab: recompute unrealized_pnl_vnd and unrealized_pnl_pct.
      - DO NOT reorder the list row to its new sort position.
   c. If symbol is not currently visible (scrolled off):
      - Update in-memory quote cache only. No animation.
      - When row scrolls into view: renders with latest cached value.
   d. Discard intermediate tick values if two ticks arrive for the same symbol within a
      single animation frame (16ms). Apply only the most recent value.

3. Reconnection on WebSocket disconnection (exponential backoff):
   - Attempt 1: wait 1s, reconnect.
   - Attempt 2: wait 2s, reconnect.
   - Attempt 3: wait 4s, reconnect.
   - Attempt 4: wait 8s, reconnect.
   - Attempt 5: wait 16s, reconnect.
   - Attempts 6–10: wait 30s per attempt, reconnect.
   - During reconnect attempts: show yellow banner
     "Dữ liệu có thể bị trễ — đang kết nối lại..."
   - After attempt 10 fails: show banner
     "Không thể kết nối — hiển thị dữ liệu lần cuối"
     and fall back to 30-second HTTP polling.

4. Fallback polling (when WebSocket unavailable after 10 failed reconnects):
   a. Every 30 seconds, call GET /api/v1/market/board?exchange={active_exchange}&limit=50&...
      with the same filter parameters as the initial load.
   b. Merge returned rows into the in-memory cache (update values, do not reorder).
   c. No animation during polling updates.
```

### 1.5 Watchlist Add / Remove

```
ADD:
1. User taps star icon on a Price Board row (or taps "Thêm vào danh sách theo dõi" in long-press sheet).

2. Client checks local watchlist count.
   - If local count = 50: show error toast immediately, DO NOT call the API.
     Toast: "Danh sách theo dõi đã đầy (tối đa 50 mã). Xóa một mã để thêm mới."
   - If local count < 50: proceed.

3. Client performs optimistic update:
   - Star icon fills immediately (solid lime).
   - Add symbol to local watchlist state.

4. Client calls POST /api/v1/watchlist/items
   Body: { "symbol_code": "VIC" }
   Authorization: Bearer <access_token>

5. Server:
   a. Decode user_id from JWT.
   b. Check watchlist_items COUNT WHERE user_id = {user_id}.
      - If count >= 50: return HTTP 422, error_code = E-MB-004.
   c. Check symbol exists in symbols table.
      - Not found: return HTTP 404, error_code = E-MB-005.
   d. Check for existing watchlist_items row WHERE user_id = {user_id} AND symbol_code = {code}.
      - Already exists: return HTTP 200 (idempotent; no second insert).
   e. INSERT INTO watchlist_items (user_id, symbol_code, created_at).
   f. Return HTTP 201.

6. If API call fails:
   - Revert optimistic update (star icon empties).
   - Show toast: "Không thể cập nhật danh sách theo dõi. Thử lại."

REMOVE:
1. User taps solid star icon (Price Board or Watchlist tab).

2. Client performs optimistic update:
   - Star icon empties immediately (hollow).
   - Remove symbol from local watchlist state.
   - If on Watchlist tab: row slides out with 200ms animation.

3. Client calls DELETE /api/v1/watchlist/items/{symbol_code}
   Authorization: Bearer <access_token>

4. Server:
   a. Decode user_id from JWT.
   b. DELETE FROM watchlist_items WHERE user_id = {user_id} AND symbol_code = {symbol_code}.
      - If row did not exist: return HTTP 200 (idempotent).
   c. Return HTTP 200.

5. If API call fails:
   - Revert optimistic update (star icon refills; row reappears on Watchlist tab).
   - Show toast: "Không thể cập nhật danh sách theo dõi. Thử lại."

DEBOUNCE:
- Star tap is debounced for the duration of the in-flight API call (max 5 seconds).
  A second tap while the first call is in-flight is ignored.
```

---

## 2. Data Model and Handling Rules

### 2.1 Tables Read by Market Board

| Table | Read columns | Notes |
|-------|-------------|-------|
| `symbols` | `code`, `short_name`, `exchange`, `symbol_type` | Filter: `symbol_type IN ('STOCK', 'EQUITY')` |
| `symbol_quotes_latest` | `symbol_code`, `last_price`, `ref_price`, `ceiling_price`, `floor_price`, `pct_change`, `total_volume`, `session`, `quote_time` | One row per symbol; updated by ETL |
| `watchlist_items` | `user_id`, `symbol_code`, `created_at` | Max 50 rows per user |
| `virtual_holdings` | `sub_account_id`, `symbol_code`, `quantity`, `avg_cost` | Filter: `quantity > 0` |

No tables are written by read-only endpoints. The watchlist endpoints write to `watchlist_items` only.

### 2.2 `price_status` Computation Rules

`price_status` is always computed server-side. Evaluation precedence (checked in this order):

| Priority | Condition | Result |
|----------|-----------|--------|
| 1 (highest) | `last_price IS NULL OR ref_price IS NULL` | `NULL` |
| 2 | `last_price = ceiling_price` | `'CEILING'` |
| 3 | `last_price = floor_price` | `'FLOOR'` |
| 4 | `last_price > ref_price` | `'UP'` |
| 5 | `last_price = ref_price` | `'REF'` |
| 6 | `last_price < ref_price` | `'DOWN'` |

### 2.3 P&L Computation Rules (Holdings)

| Field | Formula | Null condition |
|-------|---------|----------------|
| `unrealized_pnl_vnd` | `(last_price − avg_cost) × quantity` | Either `last_price` or `avg_cost` is NULL, or `avg_cost = 0` |
| `unrealized_pnl_pct` | `(last_price − avg_cost) / avg_cost × 100` | Same as above, or `avg_cost = 0` (division by zero guard) |

Both fields are returned as integers (VND has no decimals). `unrealized_pnl_pct` is returned as a float to 2 decimal places.

When `avg_cost = 0` (corrupted data): server returns both fields as `null` and logs a WARNING with `{ sub_account_id, symbol_code, avg_cost }`. Client displays "N/A" for both columns.

### 2.4 VND Formatting Rules

| Context | Format | Example |
|---------|--------|---------|
| Price cells in table rows | Period thousand separator, no ₫ symbol, no decimals | `45.600` |
| Volume column | Abbreviated: ≥1,000,000 → "X,XX Tr"; ≥1,000 → "X.XXX K"; <1,000 → raw integer | `1,25 Tr` |
| Toast messages, full-width displays | Period thousand separator, ₫ after space, no decimals | `1.250.000 ₫` |
| P&L VND in Holdings table | Abbreviated if ≥ 1,000,000: "+1,2 Tr" or "−800K"; otherwise full format with sign | `+1,2 Tr` |

Monetary values sourced from the database are integers (VND). No floating-point math is performed by the client.

### 2.5 Market Session State Authority

The client MUST determine session state from the `session` field in `symbol_quotes_latest` (delivered via REST or WebSocket tick). The client MUST NOT use the device clock or device timezone to compute session state.

If `session` is absent or null in the response, the client treats the session as 'CLOSED'.

### 2.6 Cursor-Based Pagination

The `cursor` parameter is an opaque base64-encoded string containing the sort value and `code` of the last row returned. The server decodes it to construct the WHERE clause for the next page. Client must not attempt to parse or construct cursor values.

---

## 3. API Contracts

### 3.1 GET /api/v1/market/board

**Purpose:** Load paginated price board for a given exchange.

**Authentication:** Required. Authorization: Bearer `<access_token>`.

**Request:**

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `exchange` | string | Yes | — | One of: `HOSE`, `HNX`, `UPCOM` |
| `limit` | integer | No | `50` | Integer in [1, 100] |
| `cursor` | string | No | `null` | Opaque cursor from previous response |
| `sort_by` | string | No | `pct_change` | One of: `pct_change`, `last_price`, `total_volume`, `code` |
| `sort_dir` | string | No | `desc` | One of: `asc`, `desc` |

**Success Response — HTTP 200:**

```json
{
  "exchange": "HOSE",
  "session": "CONT",
  "symbols": [
    {
      "code": "VIC",
      "short_name": "Vingroup",
      "exchange": "HOSE",
      "last_price": 45600,
      "ref_price": 44600,
      "ceiling_price": 47722,
      "floor_price": 41478,
      "change_vnd": 1000,
      "pct_change": 2.24,
      "total_volume": 1250000,
      "price_status": "UP",
      "session": "CONT",
      "quote_time": "2026-05-30T07:15:00Z"
    }
  ],
  "next_cursor": "eyJzb3J0X3ZhbCI6Mi4yNCwiY29kZSI6IlZJQyJ9",
  "total_count": 412
}
```

**Error Responses:**

| HTTP Status | `error_code` | Condition | Message |
|-------------|-------------|-----------|---------|
| 400 | `E-MB-001` | `exchange` not in allowed values | `"Sàn giao dịch không hợp lệ. Chấp nhận: HOSE, HNX, UPCOM."` |
| 400 | `E-MB-002` | Invalid `sort_by`, `sort_dir`, or `limit` | `"Tham số không hợp lệ."` |
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

**Empty exchange (0 symbols):** Returns HTTP 200 with `symbols: []` and `total_count: 0`. This is NOT an error.

---

### 3.2 GET /api/v1/market/watchlist

**Purpose:** Load all watchlisted symbols with latest quotes for the authenticated user.

**Authentication:** Required.

**Request:** No query parameters. Uses JWT to identify the user.

**Success Response — HTTP 200:**

```json
{
  "symbols": [
    {
      "code": "VIC",
      "short_name": "Vingroup",
      "exchange": "HOSE",
      "last_price": 45600,
      "ref_price": 44600,
      "ceiling_price": 47722,
      "floor_price": 41478,
      "change_vnd": 1000,
      "pct_change": 2.24,
      "total_volume": 1250000,
      "price_status": "UP",
      "session": "CONT",
      "quote_time": "2026-05-30T07:15:00Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**

| HTTP Status | `error_code` | Condition | Message |
|-------------|-------------|-----------|---------|
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

**Empty watchlist:** Returns HTTP 200 with `symbols: []` and `count: 0`. This is NOT an error.

---

### 3.3 GET /api/v1/market/holdings

**Purpose:** Load open paper trading positions with current quotes for the authenticated user.

**Authentication:** Required.

**Request:** No query parameters. Uses JWT to identify the user and derive active `sub_account_id`.

**Success Response — HTTP 200:**

```json
{
  "sub_account_id": "sa_01HX1111AAAA",
  "holdings": [
    {
      "symbol_code": "VIC",
      "short_name": "Vingroup",
      "exchange": "HOSE",
      "quantity": 500,
      "avg_cost": 45000,
      "last_price": 47000,
      "price_status": "UP",
      "unrealized_pnl_vnd": 1000000,
      "unrealized_pnl_pct": 4.44,
      "session": "CONT",
      "quote_time": "2026-05-30T07:15:00Z"
    }
  ],
  "count": 1
}
```

**Null P&L case** (last_price unavailable):

```json
{
  "symbol_code": "XYZ",
  "short_name": "Company XYZ",
  "exchange": "HNX",
  "quantity": 100,
  "avg_cost": 30000,
  "last_price": null,
  "price_status": null,
  "unrealized_pnl_vnd": null,
  "unrealized_pnl_pct": null,
  "session": "CLOSED",
  "quote_time": null
}
```

**Error Responses:**

| HTTP Status | `error_code` | Condition | Message |
|-------------|-------------|-----------|---------|
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

**No active sub-account / no holdings:** Returns HTTP 200 with `holdings: []` and `count: 0`. This is NOT an error.

---

### 3.4 POST /api/v1/watchlist/items

**Purpose:** Add a symbol to the authenticated user's watchlist.

**Authentication:** Required.

**Request Body:**

```json
{
  "symbol_code": "VIC"
}
```

**Request Field Constraints:**

| Field | Type | Constraints |
|-------|------|-------------|
| `symbol_code` | string | Required; max 10 characters; uppercase; must exist in `symbols` table |

**Success Response — HTTP 201:**

```json
{
  "symbol_code": "VIC",
  "created_at": "2026-05-30T07:20:00Z"
}
```

**Idempotent case (symbol already in watchlist) — HTTP 200:**

```json
{
  "symbol_code": "VIC",
  "created_at": "2026-05-28T10:00:00Z"
}
```

**Error Responses:**

| HTTP Status | `error_code` | Condition | Message |
|-------------|-------------|-----------|---------|
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 404 | `E-MB-005` | `symbol_code` not found in `symbols` table | `"Mã cổ phiếu không tồn tại."` |
| 422 | `E-MB-004` | Watchlist already has 50 items | `"Danh sách theo dõi đã đầy (tối đa 50 mã). Xóa một mã để thêm mới."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

---

### 3.5 DELETE /api/v1/watchlist/items/{symbol_code}

**Purpose:** Remove a symbol from the authenticated user's watchlist.

**Authentication:** Required.

**Path Parameter:**

| Parameter | Type | Constraints |
|-----------|------|-------------|
| `symbol_code` | string | Uppercase ticker code; max 10 characters |

**Success Response — HTTP 200:**

```json
{
  "symbol_code": "VIC",
  "removed": true
}
```

**Idempotent case (symbol was not in watchlist) — HTTP 200:**

```json
{
  "symbol_code": "VIC",
  "removed": false
}
```

**Error Responses:**

| HTTP Status | `error_code` | Condition | Message |
|-------------|-------------|-----------|---------|
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

---

## 4. Error Handling Matrix

| Scenario | HTTP Status | `error_code` | User-Facing Message | Client Action |
|----------|-------------|-------------|---------------------|---------------|
| Exchange has no active symbols | 200 | — | "Không có dữ liệu giao dịch cho sàn này hôm nay." | Render empty state; no error toast |
| `symbol_quotes_latest` row missing for a symbol | 200 (row included with null prices) | — | Cells render "—" in fog-muted color | Continue rendering other rows |
| Initial REST load fails after 3000ms timeout | 500 | `E-SYS-001` | "Không tải được dữ liệu. Thử lại." | Replace skeleton with error state + retry button |
| WebSocket fails after 10 reconnect attempts | — | — | "Không thể kết nối — hiển thị dữ liệu lần cuối" | Fall back to 30-second HTTP polling; show yellow banner |
| WebSocket disconnect (reconnecting) | — | — | "Dữ liệu có thể bị trễ — đang kết nối lại..." | Show yellow banner; continue reconnect attempts |
| Unauthenticated request to `/watchlist` or `/holdings` | 401 | `E-AUTH-001` | (no toast; redirect) | Redirect user to login screen |
| Watchlist add fails (capacity) | 422 | `E-MB-004` | "Danh sách theo dõi đã đầy (tối đa 50 mã). Xóa một mã để thêm mới." | Show toast; revert optimistic star fill |
| Watchlist add API fails (5xx or timeout) | 500 | `E-SYS-001` | "Không thể cập nhật danh sách theo dõi. Thử lại." | Show toast; revert optimistic star fill |
| `ref_price` is NULL for a symbol | 200 (row included) | — | Price cells rendered in fog-muted color; change columns render "—" | Log server-side WARNING with symbol_code |
| `avg_cost = 0` in virtual_holdings | 200 (row included) | — | P&L cells render "N/A" | Log server-side WARNING with sub_account_id and symbol_code |
| Holdings: `last_price` is NULL (trading halt) | 200 (row included) | — | P&L renders "N/A"; price renders "—" | No error; render available columns normally |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Endpoint | Target p95 | Maximum p99 |
|----------|-----------|-------------|
| GET /api/v1/market/board | < 200ms | < 400ms |
| GET /api/v1/market/watchlist | < 150ms | < 300ms |
| GET /api/v1/market/holdings | < 200ms | < 400ms |
| POST /api/v1/watchlist/items | < 200ms | < 400ms |
| DELETE /api/v1/watchlist/items/{code} | < 150ms | < 300ms |

### 5.2 Database Indexes Required

| Table | Index | Purpose |
|-------|-------|---------|
| `symbol_quotes_latest` | `(exchange, pct_change DESC)` | Default sort for market board |
| `symbol_quotes_latest` | `(exchange, total_volume DESC)` | Volume sort |
| `symbol_quotes_latest` | `(symbol_code)` | Join with symbols and holdings |
| `watchlist_items` | `(user_id, symbol_code)` UNIQUE | Watchlist lookup and uniqueness |
| `virtual_holdings` | `(sub_account_id, quantity)` | Holdings load (filter quantity > 0) |

### 5.3 Caching Strategy

| Data | Cache TTL | Invalidation |
|------|----------|--------------|
| Price board REST response (per exchange) | 15 seconds | On next ETL write to `symbol_quotes_latest` |
| Watchlist items (per user) | 60 seconds | On POST or DELETE to watchlist endpoint |
| Market session state (per exchange) | 30 seconds | Time-based expiry |

During market hours, the 15-second cache for the price board REST endpoint is acceptable because the WebSocket provides sub-second updates; the REST cache serves only initial loads and polling fallback.

### 5.4 Availability

- Market board read endpoints (GET) must maintain 99.9% availability during VN market hours (09:00–15:00 ICT Mon–Fri, excluding holidays).
- Watchlist write endpoints must maintain 99.5% availability at all times.
- WebSocket service availability target: 99.5% during market hours. Fallback to HTTP polling ensures the feature degrades gracefully on WS outage.

### 5.5 Security

- All endpoints require a valid JWT access token (except unauthenticated access returns HTTP 401, not 403).
- `sub_account_id` is derived server-side from the authenticated user's JWT. The client MUST NOT supply `sub_account_id` in any request.
- `user_id` is derived server-side from the authenticated user's JWT. No user ID parameter is accepted in watchlist or holdings requests.
- Rate limit on watchlist write endpoints: 30 requests per minute per user. Exceeding this limit returns HTTP 429.

---

## 6. Related Documents

| Document | Path | Relationship |
|----------|------|-------------|
| FRD-17: Market Board | `docs/business/frd/17-market-board.md` | Parent FRD; functional requirements, acceptance criteria, business rules |
| FRD-06: Markets Screen | `docs/business/frd/06-markets.md` | FR-38 (Korea) and FR-39 (Global) tabs unchanged; FR-36 disclaimer behavior unchanged |
| FRD-10: Paper Trading Engine | `docs/business/frd/10-paper-trading.md` | `virtual_holdings` data source; "Tiền ảo" label invariant |
| SRD (main) | `docs/business/SRD.md` | Base system architecture, auth patterns, error code conventions |
| SRD-18: Order History and Orderbook | `docs/business/srd/18-order-history-orderbook.md` | Companion SRD |
| API Specs | `docs/API Specs/paave_api_specs_detailed.md` | Watchlist API contract reference |

### Pending Dependencies

| Dependency | Blocks | Status |
|------------|--------|--------|
| WebSocket specification (protocol, message schema, auth, channel naming) | §1.4 (WebSocket client behavior) | [PENDING: WS spec] |
| Stock Detail deep-link parameter for Holdings tab row tap (pre-scroll to trading panel) | Client navigation behavior | Needs confirmation from FRD-04 team |

---

*Owner: Paave Product Team | Version: 1.0 — 2026-05-30*

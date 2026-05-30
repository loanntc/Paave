# SRD-18: Order History and Orderbook

**Version:** 1.0
**Date:** 2026-05-30
**Author:** BA Spec Writer — Paave Product Team
**Status:** Ready for Development
**Linked FRD:** `docs/business/frd/18-order-history-orderbook.md`
**Linked BRD:** `docs/business/BRD.md` §BO-04 (Paper Trading Core Loop)
**Linked SRD:** `docs/business/SRD-order-engine-v2.3.md`, `docs/business/SRD.md`

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

### 1.1 Order History List Load

```
1. Client navigates to Order History screen.
   Entry points: Portfolio screen, Order Placement confirmation, push notification deep-link.

2. Client calls GET /api/v1/virtual/orders with default parameters:
   - status_filter = 'ALL' (no filter)
   - date_from = today ICT − 29 days, at 00:00:00 ICT
   - date_to = today ICT, at 23:59:59 ICT
   - cursor = null (first page)
   - limit = 20

3. Server:
   a. Validate authorization: decode user_id from JWT.
      - Invalid or missing token → HTTP 401.
   b. Derive active sub_account_id:
      SELECT id FROM sub_accounts WHERE user_id = {user_id} AND is_active = true LIMIT 1.
      - No active sub-account → return HTTP 200 with empty orders array.
   c. Validate filter parameters:
      - status_filter: must be one of 'ALL', 'ACTIVE', 'FILLED', 'CANCELLED', 'EXPIRED'.
        Invalid value → HTTP 400, error_code = E-OH-001.
      - date_from ≤ date_to: if violated → HTTP 400, error_code = E-OH-002.
      - date_to − date_from ≤ 89 days: if violated → HTTP 400, error_code = E-OH-003.
      - date_to must not be in the future (ICT): if violated → HTTP 400, error_code = E-OH-002.
      - symbol_search: max 10 characters. If exceeded → HTTP 400, error_code = E-OH-004.
      - limit: must be exactly 20 (not user-configurable; reject other values with HTTP 400, error_code = E-OH-004).
   d. Apply status filter mapping:
      - 'ALL':       no WHERE clause on status.
      - 'ACTIVE':    WHERE vo.status IN ('PENDING', 'ACCEPTED', 'PARTIAL').
      - 'FILLED':    WHERE vo.status = 'FILLED'.
      - 'CANCELLED': WHERE vo.status IN ('CANCELLED', 'REJECTED').
      - 'EXPIRED':   WHERE vo.status = 'EXPIRED'.
   e. Query with cursor-based pagination:
      SELECT
        vo.id,
        vo.symbol_code,
        vo.exchange,
        vo.order_type,
        vo.side,
        vo.quantity,
        vo.filled_quantity,
        vo.price,
        vo.stop_price,
        vo.avg_fill_price,
        vo.status,
        vo.reject_reason,
        vo.cancel_reason,
        vo.placed_at,
        vo.matched_at,
        vo.cancelled_at,
        vo.expiry_at,
        vo.parent_order_id,
        vo.user_cancel_note,
        CASE WHEN vo.parent_order_id IS NOT NULL THEN true ELSE false END AS is_pre_reset
      FROM virtual_orders vo
      WHERE vo.sub_account_id = {sub_account_id}
        AND vo.placed_at >= {date_from}
        AND vo.placed_at <= {date_to}
        [AND status filter from step d]
        [AND vo.symbol_code ILIKE {symbol_search} || '%' — if symbol_search is not empty]
        [AND (vo.placed_at, vo.id) < (cursor_placed_at, cursor_id) — if cursor is provided]
      ORDER BY vo.placed_at DESC, vo.id DESC
      LIMIT 21  -- fetch limit + 1 to detect next page

   f. Detect next_cursor:
      - If rows returned = 21: strip the 21st row, set next_cursor = encode(row_20.placed_at, row_20.id).
      - If rows returned ≤ 20: next_cursor = null (last page).
   g. Execute total_count query (parallel to step e):
      SELECT COUNT(*) FROM virtual_orders vo
      WHERE vo.sub_account_id = {sub_account_id}
        AND vo.placed_at >= {date_from}
        AND vo.placed_at <= {date_to}
        [AND status filter]
        [AND symbol_search filter].
   h. Return HTTP 200 with payload (see §3.1).

4. Client renders the list.
   - If total_count = 0 AND no filters active: render "no orders" empty state.
   - If total_count = 0 AND filters are active: render "no results for filter" empty state.
```

### 1.2 Order Detail Fetch (Single Order with Fill History)

```
1. User taps an order row in the list to expand it.

2. If fill history is already cached from the initial list load: render immediately (no additional call).
   If fill history is NOT in the initial response (e.g., deep-link entry): client calls
   GET /api/v1/virtual/orders/{order_id}

3. Server:
   a. Validate user owns the order:
      SELECT vo.id, vo.sub_account_id FROM virtual_orders vo
      JOIN sub_accounts sa ON sa.id = vo.sub_account_id
      WHERE vo.id = {order_id} AND sa.user_id = {user_id}.
      - Order not found → HTTP 404, error_code = E-OH-005.
      - sub_account_id belongs to a different user → HTTP 403, error_code = E-OH-006.
   b. Fetch fill history:
      SELECT vt.id, vt.executed_at, vt.quantity, vt.price, vt.fees, vt.tax
      FROM virtual_trades vt
      WHERE vt.order_id = {order_id}
      ORDER BY vt.executed_at ASC
      LIMIT 50.
      - If more than 50 fills exist: return first 50, set has_more_fills = true.
   c. Return full order object with fill_history array (see §3.2).

4. Client renders the expanded detail panel (three sections: Order Details, Fill History, Timeline).
   Fill History section: rendered only if fill_history array length > 0.
   Timeline: derived client-side from the order's status fields and fill_history timestamps.
```

### 1.3 Orderbook REST Snapshot Load

```
1. Stock Detail screen or Order Placement screen mounts with a valid symbol_code.

2. Client calls GET /api/v1/market/orderbook/{symbol_code}

3. Server:
   a. Look up symbol in symbols table.
      - Not found → HTTP 404, error_code = E-OB-001.
   b. Check exchange:
      - If exchange NOT IN ('HOSE', 'HNX', 'UPCOM'):
        Return HTTP 404, error_code = E-OB-002.
        ("Sổ lệnh chỉ khả dụng cho cổ phiếu Việt Nam")
        Client DOES NOT render the Orderbook component at all.
   c. Query symbol_quote_detail:
      SELECT
        sqd.bids,
        sqd.asks,
        sqd.match_history,
        sqd.session,
        sqd.quote_time,
        q.last_price,
        q.ref_price,
        q.ceiling_price,
        q.floor_price,
        q.pct_change
      FROM symbol_quote_detail sqd
      JOIN symbol_quotes_latest q ON q.symbol_code = sqd.symbol_code
      WHERE sqd.symbol_code = {symbol_code}.
      - Row not found in symbol_quote_detail:
        Return HTTP 200 with { bids: [], asks: [], session: 'CLOSED', ... }.
        This is NOT an error; the orderbook renders in closed/empty state.
   d. Extract top 3 bid levels from bids JSONB array: bids[0], bids[1], bids[2].
      - If fewer than 3 levels: return all available levels (1 or 2); client pads with null rows.
   e. Extract top 3 ask levels from asks JSONB array: asks[0], asks[1], asks[2].
      - Same handling for fewer than 3 levels.
   f. Extract last 10 entries from match_history JSONB array.
      - If fewer than 10: return all available entries.
   g. Compute price_status for last_price using the same CASE precedence as SRD-17 §2.2.
   h. Return HTTP 200 with payload (see §3.3).

4. Client renders the Orderbook component from the REST snapshot.
5. If market is open (session != 'CLOSED'): client initiates WebSocket subscription
   [PENDING: WS spec] for live updates.
```

### 1.4 Orderbook WebSocket Real-Time Updates

```
[PENDING: WS spec] — Protocol, message schema, channel naming, and authentication
mechanism are pending the backend WebSocket specification.

Client-side behavior once WS contract is delivered:

1. After REST snapshot loads and session is NOT 'CLOSED':
   a. Open WebSocket connection with auth token (mechanism TBD per WS spec).
   b. Subscribe to orderbook channel for {symbol_code}.
   c. On connection confirmation: begin processing updates.

2. On WebSocket orderbook event received:
   a. Bid/ask level update { bids: [...], asks: [...] }:
      - Update the in-memory bid/ask state.
      - Re-render only the changed cells.
      - Trigger 300ms highlight animation on cells whose value changed.
   b. Match trade event { time, price, volume, side }:
      - Prepend new row to match_history array.
      - Remove the row at index 10 (keep exactly 10 rows).
      - Trigger 200ms slide-in animation on the new row.
   c. Last price update { last_price, pct_change }:
      - Update center price bar.
      - Recompute price_status using same CASE logic as server.
      - Trigger 300ms color flash on the last_price cell.

3. On WebSocket session field changing to 'ATO' or 'ATC':
   - Switch Orderbook to periodic matching mode (see §1.5).

4. On WebSocket session field changing from 'ATO'/'ATC' to 'CONT':
   - Switch Orderbook back to standard bid/ask layout.

5. Reconnection logic:
   - Reconnect every 3 seconds, up to 10 attempts.
   - During reconnect: show amber pill "Đang kết nối lại..." above orderbook.
   - After 10 failed attempts: show error state (§4 error matrix).

6. Screen lifecycle:
   - Screen goes to background: maintain connection for 30 seconds; disconnect after 30s.
   - Screen returns to foreground after disconnect: call REST snapshot; reconnect WS.
   - Symbol changes (user navigates to different stock): unsubscribe from previous symbol
     before subscribing to new symbol.
   - Screen closes: unsubscribe and close connection cleanly.
```

### 1.5 Orderbook ATO / ATC Session Handling

```
1. When session field = 'ATO' or 'ATC' (from REST snapshot or WebSocket update):
   a. Hide bid/ask Zones 1 and 3.
   b. Replace center bar (Zone 2) with periodic matching banner:
      - ATO: header "Khớp lệnh định kỳ" + sub-text "Đang khớp lệnh định giá mở cửa (09:00–09:15)"
      - ATC: header "Khớp lệnh định kỳ" + sub-text "Đang khớp lệnh định giá đóng cửa (14:30–14:45)"
      - Show ref_price as: "Giá tham chiếu: {ref_price} ₫"
   c. Zone 4 (Match History) remains visible and continues receiving updates.
   d. Price tap-to-fill (FR-OB-07) is inactive during ATO/ATC (no price rows visible).

2. When session transitions from ATO to CONT at 09:15:
   - Show standard bid/ask layout. Re-fetch REST snapshot to populate current bid/ask levels.
   - Resume WebSocket bid/ask updates.

3. When session transitions from ATC to CLOSED at 14:45:
   - Switch to closed market mode (§1.6).
```

### 1.6 Orderbook Closed Market Mode

```
1. When session = 'CLOSED':
   a. Do NOT open WebSocket connection.
   b. Call REST snapshot once on component mount.
   c. Render "Dữ liệu cuối phiên" grey badge in top-right corner of Orderbook component.
   d. All price cells render with color per price_status rules (colors reflect last session).
   e. No "Đang kết nối lại..." indicator is shown.
   f. No auto-refresh.

2. When session = 'LUNCH_BREAK':
   - Treat identically to 'CLOSED' mode above.
   - Badge text: "Dữ liệu cuối phiên" (same badge).
```

---

## 2. Data Model and Handling Rules

### 2.1 Tables Read by Order History

| Table | Read Columns | Notes |
|-------|-------------|-------|
| `virtual_orders` | `id`, `sub_account_id`, `symbol_code`, `exchange`, `order_type`, `side`, `quantity`, `filled_quantity`, `price`, `stop_price`, `avg_fill_price`, `status`, `reject_reason`, `cancel_reason`, `placed_at`, `matched_at`, `cancelled_at`, `expiry_at`, `parent_order_id`, `user_cancel_note` | Filter by sub_account_id + date range |
| `virtual_trades` | `id`, `order_id`, `executed_at`, `quantity`, `price`, `fees`, `tax` | Fetched per order_id for detail view; max 50 rows |

### 2.2 Tables Read by Orderbook

| Table | Read Columns | Notes |
|-------|-------------|-------|
| `symbol_quote_detail` | `symbol_code`, `bids` (JSONB), `asks` (JSONB), `match_history` (JSONB), `session`, `quote_time` | bids/asks: top 3 levels; match_history: last 10 |
| `symbol_quotes_latest` | `symbol_code`, `last_price`, `ref_price`, `ceiling_price`, `floor_price`, `pct_change` | Joined to get price band context |
| `symbols` | `code`, `exchange` | Exchange check to gate VN-only orderbook |

### 2.3 JSONB Structure for Bids and Asks

```json
{
  "bids": [
    { "price": 45400, "volume": 12000 },
    { "price": 45300, "volume": 8500 },
    { "price": 45200, "volume": 4200 }
  ],
  "asks": [
    { "price": 45700, "volume": 6300 },
    { "price": 45800, "volume": 9100 },
    { "price": 45900, "volume": 3800 }
  ]
}
```

`bids[0]` = best bid (highest price). `asks[0]` = best ask (lowest price). The server returns the JSONB sliced to the first 3 elements of each array. If the source JSONB has fewer than 3 elements, all available elements are returned. Missing levels are represented as `null` in the response array.

### 2.4 JSONB Structure for Match History

```json
{
  "match_history": [
    { "time": "09:31:45", "price": 45600, "volume": 2000, "side": "BUY" },
    { "time": "09:31:20", "price": 45550, "volume": 1500, "side": "SELL" }
  ]
}
```

The server returns the last 10 entries. The `side` field is optional in the source data; if absent, the client renders the volume column in neutral (white) color.

### 2.5 Orderbook Price Status Computation

Applied to every price value rendered in the Orderbook component — bid prices, ask prices, last_price, and match_history prices.

Evaluation precedence (same rule as SRD-17 §2.2, different hex values for Orderbook):

| Priority | Condition | Result | Color Hex |
|----------|-----------|--------|-----------|
| 1 | `price IS NULL OR ref_price IS NULL` | `NULL` | `#9E9E9E` (grey) |
| 2 | `price = ceiling_price` | `'CEILING'` | `#AA00FF` (violet) |
| 3 | `price = floor_price` | `'FLOOR'` | `#00BCD4` (cyan) |
| 4 | `price > ref_price` | `'UP'` | `#4CAF50` (green) |
| 5 | `price < ref_price` | `'DOWN'` | `#F44336` (red) |
| 6 | `price = ref_price` | `'REF'` | `#FFC107` (amber) |

Note: The Orderbook uses different color hex values from the Market Board for ceiling/floor. The Market Board uses `#7B2FBE` / `#1D4ED8`; the Orderbook uses `#AA00FF` / `#00BCD4`. Both are correct — they follow the Vietnamese exchange standard but use the Orderbook-specific palette.

### 2.6 Order Status to Filter Mapping

| UI Filter Label | Statuses queried |
|----------------|-----------------|
| "Tất cả" | No filter — all statuses returned |
| "Đang chờ" | `status IN ('PENDING', 'ACCEPTED', 'PARTIAL')` |
| "Đã khớp" | `status = 'FILLED'` |
| "Đã huỷ" | `status IN ('CANCELLED', 'REJECTED')` |
| "Hết hạn" | `status = 'EXPIRED'` |

### 2.7 Timestamp Display Rules (Order History)

| Condition | Display format | Example |
|-----------|---------------|---------|
| `placed_at` is less than 24 hours ago | Relative: "[N] giờ trước" or "[N] phút trước" | "2 giờ trước" |
| `placed_at` is 24 hours ago or older | Absolute: "DD/MM/YYYY HH:mm" ICT | "28/05/2026 09:34" |

All timestamps stored in UTC; displayed in ICT (UTC+7). The client performs the UTC → ICT conversion.

### 2.8 `reject_reason` Null Handling

If `status = 'REJECTED'` and `reject_reason` is NULL or empty string: client renders "Không có thông tin lý do từ chối." in the detail view. The server MUST NOT return null for this field on a REJECTED order — it must return an empty string or the actual reason. If the backend returns null: client applies the fallback text above.

### 2.9 Orderbook Component Context Prop

The Orderbook component accepts a `context` prop with exactly two allowed values:

| `context` value | Behavior |
|----------------|----------|
| `'detail'` | Price rows are NOT tappable. No form fill. No tap highlight. |
| `'order-placement'` | Price rows ARE tappable. Tap copies price to limit price input field. Haptic feedback on iOS. |

If `context` is absent or has an invalid value, default behavior is `'detail'` (no tap-to-fill). Log a warning.

---

## 3. API Contracts

### 3.1 GET /api/v1/virtual/orders

**Purpose:** Load paginated order history for the authenticated user's active sub-account.

**Authentication:** Required.

**Request Parameters:**

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `status_filter` | string | No | `ALL` | One of: `ALL`, `ACTIVE`, `FILLED`, `CANCELLED`, `EXPIRED` |
| `date_from` | date (YYYY-MM-DD ICT) | No | Today − 29 days | Must be ≤ `date_to`; not in the future |
| `date_to` | date (YYYY-MM-DD ICT) | No | Today | Must be ≥ `date_from`; not in the future |
| `symbol` | string | No | `""` | Max 10 chars; prefix match on `symbol_code` |
| `cursor` | string | No | `null` | Opaque cursor; null = first page |
| `limit` | integer | No | `20` | Fixed at 20; other values rejected with HTTP 400 |

**Success Response — HTTP 200:**

```json
{
  "orders": [
    {
      "id": "ord_01HX1111AAAA",
      "symbol_code": "VIC",
      "exchange": "HOSE",
      "order_type": "LO",
      "side": "BUY",
      "quantity": 100,
      "filled_quantity": 0,
      "price": 45000,
      "stop_price": null,
      "avg_fill_price": null,
      "status": "PENDING",
      "reject_reason": null,
      "cancel_reason": null,
      "placed_at": "2026-05-30T02:34:00Z",
      "matched_at": null,
      "cancelled_at": null,
      "expiry_at": "2026-06-30T09:59:00Z",
      "is_pre_reset": false
    }
  ],
  "next_cursor": "eyJwbGFjZWRfYXQiOiIyMDI2LTA1LTMwVDAyOjM0OjAwWiIsImlkIjoib3JkXzAxSFgxMTExQUFBQSJ9",
  "total_count": 25
}
```

**Error Responses:**

| HTTP Status | `error_code` | Condition | Message |
|-------------|-------------|-----------|---------|
| 400 | `E-OH-001` | Invalid `status_filter` value | `"Bộ lọc trạng thái không hợp lệ."` |
| 400 | `E-OH-002` | `date_from > date_to` or date in the future | `"Khoảng thời gian không hợp lệ."` |
| 400 | `E-OH-003` | Date range exceeds 89 days | `"Khoảng thời gian tối đa là 90 ngày."` |
| 400 | `E-OH-004` | `symbol` exceeds 10 chars or invalid `limit` | `"Tham số không hợp lệ."` |
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

---

### 3.2 GET /api/v1/virtual/orders/{order_id}

**Purpose:** Fetch full details for a single order including fill history. Used when expanding an order row not loaded via the list endpoint (e.g., deep-link entry).

**Authentication:** Required.

**Path Parameter:**

| Parameter | Type | Constraints |
|-----------|------|-------------|
| `order_id` | string | Valid order ID; must belong to the authenticated user |

**Success Response — HTTP 200:**

```json
{
  "id": "ord_01HX1111AAAA",
  "symbol_code": "VIC",
  "exchange": "HOSE",
  "order_type": "LO",
  "side": "BUY",
  "quantity": 200,
  "filled_quantity": 100,
  "price": 45000,
  "stop_price": null,
  "avg_fill_price": 44950,
  "status": "PARTIAL",
  "reject_reason": null,
  "cancel_reason": null,
  "placed_at": "2026-05-30T02:34:00Z",
  "matched_at": null,
  "cancelled_at": null,
  "expiry_at": "2026-06-30T09:59:00Z",
  "is_pre_reset": false,
  "fill_history": [
    {
      "id": "trd_01HX2222AAAA",
      "executed_at": "2026-05-30T03:10:00Z",
      "quantity": 100,
      "price": 44950,
      "fees": 50000,
      "tax": 0
    }
  ],
  "has_more_fills": false
}
```

**Error Responses:**

| HTTP Status | `error_code` | Condition | Message |
|-------------|-------------|-----------|---------|
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 403 | `E-OH-006` | Order belongs to a different user | `"Bạn không có quyền xem lệnh này."` |
| 404 | `E-OH-005` | Order ID not found | `"Lệnh không tồn tại."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

---

### 3.3 GET /api/v1/market/orderbook/{symbol_code}

**Purpose:** Load a REST snapshot of the Orderbook for a given VN symbol.

**Authentication:** Required.

**Path Parameter:**

| Parameter | Type | Constraints |
|-----------|------|-------------|
| `symbol_code` | string | Uppercase ticker code; must be a VN exchange symbol (HOSE/HNX/UPCOM) |

**Success Response — HTTP 200 (market open, continuous session):**

```json
{
  "symbol_code": "VIC",
  "exchange": "HOSE",
  "session": "CONT",
  "quote_time": "2026-05-30T07:20:00Z",
  "last_price": 45600,
  "ref_price": 44600,
  "ceiling_price": 47722,
  "floor_price": 41478,
  "pct_change": 2.24,
  "bids": [
    { "price": 45400, "volume": 12000, "price_status": "UP" },
    { "price": 45300, "volume": 8500, "price_status": "UP" },
    { "price": 45200, "volume": 4200, "price_status": "UP" }
  ],
  "asks": [
    { "price": 45700, "volume": 6300, "price_status": "UP" },
    { "price": 45800, "volume": 9100, "price_status": "UP" },
    { "price": 45900, "volume": 3800, "price_status": "UP" }
  ],
  "match_history": [
    { "time": "07:20:05", "price": 45600, "volume": 2000, "side": "BUY", "price_status": "UP" },
    { "time": "07:19:58", "price": 45550, "volume": 1500, "side": "SELL", "price_status": "UP" }
  ],
  "last_price_status": "UP"
}
```

**Success Response — HTTP 200 (symbol has no quote detail — no data yet):**

```json
{
  "symbol_code": "XYZ",
  "exchange": "HNX",
  "session": "CLOSED",
  "quote_time": null,
  "last_price": null,
  "ref_price": null,
  "ceiling_price": null,
  "floor_price": null,
  "pct_change": null,
  "bids": [],
  "asks": [],
  "match_history": [],
  "last_price_status": null
}
```

Client renders: "Không có dữ liệu sổ lệnh" in this case.

**Success Response — HTTP 200 (thin book — fewer than 3 levels):**

```json
{
  "bids": [
    { "price": 45400, "volume": 12000, "price_status": "UP" },
    { "price": 45300, "volume": 8500, "price_status": "UP" },
    null
  ],
  "asks": [
    { "price": 45700, "volume": 6300, "price_status": "UP" },
    null,
    null
  ]
}
```

`null` entries in the bids/asks arrays indicate missing levels. Client renders "—" for both price and volume in that row.

**Error Responses:**

| HTTP Status | `error_code` | Condition | Message |
|-------------|-------------|-----------|---------|
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 404 | `E-OB-001` | `symbol_code` not found in `symbols` table | `"Mã cổ phiếu không tồn tại."` |
| 404 | `E-OB-002` | Symbol is not a VN exchange listing (KR/Global) | `"Sổ lệnh chỉ khả dụng cho cổ phiếu Việt Nam."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

---

## 4. Error Handling Matrix

### 4.1 Order History Error Handling

| Scenario | HTTP Status | `error_code` | User-Facing Message | Client Action |
|----------|-------------|-------------|---------------------|---------------|
| No orders match filter | 200 | — | "Không tìm thấy lệnh nào." | Render empty filter state; filter bar remains visible |
| No orders at all | 200 | — | "Bạn chưa đặt lệnh nào." | Render no-orders empty state with "Khám phá cổ phiếu" CTA |
| Initial load fails (500 or timeout > 5s) | 500 | `E-SYS-001` | "Không thể tải lịch sử lệnh." | Full-page error state with "Thử lại" button |
| Pagination load fails | 500 | `E-SYS-001` | "Không thể tải thêm lệnh. Thử lại." | Inline error at bottom of list; existing list preserved |
| Date range > 90 days | 400 | `E-OH-003` | "Khoảng thời gian tối đa là 90 ngày." | Show error below date picker in the picker UI; "Áp dụng" button disabled |
| Order detail not found | 404 | `E-OH-005` | "Lệnh không tồn tại." | Toast + close expanded row |
| Auth failure | 401 | `E-AUTH-001` | (no toast) | Redirect to login screen |

### 4.2 Orderbook Error Handling

| Scenario | HTTP Status | `error_code` | User-Facing Message | Client Action |
|----------|-------------|-------------|---------------------|---------------|
| No data in `symbol_quote_detail` | 200 | — | "Không có dữ liệu sổ lệnh" | Render in closed/empty state; no error state |
| Symbol not found | 404 | `E-OB-001` | "Mã cổ phiếu không tồn tại." | Orderbook component shows inline error |
| KR/Global symbol | 404 | `E-OB-002` | "Sổ lệnh chỉ khả dụng cho cổ phiếu Việt Nam." | Orderbook component NOT rendered (section absent) |
| REST snapshot timeout (> 5s) | — | — | "Không thể tải dữ liệu sổ lệnh." | Inline error within Orderbook component with "Thử lại" button |
| WebSocket reconnecting | — | — | "Đang kết nối lại..." | Amber pill above orderbook; existing data visible |
| WebSocket fails after 10 reconnects | — | — | "Không thể tải dữ liệu sổ lệnh." | Error state within Orderbook component with "Thử lại" button |
| ATO/ATC session (no bid/ask) | — | — | "Khớp lệnh định kỳ" banner | Standard bid/ask layout hidden; periodic matching banner shown |
| Missing `symbol_quotes_latest` row | — | — | "Không thể tải dữ liệu sổ lệnh." | Orderbook error state; server logs data quality alert |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Endpoint | Target p95 | Maximum p99 |
|----------|-----------|-------------|
| GET /api/v1/virtual/orders (first page) | < 200ms | < 400ms |
| GET /api/v1/virtual/orders (paginated) | < 200ms | < 400ms |
| GET /api/v1/virtual/orders/{id} (with fill history) | < 200ms | < 400ms |
| GET /api/v1/market/orderbook/{symbol} | < 150ms | < 300ms |

### 5.2 Database Indexes Required

| Table | Index | Purpose |
|-------|-------|---------|
| `virtual_orders` | `(sub_account_id, placed_at DESC, id DESC)` | Primary order history query |
| `virtual_orders` | `(sub_account_id, status, placed_at DESC)` | Filtered order history |
| `virtual_orders` | `(sub_account_id, symbol_code, placed_at DESC)` | Symbol search |
| `virtual_trades` | `(order_id, executed_at ASC)` | Fill history per order |
| `symbol_quote_detail` | `(symbol_code)` | Orderbook lookup |

### 5.3 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|-------------|
| Order history page 1 (per user per filter set) | None | — | Order history is real-time; no caching |
| Orderbook REST snapshot (per symbol) | Redis | 5 seconds | On ETL write to `symbol_quote_detail`; overridden by WS push during market hours |

Order history is NOT cached server-side because order status can change at any time (fills, cancellations). Clients rely on pull-to-refresh and real-time push notifications for up-to-date state.

### 5.4 Security

- Order history is scoped strictly to the authenticated user's own sub-accounts. The server validates `sub_account_id` ownership on every request.
- Cross-user order access returns HTTP 403.
- The `user_cancel_note` field (free text, 200 char max) is stored verbatim; it is NOT returned in list responses, only in single-order detail responses. This field must be sanitized for XSS before rendering in the client.
- Orderbook data is read-only and publicly accessible for authenticated users; no ownership check beyond auth token validity.

### 5.5 Availability

- GET /api/v1/virtual/orders: 99.9% availability.
- GET /api/v1/market/orderbook: 99.9% availability during VN market hours; 99.5% outside market hours.
- Orderbook gracefully degrades to closed-market REST snapshot on WebSocket outage.

---

## 6. Related Documents

| Document | Path | Relationship |
|----------|------|-------------|
| FRD-18: Order History and Orderbook | `docs/business/frd/18-order-history-orderbook.md` | Parent FRD; functional requirements, acceptance criteria |
| FRD-10: Paper Trading Engine | `docs/business/frd/10-paper-trading.md` | Order state machine, order type definitions, `virtual_orders` schema |
| FRD-19: Order Management | `docs/business/frd/19-order-management.md` | Edit/Cancel flows that modify orders visible in Order History |
| FRD-04: Stock Detail | `docs/business/frd/04-stock-detail.md` | Orderbook embedded in Stock Detail screen |
| SRD-order-engine-v2.3.md | `docs/business/SRD-order-engine-v2.3.md` | `virtual_orders` and `virtual_trades` schema; fill processing rules |
| SRD-17: Market Board | `docs/business/srd/17-market-board.md` | Shared `price_status` computation rules |
| SRD-19: Order Management | `docs/business/srd/19-order-management.md` | Edit/Cancel API contracts for orders surfaced in this SRD |

### Pending Dependencies

| Dependency | Blocks | Status |
|------------|--------|--------|
| WebSocket specification (protocol, message schema, auth, channel naming) | §1.4 (Orderbook live updates) | [PENDING: WS spec] |

---

*Owner: Paave Product Team | Version: 1.0 — 2026-05-30*

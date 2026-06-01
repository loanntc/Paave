# SRD-20: Order Placement V2 — STOP and STOP_LIMIT Trigger Engine

**Version:** 1.0
**Date:** 2026-05-30
**Author:** Business Analysis Team
**Linked FRD:** FRD-20 (`frd/20-order-placement-v2.md`)
**Extends:** SRD `srd/order-engine-v2.3.md` (does not replace; additive)
**Status:** Authoritative for STOP and STOP_LIMIT order types

---

> **Scope of this document:**
> This SRD covers the system-level requirements for STOP and STOP_LIMIT order types only. It extends SRD-order-engine-v2.3.md, which remains authoritative for LO (Limit Order), MP (Market/Price Order), ATO, and ATC order types. A developer must read both documents to implement the full order engine. Sections in this document that conflict with SRD-order-engine-v2.3.md take precedence only for STOP and STOP_LIMIT order types.

---

## 1. System Flow

### 1.1 Order Placement Flow (Client to API)

1. Client sends `POST /api/virtual/orders` with `order_type = 'STOP_LIMIT'` or `order_type = 'STOP'`.
2. API gateway authenticates request (JWT); extracts `user_id`.
3. Input validation layer runs synchronous checks (see Section 3 — Validation Logic). Any failure returns HTTP 400 with the appropriate error code immediately; no DB write occurs.
4. Balance reservation is computed:
   - BUY STOP_LIMIT: `reserve_amount = quantity × stop_price × 1.001`
   - BUY STOP: `reserve_amount = quantity × ceiling_price × 1.001`
   - SELL (both types): holdings soft-lock on `quantity` shares of `symbol_code`
5. Idempotency check: look up `idempotency_key` in Redis (TTL = 5 minutes). If found, return HTTP 200 with the original order object; skip steps 6–9.
6. BEGIN TRANSACTION:
   a. INSERT `virtual_orders` row: `{ symbol_code, exchange, side, order_type, quantity, stop_price, price (STOP_LIMIT only), status = 'PENDING', parent_order_id = NULL, idempotency_key, created_at = now() }`
   b. INSERT `order_reserves` row with computed `reserve_amount` (BUY) or `order_holds` soft-lock row (SELL)
   c. UPDATE `virtual_portfolios.available_balance -= reserve_amount` (BUY only)
7. COMMIT
8. Store `idempotency_key` in Redis with TTL = 5 minutes.
9. Return HTTP 201 with order object (`status = 'PENDING'`, `order_id`, `reserve_amount`).

### 1.2 Price Evaluation Daemon (PED) — Trigger Loop

The PED is a separate worker process (implemented as a Supabase Edge Function or long-running background job). It subscribes to the real-time price feed tick stream.

**On every new price tick for a symbol:**

1. Query all eligible orders:
   ```sql
   SELECT *
   FROM virtual_orders
   WHERE order_type IN ('STOP_LIMIT', 'STOP')
     AND status = 'PENDING'
     AND symbol_code = :ticked_symbol
   FOR UPDATE SKIP LOCKED;
   ```
   `SKIP LOCKED` ensures only one PED worker processes a given order; concurrent workers skip already-locked rows to prevent duplicate triggers.

2. Persist `last_evaluated_tick_timestamp` per symbol to the `ped_symbol_state` table after each evaluation loop. On startup, PED reads this value and skips any ticks with `tick_timestamp <= last_evaluated_tick_timestamp` to prevent double-trigger on tick replay.

3. For each `STOP_LIMIT` order returned:
   - If `side = 'BUY'` and `last_price >= stop_price`: TRIGGER
   - If `side = 'SELL'` and `last_price <= stop_price`: TRIGGER
   - On TRIGGER:
     1. BEGIN TRANSACTION
     2. `UPDATE virtual_orders SET status = 'ACCEPTED', matched_at = now() WHERE id = :stop_order_id`
     3. `INSERT INTO virtual_orders` (child LO):
        ```
        {
          symbol_code:      <parent.symbol_code>,
          exchange:         <parent.exchange>,
          side:             <parent.side>,
          order_type:       'LO',
          price:            <parent.price>,   -- the limit_price field of the STOP_LIMIT
          quantity:         <parent.quantity - parent.filled_quantity>,
          status:           'PENDING',
          parent_order_id:  <parent.id>,
          created_at:       now()
        }
        ```
     4. COMMIT
     5. Emit `order_created` event for the child LO to the normal fill queue (same processing path as a directly submitted LO).

4. For each `STOP` order returned:
   - If `side = 'BUY'` and `last_price >= stop_price`: TRIGGER
   - If `side = 'SELL'` and `last_price <= stop_price`: TRIGGER
   - On TRIGGER:
     1. BEGIN TRANSACTION
     2. `UPDATE virtual_orders SET status = 'ACCEPTED', matched_at = now() WHERE id = :stop_order_id`
     3. `INSERT INTO virtual_orders` (child MP):
        ```
        {
          symbol_code:      <parent.symbol_code>,
          exchange:         <parent.exchange>,
          side:             <parent.side>,
          order_type:       'MP',
          price:            NULL,
          quantity:         <parent.quantity - parent.filled_quantity>,
          status:           'PENDING',
          parent_order_id:  <parent.id>,
          created_at:       now()
        }
        ```
     4. COMMIT
     5. Emit `order_created` event for the child MP to the normal fill queue.

5. After evaluating all orders for the tick, update `ped_symbol_state.last_evaluated_tick_timestamp` for the symbol.

### 1.3 Child Order Processing

Child LO and MP orders created by the PED are inserted into `virtual_orders` with `status = 'PENDING'` and a `parent_order_id` linking them to their parent STOP or STOP_LIMIT order. Once emitted to the fill queue, they are processed by SRD-order-engine-v2.3.md exactly as if they were directly submitted by the user. No special handling is required downstream.

### 1.4 Reserve Release After Child Fill (BUY STOP_LIMIT)

When the child LO of a BUY STOP_LIMIT order fills at a price below `stop_price`:
- Actual cost = `child.fill_price × child.fill_quantity × 1.001`
- Original reserve = `parent.quantity × parent.stop_price × 1.001`
- Excess reserve = `original_reserve − actual_cost`
- `virtual_portfolios.available_balance += excess_reserve` (credited atomically with the child fill)

This refund is performed by the standard fill handler in SRD-order-engine-v2.3.md using the `parent_order_id` to locate the original reserve record.

---

## 2. Data Model

### 2.1 `virtual_orders` Table — New and Extended Fields

The following fields are added to or clarified for the existing `virtual_orders` table:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `order_type` | `enum('LO','MP','ATO','ATC','STOP_LIMIT','STOP')` | NOT NULL | Extended enum; STOP_LIMIT and STOP are new values in V2 |
| `stop_price` | `BIGINT` | NULL | Stop trigger price in VND (integer; no decimals). Required for order_type IN ('STOP_LIMIT','STOP'). NULL for all other order types. Stored in VND units (no subunit). |
| `price` | `BIGINT` | NULL | For STOP_LIMIT: the limit price that the child LO will use. For LO: the limit price (existing usage). NULL for MP, ATO, ATC, STOP. |
| `parent_order_id` | `UUID` | NULL | Foreign key to `virtual_orders.id`. Set on child orders created by PED. NULL for all directly submitted orders. |
| `matched_at` | `TIMESTAMPTZ` | NULL | UTC timestamp when the PED triggered the order (STOP/STOP_LIMIT parent) or when a child order was filled. NULL while PENDING. |
| `status` | `enum(... , 'ACCEPTED')` | NOT NULL | Extended with 'ACCEPTED'. Meaning: parent STOP/STOP_LIMIT has been triggered by PED; child order has been created. Terminal state for the parent — no further transitions from ACCEPTED. |

### 2.2 `ped_symbol_state` Table — New

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `symbol_code` | `VARCHAR(10)` | NOT NULL PK | Stock ticker symbol |
| `last_evaluated_tick_timestamp` | `TIMESTAMPTZ` | NOT NULL | UTC timestamp of the last price tick fully evaluated by PED for this symbol |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL | Updated by PED after each evaluation loop |

### 2.3 `order_reserves` Table — Extended Reserve Types

| Reserve Type | Used For | Reserve Amount Formula |
|-------------|----------|----------------------|
| `BUY_STOP_LIMIT` | BUY STOP_LIMIT orders | `quantity × stop_price × 1.001` |
| `BUY_STOP` | BUY STOP orders | `quantity × ceiling_price × 1.001` where `ceiling_price` is fetched from `hose_reference_prices` at submission time |

### 2.4 `parent_order_id` Usage Invariants

- A parent STOP or STOP_LIMIT order always has `parent_order_id = NULL`.
- A child LO or MP order created by PED always has `parent_order_id` set to the triggering parent's `id`.
- Child orders do not create further children; `parent_order_id` is at most 1 level deep.
- The relationship is: 1 parent → exactly 1 child (created at trigger time). Partial fills are not supported in V1.

### 2.5 State Transition Extension for STOP / STOP_LIMIT

| From State | To State | Trigger | Notes |
|------------|----------|---------|-------|
| PENDING | ACCEPTED | PED trigger condition met; child order created | Terminal state for parent. No further transitions from ACCEPTED. |
| PENDING | CANCELLED | User manually cancels | `cancel_reason = 'USER_CANCEL'`; reserve released |
| PENDING | CANCELLED | Portfolio reset | `cancel_reason = 'PORTFOLIO_RESET'`; reserve released |
| PENDING | CANCELLED | Account deleted | `cancel_reason = 'ACCOUNT_DELETED'`; reserve released |
| PENDING | EXPIRED | 30-day GTC_30D TTL (expiry cron) | Reserve released; push sent |
| PENDING | SUSPENDED | Ticker halted by exchange | Same as LO behaviour in SRD-order-engine-v2.3.md |

STOP and STOP_LIMIT orders do NOT transition to FILLED directly. They transition to ACCEPTED (parent), then the child LO/MP transitions to FILLED via the normal fill handler.

---

## 3. Validation Logic

All validation runs synchronously on the API server before any DB write. Checks run in the order listed; the first failure returns immediately.

### 3.1 Validation Logic Table

| Field | Rule | Error Code | Exact Error Message |
|-------|------|------------|---------------------|
| `order_type` | Must be `'STOP_LIMIT'` or `'STOP'` when invoking this SRD path | — | (handled by existing order router; not a new error) |
| `symbol_code` | Must exist and be active in price feed for `exchange` | E-PT-104 | "This stock is currently suspended by the exchange and cannot be traded." |
| `symbol_code` | Must not be DELISTED | E-PT-105 | "This stock is no longer listed on [EXCHANGE] and cannot be traded." |
| `quantity` | Integer > 0 | E-PT-107 | "Order quantity must be in multiples of 100 shares on [EXCHANGE]. Nearest valid quantities: [floor_qty] or [ceil_qty] shares." |
| `quantity` (VN exchanges) | Must be a multiple of 100 | E-PT-107 | "Order quantity must be in multiples of 100 shares on [EXCHANGE]. Nearest valid quantities: [floor_qty] or [ceil_qty] shares." |
| `stop_price` | Required for STOP_LIMIT and STOP; must be present and non-null | E-PT-150 | "Vui lòng nhập giá dừng" |
| `price` | Required for STOP_LIMIT; must be present and non-null | E-PT-151 | "Vui lòng nhập giá giới hạn" |
| `stop_price` | Must be within `[floor_price, ceiling_price]` for the exchange on the current trading day | E-PT-154 | "Giá dừng vượt biên độ ngày hôm nay" |
| `price` (STOP_LIMIT) | Must be within `[floor_price, ceiling_price]` for the exchange on the current trading day | E-PT-154 | "Giá dừng vượt biên độ ngày hôm nay" |
| `stop_price` (BUY) | `stop_price > last_price` at submission time | E-PT-152 | "Giá dừng mua phải cao hơn giá hiện tại" |
| `stop_price` (SELL) | `stop_price < last_price` at submission time | E-PT-153 | "Giá dừng bán phải thấp hơn giá hiện tại" |
| `stop_price` vs `price` (STOP_LIMIT) | `stop_price ≠ price` | E-PT-155 | "Giá dừng và giá giới hạn không được trùng nhau" |
| `available_balance` (BUY STOP_LIMIT) | `available_balance >= quantity × stop_price × 1.001` | E-PT-108 | "Insufficient virtual funds. Available: [available] VND. Estimated cost: [cost] VND." |
| `available_balance` (BUY STOP) | `available_balance >= quantity × ceiling_price × 1.001` | E-PT-108 | "Insufficient virtual funds. Available: [available] VND. Estimated cost: [cost] VND." |
| `holdings` (SELL STOP_LIMIT / SELL STOP) | `holdings[symbol_code].unlocked_quantity >= quantity` | E-PT-109 | "Insufficient shares. You hold [available_qty] [TICKER]; requested: [requested_qty]." |
| `open_order_count` | Total PENDING + QUEUED_AFTER_HOURS orders (including this new one) < 10 (BR-PT-14) | E-PT-116 | "You have reached the maximum of 10 open orders. Cancel an existing order to place a new one." |
| `idempotency_key` | UUID v4; required | — | (handled by existing idempotency middleware; not a new error) |
| Exchange | STOP and STOP_LIMIT are only supported on HOSE, HNX, UPCOM in V1 | E-PT-122 | "Stop orders are not available for [EXCHANGE] in the current version." |
| Market status | VN market must be OPEN at submission time (not closed, not holiday) | E-PT-101 | "The VN market is currently closed. Market hours are 09:00–14:45 ICT (Monday–Friday, excluding VN public holidays)." |

### 3.2 Validation Rules Narrative

**`last_price`:** The most recent price tick for the symbol from the price feed at the moment the API request is processed. If the price feed is degraded and no price is available within the last 30 seconds, return HTTP 503 with message: "Price data unavailable. Please try again in a moment."

**`floor_price` and `ceiling_price`:** Fetched from `hose_reference_prices` (for HOSE), `hnx_reference_prices` (for HNX), or `upcom_reference_prices` (for UPCOM) at request time using the rules defined in FRD-10 FR-PT-07.1–07.3.

**Order type restriction per session window:** STOP and STOP_LIMIT orders follow the same session restriction as LO orders. They are rejected during Pre-Opening (E-PT-103), during ATC Period (E-PT-115), and after hours (E-PT-101). They are accepted during Continuous Session 1, Continuous Session 2, and Midday Break (queued for 13:00).

---

## 4. API Contract

### 4.1 `POST /api/virtual/orders` — Extended for STOP and STOP_LIMIT

This is the same endpoint as defined in SRD-order-engine-v2.3.md. The request body schema is extended.

**Request (STOP_LIMIT):**

```json
{
  "symbol_code": "VIC",
  "exchange": "HOSE",
  "side": "BUY",
  "order_type": "STOP_LIMIT",
  "quantity": 100,
  "stop_price": 52000,
  "price": 51500,
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Request (STOP):**

```json
{
  "symbol_code": "HPG",
  "exchange": "HOSE",
  "side": "SELL",
  "order_type": "STOP",
  "quantity": 200,
  "stop_price": 24000,
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Request Field Definitions:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `symbol_code` | `string` | Yes | Active ticker on the specified exchange; max 10 chars; case-insensitive |
| `exchange` | `enum` | Yes | `'HOSE'`, `'HNX'`, `'UPCOM'` (V1 only; STOP not supported for KR/Global) |
| `side` | `enum` | Yes | `'BUY'` or `'SELL'` |
| `order_type` | `enum` | Yes | `'STOP_LIMIT'` or `'STOP'` |
| `quantity` | `integer` | Yes | > 0; multiple of 100 for HOSE/HNX/UPCOM |
| `stop_price` | `integer` | Yes | VND; within `[floor_price, ceiling_price]`; BUY: `> last_price`; SELL: `< last_price` |
| `price` | `integer` | STOP_LIMIT only | VND; within `[floor_price, ceiling_price]`; `≠ stop_price` |
| `idempotency_key` | `string (UUID v4)` | Yes | Client-generated per tap; 5-minute Redis TTL for deduplication |

**Success Response — HTTP 201:**

```json
{
  "order_id": "ord_abc123",
  "status": "PENDING",
  "order_type": "STOP_LIMIT",
  "symbol_code": "VIC",
  "exchange": "HOSE",
  "side": "BUY",
  "quantity": 100,
  "stop_price": 52000,
  "price": 51500,
  "reserve_amount": 5205200,
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-05-30T07:15:00.000Z"
}
```

`reserve_amount` for the example: `100 × 52000 × 1.001 = 5,205,200 VND`.

**Duplicate (idempotency) Response — HTTP 200:**

Same shape as the HTTP 201 success response. The `order_id`, `status`, and all original fields are returned unchanged. No new record is created.

**Validation Error Response — HTTP 400:**

```json
{
  "code": "E-PT-152",
  "message": "Giá dừng mua phải cao hơn giá hiện tại"
}
```

**Service Unavailable (price feed degraded) — HTTP 503:**

```json
{
  "code": "E-SYS-001",
  "message": "Price data unavailable. Please try again in a moment."
}
```

**Unauthorized — HTTP 401:**

```json
{
  "code": "E-AUTH-001",
  "message": "Authentication required."
}
```

### 4.2 PED Internal Events

The PED does not expose an HTTP API. It communicates via the internal event bus.

**Event: `order_created` (emitted by PED after child order insert):**

```json
{
  "event": "order_created",
  "order_id": "ord_child_xyz",
  "order_type": "LO",
  "parent_order_id": "ord_parent_abc",
  "symbol_code": "VIC",
  "exchange": "HOSE",
  "side": "BUY",
  "quantity": 100,
  "price": 51500,
  "created_at": "2026-05-30T08:32:15.000Z"
}
```

The fill queue processes this event identically to a directly submitted order. The `parent_order_id` field is passed through for reserve refund calculation at fill time.

---

## 5. Error Handling Matrix

### 5.1 New Error Codes (E-PT-1xx Range Extension)

| Code | HTTP Status | Trigger Condition | Exact User-Facing Message |
|------|-------------|-------------------|--------------------------|
| E-PT-150 | 400 | `stop_price` field missing or null for STOP_LIMIT or STOP | "Vui lòng nhập giá dừng" |
| E-PT-151 | 400 | `price` field missing or null for STOP_LIMIT | "Vui lòng nhập giá giới hạn" |
| E-PT-152 | 400 | BUY STOP_LIMIT or BUY STOP: `stop_price <= last_price` at submission | "Giá dừng mua phải cao hơn giá hiện tại" |
| E-PT-153 | 400 | SELL STOP_LIMIT or SELL STOP: `stop_price >= last_price` at submission | "Giá dừng bán phải thấp hơn giá hiện tại" |
| E-PT-154 | 400 | `stop_price` or `price` (STOP_LIMIT) outside `[floor_price, ceiling_price]` for the exchange today | "Giá dừng vượt biên độ ngày hôm nay" |
| E-PT-155 | 400 | STOP_LIMIT: `stop_price == price` | "Giá dừng và giá giới hạn không được trùng nhau" |
| E-PT-122 | 400 | STOP or STOP_LIMIT submitted for a non-VN exchange (KR/Global) | "Stop orders are not available for [EXCHANGE] in the current version." |

### 5.2 Inherited Error Codes (from SRD-order-engine-v2.3.md, also apply to STOP/STOP_LIMIT)

| Code | Applies To | Notes |
|------|-----------|-------|
| E-PT-101 | Market closed at submission | Same message and behaviour as for LO |
| E-PT-103 | Order submitted during Pre-Opening | Same rejection; STOP/STOP_LIMIT not accepted before 09:15 ICT |
| E-PT-104 | Ticker suspended | Same |
| E-PT-105 | Ticker delisted | Same |
| E-PT-107 | Lot size violation | Same |
| E-PT-108 | Insufficient balance (BUY) | Applied against computed `reserve_amount` |
| E-PT-109 | Insufficient holdings (SELL) | Applied against `unlocked_quantity` |
| E-PT-115 | Submitted during ATC Period | Same rejection; STOP/STOP_LIMIT not accepted 14:30–14:45 |
| E-PT-116 | Max 10 open orders | Same |

### 5.3 PED Internal Error Handling

| Failure Scenario | PED Behaviour |
|-----------------|---------------|
| DB lock not acquired (`SKIP LOCKED` returns 0 rows for a specific order) | Skip that order in this tick; it will be evaluated on the next tick. No error logged unless this persists for > 30 seconds (then: WARN log). |
| Transaction fails on TRIGGER (child insert rollback) | Parent order remains PENDING; trigger is not applied. PED retries on the next price tick. Error logged at ERROR level with `order_id` and tick details. |
| Price feed subscription drops | PED logs ERROR and reconnects with exponential backoff (base 1s, max 30s, 10 retries). If reconnect fails after 10 attempts, PED raises an alert to the operations team and enters a degraded state (no evaluation until feed restored). |
| `ped_symbol_state` write fails | Log WARN; evaluation still proceeds; the state will be written on the next successful tick. Risk: on restart, PED may re-evaluate the most recent tick once (acceptable; `SKIP LOCKED` prevents double-trigger per tick per session). |

---

## 6. Non-Functional Requirements

| Requirement | Specification | Measurement Method |
|-------------|--------------|-------------------|
| PED trigger latency (p95) | From price tick receipt to child order INSERT committed in DB: < 5 seconds | APM trace from tick ingestion timestamp to `virtual_orders.created_at` of the child order |
| PED trigger latency (p99) | < 15 seconds | Same measurement |
| Duplicate trigger prevention | `SELECT FOR UPDATE SKIP LOCKED` must guarantee that each STOP/STOP_LIMIT order is triggered at most once per eligible tick per PED worker | Integration test: two PED workers competing on the same order in the same tick; only one must succeed |
| Tick replay safety | PED must not trigger the same order twice on tick replay (e.g., after restart). Enforced by `ped_symbol_state.last_evaluated_tick_timestamp` comparison at startup. | Integration test: simulate PED restart mid-session; verify no order is triggered twice |
| Concurrent order creation safety | Reserve amount written and `available_balance` decremented atomically within a single DB transaction per order submission. Concurrent submissions for the same user must not result in `available_balance < 0`. | Load test: 20 concurrent BUY STOP submissions for the same user; `available_balance` must never go negative |
| PED worker availability | PED must be running at all times during HOSE/HNX/UPCOM market hours (09:00–14:45 ICT Mon–Fri). Crash recovery: process manager (e.g., Supabase Edge Function retry or `pm2`) must restart PED within 10 seconds of crash. | Monitoring alert: PED heartbeat absence > 10 seconds during market hours |
| Price feed degradation handling | If price feed is unavailable, PED pauses evaluation (does not trigger orders on stale prices). API returns HTTP 503 for new STOP/STOP_LIMIT submissions when last tick is older than 30 seconds. | Integration test: simulate feed outage; confirm no orders trigger; confirm API returns E-SYS-001 |

---

## 7. Related Documents

| Document | Location | Relationship |
|----------|----------|-------------|
| FRD-20: Order Placement V2 | `docs/business/frd/20-order-placement-v2.md` | Functional requirements that this SRD implements |
| SRD: Order Engine V2.3 | `docs/business/srd/order-engine-v2.3.md` | Extended by this document; authoritative for LO/MP/ATO/ATC |
| FRD-10: Paper Trading Engine | `docs/business/frd/10-paper-trading.md` | Core invariants and order state machine (FR-PT-07, FR-PT-08) |
| SRD-18: Order History & Orderbook | `docs/business/srd/18-order-history-orderbook.md` | Displays parent and child STOP order records; parent shows as ACCEPTED; child shows as PENDING/FILLED |
| SRD-19: Order Management | `docs/business/srd/19-order-management.md` | Cancel flow for STOP/STOP_LIMIT parent orders while PENDING |
| BRD.md | `docs/business/frd/BRD.md` | Business objectives this feature serves |

---

*End of SRD-20: Order Placement V2 — STOP and STOP_LIMIT Trigger Engine*
*Version 1.0 — 2026-05-30. Extends SRD-order-engine-v2.3.md. Does not replace it.*

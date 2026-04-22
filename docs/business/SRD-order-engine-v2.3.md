# SRD — Order Engine (v2.3 Revision)
## Paave — Paper Trading Engine: System Requirements

**Document version:** 2.3
**Date:** 2026-04-20
**Author:** Business Analysis Team
**Status:** Pending Product Owner Review
**Supersedes:** SRD v2.0 §2.11 (Paper Trading Order Execution), §4.9 (Paper Trading Order Validation), §5.10 (Paper Trading Endpoints)
**Linked FRD:** FRD-module-B-v2.3.md
**Linked BRD:** BRD.md v2.2

> **Scope of this document:**
> This SRD section replaces §2.11, §4.9, and §5.10 of the existing SRD v2.0. All other SRD sections (§1–§2.10, §2.12–§2.23, §3, §5.1–§5.9, §6, §7, §8, §9) remain from SRD v2.0.

---

## 1. Order Engine Architecture

### 1.1 Components

| Component | Responsibility |
|-----------|---------------|
| **Paper Trading Engine (PTE)** | Receives order submissions, validates, stores, and manages state transitions |
| **Market Calendar Service** | Exposes current session state (OPEN / PRE_OPEN / ATC / LUNCH / CLOSED / HOLIDAY) per exchange |
| **Price Feed Cache (Redis)** | Source of truth for current prices and daily reference prices (for price band calculation) |
| **Order Evaluation Daemon** | Subscribes to price tick events; evaluates all PENDING limit orders for fill eligibility |
| **Expiry Cron** | Runs at 23:59 UTC daily; transitions orders past their expiry date to EXPIRED |
| **Idempotency Store (Redis)** | Keyed by `idempotency_key`; TTL = 5 minutes; prevents duplicate order creation |
| **Reserve Ledger** | In-memory ledger (backed by PostgreSQL) tracking reserved balance per user per open BUY limit order |

---

## 2. System Flow: Paper Trading Order Submission (v2.3)

### 2.1 Market Order Submission Flow

```
1. Mobile app: User taps "Confirm Order" on paper trading screen
   - Client generates idempotency_key (UUID v4) and embeds in request
2. POST /api/v1/paper-trading/orders
3. PTE: Step A — Idempotency check
   a. Lookup idempotency_key in Redis (key: idem:{user_id}:{idempotency_key})
      - EXISTS → return cached response (HTTP 201 with original order_id); halt processing
      - NOT EXISTS → proceed; store {idempotency_key → order_id} with TTL=5min AFTER order created

4. PTE: Step B — Market Session Validation
   a. Call Market Calendar Service: GET /internal/market/session?exchange={exchange}
   b. If status = CLOSED (and exchange is VN):
      → Return HTTP 422, error_code = E-PT-101
   b. If status = PRE_OPEN (HOSE/HNX, 09:00–09:15) AND order_type = MARKET:
      → Return HTTP 422, error_code = E-PT-103
   c. If status = ATC (HOSE/HNX, 14:30–14:45) AND order_type = MARKET:
      → Return HTTP 422, error_code = E-PT-115
   d. If status = LUNCH AND exchange is VN:
      → Accept order; set internal flag queued_for_session_open = true
      → Order will be evaluated at 13:00 ICT session open
   e. If exchange is KR or GLOBAL:
      → Accept order regardless of session; set status = QUEUED_AFTER_HOURS if outside simulated hours

5. PTE: Step C — Ticker Validation
   a. Lookup ticker in price_feed_cache (Redis key: market:{exchange}:prices:{ticker})
      - NOT FOUND → Return HTTP 422, error_code = E-PT-120 "Ticker not found in active price feed"
   b. Check ticker status field in price data:
      - status = SUSPENDED → Return HTTP 422, error_code = E-PT-104
      - status = DELISTED → Return HTTP 422, error_code = E-PT-105
      - status = ACTIVE → proceed

6. PTE: Step D — Lot Size Validation (VN markets only)
   a. IF exchange IN (HOSE, HNX, UPCOM):
      - IF quantity MOD 100 ≠ 0 → Return HTTP 422, error_code = E-PT-107
   b. IF exchange IN (KOSPI, KOSDAQ, GLOBAL): no lot constraint; quantity > 0 sufficient

7. PTE: Step E — Balance / Holdings Validation (at submission)
   a. For BUY:
      - Fetch user's available_balance from virtual_balances (total_balance − open_buy_limit_reserves)
      - estimated_cost = quantity × current_price × 1.001
      - IF available_balance < estimated_cost → Return HTTP 422, error_code = E-PT-108
   b. For SELL:
      - Fetch user's current holding quantity for ticker (net of open SELL limit soft-locks)
      - IF holding_available < quantity → Return HTTP 422, error_code = E-PT-109
      - IF holding_available = 0 (short-sell attempt) → Return HTTP 422, error_code = E-PT-110

8. PTE: Step F — Open Order Limit Check
   a. Count user's PENDING orders across all markets
      - IF count ≥ 10 → Return HTTP 422, error_code = E-PT-116

9. PTE: Step G — Persist Order
   a. BEGIN DB TRANSACTION
   b. INSERT INTO virtual_orders: {user_id, ticker, exchange, order_type=MARKET, side, quantity, status=PENDING, idempotency_key, created_at}
   c. COMMIT
   d. Store idempotency_key → order_id in Redis (TTL=5min)
   e. Publish order_created event to fill queue

10. Return HTTP 201 with order record (status=PENDING)

11. ASYNC: Fill Daemon processes MARKET orders:
    a. Wait for next price snapshot (Redis event or poll; ≤15s for VN, best-effort for KR/Global)
    b. IF snapshot arrives:
       i.  fill_price = snapshot.price
       ii. IF exchange is VN: validate fill_price ≤ ceiling_price AND ≥ floor_price
           - If fill_price > ceiling: fill at ceiling_price (stock cannot trade above ceiling)
           - If fill_price < floor: fill at floor_price (stock cannot trade below floor)
       iii. Re-check balance (BUY) or holdings (SELL) at fill time:
            - BUY: available_balance < quantity × fill_price × 1.001 → transition to FILL_FAILED (E-PT-106); release reserved funds; notify user
            - SELL: holding < quantity → transition to FILL_FAILED (E-PT-109); notify user
       iv. BEGIN DB TRANSACTION
           - UPDATE virtual_orders SET status=FILLED, fill_price, fill_timestamp
           - UPDATE virtual_portfolio (quantity, avg_buy_price for BUY; quantity, realized_pnl for SELL)
           - UPDATE virtual_balances (debit for BUY; credit for SELL)
           - INSERT into xp_events (TRADE_PLACED, 10 XP)
           COMMIT
       v.  Fire post-trade AI job (async, non-blocking)
       vi. Send push notification: "Your [SIDE] order for [TICKER] filled at [price]"
    c. IF snapshot NOT available within 15s (VN feed issue):
       - Retry at 15s, 30s, 45s intervals (3 retries over 60s total)
       - After 3 failures: transition to FILL_FAILED; notify user (E-PT-111)
    d. IF ticker is halted between submission and fill:
       - Transition to SUSPENDED; notify user (E-PT-210 push message pattern)
       - Evaluation resumes when halt lifts
```

---

### 2.2 Limit Order Submission Flow

```
1–8. Steps A–G identical to Market Order flow, with the following additional steps:

9. PTE: Step H — Limit Price Validation (limit orders only)
   a. IF exchange IN (HOSE, HNX, UPCOM):
      i.  Fetch reference_price from price_feed_cache (reference_price = prev_close from daily reset)
      ii. Fetch daily_ceiling = reference_price × ceiling_multiplier (HOSE: 1.07, HNX: 1.10, UPCOM: 1.15)
          Fetch daily_floor = reference_price × floor_multiplier (HOSE: 0.93, HNX: 0.90, UPCOM: 0.85)
      iii. IF side = BUY:
           - IF limit_price > current_price → Return HTTP 422, error_code = E-PT-201
           - IF limit_price > daily_ceiling → Return HTTP 422, error_code = E-PT-203
           - IF limit_price < daily_floor → Return HTTP 422, error_code = E-PT-204
      iv. IF side = SELL:
           - IF limit_price < current_price → Return HTTP 422, error_code = E-PT-202
           - IF limit_price > daily_ceiling → Return HTTP 422, error_code = E-PT-203
           - IF limit_price < daily_floor → Return HTTP 422, error_code = E-PT-204
      v.  Validate tick size:
           - Determine tick_size from price level (see FR-PT-07.1 table)
           - IF limit_price MOD tick_size ≠ 0 → Return HTTP 422, error_code = E-PT-205
   b. IF exchange IN (KOSPI, KOSDAQ, GLOBAL):
      - No price band or tick-size validation (reference market)
      - Attach label: estimated_fill = true on the order record

10. PTE: Step I — Reserve Management (BUY limit only)
    a. reserve_amount = quantity × limit_price × 1.001
    b. Fetch user's total_open_buy_limit_reserves from reserve_ledger
    c. IF available_balance < reserve_amount → Return HTTP 422, error_code = E-PT-206
    d. BEGIN DB TRANSACTION
       INSERT INTO virtual_orders (as above, plus limit_price, expiry_at = now() + 30 days, status=PENDING)
       INSERT INTO order_reserves (order_id, user_id, reserve_amount, created_at)
       UPDATE virtual_balances SET reserved_amount = reserved_amount + reserve_amount
       COMMIT
    e. Store idempotency_key in Redis

11. PTE: Step J — Soft-Lock Holdings (SELL limit only)
    a. Record in holdings_soft_lock table: {user_id, ticker, quantity, order_id}
    b. Subsequent sell orders on same ticker check soft-locked quantity and deduct from available_to_sell

12. Return HTTP 201 with order record (status=PENDING, expiry_at)
```

---

### 2.3 Limit Order Evaluation Daemon

```
CONTINUOUS PROCESS — runs per price tick event from Market Data Service:

For each price tick event {ticker, exchange, price, timestamp}:
1. Query DB for all PENDING limit orders where ticker = tick.ticker AND exchange = tick.exchange:
   SELECT * FROM virtual_orders
   WHERE ticker = tick.ticker AND exchange = tick.exchange AND status = 'PENDING'

2. For each matching order:
   a. BUY limit: IF tick.price <= order.limit_price → trigger fill
   b. SELL limit: IF tick.price >= order.limit_price → trigger fill
   c. Fill process:
      i.  BEGIN DB TRANSACTION (with row-level lock: SELECT ... FOR UPDATE on order row)
      ii. Re-check order status = PENDING (prevent concurrent fills)
          IF status ≠ PENDING: rollback; skip (already filled by concurrent tick)
      iii. Verify BUY balance at fill time:
           actual_cost = quantity × tick.price × 1.001
           IF actual_cost > (virtual_balance − other_reserves):
             Leave order PENDING (re-evaluate at next tick — see FC-LIM-16)
             Rollback; continue
      iv. UPDATE virtual_orders SET status=FILLED, fill_price=tick.price, fill_timestamp=now()
          UPDATE virtual_portfolio (add holdings for BUY; reduce + calculate realized PnL for SELL)
          UPDATE virtual_balances (debit actual_cost for BUY; credit proceeds for SELL)
          DELETE FROM order_reserves WHERE order_id = order.id  -- release reserve
          DELETE FROM holdings_soft_lock WHERE order_id = order.id  -- release soft lock (SELL)
          INSERT INTO xp_events (TRADE_PLACED, 10 XP)
          COMMIT
      v.  Fire post-trade AI job (async)
      vi. Send push notification: "Your [SIDE] limit order for [TICKER] filled at [price]"

3. Note: RC safety — row-level lock (SELECT FOR UPDATE) ensures two concurrent tick events
   cannot double-fill the same order. One will acquire the lock and fill; the other will see
   status = FILLED and skip.
```

---

### 2.4 Limit Order Expiry Flow

```
CRON: runs at 23:59 UTC daily

1. SELECT * FROM virtual_orders
   WHERE status = 'PENDING' AND expiry_at < now()

2. For each expired order (in batches of 500):
   BEGIN DB TRANSACTION
   UPDATE virtual_orders SET status='EXPIRED', expired_at=now()
   DELETE FROM order_reserves WHERE order_id = order.id  -- release reserve
   DELETE FROM holdings_soft_lock WHERE order_id = order.id  -- release soft lock
   UPDATE virtual_balances SET reserved_amount = reserved_amount - reserve_amount
   COMMIT

3. Send push notification: "Your [SIDE] limit order for [TICKER] expired without filling."
4. Log expiry events for analytics
```

---

### 2.5 Market Session State Management

```
Market Calendar Service — exposes per-exchange session state:

GET /internal/market/session?exchange=HOSE

Response:
{
  "exchange": "HOSE",
  "session_status": "OPEN" | "PRE_OPEN" | "ATC" | "LUNCH" | "CLOSED" | "HOLIDAY",
  "current_time_ict": "2026-04-20T10:30:00+07:00",
  "next_state_change": "2026-04-20T11:30:00+07:00",
  "next_state": "LUNCH",
  "is_holiday": false,
  "holiday_name": null
}

State transition schedule (VN, ICT UTC+7):
  00:00–09:00 → CLOSED
  09:00–09:15 → PRE_OPEN (ATO accepted only)
  09:15–11:30 → OPEN (MARKET + LO accepted)
  11:30–13:00 → LUNCH (MARKET + LO accepted but queued)
  13:00–14:30 → OPEN (MARKET + LO accepted)
  14:30–14:45 → ATC (ATC accepted; new MARKET/LO rejected)
  14:45–00:00 → CLOSED

Holiday calendar table: `vn_market_calendar`
  Fields: date DATE, exchange VARCHAR, is_holiday BOOLEAN, holiday_name VARCHAR
  Updated: manually by operations team before each quarter; fallback to "CLOSED" if date missing
```

---

## 3. Validation Rules: Paper Trading Orders (v2.3)

### 3.1 Order Submission Validation

| Field | Rule | Error Code | Error Message |
|-------|------|------------|---------------|
| `idempotency_key` | UUID v4 format; required | E-PT-119 | "Invalid idempotency key format" |
| `ticker` | Required; exists in active price feed for specified exchange | E-PT-120 | "Ticker not found in active price feed" |
| `ticker` (status check) | Ticker status must be ACTIVE | E-PT-104 (SUSPENDED) / E-PT-105 (DELISTED) | "This stock is currently suspended" / "This stock is no longer listed" |
| `exchange` | Required; one of: `HOSE`, `HNX`, `UPCOM`, `KOSPI`, `KOSDAQ`, `GLOBAL` | E-PT-121 | "Please select a valid exchange" |
| `exchange` + `ticker` | Ticker must belong to the specified exchange | E-PT-122 | "This ticker is listed on [correct_exchange], not [submitted_exchange]" |
| `order_type` | Required; one of: `MARKET`, `LIMIT`, `ATO`, `ATC` | E-PT-123 | "Please select a valid order type" |
| `order_type` = `ATO` + `session` | ATO only accepted during PRE_OPEN session (09:00–09:15 ICT) | E-PT-124 | "ATO orders can only be placed during the pre-opening session (9:00–9:15)" |
| `order_type` = `ATC` + `session` | ATC only accepted during ATC session (14:30–14:45 ICT) | E-PT-125 | "ATC orders can only be placed during the closing session (14:30–14:45)" |
| `order_type` = `MARKET` + `session` = PRE_OPEN | Reject | E-PT-103 | "Market orders are not accepted during the pre-opening session (9:00–9:15). Use an ATO order instead." |
| `order_type` = `MARKET` + `session` = ATC | Reject | E-PT-115 | "Market orders are not accepted during the ATC session (14:30–14:45). Use an ATC order instead." |
| `order_type` = `MARKET` + `session` = CLOSED (VN only) | Reject | E-PT-101 | "The VN market is currently closed. Market hours are 9:00–14:45 ICT (Mon–Fri)." |
| `order_type` = `ATO` + `limit_price` present | Reject | E-PT-117 | "ATO orders do not accept a price. The system determines the opening price." |
| `order_type` = `ATC` + `limit_price` present | Reject | E-PT-118 | "ATC orders do not accept a price. The system determines the closing price." |
| `side` | Required; one of: `BUY`, `SELL` | E-PT-126 | "Please select BUY or SELL" |
| `quantity` | Required; integer > 0; ≤ 999,999 | E-PT-127 | "Quantity must be a positive whole number (max 999,999)" |
| `quantity` (VN lot size) | For HOSE/HNX/UPCOM: quantity must be a multiple of 100 | E-PT-107 | "Quantity must be in multiples of 100 shares for [exchange] trading. Nearest valid: [floor] or [ceil]" |
| Open order limit | User has ≤ 9 currently PENDING orders | E-PT-116 | "You have reached the maximum of 10 open orders. Cancel an existing order to place a new one." |

### 3.2 Limit-Order-Specific Validation

| Field | Rule | Error Code | Error Message |
|-------|------|------------|---------------|
| `limit_price` | Required for LIMIT orders; > 0; decimal | E-PT-200 | "Please enter a valid limit price" |
| `limit_price` (BUY > current_price) | BUY limit must be ≤ current_price | E-PT-201 | "Your buy limit price ([X]) is above the current price ([Y]). Use a Market order for immediate fill, or set a lower price." |
| `limit_price` (SELL < current_price) | SELL limit must be ≥ current_price | E-PT-202 | "Your sell limit price ([X]) is below the current price ([Y]). Use a Market order for immediate fill, or set a higher price." |
| `limit_price` (above HOSE ceiling) | limit_price ≤ daily_ceiling | E-PT-203 | "Price exceeds today's ceiling of [ceiling VND] for [TICKER] on [exchange]." |
| `limit_price` (below floor) | limit_price ≥ daily_floor | E-PT-204 | "Price is below today's floor of [floor VND] for [TICKER] on [exchange]." |
| `limit_price` (tick size) | Aligns with exchange tick size | E-PT-205 | "Price must be in increments of [tick_size] VND. Did you mean [rounded_price]?" |
| BUY limit reserve (balance) | available_balance ≥ quantity × limit_price × 1.001 | E-PT-206 | "Insufficient available balance. Available: [avail VND]. Required reserve: [reserve VND]. Note: [X VND] already reserved for other orders." |
| SELL limit (soft-lock conflict) | No existing open SELL limit on same shares | E-PT-207 | "You already have an open sell order for [TICKER]. Cancel it before placing another." |

### 3.3 Balance and Holdings Validation (at submission)

| Check | Rule | Error Code | Error Message |
|-------|------|------------|---------------|
| BUY balance check (market) | available_balance ≥ quantity × current_price × 1.001 | E-PT-108 (E-6001) | "Insufficient virtual funds. Available: [balance VND]. Estimated cost: [cost VND]." |
| SELL holdings check (market) | holding_available ≥ quantity | E-PT-109 (E-6002) | "Insufficient virtual shares. You hold [avail] [TICKER]; sell requested: [qty]." |
| Short sell prevention | holding_available > 0 for SELL | E-PT-110 | "You don't own any [TICKER] shares to sell. Short selling is not available in paper trading." |

### 3.4 Fill-Time Re-validation (MARKET orders only)

| Check | Rule | Outcome |
|-------|------|---------|
| Balance at fill | available_balance ≥ quantity × fill_price × 1.001 | Fail → FILL_FAILED (E-PT-106); notify user |
| Holdings at fill (SELL) | holding_available ≥ quantity at fill time | Fail → FILL_FAILED; notify user |
| Ticker status at fill | ticker.status = ACTIVE | If SUSPENDED: → SUSPENDED state; await lift. If DELISTED: → CANCELLED (E-PT-113) |
| Feed availability | Price snapshot received within 60s (3 × 15s retries) | After 3 failures → FILL_FAILED (E-PT-111); notify user |

---

## 4. API Contracts: Paper Trading Orders (v2.3)

### 4.1 POST /api/v1/paper-trading/orders

**Request:**
```json
{
  "ticker": "VIC",
  "exchange": "HOSE",
  "order_type": "MARKET",
  "side": "BUY",
  "quantity": 100,
  "limit_price": null,
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Request (Limit Order):**
```json
{
  "ticker": "VIC",
  "exchange": "HOSE",
  "order_type": "LIMIT",
  "side": "BUY",
  "quantity": 100,
  "limit_price": 45000.00,
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Request (ATO Order):**
```json
{
  "ticker": "VIC",
  "exchange": "HOSE",
  "order_type": "ATO",
  "side": "BUY",
  "quantity": 100,
  "limit_price": null,
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response 201 Created (Market Order):**
```json
{
  "order_id": "ord_01HX1111AAAA",
  "ticker": "VIC",
  "exchange": "HOSE",
  "order_type": "MARKET",
  "side": "BUY",
  "quantity": 100,
  "limit_price": null,
  "status": "PENDING",
  "estimated_fill": false,
  "reserve_amount": null,
  "expiry_at": null,
  "created_at": "2026-04-20T02:30:00Z",
  "session_info": {
    "session_status": "OPEN",
    "exchange_time": "2026-04-20T09:30:00+07:00"
  }
}
```

**Response 201 Created (Limit Order):**
```json
{
  "order_id": "ord_01HX1111BBBB",
  "ticker": "VIC",
  "exchange": "HOSE",
  "order_type": "LIMIT",
  "side": "BUY",
  "quantity": 100,
  "limit_price": 45000.00,
  "status": "PENDING",
  "estimated_fill": false,
  "reserve_amount": 4504500.00,
  "expiry_at": "2026-05-20T16:59:00Z",
  "created_at": "2026-04-20T02:30:00Z",
  "available_balance_after_reserve": 495495500.00
}
```

**Response 201 Created (KR Reference Order — estimated fill):**
```json
{
  "order_id": "ord_01HX1111CCCC",
  "ticker": "005930",
  "exchange": "KOSPI",
  "order_type": "MARKET",
  "side": "BUY",
  "quantity": 10,
  "limit_price": null,
  "status": "QUEUED_AFTER_HOURS",
  "estimated_fill": true,
  "reference_data_notice": "KR market data is reference-only and may be delayed. Fill price will be an estimate.",
  "expiry_at": null,
  "created_at": "2026-04-20T02:30:00Z"
}
```

---

**Error Responses (Comprehensive):**

**E-PT-101 — Market closed (VN):**
```json
{
  "error_code": "E-PT-101",
  "message": "The VN market is currently closed. Market hours are 9:00–14:45 ICT (Mon–Fri).",
  "market_status": "CLOSED",
  "next_open": "2026-04-21T02:00:00Z",
  "suggestion": "Place a limit order to execute when the market opens."
}
```

**E-PT-103 — Market order during pre-opening:**
```json
{
  "error_code": "E-PT-103",
  "message": "Market orders are not accepted during the pre-opening session (9:00–9:15 ICT). Use an ATO order to participate in the opening match.",
  "session": "PRE_OPEN",
  "suggestion_order_type": "ATO"
}
```

**E-PT-104 — Ticker suspended:**
```json
{
  "error_code": "E-PT-104",
  "message": "This stock is currently suspended by the exchange. Orders cannot be placed while trading is suspended.",
  "ticker": "VIC",
  "exchange": "HOSE"
}
```

**E-PT-105 — Ticker delisted:**
```json
{
  "error_code": "E-PT-105",
  "message": "This stock is no longer listed on the exchange.",
  "ticker": "VIC",
  "exchange": "HOSE"
}
```

**E-PT-106 — Fill failed: balance insufficient at fill time:**
```json
{
  "error_code": "E-PT-106",
  "message": "Your order could not fill — the price moved between submission and fill, leaving insufficient balance.",
  "order_id": "ord_01HX1111AAAA",
  "fill_price_attempted": 56500.00,
  "required_at_fill": 5665650.00,
  "available_at_fill": 5000000.00
}
```

**E-PT-107 — Lot size violation:**
```json
{
  "error_code": "E-PT-107",
  "message": "Quantity must be in multiples of 100 shares for HOSE trading.",
  "quantity_submitted": 150,
  "nearest_valid_lower": 100,
  "nearest_valid_upper": 200
}
```

**E-PT-108 — Insufficient virtual balance:**
```json
{
  "error_code": "E-PT-108",
  "message": "Insufficient virtual funds.",
  "required": 5500000.00,
  "available": 3000000.00,
  "reserved_for_open_orders": 2500000.00
}
```

**E-PT-109 — Insufficient holdings:**
```json
{
  "error_code": "E-PT-109",
  "message": "Insufficient virtual shares to sell.",
  "ticker": "VIC",
  "requested": 100,
  "available": 50,
  "soft_locked_by_open_orders": 50
}
```

**E-PT-110 — Short sell prevention:**
```json
{
  "error_code": "E-PT-110",
  "message": "You don't own any VIC shares to sell. Short selling is not available in paper trading.",
  "ticker": "VIC"
}
```

**E-PT-111 — Feed unavailable after retries:**
```json
{
  "error_code": "E-PT-111",
  "message": "Your order could not fill — live price data was unavailable for more than 60 seconds. Order cancelled.",
  "order_id": "ord_01HX1111AAAA",
  "retries_attempted": 3
}
```

**E-PT-115 — Market order during ATC:**
```json
{
  "error_code": "E-PT-115",
  "message": "Market orders are not accepted during the ATC session (14:30–14:45 ICT). Use an ATC order instead.",
  "session": "ATC",
  "suggestion_order_type": "ATC"
}
```

**E-PT-116 — Max open orders:**
```json
{
  "error_code": "E-PT-116",
  "message": "You have reached the maximum of 10 open orders. Cancel an existing order to place a new one.",
  "current_open_orders": 10
}
```

**E-PT-117 — ATO order with limit price:**
```json
{
  "error_code": "E-PT-117",
  "message": "ATO orders do not accept a price. The system determines the opening price at 9:15 ICT.",
  "order_type": "ATO"
}
```

**E-PT-118 — ATC order with limit price:**
```json
{
  "error_code": "E-PT-118",
  "message": "ATC orders do not accept a price. The system determines the closing price at 14:45 ICT.",
  "order_type": "ATC"
}
```

**E-PT-122 — Exchange/ticker mismatch:**
```json
{
  "error_code": "E-PT-122",
  "message": "VIC is listed on HOSE, not HNX. Please resubmit with exchange=HOSE.",
  "ticker": "VIC",
  "submitted_exchange": "HNX",
  "correct_exchange": "HOSE"
}
```

**E-PT-201 — BUY limit above current price:**
```json
{
  "error_code": "E-PT-201",
  "message": "Your buy limit price (55,000 VND) is above the current price (52,000 VND). This would fill immediately. Use a Market order, or set a lower limit price.",
  "limit_price_submitted": 55000.00,
  "current_price": 52000.00
}
```

**E-PT-202 — SELL limit below current price:**
```json
{
  "error_code": "E-PT-202",
  "message": "Your sell limit price (48,000 VND) is below the current price (52,000 VND). This would fill immediately. Use a Market order, or set a higher limit price.",
  "limit_price_submitted": 48000.00,
  "current_price": 52000.00
}
```

**E-PT-203 — Price above ceiling:**
```json
{
  "error_code": "E-PT-203",
  "message": "Price exceeds today's ceiling of 55,090 VND for VIC on HOSE (reference price: 51,486 VND × 1.07).",
  "limit_price_submitted": 60000.00,
  "daily_ceiling": 55090.00,
  "reference_price": 51486.00
}
```

**E-PT-204 — Price below floor:**
```json
{
  "error_code": "E-PT-204",
  "message": "Price is below today's floor of 47,882 VND for VIC on HOSE (reference price: 51,486 VND × 0.93).",
  "limit_price_submitted": 40000.00,
  "daily_floor": 47882.00,
  "reference_price": 51486.00
}
```

**E-PT-205 — Tick size violation:**
```json
{
  "error_code": "E-PT-205",
  "message": "Price must be in increments of 100 VND for stocks priced above 50,000 VND. Did you mean 55,000 VND or 55,100 VND?",
  "limit_price_submitted": 55050.00,
  "tick_size": 100,
  "nearest_lower": 55000.00,
  "nearest_upper": 55100.00
}
```

**E-PT-206 — Insufficient balance for limit reserve:**
```json
{
  "error_code": "E-PT-206",
  "message": "Insufficient available balance. You need 4,504,500 VND to reserve for this order.",
  "required_reserve": 4504500.00,
  "available_balance": 2000000.00,
  "already_reserved": 8000000.00
}
```

**E-PT-207 — SELL limit conflict (soft-lock):**
```json
{
  "error_code": "E-PT-207",
  "message": "You already have an open sell order for VIC using these shares. Cancel your existing sell order before placing a new one.",
  "ticker": "VIC",
  "existing_sell_order_id": "ord_01HX0000YYYY"
}
```

---

### 4.2 GET /api/v1/paper-trading/orders

**Response 200 OK (expanded v2.3):**
```json
{
  "page": 1,
  "page_size": 20,
  "has_more": false,
  "orders": [
    {
      "order_id": "ord_01HX1111AAAA",
      "ticker": "VIC",
      "exchange": "HOSE",
      "order_type": "LIMIT",
      "side": "BUY",
      "quantity": 100,
      "limit_price": 45000.00,
      "status": "PENDING",
      "fill_price": null,
      "fill_timestamp": null,
      "reserve_amount": 4504500.00,
      "expiry_at": "2026-05-20T16:59:00Z",
      "estimated_fill": false,
      "pre_reset": false,
      "created_at": "2026-04-20T02:30:00Z",
      "cancel_reason": null
    },
    {
      "order_id": "ord_01HX1111BBBB",
      "ticker": "VIC",
      "exchange": "HOSE",
      "order_type": "MARKET",
      "side": "BUY",
      "quantity": 100,
      "limit_price": null,
      "status": "FILLED",
      "fill_price": 51500.00,
      "fill_timestamp": "2026-04-20T02:30:12Z",
      "reserve_amount": null,
      "expiry_at": null,
      "estimated_fill": false,
      "pre_reset": false,
      "created_at": "2026-04-20T02:30:00Z",
      "cancel_reason": null
    },
    {
      "order_id": "ord_01HX1111CCCC",
      "ticker": "005930",
      "exchange": "KOSPI",
      "order_type": "MARKET",
      "side": "BUY",
      "quantity": 5,
      "limit_price": null,
      "status": "FILLED",
      "fill_price": 72000.00,
      "fill_timestamp": "2026-04-20T01:00:05Z",
      "reserve_amount": null,
      "expiry_at": null,
      "estimated_fill": true,
      "pre_reset": false,
      "created_at": "2026-04-19T23:30:00Z",
      "cancel_reason": null
    }
  ]
}
```

**Order `status` values (v2.3):**
`PENDING` | `QUEUED_AFTER_HOURS` | `SUSPENDED` | `FILLED` | `FILL_FAILED` | `EXPIRED` | `CANCELLED`

**Order `cancel_reason` values (when status = CANCELLED):**
`USER_CANCELLED` | `PORTFOLIO_RESET` | `ACCOUNT_DELETED` | `SESSION_CLOSE_WHILE_SUSPENDED` | `DELISTED`

---

### 4.3 DELETE /api/v1/paper-trading/orders/{order_id} (Cancel Limit Order)

**Response 200 OK:**
```json
{
  "order_id": "ord_01HX1111AAAA",
  "status": "CANCELLED",
  "cancel_reason": "USER_CANCELLED",
  "reserve_released": 4504500.00,
  "cancelled_at": "2026-04-20T05:00:00Z"
}
```

**Response 422 — Cannot cancel filled/expired/already-cancelled order:**
```json
{
  "error_code": "E-PT-300",
  "message": "This order cannot be cancelled because it is already [FILLED/EXPIRED/CANCELLED].",
  "order_id": "ord_01HX1111AAAA",
  "current_status": "FILLED"
}
```

---

## 5. Error Code Reference (Paper Trading — v2.3)

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| E-PT-101 | 422 | Market closed (VN exchange) |
| E-PT-102 | 202 | After-hours KR/Global — order queued |
| E-PT-103 | 422 | Market order during PRE_OPEN session |
| E-PT-104 | 422 | Ticker suspended |
| E-PT-105 | 422 | Ticker delisted |
| E-PT-106 | — (async) | Fill failed: balance gap at fill time |
| E-PT-107 | 422 | Lot size not multiple of 100 (VN) |
| E-PT-108 | 422 | Insufficient virtual balance (BUY) |
| E-PT-109 | 422 | Insufficient virtual holdings (SELL) |
| E-PT-110 | 422 | Short sell attempt (0 holdings) |
| E-PT-111 | — (async) | Fill failed: feed unavailable after 3 retries |
| E-PT-112 | — (async) | Account suspended; open orders cancelled |
| E-PT-113 | — (async) | Ticker halted + session closed; order cancelled |
| E-PT-114 | 422 | Holdings changed between page load and submission |
| E-PT-115 | 422 | Market order during ATC session |
| E-PT-116 | 422 | Max 10 open orders reached |
| E-PT-117 | 422 | ATO order submitted with limit_price |
| E-PT-118 | 422 | ATC order submitted with limit_price |
| E-PT-119 | 422 | Invalid idempotency_key format |
| E-PT-120 | 422 | Ticker not found in active price feed |
| E-PT-121 | 422 | Invalid exchange value |
| E-PT-122 | 422 | Exchange/ticker mismatch |
| E-PT-123 | 422 | Invalid order_type |
| E-PT-124 | 422 | ATO order outside PRE_OPEN session |
| E-PT-125 | 422 | ATC order outside ATC session |
| E-PT-126 | 422 | Invalid side value |
| E-PT-127 | 422 | Invalid quantity |
| E-PT-200 | 422 | Limit price missing |
| E-PT-201 | 422 | BUY limit > current price |
| E-PT-202 | 422 | SELL limit < current price |
| E-PT-203 | 422 | Limit price above daily ceiling |
| E-PT-204 | 422 | Limit price below daily floor |
| E-PT-205 | 422 | Tick size violation |
| E-PT-206 | 422 | Insufficient balance for BUY limit reserve |
| E-PT-207 | 422 | SELL limit conflicts with existing open SELL |
| E-PT-208 | 422 | Aggregate BUY limit reserves would exceed balance |
| E-PT-209 | — (async) | Ticker delisted while limit order open → CANCELLED |
| E-PT-210 | — (async) | Ticker suspended while limit order open → SUSPENDED |
| E-PT-300 | 422 | Cannot cancel non-PENDING order |

---

## 6. Data Model Additions (v2.3)

### 6.1 virtual_orders table (additions)

| Field | Type | Notes |
|-------|------|-------|
| `order_type` | ENUM('MARKET','LIMIT','ATO','ATC') | Expanded from v2.0 |
| `idempotency_key` | UUID, NOT NULL, UNIQUE | For deduplication |
| `expiry_at` | TIMESTAMPTZ, NULLABLE | Set on LIMIT orders; NULL for MARKET/ATO/ATC |
| `reserve_amount` | DECIMAL(18,4), NULLABLE | Set for BUY LIMIT only |
| `estimated_fill` | BOOLEAN, DEFAULT FALSE | TRUE for KR/Global orders |
| `cancel_reason` | ENUM, NULLABLE | USER_CANCELLED / PORTFOLIO_RESET / ACCOUNT_DELETED / SESSION_CLOSE_WHILE_SUSPENDED / DELISTED |
| `session_at_submission` | ENUM('PRE_OPEN','OPEN','LUNCH','ATC','CLOSED','AFTER_HOURS') | Captures session state at order creation for auditability |
| `queued_for_session_open` | BOOLEAN, DEFAULT FALSE | For LUNCH-time orders queued for afternoon session |

### 6.2 order_reserves table (new)

| Field | Type | Notes |
|-------|------|-------|
| `reserve_id` | UUID, PK | |
| `order_id` | UUID, FK → virtual_orders | |
| `user_id` | UUID, FK → users | |
| `reserve_amount` | DECIMAL(18,4) | Amount reserved from virtual balance |
| `created_at` | TIMESTAMPTZ | |
| `released_at` | TIMESTAMPTZ, NULLABLE | Set when reserve is released (fill, cancel, expiry) |

### 6.3 holdings_soft_lock table (new)

| Field | Type | Notes |
|-------|------|-------|
| `lock_id` | UUID, PK | |
| `order_id` | UUID, FK → virtual_orders | |
| `user_id` | UUID, FK → users | |
| `ticker` | VARCHAR | |
| `exchange` | VARCHAR | |
| `quantity` | INTEGER | Shares soft-locked by this open SELL limit |
| `created_at` | TIMESTAMPTZ | |

### 6.4 vn_market_calendar table (new)

| Field | Type | Notes |
|-------|------|-------|
| `calendar_date` | DATE, PK | |
| `exchange` | ENUM('HOSE','HNX','UPCOM'), PK | Composite PK |
| `is_holiday` | BOOLEAN | TRUE if market closed on this date |
| `holiday_name` | VARCHAR, NULLABLE | e.g., "Tết Nguyên Đán" |
| `updated_at` | TIMESTAMPTZ | Last update by operations team |

---

## 7. Non-Functional Requirements (Order Engine)

| Attribute | Requirement |
|-----------|-------------|
| Order submission latency (VN MARKET) | p99 < 500ms from POST to HTTP 201 response |
| Order fill latency (VN MARKET) | p99 ≤ 15 seconds from status=PENDING to status=FILLED |
| Limit order evaluation throughput | System must evaluate all open PENDING limit orders against each VN price tick within 2 seconds |
| Concurrent order safety | Row-level locking (SELECT FOR UPDATE) on virtual_orders at fill time prevents double-fill |
| Idempotency window | 5 minutes from first submission |
| Expiry cron SLA | All expired orders must be processed within 60 seconds of 23:59 UTC |
| Reserve ledger consistency | Available balance calculation must be consistent: total_balance − sum(open_buy_limit_reserves). Recomputed on every order submission and fill. |
| Market calendar freshness | vn_market_calendar must be populated at minimum 1 quarter in advance. Missing dates default to CLOSED. |
| Data retention | virtual_orders: indefinite. order_reserves: retained until released_at + 30 days then purged. holdings_soft_lock: purged on order terminal state. |

---

*End of SRD Order Engine v2.3. This document replaces SRD v2.0 §2.11, §4.9, and §5.10.*

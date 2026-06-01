# FRD-10: Paper Trading Engine — PRIMARY PILLAR
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Version:** 2.4
**Date:** 2026-04-21
**Author:** Business Analysis Team
**Linked BRD:** BRD.md §BO-04 (Paper Trading Core Loop)
**Linked SRD:** SRD-order-engine-v2.3.md
**Status:** Authoritative — supersedes FRD.md v2.2 §Paper Trading, FRD-module-B-v2.3.md (all sections), and BRD-addendum-v2.3.md (paper trading BR additions)

> **Companion Documents for Order Management (v2.5 additions):**
> The following FRDs extend the Paper Trading Engine with screens and flows not covered in this document:
> - **FRD-18** (`18-order-history-orderbook.md`): Order History screen + Orderbook widget
> - **FRD-19** (`19-order-management.md`): Edit Order + Cancel Order dialogs and flows
> - **FRD-20** (`20-order-placement-v2.md`): Full Order Placement V2 screen (all order types: LO, MP, ATO, ATC, STOP_LIMIT, STOP)
> - **SRD** (`srd/18-order-history-orderbook.md`, `srd/19-order-management.md`, `srd/20-order-placement-v2.md`): System requirements for the above
> **Updated:** 2026-05-29

> **Purpose of this document:** This document is the complete, standalone specification for the Paave Paper Trading Engine. No real money is ever exchanged. All trades are simulated using real-time (VN) or reference (KR/Global) market data. A developer reading this document must be able to implement every rule, validation, state machine, and edge case without referencing any other file. A QA engineer must be able to write complete test cases from this document alone.

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | Paper Trading Engine |
| Module Role | PRIMARY PILLAR — the core product interaction |
| Primary Actors | Registered user (LEARN_MODE or FULL_ACCESS); Paave Order Engine (async fill processor); Paave Expiry Cron (daily TTL processor) |
| Goal | Allow users to simulate real stock market trades using a virtual portfolio of VND 500,000,000 with no financial risk |
| Trigger | Account activation (portfolio created); user taps "Buy" or "Sell" on any stock detail screen |
| Primary Market | VN (HOSE, HNX, UPCOM) — real-time data, strict rule simulation |
| Reference Markets | KR (KOSPI, KOSDAQ), Global/US — delayed reference data; simulated fills; "Estimated fill" label on all records |

### 1.1 Core Invariants (Never Violated)

| Invariant | Rule |
|-----------|------|
| No real money | No real brokerage orders are ever placed; no real account connection in V1; all trades are simulated in Paave's virtual portfolio system |
| Virtual label mandatory | "Tiền ảo / 가상 자금 / Virtual Funds" must appear on every paper trading screen (FR-PT-06) |
| VND denomination | All portfolio values are denominated in VND; KR/Global shown as VND equivalent |
| Starting balance | VND 500,000,000 (five hundred million VND) — exact; not configurable by user |
| VN board lot | All VN market orders must be multiples of 100 shares |
| Fee simulation | 0.1% of trade value shown as "Simulated fee: X VND" on every order confirmation screen |

### 1.2 Key Computed Definitions

```
available_balance     = virtual_portfolio.total_cash
                        - SUM(order_reserves WHERE status IN ('PENDING', 'QUEUED_AFTER_HOURS'))
                        - SUM(order_reserves WHERE type = 'BUY_LIMIT' AND status = 'PENDING')

portfolio_total_value = available_balance
                        + SUM(holdings.quantity * current_market_price)

unrealized_pnl        = (current_price - avg_buy_price) * quantity

realized_pnl          = SUM(sell_fill_price - avg_buy_price_at_sell) * sell_quantity
                        - simulated_fee_on_sell

simulated_fee         = trade_value * 0.001  (0.1%)
                        where trade_value = fill_price * quantity

avg_buy_price         = SUM(fill_price_i * quantity_i) / SUM(quantity_i)
                        (weighted average; recalculated on each BUY fill)
```

---

## 2. Functional Requirements

---

### FR-PT-01 — Virtual Portfolio Creation

**Priority:** P0 — Blocking; Home screen is not shown until portfolio exists.

**Actor:** Paave backend (triggered automatically on account activation); new registered user (passive recipient).

**Description:**
A virtual portfolio is automatically created for every user immediately upon account activation (when account_status transitions from any interim state to ACTIVE). The user does not initiate this; it happens server-side before the user sees the Home screen for the first time. The starting balance is always exactly VND 500,000,000. The "Tiền ảo / 가상 자금 / Virtual Funds" label is always visible in the portfolio header on any screen displaying the virtual portfolio — it cannot be dismissed, hidden, or toggled off by the user.

For KR/Global users whose device locale is set to KR or whose language preference is Korean: the VND balance is also displayed as a KRW equivalent (using a reference exchange rate updated daily). The underlying denomination is always VND. The KRW/USD equivalent is display-only.

**Input:**
- Account activation event (internal; no user input)
- `user.locale` (for display currency preference)

**Output:**

| Field | Value |
|-------|-------|
| `virtual_portfolio.user_id` | Linked to the new user |
| `virtual_portfolio.total_cash` | 500,000,000 VND (exactly; stored as integer or bigint in paisa/smallest unit; denominator = VND × 1 since VND has no subunit) |
| `virtual_portfolio.available_balance` | 500,000,000 VND (equals total_cash at creation; no reserves yet) |
| `virtual_portfolio.created_at` | UTC timestamp of account activation |
| `virtual_portfolio.currency` | `VND` (constant; never changes) |
| `virtual_portfolio.status` | `ACTIVE` |

**Precondition:**
- User's `account_status` has just transitioned to `ACTIVE`
- No existing virtual portfolio for this user (idempotent creation — if portfolio exists, do not create another)

**Postcondition:**
- `virtual_portfolio` record exists in database with the exact fields above
- `virtual_portfolio.available_balance = 500,000,000`
- `virtual_portfolio.holdings = []` (empty at creation)
- `virtual_portfolio.open_orders = []` (empty at creation)
- User can see Home screen (portfolio readiness is a prerequisite for Home screen navigation)

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-PT-01-01 | User completes onboarding (email path) | Account status transitions to ACTIVE | Virtual portfolio is created before user sees Home screen; balance = 500,000,000 VND |
| AC-PT-01-02 | User completes onboarding (Google OAuth path) | Account status transitions to ACTIVE | Virtual portfolio created; balance = 500,000,000 VND; "Tiền ảo" label visible in portfolio header |
| AC-PT-01-03 | KR-locale user | Completes registration | Portfolio shows "500,000,000 VND" with KRW equivalent below it; "가상 자금" label shown |
| AC-PT-01-04 | Portfolio creation succeeds | User navigates to Home | Portfolio header shows "Tiền ảo" label (non-dismissible) |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message |
|-------|----------|---------------|---------------------|
| FC-PT-01-A | Portfolio DB write fails on first attempt | Retry up to 3 times with 1-second intervals | User sees a loading spinner; no error message until 3rd failure |
| FC-PT-01-B | All 3 portfolio creation attempts fail | Portfolio creation job queued in background job system; user proceeds to Home with a banner: "Your portfolio is being set up. Please wait a moment." | "Your portfolio is being set up. Please wait a moment." — auto-refreshes when job completes |
| FC-PT-01-C | Portfolio creation call is duplicated (duplicate activation event) | Idempotent: second call detects existing portfolio and returns it without creating a second | No user impact |

**Edge Cases:**

| Case | Expected Behaviour |
|------|--------------------|
| User deletes and re-registers with same email | If prior portfolio is retained (account_status = DELETED, data anonymised), new portfolio created fresh; old portfolio not restored |
| Portfolio creation succeeds but Home screen navigation fails | User can tap "Refresh" or return to Home; portfolio exists in DB |

**Business Rules Referenced:**
- BR-17: Starting balance = VND 500,000,000; reset restores exactly this amount
- BR-18: "Tiền ảo / 가상 자금 / Virtual Funds" label mandatory, non-dismissible
- BR-10: No real orders executed; all trades virtual

---

### FR-PT-02 — Place Market Order (Paper)

**Priority:** P0 — Core trading action.

**Actor:** Registered user (LEARN_MODE or FULL_ACCESS).

**Description:**
A market order is a simulated order to buy or sell a stock at the best available price in the next real-time price snapshot. The order is accepted immediately and assigned `status = PENDING`. For VN primary markets (HOSE, HNX, UPCOM), the order fills within ≤15 seconds using the next price snapshot from the live feed. For KR/Global reference markets, fill timing is best-effort and carries an "Estimated fill" label.

Market orders are subject to: market session state (must be within trading hours), ticker status (not suspended or delisted), lot size rules, balance availability (checked at submission AND again at fill time), and order type restrictions per session (e.g., no MARKET orders during pre-opening on HOSE).

A simulated fee of 0.1% of trade value is displayed on the order confirmation screen and deducted from the portfolio on fill.

**Input:**

| Field | Type | Constraints |
|-------|------|-------------|
| `ticker` | string | Must exist and be active in the price feed for the specified exchange; case-insensitive; max 10 chars |
| `exchange` | enum | One of: `HOSE`, `HNX`, `UPCOM`, `KOSPI`, `KOSDAQ`, `GLOBAL` |
| `side` | enum | `BUY` or `SELL` |
| `quantity` | integer | > 0; for HOSE/HNX/UPCOM: must be a multiple of 100; for KOSPI/KOSDAQ/GLOBAL: any positive integer |
| `order_type` | enum | Must be `MARKET` for this FR |
| `idempotency_key` | UUID v4 | Client-generated per tap; used for deduplication within 5 minutes (Redis TTL) |

**Order Confirmation Screen (shown before submission):**

The following must be displayed on the confirmation screen before the user taps "Confirm Order":
- Ticker symbol and exchange
- Side (BUY / SELL)
- Quantity
- Estimated price (last known snapshot price; labelled "Estimated — actual fill price may differ")
- Estimated cost / proceeds: quantity × estimated_price
- Simulated fee: `quantity × estimated_price × 0.001` displayed as "Simulated fee: X VND"
- Estimated total cost (BUY): cost + simulated_fee
- Estimated total proceeds (SELL): proceeds − simulated_fee
- "Tiền ảo" label in header

**Output:**

| Outcome | HTTP Status | Order Status | System Action |
|---------|-------------|--------------|---------------|
| Happy path submission | 201 Created | `PENDING` | Order record created; async fill job queued |
| Validation failure | 400 | — | Error code and message returned; no order created |
| Duplicate idempotency_key | 200 | Original status | Original order response returned; no new record |

**Async Fill (Happy Path):**
- Within ≤15 seconds for VN (HOSE/HNX/UPCOM): order engine reads next price snapshot from feed
- Fill price = snapshot price (not the price at submission — actual fill price may differ)
- On fill: `order.status → FILLED`; `order.fill_price = snapshot_price`; `order.fill_timestamp = UTC now`
- Holdings updated: BUY → quantity added, avg_buy_price recalculated; SELL → quantity reduced, realized_pnl stored
- Balance updated: BUY → `total_cash -= (fill_price × quantity) + simulated_fee`; SELL → `total_cash += (fill_price × quantity) - simulated_fee`
- Push notification: "Your order filled: [BUY/SELL] [quantity] [ticker] at [fill_price] VND"
- Post-trade AI card event fired (see FR-AI-01; content varies by feature_tier)
- XP event fired (gamification system)

**Preconditions:**
- User has an ACTIVE virtual portfolio
- For BUY: `available_balance >= quantity × current_snapshot_price × 1.001` (checked at submission; re-checked at fill — see FC-PT-05)
- For SELL: `holdings[ticker].quantity >= requested_quantity` (checked at submission; re-checked at fill — see FC-PT-15)
- `max_pending_orders < 10` (BR-PT-14; counting all PENDING orders across all markets)

**Postcondition (Happy Path):**
- `order.status = FILLED`
- Holdings and balance updated atomically (DB transaction)
- Realized P&L stored for SELL orders
- Order appears in trade history

**Acceptance Criteria (Happy Path):**

| # | Given | When | Then |
|---|-------|------|------|
| AC-PT-02-01 | User has 450M VND balance; buying 100 VIC at ~50,000 VND per share | BUY MARKET submitted during HOSE Continuous Session | Status = PENDING returned immediately; within 15s → FILLED at next snapshot price; balance debited (fill_price × 100 + simulated_fee); holdings show +100 VIC |
| AC-PT-02-02 | User holds 200 VIC; selling 100 | SELL MARKET submitted | Status = PENDING; within 15s → FILLED; holdings reduced to 100 VIC; balance credited (fill_price × 100 − simulated_fee) |
| AC-PT-02-03 | Simulated fee shown on confirmation | User views order confirmation before submitting | "Simulated fee: X VND" displayed where X = estimated_price × 100 × 0.001 |
| AC-PT-02-04 | User taps "Confirm Order" twice rapidly (double-tap) | Two submissions with same idempotency_key | Second submission returns original order response; no second order created |
| AC-PT-02-05 | User has exactly 10 open PENDING orders | Attempts to place an 11th | Rejected: E-PT-116 |

---

#### FR-PT-02 Failed Cases (All 15)

| FC-ID | Scenario | Trigger | System Action | User-Facing Message | Error Code |
|-------|----------|---------|---------------|---------------------|------------|
| FC-PT-01 | Market is CLOSED at submission time (outside trading hours or on a VN market holiday) | VN exchange: current_time outside 09:00–14:45 ICT on a trading day, OR day is a VN market holiday | VN exchanges (HOSE/HNX/UPCOM): reject immediately; order not created. KR/Global: order accepted; status = QUEUED_AFTER_HOURS; fills at next session open using best-available price at that time | VN: "The VN market is currently closed. Market hours are 09:00–14:45 ICT (Monday–Friday, excluding VN public holidays). Try a Limit order to queue for the next session." KR/Global: "Order queued — will attempt to fill when the market opens. Auto-cancels after 48 hours if unfilled." | E-PT-101 (VN rejection); E-PT-102 (KR/Global QUEUED_AFTER_HOURS) |
| FC-PT-02 | HOSE/HNX pre-opening session (09:00–09:15 ICT); MARKET order submitted | order_type = MARKET; exchange_session = PRE_OPENING | Reject immediately; MARKET not accepted in pre-opening. Suggest ATO order type. | "Market orders are not accepted during the pre-opening session (09:00–09:15 ICT). Place an ATO (At-the-Opening) order to participate in the opening price match." | E-PT-103 |
| FC-PT-03a | Ticker is SUSPENDED or HALTED by the exchange at submission time | `ticker.status = SUSPENDED` or `HALTED` at time of order submission | Reject immediately; no order created | "This stock is currently suspended by the exchange and cannot be traded. Orders will be available when trading resumes." | E-PT-104 |
| FC-PT-03b | Ticker is halted AFTER order submission but BEFORE fill (mid-order halt) | Order status = PENDING; exchange publishes halt event for ticker | Order transitions from PENDING → SUSPENDED; push notification sent; if halt is lifted within the same trading session, order resumes evaluation as PENDING; if market closes before halt lifts, order is cancelled (SESSION_CLOSE_WHILE_SUSPENDED) | Push: "Trading for [TICKER] has been suspended. Your order is on hold. We'll notify you when it resumes or if it's cancelled." | E-PT-104 (async) |
| FC-PT-04 | Ticker is DELISTED | `ticker.status = DELISTED` | Reject immediately; no order created | "This stock is no longer listed on [EXCHANGE] and cannot be traded." | E-PT-105 |
| FC-PT-05 | Market price moves between submission and fill time; balance is now insufficient at fill time | At fill attempt: `available_balance < fill_price × quantity + simulated_fee` | Order status → FILL_FAILED; no holdings change; reserved balance (if any) released; push notification sent | Push: "Your BUY order for [quantity] [TICKER] could not fill — the price moved to [fill_price] VND and your balance was insufficient. Your funds have been returned." | E-PT-106 |
| FC-PT-06 | Lot size violation: VN exchange (HOSE/HNX/UPCOM); quantity is not a multiple of 100 | `quantity % 100 ≠ 0`; exchange is HOSE, HNX, or UPCOM | Reject immediately; show nearest valid quantities | "Order quantity must be in multiples of 100 shares on [EXCHANGE]. Nearest valid quantities: [floor(quantity/100)×100] shares or [ceil(quantity/100)×100] shares." | E-PT-107 |
| FC-PT-07 | Insufficient virtual balance at submission time (BUY) | `available_balance < quantity × current_price × 1.001` at submission | Reject immediately; no order created | "Insufficient virtual funds. Available balance: [available_balance] VND. Estimated cost (including fee): [estimated_cost] VND." | E-PT-108 |
| FC-PT-08 | Insufficient holdings at submission time (SELL) | `holdings[ticker].quantity < requested_sell_quantity` | Reject immediately; no order created | "Insufficient shares to sell. You hold [available_quantity] [TICKER] shares; you requested to sell [requested_quantity] shares." | E-PT-109 |
| FC-PT-09 | LEARN_MODE user attempts to SELL a ticker they do not hold (short selling attempt) | `feature_tier = LEARN_MODE`; `holdings[ticker].quantity = 0` or ticker not in holdings | Reject immediately; LEARN_MODE users cannot short sell in any form | "You don't own any [TICKER] shares to sell. Short selling is not available in paper trading." | E-PT-110 |
| FC-PT-10 | VN price feed is DEGRADED or unavailable at fill time | Price feed service returns error or timeout for VN market | Order remains PENDING; order engine retries at 60-second intervals; after 3 failed retries (total ~180 seconds): order transitions to FILL_FAILED; balance released | During retry period — push: "VN market data is temporarily unavailable. Your order is queued and will fill as soon as data is restored." After 3 failures — push: "Your order for [TICKER] could not fill — live price data was unavailable for too long. Your funds have been returned." | E-PT-111 |
| FC-PT-11 | Duplicate order submission (same idempotency_key received within 5 minutes) | `idempotency_key` found in Redis deduplication store (TTL = 5 minutes) | Return the original order response (HTTP 200 with original order object); no second order record created | No user-facing message — deduplication is transparent | — |
| FC-PT-12 | User account suspended mid-order (while order is PENDING) | `users.account_status` transitions to SUSPENDED while order is PENDING | All PENDING orders for this user cancelled; reserved balance released; push notification sent | Push: "Your order was cancelled because your account was suspended. Please contact support at support@paave.app." | E-PT-112 |
| FC-PT-13 | Fill price equals or reaches VN price ceiling at time of fill (HOSE ±7% or ±20% for newly listed) | Computed fill price = `reference_price × 1.07` (or ×1.20 for newly listed) | Order fills at the ceiling price (ceiling price is a valid trading price); no rejection. Trade history record includes label: "Filled at ceiling price" | No error message (normal fill). In trade history: "[TICKER] — Filled at ceiling price: [ceiling_price] VND." | — |
| FC-PT-14 | Stock enters an intraday circuit breaker while PENDING order exists | Exchange publishes circuit breaker event for ticker mid-session | Same as FC-PT-03b (mid-order halt): order → SUSPENDED; if halt lifts within session → resumes as PENDING → eventually FILLED or FILL_FAILED; if market closes before lift → CANCELLED (SESSION_CLOSE_WHILE_SUSPENDED); cancel_reason = SESSION_CLOSE_WHILE_SUSPENDED | Push on cancellation: "Trading for [TICKER] was halted and the market closed before trading resumed. Your order has been cancelled and your funds returned." | E-PT-113 |
| FC-PT-15 | Holdings quantity changes between page load and SELL submission (parallel session fill) | Server-side validation at submission detects `holdings[ticker].quantity < requested_sell_quantity` (updated by another fill that happened in a concurrent session) | Reject immediately | "Your holdings were updated by a recent order. Please refresh your portfolio and try again." | E-PT-114 |

**Edge Cases:**

| Case | Expected Behaviour |
|------|--------------------|
| User has exactly 10 PENDING orders (BR-PT-14 max) | 11th order rejected: "You have reached the maximum of 10 open orders. Cancel an existing order to place a new one." E-PT-116 |
| Fill price = VN price floor (SELL at floor) | Fill at floor price; no rejection; trade history label: "Filled at floor price" |
| SELL market order; user has soft-locked holdings from an open SELL limit | FC-PT-08 applies — net available holdings (holdings - soft-locked) is checked at submission; if net < requested, reject |
| KR/Global MARKET during after-hours | QUEUED_AFTER_HOURS (E-PT-102); auto-cancels after 48h if not filled (BR-PT-16) |
| ATO order submitted but ATO/ATC fields not specified | Separate order type; not handled by FR-PT-02 (see FR-PT-07) |

**Business Rules Referenced:** BR-PT-01, BR-PT-06, BR-PT-07, BR-PT-08, BR-PT-11, BR-PT-14, BR-PT-15, BR-PT-16, BR-PT-18, BR-08, BR-10, BR-14, BR-46

---

### FR-PT-03 — Place Limit Order (Paper)

**Priority:** P0 — Core trading action.

**Actor:** Registered user (LEARN_MODE or FULL_ACCESS).

**Description:**
A limit order is a simulated order to buy or sell at a specified price. A BUY limit fills when the market price drops to or below the limit price; a SELL limit fills when the market price rises to or above the limit price. The system evaluates open limit orders every 15 seconds against the current price snapshot. Orders that are not filled expire automatically after 30 calendar days (GTC_30D, the default validity).

For BUY limits on VN exchanges: the `reserve_amount = quantity × limit_price × 1.001` is deducted from `available_balance` immediately upon order creation. This reserve cannot be used by other orders. If the order fills at a price better than the limit (i.e., at a lower price for BUY), the difference is refunded to available_balance.

For SELL limits: the specified quantity is "soft-locked" in the user's holdings. The same shares cannot be placed in another SELL order while soft-locked.

Price snapshot evaluation: the order fills only when a 15-second interval snapshot confirms the price is at or through the limit. A price that transiently crosses the limit between snapshots does NOT trigger a fill (FC-LIM-15).

**Input:**

| Field | Type | Constraints |
|-------|------|-------------|
| `ticker` | string | Must exist and be active in price feed for specified exchange |
| `exchange` | enum | `HOSE`, `HNX`, `UPCOM`, `KOSPI`, `KOSDAQ`, `GLOBAL` |
| `side` | enum | `BUY` or `SELL` |
| `quantity` | integer | > 0; HOSE/HNX/UPCOM: multiple of 100; KOSPI/KOSDAQ/GLOBAL: any positive integer |
| `order_type` | enum | Must be `LIMIT` for this FR |
| `limit_price` | decimal | See price validation rules below |
| `order_validity` | enum | `GTD` (Good Till Day — expires at 14:45 ICT same day) or `GTC_30D` (Good Till Cancel, expires after 30 calendar days). Default: `GTC_30D` |
| `idempotency_key` | UUID v4 | Client-generated per tap; deduplication within 5 minutes |

**Limit Price Validation Rules (applied at submission, before order is created):**

| Rule | BUY Limit | SELL Limit | Error Code |
|------|-----------|------------|------------|
| Price vs current price | `limit_price ≤ current_price` (BUY at or below current; immediate fill → use MARKET) | `limit_price ≥ current_price` (SELL at or above current; immediate fill → use MARKET) | E-PT-201 (BUY too high), E-PT-202 (SELL too low) |
| Price vs exchange ceiling | `limit_price ≤ reference_price × ceiling_multiplier` | Same (SELL above ceiling impossible as ceiling is the max allowed) | E-PT-203 |
| Price vs exchange floor | `limit_price ≥ reference_price × floor_multiplier` | Same | E-PT-204 |
| Tick size conformance (VN) | `limit_price % tick_size == 0` where tick_size is determined by price level | Same | E-PT-205 |
| KR/Global — no price band or tick validation | N/A (reference data; not validated) | N/A | — |

**Tick Size Reference (VN exchanges only):**

| Price Level | Tick Size | Example |
|-------------|-----------|---------|
| `limit_price ≥ 50,000 VND` | 100 VND | 50,100; 50,200; NOT 50,150 |
| `10,000 VND ≤ limit_price < 50,000 VND` | 50 VND | 20,000; 20,050; NOT 20,025 |
| `limit_price < 10,000 VND` | 10 VND | 5,000; 5,010; NOT 5,005 |

**Reserve Mechanics:**

| Side | Reserve Type | Amount | Effect on Balance |
|------|-------------|--------|------------------|
| BUY | Cash reserve (hard lock) | `quantity × limit_price × 1.001` | Deducted from `available_balance` immediately; cannot be used by other BUY orders |
| SELL | Holdings soft lock | `quantity` shares of `ticker` | Cannot place another SELL order (limit or market) on the same soft-locked shares |

**Refund Mechanic (BUY fill below limit price):**
If the order fills at a price below the limit_price (best available ≤ limit):
- Actual cost = `fill_price × quantity × 1.001`
- Reserved amount = `limit_price × quantity × 1.001`
- Refund = `reserved_amount − actual_cost`
- `available_balance += refund` (credited atomically with the fill)

**Order Confirmation Screen (shown before submission):**
- Ticker, exchange, side, quantity
- Limit price: exact entered amount
- Reserve amount: `quantity × limit_price × 1.001` displayed as "Funds to be reserved: X VND"
- Simulated fee (estimated): `quantity × limit_price × 0.001` displayed as "Estimated simulated fee: X VND (charged at fill)"
- Validity: "Expires in 30 days" (GTC_30D) or "Expires at end of today" (GTD)
- For KR/Global: "Estimated price — reference data only; actual fill price may differ"
- "Tiền ảo" label in header

**Preconditions:**
- User has an ACTIVE virtual portfolio
- For BUY: `available_balance ≥ quantity × limit_price × 1.001`
- For SELL: `available_holdings[ticker].unlocked_quantity ≥ quantity` (unlocked = holdings not already soft-locked by another open SELL order)
- Total PENDING + QUEUED_AFTER_HOURS orders < 10 (BR-PT-14)

**Postcondition (Happy Path — FILLED):**
- `order.status = FILLED`
- `order.fill_price` recorded (may be ≤ limit_price for BUY; may be ≥ limit_price for SELL)
- Holdings and balance updated atomically
- Refund applied if BUY fills below limit
- Reserve and soft-lock released
- Push notification sent
- Post-trade AI card fired

**Acceptance Criteria (Happy Path):**

| # | Given | When | Then |
|---|-------|------|------|
| AC-PT-03-01 | User with 200M VND balance; BUY LIMIT 100 VIC at 45,000 (current price 48,000) | Order submitted | Status = PENDING; 4,504,500 VND (100×45,000×1.001) reserved; available balance = 200M − 4,504,500 |
| AC-PT-03-02 | Open BUY LIMIT for VIC at 45,000; price snapshot shows 44,500 | System evaluates | Fills at 44,500 VND (best available ≤ 45,000); refund = (45,000 − 44,500) × 100 × 1.001 = 50,050 VND credited |
| AC-PT-03-03 | Open BUY LIMIT; 30 calendar days pass unfilled | Expiry cron runs at 23:59 UTC | Status → EXPIRED; reserve released; push: "Your BUY limit order for [quantity] [TICKER] expired unfilled. Your reserved funds have been returned." |
| AC-PT-03-04 | User places SELL LIMIT 100 VIC at 55,000 (current 52,000) | Order submitted | Status = PENDING; 100 VIC shares soft-locked; user cannot place another SELL on same shares |
| AC-PT-03-05 | Open SELL LIMIT; price snapshot shows 55,100 | System evaluates | SELL fills at 55,100 (best available ≥ 55,000); soft lock released; balance credited |

---

#### FR-PT-03 Failed Cases (All 19)

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|---------------|---------------------|------------|
| FC-LIM-01 | BUY limit_price > current_price at submission | Reject immediately (would fill instantly like a MARKET order — user intent mismatch) | "Your buy limit price ([limit_price] VND) is above the current price ([current_price] VND). This would fill immediately. Use a Market order, or set a price below the current price." | E-PT-201 |
| FC-LIM-02 | SELL limit_price < current_price at submission | Reject immediately | "Your sell limit price ([limit_price] VND) is below the current price ([current_price] VND). This would fill immediately. Use a Market order, or set a price above the current price." | E-PT-202 |
| FC-LIM-03 | limit_price exceeds daily price ceiling for HOSE (reference_price × 1.07, or ×1.20 for newly listed first 3 sessions) | Reject immediately | "Your limit price exceeds today's price ceiling of [ceiling_price] VND for [TICKER] on HOSE. Please enter a price at or below [ceiling_price] VND." | E-PT-203 |
| FC-LIM-04 | limit_price falls below daily price floor for HOSE (reference_price × 0.93) | Reject immediately | "Your limit price is below today's price floor of [floor_price] VND for [TICKER] on HOSE. Please enter a price at or above [floor_price] VND." | E-PT-204 |
| FC-LIM-05 | Lot size violation: VN exchange; quantity not a multiple of 100 | Reject immediately; show nearest valid quantities | Same message as FC-PT-06: "Order quantity must be in multiples of 100 shares on [EXCHANGE]. Nearest valid quantities: [floor_qty] or [ceil_qty] shares." | E-PT-107 |
| FC-LIM-06 | Tick size violation: limit_price is not on the valid tick grid for the price level | Reject immediately; suggest nearest valid price | "Price must be in increments of [tick_size] VND for [TICKER] at this price level. Did you mean [rounded_down_price] VND or [rounded_up_price] VND?" | E-PT-205 |
| FC-LIM-07 | Insufficient available balance for BUY limit reserve (`available_balance < quantity × limit_price × 1.001`) | Reject immediately; show breakdown | "Insufficient available balance to reserve for this order. Available: [available_balance] VND. Required reserve: [required_reserve] VND. Note: [reserved_by_other_orders] VND is already reserved for other open orders." | E-PT-206 |
| FC-LIM-08 | User already has an open SELL limit order for the same ticker covering the same (or overlapping) shares | Reject immediately (double-locking: same shares cannot be in two SELL orders simultaneously) | "You already have an open sell order for [TICKER]. Cancel it before placing another sell order on the same shares." | E-PT-207 |
| FC-LIM-09 | User places multiple BUY LIMIT orders on various tickers; aggregate reserves would exceed available_balance | Allow orders up to balance exhaustion; reject the specific order that would push total reserves over available_balance | "Your open buy limit orders have already reserved [total_reserved] VND of your balance. This order would require an additional [required] VND, which exceeds your available balance of [available] VND." | E-PT-208 |
| FC-LIM-10 | Stock is DELISTED by the exchange while this limit order is open and PENDING | Auto-cancel the order; release BUY reserve or SELL soft-lock; push notification sent | Push: "Your limit order for [TICKER] was cancelled — this stock has been delisted from the exchange. Your reserved balance has been returned." | E-PT-209 |
| FC-LIM-11 | Stock is SUSPENDED by exchange while this limit order is open | Order transitions to SUSPENDED; evaluation paused; if halt lifts within same session → PENDING resumes; if market closes while SUSPENDED → order remains SUSPENDED and resumes from NEXT session open (limit orders survive a session close while suspended, unlike MARKET orders) | Push: "Trading for [TICKER] has been temporarily suspended. Your limit order is on hold and will resume when trading resumes." | E-PT-210 |
| FC-LIM-12 | User initiates a Portfolio Reset while this limit order is open | Order auto-cancelled as part of reset; reset confirmation dialog MUST state: "This will also cancel [N] open limit order(s)" (where N = count of all open PENDING and QUEUED_AFTER_HOURS orders); if N = 0, this sentence is hidden; on confirm: cancellation logged with `cancel_reason = PORTFOLIO_RESET` | Reset confirmation modal: "Reset your portfolio? This will return your balance to 500,000,000 VND and close all positions. **This will also cancel [N] open limit order(s).**" | — |
| FC-LIM-13 | User account is DELETED while this limit order is open | All open orders cancelled; order data retained for compliance audit; user-identifiable data anonymised per data retention policy; no push sent (account deleted) | No user message (account deleted). Compliance log updated: `order_id`, `cancel_reason = ACCOUNT_DELETED`, `cancelled_at` timestamp | — |
| FC-LIM-14 | Limit order on KR or Global (reference market): price band cannot be validated against real-time data | Accept the order without price-band validation; attach "Estimated price" label to all records related to this order | On confirmation screen: "KR/Global market data is reference-only and may be delayed. Your limit price will be evaluated against estimated prices. Fill is not guaranteed at your exact limit price." In trade history: "Estimated fill" chip on the record | — |
| FC-LIM-15 | Market price crosses the limit transiently between 15-second snapshots (price dips to or through limit, then recovers before next snapshot) | Order does NOT fill. Fill evaluates only at 15-second price snapshot moments. A transient cross that is not captured in a snapshot is invisible to the system. | No user message (documented behaviour; explanation tooltip shown in order detail screen: "Limit orders fill only when the price is confirmed at or through your limit at a 15-second price check.") | — |
| FC-LIM-16 | BUY limit order would fill at this snapshot, but available balance (after other fills that happened since reservation) is now insufficient for the actual fill cost | Order NOT filled at this snapshot; re-evaluated at next 15-second snapshot; if balance never recovers within 30 days, order expires normally (FC-LIM standard expiry) | No message during re-evaluation; order shows as PENDING; if eventually expires: standard EXPIRED push notification | — |
| FC-LIM-17 | SELL limit on KR/Global reference market: fill price may differ from stated limit_price | Fill is executed at best-available estimated reference price at the time of evaluation; this may be above or below the exact limit_price due to data lag | In trade history: "Estimated fill — actual price may differ from your limit." In order record: `fill_note = 'ESTIMATED_REFERENCE_FILL'` | — |
| FC-LIM-18 | Duplicate submission (same idempotency_key received within 5 minutes) | Return original order response (HTTP 200 with original order object); no new record created | Transparent deduplication; no user-facing message | — |
| FC-LIM-19 | Order submitted during VN Midday Break (11:30–13:00 ICT) | Accept and queue; evaluation begins when Continuous Session 2 opens at 13:00 ICT; order status = PENDING throughout; it appears in Open Orders list with a "Queued for 13:00" indicator | On confirmation: "Order placed. Evaluation will begin at 13:00 ICT when the afternoon trading session opens." In open orders: "Queued for 13:00" status badge | — |

**Edge Cases:**

| Case | Expected Behaviour |
|------|--------------------|
| User places BUY LIMIT with GTD validity; session ends unfilled | Status → EXPIRED at 14:45 ICT (session close); reserve released; push: "Your GTD limit order for [TICKER] has expired." |
| SELL limit for KR/Global submitted; account suspended before fill | All PENDING orders cancelled (same as FC-LIM-13 mechanism); E-PT-112 |
| BUY limit fills partially (partial fills not supported V1) | V1: no partial fills — order either fills in full or not at all |
| Newly listed VN stock (±20% band): limit price submitted at reference×1.18 | Within the ±20% band → accepted (not rejected by E-PT-203); `is_newly_listed` flag on ticker metadata used to determine correct band |
| User submits SELL limit; then a BUY fill for same ticker happens → avg_buy_price changes | Soft lock is on quantity, not on price; SELL limit remains valid; fill will use updated avg_buy_price for realized P&L calculation |

**Business Rules Referenced:** BR-PT-01, BR-PT-02, BR-PT-03, BR-PT-04 (tick size), BR-PT-05, BR-PT-08, BR-PT-09, BR-PT-10, BR-PT-11, BR-PT-12, BR-PT-13, BR-PT-14, BR-PT-15, BR-PT-16, BR-PT-18, BR-46

---

### FR-PT-04 — Portfolio Dashboard

**Priority:** P0 — Primary information surface.

**Actor:** Registered user (LEARN_MODE or FULL_ACCESS).

**Description:**
The Portfolio Dashboard is the primary screen where users view the state of their virtual portfolio. It contains 7 mandatory sections, always rendered in the order below. The "Tiền ảo" label appears in the screen header permanently and is non-dismissible.

**Input:** User navigates to Portfolio tab.

**Output:** Rendered portfolio dashboard with all 7 sections populated from latest data.

**Precondition:** User is authenticated; virtual portfolio exists.

**Postcondition:** No state change (read-only screen).

---

#### Section 1: Total Virtual Portfolio Value

| Element | Value | Format |
|---------|-------|--------|
| Label | "Tổng tài sản ảo" (vi) / "총 가상 자산" (ko) / "Total Virtual Portfolio Value" (en) | H1 text |
| Amount | `portfolio_total_value = available_balance + SUM(holdings.quantity × current_market_price)` | "VND X,XXX,XXX,XXX" formatted with thousand separators |
| Change today | `portfolio_total_value − portfolio_value_at_start_of_today_UTC7` | ±X,XXX,XXX VND and ±X.XX%; green if positive, red if negative, grey if zero |
| "Tiền ảo" badge | Non-dismissible chip; always visible | WCAG AA contrast on all theme backgrounds (see FR-PT-06) |
| Refresh behaviour | Pulls latest price snapshot; updates every 15 seconds while screen is active; spinner shown during update |

---

#### Section 2: Available Virtual Cash

| Element | Value | Format |
|---------|-------|--------|
| Label | "Tiền mặt khả dụng" (vi) / "가용 현금" (ko) / "Available Cash" (en) | H2 text |
| Amount | `available_balance = total_cash − SUM(open_buy_limit_reserves)` | "VND X,XXX,XXX,XXX" |
| Reserved amount (if > 0) | "X,XXX,XXX VND reserved in [N] open order(s)" | Shown below available cash; tappable → navigates to Open Orders section |

---

#### Section 3: Holdings List

Each holding in the portfolio is displayed as a row with:

| Field | Display | Calculation |
|-------|---------|-------------|
| Ticker symbol | Bold ticker code | e.g., "VIC" |
| Exchange chip | Coloured chip | "HOSE", "HNX", "UPCOM", "KOSPI", etc. |
| Quantity | Integer | e.g., "200 shares" |
| Average buy price | Price user paid per share on average | `SUM(fill_price_i × qty_i) / SUM(qty_i)` — weighted average; "Avg: X,XXX VND" |
| Current price | Latest snapshot price | "X,XXX VND"; labelled "Estimated" for KR/Global |
| Unrealized P&L (amount) | `(current_price − avg_buy_price) × quantity` | Green if positive; red if negative; grey if zero; "±X,XXX,XXX VND" |
| Unrealized P&L (%) | `(current_price / avg_buy_price − 1) × 100` | "±X.XX%" — same color coding |
| Soft-lock indicator | If SELL limit is open for this holding | "🔒 [N] shares in open sell order" badge shown on the row |

**Delisted stock behaviour:** If a holding's ticker has been delisted:
- Row shows ticker with "Delisted" badge in red
- Current price shows "N/A — Delisted"
- Unrealized P&L is frozen at the last known price before delisting; a "(frozen)" note appended
- The holding remains in the list until the user resets their portfolio

**Sorting:** Default sort by unrealized P&L % descending (largest gain at top). User can tap column headers to re-sort (by ticker alphabetically, by value, by P&L).

---

#### Section 4: Portfolio Value Chart

| Attribute | Specification |
|-----------|---------------|
| Chart type | Line chart; area fill below line |
| Ranges | 1D (today; 15-minute data points), 1W (7 days; hourly), 1M (30 days; daily), 3M (90 days; daily), 1Y (365 days; daily) |
| Default range | 1D |
| X-axis | Time labels appropriate to range; 1D shows "09:00, 10:00, ..., 15:00 ICT"; 1Y shows months |
| Y-axis | VND values; auto-scaled to data range |
| Baseline | Starting balance (500M VND) shown as dotted reference line |
| Portfolio reset | Reset events shown as vertical dashed markers on the chart; values before reset shown in a muted colour |
| KR/Global holdings | Included in portfolio value using estimated reference prices |
| Data unavailability | If price feed unavailable for any data point, that point is shown as a gap (no interpolation); tooltip: "Data unavailable for this period" |

---

#### Section 5: Realized P&L Total

| Element | Specification |
|---------|---------------|
| Label | "Lợi nhuận đã thực hiện" (vi) / "실현 손익" (ko) / "Realized P&L" (en) |
| Amount | `SUM(realized_pnl)` across ALL sell trades (including pre-reset; total lifetime) |
| Breakdown | Tappable → opens a breakdown screen: total realized P&L, P&L this month, P&L this year |
| Color | Green if total > 0; red if total < 0; grey if 0 |
| Note on pre-reset | "Includes trades from before your portfolio reset(s)" shown if any pre-reset trades exist |

---

#### Section 6: Trade History

| Attribute | Specification |
|-----------|---------------|
| Scope | ALL trades ever made by this user (not just current portfolio cycle); retained indefinitely |
| Pre-reset trades | Trades made before a portfolio reset are labeled with a "[Pre-Reset]" prefix in the trade title |
| Entry format | Date/time; ticker + exchange chip; side (BUY/SELL); quantity; fill_price; total cost/proceeds; simulated_fee; P&L for SELL trades; order type (MARKET/LIMIT/ATO/ATC) |
| "Estimated fill" | All KR/Global trades have "Estimated fill" chip on the record (BR-PT-11) |
| "Filled at ceiling price" | Shown if fill_note = 'CEILING_FILL' |
| "Filled at floor price" | Shown if fill_note = 'FLOOR_FILL' |
| "Closed at reset" | Shown if cancel_reason = 'PORTFOLIO_RESET' |
| Pagination | Infinite scroll; 50 entries per page |
| Search/Filter | Filter by ticker, date range, side (BUY/SELL), exchange |

---

#### Section 7: Open Orders

| Attribute | Specification |
|-----------|---------------|
| Scope | All orders with `status IN ('PENDING', 'QUEUED_AFTER_HOURS', 'SUSPENDED')` |
| Display per order | Ticker; exchange; side; quantity; order type; limit_price (for LIMIT); order_validity; time placed; current status badge; "Queued for 13:00" badge if submitted during lunch break |
| KR/Global queued orders | Status badge: "Queued — After Hours"; TTL countdown: "Auto-cancels in [X] hours" (counts down from 48h) |
| SUSPENDED orders | Status badge: "Trading Suspended"; "Resumes when halt lifts" sub-label |
| Cancel action | Swipe-left on an order → "Cancel Order" button; tap → confirmation modal: "Cancel this order? Reserved funds will be returned." → Confirm → order cancelled, reserve released |
| Max display | Up to 10 orders (BR-PT-14 max limit) |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-PT-04-01 | User has 3 holdings and 200M VND cash | Views Portfolio Dashboard | All 7 sections visible; total value = cash + sum(holdings × prices); "Tiền ảo" label in header |
| AC-PT-04-02 | User has a delisted holding | Views holdings list | Delisted holding shows "Delisted" badge; price = "N/A — Delisted"; P&L frozen with "(frozen)" note |
| AC-PT-04-03 | User has made trades before a reset | Views trade history | Pre-reset trades show "[Pre-Reset]" prefix |
| AC-PT-04-04 | User has KR trade | Views trade history | KR trade shows "Estimated fill" chip |
| AC-PT-04-05 | User has open BUY limit orders with 5M VND reserved | Views Section 2 | Available cash = total_cash − 5M; "5,000,000 VND reserved in [N] open order(s)" shown |
| AC-PT-04-06 | User switches chart to 1Y range | Taps 1Y | Chart shows 365 data points (daily); baseline dotted line at 500M VND visible |

---

### FR-PT-05 — Portfolio Reset

**Priority:** P1 — Important; used when user wants to restart their learning journey.

**Actor:** Registered user.

**Description:**
A user may reset their virtual portfolio at any time. A reset returns the balance to exactly VND 500,000,000, closes all open positions at the last known snapshot price, and cancels all open orders. Trade history is retained (not deleted) with "[Pre-Reset]" labels. Two confirmations are required (double-confirmation pattern) to prevent accidental resets.

**Reset Dialog Specification (v2.3 amendment):**

**Step 1 — Initial Confirm:**
```
Title: "Reset your virtual portfolio?"
Body:
  "This will:
  • Return your balance to 500,000,000 VND
  • Close all your current holdings at the last available price
  • Cancel all pending orders" [ONLY shown if N > 0: "• Cancel [N] open limit order(s)"]
  "Your trade history will be kept, marked as [Pre-Reset]."

CTA 1: "Reset Portfolio" (destructive, red)
CTA 2: "Cancel" (dismiss, no action)
```

**Step 2 — Second Confirm (only shown if Step 1 CTA1 tapped):**
```
Title: "Are you sure?"
Body: "This action cannot be undone."
CTA 1: "Yes, Reset" (destructive, red)
CTA 2: "Go Back" (returns to Step 1 dialog)
```

**The "[N] open limit order(s)" line in Step 1 is:**
- Shown only if `COUNT(orders WHERE status IN ('PENDING', 'QUEUED_AFTER_HOURS')) > 0`
- Hidden (not rendered) if N = 0
- N must be the accurate count at the moment the dialog is opened (not cached)

**Input:** User confirms reset through both confirmation steps.

**Output (on confirm):**

| Action | Detail |
|--------|--------|
| Balance reset | `virtual_portfolio.total_cash = 500,000,000 VND` (exactly) |
| Holdings closed | All positions closed at last available snapshot price; SELL records created for each position with fill_note = 'PORTFOLIO_RESET' and the "[Pre-Reset]" label |
| Orders cancelled | ALL orders with `status IN ('PENDING', 'QUEUED_AFTER_HOURS')` → CANCELLED; `cancel_reason = PORTFOLIO_RESET`; reserves and soft-locks released |
| Trade history | All historical trade records retained; records from before the reset have "[Pre-Reset]" prefix in the title |
| AI coaching event | If the user's pre-reset trade history exhibits FOMO patterns (rapid buying at peaks) or panic selling patterns (rapid selling at lows), an AI coaching event is logged to trigger a coaching notification within 24 hours of reset |
| Portfolio reset record | New record in `portfolio_resets` table: `user_id`, `reset_at`, `balance_at_reset`, `positions_closed`, `orders_cancelled` |

**Precondition:**
- User is authenticated with an ACTIVE account
- User has a virtual portfolio

**Postcondition:**
- `virtual_portfolio.total_cash = 500,000,000`
- `virtual_portfolio.holdings = []`
- `virtual_portfolio.open_orders = []` (all cancelled)
- All historical trade records retained
- Portfolio reset record created

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-PT-05-01 | User has 3 open limit orders | Views reset dialog | Dialog shows "This will also cancel 3 open limit order(s)" |
| AC-PT-05-02 | User has 0 open orders | Views reset dialog | "Cancel X open order(s)" line is NOT shown |
| AC-PT-05-03 | User confirms reset | Double confirmation completed | Balance = 500,000,000 VND; all holdings closed; all orders cancelled |
| AC-PT-05-04 | User completed trades before reset | Views trade history after reset | Pre-reset trades appear with "[Pre-Reset]" prefix; new trades appear without prefix |
| AC-PT-05-05 | User taps "Cancel" at Step 1 | Cancel tapped | Nothing happens; dialog closes; portfolio unchanged |
| AC-PT-05-06 | User taps "Go Back" at Step 2 | Go Back tapped | Returns to Step 1 dialog; reset not executed |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message |
|-------|----------|---------------|---------------------|
| FC-PT-05-A | Price feed unavailable at reset time; cannot get live price for open positions | Positions closed at last cached snapshot price; trade history record shows: "Closed at reset — price from [snapshot_age] ago (feed unavailable)" | In trade history: "Closed at reset — estimated price (live data unavailable at time of reset)" |
| FC-PT-05-B | Order cancellation fails for one order during reset | Retry that specific cancellation up to 3 times; if all fail, flag for manual resolution; balance and other positions still reset; user notified | "Most of your portfolio has been reset. One order could not be cancelled automatically. Please contact support." |
| FC-PT-05-C | DB transaction fails during reset | Full rollback; portfolio state unchanged | "Something went wrong. Your portfolio was not reset. Please try again." |

**Edge Cases:**

| Case | Expected Behaviour |
|------|--------------------|
| SUSPENDED orders at reset time (not just PENDING) | SUSPENDED orders are NOT cancelled by portfolio reset (they are subject to market halt rules, not user action). Only PENDING and QUEUED_AFTER_HOURS orders are cancelled (BR-PT-13). SUSPENDED orders remain suspended and are re-evaluated when the halt lifts. |
| User resets multiple times | Each reset creates a new portfolio_resets record; trade history accumulates "[Pre-Reset]" prefixes for each cycle |
| Position in a delisted stock at reset time | Closed at last known price (before delisting); note: "Closed at reset — last recorded price before delisting" |

**Business Rules Referenced:** BR-17, BR-PT-13, BR-08

---

### FR-PT-06 — Virtual Money Label

**Priority:** P0 — Legal clarity requirement. Non-negotiable.

**Actor:** All users (LEARN_MODE or FULL_ACCESS) on any paper trading screen.

**Description:**
The "Tiền ảo / 가상 자금 / Virtual Funds" label is a legal clarity requirement mandating that users always understand they are interacting with a simulated portfolio, not real money. It must appear on every screen that displays, references, or allows interaction with the virtual portfolio. It cannot be hidden, toggled off, minimised, moved, or dismissed by the user.

**Which screens require the label:**
- Portfolio Dashboard (header)
- Stock Detail screen (when viewing in context of paper trading)
- Order Entry screen (BUY/SELL form)
- Order Confirmation screen
- Order status / fill notification detail
- Open Orders list
- Trade History

**Language by user locale (FR-LANG-01):**
- `vi` (Vietnamese): **"Tiền ảo"**
- `ko` (Korean): **"가상 자금"**
- `en` (English): **"Virtual Funds"**

**Visual specification:**
- Rendered as a non-interactive chip/badge
- Background: distinct from the primary background (e.g., a muted yellow or amber background chip)
- Contrast ratio: minimum 4.5:1 against label text colour (WCAG AA)
- Contrast ratio: chip background must contrast ≥ 3:1 against page background (WCAG AA for large UI elements)
- The chip must be tested on all supported themes (light, dark, Neo Lumen)
- Minimum chip size: 24px height; text size ≥ 12sp/pt
- The chip must not be partially clipped by scroll containers — it must always be fully visible in its designated position

**Implementation enforcement:**
- The component is a shared, non-configurable component: `<VirtualFundsLabel />` (or equivalent in the native framework)
- It accepts no `hidden`, `dismissible`, or `toggle` props — these props do not exist
- It is always in the rendering tree for the screens listed above; conditional rendering of this component is not permitted

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-PT-06-01 | LEARN_MODE user on Portfolio Dashboard | Views screen | "Tiền ảo" label visible in header; contrast ≥ 4.5:1 |
| AC-PT-06-02 | Korean-locale user | Views Portfolio Dashboard | "가상 자금" label shown |
| AC-PT-06-03 | User on Order Entry screen | Views form | "Virtual Funds" (or locale equivalent) visible |
| AC-PT-06-04 | User on Order Confirmation screen | Views confirmation | Virtual Funds label visible |
| AC-PT-06-05 | QA inspects rendered HTML/native tree | Any paper trading screen | VirtualFundsLabel component present in the tree; no `display:none` or `visibility:hidden` style on it |
| AC-PT-06-06 | User switches app language to English mid-session | Views Portfolio Dashboard | Label switches to "Virtual Funds" |

**Business Rules Referenced:** BR-18, BR-10

---

### FR-PT-07 — Market-Specific Order Type Specifications

**Priority:** P0 — Order validation rules that enforce VN market accuracy.

**Actor:** Paave Order Engine (enforces these rules on every order submission).

---

#### FR-PT-07.1 — HOSE (Ho Chi Minh Stock Exchange) Rules

| Attribute | Rule | Notes |
|-----------|------|-------|
| Board lot | 100 shares | Any order quantity must be a multiple of 100. Odd-lot orders (1–99) NOT supported in V1. Reject with E-PT-107 if quantity % 100 ≠ 0. |
| Reference price | Previous session closing price | Used for daily ceiling/floor calculations. Fetched from `hose_reference_prices` table at market open each day. |
| Daily price ceiling — standard | `reference_price × 1.07` | Round to nearest tick size after calculation. |
| Daily price ceiling — newly listed | `reference_price × 1.20` | Applies to stocks in their first 3 trading sessions. Determined by `ticker.is_newly_listed` flag AND `ticker.listing_date`. Server validates `current_session_date - listing_date ≤ 3`. |
| Daily price floor — standard | `reference_price × 0.93` | |
| Daily price floor — newly listed | `reference_price × 0.80` | Same ±20% exception as ceiling. |
| Tick size — price ≥ 50,000 VND | 100 VND | Limit prices must be multiples of 100. |
| Tick size — 10,000 ≤ price < 50,000 VND | 50 VND | |
| Tick size — price < 10,000 VND | 10 VND | |
| Supported order types | MARKET, LO (Limit Order), ATO (At-the-Opening), ATC (At-the-Closing) | |

> **V2.5 Extension:** STOP and STOP_LIMIT order types are now supported via FRD-20 (Order Placement V2) and SRD-20 (Order Placement System Requirements). STOP trigger mechanics are defined in SRD-20. This document (FRD-10) remains authoritative for LO, MP, ATO, ATC order types and all core invariants.

**HOSE Trading Session Windows (all times ICT = UTC+7):**

| Session | Time Window (ICT) | Accepted Order Types | Rejection Codes |
|---------|------------------|---------------------|-----------------|
| Pre-Opening | 09:00–09:15 | ATO only | MARKET → E-PT-103; LO → E-PT-103 |
| ATO Matching | 09:15 (instant) | System-initiated; no user orders | — |
| Continuous Session 1 | 09:15–11:30 | MARKET, LO | ATO → E-PT-119; ATC → E-PT-120 |
| Midday Break | 11:30–13:00 | MARKET, LO (queued for 13:00) | ATO/ATC → E-PT-103/E-PT-120 |
| Continuous Session 2 | 13:00–14:30 | MARKET, LO | |
| ATC Period | 14:30–14:45 | ATC only; existing LOs remain open (not cancelled) | New MARKET → E-PT-115; New LO → E-PT-115 |
| ATC Matching | 14:45 (instant) | System-initiated; no user orders | — |
| After Hours | 14:45+, all day weekends | None | All orders → E-PT-101 |

**ATO (At-the-Opening) Order Rules:**
- Accepted ONLY during Pre-Opening session (09:00–09:15 ICT)
- `limit_price` must be null or absent — ATO orders have no price (BR-PT-19; reject E-PT-117 if price provided)
- `quantity` must be a multiple of 100
- Fill price = computed opening price at 09:15 (system-determined via order matching)
- If no matching price can be computed (no counterparty liquidity): order → CANCELLED; `cancel_reason = ATO_ATC_NO_MATCH`; funds released; push notification with E-PT-400 message (v2.4 amendment)
- ATO no-match flow (FR-PT-07.1 AMENDMENT from FRD-gaps-v2.4.md):
  1. ATO fill evaluation runs at 09:15
  2. If opening price NOT computable: order → CANCELLED; `cancel_reason = ATO_ATC_NO_MATCH`
  3. Reserved funds (`order_reserves`) deleted; `available_balance` restored
  4. Holdings soft lock deleted if SELL order
  5. Push notification dispatched: "Your ATO order for [quantity] [TICKER] could not be filled — no matching price was available at the opening auction. Your funds have been released."
  6. Order appears in history: "Cancelled — no matching price at auction"

**ATC (At-the-Closing) Order Rules:**
- Accepted ONLY during ATC Period (14:30–14:45 ICT)
- `limit_price` must be null or absent (BR-PT-20; reject E-PT-118 if price provided)
- `quantity` must be a multiple of 100
- Existing LO orders that were open before 14:30 remain in evaluation during ATC Period (they are not cancelled at 14:30; they participate in closing price matching)
- Fill price = computed closing price at 14:45
- If no matching price: same ATO_ATC_NO_MATCH flow as ATO above; E-PT-400

**VN Market Calendar:**
- HOSE/HNX/UPCOM share the same market calendar
- Vietnamese national public holidays observed: Tết (variable; loaded from `vn_market_calendar` table), Reunification Day (30/4), Labor Day (1/5), National Day (2/9), plus exchange-specific closures
- The `vn_market_calendar` table is maintained by operations; it stores closed dates for the current and next calendar year; any date not in the table is assumed to be a trading day
- Orders submitted on a holiday receive E-PT-101 (market closed)

---

#### FR-PT-07.2 — HNX (Hanoi Stock Exchange) Rules

| Attribute | Rule | Notes |
|-----------|------|-------|
| Board lot | 100 shares | Same as HOSE; multiples of 100 required |
| Daily price ceiling | `reference_price × 1.10` | ±10% band (wider than HOSE) |
| Daily price floor | `reference_price × 0.90` | |
| Tick sizes | Same as HOSE (100/50/10 VND by price level) | |
| Supported order types | MARKET, LO, ATO, ATC | HNX MTL (Market-to-Limit) is NOT supported in V1 paper trading |
| Session windows | Same as HOSE (09:00–14:45 ICT; same break schedule) | |
| Newly listed exception | Same ±20% rule as HOSE for first 3 sessions | |
| Market calendar | Same as HOSE (shared VN market calendar) | |

---

#### FR-PT-07.3 — UPCOM (Unlisted Public Company Market) Rules

| Attribute | Rule | Notes |
|-----------|------|-------|
| Board lot | 100 shares | Multiples of 100 required |
| Daily price ceiling | `reference_price × 1.15` | ±15% band |
| Daily price floor | `reference_price × 0.85` | |
| Tick sizes | Same as HOSE/HNX (100/50/10 VND by price level) | |
| Supported order types | LO (Limit Order) ONLY | MARKET orders are NOT supported on UPCOM in V1 paper trading; reject with E-PT-121: "Market orders are not available on UPCOM. Please use a Limit order." |
| Session windows | 09:00–15:00 ICT continuous (Mon–Fri, VN holidays observed) | No ATO/ATC session on UPCOM in V1 simulation; no midday break |
| Market calendar | Same as HOSE (shared VN market calendar) | |

---

#### FR-PT-07.4 — KRX / KOSPI / KOSDAQ Rules (Reference-Only)

| Attribute | Rule | Notes |
|-----------|------|-------|
| Board lot | 1 share | Any positive integer quantity accepted; no lot size validation |
| Daily price ceiling | ±30% from reference price (simulated) | NOT validated against actual KRX rules; "Estimated price" shown on all records; E-PT-203/204 not triggered for KR |
| Supported order types | MARKET, LO | ATO/ATC not supported for KR in V1 |
| Session windows | NOT enforced in V1 | Orders accepted at any time; all are QUEUED_AFTER_HOURS (evaluated at best-available time); session enforcement is a V2+ enhancement |
| Price feed | Reference data (may be delayed up to 15 minutes) | Not real-time; all fills are estimated |
| "Estimated fill" label | Mandatory on ALL KR trade records | `fill_note = 'ESTIMATED_REFERENCE_FILL'`; shown as chip in trade history and order detail |
| "Reference" chip | Mandatory on all KR stock cards, market data displays | BR-46 |
| QUEUED_AFTER_HOURS TTL | 48 hours from submission timestamp | If not evaluated within 48h: CANCELLED; `cancel_reason = QUEUE_TTL_EXPIRED`; push notification sent (BR-PT-16) |
| Tick size validation | NOT enforced | Reference data insufficient for tick validation |
| Price band validation | NOT enforced | ±30% is simulated only; no E-PT-203/204 rejection for KR |

---

#### FR-PT-07.5 — Global / US Market Rules (Reference-Only)

| Attribute | Rule | Notes |
|-----------|------|-------|
| Board lot | 1 share | Any positive integer quantity |
| Daily price ceiling/floor | None enforced | US exchanges use circuit breakers, not daily bands; not simulated in V1 |
| Supported order types | MARKET, LO | No extended-hours trading in V1 |
| Session windows | NOT enforced in V1 | All orders accepted; all QUEUED_AFTER_HOURS |
| Price feed | Reference data (may be delayed) | All fills are estimated |
| "Estimated fill" label | Mandatory on ALL Global trade records | |
| "Reference" chip | Mandatory on all Global stock cards | BR-46 |
| QUEUED_AFTER_HOURS TTL | 48 hours from submission | Same as KR; CANCELLED after 48h with QUEUE_TTL_EXPIRED |
| Tick size / price band | NOT validated | |

---

### FR-PT-08 — Order Status State Machine

**Priority:** P0 — State integrity is critical; corrupted state = corrupted portfolio.

**Actor:** Paave Order Engine; Paave Expiry Cron.

**Description:**
Every order exists in exactly one of the following states at any point in time. Transitions are strictly defined. Terminal states are immutable — no further transitions are possible once a terminal state is reached. The backend must enforce this at the database level (e.g., DB constraint or application-layer guard).

#### State Definitions

| Status | Type | Description |
|--------|------|-------------|
| `PENDING` | Active | Order submitted and validated; awaiting fill (MARKET: next price snapshot) or trigger (LIMIT: price condition met). Visible in Open Orders. |
| `QUEUED_AFTER_HOURS` | Active | KR/Global market order submitted outside simulated session hours; will be re-evaluated when market opens. Visible in Open Orders with TTL countdown. Auto-cancels after 48h (BR-PT-16). |
| `SUSPENDED` | Active | Ticker is halted by exchange; order evaluation paused. For MARKET orders: resolves to PENDING or CANCELLED when halt lifts (or SESSION_CLOSE_WHILE_SUSPENDED). For LIMIT orders: survives session close; resumes next session. |
| `FILLED` | **Terminal** | Order fully executed. `fill_price`, `fill_timestamp`, `fill_quantity` are set and immutable. Portfolio updated. |
| `FILL_FAILED` | **Terminal** | MARKET order could not fill after all retries (balance gap, feed outage). Balance reserve released. |
| `EXPIRED` | **Terminal** | Limit order (or QUEUED_AFTER_HOURS) reached TTL without filling. Reserve/lock released. |
| `CANCELLED` | **Terminal** | Order cancelled by user, system (portfolio reset, account delete, ATO/ATC no-match), or TTL expiry. Reserve/lock released. `cancel_reason` field set. |

#### Valid State Transitions

```
              [Submission Validated]
                       │
                       ▼
                   PENDING ◄──────────────────────┐
                    │ │ │                          │
          ┌─────────┘ │ └──────────────┐           │
          │           │                │           │ (halt lifted within session)
          │   [KR/Global]    [ticker halted]        │
          │           │                ▼           │
          │           │           SUSPENDED ────────┘
          │           │                │
          │           │         [market closes
          │           │          while suspended]
          │           │                │
          │           ▼                ▼
          │   QUEUED_AFTER_HOURS   CANCELLED
          │           │           (cancel_reason:
          │    [market opens]      SESSION_CLOSE_WHILE_SUSPENDED)
          │           │
          │           └──────► PENDING ──────────────────────────┐
          │                                                        │
          │                                                        │
          ├──[fill condition met]──────────────► FILLED            │
          │                                                        │
          ├──[balance gap at fill /                                │
          │   feed outage after 3 retries]──► FILL_FAILED         │
          │                                                        │
          ├──[30-day TTL (GTC_30D) /                               │
          │   48h TTL (QUEUED_AFTER_HOURS)]── EXPIRED             │
          │                                                        │
          └──[user cancel / portfolio reset /                       │
              account delete / ATO_ATC_NO_MATCH]──► CANCELLED      │
                                                                    │
QUEUED_AFTER_HOURS ──────────────────────────────────────────────► ┘
```

#### All Valid Transitions (Explicit Table)

| From State | To State | Trigger | `cancel_reason` (if CANCELLED) |
|------------|----------|---------|--------------------------------|
| PENDING | FILLED | Fill condition met (price snapshot satisfies order) | — |
| PENDING | FILL_FAILED | Balance insufficient at fill time; OR price feed outage after 3 retries | — |
| PENDING | EXPIRED | 30-day GTC_30D TTL reached (limit order); expiry cron runs at 23:59 UTC daily | — |
| PENDING | CANCELLED | User manually cancels | `USER_CANCEL` |
| PENDING | CANCELLED | Portfolio reset (BR-PT-13) | `PORTFOLIO_RESET` |
| PENDING | CANCELLED | Account deleted | `ACCOUNT_DELETED` |
| PENDING | CANCELLED | ATO/ATC no matching price at auction (E-PT-400, v2.4) | `ATO_ATC_NO_MATCH` |
| PENDING | SUSPENDED | Ticker halted by exchange mid-order | — |
| QUEUED_AFTER_HOURS | PENDING | KR/Global market session opens; order re-evaluated | — |
| QUEUED_AFTER_HOURS | CANCELLED | 48-hour TTL expired (BR-PT-16) | `QUEUE_TTL_EXPIRED` |
| QUEUED_AFTER_HOURS | CANCELLED | User manually cancels | `USER_CANCEL` |
| SUSPENDED | PENDING | Ticker halt lifted; within same trading session (MARKET order) | — |
| SUSPENDED | PENDING | Ticker halt lifted; next session open (LIMIT order; survived session close) | — |
| SUSPENDED | CANCELLED | Market closes while halt is still active (MARKET order only) | `SESSION_CLOSE_WHILE_SUSPENDED` |
| FILLED | (none) | Terminal state — immutable | — |
| FILL_FAILED | (none) | Terminal state — immutable | — |
| EXPIRED | (none) | Terminal state — immutable | — |
| CANCELLED | (none) | Terminal state — immutable | — |

#### Illegal Transitions (Must Be Rejected)

Any transition not listed in the Valid Transitions table above is illegal and must be rejected with HTTP 409 Conflict. Examples:
- FILLED → anything (already terminal)
- CANCELLED → PENDING (already terminal)
- EXPIRED → PENDING (already terminal)
- PENDING → QUEUED_AFTER_HOURS (only the initial submission can land in QUEUED_AFTER_HOURS; a PENDING order cannot move back to QUEUED_AFTER_HOURS)

**Expiry Cron Specification:**
- Runs daily at 23:59 UTC
- Processes two categories:
  1. LIMIT orders (PENDING) where `created_at < NOW() - INTERVAL '30 days'` → EXPIRED; reserve/lock released
  2. QUEUED_AFTER_HOURS orders where `created_at < NOW() - INTERVAL '48 hours'` → CANCELLED; `cancel_reason = QUEUE_TTL_EXPIRED`; reserve released; push notification sent

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-PT-08-01 | PENDING MARKET order; fill condition met | Price snapshot at fill time ≤ BUY limit | Status → FILLED; fill_price recorded; portfolio updated |
| AC-PT-08-02 | PENDING MARKET order; balance insufficient at fill | Fill time check fails | Status → FILL_FAILED; reserve released; push sent |
| AC-PT-08-03 | PENDING LIMIT order; 30 days pass | Expiry cron runs at 23:59 UTC | Status → EXPIRED; reserve released; push sent |
| AC-PT-08-04 | QUEUED_AFTER_HOURS order; 48 hours pass | Expiry cron runs | Status → CANCELLED; `cancel_reason = QUEUE_TTL_EXPIRED`; push sent |
| AC-PT-08-05 | PENDING order; ticker halted | Exchange halt event received | Status → SUSPENDED |
| AC-PT-08-06 | SUSPENDED MARKET order; market closes before halt lifts | Market close event | Status → CANCELLED; `cancel_reason = SESSION_CLOSE_WHILE_SUSPENDED` |
| AC-PT-08-07 | SUSPENDED LIMIT order; market closes before halt lifts | Market close event | Order REMAINS SUSPENDED; resumes evaluation at next session open |
| AC-PT-08-08 | Any order in FILLED state | System attempts state change | HTTP 409; no state change |
| AC-PT-08-09 | ATO order; no matching price at opening auction | ATO matching event at 09:15 | Status → CANCELLED; `cancel_reason = ATO_ATC_NO_MATCH`; push with E-PT-400 message |

---

## 3. Business Rules

| Rule ID | Rule | Source | Violation Behaviour |
|---------|------|--------|---------------------|
| BR-PT-01 | All HOSE/HNX/UPCOM order quantities must be multiples of 100 (standard board lot). Quantities 1–99 (odd lots) are NOT supported in V1. | FRD-module-B-v2.3 | Reject E-PT-107; show nearest valid quantities |
| BR-PT-02 | HOSE daily price ceiling = reference_price × 1.07 (±7%); floor = reference_price × 0.93. Exception: stocks in first 3 trading sessions since listing date → ±20% (ceiling × 1.20, floor × 0.80). `is_newly_listed` flag on ticker metadata determines which band applies. | FRD-module-B-v2.3 | BUY limit above ceiling: E-PT-203. SELL limit below floor: E-PT-204. |
| BR-PT-03 | HNX daily ceiling = reference_price × 1.10; floor = ×0.90 (±10%). UPCOM daily ceiling = ×1.15; floor = ×0.85 (±15%). | FRD-module-B-v2.3 | Same rejection pattern as BR-PT-02 |
| BR-PT-04 | Tick size for VN limit prices: price ≥ 50,000 VND → 100 VND increments; 10,000–49,999 VND → 50 VND; < 10,000 VND → 10 VND. KR/Global: no tick size enforced. | FRD-module-B-v2.3 | Reject E-PT-205; suggest nearest valid price (round down and round up options) |
| BR-PT-05 | BUY limit price must be ≤ current_price at submission (would otherwise fill immediately, conflating limit with market). SELL limit price must be ≥ current_price at submission. | FRD-module-B-v2.3 | E-PT-201 (BUY too high); E-PT-202 (SELL too low) |
| BR-PT-06 | MARKET orders on HOSE/HNX are rejected during the Pre-Opening session (09:00–09:15 ICT). Only ATO orders are accepted in that window. LO orders are also rejected in Pre-Opening. | FRD-module-B-v2.3 | Reject E-PT-103; suggest ATO |
| BR-PT-07 | MARKET orders on HOSE/HNX are rejected during the ATC Period (14:30–14:45 ICT). New LO orders are also rejected during ATC Period. Only ATC orders are accepted in that window. | FRD-module-B-v2.3 | Reject E-PT-115 |
| BR-PT-08 | All orders on VN exchanges (HOSE/HNX/UPCOM) are rejected when market status = CLOSED (outside 09:00–14:45 ICT on VN trading days, or on VN public holidays). KR/Global orders → QUEUED_AFTER_HOURS. | FRD-module-B-v2.3 | VN: E-PT-101; KR/Global: E-PT-102 (QUEUED_AFTER_HOURS) |
| BR-PT-09 | Virtual cash for BUY limit orders is reserved immediately on order creation: `reserve_amount = quantity × limit_price × 1.001`. `available_balance = total_cash − SUM(all_open_buy_limit_reserves)`. | FRD-module-B-v2.3 | Reject new BUY limit if it would push total reserves > available_balance: E-PT-206 / E-PT-208 |
| BR-PT-10 | Holdings are soft-locked for open SELL limit orders. The same quantity of the same ticker cannot be placed in a second SELL order (limit or market) while the soft lock is active. | FRD-module-B-v2.3 | Reject E-PT-207 |
| BR-PT-11 | All KR (KOSPI/KOSDAQ) and Global paper trade records must display "Estimated fill" label. Price bands and session windows are NOT enforced for KR/Global reference markets. | FRD-module-B-v2.3 | UX label enforcement; no order rejection for KR/Global price/session issues |
| BR-PT-12 | Limit orders auto-expire after 30 calendar days from `created_at` (GTC_30D). GTD orders expire at market close (14:45 ICT) on the day of placement. Expiry cron runs at 23:59 UTC daily. On expiry: status = EXPIRED; reserved funds released; push notification sent. | FRD-module-B-v2.3 | Automated; no user action required |
| BR-PT-13 | Portfolio reset cancels ALL open PENDING and QUEUED_AFTER_HOURS orders (not SUSPENDED — those remain). Reset confirmation dialog must show the count of orders to be cancelled: "This will also cancel [N] open limit order(s)." Hidden if N = 0. | FRD-module-B-v2.3 (v2.3 amendment) | Cannot reset without double confirmation when N > 0 |
| BR-PT-14 | Maximum 10 open orders per user at any time, counted across all markets and order types. A PENDING or QUEUED_AFTER_HOURS order counts toward this limit. An 11th order is rejected. | FRD-module-B-v2.3 | Reject E-PT-116: "You have reached the maximum of 10 open orders. Cancel an existing order to place a new one." |
| BR-PT-15 | Client generates a UUID v4 `idempotency_key` per order tap. Server stores the key in Redis with TTL = 5 minutes. Duplicate submissions (same key within 5 minutes) return the original order response; no second order is created. | FRD-module-B-v2.3 | Transparent deduplication; HTTP 200 with original order |
| BR-PT-16 | QUEUED_AFTER_HOURS orders that are not evaluated within 48 hours of `created_at` are auto-cancelled by the Expiry Cron. `cancel_reason = QUEUE_TTL_EXPIRED`. Reserved funds released. Push notification sent. | FRD-gaps-v2.4.md (v2.4 amendment; resolves GAP-QA-06) | Automated; cron query: `WHERE status = 'QUEUED_AFTER_HOURS' AND created_at < NOW() - INTERVAL '48 hours'` |
| BR-PT-17 | Realized P&L for SELL orders: `(fill_price − avg_buy_price) × sell_quantity − simulated_fee`. Computed server-side at fill time; stored immutably in `virtual_orders.realized_pnl`. | FRD-module-B-v2.3 | Computed; no user-controllable input |
| BR-PT-18 | Simulated fee rate = 0.1% of trade value (applies to both BUY and SELL). Displayed on order confirmation screen as "Simulated fee: [amount] VND". Deducted from portfolio on fill. Educational purpose: mirrors real brokerage fee structure. | FRD-module-B-v2.3 | Fee must be shown on confirmation; no mechanism to waive it |
| BR-PT-19 | ATO orders must not include a `limit_price` field (null or absent). Server rejects ATO orders with a `limit_price` set. | FRD-module-B-v2.3 | Reject E-PT-117: "ATO orders do not accept a price — the system determines the opening price." |
| BR-PT-20 | ATC orders must not include a `limit_price` field. Same rule as BR-PT-19 in ATC session context. | FRD-module-B-v2.3 | Reject E-PT-118 |
| BR-08 | All P&L values use virtual prices from the real-time feed (VN) or reference feed (KR/Global). No brokerage account connection. No real-market data APIs are called for trade execution. | BRD.md | N/A (invariant) |
| BR-10 | No real orders are ever executed. All trades are simulated within Paave's virtual portfolio system. | BRD.md | N/A (invariant) |
| BR-14 | All monetary values are stored and displayed in VND. KR/Global equivalents shown for display only; underlying denomination is always VND. | BRD.md | N/A (invariant) |
| BR-17 | Starting balance = VND 500,000,000 (exactly). Portfolio reset restores exactly this amount — not the user's original balance, not an approximate amount. | BRD.md | Reset must write exactly 500000000 to `total_cash`; no rounding |
| BR-18 | "Tiền ảo / 가상 자금 / Virtual Funds" label is mandatory and non-dismissible on all paper trading screens. It is a legal clarity requirement, not a design element. | BRD.md | Component renders unconditionally; no props to disable it |
| BR-46 | KR/Global markets are reference-only. Every KR/Global stock card, market data display, and trade record must display a "Reference" chip. All paper trades on KR/Global markets are labeled "Estimated price". | BRD-addendum-v2.3 | "Reference" chip absent → UI regression; KR/Global trade missing "Estimated fill" label → content policy violation |

---

## 4. Error Code Reference — Paper Trading Module

| Code | HTTP Status | Trigger | User-Facing Message |
|------|-------------|---------|---------------------|
| E-PT-101 | 400 | VN market CLOSED at submission | "The VN market is currently closed. Market hours are 09:00–14:45 ICT (Monday–Friday, excluding VN public holidays)." |
| E-PT-102 | 201 | KR/Global order accepted as QUEUED_AFTER_HOURS | "Order queued — will attempt to fill when the market opens. Auto-cancels after 48 hours if unfilled." |
| E-PT-103 | 400 | MARKET or LO order during HOSE/HNX Pre-Opening (09:00–09:15) | "Market orders are not accepted during the pre-opening session (09:00–09:15 ICT). Use an ATO order to participate in the opening price match." |
| E-PT-104 | 400 | Ticker is SUSPENDED or HALTED at submission | "This stock is currently suspended by the exchange and cannot be traded." |
| E-PT-105 | 400 | Ticker is DELISTED | "This stock is no longer listed on [EXCHANGE] and cannot be traded." |
| E-PT-106 | N/A (async) | MARKET order FILL_FAILED — insufficient balance at fill time | Push: "Your BUY order for [qty] [TICKER] could not fill — the price moved and your balance was insufficient. Your funds have been returned." |
| E-PT-107 | 400 | Lot size violation (not multiple of 100 for VN) | "Order quantity must be in multiples of 100 shares on [EXCHANGE]. Nearest valid quantities: [floor_qty] or [ceil_qty] shares." |
| E-PT-108 | 400 | Insufficient balance at MARKET BUY submission | "Insufficient virtual funds. Available: [available] VND. Estimated cost: [cost] VND." |
| E-PT-109 | 400 | Insufficient holdings at MARKET SELL submission | "Insufficient shares. You hold [available_qty] [TICKER]; requested: [requested_qty]." |
| E-PT-110 | 400 | LEARN_MODE short sell attempt | "You don't own any [TICKER] shares to sell. Short selling is not available in paper trading." |
| E-PT-111 | N/A (async) | Price feed DEGRADED after 3 retries → FILL_FAILED | Push: "Your order for [TICKER] could not fill — live price data was unavailable. Your funds have been returned." |
| E-PT-112 | N/A (async) | Account suspended mid-order | Push: "Your order was cancelled because your account was suspended. Please contact support@paave.app." |
| E-PT-113 | N/A (async) | SESSION_CLOSE_WHILE_SUSPENDED (MARKET order) | Push: "Trading for [TICKER] was halted and the market closed before trading resumed. Your order has been cancelled." |
| E-PT-114 | 400 | Holdings changed in parallel session before SELL submission | "Your holdings were updated by a recent order. Please refresh your portfolio and try again." |
| E-PT-115 | 400 | New MARKET or LO submitted during ATC Period (14:30–14:45) | "New market and limit orders are not accepted during the closing auction (14:30–14:45 ICT). Place an ATC order instead." |
| E-PT-116 | 400 | Max 10 open orders reached (BR-PT-14) | "You have reached the maximum of 10 open orders. Cancel an existing order to place a new one." |
| E-PT-117 | 400 | ATO order submitted with a limit_price | "ATO orders do not accept a limit price — the system determines the opening price automatically." |
| E-PT-118 | 400 | ATC order submitted with a limit_price | "ATC orders do not accept a limit price — the system determines the closing price automatically." |
| E-PT-119 | 400 | ATO order submitted outside Pre-Opening session | "ATO orders are only accepted during the pre-opening session (09:00–09:15 ICT)." |
| E-PT-120 | 400 | ATC order submitted outside ATC Period | "ATC orders are only accepted during the closing auction period (14:30–14:45 ICT)." |
| E-PT-121 | 400 | MARKET order on UPCOM | "Market orders are not available on UPCOM. Please use a Limit order." |
| E-PT-201 | 400 | BUY limit_price > current_price | "Your buy limit price ([price] VND) is above the current price ([current] VND). Use a Market order, or set a price below [current] VND." |
| E-PT-202 | 400 | SELL limit_price < current_price | "Your sell limit price ([price] VND) is below the current price ([current] VND). Use a Market order, or set a price above [current] VND." |
| E-PT-203 | 400 | Limit price exceeds exchange daily ceiling | "Limit price exceeds today's ceiling of [ceiling] VND for [TICKER] on [EXCHANGE]." |
| E-PT-204 | 400 | Limit price below exchange daily floor | "Limit price is below today's floor of [floor] VND for [TICKER] on [EXCHANGE]." |
| E-PT-205 | 400 | Tick size violation | "Price must be in [tick_size] VND increments. Did you mean [round_down] VND or [round_up] VND?" |
| E-PT-206 | 400 | Insufficient balance for BUY limit reserve | "Insufficient balance to reserve. Available: [available] VND. Required: [required] VND. [X VND] already reserved for other orders." |
| E-PT-207 | 400 | Double-locking same shares (second SELL limit on already soft-locked holdings) | "You already have an open sell order for [TICKER]. Cancel it before placing another sell on the same shares." |
| E-PT-208 | 400 | Aggregate reserves exceed available balance | "Your open buy limit orders have already reserved [reserved] VND. This order would require an additional [required] VND, exceeding your available balance." |
| E-PT-209 | N/A (async) | Stock delisted while limit order open → auto-cancel | Push: "Your limit order for [TICKER] was cancelled — this stock has been delisted. Your reserved funds have been returned." |
| E-PT-210 | N/A (async, informational) | Stock suspended while limit order open → SUSPENDED status | Push: "Trading for [TICKER] is temporarily suspended. Your limit order is on hold and will resume when trading resumes." |
| E-PT-400 | N/A (async) | ATO/ATC order cancelled — no matching price at auction (v2.4 amendment) | Push: "Your [ATO/ATC] order for [qty] [TICKER] could not be filled — no matching price was available at the [opening/closing] auction. Your funds have been released." |

---

## 5. Edge Case Matrix: Cross-Feature Interactions

| Scenario | FR Affected | Expected Behaviour |
|----------|------------|-------------------|
| User has SELL limit order (soft lock) AND tries to place MARKET SELL same ticker | FR-PT-02, FR-PT-03 | Available sell quantity = `holdings.quantity − soft_locked_quantity`. If net < requested MARKET SELL qty → E-PT-109 |
| User places BUY limit; gets fill; then tries to place SELL limit for same ticker | FR-PT-03 | New avg_buy_price calculated after BUY fill; SELL limit accepted if price ≥ current_price and holdings ≥ qty |
| Portfolio reset attempted while price feed is down | FR-PT-05 | Positions closed at last cached snapshot price; note added in history; balance reset proceeds |
| QUEUED_AFTER_HOURS order for KR stock; user also places a PENDING limit for same ticker | FR-PT-02, FR-PT-03 | Both count toward the 10-order limit (BR-PT-14); no duplicate ticker restriction |
| ATC order placed at 14:44 (1 minute before ATC matching) | FR-PT-07.1 | Accepted (within 14:30–14:45 window); participates in closing auction at 14:45 |
| LEARN_MODE user places ATO order | FR-PT-02, FR-PT-09 | ATO is an order type, not a FULL_ACCESS-only feature; LEARN_MODE users can place ATO orders |
| User places 10 orders; 3 expire; user places 3 new orders | FR-PT-08, BR-PT-14 | EXPIRED orders are terminal and no longer count toward the 10-order limit; user can place 3 new orders |
| Delisted holding in portfolio; user attempts to SELL it | FR-PT-02 | E-PT-105: "This stock is no longer listed on [EXCHANGE] and cannot be traded." Position remains in holdings at frozen price until reset |

---

## 6. UI/UX Notes

### Order Entry Screen
- Ticker/exchange pre-filled when accessed from stock detail screen
- Side toggle: BUY (green) / SELL (red) — large tap targets
- Quantity input: numeric-only keyboard; autocomplete suggestions: 100, 200, 500, 1000 (for VN); 1, 5, 10, 50 (for KR/Global)
- Lot size helper shown below quantity: "Must be multiples of 100" for VN exchanges
- Order type selector: MARKET (default) / LIMIT; for HOSE during Pre-Opening: ATO shown as primary option; for HOSE during ATC Period: ATC shown as primary option
- LIMIT: limit price field appears; tick size grid shown below: "Enter price in multiples of [tick_size] VND"
- "Tiền ảo" label in header (always; FR-PT-06)
- Available balance shown: "Available: X,XXX,XXX VND"
- For SELL: "You hold: [holdings.quantity] shares"
- CTA: "Review Order" → navigates to Confirmation screen (no direct submit from entry)

### Order Confirmation Screen
- Full summary: ticker, exchange, side, quantity, order type
- Estimated price: "~X,XXX VND (price may change before fill)"
- Simulated fee: "Simulated fee: X,XXX VND (0.1% of trade value)" — always visible
- Total estimated cost/proceeds: clearly labelled
- For KR/Global: "Estimated — reference data only" banner
- "Tiền ảo" label visible
- CTA: "Confirm Order" (primary) and "Edit" (secondary, returns to entry)
- Loading state after "Confirm Order": spinner with "Placing your order..."

### Open Orders Screen (within Portfolio Dashboard)
- Each row shows: ticker + exchange chip + order type chip + side + quantity + limit_price (if LIMIT) + status badge
- Status badges: "Filling..." (PENDING, MARKET), "Open" (PENDING, LIMIT), "After Hours Queue" (QUEUED_AFTER_HOURS), "Suspended" (SUSPENDED)
- QUEUED_AFTER_HOURS: TTL countdown — "Auto-cancels in [HH:MM]"
- Swipe-left to cancel; confirmation modal before cancellation

---

*End of FRD-10: Paper Trading Engine — PRIMARY PILLAR*
*Version 2.4 — Authoritative. Supersedes FRD.md v2.2 §Paper Trading, FRD-module-B-v2.3.md (complete), BRD-addendum-v2.3.md §Paper Trading Business Rules, and FRD-gaps-v2.4.md §FR-PT-07.1 AMENDMENT and §BR-PT-07 AMENDMENT.*

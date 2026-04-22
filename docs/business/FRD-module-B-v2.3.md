# FRD — Module B: Paper Trading Engine (v2.3 Revision)
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Document version:** 2.3
**Date:** 2026-04-20
**Author:** Business Analysis Team
**Status:** Pending Product Owner Review
**Supersedes:** FRD Module B §FR-PT-01..FR-PT-06 (v2.2, 2026-04-20)
**Linked SRD section:** SRD-order-engine-v2.3.md

> **Scope of this revision:**
> - Complete rewrite of FR-PT-02 and FR-PT-03 with all failed cases, edge cases, and market-specific rules.
> - New FR-PT-07: Market-Specific Order Type Specifications (VN / KR / Global).
> - New FR-PT-08: Order State Machine.
> - New business rules BR-PT-01 through BR-PT-20.
> - All other FR-PT-01, FR-PT-04, FR-PT-05, FR-PT-06 retain v2.2 text and are reproduced below for completeness.

---

## Module B: Paper Trading Engine — PRIMARY PILLAR

> **Purpose:** The product. All users get a virtual portfolio on account creation. Paper trading is the primary interaction loop. "Tiền ảo / 가상 자금 / Virtual Funds" label mandatory on all paper trading screens (FR-PT-06). Real-money execution never happens inside Paave.

---

### FR-PT-01 — Virtual Portfolio Creation *(unchanged from v2.2)*

- **Actor:** New User (on registration completion)
- **Description:** Virtual portfolio auto-created on account activation. Starting balance: VND 500,000,000. "Tiền ảo / 가상 자금 / Virtual Funds" label always visible in portfolio header.
- **Key Rules:**
  - Auto-created; user does not configure starting balance.
  - Balance displayed in user's locale currency equivalent (KRW/USD) if KR/Global user, but underlying denomination is VND.
  - Label is a permanent fixture — not dismissible.
- **Acceptance Criteria:**
  - Given new user completes registration → virtual portfolio exists with 500M VND balance before first login to Home.
  - Given KR user → balance shown as KRW equivalent with "Virtual Funds" label.
- **Edge Cases:**
  - Portfolio creation fails during registration → retry up to 3 times; if all fail, account created and portfolio creation queued.
- **Priority:** P0

---

### FR-PT-02 — Place Market Order (Paper) *(v2.3 full revision)*

- **Actor:** Registered User (LEARN_MODE or FULL_ACCESS)
- **Description:** User submits a simulated market order (BUY or SELL) for any supported ticker. The order fills at the next available real-time price snapshot after submission. Market orders are subject to market-session state, lot-size rules, price-band constraints, and balance availability at the time of fill — not just at the time of submission.

- **Input:**
  - `ticker`: string — must exist in active price feed for the specified exchange (see FR-PT-07 for per-market rules).
  - `exchange`: enum — one of `HOSE`, `HNX`, `UPCOM`, `KOSPI`, `KOSDAQ`, `GLOBAL`.
  - `side`: enum — `BUY` or `SELL`.
  - `quantity`: integer — must satisfy the board-lot rules for the exchange (see FR-PT-07).
  - `order_type`: must be `MARKET`.
  - `idempotency_key`: UUID — client-generated per tap; prevents duplicate submission on double-tap.

- **Output:**
  - Order record with `status = PENDING` returned immediately.
  - Async fill within ≤15 seconds for VN primary market; best-available for KR/Global reference markets.
  - On fill: portfolio holdings updated, virtual balance updated, XP event fired, post-trade AI card triggered.

- **Precondition:**
  - User has an active virtual portfolio.
  - For SELL: user holds ≥ requested quantity of the ticker.
  - For BUY: virtual cash balance ≥ estimated cost (quantity × current_price × 1.001 fee simulation). Note: this is checked again at fill time — see failed case FC-PT-05.

- **Postcondition (Happy Path):**
  - Order `status = FILLED`.
  - Holdings updated (BUY: quantity added, avg_buy_price recalculated; SELL: quantity reduced, realized PnL stored).
  - Virtual balance debited (BUY) or credited (SELL).

---

#### Acceptance Criteria (Happy Path)

| # | Given | When | Then |
|---|-------|------|------|
| AC-1 | User with 450M VND balance, buying 100 VIC shares at ~50,000 VND | BUY MARKET order submitted | Fills within 15s at next snapshot price; balance reduced by (100 × fill_price × 1.001); holdings show 100 VIC |
| AC-2 | User holds 200 VIC shares, selling 100 | SELL MARKET order submitted | Fills within 15s; holdings reduced to 100 VIC; balance credited |
| AC-3 | User places order with idempotency_key = "abc-123" | Same key submitted a second time within 5s | Second request returns the original order response (201 with same order_id); no second order created |

---

#### Failed Cases & Edge Cases

| ID | Scenario | System Action | User Message | Error Code |
|----|----------|---------------|--------------|------------|
| FC-PT-01 | Market is CLOSED at submission time (outside trading hours per exchange calendar) | For VN: reject immediately. For KR/Global reference: accept and queue with `status = QUEUED_AFTER_HOURS`; fills at next session open using best-available price at that time. | VN: "The VN market is currently closed. Market hours are 9:00–14:45 ICT (Mon–Fri). Try a limit order instead." KR/Global: "Order queued — will fill when market opens." | E-PT-101 (VN), E-PT-102 (KR/Global queue) |
| FC-PT-02 | Market is in PRE-OPENING session (HOSE 9:00–9:15) | Reject MARKET order; suggest ATO order type instead. ATO is the only order type accepted in pre-opening. | "Market orders are not accepted during the pre-opening session (9:00–9:15). Use an ATO order to participate in the opening match." | E-PT-103 |
| FC-PT-03 | Ticker is SUSPENDED or HALTED by exchange | Reject immediately. If halted after submission but before fill: order transitions to `SUSPENDED` status. | Submission: "This stock is currently suspended by the exchange. No orders can be placed." Post-submission halt: push notification "Your VIC order could not fill — trading is suspended. Order cancelled." | E-PT-104 |
| FC-PT-04 | Ticker is DELISTED | Reject immediately. | "This stock is no longer listed on the exchange. Order rejected." | E-PT-105 |
| FC-PT-05 | Price moves between submission and fill → virtual balance now insufficient at fill time | Order NOT filled. Status = `FILL_FAILED`. Reserved funds released. | Push: "Your BUY order for VIC could not fill — insufficient balance at fill time (price moved to [fill_price]). Please try again." | E-PT-106 |
| FC-PT-06 | Lot size violation — VN exchanges (HOSE/HNX/UPCOM): quantity is not a multiple of 100 (standard board lot) | Reject at submission. Show the nearest valid quantities. | "Quantity must be in multiples of 100 shares for HOSE/HNX trading. Nearest valid quantities: [quantity rounded down] or [quantity rounded up]." | E-PT-107 |
| FC-PT-07 | Insufficient virtual balance at submission time (BUY) | Reject at submission. | "Insufficient virtual funds. Available: [balance VND]. Estimated cost: [cost VND]." | E-PT-108 (same as E-6001) |
| FC-PT-08 | Insufficient holdings at submission time (SELL) | Reject at submission. | "Insufficient virtual shares. You hold [available] [TICKER]; requested sell quantity: [quantity]." | E-PT-109 (same as E-6002) |
| FC-PT-09 | LEARN_MODE user attempts to SELL a ticker they do not hold (short selling) | Reject at submission. LEARN_MODE users cannot short sell (no holdings = no sell allowed). | "You don't own any [TICKER] shares to sell. Short selling is not available in paper trading." | E-PT-110 |
| FC-PT-10 | Price feed is DEGRADED at fill time (VN feed outage) | Order remains `PENDING`. Retry fill at next available snapshot within 60 seconds. After 3 failed attempts (180 seconds): order transitions to `FILL_FAILED`; reserved balance released. | "VN market data is temporarily unavailable. Your order is waiting to fill. We'll notify you when it fills or if it expires." After failure: "Order expired — unable to fill: live price data unavailable." | E-PT-111 |
| FC-PT-11 | Duplicate submission (same idempotency_key received within 5 minutes) | Return the original order response. No second order created. | No user-facing message (transparent deduplication). | — |
| FC-PT-12 | User account suspended mid-order | Any `PENDING` order is cancelled. Reserved balance is released. | Push: "Your order was cancelled because your account was suspended. Contact support@paave.app." | E-PT-112 |
| FC-PT-13 | Fill price equals or exceeds VN price ceiling (HOSE ±7%, HNX ±10%) at time of fill | For BUY: fill at the ceiling price (this is the highest a stock can trade at — the order fills at ceiling). | No error — ceiling price is a valid fill price. Include label "Filled at ceiling price" in trade history. | — |
| FC-PT-14 | Stock enters intraday circuit breaker (VN: trading halted after extreme move) | If halted after submission: order transitions to `SUSPENDED`. Resumes when halt is lifted within trading session; if market closes before halt lifts, order is cancelled with reason `SESSION_CLOSE_WHILE_SUSPENDED`. | Push: "Trading for [TICKER] was halted mid-session. Your order was cancelled." | E-PT-113 |
| FC-PT-15 | User places a SELL order but holding quantity changes between page load and submission (another fill happened in a parallel session) | Server-side validation at submission finds insufficient quantity → reject. | "Your holdings were updated by another recent order. Please refresh your portfolio and try again." | E-PT-114 |

---

### FR-PT-03 — Place Limit Order (Paper) *(v2.3 full revision)*

- **Actor:** Registered User
- **Description:** User specifies a limit price. BUY limit fills when market price ≤ limit price; SELL limit fills when market price ≥ limit price. Order queued as `PENDING`. Auto-expires after 30 calendar days if unfilled. Virtual cash for BUY limits is reserved immediately on order creation.

- **Input:**
  - `ticker`: string — must exist in active price feed.
  - `exchange`: enum — `HOSE`, `HNX`, `UPCOM`, `KOSPI`, `KOSDAQ`, `GLOBAL`.
  - `side`: `BUY` or `SELL`.
  - `quantity`: integer — must satisfy board-lot rules per FR-PT-07.
  - `order_type`: `LIMIT`.
  - `limit_price`: decimal — must satisfy price band rules per FR-PT-07.
  - `order_validity`: enum — `GTD` (Good Till Day, default for VN paper) or `GTC_30D` (Good Till Cancel, max 30 days). Default: `GTC_30D`.
  - `idempotency_key`: UUID.

- **Limit Price Validation Rules (applied at submission):**
  - BUY limit price must be ≤ current_price and ≥ floor_price for the exchange. Rationale: a BUY limit above current price would fill immediately as a market order — user should use MARKET order type instead.
  - SELL limit price must be ≥ current_price and ≤ ceiling_price for the exchange. Rationale: a SELL limit below current price would fill immediately — use MARKET order type instead.
  - `limit_price` must conform to the exchange's tick size (VN: 100 VND increments for stocks over 50,000 VND; 50 VND increments for stocks 10,000–49,999 VND; 10 VND increments for stocks under 10,000 VND).
  - `limit_price` must not exceed the daily price ceiling or fall below the daily price floor (see FR-PT-07).

- **Reserve Mechanics:**
  - BUY limit: `reserve_amount = quantity × limit_price × 1.001` is deducted from available_balance immediately. Available for other orders is `virtual_balance − sum_of_all_open_buy_limit_reserves`.
  - SELL limit: no reservation (holdings are "soft-locked" — user cannot SELL the same quantity again via another order while this limit is pending).

- **Postcondition (Happy Path):**
  - Order `status = FILLED`.
  - Holdings and balance updated.
  - If BUY fills at a price lower than limit_price: the difference is refunded to available balance (fill at best available price ≤ limit).

---

#### Acceptance Criteria (Happy Path)

| # | Given | When | Then |
|---|-------|------|------|
| AC-1 | User with 200M VND balance places BUY LIMIT for 100 VIC at 45,000 VND (current price 48,000) | Order submitted | `status = PENDING`; 4,504,500 VND (100×45,000×1.001) reserved; available balance shows 200M − 4.5M |
| AC-2 | Price drops to 44,500 VND | System detects price ≤ 45,000 | Fills at 44,500 VND (best available ≤ limit); 50 VND × 100 shares = 5,000 VND refunded to balance |
| AC-3 | 30 calendar days pass unfilled | Auto-expiry cron runs | `status = EXPIRED`; reserved funds released; push: "Your BUY limit order for VIC expired unfilled." |

---

#### Failed Cases & Edge Cases

| ID | Scenario | System Action | User Message | Error Code |
|----|----------|---------------|--------------|------------|
| FC-LIM-01 | BUY limit price > current_price at submission | Reject. This would fill immediately → use MARKET order. | "Your buy limit price (X) is above the current price (Y). This would fill immediately — use a Market order instead, or set a price below the current price." | E-PT-201 |
| FC-LIM-02 | SELL limit price < current_price at submission | Reject. This would fill immediately → use MARKET order. | "Your sell limit price (X) is below the current price (Y). This would fill immediately — use a Market order instead, or set a price above the current price." | E-PT-202 |
| FC-LIM-03 | Limit price exceeds HOSE ceiling (reference_price × 1.07) at submission | Reject. | "Limit price exceeds today's price ceiling of [ceiling_price] for [TICKER] on HOSE. Please set a price at or below the ceiling." | E-PT-203 |
| FC-LIM-04 | Limit price falls below HOSE floor (reference_price × 0.93) at submission | Reject. | "Limit price is below today's price floor of [floor_price] for [TICKER] on HOSE. Please set a price at or above the floor." | E-PT-204 |
| FC-LIM-05 | Lot size violation at submission (not a multiple of 100 for VN exchanges) | Reject. | Same as FC-PT-06. | E-PT-107 |
| FC-LIM-06 | Tick size violation (limit_price not on valid tick grid) | Reject. System suggests the nearest valid price. | "Price must be in increments of [tick_size] VND. Did you mean [rounded_price]?" | E-PT-205 |
| FC-LIM-07 | Insufficient available balance for BUY limit reserve | Reject. Show current available vs. required reserve. | "Insufficient available balance to reserve for this order. Available: [available VND]; Required: [reserve VND]. Note: [X VND] is already reserved for other open orders." | E-PT-206 |
| FC-LIM-08 | User already has an open SELL limit for same ticker at same quantity (double-locking same shares) | Reject. Holdings cannot be soft-locked twice. | "You already have an open sell order for [TICKER]. Cancel it before placing another sell order on the same shares." | E-PT-207 |
| FC-LIM-09 | User places multiple BUY limits on same ticker with aggregate reserve exceeding available balance | Allow individual orders up to balance exhaustion; reject the order that would push total reserve over balance. | "Your open buy limit orders already use [X VND] of your balance. Adding this order would exceed your available balance." | E-PT-208 |
| FC-LIM-10 | Stock is DELISTED while limit order is open | Order auto-cancelled. Reserved funds released. | Push: "Your [TICKER] order was cancelled — this stock has been delisted. Your reserved balance has been returned." | E-PT-209 |
| FC-LIM-11 | Stock is SUSPENDED by exchange while limit order is open | Order transitions to `SUSPENDED`. Resumes evaluation when suspension is lifted. If market closes before lift: status = `SUSPENDED`; order remains open and evaluates from next session. | Push: "Trading for [TICKER] is temporarily suspended. Your order is on hold and will resume when trading resumes." | E-PT-210 |
| FC-LIM-12 | Portfolio RESET while limit order is open | All open limit orders are auto-cancelled. Reserved funds included in balance reset. | Confirmation dialog for reset must state: "This will also cancel [N] open limit order(s)." On confirm: cancellation logged with reason = `PORTFOLIO_RESET`. | — |
| FC-LIM-13 | Account DELETED while limit order is open | All open orders cancelled. Data retained per audit requirements; user-identifiable data anonymized per FR-2.23. | No user message (account deleted). Compliance log updated. | — |
| FC-LIM-14 | Order on KR/Global (reference market): limit price cannot be validated against real-time price bands | Accept with a visible "Estimated price" label. No price-band validation (reference data is not real-time). Notify user of estimation. | "KR market data is reference-only and may be delayed. Your limit price will be evaluated against best-available estimated prices. Fill is not guaranteed at the exact limit price." | — |
| FC-LIM-15 | Market price passes through the limit (crosses from above to below for BUY, or below to above for SELL) and then snaps back before a snapshot is taken | The order DOES NOT fill. Limit order fills only when a price snapshot confirms the price is at or through the limit. Transient crosses that are not captured in a 15-second snapshot do not trigger a fill. | No message (expected behavior — documented in order confirmation screen tooltip). | — |
| FC-LIM-16 | BUY limit order would fill, but available balance (after deducting other fills that happened since reservation) is now < fill cost | Order NOT filled at this snapshot. Re-evaluated at next snapshot. If balance never recovers within 30 days: order expires normally. | No message (silent re-evaluation; user sees order as PENDING). | — |
| FC-LIM-17 | SELL limit order on a KR/Global ticker in reference market — price is "estimated"; fill price may differ from stated limit | Fill is executed at best-available estimated price. Actual fill may differ from limit_price. "Estimated fill" label shown in trade history. | In-app label on the order: "Estimated fill — actual price may differ from your limit." | — |
| FC-LIM-18 | Duplicate submission (same idempotency_key) | Return original order response. No second order. | Transparent deduplication. | — |
| FC-LIM-19 | Order created during Lunch break (11:30–13:00 ICT for VN) | Accept and queue. Evaluation begins when continuous trading resumes at 13:00. | "Order placed. Evaluation starts at 13:00 ICT when the afternoon session opens." | — |

---

### FR-PT-04 — Portfolio Dashboard (Paper) *(unchanged from v2.2)*

*(See FRD v2.2 — FR-PT-04. No changes in v2.3.)*

---

### FR-PT-05 — Portfolio Reset *(v2.3 addition)*

*(Retain v2.2 text; add the following to Key Rules and Edge Cases:)*

- **Additional Key Rule:** Reset dialog MUST state: "This will also cancel [N] open limit orders." If N = 0, this line is hidden.
- **Additional Edge Case:** If market is open at reset time, open positions are "closed" at last available snapshot price, which may differ from the current live price if the snapshot is stale. Trade history shows fill_price = snapshot_price with a note "Closed at reset."

---

### FR-PT-06 — Virtual Money Label *(unchanged from v2.2)*

*(See FRD v2.2 — FR-PT-06. No changes in v2.3.)*

---

### FR-PT-07 — Market-Specific Order Type Specifications *(new in v2.3)*

> **Purpose:** Define the precise order types, lot sizes, price bands, tick sizes, and session windows for each supported market in paper trading. These constraints are simulated faithfully for VN (primary market) and approximated for KR/Global (reference-only). This FR is read by developers implementing the Paper Trading Engine and by QA writing test cases.

---

#### FR-PT-07.1 — HOSE (Ho Chi Minh Stock Exchange) Rules

| Attribute | Rule | Notes |
|-----------|------|-------|
| **Standard board lot** | 100 shares (multiples of 100 required for standard orders) | Odd-lot orders (1–99 shares) are NOT supported in V1 paper trading. If quantity is not a multiple of 100: reject with E-PT-107. |
| **Reference price** | Previous session closing price | Used to calculate daily price ceiling and floor. |
| **Daily price ceiling** | reference_price × 1.07 (7% above reference) | Exception: newly listed stocks in their first 3 trading sessions → ±20%. |
| **Daily price floor** | reference_price × 0.93 (7% below reference) | Same exception for newly listed stocks. |
| **Tick size — price ≥ 50,000 VND** | 100 VND | Limit prices must be multiples of 100 VND. |
| **Tick size — 10,000 ≤ price < 50,000 VND** | 50 VND | |
| **Tick size — price < 10,000 VND** | 10 VND | |
| **Supported order types (V1 paper trading)** | MARKET, LO (Limit Order), ATO (At-the-Opening), ATC (At-the-Closing) | See session windows below. |

**HOSE Trading Session Windows (ICT = UTC+7):**

| Session | Time Window | Accepted Order Types | Notes |
|---------|-------------|---------------------|-------|
| Pre-Opening | 09:00–09:15 ICT | ATO only | ATO = "At-the-Opening" — no price specified; filled at computed opening price at 09:15. MARKET and LO orders during this window: rejected with E-PT-103. |
| ATO Matching | 09:15 ICT | — | System matches ATO orders at the computed opening price. |
| Continuous Session 1 | 09:15–11:30 ICT | MARKET, LO | Standard trading window. |
| Midday Break | 11:30–13:00 ICT | MARKET, LO (queued) | Orders submitted during break are accepted and queued; evaluation begins at 13:00 when Session 2 opens. ATO/ATC not accepted. |
| Continuous Session 2 | 13:00–14:30 ICT | MARKET, LO | Standard trading window. |
| ATC Period | 14:30–14:45 ICT | ATC only; LO that arrived before 14:30 remains open | ATC = "At-the-Closing" — no price specified; filled at computed closing price at 14:45. New MARKET and new LO orders during ATC period: rejected with E-PT-115 "Market orders not accepted during ATC session." |
| ATC Matching | 14:45 ICT | — | System matches ATC orders and remaining LO orders at closing price. |
| After Hours | 14:45+ ICT | None (reject) | Market closed. Return E-PT-101. |

**HOSE-Specific Notes for Paper Trading:**
- ATO orders: quantity must be in multiples of 100; no limit_price field (null or absent).
- ATC orders: quantity must be in multiples of 100; no limit_price field (null or absent).
- ATO/ATC fill price = computed matching price; may be null if no matching occurs (unfilled ATO/ATC are cancelled, not carried forward).
- Market holidays: maintained server-side in `vn_market_calendar` table; queried before every order submission.

---

#### FR-PT-07.2 — HNX (Hanoi Stock Exchange) Rules

| Attribute | Rule | Notes |
|-----------|------|-------|
| **Standard board lot** | 100 shares | Same as HOSE. |
| **Daily price ceiling** | reference_price × 1.10 (10% above) | Higher volatility band than HOSE. |
| **Daily price floor** | reference_price × 0.90 (10% below) | |
| **Tick size** | Same as HOSE (100 / 50 / 10 VND depending on price level) | |
| **Supported order types (V1)** | MARKET, LO, ATO, ATC | HNX MTL (Market-to-Limit) is NOT supported in V1 paper trading. |
| **Session windows** | Same as HOSE | HNX follows the same session structure. |

---

#### FR-PT-07.3 — UPCOM (Unlisted Public Company Market) Rules

| Attribute | Rule | Notes |
|-----------|------|-------|
| **Standard board lot** | 100 shares | |
| **Daily price ceiling** | reference_price × 1.15 (15%) | |
| **Daily price floor** | reference_price × 0.85 (15%) | |
| **Supported order types (V1)** | LO only | Market orders NOT supported on UPCoM. |
| **Session windows** | 09:00–15:00 ICT continuous | No separate ATO/ATC session on UPCoM in V1 simulation. |

---

#### FR-PT-07.4 — KRX / KOSPI / KOSDAQ Rules (Reference-Only)

| Attribute | Rule | Notes |
|-----------|------|-------|
| **Standard board lot** | 1 share (KR uses single-share trading) | No lot size validation for KR — any positive integer quantity accepted. |
| **Daily price ceiling** | ±30% from reference price | Simulated only; "Estimated price" label shown on all KR orders. |
| **Daily price floor** | Same (−30%) | |
| **Supported order types (V1)** | MARKET, LO | ATO/ATC not supported for KR in V1 (reference data only). |
| **Session windows** | Not enforced in V1 | KR data is reference-only; orders are accepted at any time and queued. |
| **Price band validation** | Not enforced in V1 | Reference data may be delayed; validation would produce false positives. |
| **Fill label** | "Estimated fill" shown in all KR trade records | BR-PT-11 |

---

#### FR-PT-07.5 — Global / US Market Rules (Reference-Only)

| Attribute | Rule | Notes |
|-----------|------|-------|
| **Standard board lot** | 1 share | |
| **Daily price ceiling** | None enforced | US exchanges use circuit breakers, not daily bands. Not simulated in V1. |
| **Daily price floor** | None enforced | |
| **Supported order types (V1)** | MARKET, LO | No extended-hours trading in V1 paper simulation. |
| **Session windows** | Not enforced in V1 | |
| **Fill label** | "Estimated fill" shown in all Global trade records | |

---

### FR-PT-08 — Order Status State Machine *(new in v2.3)*

- **Purpose:** Define all valid order states and permitted transitions. Prevents inconsistent states that could corrupt portfolio balance or holdings.

#### Order Status Values

| Status | Description |
|--------|-------------|
| `PENDING` | Order submitted and validated; awaiting fill (market order) or trigger (limit order). |
| `QUEUED_AFTER_HOURS` | KR/Global market order submitted outside simulated session hours; will fill at next session open. |
| `SUSPENDED` | Ticker is halted by exchange; evaluation paused until halt lifts. |
| `FILLED` | Order fully executed. Fill_price and fill_timestamp set. Portfolio updated. |
| `FILL_FAILED` | Market order could not fill (balance insufficient at fill time, or feed unavailable after 3 retries). Balance reserve released. |
| `EXPIRED` | Limit order reached 30-day expiry without filling. Reserve released. |
| `CANCELLED` | Limit order manually cancelled by user, OR auto-cancelled by portfolio reset, account deletion, or session-close-while-suspended (for ATO/ATC only). |

#### Valid State Transitions

```
                          ┌─────────────────────────────────────────────┐
                          │                                             │
         submit           ▼              price trigger                  │
  ──────────────► PENDING ────────────────────────────────► FILLED      │
                    │ │                                                  │
      halt          │ │ after-hours (KR/Global)            QUEUED_AFTER_HOURS
      detected      │ │ ─────────────────────► QUEUED_AFTER_HOURS        │
                    │ │                              │ session_open      │
         ▼          │ │                              └──► PENDING ───────┘
    SUSPENDED       │ │
         │          │ └──────────────────────────────► FILL_FAILED
    lift │          │       (market order: 3 retries
         │          │        failed or balance gap)
         ▼          │
    PENDING         │ (limit order)
                    ▼
              EXPIRED (30 days)
                    │
              CANCELLED (user, reset, deletion)
```

#### Business Rules from State Machine

| Rule | Description |
|------|-------------|
| A terminal state (`FILLED`, `FILL_FAILED`, `EXPIRED`, `CANCELLED`) cannot transition to any other state. | Immutable post-terminal. |
| `SUSPENDED` → `CANCELLED` is valid only if the market closes before the halt is lifted (ATO/ATC orders) or if the user manually cancels. | Limit orders survive session close while `SUSPENDED` and resume next session. |
| `QUEUED_AFTER_HOURS` → `CANCELLED` is valid if user manually cancels before session open. | User must have a cancel button visible for after-hours queued orders. |

---

### Business Rules — Paper Trading (v2.3)

| Rule ID | Rule | Violation Behavior |
|---------|------|--------------------|
| BR-PT-01 | VN (HOSE) standard board lot = 100 shares. All HOSE/HNX order quantities must be multiples of 100. | Reject with E-PT-107. |
| BR-PT-02 | VN (HOSE) daily price ceiling = reference_price × 1.07; floor = reference_price × 0.93. Newly listed stocks (first 3 sessions): ±20%. | BUY limit above ceiling: reject E-PT-203. SELL limit below floor: reject E-PT-204. |
| BR-PT-03 | VN (HNX) daily ceiling = ±10%. UPCOM = ±15%. | Same reject pattern. |
| BR-PT-04 | Tick size for limit prices: ≥50,000 VND → 100 VND increments; 10,000–49,999 VND → 50 VND; <10,000 VND → 10 VND. | Reject with E-PT-205; suggest nearest valid price. |
| BR-PT-05 | BUY limit price must be ≤ current_price. SELL limit price must be ≥ current_price. Immediate-fill intent → use MARKET order. | Reject FC-LIM-01 / FC-LIM-02. |
| BR-PT-06 | Market orders on HOSE/HNX are rejected during Pre-Opening session (09:00–09:15). Only ATO orders accepted in that window. | Reject with E-PT-103; suggest ATO. |
| BR-PT-07 | Market orders on HOSE/HNX are rejected during ATC session (14:30–14:45). Only ATC and existing LO orders remain in evaluation. | Reject with E-PT-115; suggest ATC. |
| BR-PT-08 | All orders are rejected when market status = CLOSED for VN (outside 09:00–14:45 ICT on trading days). KR/Global: queue as QUEUED_AFTER_HOURS. | VN: E-PT-101. KR/Global: E-PT-102. |
| BR-PT-09 | Virtual cash for BUY limit orders is reserved immediately on order creation. Available balance = total_balance − sum(open_buy_limit_reserves). | Reject new BUY limit if it would push reserves beyond available balance: E-PT-206. |
| BR-PT-10 | Holdings soft-locked for open SELL limit orders. User cannot place a second SELL limit on the same shares. | Reject E-PT-207. |
| BR-PT-11 | All KR and Global paper trade records display "Estimated fill" label. Price bands and session windows are NOT enforced for KR/Global reference markets. | UX label required; no validation rejection. |
| BR-PT-12 | Limit orders auto-expire after 30 calendar days from creation. Expiry cron runs at 23:59 UTC daily. On expiry: status = EXPIRED; reserved funds released; push notification sent. | Automated; no user action required. |
| BR-PT-13 | Portfolio reset cancels ALL open limit orders. Reset confirmation dialog must enumerate the count of open orders that will be cancelled. | Cannot reset without explicit acknowledgment when N > 0. |
| BR-PT-14 | All orders (PENDING → FILLED or terminal) are immutable after reaching a terminal state. Backend rejects any state transition from a terminal state. | HTTP 409 if attempted. |
| BR-PT-15 | Duplicate order submissions are detected by idempotency_key (client-generated UUID per tap, valid 5 minutes). Backend returns the original order response without creating a new record. | No error returned to client. |
| BR-PT-16 | Maximum 10 open limit orders per user at any time (VN + KR + Global combined). An 11th limit order is rejected. | Reject E-PT-116: "You have reached the maximum of 10 open orders. Cancel an existing order to place a new one." |
| BR-PT-17 | Realized P&L for SELL orders = (fill_price − avg_buy_price) × quantity − simulated_fee (simulated_fee = total_cost × 0.001). | Computed server-side at fill time and stored immutably. |
| BR-PT-18 | Simulated fee rate = 0.1% of trade value (applied to both BUY and SELL). Displayed in the order confirmation screen as "Simulated fee: [amount] VND." | Educational purpose: mimic real brokerage fees. |
| BR-PT-19 | ATO order: limit_price must be null/absent. System rejects ATO orders with a limit_price set. | Reject E-PT-117: "ATO orders do not accept a price — the system determines the opening price." |
| BR-PT-20 | ATC order: limit_price must be null/absent. Same rule as BR-PT-19 with session context ATC. | Reject E-PT-118. |

---

## Edge Case Matrix: Order Submission

| Scenario | VN (HOSE/HNX) | VN (UPCOM) | KR (KOSPI/KOSDAQ) | Global |
|----------|--------------|------------|-------------------|--------|
| Market CLOSED | Reject (E-PT-101) | Reject (E-PT-101) | Queue QUEUED_AFTER_HOURS | Queue QUEUED_AFTER_HOURS |
| Pre-Opening 9:00–9:15 | MARKET/LO rejected; ATO only | LO accepted (no ATO on UPCOM) | N/A | N/A |
| ATC 14:30–14:45 | New MARKET/LO rejected; ATC accepted | LO accepted | N/A | N/A |
| Lot size 1–99 | Reject (E-PT-107) | Reject (E-PT-107) | Accept (KR lot = 1) | Accept (lot = 1) |
| Price above ceiling | Reject BUY limit | Reject BUY limit | Not enforced | Not enforced |
| Price below floor | Reject SELL limit | Reject SELL limit | Not enforced | Not enforced |
| Ticker suspended | Reject or SUSPENDED | Reject or SUSPENDED | Reject or SUSPENDED | N/A |
| Ticker delisted | Reject (E-PT-105) | Reject (E-PT-105) | Reject (E-PT-105) | Reject (E-PT-105) |
| Feed outage at fill | 3 retries → FILL_FAILED | 3 retries → FILL_FAILED | Use estimated price | Use estimated price |

---

*End of Module B v2.3. Proceed to SRD-order-engine-v2.3.md for system-level implementation of these rules.*

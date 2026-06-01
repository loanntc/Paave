# Portfolio / Virtual Trading Dashboard — Master User Flow Overview

Version: 1.0 | Date: 2026-06-01 | Audience: PO · BA · Design · Dev · QA

---

## Table of Contents

- [Phase 0 — Entry: Portfolio Tab](#phase-0--entry-portfolio-tab)
- [Phase 1 — Portfolio Dashboard](#phase-1--portfolio-dashboard)
- [Phase 2 — Place an Order (Buy/Sell)](#phase-2--place-an-order-buysell)
- [Phase 3 — Order Management (Modify/Cancel)](#phase-3--order-management-modifycancel)
- [Phase 4 — Portfolio Reset](#phase-4--portfolio-reset)
- [Phase 5 — P&L Analytics](#phase-5--pl-analytics)
- [API Call Map](#api-call-map)
- [Edge Cases at a Glance](#edge-cases-at-a-glance)

---

## Overview

The Portfolio tab is Paave's **Virtual Paper Trading Dashboard** — a fully simulated investment environment where no real money is ever at risk. It is designed for F0 traders aged 16–27 entering the Vietnamese stock market for the first time.

Key constraints that apply across all flows:
- Starting balance: **500,000,000 VND** ("Tiền ảo" label always visible)
- All values are simulated; the "Tiền ảo" badge must appear on every screen that shows monetary amounts
- Board lot size: multiples of 100 shares (VN market)
- Simulated trading fee: 0.1% of trade value
- Max 10 open PENDING orders at any time
- Price data refreshes every 15 seconds

---

## Phase 0 — Entry: Portfolio Tab

```
┌─────────────────────────────────────────────────────────────┐
│  USER OPENS APP                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  BOTTOM TAB NAV: Tap "Danh Mục" (Portfolio)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
               ┌─────────┴─────────┐
               │  Virtual account  │
               │  initialized?     │
               └────┬──────────────┘
                    │
          ┌─────────┴──────────┐
          │ NO                 │ YES
          ▼                    ▼
┌─────────────────┐   ┌────────────────────────────────────┐
│ POST             │   │ LOAD PORTFOLIO DASHBOARD           │
│ /virtual/accounts│   │ → Fetch all dashboard sections     │
│ (initialize with │   │ → Show "Tiền ảo" badge             │
│ 500M VND)        │   │ → Start 15s refresh cycle          │
└────────┬────────┘   └────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ SUCCESS: Redirect to Portfolio Dashboard                    │
│ FAILURE: Show error toast; retry button                     │
└─────────────────────────────────────────────────────────────┘
```

**APIs called:**
- `POST /api/v1/virtual/accounts` (first launch only)

**Business rules:**
- Account is created once per user; subsequent launches skip initialization
- 500,000,000 VND is the initial available balance

---

## Phase 1 — Portfolio Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  PORTFOLIO DASHBOARD (Auto-refresh every 15s)               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Section 1: TOTAL PORTFOLIO VALUE                    │   │
│  │ = available_balance + SUM(holdings × current_price) │   │
│  │ +/- daily change shown                              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Section 2: AVAILABLE CASH                           │   │
│  │ = total_cash − reserves                             │   │
│  │ Reserved amount shown if > 0                        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Section 3: HOLDINGS LIST                            │   │
│  │ Default sort: P&L% descending                       │   │
│  │ Each row: ticker | qty | avg price | current |      │   │
│  │           unrealized P&L (+%) | soft-lock indicator │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Section 4: PORTFOLIO VALUE CHART                    │   │
│  │ Tabs: 1D / 1W / 1M / 3M / 1Y                       │   │
│  │ Baseline at 500M VND; reset markers shown           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Section 5: REALIZED P&L                             │   │
│  │ Lifetime total; tappable → breakdown screen         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Section 6: TRADE HISTORY                            │   │
│  │ Filter: ticker / date / side                        │   │
│  │ Pre-reset trades labeled [Pre-Reset]                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Section 7: OPEN ORDERS                              │   │
│  │ States: PENDING / QUEUED_AFTER_HOURS / SUSPENDED    │   │
│  │ Swipe-left to cancel                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   Tap "Mua"       Tap holding      Tap Settings
   or "Bán"         row             gear icon
         │               │               │
         ▼               ▼               ▼
   Phase 2:         Detail view     Phase 4:
   Place Order      (out of scope   Portfolio
                    this spec)       Reset
```

**APIs called (on load and every 15s):**
- `GET /api/v1/virtual/equity/account/profit-loss`
- `GET /api/v1/virtual/equity/account/accumulative-profit-loss`
- `GET /api/v1/virtual/equity/account/realized-profit-loss/history`
- `GET /api/v1/virtual/equity/account/buyable`
- `GET /api/v1/virtual/equity/account/sellable`

**Key business rules:**
- "Tiền ảo" badge persists on all monetary displays
- Unrealized P&L = (current_price − avg_buy_price) × qty
- Soft-locked shares (pending SELL orders) shown with lock icon
- Reserved balance (pending BUY orders) deducted from available cash display

---

## Phase 2 — Place an Order (Buy/Sell)

```
┌──────────────────────────────────────────────────────────────┐
│  ENTRY: "Mua" / "Bán" button on Portfolio Dashboard         │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  ORDER FORM SCREEN                                          │
│  User selects:                                              │
│  - Ticker (mã chứng khoán)                                  │
│  - Order type: MARKET / LO / ATO / ATC / STOP_LIMIT         │
│  - Quantity (bội số 100)                                     │
│  - Price (if applicable)                                     │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
                 ┌────────┴────────┐
                 │  VALIDATION     │
                 └────────┬────────┘
                          │
          ┌───────────────┼──────────────────┐
          │               │                  │
          ▼               ▼                  ▼
  Lot size OK?      Balance/         Market session
  (multiple 100)  holdings OK?       matches order
                                       type?
          │               │                  │
   FAIL: E-PT-107  FAIL: E-PT-108    FAIL: E-PT-101
   "Số lượng phải  "Số dư không      "Thị trường
    là bội số 100"  đủ"               đang đóng cửa"
          │               │                  │
          └───────────────┴──────────────────┘
                          │ ALL PASS
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  CONFIRMATION SCREEN                                        │
│  Shows: ticker | side | qty | price | fee (0.1%) |          │
│         available balance after | "Tiền ảo" badge           │
└─────────────────────────┬────────────────────────────────────┘
                          │
                  ┌───────┴───────┐
                  │ User confirms │
                  └───────┬───────┘
                          │
                          ▼
                POST /virtual/equity/orders
                          │
                   ┌──────┴──────┐
                   │  Response   │
                   └──────┬──────┘
                          │
          ┌───────────────┼────────────────────┐
          │               │                    │
          ▼               ▼                    ▼
       PENDING         ERROR              QUEUED_AFTER_HOURS
  (within 15s → FILLED  (show toast)    (TTL 48h; show
   or FILL_FAILED)                       info banner)
          │
          ▼
  Push notification:
  "Lệnh [Mua/Bán] [ticker]
   đã được khớp"
```

**Order type routing:**

```
               Order Type Selected
                      │
   ┌──────────────────┼───────────────────────┐
   │                  │                       │
   ▼                  ▼                       ▼
 MARKET              LO                  ATO / ATC
 (fills at next    (GTC 30 days or     (session-gated:
  15s snapshot)     GTD; price must     ATO = Pre-Opening
                    be within band)     only; ATC = ATC
                                        period only)
                       │
                       ▼
                  STOP_LIMIT
              (stop price triggers
               a limit order)
```

**APIs called:**
- `GET /api/v1/virtual/equity/account/buyable` (BUY validation)
- `GET /api/v1/virtual/equity/account/sellable` (SELL validation)
- `POST /api/v1/virtual/equity/orders`

**Key business rules:**
- BUY reserves: qty × limit_price × 1.001 from available balance
- SELL soft-locks shares until filled or cancelled
- No short selling (E-PT-109 if qty > owned)
- Max 10 open PENDING orders (E-PT-116 if exceeded)

---

## Phase 3 — Order Management (Modify/Cancel)

```
┌────────────────────────────────────────────────────────────┐
│  OPEN ORDERS section (Section 7 of Dashboard)             │
│  OR dedicated "Lệnh chờ" screen                           │
└───────────────────────────┬────────────────────────────────┘
                            │
                            ▼
              ┌─────────────┴─────────────┐
              │     Select order row      │
              └─────────────┬─────────────┘
                            │
              ┌─────────────┼─────────────┐
              │                           │
              ▼                           ▼
      Swipe-left: CANCEL            Tap: MODIFY
              │                           │
              ▼                           ▼
     ┌────────────────┐        ┌───────────────────────┐
     │ Confirm cancel │        │ Modify Order Form      │
     │ dialog         │        │ (change qty or price)  │
     └────────┬───────┘        └───────────┬───────────┘
              │                            │
              ▼                            ▼
   DELETE /virtual/equity/        PUT /virtual/equity/
   orders/{orderId}               orders/{orderId}
              │                            │
       ┌──────┴──────┐              ┌──────┴──────┐
       │  Success    │              │  Success    │
       └──────┬──────┘              └──────┬──────┘
              │                            │
              ▼                            ▼
   Order removed from list;      Order updated in list;
   reserved balance released;    reserve adjusted
   soft-lock released (SELL)
```

**Order state transitions:**

```
  PENDING ──────────────────────────────────────────────────┐
     │                                                       │
     ├─── Market fills within 15s ──────────────────► FILLED│
     │                                                       │
     ├─── Fill fails ──────────────────────────► FILL_FAILED│
     │                                                       │
     ├─── User cancels ──────────────────────────► CANCELLED│
     │                                                       │
     ├─── GTC expires after 30 days ──────────────► EXPIRED │
     │                                                       │
     └─── Ticker halt ──────────────────────────► SUSPENDED │
                                                       │
  SUSPENDED ─── Halt lifted ──────────────────► PENDING again
  SUSPENDED ─── Market closes ───────────────────► CANCELLED

  QUEUED_AFTER_HOURS ─── Market opens ─────────► PENDING
  QUEUED_AFTER_HOURS ─── 48h TTL expires ──────► CANCELLED
```

**APIs called:**
- `PUT /api/v1/virtual/equity/orders/{orderId}`
- `DELETE /api/v1/virtual/equity/orders/{orderId}`

---

## Phase 4 — Portfolio Reset

```
┌────────────────────────────────────────────────────────────┐
│  ENTRY POINTS                                             │
│  A) Settings gear icon on Portfolio Dashboard             │
│  B) Profile menu → "Đặt lại danh mục"                    │
└───────────────────────────┬────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│  DIALOG STEP 1: "Bạn có chắc muốn đặt lại không?"        │
│  Warns: all positions closed, all orders cancelled         │
│  [Tiếp tục] [Hủy]                                        │
└───────────────────────────┬────────────────────────────────┘
                            │ Tap "Tiếp tục"
                            ▼
┌────────────────────────────────────────────────────────────┐
│  DIALOG STEP 2: Final confirmation with consequences list  │
│  "Xác nhận đặt lại danh mục ảo"                          │
│  [Xác nhận] [Quay lại]                                   │
└───────────────────────────┬────────────────────────────────┘
                            │ Tap "Xác nhận"
                            ▼
                    SYSTEM PROCESSING
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ▼                ▼                ▼
  Close all positions  Cancel all      Restore 500M VND
  at last snapshot     PENDING orders  available balance
  price (simulated)
           │                │                │
           └────────────────┴────────────────┘
                            │
                            ▼
         History retained; trades labeled [Pre-Reset]
                            │
                            ▼
            AI coaching event triggered if
            FOMO/panic patterns detected
                            │
                            ▼
              Return to clean Portfolio Dashboard
```

**See:** `flow-c-portfolio-reset.md` for full detail including failure handling (FC-PT-05-A/B/C)

---

## Phase 5 — P&L Analytics

```
┌────────────────────────────────────────────────────────────┐
│  ENTRY: Tap Realized P&L row (Section 5 of Dashboard)    │
└───────────────────────────┬────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│  P&L BREAKDOWN SCREEN                                     │
│  - Lifetime realized P&L total                            │
│  - By ticker breakdown                                    │
│  - Current period vs previous periods                     │
│  - Pre-reset periods clearly separated                    │
└───────────────────────────┬────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
           Chart (cumulative   Trade-by-trade
           P&L over time)      list (from
                               realized-profit-loss
                               /history)

ENTRY: Tap Portfolio Value Chart (Section 4)
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│  CHART INTERACTION                                        │
│  - Tabs: 1D / 1W / 1M / 3M / 1Y                          │
│  - Horizontal line at 500M VND (baseline)                 │
│  - Reset markers: vertical dashed lines at each reset     │
│  - Scrub to see value at any point in time                │
└────────────────────────────────────────────────────────────┘
```

**APIs called:**
- `GET /api/v1/virtual/equity/account/profit-loss`
- `GET /api/v1/virtual/equity/account/accumulative-profit-loss`
- `GET /api/v1/virtual/equity/account/realized-profit-loss/history`

---

## API Call Map

| Phase | Trigger | Method | Endpoint | Purpose |
|-------|---------|--------|----------|---------|
| 0 | First launch | POST | `/virtual/accounts` | Initialize virtual account |
| 1 | Dashboard load / 15s | GET | `/virtual/equity/account/profit-loss` | Total P&L, portfolio value |
| 1 | Dashboard load / 15s | GET | `/virtual/equity/account/accumulative-profit-loss` | Chart data |
| 1 | Dashboard load | GET | `/virtual/equity/account/realized-profit-loss/history` | Trade history, realized P&L |
| 1, 2 | Before order form | GET | `/virtual/equity/account/buyable` | Available balance for BUY |
| 1, 2 | Before order form | GET | `/virtual/equity/account/sellable` | Holdings available to SELL |
| 2 | Order submit | POST | `/virtual/equity/orders` | Place order |
| 3 | Modify order | PUT | `/virtual/equity/orders/{orderId}` | Amend order |
| 3 | Cancel order | DELETE | `/virtual/equity/orders/{orderId}` | Cancel order |

---

## Edge Cases at a Glance

| ID | Scenario | Phase | Handling |
|----|----------|-------|----------|
| EC-01 | Market closed when placing order | 2 | E-PT-101: "Thị trường đang đóng cửa" |
| EC-02 | Quantity not multiple of 100 | 2 | E-PT-107: "Số lượng phải là bội số 100" |
| EC-03 | Insufficient virtual balance | 2 | E-PT-108: "Số dư ảo không đủ để thực hiện lệnh này" |
| EC-04 | Insufficient holdings to sell | 2 | E-PT-109: "Bạn không đủ cổ phiếu để bán" |
| EC-05 | Max 10 open orders exceeded | 2 | E-PT-116: "Đã đạt giới hạn 10 lệnh chờ" |
| EC-06 | Ticker halted mid-order | 2, 3 | Order moves to SUSPENDED state; banner shown |
| EC-07 | After-hours order (KR/Global) | 2 | QUEUED_AFTER_HOURS; 48h TTL notice shown |
| EC-08 | ATO order outside Pre-Opening | 2 | Order type disabled; tooltip explains session |
| EC-09 | ATC order outside ATC Period | 2 | Order type disabled; tooltip explains session |
| EC-10 | Portfolio reset mid-trading-day | 4 | All orders cancelled; positions closed at last snapshot |
| EC-11 | Connectivity loss during reset | 4 | FC-PT-05-A/B/C error handling; see flow-c |
| EC-12 | Holdings show soft-locked qty | 1 | Soft-locked shares displayed with lock icon |
| EC-13 | Price data stale > 15s | 1 | Stale-data indicator on affected rows |
| EC-14 | No holdings (fresh account) | 1 | Holdings section shows empty state: "Bạn chưa có cổ phiếu nào" |
| EC-15 | Pre-reset history navigation | 1, 5 | [Pre-Reset] label on all affected entries |

---

## Related Documents

- `flow-a-portfolio-dashboard.md` — Portfolio Dashboard detailed flow
- `flow-b-place-order.md` — Place Order (Buy/Sell) detailed flow
- `flow-c-portfolio-reset.md` — Portfolio Reset detailed flow
- `DEV-QA-SPEC-F0-Learning-Path.md` — F0 Learning Path dev/QA spec
- API specification (see `docs/` root)

# FRD: Portfolio / Virtual Trading Dashboard

**Version:** 1.0
**Date:** 2026-06-01
**Linked API Spec:** `docs/api/virtual-trading-api-spec.md`
**Linked Parent FRD:** `docs/business/frd/10-paper-trading.md`
**Status:** Draft — Pending Product Owner Sign-off
**Author:** BA Team
**Reviewer:** —

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | Portfolio / Virtual Trading Dashboard |
| Primary Actor | F0 Trader (authenticated Paave user, age 16–27, has completed account initialization) |
| Goal | View and manage a virtual paper-trading portfolio: monitor holdings, execute simulated orders, track P&L, and review trade history — all without risking real money |
| Trigger | User taps the "Portfolio" tab in the bottom navigation bar |
| Scope | Virtual trading only. No real brokerage connectivity. No real fund transfers. All computations are performed against the virtual account state returned by `/api/v1/virtual/*` endpoints. |
| Out of Scope | Real-money trading, margin trading, derivatives, IPO subscriptions, dividend calculations, tax reporting, portfolio sharing (follow feed beyond P&L view) |

---

## 2. Functional Requirements

---

### FR-PORT-01: Portfolio Dashboard — Main Screen

**Actor:** F0 Trader

**Description:**
The Portfolio Dashboard is the root screen of the Portfolio tab. It renders as a single vertically scrollable view containing exactly seven data sections in the following fixed order:

1. Total Portfolio Value (with daily change)
2. Available Cash (with reserved amount if applicable)
3. Holdings List (summary; "See All" link)
4. Portfolio Value Chart (with range selector)
5. Realized P&L (lifetime total; tappable)
6. Trade History (recent 5 entries; "See All" link)
7. Open Orders (active orders count + first 3 rows; "See All" link)

The screen initiates a 15-second polling cycle on mount. All seven sections refresh on each polling tick using the API calls defined below. The polling cycle pauses when the app is backgrounded and resumes when foregrounded. A last-updated timestamp in fog (#ADAAAA) is shown beneath the Total Portfolio Value.

**API Calls per Section:**

| Section | API Endpoint | Method | Notes |
|---------|-------------|--------|-------|
| Total Portfolio Value + Available Cash + Holdings breakdown | `GET /api/v1/virtual/equity/accounts/profit-loss` | GET | Returns NAV, cash balance, unrealized P&L, and **open positions breakdown** (this is the single source of truth for both Section 1 and Section 3) |
| Portfolio Value Chart (default 1M) | `GET /api/v1/virtual/accounts/one-month-normalized-nav` | GET | — |
| Realized P&L | `GET /api/v1/virtual/equity/accounts/realized-profit-loss` | GET | — |
| Trade History (recent 5) | `GET /api/v1/virtual/equity/accounts/realized-profit-loss/history?page=1&size=5` | GET | — |
| Open Orders (standard) | `GET /api/v1/virtual/equity/orders/history` | GET | Filter by status client-side or pass status query param if supported |
| Open Orders (stop orders) | `GET /api/v1/virtual/equity/stop-orders/history` | GET | Separate endpoint for STOP and STOP_LIMIT open orders |

> **⚠ Holdings source:** `profit-loss` returns `unrealizedPnL`, `nav`, `cashBalance`, and a breakdown of **open positions** (with qty, avg_buy_price, current_price per ticker). Do NOT use `sellable` for the Holdings List — `sellable` requires a specific `stockCode` parameter and returns only the max sellable quantity for that stock (used in the Order Form, not the Holdings display).

**Input:** None (data is fetched from API on mount and every 15 seconds).

**Output:**
- Fully populated dashboard screen with all seven sections rendered.
- Loading skeleton shown for each section during initial data fetch.
- If a section-level API call fails, that section renders an inline error state with a "Retry" button; other sections are unaffected.

**Preconditions:**
- User is authenticated (valid JWT present).
- Virtual account has been initialized (POST `/api/v1/virtual/accounts` completed during onboarding). If not initialized, redirect to account initialization flow.

**Postconditions:**
- Dashboard displays current portfolio state.
- Polling cycle is active (15-second interval).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01-01 | User has an initialized virtual account with holdings | User taps Portfolio tab | All 7 sections render within 3 seconds; Total Portfolio Value matches `available_balance + SUM(holdings.qty × current_price)` |
| AC-01-02 | Dashboard is active | 15 seconds elapses | All sections silently refresh (no full-screen loading indicator); last-updated timestamp updates |
| AC-01-03 | App is sent to background while dashboard is active | App returns to foreground | Polling resumes immediately; data refreshes within 1 second of foreground event |
| AC-01-04 | One API call (e.g., Open Orders) returns HTTP 500 | Poll cycle completes | Affected section shows inline error with "Retry" button; all other sections display fresh data |
| AC-01-05 | User has zero holdings and zero open orders | User views dashboard | Empty state messages render per section (see Edge Cases); no null pointer errors |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-01-01 | Virtual account not initialized | Redirect to account initialization flow | "Set up your virtual account to start trading" | — |
| FC-01-02 | All API calls fail (network offline) | Show full-screen offline state | "No internet connection. Pull down to retry." | NET_001 |
| FC-01-03 | JWT expired | Force logout, navigate to login screen | "Your session has expired. Please log in again." | AUTH_401 |
| FC-01-04 | API returns malformed JSON | Log error, show section-level error state | "Unable to load data. Tap to retry." | API_502 |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| Portfolio total value equals exactly 500,000,000 VND (no trades yet) | Daily change shows 0 VND / 0.00%; rendered in fog (#ADAAAA) |
| Holdings list exceeds 20 items | First 5 shown in dashboard section; "See All (N)" link navigates to HoldingsListScreen |
| Polling tick arrives while user is mid-scroll | Data updates silently; scroll position is preserved |
| Device clock is wrong | Use server timestamp from API response headers for last-updated display |

---

### FR-PORT-02: Holdings Management

**Actor:** F0 Trader

**Description:**
The Holdings List section displays all equity positions currently held in the virtual account. Each row shows a single holding with the following fields rendered left-to-right:

- **Ticker symbol** (uppercase, Space Grotesk Bold)
- **Exchange chip** (pill label: HOSE / HNX / UPCOM / NASDAQ / NYSE / KOSPI / KOSDAQ) in fog (#ADAAAA)
- **Quantity** (number of shares held, integer, tabular-nums)
- **Average buy price** (VND for VN equities; USD for US; KRW for KR; 2 decimal places)
- **Current price** (same currency; source: real-time market data feed)
- **Unrealized P&L amount** (formatted with sign; color-coded per BR-05)
- **Unrealized P&L percentage** (formatted as ±X.XX%; color-coded per BR-05)
- **Soft-lock indicator** (lock icon if `soft_locked = true`, with tooltip "Pending settlement — cannot sell yet")

**Unrealized P&L computation (client-side verification):**
```
unrealized_pnl_amount = (current_price - avg_buy_price) × quantity
unrealized_pnl_pct    = ((current_price - avg_buy_price) / avg_buy_price) × 100
```

**Sort Options** (accessible via sort icon top-right of section):
- P&L % (default, descending — best performers first)
- P&L % ascending
- Ticker A→Z
- Ticker Z→A
- Value (holding market value, descending)
- Most recently bought

Selected sort option persists in local device storage across app sessions.

**Delisted / Suspended stock handling:**
- If `current_price` returns null or the ticker is flagged `status: DELISTED` in the market data feed, the row renders current price as "—" and unrealized P&L as "—". A plasma (#D277FF) badge "Delisted" appears next to the exchange chip.
- Delisted holdings are excluded from portfolio_total_value computation.
- Delisted holdings are pinned to the bottom of the list regardless of sort order.

**Input:**
- API: `GET /api/v1/virtual/equity/accounts/profit-loss` — the `openPositions` (or equivalent breakdown field) in the response contains all holdings with: `symbol`, `quantity`, `avgBuyPrice`, `currentPrice`, `totalValue`, `unrealizedPnL`, `softLocked`.
- Sort selection: local enum stored in AsyncStorage key `portfolio_holdings_sort`.

> **Note on `sellable` and `buyable`:** These endpoints are NOT used here.
> - `GET /api/v1/virtual/equity/accounts/sellable?stockCode=X` — returns max sellable qty for a **specific stock**; used in the Order Form when user is placing a SELL order to show "Available to sell: N shares".
> - `GET /api/v1/virtual/equity/accounts/buyable?stockCode=X&orderPrice=Y` — returns max buyable qty for a **specific stock at a specific price**; used in the Order Form for a BUY order.

**Output:**
- Rendered list of holding rows.
- Each row is tappable → navigates to `HoldingDetailScreen` for that ticker.

**Preconditions:**
- Virtual account is initialized.
- At least one FILLED buy order exists (otherwise empty state renders).

**Postconditions:**
- Holdings are displayed sorted per user preference.
- Sort preference is persisted.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-02-01 | User holds 100 shares of VCB at avg buy price 89,000 VND; current price 92,000 VND | Dashboard renders | Unrealized P&L shows +300,000 VND / +3.37% in positive green (#10B981) |
| AC-02-02 | User holds 3 different stocks | User taps sort icon and selects "Ticker A→Z" | Holdings re-order alphabetically; sort icon badge updates; selection persists on next app launch |
| AC-02-03 | One holding's ticker becomes DELISTED | Next polling tick completes | That row shows "—" for price and P&L; "Delisted" badge appears; holding moves to bottom of list |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-02-01 | `profit-loss` endpoint returns empty `openPositions` array or 404 | Show empty state | "No holdings yet. Place your first buy order." | — |
| FC-02-02 | `avg_buy_price` is 0 in API response | Do not divide by zero; show unrealized P&L amount only; display P&L% as "N/A" | — | DATA_422 |
| FC-02-03 | Market data feed returns stale price (> 5 min old) | Show stale price with warning indicator (clock icon) | "Price may be delayed" | MKT_408 |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| User holds fractional quantities (KR/Global partial fill edge case) | Display quantity to 4 decimal places if `quantity mod 1 !== 0`; VN holdings always integer |
| All holdings are delisted | Portfolio total value = available_balance only; holdings section shows all rows with "Delisted" badge |
| 50+ holdings | Holdings list section in dashboard shows first 5 + "See All (N)"; `HoldingsListScreen` uses paginated flat list (page size 20) |

---

### FR-PORT-03: Portfolio Value Chart

**Actor:** F0 Trader

**Description:**
The Portfolio Value Chart displays the historical trajectory of the user's total portfolio value as a line + area chart. The chart is rendered inline within the dashboard as an embedded section (non-tappable to navigate; tap interactions are limited to range selector and tooltip scrubbing).

**Chart Specification:**
- **Type:** Line chart with filled area below the line
- **Y-axis:** Portfolio total value in VND (abbreviated: e.g., "520 Triệu", "1.2 Tỷ"); Y-axis origin is NOT zero — it auto-scales with 10% padding above max and below min value in range
- **X-axis:** Date/time labels appropriate to selected range
- **Baseline:** A horizontal dashed line at 500,000,000 VND labeled "Vốn ban đầu / Starting Capital". The area above baseline is shaded in positive (#10B981) with 20% opacity; below baseline in negative (#EF4444) with 20% opacity.
- **Crosshair/Tooltip:** When user drags finger across chart, a crosshair line appears with a tooltip bubble showing: date, portfolio value, % change from baseline.

**Time Range Selector:** Five tabs rendered as a pill row above the chart:

| Label | Range | API Endpoint | Data Granularity |
|-------|-------|-------------|-----------------|
| 1D | Current trading day | `GET /api/v1/virtual/equity/accounts/accumulative-profit-loss` (params: `fromDate=today`, `toDate=today`) | 5-minute intervals |
| 1W | Last 7 calendar days | `GET /api/v1/virtual/equity/accounts/accumulative-profit-loss` (params: `fromDate=7d ago`, `toDate=today`) | 1-hour intervals |
| 1M | Last 30 calendar days | `GET /api/v1/virtual/accounts/one-month-normalized-nav` | Daily closing values |
| 3M | Last 90 calendar days | `GET /api/v1/virtual/equity/accounts/accumulative-profit-loss` (params: `fromDate=90d ago`, `toDate=today`) | Daily closing values |
| 1Y | Last 365 calendar days | `GET /api/v1/virtual/equity/accounts/accumulative-profit-loss` (params: `fromDate=365d ago`, `toDate=today`) | Weekly values |

**VN-Index Benchmark Overlay (optional toggle):**

The chart supports an optional "So sánh với VN-Index" toggle. When enabled:
- API: `GET /api/v1/virtual/equity/vn-index-return` — returns VN-Index return values for 1W, 1M, 3M, YTD periods.
- Renders a secondary dashed line in fog (#ADAAAA) representing VN-Index performance normalized to the same baseline (0% return at chart start).
- Purpose: helps user see whether their strategy is outperforming or underperforming the market index.
- Label: "VN-Index" annotation at the end of the secondary line.

Default range on first load: 1M. Selected range persists in AsyncStorage key `portfolio_chart_range`.

**Reset Event Markers:**
- Each portfolio reset event is represented as a vertical dashed line on the chart at the timestamp of the reset.
- A small diamond marker sits at the top of the reset line.
- Tapping the marker shows a tooltip: "Portfolio Reset — [date]".
- After a reset, the chart continues from 500,000,000 VND (the baseline) at the reset timestamp.

**Data Gap Handling:**
- Weekends and market holidays result in no new data points. The chart connects last available value to next available value with a dashed line segment (to visually indicate the gap is intentional, not missing data).
- If the entire range returns zero data points (e.g., account was created today, 1Y range selected), show empty state: "Not enough data for this range. Try 1D."

**Input:**
- Range selection (1D / 1W / 1M / 3M / 1Y)
- API response: array of `{ timestamp: ISO8601, portfolio_value: number, normalized_nav?: number }`

**Output:**
- Rendered chart with range selector, baseline, and (if applicable) reset markers.

**Preconditions:**
- Virtual account is initialized.
- At least one data point exists for the selected range.

**Postconditions:**
- Chart displays historical portfolio value for selected range.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-03-01 | User has 30 days of trade history | User views 1M chart | Chart renders with daily data points; baseline at 500M VND is visible as dashed horizontal line; areas above/below baseline are shaded correctly |
| AC-03-02 | User has performed 2 portfolio resets | User views 1Y chart | Two vertical dashed reset markers appear at correct timestamps; chart value resets to 500M at each marker |
| AC-03-03 | User selects 1D range on a weekend | API returns empty array | Empty state message "Not enough data for this range. Try 1D." renders; chart area shows placeholder grid |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-03-01 | API returns HTTP 500 for selected range | Show chart error state with retry button | "Chart unavailable. Tap to retry." | API_503 |
| FC-03-02 | API returns malformed timeseries (non-monotonic timestamps) | Drop malformed points, render with remaining valid data; log error | — (silent) | DATA_422 |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| Portfolio value never deviated from 500M (no trades, 1Y range) | Chart renders as a flat line at baseline; area shading is neutral |
| Single data point for selected range | Chart renders a single dot at correct timestamp with tooltip available |
| Portfolio value exceeds 1 Tỷ VND | Y-axis label switches to "Tỷ" denomination; axis recalculates scale |

---

### FR-PORT-04: Trade History

**Actor:** F0 Trader

**Description:**
The Trade History section shows ALL trades ever executed in the virtual account, including trades from before portfolio resets (displayed with a `[Pre-Reset]` prefix). In the dashboard, only the 5 most recent trades are shown with a "See All" link that navigates to the full `TradeHistoryScreen`.

**Trade Row Fields (per row):**
- `[Pre-Reset]` prefix (red badge, only for trades before the most recent reset)
- Ticker symbol
- Exchange chip
- Side: BUY (lime #CAFD00 badge) or SELL (plasma #D277FF badge)
- Fill price
- Quantity filled
- Fill timestamp (formatted: DD MMM YYYY HH:mm)
- Trade value (fill_price × quantity, displayed)
- Simulated fee (0.1% of trade value, displayed as "Fee: X VND")
- Net P&L for this trade (SELL trades only: `(sell_price - avg_buy_price_at_sell) × qty - fee`)
- "Estimated fill" chip (amber badge, only for KR/Global orders where exact fill timing is simulated)

**Filter Drawer (TradeHistoryScreen only):**
Accessible via filter icon top-right. Filters are combinable (AND logic):

| Filter | Type | Options |
|--------|------|---------|
| Ticker | Text search (min 1 char, max 10 chars) | Free text |
| Date range | Date picker | Start date — End date (inclusive) |
| Side | Toggle | ALL / BUY / SELL |
| Exchange | Multi-select | HOSE / HNX / UPCOM / NASDAQ / NYSE / KOSPI / KOSDAQ |
| Include Pre-Reset | Toggle | ON (default) / OFF |

Active filters are shown as dismissible chips below the search bar. "Clear All" removes all active filters.

**Pagination:** Infinite scroll. Page size: 20 trades per fetch.

Two complementary endpoints serve this screen:

| Endpoint | Purpose | When to use |
|----------|---------|-------------|
| `GET /api/v1/virtual/equity/accounts/realized-profit-loss/history` | P&L-focused history — each record includes `realizedPnL` per trade, settlement date, avg buy price at sell | Primary source for Trade History screen (P&L per trade row) |
| `GET /api/v1/virtual/profile/trading-history` | Transaction-focused history — complete list of executed trades including BUY fills (which have no realized P&L) | Supplement: use to show BUY trades in Trade History; merge with realized-profit-loss/history results |

Params for `realized-profit-loss/history`: `subAccount`, `fromDate`, `toDate`, `page` (1-based), `size` (max 100, default 20).
Params for `profile/trading-history`: `subAccount`, `fromDate`, `toDate`, `page`, `size`.

**Input:**
- No required user input for initial display.
- Filter parameters (optional): ticker, date_from, date_to, side, exchange, include_pre_reset.

**Output:**
- Paginated list of trade rows sorted by fill timestamp descending (newest first, not configurable).
- Total trades count shown in header: "N trades total".

**Preconditions:**
- Virtual account is initialized.
- At least one FILLED order exists.

**Postconditions:**
- Trade history displayed per applied filters.
- Filter state persists within the current screen session (resets when navigating away).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-04-01 | User has 50 total trades (30 post-reset, 20 pre-reset) | User opens TradeHistoryScreen | First 20 trades (newest first) load; scrolling to bottom triggers next page fetch; Pre-Reset trades show `[Pre-Reset]` red badge |
| AC-04-02 | User applies filter: Side=SELL, Exchange=HOSE | Filter drawer is applied | Only SELL trades on HOSE exchange are listed; active filter chips "SELL", "HOSE" appear below search bar |
| AC-04-03 | User has a KR stock trade (e.g., Samsung 005930.KS) | Trade row renders | "Estimated fill" amber chip appears on that row |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-04-01 | No trades exist (first-time user) | Show empty state illustration | "No trades yet. Place your first order to get started." | — |
| FC-04-02 | Filter returns zero results | Show filtered empty state | "No trades match your filters. Clear filters to see all." | — |
| FC-04-03 | Pagination API call fails (offset > 0) | Show inline error at list bottom | "Failed to load more. Tap to retry." | API_503 |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| Trade history crosses multiple resets (3+ resets) | Each trade before its respective most-recent-prior reset shows `[Pre-Reset]`; trades between resets also tagged |
| Very large trade value (e.g., 50 billion VND) | Display using Vietnamese number formatting: "50,000,000,000 VND" with `Intl.NumberFormat('vi-VN')` |
| Same ticker traded 100+ times | All rows render; no deduplication; each fill is its own row |

---

### FR-PORT-05: Open Orders Management

**Actor:** F0 Trader

**Description:**
The Open Orders section displays all orders in the following active states: `PENDING`, `QUEUED_AFTER_HOURS`, `SUSPENDED`. Terminated states (`FILLED`, `FILL_FAILED`, `CANCELLED`, `EXPIRED`) are NOT shown here (they appear in Trade History).

In the dashboard, the first 3 open orders are shown with a "See All (N)" link to the full `OpenOrdersScreen`.

**Order Row Fields (per row):**
- Ticker symbol
- Exchange chip
- Order type badge: LO / MARKET / ATO / ATC / STOP_LIMIT / STOP
- Side: BUY / SELL
- Order quantity (integer)
- Order price (for LO, STOP_LIMIT; displayed as "—" for MARKET, ATO, ATC)
- Status badge:
  - PENDING → fog (#ADAAAA) badge "Pending"
  - QUEUED_AFTER_HOURS → amber badge "After Hours"
  - SUSPENDED → plasma (#D277FF) badge "Suspended"
- TTL countdown (for KR/Global QUEUED_AFTER_HOURS orders only): "Expires in HH:MM:SS". Counted down live on screen. When TTL reaches 00:00:00, order transitions to EXPIRED and disappears from list.
- Created timestamp

**Swipe-Left to Cancel:**
- Each row supports left-swipe gesture revealing a red "Cancel" action button.
- Tapping "Cancel" triggers a confirmation bottom sheet: "Cancel this order for [ticker]? This cannot be undone." with "Confirm Cancel" (red CTA) and "Keep Order" (ghost) buttons.
- Confirmed cancellation calls `DELETE /api/v1/virtual/equity/orders/{orderId}`.
- On success: row animates out with slide-left transition; open orders count in header decrements.
- On failure: snackbar error "Could not cancel order. Please try again." Row remains.

**Input:**

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/virtual/equity/orders/history` | Standard orders (LO, MARKET, ATO, ATC) — filter to active states: PENDING, QUEUED_AFTER_HOURS, SUSPENDED |
| `GET /api/v1/virtual/equity/stop-orders/history` | Stop and STOP_LIMIT orders in active state — separate endpoint, must be fetched in parallel and merged with standard orders |

Params: `subAccount`, `fromDate`, `toDate`, `page`, `size`.

Cancel endpoints:
- Single standard order: `DELETE /api/v1/virtual/equity/orders/{orderId}`
- Single stop order: `DELETE /api/v1/virtual/equity/stop-orders/{orderId}`
- Bulk standard orders: `POST /api/v1/virtual/equity/orders/cancellations` with `{ orderIds: [...] }`
- Bulk stop orders: `DELETE /api/v1/virtual/equity/stop-orders/bulk` (array of stop order IDs)

**Output:**
- Rendered list of open order rows with live TTL countdowns.
- Sorted: newest first (creation timestamp descending).

**Preconditions:**
- Virtual account is initialized.
- At least one non-terminal order exists.

**Postconditions:**
- If cancel confirmed: order status = CANCELLED; row removed from list.
- Open orders count label updates.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-05-01 | User has 8 open orders (5 PENDING, 2 QUEUED_AFTER_HOURS, 1 SUSPENDED) | User opens OpenOrdersScreen | All 8 orders render with correct status badges; QUEUED_AFTER_HOURS rows show live TTL countdown |
| AC-05-02 | User swipe-cancels a PENDING order | User confirms cancel | Row slides out; snackbar "Order cancelled"; count decrements by 1; `DELETE /api/v1/virtual/equity/orders/{id}` called exactly once |
| AC-05-03 | KR order's TTL countdown reaches 00:00:00 | Timer expires | Order row disappears from list; snackbar "Order expired"; count decrements |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-05-01 | Cancel API returns 404 (order already cancelled/filled) | Refresh list; remove stale row | "Order already processed." | ORD_404 |
| FC-05-02 | Cancel API returns 500 | Row remains; swipe resets | "Could not cancel order. Please try again." | API_500 |
| FC-05-03 | No open orders | Show empty state | "No open orders." | — |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| User has exactly 10 open orders (maximum per BR-PT-14) | No "Place Order" CTA is shown anywhere in the app until count drops below 10; full-screen warning if user attempts to open order form |
| SUSPENDED order | No swipe-to-cancel gesture available for SUSPENDED rows; "Cancel" action is hidden; row is read-only |
| Multiple orders for same ticker | All render as separate rows; no grouping |

---

### FR-PORT-06: Place Order (Buy / Sell)

**Actor:** F0 Trader

**Description:**
The order placement flow is triggered from: (a) a stock detail screen "Buy" / "Sell" CTA, (b) a holding row in the Holdings List. It opens as a bottom sheet (`PlaceOrderBottomSheet`) with the following order form fields.

**Order Form Fields:**

| Field | Type | Constraint |
|-------|------|-----------|
| Side | Toggle | BUY or SELL (pre-selected from entry point) |
| Order Type | Segmented control | LO / MARKET / ATO / ATC (standard); STOP_LIMIT / STOP (advanced, collapsed by default behind "Advanced" toggle) |
| Ticker | Read-only | Pre-filled from entry point |
| Exchange | Read-only | Pre-filled from entry point |
| Quantity | Numeric input | Integer > 0; VN equities: must be multiple of 100 (board lot rule, BR-08); KR/Global: minimum 1 share |
| Limit Price | Numeric input | Required for LO, STOP_LIMIT; hidden for MARKET, ATO, ATC; must be > 0; VN equities: must conform to tick size rules |
| Stop Price | Numeric input | Required for STOP_LIMIT, STOP; hidden for all others; must be > 0 |

**Order Types Behavior:**

| Order Type | API Endpoint | Price Field | Notes |
|-----------|-------------|-------------|-------|
| LO (Limit) | `POST /api/v1/virtual/equity/orders` with `type: LO` | Required | Standard limit order |
| MARKET | `POST /api/v1/virtual/equity/orders` with `type: MARKET` | Hidden | Fills at best available simulated price |
| ATO | `POST /api/v1/virtual/equity/orders` with `type: ATO` | Hidden | At-the-Open; only valid during pre-market session |
| ATC | `POST /api/v1/virtual/equity/orders` with `type: ATC` | Hidden | At-the-Close; only valid during pre-close session |
| STOP_LIMIT | `POST /api/v1/virtual/equity/orders/stop-limit` | Required (limit + stop) | Triggers when stop price hit, then places limit order |
| STOP | `POST /api/v1/virtual/equity/stop-orders` | Required (stop only) | Triggers when stop price hit, then places market order |

**Real-Time Buy Power / Sell Power Display:**

| Action | API Call | Required Params | Display |
|--------|---------|----------------|---------|
| BUY — max quantity | `GET /api/v1/virtual/equity/accounts/buyable` | `stockCode` (required), `orderPrice` (optional — uses current price if omitted) | "Mua tối đa: N cổ phần tại giá X VND" — shown below quantity field; updates when user changes the price field |
| SELL — max quantity | `GET /api/v1/virtual/equity/accounts/sellable` | `stockCode` (required) | "Có thể bán: N cổ phần" — shown below quantity field; static per order session |

Both endpoints require `stockCode` (the ticker being ordered). Call these only after ticker is known (pre-filled from entry point). Do NOT call on screen mount without a ticker — the API will return 400.

**Simulated Fee Preview:**
Before submission, the form shows:
```
Trade Value:    X,XXX,XXX VND
Simulated Fee:  X,XXX VND  (0.1%)
Net Cost/Proceeds: X,XXX,XXX VND
```
Fee computation: `simulated_fee = trade_value × 0.001` where `trade_value = limit_price × quantity` (for LO) or `estimated_price × quantity` (for MARKET using last price).

**Confirmation Screen (`OrderConfirmationScreen`):**
Before the API call is made, user is shown a full-screen summary:
- All order parameters
- Fee breakdown
- "Confirm & Place Order" (lime CTA)
- "Back" (ghost)

**Idempotency:**
The order submission request includes a client-generated `idempotency_key` (UUID v4) in the request header (`X-Idempotency-Key`). If the user taps "Confirm" and the response is not received within 10 seconds, the app shows a loading state. If the user navigates away and returns, the app checks for the pending idempotency key and does NOT submit a duplicate.

**Input:**
- Side (BUY/SELL)
- Order type (LO / MARKET / ATO / ATC / STOP_LIMIT / STOP)
- Ticker (pre-filled)
- Quantity (integer, with board lot constraint for VN)
- Limit price (conditional)
- Stop price (conditional)

**Output:**
- Success: order created with status PENDING; bottom sheet dismisses; snackbar "Order placed"; open orders count increments.
- Failure: error message displayed inline in form (not bottom sheet dismissal).

**Preconditions:**
- User is authenticated.
- Virtual account is initialized.
- Open PENDING order count < 10 (BR-PT-14).
- For SELL: user holds sufficient sellable quantity of the ticker.
- For BUY: `available_balance >= limit_price × quantity + simulated_fee` (for LO) or estimated equivalent.

**Postconditions:**
- New order record created in virtual trading engine with status PENDING.
- `available_balance` reduced by `limit_price × quantity` (reserve) for BUY LO orders.
- Open orders count incremented.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-06-01 | User has 450M VND available cash; places BUY LO order for 100 VCB at 89,000 VND | User confirms order | Order created (PENDING); available cash reduces by 8,900,000 VND (+ fee 8,900 VND reserved); snackbar "Order placed" |
| AC-06-02 | VN equity order; user enters quantity 150 | User taps "Review Order" | Validation error inline: "Quantity must be a multiple of 100 shares for VN equities." Submit button disabled. |
| AC-06-03 | User already has 10 open PENDING orders | User attempts to open PlaceOrderBottomSheet | Bottom sheet does not open; full-screen interstitial: "Maximum 10 open orders reached. Cancel an existing order to place a new one." |
| AC-06-04 | User places order; network drops before response arrives | App waits 10s; user navigates away and returns | Idempotency key prevents duplicate submission; app shows "Checking order status…" then resolves |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-06-01 | Insufficient available balance | Reject at client (pre-check); also server returns 400 | "Insufficient virtual funds. Available: X VND." | ACCT_400 |
| FC-06-02 | Sell quantity exceeds sellable shares | Reject at client (pre-check); server returns 400 | "You can only sell up to N shares of [ticker]." | ORD_400 |
| FC-06-03 | ATO order placed outside pre-market session window | Server returns 422 | "ATO orders can only be placed during pre-market session (08:15–09:00 VN time)." | ORD_422 |
| FC-06-04 | ATC order placed outside pre-close session window | Server returns 422 | "ATC orders can only be placed during pre-close session (14:30–14:45 VN time)." | ORD_422 |
| FC-06-05 | Duplicate submission (idempotency key match) | Server returns 200 with existing order data | *(no duplicate; original order details shown)* | — |
| FC-06-06 | Stop price set above current price for a STOP SELL order | Client-side validation | "Stop price must be below current market price for a sell stop order." | ORD_VAL_001 |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| User places ATO order and market opens before fill | Order transitions PENDING → FILLED at simulated open price |
| User places ATO order; ATO_ATC_NO_MATCH occurs | Order transitions PENDING → CANCELLED; snackbar "Order cancelled: no ATO match at opening." |
| Limit price input uses comma decimal separator | App accepts both `.` and `,` as decimal separators; normalizes to `.` before submission |
| Trade value rounds to non-integer (KR/Global fractional pricing) | Round fee to nearest integer VND equivalent (floor) |

---

### FR-PORT-07: Modify / Cancel Order

**Actor:** F0 Trader

**Description:**
Users may modify or cancel orders that are in `PENDING` status only. `QUEUED_AFTER_HOURS` and `SUSPENDED` orders cannot be modified (read-only). `FILLED`, `FILL_FAILED`, `EXPIRED`, `CANCELLED` orders cannot be modified or cancelled.

**Modify Order (`ModifyOrderScreen`):**
Accessible by tapping a PENDING order row in `OpenOrdersScreen` → tapping "Modify" action.

Modifiable fields (only fields applicable to the order type):
- **Limit price** (LO, STOP_LIMIT only): new value must be > 0; same tick size rules apply
- **Stop price** (STOP_LIMIT, STOP only): new value must be > 0
- **Quantity** (all modifiable order types): new value > 0; VN board lot rule applies; new quantity cannot exceed sellable shares (for SELL) or buyable quantity (for BUY)

Non-modifiable fields (always read-only): Ticker, Exchange, Side, Order Type.

On submission: `PUT /api/v1/virtual/equity/orders/{orderId}` with only changed fields in the request body.

On success: snackbar "Order updated"; user navigated back to `OpenOrdersScreen`; row updates with new values.

**Cancel Single Order:**
- Via swipe-left on `OpenOrdersScreen` (see FR-PORT-05)
- Via "Cancel Order" button on `ModifyOrderScreen`
- API: `DELETE /api/v1/virtual/equity/orders/{orderId}`

**Cancel Multiple Orders:**
- `OpenOrdersScreen` supports a "Select" mode (top-right "Select" button).
- In select mode, each row shows a checkbox. User can check individual rows or "Select All" (selects only PENDING orders; QUEUED/SUSPENDED grayed out and non-selectable).
- "Cancel Selected (N)" CTA at bottom triggers `POST /api/v1/virtual/equity/orders/cancellations` with array of orderIds.
- Confirmation modal: "Cancel N orders? This cannot be undone." with "Confirm" (red) and "Keep" (ghost).
- On partial success (some orders already filled): success snackbar lists cancelled count; toast "N order(s) could not be cancelled (already processed)."

**Input:**
- Modify: orderId, updated fields (limit_price, stop_price, quantity)
- Cancel single: orderId
- Cancel multiple: array of orderIds (PENDING only)

**Output:**
- Modify success: order updated in list; new values reflected.
- Cancel success: order(s) removed from open orders list; orders appear in trade history with status CANCELLED.

**Preconditions:**
- Order(s) must be in PENDING status for modify or cancel. QUEUED_AFTER_HOURS and SUSPENDED are cancel-only via swipe (not modifiable).
- For modify: new quantity must pass all original placement validations.

**Postconditions:**
- Modified order: PENDING status retained; price/qty updated.
- Cancelled order: status = CANCELLED (terminal); reserved balance released back to available_balance.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-07-01 | User has a PENDING LO BUY order for 100 VCB at 88,000 VND | User modifies limit price to 89,500 VND | PUT request sent; order row updates to 89,500 VND; reserved balance adjusts accordingly |
| AC-07-02 | User selects 5 PENDING orders for bulk cancel | User confirms "Cancel 5 orders" | All 5 cancelled; reserved balances released; open orders count decreases by 5 |
| AC-07-03 | User attempts to modify a QUEUED_AFTER_HOURS order | User taps order row | "Modify" button is not rendered; row is read-only; tooltip "Cannot modify orders in After Hours queue" |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-07-01 | PUT modify returns 409 (order was just filled between tap and submit) | Show error; reload order list | "Order already filled. Cannot modify." | ORD_409 |
| FC-07-02 | Bulk cancel partial failure (2 of 5 already filled) | Cancel 3 successfully; return error list | "3 orders cancelled. 2 could not be cancelled (already processed)." | ORD_PART_200 |
| FC-07-03 | New quantity on modify is not a multiple of 100 (VN) | Client-side validation; block submit | "Quantity must be a multiple of 100 shares for VN equities." | ORD_VAL_001 |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| User modifies quantity to a higher value (BUY) but new total exceeds available balance | Client pre-checks `available_balance >= new_qty × limit_price + fee`; blocks submit with inline error |
| User cancels last PENDING order when they had 10 (BR-PT-14 limit reached) | After cancel, open order count = 9; "Place Order" CTA becomes available again throughout the app |

---

### FR-PORT-08: Portfolio Reset

**Actor:** F0 Trader

**Description:**
Portfolio Reset allows the user to wipe their current virtual portfolio state and start fresh with 500,000,000 VND. This is an irreversible action with lasting consequences; it is protected by a mandatory two-step confirmation flow.

**Trigger:** "Reset Portfolio" option in the Portfolio settings menu (accessible via gear icon on `PortfolioDashboardScreen` top-right).

**Reset Flow (Two-Step Confirmation):**

**Step 1 — Warning Modal (`PortfolioResetModal` Step 1):**
- Title: "Reset your portfolio?"
- Body: "This will close all positions and cancel all open orders. Your trade history will be preserved with a [Pre-Reset] label. Your balance will return to 500,000,000 VND. This cannot be undone."
- CTA: "Continue" (red) | "Cancel" (ghost)

**Step 2 — Final Confirmation (`PortfolioResetModal` Step 2):**
- Title: "Are you absolutely sure?"
- Body: "Type RESET to confirm." (text input)
- CTA: "Confirm Reset" (red, disabled until user types exactly "RESET" case-sensitive) | "Go Back" (ghost)

**What Reset Does (server-side, atomic):**
1. All PENDING orders → CANCELLED (reserved balances released)
2. All QUEUED_AFTER_HOURS orders → CANCELLED
3. All SUSPENDED orders → CANCELLED
4. All holdings positions → closed at last known price (these closes do NOT generate fee records — they are administrative closes, not user-initiated sells)
5. Cash balance reset to exactly 500,000,000 VND
6. A reset event record is created with timestamp (used by chart FR-PORT-03 for markers)
7. All historical trade records are preserved; their `pre_reset` flag set to `true`

**Post-Reset State:**
- Dashboard reloads showing: Total Portfolio Value = 500,000,000 VND; Holdings = empty; Open Orders = empty; Available Cash = 500,000,000 VND
- Trade History shows all prior trades with `[Pre-Reset]` badge
- Chart shows reset marker at current timestamp; line restarts at 500M VND

**Input:**
- Confirmation text: "RESET" (exact string, case-sensitive)

**Output:**
- Virtual account state fully reset.
- Success snackbar: "Portfolio reset. Starting balance: 500,000,000 VND"

**Preconditions:**
- User is authenticated.
- Virtual account is initialized.

**Postconditions:**
- `total_cash` = 500,000,000 VND
- All open orders status = CANCELLED
- All positions = 0
- A reset event timestamp recorded
- All prior trade records have `pre_reset = true`

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-08-01 | User has 5 holdings, 3 open orders, and 30 trade history records | User completes reset flow (types "RESET") | Dashboard shows 500M balance, empty holdings, empty open orders; Trade History shows 30 records with `[Pre-Reset]` badge |
| AC-08-02 | User is on Step 2 modal and types "reset" (lowercase) | User taps "Confirm Reset" button | Button remains disabled; inline hint: "Type RESET in uppercase to confirm" |
| AC-08-03 | User completes reset; views Portfolio Value Chart | Chart renders | A reset marker appears at today's date; chart value resets to 500M baseline |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-08-01 | Reset API call fails (server error) | Show error modal; portfolio state unchanged | "Reset failed. Your portfolio is unchanged. Please try again." | API_500 |
| FC-08-02 | Network drops during reset (partial server execution) | Server must be atomic — either full reset or no-op. Client retries with same idempotency key. | "Reset may not have completed. Pull to refresh to check your balance." | NET_RESET_001 |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| User resets with zero holdings and zero orders | Reset still executes; balance already at 500M (or close to it); reset event still recorded; no error |
| User resets multiple times in same calendar day | Each reset creates a new reset event; chart shows multiple markers; no limit on reset frequency |
| Administrative close of holdings at reset does not have a market price (delisted stock) | Use last known price; if unavailable, use 0; do not generate fee; note in reset log |

---

### FR-PORT-09: P&L Analytics Detail

**Actor:** F0 Trader

**Description:**
The P&L Analytics screen (`PnLAnalyticsScreen`) provides a detailed breakdown of the user's profit and loss performance. It is accessed by tapping the Realized P&L row on the dashboard.

**Screen Sections:**

**Section A — Periodic P&L Summary (top cards):**
| Card | Value Source | API | Params |
|------|-------------|-----|--------|
| Tuần này (1W) | `GET /api/v1/virtual/periodic-profit-loss` | Periodic P&L | Returns 1W, 1M, 3M, YTD in one call |
| Tháng này (1M) | Same response | Same | — |
| 3 tháng (3M) | Same response | Same | — |
| Từ đầu năm (YTD) | Same response | Same | — |

Each card shows: P&L amount + % change (color-coded per BR-05).

> **`GET /api/v1/virtual/periodic-profit-loss`** returns profit/loss summarized over standard periods (1W, 1M, 3M, YTD) in a single response — use this instead of filtering `realized-profit-loss` by period.

**Section B — Total P&L Snapshot (Unrealized + Realized):**
- API: `GET /api/v1/virtual/equity/accounts/profit-loss`
- Shows `total_pnl`, `unrealized_pnl`, `realized_pnl`, `nav`, `cashBalance` in a summary row.

**Section C — Realized P&L Lifetime Total:**
- API: `GET /api/v1/virtual/equity/accounts/realized-profit-loss` (params: `subAccount`)
- Single figure: total realized P&L across all time. Color-coded. Tappable → expands trade-level breakdown.

**Section D — Daily P&L Bar Chart (last 30 days):**
- API: `GET /api/v1/virtual/equity/accounts/daily-profit-loss` (params: `fromDate`, `toDate`, `page`, `size`)
- Bar chart: 30 days, one bar per trading day.
- Bars above zero → positive (#10B981); below zero → negative (#EF4444); zero → fog (#ADAAAA).
- Tap on bar → tooltip: exact date, P&L amount, % change.

**Section E — Cumulative P&L Line Chart:**
- API: `GET /api/v1/virtual/equity/accounts/accumulative-profit-loss` (params: `fromDate`, `toDate`)
- Cumulative realized P&L since account creation; baseline at 0 (delta, not portfolio value).
- Crosshair tooltip on scrub: date, cumulative P&L.

**Section F — VN-Index Benchmark Comparison:**
- API: `GET /api/v1/virtual/equity/vn-index-return`
- Returns VN-Index returns for 1W, 1M, 3M, YTD.
- Renders as a comparison row: "Danh mục của bạn: +X.XX% vs VN-Index: +Y.YY%" for each period.
- Green if portfolio outperforms index; red if underperforms; gray if equal.

**Section G — Portfolio Ranking vs Index:**
- API: `GET /api/v1/virtual/index/rank`
- Shows user's rank among all virtual portfolios benchmarked against the specified index.
- Display: "Xếp hạng: #N / M nhà đầu tư ảo" — paginated leaderboard subset.

**Section H — Leaderboard Context:**
- API: `GET /api/v1/virtual/leaderboard/investing/user-ranking`
- Shows user's current rank on the virtual trading leaderboard (ranked by normalized NAV performance).
- Tappable → navigates to full leaderboard screen.

**Section I — Following P&L Comparison (only if user follows ≥ 1 account):**
| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/virtual/equity/accounts/following-profit-loss` | P&L summary for each followed user |
| `GET /api/v1/virtual/equity/accounts/following-accumulative-pl` | Cumulative P&L for overlay comparison on chart |
| `GET /api/v1/virtual/equity/accounts/following-daily-profit-loss` | Daily P&L for followed users (for bar chart comparison) |

Bar chart comparing user's realized P&L % vs. each followed user's P&L %. Max 5 followed accounts; "See More" if > 5.

**Input:**
- Period filter for realized P&L summary: CURRENT_MONTH, CURRENT_YEAR (passed as query param).
- No required user input otherwise.

**Output:**
- All sections rendered with latest data from their respective API endpoints.
- Loading skeleton per section.

**Preconditions:**
- Virtual account is initialized.
- At least one FILLED order exists (otherwise all sections show zero state).

**Postconditions:**
- Screen displays current P&L analytics. No state mutations.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-09-01 | User has 10 sell trades with net realized P&L of +2,500,000 VND this month | User opens P&L Analytics | "This Month" card shows +2,500,000 VND in green (#10B981); "Total Lifetime" card shows same (if no prior months) |
| AC-09-02 | User had 3 losing days and 2 winning days in last 5 days | Daily P&L chart renders | 3 bars in red (#EF4444), 2 bars in green (#10B981); heights proportional to absolute P&L values |
| AC-09-03 | User follows 3 other virtual traders | Following comparison section renders | Bar chart shows user + 3 comparisons; highest P&L bar highlighted; user bar labeled "You" |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-09-01 | No trades exist yet | All sections show zero state with illustration | "Start trading to see your P&L analytics." | — |
| FC-09-02 | Following P&L API returns 403 (followed user revoked visibility) | Hide that user's bar; show remaining | *(silent; no error state)* | — |
| FC-09-03 | Daily P&L API returns 500 | Section D shows error state | "Daily chart unavailable. Tap to retry." | API_503 |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| All daily P&L values are exactly 0 (no trades in 30 days) | Bar chart renders all zero-height bars in fog (#ADAAAA); "No trading activity in this period" label |
| Cumulative P&L is negative (user is net losing) | Cumulative line is below baseline; area shaded in negative (#EF4444) 20% opacity |
| User follows 10 accounts | Following comparison shows top 5 by realized P&L%; "See More (5)" button expands to full list |

---

### FR-PORT-10: Virtual Funds Label

**Actor:** F0 Trader

**Description:**
A non-dismissible "Virtual Funds" chip must be visible at all times on every screen within the virtual trading flow. This is a regulatory/compliance requirement (BR-18) to prevent user confusion between paper trading and real trading.

**Label Specification:**
- **Component:** `VirtualFundsLabelChip` — a fixed-position pill/chip rendered in the top navigation bar area of every virtual trading screen.
- **Position:** Top-right of screen header, below the status bar.
- **Dimensions:** Height 22dp; min-width 80dp; horizontal padding 8dp.
- **Background:** plasma (#D277FF) at 15% opacity.
- **Border:** 1dp plasma (#D277FF) solid.
- **Text:** Locale-aware (see below); Space Grotesk Medium 11sp.
- **Text color:** plasma (#D277FF).
- **Dismissible:** FALSE. No close/X button. Cannot be hidden by user.
- **Z-index:** Always on top of content; never obscured by bottom sheets or modals.

**Locale-Aware Text:**

| Device Locale | Label Text |
|--------------|-----------|
| `vi` (Vietnamese) | "Tiền ảo" |
| `ko` (Korean) | "가상 자금" |
| `en` and all other locales | "Virtual Funds" |

Locale detection: use device locale (`Intl` API / React Native `NativeModules.I18nManager.localeIdentifier`). The label does NOT follow the app's display language setting — it follows the device OS locale. This ensures maximum clarity for users who may have set the app to English but read Vietnamese.

**Screens where chip is mandatory:**

| Screen | Chip Required |
|--------|--------------|
| PortfolioDashboardScreen | YES |
| HoldingsListScreen | YES |
| HoldingDetailScreen | YES |
| PlaceOrderBottomSheet | YES |
| OrderConfirmationScreen | YES |
| OpenOrdersScreen | YES |
| TradeHistoryScreen | YES |
| ModifyOrderScreen | YES |
| PortfolioResetModal | YES |
| PnLAnalyticsScreen | YES |

**Input:** Device locale (read-only system value).

**Output:** Chip rendered with correct locale text on all listed screens.

**Preconditions:** User is on any virtual trading screen.

**Postconditions:** Chip is visible at all times.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-10-01 | Device locale is `vi-VN` | User opens PortfolioDashboardScreen | Chip displays "Tiền ảo" with plasma border; no close button present |
| AC-10-02 | Device locale is `ko-KR` | User opens PlaceOrderBottomSheet | Chip displays "가상 자금"; chip is not obscured by bottom sheet |
| AC-10-03 | Device locale is `fr-FR` | User opens TradeHistoryScreen | Chip displays "Virtual Funds" (English fallback) |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|--------------|--------------------|-----------:|
| FC-10-01 | Device locale cannot be read | Default to "Virtual Funds" (English) | — | — |
| FC-10-02 | Bottom sheet opens and overlaps chip area | Chip must float above bottom sheet via z-index; if overlap is unavoidable, chip repositions to below status bar above sheet | — | — |

**Edge Cases:**

| Case | Expected Behavior |
|------|------------------|
| User changes device locale while app is open (hot locale switch) | Chip text updates on next screen mount; does not hot-reload in real-time on the same screen |
| Screen uses a custom header component that hides the default nav bar | `VirtualFundsLabelChip` is injected as an absolute-positioned overlay, not dependent on navigation header |

---

### FR-PORT-11: Corporate Actions, Trading Restrictions & Price Alerts

**Actor:** F0 Trader (passive recipient of system-driven notifications)

**Description:**
Three supporting APIs provide context that affects how holdings and orders are displayed and whether certain order placements should be blocked or warned.

---

**11.1 — Corporate Action Events**

API: `GET /api/v1/virtual/equity/event/by-stock?stockCode={ticker}`

Returns pending and historical corporate action events (stock splits, dividends, rights issues) for a given ticker that affect virtual account positions.

When to call: when user opens `HoldingDetailScreen` for a specific holding, or when polling detects a holding whose quantity has changed unexpectedly since last poll.

Display rules:
- If a pending corporate action exists for a holding: show an amber info banner on `HoldingDetailScreen`: "Sự kiện doanh nghiệp đang chờ xử lý: [loại sự kiện]. Số lượng cổ phần và giá có thể thay đổi."
- After a split event is applied (quantity adjusted): show a one-time snackbar "Số lượng cổ phần [TICKER] đã được điều chỉnh do [tách cổ phiếu / phát hành quyền]."

---

**11.2 — Trading Restriction List**

API: `GET /api/v1/virtual/equity/limited-stock`

Returns a list of stock codes that have trading restrictions in the virtual trading engine (e.g., due to pending corporate action processing).

When to call: on Portfolio Dashboard mount and after each polling tick. Cache the list for 60 seconds — do not re-fetch on every 15s polling tick (the list changes infrequently).

Display rules:
- If a holding's ticker appears in the restricted list: show a plasma badge "Hạn chế" next to the ticker on the Holdings List row and on `HoldingDetailScreen`.
- If user attempts to place an order for a restricted ticker: block the order form with a banner: "Cổ phiếu này hiện đang bị hạn chế giao dịch ảo. Vui lòng thử lại sau."
- Restricted tickers remain in the holdings list (read-only); unrealized P&L continues to display using the last known price.

---

**11.3 — Ceiling / Floor Price Notifications**

API: `GET /api/v1/virtual/hit-the-ceiling-or-floor-price`

Returns notifications for stocks in the user's virtual portfolio that have hit their daily price ceiling (tăng trần) or floor (giảm sàn) during the current trading session.

When to call: during each 15-second dashboard polling tick. Only trigger notifications for stocks the user currently holds.

Display rules:
- Ceiling hit: show a lime badge "Trần" on the affected holding row in the Holdings List.
- Floor hit: show a negative (#EF4444) badge "Sàn" on the affected holding row.
- Both badges disappear at end of trading session (14:45 ICT) or on app relaunch next trading day.
- Do NOT show push notifications for ceiling/floor on holdings the user does not own.

---

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-11-01 | A stock in user's holdings has a pending stock split event | User opens HoldingDetailScreen for that stock | Amber banner visible: "Sự kiện doanh nghiệp đang chờ xử lý: Tách cổ phiếu. Số lượng cổ phần và giá có thể thay đổi." |
| AC-11-02 | A stock the user holds is in the limited-stock list | User views Holdings List | "Hạn chế" plasma badge appears on that holding row |
| AC-11-03 | User attempts to place a buy/sell order for a restricted ticker | Order form opens | Order form blocked with banner "Cổ phiếu này hiện đang bị hạn chế giao dịch ảo." |
| AC-11-04 | A stock in user's holdings hits daily ceiling during trading hours | Next 15s poll returns ceiling data | "Trần" lime badge appears on that holding's row |
| AC-11-05 | A stock in user's holdings hits daily floor | Next 15s poll returns floor data | "Sàn" red (#EF4444) badge appears on that holding's row |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message |
|-------|----------|--------------|---------------------|
| FC-11-01 | `event/by-stock` returns 404 (no events) | No banner shown; normal display | — |
| FC-11-02 | `limited-stock` API returns 500 | Assume no restrictions this poll; retry next tick; no false restriction badges shown | — |
| FC-11-03 | `hit-the-ceiling-or-floor-price` returns 500 | Skip notification this tick; no ceiling/floor badges shown; retry next poll | — |

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-01 | All orders placed through the virtual trading system are simulated. No orders are routed to real exchanges (HOSE, HNX, UPCoM, NASDAQ, NYSE, KOSPI, KOSDAQ). | Any code path that would route to a real exchange is a critical bug. System must reject and log. |
| BR-02 | A user's virtual account is initialized exactly once via `POST /api/v1/virtual/accounts`. Subsequent initialization attempts return the existing account. | Duplicate initialization attempts return the existing account data (idempotent); no duplicate account created. |
| BR-03 | Starting balance is exactly 500,000,000 VND. This value is not configurable by the user or any admin action other than a portfolio reset. | Attempts to set any other starting balance must be rejected at the API level with HTTP 400. |
| BR-04 | Portfolio reset restores the cash balance to exactly 500,000,000 VND — not 499,999,999 and not 500,000,001. | Reset API validates output balance = 500000000 before committing; rolls back if not equal. |
| BR-05 | P&L values (unrealized and realized) must be color-coded: positive value → #10B981 (positive token); negative value → #EF4444 (negative token); zero → #ADAAAA (fog token). No other colors are permitted for P&L display. | QA rejects any P&L value rendered in a color other than the three above. |
| BR-06 | VN equity orders (HOSE, HNX, UPCoM) must specify quantity as a positive multiple of 100 shares (board lot rule). Quantities of 1–99 and any non-multiple of 100 are invalid. | Order form validation rejects invalid quantities with message: "Quantity must be a multiple of 100 shares for VN equities." API also returns 400 if submitted. |
| BR-07 | The simulated fee for all trades is 0.1% of trade value: `fee = trade_value × 0.001`. This fee is deducted from realized P&L on SELL trades. Fee is NOT charged on BUY trades but IS included in the cost basis via avg_buy_price. | If fee is not deducted, realized P&L figures will be incorrect; treated as a P1 calculation bug. |
| BR-08 | Average buy price is calculated as a weighted average across all buy fills for a ticker: `avg_buy_price = SUM(fill_price_i × qty_i) / SUM(qty_i)`. It recalculates on each new BUY fill for that ticker. Selling shares does NOT change avg_buy_price. | Incorrect avg_buy_price leads to wrong unrealized P&L. Treated as P1 calculation bug. |
| BR-09 | A maximum of 10 open PENDING orders may exist at any time for a single virtual account. QUEUED_AFTER_HOURS and SUSPENDED orders do not count toward this limit. | 11th PENDING order submission is rejected at client (pre-check) and API (HTTP 400 with code ORD_LIMIT_EXCEEDED). |
| BR-10 | The "Virtual Funds" chip (FR-PORT-10) must be rendered on every virtual trading screen at all times. It must not be dismissible, hideable, or removable by any user action or developer flag in production builds. | Missing chip on any virtual trading screen is a P1 compliance bug. Automatic release blocker. |
| BR-11 | Trade history records are never deleted. Portfolio resets mark records with `pre_reset = true` but do not delete them. | Attempts to delete trade records must be rejected. |
| BR-12 | `[Pre-Reset]` prefix must appear on all trade history rows where `pre_reset = true`. The prefix must be visually distinct (red badge). It must also appear in exported/shared trade history. | Missing prefix on pre-reset trades is a P2 data integrity bug. |
| BR-13 | Portfolio reset is a double-confirmation flow: Step 1 (warning modal) + Step 2 (type "RESET" exactly, case-sensitive). A single-tap reset is not permitted. | Any reset triggered without both confirmation steps is a P0 security/UX bug. |
| BR-14 | KR and Global equity orders that cannot be filled synchronously (due to market hours) are queued in QUEUED_AFTER_HOURS status for up to 48 hours. After 48 hours, if still unfilled, order transitions to EXPIRED. | Orders remaining in QUEUED_AFTER_HOURS > 48h must be expired by the server-side scheduler. Client shows live TTL countdown. |
| BR-15 | GTC_30D (Good Till Cancel, 30 days) orders expire after exactly 30 calendar days from placement if not filled. | Server expires the order at 30 days; client does not need to compute this. Order disappears from open orders list on next poll after expiry. |
| BR-16 | ATO orders are valid only during pre-market session (08:15–09:00 VN time, i.e., ICT UTC+7). ATC orders are valid only during pre-close session (14:30–14:45 VN time). Submissions outside these windows are rejected. | Server returns HTTP 422 with ORD_422; client shows localized error message. |
| BR-17 | Portfolio reset must close all positions atomically. Either all positions are closed and balance is restored, or none are. Partial resets are not permitted. | If partial state is detected post-reset (holdings > 0 and balance = 500M), treat as P0 data corruption. Alert on-call. |
| BR-18 | Portfolio total value computation is: `portfolio_total_value = available_balance + SUM(holdings.qty × current_price)`. Delisted holdings (where current_price is null) are excluded from this sum. | Inclusion of delisted holdings at null price would cause NaN in display. Treat as P2 calculation bug. |
| BR-19 | Available balance computation is: `available_balance = total_cash - SUM(buy_limit_reserves)`. When a BUY LO order is placed, `limit_price × quantity` is reserved immediately. When cancelled or filled, the reserve is released or consumed respectively. | Incorrect reserve calculation leads to overselling or overborrowing virtual cash. Treat as P1 calculation bug. |
| BR-20 | All financial values displayed in the app must use tabular-nums font variant (Space Grotesk) to prevent digit-width shifting during live updates. | Non-tabular font on financial values is a P3 UI bug. |

---

## 4. Acceptance Criteria Summary

| FR ID | FR Name | AC IDs | Test Type |
|-------|---------|--------|-----------|
| FR-PORT-01 | Portfolio Dashboard | AC-01-01 through AC-01-05 | UI, Integration, Polling |
| FR-PORT-02 | Holdings Management | AC-02-01 through AC-02-03 | UI, Calculation, Integration |
| FR-PORT-03 | Portfolio Value Chart | AC-03-01 through AC-03-03 | UI, Integration, Edge |
| FR-PORT-04 | Trade History | AC-04-01 through AC-04-03 | UI, Filter, Pagination |
| FR-PORT-05 | Open Orders Management | AC-05-01 through AC-05-03 | UI, Gesture, Timer |
| FR-PORT-06 | Place Order | AC-06-01 through AC-06-04 | UI, Validation, Integration, Idempotency |
| FR-PORT-07 | Modify / Cancel Order | AC-07-01 through AC-07-03 | UI, Integration, State |
| FR-PORT-08 | Portfolio Reset | AC-08-01 through AC-08-03 | UI, Integration, Data Integrity |
| FR-PORT-09 | P&L Analytics | AC-09-01 through AC-09-03 | UI, Calculation, Chart |
| FR-PORT-10 | Virtual Funds Label | AC-10-01 through AC-10-03 | UI, Locale, Compliance |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Requirement |
|--------|------------|
| Portfolio dashboard initial load time | p95 < 3 seconds on 4G network (measured from tab tap to all 7 sections rendered) |
| Dashboard polling response time | p95 < 1.5 seconds per polling cycle |
| Order placement round-trip | p95 < 2 seconds from "Confirm" tap to success snackbar |
| Trade history list initial load (20 items) | p95 < 2 seconds |
| Chart render time | p95 < 1.5 seconds from range selection to chart render |
| Cancel order response | p95 < 1.5 seconds from "Confirm Cancel" tap to row removal |
| Polling interval | Exactly 15 seconds ± 500ms; jitter ≤ 500ms |
| App memory footprint (Portfolio tab) | < 50 MB RSS increase from baseline when Portfolio tab is mounted |

### 5.2 Availability

| Metric | Requirement |
|--------|------------|
| Virtual trading API uptime | 99.5% monthly uptime (SLA) |
| Dashboard graceful degradation | If any single API call fails, remaining sections render with data; only the failed section shows an error state |
| Offline behavior | Dashboard renders last cached data (up to 5 minutes old) with "Offline — showing cached data" banner; no crash |
| Portfolio reset availability | Reset flow must not be available if API health check fails; "Reset temporarily unavailable" shown instead |

### 5.3 Security

| Requirement | Detail |
|-------------|--------|
| Authentication | All `/api/v1/virtual/` API calls require a valid JWT token. **Header format: `Authorization: jwt <accessToken>`** (NOT `Bearer` — API v1.5.0 uses `jwt` prefix; using `Bearer` returns HTTP 401). Expired tokens trigger force logout and redirect to login screen. |
| Order idempotency | Client generates UUID v4 `X-Idempotency-Key` for every order placement and modification request. Key is stored in device memory for 10 seconds post-submission. |
| No real-money exposure | No payment gateway integrations, no VND fiat transfer APIs, no real brokerage account linking may be present in any code path reachable from the virtual trading module. |
| Data scope | Virtual account data is scoped per authenticated user. Cross-account data access (other than opt-in following P&L) must be rejected at API level. |
| Portfolio reset confirmation | The "RESET" confirmation string is validated client-side AND server-side. Server rejects reset requests without the confirmation token. |
| Rate limiting | Order placement API: max 10 requests per 60 seconds per user. Excess requests return HTTP 429 with message "Too many orders. Wait before placing another." |
| Sensitive data display | Average buy price and P&L figures are not cached in device clipboard or screenshots by default (use `secureTextEntry` equivalent where applicable on sensitive financial fields). |

### 5.4 Usability / Accessibility

| Requirement | Detail |
|-------------|--------|
| Minimum touch target size | All interactive elements (buttons, swipe actions, chart range tabs) must be minimum 44×44dp per iOS HIG and Android Material guidelines |
| VoiceOver / TalkBack | All financial values must have accessible labels: e.g., "Total portfolio value: 523 million 450 thousand VND, up 23 million 450 thousand VND today" |
| Color contrast | All text on ink-900 background must meet WCAG AA contrast ratio (4.5:1 for body text, 3:1 for large text) |
| P&L color accessibility | P&L positive/negative colors must not be the only differentiator; also use +/- sign prefix and up/down arrow icons |
| Loading states | All API-fetched sections must show a skeleton loader during initial fetch; no blank white flashes |
| Error recovery | All error states include a clearly labeled "Retry" action; no dead-ends |

### 5.5 Compliance

| Requirement | Detail |
|-------------|--------|
| Virtual funds labeling | BR-18 / FR-PORT-10 compliance is a release blocker. Automated UI test must verify chip presence on each virtual screen before each production build. |
| No broker impersonation | The app must not display language implying it is a licensed broker (e.g., "Your portfolio" is acceptable; "Your brokerage account" is not). |
| Age-gated access | Portfolio tab is accessible only to verified users (age verification completed during onboarding). Users who bypass age verification should not have access to virtual trading. |
| Data retention | Trade history records must be retained for the lifetime of the user account (no auto-deletion). Users may export their trade history as CSV from Profile settings (out of scope for this FRD, referenced for data model awareness). |

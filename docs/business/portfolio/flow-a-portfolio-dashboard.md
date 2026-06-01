# Flow A — Portfolio Dashboard

Version: 1.0 | Date: 2026-06-01 | Audience: PO · BA · Design · Dev · QA

---

## Table of Contents

1. [Flow Summary](#1-flow-summary)
2. [Business Flow](#2-business-flow)
3. [Screen Sections Spec](#3-screen-sections-spec)
4. [Acceptance Criteria](#4-acceptance-criteria)
5. [Design Analysis](#5-design-analysis)
6. [Edge Cases](#6-edge-cases)
7. [Business ↔ Design Alignment](#7-business--design-alignment)
8. [QA Test Cases](#8-qa-test-cases)
9. [Design Gaps / Risks](#9-design-gaps--risks)
10. [Related Documents](#10-related-documents)

---

## 1. Flow Summary

| Field | Value |
|-------|-------|
| Flow ID | FLOW-A |
| Feature Reference | Portfolio / Virtual Trading Dashboard |
| Actor | F0 trader (age 16–27, Vietnamese market beginner) |
| Trigger | User taps "Danh Mục" (Portfolio) in bottom navigation |
| Entry State | User is authenticated; virtual account exists (or is being created) |
| Exit States | (A) Dashboard fully loaded with live data; (B) Error state with retry prompt |
| Primary APIs | GET profit-loss, GET accumulative-profit-loss, GET realized-profit-loss/history, GET buyable, GET sellable |
| Error Codes | E-PT-101, E-PT-108, E-PT-109, E-PT-116 |
| Refresh Cycle | Every 15 seconds |

---

## 2. Business Flow

```
┌────────────────────────────────────────────────────────────────────┐
│  USER TAPS "Danh Mục" TAB                                         │
└─────────────────────────┬──────────────────────────────────────────┘
                          │
                          ▼
               ┌──────────┴──────────┐
               │  Virtual account    │
               │  exists?            │
               └──────────┬──────────┘
                          │
              ┌───────────┴───────────┐
              │ NO                    │ YES
              ▼                       ▼
   POST /virtual/accounts      START PARALLEL FETCH
   (500M VND balance)                 │
              │                       │
        ┌─────┴─────┐                 │
        │  Success  │                 │
        └─────┬─────┘                 │
              │                       │
              └───────────┬───────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │  PARALLEL API CALLS            │
         │  ┌─────────────────────────┐   │
         │  │ GET profit-loss         │   │
         │  └─────────────────────────┘   │
         │  ┌─────────────────────────┐   │
         │  │ GET accumulative-p-l    │   │
         │  └─────────────────────────┘   │
         │  ┌─────────────────────────┐   │
         │  │ GET realized-p-l/history│   │
         │  └─────────────────────────┘   │
         │  ┌─────────────────────────┐   │
         │  │ GET buyable             │   │
         │  └─────────────────────────┘   │
         │  ┌─────────────────────────┐   │
         │  │ GET sellable            │   │
         │  └─────────────────────────┘   │
         └────────────────┬───────────────┘
                          │
               ┌──────────┴──────────┐
               │  All calls succeed? │
               └──────────┬──────────┘
                          │
              ┌───────────┴───────────┐
              │ PARTIAL / FAIL        │ ALL SUCCESS
              ▼                       ▼
   Show stale-data banner      RENDER DASHBOARD
   for failed sections;        7 sections in order
   retry button per section            │
                                       │
                              ┌────────┴────────┐
                              │  START 15s TIMER │
                              └────────┬────────┘
                                       │
                              ┌────────┴────────┐
                              │  Timer fires    │
                              └────────┬────────┘
                                       │
                              ┌────────┴────────┐
                              │  App in         │
                              │  foreground?    │
                              └────────┬────────┘
                                       │
                          ┌────────────┴────────────┐
                          │ NO (background)         │ YES
                          ▼                         ▼
                  Pause refresh loop      Repeat parallel fetch
                  Resume on foreground    Update changed sections
                                          Restart 15s timer
```

**Decision points:**

| Decision | YES path | NO path |
|----------|----------|---------|
| Virtual account exists? | Skip initialization | POST /virtual/accounts |
| All API calls succeed? | Render full dashboard | Show partial/error state |
| App in foreground at refresh? | Fetch new data | Pause; resume on return |
| Market open? | Show live prices | Show last known price + "Đã đóng cửa" badge |

---

## 3. Screen Sections Spec

The dashboard renders 7 sections in fixed order. All monetary values display the "Tiền ảo" badge.

---

### Section 1 — Tổng Giá Trị Danh Mục (Total Portfolio Value)

**Data source:** `GET /api/v1/virtual/equity/account/profit-loss`

**Formula:**
```
Total Value = available_balance + SUM(holding.qty × holding.current_price)
Daily Change = Total Value − Total Value at market open
Daily Change % = (Daily Change / Total Value at market open) × 100
```

**Display:**
```
┌──────────────────────────────────────────┐
│  Tiền ảo                                 │
│  Tổng Giá Trị Danh Mục                  │
│  500,000,000 VND              [badge]    │
│  ▲ +12,500,000 (+2.5%) hôm nay          │
│  Cập nhật lúc 09:35:22                  │
└──────────────────────────────────────────┘
```

**Behaviour:**
- Green text and up-arrow if positive daily change
- Red text and down-arrow if negative daily change
- Gray text if no change
- Timestamp shows last refresh time (updates every 15s)

---

### Section 2 — Số Dư Khả Dụng (Available Cash)

**Data source:** `GET /api/v1/virtual/equity/account/buyable`

**Formula:**
```
Available Cash = total_cash − reserved_amount
```

**Display:**
```
┌──────────────────────────────────────────┐
│  Số Dư Khả Dụng                         │
│  480,000,000 VND              [Tiền ảo] │
│  (Đang giữ: 20,000,000 VND)             │
│   └── 2 lệnh mua đang chờ              │
└──────────────────────────────────────────┘
```

**Behaviour:**
- "Đang giữ" (reserved) row is hidden if reserved_amount = 0
- Reserved tooltip explains which orders are holding the amount

---

### Section 3 — Danh Sách Cổ Phiếu Đang Nắm Giữ (Holdings List)

**Data source:** `GET /api/v1/virtual/equity/account/sellable` + price data from profit-loss endpoint

**Default sort:** Unrealized P&L % descending (best performers first)

**Each row:**
```
┌──────────────────────────────────────────────────────────┐
│  [TICKER]    [qty] CP    Giá TB: [avg_price] VND         │
│  [current_price] VND     P&L: ▲ +[amount] (+[%])  [🔒]  │
└──────────────────────────────────────────────────────────┘
```

- `[🔒]` soft-lock icon appears when qty is partially or fully locked by a pending SELL order
- Soft-locked qty shown as "(X CP đang chờ bán)"
- Row tap → Stock detail screen (out of scope for this spec)
- Long-press → Context menu: "Mua thêm" / "Bán"

**Empty state:**
```
┌──────────────────────────────────────────┐
│  Bạn chưa có cổ phiếu nào              │
│  Bắt đầu giao dịch ngay với tiền ảo     │
│  [Khám phá cổ phiếu]                   │
└──────────────────────────────────────────┘
```

**Sort options (tap header):**
- P&L % (default, descending)
- Ticker (A→Z)
- Giá trị (market value, descending)
- Ngày mua (newest first)

---

### Section 4 — Biểu Đồ Giá Trị Danh Mục (Portfolio Value Chart)

**Data source:** `GET /api/v1/virtual/equity/account/accumulative-profit-loss`

**Tab options:** 1D · 1W · 1M · 3M · 1Y

**Visual elements:**
```
┌──────────────────────────────────────────────────────────┐
│  [1D] [1W] [1M] [3M] [1Y]                               │
│                                                          │
│  550M ─                              ●                  │
│  525M ─                         ╱─────                  │
│  500M ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ (baseline)              │
│  475M ─   ╲         ╱                                   │
│  450M ─    ╲───────╱                                    │
│       │                         │                       │
│     Đặt lại                Reset marker                 │
│     [R]                                                  │
└──────────────────────────────────────────────────────────┘
```

- Dashed horizontal line at 500,000,000 VND (baseline)
- [R] markers at each portfolio reset event
- Scrub interaction: finger drag shows tooltip with date + value
- Chart line color: green if current value > baseline, red if below

---

### Section 5 — Lãi/Lỗ Đã Thực Hiện (Realized P&L)

**Data source:** `GET /api/v1/virtual/equity/account/profit-loss` (lifetime_realized_pnl field)

**Display:**
```
┌──────────────────────────────────────────┐
│  Lãi/Lỗ Đã Thực Hiện          [Tiền ảo]│
│  ▲ +8,250,000 VND                       │
│  Xem chi tiết →                         │
└──────────────────────────────────────────┘
```

- Entire row is tappable → P&L Breakdown screen
- Arrow icon indicates it is interactive

---

### Section 6 — Lịch Sử Giao Dịch (Trade History)

**Data source:** `GET /api/v1/virtual/equity/account/realized-profit-loss/history`

**Filter bar:**
```
┌──────────────────────────────────────────┐
│  [Tất cả] [Mua] [Bán]   [Lọc] [Tìm...]  │
└──────────────────────────────────────────┘
```

**Each row:**
```
┌──────────────────────────────────────────┐
│  [TICKER] · Mua · 500 CP               │
│  22,000 VND/CP · 22/05/2026 09:42       │
│  [Pre-Reset]                            │  ← only if applicable
└──────────────────────────────────────────┘
```

**Filters:**
- By ticker (text search)
- By date range (date picker)
- By side (Mua / Bán / Tất cả)

**Pre-reset entries:** labeled with a pill badge `[Pre-Reset]` in gray; grouped or separated by a divider "── Trước khi đặt lại ──"

---

### Section 7 — Lệnh Chờ (Open Orders)

**Data source:** Derived from profit-loss endpoint and order state tracking

**States displayed:**

| State | Vietnamese label | Visual |
|-------|-----------------|--------|
| PENDING | Đang chờ khớp | Yellow dot |
| QUEUED_AFTER_HOURS | Chờ phiên sau | Blue dot |
| SUSPENDED | Tạm dừng (cổ phiếu bị đình chỉ) | Orange dot |

**Each row:**
```
┌──────────────────────────────────────────────────────────┐
│  [●] [TICKER]   Mua · 500 CP · Giá: 22,000 VND          │
│      LO · GTC   Đang chờ khớp          [Hủy] ←swipe     │
└──────────────────────────────────────────────────────────┘
```

- Swipe-left reveals "Hủy lệnh" (Cancel) button in red
- Tap row → Order detail screen
- SUSPENDED orders show info: "Cổ phiếu bị đình chỉ giao dịch — lệnh sẽ tiếp tục khi giao dịch được nối lại"

**Empty state:**
```
┌──────────────────────────────────────────┐
│  Không có lệnh chờ                      │
│  Các lệnh đang chờ khớp sẽ hiển thị ở  │
│  đây                                    │
└──────────────────────────────────────────┘
```

---

## 4. Acceptance Criteria

**AC-A-01**
- Given: A user with a new virtual account opens the Portfolio tab
- When: The screen finishes loading
- Then: All 7 sections are visible; the "Tiền ảo" badge appears adjacent to the total portfolio value; Section 1 shows 500,000,000 VND; Section 3 shows empty-state message

**AC-A-02**
- Given: A user has existing holdings
- When: The Portfolio Dashboard loads
- Then: Holdings are sorted by Unrealized P&L% in descending order by default; the highest-performing stock appears first

**AC-A-03**
- Given: The dashboard is displayed
- When: 15 seconds elapse
- Then: All monetary values automatically refresh without user interaction; the "Cập nhật lúc" timestamp updates to reflect the new time

**AC-A-04**
- Given: A user has one or more pending BUY orders
- When: Section 2 (Available Cash) is rendered
- Then: The "Đang giữ" row is visible showing the total reserved amount; the number matches qty × limit_price × 1.001 for each pending BUY order

**AC-A-05**
- Given: A user has a pending SELL order for stock VNM
- When: VNM is displayed in Section 3 (Holdings)
- Then: The soft-lock icon (🔒) appears next to VNM; the soft-locked quantity is shown as "(X CP đang chờ bán)"

**AC-A-06**
- Given: A user taps the Realized P&L row in Section 5
- When: The tap is registered
- Then: The app navigates to the P&L Breakdown screen showing lifetime realized P&L and per-ticker breakdown

**AC-A-07**
- Given: The Portfolio Value Chart (Section 4) is displayed with the 1M tab selected
- When: The chart renders
- Then: A dashed horizontal baseline line appears at exactly 500,000,000 VND; any portfolio reset events are marked with [R] vertical markers

**AC-A-08**
- Given: The user has trade history spanning a portfolio reset
- When: Trade History (Section 6) is displayed
- Then: Trades executed before the reset are labeled with the [Pre-Reset] badge; a section divider "── Trước khi đặt lại ──" separates pre- and post-reset trades

**AC-A-09**
- Given: The app enters the background (user switches to another app)
- When: The 15-second refresh timer fires
- Then: The API call does NOT execute; the refresh resumes immediately when the app returns to the foreground

**AC-A-10**
- Given: One or more API calls fail during dashboard load
- When: The partial failure occurs
- Then: Successfully loaded sections render normally; failed sections display a stale-data indicator and a per-section retry button; the app does not crash

**AC-A-11**
- Given: A PENDING order in Section 7 (Open Orders) is displayed
- When: The user swipes left on the order row
- Then: A red "Hủy lệnh" button slides into view; tapping it triggers the cancellation flow with a confirmation dialog

**AC-A-12**
- Given: No holdings exist and no open orders exist
- When: Sections 3 and 7 render
- Then: Both sections show their respective empty-state messages in Vietnamese with a call-to-action

---

## 5. Design Analysis

### Wireframe Layout (Portrait)

```
┌──────────────────────────────────┐
│  ← Danh Mục          [⚙] Tiền ảo│  ← Header
├──────────────────────────────────┤
│                                  │
│   Tổng Giá Trị Danh Mục         │
│   500,000,000 VND                │  ← Section 1
│   ▲ +12,500,000 (+2.5%) hôm nay │
│                                  │
├──────────────────────────────────┤
│  Số Dư Khả Dụng                 │
│  480,000,000 VND    [Tiền ảo]   │  ← Section 2
│  Đang giữ: 20,000,000 VND       │
├──────────────────────────────────┤
│  Cổ Phiếu Đang Nắm Giữ  [Sắp xếp]│
│  ┌────────────────────────────┐  │
│  │ VNM  500 CP  Giá TB:22,000 │  │
│  │ 22,500  ▲ +250,000 (+2.3%) │  │  ← Section 3
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │ HPG  200 CP  Giá TB:41,000 │  │
│  │ 40,100  ▼ −180,000 (−2.2%)│  │
│  └────────────────────────────┘  │
├──────────────────────────────────┤
│  Biểu Đồ Giá Trị                │
│  [1D][1W][1M][3M][1Y]           │
│  ╭──────────────────────╮        │
│  │    chart area        │        │  ← Section 4
│  │ - - - - - 500M - - - │        │
│  ╰──────────────────────╯        │
├──────────────────────────────────┤
│  Lãi/Lỗ Đã Thực Hiện            │
│  ▲ +8,250,000 VND    Xem thêm → │  ← Section 5
├──────────────────────────────────┤
│  Lịch Sử Giao Dịch              │
│  [Tất cả][Mua][Bán]  [Lọc]      │
│  VNM · Mua · 500 CP · 22,000    │  ← Section 6
│  ...more rows...                 │
├──────────────────────────────────┤
│  Lệnh Chờ                       │
│  ● VNM · Mua 500 CP · LO 21,500 │  ← Section 7
│  Đang chờ khớp             [Hủy]│
├──────────────────────────────────┤
│  [Trang chủ][Khám phá][Danh Mục*][Hồ Sơ]│  ← Bottom Nav
└──────────────────────────────────┘
```

### Component Usage

| Section | Components |
|---------|-----------|
| Header | AppBar with title, Settings IconButton, "Tiền ảo" Badge |
| Section 1 | MetricCard (large), DeltaIndicator (color-coded) |
| Section 2 | MetricCard (medium), CollapsibleRow for reserved |
| Section 3 | SortableList, HoldingRow, SoftLockIcon, EmptyState |
| Section 4 | TabBar, LineChart with BaselineMark, ScrubTooltip, ResetMarker |
| Section 5 | TappableMetricRow, DeltaIndicator |
| Section 6 | FilterBar, TradeHistoryRow, PreResetBadge, SectionDivider |
| Section 7 | SwipeableRow with CancelAction, OrderStatusDot, EmptyState |

### Interaction Rules

1. All swipeable rows (Section 7) must have a visual affordance (subtle shadow or handle)
2. Price values use Vietnamese number format: 1.000.000 VND (period as thousands separator)
3. Positive P&L: green (#10B981 or design system success color); negative: red (#EF4444)
4. "Tiền ảo" badge must contrast against all background colors; never overlap currency values
5. Section 4 chart must be touch-draggable for scrubbing; pinch-to-zoom disabled
6. Loading states: skeleton loaders per section (not a full-screen spinner)
7. Pull-to-refresh gesture triggers immediate data fetch (overrides the 15s timer)

---

## 6. Edge Cases

| ID | Scenario | Handling |
|----|----------|----------|
| EC-A-01 | API returns empty holdings array | Section 3 shows empty state; Section 1 total = available_balance only |
| EC-A-02 | One API call fails, others succeed | Failed section shows stale indicator + retry; other sections render normally |
| EC-A-03 | Market is closed (after 14:45 ICT) | Prices show last known values; "Giá đóng cửa" label on each price |
| EC-A-04 | All shares soft-locked (all in pending SELL) | Available sellable qty = 0; Holdings show full lock state |
| EC-A-05 | Available balance = 0 (all reserved) | Section 2 shows 0 VND available; "Đang giữ" shows full balance |
| EC-A-06 | More than 10 rows in Holdings | Section 3 shows first 5 with "Xem tất cả (N cổ phiếu)" expand button |
| EC-A-07 | More than 10 open orders | Section 7 shows first 5 with "Xem tất cả (N lệnh)" expand button |
| EC-A-08 | Chart data unavailable | Section 4 shows error state: "Không thể tải biểu đồ" with retry |
| EC-A-09 | Very large portfolio value (>1 billion) | Format as "1.234.567.890 VND" — no abbreviation; horizontal scroll if needed |
| EC-A-10 | Connectivity lost mid-session | Show connection banner; pause refresh; resume when reconnected |
| EC-A-11 | Pre-reset history only (no current trades) | Trade History shows only [Pre-Reset] entries; Section 1 reflects fresh balance |
| EC-A-12 | SUSPENDED order in Section 7 | Orange dot; row shows suspension reason; no swipe-cancel while suspended (cancel still allowed via button) |

---

## 7. Business ↔ Design Alignment

| Business Rule | Design Implementation | Status |
|---------------|----------------------|--------|
| "Tiền ảo" always visible | Persistent badge in header + adjacent to Section 1 value | Required |
| 15s auto-refresh | Silent background refresh; timestamp update only; no flash/reload | Required |
| Sort by P&L% desc | Default sort applied on load; sort header shows active sort | Required |
| Reserved balance deducted from display | Section 2 shows net available; tooltip shows breakdown | Required |
| Soft-lock indicator | Lock icon on Holdings row; qty shown as "(X CP đang chờ bán)" | Required |
| 500M VND baseline on chart | Dashed horizontal line at 500M on all chart timeframes | Required |
| [Pre-Reset] label on history | Gray pill badge + section divider in Trade History | Required |
| Swipe-left cancel in Open Orders | Swipe gesture on Section 7 rows | Required |
| Empty states for no data | Custom empty state messages per section (Vietnamese) | Required |
| Market closed indication | "Giá đóng cửa" label; no live price indicator | Required |

---

## 8. QA Test Cases

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| QA-A-01 | Dashboard loads all 7 sections | User authenticated; virtual account exists with holdings | 1. Tap "Danh Mục" tab | All 7 sections render; "Tiền ảo" badge visible; no errors |
| QA-A-02 | Fresh account shows 500M balance | New account, no trades, no orders | 1. Tap "Danh Mục" tab | Section 1 = 500,000,000 VND; Section 3 = empty state; Section 7 = empty state |
| QA-A-03 | 15s auto-refresh updates values | Dashboard loaded; mock price change after 15s | 1. Wait 15 seconds | Section 1 value updates; timestamp updates; no page reload |
| QA-A-04 | Soft-lock icon shown for pending SELL | User has 500 VNM shares and a pending SELL order for 200 VNM | 1. Open Portfolio tab | VNM row shows lock icon; shows "(200 CP đang chờ bán)" |
| QA-A-05 | Holdings sorted by P&L% desc | User holds VNM (+5%), HPG (−2%), FPT (+1%) | 1. Open Portfolio tab | Order: VNM, FPT, HPG |
| QA-A-06 | Sort order change | Holdings list displayed | 1. Tap sort header; select "Ticker A→Z" | Holdings re-sort alphabetically ascending |
| QA-A-07 | Reserved balance shown | User has 1 pending BUY order reserving 10,000,000 VND | 1. Open Portfolio tab | Section 2 "Đang giữ: 10,000,000 VND" visible |
| QA-A-08 | No reserved balance row hidden | User has no pending BUY orders | 1. Open Portfolio tab | Section 2 "Đang giữ" row not visible |
| QA-A-09 | Chart baseline line at 500M | Portfolio Dashboard, any chart tab | 1. Tap any chart tab (1D/1W/1M/3M/1Y) | Dashed horizontal line renders at 500,000,000 VND |
| QA-A-10 | Reset marker on chart | User has performed 1 portfolio reset | 1. Select 1Y chart tab | [R] marker appears at the date of the reset |
| QA-A-11 | P&L breakdown navigation | User has realized P&L > 0 | 1. Tap Section 5 row | Navigates to P&L Breakdown screen |
| QA-A-12 | [Pre-Reset] label in Trade History | User has performed reset; has trades before and after | 1. Open Portfolio tab; scroll to Section 6 | Pre-reset trades show [Pre-Reset] badge; divider separates old and new trades |
| QA-A-13 | Swipe-left cancel on open order | User has at least 1 PENDING order | 1. Scroll to Section 7; swipe-left on order row | Red "Hủy lệnh" button revealed; tap triggers cancellation confirmation |
| QA-A-14 | API failure partial render | Mock one API endpoint to return 500 | 1. Open Portfolio tab | Affected section shows stale indicator + retry button; other sections load normally |
| QA-A-15 | Background refresh paused | Dashboard open; send app to background | 1. Open Portfolio; 2. Press Home; 3. Wait 15s; 4. Return to app | Refresh resumes immediately on foreground return; no refresh while backgrounded |

---

## 9. Design Gaps / Risks

| ID | Gap / Risk | Severity | Recommendation |
|----|-----------|----------|----------------|
| DG-A-01 | No spec for chart interaction when all data is within a single day (1D view with no trades) | Medium | Define empty 1D chart state: show flat line at starting balance |
| DG-A-02 | Holdings list with 20+ stocks may make the dashboard very long; no pagination spec | Medium | Cap visible rows at 5; add "Xem tất cả" expansion; measure scroll depth in analytics |
| DG-A-03 | "Tiền ảo" badge placement not specified for small screens (iPhone SE, 375px) | High | Badge must remain visible on all supported screen sizes; test at 375px |
| DG-A-04 | Number formatting for values exceeding 999,999,999 VND not specified | Low | Confirm with Design: use full number (1.234.567.890 VND) vs. abbreviated (1,23 tỷ) |
| DG-A-05 | SUSPENDED order UI in Section 7: whether cancel is allowed while suspended | Medium | Confirm with BA/PO: business rule says cancel is allowed; design should keep cancel accessible |
| DG-A-06 | Accessibility (screen reader) for color-coded P&L values | High | Red/green color alone is not sufficient; add +/- prefix and up/down icons always |
| DG-A-07 | Dark mode not mentioned in spec | Low | Ensure "Tiền ảo" badge, chart baseline, and P&L colors have dark-mode variants |

---

## 10. Related Documents

- `02-user-flow.md` — Master User Flow Overview
- `flow-b-place-order.md` — Place Order (Buy/Sell) detailed flow
- `flow-c-portfolio-reset.md` — Portfolio Reset detailed flow
- API specification for virtual equity endpoints

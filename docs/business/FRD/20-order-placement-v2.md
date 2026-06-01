# FRD-20: Order Placement V2
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Version:** 1.1
**Date:** 2026-06-01
**Author:** Business Analysis Team
**Supersedes:** FRD-10 §6 UI/UX Notes (Order Entry Screen, Order Confirmation Screen); FRD-20 v1.0
**Linked BRD:** BRD.md §BO-04 (Paper Trading Core Loop), §BO-08
**Linked SRD:** SRD-order-engine-v2.3.md, SRD-20-order-placement-v2.md (to be authored)
**Status:** Draft — Design Confirmed from Screenshots (v1.1 update)

> **V1 Scope:** LO (Limit Order), Stop-Limit, Stop — virtual paper trading only.
> **V2 Roadmap:** Adds real trading account linking. Real trading will support: LO, Stop-Limit, Stop, MP (Market Price), ATO, ATC. V2 spec to be created as a separate document when brokerage integration is defined (see FRD-16 and FRD-i-brokerage.md). All MP, ATO, ATC requirements have been removed from this document.

> **Purpose:** This document specifies the Order Placement V2 screen — the full user interface and interaction model for placing paper trades on Paave. FRD-10 specifies the underlying order engine rules (price bands, fill mechanics, state machine, error codes). This document specifies the screen that exposes those rules to the user. A developer reading this document must be able to implement the complete order placement experience. A QA engineer must be able to write complete test cases covering all 3 order types × BUY/SELL from this document alone.

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [User Flow](#2-user-flow)
3. [UX Screen States](#3-ux-screen-states)
4. [Functional Requirements](#4-functional-requirements)
5. [Business Rules](#5-business-rules)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Edge Cases](#7-edge-cases)
8. [Design Requirements](#8-design-requirements)
9. [Validation Logic Table](#9-validation-logic-table)
10. [Traceability Matrix](#10-traceability-matrix)
11. [Related Documents](#11-related-documents)

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | Order Placement V2 Screen |
| Module Role | Primary trading action surface — the screen where every paper trade begins |
| Primary Actors | Registered user (LEARN_MODE or FULL_ACCESS) |
| Goal | Allow the user to specify, review, and confirm a paper trade order for any supported VN stock across 3 V1 order types (LO, Stop-Limit, Stop) |
| Entry Trigger | User taps "Đặt lệnh" (Trade) button on the Stock Detail screen |
| Supported Exchanges | HOSE, HNX (primary, VN real-time) |
| Markets In Scope | HOSE and HNX markets as supported by FRD-10 |
| Previous Version | FRD-10 §6 UI/UX Notes — basic entry screen; no Stop-Limit, no Stop, no order summary card, no dynamic form switching |
| Non-negotiable | Paper trading only; no real trades executed; VND formatting `1.250.000 ₫`; "Vốn ảo" context shown throughout |

### 1.1 Order Types in Scope (V1)

| Order Type | Vietnamese Name | Tab Label | Price Fields |
|------------|-----------------|-----------|--------------|
| LO | Lệnh Giới Hạn | LO | `price` (limit price) |
| Stop-Limit | Lệnh Dừng-Giới Hạn | Stop-Limit | `stop_price` (trigger) + `limit_price` |
| Stop | Lệnh Dừng | Stop | `stop_price` (trigger); `ref_price` is read-only |

### 1.2 Core Invariants (Never Violated)

| Invariant | Rule |
|-----------|------|
| No real trades | No brokerage API call is ever made; all trades are simulated in Paave's virtual portfolio system |
| Paper trading context | "Phí & thuế: Miễn phí" label appears on all order summaries; this is virtual — no real fees |
| VND formatting | `1.250.000 ₫` — period as thousands separator, space before dong symbol, zero decimal places |
| Board lot | All VN exchange quantities must be positive multiples of 100 |
| Stop order educational note | "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam" shown whenever Stop or Stop-Limit is selected |
| Pending orders cap | Maximum 50 pending orders per user; enforced client-side and server-side |

---

## 2. User Flow

The complete user flow from entry to post-trade state, reflecting the full-screen layout confirmed by screenshots:

```
Stock Detail Screen
       │
       │  User taps "Đặt lệnh" (Trade) button
       ▼
[FR-OP-01] Screen Opens — Full-screen layout, top to bottom:
  ┌─────────────────────────────────────┐
  │ Error/warning banner (if blocked)   │  ← sticky, red/orange, shown only when order blocked
  │ Price header (sticky)               │  ← live indicator · timestamp · exchange + ceiling/ref/floor + price
  │ Orderbook / Chart toggle tabs       │  ← "≡ Sổ lệnh" | "∿ Biểu đồ"
  │ Current position card (if holding)  │  ← shown only when user holds this stock
  │ CTA: ↑ MUA | ↓ BÁN                 │  ← side selection, full-width row
  │ LOẠI LỆNH selector: LO|Stop-Limit|Stop  │
  │ Dynamic form fields                 │  ← change based on order type
  │ Order summary card                  │  ← always visible below form
  │ [Primary CTA] Đặt lệnh / Kiểm tra lại  │
  ├─────────────────────────────────────┤
  │ Panel: Sổ lệnh chờ | Danh mục | Lịch sử  │  ← fixed panel below CTA
  └─────────────────────────────────────┘
       │
       │  User selects MUA or BÁN (side)
       │  User selects order type tab (LO / Stop-Limit / Stop)
       │  User fills form fields
       │  [FR-OP-08] Summary card updates live as user types
       ▼
[FR-OP-11] Form Validation (client-side, real-time)
  - Each field validated on blur and on change
  - Inline error states: red border + red number on invalid field
  - Primary CTA shows "Kiểm tra lại thông tin" (gray, disabled) while any field invalid
  - Primary CTA shows "Đặt lệnh" (yellow-green, enabled) when all fields valid
       │
       │  All fields pass client validation
       │  User taps "Đặt lệnh"
       ▼
[FR-OP-12] Confirmation Sheet (bottom sheet slides up over blurred background)
  - Drag handle at top
  - Title: "Xác nhận mua [TICKER]" (or "bán")
  - Subtitle: "[type] · POST /orders · vốn ảo, không rủi ro thật"
  - Full order summary table
  - Two CTAs full-width: "Huỷ" (dark/gray) | "✦ Xác nhận mua/bán" (yellow-green)
       │
       │  User taps "✦ Xác nhận mua/bán"
       ▼
[FR-OP-13] Submission
  - POST /api/v1/paper-trading/orders with idempotency_key
       │
       ├─── [HTTP 201] Order accepted → SUCCESS state
       └─── [HTTP 4xx / 5xx] Submission rejected → ERROR state (back to form with banner)
```

---

## 3. UX Screen States

### 3.1 Full-Screen Layout States

The Order Placement screen is a full-screen view (not a bottom sheet). The primary CTA and its state drive the submission flow.

| State ID | State Name | Primary CTA Label | Primary CTA Style | Description |
|----------|-----------|-------------------|-------------------|-------------|
| S-OP-01 | FORM_INVALID | "Kiểm tra lại thông tin" | Gray, disabled | Form has one or more invalid or empty fields |
| S-OP-02 | FORM_VALID | "Đặt lệnh" | Yellow-green, enabled | All fields valid; user may proceed |
| S-OP-03 | CONFIRMING | Sheet slides up | Bottom sheet over blurred background | Confirmation sheet visible; form behind is blurred |
| S-OP-04 | PROCESSING | Sheet CTA shows spinner | Yellow-green with loading indicator | API call in flight |
| S-OP-05 | SUCCESS | Toast or inline | — | HTTP 201 received; order placed |
| S-OP-06 | ERROR | Banner at top | Red/orange banner | HTTP 4xx/5xx or network error |

### 3.2 Error/Warning Banner

The sticky banner at the top of the screen (above the price header) is shown only when order placement is entirely blocked. It is not shown for field-level validation errors.

| Condition | Banner Title | Banner Message |
|-----------|-------------|----------------|
| Market closed / suspended | "KHÔNG THỂ ĐẶT LỆNH" | "HOSE tạm ngưng giao dịch — lỗi hệ thống. Thử lại sau ít phút." |
| Symbol suspended | "KHÔNG THỂ ĐẶT LỆNH" | "Giao dịch [TICKER] đang tạm dừng theo quyết định của sàn." |
| Delisted | "KHÔNG THỂ ĐẶT LỆNH" | "Cổ phiếu này đã hủy niêm yết trên [EXCHANGE] và không thể giao dịch." |
| Market holiday | "KHÔNG THỂ ĐẶT LỆNH" | "Hôm nay là ngày nghỉ thị trường. Thị trường sẽ mở cửa vào ngày giao dịch tiếp theo." |
| Market closed (weekend/after hours) | "KHÔNG THỂ ĐẶT LỆNH" | "Thị trường đã đóng cửa lúc 14:45. Hãy thử lại vào ngày giao dịch tiếp theo." |

Banner style: red or orange background, white or red text, warning icon, uppercase "KHÔNG THỂ ĐẶT LỆNH" title label.

### 3.3 Confirmation Sheet Animation

| Transition | Animation |
|-----------|-----------|
| FORM_VALID → CONFIRMING | Bottom sheet slides up from screen bottom over blurred background; duration 300ms; ease-out |
| CONFIRMING → FORM (Huỷ) | Sheet slides back down; duration 250ms; background blur lifts |
| CONFIRMING → PROCESSING | Confirm CTA button shows loading spinner; all sheet elements disabled |
| PROCESSING → SUCCESS | Sheet dismisses; success feedback (toast or inline) |
| PROCESSING → ERROR | Sheet dismisses; error banner appears at top of screen |

---

## 4. Functional Requirements

---

### FR-OP-01 — Price Header (Sticky)

**Priority:** P0

**Actor:** Authenticated user

**Description:**
The price header is sticky at the top of the order placement screen (below the error banner if shown). It displays live market data for the stock being traded and updates every 15 seconds while the screen is open.

**Header layout (left to right, top to bottom):**

| Element | Content | Style |
|---------|---------|-------|
| Live indicator | "● LIVE · [HH:MM:SS] · [EXCHANGE]" | Green dot; small secondary text |
| Price band row | "Trần [ceiling_price]  TC [ref_price]  Sàn [floor_price]" | Three labeled values; ceiling = purple/orange, TC = gray, floor = teal/blue |
| Large price | "[last_price]" | H1, colored red (down) or green (up) relative to ref_price |
| Change row | "[change_vnd] · [change_pct]%" | Red for negative, green for positive; e.g., "-1.600 · -3,74%" |

**Preconditions:**
- User has navigated to Order Placement for a valid ticker on HOSE or HNX
- Live price feed is available

**Postconditions:**
- Header shows current ticker data
- Price updates within 15 seconds of market data change

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-01-01 | User opens Order Placement for VIC (HOSE), last_price = 41,200, ref = 42,800, ceiling = 45,800, floor = 39,800, change = -1,600 (-3.74%) | Screen loads | Header shows "● LIVE · [time] · HOSE"; "Trần 45.800  TC 42.800  Sàn 39.800"; large price "41.200" in red; "-1.600 · -3,74%" in red below |
| AC-OP-01-02 | User has screen open for 15 seconds; price changes to 41,500 | Price feed delivers update | Large price updates to "41.500" within 15 seconds; brief flash animation (200ms) plays on the price value |
| AC-OP-01-03 | Stock has no change from ref_price (change = 0) | User views header | Large price and change row display in neutral/gray color; change row shows "0 · 0,00%" |

---

### FR-OP-02 — Orderbook / Chart Tab Toggle

**Priority:** P1

**Actor:** Authenticated user

**Description:**
Below the sticky price header, two tabs allow the user to toggle between the orderbook view and an intraday price chart.

**Tab labels:**
- "≡ Sổ lệnh" — orderbook view (default)
- "∿ Biểu đồ" — intraday price chart

**Sổ lệnh view layout:**

| Row | Content |
|-----|---------|
| Buy/sell pressure bar | "Mua [N]%" (green bar left) \| "Bán [M]%" (red bar right); N + M = 100 |
| Orderbook header | MUA-KL \| GIÁ MUA \| GIÁ KHỚP \| GIÁ BÁN \| BÁN-KL (5 columns) |
| 3 bid/ask rows | Top 3 price levels on each side; buy side left (green), sell side right (red) |
| Last row | Mở [open_price] · Cao [high_price] · Thấp [low_price] · KL [total_volume] |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-02-01 | User is on Order Placement screen | Screen loads | "≡ Sổ lệnh" tab is selected by default; orderbook view is shown |
| AC-OP-02-02 | "≡ Sổ lệnh" is active | User taps "∿ Biểu đồ" | Tab switches; intraday chart replaces orderbook view |
| AC-OP-02-03 | "∿ Biểu đồ" is active | User taps "≡ Sổ lệnh" | Orderbook view restored with current data |
| AC-OP-02-04 | Orderbook is displayed | User reads the table | 5 columns are present: MUA-KL, GIÁ MUA, GIÁ KHỚP, GIÁ BÁN, BÁN-KL; 3 bid/ask rows shown |
| AC-OP-02-05 | Orderbook total buy = 53,000 shares, total ask = 47,000 shares | User views pressure bar | "Mua 53%" green bar \| "Bán 47%" red bar shown |

---

### FR-OP-03 — Current Position Card

**Priority:** P1

**Actor:** Authenticated user who holds the stock

**Description:**
A card displaying the user's current holding for the stock on this screen. Shown only when the user holds at least 1 share. Hidden when holdings = 0.

**Card layout:**

| Element | Content |
|---------|---------|
| Label | "● VỊ THẾ HIỆN TẠI" (small, left) |
| Quantity | "[N] CP" (right) |
| Average cost | "Giá vốn ₫[avg_cost_per_share]" (left) |
| Unrealized P&L | "+₫[unrealized_pnl] · +[pnl_pct]%" or "-₫[unrealized_loss] · -[loss_pct]%" (right; green for profit, red for loss) |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-03-01 | User holds 200 shares of VIC, avg_cost = 40,500 ₫/share, current_price = 41,200, unrealized PnL = +140,000 ₫ (+1.73%) | User opens Order Placement for VIC | Position card is visible; shows "● VỊ THẾ HIỆN TẠI"; "200 CP"; "Giá vốn ₫40.500"; "+₫140.000 · +1,73%" in green |
| AC-OP-03-02 | User holds 0 shares of VIC | User opens Order Placement for VIC | Position card is not shown |
| AC-OP-03-03 | User holds VIC; unrealized PnL is negative (-50,000 ₫, -0.6%) | User views position card | Shows "-₫50.000 · -0,60%" in red |

---

### FR-OP-04 — Side Selection: MUA / BÁN

**Priority:** P0

**Actor:** Authenticated user

**Description:**
A full-width two-button row below the position card (or below the orderbook/chart if no position). Left button: "↑ MUA"; right button: "↓ BÁN". Tapping a button selects that side. The active side is highlighted. Switching side resets the form fields (quantity and price inputs) but preserves the selected order type tab.

**Button styles:**

| Button | Active State | Inactive State |
|--------|-------------|----------------|
| "↑ MUA" | Yellow-green background, bold white text | Dark/muted background |
| "↓ BÁN" | Dark/gray background, bold white text | Dark/muted background |

Default selection: MUA (BUY).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-04-01 | Screen loads | Default state | "↑ MUA" button is highlighted (yellow-green); "↓ BÁN" is in dark state |
| AC-OP-04-02 | User is on MUA side with LO selected, quantity = 200, price = 41,000 | User taps "↓ BÁN" | Side switches to BÁN; form fields (quantity, price) reset to empty; LO tab remains selected |
| AC-OP-04-03 | BÁN side selected | User views order summary card | Summary card shows sell-side context: "VỐN ẢO SAU LỆNH" based on proceeds, not cost |

---

### FR-OP-05 — Order Type Selector (LOẠI LỆNH)

**Priority:** P0

**Actor:** Authenticated user

**Description:**
Below the MUA/BÁN row, a labeled section "LOẠI LỆNH" (left label) with an "ⓘ Giải thích" pill button (right) allows the user to select an order type. The selector is a 3-tab segmented control. The active tab has a yellow background. Tapping "ⓘ Giải thích" opens an explanation sheet for the selected order type.

**V1 tabs (always all 3 shown, all enabled):**

| Tab | Label | Order Type |
|-----|-------|------------|
| 1 | LO | Limit Order |
| 2 | Stop-Limit | Stop-Limit Order |
| 3 | Stop | Stop Market Order |

All 3 tabs are enabled at all times in V1. There is no session-based tab disabling in V1. Switching tabs changes the dynamic form below; it does not reset the quantity field.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-05-01 | Screen loads | Default state | LO tab is selected (yellow active state) |
| AC-OP-05-02 | LO tab is active | User taps "Stop-Limit" | Stop-Limit tab becomes active (yellow); LO tab returns to inactive; form below updates to Stop-Limit fields |
| AC-OP-05-03 | Stop-Limit tab is active | User taps "Stop" | Stop tab becomes active; form switches to Stop fields; quantity field value is preserved |
| AC-OP-05-04 | Any tab is active | User taps "ⓘ Giải thích" | An explanation sheet or modal opens with description of the selected order type; does not switch tab |

---

### FR-OP-06 — Dynamic Form: LO (Limit Order)

**Priority:** P0

**Actor:** Authenticated user

**Description:**
When LO tab is selected, the form shows two input fields: SỐ LƯỢNG (quantity) and GIÁ ĐẶT (limit price). A percentage quick-select row appears below GIÁ ĐẶT for fast quantity selection based on available capital.

**Field: SỐ LƯỢNG**

| Element | Content |
|---------|---------|
| Label | "SỐ LƯỢNG" (left) |
| Helper | "Mua tối đa [N] CP" (right, for MUA side) or "Bán tối đa [N] CP" (right, for BÁN side); [N] = available quantity at current price |
| Input | [-] [quantity value] CP [+]; stepper buttons on each side; unit "CP" shown inside field |
| Invalid state | Red border around field; quantity number shown in red |

**Field: GIÁ ĐẶT**

| Element | Content |
|---------|---------|
| Label | "GIÁ ĐẶT" (left) |
| Helper | "Trần [ceiling_price]" (right, orange text) |
| Input | [-] [price value] đ [+]; unit "đ" shown inside field |
| Invalid state | Red border around field |

**% Quick-select row:**
5 pill buttons below the form: [10%] [25%] [50%] [75%] [100%]
- Selecting a percentage sets the quantity to: `floor((available_capital / current_price) × pct / 100) × 100` (rounded down to nearest 100)
- The active selected percentage pill has a yellow background
- Tapping any other pill or editing quantity manually deselects the active pill

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-06-01 | LO selected, MUA side, available_cash = 10,000,000 ₫, price_field = 41,200 | User taps [50%] pill | Quantity field updates to: floor(10,000,000 / 41,200 × 0.5 / 100) × 100 = 100 CP; [50%] pill turns yellow |
| AC-OP-06-02 | LO selected, MUA side, [25%] pill is active | User manually types quantity = 300 | [25%] pill deselects (returns to inactive style) |
| AC-OP-06-03 | LO selected, BUY | User enters quantity = 150 | Red border appears on SỐ LƯỢNG field; "150" shown in red; error text: "Sai lô · 150 CP (bội 100)" |
| AC-OP-06-04 | LO selected, BUY, ceiling = 45,800 ₫ | User enters price = 46,000 ₫ | Red border on GIÁ ĐẶT field; error: "Vượt trần · 46.000 (trần 45.800)" |
| AC-OP-06-05 | LO selected, BUY, floor = 39,800 ₫ | User enters price = 39,000 ₫ | Red border on GIÁ ĐẶT field; error: "Dưới sàn · 39.000 (sàn 39.800)" |
| AC-OP-06-06 | LO selected, BUY, tick size = 100 ₫ | User enters price = 41,050 ₫ | Red border on GIÁ ĐẶT field; error: "Sai bước · 41.050đ (bước 100đ)" |
| AC-OP-06-07 | LO selected, quantity = 0 | User submits | Error: "SL trống (0)" |

---

### FR-OP-07 — Dynamic Form: Stop-Limit Order

**Priority:** P1

**Actor:** Authenticated user

**Description:**
When Stop-Limit tab is selected, the form shows three input fields: SỐ LƯỢNG, GIÁ KÍCH HOẠT (trigger/stop price), GIÁ LO SAU TRIGGER (limit price), and a HIỆU LỰC LỆNH (validity) section.

**Field: SỐ LƯỢNG**
Same layout as LO form (label + helper + stepper input + invalid state).

**Field: GIÁ KÍCH HOẠT**

| Element | Content |
|---------|---------|
| Label | "GIÁ KÍCH HOẠT" (left) |
| Badge | "TRIGGER" pill badge (orange background, white text, right) |
| Input | [-] [stop_price value] đ [+] |
| Invalid state | Red border; value shown in red |

**Field: GIÁ LO SAU TRIGGER**

| Element | Content |
|---------|---------|
| Label | "GIÁ LO SAU TRIGGER" (left) |
| Badge | "LIMIT" pill badge (blue/teal background, white text, right) |
| Input | [-] [limit_price value] đ [+] |
| Invalid state | Red border |

**Section: HIỆU LỰC LỆNH**

| Element | Content |
|---------|---------|
| Label | "HIỆU LỰC LỆNH" (left) |
| Day count | "[N] ngày" (right, orange text); N = (end_date - today) in calendar days |
| Quick buttons | [Hôm nay] [7 ngày] [30 ngày] [90 ngày] — pill buttons; active = yellow |
| Date display | "TỪ NGÀY [DD/MM/YY] → ĐẾN NGÀY [DD/MM/YY]" |

Default validity on first open: 30 ngày (from today to today + 30 calendar days).
"Hôm nay" = order expires at end of current trading day.
7/30/90 ngày = expires at end of the Nth calendar day from today.
The user cannot select a past date as the end date.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-07-01 | Stop-Limit tab selected | User views form | Three fields shown: SỐ LƯỢNG, GIÁ KÍCH HOẠT (with TRIGGER badge), GIÁ LO SAU TRIGGER (with LIMIT badge); HIỆU LỰC LỆNH section visible below |
| AC-OP-07-02 | Stop-Limit tab selected, today = 28/05/26 | User views HIỆU LỰC LỆNH default | [30 ngày] pill is active (yellow); "TỪ NGÀY 28/05/26 → ĐẾN NGÀY 27/06/26"; "30 ngày" displayed right of label |
| AC-OP-07-03 | HIỆU LỰC LỆNH showing 30 ngày | User taps [7 ngày] | [7 ngày] pill activates; end date updates to today + 7; day count shows "7 ngày" |
| AC-OP-07-04 | HIỆU LỰC LỆNH showing 30 ngày | User taps [Hôm nay] | [Hôm nay] pill activates; end date = today; day count shows "1 ngày" (expires end of today) |
| AC-OP-07-05 | Stop-Limit, BUY, stop_price field invalid | User enters a stop_price not on tick size | Red border on GIÁ KÍCH HOẠT field; value shown in red; error message per §9.3 |
| AC-OP-07-06 | Stop-Limit, SELL side | User views form | SỐ LƯỢNG helper shows "Bán tối đa [N] CP" |

---

### FR-OP-08 — Dynamic Form: Stop Order

**Priority:** P1

**Actor:** Authenticated user

**Description:**
When Stop tab is selected, the form shows two input fields (SỐ LƯỢNG and GIÁ KÍCH HOẠT) plus a read-only GIÁ THAM CHIẾU field, and a HIỆU LỰC LỆNH section.

**Field: SỐ LƯỢNG**
Same layout as LO and Stop-Limit forms.

**Field: GIÁ KÍCH HOẠT**
Same layout as Stop-Limit form (label + TRIGGER badge + stepper input).

**Field: GIÁ THAM CHIẾU (READ-ONLY)**

| Element | Content |
|---------|---------|
| Label | "GIÁ THAM CHIẾU" (left) |
| Helper | "Snapshot khi trigger" (right, gray text) |
| Input | [-] [ref_price] đ [+] — GRAYED OUT; not tappable; [-] and [+] steppers are disabled |
| Value | Displays the current reference price (TC price); this field is informational only; it shows the snapshot price that will be used as the market reference when the stop triggers |

The GIÁ THAM CHIẾU field is read-only and cannot be edited by the user. It displays the current `ref_price` (TC / tham chiếu) at the time the form is loaded. When the stop order triggers, the actual fill price will be determined by market conditions at trigger time; this field is for display/education purposes.

**Section: HIỆU LỰC LỆNH**
Identical to Stop-Limit HIỆU LỰC LỆNH (same quick buttons, same date range display, same default = 30 ngày).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-08-01 | Stop tab selected | User views form | Three fields shown: SỐ LƯỢNG, GIÁ KÍCH HOẠT (TRIGGER badge), GIÁ THAM CHIẾU (grayed out, read-only); HIỆU LỰC LỆNH section below |
| AC-OP-08-02 | Stop tab selected, TC price = 42,800 ₫ | User views GIÁ THAM CHIẾU | Field shows "42.800" in grayed out state; "Snapshot khi trigger" helper shown; [-] and [+] steppers are visually disabled; user cannot edit the value |
| AC-OP-08-03 | Stop tab, GIÁ THAM CHIẾU | User attempts to tap the field or steppers | No action; field remains grayed and unchanged |
| AC-OP-08-04 | Stop tab, HIỆU LỰC LỆNH | Default on first open | Same as Stop-Limit: 30 ngày selected, date range shown |

---

### FR-OP-09 — Order Summary Card

**Priority:** P0

**Actor:** Authenticated user

**Description:**
The Order Summary Card is always visible below the form fields, above the primary CTA button. It updates in real-time as the user types. If any required field is empty or invalid, calculated rows show "—".

**Summary card for LO (BUY):**

| Row Label | Formula | Display |
|-----------|---------|---------|
| "Giá × Số lượng" | — | "₫[price] × [qty]" |
| "Tổng giá trị" | `price × qty` | "₫[gross]" |
| "Phí & thuế" | Paper trading = no real fees | "Miễn phí" (orange/yellow text) |
| "Vốn ảo dự trữ" (amber highlight box) | `price × qty` (reserved for pending BUY) | "₫[reserve_amount]" with info tooltip |
| Tooltip (info icon) | — | "Tạm giữ đủ tiền cho lệnh mua chờ khớp. Phần này không dùng được cho lệnh khác cho đến khi lệnh khớp hoặc huỷ." |
| "VỐN ẢO SAU LỆNH" | `available_cash − reserve_amount` | "₫[remaining] / [pct]% khả dụng" |

**Summary card for LO (SELL):**

| Row Label | Formula | Display |
|-----------|---------|---------|
| "Giá × Số lượng" | — | "₫[price] × [qty]" |
| "Tổng giá trị" | `price × qty` | "₫[gross]" |
| "Phí & thuế" | Paper trading | "Miễn phí" |
| "VỐN ẢO SAU LỆNH" | `available_cash + gross` (estimated) | "₫[remaining] / [pct]% khả dụng" |

**Summary card for Stop-Limit:**

| Row Label | Content |
|-----------|---------|
| "Khi giá chạm" | "₫[stop_price]" (orange text) |
| "Đặt LO giá" | "₫[limit_price] × [qty]" |
| "Tổng ước tính" | "₫[limit_price × qty]" |
| "Hiệu lực" | "[from_date] → [to_date]" |
| "Phí & thuế" | "Miễn phí" |
| Reserve notice (amber text box) | "Chưa giữ tiền — chỉ trừ vốn khi giá chạm mức kích hoạt và lệnh được đặt." |
| "VỐN ẢO SAU LỆNH" | "₫[available_cash] / [pct]% khả dụng" (unchanged until triggered) |

**Summary card for Stop:**

| Row Label | Content |
|-----------|---------|
| "Khi giá chạm" | "₫[stop_price]" (orange text) |
| "Khớp theo TT, tham chiếu" | "₫[ref_price] × [qty]" |
| "Tổng ước tính" | "₫[ref_price × qty]" |
| "Hiệu lực" | "[from_date] → [to_date]" |
| "Phí & thuế" | "Miễn phí" |
| Reserve notice (amber text box) | "Chưa giữ tiền — chỉ trừ vốn khi giá chạm mức kích hoạt và lệnh được đặt." |
| "VỐN ẢO SAU LỆNH" | "₫[available_cash] / [pct]% khả dụng" (unchanged until triggered) |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-09-01 | LO, BUY, price = 41,200 ₫, quantity = 100 | User fills both fields | Summary shows: "₫41.200 × 100"; "Tổng giá trị: ₫4.120.000"; "Phí & thuế: Miễn phí"; amber reserve box "₫4.120.000"; VỐN ẢO SAU LỆNH shows reduced available cash |
| AC-OP-09-02 | Stop-Limit, stop_price = 44,000, limit_price = 43,500, qty = 100, validity = 30 days | User fills all fields | "Khi giá chạm: ₫44.000"; "Đặt LO giá: ₫43.500 × 100"; "Tổng ước tính: ₫4.350.000"; "Hiệu lực: [from] → [to]"; reserve notice amber box; VỐN ẢO unchanged |
| AC-OP-09-03 | Stop, stop_price = 38,000, ref_price = 42,800, qty = 200 | User fills fields | "Khi giá chạm: ₫38.000"; "Khớp theo TT, tham chiếu: ₫42.800 × 200"; "Tổng ước tính: ₫8.560.000"; reserve notice amber box |
| AC-OP-09-04 | LO, BUY, quantity field empty | Form not complete | All calculated rows show "—"; VỐN ẢO SAU LỆNH shows current available_cash unchanged |
| AC-OP-09-05 | LO, BUY, total required > available_cash | User fills fields | VỐN ẢO SAU LỆNH shows negative or 0%; primary CTA remains "Kiểm tra lại thông tin" (disabled) |

---

### FR-OP-10 — Primary CTA Button States

**Priority:** P0

**Actor:** Authenticated user

**Description:**
The primary CTA button sits below the order summary card. Its state is binary: disabled or enabled. There is no intermediate "review" step before the confirmation sheet — tapping the enabled CTA directly opens the confirmation sheet.

**Button states:**

| Condition | Button Label | Button Style |
|-----------|-------------|--------------|
| Any required field is empty | "Kiểm tra lại thông tin" | Gray, disabled |
| Any field has a validation error | "Kiểm tra lại thông tin" | Gray, disabled |
| Insufficient balance (BUY) | "Kiểm tra lại thông tin" | Gray, disabled |
| Sell quantity exceeds holdings | "Kiểm tra lại thông tin" | Gray, disabled |
| All fields valid and sufficient balance/holdings | "Đặt lệnh" | Yellow-green, enabled |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-10-01 | LO selected; both fields empty | User views CTA | Shows "Kiểm tra lại thông tin" in gray, disabled |
| AC-OP-10-02 | LO selected; quantity = 100, price = 41,000; balance sufficient | User views CTA | Shows "Đặt lệnh" in yellow-green, enabled |
| AC-OP-10-03 | LO BUY; price × qty > available_cash | User fills fields | Shows "Kiểm tra lại thông tin", disabled; VỐN ẢO SAU LỆNH shows 0% or negative |
| AC-OP-10-04 | BÁN; qty = 500; holdings = 200 | User fills fields | Shows "Kiểm tra lại thông tin", disabled |
| AC-OP-10-05 | Stop-Limit; stop_price, limit_price, qty all valid; validity set | User fills all fields | Shows "Đặt lệnh" in yellow-green, enabled |

---

### FR-OP-11 — Confirmation Sheet (Step 2)

**Priority:** P0

**Actor:** Authenticated user

**Description:**
When the user taps the enabled "Đặt lệnh" CTA, a confirmation bottom sheet slides up over the blurred screen background. The sheet contains a full order summary and two CTAs. The user must confirm before the order is submitted.

**Sheet header:**
- Drag handle at top of sheet
- Title: "Xác nhận mua [TICKER]" (for MUA side) or "Xác nhận bán [TICKER]" (for BÁN side)
- Subtitle: "[Order type name] · POST /orders · vốn ảo, không rủi ro thật"

**Summary table rows:**

| Row | Content |
|-----|---------|
| Hành động | "MUA · LO" or "BÁN · Stop-Limit" etc. |
| Mã | "[TICKER] · [EXCHANGE]" |
| Số lượng | "[N] CP" |
| Giá đặt | "₫[price]" (for LO); or trigger + limit info (Stop-Limit); or trigger + ref (Stop) |
| Phí & thuế | "Miễn phí" |
| Tổng ước tính | "₫[amount]" (orange/yellow text) |

**CTAs (two buttons, full-width row):**

| Button | Style | Action |
|--------|-------|--------|
| "Huỷ" | Left half; dark/gray background | Closes sheet; returns to FORM_VALID state; no data reset |
| "✦ Xác nhận mua" or "✦ Xác nhận bán" | Right half; yellow-green; bold | Triggers API submission |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-11-01 | LO, BUY VIC, qty = 100, price = 41,200 | User taps "Đặt lệnh" | Sheet slides up; title = "Xác nhận mua VIC"; subtitle shows "LO · POST /orders · vốn ảo, không rủi ro thật"; table shows Hành động "MUA · LO", Mã "VIC · HOSE", Số lượng "100 CP", Giá đặt "₫41.200", Phí & thuế "Miễn phí", Tổng ước tính "₫4.120.000" in orange; CTA "✦ Xác nhận mua" |
| AC-OP-11-02 | Stop-Limit, BÁN VIC, stop = 38,000, limit = 37,500, qty = 200, validity = 30 days | User taps "Đặt lệnh" | Sheet shows "Xác nhận bán VIC"; Hành động "BÁN · Stop-Limit"; Giá đặt shows trigger + limit; CTA "✦ Xác nhận bán" |
| AC-OP-11-03 | Confirmation sheet open | User taps "Huỷ" | Sheet closes; form returns to FORM_VALID state with all entered values preserved; no fields are reset |
| AC-OP-11-04 | Confirmation sheet open | User swipes down on drag handle | Same behavior as tapping "Huỷ" |
| AC-OP-11-05 | Confirmation sheet open; user taps "✦ Xác nhận mua" | API call begins | CTA shows loading spinner; all sheet elements disabled; sheet cannot be dismissed |

---

### FR-OP-12 — Order Submission and Outcome

**Priority:** P0

**Actor:** Authenticated user; Paave Paper Trading Engine

**Description:**
When the user taps the confirm CTA on the confirmation sheet, the order is submitted via API. The sheet remains visible with a loading state during submission. On outcome, the sheet dismisses and the screen updates accordingly.

**Submission payload:**

| Field | Type | Source |
|-------|------|--------|
| `symbol_code` | string | Pre-filled from entry context |
| `exchange` | enum | Pre-filled from entry context |
| `side` | enum | "BUY" or "SELL" |
| `order_type` | enum | "LO", "STOP_LIMIT", "STOP" |
| `price` | decimal or null | User input for LO; null for Stop and Stop-Limit (`limit_price` used instead) |
| `limit_price` | decimal or null | User input for Stop-Limit; null for LO and Stop |
| `stop_price` | decimal or null | User input for Stop-Limit and Stop; null for LO |
| `quantity` | integer | User input |
| `validity_days` | integer | 1 (Hôm nay), 7, 30, or 90; for Stop-Limit and Stop only; not sent for LO |
| `idempotency_key` | UUID v4 | Client-generated at the moment user taps "✦ Xác nhận"; not reused between attempts |

**Timeout handling:**
If no API response within 10,000ms: show error banner "Kết nối bị gián đoạn. Vui lòng kiểm tra lại trong Sổ lệnh chờ trước khi thử lại." Return to FORM_VALID state.

**Success (HTTP 201):**
- Sheet dismisses
- Success feedback shown (toast or inline indicator)
- Panel below CTA auto-updates to show the new pending order in "Sổ lệnh chờ" tab

**Error (HTTP 4xx/5xx):**
- Sheet dismisses
- Error banner appears at top of screen with exact server message from API `message` field
- Form remains populated with the user's values
- User may edit and retry

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-12-01 | User taps "✦ Xác nhận mua"; API responds in 300ms with HTTP 201 | SUCCESS | Sheet dismisses; success feedback visible; new order appears in Sổ lệnh chờ tab |
| AC-OP-12-02 | User taps "✦ Xác nhận"; API returns HTTP 422 with E-OP-09 (50 orders cap) | ERROR | Sheet dismisses; red error banner at top: "Đạt 50 lệnh chờ (cap)"; form remains with values; user may cancel an order to proceed |
| AC-OP-12-03 | User double-taps "✦ Xác nhận" rapidly | First tap begins PROCESSING | Second tap has no effect; button disabled on first tap; same idempotency_key on both; server deduplicates; only 1 order created |
| AC-OP-12-04 | API call exceeds 10,000ms with no response | Timeout | Error banner: "Kết nối bị gián đoạn. Vui lòng kiểm tra lại trong Sổ lệnh chờ trước khi thử lại."; form preserved |

---

### FR-OP-13 — Panel Below CTA: Sổ lệnh chờ / Danh mục / Lịch sử

**Priority:** P1

**Actor:** Authenticated user

**Description:**
A fixed panel below the primary CTA button contains three tabs. This panel is always visible while the order placement screen is open.

**Tab labels (with live counts):**
- "Sổ lệnh chờ [N]" — N = count of pending orders
- "Danh mục [N]" — N = count of holdings
- "Lịch sử (thường + ĐK)" — LO + stop order history combined

---

#### FR-OP-13a — Sổ lệnh chờ Tab (Pending Orders)

**Header:** "ĐANG CHỜ · [N]" (uppercase label + count)

**Each pending order row:**

| Element | Content |
|---------|---------|
| Side badge | "MUA" (green background) or "BÁN" (red background) |
| Type badge | "LO" / "Stop-Limit" / "Stop" |
| Center: ticker + qty | "[TICKER] [qty] CP" |
| Center: price / trigger | LO: price "₫[price]"; Stop-Limit/Stop: "trigger ₫[stop_price]" |
| Center: status + ID | "● [status_label]" + "#[order_id]" |
| Right: action buttons | "SỬA" (blue/teal pill) + "HUỶ" (red pill, shown only when cancellable) + ">" chevron |

**Status labels:**
- "Đang chờ" (yellow dot)
- "Đã nhận" (blue dot)

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-13a-01 | User has 3 pending orders (2 LO, 1 Stop-Limit) | User views Sổ lệnh chờ tab | Header shows "ĐANG CHỜ · 3"; each row shows correct side badge, type badge, ticker, qty, price/trigger, status, ID |
| AC-OP-13a-02 | Pending LO order, order_id = #12345, qty = 100, price = 41,200 | Row displayed | "MUA" green badge + "LO" badge; "VIC 100 CP"; "₫41.200"; "● Đang chờ"; "#12345"; "SỬA" + "HUỶ" buttons |
| AC-OP-13a-03 | Pending Stop-Limit order, stop_price = 44,000 | Row displayed | Stop-Limit badge; "trigger ₫44.000" shown instead of price |
| AC-OP-13a-04 | User places a new order successfully | HTTP 201 received | New order appears in Sổ lệnh chờ tab immediately; count increments |

---

#### FR-OP-13b — Danh mục Tab (Current Holdings)

**Summary row:**
- "TỔNG GIÁ TRỊ: ₫[total_portfolio_value]" (left)
- "LÃI/LỖ CHƯA THỰC HIỆN: +₫[unrealized_pnl] +[pnl_pct]%" (right; green for positive, red for negative)

**Holdings header:** "CỔ PHIẾU ĐANG NẮM GIỮ · [N]" (left) + "GIÁ TRỊ ▼" sort button (right)

**Each holding row:**

| Element | Content |
|---------|---------|
| Ticker badge | "[TICKER]" pill |
| Quantity + sector | "[qty] CP · [sector]" |
| Current price | "₫[current_price]" |
| PnL percentage | "+[pct]%" or "-[pct]%" (green/red) |
| Action | "BÁN" button (red pill) |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-13b-01 | User holds 2 stocks: VIC (200 CP) and HPG (500 CP) | User views Danh mục tab | Summary row shows total value + unrealized PnL; holdings header shows count 2; each stock row displayed |
| AC-OP-13b-02 | User views holding row for VIC; current_price = 41,200, qty = 200 | Row displayed | VIC badge; "200 CP · [sector]"; "₫41.200"; PnL%; "BÁN" red pill |
| AC-OP-13b-03 | User taps "BÁN" on a holding row | Tap registered | Side switches to BÁN; ticker pre-selected; form resets to SELL LO for that ticker |

---

#### FR-OP-13c — Lịch sử Tab (Order History)

**Sub-tabs:**
- "Lệnh LO [N]" — history of LO orders
- "Stop / Stop-Limit [N]" — history of stop orders

**API note:** Lệnh LO uses `/orders/history`; Stop / Stop-Limit uses `/stop-orders/history`; pagination: 20 records per page, maximum 100.

**Lệnh LO sub-tab:**

Status filters: "Tất cả" (default selected) | "Đã khớp" | "Đã huỷ"

Each row:
- Side badge + "LO" type badge
- "[TICKER] · [qty] CP"
- "@ ₫[price] · [date] · [time]"
- Status chip: "ĐÃ KHỚP" (green) or "ĐÃ HUỶ" (gray)
- "#[order_id]"

**Stop / Stop-Limit sub-tab:**

Status filters: "Tất cả" | "Đang chờ" | "Đã kích hoạt" | "Hết hạn" | "Đã huỷ"

Each PENDING row:
- Side badges + "STL" (Stop-Limit) or "STO" (Stop) type badge
- "[TICKER] · [qty] CP"
- Trigger logic: e.g., "Khi chạm ₫[stop_price] → LO ₫[limit_price]" (Stop-Limit) or "Khi chạm ₫[stop_price] → TT" (Stop)
- "ĐANG CHỜ" status chip + "Huỷ" button
- "#[order_id] · Hết hạn [DD/MM/YY]"

Each TRIGGERED row:
- "ĐÃ KÍCH HOẠT" status chip
- "Đã tự đặt LO #[child_order_id]" note below (Stop-Limit); or "Đã khớp theo TT" (Stop)

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-13c-01 | User taps "Lịch sử (thường + ĐK)" tab | Default | "Lệnh LO" sub-tab is active; LO order history shown |
| AC-OP-13c-02 | LO sub-tab, filter = "Tất cả" | 3 orders (2 matched, 1 cancelled) | All 3 rows shown with correct status chips |
| AC-OP-13c-03 | LO sub-tab | User taps "Đã khớp" filter | Only matched orders shown |
| AC-OP-13c-04 | Stop/Stop-Limit sub-tab, filter = "Đã kích hoạt" | 1 triggered Stop-Limit order | Row shows "ĐÃ KÍCH HOẠT" chip + "Đã tự đặt LO #[child_id]" note |
| AC-OP-13c-05 | Stop/Stop-Limit sub-tab | Pending Stop order row | Shows "ĐANG CHỜ" chip + "Huỷ" button + expiry date |

---

## 5. Business Rules

| Rule ID | Rule | Source | Violation Behaviour |
|---------|------|--------|---------------------|
| BR-OP-01 | Paper trading context must be visible throughout the screen. "Phí & thuế: Miễn phí" must appear in the order summary card and on the confirmation sheet for every order. The confirmation sheet subtitle must include "vốn ảo, không rủi ro thật". | BRD BR-18; FRD-10 FR-PT-06 | Missing in any state = P0 UI bug |
| BR-OP-02 | In V1, there are no real fees or taxes on paper trades. The order summary card and confirmation sheet must show "Phí & thuế: Miễn phí" for all order types and both sides. No fee or tax amount is calculated or deducted. | Paave paper trading model V1 | Fee calculated and deducted = P0 data bug |
| BR-OP-03 | All VN exchange (HOSE, HNX) order quantities must be multiples of 100 (board lot). The quantity input must not allow submission of a non-multiple-of-100 value. Client-side validation runs on change; server-side also enforces this. | BRD BR-PT-07; FRD-10 BR-PT-01 | Error: "Sai lô · [qty] CP (bội 100)" |
| BR-OP-04 | Quantity maximum is 1,000,000 shares per order. Values above this are rejected client-side. | Order engine constraint | Error: "Khối lượng tối đa cho mỗi lệnh là 1.000.000 cổ phiếu." |
| BR-OP-05 | A BUY LO order reserves capital immediately upon submission: `reserve_amount = price × qty`. The reserved amount is locked until the order is filled or cancelled. The order summary card must show this reserve in the amber "Vốn ảo dự trữ" box before the user confirms. | Virtual capital reserve model | Reserve not shown before confirmation = P1 bug |
| BR-OP-06 | Stop-Limit and Stop orders do NOT reserve capital at placement time. Capital is only reserved when the stop triggers and a child LO order is placed. The amber reserve notice must state this: "Chưa giữ tiền — chỉ trừ vốn khi giá chạm mức kích hoạt và lệnh được đặt." | Stop order simulation logic | Reserve shown for stop orders = P1 data bug |
| BR-OP-07 | No short selling. A SELL order for a ticker with 0 holdings must be rejected: "Bán mã chưa sở hữu ([TICKER])". A SELL order where qty > available_holdings must show E-OP-06 before confirmation. | FRD-10 FC-PT-09; BRD no-short-sell rule | Zero-holding SELL reaching confirmation = P0 bug |
| BR-OP-08 | Maximum pending orders: 50 per user (includes LO, Stop-Limit, and Stop orders combined). The client must check this limit before showing the confirmation sheet. Error when cap is reached: "Đạt 50 lệnh chờ (cap)". | Design confirmation: cap = 50 (corrected from 10 in FRD-10 v1.0) | Cap at wrong number = P1 product bug |
| BR-OP-09 | The `idempotency_key` (UUID v4) must be generated at the moment the user taps "✦ Xác nhận". It must not be reused across different submission attempts. A new key must be generated for each new attempt. | FRD-10 BR-PT-15 | Reused key = silent deduplication of intended new orders = P0 bug |
| BR-OP-10 | The confirmation sheet must not be dismissible during PROCESSING state. Sheet close gesture (drag handle swipe) and the "Huỷ" button are both disabled from the moment the user taps "✦ Xác nhận" until the API responds or times out. | Prevents orphaned orders | Sheet dismissible during PROCESSING = P0 bug |
| BR-OP-11 | Stop-Limit and Stop orders require a HIỆU LỰC LỆNH (validity) period. The minimum is 1 day (Hôm nay) and the maximum is 90 days. The default is 30 days. LO orders do not have a validity period field. | Stop order simulation model | Validity field shown for LO = P2 bug; missing for Stop/Stop-Limit = P1 bug |
| BR-OP-12 | The GIÁ THAM CHIẾU field on the Stop form is read-only. It displays the current TC (tham chiếu) price. The user must not be able to edit this value. The stepper buttons [-] and [+] adjacent to this field must be visually disabled and non-interactive. | Stop order simulation: reference price is system-provided | Editable ref price field = P0 data integrity bug |
| BR-OP-13 | For LO tick size validation: if `price % tick_size ≠ 0`, the error is shown inline on the price field. The server also validates. Tick size for HOSE/HNX depends on price range (see FRD-10 §tick size table). | FRD-10 price band rules | Tick size not validated client-side = P1 bug (extra API round-trips) |
| BR-OP-14 | The error/warning banner at the top of the screen (S-OP-06 ERROR state) must display the exact error message string from the API `message` field. The client must not rewrite, summarize, or translate API error messages. | Exact error strings required by QA | Paraphrased error = P2 bug (test failure) |
| BR-OP-15 | Available cash and available holdings are fetched fresh when the screen opens. They may be cached for up to 30 seconds while the screen is open. If the screen has been open more than 30 seconds and the user taps the enabled "Đặt lệnh" CTA, values are refreshed from the server before the confirmation sheet opens. | Stale balance = false "sufficient" display | Balance not refreshed = P1 bug |

---

## 6. Acceptance Criteria

This section provides complete Given/When/Then acceptance criteria for all 3 V1 order types × BUY + SELL = 6 base scenarios.

### AC-SET-01: LO BUY (Limit Order Buy)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-LO-BUY-01 | User has 20,000,000 ₫ available cash; VIC last_price = 41,200 ₫; ceiling = 45,800, floor = 39,800, tick = 100 | User selects LO, MUA, enters price = 41,200 ₫, quantity = 100 | Summary: "₫41.200 × 100"; Tổng: "₫4.120.000"; "Miễn phí"; amber reserve box "₫4.120.000"; VỐN ẢO SAU LỆNH = 20,000,000 - 4,120,000 |
| AC-OP-LO-BUY-02 | All fields valid, balance sufficient | User taps "Đặt lệnh" | Confirmation sheet opens; title "Xác nhận mua VIC"; Hành động "MUA · LO"; Số lượng "100 CP"; Giá đặt "₫41.200"; Tổng ước tính "₫4.120.000" in orange |
| AC-OP-LO-BUY-03 | Confirmation sheet shown | User taps "✦ Xác nhận mua"; API returns 201 | Sheet dismisses; new order appears in Sổ lệnh chờ tab |
| AC-OP-LO-BUY-04 | LO BUY, ceiling = 45,800 ₫ | User enters price = 46,000 ₫ | Red border on GIÁ ĐẶT; error: "Vượt trần · 46.000 (trần 45.800)"; CTA shows "Kiểm tra lại thông tin" |
| AC-OP-LO-BUY-05 | LO BUY, tick size = 100 ₫ | User enters price = 41,150 ₫ | Red border; error: "Sai bước · 41.150đ (bước 100đ)" |

### AC-SET-02: LO SELL (Limit Order Sell)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-LO-SELL-01 | User holds 500 VIC; last_price = 41,200 ₫; floor = 39,800 | User selects LO, BÁN, enters price = 41,500 ₫, quantity = 200 | Summary: "₫41.500 × 200"; Tổng: "₫8.300.000"; "Miễn phí"; VỐN ẢO SAU LỆNH shows cash + 8.300.000 |
| AC-OP-LO-SELL-02 | All fields valid, holdings sufficient | User taps "Đặt lệnh" | Confirmation sheet: title "Xác nhận bán VIC"; Hành động "BÁN · LO"; CTA "✦ Xác nhận bán" |
| AC-OP-LO-SELL-03 | LO SELL, user holds 200 shares | User enters quantity = 500 | Error: "Bán vượt nắm giữ (200 CP)"; CTA disabled |
| AC-OP-LO-SELL-04 | LO SELL, holdings = 0 | User views sell form | Error: "Bán mã chưa sở hữu ([TICKER])"; CTA disabled |

### AC-SET-03: Stop-Limit BUY

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-STOPLIM-BUY-01 | HOSE; last_price = 41,200 ₫; ceiling = 45,800; user has 20,000,000 ₫ | User selects Stop-Limit, MUA; enters stop_price = 44,000, limit_price = 43,500, qty = 100; validity = 30 days | Summary: "Khi giá chạm: ₫44.000"; "Đặt LO giá: ₫43.500 × 100"; "Tổng ước tính: ₫4.350.000"; reserve notice amber box; VỐN ẢO unchanged |
| AC-OP-STOPLIM-BUY-02 | All fields valid | User taps "Đặt lệnh" | Confirmation sheet: "Xác nhận mua VIC"; Hành động "MUA · Stop-Limit"; Giá đặt shows trigger + limit; Hiệu lực shows date range |
| AC-OP-STOPLIM-BUY-03 | Stop-Limit BUY; stop_price = 44,000 | HIỆU LỰC LỆNH defaults | [30 ngày] pill active; dates shown from today to today+30 |
| AC-OP-STOPLIM-BUY-04 | Stop-Limit BUY; submitted; API 201 | Success | New order appears in Sổ lệnh chờ; type badge "Stop-Limit"; trigger "₫44.000" shown |

### AC-SET-04: Stop-Limit SELL

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-STOPLIM-SELL-01 | HOSE; last_price = 41,200 ₫; user holds 300 VIC | User selects Stop-Limit, BÁN; stop_price = 38,000, limit_price = 37,500, qty = 100; validity = 30 days | Summary shows stop_price, limit_price, qty; reserve notice: "Chưa giữ tiền — chỉ trừ vốn khi giá chạm mức kích hoạt và lệnh được đặt." |
| AC-OP-STOPLIM-SELL-02 | Valid Stop-Limit SELL | User taps "Đặt lệnh"; API returns 201 | Order in Sổ lệnh chờ with BÁN badge + Stop-Limit badge + trigger info |
| AC-OP-STOPLIM-SELL-03 | Stop-Limit SELL; qty = 400; holdings = 300 | User fills qty | Error: "Bán vượt nắm giữ (300 CP)"; CTA disabled |

### AC-SET-05: Stop BUY

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-STOP-BUY-01 | HOSE; last_price = 41,200 ₫; TC = 42,800; user has 20,000,000 ₫ | User selects Stop, MUA; enters stop_price = 44,000, qty = 100; validity = 30 days | Three fields shown: SỐ LƯỢNG, GIÁ KÍCH HOẠT (TRIGGER), GIÁ THAM CHIẾU (grayed = 42,800); HIỆU LỰC shown |
| AC-OP-STOP-BUY-02 | Stop BUY; all fields valid | User taps "Đặt lệnh" | Confirmation sheet: "Xác nhận mua VIC"; Hành động "MUA · Stop"; Giá đặt shows trigger; Tổng ước tính based on ref × qty |
| AC-OP-STOP-BUY-03 | Stop BUY; submitted; API 201 | Success | Order in Sổ lệnh chờ; type badge "Stop"; "trigger ₫44.000" displayed |

### AC-SET-06: Stop SELL

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-STOP-SELL-01 | HOSE; last_price = 41,200 ₫; TC = 42,800; user holds 200 VIC | User selects Stop, BÁN; stop_price = 38,000, qty = 100; validity = 30 days | Form shows stop_price field (TRIGGER), GIÁ THAM CHIẾU grayed = 42,800; reserve notice amber |
| AC-OP-STOP-SELL-02 | Valid Stop SELL | User confirms; API 201 | Order in Sổ lệnh chờ with BÁN + Stop badges |
| AC-OP-STOP-SELL-03 | Stop SELL; stop_price = 44,000 (above last_price = 41,200) | User views form | Error on GIÁ KÍCH HOẠT: "Giá dừng lệnh bán phải thấp hơn giá hiện tại ([last_price] ₫) để bảo vệ khỏi thua lỗ." |

---

## 7. Edge Cases

| Case ID | Scenario | Expected Behaviour |
|---------|----------|-------------------|
| EC-OP-01 | Market closes (14:45 ICT) while user has the screen open and form partially filled | Error banner appears: "KHÔNG THỂ ĐẶT LỆNH" / "Thị trường đã đóng cửa lúc 14:45. Hãy thử lại vào ngày giao dịch tiếp theo."; CTA shows "Kiểm tra lại thông tin" (disabled); user can still view Sổ lệnh chờ / Danh mục / Lịch sử |
| EC-OP-02 | Ticker is suspended (halted) while user has screen open | Error banner: "KHÔNG THỂ ĐẶT LỆNH" / "Giao dịch [TICKER] đang tạm dừng theo quyết định của sàn."; form inputs remain visible but CTA disabled |
| EC-OP-03 | Ticker in "cảnh báo huỷ niêm yết" (delisting warning) state | Warning notice appears within the screen (not the blocking error banner); user is informed but can still attempt to place orders; exact warning text: "Cổ phiếu [TICKER] đang trong diện cảnh báo huỷ niêm yết." |
| EC-OP-04 | Available cash decreases (another BUY limit order reserves capital) while screen is open | On next 30-second refresh: available cash display updates; if updated balance makes entered quantity now insufficient, VỐN ẢO SAU LỆNH shows 0% or negative; CTA switches to "Kiểm tra lại thông tin" |
| EC-OP-05 | User has 50 pending orders (at cap) and tries to place a new one | CTA tap opens confirmation sheet; on submit, API returns error; error banner: "Đạt 50 lệnh chờ (cap)"; user must cancel an existing order |
| EC-OP-06 | User enters a valid Stop-Limit form; validity = 7 days; taps confirm; between FORM_VALID and confirmation sheet appearing, end_date is in the past (clock edge) | Server returns error; error banner with server message; form preserved |
| EC-OP-07 | User opens Stop form; GIÁ THAM CHIẾU shows 42,800; user attempts to interact with [-] or [+] steppers | Steppers are non-interactive (grayed visual state); no value change; no error toast |
| EC-OP-08 | User taps [100%] quick-select on LO BUY; price field is empty | [100%] tapped but price field has no value, so quantity cannot be computed; quantity field remains empty or shows 0; no crash |
| EC-OP-09 | User switches from Stop-Limit to LO; then switches back to Stop-Limit | The quantity value entered before the switch is preserved; price fields (stop_price, limit_price) are reset to empty on each tab switch |
| EC-OP-10 | User's Stop-Limit order triggers while they have the Sổ lệnh chờ panel open | The pending order row updates to show "ĐÃ KÍCH HOẠT"; a new LO child order appears with "Đã tự đặt LO #[child_id]" note; or a push notification is sent if the screen is not in foreground |
| EC-OP-11 | Weekend or market holiday; user opens screen | Error banner shown from screen open: "KHÔNG THỂ ĐẶT LỆNH" with holiday message; Sổ lệnh chờ, Danh mục, Lịch sử remain accessible |
| EC-OP-12 | User places SELL Stop order with qty = 100; also has an open SELL LO for 150 shares of same ticker (soft-locked) | If total holdings = 200, available for new SELL = 200 - 150 = 50 (soft-lock from LO applied); qty = 100 triggers "Bán vượt nắm giữ (50 CP)" error |

---

## 8. Design Requirements

Design confirmed from screenshots (v1.1 update). All dimensions, colors, and exact component names to be validated against Paave Design System (Figma). This section documents observed design decisions from the screenshot set.

### 8.1 Screen Container

- Full-screen layout (not a bottom sheet); no sheet animation for the primary form view
- Sticky price header: remains fixed as user scrolls the form area
- Error/warning banner: rendered above the price header when active; pushes header down

### 8.2 Price Header

- Background: dark surface color matching the app's dark theme
- "● LIVE" dot: green pulsing indicator
- Timestamp: "HH:MM:SS" format (seconds visible); exchange name after dash
- Ceiling label: "Trần" prefix; value in orange/purple
- TC label: "TC" prefix; value in gray
- Floor label: "Sàn" prefix; value in teal/blue
- Large price: H1 bold; red when below TC, green when above TC
- Change row: smaller font; same color coding as large price

### 8.3 Orderbook / Chart Tabs

- Two tabs: "≡ Sổ lệnh" (icon + text) and "∿ Biểu đồ" (icon + text)
- Active tab: underlined or highlighted
- Buy pressure bar: "Mua [N]%" green segment left; "Bán [M]%" red segment right; bar spans full width
- Orderbook: 5 columns, 3 data rows; GIÁ KHỚP column centered; buy side values in green, sell side in red

### 8.4 Position Card

- Shown only when holdings > 0
- Green bullet "●" before "VỊ THẾ HIỆN TẠI" label
- Card has subtle background elevation
- Unrealized PnL: green for positive, red for negative

### 8.5 MUA / BÁN Buttons

- Full-width row; equal halves
- MUA active: yellow-green (`#CDFF4C` approximate or design system accent); dark text; "↑ MUA" label
- BÁN active: dark/charcoal background; white text; "↓ BÁN" label
- Touch target minimum: 48dp height

### 8.6 Order Type Selector

- "LOẠI LỆNH" label uppercase, secondary text color, left-aligned
- "ⓘ Giải thích" pill button right-aligned; small text; pill shape with border
- 3 tabs in a segmented control: LO | Stop-Limit | Stop
- Active tab: yellow/accent background; dark text
- Inactive tabs: dark background; muted text
- No disabled tabs in V1

### 8.7 Form Fields

- Field label: uppercase, secondary text color, left
- Helper text: primary text color or orange (for ceiling), right
- Input container: dark background; rounded; stepper [-] on left, [+] on right; value + unit centered
- Invalid state: red border (2dp) around input container; value text in red
- Error text below field: red, small font

### 8.8 HIỆU LỰC LỆNH (Stop-Limit and Stop forms)

- Section label: "HIỆU LỰC LỆNH" uppercase left; "[N] ngày" orange text right
- Quick buttons: [Hôm nay] [7 ngày] [30 ngày] [90 ngày] in a row; pill shape; active = yellow
- Date range row: "TỪ NGÀY [DD/MM/YY] → ĐẾN NGÀY [DD/MM/YY]"; secondary text color

### 8.9 GIÁ THAM CHIẾU (Stop form only)

- Visually identical to other price fields but with 40% opacity / grayed appearance
- [-] and [+] stepper buttons rendered in disabled state (not interactive)
- "Snapshot khi trigger" helper text in gray (secondary color)

### 8.10 % Quick-Select (LO form only)

- 5 pill buttons: [10%] [25%] [50%] [75%] [100%]
- Row below form fields, above order summary card
- Active pill: yellow/accent background; dark text
- Inactive pills: muted border; muted text

### 8.11 Order Summary Card

- Card with slight elevation or border; dark background
- "Phí & thuế: Miễn phí" in orange/yellow accent text
- Amber highlight box for "Vốn ảo dự trữ" (LO BUY) or reserve notice (Stop/Stop-Limit): amber background, dark amber text
- "VỐN ẢO SAU LỆNH" row: label left; "₫[amount] / [pct]% khả dụng" right; bold

### 8.12 Primary CTA Button

- "Kiểm tra lại thông tin" (disabled): gray background; muted text; no interaction response
- "Đặt lệnh" (enabled): yellow-green background (`#CDFF4C` approximate); dark bold text; full width; rounded-lg
- Loading state during PROCESSING: spinner replaces text on confirmation sheet CTA only

### 8.13 Confirmation Sheet

- Bottom sheet over blurred background
- Drag handle at top (pill shape, centered)
- Title: bold, H2; subtitle: small, secondary text
- Summary table: label left (secondary), value right (primary); Tổng ước tính in orange
- Two buttons full-width: "Huỷ" left half (dark/charcoal); "✦ Xác nhận mua/bán" right half (yellow-green, bold)
- "✦" decorative prefix on confirm button

### 8.14 Panel Below CTA

- Fixed below primary CTA button; does not scroll with form
- Tab labels: "Sổ lệnh chờ [N]" | "Danh mục [N]" | "Lịch sử (thường + ĐK)"
- Active tab underlined or highlighted
- Side badge colors: MUA = green pill; BÁN = red pill
- Order type badges: "LO" / "Stop-Limit" / "Stop" in gray pill
- Action buttons in Sổ lệnh chờ: "SỬA" in blue/teal pill; "HUỶ" in red pill; ">" chevron for expand

### 8.15 Error Banner

- Sticky, full width, positioned above price header
- Background: red or orange
- "KHÔNG THỂ ĐẶT LỆNH": uppercase, bold, red or white label
- Warning icon on left
- Body message text below title

---

## 9. Validation Logic Table

This table is the authoritative reference for every validation rule. Every error message is an exact string, not a description.

### 9.1 Quantity Field Validation

| Rule | Condition | Error Code | Exact Error Message (VI) — as shown in design |
|------|-----------|------------|----------------------------------------------|
| Empty / zero | `quantity = 0` or empty | E-OP-01 | "SL trống (0)" |
| Board lot (VN exchanges) | `quantity % 100 ≠ 0` AND exchange IN (HOSE, HNX) | E-OP-02 | "Sai lô · [qty] CP (bội 100)" |
| Non-integer | `quantity` contains decimals | E-OP-Q-03 | "Khối lượng phải là số nguyên." |
| Zero or negative | `quantity < 0` | E-OP-Q-04 | "Khối lượng phải lớn hơn 0." |
| Maximum quantity | `quantity > 1,000,000` | E-OP-Q-02 | "Khối lượng tối đa cho mỗi lệnh là 1.000.000 cổ phiếu." |
| SELL quantity exceeds available holdings | `qty > available_holdings` | E-OP-06 | "Bán vượt nắm giữ ([available_holdings] CP)" |
| SELL with zero holdings | `available_holdings = 0` | E-OP-07 | "Bán mã chưa sở hữu ([TICKER])" |

### 9.2 Limit Price (LO: GIÁ ĐẶT) Field Validation

| Rule | Condition | Error Code | Exact Error Message (VI) — as shown in design |
|------|-----------|------------|----------------------------------------------|
| Price above ceiling | `price > ceiling_price` | E-OP-04 | "Vượt trần · [price] (trần [ceiling_price])" |
| Price below floor | `price < floor_price` | E-OP-05 | "Dưới sàn · [price] (sàn [floor_price])" |
| Tick size violation | `price % tick_size ≠ 0` | E-OP-03 | "Sai bước · [price]đ (bước [tick_size]đ)" |
| Zero or negative | `price ≤ 0` | E-OP-P-01 | "Giá phải lớn hơn 0." |

### 9.3 Stop Price (GIÁ KÍCH HOẠT: Stop-Limit and Stop) Field Validation

| Rule | Condition | Error Code | Exact Error Message (VI) |
|------|-----------|------------|--------------------------|
| BUY stop below current price | `stop_price ≤ last_price` (BUY) | E-OP-SP-01 | "Giá dừng lệnh mua phải cao hơn giá hiện tại ([last_price] ₫) để kích hoạt đột phá giá." |
| SELL stop above current price | `stop_price ≥ last_price` (SELL) | E-OP-SP-02 | "Giá dừng lệnh bán phải thấp hơn giá hiện tại ([last_price] ₫) để bảo vệ khỏi thua lỗ." |
| Stop price above ceiling | `stop_price > ceiling_price` | E-OP-SP-03 | "Giá dừng vượt mức trần hôm nay ([ceiling_price] ₫) cho [TICKER] trên [EXCHANGE]." |
| Stop price below floor | `stop_price < floor_price` | E-OP-SP-04 | "Giá dừng thấp hơn mức sàn hôm nay ([floor_price] ₫) cho [TICKER] trên [EXCHANGE]." |
| Tick size violation | `stop_price % tick_size ≠ 0` | E-OP-SP-05 | "Giá dừng phải là bội số của [tick_size] ₫." |
| Zero or negative | `stop_price ≤ 0` | E-OP-SP-06 | "Giá dừng phải lớn hơn 0." |

### 9.4 Balance Check (Client-Side Pre-Confirmation)

| Rule | Condition | Error Code | Exact Error Message (VI) |
|------|-----------|------------|--------------------------|
| BUY LO: total cost exceeds available cash | `(qty × price) > available_cash` | E-OP-08 | "Thiếu vốn · [qty] CP @ [price]" |
| Pending orders at cap | open_order_count ≥ 50 | E-OP-09 | "Đạt 50 lệnh chờ (cap)" |
| Foreign ownership room full | foreign_room_remaining = 0 (for stocks with foreign limits) | E-OP-10 | "Room ngoại đầy (NĐT NN)" |

### 9.5 Market / Exchange State Validation (shown as error banner — "KHÔNG THỂ ĐẶT LỆNH")

| State | Error Code | Banner Message |
|-------|------------|----------------|
| Market closed / suspended (HOSE tạm ngưng) | E-MK-01 | "HOSE tạm ngưng giao dịch — lỗi hệ thống. Thử lại sau ít phút." |
| Symbol suspended | E-MK-02 | "Giao dịch [TICKER] đang tạm dừng theo quyết định của sàn." |
| Symbol delisted | E-MK-03 | "Cổ phiếu này đã hủy niêm yết trên [EXCHANGE] và không thể giao dịch." |
| Market holiday | E-MK-04 | "Hôm nay là ngày nghỉ thị trường. Thị trường sẽ mở cửa vào ngày giao dịch tiếp theo." |
| Market closed after hours / weekend | E-MK-05 | "Thị trường đã đóng cửa lúc 14:45. Hãy thử lại vào ngày giao dịch tiếp theo." |

### 9.6 Server-Returned Error Messages (Displayed as Error Banner After Failed Submission)

The client must display these exact strings verbatim from the API `message` field:

| Error Code | Exact Message (VI) to Display |
|------------|-------------------------------|
| E-PT-101 | "Thị trường VN đang đóng cửa. Giờ giao dịch: 09:00–14:45 ICT (Thứ 2–6, trừ ngày nghỉ lễ VN)." |
| E-PT-104 | "Cổ phiếu này đang bị đình chỉ giao dịch theo quyết định của sàn." |
| E-PT-105 | "Cổ phiếu này đã hủy niêm yết trên [EXCHANGE] và không thể giao dịch." |
| E-PT-107 | "Khối lượng phải là bội số của 100 cổ phiếu trên [EXCHANGE]. Gợi ý: [floor_qty] hoặc [ceil_qty] cổ phiếu." |
| E-PT-108 | "Không đủ tiền ảo. Khả dụng: [available] ₫. Chi phí ước tính: [cost] ₫." |
| E-PT-109 | "Không đủ cổ phiếu. Bạn đang nắm giữ [available_qty] cổ phiếu [TICKER]; yêu cầu bán [requested_qty] cổ phiếu." |
| E-PT-110 | "Bạn không sở hữu cổ phiếu [TICKER]. Giao dịch bán khống không có trong paper trading." |
| E-PT-115 | "Không nhận lệnh mới trong phiên ATC (14:30–14:45 ICT). Đặt lệnh ATC thay thế." |
| E-PT-116 | "Bạn đã đạt giới hạn 50 lệnh chờ. Huỷ lệnh hiện có để đặt lệnh mới." |
| E-PT-203 | "Giá vượt mức trần hôm nay ([ceiling] ₫) cho [TICKER] trên [EXCHANGE]." |
| E-PT-204 | "Giá thấp hơn mức sàn hôm nay ([floor] ₫) cho [TICKER] trên [EXCHANGE]." |
| E-PT-205 | "Giá phải là bội số của [tick_size] ₫. Bạn có muốn nhập [round_down] ₫ hoặc [round_up] ₫ không?" |
| E-PT-206 | "Không đủ số dư để đặt cọc. Khả dụng: [available] ₫. Cần: [required] ₫. Đã đặt cọc: [reserved] ₫ cho các lệnh khác." |
| Network timeout (client) | "Kết nối bị gián đoạn. Vui lòng kiểm tra lại trong Sổ lệnh chờ trước khi thử lại." |

---

## 10. Traceability Matrix

| Business Objective | Functional Requirement | Business Rule | Validation Logic | Test Case |
|--------------------|------------------------|---------------|-----------------|-----------|
| BO-04 (Paper Trading Core Loop) | FR-OP-01 (Price Header) | BR-OP-14 (exact error strings) | §3.2 Market state banner | AC-OP-01-01, AC-OP-01-02, AC-OP-01-03 |
| BO-04 (Paper Trading Core Loop) | FR-OP-02 (Orderbook/Chart Toggle) | — | §8.3 Orderbook columns | AC-OP-02-01 through AC-OP-02-05 |
| BO-04 (Paper Trading Core Loop) | FR-OP-03 (Position Card) | — | Holdings ≥ 1 → show card | AC-OP-03-01, AC-OP-03-02, AC-OP-03-03 |
| BO-04 (Paper Trading Core Loop) | FR-OP-04 (Side Selection MUA/BÁN) | BR-OP-07 (no short selling) | §9.1 E-OP-06, E-OP-07 | AC-OP-04-01 through AC-OP-04-03 |
| BO-04 (Paper Trading Core Loop) | FR-OP-05 (Order Type Selector) | — | 3 tabs, all enabled V1 | AC-OP-05-01 through AC-OP-05-04 |
| BO-04 (Paper Trading Core Loop) | FR-OP-06 (LO Form) | BR-OP-03 (board lot), BR-OP-13 (tick size) | §9.1 E-OP-01, E-OP-02; §9.2 E-OP-03, E-OP-04, E-OP-05 | AC-SET-01, AC-SET-02 |
| BO-04 (Paper Trading Core Loop) | FR-OP-07 (Stop-Limit Form) | BR-OP-11 (validity required), BR-OP-06 (no reserve) | §9.3 stop price validation | AC-SET-03, AC-SET-04 |
| BO-04 (Paper Trading Core Loop) | FR-OP-08 (Stop Form) | BR-OP-12 (ref price read-only), BR-OP-11 (validity) | §9.3 stop price validation | AC-SET-05, AC-SET-06 |
| BO-08 (≥70% place trade within 3 sessions) | FR-OP-09 (Order Summary Card) | BR-OP-02 (Miễn phí), BR-OP-05 (LO BUY reserve), BR-OP-06 (Stop no reserve) | §9.4 balance check E-OP-08 | AC-OP-09-01 through AC-OP-09-05 |
| BO-08 (≥70% place trade within 3 sessions) | FR-OP-10 (CTA Button States) | BR-OP-04 (qty max), BR-OP-07 (no short) | §9.4 E-OP-08, E-OP-09 | AC-OP-10-01 through AC-OP-10-05 |
| BO-08 (≥70% place trade within 3 sessions) | FR-OP-11 (Confirmation Sheet) | BR-OP-01 (paper trading context), BR-OP-09 (idempotency_key) | All validation passed before sheet shows | AC-OP-11-01 through AC-OP-11-05 |
| BO-08 (≥70% place trade within 3 sessions) | FR-OP-12 (Submission and Outcome) | BR-OP-09 (idempotency_key), BR-OP-10 (no dismiss during PROCESSING) | §9.6 server error messages | AC-OP-12-01 through AC-OP-12-04 |
| BO-04 (Paper Trading Core Loop) | FR-OP-13a (Sổ lệnh chờ Tab) | BR-OP-08 (50 order cap) | §9.4 E-OP-09 | AC-OP-13a-01 through AC-OP-13a-04 |
| BO-04 (Paper Trading Core Loop) | FR-OP-13b (Danh mục Tab) | — | Holdings display | AC-OP-13b-01, AC-OP-13b-02, AC-OP-13b-03 |
| BO-04 (Paper Trading Core Loop) | FR-OP-13c (Lịch sử Tab) | — | §9.5/9.6 status mapping | AC-OP-13c-01 through AC-OP-13c-05 |
| BRD §BO-04 (Paper Trading Label) | FR-OP-11, FR-OP-12 | BR-OP-01 (paper trading context non-dismissible) | "Miễn phí" + "vốn ảo, không rủi ro thật" | AC-OP-11-01, AC-OP-09-01 |
| Risk: Market state edge cases | FR-OP-01 (Price Header), §3.2 | BR-OP-14 (exact error strings) | §9.5 market state errors | EC-OP-01, EC-OP-02, EC-OP-03, EC-OP-11 |
| Risk: Price movement mid-form | FR-OP-06 (LO Form) | BR-OP-13 (tick size) | §9.2 live ceiling/floor check | EC-OP-04 |
| Risk: Concurrent order limit | FR-OP-10, FR-OP-12 | BR-OP-08 (50 order cap) | §9.4 E-OP-09 | EC-OP-05, AC-OP-12-02 |
| Risk: Double submission | FR-OP-12 (Submission) | BR-OP-09 (idempotency_key), BR-OP-10 (no dismiss during PROCESSING) | Client disables CTA on first tap | AC-OP-12-03 |
| Risk: Stop order read-only field | FR-OP-08 (Stop Form) | BR-OP-12 (GIÁ THAM CHIẾU read-only) | Field non-interactive | AC-OP-08-02, AC-OP-08-03, EC-OP-07 |

---

## 11. Related Documents

| Document | Relationship |
|----------|-------------|
| FRD-10: Paper Trading Engine (v2.4) | Authority on all order engine rules, fill mechanics, error codes E-PT-xxx, state machine, and business rules BR-PT-xx; FRD-20 specifies only the screen over those rules |
| SRD-order-engine-v2.3.md | System-level order processing flow; API endpoint `POST /api/v1/paper-trading/orders`; validation sequence; Redis idempotency store |
| SRD-20-order-placement-v2.md | To be authored: system-level specification of the order placement screen's API calls (live price feed subscription, market state polling, balance/holdings fetch, stop order history endpoint) |
| BRD.md §BO-04, §BO-08, §5.1.5 | Business objectives driving this feature; paper trading scope definition; board lot and session rules |
| FRD-04: Stock Detail | Entry point for this screen ("Đặt lệnh" button on the Stock Detail action row) |
| FRD-19: Order Management | Order cancellation flow; "SỬA" and "HUỶ" actions in Sổ lệnh chờ tab link to this spec |
| FRD-18: Order History & Orderbook | Trade history records created as an outcome of successful fills; Lịch sử tab in this screen is a summary view of that data |
| business-rules.md §BR-17, §BR-18 | Starting balance and paper trading label rules that apply to all paper trading screens including this one |
| FRD-16: Brokerage Integration (planned) | V2 scope: when real trading is added, this screen will be extended per a new FRD-20 v2.0 document |
| FRD-i-brokerage.md (planned) | V2 roadmap: defines real trading account linking; will drive the MP, ATO, ATC order types removed from V1 scope |

---

*End of FRD-20: Order Placement V2*
*Version 1.1 — 2026-06-01*
*V1 Scope: LO, Stop-Limit, Stop — virtual paper trading only. MP, ATO, ATC deferred to V2.*
*Authoritative for Order Placement Screen UI and UX. Engine rules remain in FRD-10.*

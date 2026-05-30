# FRD-20: Order Placement V2
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Version:** 1.0
**Date:** 2026-05-29
**Author:** Business Analysis Team
**Supersedes:** FRD-10 §6 UI/UX Notes (Order Entry Screen, Order Confirmation Screen)
**Linked BRD:** BRD.md §BO-04 (Paper Trading Core Loop), §BO-08
**Linked SRD:** SRD-order-engine-v2.3.md, SRD-20-order-placement-v2.md (to be authored)
**Status:** Draft — Pending Design Screenshot Confirmation

> **Purpose:** This document specifies the Order Placement V2 screen — the full user interface and interaction model for placing paper trades on Paave. FRD-10 specifies the underlying order engine rules (price bands, fill mechanics, state machine, error codes). This document specifies the screen that exposes those rules to the user. A developer reading this document in conjunction with FRD-10 must be able to implement the complete order placement experience. A QA engineer must be able to write complete test cases covering all 6 order types × BUY/SELL from this document alone.

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
| Goal | Allow the user to specify, review, and confirm a paper trade order for any supported VN stock across all 6 order types (LO, MP, ATO, ATC, STOP_LIMIT, STOP) |
| Entry Trigger | User taps "Đặt lệnh" (Trade) button on the Stock Detail screen |
| Supported Exchanges | HOSE, HNX, UPCOM (primary, VN real-time); KOSPI, KOSDAQ, GLOBAL (reference-only; order type support limited to LO and MP) |
| Markets In Scope | All markets supported by FRD-10 |
| Previous Version | FRD-10 §6 UI/UX Notes — basic entry screen; no STOP_LIMIT, no STOP, no order summary card, no dynamic form switching |
| Non-negotiable | "Tiền ảo" badge mandatory; no real trades executed; VND formatting `1.250.000 ₫` |

### 1.1 Order Types in Scope

| Order Type | Vietnamese Name | Price Fields | Exchanges | Sessions |
|------------|-----------------|--------------|-----------|----------|
| LO | Lệnh Giới Hạn | `price` (limit) | HOSE, HNX, UPCOM, KR, Global | PRE_OPEN, CONT (both halves), LUNCH, AFTER |
| MP | Lệnh Thị Trường | none (null) | HOSE, HNX | CONT only |
| ATO | Lệnh ATO | none (null) | HOSE, HNX | PRE_OPEN (09:00–09:15 ICT) |
| ATC | Lệnh ATC | none (null) | HOSE, HNX | ATC Period (14:30–14:45 ICT) |
| STOP_LIMIT | Lệnh Dừng-Giới Hạn | `stop_price` + `price` | HOSE, HNX, UPCOM | PRE_OPEN, CONT (both halves), LUNCH, AFTER |
| STOP | Lệnh Dừng | `stop_price` | HOSE, HNX, UPCOM | PRE_OPEN, CONT (both halves), LUNCH, AFTER |

### 1.2 Core Invariants (Never Violated)

| Invariant | Rule |
|-----------|------|
| No real trades | No brokerage API call is ever made; all trades are simulated in Paave's virtual portfolio system |
| "Tiền ảo" badge | Must appear at all times on this screen; non-dismissible; renders as `<VirtualFundsLabel />` |
| VND formatting | `1.250.000 ₫` — period as thousands separator, space before dong symbol, zero decimal places |
| Board lot | All VN exchange quantities must be positive multiples of 100 |
| Fee + Tax display | 0.25% fee for all sides; 0.1% sell tax on SELL orders; both shown on the summary card before confirm |
| STOP/STOP_LIMIT educational note | "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam" shown whenever STOP or STOP_LIMIT is selected |

---

## 2. User Flow

The complete user flow from discovery to post-trade state:

```
Stock Detail Screen
       │
       │  User taps "Đặt lệnh" button
       ▼
[FR-OP-01] Screen Opens
  Order Placement Sheet (bottom sheet on mobile / full-screen modal)
  State: FORM
  - Pre-filled: symbol_code, exchange, last_price (live)
  - Default side: BUY
  - Default order type: LO (unless session context favors another — see FR-OP-05)
       │
       │  User selects BUY or SELL (side toggle)
       │  User selects order type tab
       │  User fills form fields (price, stop_price, quantity)
       │  [FR-OP-08] Summary card updates live as user types
       ▼
[FR-OP-03] Form Validation (client-side, real-time)
  - Each field validated on blur and on change
  - Inline error messages appear below each invalid field
  - Confirm button remains disabled while any field has an error
       │
       │  All fields pass client validation
       │  User taps "Xem lại lệnh" (Review Order)
       ▼
[FR-OP-09] Confirmation Modal
  State: CONFIRMING
  - Full order summary displayed
  - "Tiền ảo" badge visible
  - STOP/STOP_LIMIT: educational note displayed
  - Two CTAs: "Xác nhận đặt lệnh" (primary) | "Sửa lệnh" (secondary — returns to FORM)
       │
       │  User taps "Xác nhận đặt lệnh"
       ▼
[FR-OP-10] Submission
  State: PROCESSING
  - Loading spinner; button disabled
  - POST /api/v1/paper-trading/orders with idempotency_key
       │
       ├─── [HTTP 201] Order accepted
       │           ▼
       │    State: SUCCESS
       │    [FR-OP-11] Success state shown
       │    - Order ID, type, side, quantity, price/stop_price displayed
       │    - "Xem danh mục" CTA → navigates to Portfolio
       │    - "Đặt lệnh mới" CTA → resets form (returns to FORM state)
       │    - Sheet auto-dismisses after 3 seconds if user takes no action
       │
       └─── [HTTP 4xx / 5xx] Submission rejected
                   ▼
            State: ERROR
            [FR-OP-12] Error state shown
            - Error message (exact string from error code table — see §9)
            - "Thử lại" CTA → returns to FORM with current values preserved
            - "Huỷ" CTA → dismisses sheet entirely
```

---

## 3. UX Screen States

The Order Placement Sheet cycles through the following states. Each state is mutually exclusive — only one is active at a time.

| State ID | State Name | Description | Entry Condition | Exit Condition |
|----------|-----------|-------------|-----------------|----------------|
| S-OP-01 | CLOSED | Sheet not rendered in DOM/view tree | App default | User taps "Đặt lệnh" on Stock Detail |
| S-OP-02 | FORM | Form is visible and editable; user fills fields | Sheet opens; or user taps "Sửa lệnh" from CONFIRMING; or user taps "Thử lại" from ERROR | User taps "Xem lại lệnh" with all fields valid |
| S-OP-03 | VALIDATING | Brief transitional state: client-side validation runs synchronously | User taps "Xem lại lệnh" | Validation passes → CONFIRMING; validation fails → FORM (with inline errors) |
| S-OP-04 | CONFIRMING | Full order summary displayed; waiting for user confirmation | VALIDATING passes | User taps "Xác nhận đặt lệnh" → PROCESSING; user taps "Sửa lệnh" → FORM |
| S-OP-05 | PROCESSING | API call in flight; UI locked | User taps "Xác nhận đặt lệnh" | HTTP 201 → SUCCESS; HTTP 4xx/5xx → ERROR |
| S-OP-06 | SUCCESS | Order accepted confirmation displayed | HTTP 201 received | User taps "Xem danh mục" → Portfolio; user taps "Đặt lệnh mới" → FORM; 3s auto-dismiss → CLOSED |
| S-OP-07 | ERROR | Rejection or network error displayed | HTTP 4xx/5xx received, or network timeout | User taps "Thử lại" → FORM (values preserved); user taps "Huỷ" → CLOSED |

### 3.1 Sheet Animation Specification

| Transition | Animation |
|-----------|-----------|
| CLOSED → FORM | Sheet slides up from bottom edge; duration 300ms; easing: ease-out cubic-bezier(0.0, 0.0, 0.2, 1.0) |
| FORM → CONFIRMING | Sheet content crossfades; form replaced by confirmation summary; duration 200ms |
| CONFIRMING → FORM (back) | Reverse crossfade; duration 200ms; form fields retain their values |
| Any state → CLOSED | Sheet slides down to bottom edge; duration 250ms; easing: ease-in cubic-bezier(0.4, 0.0, 1.0, 1.0) |
| PROCESSING | Confirm button shows loading spinner; all inputs and CTAs disabled |
| SUCCESS | Success illustration animates in (scale from 0.8 to 1.0); duration 300ms |
| ERROR | Error icon and message fade in; duration 200ms |

---

## 4. Functional Requirements

---

### FR-OP-01 — Sheet Entry and Pre-Fill

**Priority:** P0

**Actor:** Authenticated user (LEARN_MODE or FULL_ACCESS)

**Description:**
When the user taps "Đặt lệnh" on the Stock Detail screen, the Order Placement Sheet opens in FORM state. The sheet is pre-filled with the stock's context. The last price displayed in the sheet header is fetched from the same live price feed as the Stock Detail screen and updates every 15 seconds while the sheet is open.

**Pre-fill behaviour:**

| Field | Pre-filled Value | Source |
|-------|-----------------|--------|
| `symbol_code` | Ticker symbol of the stock | Stock Detail screen context |
| `exchange` | Exchange of the stock | Stock Detail screen context |
| Last price display | `last_price` | Live price feed; updates every 15 seconds |
| Side toggle | BUY (default) | Hardcoded default |
| Order type | LO (default) unless overridden by session context (see FR-OP-05) | Session-aware default |
| All price/quantity fields | Empty (user must fill) | — |

**Preconditions:**
- User is authenticated with ACTIVE account
- User has an ACTIVE virtual portfolio
- Stock Detail screen has a valid `symbol_code` and `exchange`

**Postconditions:**
- Sheet is visible in FORM state
- Header shows stock ticker, exchange chip, and live last price
- "Tiền ảo" badge is visible in header
- Side toggle shows BUY (green) as selected
- Default order type tab is selected (LO unless session override applies)
- Available cash (BUY side) or available holdings count (SELL side) is displayed

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-01-01 | User is on Stock Detail for VIC (HOSE) | User taps "Đặt lệnh" | Sheet opens; header shows "VIC · HOSE · [last_price] ₫"; BUY selected; LO tab selected; "Tiền ảo" badge visible |
| AC-OP-01-02 | Current time is 09:05 ICT (HOSE PRE_OPEN session) | User opens sheet for VIC | Default order type tab is ATO (not LO); LO and MP tabs are present but not selected by default |
| AC-OP-01-03 | Current time is 14:35 ICT (HOSE ATC session) | User opens sheet for VIC | Default order type tab is ATC; STOP, STOP_LIMIT, LO, MP tabs present but not default |
| AC-OP-01-04 | User switches from Stock Detail to Order Placement then back to Stock Detail | Price changes by 500 VND during that time | Sheet header price updates to new value within 15 seconds of change |

---

### FR-OP-02 — Side Toggle (BUY / SELL)

**Priority:** P0

**Actor:** Authenticated user

**Description:**
A two-state toggle at the top of the form allows the user to switch between BUY (Mua) and SELL (Bán). The toggle is always visible and always enabled. Switching side immediately updates: the available balance/holdings display, the order summary card values, and any side-specific validation messages. The toggle has distinct visual treatment: BUY = green background; SELL = red background.

**BUY side:**
- Available balance line reads: "Khả dụng: [available_cash] ₫" where `available_cash = total_cash − SUM(open_buy_limit_reserves)`
- Order summary shows: Gross value, Fee (0.25%), Total estimated cost

**SELL side:**
- Available holdings line reads: "Đang nắm giữ: [available_quantity] cổ phiếu [TICKER]" where `available_quantity = holdings.quantity − soft_locked_quantity`
- Order summary shows: Gross value, Fee (0.25%), Sell tax (0.1%), Total estimated proceeds

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-02-01 | User has 50,000,000 ₫ available cash; 5,000,000 ₫ reserved for open BUY limits | Opens sheet on BUY side | Shows "Khả dụng: 45.000.000 ₫" |
| AC-OP-02-02 | User holds 500 VIC shares; 100 are soft-locked by open SELL limit | Opens sheet on SELL side for VIC | Shows "Đang nắm giữ: 400 cổ phiếu VIC" (unlocked quantity only) |
| AC-OP-02-03 | User is on BUY side | Taps SELL toggle | Visual switches to red; available balance area switches to holdings display; summary card recalculates; all form fields reset to empty |
| AC-OP-02-04 | User has 0 shares of VIC | Switches to SELL side | Shows "Đang nắm giữ: 0 cổ phiếu VIC"; quantity field accepts input but validation will fail on review |

---

### FR-OP-03 — Order Type Selector

**Priority:** P0

**Actor:** Authenticated user

**Description:**
A horizontal tab row (or segmented control) displays the available order types. Only order types valid for the current exchange AND current market session are enabled. Order types unavailable for the session are shown as disabled tabs (greyed out, not hidden) with a tooltip explaining why they are unavailable.

**Order type tab availability rules:**

| Order Type | HOSE/HNX PRE_OPEN | HOSE/HNX CONT | HOSE/HNX LUNCH | HOSE/HNX ATC | HOSE/HNX AFTER | UPCOM | KR/Global |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| LO | enabled | enabled | enabled | disabled¹ | enabled | enabled | enabled |
| MP | disabled² | enabled | disabled³ | disabled¹ | disabled | disabled⁴ | enabled |
| ATO | enabled | disabled⁵ | disabled⁵ | disabled⁵ | disabled⁵ | disabled⁵ | disabled⁵ |
| ATC | disabled⁵ | disabled⁵ | disabled⁵ | enabled | disabled⁵ | disabled⁵ | disabled⁵ |
| STOP_LIMIT | enabled | enabled | enabled | disabled¹ | enabled | enabled | disabled⁵ |
| STOP | enabled | enabled | enabled | disabled¹ | enabled | enabled | disabled⁵ |

Footnotes:
1. New orders not accepted during ATC Period (14:30–14:45); only ATC orders accepted
2. MP not accepted during PRE_OPEN; ATO is the correct type
3. MP not accepted during LUNCH break; orders accepted at CONT resume
4. MP not supported on UPCOM (E-PT-121)
5. Not applicable to this exchange/session

**Tooltip text for disabled tabs:**

| Disabled Tab | Session | Tooltip |
|-------------|---------|---------|
| LO, MP, STOP, STOP_LIMIT | ATC Period | "Chỉ nhận lệnh ATC trong phiên đóng cửa (14:30–14:45)" |
| MP, STOP, STOP_LIMIT, ATO, ATC | PRE_OPEN | "Lệnh MP không được chấp nhận trong phiên tiền mở cửa. Dùng lệnh ATO." |
| ATO | Outside PRE_OPEN | "Lệnh ATO chỉ được đặt trong phiên 09:00–09:15" |
| ATC | Outside ATC Period | "Lệnh ATC chỉ được đặt trong phiên 14:30–14:45" |
| STOP, STOP_LIMIT | KR/Global | "Lệnh dừng chỉ hỗ trợ trên các sàn VN (HOSE, HNX, UPCOM)" |
| MP | UPCOM | "Lệnh thị trường không có trên UPCOM. Dùng lệnh LO." |

**Session displayed to user:**
A small session indicator line below the order type tabs shows the current session and time remaining (e.g., "Phiên liên tục · Còn 2 giờ 15 phút" or "Phiên tiền mở cửa · Còn 8 phút").

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-03-01 | HOSE PRE_OPEN session (09:05 ICT) | User opens sheet for HPG | ATO tab enabled and selected by default; MP, LO, STOP, STOP_LIMIT tabs present but disabled; ATC tab disabled |
| AC-OP-03-02 | HOSE CONT session (10:30 ICT) | User views order type tabs | LO, MP, STOP, STOP_LIMIT tabs enabled; ATO, ATC tabs disabled with tooltips |
| AC-OP-03-03 | HOSE ATC Period (14:35 ICT) | User views order type tabs | Only ATC tab enabled; all other tabs disabled with tooltip "Chỉ nhận lệnh ATC trong phiên đóng cửa (14:30–14:45)" |
| AC-OP-03-04 | UPCOM stock in CONT session | User views order type tabs | LO tab enabled; MP tab disabled with tooltip "Lệnh thị trường không có trên UPCOM. Dùng lệnh LO."; ATO, ATC tabs disabled |
| AC-OP-03-05 | KR stock | User views order type tabs | LO and MP tabs enabled; ATO, ATC, STOP, STOP_LIMIT tabs disabled |
| AC-OP-03-06 | Any session | User taps a disabled tab | Tooltip appears immediately (200ms delay); tab does not become selected |

---

### FR-OP-04 — Dynamic Form: LO (Limit Order)

**Priority:** P0

**Actor:** Authenticated user

**Description:**
When LO is selected, the form renders two input fields: Price (VND) and Quantity. No other fields are shown.

**Form fields:**

| Field | Label (VI) | Type | Constraints |
|-------|-----------|------|-------------|
| `price` | "Giá lệnh (VND)" | Numeric | Must be between `floor_price` and `ceiling_price` inclusive; must conform to tick size; for BUY: must be ≤ `last_price`; for SELL: must be ≥ `last_price` |
| `quantity` | "Khối lượng (cổ phiếu)" | Integer | Must be ≥ 100; must be a multiple of 100 for VN exchanges; must be ≤ 1,000,000 |

**Price input helpers shown below the price field:**
- "Trần: [ceiling_price] ₫ · Sàn: [floor_price] ₫" — updates whenever reference data updates
- Tick size hint: "Nhập giá theo bước [tick_size] ₫"

**Quantity input helpers shown below the quantity field:**
- "Phải là bội số của 100" (VN exchanges)
- Quick-select chips: [100] [200] [500] [1.000]

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-04-01 | LO selected, BUY side, VIC last_price = 85,000 ₫ | User enters price = 87,000 ₫ | Inline error: "Giá mua lệnh giới hạn phải ≤ giá hiện tại (85.000 ₫). Dùng lệnh MP hoặc nhập giá ≤ 85.000 ₫." |
| AC-OP-04-02 | LO selected, SELL side, VIC last_price = 85,000 ₫ | User enters price = 83,000 ₫ | Inline error: "Giá bán lệnh giới hạn phải ≥ giá hiện tại (85.000 ₫). Dùng lệnh MP hoặc nhập giá ≥ 85.000 ₫." |
| AC-OP-04-03 | LO selected, HOSE, ceiling = 90,950 ₫ | User enters price = 91,000 ₫ | Inline error: "Giá vượt mức trần hôm nay (90.950 ₫) cho VIC trên HOSE." |
| AC-OP-04-04 | LO selected, quantity field | User enters 250 | Inline error: "Khối lượng phải là bội số của 100. Gợi ý: 200 hoặc 300 cổ phiếu." |
| AC-OP-04-05 | LO selected | User enters quantity = 50 | Inline error: "Khối lượng tối thiểu là 100 cổ phiếu." |
| AC-OP-04-06 | LO, BUY, price = 80,000 ₫, quantity = 100 | User views form | Summary card shows: Gross = 8.000.000 ₫; Fee (0,25%) = 20.000 ₫; Tổng chi = 8.020.000 ₫ |

---

### FR-OP-05 — Dynamic Form: MP (Market Order)

**Priority:** P0

**Actor:** Authenticated user

**Description:**
When MP is selected, the form renders only the Quantity field. No price field is shown. A persistent warning banner is shown below the order type selector for the duration that MP is selected.

**Warning banner (non-dismissible, shown while MP is active):**
- "Lệnh thị trường có thể khớp ở giá không mong đợi"

**Form fields:**

| Field | Label (VI) | Type | Constraints |
|-------|-----------|------|-------------|
| `quantity` | "Khối lượng (cổ phiếu)" | Integer | Must be ≥ 100; must be multiple of 100 for VN exchanges; must be ≤ 1,000,000 |

**Estimated price display:**
Below the quantity field, the system shows: "Giá ước tính: ~[last_price] ₫ (giá thực tế có thể khác)" — this is purely informational and updates with the live feed.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-05-01 | MP selected | User views form | Warning banner "Lệnh thị trường có thể khớp ở giá không mong đợi" is visible; no price input field is shown |
| AC-OP-05-02 | MP selected, HOSE CONT session | User enters quantity = 100 | Form is valid; "Xem lại lệnh" button becomes enabled |
| AC-OP-05-03 | MP selected, HOSE PRE_OPEN session | MP tab is disabled | User cannot select MP; ATO is the only non-disabled option (AC-OP-03-01 applies) |
| AC-OP-05-04 | MP, SELL, quantity = 100 | User views summary | Summary shows: Gross = ~[last_price × 100] ₫ (estimated); Fee (0,25%); Thuế bán (0,1%); Tổng thu ước tính |

---

### FR-OP-06 — Dynamic Form: ATO (At-The-Open)

**Priority:** P0

**Actor:** Authenticated user

**Description:**
When ATO is selected, the form renders only the Quantity field. No price field is shown. An informational note explains the ATO mechanism. ATO is only selectable during PRE_OPEN session (09:00–09:15 ICT) on HOSE and HNX.

**Informational note (non-dismissible, shown while ATO is active):**
- "Lệnh ATO khớp theo giá mở cửa được tính toán vào 09:15. Giá khớp do sàn xác định."

**Form fields:**

| Field | Label (VI) | Type | Constraints |
|-------|-----------|------|-------------|
| `quantity` | "Khối lượng (cổ phiếu)" | Integer | Must be ≥ 100; must be multiple of 100; must be ≤ 1,000,000 |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-06-01 | ATO selected | User views form | No price input; informational note "Lệnh ATO khớp theo giá mở cửa được tính toán vào 09:15. Giá khớp do sàn xác định." visible |
| AC-OP-06-02 | ATO, BUY, quantity = 200 | User views summary | Summary shows: Quantity = 200; Price = "Theo giá mở cửa" (not a number); Fee displayed as "0,25% × giá khớp"; "Tiền ảo" badge visible |
| AC-OP-06-03 | ATO, SELL | User views form | SELL side shows available holdings; same quantity-only form |

---

### FR-OP-07 — Dynamic Form: ATC (At-The-Close)

**Priority:** P0

**Actor:** Authenticated user

**Description:**
When ATC is selected, the form renders only the Quantity field. Mirrors ATO behaviour but for closing auction. ATC is only selectable during the ATC Period (14:30–14:45 ICT) on HOSE and HNX.

**Informational note (non-dismissible, shown while ATC is active):**
- "Lệnh ATC khớp theo giá đóng cửa được tính toán vào 14:45. Giá khớp do sàn xác định."

**Form fields:**

| Field | Label (VI) | Type | Constraints |
|-------|-----------|------|-------------|
| `quantity` | "Khối lượng (cổ phiếu)" | Integer | Must be ≥ 100; must be multiple of 100; must be ≤ 1,000,000 |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-07-01 | ATC selected | User views form | No price input; informational note "Lệnh ATC khớp theo giá đóng cửa được tính toán vào 14:45. Giá khớp do sàn xác định." visible |
| AC-OP-07-02 | ATC, SELL, quantity = 300 | User views summary | Quantity = 300; Price = "Theo giá đóng cửa"; fee shown as percentage |

---

### FR-OP-08 — Dynamic Form: STOP_LIMIT (Stop-Limit Order)

**Priority:** P1

**Actor:** Authenticated user

**Description:**
When STOP_LIMIT is selected, the form renders three fields: Stop Price, Limit Price, and Quantity. A mandatory educational note is displayed. STOP_LIMIT is a Paave simulation only — it does not exist on VN exchanges in real trading.

**Educational note (non-dismissible, shown while STOP_LIMIT is active):**
- "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam"

**Trigger logic explanation shown in a collapsible tooltip (tapping the "?" icon next to "Lệnh Dừng-Giới Hạn"):**
- BUY: "Khi giá chạm [stop_price], Paave tự động đặt lệnh mua LO tại [price]."
- SELL: "Khi giá giảm xuống [stop_price], Paave tự động đặt lệnh bán LO tại [price]."

**Form fields:**

| Field | Label (VI) | Type | Constraints |
|-------|-----------|------|-------------|
| `stop_price` | "Giá dừng (VND)" | Numeric | BUY: must be > `last_price` (breakout buy trigger); SELL: must be < `last_price` (loss protection trigger); must be within exchange price band; must conform to tick size |
| `price` | "Giá giới hạn (VND)" | Numeric | Standard LO price validation applies; must be between floor_price and ceiling_price; must conform to tick size |
| `quantity` | "Khối lượng (cổ phiếu)" | Integer | Must be ≥ 100; multiple of 100 for VN; ≤ 1,000,000 |

**Stop price direction validation:**

| Side | Valid stop_price range | Error when violated |
|------|----------------------|---------------------|
| BUY STOP_LIMIT | `stop_price > last_price` | "Giá dừng lệnh mua phải cao hơn giá hiện tại ([last_price] ₫) để kích hoạt đột phá giá." |
| SELL STOP_LIMIT | `stop_price < last_price` | "Giá dừng lệnh bán phải thấp hơn giá hiện tại ([last_price] ₫) để bảo vệ khỏi thua lỗ." |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-08-01 | STOP_LIMIT selected | User views form | Three fields shown: Stop Price, Limit Price, Quantity; educational note "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam" visible |
| AC-OP-08-02 | STOP_LIMIT, BUY, last_price = 50,000 ₫ | User enters stop_price = 48,000 ₫ | Inline error: "Giá dừng lệnh mua phải cao hơn giá hiện tại (50.000 ₫) để kích hoạt đột phá giá." |
| AC-OP-08-03 | STOP_LIMIT, SELL, last_price = 50,000 ₫ | User enters stop_price = 52,000 ₫ | Inline error: "Giá dừng lệnh bán phải thấp hơn giá hiện tại (50.000 ₫) để bảo vệ khỏi thua lỗ." |
| AC-OP-08-04 | STOP_LIMIT, BUY, stop_price = 55,000, price = 54,000, quantity = 100 | User reviews summary | Summary shows stop_price, limit price, quantity; educational note present; trigger logic description shown |
| AC-OP-08-05 | STOP_LIMIT selected on KR stock | User views tabs | STOP_LIMIT tab is disabled; tooltip "Lệnh dừng chỉ hỗ trợ trên các sàn VN (HOSE, HNX, UPCOM)" shown |

---

### FR-OP-09 — Dynamic Form: STOP (Stop Market Order)

**Priority:** P1

**Actor:** Authenticated user

**Description:**
When STOP is selected, the form renders two fields: Stop Price and Quantity. A mandatory educational note is displayed. Same simulation note as STOP_LIMIT.

**Educational note (non-dismissible, shown while STOP is active):**
- "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam"

**Trigger logic explanation (collapsible tooltip):**
- BUY: "Khi giá chạm [stop_price], Paave tự động đặt lệnh mua theo thị trường (MP)."
- SELL: "Khi giá giảm xuống [stop_price], Paave tự động đặt lệnh bán theo thị trường (MP)."

**Form fields:**

| Field | Label (VI) | Type | Constraints |
|-------|-----------|------|-------------|
| `stop_price` | "Giá dừng (VND)" | Numeric | BUY: `stop_price > last_price`; SELL: `stop_price < last_price`; must be within exchange price band; must conform to tick size |
| `quantity` | "Khối lượng (cổ phiếu)" | Integer | Must be ≥ 100; multiple of 100 for VN; ≤ 1,000,000 |

**Estimated cost/proceeds:**
Since STOP triggers an MP child order, exact price is unknown at placement. Summary shows: "Giá ước tính: ~[last_price] ₫ (giá thực tế khi kích hoạt có thể khác)"

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-09-01 | STOP selected | User views form | Two fields shown: Stop Price, Quantity; educational note visible; no Limit Price field |
| AC-OP-09-02 | STOP, SELL, last_price = 50,000 ₫ | User enters stop_price = 53,000 ₫ | Inline error: "Giá dừng lệnh bán phải thấp hơn giá hiện tại (50.000 ₫) để bảo vệ khỏi thua lỗ." |
| AC-OP-09-03 | STOP, BUY, last_price = 50,000 ₫, stop_price = 52,000 ₫ | User views summary | Summary shows: stop_price = 52.000 ₫; Giá ước tính: ~50.000 ₫ (giá thực tế khi kích hoạt có thể khác); educational note |

---

### FR-OP-10 — Order Summary Card

**Priority:** P0

**Actor:** Authenticated user

**Description:**
The Order Summary Card is displayed at the bottom of the FORM state, above the "Xem lại lệnh" button. It updates in real-time as the user types into any field. It shows the economic breakdown of the order. If any required field is empty or invalid, the card shows dashes ("—") for calculated values.

**Summary card rows by order type and side:**

**BUY orders (LO, MP estimated, ATO/ATC estimated):**

| Row Label | Formula | Display Format |
|-----------|---------|----------------|
| Giá trị giao dịch | `quantity × price` (or `quantity × last_price` for MP/ATO/ATC) | "X.XXX.XXX ₫" or "~X.XXX.XXX ₫ (ước tính)" |
| Phí giao dịch (0,25%) | `gross_value × 0.0025` | "X.XXX ₫" |
| Tổng chi | `gross_value + fee` | "X.XXX.XXX ₫" (bold) |
| Tiền khả dụng | `available_cash` | "X.XXX.XXX ₫" |
| Thiếu / Đủ indicator | `available_cash − total_cost` | Green "Đủ vốn" if ≥ 0; Red "Thiếu [X.XXX.XXX] ₫" if < 0 |

**SELL orders:**

| Row Label | Formula | Display Format |
|-----------|---------|----------------|
| Giá trị giao dịch | `quantity × price` (or `quantity × last_price` for MP/ATC) | "X.XXX.XXX ₫" |
| Phí giao dịch (0,25%) | `gross_value × 0.0025` | "X.XXX ₫" |
| Thuế bán (0,1%) | `gross_value × 0.001` | "X.XXX ₫" |
| Tổng thu | `gross_value − fee − tax` | "X.XXX.XXX ₫" (bold) |
| Cổ phiếu khả dụng | `available_quantity` | "XXX cổ phiếu" |
| Thiếu / Đủ indicator | `available_quantity − quantity` | Green "Đủ cổ phiếu" if ≥ 0; Red "Thiếu [X] cổ phiếu" if < 0 |

**STOP/STOP_LIMIT orders:**
Show stop_price, limit price (STOP_LIMIT only), quantity, and a note: "Chi phí / Thu nhập xác nhận sau khi lệnh được kích hoạt".

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-10-01 | LO, BUY, price = 80,000 ₫, quantity = 200 | User fills both fields | Giá trị = 16.000.000 ₫; Phí = 40.000 ₫; Tổng chi = 16.040.000 ₫ |
| AC-OP-10-02 | LO, SELL, price = 80,000 ₫, quantity = 200 | User fills both fields | Giá trị = 16.000.000 ₫; Phí = 40.000 ₫; Thuế bán = 16.000 ₫; Tổng thu = 15.944.000 ₫ |
| AC-OP-10-03 | BUY, total cost > available_cash | User fills fields | Red indicator: "Thiếu [shortfall] ₫"; "Xem lại lệnh" button disabled |
| AC-OP-10-04 | SELL, quantity > available_holdings | User fills quantity | Red indicator: "Thiếu [X] cổ phiếu"; "Xem lại lệnh" button disabled |
| AC-OP-10-05 | Any order type, quantity field empty | User has not entered quantity yet | All calculated rows show "—" |

---

### FR-OP-11 — "Xem lại lệnh" Button and VALIDATING Transition

**Priority:** P0

**Actor:** Authenticated user

**Description:**
The "Xem lại lệnh" (Review Order) CTA at the bottom of the form initiates the transition from FORM to CONFIRMING state. The button is disabled whenever: any required field is empty, any inline validation error is active, or the summary card shows a "Thiếu" (insufficient) indicator.

When the user taps the enabled button:
1. State transitions to VALIDATING (synchronous, < 50ms)
2. All client-side validations run in sequence (field validations, cross-field validations, balance check, holdings check)
3. If all pass: state transitions to CONFIRMING
4. If any fail: state returns to FORM with inline error messages rendered

**Button states:**

| Condition | Button State | Button Label |
|-----------|-------------|--------------|
| Any required field empty or invalid | Disabled (greyed out) | "Xem lại lệnh" |
| All fields valid; balance/holdings sufficient | Enabled (green for BUY, red for SELL) | "Xem lại lệnh" |
| VALIDATING state | Loading (spinner) | — |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-11-01 | LO, price empty, quantity = 100 | User views button | Button is disabled |
| AC-OP-11-02 | LO, price = 80,000 ₫, quantity = 100, balance sufficient | User views button | Button is enabled (green for BUY) |
| AC-OP-11-03 | All fields valid, balance insufficient | User views button | Button is disabled; red "Thiếu X ₫" shown in summary |
| AC-OP-11-04 | All fields valid, balance sufficient | User taps "Xem lại lệnh" | State transitions to CONFIRMING; confirmation screen appears |

---

### FR-OP-12 — Confirmation Modal

**Priority:** P0

**Actor:** Authenticated user

**Description:**
The Confirmation Modal replaces the form content in the sheet. It displays a complete, read-only summary of the order. No fields are editable here. Two CTAs are present.

**Confirmation modal content by order type:**

**All order types — always displayed:**
- "Tiền ảo" badge (top of modal)
- Ticker symbol + exchange chip
- Side badge (MUA / BÁN with color)
- Order type name (Vietnamese: "Lệnh Giới Hạn", "Lệnh Thị Trường", etc.)

**LO specific:**
- Giá lệnh: [price] ₫
- Khối lượng: [quantity] cổ phiếu
- Giá trị: [gross] ₫
- Phí (0,25%): [fee] ₫
- Thuế bán (0,1%): [tax] ₫ (SELL only)
- Tổng: [total] ₫ (bold)

**MP specific:**
- Giá ước tính: ~[last_price] ₫ (giá thực tế có thể khác)
- Khối lượng: [quantity] cổ phiếu
- Phí và tổng chi hiển thị dựa trên giá ước tính

**ATO/ATC specific:**
- Khối lượng: [quantity] cổ phiếu
- Giá khớp: Theo giá [mở cửa/đóng cửa] (do sàn xác định)
- Note: "Phí sẽ được tính sau khi lệnh khớp"

**STOP_LIMIT specific:**
- Giá dừng: [stop_price] ₫
- Giá giới hạn: [price] ₫
- Khối lượng: [quantity] cổ phiếu
- Educational note: "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam"

**STOP specific:**
- Giá dừng: [stop_price] ₫
- Khối lượng: [quantity] cổ phiếu
- Giá khi kích hoạt: "Theo giá thị trường tại thời điểm kích hoạt"
- Educational note: "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam"

**CTAs:**
- Primary: "Xác nhận đặt lệnh" — green for BUY, red for SELL; tapping transitions to PROCESSING
- Secondary: "Sửa lệnh" — text button; tapping returns to FORM state with all values preserved

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-12-01 | LO BUY confirmed | User views confirmation | Shows all fields; "Tiền ảo" badge visible; "Xác nhận đặt lệnh" (green) and "Sửa lệnh" buttons present |
| AC-OP-12-02 | STOP_LIMIT SELL confirmed | User views confirmation | Educational note "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam" visible |
| AC-OP-12-03 | User taps "Sửa lệnh" | From confirmation | Returns to FORM state; all previously entered values are preserved; no data loss |
| AC-OP-12-04 | MP BUY confirmation | User views confirmation | Shows "Giá ước tính: ~[last_price] ₫ (giá thực tế có thể khác)"; not a fixed price |

---

### FR-OP-13 — Order Submission and PROCESSING State

**Priority:** P0

**Actor:** Authenticated user; Paave Paper Trading Engine

**Description:**
When the user taps "Xác nhận đặt lệnh", the app transitions to PROCESSING state and submits the order to the Paper Trading Engine API.

**Submission payload:**

| Field | Type | Source |
|-------|------|--------|
| `symbol_code` | string | Pre-filled from Stock Detail |
| `exchange` | enum | Pre-filled from Stock Detail |
| `side` | enum | User selection (`BUY` or `SELL`) |
| `order_type` | enum | User selection (`LO`, `MP`, `ATO`, `ATC`, `STOP_LIMIT`, `STOP`) |
| `price` | decimal or null | User input for LO and STOP_LIMIT; null for MP, ATO, ATC, STOP |
| `stop_price` | decimal or null | User input for STOP_LIMIT and STOP; null for all other types |
| `quantity` | integer | User input |
| `idempotency_key` | UUID v4 | Client-generated at the moment user taps "Xác nhận đặt lệnh"; not reused between submissions |

**PROCESSING state UI:**
- "Xác nhận đặt lệnh" button replaced by a loading spinner
- All inputs are disabled; all CTAs except sheet close are disabled
- Sheet close (swipe down or X button) is disabled during PROCESSING to prevent orphaned orders
- Loading text: "Đang đặt lệnh..."

**Timeout handling:**
- If no response received within 10,000ms: transition to ERROR state with message "Kết nối bị gián đoạn. Vui lòng kiểm tra lại trong Danh mục > Lệnh chờ trước khi thử lại."

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-13-01 | User taps "Xác nhận đặt lệnh" | API call begins | Button shows spinner; all inputs disabled; sheet close disabled; "Đang đặt lệnh..." shown |
| AC-OP-13-02 | PROCESSING state; user attempts to swipe sheet down | User tries to dismiss | Sheet does not close; no action taken |
| AC-OP-13-03 | API responds in 200ms with HTTP 201 | Normal success | Transitions to SUCCESS state |
| AC-OP-13-04 | 10,001ms pass with no API response | Network timeout | Transitions to ERROR state; message: "Kết nối bị gián đoạn. Vui lòng kiểm tra lại trong Danh mục > Lệnh chờ trước khi thử lại." |

---

### FR-OP-14 — SUCCESS State

**Priority:** P0

**Actor:** Authenticated user

**Description:**
When the API returns HTTP 201, the sheet transitions to SUCCESS state.

**SUCCESS state content:**
- Success illustration/icon (animated: scale from 0.8 to 1.0 over 300ms)
- "Đặt lệnh thành công!" heading
- Order summary line: "[MUA/BÁN] [quantity] cổ phiếu [TICKER] · [order_type_name]"
- For LO: "Giá: [price] ₫"
- For MP: "Theo giá thị trường"
- For ATO: "Theo giá mở cửa"
- For ATC: "Theo giá đóng cửa"
- For STOP_LIMIT: "Kích hoạt tại: [stop_price] ₫ · Giới hạn: [price] ₫"
- For STOP: "Kích hoạt tại: [stop_price] ₫ · Theo giá thị trường"
- Order ID: "Mã lệnh: [order_id]" (small, secondary text)
- "Tiền ảo" badge

**CTAs:**
- "Xem danh mục" — navigates to Portfolio screen (Open Orders section); closes sheet
- "Đặt lệnh mới" — resets all form fields and returns to FORM state for the same ticker; idempotency_key is regenerated
- Auto-dismiss: if user takes no action for 3 seconds, sheet slides down (CLOSED state)

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-14-01 | HTTP 201 received for LO BUY | Transition to SUCCESS | Shows "Đặt lệnh thành công!"; "MUA 100 cổ phiếu VIC · Lệnh Giới Hạn"; "Giá: 80.000 ₫"; success icon animates |
| AC-OP-14-02 | HTTP 201 received for STOP_LIMIT | SUCCESS state | Shows "Kích hoạt tại: [stop_price] ₫ · Giới hạn: [price] ₫" |
| AC-OP-14-03 | User takes no action for 3 seconds | Timer expires | Sheet dismisses; navigates to nothing (returns to Stock Detail screen) |
| AC-OP-14-04 | User taps "Đặt lệnh mới" | From SUCCESS | Form resets; FORM state shown for same ticker; new idempotency_key generated |

---

### FR-OP-15 — ERROR State

**Priority:** P0

**Actor:** Authenticated user

**Description:**
When the API returns HTTP 4xx or 5xx, or when the client times out (>10,000ms), the sheet transitions to ERROR state. The exact error message string from the Paper Trading Engine (per FRD-10 Error Code Reference §4) is displayed.

**ERROR state content:**
- Error icon (red)
- Error heading: "Không thể đặt lệnh"
- Error message: exact string from API response `message` field (see §9 Validation Logic Table for all messages)
- For network timeout: "Kết nối bị gián đoạn. Vui lòng kiểm tra lại trong Danh mục > Lệnh chờ trước khi thử lại."

**CTAs:**
- "Thử lại" — returns to FORM state; all user-entered values are preserved; a new idempotency_key is generated
- "Huỷ" — closes the sheet entirely (CLOSED state)

**Form value preservation on "Thử lại":**
All field values entered before the failed submission are restored to their exact previous values. The user must not re-enter data after a transient failure.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-15-01 | API returns HTTP 400 with error_code E-PT-108 | Transition to ERROR | Shows "Không thể đặt lệnh"; message: "Không đủ tiền ảo. Khả dụng: [X] ₫. Chi phí ước tính: [Y] ₫." |
| AC-OP-15-02 | API returns HTTP 400 with error_code E-PT-116 | Transition to ERROR | Shows message: "Bạn đã đạt giới hạn 10 lệnh chờ. Huỷ lệnh hiện có để đặt lệnh mới." |
| AC-OP-15-03 | User taps "Thử lại" from ERROR | Transition to FORM | All previously entered values present; user can edit and resubmit without re-entering from scratch |
| AC-OP-15-04 | User taps "Huỷ" from ERROR | Sheet closes | CLOSED state; user returns to Stock Detail screen |

---

### FR-OP-16 — Session Change Mid-Form

**Priority:** P1

**Actor:** Authenticated user; Market Calendar Service

**Description:**
The market session can change while the user has the Order Placement Sheet open. The sheet must detect session changes and update the available order types accordingly, without discarding the user's current form state where possible.

**Session change handling:**

| Scenario | Action |
|----------|--------|
| Session transitions to ATC Period (14:30) while user is filling an LO form | Currently selected LO tab becomes disabled; ATC tab becomes enabled; user is shown a toast: "Phiên giao dịch đã chuyển sang ATC (14:30–14:45). Chỉ nhận lệnh ATC." User's LO fields are preserved but form cannot be submitted as LO; user must switch to ATC manually |
| Session transitions to CLOSED (14:45) while user is filling any form | All order type tabs disabled; banner shown: "Thị trường đã đóng cửa lúc 14:45. Hãy thử lại vào ngày giao dịch tiếp theo."; "Xem lại lệnh" button disabled |
| Session transitions from PRE_OPEN to CONT (09:15) while user is filling ATO form | ATO tab remains enabled (ATO is valid during the ATO matching window itself); no disruption |
| Market holiday detected during form fill | All tabs disabled; banner: "Hôm nay là ngày nghỉ thị trường. Thị trường sẽ mở cửa vào ngày giao dịch tiếp theo." |

**Session polling:** The sheet polls the Market Calendar Service every 30 seconds to detect session transitions.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-16-01 | User has LO form partially filled; time is 14:29 | Clock reaches 14:30 (ATC starts) | Toast appears: "Phiên giao dịch đã chuyển sang ATC (14:30–14:45). Chỉ nhận lệnh ATC."; LO tab greyed; ATC tab highlighted |
| AC-OP-16-02 | User has MP form partially filled; time is 14:44 | Clock reaches 14:45 (market close) | All tabs disabled; "Thị trường đã đóng cửa lúc 14:45" banner shown; submit button disabled |

---

## 5. Business Rules

| Rule ID | Rule | Source | Violation Behaviour |
|---------|------|--------|---------------------|
| BR-OP-01 | The "Tiền ảo" badge (component `<VirtualFundsLabel />`) must be visible in the Order Placement Sheet header at all times in all states (FORM, CONFIRMING, PROCESSING, SUCCESS, ERROR). It has no `hidden`, `dismissible`, or conditional rendering prop. | BRD BR-18; FRD-10 FR-PT-06 | Regression: badge absent in any state is a P0 UI bug |
| BR-OP-02 | Fee rate for all paper trade orders is 0.25% of gross trade value, applied to both BUY and SELL orders. The fee is shown on the order summary card and on the confirmation modal before the user taps "Xác nhận đặt lệnh". | Paave paper trading fee model (V2 rate update) | Fee not shown before confirmation = P1 bug; wrong rate displayed = P0 bug |
| BR-OP-03 | Sell tax rate is 0.1% of gross trade value, applied only to SELL orders. The sell tax line is shown on the order summary card for SELL orders only. It is not shown for BUY orders. | Paave sell tax simulation (mirrors VN real-market tax for educational purposes) | Tax line shown on BUY = P1 bug; tax not shown on SELL = P1 bug |
| BR-OP-04 | All VN exchange (HOSE, HNX, UPCOM) order quantities must be multiples of 100. The quantity input must not accept submission of a non-multiple-of-100 value. Client-side validation runs on blur; server-side validation also enforces this (E-PT-107). | BRD BR-PT-07; FRD-10 BR-PT-01 | Client must catch this before API call; error message per §9 |
| BR-OP-05 | Quantity maximum is 1,000,000 shares per order. Values above this are rejected at the client layer with message: "Khối lượng tối đa cho mỗi lệnh là 1.000.000 cổ phiếu." | Order engine constraint | Client enforces; API also rejects |
| BR-OP-06 | A BUY order's total estimated cost (gross + fee) must not exceed the user's available cash at the time the user taps "Xem lại lệnh". The client computes this check from the cached balance value. The server re-checks at submission. | FRD-10 FR-PT-03 precondition | "Thiếu [X] ₫" indicator in summary card; "Xem lại lệnh" button disabled |
| BR-OP-07 | A SELL order's quantity must not exceed the user's available (unlocked) holdings for that ticker at the time the user taps "Xem lại lệnh". Client checks from cached holdings. Server re-checks at submission. | FRD-10 FR-PT-03 precondition | "Thiếu [X] cổ phiếu" indicator in summary card; "Xem lại lệnh" button disabled |
| BR-OP-08 | STOP_LIMIT and STOP orders are a Paave simulation. The mandatory educational note "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam" must appear: (a) in the FORM state whenever STOP or STOP_LIMIT tab is selected, (b) in the CONFIRMING state, and (c) in the SUCCESS state. | Product requirement: F0 education accuracy | Note absent in any of the three states = P1 bug |
| BR-OP-09 | The MP warning "Lệnh thị trường có thể khớp ở giá không mong đợi" must appear in the FORM state whenever MP is selected and in the CONFIRMING state for MP orders. It must not appear for LO, ATO, ATC, STOP, or STOP_LIMIT. | FRD-10 §FR-PT-02; market order slippage education | Wrong placement (shown for non-MP types) = P2 bug; absent for MP = P1 bug |
| BR-OP-10 | The `idempotency_key` (UUID v4) must be generated fresh at the moment the user taps "Xác nhận đặt lệnh". It must not be reused across different submission attempts. When the user taps "Đặt lệnh mới" from SUCCESS or "Thử lại" from ERROR, a new key must be generated before the next submission. | FRD-10 BR-PT-15 | Reused key = potential silent deduplication of intended new orders = P0 bug |
| BR-OP-11 | The Order Placement Sheet must not be dismissible during PROCESSING state. The sheet close gesture (swipe down on mobile) and any close button must be disabled from the moment the user taps "Xác nhận đặt lệnh" until the API responds (HTTP 201, 4xx, 5xx, or 10s timeout). | Prevents orphaned orders | Sheet dismissible during PROCESSING = P0 bug |
| BR-OP-12 | No short selling. A SELL order for a ticker the user does not hold must be rejected client-side: "Bạn không sở hữu cổ phiếu [TICKER]. Giao dịch bán khống không có trong paper trading." Available holdings = 0 causes the summary card to show "Thiếu [quantity] cổ phiếu" and disables "Xem lại lệnh". | FRD-10 FC-PT-09; BRD no-short-sell rule | Zero-holding SELL reaching confirmation modal = P0 bug |
| BR-OP-13 | For BUY STOP_LIMIT and BUY STOP orders: `stop_price` must be strictly greater than `last_price` at the time of validation. For SELL STOP_LIMIT and SELL STOP orders: `stop_price` must be strictly less than `last_price`. This is a client-side check using the live price displayed in the header. | STOP/STOP_LIMIT trigger logic semantics | Wrong direction stop accepted = P0 data integrity bug |
| BR-OP-14 | ATO orders must not include a `price` field. If the user somehow has a price value cached from switching from LO to ATO, the client must null out the `price` field in the submission payload when order_type is ATO. Same rule applies to ATC orders. | FRD-10 BR-PT-19, BR-PT-20 | ATO/ATC submitted with price = P0 API error |
| BR-OP-15 | The Order Placement Sheet session indicator ("Phiên liên tục · Còn 2 giờ 15 phút") must update in real time. It must not show stale session information for more than 30 seconds. | Session change awareness; prevents user confusion | Stale session display (> 30s off) = P2 bug |
| BR-OP-16 | Available cash and available holdings displayed in the sheet must be fetched fresh when the sheet opens (not cached from the previous session or previous sheet open). They may be cached for up to 30 seconds once the sheet is open. If the sheet has been open for more than 30 seconds, values are refreshed from the server before the "Xem lại lệnh" transition. | Stale balance/holdings = incorrect "Thiếu" indicator | Balance not refreshed = P1 bug if it causes a false "sufficient" display |

---

## 6. Acceptance Criteria

This section provides complete Given/When/Then acceptance criteria for all 6 order types × BUY + SELL = 12 base scenarios, plus key cross-cutting scenarios.

### AC-SET-01: LO BUY (Limit Order Buy)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-LO-BUY-01 | User has 20,000,000 ₫ available; VIC last_price = 85,000 ₫; HOSE CONT session | User opens sheet, selects LO, BUY, enters price = 83,000 ₫, quantity = 200 | Summary: Gross = 16.600.000 ₫; Phí = 41.500 ₫; Tổng chi = 16.641.500 ₫; "Đủ vốn" shown in green |
| AC-OP-LO-BUY-02 | Same setup | User taps "Xem lại lệnh" | Confirmation modal shows: "MUA 200 cổ phiếu VIC · Lệnh Giới Hạn"; Giá = 83.000 ₫; Tổng chi = 16.641.500 ₫ |
| AC-OP-LO-BUY-03 | Confirmation modal shown | User taps "Xác nhận đặt lệnh"; API returns 201 | SUCCESS state: "Đặt lệnh thành công! MUA 200 cổ phiếu VIC · Lệnh Giới Hạn · Giá: 83.000 ₫" |
| AC-OP-LO-BUY-04 | BUY LO, price = 86,000 ₫ (above last_price = 85,000 ₫) | User fills price field and taps out | Inline error: "Giá mua lệnh giới hạn phải ≤ giá hiện tại (85.000 ₫). Dùng lệnh MP hoặc nhập giá ≤ 85.000 ₫." |

### AC-SET-02: LO SELL (Limit Order Sell)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-LO-SELL-01 | User holds 500 VIC; VIC last_price = 85,000 ₫; HOSE CONT | User selects LO, SELL, enters price = 87,000 ₫, quantity = 200 | Summary: Gross = 17.400.000 ₫; Phí = 43.500 ₫; Thuế bán = 17.400 ₫; Tổng thu = 17.339.100 ₫; "Đủ cổ phiếu" |
| AC-OP-LO-SELL-02 | Same setup | User taps "Xem lại lệnh" → Confirmation | Shows "BÁN 200 cổ phiếu VIC · Lệnh Giới Hạn"; Giá = 87.000 ₫; Tổng thu = 17.339.100 ₫ |
| AC-OP-LO-SELL-03 | SELL LO, price = 83,000 ₫ (below last_price = 85,000 ₫) | User fills price and taps out | Inline error: "Giá bán lệnh giới hạn phải ≥ giá hiện tại (85.000 ₫). Dùng lệnh MP hoặc nhập giá ≥ 85.000 ₫." |
| AC-OP-LO-SELL-04 | User holds 300 VIC; 100 soft-locked in open SELL order | User enters quantity = 250 on SELL side | Summary shows "Thiếu 50 cổ phiếu" (250 requested, 200 available); "Xem lại lệnh" disabled |

### AC-SET-03: MP BUY (Market Order Buy)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-MP-BUY-01 | HOSE CONT session; user has 10,000,000 ₫ available | User selects MP, BUY, enters quantity = 100 | Warning banner "Lệnh thị trường có thể khớp ở giá không mong đợi" shown; no price field; summary shows estimated values with "~" prefix |
| AC-OP-MP-BUY-02 | MP BUY quantity = 100 valid | User taps "Xem lại lệnh" | Confirmation shows: "MUA 100 cổ phiếu [TICKER] · Lệnh Thị Trường"; "Giá ước tính: ~[last_price] ₫ (giá thực tế có thể khác)"; warning banner visible in confirmation |
| AC-OP-MP-BUY-03 | HOSE PRE_OPEN session | User opens sheet | MP tab is disabled; user cannot select MP; ATO is the default |

### AC-SET-04: MP SELL (Market Order Sell)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-MP-SELL-01 | HOSE CONT; user holds 200 shares; last_price = 50,000 ₫ | User selects MP, SELL, quantity = 100 | Warning shown; Summary: Gross ~5.000.000 ₫ (estimated); Phí = ~12.500 ₫; Thuế bán = ~5.000 ₫; Tổng thu ~4.982.500 ₫ |
| AC-OP-MP-SELL-02 | MP SELL, quantity = 100 valid | User taps confirm → API 201 | SUCCESS: "BÁN 100 cổ phiếu [TICKER] · Lệnh Thị Trường" |

### AC-SET-05: ATO BUY (At-The-Open Buy)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-ATO-BUY-01 | HOSE PRE_OPEN (09:05 ICT); user has sufficient balance | User selects ATO, BUY, quantity = 100 | No price field; informational note "Lệnh ATO khớp theo giá mở cửa được tính toán vào 09:15. Giá khớp do sàn xác định." visible |
| AC-OP-ATO-BUY-02 | ATO BUY, quantity = 100 | User taps "Xem lại lệnh" | Confirmation: "MUA 100 cổ phiếu [TICKER] · Lệnh ATO"; Giá khớp: "Theo giá mở cửa"; "Phí sẽ được tính sau khi lệnh khớp" |
| AC-OP-ATO-BUY-03 | ATO BUY; user taps confirm; API 201 | SUCCESS | "Đặt lệnh thành công! MUA 100 cổ phiếu [TICKER] · Lệnh ATO · Theo giá mở cửa" |
| AC-OP-ATO-BUY-04 | ATO BUY submitted; no matching price at 09:15 opening auction | Server sends ATO_ATC_NO_MATCH event | Push notification: "Lệnh ATO của bạn cho [qty] [TICKER] không thể khớp — không có giá mở cửa tại phiên khớp lệnh. Tiền của bạn đã được hoàn lại." |

### AC-SET-06: ATO SELL (At-The-Open Sell)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-ATO-SELL-01 | HOSE PRE_OPEN; user holds 300 shares | User selects ATO, SELL, quantity = 100 | Form shows available holdings = 300; no price field; informational note visible |
| AC-OP-ATO-SELL-02 | ATO SELL, quantity = 100 | User confirms → API 201 | SUCCESS: "BÁN 100 cổ phiếu [TICKER] · Lệnh ATO" |

### AC-SET-07: ATC BUY (At-The-Close Buy)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-ATC-BUY-01 | HOSE ATC Period (14:35 ICT); user has sufficient balance | User selects ATC, BUY, quantity = 200 | No price field; informational note "Lệnh ATC khớp theo giá đóng cửa được tính toán vào 14:45. Giá khớp do sàn xác định." |
| AC-OP-ATC-BUY-02 | ATC BUY, quantity = 200 | User taps "Xem lại lệnh" | Confirmation: "MUA 200 cổ phiếu [TICKER] · Lệnh ATC"; Giá khớp: "Theo giá đóng cửa" |

### AC-SET-08: ATC SELL (At-The-Close Sell)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-ATC-SELL-01 | HOSE ATC Period; user holds 400 shares | User selects ATC, SELL, quantity = 400 | All 400 available shares usable (no pre-launch ATO conflict); form shows holdings = 400 |
| AC-OP-ATC-SELL-02 | ATC SELL quantity = 400 | User confirms → API 201 | SUCCESS: "BÁN 400 cổ phiếu [TICKER] · Lệnh ATC" |

### AC-SET-09: STOP_LIMIT BUY

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-STOPLIM-BUY-01 | HOSE CONT; last_price = 50,000 ₫; user has 10,000,000 ₫ | User selects STOP_LIMIT, BUY; enters stop_price = 52,000 ₫, price = 51,500 ₫, quantity = 100 | Educational note visible; summary shows stop_price and limit price |
| AC-OP-STOPLIM-BUY-02 | Same setup | User taps "Xem lại lệnh" | Confirmation shows: "MUA 100 cổ phiếu [TICKER] · Lệnh Dừng-Giới Hạn"; Giá dừng: 52.000 ₫; Giá giới hạn: 51.500 ₫; educational note present |
| AC-OP-STOPLIM-BUY-03 | BUY STOP_LIMIT, stop_price = 48,000 ₫ (below last_price = 50,000 ₫) | User fills stop_price and tabs out | Inline error: "Giá dừng lệnh mua phải cao hơn giá hiện tại (50.000 ₫) để kích hoạt đột phá giá." |
| AC-OP-STOPLIM-BUY-04 | STOP_LIMIT BUY submitted; API 201 | SUCCESS | "Đặt lệnh thành công! MUA 100 cổ phiếu [TICKER] · Lệnh Dừng-Giới Hạn · Kích hoạt tại: 52.000 ₫ · Giới hạn: 51.500 ₫" |

### AC-SET-10: STOP_LIMIT SELL

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-STOPLIM-SELL-01 | HOSE CONT; last_price = 50,000 ₫; user holds 300 shares | User selects STOP_LIMIT, SELL; enters stop_price = 47,000 ₫, price = 46,500 ₫, quantity = 100 | Educational note visible; summary shows stop_price and limit price |
| AC-OP-STOPLIM-SELL-02 | SELL STOP_LIMIT, stop_price = 53,000 ₫ (above last_price = 50,000 ₫) | User fills stop_price and tabs out | Inline error: "Giá dừng lệnh bán phải thấp hơn giá hiện tại (50.000 ₫) để bảo vệ khỏi thua lỗ." |
| AC-OP-STOPLIM-SELL-03 | Valid STOP_LIMIT SELL submitted; API 201 | SUCCESS | SUCCESS state with educational note visible |

### AC-SET-11: STOP BUY (Stop Market Buy)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-STOP-BUY-01 | HOSE CONT; last_price = 50,000 ₫; user has 10,000,000 ₫ | User selects STOP, BUY; enters stop_price = 53,000 ₫, quantity = 100 | Two fields only (no Limit Price); educational note "Paave mô phỏng lệnh dừng — không có trên thị trường thực Việt Nam" |
| AC-OP-STOP-BUY-02 | Valid STOP BUY | User taps "Xem lại lệnh" | Confirmation: "MUA 100 [TICKER] · Lệnh Dừng"; Giá dừng: 53.000 ₫; Giá khi kích hoạt: "Theo giá thị trường tại thời điểm kích hoạt" |
| AC-OP-STOP-BUY-03 | STOP BUY submitted; API 201 | SUCCESS | "Đặt lệnh thành công! MUA 100 cổ phiếu [TICKER] · Lệnh Dừng · Kích hoạt tại: 53.000 ₫ · Theo giá thị trường" |

### AC-SET-12: STOP SELL (Stop Market Sell)

| # | Given | When | Then |
|---|-------|------|------|
| AC-OP-STOP-SELL-01 | HOSE CONT; last_price = 50,000 ₫; user holds 200 shares | User selects STOP, SELL; enters stop_price = 47,000 ₫, quantity = 100 | Two fields; educational note visible; available holdings = 200 shown |
| AC-OP-STOP-SELL-02 | STOP SELL, stop_price = 53,000 ₫ (above last_price) | User fills stop_price | Inline error: "Giá dừng lệnh bán phải thấp hơn giá hiện tại (50.000 ₫) để bảo vệ khỏi thua lỗ." |
| AC-OP-STOP-SELL-03 | Valid STOP SELL; API 201 | SUCCESS | SUCCESS state; "BÁN 100 cổ phiếu [TICKER] · Lệnh Dừng · Kích hoạt tại: 47.000 ₫" |

---

## 7. Edge Cases

| Case ID | Scenario | Expected Behaviour |
|---------|----------|-------------------|
| EC-OP-01 | Market closes (14:45 ICT) while user has the FORM state open | All order type tabs disabled; persistent banner: "Thị trường đã đóng cửa lúc 14:45. Hãy thử lại vào ngày giao dịch tiếp theo."; "Xem lại lệnh" button disabled; user can still close the sheet |
| EC-OP-02 | Session transitions to ATC Period (14:30) while user is mid-fill of an LO form | Toast notification: "Phiên giao dịch đã chuyển sang ATC (14:30–14:45). Chỉ nhận lệnh ATC."; LO tab greyed; ATC tab highlighted; user's existing field values preserved but form is in error state until user either switches to ATC or waits for market close |
| EC-OP-03 | Daily price band changes (reference_price recalculates) while form is open | Ceiling/floor indicators in the price field helper update to new values; if user's currently entered price is now outside the new band, inline error appears: "Giá vượt mức trần mới ([new_ceiling] ₫) cho [TICKER] trên [EXCHANGE]." |
| EC-OP-04 | Available cash decreases (another of the user's BUY limit orders gets reserved or filled) while form is open | On next 30-second refresh: available cash shown updates; if updated balance makes entered quantity now insufficient, summary card switches from "Đủ vốn" to "Thiếu [X] ₫"; "Xem lại lệnh" becomes disabled |
| EC-OP-05 | User taps "Xác nhận đặt lệnh"; API returns HTTP 422 with error_code E-PT-116 (10 open orders limit) | ERROR state with message: "Bạn đã đạt giới hạn 10 lệnh chờ. Huỷ lệnh hiện có để đặt lệnh mới."; "Thử lại" returns to FORM; user must first cancel an existing order |
| EC-OP-06 | User taps "Xác nhận đặt lệnh"; API returns HTTP 422; between the CONFIRMING state and the PROCESSING state, balance changed (another order filled), making the order invalid | ERROR state with exact server message; "Thử lại" returns to FORM; available cash display refreshed to current value |
| EC-OP-07 | User double-taps "Xác nhận đặt lệnh" in rapid succession | The button is immediately disabled upon first tap (PROCESSING state entered); second tap has no effect; `idempotency_key` on both attempts is the same UUID generated at the first tap; server deduplicates; only one order created |
| EC-OP-08 | User's ATO or ATC order is accepted (HTTP 201) but the auction produces no matching price | Order transitions server-side to CANCELLED (ATO_ATC_NO_MATCH); push notification sent: "Lệnh ATO của bạn cho [qty] [TICKER] không thể khớp — không có giá mở cửa tại phiên khớp lệnh. Tiền của bạn đã được hoàn lại." (for ATO) or "...không có giá đóng cửa..." (for ATC); the SUCCESS state was correctly shown at submission time; the cancellation is communicated async via push |
| EC-OP-09 | User opens STOP_LIMIT form; last_price is live-updating via 15-second feed; stop_price the user entered was valid (above last_price for BUY) but then last_price jumps above stop_price | When the live price tick updates the header price and the now-invalid stop_price condition is detected: inline error appears on stop_price field: "Giá dừng lệnh mua phải cao hơn giá hiện tại ([new_last_price] ₫) để kích hoạt đột phá giá."; "Xem lại lệnh" becomes disabled |
| EC-OP-10 | Ticker is suspended (halted) by the exchange while the user has the sheet open | Banner appears: "Giao dịch [TICKER] đang tạm dừng theo quyết định của sàn."; all order type tabs disabled; "Xem lại lệnh" disabled; user can close sheet |
| EC-OP-11 | User opened sheet for a ticker on HOSE (CONT session); user switches device and reopens app; sheet is not preserved | Sheet does not persist across app restarts; user must re-open from Stock Detail; no crash or stale data |
| EC-OP-12 | User places a SELL STOP order with stop_price = 47,000 ₫; before the stop triggers, the user also has an open SELL limit order for the same ticker (soft-lock) | Both orders count toward the 10-order limit (BR-OP-05 via BR-PT-14); soft-lock from the existing SELL limit reduces available_quantity shown in the STOP SELL form |

---

## 8. Design Requirements

[PENDING: Order Placement Screen Design Screenshot]

The following functional design requirements are specified from intent. All visual dimensions, exact color values, typography, and spacing are to be confirmed against the Paave Design System (Figma) once the screenshot is available.

### 8.1 Sheet Container

- Renders as a bottom sheet on mobile (iOS and Android)
- Sheet height: sufficient to show the full form without internal scroll for all order types; STOP_LIMIT (3 fields) is the tallest form; the sheet must accommodate it without requiring the user to scroll the sheet container itself
- Sheet has a drag handle at the top
- Sheet background: surface color from design system (matches card background in current theme)
- Sheet is dismissible via swipe-down in all states except PROCESSING

### 8.2 Header Section

- Stock ticker: bold, H2 typography, primary text color
- Exchange chip: small pill badge; color-coded by exchange (HOSE = blue, HNX = green, UPCOM = orange, reference exchanges = grey)
- Last price: H1 typography, primary text color; updates every 15 seconds; a brief flash animation (200ms) plays on each price update to signal freshness
- "Tiền ảo" badge: amber background, amber text, rendered as `<VirtualFundsLabel />` component; always visible in the top-right area of the header; occupies a fixed position and does not move when price updates

### 8.3 Side Toggle (BUY / SELL)

- Full-width toggle (two equal halves)
- BUY side: green background when active (`#22C55E` or design system success-600); white text; "MUA" label
- SELL side: red background when active (`#EF4444` or design system danger-500); white text; "BÁN" label
- Inactive side: grey background; grey text
- Touch target minimum: 44pt height per side

### 8.4 Order Type Selector

- Horizontal scrollable tab row (not a wrap-to-multiple-rows layout)
- Active tab: underline indicator matching the side color (green for BUY, red for SELL)
- Disabled tab: 40% opacity; cursor: not-allowed equivalent
- Tab labels: short Vietnamese names ("LO", "MP", "ATO", "ATC", "Dừng", "Dừng-GL")
- Session indicator line below tab row: secondary text color, 12sp font

### 8.5 Form Fields

- Numeric inputs use the native numeric keyboard on mobile (no keyboard type switching required by the user)
- Each field has a label above and an optional helper text / error text below
- Error text color: red (`#EF4444` or design system danger-500)
- Helper text color: secondary text color
- Ceiling/floor helper for price fields: two values on one line ("Trần: X ₫ · Sàn: Y ₫")
- Quick-select quantity chips: small, tappable pills below the quantity input

### 8.6 Warning / Informational Banners

- MP warning ("Lệnh thị trường có thể khớp ở giá không mong đợi"): amber background, amber-900 text; full width; appears between order type selector and form fields
- STOP/STOP_LIMIT educational note: indigo or purple-tinted background (to visually distinguish from the MP warning); full width; appears between order type selector and form fields
- ATO/ATC informational note: blue (info) background; full width

### 8.7 Order Summary Card

- Positioned at bottom of form content, above the CTA button
- Card background: slightly elevated surface (shadow or border)
- Each row: label on left (secondary text); value on right (primary text)
- Total row: bold; slightly larger font
- "Đủ vốn" indicator: green text, checkmark icon
- "Thiếu" indicator: red text, warning icon

### 8.8 CTA Buttons

- "Xem lại lệnh" (primary CTA in FORM state): full width; rounded-lg; BUY state = green background, SELL state = red background; white text; H3 label
- Disabled state: 50% opacity; no interaction response
- "Xác nhận đặt lệnh" (primary CTA in CONFIRMING state): same styling as above
- "Sửa lệnh" (secondary CTA in CONFIRMING state): text-only button; primary text color; placed below the primary CTA
- Loading state during PROCESSING: primary CTA shows spinner replacing label; spinner white

### 8.9 SUCCESS State

- Centered layout within the sheet
- Success icon: circular green background with checkmark; animated entrance (scale 0.8 → 1.0 over 300ms)
- "Đặt lệnh thành công!" heading: H1, green text
- Order summary: secondary text, two lines maximum
- CTAs: two buttons stacked; "Xem danh mục" primary; "Đặt lệnh mới" secondary

### 8.10 ERROR State

- Centered layout within the sheet
- Error icon: circular red background with X; no animation
- "Không thể đặt lệnh" heading: H1, red text
- Error message: body text, primary text color, left-aligned
- CTAs: "Thử lại" primary; "Huỷ" secondary (text-only)

---

## 9. Validation Logic Table

This table is the authoritative reference for every validation rule applied to order placement form fields. Every error message is an exact string, not a description.

### 9.1 Quantity Field Validation

| Rule | Condition | Exact Error Message (VI) | Error Code |
|------|-----------|--------------------------|------------|
| Minimum quantity | `quantity < 100` | "Khối lượng tối thiểu là 100 cổ phiếu." | E-OP-Q-01 |
| Board lot (VN exchanges) | `quantity % 100 ≠ 0` AND exchange IN (HOSE, HNX, UPCOM) | "Khối lượng phải là bội số của 100. Gợi ý: [floor(qty/100)×100] hoặc [ceil(qty/100)×100] cổ phiếu." | E-PT-107 |
| Maximum quantity | `quantity > 1,000,000` | "Khối lượng tối đa cho mỗi lệnh là 1.000.000 cổ phiếu." | E-OP-Q-02 |
| Non-integer input | `quantity` contains decimals | "Khối lượng phải là số nguyên." | E-OP-Q-03 |
| Zero or negative | `quantity ≤ 0` | "Khối lượng phải lớn hơn 0." | E-OP-Q-04 |
| SELL quantity exceeds available holdings | `quantity > available_holdings` (client check) | "Thiếu [quantity − available_holdings] cổ phiếu. Bạn đang nắm giữ [available_holdings] cổ phiếu [TICKER] khả dụng." | E-PT-109 (server) |

### 9.2 Limit Price (LO) Field Validation

| Rule | Condition | Exact Error Message (VI) | Error Code |
|------|-----------|--------------------------|------------|
| BUY limit above current price | `price > last_price` (BUY side) | "Giá mua lệnh giới hạn phải ≤ giá hiện tại ([last_price] ₫). Dùng lệnh MP hoặc nhập giá ≤ [last_price] ₫." | E-PT-201 |
| SELL limit below current price | `price < last_price` (SELL side) | "Giá bán lệnh giới hạn phải ≥ giá hiện tại ([last_price] ₫). Dùng lệnh MP hoặc nhập giá ≥ [last_price] ₫." | E-PT-202 |
| Price above ceiling | `price > ceiling_price` | "Giá vượt mức trần hôm nay ([ceiling_price] ₫) cho [TICKER] trên [EXCHANGE]." | E-PT-203 |
| Price below floor | `price < floor_price` | "Giá thấp hơn mức sàn hôm nay ([floor_price] ₫) cho [TICKER] trên [EXCHANGE]." | E-PT-204 |
| Tick size violation | `price % tick_size ≠ 0` (VN only) | "Giá phải là bội số của [tick_size] ₫. Bạn có muốn nhập [round_down] ₫ hoặc [round_up] ₫ không?" | E-PT-205 |
| Zero or negative | `price ≤ 0` | "Giá phải lớn hơn 0." | E-OP-P-01 |

### 9.3 Stop Price (STOP / STOP_LIMIT) Field Validation

| Rule | Condition | Exact Error Message (VI) | Error Code |
|------|-----------|--------------------------|------------|
| BUY stop below current price | `stop_price ≤ last_price` (BUY side) | "Giá dừng lệnh mua phải cao hơn giá hiện tại ([last_price] ₫) để kích hoạt đột phá giá." | E-OP-SP-01 |
| SELL stop above current price | `stop_price ≥ last_price` (SELL side) | "Giá dừng lệnh bán phải thấp hơn giá hiện tại ([last_price] ₫) để bảo vệ khỏi thua lỗ." | E-OP-SP-02 |
| Stop price above ceiling | `stop_price > ceiling_price` | "Giá dừng vượt mức trần hôm nay ([ceiling_price] ₫) cho [TICKER] trên [EXCHANGE]." | E-OP-SP-03 |
| Stop price below floor | `stop_price < floor_price` | "Giá dừng thấp hơn mức sàn hôm nay ([floor_price] ₫) cho [TICKER] trên [EXCHANGE]." | E-OP-SP-04 |
| Tick size violation | `stop_price % tick_size ≠ 0` (VN only) | "Giá dừng phải là bội số của [tick_size] ₫. Bạn có muốn nhập [round_down] ₫ hoặc [round_up] ₫ không?" | E-OP-SP-05 |
| Zero or negative | `stop_price ≤ 0` | "Giá dừng phải lớn hơn 0." | E-OP-SP-06 |

### 9.4 Balance and Holdings Check (Client-Side Pre-Submit)

| Rule | Condition | Exact Error Message (VI) | Error Code |
|------|-----------|--------------------------|------------|
| BUY total cost exceeds available cash | `(quantity × price × 1.0025) > available_cash` (client estimate) | "Không đủ tiền ảo. Cần thêm [shortfall] ₫. Khả dụng: [available_cash] ₫." | E-PT-108 (server) |
| No holdings for SELL | `available_holdings = 0` | "Bạn không sở hữu cổ phiếu [TICKER]. Giao dịch bán khống không có trong paper trading." | E-PT-110 |

### 9.5 Server-Returned Error Messages (Displayed in ERROR State)

These are the exact strings the client must display verbatim from the API `message` field when the server returns a 4xx response:

| Error Code | Exact Message (VI) to Display |
|------------|-------------------------------|
| E-PT-101 | "Thị trường VN đang đóng cửa. Giờ giao dịch: 09:00–14:45 ICT (Thứ 2–6, trừ ngày nghỉ lễ VN)." |
| E-PT-103 | "Lệnh MP không được chấp nhận trong phiên tiền mở cửa (09:00–09:15 ICT). Dùng lệnh ATO để tham gia khớp giá mở cửa." |
| E-PT-104 | "Cổ phiếu này đang bị đình chỉ giao dịch theo quyết định của sàn." |
| E-PT-105 | "Cổ phiếu này đã hủy niêm yết trên [EXCHANGE] và không thể giao dịch." |
| E-PT-107 | "Khối lượng phải là bội số của 100 cổ phiếu trên [EXCHANGE]. Gợi ý: [floor_qty] hoặc [ceil_qty] cổ phiếu." |
| E-PT-108 | "Không đủ tiền ảo. Khả dụng: [available] ₫. Chi phí ước tính: [cost] ₫." |
| E-PT-109 | "Không đủ cổ phiếu. Bạn đang nắm giữ [available_qty] cổ phiếu [TICKER]; yêu cầu bán [requested_qty] cổ phiếu." |
| E-PT-110 | "Bạn không sở hữu cổ phiếu [TICKER]. Giao dịch bán khống không có trong paper trading." |
| E-PT-115 | "Không nhận lệnh mới trong phiên ATC (14:30–14:45 ICT). Đặt lệnh ATC thay thế." |
| E-PT-116 | "Bạn đã đạt giới hạn 10 lệnh chờ. Huỷ lệnh hiện có để đặt lệnh mới." |
| E-PT-117 | "Lệnh ATO không nhận giá — hệ thống tự xác định giá mở cửa." |
| E-PT-118 | "Lệnh ATC không nhận giá — hệ thống tự xác định giá đóng cửa." |
| E-PT-119 | "Lệnh ATO chỉ được đặt trong phiên tiền mở cửa (09:00–09:15 ICT)." |
| E-PT-120 | "Lệnh ATC chỉ được đặt trong phiên ATC (14:30–14:45 ICT)." |
| E-PT-121 | "Lệnh thị trường không có trên UPCOM. Dùng lệnh LO." |
| E-PT-201 | "Giá mua ([price] ₫) cao hơn giá hiện tại ([current] ₫). Dùng lệnh MP hoặc nhập giá ≤ [current] ₫." |
| E-PT-202 | "Giá bán ([price] ₫) thấp hơn giá hiện tại ([current] ₫). Dùng lệnh MP hoặc nhập giá ≥ [current] ₫." |
| E-PT-203 | "Giá vượt mức trần hôm nay ([ceiling] ₫) cho [TICKER] trên [EXCHANGE]." |
| E-PT-204 | "Giá thấp hơn mức sàn hôm nay ([floor] ₫) cho [TICKER] trên [EXCHANGE]." |
| E-PT-205 | "Giá phải là bội số của [tick_size] ₫. Bạn có muốn nhập [round_down] ₫ hoặc [round_up] ₫ không?" |
| E-PT-206 | "Không đủ số dư để đặt cọc. Khả dụng: [available] ₫. Cần: [required] ₫. Đã đặt cọc: [reserved] ₫ cho các lệnh khác." |
| E-PT-207 | "Bạn đã có lệnh bán mở cho [TICKER]. Huỷ lệnh đó trước khi đặt lệnh bán khác trên cùng cổ phiếu." |
| E-PT-208 | "Các lệnh mua đang chờ đã đặt cọc [reserved] ₫. Lệnh này cần thêm [required] ₫, vượt quá số dư khả dụng." |
| Network timeout (client) | "Kết nối bị gián đoạn. Vui lòng kiểm tra lại trong Danh mục > Lệnh chờ trước khi thử lại." | — |

---

## 10. Traceability Matrix

| Business Objective | Functional Requirement | Validation Logic | Test Case |
|---------------------|------------------------|-----------------|-----------|
| BO-04 (Paper Trading as Core Loop) | FR-OP-01 (Sheet Entry) | BR-OP-01 (Tiền ảo badge) | AC-OP-01-01 |
| BO-04 (Paper Trading as Core Loop) | FR-OP-02 (Side Toggle) | BR-OP-02 (Fee 0.25%), BR-OP-03 (Sell tax) | AC-OP-02-01, AC-OP-10-01, AC-OP-10-02 |
| BO-04 (Paper Trading as Core Loop) | FR-OP-03 (Order Type Selector) | Session availability matrix §1.1; BR-OP-15 (session refresh) | AC-OP-03-01, AC-OP-03-02, AC-OP-03-03, AC-OP-03-04, AC-OP-03-05 |
| BO-04 (Paper Trading as Core Loop) | FR-OP-04 (LO Form) | §9.2 Limit price validation; E-PT-201, E-PT-202, E-PT-203, E-PT-204, E-PT-205; BR-OP-04, BR-OP-06, BR-OP-07 | AC-SET-01 (4 ACs), AC-SET-02 (4 ACs) |
| BO-04 (Paper Trading as Core Loop) | FR-OP-05 (MP Form) | §9.1 Quantity validation; E-PT-103, E-PT-121; BR-OP-09 (MP warning) | AC-SET-03, AC-SET-04 |
| BO-04 (Paper Trading as Core Loop) | FR-OP-06 (ATO Form) | §9.1 Quantity; BR-PT-19 (no price for ATO); E-PT-119 | AC-SET-05, AC-SET-06 |
| BO-04 (Paper Trading as Core Loop) | FR-OP-07 (ATC Form) | §9.1 Quantity; BR-PT-20 (no price for ATC); E-PT-120 | AC-SET-07, AC-SET-08 |
| BO-04 (Paper Trading as Core Loop) | FR-OP-08 (STOP_LIMIT Form) | §9.3 Stop price validation; E-OP-SP-01, E-OP-SP-02; BR-OP-08 (educational note); BR-OP-13 (stop direction) | AC-SET-09, AC-SET-10 |
| BO-04 (Paper Trading as Core Loop) | FR-OP-09 (STOP Form) | §9.3 Stop price validation; BR-OP-08 (educational note); BR-OP-13 (stop direction) | AC-SET-11, AC-SET-12 |
| BO-08 (≥70% of users place trade within 3 sessions) | FR-OP-10 (Summary Card) | BR-OP-02, BR-OP-03; §9.4 balance checks | AC-OP-10-01 through AC-OP-10-05 |
| BO-08 (≥70% of users place trade within 3 sessions) | FR-OP-11 (Review CTA) | BR-OP-06, BR-OP-07 | AC-OP-11-01 through AC-OP-11-04 |
| BO-08 (≥70% of users place trade within 3 sessions) | FR-OP-12 (Confirmation Modal) | BR-OP-01, BR-OP-08, BR-OP-09, BR-OP-14 | AC-OP-12-01 through AC-OP-12-04 |
| BO-08 (≥70% of users place trade within 3 sessions) | FR-OP-13 (Submission + PROCESSING) | BR-OP-10 (idempotency_key), BR-OP-11 (no dismiss during PROCESSING) | AC-OP-13-01 through AC-OP-13-04 |
| BO-08 (≥70% of users place trade within 3 sessions) | FR-OP-14 (SUCCESS State) | BR-OP-10 (new key on "Đặt lệnh mới") | AC-OP-14-01 through AC-OP-14-04 |
| BO-08 (≥70% of users place trade within 3 sessions) | FR-OP-15 (ERROR State) | §9.5 Server error messages | AC-OP-15-01 through AC-OP-15-04 |
| BO-12 (Serve 16–17 segment compliantly) | FR-OP-02, FR-OP-04 through FR-OP-09 | BR-OP-12 (no short selling); E-PT-110 | AC-OP-02-04; AC-SET-02, AC-OP-LO-SELL-04 |
| BRD §BO-04 (Paper Trading Label) | FR-OP-01, FR-OP-12, FR-OP-14 | BR-OP-01 (Tiền ảo badge non-dismissible at all times) | AC-OP-01-01, AC-OP-12-01, AC-OP-14-01 |
| Risk: Market session edge cases | FR-OP-16 (Session Change Mid-Form) | BR-OP-15 (30-second session poll) | AC-OP-16-01, AC-OP-16-02, EC-OP-01, EC-OP-02 |
| Risk: Price movement mid-form | FR-OP-04, FR-OP-08, FR-OP-09 | §9.2 price validation with live last_price; §9.3 stop price direction live check | EC-OP-03, EC-OP-09 |
| Risk: Concurrent order limit | FR-OP-15 | E-PT-116; BR-PT-14 (max 10 orders) | AC-OP-15-02, EC-OP-05 |
| Risk: Double submission | FR-OP-13 | BR-OP-10 (idempotency_key); BR-OP-11 (disabled during PROCESSING) | AC-OP-13-01, EC-OP-07 |

---

## 11. Related Documents

| Document | Relationship |
|----------|-------------|
| FRD-10: Paper Trading Engine (v2.4) | Authority on all order engine rules, fill mechanics, error codes E-PT-xxx, state machine, and business rules BR-PT-xx; this FRD-20 specifies only the screen over those rules |
| SRD-order-engine-v2.3.md | System-level order processing flow; API endpoint `POST /api/v1/paper-trading/orders`; validation sequence; Redis idempotency store |
| SRD-20-order-placement-v2.md | To be authored: system-level specification of the order placement screen's API calls (live price feed subscription, market session polling, balance/holdings fetch) |
| BRD.md §BO-04, §BO-08, §5.1.5 | Business objectives driving this feature; paper trading scope definition; board lot, fee, and session rules |
| FRD-04: Stock Detail | Entry point for this screen ("Đặt lệnh" button on the Stock Detail action row, FR-23) |
| FRD-19: Order Management | Order cancellation flow; open orders list where STOP/STOP_LIMIT pending orders appear |
| FRD-18: Order History & Orderbook | Trade history records created as an outcome of successful fills triggered by orders placed here |
| business-rules.md §BR-17, §BR-18 | Starting balance and Tiền ảo label rules that apply to all paper trading screens including this one |

---

*End of FRD-20: Order Placement V2*
*Version 1.0 — 2026-05-29*
*Authoritative for Order Placement Screen UI and UX. Engine rules remain in FRD-10.*

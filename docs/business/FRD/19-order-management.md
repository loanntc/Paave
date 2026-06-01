# FRD-19: Order Management — Edit Order & Cancel Order
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Version:** 1.0
**Date:** 2026-05-29
**Author:** Business Analysis Team
**Linked BRD:** BRD.md §BO-08 (paper trading as primary loop)
**Linked FRD:** FRD-10 (Paper Trading Engine), FRD-18 (Order History), FRD-20 (Order Detail)
**Linked SRD:** SRD-order-engine-v2.3.md
**Status:** Ready for Development

> **Purpose of this document:** This document is the complete, standalone specification for the Edit Order and Cancel Order flows in the Paave Paper Trading Engine. A developer reading this document must be able to implement every rule, validation, state machine interaction, and edge case without referencing any other file for these two flows. A QA engineer must be able to write complete test cases from this document alone.

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Entry Points](#2-entry-points)
3. [User Flows](#3-user-flows)
4. [UX Flow and Screen States](#4-ux-flow-and-screen-states)
5. [Functional Requirements](#5-functional-requirements)
6. [Business Rules](#6-business-rules)
7. [Acceptance Criteria](#7-acceptance-criteria)
8. [Edge Cases](#8-edge-cases)
9. [Design Requirements](#9-design-requirements)
10. [Error Code Reference](#10-error-code-reference)
11. [Related Documents](#11-related-documents)

---

## 1. Feature Overview

### 1.1 Edit Order

| Field | Value |
|-------|-------|
| Feature | Edit Order (Price Modification) |
| Scope | Paper trading only — no real securities orders are ever modified |
| Primary Actor | Registered user (LEARN_MODE or FULL_ACCESS) |
| Goal | Allow users to change the limit price of an unfilled PENDING LO (Limit Order) without cancelling and resubmitting manually |
| Trigger | User taps "Sửa lệnh" button in Order History or Order Detail for a qualifying order |
| Order types eligible | LO (Limit Order) in PENDING status only |
| Fields modifiable | `price` (limit price) only |
| Fields NOT modifiable | `side`, `quantity`, `order_type`, `symbol`, `exchange` |
| Implementation mechanic | Edit = cancel old order + create new order with updated price (new `order_id`, same `symbol`/`side`/`remaining_quantity`) |
| Paave vs. real VN market | Real VN market does not allow modification — only cancel + resubmit. Paave paper trading allows this as an educational simplification. |

### 1.2 Cancel Order

| Field | Value |
|-------|-------|
| Feature | Cancel Order |
| Scope | Paper trading only |
| Primary Actor | Registered user (LEARN_MODE or FULL_ACCESS) |
| Goal | Allow users to cancel an open order before it fills, releasing reserved cash or soft-locked holdings |
| Trigger | User taps "Huỷ lệnh" button in Order History, Order Detail, or active order chip on Stock Detail |
| Orders that CAN be cancelled | PENDING, ACCEPTED (before fill) |
| Orders that CANNOT be cancelled | FILLED, CANCELLED (already terminal), REJECTED, EXPIRED |
| PARTIAL orders | A PARTIAL order (partially filled) cancels the remaining unfilled quantity only; the filled portion is immutable |
| STOP / STOP_LIMIT orders | Can be cancelled anytime before the trigger fires; if a parent STOP order is cancelled, any child LO order created from its trigger must also be cancelled in the same transaction |
| Side effects on cancel | BUY order cancelled → reserved cash released; SELL order cancelled → soft-locked holdings released |
| Cancel reason field | Optional — UI shows text field "Lý do huỷ (không bắt buộc)" |

---

## 2. Entry Points

| Entry Point | Screen | Action | Applicable to Edit | Applicable to Cancel |
|-------------|--------|--------|-------------------|---------------------|
| EP-01 | Order History screen (FRD-18) | Tap order row → expand detail → "Sửa lệnh" button | Yes (PENDING LO only) | Yes (PENDING, ACCEPTED, PARTIAL) |
| EP-02 | Order Detail screen (FRD-20) | "Sửa lệnh" / "Huỷ lệnh" buttons in expanded view | Yes (PENDING LO only) | Yes (PENDING, ACCEPTED, PARTIAL) |
| EP-03 | Order Placement confirmation screen | "Huỷ" button (cancel before submit completes — client-side only; no server call yet) | No | Yes (client-side; no order exists yet) |
| EP-04 | Active order chip on Stock Detail screen | Tap chip → Order Detail bottom sheet → "Huỷ lệnh" button | No | Yes (PENDING, ACCEPTED, PARTIAL) |
| EP-05 | Portfolio Dashboard — Open Orders section | Swipe-left on order row → "Huỷ" quick action | No | Yes (PENDING, ACCEPTED, PARTIAL) |

**Button visibility rules:**
- "Sửa lệnh" button is rendered only when `order.order_type = 'LO'` AND `order.status = 'PENDING'`.
- "Huỷ lệnh" button is rendered when `order.status IN ('PENDING', 'ACCEPTED', 'PARTIAL')`.
- Both buttons are absent for terminal statuses: FILLED, CANCELLED, REJECTED, EXPIRED, FILL_FAILED.
- For PARTIAL orders: "Sửa lệnh" is hidden; only "Huỷ lệnh" is shown (to cancel remaining quantity).

---

## 3. User Flows

### 3.1 Edit Order — Happy Path

```
Step 1: User is on Order History screen (FRD-18)
        → Taps a row where order_type = 'LO' AND status = 'PENDING'

Step 2: Order detail expands
        → "Sửa lệnh" button is visible
        → Taps "Sửa lệnh"

Step 3: Edit Price bottom sheet opens
        → Displays: ticker, exchange, side, quantity (read-only)
        → Displays: current limit price (read-only label "Giá hiện tại: X VND")
        → Displays: new price input field (VND formatted, numeric keyboard)
        → Displays: daily price band (ceiling VND / floor VND) as subtitle under the input
        → "Xác nhận sửa" button (disabled until new_price ≠ current_price AND validation passes)
        → "Huỷ" text button (dismiss sheet; no changes made)

Step 4: User enters new_price
        → Client performs inline validation:
          - new_price must conform to tick size for the stock's price level (VN exchanges only)
          - new_price must be ≤ ceiling_price (from today's price band)
          - new_price must be ≥ floor_price
          - For BUY LO: new_price must be ≤ current_market_price
          - For SELL LO: new_price must be ≥ current_market_price
          - new_price ≠ old limit_price (must be a change)
        → If any validation fails: inline error shown below the input field; "Xác nhận sửa" remains disabled

Step 5: User taps "Xác nhận sửa"
        → Confirmation dialog appears (see §9 Design Requirements)
        → Shows: summary of change (old price → new price, estimated new reserve amount for BUY)
        → Two buttons: "Xác nhận" (primary) / "Không" (dismiss)

Step 6: User taps "Xác nhận"
        → Loading spinner shown; buttons disabled
        → PATCH /api/v1/paper-trading/orders/{order_id}/price called (see §5 FR-OM-04 for API contract)
        → Server performs atomic operation:
            a. Verify order still in PENDING status (guard against race condition)
            b. Validate new_price against server-side rules (price band, tick size, balance)
            c. BEGIN DB TRANSACTION
               - UPDATE old order: status = 'CANCELLED', cancel_reason = 'PRICE_MODIFIED', cancelled_at = NOW()
               - INSERT new order: same symbol/exchange/side/remaining_quantity, new limit_price, new order_id, status = 'PENDING'
               - Release old BUY reserve (if BUY): DELETE FROM order_reserves WHERE order_id = old_id
               - Apply new BUY reserve (if BUY): INSERT INTO order_reserves (new_id, new_reserve_amount)
               - Release old SELL soft-lock (if SELL): DELETE FROM holdings_soft_lock WHERE order_id = old_id
               - Apply new SELL soft-lock (if SELL): INSERT INTO holdings_soft_lock (new_id, quantity)
               COMMIT
        → HTTP 201 returned with new order object

Step 7: Success state
        → Bottom sheet closes
        → Success toast: "Giá lệnh đã được cập nhật" (3 seconds; auto-dismiss)
        → Order list refreshes; old order no longer in open orders; new order appears with updated price
        → New order_id visible in order detail
```

### 3.2 Edit Order — Error Paths

| Error Scenario | When It Occurs | User-Facing Behaviour |
|----------------|---------------|----------------------|
| Order already filled (race condition) | Server receives PATCH after order has been FILLED between user opening the sheet and tapping confirm | Error toast: "Lệnh đã khớp, không thể sửa" (3 seconds); bottom sheet closes; order list refreshes |
| Order is PARTIAL (race condition) | Order received a partial fill between sheet open and confirm | Error toast: "Lệnh đã khớp một phần, không thể sửa. Vui lòng huỷ lệnh trước." (3 seconds); bottom sheet closes |
| New price violates price band | Server-side validation fails (price band moved since client-side check) | Inline error on price field: exact error message per E-OM-03 / E-OM-04 |
| New price violates tick size | Tick size check fails server-side | Inline error: "Giá phải là bội số của [tick_size] VND. Gợi ý: [round_down] VND hoặc [round_up] VND?" |
| Insufficient balance for new reserve (BUY) | New limit_price is higher than old (unusual BUY case); new reserve > available_balance | Inline error: "Số dư không đủ để đặt cọc. Khả dụng: [avail] VND. Cần đặt cọc: [required] VND." |
| Max 10 open orders reached | Edit creates a new order; total PENDING = 10 after the creation | Error toast: "Đã đạt giới hạn 10 lệnh đang mở. Huỷ một lệnh khác trước khi sửa lệnh này." |
| Network error | API call times out or returns 5xx | Error toast: "Không thể kết nối. Vui lòng thử lại." (3 seconds); sheet remains open |

### 3.3 Cancel Order — Happy Path

```
Step 1: User is on Order History / Order Detail / Stock Detail chip
        → Taps "Huỷ lệnh" button on a qualifying order

Step 2: Cancel confirmation bottom sheet opens
        → Displays: order summary (ticker, exchange, side, quantity, order type, limit price if LO)
        → Confirmation text: "Bạn có chắc muốn huỷ lệnh này?"
        → For BUY orders: shows "Số tiền đặt cọc [X VND] sẽ được hoàn trả vào số dư khả dụng."
        → For SELL LO orders: shows "[X] cổ phiếu [TICKER] đang bị khoá sẽ được giải phóng."
        → For PARTIAL orders: shows "Chỉ phần chưa khớp ([remaining_quantity] cổ phiếu) sẽ được huỷ."
        → Text field: "Lý do huỷ (không bắt buộc)" — max 200 characters; keyboard dismissed on scroll
        → "Huỷ lệnh" button (destructive — red background) 
        → "Không" button (secondary — dismisses sheet; no action)

Step 3: User taps "Huỷ lệnh"
        → Loading spinner shown; buttons disabled
        → DELETE /api/v1/paper-trading/orders/{order_id} called with optional body { cancel_reason: "..." }
        → Server performs atomic operation:
            BEGIN DB TRANSACTION
            a. Verify order status is PENDING or ACCEPTED (guard against terminal states)
            b. UPDATE virtual_orders SET status = 'CANCELLED', cancel_reason = 'USER_CANCEL', cancelled_at = NOW(), user_cancel_note = {reason_if_provided}
            c. For BUY orders: DELETE FROM order_reserves WHERE order_id = order_id; UPDATE virtual_balances to restore reserved_amount
            d. For SELL LO orders: DELETE FROM holdings_soft_lock WHERE order_id = order_id
            e. For PARTIAL orders: the filled portion (filled_quantity) records are immutable; only the remaining (quantity - filled_quantity) reservation is released
            f. For STOP order with child LO: cancel child LO in the same transaction (steps b–d applied to child)
            COMMIT

Step 4: Success state
        → Bottom sheet closes
        → Success toast: "Lệnh đã được huỷ thành công" (3 seconds; auto-dismiss)
        → For BUY: additional context in toast: "([X VND] đã được hoàn trả)"
        → Order list refreshes; cancelled order moves to history with CANCELLED status badge
        → If a STOP parent was cancelled: child LO also shows CANCELLED in history
```

### 3.4 Cancel Order — Error Paths

| Error Scenario | When It Occurs | User-Facing Behaviour |
|----------------|---------------|----------------------|
| Order already filled (race condition) | Order FILLED between user tapping "Huỷ lệnh" and server processing | Error toast: "Lệnh đã khớp, không thể huỷ" (3 seconds); bottom sheet closes; order list refreshes showing FILLED status |
| Order already cancelled | Duplicate cancel request (e.g., user tapped twice) | Transparent — server returns the already-CANCELLED order; toast: "Lệnh đã được huỷ trước đó." |
| Order in REJECTED / EXPIRED / FILL_FAILED status | Race condition where order reached terminal state | Error toast: "Lệnh không thể huỷ — trạng thái hiện tại: [status_label_vi]" (3 seconds); sheet closes |
| Authorisation failure | User attempts to cancel another user's order (sub_account_id mismatch) | HTTP 403; error toast: "Bạn không có quyền huỷ lệnh này." |
| Network error | API call times out or returns 5xx | Error toast: "Không thể kết nối. Vui lòng thử lại." (3 seconds); sheet remains open; "Huỷ lệnh" button re-enabled |

---

## 4. UX Flow and Screen States

### 4.1 Edit Order — Screen State Machine

```
[idle — order detail visible]
         │
         │ user taps "Sửa lệnh"
         ▼
[EDIT_SHEET_OPEN]
  - Price input field shown; current price pre-filled as hint
  - "Xác nhận sửa" button disabled
         │
         │ user types new_price
         ▼
[EDIT_SHEET_VALIDATING] (inline, < 100ms)
  - If invalid: [EDIT_SHEET_INPUT_ERROR]
      - Inline error message shown below input
      - "Xác nhận sửa" remains disabled
      - User must correct input to proceed
  - If valid: [EDIT_SHEET_READY]
      - Inline error cleared
      - "Xác nhận sửa" button enabled
         │
         │ user taps "Xác nhận sửa"
         ▼
[CONFIRM_DIALOG_OPEN]
  - Change summary displayed (old_price → new_price)
  - "Xác nhận" / "Không" buttons
         │
         ├─── user taps "Không" ──────────────────► [EDIT_SHEET_READY] (dialog dismissed; sheet stays open)
         │
         │ user taps "Xác nhận"
         ▼
[PROCESSING]
  - Spinner; buttons disabled
  - Sheet not dismissible while processing
         │
         ├─── API returns 201 ─────────────────────► [SUCCESS]
         │    - Sheet closes
         │    - Toast: "Giá lệnh đã được cập nhật" (3s)
         │    - Order list refreshes
         │
         └─── API returns 4xx/5xx ─────────────────► [ERROR]
              - Toast shown (specific message per error code)
              - If E-OM-01 (already filled): sheet closes; list refreshes
              - If E-OM-02 (already partial): sheet closes; list refreshes
              - If E-OM-03/04/05/06 (validation): sheet stays open; inline error on input
              - If network error: sheet stays open; buttons re-enabled
```

### 4.2 Cancel Order — Screen State Machine

```
[idle — order detail / order list visible]
         │
         │ user taps "Huỷ lệnh"
         ▼
[CANCEL_SHEET_OPEN]
  - Order summary shown
  - Cash/holdings release info shown
  - Cancel reason text field (optional, empty)
  - "Huỷ lệnh" (red) / "Không" buttons
         │
         ├─── user taps "Không" ──────────────────► [idle] (sheet dismissed; no action)
         │
         │ user taps "Huỷ lệnh"
         ▼
[PROCESSING]
  - Spinner; buttons disabled
  - Sheet not dismissible while processing
         │
         ├─── API returns 200 ─────────────────────► [SUCCESS]
         │    - Sheet closes
         │    - Toast: "Lệnh đã được huỷ thành công" (3s; with refund note for BUY)
         │    - Order list refreshes; cancelled order in history
         │
         └─── API returns 4xx/5xx ─────────────────► [ERROR]
              - E-OM-07 (already filled): toast shown; sheet closes; list refreshes
              - E-OM-08 (already cancelled): toast shown; sheet closes
              - E-OM-09 (wrong terminal status): toast shown; sheet closes; list refreshes
              - 403 (auth): toast shown; sheet closes
              - Network error: toast shown; sheet stays open; buttons re-enabled
```

### 4.3 Toast Specifications

| State | Toast text (Vietnamese) | Duration | Dismissible | Color |
|-------|------------------------|----------|-------------|-------|
| Edit success | "Giá lệnh đã được cập nhật" | 3 seconds | Yes (tap) | Green |
| Cancel success (generic) | "Lệnh đã được huỷ thành công" | 3 seconds | Yes (tap) | Green |
| Cancel success (BUY — with refund) | "Lệnh đã được huỷ thành công ([X VND] đã được hoàn trả)" | 3 seconds | Yes (tap) | Green |
| Already filled — edit | "Lệnh đã khớp, không thể sửa" | 3 seconds | Yes (tap) | Red |
| Already filled — cancel | "Lệnh đã khớp, không thể huỷ" | 3 seconds | Yes (tap) | Red |
| Already partial — edit | "Lệnh đã khớp một phần, không thể sửa. Vui lòng huỷ lệnh trước." | 4 seconds | Yes (tap) | Red |
| Already cancelled (duplicate) | "Lệnh đã được huỷ trước đó." | 3 seconds | Yes (tap) | Neutral |
| Max orders reached (edit) | "Đã đạt giới hạn 10 lệnh đang mở." | 3 seconds | Yes (tap) | Red |
| Network error | "Không thể kết nối. Vui lòng thử lại." | 3 seconds | Yes (tap) | Red |

---

## 5. Functional Requirements

### FR-OM-01 — Edit Order: Button Visibility and Pre-Conditions

**Priority:** P0

**Description:**
The "Sửa lệnh" button is rendered only when all of the following conditions are true, evaluated in this order. If any condition is false, the button is absent (not disabled, not greyed out — completely hidden).

| Condition | Value |
|-----------|-------|
| `order.order_type` | Must equal `'LO'` |
| `order.status` | Must equal `'PENDING'` |
| `order.sub_account_id` | Must belong to the authenticated user |

**Input:** Order data from the order list or order detail API response.

**Output:** "Sửa lệnh" button rendered or absent.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OM-01-01 | Order is LO type with PENDING status owned by the user | User views order detail | "Sửa lệnh" button is visible |
| AC-OM-01-02 | Order is MARKET type with PENDING status | User views order detail | "Sửa lệnh" button is absent |
| AC-OM-01-03 | Order is LO type with PARTIAL status | User views order detail | "Sửa lệnh" button is absent; "Huỷ lệnh" button is visible |
| AC-OM-01-04 | Order is LO type with FILLED status | User views order detail | Both "Sửa lệnh" and "Huỷ lệnh" buttons are absent |
| AC-OM-01-05 | Order is LO type with PENDING status owned by a different user | Attacker sends GET request for the order | HTTP 403; buttons not rendered |
| AC-OM-01-06 | Order is STOP_LIMIT type with PENDING status | User views order detail | "Sửa lệnh" button is absent (STOP_LIMIT is not LO) |

---

### FR-OM-02 — Edit Order: Price Input Validation

**Priority:** P0

**Description:**
The edit price input field performs real-time inline validation on each keystroke. Validation rules depend on the order's side, the stock's exchange, and today's price band. All validation is performed both client-side (UX) and server-side (authoritative). The "Xác nhận sửa" button is enabled only when all inline validations pass.

**Input Fields (edit sheet):**

| Field | Type | Constraints |
|-------|------|-------------|
| `new_price` | integer (VND, no decimals) | See validation rules below |
| `order_id` | UUID | Pre-populated from selected order |
| `idempotency_key` | UUID v4 | Client-generated per edit attempt; new key per tap of "Xác nhận sửa" |

**Validation Rules (applied in this sequence):**

| # | Rule | Error Message (inline) | Error Code |
|---|------|------------------------|------------|
| V1 | `new_price` must be a positive integer greater than 0 | "Vui lòng nhập giá hợp lệ" | E-OM-00 |
| V2 | `new_price` must differ from current `limit_price` (no-op guard) | "Giá mới phải khác giá hiện tại" | E-OM-00 |
| V3 | For VN exchanges: `new_price % tick_size == 0` where tick_size is determined by the new_price level (≥50,000→100; 10,000–49,999→50; <10,000→10) | "Giá phải là bội số của [tick_size] VND. Gợi ý: [round_down] VND hoặc [round_up] VND?" | E-OM-05 |
| V4 | `new_price ≤ ceiling_price` where `ceiling_price = reference_price × ceiling_multiplier` for the stock's exchange (HOSE: ×1.07, HNX: ×1.10, UPCOM: ×1.15, newly-listed first 3 sessions: ×1.20) | "Giá vượt trần ngày hôm nay ([ceiling_price] VND) của [TICKER] trên [EXCHANGE]." | E-OM-03 |
| V5 | `new_price ≥ floor_price` where `floor_price = reference_price × floor_multiplier` (HOSE: ×0.93, HNX: ×0.90, UPCOM: ×0.85, newly-listed: ×0.80) | "Giá thấp hơn sàn ngày hôm nay ([floor_price] VND) của [TICKER] trên [EXCHANGE]." | E-OM-04 |
| V6 | If `side = BUY`: `new_price ≤ current_market_price` (BUY limit must not exceed current market to prevent immediate fill) | "Giá mua giới hạn ([new_price] VND) cao hơn giá thị trường hiện tại ([current_price] VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá thấp hơn [current_price] VND." | E-OM-06 |
| V7 | If `side = SELL`: `new_price ≥ current_market_price` (SELL limit must not be below current market) | "Giá bán giới hạn ([new_price] VND) thấp hơn giá thị trường hiện tại ([current_price] VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá cao hơn [current_price] VND." | E-OM-07 |
| V8 | If `side = BUY`: `available_balance ≥ quantity × new_price × 1.001` after releasing the old reserve (net balance check) | "Số dư không đủ để đặt cọc. Khả dụng: [avail] VND. Cần đặt cọc: [required] VND." | E-OM-08 |

**Note on V8:** The net balance check for BUY edit is: `(total_cash − current_total_reserves + old_reserve_amount) ≥ quantity × new_price × 1.001`. The old reserve is treated as available during the edit (it will be released as part of the atomic operation).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OM-02-01 | VIC on HOSE; reference_price = 50,000; ceiling = 53,500; new_price = 54,000 | User types 54,000 | Inline error: "Giá vượt trần ngày hôm nay (53,500 VND) của VIC trên HOSE." — "Xác nhận sửa" disabled |
| AC-OM-02-02 | VIC on HOSE; price level ≥ 50,000; new_price = 51,050 (not multiple of 100) | User types 51,050 | Inline error: "Giá phải là bội số của 100 VND. Gợi ý: 51,000 VND hoặc 51,100 VND?" — "Xác nhận sửa" disabled |
| AC-OM-02-03 | BUY LO; current_market_price = 50,000; new_price = 51,000 | User types 51,000 | Inline error showing E-OM-06 message — "Xác nhận sửa" disabled |
| AC-OM-02-04 | BUY LO; valid new_price = 49,500 within band; multiple of 50 (price in 10k–50k range); sufficient balance | User types 49,500 | No inline error; "Xác nhận sửa" enabled |
| AC-OM-02-05 | BUY LO; new_price = old_limit_price | User types same price as before | Inline error: "Giá mới phải khác giá hiện tại" — "Xác nhận sửa" disabled |
| AC-OM-02-06 | BUY LO; 500M balance available; old reserve = 5M; new reserve needed = 600M (impossible scenario for illustration) | User enters very large price | Inline error: E-OM-08 message with exact VND amounts — "Xác nhận sửa" disabled |

---

### FR-OM-03 — Edit Order: Confirmation Dialog

**Priority:** P0

**Description:**
After the user taps "Xác nhận sửa" and client-side validation passes, a confirmation dialog is presented before the API call is made. This dialog is a summary screen; it does not accept further input. The user must either confirm or dismiss.

**Dialog content (mandatory fields):**

| Field | Display value |
|-------|---------------|
| Ticker and exchange | e.g., "VIC — HOSE" |
| Side | "Mua" (BUY) or "Bán" (SELL) |
| Quantity | "[quantity] cổ phiếu" (integer, no decimals) |
| Old limit price | "Giá cũ: [old_price] VND" |
| New limit price | "Giá mới: [new_price] VND" |
| For BUY orders | "Đặt cọc mới: [new_reserve] VND (thay vì [old_reserve] VND)" |
| New order note | "Lệnh mới sẽ được tạo với mã lệnh mới." |

**Buttons:**
- "Xác nhận" (primary; calls the API)
- "Không" (secondary; dismisses dialog; returns user to edit sheet with the entered price retained)

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OM-03-01 | BUY LO; old_price = 48,000; new_price = 47,000; quantity = 100 | Confirmation dialog shown | Dialog displays "Giá cũ: 48,000 VND", "Giá mới: 47,000 VND", "Đặt cọc mới: 4,704,700 VND (thay vì 4,804,800 VND)" |
| AC-OM-03-02 | User taps "Không" on confirmation dialog | Button tap | Dialog dismisses; edit sheet is visible with new_price still in the input field |
| AC-OM-03-03 | User taps "Xác nhận" | Button tap | Loading spinner appears; buttons disabled; API call initiated |

---

### FR-OM-04 — Edit Order: Server-Side Processing (API Contract)

**Priority:** P0

**Description:**
The edit order operation uses a PATCH endpoint. Server must execute all operations atomically within a single DB transaction. The old order is cancelled (not deleted) and a new order is created. The `cancel_reason` for the old order is set to `'PRICE_MODIFIED'` — this is distinct from `'USER_CANCEL'` used for manual cancellations.

**Endpoint:** `PATCH /api/v1/paper-trading/orders/{order_id}/price`

**Authorization:** `Authorization: jwt <token>` — the `sub_account_id` of the order must match the authenticated user. Returns HTTP 403 if mismatch.

**Request Body:**
```json
{
  "new_price": 47000,
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440099"
}
```

**Request Field Constraints:**

| Field | Type | Constraint |
|-------|------|------------|
| `new_price` | integer | > 0; VND (no decimals for VN stocks) |
| `idempotency_key` | UUID v4 | Required; deduplicated within 5 minutes (Redis TTL); prevents duplicate edit operations on double-tap |

**Server Validation Sequence (authoritative; client-side is UX only):**

1. Check order exists and belongs to authenticated user's sub_account_id → 403 if mismatch
2. Check `order.order_type = 'LO'` → 422 E-OM-01-TYPE if not LO
3. Check `order.status = 'PENDING'` → 409 E-OM-01-STATUS with current status if not PENDING
4. Check `new_price ≠ order.limit_price` → 422 E-OM-00 if same
5. Validate tick size for the order's exchange → 422 E-OM-05 if violates
6. Validate new_price ≤ ceiling_price for the exchange → 422 E-OM-03
7. Validate new_price ≥ floor_price → 422 E-OM-04
8. Validate BUY price rule (new_price ≤ current_market_price for BUY) → 422 E-OM-06
9. Validate SELL price rule (new_price ≥ current_market_price for SELL) → 422 E-OM-07
10. For BUY: check net balance ≥ quantity × new_price × 1.001 → 422 E-OM-08
11. Check total pending orders after new order creation ≤ 10 (BR-OM-04) → 422 E-OM-09
12. Execute atomic DB transaction (steps defined in §3.1 Step 6)

**Response 201 Created (new order):**
```json
{
  "new_order_id": "ord_01HX2222AAAA",
  "old_order_id": "ord_01HX1111AAAA",
  "ticker": "VIC",
  "exchange": "HOSE",
  "order_type": "LO",
  "side": "BUY",
  "quantity": 100,
  "old_limit_price": 48000,
  "new_limit_price": 47000,
  "status": "PENDING",
  "reserve_amount": 4704700,
  "old_reserve_released": 4804800,
  "expiry_at": "2026-06-28T16:59:00Z",
  "created_at": "2026-05-29T04:30:00Z"
}
```

**Response 409 Conflict — order not in PENDING state (race condition):**
```json
{
  "error_code": "E-OM-01",
  "message": "Lệnh đã khớp, không thể sửa",
  "order_id": "ord_01HX1111AAAA",
  "current_status": "FILLED"
}
```

**Response 422 — validation failure:**
```json
{
  "error_code": "E-OM-03",
  "message": "Giá vượt trần ngày hôm nay (53,500 VND) của VIC trên HOSE.",
  "new_price_submitted": 54000,
  "daily_ceiling": 53500,
  "reference_price": 50000
}
```

**Idempotency behaviour:** If the same `idempotency_key` is received within 5 minutes of a successful edit, the server returns HTTP 200 with the original new_order response. No second edit operation is performed.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OM-04-01 | Valid PATCH; order is PENDING LO; new_price within band and valid | PATCH received | HTTP 201; old order has status = 'CANCELLED', cancel_reason = 'PRICE_MODIFIED'; new order has status = 'PENDING' with new limit_price; both in DB |
| AC-OM-04-02 | PATCH arrives; order has just been FILLED in a concurrent thread | PATCH received after fill | HTTP 409; E-OM-01; no new order created; no DB change |
| AC-OM-04-03 | PATCH arrives; order has just become PARTIAL in a concurrent thread | PATCH received after partial fill | HTTP 409; E-OM-01 with current_status = 'PARTIAL'; no new order created |
| AC-OM-04-04 | BUY LO PATCH; old reserve = 4,804,800; new reserve = 4,704,700 | Successful edit | DB: old reserve record deleted; new reserve record inserted; available_balance increases by 100,100 VND (delta) atomically in same transaction |
| AC-OM-04-05 | SELL LO PATCH; new_price | Successful edit | DB: old holdings_soft_lock deleted; new holdings_soft_lock inserted with same quantity; no change to holdings.quantity |
| AC-OM-04-06 | Duplicate PATCH with same idempotency_key within 5 minutes | Second PATCH received | HTTP 200; original new_order response returned; no second edit operation; DB state unchanged |
| AC-OM-04-07 | User has 9 open PENDING orders; edit creates new order | PATCH received | New order count = 10 (old cancelled → net +0 from cancel, +1 from new = 10 total); must succeed because old cancelled before new created in same transaction. Net result: 10 open orders. |
| AC-OM-04-08 | User has 10 open PENDING orders (one is the order being edited); edit creates new order | PATCH received | Old order cancelled (count drops to 9); new order created (count returns to 10); succeeds. Net = 10 open orders. |

**Note on AC-OM-04-07 and AC-OM-04-08:** The edit operation cancels the old order before creating the new one within the same DB transaction. The 10-order limit check (BR-OM-04) must be applied against the count AFTER the old order is cancelled (i.e., `COUNT(PENDING) − 1 + 1 = COUNT(PENDING)`). The net result is that editing an existing order always preserves the current count without exceeding the limit, as long as the user did not acquire additional orders concurrently.

---

### FR-OM-05 — Cancel Order: Button Visibility and Pre-Conditions

**Priority:** P0

**Description:**
The "Huỷ lệnh" button is rendered when the order's status permits user cancellation. The button label and supplementary copy change based on order type and status.

**Rendering rules:**

| `order.status` | "Huỷ lệnh" button shown | Button label variant |
|----------------|------------------------|----------------------|
| `PENDING` | Yes | "Huỷ lệnh" |
| `ACCEPTED` | Yes | "Huỷ lệnh" |
| `PARTIAL` | Yes | "Huỷ lệnh (phần còn lại)" |
| `FILLED` | No | — |
| `CANCELLED` | No | — |
| `REJECTED` | No | — |
| `EXPIRED` | No | — |
| `FILL_FAILED` | No | — |

**Note on ACCEPTED status:** While the primary DB schema provided uses PENDING as the initial post-submission state, ACCEPTED is listed in the feature scope as cancellable. The button renders for ACCEPTED status identically to PENDING.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OM-05-01 | Order status = PENDING | User views order detail | "Huỷ lệnh" button rendered |
| AC-OM-05-02 | Order status = PARTIAL | User views order detail | "Huỷ lệnh (phần còn lại)" button rendered; "Sửa lệnh" button absent; tooltip "Không thể sửa lệnh đã khớp một phần" shown if user long-presses the area where "Sửa lệnh" would appear |
| AC-OM-05-03 | Order status = FILLED | User views order detail | "Huỷ lệnh" button absent |
| AC-OM-05-04 | Order status = CANCELLED | User views order detail | "Huỷ lệnh" button absent |
| AC-OM-05-05 | Order status = EXPIRED | User views order detail | "Huỷ lệnh" button absent |

---

### FR-OM-06 — Cancel Order: PARTIAL Order Handling

**Priority:** P0

**Description:**
When a PARTIAL order is cancelled, only the remaining unfilled quantity is cancelled. The filled portion is immutable and permanently recorded in the order's `filled_quantity` and `avg_fill_price` fields. The reserved cash for the remaining (unfilled) quantity is released; the already-spent cash (for the filled portion) is not refunded.

**Cancel behaviour for PARTIAL orders:**

| Field | Before cancel | After cancel |
|-------|---------------|--------------|
| `order.status` | `PARTIAL` | `CANCELLED` |
| `order.filled_quantity` | e.g., 100 (filled) | 100 (unchanged — immutable) |
| `order.quantity` | e.g., 200 (original) | 200 (unchanged) |
| `order.cancelled_at` | null | `NOW()` |
| `order.cancel_reason` | null | `'USER_CANCEL'` |
| Reserved cash released (BUY) | `(quantity − filled_quantity) × limit_price × 1.001` = 100 × limit_price × 1.001 | Released to available_balance |
| Holdings soft-lock released (SELL) | soft-locked quantity = `quantity − filled_quantity` | Released |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OM-06-01 | BUY LO; quantity = 200; filled_quantity = 100; limit_price = 50,000; reserve = 200 × 50,000 × 1.001 = 10,010,000 VND | User cancels the PARTIAL order | DB: status = CANCELLED; filled_quantity remains 100; reserve released = 100 × 50,000 × 1.001 = 5,005,000 VND; available_balance += 5,005,000 VND |
| AC-OM-06-02 | SELL LO; quantity = 200; filled_quantity = 100; soft-locked = 200 shares initially | User cancels | DB: status = CANCELLED; 100 remaining shares released from soft-lock; filled portion (100 shares) already reduced from holdings at fill time — no double release |
| AC-OM-06-03 | PARTIAL order; user taps cancel → confirmation sheet | Bottom sheet opens | Sheet shows: "Chỉ phần chưa khớp (100 cổ phiếu) sẽ được huỷ." with correct remaining quantity |

---

### FR-OM-07 — Cancel Order: STOP / STOP_LIMIT Parent-Child Cancellation

**Priority:** P1

**Description:**
A STOP order or STOP_LIMIT order creates a child LO order when its trigger price is reached. If the parent STOP order is cancelled by the user before the trigger fires, no child exists yet — only the parent is cancelled. If the trigger has already fired and a child LO has been created, cancelling the parent is not possible (the parent has already transitioned to a terminal state). The user must cancel the child LO directly.

If a STOP order is in PENDING status (trigger not yet fired) and the user cancels it:

**Cancellation scope:**

| Scenario | What gets cancelled |
|----------|---------------------|
| Parent STOP in PENDING; no child created yet | Only the parent STOP order |
| Parent STOP triggered; child LO in PENDING | Parent is already in terminal state; user cancels child LO directly (FR-OM-05 applies) |
| Parent STOP triggered; child LO in PARTIAL | User cancels child LO directly; only remaining quantity cancelled (FR-OM-06 applies) |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OM-07-01 | Parent STOP order in PENDING (trigger not fired); no child LO exists | User cancels parent STOP | DB: parent STOP → CANCELLED; cancel_reason = 'USER_CANCEL'; no child affected |
| AC-OM-07-02 | Parent STOP triggered; child LO created in PENDING | User views the STOP order in history | STOP order shows as FILLED/TRIGGERED (terminal); "Huỷ lệnh" absent on parent; child LO has its own row with "Huỷ lệnh" visible |
| AC-OM-07-03 | Child LO (created by STOP trigger) in PENDING | User cancels child LO | Child LO → CANCELLED; reserved cash (BUY) or soft-lock (SELL) released normally |

---

### FR-OM-08 — Cancel Order: Server-Side Processing (API Contract)

**Priority:** P0

**Description:**
The cancel order operation uses a DELETE endpoint. Server must execute the cancellation and all side-effect operations (reserve release, soft-lock release) atomically within a single DB transaction (BR-OM-05).

**Endpoint:** `DELETE /api/v1/paper-trading/orders/{order_id}`

**Authorization:** `Authorization: jwt <token>` — the `sub_account_id` of the order must match the authenticated user (BR-OM-06). Returns HTTP 403 if mismatch.

**Request Body (optional):**
```json
{
  "user_cancel_note": "Muốn đặt lại ở giá khác"
}
```

**Request Field Constraints:**

| Field | Type | Constraint |
|-------|------|------------|
| `user_cancel_note` | string | Optional; max 200 characters; stored in `virtual_orders.user_cancel_note`; not returned in order list (only in order detail) |

**Server Validation Sequence:**

1. Check order exists and belongs to authenticated user's sub_account_id → 403 if mismatch
2. Check `order.status IN ('PENDING', 'ACCEPTED', 'PARTIAL')` → 409 E-OM-10 with current status if terminal
3. BEGIN DB TRANSACTION
4. SELECT order FOR UPDATE (row-level lock; prevents race condition with fill daemon)
5. Re-check status after acquiring lock (double-check pattern)
   - If status is now FILLED: ROLLBACK; return 409 E-OM-10 with current_status = 'FILLED'; message = "Lệnh đã khớp, không thể huỷ"
   - If status is already CANCELLED: ROLLBACK; return 200 with the already-cancelled order (idempotent)
6. UPDATE virtual_orders SET status = 'CANCELLED', cancel_reason = 'USER_CANCEL', cancelled_at = NOW(), user_cancel_note = {note}
7. For BUY orders: DELETE FROM order_reserves WHERE order_id = {id}; UPDATE virtual_balances SET reserved_amount = reserved_amount − reserve_amount, available_balance = available_balance + reserve_amount
8. For SELL LO: DELETE FROM holdings_soft_lock WHERE order_id = {id}
9. For PARTIAL BUY: release only the unreserved portion — reserve_amount = (quantity − filled_quantity) × limit_price × 1.001
10. COMMIT

**Response 200 OK:**
```json
{
  "order_id": "ord_01HX1111AAAA",
  "status": "CANCELLED",
  "cancel_reason": "USER_CANCEL",
  "reserve_released": 4504500,
  "soft_lock_released_quantity": null,
  "cancelled_at": "2026-05-29T05:00:00Z"
}
```

**Response 200 OK (PARTIAL order cancelled):**
```json
{
  "order_id": "ord_01HX1111BBBB",
  "status": "CANCELLED",
  "cancel_reason": "USER_CANCEL",
  "filled_quantity": 100,
  "remaining_quantity_cancelled": 100,
  "reserve_released": 5005000,
  "cancelled_at": "2026-05-29T05:01:00Z"
}
```

**Response 409 Conflict — order already in terminal state:**
```json
{
  "error_code": "E-OM-10",
  "message": "Lệnh đã khớp, không thể huỷ",
  "order_id": "ord_01HX1111AAAA",
  "current_status": "FILLED"
}
```

**Response 403 — authorisation failure:**
```json
{
  "error_code": "E-OM-11",
  "message": "Bạn không có quyền huỷ lệnh này.",
  "order_id": "ord_01HX1111AAAA"
}
```

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-OM-08-01 | BUY LO in PENDING; reserve_amount = 4,504,500 VND | DELETE called | HTTP 200; order status = CANCELLED; cancel_reason = 'USER_CANCEL'; reserve released = 4,504,500; available_balance += 4,504,500 — all in one DB transaction |
| AC-OM-08-02 | SELL LO in PENDING; 100 shares soft-locked | DELETE called | HTTP 200; holdings_soft_lock record deleted; shares available to sell again |
| AC-OM-08-03 | Order is FILLED (race condition: fill happened between user tapping "Huỷ lệnh" and DELETE received) | DELETE received | HTTP 409; E-OM-10; no DB change; message = "Lệnh đã khớp, không thể huỷ" |
| AC-OM-08-04 | Order in EXPIRED status | DELETE called | HTTP 409; E-OM-10 with current_status = 'EXPIRED'; message = "Lệnh không thể huỷ — trạng thái hiện tại: Đã hết hạn" |
| AC-OM-08-05 | User A attempts to cancel User B's order | DELETE called with User A's token | HTTP 403; E-OM-11; no DB change |
| AC-OM-08-06 | BUY LO PARTIAL; quantity = 200; filled = 100; limit_price = 50,000 | DELETE called | HTTP 200; status = CANCELLED; reserve_released = 5,005,000 VND (100 × 50,000 × 1.001 only); filled_quantity = 100 (immutable) |
| AC-OM-08-07 | DELETE called; concurrently, fill daemon acquires lock on same order 50ms earlier | DELETE arrives during fill processing | Row-level lock ensures serialisation: fill daemon commits first; DELETE sees FILLED status → returns HTTP 409 E-OM-10 |
| AC-OM-08-08 | DELETE called with user_cancel_note = "Test note" (200 chars max) | DELETE called | Note stored in virtual_orders.user_cancel_note; returned in order detail GET but not in order list GET |
| AC-OM-08-09 | DELETE called with user_cancel_note exceeding 200 characters | DELETE called | HTTP 422; error: "Lý do huỷ không được vượt quá 200 ký tự." |

---

## 6. Business Rules

| Rule ID | Rule | Violation Behaviour |
|---------|------|---------------------|
| BR-OM-01 | Only orders with `order_type = 'LO'` AND `status = 'PENDING'` can have their price modified. All other order types (MARKET, ATO, ATC, STOP_LIMIT, STOP) and all non-PENDING statuses are ineligible for price modification. | Server returns HTTP 409 / 422 per appropriate error code; no DB change |
| BR-OM-02 | The new limit price submitted in an edit request must satisfy all of the following simultaneously: (a) within the daily price band (≤ ceiling_price AND ≥ floor_price for the stock's exchange), (b) conforming to the exchange tick size, (c) for BUY: ≤ current_market_price; for SELL: ≥ current_market_price. All three conditions are validated server-side using live price data at the moment of the API call. | HTTP 422 with specific error code (E-OM-03 through E-OM-07) per failing rule |
| BR-OM-03 | An edit operation does NOT update the existing `virtual_orders` row. It sets the old order's `status = 'CANCELLED'` with `cancel_reason = 'PRICE_MODIFIED'`, then creates a new `virtual_orders` row with a new `order_id`, the same `symbol_code`/`exchange`/`side`/`remaining_quantity`, and the new `limit_price`. This preserves a complete audit trail. | The UPDATE + INSERT must be in the same DB transaction; partial completion is not acceptable; on failure, full rollback |
| BR-OM-04 | The maximum 10 concurrent open PENDING orders per user (from BR-PT-14 in SRD-order-engine-v2.3) applies to edit operations. Since an edit cancels one order and creates one new order in the same transaction, the net count does not change. The 10-order limit check is applied post-cancellation of the old order (count − 1 + 1 = count). An edit never fails due to the 10-order limit unless the user has acquired additional orders concurrently between the time the old order is cancelled and the new order is created (extremely unlikely within a single transaction). | If concurrent acquisition causes the check to fail: HTTP 422 E-OM-09 |
| BR-OM-05 | Cancellation must release reserved cash (for BUY orders) or soft-locked holdings (for SELL LO orders) in the same DB transaction as the status update. Releasing reserves or locks in a separate request or a separate transaction is not permitted. Partial completion (status = CANCELLED but reserve not released) is a data integrity failure. | Full rollback on any step failure; reserve and lock must be released atomically with the status change |
| BR-OM-06 | A user can only cancel or edit their own orders. The server validates that `virtual_orders.sub_account_id` belongs to the authenticated user's sub-accounts. Cross-user cancellation or edit returns HTTP 403 regardless of how the request is constructed. | HTTP 403; E-OM-11; no DB change; log the attempt with user_id and order_id |
| BR-OM-07 | PARTIAL orders cannot have their price modified. The "Sửa lệnh" button is absent for PARTIAL orders in the UI. If a PATCH request is submitted for a PARTIAL order (bypassing the UI), the server returns HTTP 409 with current_status = 'PARTIAL'. A tooltip "Không thể sửa lệnh đã khớp một phần" is shown to the user if they attempt to interact with the disabled area. | HTTP 409; E-OM-01 with current_status = 'PARTIAL'; no DB change |

---

## 7. Acceptance Criteria

This section consolidates the full Given/When/Then criteria across all functional requirements. Individual FR sections contain the detailed criteria; this section provides a QA-ready summary organised by test category.

### 7.1 Edit Order — Cancellability / Eligibility Gates

| # | Given | When | Then |
|---|-------|------|------|
| TC-EDIT-01 | LO order; status = PENDING; owned by authenticated user | User opens edit sheet | Edit sheet opens; "Xác nhận sửa" initially disabled |
| TC-EDIT-02 | MARKET order; status = PENDING | User views order detail | "Sửa lệnh" button absent |
| TC-EDIT-03 | LO order; status = PARTIAL | User views order detail | "Sửa lệnh" button absent; tooltip "Không thể sửa lệnh đã khớp một phần" accessible |
| TC-EDIT-04 | LO order; status = FILLED | User views order detail | "Sửa lệnh" button absent |
| TC-EDIT-05 | LO order; status = CANCELLED | User views order detail | "Sửa lệnh" button absent |
| TC-EDIT-06 | LO order; status = EXPIRED | User views order detail | "Sửa lệnh" button absent |
| TC-EDIT-07 | STOP_LIMIT order; status = PENDING | User views order detail | "Sửa lệnh" button absent (order_type ≠ 'LO') |

### 7.2 Edit Order — Price Validation

| # | Given | When | Then |
|---|-------|------|------|
| TC-EDIT-08 | VIC HOSE; reference_price = 50,000; ceiling = 53,500; new_price = 54,000 | User submits edit | HTTP 422; E-OM-03; message: "Giá vượt trần ngày hôm nay (53,500 VND) của VIC trên HOSE." |
| TC-EDIT-09 | VIC HOSE; reference_price = 50,000; floor = 46,500; new_price = 46,000 | User submits edit | HTTP 422; E-OM-04; message: "Giá thấp hơn sàn ngày hôm nay (46,500 VND) của VIC trên HOSE." |
| TC-EDIT-10 | VIC HOSE; new_price = 51,050 (price ≥ 50,000 → tick = 100; 51,050 not multiple of 100) | User submits edit | HTTP 422; E-OM-05; message: "Giá phải là bội số của 100 VND. Gợi ý: 51,000 VND hoặc 51,100 VND?" |
| TC-EDIT-11 | BUY LO; current_market_price = 50,000; new_price = 51,000 | User submits edit | HTTP 422; E-OM-06; message: "Giá mua giới hạn (51,000 VND) cao hơn giá thị trường hiện tại (50,000 VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá thấp hơn 50,000 VND." |
| TC-EDIT-12 | SELL LO; current_market_price = 50,000; new_price = 49,000 | User submits edit | HTTP 422; E-OM-07; message: "Giá bán giới hạn (49,000 VND) thấp hơn giá thị trường hiện tại (50,000 VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá cao hơn 50,000 VND." |
| TC-EDIT-13 | BUY LO; total_cash = 10,000,000; current_reserves = 9,500,000 (other orders); old_reserve = 4,500,000; new_reserve = 7,000,000 | User submits edit | Net available = 10,000,000 − 9,500,000 + 4,500,000 = 5,000,000; new_reserve = 7,000,000 > 5,000,000 → HTTP 422; E-OM-08 |
| TC-EDIT-14 | Valid BUY LO edit; new_price = 47,000; quantity = 100; within band; balance sufficient | User submits edit | HTTP 201; old order CANCELLED (cancel_reason = 'PRICE_MODIFIED'); new order PENDING with limit_price = 47,000 |
| TC-EDIT-15 | Valid SELL LO edit; new_price = 55,000 (above current market); within band | User submits edit | HTTP 201; old order CANCELLED; new order PENDING with limit_price = 55,000; soft-lock transferred to new order_id |

### 7.3 Edit Order — Race Conditions

| # | Given | When | Then |
|---|-------|------|------|
| TC-EDIT-16 | User has edit sheet open; order fills while sheet is open | User taps "Xác nhận" | Server returns HTTP 409; toast: "Lệnh đã khớp, không thể sửa"; sheet closes; order list refreshes showing FILLED |
| TC-EDIT-17 | User has edit sheet open; order receives partial fill while sheet is open | User taps "Xác nhận" | Server returns HTTP 409 (current_status = 'PARTIAL'); toast: "Lệnh đã khớp một phần, không thể sửa. Vui lòng huỷ lệnh trước."; sheet closes |
| TC-EDIT-18 | User double-taps "Xác nhận" (sends two PATCH requests with same idempotency_key within 5 min) | Second PATCH arrives | HTTP 200 with original new_order response; no second edit operation; one new order in DB |

### 7.4 Cancel Order — Eligibility Gates

| # | Given | When | Then |
|---|-------|------|------|
| TC-CANCEL-01 | Order status = PENDING | User taps "Huỷ lệnh" | Cancel confirmation sheet opens |
| TC-CANCEL-02 | Order status = PARTIAL | User taps "Huỷ lệnh (phần còn lại)" | Cancel sheet opens; shows "Chỉ phần chưa khớp ([remaining_qty] cổ phiếu) sẽ được huỷ." |
| TC-CANCEL-03 | Order status = FILLED | User views order detail | "Huỷ lệnh" button absent |
| TC-CANCEL-04 | Order status = CANCELLED | User views order detail | "Huỷ lệnh" button absent |
| TC-CANCEL-05 | Order status = REJECTED | User views order detail | "Huỷ lệnh" button absent |
| TC-CANCEL-06 | Order status = EXPIRED | User views order detail | "Huỷ lệnh" button absent |

### 7.5 Cancel Order — Side Effects

| # | Given | When | Then |
|---|-------|------|------|
| TC-CANCEL-07 | BUY LO in PENDING; reserve_amount = 4,504,500 VND | User confirms cancel | HTTP 200; status = CANCELLED; available_balance increases by exactly 4,504,500 VND in same transaction |
| TC-CANCEL-08 | SELL LO in PENDING; 100 shares of VIC soft-locked | User confirms cancel | HTTP 200; status = CANCELLED; holdings_soft_lock record for this order deleted; VIC shows 100 shares available to sell again |
| TC-CANCEL-09 | BUY LO PARTIAL; quantity = 300; filled_quantity = 100; limit_price = 60,000 | User confirms cancel | reserve_released = 200 × 60,000 × 1.001 = 12,012,000 VND; filled_quantity remains 100; status = CANCELLED |
| TC-CANCEL-10 | SELL LO PARTIAL; quantity = 300; filled_quantity = 100; 200 shares soft-locked (remaining) | User confirms cancel | 200 remaining shares released from soft-lock; 100 already-sold shares not affected |
| TC-CANCEL-11 | STOP order in PENDING; trigger not yet fired | User cancels STOP parent | HTTP 200; STOP order CANCELLED; cancel_reason = 'USER_CANCEL'; no child LO exists → no cascade |

### 7.6 Cancel Order — Race Conditions

| # | Given | When | Then |
|---|-------|------|------|
| TC-CANCEL-12 | Order fills between user tapping "Huỷ lệnh" and DELETE reaching server | DELETE arrives after FILLED | HTTP 409; E-OM-10; message = "Lệnh đã khớp, không thể huỷ"; no DB change; client shows toast and refreshes |
| TC-CANCEL-13 | Duplicate DELETE sent (e.g., double-tap) | Second DELETE for already-CANCELLED order | HTTP 200 with the already-CANCELLED order returned; no error; idempotent |
| TC-CANCEL-14 | Fill daemon acquires row lock 50ms before DELETE request | DELETE waits for lock; sees FILLED after acquiring | HTTP 409; E-OM-10; client shows "Lệnh đã khớp, không thể huỷ" |

### 7.7 Authorization

| # | Given | When | Then |
|---|-------|------|------|
| TC-AUTH-01 | User A's JWT token; order_id belonging to User B | PATCH or DELETE request | HTTP 403; E-OM-11; no DB change |
| TC-AUTH-02 | Unauthenticated request (no token) | PATCH or DELETE request | HTTP 401; not exposed via UI (button requires auth session to render) |

---

## 8. Edge Cases

### 8.1 Race Condition: Order Fills While Cancel Is In-Flight

**Scenario:** User sees the order as PENDING in the UI, taps "Huỷ lệnh", and the cancel confirmation sheet is open. Concurrently, the fill daemon matches the order because the price snapshot triggers the fill condition.

**Resolution:**
1. Server acquires row-level lock (`SELECT FOR UPDATE`) on the order row at the start of the cancel transaction.
2. If the fill daemon acquired the lock first and committed (status = FILLED before DELETE acquires lock): DELETE sees FILLED → returns HTTP 409 E-OM-10.
3. If DELETE acquires the lock first: order is cancelled before fill daemon can process it; fill daemon sees CANCELLED and skips.
4. There is no scenario where both fill and cancel succeed for the same order — row-level locking ensures mutual exclusion.

**User-facing outcome:** Toast "Lệnh đã khớp, không thể huỷ"; order list refreshes to show FILLED status and filled price.

### 8.2 Race Condition: Order Receives Partial Fill While Edit Is In-Flight

**Scenario:** User has edit sheet open. Between opening the sheet and tapping "Xác nhận sửa", the fill daemon partially fills the order (status transitions to PARTIAL).

**Resolution:**
1. Server PATCH validates `order.status = 'PENDING'` after acquiring the row lock.
2. If status is now PARTIAL: returns HTTP 409 with current_status = 'PARTIAL'.
3. No new order is created; old order remains as PARTIAL.
4. User must cancel the remaining PARTIAL quantity separately.

**User-facing outcome:** Toast "Lệnh đã khớp một phần, không thể sửa. Vui lòng huỷ lệnh trước."; edit sheet closes; order list refreshes.

### 8.3 Concurrent Edit Attempts (Same Order, Two Devices)

**Scenario:** User is logged in on two devices simultaneously. Both devices show the edit sheet for the same order. Both send PATCH requests within milliseconds of each other.

**Resolution:**
1. First PATCH acquires the row lock and executes atomically: old order → CANCELLED, new order created.
2. Second PATCH arrives: the target `order_id` now has status = CANCELLED → server returns HTTP 409 E-OM-01 (cannot edit a cancelled order).
3. The second device receives an error; its UI refreshes showing the new order (from device 1's edit).

**User-facing outcome (device 2):** Toast "Lệnh không thể sửa — trạng thái hiện tại: Đã huỷ"; order list refreshes showing the new order from device 1's edit.

### 8.4 STOP Parent Cancelled — Child LO Created Concurrently

**Scenario:** User taps cancel on a STOP parent order at the exact moment the STOP's trigger condition fires and the system creates a child LO.

**Resolution:**
- The trigger condition evaluation and the cancel request compete for the row lock on the STOP order.
- If cancel acquires lock first: STOP → CANCELLED; trigger evaluation sees CANCELLED → aborts child LO creation.
- If trigger acquires lock first: child LO created; STOP transitions to triggered (terminal or intermediate state). Cancel request sees the STOP is no longer PENDING → HTTP 409; user must cancel the child LO independently.

**User-facing outcome:** If STOP was cancelled first: success toast for STOP cancellation. If trigger fired first: toast "Lệnh không thể huỷ — trạng thái hiện tại: [triggered]"; user finds the child LO in Open Orders and cancels it.

### 8.5 Daily Price Band Changes Between Edit Sheet Open and Confirm

**Scenario:** User opens the edit sheet while the price band is at one level. During the session (e.g., newly-listed stock; between sheet open and confirm tapping), the reference_price update runs and the ceiling/floor changes.

**Resolution:**
- Client-side validation uses the price band fetched when the edit sheet opens.
- Server-side validation uses the price band at the moment the PATCH is received (authoritative).
- If the band has narrowed and the entered new_price now violates the server-side band: HTTP 422 E-OM-03 or E-OM-04; inline error shown in the sheet (sheet remains open).

### 8.6 Edit Order — New Order Falls Within 10-Order Limit But Other Orders Created Concurrently

**Scenario:** User has 9 open orders. User opens edit sheet for one of them (net will be 9 − 1 + 1 = 9 after edit). Concurrently, a new order from another device reaches 10. Now when the edit executes: cancel reduces count to 9 (other new order + 8 remaining), then new order brings it to 10. This is acceptable.

**Resolution:** The 10-order check happens inside the transaction after cancelling the old order. The check counts PENDING orders at that instant (within the transaction with appropriate isolation). 10 is the ceiling; the edit always results in an equivalent count if no concurrent additions happened. This is handled by BR-OM-04.

### 8.7 Network Timeout During Cancel Processing

**Scenario:** DELETE request is sent; the server receives and starts processing (within transaction), but the response is lost due to network failure. The client shows an error and the user retries.

**Resolution:**
- If the first DELETE committed successfully: order is CANCELLED. The retry DELETE sees CANCELLED status → returns HTTP 200 (idempotent response) because the order is already in the desired state.
- If the first DELETE did not commit (timeout during transaction): the order remains PENDING. The retry DELETE proceeds normally.
- The UI recovers by refreshing the order list on retry; the correct state is always reflected.

---

## 9. Design Requirements

### 9.1 Edit Price Bottom Sheet

| Element | Specification |
|---------|---------------|
| Sheet type | Bottom sheet (modal); slides up from bottom; 60% screen height; swipe-down dismisses ONLY when no processing is active |
| Header | Title: "Sửa giá lệnh" — left-aligned; "✕" close button on right (same as swipe-down) |
| Order summary row | Ticker code (bold) + exchange chip + side chip (Mua = green / Bán = red) + quantity (e.g., "100 cổ phiếu") — read-only; 1 row |
| Current price label | "Giá hiện tại: [old_limit_price] VND" — muted/secondary text style; read-only |
| Price band label | "Biên độ hôm nay: Sàn [floor_price] VND — Trần [ceiling_price] VND" — caption style below the input |
| New price input | Full-width; VND-formatted (period thousands separator, no decimals); numeric keyboard (VN number pad); placeholder "Nhập giá mới (VND)" |
| Inline error | Rendered directly below the input field; red text; appears on blur or on first keystroke after initial entry; disappears when input becomes valid |
| "Xác nhận sửa" button | Full-width; primary style; disabled state when input is empty, same as old price, or fails validation; enabled state when valid |
| "Huỷ" link button | Below "Xác nhận sửa"; center-aligned; dismisses sheet; no destructive colour |
| Processing state | "Xác nhận sửa" shows spinner; all interactive elements disabled; sheet not swipe-dismissible |

### 9.2 Edit Confirmation Dialog

| Element | Specification |
|---------|---------------|
| Dialog type | Modal overlay on top of the edit sheet (sheet remains visible behind it) |
| Title | "Xác nhận thay đổi giá?" |
| Body | Tabular summary: "Giá cũ: [old_price] VND" / "Giá mới: [new_price] VND" / (for BUY) "Đặt cọc mới: [new_reserve] VND" / "Lệnh mới sẽ được tạo với mã lệnh mới." |
| "Xác nhận" button | Full-width; primary style; triggers API call; becomes spinner during processing |
| "Không" button | Full-width; secondary/ghost style; dismisses dialog; returns to edit sheet |
| Tap-outside-to-dismiss | Disabled while processing; enabled when idle |

### 9.3 Cancel Confirmation Bottom Sheet

| Element | Specification |
|---------|---------------|
| Sheet type | Bottom sheet (modal); 50–70% screen height depending on content; swipe-down dismisses ONLY when processing is not active |
| Header | Title: "Huỷ lệnh?" — left-aligned; "✕" close button on right |
| Order summary section | Ticker code (bold) + exchange chip + side chip + quantity + order_type chip + limit_price if LO — read-only card; distinct background |
| Confirmation text | "Bạn có chắc muốn huỷ lệnh này?" — medium weight; 16sp |
| Refund / release info | For BUY: "Số tiền đặt cọc [X VND] sẽ được hoàn trả vào số dư khả dụng." — green text, checkmark icon |
|  | For SELL LO: "[X] cổ phiếu [TICKER] đang bị khoá sẽ được giải phóng." — green text |
|  | For PARTIAL: "Chỉ phần chưa khớp ([remaining_qty] cổ phiếu) sẽ được huỷ." — amber/warning text |
| Cancel reason field | Label: "Lý do huỷ (không bắt buộc)"; text area; max 200 chars; character counter at bottom-right (e.g., "0/200"); keyboard dismisses on scroll; visible character limit reminder at 180 chars |
| "Huỷ lệnh" button | Full-width; destructive style: background `#E53935` (red); white text; 16sp semi-bold; border-radius matches design system; tap triggers confirm → processing |
| "Không" button | Full-width; secondary/outline style; below "Huỷ lệnh" (not inline); dismisses sheet; no action |
| Button spacing | 12px gap between "Huỷ lệnh" and "Không"; 16px bottom safe area inset |
| Processing state | "Huỷ lệnh" shows spinner; all interactive elements disabled; sheet not swipe-dismissible |

### 9.4 PARTIAL Order Tooltip (Edit disabled)

| Element | Specification |
|---------|---------------|
| Trigger | User long-presses (500ms) the area where "Sửa lệnh" button would appear in Order Detail for a PARTIAL order |
| Tooltip text | "Không thể sửa lệnh đã khớp một phần" |
| Tooltip style | Dark background; white text; 12sp; appears above the press point; auto-dismisses after 2.5 seconds |
| Tooltip position | Above the tapped area; does not overlap order summary content |

### 9.5 Error Toast Positioning and Stacking

| Rule | Specification |
|------|---------------|
| Position | Bottom of screen; 16px above the bottom navigation bar |
| Maximum simultaneous toasts | 1 (new toast replaces previous if user triggers multiple errors quickly) |
| Z-index | Above bottom sheet content; below modal dialogs |
| Animation | Slide-up from bottom on appear; fade-out on dismiss |
| Tap to dismiss | Entire toast area is tappable to dismiss early |

---

## 10. Error Code Reference

### Edit Order Error Codes (E-OM-01 through E-OM-09)

| Error Code | HTTP Status | Trigger | Exact User-Facing Message (Vietnamese) |
|------------|-------------|---------|----------------------------------------|
| E-OM-00 | 422 | new_price is absent, zero, or identical to current limit_price | "Giá mới phải khác giá hiện tại" |
| E-OM-01 | 409 | Order status is not PENDING at time of PATCH (race condition: FILLED or PARTIAL) | "Lệnh đã khớp, không thể sửa" (if FILLED) / "Lệnh đã khớp một phần, không thể sửa. Vui lòng huỷ lệnh trước." (if PARTIAL) |
| E-OM-02 | 422 | Order type is not LO (edit attempted on MARKET, ATO, ATC, STOP, STOP_LIMIT) | "Chỉ có thể sửa giá cho lệnh LO (Limit Order) đang chờ khớp." |
| E-OM-03 | 422 | new_price exceeds daily price ceiling for the exchange | "Giá vượt trần ngày hôm nay ([ceiling_price] VND) của [TICKER] trên [EXCHANGE]." |
| E-OM-04 | 422 | new_price is below daily price floor for the exchange | "Giá thấp hơn sàn ngày hôm nay ([floor_price] VND) của [TICKER] trên [EXCHANGE]." |
| E-OM-05 | 422 | new_price violates tick size for the stock's price level | "Giá phải là bội số của [tick_size] VND. Gợi ý: [round_down] VND hoặc [round_up] VND?" |
| E-OM-06 | 422 | BUY LO: new_price > current_market_price | "Giá mua giới hạn ([new_price] VND) cao hơn giá thị trường hiện tại ([current_price] VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá thấp hơn [current_price] VND." |
| E-OM-07 | 422 | SELL LO: new_price < current_market_price | "Giá bán giới hạn ([new_price] VND) thấp hơn giá thị trường hiện tại ([current_price] VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá cao hơn [current_price] VND." |
| E-OM-08 | 422 | BUY LO edit: net available_balance insufficient for new reserve | "Số dư không đủ để đặt cọc. Khả dụng: [avail_balance] VND. Cần đặt cọc: [required_reserve] VND." |
| E-OM-09 | 422 | 10-order limit would be exceeded after the edit (concurrent order acquisition edge case) | "Đã đạt giới hạn 10 lệnh đang mở. Huỷ một lệnh khác trước khi sửa lệnh này." |

### Cancel Order Error Codes (E-OM-10 through E-OM-12)

| Error Code | HTTP Status | Trigger | Exact User-Facing Message (Vietnamese) |
|------------|-------------|---------|----------------------------------------|
| E-OM-10 | 409 | Order is in a terminal or non-cancellable state (FILLED, EXPIRED, REJECTED, FILL_FAILED) — race condition | "Lệnh đã khớp, không thể huỷ" (if FILLED) / "Lệnh không thể huỷ — trạng thái hiện tại: [status_label_vi]" (other terminal states) |
| E-OM-11 | 403 | Authenticated user's sub_account_id does not match the order's sub_account_id | "Bạn không có quyền huỷ lệnh này." |
| E-OM-12 | 422 | user_cancel_note exceeds 200 characters | "Lý do huỷ không được vượt quá 200 ký tự." |

### Status Label Vietnamese Mapping (for E-OM-10 message)

| `current_status` value | Vietnamese label for error message |
|------------------------|-------------------------------------|
| `FILLED` | "Đã khớp" |
| `CANCELLED` | "Đã huỷ" |
| `REJECTED` | "Bị từ chối" |
| `EXPIRED` | "Đã hết hạn" |
| `FILL_FAILED` | "Khớp lệnh thất bại" |

---

## 11. Related Documents

| Document | Relationship |
|----------|-------------|
| BRD.md §BO-08 | Business objective: ≥ 3 paper trades per active user per week — order management (edit/cancel) reduces friction in the trading loop and supports this target |
| FRD-10: Paper Trading Engine (v2.4) | Defines FR-PT-03 (Limit Order submission), FR-PT-08 (Order State Machine), and all business rules BR-PT-01 through BR-PT-20 that govern the orders this document manages |
| FRD-18: Order History | Primary entry point (EP-01) for Edit and Cancel flows; defines the order list data model returned to the client |
| FRD-20: Order Detail | Entry point (EP-02) for Edit and Cancel flows; defines the expanded order detail view |
| SRD-order-engine-v2.3.md | Authoritative system specification for order processing, reserve ledger, soft-lock table, and the DELETE /api/v1/paper-trading/orders/{order_id} endpoint (§4.3) that this document extends |
| FRD-04: Stock Detail | Entry point (EP-04) — active order chip that links to Order Detail bottom sheet |
| FRD-05: Portfolio Tracking | Entry point (EP-05) — Open Orders section swipe-left cancel quick action |

---

*End of FRD-19: Order Management — Edit Order & Cancel Order*
*Version 1.0 — 2026-05-29. Ready for Development.*

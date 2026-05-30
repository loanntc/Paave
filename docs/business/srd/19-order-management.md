# SRD-19: Order Management (Edit Order and Cancel Order)

**Version:** 1.0
**Date:** 2026-05-30
**Author:** BA Spec Writer — Paave Product Team
**Status:** Ready for Development
**Linked FRD:** `docs/business/frd/19-order-management.md`
**Linked BRD:** `docs/business/BRD.md` §BO-08 (paper trading as primary loop)
**Linked SRD:** `docs/business/SRD-order-engine-v2.3.md`, `docs/business/SRD.md`

---

## Table of Contents

1. [System Flow](#1-system-flow)
2. [Data Model and Handling Rules](#2-data-model-and-handling-rules)
3. [API Contracts](#3-api-contracts)
4. [Error Handling Matrix](#4-error-handling-matrix)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Related Documents](#6-related-documents)

---

## 1. System Flow

### 1.1 Edit Order (Price Modification)

```
1. Client receives user intent: user taps "Sửa lệnh" for an order where
   order_type = 'LO' AND status = 'PENDING'.
   The button is absent for all other combinations — no request is sent.

2. Client generates a new idempotency_key (UUID v4) for this edit attempt.
   A new idempotency_key is generated each time the user taps "Xác nhận sửa"
   (not when the edit sheet opens).

3. Client performs inline client-side validation on new_price:
   - V1: new_price is a positive integer > 0.
   - V2: new_price ≠ current limit_price.
   - V3: new_price % tick_size == 0, where tick_size is determined by new_price level:
       new_price ≥ 50,000 → tick_size = 100
       10,000 ≤ new_price < 50,000 → tick_size = 50
       new_price < 10,000 → tick_size = 10
   - V4: new_price ≤ ceiling_price (from symbol_quotes_latest, fetched when sheet opens).
   - V5: new_price ≥ floor_price (from symbol_quotes_latest, fetched when sheet opens).
   - V6 (BUY only): new_price ≤ current_market_price (last_price at time of sheet open).
   - V7 (SELL only): new_price ≥ current_market_price.
   - V8 (BUY only): net_available_balance ≥ quantity × new_price × 1.001
       where net_available_balance = total_cash − current_total_reserves + old_reserve_amount.
   All validations are UX only; the server re-runs all validations authoritatively.

4. If all client-side validations pass: user taps "Xác nhận sửa" → confirmation dialog appears.
   User taps "Xác nhận" in the dialog → client sends PATCH request.

5. PATCH /api/v1/paper-trading/orders/{order_id}/price
   Body: { "new_price": 47000, "idempotency_key": "550e8400-e29b-41d4-a716-446655440099" }

6. Server — Idempotency check (Step A):
   a. Compute Redis key: idem:edit:{user_id}:{idempotency_key}
   b. EXISTS in Redis → return HTTP 200 with cached new_order response. HALT. No DB operation.
   c. NOT EXISTS → proceed.

7. Server — Authorization (Step B):
   a. Decode user_id from JWT.
   b. SELECT vo.sub_account_id FROM virtual_orders vo
      JOIN sub_accounts sa ON sa.id = vo.sub_account_id
      WHERE vo.id = {order_id} AND sa.user_id = {user_id}.
      - Not found: HTTP 404, error_code = E-OM-001.
      - sub_account_id belongs to a different user: HTTP 403, error_code = E-OM-002.

8. Server — Pre-lock validation (Step C):
   a. Fetch order: SELECT * FROM virtual_orders WHERE id = {order_id}.
   b. Check order_type = 'LO': if not → HTTP 422, error_code = E-OM-004.
   c. Check status = 'PENDING': if not (PARTIAL, FILLED, etc.) → HTTP 409, error_code = E-OM-003.
   d. Check new_price ≠ order.price: if same → HTTP 422, error_code = E-OM-000.

9. Server — Price band and balance validation (Step D):
   a. Fetch current price data from symbol_quotes_latest:
      SELECT ceiling_price, floor_price, last_price, ref_price
      FROM symbol_quotes_latest WHERE symbol_code = order.symbol_code.
   b. Determine tick_size from new_price level (same rule as client V3).
   c. Validate new_price % tick_size == 0: if not → HTTP 422, error_code = E-OM-005.
   d. Validate new_price ≤ ceiling_price: if not → HTTP 422, error_code = E-OM-003.
   e. Validate new_price ≥ floor_price: if not → HTTP 422, error_code = E-OM-004.
   f. If side = 'BUY': validate new_price ≤ last_price: if not → HTTP 422, error_code = E-OM-006.
   g. If side = 'SELL': validate new_price ≥ last_price: if not → HTTP 422, error_code = E-OM-007.
   h. If side = 'BUY':
      Fetch virtual_balances for sub_account_id.
      Fetch old reserve: SELECT reserved_amount FROM order_reserves WHERE order_id = {order_id}.
      Compute net_available = total_balance − total_reserved + old_reserve.
      new_reserve = order.quantity × new_price × 1.001 (rounded to nearest integer).
      If net_available < new_reserve → HTTP 422, error_code = E-OM-008.

10. Server — Open order limit check (Step E):
    SELECT COUNT(*) FROM virtual_orders
    WHERE sub_account_id = {sub_account_id}
      AND status IN ('PENDING', 'ACCEPTED')
      AND id != {order_id}.
    (Subtract the order being edited; it will be cancelled and replaced in the same transaction.)
    If count ≥ 10 → HTTP 422, error_code = E-OM-009.

11. Server — Atomic transaction (Step F):
    BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    a. SELECT * FROM virtual_orders WHERE id = {order_id} FOR UPDATE;
       (Row-level lock acquired here.)
    b. Re-check status after acquiring lock (double-check pattern):
       - If status is now FILLED: ROLLBACK; return HTTP 409, error_code = E-OM-003,
         message = "Lệnh đã khớp, không thể sửa".
       - If status is now PARTIAL: ROLLBACK; return HTTP 409, error_code = E-OM-003,
         message = "Lệnh đã khớp một phần, không thể sửa. Vui lòng huỷ lệnh trước."
       - If status is still PENDING: proceed.

    c. UPDATE virtual_orders
       SET status = 'CANCELLED',
           cancel_reason = 'PRICE_MODIFIED',
           cancelled_at = NOW()
       WHERE id = {order_id};

    d. If side = 'BUY':
       DELETE FROM order_reserves WHERE order_id = {order_id};
       UPDATE virtual_balances
       SET reserved_amount = reserved_amount − old_reserve_amount,
           available_balance = available_balance + old_reserve_amount
       WHERE sub_account_id = {sub_account_id};

    e. If side = 'SELL':
       DELETE FROM holdings_soft_lock WHERE order_id = {order_id};

    f. INSERT INTO virtual_orders
       (id, sub_account_id, symbol_code, exchange, order_type, side,
        quantity, price, status, placed_at, expiry_at, ...)
       VALUES
       (generate_ulid(), {sub_account_id}, {old.symbol_code}, {old.exchange},
        'LO', {old.side}, {old.quantity}, {new_price}, 'PENDING', NOW(), {old.expiry_at}, ...);
       → new_order_id = newly inserted id.

    g. If side = 'BUY':
       INSERT INTO order_reserves (order_id, sub_account_id, reserved_amount)
       VALUES (new_order_id, {sub_account_id}, new_reserve);
       UPDATE virtual_balances
       SET reserved_amount = reserved_amount + new_reserve,
           available_balance = available_balance − new_reserve
       WHERE sub_account_id = {sub_account_id};

    h. If side = 'SELL':
       INSERT INTO holdings_soft_lock (order_id, sub_account_id, symbol_code, quantity)
       VALUES (new_order_id, {sub_account_id}, {old.symbol_code}, {old.quantity});

    COMMIT;

12. Server — Post-commit (Step G):
    a. Store in Redis: SET idem:edit:{user_id}:{idempotency_key} = {new_order_id} EX 300.
       (TTL = 5 minutes = 300 seconds.)
    b. Return HTTP 201 with new order response (see §3.1).

13. Client on HTTP 201:
    - Close edit bottom sheet.
    - Show success toast: "Giá lệnh đã được cập nhật" (3 seconds, auto-dismiss).
    - Refresh order list (re-fetch page 1 with current filters).
```

### 1.2 Cancel Order

```
1. Client receives user intent: user taps "Huỷ lệnh" (or "Huỷ lệnh (phần còn lại)")
   for an order where status IN ('PENDING', 'ACCEPTED', 'PARTIAL').
   The button is absent for all other statuses.

2. Cancel confirmation bottom sheet opens. User optionally enters a cancel reason (max 200 chars).
   User taps the destructive "Huỷ lệnh" button.

3. DELETE /api/v1/paper-trading/orders/{order_id}
   Body (optional): { "user_cancel_note": "optional reason up to 200 chars" }

4. Server — Authorization (Step A):
   a. Decode user_id from JWT.
   b. Validate order ownership: same check as Edit Step B.
      - Not found: HTTP 404, error_code = E-OM-001.
      - Wrong user: HTTP 403, error_code = E-OM-002.

5. Server — Pre-lock validation (Step B):
   a. Fetch order status.
   b. If status NOT IN ('PENDING', 'ACCEPTED', 'PARTIAL'):
      - Status = 'FILLED': HTTP 409, error_code = E-OM-010,
        message = "Lệnh đã khớp, không thể huỷ".
      - Status = 'CANCELLED': HTTP 200 (idempotent), return the cancelled order as-is.
      - Other terminal status (REJECTED, EXPIRED, FILL_FAILED): HTTP 409, error_code = E-OM-010,
        message = "Lệnh không thể huỷ — trạng thái hiện tại: {status_label_vi}".

6. Server — Input validation (Step C):
   If user_cancel_note length > 200: HTTP 422, error_code = E-OM-012,
   message = "Lý do huỷ không được vượt quá 200 ký tự."

7. Server — Atomic transaction (Step D):
   BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

   a. SELECT * FROM virtual_orders WHERE id = {order_id} FOR UPDATE;
      (Row-level lock acquired here.)
   b. Re-check status after acquiring lock (double-check pattern):
      - If status is now FILLED: ROLLBACK; return HTTP 409, error_code = E-OM-010,
        message = "Lệnh đã khớp, không thể huỷ".
      - If status is already CANCELLED: ROLLBACK; return HTTP 200 (idempotent).
      - If status is still PENDING, ACCEPTED, or PARTIAL: proceed.

   c. UPDATE virtual_orders
      SET status = 'CANCELLED',
          cancel_reason = 'USER_CANCEL',
          cancelled_at = NOW(),
          user_cancel_note = {user_cancel_note or NULL}
      WHERE id = {order_id};

   d. Compute reserve_release_amount:
      - If status was PENDING or ACCEPTED: reserve_release_amount = order.quantity × order.price × 1.001 (rounded to integer).
      - If status was PARTIAL: reserve_release_amount = (order.quantity − order.filled_quantity) × order.price × 1.001 (rounded to integer).

   e. If side = 'BUY':
      DELETE FROM order_reserves WHERE order_id = {order_id};
      UPDATE virtual_balances
      SET reserved_amount = reserved_amount − reserve_release_amount,
          available_balance = available_balance + reserve_release_amount
      WHERE sub_account_id = {sub_account_id};

   f. Compute soft_lock_release_quantity:
      - If status was PENDING or ACCEPTED: soft_lock_release_quantity = order.quantity.
      - If status was PARTIAL: soft_lock_release_quantity = order.quantity − order.filled_quantity.

   g. If side = 'SELL' AND order_type = 'LO':
      DELETE FROM holdings_soft_lock WHERE order_id = {order_id};
      (Releases soft_lock_release_quantity shares back to available holdings.)

   h. STOP parent-child cascade (STOP orders only):
      This path is taken if the order being cancelled is a STOP order (order_type = 'STOP'
      or 'STOP_LIMIT') AND the order has no child yet (trigger has not fired).
      If a child LO exists (trigger already fired): the parent is already in a terminal state
      and Step 5 above would have blocked the cancel. So this step only runs when no child exists.
      No cascade action needed in that case.

   COMMIT;

8. Server — Response (Step E):
   Return HTTP 200 with cancel response (see §3.3).

9. Client on HTTP 200:
   - Close cancel bottom sheet.
   - Show success toast:
     - Generic: "Lệnh đã được huỷ thành công" (3 seconds).
     - BUY with refund: "Lệnh đã được huỷ thành công ([reserve_released] ₫ đã được hoàn trả)" (3 seconds).
   - Refresh order list.
```

---

## 2. Data Model and Handling Rules

### 2.1 Tables Modified by Edit Order

| Table | Operation | Description |
|-------|-----------|-------------|
| `virtual_orders` | UPDATE | Set old order: `status = 'CANCELLED'`, `cancel_reason = 'PRICE_MODIFIED'`, `cancelled_at = NOW()` |
| `virtual_orders` | INSERT | Create new order with same symbol/side/quantity but new_price |
| `order_reserves` | DELETE | Remove reserve record for old order_id (BUY only) |
| `order_reserves` | INSERT | Create reserve record for new order_id (BUY only) |
| `virtual_balances` | UPDATE | Adjust `reserved_amount` and `available_balance` for delta (BUY only) |
| `holdings_soft_lock` | DELETE | Remove soft lock for old order_id (SELL LO only) |
| `holdings_soft_lock` | INSERT | Create soft lock for new order_id (SELL LO only) |

### 2.2 Tables Modified by Cancel Order

| Table | Operation | Description |
|-------|-----------|-------------|
| `virtual_orders` | UPDATE | Set `status = 'CANCELLED'`, `cancel_reason = 'USER_CANCEL'`, `cancelled_at`, `user_cancel_note` |
| `order_reserves` | DELETE | Remove reserve record (BUY orders only) |
| `virtual_balances` | UPDATE | Restore `reserved_amount` and `available_balance` (BUY orders only) |
| `holdings_soft_lock` | DELETE | Remove soft lock record (SELL LO orders only) |

### 2.3 Reserve Release Formula

| Scenario | Formula | Rounding |
|----------|---------|---------|
| Full cancel of PENDING BUY | `quantity × price × 1.001` | Round to nearest integer (VND) |
| Partial cancel of PARTIAL BUY | `(quantity − filled_quantity) × price × 1.001` | Round to nearest integer |
| Full cancel of PENDING SELL LO | No cash impact; release `quantity` shares from soft lock | Integer shares |
| Partial cancel of PARTIAL SELL LO | Release `(quantity − filled_quantity)` shares from soft lock | Integer shares |

The `filled_quantity` portion of a PARTIAL order is immutable — it has already been settled. Only the remaining unfilled quantity generates a reserve or soft-lock release.

### 2.4 Cancel Reason Values

| Value | Set by | Meaning |
|-------|--------|---------|
| `'USER_CANCEL'` | Cancel Order flow | User-initiated cancellation |
| `'PRICE_MODIFIED'` | Edit Order flow | Old order auto-cancelled as part of a price edit |
| `'SYSTEM_EXPIRE'` | Expiry cron | Order expired at end of trading day |
| `'FILL_FAILED'` | Fill daemon | Balance or holdings insufficient at fill time |

The `cancel_reason = 'PRICE_MODIFIED'` distinguishes edit-sourced cancellations from user-sourced ones. This affects Order History display — a CANCELLED order with `cancel_reason = 'PRICE_MODIFIED'` does NOT appear in Order History as a user cancellation; it is only visible as the predecessor of the new (edited) order.

### 2.5 Idempotency Key Rules

| Operation | Redis Key Pattern | TTL | Behavior on Hit |
|-----------|-----------------|-----|----------------|
| Edit Order (PATCH) | `idem:edit:{user_id}:{idempotency_key}` | 300 seconds (5 minutes) | Return HTTP 200 with original new_order response |

The idempotency key is scoped to the user (includes user_id) to prevent one user from interfering with another's idempotency space.

A new `idempotency_key` (UUID v4) is generated client-side on each tap of "Xác nhận sửa". If the user dismisses the confirmation dialog and re-opens the edit sheet, a new key is generated on the next "Xác nhận sửa" tap. This prevents false idempotency hits across independent edit attempts.

The Cancel Order operation does not use an idempotency key because the DELETE endpoint is naturally idempotent: a second cancel of an already-CANCELLED order returns HTTP 200 with the existing cancelled order.

### 2.6 New Order ID Generation (Edit)

The new order created during an edit receives a new `id` generated using ULID (Universally Unique Lexicographically Sortable Identifier). This ensures chronological sort order is preserved in the `virtual_orders` table. The old order_id is preserved in the `virtual_orders` table as the cancelled record; there is no foreign key link between old and new order IDs (the link is semantic, not structural).

### 2.7 Validation Logic Table

| Rule | Condition checked | Exact error string when violated |
|------|------------------|----------------------------------|
| V0 — Price required | `new_price` is absent, zero, or equal to current `limit_price` | `"Giá mới phải khác giá hiện tại"` |
| V1 — Positive integer | `new_price` is not a positive integer | `"Vui lòng nhập giá hợp lệ"` |
| V3 — Tick size (≥ 50,000) | `new_price % 100 != 0` when `new_price ≥ 50,000` | `"Giá phải là bội số của 100 VND. Gợi ý: {round_down} VND hoặc {round_up} VND?"` |
| V3 — Tick size (10k–50k) | `new_price % 50 != 0` when `10,000 ≤ new_price < 50,000` | `"Giá phải là bội số của 50 VND. Gợi ý: {round_down} VND hoặc {round_up} VND?"` |
| V3 — Tick size (< 10,000) | `new_price % 10 != 0` when `new_price < 10,000` | `"Giá phải là bội số của 10 VND. Gợi ý: {round_down} VND hoặc {round_up} VND?"` |
| V4 — Ceiling | `new_price > ceiling_price` | `"Giá vượt trần ngày hôm nay ({ceiling_price} VND) của {TICKER} trên {EXCHANGE}."` |
| V5 — Floor | `new_price < floor_price` | `"Giá thấp hơn sàn ngày hôm nay ({floor_price} VND) của {TICKER} trên {EXCHANGE}."` |
| V6 — BUY limit | `side = 'BUY'` AND `new_price > last_price` | `"Giá mua giới hạn ({new_price} VND) cao hơn giá thị trường hiện tại ({last_price} VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá thấp hơn {last_price} VND."` |
| V7 — SELL limit | `side = 'SELL'` AND `new_price < last_price` | `"Giá bán giới hạn ({new_price} VND) thấp hơn giá thị trường hiện tại ({last_price} VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá cao hơn {last_price} VND."` |
| V8 — Balance | BUY: `net_available_balance < quantity × new_price × 1.001` | `"Số dư không đủ để đặt cọc. Khả dụng: {avail_balance} VND. Cần đặt cọc: {required_reserve} VND."` |
| V9 — Open order limit | `pending_orders_after_edit ≥ 10` | `"Đã đạt giới hạn 10 lệnh đang mở. Huỷ một lệnh khác trước khi sửa lệnh này."` |
| C1 — Cancel note length | `user_cancel_note.length > 200` | `"Lý do huỷ không được vượt quá 200 ký tự."` |

All `{placeholder}` values in error strings are substituted with the actual values at runtime. Monetary values use VND format: period thousand separator, no decimals (e.g., `53.500`).

---

## 3. API Contracts

### 3.1 PATCH /api/v1/paper-trading/orders/{order_id}/price

**Purpose:** Modify the limit price of a PENDING LO order. Atomically cancels the old order and creates a new one.

**Authentication:** Required.

**Path Parameter:**

| Parameter | Type | Constraints |
|-----------|------|-------------|
| `order_id` | string | Valid order ULID; must belong to the authenticated user |

**Request Body:**

```json
{
  "new_price": 47000,
  "idempotency_key": "550e8400-e29b-41d4-a716-446655440099"
}
```

**Request Field Constraints:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `new_price` | integer | Yes | > 0; VND integer (no decimals for VN stocks) |
| `idempotency_key` | string (UUID v4) | Yes | Valid UUID v4 format; deduplicated per user within 5 minutes |

**Success Response — HTTP 201:**

```json
{
  "new_order_id": "ord_01HX2222AAAA",
  "old_order_id": "ord_01HX1111AAAA",
  "symbol_code": "VIC",
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
  "created_at": "2026-05-30T04:30:00Z"
}
```

**Idempotency hit — HTTP 200:**

Same shape as HTTP 201 response above. No second DB operation performed.

**Error Responses:**

| HTTP Status | `error_code` | Condition | Exact Message |
|-------------|-------------|-----------|---------------|
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 403 | `E-OM-002` | Order belongs to a different user | `"Không có quyền thao tác lệnh này"` |
| 404 | `E-OM-001` | Order ID not found | `"Lệnh không tồn tại"` |
| 409 | `E-OM-003` | Order status is not PENDING at time of PATCH (FILLED) | `"Lệnh đã khớp, không thể sửa"` |
| 409 | `E-OM-003` | Order status is PARTIAL at time of PATCH | `"Lệnh đã khớp một phần, không thể sửa. Vui lòng huỷ lệnh trước."` |
| 422 | `E-OM-000` | `new_price` absent, zero, or same as current price | `"Giá mới phải khác giá hiện tại"` |
| 422 | `E-OM-004` | Order type is not LO | `"Chỉ có thể sửa giá cho lệnh LO (Limit Order) đang chờ khớp."` |
| 422 | `E-OM-005` | `new_price` violates tick size | `"Giá phải là bội số của {tick_size} VND. Gợi ý: {round_down} VND hoặc {round_up} VND?"` |
| 422 | `E-OM-003` | `new_price` > ceiling_price | `"Giá vượt trần ngày hôm nay ({ceiling_price} VND) của {TICKER} trên {EXCHANGE}."` |
| 422 | `E-OM-004` | `new_price` < floor_price | `"Giá thấp hơn sàn ngày hôm nay ({floor_price} VND) của {TICKER} trên {EXCHANGE}."` |
| 422 | `E-OM-006` | BUY: `new_price` > current market price | `"Giá mua giới hạn ({new_price} VND) cao hơn giá thị trường hiện tại ({current_price} VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá thấp hơn {current_price} VND."` |
| 422 | `E-OM-007` | SELL: `new_price` < current market price | `"Giá bán giới hạn ({new_price} VND) thấp hơn giá thị trường hiện tại ({current_price} VND). Sử dụng lệnh MARKET để khớp ngay, hoặc nhập giá cao hơn {current_price} VND."` |
| 422 | `E-OM-008` | BUY: net available balance insufficient for new reserve | `"Số dư không đủ để đặt cọc. Khả dụng: {avail_balance} VND. Cần đặt cọc: {required_reserve} VND."` |
| 422 | `E-OM-009` | 10-order limit exceeded after edit | `"Đã đạt giới hạn 10 lệnh đang mở. Huỷ một lệnh khác trước khi sửa lệnh này."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

**Response for validation errors (HTTP 422) — full shape:**

```json
{
  "error_code": "E-OM-003",
  "message": "Giá vượt trần ngày hôm nay (53.500 VND) của VIC trên HOSE.",
  "new_price_submitted": 54000,
  "daily_ceiling": 53500,
  "reference_price": 50000
}
```

The `error_code` in the response body matches the table above. Additional context fields are included where specified (ceiling, floor, market price, required reserve, available balance).

---

### 3.2 DELETE /api/v1/paper-trading/orders/{order_id}

**Purpose:** Cancel an open order. Releases reserved cash (BUY) or soft-locked holdings (SELL LO) atomically.

**Authentication:** Required.

**Path Parameter:**

| Parameter | Type | Constraints |
|-----------|------|-------------|
| `order_id` | string | Valid order ULID; must belong to the authenticated user |

**Request Body (optional):**

```json
{
  "user_cancel_note": "Muốn đặt lại ở giá khác"
}
```

**Request Field Constraints:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `user_cancel_note` | string | No | Max 200 characters; stored in `virtual_orders.user_cancel_note`; not returned in list responses |

**Success Response — HTTP 200 (full cancel of PENDING/ACCEPTED BUY order):**

```json
{
  "order_id": "ord_01HX1111AAAA",
  "status": "CANCELLED",
  "cancel_reason": "USER_CANCEL",
  "reserve_released": 4504500,
  "soft_lock_released_quantity": null,
  "cancelled_at": "2026-05-30T05:00:00Z"
}
```

**Success Response — HTTP 200 (partial cancel of PARTIAL BUY order):**

```json
{
  "order_id": "ord_01HX1111BBBB",
  "status": "CANCELLED",
  "cancel_reason": "USER_CANCEL",
  "filled_quantity": 100,
  "remaining_quantity_cancelled": 100,
  "reserve_released": 5005000,
  "soft_lock_released_quantity": null,
  "cancelled_at": "2026-05-30T05:01:00Z"
}
```

**Success Response — HTTP 200 (cancel of SELL LO order):**

```json
{
  "order_id": "ord_01HX1111CCCC",
  "status": "CANCELLED",
  "cancel_reason": "USER_CANCEL",
  "reserve_released": 0,
  "soft_lock_released_quantity": 100,
  "cancelled_at": "2026-05-30T05:02:00Z"
}
```

**Idempotent case — already CANCELLED — HTTP 200:**

```json
{
  "order_id": "ord_01HX1111AAAA",
  "status": "CANCELLED",
  "cancel_reason": "USER_CANCEL",
  "reserve_released": 0,
  "soft_lock_released_quantity": null,
  "cancelled_at": "2026-05-30T04:58:00Z"
}
```

**Error Responses:**

| HTTP Status | `error_code` | Condition | Exact Message |
|-------------|-------------|-----------|---------------|
| 401 | `E-AUTH-001` | Missing or expired access token | `"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."` |
| 403 | `E-OM-002` | Order belongs to a different user | `"Không có quyền thao tác lệnh này"` |
| 404 | `E-OM-001` | Order ID not found | `"Lệnh không tồn tại"` |
| 409 | `E-OM-010` | Order is FILLED (race condition) | `"Lệnh đã khớp, không thể huỷ"` |
| 409 | `E-OM-010` | Order is in another terminal non-cancellable state | `"Lệnh không thể huỷ — trạng thái hiện tại: {status_label_vi}"` |
| 422 | `E-OM-012` | `user_cancel_note` exceeds 200 characters | `"Lý do huỷ không được vượt quá 200 ký tự."` |
| 500 | `E-SYS-001` | Unexpected server error | `"Lỗi hệ thống, vui lòng thử lại."` |

**Vietnamese status labels for `E-OM-010` messages:**

| `current_status` | Vietnamese label used in error message |
|-----------------|----------------------------------------|
| `FILLED` | "Đã khớp" |
| `CANCELLED` | "Đã huỷ" |
| `REJECTED` | "Bị từ chối" |
| `EXPIRED` | "Đã hết hạn" |
| `FILL_FAILED` | "Khớp lệnh thất bại" |

---

## 4. Error Handling Matrix

| Scenario | HTTP Status | `error_code` | User-Facing Message | Client Action |
|----------|-------------|-------------|---------------------|---------------|
| Order not found | 404 | `E-OM-001` | "Lệnh không tồn tại" | Toast; close sheet; refresh order list |
| Order owned by different user | 403 | `E-OM-002` | "Không có quyền thao tác lệnh này" | Toast; close sheet |
| Edit: order already FILLED (race condition) | 409 | `E-OM-003` | "Lệnh đã khớp, không thể sửa" | Toast (red, 3s); close edit sheet; refresh order list showing FILLED |
| Edit: order already PARTIAL (race condition) | 409 | `E-OM-003` | "Lệnh đã khớp một phần, không thể sửa. Vui lòng huỷ lệnh trước." | Toast (red, 4s); close edit sheet; refresh |
| Edit: order not LO type | 422 | `E-OM-004` | "Chỉ có thể sửa giá cho lệnh LO (Limit Order) đang chờ khớp." | Toast; close sheet (should not occur if button visibility rules are correct) |
| Edit: ceiling violation | 422 | `E-OM-003` | "Giá vượt trần ngày hôm nay ({ceiling} VND) của {TICKER} trên {EXCHANGE}." | Inline error on price input; sheet stays open; "Xác nhận sửa" disabled |
| Edit: floor violation | 422 | `E-OM-004` | "Giá thấp hơn sàn ngày hôm nay ({floor} VND) của {TICKER} trên {EXCHANGE}." | Inline error on price input; sheet stays open |
| Edit: tick size violation | 422 | `E-OM-005` | "Giá phải là bội số của {tick_size} VND. Gợi ý: {round_down} VND hoặc {round_up} VND?" | Inline error; sheet stays open |
| Edit: BUY price above market | 422 | `E-OM-006` | "Giá mua giới hạn ({new_price} VND) cao hơn giá thị trường hiện tại ({current_price} VND)..." | Inline error; sheet stays open |
| Edit: SELL price below market | 422 | `E-OM-007` | "Giá bán giới hạn ({new_price} VND) thấp hơn giá thị trường hiện tại ({current_price} VND)..." | Inline error; sheet stays open |
| Edit: insufficient balance | 422 | `E-OM-008` | "Số dư không đủ để đặt cọc. Khả dụng: {avail} VND. Cần đặt cọc: {required} VND." | Inline error; sheet stays open |
| Edit: 10-order limit | 422 | `E-OM-009` | "Đã đạt giới hạn 10 lệnh đang mở. Huỷ một lệnh khác trước khi sửa lệnh này." | Toast (red, 3s); sheet stays open |
| Edit: idempotency hit | 200 | — | (no toast — transparent) | Return original new order response to UI; UI updates as if HTTP 201 |
| Edit: network error / 5xx | 503 | `E-SYS-001` | "Không thể kết nối. Vui lòng thử lại." | Toast (red, 3s); sheet stays open; buttons re-enabled |
| Cancel: order already FILLED (race condition) | 409 | `E-OM-010` | "Lệnh đã khớp, không thể huỷ" | Toast (red, 3s); close sheet; refresh order list showing FILLED |
| Cancel: other terminal status | 409 | `E-OM-010` | "Lệnh không thể huỷ — trạng thái hiện tại: {status_label_vi}" | Toast (red, 3s); close sheet; refresh |
| Cancel: already cancelled (duplicate tap) | 200 | — | "Lệnh đã được huỷ trước đó." | Toast (neutral, 3s); close sheet; refresh |
| Cancel: note too long | 422 | `E-OM-012` | "Lý do huỷ không được vượt quá 200 ký tự." | Inline error below text area; "Huỷ lệnh" button disabled |
| Cancel: network error / 5xx | 503 | `E-SYS-001` | "Không thể kết nối. Vui lòng thử lại." | Toast (red, 3s); sheet stays open; buttons re-enabled |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Operation | Target p95 | Maximum p99 |
|-----------|-----------|-------------|
| PATCH /api/v1/paper-trading/orders/{id}/price | < 500ms | < 1000ms |
| DELETE /api/v1/paper-trading/orders/{id} | < 300ms | < 600ms |

Both endpoints involve DB transactions with row-level locks. The p95 targets account for lock contention during peak market hours (09:00–11:30, 13:00–15:00 ICT). If p95 exceeds 500ms under load, investigate lock wait times and consider optimistic locking for the pre-lock validation step (Steps C and D), reserving the `SELECT FOR UPDATE` for the critical transaction step only.

### 5.2 Concurrency and Locking

- Both PATCH and DELETE acquire a row-level lock (`SELECT FOR UPDATE`) on the `virtual_orders` row before modifying it.
- This lock prevents the fill daemon and the user-triggered operation from both committing on the same order row.
- Transaction isolation level: `SERIALIZABLE`. This is stricter than `READ COMMITTED` but necessary to prevent phantom reads in the balance and reserve checks.
- If a lock wait exceeds 3 seconds: the transaction is rolled back and the server returns HTTP 503.

### 5.3 Atomicity Requirements

Both operations are fully atomic. No partial completion is acceptable:

| Failure scenario | Expected outcome |
|-----------------|-----------------|
| DB transaction commits but Redis idempotency write fails | Retry writing to Redis (3 attempts); if all fail, log an error. The operation succeeded — the client receives HTTP 201 / HTTP 200 as normal. The idempotency key simply won't be stored; a duplicate request within 5 minutes will re-execute (acceptable edge case). |
| DB transaction starts but connection is lost before commit | PostgreSQL rolls back automatically. Client receives HTTP 503. The order remains in its original state. |
| INSERT of new order succeeds but DELETE of old reserve fails (within transaction) | Transaction rolls back entirely. Both the INSERT and the reserve DELETE are rolled back. Order state unchanged. |

No balance or holdings mutation occurs outside a DB transaction. These invariants must be enforced at the DB layer (not just application layer) through transaction management.

### 5.4 Audit Log

Every cancel or edit operation generates an audit log entry:

```json
{
  "event_type": "ORDER_EDITED",
  "user_id": "usr_01HX0000AAAA",
  "sub_account_id": "sa_01HX1111AAAA",
  "old_order_id": "ord_01HX1111AAAA",
  "new_order_id": "ord_01HX2222AAAA",
  "old_price": 48000,
  "new_price": 47000,
  "timestamp": "2026-05-30T04:30:00Z",
  "ip_address": "...",
  "user_agent": "..."
}
```

```json
{
  "event_type": "ORDER_CANCELLED",
  "user_id": "usr_01HX0000AAAA",
  "sub_account_id": "sa_01HX1111AAAA",
  "order_id": "ord_01HX1111AAAA",
  "cancel_reason": "USER_CANCEL",
  "reserve_released": 4504500,
  "timestamp": "2026-05-30T05:00:00Z",
  "ip_address": "...",
  "user_agent": "..."
}
```

Audit log entries are written within the same DB transaction (to a separate `audit_log` table or append-only log table). If the audit log write fails, the entire transaction rolls back.

### 5.5 Security

- Cross-user access to any order returns HTTP 403. The server validates `sub_account_id` ownership on every request, derived entirely from the JWT. The client MUST NOT pass `sub_account_id` or `user_id` in the request body.
- Cross-user order access attempts are logged with `user_id` and `order_id` for security review.
- The `user_cancel_note` field is free text. Before storing, server must verify the length constraint (≤ 200 chars). Before rendering in the client, the text must be treated as untrusted input and sanitized against XSS.
- Rate limit: 10 PATCH/DELETE requests per user per minute. Exceeding returns HTTP 429.

### 5.6 Database Indexes Required

| Table | Index | Purpose |
|-------|-------|---------|
| `virtual_orders` | `(id)` PRIMARY KEY | Row lock lookup |
| `virtual_orders` | `(sub_account_id, status)` | Pending order count for 10-order limit check |
| `order_reserves` | `(order_id)` UNIQUE | Reserve lookup and deletion |
| `holdings_soft_lock` | `(order_id)` UNIQUE | Soft lock lookup and deletion |
| `virtual_balances` | `(sub_account_id)` UNIQUE | Balance update |

---

## 6. Related Documents

| Document | Path | Relationship |
|----------|------|-------------|
| FRD-19: Order Management | `docs/business/frd/19-order-management.md` | Parent FRD; full functional requirements, acceptance criteria, edge cases, design requirements |
| SRD-order-engine-v2.3.md | `docs/business/SRD-order-engine-v2.3.md` | Authoritative schema for `virtual_orders`, `order_reserves`, `holdings_soft_lock`, `virtual_balances`; fill daemon rules; idempotency patterns |
| FRD-10: Paper Trading Engine | `docs/business/frd/10-paper-trading.md` | Order state machine (FR-PT-08); business rules BR-PT-01 through BR-PT-20 |
| FRD-18: Order History | `docs/business/frd/18-order-history-orderbook.md` | Primary entry point for Edit/Cancel flows; order display rules |
| SRD-18: Order History and Orderbook | `docs/business/srd/18-order-history-orderbook.md` | Companion SRD; order status filter mapping; order detail response shape |
| BRD.md §BO-08 | `docs/business/BRD.md` | Business objective: paper trading as primary engagement loop |

---

*Owner: Paave Product Team | Version: 1.0 — 2026-05-30*

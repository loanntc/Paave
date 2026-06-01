# Flow C — Portfolio Reset

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
| Flow ID | FLOW-C |
| Feature Reference | Portfolio / Virtual Trading Dashboard — Portfolio Reset |
| Actor | F0 trader (age 16–27) — typically after large losses, FOMO trading, or wanting a fresh start |
| Trigger | (A) Settings gear icon on Portfolio Dashboard header; (B) Profile menu → "Đặt lại danh mục ảo" |
| Entry State | User authenticated; virtual account has existing positions and/or order history |
| Exit States | (A) Reset successful: clean 500M VND dashboard; (B) Reset cancelled: no changes; (C) Reset failed: FC-PT-05-A/B/C error handling |
| Primary APIs | POST /virtual/accounts (reset endpoint or re-init), DELETE /virtual/equity/orders/{orderId} (bulk cancel) |
| Side Effects | All open orders cancelled; all positions force-closed at last snapshot; history retained with [Pre-Reset] label; 500M VND restored; AI coaching event may trigger |

---

## 2. Business Flow

### Main Reset Flow

```
┌────────────────────────────────────────────────────────────────┐
│  ENTRY POINTS                                                 │
│  A) Settings gear icon (⚙) on Portfolio Dashboard header     │
│  B) Profile tab → "Đặt lại danh mục ảo" menu item           │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│  SETTINGS / CONFIRMATION GATEWAY                              │
│  "Bạn muốn đặt lại danh mục ảo?"                            │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│  DIALOG STEP 1 — First Warning                                │
│  "Đặt lại danh mục ảo"                                       │
│                                                               │
│  Toàn bộ danh mục hiện tại sẽ bị xóa:                       │
│  • Tất cả vị thế sẽ bị đóng                                  │
│  • Tất cả lệnh chờ sẽ bị hủy                                 │
│  • Số dư sẽ được khôi phục về 500.000.000 VND                │
│  • Lịch sử giao dịch vẫn được lưu lại (gắn nhãn [Pre-Reset])│
│                                                               │
│  [ Hủy ]                        [ Tiếp tục ]                │
└────────────────────────────┬───────────────────────────────────┘
                             │ Tap "Tiếp tục"
                             ▼
┌────────────────────────────────────────────────────────────────┐
│  DIALOG STEP 2 — Final Confirmation                           │
│  "Xác nhận đặt lại danh mục ảo"                             │
│                                                               │
│  Hành động này KHÔNG THỂ hoàn tác.                          │
│                                                               │
│  Sau khi xác nhận:                                           │
│  ✓ [N] vị thế sẽ bị đóng tại giá cuối                      │
│  ✓ [M] lệnh chờ sẽ bị hủy                                   │
│  ✓ Số dư mới: 500.000.000 VND                                │
│                                                               │
│  Gõ "ĐẶT LẠI" để xác nhận:                                  │
│  ┌──────────────────────────────────┐                        │
│  │                                  │                        │
│  └──────────────────────────────────┘                        │
│                                                               │
│  [ Quay lại ]               [ Xác nhận đặt lại ]            │
│                              (disabled until "ĐẶT LẠI"      │
│                               is typed correctly)            │
└────────────────────────────┬───────────────────────────────────┘
                             │ Tap "Xác nhận đặt lại"
                             ▼
                     SYSTEM PROCESSING
                             │
            ┌────────────────┼────────────────────┐
            │                │                    │
            ▼                ▼                    ▼
   Cancel all          Close all            Restore
   PENDING /           positions at         500M VND
   QUEUED /            last snapshot        balance
   SUSPENDED           price
   orders
            │                │                    │
            └────────────────┴────────────────────┘
                             │
                             ▼
                  Tag history as [Pre-Reset]
                             │
                             ▼
                  Check for FOMO/panic patterns
                             │
                    ┌────────┴────────┐
                    │ Pattern found?  │
                    └────────┬────────┘
                             │
               ┌─────────────┴─────────────┐
               │ YES                       │ NO
               ▼                           ▼
   Trigger AI coaching          Proceed to Post-Reset
   event (soft banner +         Dashboard directly
   optional Learning Path
   recommendation)
               │
               ▼
   Post-Reset Dashboard
   (after user dismisses banner)
```

---

### Failure Case Flows

```
┌────────────────────────────────────────────────────────────────┐
│  FAILURE CASE FC-PT-05-A                                      │
│  Partial failure: some orders cancelled but positions         │
│  could not be closed                                          │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
        Toast (persistent): "Không thể đóng một số vị thế"
                             │
                             ▼
        Show which positions failed with retry option
                             │
                    ┌────────┴────────┐
                    │  Retry?         │
                    └────────┬────────┘
                             │
               ┌─────────────┴─────────────┐
               │ YES                       │ NO
               ▼                           ▼
       Retry closing            Rollback: restore all
       failed positions         positions; un-cancel
                                re-queued orders;
                                show error: "Đặt lại
                                không thành công —
                                danh mục của bạn
                                không thay đổi"

┌────────────────────────────────────────────────────────────────┐
│  FAILURE CASE FC-PT-05-B                                      │
│  Network failure during reset processing                      │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
        Error toast: "Mất kết nối trong quá trình đặt lại"
                             │
                             ▼
        System detects partial state on next load:
        Show warning banner:
        "Danh mục của bạn có thể đang trong trạng thái
         không nhất quán — liên hệ hỗ trợ hoặc thử lại"
                             │
                             ▼
        [Thử lại đặt lại]   [Liên hệ hỗ trợ]

┌────────────────────────────────────────────────────────────────┐
│  FAILURE CASE FC-PT-05-C                                      │
│  Balance restoration failed (500M not credited)               │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
        Error toast: "Không thể khôi phục số dư"
                             │
                             ▼
        Positions and orders may be cleared but balance
        not restored → show prominent error banner:
        "Số dư chưa được khôi phục — vui lòng liên hệ
         hỗ trợ ngay"
                             │
                             ▼
        Block further trading until balance is confirmed
        Show support contact button
```

---

### Post-Reset State

```
┌────────────────────────────────────────────────────────────────┐
│  POST-RESET PORTFOLIO DASHBOARD                               │
│                                                               │
│  Section 1: 500,000,000 VND (fresh balance)                  │
│             Tiền ảo badge                                     │
│                                                               │
│  Section 2: 500,000,000 VND available (no reserves)          │
│                                                               │
│  Section 3: "Bạn chưa có cổ phiếu nào" (empty state)        │
│                                                               │
│  Section 4: Chart shows [R] marker at reset point;           │
│             Line restarts from 500M baseline                  │
│                                                               │
│  Section 5: Realized P&L = 0 (current period only)          │
│             (pre-reset P&L accessible via history)            │
│                                                               │
│  Section 6: Trade History shows [Pre-Reset] entries          │
│             with divider: "── Trước khi đặt lại ──"          │
│             New trades will appear above the divider          │
│                                                               │
│  Section 7: Empty (no open orders)                           │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Screen Sections Spec

### 3.1 Entry Points

**Entry A — Settings gear icon:**
```
┌──────────────────────────────────────────┐
│  ← Danh Mục                  [⚙] Tiền ảo│  ← Gear icon in header
└──────────────────────────────────────────┘
  Tap ⚙ → Settings bottom sheet or screen
  → Shows "Đặt lại danh mục ảo" option
```

**Entry B — Profile menu:**
```
Profile tab → Settings section:
┌──────────────────────────────────────────┐
│  ⚙  Cài đặt                             │
│  ─────────────────────────────────────  │
│  🔄  Đặt lại danh mục ảo            →   │  ← Tappable row
└──────────────────────────────────────────┘
```

### 3.2 Dialog Step 1 — "Đặt lại danh mục ảo"

**Exact copy:**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Đặt lại danh mục ảo                           │
│  ─────────────────────────────────────────────  │
│                                                  │
│  Toàn bộ danh mục hiện tại của bạn sẽ bị       │
│  xóa và bắt đầu lại từ đầu:                     │
│                                                  │
│  🔴 Tất cả vị thế sẽ bị đóng tại giá           │
│     snapshot gần nhất                           │
│                                                  │
│  🔴 Tất cả lệnh đang chờ sẽ bị hủy             │
│                                                  │
│  🟢 Số dư sẽ được khôi phục về                 │
│     500.000.000 VND (tiền ảo)                   │
│                                                  │
│  ℹ  Lịch sử giao dịch vẫn được lưu lại         │
│     và được gắn nhãn [Pre-Reset]                │
│                                                  │
│  ──────────────────────────────────────────────  │
│                                                  │
│  [ Hủy ]                    [ Tiếp tục → ]     │
│                                                  │
└──────────────────────────────────────────────────┘
```

- "Hủy": dismisses dialog; no action taken
- "Tiếp tục →": opens Dialog Step 2
- Background dimming: 60% opacity overlay
- Dialog cannot be dismissed by tapping outside (intentional friction)

### 3.3 Dialog Step 2 — "Xác nhận đặt lại danh mục ảo"

**Exact copy:**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ⚠ Xác nhận đặt lại danh mục ảo               │
│  ─────────────────────────────────────────────  │
│                                                  │
│  Hành động này KHÔNG THỂ hoàn tác.             │
│                                                  │
│  Sau khi xác nhận, hệ thống sẽ:                │
│                                                  │
│  ✓ Đóng [N] vị thế tại giá snapshot cuối       │
│  ✓ Hủy [M] lệnh đang chờ                       │
│  ✓ Khôi phục số dư về 500.000.000 VND          │
│  ✓ Lưu lịch sử dưới nhãn [Pre-Reset]           │
│                                                  │
│  Để xác nhận, gõ "ĐẶT LẠI" vào ô bên dưới:   │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [ ← Quay lại ]        [ Xác nhận đặt lại ]    │
│                          (grayed until typed)    │
│                                                  │
└──────────────────────────────────────────────────┘
```

- "← Quay lại": returns to Dialog Step 1
- Text input is case-sensitive: must match "ĐẶT LẠI" exactly
- "Xác nhận đặt lại" button activates only when text matches exactly
- Input field has auto-caps enabled; displays in uppercase automatically
- [N] and [M] are dynamically populated from the current account state

### 3.4 Processing Screen

```
┌──────────────────────────────────────────────────┐
│                                                  │
│              Đang đặt lại...                    │
│                                                  │
│         [━━━━━━━━━━━━━━━━━━░░░░░░]              │
│                                                  │
│  ✓ Đang hủy [M] lệnh chờ...                    │
│  ✓ Đang đóng [N] vị thế...                     │
│  ○ Đang khôi phục số dư...                     │
│                                                  │
│  Vui lòng không tắt ứng dụng                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

- Progress bar with step indicators
- Step icons: ✓ (completed), ⏳ (in progress), ○ (pending)
- Warning text prevents app closure
- Cannot be dismissed or navigated away from during processing

### 3.5 AI Coaching Banner (Post-Reset, if triggered)

```
┌──────────────────────────────────────────────────┐
│  🤖 Paave AI                                    │
│  ─────────────────────────────────────────────  │
│  Bạn vừa đặt lại danh mục. Chúng tôi nhận      │
│  thấy một số giao dịch có thể xuất phát từ      │
│  cảm xúc (FOMO/panic selling).                  │
│                                                  │
│  Muốn học cách giao dịch bình tĩnh hơn?         │
│                                                  │
│  [ Bắt đầu học ngay ]    [ Để sau ]            │
└──────────────────────────────────────────────────┘
```

Trigger conditions (FOMO/panic pattern detection examples):
- 3+ orders placed within 5 minutes followed by reset
- Selling all positions at a loss within 1 trading day
- Reset within 7 days of previous reset

---

## 4. Acceptance Criteria

**AC-C-01**
- Given: User is on the Portfolio Dashboard
- When: User taps the Settings gear icon (⚙) in the header
- Then: A settings menu or screen appears with "Đặt lại danh mục ảo" as a visible option

**AC-C-02**
- Given: User taps "Đặt lại danh mục ảo" from any entry point
- When: Dialog Step 1 appears
- Then: The dialog shows the exact copy specified in Section 3.2; tapping outside the dialog does NOT dismiss it; tapping "Hủy" closes the dialog with no changes

**AC-C-03**
- Given: Dialog Step 1 is displayed
- When: User taps "Tiếp tục"
- Then: Dialog Step 2 appears; the confirmation text input is empty; the "Xác nhận đặt lại" button is grayed/disabled

**AC-C-04**
- Given: Dialog Step 2 is displayed
- When: User types "ĐẶT LẠI" (exact match, uppercase) into the text field
- Then: The "Xác nhận đặt lại" button becomes active/enabled

**AC-C-05**
- Given: Dialog Step 2 text field contains "đặt lại" (lowercase)
- When: User taps "Xác nhận đặt lại"
- Then: Button remains disabled; confirmation does not proceed (case-sensitive check)

**AC-C-06**
- Given: User confirms reset with correct text
- When: Reset processing completes successfully
- Then: (1) All PENDING/QUEUED_AFTER_HOURS/SUSPENDED orders are cancelled; (2) All holdings are closed at last snapshot price; (3) Available balance shows 500,000,000 VND; (4) Portfolio Dashboard shows empty holdings and empty open orders; (5) Trade history retains all prior entries labeled [Pre-Reset]

**AC-C-07**
- Given: A successful reset has occurred
- When: User views the Portfolio Value Chart (Section 4)
- Then: A [R] reset marker appears at the exact date/time of the reset on all time range tabs where the reset falls within the displayed period

**AC-C-08**
- Given: A successful reset has occurred
- When: User views Trade History (Section 6)
- Then: All pre-reset trades show the [Pre-Reset] badge; a section divider "── Trước khi đặt lại ──" separates pre- and post-reset trades; pre-reset trades are accessible and readable

**AC-C-09**
- Given: Dialog Step 2 is displayed with N=3 positions and M=2 pending orders
- When: User reviews the dialog
- Then: The dialog dynamically shows "Đóng 3 vị thế" and "Hủy 2 lệnh đang chờ" with the correct counts

**AC-C-10**
- Given: FOMO/panic pattern detected (e.g., user placed 5+ orders in 10 minutes then reset)
- When: Reset completes successfully
- Then: AI coaching banner appears on the post-reset dashboard; user can tap "Bắt đầu học ngay" to navigate to the Learning Path, or "Để sau" to dismiss

**AC-C-11**
- Given: Reset fails mid-process (FC-PT-05-A: positions could not be closed)
- When: Error is detected
- Then: Persistent error toast shown; user offered retry option; if retry is declined, a rollback restores the original state; no partial reset state is left

**AC-C-12**
- Given: User is on Dialog Step 2
- When: User taps "← Quay lại"
- Then: User is returned to Dialog Step 1 with no changes; the "ĐẶT LẠI" input field is cleared

---

## 5. Design Analysis

### Wireframe: Dialog Step 1

```
┌──────────────────────────────────────────────────────┐
│  ████████████████████ DIM OVERLAY ████████████████  │
│                                                      │
│   ┌──────────────────────────────────────────────┐  │
│   │  Đặt lại danh mục ảo                        │  │
│   │  ──────────────────────────────────────────  │  │
│   │                                              │  │
│   │  Toàn bộ danh mục hiện tại sẽ bị xóa:      │  │
│   │                                              │  │
│   │  🔴 Tất cả vị thế bị đóng                  │  │
│   │  🔴 Tất cả lệnh chờ bị hủy                 │  │
│   │  🟢 Số dư → 500.000.000 VND                │  │
│   │  ℹ  Lịch sử vẫn lưu [Pre-Reset]            │  │
│   │                                              │  │
│   │  ──────────────────────────────────────────  │  │
│   │  [ Hủy ]           [ Tiếp tục → ]          │  │
│   └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Wireframe: Dialog Step 2

```
┌──────────────────────────────────────────────────────┐
│  ████████████████████ DIM OVERLAY ████████████████  │
│                                                      │
│   ┌──────────────────────────────────────────────┐  │
│   │  ⚠ Xác nhận đặt lại danh mục ảo           │  │
│   │  ──────────────────────────────────────────  │  │
│   │                                              │  │
│   │  Hành động này KHÔNG THỂ hoàn tác.         │  │
│   │                                              │  │
│   │  ✓ Đóng 3 vị thế (giá snapshot cuối)       │  │
│   │  ✓ Hủy 2 lệnh đang chờ                     │  │
│   │  ✓ Khôi phục số dư: 500.000.000 VND        │  │
│   │  ✓ Lưu lịch sử: [Pre-Reset]                │  │
│   │                                              │  │
│   │  Gõ "ĐẶT LẠI" để xác nhận:                │  │
│   │  ┌──────────────────────────────────────┐   │  │
│   │  │                                      │   │  │
│   │  └──────────────────────────────────────┘   │  │
│   │                                              │  │
│   │  [ ← Quay lại ]  [ Xác nhận đặt lại ]      │  │
│   │                    (disabled until typed)    │  │
│   └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Wireframe: Post-Reset Dashboard

```
┌──────────────────────────────────────────────────────┐
│  ←  Danh Mục                         [⚙] Tiền ảo   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  🤖 Paave AI                                 │   │  ← AI Banner
│  │  Bạn vừa đặt lại. Muốn học cách giao dịch  │   │  (if triggered)
│  │  hiệu quả hơn?                              │   │
│  │  [ Bắt đầu ]          [ Để sau ]           │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Tổng Giá Trị Danh Mục                             │
│  500.000.000 VND               ● Tiền ảo            │
│  (Chưa có thay đổi hôm nay)                        │
├──────────────────────────────────────────────────────┤
│  Số Dư Khả Dụng: 500.000.000 VND                   │
├──────────────────────────────────────────────────────┤
│  Cổ Phiếu Đang Nắm Giữ                             │
│  ┌──────────────────────────────────────────────┐   │
│  │  Bạn chưa có cổ phiếu nào                  │   │
│  │  Bắt đầu giao dịch với tiền ảo             │   │
│  └──────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────┤
│  Biểu Đồ  [1D][1W][1M][3M][1Y]                     │
│  ┌──────────────────────────────┐                    │
│  │         [R] reset marker     │                    │
│  │   ─ ─ ─ ─ 500M baseline ─ ─ │                    │
│  └──────────────────────────────┘                    │
├──────────────────────────────────────────────────────┤
│  Lịch Sử Giao Dịch                                  │
│  ── Trước khi đặt lại ──                            │
│  [Pre-Reset] VNM · Mua · 500 CP · 22,000 VND        │
│  [Pre-Reset] HPG · Bán · 200 CP · 41,000 VND        │
└──────────────────────────────────────────────────────┘
```

### Component Usage

| UI Element | Component | Notes |
|-----------|-----------|-------|
| Entry A (gear icon) | IconButton in AppBar | Standard settings icon |
| Entry B (profile menu) | ListTile with destructive color | Red text to signal caution |
| Dialog Step 1 | AlertDialog (non-dismissible) | Cannot tap outside to close |
| Dialog Step 2 | AlertDialog + TextInput | Confirm button gated on text match |
| Text input "ĐẶT LẠI" | TextField with auto-caps | Case-sensitive validation |
| Processing screen | FullscreenLoader with step list | Cannot be dismissed |
| AI coaching banner | InformationBanner | Dismissible; persists until tapped |
| [Pre-Reset] badge | StatusChip (gray) | In Trade History rows |
| Section divider | DividerWithLabel | Text: "── Trước khi đặt lại ──" |
| [R] chart marker | ChartMarker (vertical line) | Orange or distinct color |

### Interaction Rules

1. Dialog cannot be dismissed by hardware back button (Android) during Step 2 — pressing back returns to Step 1
2. Text input auto-capitalizes; still validates against exact string "ĐẶT LẠI"
3. Processing screen blocks all navigation; hardware back is disabled
4. AI coaching banner stacks above Section 1; does not shift content below
5. [Pre-Reset] badge is non-interactive (no tap action)
6. [R] reset marker on chart is tappable; tooltip shows reset date/time

---

## 6. Edge Cases

| ID | Scenario | Handling |
|----|----------|----------|
| EC-C-01 | User resets with no holdings and no open orders | Allowed; dialog dynamically shows "0 vị thế, 0 lệnh chờ"; still resets balance to 500M |
| EC-C-02 | User resets during market open hours | Positions closed at last 15s snapshot price (not real-time; minor slippage is expected behavior) |
| EC-C-03 | User resets while a SUSPENDED order exists | Suspended order is cancelled as part of reset; no special handling needed |
| EC-C-04 | User resets immediately after previous reset | Allowed; history shows two [Pre-Reset] periods; chart shows two [R] markers |
| EC-C-05 | Network loss at Dialog Step 1 or 2 (before submission) | No impact; dialog stays open; no API called yet |
| EC-C-06 | FC-PT-05-A: Partial failure — positions not closed | Error toast; retry option; rollback if declined (see Section 2) |
| EC-C-07 | FC-PT-05-B: Network failure during processing | Error toast; inconsistency warning on next load; retry/support options |
| EC-C-08 | FC-PT-05-C: Balance not restored | Prominent persistent error banner; trading blocked; support contact shown |
| EC-C-09 | User types "Đặt lại" (mixed case) instead of "ĐẶT LẠI" | Confirm button remains disabled; inline hint: 'Vui lòng gõ "ĐẶT LẠI" (chữ hoa)' |
| EC-C-10 | User pastes text into the confirmation field | Pasting is allowed; validation still applies; if pasted text = "ĐẶT LẠI" → button activates |
| EC-C-11 | AI coaching banner — user taps "Để sau" | Banner dismissed; does not reappear for this reset session |
| EC-C-12 | AI coaching banner — user taps "Bắt đầu học ngay" | Navigates to Learning Path module; portfolio dashboard accessible via back button |
| EC-C-13 | QUEUED_AFTER_HOURS order during reset | Cancelled as part of reset; 48h TTL irrelevant after cancellation |
| EC-C-14 | Reset during very first session (no trades at all) | Allowed; no history to tag; dashboard returns to clean state |

---

## 7. Business ↔ Design Alignment

| Business Rule | Design Implementation | Status |
|---------------|----------------------|--------|
| Double confirmation required | Two-step dialog: Step 1 (warning) + Step 2 (type "ĐẶT LẠI") | Required |
| Cannot be undone | "KHÔNG THỂ hoàn tác" copy in Step 2; warning icon (⚠) | Required |
| Close all positions at last snapshot | Processing screen shows step; confirmation shows [N] positions | Required |
| Cancel all open orders | Processing screen shows step; confirmation shows [M] orders | Required |
| Restore 500M VND | Shown in both confirmation dialogs; verified in post-reset state | Required |
| History retained with [Pre-Reset] | [Pre-Reset] badge + section divider in Trade History | Required |
| [R] marker on chart | Chart marker at reset timestamp; tappable for date detail | Required |
| AI coaching on FOMO/panic | Soft dismissible banner; links to Learning Path | Required |
| Dialog not dismissible by outside tap | Non-dismissible AlertDialog configuration | Required |
| Confirm button gated on text input | Button disabled state until "ĐẶT LẠI" typed | Required |
| Processing cannot be interrupted | Full-screen loader; hardware back disabled | Required |
| FC-PT-05-A/B/C error handling | Specific error states with rollback and support options | Required |

---

## 8. QA Test Cases

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| QA-C-01 | Entry via gear icon | Portfolio Dashboard visible | 1. Tap ⚙ icon in header | Settings menu/screen opens with "Đặt lại danh mục ảo" option visible |
| QA-C-02 | Entry via profile menu | Profile tab accessible | 1. Tap Profile; 2. Scroll to settings section | "Đặt lại danh mục ảo" row visible; red/destructive styling |
| QA-C-03 | Dialog Step 1 appears correctly | Any entry point used | 1. Tap "Đặt lại danh mục ảo" | Step 1 dialog shows with correct copy; background dimmed; outside tap does NOT dismiss |
| QA-C-04 | "Hủy" dismisses without action | Dialog Step 1 visible | 1. Tap "Hủy" | Dialog closes; portfolio state unchanged; 500M or current balance unchanged |
| QA-C-05 | "Tiếp tục" advances to Step 2 | Dialog Step 1 visible | 1. Tap "Tiếp tục" | Dialog Step 2 appears; confirm button is grayed/disabled |
| QA-C-06 | Confirm button disabled on wrong text | Dialog Step 2 visible | 1. Type "đặt lại" (lowercase) | "Xác nhận đặt lại" button remains disabled |
| QA-C-07 | Confirm button enables on correct text | Dialog Step 2 visible | 1. Type "ĐẶT LẠI" (uppercase) | "Xác nhận đặt lại" button becomes active (enabled) |
| QA-C-08 | Successful full reset | 3 holdings, 2 PENDING orders, balance 480M | 1. Complete both dialog steps | All holdings cleared; orders cancelled; balance = 500,000,000 VND; trade history shows [Pre-Reset] labels |
| QA-C-09 | Chart shows [R] marker post-reset | After successful reset | 1. Open chart; select 1M or 1Y tab | [R] marker appears at the reset timestamp; baseline at 500M |
| QA-C-10 | Pre-reset history preserved | After successful reset | 1. Scroll to Trade History (Section 6) | All pre-reset trades visible; [Pre-Reset] badge on each; divider separating old/new |
| QA-C-11 | AI coaching banner when FOMO detected | Pattern: 5 orders in 5 min before reset | 1. Complete reset | AI coaching banner appears at top of post-reset dashboard |
| QA-C-12 | AI coaching banner dismissed | Banner visible | 1. Tap "Để sau" | Banner dismissed; does not reappear |
| QA-C-13 | "Quay lại" in Step 2 returns to Step 1 | Dialog Step 2 visible | 1. Tap "← Quay lại" | Step 1 dialog appears; Step 2 text input cleared |
| QA-C-14 | FC-PT-05-B: Network failure during reset | Mock network drop during processing | 1. Trigger reset; drop network during processing | Error toast appears; inconsistency warning shown on next load; retry and support options available |
| QA-C-15 | Dynamic position/order count in Step 2 | 2 holdings, 4 pending orders | 1. Open Dialog Step 2 | Shows "Đóng 2 vị thế" and "Hủy 4 lệnh đang chờ" with exact counts |

---

## 9. Design Gaps / Risks

| ID | Gap / Risk | Severity | Recommendation |
|----|-----------|----------|----------------|
| DG-C-01 | "Last snapshot price" for closing positions is not shown in the confirmation — user does not know at what price positions will be closed | High | Show each holding with its last snapshot price in Dialog Step 2, or at minimum show total estimated portfolio value at close |
| DG-C-02 | Rollback behavior for FC-PT-05-A is not technically specified — re-queuing cancelled orders may not be straightforward | High | Confirm with Backend whether full rollback is feasible; if not, define acceptable partial-reset state and messaging |
| DG-C-03 | FOMO/panic detection algorithm not defined in this spec — rule set needs Product/AI team input | High | Define specific rules (e.g., 3+ orders in 5 min, loss exceeding X%, reset within 7 days) before implementation |
| DG-C-04 | Multiple resets scenario: chart with many [R] markers may become unreadable on small screens | Medium | Define max markers visible before clustering (e.g., show count badge "3 lần đặt lại" for dense periods) |
| DG-C-05 | The "ĐẶT LẠI" text requirement may be a UX barrier for users who do not have Vietnamese keyboard/caps lock | Medium | Add a clear instruction: "Bật chữ hoa trên bàn phím và gõ ĐẶT LẠI"; consider auto-capitalize |
| DG-C-06 | Processing screen: what if one step succeeds and server crashes before the next — how does the app detect partial state on re-launch? | High | Backend must provide a "reset_in_progress" flag checked on app launch; define recovery UX |
| DG-C-07 | AI coaching banner appearance not specified for users who reset with a profit (positive P&L) — banner may be inappropriate | Medium | Trigger AI coaching only when reset occurs after a loss or after FOMO/panic pattern; suppress if portfolio is in profit |

---

## 10. Related Documents

- `02-user-flow.md` — Master User Flow Overview
- `flow-a-portfolio-dashboard.md` — Portfolio Dashboard detailed flow (Sections 4, 6 post-reset)
- `flow-b-place-order.md` — Place Order detailed flow
- `DEV-QA-SPEC-F0-Learning-Path.md` — Learning Path feature (AI coaching destination)
- API specification for virtual account reset endpoint

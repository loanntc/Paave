# Flow B — Place an Order (Buy/Sell)

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
| Flow ID | FLOW-B |
| Feature Reference | Portfolio / Virtual Trading Dashboard — Place Order |
| Actor | F0 trader (age 16–27, Vietnamese market beginner) |
| Trigger | Tap "Mua" or "Bán" button on Portfolio Dashboard or Stock Detail screen |
| Entry State | User authenticated; virtual account initialized |
| Exit States | (A) FILLED: order executed within 15s; (B) PENDING: order queued for evaluation; (C) QUEUED_AFTER_HOURS: after-hours order; (D) Error: validation failed, form remains open |
| Primary APIs | GET buyable, GET sellable, POST /virtual/equity/orders |
| Error Codes | E-PT-101 (market closed), E-PT-107 (lot size), E-PT-108 (insufficient balance), E-PT-109 (insufficient holdings), E-PT-116 (max orders) |
| Order Types | MARKET, LO, ATO, ATC, STOP_LIMIT |

---

## 2. Business Flow

### Main Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  ENTRY                                                          │
│  A) "Mua" button on Portfolio Dashboard                         │
│  B) "Bán" button on Portfolio Dashboard or Holdings row         │
│  C) "Mua" / "Bán" on Stock Detail screen                       │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│  ORDER FORM SCREEN                                              │
│  Pre-filled: side (Mua/Bán), ticker (if from Stock Detail)     │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
                ┌────────────┴────────────┐
                │  User selects           │
                │  Order Type             │
                └────────────┬────────────┘
                             │
    ┌────────────────────────┼──────────────────────────┐
    │           │            │            │             │
    ▼           ▼            ▼            ▼             ▼
 MARKET         LO          ATO          ATC       STOP_LIMIT
    │           │            │            │             │
    │     Price + GTC/GTD  No price    No price   Stop price +
    │     date picker      (opening)   (closing)   limit price
    │           │            │            │             │
    └─────────┬─┘            │            │             │
              │◄─────────────┘            │             │
              │◄──────────────────────────┘             │
              │◄────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  USER ENTERS QUANTITY                                           │
│  - Numeric input (multiples of 100 enforced by stepper)        │
│  - Running total shown: qty × price × 1.001 (fee included)     │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT-SIDE VALIDATION (on "Xem lại lệnh" button tap)         │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼ (validation details — see Validation Flow below)
              │
              ▼ ALL PASS
┌─────────────────────────────────────────────────────────────────┐
│  CONFIRMATION SCREEN                                           │
│  Shows: Mua/Bán · ticker · qty · price · fee · balance after   │
└─────────────────────────────────────────────────────────────────┘
              │
       ┌──────┴──────┐
       │  "Xác nhận" │
       └──────┬──────┘
              │
              ▼
       POST /virtual/equity/orders
              │
              ▼
     ┌────────────────────────────────────────────┐
     │  Response routing                          │
     └──────┬───────────────────────────┬─────────┘
            │                           │
         Success                    Error (4xx/5xx)
            │                           │
            ▼                           ▼
  ┌─────────────────┐         Show error toast;
  │  Order created  │         Return to Order Form
  │  state:         │
  │  PENDING        │
  └────────┬────────┘
           │
           ▼
  ┌────────────────────────────────────────────────┐
  │  15-second evaluation cycle (MARKET orders)   │
  └────────┬───────────────────────────────────────┘
           │
           ▼
  ┌────────┴────────┐
  │ Fill conditions │
  │ met at snapshot?│
  └────────┬────────┘
           │
  ┌────────┴────────────┐
  │ YES                 │ NO
  ▼                     ▼
FILLED             Remains PENDING
  │                (LO: up to 30 days)
  ▼
Push notification:
"Lệnh [Mua/Bán] [ticker] đã được khớp"
  │
  ▼
Dashboard values updated at next refresh
```

---

### Validation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  VALIDATION CHAIN (sequential; fail-fast)                       │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────┴───────────┐
              │  1. Lot size check    │
              │  qty % 100 == 0 ?     │
              └───────────┬───────────┘
                          │
              ┌───────────┴───────────┐
              │ FAIL                  │ PASS
              ▼                       ▼
       E-PT-107: "Số lượng   2. Balance / holdings check
       phải là bội số 100"
                                       │
                       ┌───────────────┴───────────────┐
                       │ BUY: available_balance ≥       │
                       │      qty × price × 1.001 ?    │
                       │ SELL: owned_qty ≥ qty ?        │
                       └───────────────┬───────────────┘
                                       │
                       ┌───────────────┴───────────────┐
                       │ FAIL                          │ PASS
                       ▼                               ▼
               BUY: E-PT-108              3. Market session check
               "Số dư ảo không đủ"
               SELL: E-PT-109
               "Bạn không đủ cổ
                phiếu để bán"
                                                       │
                               ┌───────────────────────┴───────────┐
                               │  Order type allowed in            │
                               │  current session?                 │
                               │  (see VN Session rules)           │
                               └───────────────────────┬───────────┘
                                                       │
                               ┌───────────────────────┴───────────┐
                               │ FAIL                              │ PASS
                               ▼                                   ▼
                       E-PT-101: "Thị             4. Open order count check
                       trường đang                │  open_orders < 10 ?
                       đóng cửa"                  └───────────────────────┐
                                                                          │
                                                  ┌───────────────────────┴───────┐
                                                  │ FAIL                         │ PASS
                                                  ▼                              ▼
                                          E-PT-116: "Đã đạt        ALL VALIDATION PASSED
                                          giới hạn 10 lệnh         → Show Confirmation Screen
                                          chờ"
```

---

### Order Type Flows

#### MARKET Order

```
ENTRY (during Continuous Session 1 or 2)
    │
    ▼
User enters qty only (no price)
    │
    ▼
System shows: "Giá dự kiến: [last_snapshot_price] VND"
    │
    ▼
Confirmation → POST → PENDING
    │
    ▼
Next 15s price snapshot: fill at that price
    │
    ├── Success → FILLED + push notification
    └── Failure → FILL_FAILED → toast: "Lệnh không thể khớp, vui lòng thử lại"
```

#### LO (Limit Order)

```
ENTRY (during Continuous Session 1 or 2)
    │
    ▼
User enters qty + limit price
    │
    ▼
Validity selector: GTC (30 ngày) / GTD (chọn ngày hết hạn)
    │
    ▼
Confirmation → POST → PENDING
    │
    ▼
Every 15s: market_price ≤ limit (BUY) or market_price ≥ limit (SELL)?
    │
    ├── YES → FILLED + push notification
    └── NO  → Remains PENDING
                │
                └── After 30 days (GTC) or GTD date → EXPIRED
                    Reserved balance / soft-lock released
                    Toast: "Lệnh LO [ticker] đã hết hạn"
```

#### ATO Order

```
ENTRY (09:00–09:15 ICT only — Pre-Opening session)
    │
    ├── Outside Pre-Opening window? → ATO option grayed out
    │   Tooltip: "ATO chỉ khả dụng trong phiên mở cửa (09:00–09:15)"
    │
    ▼
User enters qty only (no price field shown)
    │
    ▼
Confirmation → POST → PENDING
    │
    ▼
At 09:15: Filled at official opening price
    │
    ├── FILLED + push notification
    └── FILL_FAILED if no opening match
```

#### ATC Order

```
ENTRY (14:30–14:45 ICT only — ATC Period)
    │
    ├── Outside ATC window? → ATC option grayed out
    │   Tooltip: "ATC chỉ khả dụng trong phiên đóng cửa (14:30–14:45)"
    │
    ▼
User enters qty only (no price field shown)
    │
    ▼
Confirmation → POST → PENDING
    │
    ▼
At 14:45: Filled at official closing price
    │
    ├── FILLED + push notification
    └── FILL_FAILED if no closing match
```

#### STOP_LIMIT Order

```
ENTRY (during Continuous Session 1 or 2)
    │
    ▼
User enters qty + stop price + limit price
    │
    ▼
Validation: stop_price must be different from limit_price
    │
    ▼
Confirmation → POST → PENDING
    │
    ▼
Every 15s: market_price reaches stop_price?
    │
    ├── YES → Trigger LO at limit_price → PENDING (as limit order)
    └── NO  → Monitor continues
```

---

## 3. Screen Sections Spec

### 3.1 Order Form Screen

```
┌──────────────────────────────────────────┐
│  ← Đặt Lệnh                   [Tiền ảo] │
├──────────────────────────────────────────┤
│  Mã Chứng Khoán                         │
│  ┌──────────────────────────────────┐   │
│  │  VNM             ▼               │   │
│  └──────────────────────────────────┘   │
│  [Giá: 22,500 VND] [▲ +500 (+2.27%)]   │
├──────────────────────────────────────────┤
│  Loại Lệnh                              │
│  [MARKET] [LO] [ATO] [ATC] [STOP_LIMIT] │
├──────────────────────────────────────────┤
│  Giá Đặt Lệnh (if LO or STOP_LIMIT)    │
│  ┌──────────────────────────────────┐   │
│  │  22,000               VND        │   │
│  └──────────────────────────────────┘   │
│  Giá thị trường: 22,500 VND             │
├──────────────────────────────────────────┤
│  Số Lượng                               │
│  [−]  [  500  ]  [+]   (bội số 100)    │
├──────────────────────────────────────────┤
│  Hiệu lực (LO only)                    │
│  ○ GTC (30 ngày)   ● GTD               │
│  [22/06/2026           ▼]              │
├──────────────────────────────────────────┤
│  Ước tính                               │
│  Giá trị lệnh:     11,000,000 VND       │
│  Phí giao dịch:        11,000 VND       │
│  Tổng chi phí:     11,011,000 VND       │
│  Số dư sau lệnh:  468,989,000 VND       │
├──────────────────────────────────────────┤
│                                          │
│  [       Xem Lại Lệnh        ]          │
│                                          │
└──────────────────────────────────────────┘
```

**Side selector** (at top of form, before ticker):
```
┌────────────────────────────────────────┐
│   [   MUA   ]         [   BÁN   ]     │
│    active fill                         │
└────────────────────────────────────────┘
```

- "Mua" tab: green active state
- "Bán" tab: red active state

### 3.2 Confirmation Screen

```
┌──────────────────────────────────────────┐
│  ← Xác Nhận Lệnh              [Tiền ảo] │
├──────────────────────────────────────────┤
│                                          │
│       [MUA] VNM                         │
│  ──────────────────────────────────────  │
│  Loại lệnh:        LO                   │
│  Số lượng:         500 CP               │
│  Giá đặt:          22,000 VND/CP        │
│  Hiệu lực:         GTC (đến 21/06/2026) │
│  ──────────────────────────────────────  │
│  Giá trị lệnh:     11,000,000 VND       │
│  Phí giao dịch:        11,000 VND       │
│  Tổng tiền giữ:    11,011,000 VND       │
│  ──────────────────────────────────────  │
│  Số dư khả dụng hiện tại:               │
│  480,000,000 VND                        │
│  Số dư sau khi đặt lệnh:                │
│  468,989,000 VND              [Tiền ảo] │
│                                          │
│  ⓘ Lệnh mua sẽ giữ 11,011,000 VND      │
│    khỏi số dư của bạn                   │
│                                          │
├──────────────────────────────────────────┤
│  [Sửa lệnh]     [Xác nhận đặt lệnh]    │
└──────────────────────────────────────────┘
```

### 3.3 Order Success Screen

```
┌──────────────────────────────────────────┐
│                                          │
│              ✓ Đặt lệnh thành công      │
│                                          │
│  Lệnh [MUA] [VNM] 500 CP                │
│  đã được đặt thành công                 │
│                                          │
│  Trạng thái: Đang chờ khớp             │
│  Mã lệnh: #VT-2026052200042            │
│                                          │
│  ⏳ Chờ khớp trong phiên giao dịch      │
│                                          │
│  [Về Danh Mục]  [Xem Lệnh Chờ]         │
│                                          │
└──────────────────────────────────────────┘
```

### 3.4 Post-Fill Notification

Push notification format:
```
Paave — Tiền Ảo
Lệnh [Mua/Bán] [TICKER] đã khớp thành công!
[N] CP tại [price] VND/CP
```

---

## 4. Acceptance Criteria

**AC-B-01**
- Given: User taps "Mua" on the Portfolio Dashboard
- When: The Order Form screen opens
- Then: The side selector shows "Mua" as active (green); the Ticker field is focused; "Tiền ảo" badge is visible in the header

**AC-B-02**
- Given: User selects LO order type and enters a quantity of 150
- When: User taps "Xem Lại Lệnh"
- Then: Error E-PT-107 is shown: "Số lượng phải là bội số 100"; form remains open; no API call is made

**AC-B-03**
- Given: User has 480,000,000 VND available and tries to buy 2,000 shares at 25,000 VND (cost = 50,050,000 VND)
- When: User taps "Xem Lại Lệnh"
- Then: Validation passes; Confirmation screen appears with cost breakdown

**AC-B-04**
- Given: User has 10,000,000 VND available and tries to buy 1,000 shares at 25,000 VND (cost = 25,025,000 VND)
- When: User taps "Xem Lại Lệnh"
- Then: Error E-PT-108 is shown: "Số dư ảo không đủ để thực hiện lệnh này"; form remains open

**AC-B-05**
- Given: User owns 500 VNM shares and tries to sell 800 shares
- When: User taps "Xem Lại Lệnh"
- Then: Error E-PT-109 is shown: "Bạn không đủ cổ phiếu để bán"; form remains open

**AC-B-06**
- Given: User already has 10 open PENDING orders
- When: User submits an 11th order
- Then: Error E-PT-116 is shown: "Đã đạt giới hạn 10 lệnh chờ — hủy lệnh cũ để tiếp tục"; order is not created

**AC-B-07**
- Given: Current time is 12:00 (Midday Break, 11:30–13:00)
- When: User tries to submit a MARKET order
- Then: Error E-PT-101 is shown: "Thị trường đang đóng cửa"; MARKET order type is disabled; LO and other queued types remain available

**AC-B-08**
- Given: Current time is 10:00 (Continuous Session 1)
- When: User views the Order Type selector
- Then: ATO is grayed out with tooltip "ATO chỉ khả dụng trong phiên mở cửa (09:00–09:15)"; ATC is grayed out with tooltip; MARKET and LO are enabled

**AC-B-09**
- Given: User places a MARKET BUY order for 500 VNM
- When: The order is confirmed and submitted
- Then: A PENDING state is shown; within 15 seconds (next price snapshot), the order transitions to FILLED; a push notification is sent

**AC-B-10**
- Given: User places a LO BUY order with a limit price of 20,000 on VNM (current price 22,500)
- When: The order is confirmed
- Then: Order enters PENDING state; balance reserve = 500 × 20,000 × 1.001 = 10,010,000 VND; reserved amount shown in Section 2 of dashboard

**AC-B-11**
- Given: User places a BUY SELL order for 300 VNM shares
- When: The order is confirmed
- Then: VNM shows soft-lock indicator in holdings; the 300 shares are unavailable for another sell order

**AC-B-12**
- Given: Confirmation screen is displayed
- When: User reviews the breakdown
- Then: Simulated fee (0.1% of trade value) is correctly calculated and shown; "Tổng tiền giữ" = trade value + fee; "Số dư sau khi đặt lệnh" = available − total held

---

## 5. Design Analysis

### Order Form Wireframe

```
┌──────────────────────────────────────────────────────┐
│  ←    Đặt Lệnh                           Tiền ảo   │  Header
├──────────────────────────────────────────────────────┤
│  [    MUA    ]              [    BÁN    ]            │  Side Selector
├──────────────────────────────────────────────────────┤
│  Mã Chứng Khoán                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  VNM     Vinamilk                  ▼          │   │  Ticker Input
│  └──────────────────────────────────────────────┘   │
│  Giá hiện tại: 22,500  ▲ +500 (+2.27%)             │
├──────────────────────────────────────────────────────┤
│  Loại Lệnh                                          │
│  ┌────────────────────────────────────────────────┐  │
│  │ MARKET  │  LO   │  ATO* │  ATC* │ STOP_LIMIT  │  │  Tab Selector
│  └────────────────────────────────────────────────┘  │
│  * grayed out with tooltip when unavailable          │
├──────────────────────────────────────────────────────┤
│  Giá Đặt Lệnh                    [only for LO/STOP]  │
│  ┌──────────────────────────────────────────────┐   │
│  │  22,000                           VND         │   │  Price Input
│  └──────────────────────────────────────────────┘   │
│  Dải giá: 20,250 – 24,750 VND                       │
├──────────────────────────────────────────────────────┤
│  Số Lượng (bội số 100)                              │
│  ┌──────────────────────────────────────────────┐   │
│  │  [−]            500              [+]          │   │  Qty Stepper
│  └──────────────────────────────────────────────┘   │
│  Tối đa có thể mua: 2,170 CP                        │
├──────────────────────────────────────────────────────┤
│  Hiệu Lực        [only for LO]                      │
│  ○ GTC (30 ngày)          ● GTD                     │  Validity
│  ┌──────────────────────────┐                        │
│  │  21/06/2026            ▼ │                        │
│  └──────────────────────────┘                        │
├──────────────────────────────────────────────────────┤
│  ─────────────── Ước Tính ───────────────────────── │
│  Giá trị lệnh:           11,000,000 VND              │  Summary
│  Phí giao dịch (0.1%):       11,000 VND              │
│  Số dư sau lệnh:        468,989,000 VND  [Tiền ảo]  │
├──────────────────────────────────────────────────────┤
│              [ Xem Lại Lệnh ]                        │  CTA
└──────────────────────────────────────────────────────┘
```

### Confirmation Screen Wireframe

```
┌──────────────────────────────────────────────────────┐
│  ←   Xác Nhận Lệnh                       Tiền ảo   │
├──────────────────────────────────────────────────────┤
│                                                      │
│             ┌──────────────────────┐                 │
│             │   MUA · VNM          │                 │  Order Summary Card
│             │   Vinamilk JSC       │                 │
│             └──────────────────────┘                 │
│                                                      │
│  Loại lệnh          LO (Lệnh giới hạn)              │
│  Số lượng           500 CP                          │
│  Giá đặt            22,000 VND/CP                   │
│  Hiệu lực           GTC · đến 21/06/2026            │
│  ─────────────────────────────────────────────────  │
│  Giá trị lệnh       11,000,000 VND                  │
│  Phí (0.1%)             11,000 VND                  │
│  Tổng tiền giữ      11,011,000 VND                  │
│  ─────────────────────────────────────────────────  │
│  Số dư hiện tại     480,000,000 VND                 │
│  Số dư sau lệnh     468,989,000 VND       Tiền ảo   │
│                                                      │
│  ⓘ 11,011,000 VND sẽ được giữ cho đến khi lệnh     │
│    được khớp hoặc hủy                               │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [ Sửa Lệnh ]           [ Xác Nhận Đặt Lệnh ]       │
└──────────────────────────────────────────────────────┘
```

### Component Usage

| UI Element | Component | Notes |
|-----------|-----------|-------|
| Side selector | SegmentedControl | Green/Red active states |
| Ticker input | SearchableDropdown | Auto-complete with company name |
| Order type tabs | TabGroup | Disabled state for session-locked types |
| Price input | CurrencyInput | VND format; price band validation |
| Qty stepper | NumberStepper | Step = 100; min = 100 |
| Validity toggle | RadioGroup + DatePicker | GTC/GTD |
| Summary card | InfoCard | Recalculates on any input change |
| Confirmation CTA | PrimaryButton + SecondaryButton | Destructive if "Bán" |

### Interaction Rules

1. Quantity stepper: [−] decrements by 100; [+] increments by 100; direct text entry rounds to nearest 100
2. Price input: constrained to price band (±10% of reference price for VN stocks); out-of-band input shows inline warning
3. Order type tabs: disabled tabs show a tooltip on tap explaining the session requirement
4. Estimated cost recalculates live as qty or price changes
5. "Xem Lại Lệnh" is disabled (grayed) until ticker + qty (and price if applicable) are filled
6. "Sửa Lệnh" on confirmation screen returns to Order Form with all values preserved
7. SELL side: max available to sell shown below qty input; excludes soft-locked shares

---

## 6. Edge Cases

| ID | Scenario | Handling |
|----|----------|----------|
| EC-B-01 | MARKET order during Midday Break | E-PT-101; MARKET disabled; user can place LO which queues until 13:00 |
| EC-B-02 | ATO order placed outside 09:00–09:15 | ATO tab grayed out; tooltip explains timing |
| EC-B-03 | ATC order placed outside 14:30–14:45 | ATC tab grayed out; tooltip explains timing |
| EC-B-04 | Price entered outside price band | Inline warning: "Giá vượt ngoài dải cho phép [min]–[max] VND"; submit blocked |
| EC-B-05 | Ticker halted after order submitted | Order created as PENDING; moves to SUSPENDED when halt detected; user notified |
| EC-B-06 | After-hours order (KR/Global markets) | Order created as QUEUED_AFTER_HOURS; 48h TTL notice shown on success screen |
| EC-B-07 | SELL order for partially soft-locked holding | Available qty = total − soft_locked; stepper max = available |
| EC-B-08 | STOP price = LIMIT price | Inline validation: "Giá stop và giá limit phải khác nhau" |
| EC-B-09 | Network error during POST | Toast: "Không thể đặt lệnh — vui lòng kiểm tra kết nối"; form preserved |
| EC-B-10 | GTD date in the past | Date picker prevents past selection; if entered manually, inline error |
| EC-B-11 | MARKET order for ticker with no recent price | Price field shows "Chưa có giá tham chiếu"; MARKET disabled for this ticker |
| EC-B-12 | User already has a SELL order for same ticker | Warning banner: "Bạn đang có lệnh bán [ticker] đang chờ khớp"; does not block |

---

## 7. Business ↔ Design Alignment

| Business Rule | Design Implementation | Status |
|---------------|----------------------|--------|
| Board lot: multiples of 100 | Quantity stepper steps by 100; direct input rounds to 100; E-PT-107 on violation | Required |
| Simulated fee: 0.1% of trade value | Fee calculated live in summary card; shown on confirmation | Required |
| BUY reserve: qty × price × 1.001 | "Tổng tiền giữ" in confirmation; "Số dư sau lệnh" reflects deduction | Required |
| SELL soft-lock | Max sellable qty = owned − soft_locked; stepper constrained | Required |
| No short selling | Sell qty capped at owned shares; E-PT-109 on over-sell | Required |
| Max 10 open orders | E-PT-116 with link to Open Orders for management | Required |
| ATO: Pre-Opening session only | ATO tab disabled outside 09:00–09:15 with tooltip | Required |
| ATC: ATC period only | ATC tab disabled outside 14:30–14:45 with tooltip | Required |
| MARKET: fills at next 15s snapshot | "Giá dự kiến" shown; "fills within ~15 seconds" copy on success screen | Required |
| LO GTC: 30-day max | GTD date picker capped at today + 30 days; GTC label = "30 ngày" | Required |
| "Tiền ảo" always visible | Badge in header on Order Form, Confirmation, and Success screens | Required |
| E-PT-101 market closed | Toast with session schedule info; affected order types disabled | Required |

---

## 8. QA Test Cases

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| QA-B-01 | Successful MARKET BUY order | Session = Continuous; balance = 100M; VNM at 22,500 | 1. Tap Mua; 2. Select VNM; 3. MARKET; 4. 500 CP; 5. Confirm | Order created PENDING; within 15s → FILLED; push notification sent |
| QA-B-02 | LO BUY enters PENDING state | Balance = 100M; VNM at 22,500; place LO at 20,000 | 1. Place LO BUY 500 VNM at 20,000 VND | Order PENDING; 10,010,000 VND reserved; shown in Section 2 |
| QA-B-03 | Lot size validation fails | Any session | 1. Enter qty 150; tap Xem Lại | E-PT-107: "Số lượng phải là bội số 100"; API not called |
| QA-B-04 | Insufficient balance validation | Available balance = 5,000,000 VND | 1. BUY 1000 VNM at 22,000 VND (cost 22.02M) | E-PT-108: "Số dư ảo không đủ"; form stays open |
| QA-B-05 | Over-sell validation | Own 500 VNM; no soft lock | 1. SELL 700 VNM at market | E-PT-109: "Bạn không đủ cổ phiếu để bán" |
| QA-B-06 | Max open orders reached | 10 PENDING orders already exist | 1. Submit any new order | E-PT-116: "Đã đạt giới hạn 10 lệnh chờ" |
| QA-B-07 | ATO disabled outside pre-opening | Current time = 10:00 | 1. Open Order Form; view order type selector | ATO tab is grayed out; tooltip visible on tap |
| QA-B-08 | ATC disabled outside ATC period | Current time = 10:00 | 1. Open Order Form; view order type selector | ATC tab is grayed out; tooltip visible on tap |
| QA-B-09 | ATO order placed during pre-opening | Current time = 09:05 | 1. Select ATO; 500 CP; no price field shown; confirm | PENDING; fills at opening price at 09:15 |
| QA-B-10 | Fee calculated correctly | Any state | 1. Enter 500 CP at 22,000 VND | Fee = 11,000 VND; Tổng tiền giữ = 11,011,000 VND |
| QA-B-11 | Confirmation "Sửa Lệnh" returns to form | Confirmation screen visible | 1. Tap "Sửa Lệnh" | Returns to Order Form; all previously entered values preserved |
| QA-B-12 | SELL soft-locks holdings | Own 500 VNM; place SELL 300 VNM LO | 1. Place SELL 300 VNM; confirm | VNM row shows lock icon; "(300 CP đang chờ bán)" visible |
| QA-B-13 | LO expires after 30 days (GTC) | GTC order placed 30 days ago | System: advance time past expiry | Order → EXPIRED; reserved balance released; toast shown |
| QA-B-14 | QUEUED_AFTER_HOURS order creation | Global/KR ticker; after hours | 1. Place MARKET order on after-hours ticker | Order created QUEUED_AFTER_HOURS; 48h TTL notice shown |
| QA-B-15 | Push notification on fill | MARKET order PENDING | Wait for 15s price snapshot | Push notification received: "Lệnh Mua VNM đã khớp thành công!" |

---

## 9. Design Gaps / Risks

| ID | Gap / Risk | Severity | Recommendation |
|----|-----------|----------|----------------|
| DG-B-01 | Price band not specified for all order types (STOP_LIMIT stop price range) | High | Define whether stop price has the same ±10% band or different rules |
| DG-B-02 | GTD date picker UX not specified for how to handle same-day expiry | Medium | Same-day GTD should be disallowed; minimum = tomorrow |
| DG-B-03 | No spec for what happens when MARKET fills at a price significantly worse than preview | Medium | Add price slippage warning if fill price deviates > X% from preview |
| DG-B-04 | STOP_LIMIT education: F0 traders may not understand stop vs. limit price concept | High | Add an inline educational tooltip or link to Learning Path for STOP_LIMIT |
| DG-B-05 | Order form does not specify behavior when switching between Mua/Bán while form is partially filled | Low | Clear price and qty fields on side switch; retain ticker selection |
| DG-B-06 | Max sellable qty display for partially soft-locked stock not confirmed by BE | Medium | Confirm API returns available-to-sell qty excluding soft-locked shares |
| DG-B-07 | Success screen specifies order ID but format not confirmed from BE | Low | Confirm order ID format with backend before implementation |

---

## 10. Related Documents

- `02-user-flow.md` — Master User Flow Overview
- `flow-a-portfolio-dashboard.md` — Portfolio Dashboard detailed flow
- `flow-c-portfolio-reset.md` — Portfolio Reset detailed flow
- VN Market Session schedule (ICT = UTC+7)
- API specification for `POST /api/v1/virtual/equity/orders`

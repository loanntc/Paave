# Wireframe Specifications — Portfolio / Virtual Trading Dashboard
## Paave Mobile — Design System: Kinetic Drop V2.0

**Document version:** 1.0
**Date:** 2026-06-01
**Module ID:** F-PORTFOLIO
**Status:** Ready for Design
**Canvas:** 390 × 852 px (iPhone 14 Pro baseline)
**Depends on:** `DESIGN-PORTFOLIO-00-alignment.md`, `DESIGN-PORTFOLIO-01-ux-flows.md`

---

## Layout Conventions

- H-margin: 24px both sides (all screens)
- Section gap: 16px between dashboard sections
- Card radius: 16px
- All backgrounds: `ink-900` (#0E0E0E) unless noted
- Card surfaces: `ink-800` (#131313) raised cards use `ink-700` (#1A1A1A)
- `[VFL]` in wireframes = `<VirtualFundsLabel />` chip — always present, non-dismissible
- `[PnL+]` = positive PnLLabel (green), `[PnL–]` = negative (red), `[PnL0]` = zero (fog)
- `[SKEL]` = SkeletonLoader placeholder

---

## Screen 1 — Portfolio Dashboard

**User goal:** Get an instant read on portfolio health, check open orders, and decide whether to act.

### Default (Loaded) State

```
┌──────────────────────────────────────────────────┐
│ Status bar (system)                              │
├──────────────────────────────────────────────────┤
│ 24px                                         24px│
│  Danh mục đầu tư ảo           ⚙ [···]           │  ← Header bar, h=56px
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ╔════════════════════════════════════════════╗  │
│  ║  [VFL: Tiền ảo]                           ║  │  ← VirtualFundsLabel chip (lime border)
│  ║                                           ║  │
│  ║  Tổng tài sản ảo                          ║  │  ← fog, Manrope 13
│  ║  523.450.000 ₫                            ║  │  ← display-xl, Space Grotesk Bold, white
│  ║                                           ║  │
│  ║  [PnL+] +23.450.000 ₫  +4.69%  Hôm nay   ║  │  ← PnLLabel + fog label
│  ║  🔄 Cập nhật 15 giây                      ║  │  ← fog, Manrope 11, right-aligned
│  ╚════════════════════════════════════════════╝  │  ← ink-800 card, 16px radius
│                                                  │
│  ╔════════════════════════════════════════════╗  │
│  ║  Tiền mặt khả dụng                        ║  │  ← fog label, Manrope 13
│  ║  142.300.000 ₫                            ║  │  ← Space Grotesk SemiBold, white
│  ║  (Đang giữ: 15.200.000 ₫ trong lệnh mua) ║  │  ← fog, Manrope 12. Hidden if 0.
│  ╚════════════════════════════════════════════╝  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Danh mục cổ phiếu          Xem tất cả → │   │  ← Section header
│  │                                          │   │
│  │ ┌──────────────────────────────────────┐ │   │
│  │ │[HOSE] VCB   1,000cp  [PnL+]+8.2%    │ │   │  ← HoldingRow
│  │ │       85,000 ₫ avg · 92,500 ₫ now   │ │   │
│  │ └──────────────────────────────────────┘ │   │
│  │ ┌──────────────────────────────────────┐ │   │
│  │ │[HOSE] VNM   500cp    [PnL–]–3.1%    │ │   │
│  │ │       54,200 ₫ avg · 52,520 ₫ now   │ │   │
│  │ └──────────────────────────────────────┘ │   │
│  │ ┌──────────────────────────────────────┐ │   │
│  │ │[KOSPI] 005930  50cp  [PnL0]  0.0%   │ │   │
│  │ │🔒 50 cổ phần đang bị khóa            │ │   │  ← Locked shares note
│  │ └──────────────────────────────────────┘ │   │
│  │  + 2 cổ phiếu khác →                    │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Giá trị danh mục                         │   │  ← Chart section header
│  │ [1D] [1W] [1M] [3M] [1Y]                │   │  ← Range tab bar
│  │ ┌──────────────────────────────────────┐ │   │
│  │ │     ╭──╮       ╭─╮                  │ │   │  ← Line + area chart (200px h)
│  │ │    ╭╯  ╰──╮   ╭╯ ╰─╮               │ │   │
│  │ │ ···╯·······╰───╯····╰───────────── │ │   │  ← Dotted lime baseline 500M
│  │ │  500M VND baseline               ▶ │ │   │
│  │ └──────────────────────────────────────┘ │   │
│  │  9:00    11:00    13:00    15:00   ATC   │   │  ← X-axis labels, fog
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Lợi nhuận thực hiện              Xem →  │   │
│  │ [PnL+] +12.500.000 ₫ (Tổng tích lũy)   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Lịch sử giao dịch         Xem tất cả → │   │
│  │ [HOSE] MUA VCB  1,000cp  85,000₫ 10/5  │   │
│  │ [HOSE] BÁN VNM  200cp   55,100₫  8/5   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Lệnh đang mở              Xem tất cả → │   │
│  │ LO MUA VCB 500cp @ 84,000₫  [PENDING]  │   │
│  │ LO BÁN 005930 50cp @ 67,200₫ [PENDING] │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│ ─────────────────────────────────────────────── │
│ [VFL chip: Tiền ảo · Giao dịch mô phỏng]        │  ← Fixed above bottom nav
│ ─────────────────────────────────────────────── │
│ [Học] [Thị trường] [■ Danh mục] [Xếp hạng] [Tôi]│  ← Bottom nav (60px)
└──────────────────────────────────────────────────┘
```

### Component List

| Component | Variant / Notes |
|-----------|----------------|
| `VirtualFundsLabel` | Non-dismissible, lime border, always visible |
| `PnLLabel` | Positive (+green) for portfolio header; applies per row for holdings |
| `HoldingRow` | 3 rows shown; includes locked shares note when applicable |
| `PortfolioValueChart` | 1D default; dotted baseline at 500M VND |
| `StockTickerChip` | HOSE, HNX, UPCOM, KOSPI per holding |
| `SkeletonLoader` | Replaces all sections during loading state |
| `Snackbar` | Appears post-order-submit (not shown in default wireframe) |

### State Matrix

| State | Visual Behavior |
|-------|----------------|
| Loading | All 7 sections replaced with `SkeletonLoader` pulsing placeholders |
| Partial load | Loaded sections show data; pending sections remain `[SKEL]` |
| Full loaded | As wireframe above |
| 15s refresh | Header section pulsed briefly (200ms fade); no full skeleton |
| Empty holdings | Holdings section shows "Bạn chưa có cổ phiếu nào" + "Khám phá thị trường" ghost CTA |
| Network error | Per-section: "Không tải được dữ liệu. [Thử lại]" inline |

### Interaction Notes
- Tap holding row → Screen 5 (Holdings Detail)
- Tap "Xem tất cả giao dịch →" → Screen 7 (Trade History)
- Tap "Xem tất cả lệnh →" → Screen 8 (Open Orders)
- Tap Realized P&L section → Screen 6 (Realized P&L Breakdown)
- Tap "···" header → overflow menu with "Đặt lại danh mục" option → Screen 9 (Portfolio Reset)
- Chart range tabs (1D/1W/1M/3M/1Y): tap switches active tab + refetches chart data
- Chart long-press → scrub with lime dot + tooltip

### Copy Strings

| Label | Vietnamese |
|-------|-----------|
| Screen title | Danh mục đầu tư ảo |
| Portfolio total label | Tổng tài sản ảo |
| Cash label | Tiền mặt khả dụng |
| Cash reserved note | Đang giữ: {X} ₫ trong lệnh mua |
| Holdings section header | Danh mục cổ phiếu |
| Holdings "see all" | Xem tất cả {N} cổ phiếu → |
| Locked shares note | 🔒 {N} cổ phần đang bị khóa |
| Chart section header | Giá trị danh mục |
| Chart baseline label | 500M VND (điểm xuất phát) |
| P&L section header | Lợi nhuận thực hiện |
| P&L see all | Xem → |
| Trade history header | Lịch sử giao dịch |
| Trade "see all" | Xem tất cả → |
| Open orders header | Lệnh đang mở |
| Orders "see all" | Xem tất cả → |
| Refresh indicator | 🔄 Cập nhật 15 giây |

---

## Screen 2 — Order Entry Screen (Buy Variant)

**User goal:** Specify a stock purchase order with price, quantity, and order type.

```
┌──────────────────────────────────────────────────┐
│ Status bar                                        │
├──────────────────────────────────────────────────┤
│    ╌╌╌╌╌╌╌╌╌ (drag handle)                       │  ← BottomSheet handle (8px pill)
│                                                  │
│  ✕                   Đặt lệnh                    │  ← Sheet header, dismiss X left
│                                                  │
│  [VFL: Tiền ảo]                                  │  ← Mandatory chip, top of sheet
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ [HOSE]  VCB                              │   │  ← Stock identity row
│  │ Ngân hàng TMCP Ngoại thương Việt Nam     │   │  ← Full name, fog, Manrope 12
│  │                    Giá hiện tại: 92,500₫ │   │  ← Right-aligned, fog
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌── Mua ────────────────────── Bán ──────────┐  │  ← Buy/Sell toggle
│  │  [● MUA — lime underline]   [ BÁN ]        │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Loại lệnh                                       │  ← Section label, fog
│  ┌────────────────────────────────────────────┐  │
│  │  [LO]  [MARKET]  [ATO]  [ATC]  [STOP] ... │  │  ← OrderTypeSelector, scrollable
│  └────────────────────────────────────────────┘  │
│  "LO — Lệnh giới hạn"  (subtext below selector) │  ← Active type description
│                                                  │
│  Giá mua (₫)                                     │  ← Field label
│  ┌────────────────────────────────────────────┐  │
│  │  84.000                                    │  │  ← ink-600 input, Space Grotesk
│  └────────────────────────────────────────────┘  │
│  Bước giá: 100₫                                  │  ← Tick size hint, fog 11px
│                                                  │
│  Số lượng (cổ phần)                              │
│  ┌────────────────────────────────────────────┐  │
│  │  500                                       │  │
│  └────────────────────────────────────────────┘  │
│  Khả dụng: 142.300.000₫ (≈ 1,693 cp tối đa)     │  ← Available cash hint, fog 11px
│                                                  │
│  Hiệu lực lệnh                                   │  ← Validity, shown for LO only
│  ┌─────────────────────┐  ┌────────────────────┐│
│  │  ● GTD (Trong ngày) │  │  ○ GTC_30D (30 ngày)││  ← Radio pair
│  └─────────────────────┘  └────────────────────┘│
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ Số tiền sẽ được giữ:    42.000.000 ₫      │  │  ← Reservation box (amber bg)
│  │ (Giá × Số lượng + phí ước tính)            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │          Xem xác nhận                      │  │  ← Lime KineticButton (primary)
│  └────────────────────────────────────────────┘  │
│                                                  │
│ ─────────────────────────────────────────────── │
│ [VFL chip: Tiền ảo · Giao dịch mô phỏng]        │
└──────────────────────────────────────────────────┘
```

### Component List

| Component | Variant |
|-----------|---------|
| `BottomSheet` | Full-height (scrollable) |
| `VirtualFundsLabel` | Mandatory, inside sheet top |
| `StockTickerChip` | Exchange (HOSE) |
| `OrderTypeSelector` | Segmented, LO active |
| `KineticButton` | Lime (primary) — "Xem xác nhận" |

### State Matrix

| State | Visual |
|-------|--------|
| Default / empty | All inputs blank; CTA disabled |
| Partially filled | CTA disabled until all required fields valid |
| Valid | CTA enabled (lime, full opacity) |
| ATO/ATC disabled | Selector shows disabled state; tooltip on tap |
| Validation error | Red border on invalid field + error text below |
| MARKET type | Price field hidden; estimated fill note appears |

### Interaction Notes
- Buy/Sell toggle: swaps between Buy and Sell mode; field labels update (e.g., "Giá bán" vs "Giá mua")
- Order type change: price field visibility animated (300ms fade/slide)
- Reservation amount updates in real-time as price or qty changes
- Price input: only accepts numbers; formats with thousands separator
- Tapping outside BottomSheet: confirmation dialog if fields have values, else dismiss

### Copy Strings (Buy Variant)

| Label | Vietnamese |
|-------|-----------|
| Sheet title | Đặt lệnh |
| Toggle: buy | MUA |
| Toggle: sell | BÁN |
| Order type label | Loại lệnh |
| Price field label | Giá mua (₫) |
| Tick size hint | Bước giá: {X} ₫ |
| Quantity label | Số lượng (cổ phần) |
| Available funds hint | Khả dụng: {X} ₫ (≈ {N} cp tối đa) |
| Validity label | Hiệu lực lệnh |
| GTD label | GTD (Trong ngày) |
| GTC label | GTC_30D (30 ngày) |
| Reservation notice | Số tiền sẽ được giữ: {X} ₫ |
| Reservation subtext | Giá × Số lượng + phí ước tính |
| Primary CTA | Xem xác nhận |
| Insufficient funds error | Số dư tiền mặt không đủ để đặt lệnh này |
| Quantity zero error | Vui lòng nhập số lượng |
| Price invalid error | Giá không hợp lệ — bước giá: {X} ₫ |

---

## Screen 3 — Order Entry Screen (Sell Variant)

**User goal:** Specify a sell order for a held position.

```
┌──────────────────────────────────────────────────┐
│ Status bar                                        │
├──────────────────────────────────────────────────┤
│    ╌╌╌╌╌╌╌╌╌ (drag handle)                       │
│                                                  │
│  ✕                   Đặt lệnh                    │
│                                                  │
│  [VFL: Tiền ảo]                                  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ [HOSE]  VNM                              │   │
│  │ Công ty CP Sữa Việt Nam                  │   │
│  │                    Giá hiện tại: 52,520₫ │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌── Mua ────────────────────── Bán ──────────┐  │
│  │  [ MUA ]                  [● BÁN — lime ] │  │  ← Sell tab active
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Loại lệnh                                       │
│  ┌────────────────────────────────────────────┐  │
│  │  [LO]  [MARKET]  [ATO]  [ATC]  [STOP] ... │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Giá bán (₫)                                     │
│  ┌────────────────────────────────────────────┐  │
│  │  55.000                                    │  │
│  └────────────────────────────────────────────┘  │
│  Bước giá: 100₫                                  │
│                                                  │
│  Số lượng bán (cổ phần)                          │
│  ┌────────────────────────────────────────────┐  │
│  │  200                                       │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │  ← Availability bar
│  │ Đang bán: 200 / 500 cp                     │  │  ← Manrope 12, fog
│  │ ████████░░░░░░░░░░░░░░░░  (40% filled)    │  │  ← Progress bar (lime)
│  │ 🔒 0 cp đang bị khóa                      │  │  ← Shown if >0 locked shares
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Hiệu lực lệnh                                   │
│  ┌─────────────────────┐  ┌────────────────────┐│
│  │  ● GTD (Trong ngày) │  │  ○ GTC_30D (30 ngày)││
│  └─────────────────────┘  └────────────────────┘│
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │          Xem xác nhận                      │  │  ← Lime KineticButton
│  └────────────────────────────────────────────┘  │
│                                                  │
│ ─────────────────────────────────────────────── │
│ [VFL chip: Tiền ảo · Giao dịch mô phỏng]        │
└──────────────────────────────────────────────────┘
```

### Copy Strings (Sell-specific deltas from Buy variant)

| Label | Vietnamese |
|-------|-----------|
| Price field label | Giá bán (₫) |
| Quantity label | Số lượng bán (cổ phần) |
| Availability note | Đang bán: {qty} / {total} cp |
| Locked shares note | 🔒 {N} cp đang bị khóa trong lệnh bán |
| Insufficient shares error | Không đủ số cổ phần khả dụng |
| All shares locked error | Tất cả cổ phần đang bị khóa trong lệnh bán |

---

## Screen 4 — Order Confirmation Screen

**User goal:** Review order summary before submitting; last chance to cancel.

```
┌──────────────────────────────────────────────────┐
│ Status bar                                        │
├──────────────────────────────────────────────────┤
│  [← Quay lại]        Xác nhận lệnh              │  ← Header 56px
├──────────────────────────────────────────────────┤
│                                                  │
│  [VFL: Tiền ảo]                                  │  ← Mandatory chip
│                                                  │
│  ╔════════════════════════════════════════════╗  │
│  ║  [HOSE]  MUA  VCB                         ║  │  ← Direction + ticker, lime "MUA"
│  ║  Ngân hàng TMCP Ngoại thương Việt Nam     ║  │
│  ╚════════════════════════════════════════════╝  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Loại lệnh          LO (Giới hạn / GTD)  │   │  ← Summary rows
│  │  Giá đặt            84.000 ₫             │   │
│  │  Số lượng           500 cổ phần           │   │
│  │  Tổng giá trị       42.000.000 ₫          │   │
│  │  Phí giao dịch ước tính  105.000 ₫        │   │  ← Always shown
│  │  ─────────────────────────────────────── │   │
│  │  Tổng thanh toán    42.105.000 ₫          │   │  ← Bold, Space Grotesk
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ╔════════════════════════════════════════════╗  │  ← Amber reservation box (LO only)
│  ║  💰 Số tiền sẽ được giữ                  ║  │
│  ║  42.105.000 ₫                             ║  │  ← Space Grotesk SemiBold
│  ║  Số tiền này sẽ được giải phóng nếu lệnh ║  │
│  ║  không khớp hoặc bị hủy.                 ║  │
│  ╚════════════════════════════════════════════╝  │
│                          [?] Info icon tappable  │
│                                                  │
│                    ─ hoặc ─                      │
│                                                  │
│  ╔════════════════════════════════════════════╗  │  ← Amber fee box (MARKET only)
│  ║  ⚠ Phí ước tính: 105.000 ₫               ║  │  ← Only for MARKET orders
│  ║  Lệnh MARKET khớp tại giá thị trường.    ║  │
│  ║  Phí có thể thay đổi khi khớp.           ║  │
│  ╚════════════════════════════════════════════╝  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Số dư sau lệnh (ước tính)               │   │
│  │  100.195.000 ₫                           │   │  ← fog, Manrope 13
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │          Xác nhận đặt lệnh                │  │  ← Lime KineticButton (primary)
│  └────────────────────────────────────────────┘  │
│                                                  │
│               Hủy lệnh này                       │  ← Ghost text link (no button border)
│                                                  │
│ ─────────────────────────────────────────────── │
│ [VFL chip: Tiền ảo · Giao dịch mô phỏng]        │
└──────────────────────────────────────────────────┘
```

### Component List

| Component | Variant |
|-----------|---------|
| `VirtualFundsLabel` | Mandatory |
| `StockTickerChip` | Exchange |
| `KineticButton` | Lime — "Xác nhận đặt lệnh" (full width) |
| `KineticButton` | Ghost text — "Hủy lệnh này" (no border, centered) |

### State Matrix

| State | Visual |
|-------|--------|
| Default | As wireframe; CTA enabled |
| Submitting | Lime CTA shows spinner; both buttons disabled |
| Error | Inline error banner above primary CTA: red bg, error text |
| Success | Pops screen + Snackbar on parent screen |

### Interaction Notes
- "Hủy lệnh này" → navigates back two screens (to dashboard or holding detail); no confirmation needed here since user already saw the order form
- [?] info icon on reservation box → small tooltip: "Tiền giữ sẽ được hoàn trả nếu lệnh hết hạn hoặc bị hủy"
- MARKET order: reservation box hidden; amber fee box shown instead

### Copy Strings

| Label | Vietnamese |
|-------|-----------|
| Screen title | Xác nhận lệnh |
| Direction label | MUA (lime) or BÁN (red/fog) |
| Order type row | Loại lệnh |
| Price row | Giá đặt |
| Quantity row | Số lượng |
| Total value row | Tổng giá trị |
| Fee row | Phí giao dịch ước tính |
| Divider | (line) |
| Total payment row | Tổng thanh toán |
| Reservation title | 💰 Số tiền sẽ được giữ |
| Reservation body | Số tiền này sẽ được giải phóng nếu lệnh không khớp hoặc bị hủy. |
| MARKET fee warning | ⚠ Phí ước tính: {X} ₫ |
| MARKET fee body | Lệnh MARKET khớp tại giá thị trường. Phí có thể thay đổi khi khớp. |
| Post-order balance | Số dư sau lệnh (ước tính) |
| Primary CTA | Xác nhận đặt lệnh |
| Cancel link | Hủy lệnh này |

---

## Screen 5 — Holdings Detail

**User goal:** Understand the full position in one stock — avg cost, unrealized P&L, and history.

```
┌──────────────────────────────────────────────────┐
│ Status bar                                        │
├──────────────────────────────────────────────────┤
│  [← Danh mục]        VCB            [···]        │  ← Header 56px
├──────────────────────────────────────────────────┤
│                                                  │
│  [VFL: Tiền ảo]                                  │
│                                                  │
│  ╔════════════════════════════════════════════╗  │
│  ║  [HOSE]  VCB                              ║  │
│  ║  Ngân hàng TMCP Ngoại thương Việt Nam     ║  │  ← fog, Manrope 12
│  ║                                           ║  │
│  ║  92.500 ₫                                 ║  │  ← Current price, display-lg
│  ║  [PnL+] +850 ₫  (+0.93%)  Hôm nay        ║  │  ← PnLLabel intraday
│  ╚════════════════════════════════════════════╝  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ Vị thế của bạn                           │   │  ← Section header
│  │                                          │   │
│  │  Số lượng sở hữu      1.000 cổ phần      │   │
│  │  Giá mua trung bình   85.000 ₫           │   │
│  │  Giá trị hiện tại     92.500.000 ₫       │   │  ← Space Grotesk
│  │  Lãi/lỗ chưa thực hiện  [PnL+]+7.500.000₫│   │  ← PnLLabel (large)
│  │                          [PnL+] +8.82%   │   │
│  │                                          │   │
│  │  🔒 0 cổ phần đang bị khóa              │   │  ← Hidden if 0
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │  ← Mini intraday chart (120px h)
│  │  ╭──╮      ╭─────╮                      │   │
│  │ ╭╯  ╰──╮  ╭╯     ╰─╮                   │   │
│  │ ╯      ╰──╯          ╰─                 │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Lịch sử giao dịch VCB                          │  ← Section header
│  ┌──────────────────────────────────────────┐   │
│  │ MUA  10/05  1,000cp @ 85,000₫  [FILLED] │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ MUA  02/04  500cp  @ 84,500₫  [FILLED]  │   │
│  │ [Pre-Reset]                              │   │  ← Pre-reset label
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────┐ ┌───────────────────┐ │
│  │     Mua thêm         │ │       Bán         │ │  ← Action row
│  └──────────────────────┘ └───────────────────┘ │
│    (lime KineticButton)     (ghost KineticButton) │
│                                                  │
│ ─────────────────────────────────────────────── │
│ [VFL chip: Tiền ảo · Giao dịch mô phỏng]        │
└──────────────────────────────────────────────────┘
```

### Component List

| Component | Variant |
|-----------|---------|
| `VirtualFundsLabel` | Mandatory |
| `StockTickerChip` | Exchange chip |
| `PnLLabel` | Unrealized P&L (large) + intraday (small) |
| `OrderStatusBadge` | FILLED (green), PENDING (amber) per row |
| `KineticButton` | Lime — "Mua thêm"; Ghost — "Bán" |

### State Matrix

| State | Visual |
|-------|--------|
| Loading | Skeleton for position block + chart area |
| All shares locked | "Bán" button disabled; tooltip "Tất cả cổ phần đang bị khóa" |
| No history | "Chưa có giao dịch nào cho cổ phiếu này" |
| Error | Inline retry per section |

### Copy Strings

| Label | Vietnamese |
|-------|-----------|
| Back label | ← Danh mục |
| Section: position | Vị thế của bạn |
| Qty row | Số lượng sở hữu |
| Avg price row | Giá mua trung bình |
| Current value row | Giá trị hiện tại |
| Unrealized P&L row | Lãi/lỗ chưa thực hiện |
| Locked shares | 🔒 {N} cổ phần đang bị khóa |
| History header | Lịch sử giao dịch {ticker} |
| Pre-reset label | [Pre-Reset] |
| Buy CTA | Mua thêm |
| Sell CTA | Bán |
| All locked tooltip | Tất cả cổ phần đang bị khóa trong lệnh bán |

---

## Screen 6 — Realized P&L Breakdown

**User goal:** Understand cumulative profits/losses from closed positions.

```
┌──────────────────────────────────────────────────┐
│ Status bar                                        │
├──────────────────────────────────────────────────┤
│  [← Danh mục]    Lợi nhuận thực hiện            │  ← Header 56px
├──────────────────────────────────────────────────┤
│                                                  │
│  [VFL: Tiền ảo]                                  │
│                                                  │
│  ╔════════════════════════════════════════════╗  │
│  ║  Tổng lãi/lỗ thực hiện                   ║  │
│  ║  [PnL+]  +12.500.000 ₫                   ║  │  ← display-xl, PnLLabel
│  ║  Kể từ khi bắt đầu · 15 giao dịch        ║  │  ← fog, Manrope 12
│  ╚════════════════════════════════════════════╝  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │  ← Realized P&L chart (cumulative)
│  │  ╭─────╮                                │   │  ← Line chart, 160px h
│  │ ─╯     ╰──────────────╮                │   │
│  │                         ╰──────         │   │
│  │  T1        T2        T3        T4       │   │  ← Month axis
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Theo cổ phiếu                                   │  ← Section label
│  ┌──────────────────────────────────────────┐   │
│  │ [HOSE] VCB    5 gd   [PnL+] +8.200.000₫ │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ [HOSE] VNM    8 gd   [PnL–] –2.100.000₫ │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ [KOSPI] 005930 2 gd  [PnL+] +6.400.000₫ │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Theo tháng                                      │  ← Section label
│  ┌──────────────────────────────────────────┐   │
│  │ Tháng 5/2026   [PnL+] +9.800.000 ₫      │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ Tháng 4/2026   [PnL–] –1.300.000 ₫      │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ Tháng 3/2026   [PnL+] +4.000.000 ₫      │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│ ─────────────────────────────────────────────── │
│ [VFL chip: Tiền ảo · Giao dịch mô phỏng]        │
└──────────────────────────────────────────────────┘
```

### Component List

| Component | Variant |
|-----------|---------|
| `VirtualFundsLabel` | Mandatory |
| `PnLLabel` | Large (total) + small (per-ticker, per-month) |
| `StockTickerChip` | Per ticker row |

### State Matrix

| State | Visual |
|-------|--------|
| Loading | Skeleton for summary card + chart |
| No realized P&L | Empty state: "Chưa có lợi nhuận thực hiện" + "Bán cổ phiếu để ghi nhận lợi nhuận hoặc lỗ." |
| Loaded | As wireframe |

### Copy Strings

| Label | Vietnamese |
|-------|-----------|
| Screen title | Lợi nhuận thực hiện |
| Summary header | Tổng lãi/lỗ thực hiện |
| Summary subtext | Kể từ khi bắt đầu · {N} giao dịch |
| By-stock header | Theo cổ phiếu |
| Stock row: trades | {N} gd |
| By-month header | Theo tháng |
| Empty title | Chưa có lợi nhuận thực hiện |
| Empty body | Bán cổ phiếu để ghi nhận lợi nhuận hoặc lỗ. |

---

## Screen 7 — Trade History

**User goal:** Review all completed trades, optionally filtered by stock, direction, or date.

```
┌──────────────────────────────────────────────────┐
│ Status bar                                        │
├──────────────────────────────────────────────────┤
│  [← Danh mục]    Lịch sử giao dịch     [🔍][⚙] │  ← Header (search + filter icons)
├──────────────────────────────────────────────────┤
│                                                  │
│  [VFL: Tiền ảo]                                  │
│                                                  │
│  [Filter chips active: "HOSE" ✕]  [Xóa tất cả] │  ← Active filter bar (hidden if no filters)
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ MUA  [HOSE] VCB                          │   │  ← TradeHistoryRow
│  │      1.000 cổ phần @ 85.000 ₫ mỗi cp    │   │
│  │      Tổng: 85.000.000 ₫  Phí: 212.500 ₫ │   │
│  │      10/05/2026 09:14     [FILLED]       │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ BÁN  [HOSE] VNM                          │   │
│  │      200 cổ phần @ 55.100 ₫ mỗi cp       │   │
│  │      Tổng: 11.020.000 ₫  Phí: 27.550 ₫  │   │
│  │      08/05/2026 14:32     [FILLED]       │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ MUA  [KOSPI] 005930                       │   │
│  │      50 cổ phần @ 67.200 ₫ mỗi cp        │   │
│  │      Tổng: 3.360.000 ₫   Phí: 8.400 ₫   │   │
│  │      02/04/2026 10:05     [FILLED]       │   │
│  │      [Pre-Reset]                          │   │  ← Pre-Reset label (fog, Manrope 11)
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ MUA  [HOSE] HPG                          │   │
│  │      300 cổ phần @ 27.300 ₫ mỗi cp       │   │
│  │      Tổng: 8.190.000 ₫   Phí: 20.475 ₫  │   │
│  │      15/03/2026 09:01     [FILLED]       │   │
│  │      [Pre-Reset]                          │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│            Đang tải thêm...                      │  ← Pagination loader (inline)
│                                                  │
│ ─────────────────────────────────────────────── │
│ [VFL chip: Tiền ảo · Giao dịch mô phỏng]        │
└──────────────────────────────────────────────────┘

── Filter Drawer (slides from right or bottom sheet) ──────────────────
┌──────────────────────────────────────────────────┐
│  Bộ lọc giao dịch                    [✕ Đóng]   │
├──────────────────────────────────────────────────┤
│  Chiều giao dịch                                 │
│  [● Tất cả]  [○ Mua]  [○ Bán]                   │
│                                                  │
│  Sàn giao dịch                                   │
│  [✓ HOSE] [✓ HNX] [✓ UPCOM] [○ KOSPI] [○ US]   │
│                                                  │
│  Khoảng thời gian                                │
│  [● Tất cả] [○ Hôm nay] [○ 1 tuần] [○ 1 tháng]  │
│  [○ Tùy chỉnh]                                   │
│                                                  │
│  Hiện giao dịch trước đặt lại                    │
│  [Toggle: ON / OFF]                              │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │              Áp dụng bộ lọc               │  │  ← Lime KineticButton
│  └────────────────────────────────────────────┘  │
│               Xóa tất cả bộ lọc                  │  ← Ghost link
└──────────────────────────────────────────────────┘
```

### Component List

| Component | Variant |
|-----------|---------|
| `VirtualFundsLabel` | Mandatory |
| `TradeHistoryRow` | New component |
| `StockTickerChip` | Per row |
| `OrderStatusBadge` | FILLED (most rows) |
| `KineticButton` | Lime — "Áp dụng bộ lọc" |
| `BottomSheet` | Filter drawer |

### State Matrix

| State | Visual |
|-------|--------|
| Loading | 3 ghost skeleton rows |
| Empty (no trades) | Illustration + "Chưa có giao dịch nào" |
| Empty (filters applied) | "Không có giao dịch nào khớp với bộ lọc" + "Xóa bộ lọc" CTA |
| Loaded | As wireframe; pagination at bottom |
| End of list | "Đã hiển thị tất cả giao dịch" footer |

### Copy Strings

| Label | Vietnamese |
|-------|-----------|
| Screen title | Lịch sử giao dịch |
| Direction: buy | MUA |
| Direction: sell | BÁN |
| Pre-reset label | [Pre-Reset] |
| Pagination loader | Đang tải thêm... |
| End of list | Đã hiển thị tất cả giao dịch |
| Filter title | Bộ lọc giao dịch |
| Filter: direction | Chiều giao dịch |
| Filter: exchange | Sàn giao dịch |
| Filter: date | Khoảng thời gian |
| Filter: pre-reset | Hiện giao dịch trước đặt lại |
| Filter CTA | Áp dụng bộ lọc |
| Clear filters | Xóa tất cả bộ lọc |
| Empty title | Chưa có giao dịch nào |
| Empty body | Đặt lệnh đầu tiên của bạn để bắt đầu xây dựng lịch sử giao dịch. |
| Filter empty | Không có giao dịch nào khớp với bộ lọc. |

---

## Screen 8 — Open Orders

**User goal:** See all pending orders; cancel if needed.

```
┌──────────────────────────────────────────────────┐
│ Status bar                                        │
├──────────────────────────────────────────────────┤
│  [← Danh mục]       Lệnh đang mở         [⚙]   │  ← Header 56px
├──────────────────────────────────────────────────┤
│                                                  │
│  [VFL: Tiền ảo]                                  │
│                                                  │
│ ← Vuốt trái để hủy lệnh                         │  ← Instructional hint, fog 11px
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ LO  [HOSE] MUA VCB                       │   │  ← OpenOrderRow (default)
│  │     500 cp @ 84.000 ₫   [PENDING]        │   │
│  │     Đặt lúc: 10/05 09:02                 │   │
│  └──────────────────────────────────────────┘   │
│  ← swipe reveals →                              │
│  ┌─────────────────────────────┐ ┌────────────┐ │
│  │ LO [HOSE] MUA VCB           │ │  🗑 Hủy  │ │  ← Swiped state; red action
│  │ 500 cp @ 84.000 ₫ [PENDING] │ │            │ │
│  └─────────────────────────────┘ └────────────┘ │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ LO  [KOSPI] BÁN 005930                   │   │
│  │     50 cp @ 67.200 ₫     [PENDING]       │   │
│  │     Đặt lúc: 02/05 10:01                 │   │
│  │     ⏱ Hết hạn sau: 23:14:05              │   │  ← TTL countdown (KR/Global)
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ STOP [US] MUA AAPL                        │   │
│  │     10 cp  Stop: 180.00 USD  [SUSPENDED] │   │  ← SUSPENDED badge (plasma)
│  │     Đặt lúc: 28/04 22:30                 │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ MARKET [HOSE] MUA HPG                    │   │
│  │     300 cp                 [QUEUED]      │   │  ← Queued after hours (amber)
│  │     Đặt lúc: 31/05 17:15                 │   │
│  │     ⏱ Hết hạn sau: 47:59:32              │   │  ← 48h TTL
│  └──────────────────────────────────────────┘   │
│                                                  │
│ ─────────────────────────────────────────────── │
│ [VFL chip: Tiền ảo · Giao dịch mô phỏng]        │
└──────────────────────────────────────────────────┘

── Cancel Confirmation Sheet ──────────────────────
┌──────────────────────────────────────────────────┐
│     ╌╌╌╌╌╌╌╌╌ (handle)                           │
│                                                  │
│  Hủy lệnh này?                                   │  ← Title, Space Grotesk 20
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │ LO MUA VCB · 500 cp @ 84.000 ₫           │   │  ← Order summary (read-only)
│  │ [PENDING] · Đặt lúc: 10/05 09:02         │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │           Xác nhận hủy lệnh               │  │  ← Destructive red KineticButton
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │               Không, giữ lại               │  │  ← Ghost KineticButton
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Component List

| Component | Variant |
|-----------|---------|
| `VirtualFundsLabel` | Mandatory |
| `OpenOrderRow` | New component; swipe-to-reveal cancel |
| `StockTickerChip` | Per row |
| `OrderStatusBadge` | PENDING, SUSPENDED, QUEUED |
| `TTLCountdownChip` | KR/Global orders with TTL |
| `BottomSheet` | Cancel confirmation |
| `KineticButton` | Destructive — "Xác nhận hủy lệnh"; Ghost — "Không, giữ lại" |

### State Matrix

| State | Visual |
|-------|--------|
| Loading | 3 skeleton rows |
| Empty | "Không có lệnh mở" + illustration |
| Loaded | As wireframe |
| Row swiped | Swipe reveals red "Hủy" action, 80px wide |
| Cancel submitting | Row grays out + spinner |
| Cancel success | Row animates out (slide + fade 300ms); Snackbar |

### Copy Strings

| Label | Vietnamese |
|-------|-----------|
| Screen title | Lệnh đang mở |
| Swipe hint | ← Vuốt trái để hủy lệnh |
| TTL label | ⏱ Hết hạn sau: {HH:mm:ss} |
| SUSPENDED label | TẠM DỪNG |
| QUEUED label | CHỜ GIỜ MỞ CỬA |
| Swipe action | 🗑 Hủy |
| Cancel sheet title | Hủy lệnh này? |
| Cancel CTA | Xác nhận hủy lệnh |
| Keep CTA | Không, giữ lại |
| Cancel success snackbar | Lệnh đã được hủy |
| Empty title | Không có lệnh mở |
| Empty body | Tất cả lệnh đã được khớp hoặc hủy. |

---

## Screen 9 — Portfolio Reset Dialog (Step 1 + Step 2)

**User goal:** Reset the virtual portfolio to starting conditions with double confirmation.

```
── Step 1 Modal ──────────────────────────────────
┌──────────────────────────────────────────────────┐
│  (dim overlay — ink-900 at 70% opacity)          │
│                                                  │
│       ┌──────────────────────────────────┐       │
│       │                                  │       │
│       │   ⚠  (amber warning icon 48px)   │       │
│       │                                  │       │
│       │  Đặt lại danh mục?               │       │  ← Space Grotesk 22 Bold
│       │                                  │       │
│       │  Toàn bộ vị thế sẽ được đóng,   │       │  ← Manrope 14
│       │  lệnh mở sẽ bị hủy. Số dư của   │       │
│       │  bạn sẽ được khôi phục về        │       │
│       │  500.000.000 ₫.                  │       │
│       │                                  │       │
│       │  Lịch sử giao dịch sẽ được giữ  │       │  ← Manrope 14
│       │  lại với nhãn [Pre-Reset].       │       │
│       │                                  │       │
│       │  ┌──────────────────────────┐    │       │
│       │  │         Tiếp tục         │    │       │  ← Ghost KineticButton (NOT lime)
│       │  └──────────────────────────┘    │       │
│       │                                  │       │
│       │  ┌──────────────────────────┐    │       │
│       │  │           Hủy            │    │       │  ← Ghost KineticButton
│       │  └──────────────────────────┘    │       │
│       │                                  │       │
│       └──────────────────────────────────┘       │
└──────────────────────────────────────────────────┘

── Step 2 Modal (animated transition from Step 1) ────────────────────
┌──────────────────────────────────────────────────┐
│  (dim overlay)                                   │
│                                                  │
│       ┌──────────────────────────────────┐       │
│       │                                  │       │
│       │  ⛔  (red icon 48px)              │       │
│       │                                  │       │
│       │  Xác nhận đặt lại?               │       │  ← Space Grotesk 22 Bold
│       │                                  │       │
│       │  Thao tác này không thể hoàn     │       │
│       │  tác. Toàn bộ vị thế và lệnh     │       │
│       │  mở sẽ bị đóng.                  │       │
│       │                                  │       │
│       │  Nhập "ĐẶT LẠI" để xác nhận:    │       │  ← Instruction label
│       │  ┌──────────────────────────┐    │       │
│       │  │                          │    │       │  ← Text input (ink-600 bg)
│       │  └──────────────────────────┘    │       │
│       │                                  │       │
│       │  ┌──────────────────────────┐    │       │
│       │  │    Xác nhận đặt lại      │    │       │  ← Destructive red KineticButton
│       │  └──────────────────────────┘    │       │  ← Disabled until "ĐẶT LẠI" typed
│       │                                  │       │
│       │  [← Quay lại]                    │       │  ← Ghost link, returns to Step 1
│       │                                  │       │
│       └──────────────────────────────────┘       │
└──────────────────────────────────────────────────┘
```

### Component List

| Component | Variant |
|-----------|---------|
| `KineticButton` | Ghost — "Tiếp tục" (Step 1), "Hủy" (Step 1) |
| `KineticButton` | Destructive red — "Xác nhận đặt lại" (Step 2, disabled state → enabled) |

### State Matrix

| State | Visual |
|-------|--------|
| Step 1 default | As Step 1 wireframe |
| Step 2 default | Confirmation CTA disabled (grayed out) |
| Step 2 typing | Text matches "ĐẶT LẠI" → CTA enables (red) |
| Step 2 submitting | CTA shows spinner; input disabled |
| Error | Error text in modal: "Đặt lại không thành công. Vui lòng thử lại." |

### Interaction Notes
- "Hủy" or tap outside modal → dismiss; no action
- "← Quay lại" in Step 2 → animate back to Step 1 state (reverse panel swap)
- Text input is case-sensitive: "ĐẶT LẠI" in uppercase required
- `VirtualFundsLabel` chip is NOT required inside the reset modal (modal is an overlay)

### Copy Strings — Step 1

| Label | Vietnamese |
|-------|-----------|
| Modal title | Đặt lại danh mục? |
| Body line 1 | Toàn bộ vị thế sẽ được đóng, lệnh mở sẽ bị hủy. Số dư của bạn sẽ được khôi phục về 500.000.000 ₫. |
| Body line 2 | Lịch sử giao dịch sẽ được giữ lại với nhãn [Pre-Reset]. |
| Continue CTA | Tiếp tục |
| Cancel | Hủy |

### Copy Strings — Step 2

| Label | Vietnamese |
|-------|-----------|
| Modal title | Xác nhận đặt lại? |
| Body | Thao tác này không thể hoàn tác. Toàn bộ vị thế và lệnh mở sẽ bị đóng. |
| Input instruction | Nhập "ĐẶT LẠI" để xác nhận: |
| Input placeholder | ĐẶT LẠI |
| Confirm CTA | Xác nhận đặt lại |
| Back link | ← Quay lại |
| Error message | Đặt lại không thành công. Vui lòng thử lại. |

---

## Screen 10 — Order Fill Notification Detail

**User goal:** View the full details of an order that has been filled (partially or fully).

```
┌──────────────────────────────────────────────────┐
│ Status bar                                        │
├──────────────────────────────────────────────────┤
│  [← Quay lại]     Chi tiết lệnh khớp            │  ← Header 56px
├──────────────────────────────────────────────────┤
│                                                  │
│  [VFL: Tiền ảo]                                  │
│                                                  │
│  ╔════════════════════════════════════════════╗  │
│  ║  [FILLED]                      10/05/2026  ║  │  ← Status badge + date
│  ║                                           ║  │
│  ║  [HOSE]  MUA  VCB                         ║  │  ← Direction + ticker, large
│  ║                                           ║  │
│  ║  1.000 cổ phần                            ║  │  ← Qty, display-lg
│  ║  @ 85.000 ₫ mỗi cổ phần                  ║  │  ← Price, fog
│  ╚════════════════════════════════════════════╝  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Loại lệnh                    LO / GTD   │   │
│  │  Giá đặt                      84.000 ₫   │   │
│  │  Giá khớp                     85.000 ₫   │   │
│  │  Số lượng đặt            1.000 cổ phần   │   │
│  │  Số lượng khớp           1.000 cổ phần   │   │
│  │  Tổng giá trị         85.000.000 ₫       │   │
│  │  Phí giao dịch            212.500 ₫      │   │
│  │  ─────────────────────────────────────── │   │
│  │  Tổng thanh toán      85.212.500 ₫       │   │  ← Bold
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Tác động đến danh mục                   │   │  ← Section header
│  │                                          │   │
│  │  Số dư tiền mặt sau lệnh                 │   │
│  │  100.195.000 ₫   [PnL–] –85.212.500 ₫   │   │
│  │                                          │   │
│  │  VCB: Giá mua TB mới                     │   │
│  │  85.000 ₫ / cp                           │   │  ← Updated avg cost
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ─ Khớp một phần (nếu applicable) ──────────    │
│  ┌──────────────────────────────────────────┐   │
│  │  Đã khớp: 600 / 1.000 cp  [PARTIALLY_FILLED]│
│  │  Còn lại: 400 cp đang PENDING            │   │
│  └──────────────────────────────────────────┘   │
│  ← This block only shown for partial fills      │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │               Về danh mục                 │  │  ← Lime KineticButton (primary)
│  └────────────────────────────────────────────┘  │
│                                                  │
│ ─────────────────────────────────────────────── │
│ [VFL chip: Tiền ảo · Giao dịch mô phỏng]        │
└──────────────────────────────────────────────────┘
```

### Component List

| Component | Variant |
|-----------|---------|
| `VirtualFundsLabel` | Mandatory |
| `StockTickerChip` | Exchange chip |
| `OrderStatusBadge` | FILLED (green) or PARTIALLY_FILLED (blue) |
| `PnLLabel` | Cash change post-order |
| `KineticButton` | Lime — "Về danh mục" |

### State Matrix

| State | Visual |
|-------|--------|
| Loading | Skeleton for header card + detail rows |
| Full fill | Partial fill block hidden |
| Partial fill | Partial fill block visible with remaining qty + PENDING status |
| Error loading | "Không tải được thông tin lệnh." + "Thử lại" link |

### Copy Strings

| Label | Vietnamese |
|-------|-----------|
| Screen title | Chi tiết lệnh khớp |
| Order type row | Loại lệnh |
| Limit price row | Giá đặt |
| Fill price row | Giá khớp |
| Ordered qty row | Số lượng đặt |
| Filled qty row | Số lượng khớp |
| Total value row | Tổng giá trị |
| Fee row | Phí giao dịch |
| Total payment | Tổng thanh toán |
| Portfolio impact header | Tác động đến danh mục |
| Cash after label | Số dư tiền mặt sau lệnh |
| New avg cost label | {ticker}: Giá mua TB mới |
| Partial fill label | Đã khớp: {filled} / {ordered} cp |
| Remaining label | Còn lại: {N} cp đang PENDING |
| Primary CTA | Về danh mục |
| Loading error | Không tải được thông tin lệnh. |
| Retry | Thử lại |

---

## Appendix A — Portfolio Reset Success State

This is a transient state rendered within `PortfolioResetModal` after a successful reset API call. It replaces the Step 2 modal content with an animated celebration state.

```
┌──────────────────────────────────────────────────┐
│  (dim overlay with AmbientBackground activated)  │
│  (lime + plasma orbs animate in background)      │
│                                                  │
│       ┌──────────────────────────────────┐       │
│       │  (AmbientBackground: orb anim)   │       │
│       │                                  │       │
│       │      ✓  (lime checkmark 64px)    │       │
│       │                                  │       │
│       │  Đã đặt lại thành công!          │       │  ← Space Grotesk Display Bold
│       │                                  │       │
│       │  Số dư của bạn đã được khôi      │       │  ← Manrope 15
│       │  phục về                         │       │
│       │  500.000.000 ₫                   │       │  ← Space Grotesk SemiBold, lime
│       │                                  │       │
│       │  Bắt đầu lại hành trình          │       │  ← fog, Manrope 13
│       │  đầu tư của bạn.                 │       │
│       │                                  │       │
│       │  ┌──────────────────────────┐    │       │
│       │  │       Bắt đầu lại        │    │       │  ← Lime KineticButton
│       │  └──────────────────────────┘    │       │
│       │                                  │       │
│       │  Tự động đóng sau 5 giây...      │       │  ← fog 11px countdown
│       │                                  │       │
│       └──────────────────────────────────┘       │
└──────────────────────────────────────────────────┘
```

### Copy Strings

| Label | Vietnamese |
|-------|-----------|
| Success title | Đã đặt lại thành công! |
| Body line 1 | Số dư của bạn đã được khôi phục về |
| Balance | 500.000.000 ₫ |
| Body line 2 | Bắt đầu lại hành trình đầu tư của bạn. |
| CTA | Bắt đầu lại |
| Auto-close | Tự động đóng sau {N} giây... |

---

## Appendix B — VirtualFundsLabel Chip Spec

The `VirtualFundsLabel` chip appears on every portfolio screen. It is a non-dismissible informational chip. Do not treat it as a button.

```
┌──────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────┐  │
│  │ ● Tiền ảo · Giao dịch mô phỏng            │  │  ← h=28px, lime border 1px
│  └────────────────────────────────────────────┘  │  ← bg: rgba(202,253,0,0.06)
└──────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 28px |
| Padding | 4px 12px |
| Border | 1px solid lime (#CAFD00) |
| Background | `rgba(202,253,0,0.06)` |
| Bullet | Lime dot (6px) |
| Text | "Tiền ảo · Giao dịch mô phỏng" |
| Font | Manrope 11 SemiBold, lime |
| Locale | `vi`: "Tiền ảo" · `ko`: "가상 자금" · `en`: "Virtual Funds" |
| Dismissible | No — never |
| Position on Dashboard | Fixed, above bottom nav bar |
| Position on other screens | Top of scrollable content area, below screen header |

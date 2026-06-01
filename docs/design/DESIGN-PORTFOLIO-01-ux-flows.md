# UX Flows — Portfolio / Virtual Trading Dashboard
## Paave Mobile — Design System: Kinetic Drop V2.0

**Document version:** 1.0
**Date:** 2026-06-01
**Module ID:** F-PORTFOLIO
**Status:** Ready for Design
**Depends on:** `DESIGN-PORTFOLIO-00-alignment.md` — read alignment doc first

---

## How to Read This Document

Each flow is structured as:
- **Entry trigger** — what causes the user to land on this screen/state
- **Numbered steps** — ordered actions and system responses
- **Screen states** — loading / loaded / error / empty conditions
- **Exit points** — where the user goes next

Vietnamese copy appears in quotes exactly as it should be rendered. All financial values are illustrative.

---

## Tab 1 — Portfolio Dashboard: Entry Flow

### Entry Trigger
User taps the "Danh mục" (Portfolio) icon in the bottom navigation bar.

### Steps
1. App receives tab press event.
2. Navigation stack pushes `PortfolioDashboardScreen`.
3. Screen renders with full `SkeletonLoader` layout for all 7 sections simultaneously.
4. Two parallel API calls fire:
   - `GET /api/v1/virtual/portfolio/summary` → feeds Header + Cash sections
   - `GET /api/v1/virtual/portfolio/holdings` → feeds Holdings section
5. `SkeletonLoader` items pulse (opacity 0.4 → 0.8 loop, 1.2s interval).
6. First API response arrives → relevant section skeletons replaced with real data; unreturned sections remain skeleton.
7. Chart section fires its own call: `GET /api/v1/virtual/portfolio/chart?range=1D`
8. All sections loaded → full dashboard rendered.
9. 15-second polling timer starts for the Header section only (`GET /api/v1/virtual/portfolio/summary`).
10. `VirtualFundsLabel` chip is mounted as a persistent overlay — appears above the bottom nav, below all scroll content. It does not scroll with content.

### Screen States

| State | Trigger | Visual |
|-------|---------|--------|
| Loading | Initial mount, no data yet | All 7 sections show `SkeletonLoader` |
| Partial | Some API calls returned | Loaded sections show data; pending sections remain skeleton |
| Loaded | All API calls returned | Full dashboard visible |
| Refresh | 15s timer fires | Header section briefly shows skeleton pulse for 200ms; other sections do not re-skeleton |
| Error — network | API call fails | Section-level inline error: "Không tải được dữ liệu. Thử lại." with retry button; other sections unaffected |
| Error — session expired | 401 returned | Full-screen error modal: "Phiên đăng nhập hết hạn" with "Đăng nhập lại" CTA |

---

## Flow A — Portfolio Dashboard (Full Interaction Flow)

### Entry Trigger
Dashboard is in Loaded state.

### A1 — Pull-to-Refresh
1. User pulls down from top of scroll view (threshold: 60px overscroll).
2. System fires all 4 API calls simultaneously (same calls as initial mount).
3. Refresh indicator (standard spinner, lime color) appears in the overscroll area.
4. Data returns → all sections update in place (no skeleton; values update directly).
5. Spinner dismisses.

### A2 — Scroll Behavior
1. Dashboard is a single `ScrollView`. All 7 sections scroll together.
2. `VirtualFundsLabel` chip is position-fixed above the bottom tab bar — it does NOT scroll.
3. Header section (portfolio total) does NOT have sticky behavior in V1. It scrolls out of view.

### A3 — Holdings List Interaction
1. Default display: top 5 holdings by P&L% descending.
2. If holdings count > 5: a "Xem tất cả X cổ phiếu →" row appears at the bottom of the section.
3. Tap any holding row → navigate to `HoldingDetailScreen` (Flow E).
4. Tap "Xem tất cả" → same `HoldingDetailScreen` but in list mode. *(Designer note: confirm with PM — may be a separate full-screen list screen.)*
5. Holding rows with an active sell order show: "🔒 X cổ phần đang bị khóa" beneath the ticker.

### A4 — Chart Tab Interaction
1. Default tab: 1D (today).
2. User taps a tab (1W / 1M / 3M / 1Y) → chart section shows a brief 200ms skeleton pulse.
3. API call fires: `GET /api/v1/virtual/portfolio/chart?range={tab}`.
4. Chart re-renders with new data. X-axis labels update to match range.
5. Dotted lime baseline at 500M VND is always visible regardless of range.
6. If a portfolio reset occurred within the selected range: vertical dashed gray `ResetEventMarker` appears at the reset date with "Đặt lại" label.

### A5 — Chart Scrub (Drag Interaction)
1. User presses and holds on the chart area.
2. A lime dot tracks the nearest data point.
3. A crosshair line appears (vertical only).
4. A tooltip appears above the chart: "Portfolio: 523.4M VND / +4.68% / 15 Th5".
5. Haptic feedback: `impactLight` once on initial press; no repeat haptics during drag.
6. On release: tooltip fades out; dot returns to end-of-range position.

### A6 — Realized P&L Section Interaction
1. User taps the Realized P&L row/card.
2. Navigate to `PnLAnalyticsScreen` (Flow — Realized P&L Breakdown).

### A7 — Trade History "See All"
1. User taps "Xem tất cả giao dịch →" link at bottom of Trade History section.
2. Navigate to `TradeHistoryScreen` (Flow F).

### A8 — Open Orders "See All"
1. User taps "Xem tất cả lệnh →" link at bottom of Open Orders section.
2. Navigate to `OpenOrdersScreen` (Flow C).

### A9 — "Đặt lệnh" Floating CTA (if present)
1. A lime `KineticButton` "Đặt lệnh" is accessible from the dashboard. *(Implementation decision: fixed FAB above `VirtualFundsLabel` chip, or CTA within Holdings section.)*
2. Tap → Order Entry bottom sheet opens (Flow B).

---

## Flow B — Place Order (Buy / Sell)

### Entry Triggers
- Tap "Mua" or "Bán" button on `HoldingDetailScreen`
- Tap "Đặt lệnh" FAB on Portfolio Dashboard
- Tap "Mua" from stock search / market screen (out of scope of Portfolio — passed as deeplink)

### B1 — Order Entry Bottom Sheet Opens
1. `PlaceOrderBottomSheet` slides up from bottom edge (spring animation, 320ms).
2. Default state:
   - Buy/Sell toggle at top: Buy tab active (lime underline) if launched from "Mua"; Sell tab active if from "Bán".
   - Ticker display: shows stock code + `StockTickerChip` exchange label.
   - Current price chip: latest price, fog text.
   - Order type selector defaults to "LO" (Limit Order).
3. `VirtualFundsLabel` chip remains visible above bottom nav, behind the sheet handle.

### B2 — Order Type Selection
1. User taps order type selector (segmented control: LO / MARKET / ATO / ATC / STOP / STOP_LIMIT).
2. Form fields animate in/out based on type:

| Order Type | Fields Shown |
|------------|-------------|
| LO | Price (numeric input), Quantity, Validity (GTD / GTC_30D toggle) |
| MARKET | Quantity only. Price field hidden. Estimated fill note shown. |
| ATO | Quantity only. Price field hidden. "Lệnh khớp mở cửa" note. Only enabled pre-opening. |
| ATC | Quantity only. Price field hidden. "Lệnh khớp đóng cửa" note. Only enabled ATC period. |
| STOP | Stop price, Quantity |
| STOP_LIMIT | Stop price, Limit price, Quantity |

3. If ATO selected outside pre-opening window: type selector disabled with tooltip "Chỉ đặt được trước giờ mở cửa".
4. If ATC selected outside ATC window: type selector disabled with tooltip "Chỉ đặt được trong phiên đóng cửa".

### B3 — Fill in Price and Quantity
1. User taps Price field → numeric keyboard appears.
2. Price field: formatted with thousand separators in real-time (Space Grotesk, tabular-nums).
3. User taps Quantity field → numeric keyboard.
4. As Quantity is typed:
   - **Buy LO:** "Số tiền sẽ được giữ: X VND" appears below quantity field (total reserve = price × qty + estimated fee).
   - **Sell:** "Bạn đang bán X / Y cổ phần" appears as a fraction. If qty > available (unlocked), field turns red with error: "Vượt quá số lượng khả dụng".
5. Available cash (buy) or available shares (sell) shown as metadata below inputs.

### B4 — Validation
All validation is real-time (fires on field blur and on CTA tap):

| Validation | Error Copy |
|------------|------------|
| Quantity = 0 | "Vui lòng nhập số lượng" |
| Quantity > available shares (sell) | "Không đủ số cổ phần khả dụng" |
| Total cost > available cash (buy) | "Số dư tiền mặt không đủ" |
| Price ≤ 0 (LO / STOP types) | "Giá phải lớn hơn 0" |
| Price not in valid tick (LO) | "Giá không hợp lệ — bước giá: X VND" |

### B5 — Submit for Confirmation
1. User taps "Xem xác nhận" (ghost or lime button depending on validation state).
2. If validation passes: bottom sheet dismisses (slide-down, 240ms).
3. Navigate to `OrderConfirmationScreen` with order parameters passed as navigation props.

### B6 — Order Confirmation Screen
1. Screen renders summary of the order (read-only).
2. For MARKET orders: simulated fee shown in a highlighted amber box: "Phí ước tính: X VND".
3. For Buy LO: "Số tiền sẽ được giữ: X VND" shown with reservation info icon.
4. Confirm CTA: "Xác nhận đặt lệnh" (lime KineticButton, full-width).
5. Cancel link: "Hủy" (ghost text link above CTA).

### B7 — Order Submission
1. User taps "Xác nhận đặt lệnh".
2. Button enters loading state (lime spinner, button disabled).
3. `POST /api/v1/virtual/orders` fires.

**On Success:**
4a. Button exits loading state.
4b. Screen pops back to dashboard (or holding detail).
4c. `Snackbar` appears: "Đặt lệnh thành công" with check icon. Auto-dismisses after 3s.
4d. Open Orders section on dashboard updates on next poll.

**On Fill (immediate — MARKET orders usually):**
4e. `Snackbar` copy changes to: "Lệnh đã khớp — VCB 1,000 cp @ 85,000 VND".
4f. Navigating to Order Fill Notification Detail is optional (user may tap snackbar).

**On Error:**
4g. Button exits loading state.
4h. Inline error banner appears above CTA: error message from API (e.g., "Thị trường đã đóng cửa").

### B8 — Order Fill Notification Detail
1. Entry: user taps the fill Snackbar, OR navigates from Open Orders status change.
2. Screen shows full fill details: ticker, order type, qty filled, price, fee, timestamp, net P&L impact.
3. Single CTA: "Về danh mục" (lime) navigates back to dashboard.
4. If partial fill: shows qty filled vs qty ordered; "Lệnh còn lại: X cp PENDING".

---

## Flow C — Order Management (Open Orders)

### Entry Triggers
- Tap "Xem tất cả lệnh →" on dashboard Open Orders section
- Tap a specific order row on dashboard

### C1 — Open Orders Screen Load
1. `OpenOrdersScreen` slides in from right (standard push).
2. Full list of open orders loads. `SkeletonLoader` shown during fetch.
3. Each row shows: ticker, `StockTickerChip`, order type, direction (MUA/BÁN), qty, price, `OrderStatusBadge`, timestamp.
4. KR/Global orders show `TTLCountdownChip` inline with the order type.
5. SUSPENDED orders show `OrderStatusBadge` in plasma color with "TẠM DỪNG" text.

### C2 — Swipe to Cancel
1. User swipes a row LEFT (threshold: 60px).
2. A red "Hủy" action button (destructive) is revealed on the right side of the row.
3. User taps "Hủy" → Cancel Confirmation bottom sheet:
   - Title: "Hủy lệnh này?"
   - Body: shows order summary (ticker, qty, price).
   - CTA: "Xác nhận hủy" (destructive red KineticButton).
   - Cancel: "Không" (ghost KineticButton).
4. User confirms → `DELETE /api/v1/virtual/orders/{orderId}` fires.
5. On success: row animates out (slide + fade, 300ms). `Snackbar`: "Lệnh đã được hủy".
6. If swipe threshold not met (< 60px): row springs back.

### C3 — Filter / Sort (if in scope for V1)
*(Confirm with PM — defer to V2 if not confirmed.)*
1. Filter icon in header → filter drawer slides in.
2. Filter options: All / PENDING / PARTIALLY_FILLED / SUSPENDED.
3. Sort options: Newest first / Oldest first.

---

## Flow D — Portfolio Reset

### Entry Trigger
- Settings icon (···) on Portfolio Dashboard header → "Đặt lại danh mục" option
- Or: dedicated reset option in Profile / Settings (out of scope here)

### D1 — Reset Dialog Step 1 Opens
1. `PortfolioResetModal` presents as a center modal (dim overlay, 60% opacity).
2. Step 1 content:
   - Icon: warning triangle (amber).
   - Title: "Đặt lại danh mục?"
   - Body: explains consequences (all positions closed, orders cancelled, balance restored to 500M VND, history retained with [Pre-Reset] label).
   - CTA: "Tiếp tục" (ghost, not lime — this is a destructive flow; lime reserved for the final confirm).
   - Cancel: "Hủy" (ghost).
3. Tapping "Hủy" or outside the modal → modal dismisses; no action taken.

### D2 — Reset Dialog Step 2 (Double Confirmation)
1. Modal transitions to Step 2 (animated panel swap within the same modal container).
2. Step 2 content:
   - Title: "Xác nhận đặt lại?"
   - Body: "Thao tác này không thể hoàn tác. Toàn bộ vị thế và lệnh mở sẽ bị đóng."
   - Text input: user must type "ĐẶT LẠI" to enable the confirm button.
   - CTA: "Xác nhận đặt lại" (destructive red KineticButton) — disabled until text input matches.
   - Back: "← Quay lại" (ghost, returns to Step 1).

### D3 — Reset Execution
1. User types "ĐẶT LẠI" → CTA enables.
2. User taps "Xác nhận đặt lại".
3. CTA enters loading state (spinner).
4. `POST /api/v1/virtual/portfolio/reset` fires.
5. On success → transition to Reset Success state (D4).
6. On error → inline error in modal: "Đặt lại không thành công. Vui lòng thử lại." CTA re-enables.

### D4 — Reset Success (Celebration)
1. Modal transitions to success state.
2. `AmbientBackground` component activates: lime/plasma orb animation fills the modal background.
3. Content:
   - Large checkmark icon (lime, 64px).
   - Title: "Đã đặt lại thành công!" (Space Grotesk Display).
   - Body: "Số dư của bạn đã được khôi phục về 500.000.000 VND".
4. Single CTA: "Bắt đầu lại" (lime KineticButton).
5. Tapping CTA → modal dismisses; dashboard re-fetches all data; all sections reload (full skeleton cycle).
6. Chart resets to 1D tab showing flat baseline (balance = 500M = baseline).
7. Auto-dismiss: if user does not tap within 5s, modal auto-dismisses and dashboard reloads.

---

## Flow E — Holdings Detail

### Entry Trigger
User taps any holding row on the Portfolio Dashboard Holdings section.

### E1 — Holdings Detail Screen Load
1. `HoldingDetailScreen` slides in from right (standard push).
2. Header: back chevron + stock ticker + exchange chip + "···" overflow menu.
3. Data sections load:
   - Current price (large), intraday change
   - Position summary: quantity, avg buy price, current value, unrealized P&L (PnLLabel)
   - Locked shares note (if active sell order): "🔒 X cổ phần đang bị khóa"
   - Mini chart: intraday chart for this stock (not portfolio chart)
   - Transactions for this stock: chronological list of all buys/sells

### E2 — Primary Actions
1. "Mua thêm" (Buy More): lime KineticButton. Taps → Order Entry (Flow B, Buy mode, ticker pre-filled).
2. "Bán" (Sell): ghost KineticButton. Taps → Order Entry (Flow B, Sell mode, ticker pre-filled).
3. If all shares locked in sell orders: "Bán" button disabled with tooltip "Tất cả cổ phần đang bị khóa".

### E3 — Overflow Menu (···)
1. Tap "···" → contextual menu:
   - "Xem trên thị trường" (View on Market — navigates to stock detail screen, out of Portfolio scope)
   - "Tất cả giao dịch" (navigate to Trade History filtered for this ticker)

---

## Flow F — Trade History

### Entry Triggers
- Tap "Xem tất cả giao dịch →" on Portfolio Dashboard
- From HoldingDetailScreen "Tất cả giao dịch" overflow menu item

### F1 — Trade History Screen Load
1. `TradeHistoryScreen` slides in from right.
2. Full list loads with pagination (20 items per page). `SkeletonLoader` during initial fetch.
3. Each row: `TradeHistoryRow` component. See wireframe doc for row layout.
4. [Pre-Reset] label appears on trades that occurred before the most recent reset.
5. Exchange chip (`StockTickerChip`) visible on each row.

### F2 — Filter Interaction
1. Filter icon in header → filter drawer opens from right (or bottom sheet — confirm with design lead).
2. Filter options:
   - Direction: Tất cả / Mua / Bán
   - Exchange: Tất cả / HOSE / HNX / UPCOM / KOSPI / US
   - Date range: picker (Today / 1 tuần / 1 tháng / Tùy chỉnh)
   - Pre-Reset: Ẩn / Hiện
3. Active filter count badge on the filter icon.
4. "Xóa bộ lọc" (Clear filters) link visible when any filter is active.

### F3 — Pagination
1. List loads 20 items.
2. Scrolling to bottom → "Đang tải..." indicator → next page loads and appends.
3. End of list: "Đã hiển thị tất cả giao dịch" footer text.

### F4 — Tap on Row
1. Tap a trade row → navigate to Order Fill Notification Detail (read-only view of the trade).

---

## Navigation Map

```
Bottom Nav: "Danh mục"
       │
       ▼
PortfolioDashboardScreen (main)
  ├── Holdings section row tap ──────────────► HoldingDetailScreen
  │                                              ├── "Mua thêm" ───► PlaceOrderBottomSheet (Buy)
  │                                              └── "Bán" ────────► PlaceOrderBottomSheet (Sell)
  │
  ├── "Xem tất cả lệnh →" ──────────────────► OpenOrdersScreen
  │                                              └── swipe cancel → CancelConfirmationSheet
  │
  ├── "Xem tất cả giao dịch →" ──────────────► TradeHistoryScreen
  │                                              └── row tap ──────► OrderFillNotificationScreen
  │
  ├── Realized P&L section tap ─────────────► PnLAnalyticsScreen (modal or push)
  │
  ├── "···" menu → "Đặt lại danh mục" ──────► PortfolioResetModal
  │                                              └── success state → dashboard reload
  │
  └── (FAB or section CTA) "Đặt lệnh" ──────► PlaceOrderBottomSheet
                                                 └── "Xem xác nhận" ► OrderConfirmationScreen
                                                                        └── success ──► Dashboard
                                                                                    + Snackbar
                                                                        └── fill ────► OrderFillNotificationScreen
```

---

## State Map — Screen State Matrix

| Screen | Loading | Empty | Partial | Full / Normal | Error |
|--------|---------|-------|---------|--------------|-------|
| Portfolio Dashboard | All 7 sections: `SkeletonLoader` | N/A (account always exists) | Some sections loaded, others still skeleton | All sections rendered with live data | Inline per-section retry; network banner for full failure |
| Holdings Detail | Skeleton rows | "Bạn chưa nắm giữ cổ phiếu này" (shouldn't occur from normal nav) | N/A | Full position + mini chart + transaction list | Inline error + retry |
| Trade History | Skeleton list (3 ghost rows) | "Chưa có giao dịch nào" with illustration | First page loaded | Full list with pagination | Inline retry button |
| Open Orders | Skeleton list | "Không có lệnh mở" with illustration | N/A | Full list | Inline retry |
| Order Entry Sheet | N/A | N/A | N/A | Form with real-time validation | Field-level inline errors |
| Order Confirmation | Brief skeleton (200ms) while props load | N/A | N/A | Full order summary | Error banner above CTA |
| Order Fill Notification | Skeleton (100ms) | N/A | N/A | Full fill details | "Không tải được thông tin lệnh. Thử lại." |
| P&L Analytics | Skeleton chart + rows | "Chưa có giao dịch nào đã chốt" | N/A | Lifetime total + chart + breakdown table | Inline error |
| Portfolio Reset Modal | CTA spinner during API call | N/A | N/A | Step 1 → Step 2 → Success | Error message in modal |
| Reset Success | N/A | N/A | N/A | Celebration + CTA | N/A |

### Empty State Copy

| Screen | Empty State Title | Empty State Body |
|--------|-------------------|-----------------|
| Trade History | "Chưa có giao dịch nào" | "Đặt lệnh đầu tiên của bạn để bắt đầu xây dựng lịch sử giao dịch." |
| Open Orders | "Không có lệnh mở" | "Tất cả lệnh đã được khớp hoặc hủy." |
| Holdings (Dashboard) | "Bạn chưa có cổ phiếu nào" | "Đặt lệnh mua đầu tiên để bắt đầu." CTA: "Khám phá thị trường" (ghost KineticButton) |
| P&L Analytics | "Chưa có lợi nhuận thực hiện" | "Bán cổ phiếu để ghi nhận lợi nhuận hoặc lỗ." |

### Error State Copy

| Scenario | Toast / Banner Copy |
|----------|---------------------|
| Network failure | "Không có kết nối mạng. Kiểm tra lại." |
| API 500 error | "Có lỗi xảy ra. Vui lòng thử lại." |
| Market closed (order attempt) | "Thị trường đã đóng cửa. Lệnh sẽ chờ phiên tiếp theo." |
| Insufficient funds (buy) | "Số dư tiền mặt không đủ để đặt lệnh này." |
| Insufficient shares (sell) | "Không đủ số cổ phần khả dụng." |
| Order rejected | "Lệnh bị từ chối: [lý do từ API]." |
| Session expired | "Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục." |

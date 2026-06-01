# Design Alignment — Portfolio / Virtual Trading Dashboard
## Paave Mobile — Design System: Kinetic Drop V2.0

**Document version:** 1.0
**Date:** 2026-06-01
**Module ID:** F-PORTFOLIO
**Design System:** Paave V2.0 "Kinetic Drop"
**Status:** Ready for Design — Engineering Review Pending
**Author:** Design Alignment Agent

---

> **BREAKING CHANGES WARNING**
> This is a NEW module with no prior design version. There are no breaking changes to existing screens, but designers must note that the Portfolio tab introduces new token aliases (`chart-baseline`, `order-status-*`) and three new components (`PortfolioChartSection`, `OrderStatusBadge`, `TradeHistoryRow`) that do not exist in the current Kinetic Drop component library. Coordinate with the design system lead before publishing to Figma main branch.

---

## 1. Read Before Designing

| # | File | Path | When to Read |
|---|------|------|-------------|
| 1 | Portfolio Index | `docs/business/portfolio/00-index.md` | First — architecture overview, screen map, key decisions |
| 2 | Portfolio Requirements FRD | `docs/business/portfolio/01-requirements.md` | Before designing any screen — FR-PORT-01 through FR-PORT-10 |
| 3 | Virtual Trading API Spec | `docs/api/virtual-trading-api-spec.md` | Before designing loading/error states and data-heavy sections |
| 4 | F0 Learning Path Dev/QA Spec | `docs/DEV-QA-SPEC-F0-Learning-Path.md` | For design system token reference and pattern precedents |
| 5 | UX Flows (this suite) | `docs/design/DESIGN-PORTFOLIO-01-ux-flows.md` | Before opening Figma — understand every flow before placing a frame |
| 6 | Wireframe Specs (this suite) | `docs/design/DESIGN-PORTFOLIO-02-wireframes.md` | Primary reference during frame construction |

---

## 2. Alignment Summary

```
Project:        Paave Vietnamese Mobile Investing App
Feature:        Portfolio / Virtual Trading Dashboard
Module ID:      F-PORTFOLIO
Business Goal:  Enable F0 traders (age 16–27) to practice equity investing
                with simulated funds (500M VND) across VN/KR/Global markets,
                building real trading intuition while eliminating financial
                risk. The portfolio tab is the primary feedback loop that shows
                learners whether their strategy decisions are working.
Primary User:   F0 Vietnamese trader, age 16–27, first brokerage-like
                experience, likely using a mid-range Android device, in
                Vietnamese language. Highly motivated by P&L feedback,
                rankings, and visible progress.
Success Metrics:
  - ≥ 70% of users who place their first order return to the portfolio tab
    within 24 hours to check their position
  - Average session time on Portfolio tab ≥ 90 seconds
  - < 2% of users accidentally believe they are trading with real money
    (measured via post-session survey; VirtualFundsLabel compliance)
  - Order placement completion rate ≥ 80% (started → confirmed)

Core Flow (Happy Path):
  1. User taps Portfolio tab from bottom nav bar
  2. Dashboard loads with skeleton → populates all 7 sections
  3. User sees total portfolio value, cash, holdings, and chart
  4. User taps a holding row → Holdings Detail screen
  5. User taps "Đặt lệnh mua/bán" → Order Entry bottom sheet
  6. User fills in quantity and price → taps "Xem xác nhận"
  7. Order Confirmation screen shown with fee simulation
  8. User taps "Xác nhận đặt lệnh" → order submitted
  9. Snackbar confirmation; Open Orders section updates
 10. Order fills → Fill Notification Detail shown
 11. Holdings section and P&L update on next 15s refresh

Key Business Rules (designer-critical):
  - "Tiền ảo" chip (VirtualFundsLabel) MUST appear on every portfolio
    screen without exception. It is non-dismissible. Regulatory requirement.
  - Starting balance is exactly 500,000,000 VND. Never show a "top-up" or
    "add funds" CTA anywhere in this feature.
  - P&L values always use PnLLabel component: positive (#10B981 green),
    negative (#EF4444 red), zero (#ADAAAA fog/gray). Never plain white text.
  - ONE lime primary CTA per screen maximum. If two actions exist, the
    secondary action uses KineticButton ghost variant.
  - Financial values (prices, amounts, P&L) always use Space Grotesk font
    with tabular-nums feature enabled. Never Manrope for numbers.
  - Chart dotted baseline at exactly 500M VND (the reset baseline).
  - Sell order: lock icon + "X cổ phần đang bị khóa" shown on holding row.
  - Buy limit order: reserve amount shown on confirmation: "Số tiền sẽ
    được giữ: X VND".
  - MARKET order: simulated fee shown prominently on confirmation screen.
  - Portfolio Reset requires two-step confirmation. No single-tap reset.
  - Trade history items from before a reset carry "[Pre-Reset]" label.
  - KR/Global open orders show TTL countdown timer and QUEUED_AFTER_HOURS
    status where applicable.
  - ATO orders: available pre-opening only, no price field shown.
  - ATC orders: available ATC period only, no price field shown.

V1 Scope (IN):
  - Portfolio Dashboard (7-section scrollable screen)
  - Holdings Detail screen
  - Order Entry (Buy and Sell variants) — bottom sheet
  - Order Confirmation screen
  - Order Fill Notification Detail
  - Trade History (full-screen with filters)
  - Open Orders (full-screen with swipe-to-cancel)
  - Realized P&L Breakdown (modal/screen)
  - Portfolio Reset Dialog (2-step)
  - Portfolio Reset Success (celebration state)
  - All 6 order types: MARKET, LO, ATO, ATC, STOP_LIMIT, STOP
  - All exchanges: HOSE, HNX, UPCOM, KOSPI, US (NYSE/NASDAQ)
  - VirtualFundsLabel chip on all screens
  - 15-second auto-refresh on dashboard header

V2 Deferred (OUT):
  - Social / leaderboard integration from Portfolio tab
  - AI-generated portfolio health commentary ("Your portfolio is down 3% vs
    peers who completed Module 4")
  - Portfolio export (PDF/CSV)
  - Custom portfolio grouping / watchlists
  - Options or derivatives order types
  - Portfolio sharing / screenshot feature
  - Push notification deep-link to portfolio from fill events
  - Dark/Light mode toggle (all screens are dark-only in V1)

Design System:   Paave V2.0 "Kinetic Drop" — Figma: Paave DS / Kinetic Drop
```

---

## 3. Screen Count Summary

| # | Screen Name | Component / Route | FR Reference |
|---|-------------|-------------------|-------------|
| 1 | Portfolio Dashboard | `PortfolioDashboardScreen` | FR-PORT-01 |
| 2 | Holdings Detail | `HoldingDetailScreen` | FR-PORT-02 |
| 3 | Portfolio Value Chart (embedded) | Section within Dashboard | FR-PORT-03 |
| 4 | Trade History | `TradeHistoryScreen` | FR-PORT-04 |
| 5 | Open Orders | `OpenOrdersScreen` | FR-PORT-05 |
| 6 | Order Entry — Buy | `PlaceOrderBottomSheet` (buy mode) | FR-PORT-06 |
| 7 | Order Entry — Sell | `PlaceOrderBottomSheet` (sell mode) | FR-PORT-06 |
| 8 | Order Confirmation | `OrderConfirmationScreen` | FR-PORT-06 |
| 9 | Order Fill Notification Detail | `OrderFillNotificationScreen` | FR-PORT-06 |
| 10 | Realized P&L Breakdown | `PnLAnalyticsScreen` (or modal) | FR-PORT-09 |
| 11 | Portfolio Reset Dialog — Step 1 | `PortfolioResetModal` (step 1) | FR-PORT-08 |
| 12 | Portfolio Reset Dialog — Step 2 | `PortfolioResetModal` (step 2) | FR-PORT-08 |
| 13 | Portfolio Reset Success | `PortfolioResetModal` (success state) | FR-PORT-08 |

**Total design frames required:** 13 (including 3 modal states counted separately for clarity)

---

## 4. Portfolio-Specific Design Tokens

These tokens are additive — they do not replace any existing Kinetic Drop token. Add them to the `portfolio` namespace in Figma.

### 4.1 P&L Tokens (map to existing but alias for semantic clarity)

| Token | Value | Maps To | Usage |
|-------|-------|---------|-------|
| `pnl-positive` | `#10B981` | — | Gains in PnLLabel, Holdings row green text |
| `pnl-negative` | `#EF4444` | — | Losses in PnLLabel, Holdings row red text |
| `pnl-zero` | `#ADAAAA` | `fog` | Zero / flat P&L |
| `pnl-positive-bg` | `rgba(16,185,129,0.10)` | — | Green tinted badge background |
| `pnl-negative-bg` | `rgba(239,68,68,0.10)` | — | Red tinted badge background |

### 4.2 Chart Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `chart-baseline` | `#CAFD00` (lime, dashed) | 500M VND dotted baseline on portfolio chart |
| `chart-area-fill` | `rgba(202,253,0,0.08)` | Area under the portfolio value line |
| `chart-line` | `#CAFD00` | Portfolio value line stroke |
| `chart-reset-marker` | `rgba(173,170,170,0.40)` | Vertical dashed gray line for reset events |
| `chart-crosshair` | `rgba(255,255,255,0.20)` | Drag/scrub crosshair |
| `chart-dot-active` | `#CAFD00` | Dot on scrubbed point on chart line |
| `chart-grid` | `rgba(255,255,255,0.05)` | Horizontal grid lines |
| `chart-axis-label` | `#ADAAAA` | Axis value labels (fog) |

### 4.3 Order Status Badge Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `order-status-pending` | `#F59E0B` | PENDING badge (amber) |
| `order-status-filled` | `#10B981` | FILLED badge (green) |
| `order-status-partially-filled` | `#7EA5FF` | PARTIALLY_FILLED badge (blue) |
| `order-status-cancelled` | `#ADAAAA` | CANCELLED badge (fog) |
| `order-status-rejected` | `#EF4444` | REJECTED badge (red) |
| `order-status-suspended` | `#D277FF` | SUSPENDED badge (plasma) |
| `order-status-queued` | `#F59E0B` | QUEUED_AFTER_HOURS badge (amber) |
| `order-status-pending-bg` | `rgba(245,158,11,0.12)` | Badge background |
| `order-status-filled-bg` | `rgba(16,185,129,0.12)` | Badge background |
| `order-status-cancelled-bg` | `rgba(173,170,170,0.10)` | Badge background |
| `order-status-rejected-bg` | `rgba(239,68,68,0.12)` | Badge background |
| `order-status-suspended-bg` | `rgba(210,119,255,0.12)` | Badge background |

### 4.4 Layout Constants

| Constant | Value | Notes |
|----------|-------|-------|
| `h-margin` | `24px` | Horizontal margin, both sides (space-6) |
| `section-gap` | `16px` | Vertical gap between dashboard sections |
| `card-radius` | `16px` | All card corner radii |
| `chart-height` | `200px` | Fixed height of the chart area |
| `tab-bar-height` | `60px` (+ safe area) | Bottom navigation |
| `virtual-chip-height` | `28px` | VirtualFundsLabel chip |

---

## 5. Component Inventory

### 5.1 Existing Components — Reuse Without Modification

| Component | Source | Usage in Portfolio |
|-----------|--------|-------------------|
| `KineticButton` | Kinetic Drop DS | All CTAs: lime (primary), ghost (secondary), destructive (cancel) |
| `PnLLabel` | Kinetic Drop DS | All P&L values across all screens — do not render plain text P&L |
| `VirtualFundsLabel` (`<VirtualFundsLabel />`) | Kinetic Drop DS | Mandatory chip on every portfolio screen |
| `StockTickerChip` | Kinetic Drop DS | Exchange labels on holdings, orders, trade history (HOSE, HNX, UPCOM, KOSPI, NYSE) |
| `BottomSheet` | Kinetic Drop DS | Order Entry sheet, P&L Breakdown if presented as bottom sheet |
| `AmbientBackground` | Kinetic Drop DS | Portfolio Reset Success celebration state |
| `Snackbar` | Kinetic Drop DS | Order submitted / cancelled confirmations |
| `SkeletonLoader` | Kinetic Drop DS | All loading states across dashboard sections |
| `LessonProgressBar` | Kinetic Drop DS | Reuse progress bar pattern for chart range tabs (1D/1W/1M/3M/1Y) |

### 5.2 New Components — Must Be Designed and Added to Design System

| Component | Description | Tokens Used | Priority |
|-----------|-------------|-------------|----------|
| `PortfolioValueChart` | Line + area chart; range tabs; dotted baseline; reset markers; scrubable | `chart-*` tokens | P0 — blocks Dashboard design |
| `HoldingRow` | Single holding in list: ticker chip, name, qty, avg price, current price, P&L | `pnl-*` tokens, `StockTickerChip` | P0 — blocks Dashboard design |
| `OrderStatusBadge` | Pill badge for order status with background fill | `order-status-*` tokens | P0 — blocks Open Orders + Trade History |
| `TradeHistoryRow` | Single trade: timestamp, ticker, direction (BUY/SELL), qty, price, fee, [Pre-Reset] label | `order-status-*`, `StockTickerChip` | P0 — blocks Trade History |
| `OpenOrderRow` | Single open order: ticker, type, qty, price, status badge, TTL countdown, swipe-left cancel affordance | `order-status-*` tokens | P0 — blocks Open Orders |
| `OrderTypeSelector` | Segmented control for order type selection (LO / MARKET / ATO / ATC / STOP / STOP_LIMIT) | Standard DS tokens | P0 — blocks Order Entry |
| `PnLSummaryCard` | Realized P&L lifetime card with tappable row | `pnl-*` tokens | P1 |
| `ResetEventMarker` | Vertical dashed line overlay on chart with "Đặt lại" label | `chart-reset-marker` | P1 |
| `TTLCountdownChip` | Small inline countdown timer chip for KR/Global orders | `order-status-queued` | P1 |
| `SectionHeader` | "See All →" right-aligned label pairing for dashboard sections | Standard DS tokens | P2 — reuse if pattern exists |

---

## 6. Related Documents

| Document | Path | Description |
|----------|------|-------------|
| Portfolio Index | `docs/business/portfolio/00-index.md` | Architecture, screen map, key decisions |
| Portfolio FRD | `docs/business/portfolio/01-requirements.md` | Full functional requirements FR-PORT-01 through FR-PORT-10 |
| Virtual Trading API Spec | `docs/api/virtual-trading-api-spec.md` | REST API contract for all `/api/v1/virtual/` endpoints |
| F0 Learning Path Dev/QA Spec | `docs/DEV-QA-SPEC-F0-Learning-Path.md` | Token/component precedents from the sibling feature |
| UX Flows | `docs/design/DESIGN-PORTFOLIO-01-ux-flows.md` | Full flow diagrams for all Portfolio interactions |
| Wireframe Specs | `docs/design/DESIGN-PORTFOLIO-02-wireframes.md` | ASCII wireframes + copy + state matrix for all 10 screens |
| Paave DS Figma | Figma: Paave DS / Kinetic Drop | Component library, color styles, text styles |

# FRD-05: Portfolio Tracking

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

> **IMPORTANT ARCHITECTURAL NOTE**
>
> The Portfolio tab in V2 displays the **Paper Trading Dashboard** — a live view of the user's virtual paper trading portfolio. It does NOT display manually entered holdings.
>
> Requirements FR-30 through FR-34 (manual portfolio tracking) are **DEPRECATED** as of V2.0 and are retained here for backward compatibility reference only. They will be removed entirely in V3. All new development must target FR-35 (P&L color coding, active in V2) and the Paper Trading module (see `frd/10-paper-trading.md`, particularly FR-PT-04 for the portfolio dashboard).
>
> The Portfolio tab entry in the bottom navigation bar navigates to the Paper Trading Dashboard, not to any manual holdings screen.

---

## Module Description

This document covers: (1) The deprecated manual portfolio tracking requirements (FR-30–34) — for reference only, do not build. (2) FR-35 — P&L color coding standard — active and applied across all V2 screens showing financial values. Developers building the Portfolio tab screen must refer to `frd/10-paper-trading.md` for the full Paper Trading Dashboard specification.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Portfolio Tracking (V2: Paper Trading Dashboard) |
| Primary Actor | Authenticated user — FULL_ACCESS (age 18+) only for full feature |
| Goal | Monitor paper trading portfolio performance; review P&L |
| Trigger | Tap on "Portfolio" tab in bottom navigation |
| V2 Implementation | Portfolio tab → Paper Trading Dashboard (FR-PT-04 in frd/10-paper-trading.md) |

---

## 2. Functional Requirements — DEPRECATED (FR-30–FR-34)

The following requirements FR-30 through FR-34 are **DEPRECATED in V2**. They are retained here as a reference for the migration path from V1 manual tracking to V2 paper trading. No new code should be written for these requirements. If any V1 code still implements these, it must be removed as part of the V2 migration.

---

### FR-30 — Portfolio Holdings Overview (DEPRECATED)

> **Status: DEPRECATED — Superseded by FR-PT-04 in frd/10-paper-trading.md**

- **Original V1 Description**: Manually entered holdings displayed in a list view with ticker, shares held, average buy price, current price, current value, and unrealized P&L.
- **V2 Replacement**: Paper Trading Dashboard (FR-PT-04) — auto-populated from paper trade execution. No manual entry.
- **Migration Action**: All FR-30 UI components and data models should be removed. Portfolio tab now mounts the Paper Trading Dashboard component.

---

### FR-31 — Add Holding Manually (DEPRECATED)

> **Status: DEPRECATED — Superseded by FR-PT-02 (paper buy order) and FR-PT-03 (paper sell order)**

- **Original V1 Description**: A "+" button to manually enter a stock holding — ticker, quantity, average buy price, purchase date.
- **V2 Replacement**: Holdings are created automatically when a paper trade order is executed (FR-PT-02/FR-PT-03).
- **Migration Action**: Remove manual add holding UI, form, and backend endpoint. Holdings table now populated from paper order execution.

---

### FR-32 — Edit Holding (DEPRECATED)

> **Status: DEPRECATED**

- **Original V1 Description**: Swipe-left gesture on a holding row reveals "Edit" action to modify quantity or buy price.
- **V2 Replacement**: Paper trades are immutable after execution. No edit capability.
- **Migration Action**: Remove edit holding functionality entirely.

---

### FR-33 — Delete Holding (DEPRECATED)

> **Status: DEPRECATED**

- **Original V1 Description**: Swipe-left gesture reveals "Delete" with confirmation dialog.
- **V2 Replacement**: Holdings are closed by executing a paper sell order (FR-PT-03), not deleted.
- **Migration Action**: Remove delete holding functionality entirely.

---

### FR-34 — Transaction History (DEPRECATED)

> **Status: DEPRECATED — Superseded by FR-PT-04 trade history tab in Paper Trading Dashboard**

- **Original V1 Description**: A "Transactions" tab within Portfolio showing manual transactions with date, type (buy/sell), ticker, quantity, price.
- **V2 Replacement**: Paper Trading Dashboard (FR-PT-04) includes a Trade History tab with complete auto-generated paper trade history.
- **Migration Action**: Remove manual transaction history tab. Point any deep links to FR-PT-04 trade history.

---

## 3. Functional Requirements — ACTIVE (FR-35)

---

### FR-35: P&L Color Coding Standard

- **Actor**: System (rendering layer for all screens)
- **Description**: A universal visual standard applied to every profit and loss value displayed anywhere in the Paave app. This includes but is not limited to: Paper Trading Dashboard, Leaderboard, user Profile, Stock Detail, Portfolio tab, notification history, and any other screen showing financial performance values. The standard is: positive P&L → green with "+" prefix; negative P&L → red with "−" prefix (Unicode minus U+2212, not hyphen-minus); zero → gray with no sign prefix. The standard is enforced at the rendering/component level — a shared `PnLLabel` component should be created and reused across all screens.

- **Input**:
  - Numeric P&L value (decimal; can be positive, negative, or zero)
  - Display format context: absolute value (VND) or percentage (%)
  - Currency/unit (VND for VN; native currency for KR/Global)

- **Output**:
  - Positive value: text color `#00C853`; prepend "+" (e.g., "+1,250,000 VND" or "+3.45%")
  - Negative value: text color `#D50000`; prepend "−" (Unicode U+2212) (e.g., "−500,000 VND" or "−1.20%")
  - Zero value: text color `#9E9E9E`; no sign prefix (e.g., "0 VND" or "0.00%")
  - Number formatting: BR-14 (thousand separators; B/T suffixes)

- **Precondition**: A financial value (P&L) is available for display on any screen.
- **Postcondition**: Value renders with correct color, sign prefix, and formatting.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-35-01 | P&L value = +1,250,000 VND | Rendered anywhere in app | Shows "+1,250,000 VND" in green (#00C853) |
| AC-35-02 | P&L value = −500,000 VND | Rendered anywhere in app | Shows "−500,000 VND" in red (#D50000) using Unicode minus |
| AC-35-03 | P&L value = 0 VND | Rendered anywhere in app | Shows "0 VND" in gray (#9E9E9E); no sign prefix |
| AC-35-04 | P&L percentage = +3.45% | Rendered anywhere in app | Shows "+3.45%" in green (#00C853) |
| AC-35-05 | P&L percentage = −1.20% | Rendered anywhere in app | Shows "−1.20%" in red (#D50000) |
| AC-35-06 | P&L percentage = 0.00% | Rendered anywhere in app | Shows "0.00%" in gray (#9E9E9E) |
| AC-35-07 | Large positive P&L = 1,500,000,000 VND | Rendered | Shows "+1.5B VND" or "+1,500 tỷ" depending on locale; green |
| AC-35-08 | P&L value is on Leaderboard | Screen renders | Same color/sign/format standard applied |
| AC-35-09 | P&L value is in push notification | Notification received | Same sign and format applied in notification body |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| P&L value is not yet computed (loading) | Show skeleton loader; color applied only when value is available |
| P&L value is NaN or null | Show "—" in gray; do not crash |
| Very small negative value (e.g., −0.001 VND after rounding) | Round to 2 decimal places; if rounds to 0.00, display as zero (gray, no sign) |
| Hyphen-minus (-) used instead of Unicode minus (U+2212) | This is a bug; font renderer must use U+2212 for negative sign |

- **Priority**: P0 (active in V2, applied globally)

---

## 4. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-14 | VND values formatted with thousand separators; B for billion, T for trillion | Unformatted value shown = display bug; log as P1 |
| BR-18 | Trilingual label "Tiền ảo / 가상 자금 / Virtual Funds" must appear on all paper trading screens | Missing label = compliance violation; treat as P0 |
| BR-31 | Brokerage CTA never rendered for LEARN_MODE users | LEARN_MODE user sees no brokerage CTA anywhere in Portfolio tab |

---

## 5. UI/UX Notes

- **Shared component**: Implement a `PnLLabel` React Native component (or equivalent) that accepts `{ value: number, unit: 'VND' | '%' | string, locale: 'vi' | 'ko' | 'en' }` and outputs the correctly colored, signed, formatted label. All screens must use this component — no ad hoc P&L formatting inline.
- **Zero threshold**: A value of `−0.00` after rounding must display as `0` (gray), not as `−0.00` (which would be red with incorrect sign).
- **Accessibility**: Color alone must not be the only indicator of positive/negative; the "+" and "−" sign prefix provides the non-color signal. Screen readers must read "positive 1,250,000 VND" and "negative 500,000 VND".
- **Portfolio tab content**: The Portfolio tab renders `<PaperTradingDashboard />` — see `frd/10-paper-trading.md` for all layout and behavior of that component.

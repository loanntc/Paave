## Module B: Paper Trading Engine — **PRIMARY PILLAR**

> **Purpose:** The product. All users get a virtual portfolio on account creation and paper trading is the primary way users interact with Paave. Every other module feeds into or off of this one. "Tiền ảo / 가상 자금 / Virtual Funds" label mandatory on all paper trading screens (FR-PT-06). Real-money execution never happens inside Paave — when a paper trader graduates, Module I (Brokerage Partner Integration, V1.x) hands them off to a licensed partner.

---

#### FR-PT-01 — Virtual Portfolio Creation

- **Actor:** New User (on registration completion)
- **Description:** Virtual portfolio auto-created on account activation. Starting balance: VND 500,000,000. "Tiền ảo / 가상 자금 / Virtual Funds" label always visible in portfolio header.
- **Key Rules:**
  - Auto-created; user does not configure starting balance.
  - Balance displayed in user's locale currency equivalent (KRW/USD) if KR/Global user, but underlying denomination is VND.
  - Label "Tiền ảo / 가상 자금 / Virtual Funds" is a permanent fixture on the screen — not dismissible.
- **Acceptance Criteria:**
  - Given new user completes registration → virtual portfolio exists with 500M VND balance before first login to Home.
  - Given KR user → balance shown as KRW equivalent with "Virtual Funds" label.
- **Edge Cases:** Portfolio creation fails during registration → retry up to 3 times; if all fail, account created and portfolio creation queued.
- **Priority:** P0

---

#### FR-PT-02 — Place Market Order (Paper)

- **Actor:** Registered User (LEARN_MODE or FULL_ACCESS)
- **Description:** User can place a buy or sell market order for any HOSE/HNX/KOSPI/KOSDAQ stock. Order fills at the next real-time price snapshot (≤15 seconds). Buy orders cannot exceed available virtual cash balance. Sell orders cannot exceed current virtual holdings.
- **Key Rules:**
  - Fill price = price at next price snapshot after order placement (≤15s).
  - Buy: validates cash balance ≥ (quantity × current price × 1.001 to account for transaction simulation).
  - Sell: validates holding quantity ≥ requested sell quantity.
  - Market orders always fill (no partial fills in V2 except at balance limit).
  - "Tiền ảo" label visible on order confirmation screen.
  - **v2.1 change:** Pre-trade AI advisory card removed (was FR-AI-04 in v2.0). No AI surface between "Buy" tap and order confirmation — the action is direct.
- **Acceptance Criteria:**
  - Given user places buy order for 100 VIC shares with sufficient balance → order fills within 15s at snapshot price; holdings updated.
  - Given buy order exceeds virtual balance → error "Insufficient virtual funds."
- **Edge Cases:** Price snapshot unavailable at fill time (feed outage) → order queued; fills when feed restores; user notified via toast.
- **Priority:** P0

---

#### FR-PT-03 — Place Limit Order (Paper)

- **Actor:** Registered User
- **Description:** User can place a buy or sell limit order. Order queued. Fills when market price crosses the specified limit price. Auto-expires after 30 days if unfilled.
- **Key Rules:**
  - Buy limit: fills when price ≤ limit price.
  - Sell limit: fills when price ≥ limit price.
  - Expiry: 30 calendar days from order placement; user notified via push on expiry.
  - Virtual cash is reserved (not available for other orders) for pending buy limit orders.
  - User can cancel a pending limit order from Portfolio → Open Orders view.
- **Acceptance Criteria:**
  - Given buy limit order at 45,000 for VIC (currently at 48,000) → order shows as "Open"; fills if price drops to ≤45,000 within 30 days.
  - Given 30 days pass unfilled → order expires; reserved cash returned; user notified.
- **Edge Cases:** Stock halted while limit order is open → order remains open; fills when trading resumes.
- **Priority:** P1

---

#### FR-PT-04 — Portfolio Dashboard (Paper)

- **Actor:** Registered User
- **Description:** Paper Portfolio tab shows: (1) Total virtual portfolio value, (2) Available virtual cash, (3) Holdings list (ticker, quantity, avg buy price, current price, unrealized P&L, unrealized P&L%), (4) Portfolio value chart over time (daily, 1W/1M/3M/1Y ranges), (5) Realized P&L total, (6) Trade history, (7) Open orders.
- **Key Rules:**
  - "Tiền ảo / 가상 자금 / Virtual Funds" label in header permanently.
  - P&L color coding per FR-35.
  - Trade history retained indefinitely (pre-reset entries marked "Pre-Reset").
  - Open orders tab shows pending limit orders (FR-PT-03).
- **Acceptance Criteria:**
  - Given user has 3 holdings → all 3 shown with live prices, P&L, and portfolio chart.
  - Given user taps a holding → navigates to Stock Detail for that stock.
- **Edge Cases:** Stock delisted → holding shown with "Delisted" price indicator; P&L frozen at last known price.
- **Priority:** P0

---

#### FR-PT-05 — Portfolio Reset

- **Actor:** Registered User
- **Description:** User can reset virtual portfolio from Portfolio settings. Confirmation dialog required: "Reset your virtual portfolio? This will close all positions and restore your balance to ₫500,000,000. Trade history will be kept." On confirm: balance reset to 500M VND, all open positions closed at current market price, all open limit orders cancelled, trade history retained and marked "Pre-Reset."
- **Key Rules:**
  - Double confirmation required (modal with explicit "Reset Portfolio" button — no accidental reset).
  - Reset cannot be undone.
  - Post-reset: trade history entries before reset labeled "[Pre-Reset]."
  - AI coaching event logged (if FOMO/panic patterns detected in pre-reset history).
- **Acceptance Criteria:**
  - Given confirmed reset → balance returns to 500M VND; holdings list empty; history shows "[Pre-Reset]" labels.
  - Given "Cancel" tapped → no changes.
- **Edge Cases:** Feed unavailable at reset time → positions closed at last cached price; note shown in history.
- **Priority:** P1

---

#### FR-PT-06 — Virtual Money Label

- **Actor:** Registered User
- **Description:** "Tiền ảo / 가상 자금 / Virtual Funds" label permanently displayed in the header or status bar of every paper trading screen (Portfolio dashboard, order placement, order confirmation, trade history). Cannot be dismissed or hidden by the user.
- **Key Rules:**
  - Label must be visible at all times on all paper trading screens.
  - Label text adapts to user's active language (FR-LANG-01): Vietnamese "Tiền ảo", Korean "가상 자금", English "Virtual Funds."
  - Label must meet minimum contrast ratio (WCAG AA) against all theme backgrounds.
  - This is a legal/clarity requirement — not a design choice; cannot be disabled.
- **Acceptance Criteria:**
  - Given any paper trading screen → label visible in header; confirmed in screenshot test.
  - Given language changed to Korean → label displays "가상 자금."
- **Edge Cases:** Low-contrast mode enabled → label uses forced high-contrast color.
- **Priority:** P0

---


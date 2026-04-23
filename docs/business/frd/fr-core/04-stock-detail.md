### STOCK DETAIL

#### FR-23 — Stock Detail Screen Layout

- **Actor:** Registered User
- **Description:** Vertical layout: (1) Header (ticker, company, exchange), (2) Price hero, (3) Price chart, (4) Action buttons (Watchlist, Alert, Paper Trade), (5) Key Stats, (6) Analyst Sentiment, (7) Community Feed tab (FR-SOC-02), (8) Editorial context.
- **V2 Update:** "Paper Trade" button added to action buttons. Community Feed tab added.
- **Key Rules:** Paper Trade button navigates to paper order placement (FR-PT-02/FR-PT-03).
- **Acceptance Criteria:**
  - Given user opens Stock Detail → all 8 sections render; Paper Trade button visible.
- **Edge Cases:** Stock data unavailable → skeleton loaders shown; retry after 3s.
- **Priority:** P0

---

#### FR-24 — Price Chart on Stock Detail

- **Actor:** Registered User
- **Description:** Time range selector: 1D, 1W, 1M, 3M, 1Y. Default: 1D. Line chart, in-app charting library. VN stocks: real-time intraday (1-minute intervals). KR/Global: end-of-day data.
- **Key Rules:** Chart re-renders within 2 seconds of range tap. Unavailable range → "Chart data not available for this period."
- **Acceptance Criteria:**
  - Given 1M tapped on VN stock → chart renders within 2s showing daily closing prices.
- **Edge Cases:** KR chart during live session → shows previous day's close with data delay note.
- **Priority:** P0

---

#### FR-25 — Key Stats on Stock Detail

- **Actor:** Registered User
- **Description:** 9 stats in 3-column grid: Open, Prev Close, Day High, Day Low, 52W High, 52W Low, Volume, Market Cap, P/E Ratio. Unavailable values shown as "—".
- **V2 Update:** Financial terminology displayed in locale-appropriate form per FR-LANG-02.
- **Key Rules:** Values formatted with thousand separators per BR-14. Units: B/T for billion/trillion.
- **Acceptance Criteria:**
  - Given VN user → P/E displays as "Chỉ số P/E"; given KR user → "주가수익비율."
- **Edge Cases:** P/E unavailable (negative earnings) → display "—."
- **Priority:** P0

---

#### FR-26 — Analyst Sentiment on Stock Detail

- **Actor:** Registered User
- **Description:** Buy/Hold/Sell percentage bar. Consensus label per BR-07 thresholds. Analyst count shown. If unavailable: "Analyst sentiment not available for this stock."
- **Key Rules:** BR-07 thresholds determine consensus label.
- **Acceptance Criteria:**
  - Given 75% Buy → "Strong Buy" label with green-dominant bar.
- **Edge Cases:** Zero analysts rated → "Analyst sentiment not available."
- **Priority:** P1

---

#### FR-27 — Add to Watchlist from Stock Detail

- **Actor:** Registered User
- **Description:** Full-width "Add to Watchlist" / "Remove from Watchlist" button. Behavior identical to FR-20.
- **Key Rules:** Optimistic UI; revert on backend failure.
- **Acceptance Criteria:**
  - Given stock not in watchlist → button reads "Add to Watchlist"; tap adds and changes label.
- **Edge Cases:** Watchlist full → error shown.
- **Priority:** P0

---

#### FR-28 — Set Price Alert from Stock Detail

- **Actor:** Registered User
- **Description:** "Set Alert" button opens bottom sheet. User selects Price above / Price below and enters target price. Triggers push notification when condition met.
- **Key Rules:** One alert per stock per user. Setting new alert overwrites existing (BR-03). Alert is one-time (BR-04).
- **Acceptance Criteria:**
  - Given "Price above 55000" set → alert saved, toast "Alert set for [TICKER]."
  - Given target = current price → error "Price must be different from current price."
  - Given price crosses threshold → push within 60s, alert deactivated.
- **Edge Cases:** Push notifications disabled → alert tracked silently, no push sent.
- **Priority:** P0

---

#### FR-29 — Stock Detail Back Navigation

- **Actor:** Registered User
- **Description:** Back button (top-left), hardware back (Android), and swipe-back (iOS) return to previous screen at same scroll position.
- **Key Rules:** Back behavior consistent across all entry points (Discover, Home, Markets, Search).
- **Acceptance Criteria:**
  - Given user navigated from Discover position 8 → back returns to position 8.
- **Edge Cases:** None.
- **Priority:** P0

---


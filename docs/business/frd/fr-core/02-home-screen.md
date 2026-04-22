### HOME SCREEN

#### FR-09 — Portfolio Value Hero Widget

- **Actor:** Registered User
- **Description:** Home screen hero shows total paper portfolio value. If no positions, shows "Start paper trading" CTA.
- **V2 Update:** Now displays paper portfolio (virtual funds). "Tiền ảo / 가상 자금" label shown beneath value (per FR-PT-06). Real portfolio tracking removed from V2 core UI.
- **Key Rules:** Virtual funds label always visible alongside portfolio value.
- **Acceptance Criteria:**
  - Given user with no paper trades → "Start paper trading" CTA shown.
  - Given user with positions → total virtual portfolio value with virtual label shown.
- **Edge Cases:** Market data unavailable → last known value with stale indicator.
- **Priority:** P0

---

#### FR-10 — Market Snapshot Widget

- **Actor:** Registered User
- **Description:** Compact market snapshot: VN-Index (VN users), KOSPI (KR users), S&P 500 + Nasdaq (Global). Refreshes every 30 seconds while in foreground.
- **Key Rules:** Market closed → last close value with "Market Closed" label and next open time.
- **Acceptance Criteria:**
  - Given VN user during market hours → VN-Index value, point change, % change displayed.
  - Given 30s timer fires → data refreshes without user action.
- **Edge Cases:** Feed outage → cached data with banner "Live data temporarily unavailable."
- **Priority:** P0

---

#### FR-11 — Trending Stocks Section on Home

- **Actor:** Registered User
- **Description:** Horizontal scrollable "Trending Now" section with top 5 stocks from user's market. Each card: ticker, company name, price, daily % change.
- **V2 Update:** Cards now show social proof counts (from FR-SOC-01) inline.
- **Key Rules:** Tapping a card navigates to Stock Detail.
- **Acceptance Criteria:**
  - Given VN user → 5 VN trending stocks shown; tapping one navigates to Stock Detail.
- **Edge Cases:** Fewer than 5 trending stocks → show available count; no error.
- **Priority:** P0

---

#### FR-12 — Personalized Watchlist on Home

- **Actor:** Registered User
- **Description:** Up to 5 watchlist stocks with live price and daily change. "See All" link to full Watchlist screen. Empty state: "Your watchlist is empty."
- **Key Rules:** Watchlist max 100 stocks (BR-02).
- **Acceptance Criteria:**
  - Given watchlist with 3 stocks → 3 rows shown; "See All" not shown.
  - Given empty watchlist → empty state message with "Explore" button.
- **Edge Cases:** Watchlist stock delisted → price shows "Delisted", P&L frozen.
- **Priority:** P0

---

#### FR-13 — Home Screen Data Refresh

- **Actor:** Registered User
- **Description:** Auto-refresh every 30 seconds (foreground). Pull-to-refresh supported. On refresh failure, previous data retained with toast.
- **Key Rules:** Toast: "Unable to refresh. Showing last available data."
- **Acceptance Criteria:**
  - Given pull-to-refresh → loading spinner shown ≤2s, data updated.
- **Edge Cases:** No internet → toast shown; cached data retained.
- **Priority:** P0

---

#### FR-14 — Bottom Navigation

- **Actor:** Registered User
- **Description:** Persistent 5-tab bottom nav: Home, Discover, Markets, Portfolio, Profile. Active tab highlighted. Re-tapping active tab resets scroll position.
- **Key Rules:** Screen state preserved when switching tabs (except scroll on re-tap).
- **Acceptance Criteria:**
  - Given user taps Portfolio tab → Portfolio screen shown; Home tab no longer active.
- **Edge Cases:** None.
- **Priority:** P0

---


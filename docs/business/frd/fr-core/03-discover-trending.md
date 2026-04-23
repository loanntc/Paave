### DISCOVER / TRENDING FEED

#### FR-15 — Discover Feed Layout

- **Actor:** Registered User
- **Description:** Vertically scrollable feed of curated stock cards from user's preferred market. Minimum 10 cards on initial render; infinite scroll in batches of 10.
- **Key Rules:** Only stocks with editorial CMS content appear (BR-05).
- **Acceptance Criteria:**
  - Given VN market preference → VN stock cards loaded, minimum 10.
- **Edge Cases:** Fewer than 10 cards available → show all; no infinite scroll triggered.
- **Priority:** P0

---

#### FR-16 — Stock Card Content

- **Actor:** Registered User
- **Description:** Each card: ticker, company name, price + daily change (color-coded), editorial hook (≤120 chars), social proof counter ("X users watching"), theme badge, add-to-watchlist heart icon.
- **V2 Update:** Social proof now also includes sentiment ratio and Trending badge (from FR-SOC-01).
- **Key Rules:** Social proof counter polled every 30 seconds.
- **Acceptance Criteria:**
  - Given a stock with 50 watchers → "50 users watching" shown; updates within 30s when new user adds to watchlist.
- **Edge Cases:** Counter returns null → display "— users watching."
- **Priority:** P0

---

#### FR-17 — Theme Filters on Discover

- **Actor:** Registered User
- **Description:** Horizontally scrollable theme chips: All, AI, K-pop, Vietnam Growth, Banking, Technology, Energy, Consumer. Default: All. One active at a time.
- **Key Rules:** Feed reloads on filter change; session-level only (does not update profile).
- **Acceptance Criteria:**
  - Given "AI" filter tapped → feed shows only AI-tagged stocks.
  - Given no stocks match filter → "No stocks in this theme right now. Check back soon."
- **Edge Cases:** Network timeout on filter change → previous feed retained with toast.
- **Priority:** P0

---

#### FR-18 — Market Filter on Discover

- **Actor:** Registered User
- **Description:** Market toggle (Vietnam | Korea | Global) above theme chips. Default is Vietnam (VN). Session-level; does not update profile.
- **Key Rules:** Switching market resets theme filter to "All."
- **Acceptance Criteria:**
  - Given user switches to Korea filter → Korea stocks shown, theme resets to All.
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-19 — Infinite Scroll on Discover

- **Actor:** Registered User
- **Description:** Next batch (10 cards) loads when user scrolls within 200px of feed bottom. Loading spinner shown during fetch (≤3s). End-of-feed message: "You've seen all trending stocks."
- **Key Rules:** End message only shown when no more cards available.
- **Acceptance Criteria:**
  - Given user scrolls near bottom → 10 more cards appended; spinner visible during load.
- **Edge Cases:** Network unavailable on scroll → spinner stops; toast "No internet connection."
- **Priority:** P1

---

#### FR-20 — Add to Watchlist from Discover Feed

- **Actor:** Registered User
- **Description:** Heart icon on stock card toggles watchlist membership. Optimistic UI: icon state changes instantly; backend confirmed async. Revert on backend failure.
- **Key Rules:** Watchlist capped at 100 stocks (BR-02). Adding beyond 100 shows error.
- **Acceptance Criteria:**
  - Given heart tapped → icon fills immediately, toast "Added to Watchlist."
  - Given backend error → icon reverts, toast "Something went wrong."
- **Edge Cases:** Watchlist full (100 items) → error "Watchlist full. Remove a stock to add another."
- **Priority:** P0

---

#### FR-21 — Stock Card Navigation

- **Actor:** Registered User
- **Description:** Tapping stock card body (excluding heart icon) navigates to Stock Detail. Back navigation returns to same scroll position.
- **Key Rules:** Heart icon tap does not trigger navigation.
- **Acceptance Criteria:**
  - Given stock card tapped → Stock Detail shown; back → feed at same scroll position.
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-22 — Editorial Content Management

- **Actor:** Editorial Team (CMS)
- **Description:** "Why it's hot" hook and theme badge managed via CMS. Only stocks with valid CMS content appear in Discover feed. Updates reflected in app within 5 minutes.
- **Key Rules:** No editorial content → stock excluded from Discover (appears only in Markets/Search).
- **Acceptance Criteria:**
  - Given CMS content published → stock card appears in Discover within 5 minutes.
- **Edge Cases:** CMS content deleted → stock card removed from Discover on next feed refresh.
- **Priority:** P1

---


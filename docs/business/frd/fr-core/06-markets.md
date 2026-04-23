### MARKETS MODULE

#### FR-36 — Markets Screen Layout

- **Actor:** Registered User
- **Description:** Tabbed interface: **Vietnam (Primary)** | Korea (Reference) | Global (Reference). Default tab is Vietnam. Investment disclaimer shown on first view per session (FR-LEGAL-01). The Korea and Global tab titles render a persistent "Reference" chip; tapping the chip opens a tooltip explaining that KR and Global data are not SLA-backed in V1.
- **V2.2 Update:** Tab labels updated to explicitly mark VN as PRIMARY and KR + Global as REFERENCE. KR/Global tabs each show a "Reference data" banner at the top of the tab content (BRD §5.1.8, BR-ONBOARD-08).
- **Key Rules:** Disclaimer shown on first view of each tab per session. "Reference" chip is non-dismissible.
- **Acceptance Criteria:**
  - All users → Vietnam tab active by default.
  - Korea tab renders with "Reference" chip next to the tab title and a "Reference data — may be delayed" banner at the top of the tab content.
  - Tapping the Reference chip opens a tooltip: "KR data in V1 is sourced from web search and may be delayed. Real-time KR data ships in V2."
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-37 — Vietnam Market (Real-Time, **PRIMARY**)

- **Actor:** Registered User
- **Description:** HoSE/HNX real-time data. VN-Index summary, HNX-Index summary, Top 5 Gainers, Top 5 Losers, Top 5 Most Active. Data refreshes every 30 seconds during market hours. **Only market with a data SLA in V1** (≤ 15 seconds from exchange tick; BO-06).
- **V2.2 Update:** VN marked as the sole SLA-backed market. Copy reinforces primary status.
- **Key Rules:** Market hours: 09:00–15:00 ICT, Mon–Fri. Holiday calendar maintained server-side. Data latency ≤ 15 seconds.
- **Acceptance Criteria:**
  - Given 10:30 AM ICT weekday → live VN-Index, 5 gainers, 5 losers, 5 most active shown; data ≤30s old.
  - Given 4:00 PM ICT → "Market Closed" badge; next open time shown.
- **Edge Cases:** Feed outage → cached data with banner "Live data temporarily unavailable — showing last known"; VN-Index null → "—" with error banner.
- **Priority:** P0

---

#### FR-38 — Korea Market (**Reference Only**)

- **Actor:** Registered User
- **Description:** KOSPI + KOSDAQ indices, Top 5 Gainers, Top 5 Losers. Data sourced from web search / model knowledge (not real-time feed for V1). **Persistent "Reference" banner** visible at the top of the tab content at all times: "Reference data — may be delayed. Real-time KR shipping in V2." Every KR ticker card carries a "Reference" chip.
- **V2.2 Update:** All KR screens explicitly labeled "Reference" (BRD §5.1.8). No SLA promise in V1 (BO-06).
- **Key Rules:** Disclaimer banner: "Reference data — may be delayed." Non-dismissible. Paper trading on KR tickers uses best-available price with a visible "Estimated price" label at order confirmation (BR-PT-04).
- **Acceptance Criteria:**
  - Given Korea tab opened → disclaimer banner visible at top; KOSPI and KOSDAQ values shown; every ticker card has "Reference" chip.
  - Tapping "Reference" chip → tooltip explaining V1 sourcing.
- **Edge Cases:** Data unavailable → "Data temporarily unavailable. Please check back later."
- **Priority:** P1 (demoted from P0 in v2.2 — KR is reference-only in V1)

---

#### FR-39 — Global Market Overview (**Reference Only**)

- **Actor:** Registered User
- **Description:** 6 index cards: S&P 500, Nasdaq, Dow Jones, FTSE 100, Nikkei 225, DAX. Web search / model knowledge. **Persistent "Reference" banner** visible at the top of the tab content at all times. Every Global ticker card carries a "Reference" chip.
- **V2.2 Update:** Global marked as reference-only in V1 (BRD §5.1.8). No SLA promise.
- **Key Rules:** Disclaimer banner shown; values formatted per locale. Non-dismissible.
- **Acceptance Criteria:**
  - Given Global tab → 6 index cards with daily change; "Reference data" banner visible.
  - Every Global ticker card displays "Reference" chip.
- **Edge Cases:** Partial data → show available indices; missing → "—."
- **Priority:** P1

---

#### FR-40 — Market Search

- **Actor:** Registered User
- **Description:** Full-screen search overlay (search icon top-right). Searches all supported market stocks by ticker or company name. Debounced 300ms. Recent searches (last 5) shown on empty query.
- **Key Rules:** Min 1 character to trigger search.
- **Acceptance Criteria:**
  - Given "VIC" typed → matching stocks appear within 1s.
  - Given no results → "No stocks found for 'XYZ'."
- **Edge Cases:** Network unavailable → "Search unavailable offline."
- **Priority:** P0

---

#### FR-41 — Market Hours Reference

- **Actor:** Registered User
- **Description:** "Market Hours" info section at bottom of Markets screen. Shows all three markets' local open/close times (user's timezone) and live status (Open / Closed / Pre-market).
- **Key Rules:** Status updates in real-time; uses device timezone.
- **Acceptance Criteria:**
  - Given GMT+7 user → VN market shows 09:00–15:00 local; status "Open" if within those hours on a weekday.
- **Edge Cases:** Device timezone unavailable → default to UTC.
- **Priority:** P1

---


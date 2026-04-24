# FRD-06: Markets Screen

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

## Module Description

The Markets screen provides structured market data for three markets: Vietnam (primary, real-time), Korea (reference), and Global (reference). It includes tabbed market views, a full-screen search overlay, and a market hours reference panel. Investment disclaimers are shown on first view per session. Reference market data carries non-dismissible indicators. This document is self-contained; a developer reading only this file has everything needed to build the Markets screen.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Markets Screen |
| Primary Actor | Authenticated user (all tiers) |
| Goal | Browse market indices, gainers, losers, and active stocks; search any ticker |
| Trigger | Tap on "Markets" tab in bottom navigation |
| Default State | Vietnam tab active; investment disclaimer shown (first view per session) |

---

## 2. Functional Requirements

---

### FR-36: Markets Screen Layout

- **Actor**: Authenticated user (all tiers)
- **Description**: The Markets screen has a three-tab layout at the top: "Vietnam" (Primary), "Korea" (Reference), "Global" (Reference). Default tab on first load: Vietnam. The investment disclaimer (FR-LEGAL-01 behavior: shown once per session per screen type) is displayed modally on the user's first visit to the Markets screen in the current session before any market data is shown. The Korea and Global tab labels each render a persistent "Reference" chip directly on the tab label. The Reference chip on tab labels is non-dismissible and always visible. Tapping the Reference chip on a tab label shows a tooltip: "KR data in V1 is sourced from web search and may be delayed. Real-time KR data ships in V2."
- **Input**:
  - User's current session disclaimer state (shown/not shown for Markets screen)
  - Tab tap event
- **Output**:
  - Investment disclaimer modal (if first view this session) → user taps "Got it" → market data shown
  - Three tabs rendered; Vietnam default active
  - Korea and Global tab labels: "Korea [Reference chip]", "Global [Reference chip]"
  - Tooltip on Reference chip tap
- **Precondition**: User is authenticated.
- **Postcondition**: Correct market tab displayed. Disclaimer shown and acknowledged on first view.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-36-01 | First visit to Markets this session | User taps Markets tab | Investment disclaimer modal appears; no market data visible behind it |
| AC-36-02 | User taps "Got it" on disclaimer | First visit | Disclaimer dismissed; Vietnam market data shown; disclaimer NOT shown again this session |
| AC-36-03 | User leaves Markets and returns same session | Same session | Disclaimer NOT shown again |
| AC-36-04 | New session (app reopened) | User taps Markets tab | Disclaimer shown again |
| AC-36-05 | Korea tab rendered | Any time | Tab label shows "Korea" + "Reference" chip permanently |
| AC-36-06 | Global tab rendered | Any time | Tab label shows "Global" + "Reference" chip permanently |
| AC-36-07 | User taps Reference chip on Korea tab | Any time | Tooltip shown: "KR data in V1 is sourced from web search and may be delayed. Real-time KR data ships in V2." |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Disclaimer text fails to load from server | Show hardcoded English fallback disclaimer text; never show market data without disclaimer |
| User's language is Korean and disclaimer isn't translated yet | Show English fallback; proceed normally after "Got it" |
| User taps Global tab before disclaimer acknowledged | Disclaimer still required; it fires on first Markets visit regardless of which tab is tapped |

- **Priority**: P0

---

### FR-37: Vietnam Market Tab (Primary, Real-Time)

- **Actor**: Authenticated user (all tiers)
- **Description**: The Vietnam tab shows: VN-Index summary card + HNX-Index summary card (each: index name, current value, daily change ± points and ±%, color-coded), followed by three ranked lists: Top 5 Gainers, Top 5 Losers, Top 5 Most Active (by volume). Each list item: ticker, company name (truncated at 1 line), price, daily % change (color-coded). Data refreshes every 30 seconds during market hours (09:00–15:00 ICT Mon–Fri). Market hours are determined by a server-side holiday calendar (not device date). When market is closed: "Market Closed" badge on index cards + next open time. Feed outage: last cached data shown + non-dismissible yellow banner "Market data may be delayed." Tapping any stock item navigates to Stock Detail.
- **Input**:
  - VN-Index and HNX-Index feed (≤15s SLA during market hours)
  - Top 5 Gainers, Top 5 Losers, Top 5 Most Active lists (server-side ranked)
  - Market status: open | closed | holiday
  - Server-side holiday calendar
  - Cache of last known data
- **Output**:
  - Two index summary cards
  - Three lists of 5 stocks each
  - "Market Closed — Next open: [weekday] 09:00 ICT" when applicable
  - Yellow banner on feed outage
- **Precondition**: User is on Markets screen, Vietnam tab active.
- **Postcondition**: Vietnam market data displayed; data auto-refreshes every 30 seconds while active.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-37-01 | Market is open | Vietnam tab active | VN-Index and HNX-Index show live values (≤15s old); Top 5 lists populated |
| AC-37-02 | 30 seconds pass | Vietnam tab active, foreground | Data refreshes silently; no flash/reload animation |
| AC-37-03 | Market is closed (15:00+ ICT) | Vietnam tab active | Index cards show "Market Closed" badge + "Next open: [weekday] 09:00 ICT"; last close value shown |
| AC-37-04 | Market holiday | Vietnam tab active | "Market Closed" badge; next open = next non-holiday trading day; holiday calendar from server |
| AC-37-05 | Feed outage | Vietnam tab active | Last cached data shown; yellow banner "Market data may be delayed" appears |
| AC-37-06 | User taps a stock in Top 5 Gainers | Any time | Navigates to Stock Detail for that ticker |
| AC-37-07 | Pull-to-refresh | User pulls down | Immediate data refresh triggered |

#### Top 5 Lists Specification

| List | Ranking Criterion | Sort Order |
|---|---|---|
| Top 5 Gainers | Daily % change | Descending (highest gain first) |
| Top 5 Losers | Daily % change | Ascending (largest loss first) |
| Top 5 Most Active | Total trading volume (shares) | Descending (highest volume first) |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Fewer than 5 stocks qualify for a list (e.g., only 3 gainers today) | Show available stocks; no placeholder rows |
| VN-Index feed returns but HNX-Index feed fails | VN-Index shown live; HNX-Index shows last known + stale indicator |
| Next open time crosses into following week (Friday close) | "Next open: Monday 09:00 ICT" |
| Top 5 Most Active list cannot be computed (volume data unavailable) | Section shows "Volume data unavailable" with retry button |

- **Priority**: P0

---

### FR-38: Korea Market Tab (Reference Only)

- **Actor**: Authenticated user (all tiers)
- **Description**: The Korea tab shows: KOSPI summary card + KOSDAQ summary card (each: index name, value, daily change), followed by Top 5 Gainers and Top 5 Losers lists for Korean stocks. Data source in V1: web search / model knowledge (not real-time). A persistent, non-dismissible "Reference data — may be delayed" banner appears at the top of the Korea tab content (below the tab bar) at all times. Every individual KR stock ticker card carries a "Reference" chip. For paper trading on KR stocks: the price shown is labeled "Estimated price." No SLA on data freshness for KR.
- **Input**:
  - KOSPI and KOSDAQ data (from web search / model knowledge)
  - Top 5 Gainers and Top 5 Losers for KR stocks
  - Market status for KR (09:00–15:30 KST Mon–Fri)
- **Output**:
  - Two index summary cards
  - Two stock lists (5 each)
  - "Reference data — may be delayed" banner — always visible, non-dismissible
  - "Reference" chip on every stock card
  - "Estimated price" label when price used for paper trading
- **Precondition**: User is on Markets screen, Korea tab active.
- **Postcondition**: Korea reference data displayed with appropriate disclosures.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-38-01 | Korea tab is active | Any time | "Reference data — may be delayed" banner always visible at top of tab content |
| AC-38-02 | Any KR stock card rendered | Any time | "Reference" chip visible on the card; non-dismissible |
| AC-38-03 | User navigates to paper trade on KR stock | From Stock Detail | Price shown is labeled "Estimated price" |
| AC-38-04 | KR market is closed (outside 09:00–15:30 KST Mon–Fri) | Korea tab | Index cards show "Market Closed" + next open in KST |
| AC-38-05 | User taps a stock in KR list | Any time | Navigates to Stock Detail; "Reference" chip in header |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| KR data not available at all | Index cards show "—"; lists show "Data unavailable"; banner still visible |
| KR stock appears in Discover feed | "Reference" chip shown there too (enforced globally) |

- **Priority**: P1

---

### FR-39: Global Market Tab (Reference Only)

- **Actor**: Authenticated user (all tiers)
- **Description**: The Global tab shows 6 index cards: S&P 500, Nasdaq, Dow Jones, FTSE 100, Nikkei 225, DAX. Each card: index name, current value, daily change (± points and ±%, color-coded). Data source: web search / model knowledge. A persistent, non-dismissible "Reference data — may be delayed" banner appears at the top of the Global tab content at all times. Every Global ticker card carries a "Reference" chip. Partial data: show available indices; missing data → "—" for that index value. No SLA on Global data. No stock lists (Gainers/Losers) for Global market — indices only.
- **Input**:
  - 6 global index values (from web search / model knowledge)
  - Market status per index (US: 09:30–16:00 ET; UK: 08:00–16:30 GMT; Japan: 09:00–15:00 JST; Germany: 09:00–17:30 CET)
- **Output**:
  - 6 index cards in a scrollable grid
  - "Reference data — may be delayed" banner — always visible, non-dismissible
  - "Reference" chip on each index card
  - "—" for any unavailable index value
- **Precondition**: User is on Markets screen, Global tab active.
- **Postcondition**: Global index cards displayed with appropriate disclosures.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-39-01 | Global tab is active | Any time | "Reference data — may be delayed" banner always visible |
| AC-39-02 | All 6 indices have data | Tab renders | All 6 cards shown with values and changes |
| AC-39-03 | FTSE 100 data not available | Tab renders | FTSE 100 card shown with "—" for value; other cards unaffected |
| AC-39-04 | Any Global index card rendered | Any time | "Reference" chip visible on card |
| AC-39-05 | S&P 500 market is closed | Tab renders | "Market Closed" indicator on S&P 500 card; last close value |

#### Index Card Specification

| Index | Exchange | Market Hours (local) | Currency |
|---|---|---|---|
| S&P 500 | NYSE | 09:30–16:00 ET Mon–Fri | USD |
| Nasdaq | Nasdaq | 09:30–16:00 ET Mon–Fri | USD |
| Dow Jones | NYSE | 09:30–16:00 ET Mon–Fri | USD |
| FTSE 100 | LSE | 08:00–16:30 GMT Mon–Fri | GBP |
| Nikkei 225 | TSE | 09:00–15:00 JST Mon–Fri | JPY |
| DAX | Xetra | 09:00–17:30 CET Mon–Fri | EUR |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| All 6 indices unavailable | All 6 cards show "—"; banner still visible |
| User's device timezone differs from index local timezone | Market status calculated from server using index's local timezone; device timezone irrelevant |

- **Priority**: P1

---

### FR-40: Market Search

- **Actor**: Authenticated user (all tiers)
- **Description**: A search icon in the top-right of the Markets screen header opens a full-screen search overlay. Users can search stocks across all three markets (VN, KR, Global) by ticker symbol or company name. Search is debounced at 300ms — no query sent until 300ms after the user stops typing. Minimum 1 character to trigger a search. Recent searches: the last 5 unique search queries (not results) are stored locally and shown when the search field is empty and focused. Tapping a recent search populates the field and triggers search. "Clear all" removes recent searches. No results → "No stocks found for '[query]'." Network unavailable → "Search unavailable offline."
- **Input**:
  - User text input (min 1 char to trigger)
  - Debounce: 300ms after last keystroke
  - Recent searches (last 5, stored locally on device)
- **Output**:
  - Search results: ticker, company name, exchange badge, current price, daily % change
  - KR and Global results: "Reference" chip
  - Empty query + focused: show last 5 recent searches
  - No results: "No stocks found for '[query]'."
  - Offline: "Search unavailable offline."
  - Tapping a result: navigates to Stock Detail
- **Precondition**: User is on Markets screen. Search overlay is open.
- **Postcondition**: Search results shown; tapping result navigates to Stock Detail.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-40-01 | User types "VIC" | 300ms after last keystroke | Search results appear for "VIC" ticker and any company names matching |
| AC-40-02 | User types 1 character | 300ms after keystroke | Search triggered |
| AC-40-03 | Search field is empty and focused | On open | Last 5 recent searches shown as chips or list items |
| AC-40-04 | User taps a recent search | Any time | Field populated with that query; search triggered immediately |
| AC-40-05 | No results for "XYZ123" | After search | "No stocks found for 'XYZ123'." |
| AC-40-06 | Device is offline | User types query | "Search unavailable offline." |
| AC-40-07 | KR stock appears in results | Any time | "Reference" chip on the result row |
| AC-40-08 | User taps a result | Any time | Navigates to Stock Detail; search overlay closes |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| User types very rapidly (faster than debounce) | Only the final query (after 300ms idle) is sent; intermediate queries cancelled |
| Recent searches list has 6 entries | Only last 5 shown; oldest dropped |
| Query is all whitespace | Treated as empty; recent searches shown; no search triggered |
| Search returns delisted stock | Result shown with "Delisted" badge; tapping navigates to Stock Detail with delisted state |

- **Priority**: P1

---

### FR-41: Market Hours Reference

- **Actor**: Authenticated user (all tiers)
- **Description**: A collapsible "Market Hours" section at the bottom of the Markets screen (visible from all three tabs without switching). Shows the open/close times for all three markets in the user's device timezone. Displays live status for each market: "Open", "Closed", or "Pre-market" (where applicable). Status updates in real-time (every 30 seconds). If the device timezone cannot be determined, defaults to UTC. Pre-market is not shown for VN (HOSE/HNX have no pre-market session).
- **Input**:
  - Device timezone (from OS)
  - Server-provided market open/close times (authoritative)
  - Current server time (UTC)
- **Output**:
  - Table of market hours converted to device timezone
  - Live status per market (Open / Closed; Pre-market for US only)
  - Status updates every 30 seconds

#### Market Hours Reference Table

| Market | Exchange | Local Open | Local Close | Days | Status Labels |
|---|---|---|---|---|---|
| Vietnam | HOSE/HNX | 09:00 ICT | 15:00 ICT | Mon–Fri | Open / Closed |
| Korea | KRX (KOSPI/KOSDAQ) | 09:00 KST | 15:30 KST | Mon–Fri | Open / Closed |
| United States | NYSE/Nasdaq | 09:30 ET | 16:00 ET | Mon–Fri | Open / Pre-market / Closed |

*All times converted to user's device timezone for display.*

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-41-01 | User's timezone is GMT+7 (ICT) | Market Hours rendered | VN shows "09:00 – 15:00 (your time)"; US shows "21:30 – 04:00 (your time)" |
| AC-41-02 | VN market is currently open | Status check | Vietnam row shows "Open" in green |
| AC-41-03 | VN market is closed | Status check | Vietnam row shows "Closed" in gray |
| AC-41-04 | US market is in pre-market (04:00–09:30 ET) | Status check | United States row shows "Pre-market" in amber |
| AC-41-05 | Device timezone unavailable | Page renders | Times shown in UTC; note "Showing times in UTC (timezone unavailable)" |
| AC-41-06 | 30 seconds pass | Section is visible | Status labels update (Open → Closed transition at market close) |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Market closes during session | Status updates to "Closed" at next 30s tick; no page reload required |
| Daylight saving time transition | Server provides authoritative UTC times; device timezone conversion handles DST automatically |
| Public holiday in Vietnam | Vietnam shows "Closed" (using server-side holiday calendar); next open time shown |

- **Priority**: P2

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-09 | VN market data SLA ≤15 seconds real-time; KR/Global = reference, no SLA | VN data older than 15s shown without stale indicator = SLA breach; log and alert |
| BR-14 | VND values formatted with thousand separators; B/T suffixes for billions/trillions | Unformatted values = display bug |
| BR-26 | Investment disclaimer shown on first view of Markets screen per session | Showing market data without disclaimer = compliance violation |
| BR-46 | KR and Global market data carry persistent non-dismissible "Reference" chip | Missing chip = P0 bug; chip must be in DOM not toggled |

---

## 4. UI/UX Notes

- **Tab bar**: Sticky at top; tabs scroll the content below, not the tab bar itself.
- **Korea/Global Reference chip on tabs**: Rendered as small gray pill badge within the tab label — same "Reference" chip as on stock cards, but inside the tab text.
- **Tooltip on Reference chip**: Appears below the chip in a small popover; tapping anywhere outside dismisses it.
- **Banner "Reference data — may be delayed"**: Full-width banner below the tab bar; yellow background; permanent; not dismissible; no close button.
- **Investment disclaimer modal**: Full-screen modal overlay (not bottom sheet); blur background; single "Got it" CTA; disclaimer text in user's active language.
- **Top 5 lists**: Each list item is a tappable row (minimum 48px height); chevron "›" on right.
- **Market Hours section**: Collapsible (default: collapsed on small screens, expanded on tablets); toggle by tapping section header.
- **Search overlay**: Full-screen; keyboard auto-focuses on open; "Cancel" button top-right closes overlay; back button also closes.
- **Color coding for index changes**: Positive → `#00C853`; negative → `#D50000`; zero → `#9E9E9E`.

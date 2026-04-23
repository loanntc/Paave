# FRD-03: Discover Feed

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

## Module Description

The Discover Feed is a curated, scrollable feed of stock cards that helps users explore investment opportunities. Cards are ranked by a server-side Discover ranker that boosts stocks matching the user's industrial preferences. Only stocks with approved editorial CMS content appear. Users can filter by theme and market, add stocks to their watchlist, and navigate to Stock Detail. This document is self-contained; a developer reading only this file has everything needed to build the Discover Feed screen.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Discover Feed |
| Primary Actor | Authenticated user (all tiers) |
| Goal | Discover trending and editorially curated stocks matching personal interests |
| Trigger | Tap on "Discover" tab in bottom navigation |
| Screen State | Scroll position preserved when switching tabs; restored on return |

---

## 2. Functional Requirements

---

### FR-15: Discover Feed Layout

- **Actor**: Authenticated user (all tiers)
- **Description**: A vertically scrollable feed of curated stock cards. On initial render, a minimum of 10 cards must be shown before the first infinite scroll trigger fires. Only stocks with active editorial CMS content appear (BR-05). The server-side Discover ranker boosts cards matching the user's `industrial_prefs` array (set during onboarding or edited in Profile). Users who skipped onboarding preferences (empty `industrial_prefs`) receive the fallback ranking: VN trending stocks first, then KR/Global reference stocks further down each carrying a "Reference" chip (BR-46). Stocks from reference markets always display the "Reference" chip regardless of ranking position.
- **Input**:
  - User's `industrial_prefs` (array of industry strings; may be empty)
  - User's preferred market setting
  - Server-side Discover ranker output (paginated, batch size 10)
  - CMS editorial content status per stock
- **Output**:
  - Vertically scrollable feed; minimum 10 cards on first render
  - Cards boosted by `industrial_prefs` appear earlier in the list
  - Empty `industrial_prefs` → VN trending first, KR/Global reference below
  - All KR/Global cards carry "Reference" chip
- **Precondition**: User is authenticated. CMS has at least one approved stock card.
- **Postcondition**: Feed is rendered with initial batch. Scroll triggers load more (FR-19).

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-15-01 | User has `industrial_prefs = ["technology", "banking"]` | Discover tab loads | Technology and banking stocks appear earlier in feed than other sectors |
| AC-15-02 | User has `industrial_prefs = []` (skipped) | Discover tab loads | VN trending stocks fill top of feed; KR/Global reference stocks appear below with "Reference" chip |
| AC-15-03 | CMS has exactly 7 approved cards | Discover tab loads | All 7 shown; no infinite scroll triggered (BR-15 waived when total < 10) |
| AC-15-04 | CMS has 0 approved cards | Discover tab loads | Empty state: "No stocks available right now. Check back soon." |
| AC-15-05 | KR stock appears anywhere in feed | Feed renders | "Reference" chip visible on that card, non-dismissible |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Ranker API times out | Fallback to VN trending ranking; no error shown to user |
| All CMS content for user's preferred market is deleted | Show remaining other-market cards with appropriate chips; empty state if nothing left |
| `industrial_prefs` contains an unknown industry value | Ignore unknown value; rank based on valid values only |
| User changes `industrial_prefs` in Profile mid-session | Feed reloaded on next Discover tab visit within same session |

- **Priority**: P0

---

### FR-16: Stock Card Content

- **Actor**: Authenticated user (all tiers)
- **Description**: Each stock card in the Discover feed contains exactly these elements: ticker symbol, company name, current price with daily change (± value and ± %, color-coded), editorial hook text (≤120 characters, from CMS), social proof counter ("X users watching", refreshed every 30 seconds), sentiment ratio bar (Bull% / Bearish%), Trending badge ("Trending in VN" or "Trending in KR" depending on market), theme badge (e.g., "AI", "Vietnam Growth"), and an add-to-watchlist heart icon (toggled state: filled = in watchlist, outline = not in watchlist).
- **Input**:
  - Stock feed data: ticker, company name, price, daily change
  - CMS fields: editorial hook (≤120 chars), theme badge label
  - Social proof count (server, refreshed every 30s)
  - Sentiment data: Bull%, Bearish% (0–100 each, must sum to 100)
  - Trending flag and market label
  - User's watchlist state for this stock
- **Output**:
  - Rendered stock card with all 8 elements
  - Heart icon reflects current watchlist state
  - "Reference" chip if KR or Global stock
- **Precondition**: Stock has approved CMS content. Price data available (or stale indicator shown).
- **Postcondition**: Card is fully rendered; heart icon state is correct.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-16-01 | Stock card renders | Any time | All 8 elements visible: ticker, name, price+change, hook, social proof, sentiment, trending badge, theme badge |
| AC-16-02 | Stock is in user's watchlist | Card renders | Heart icon is filled (solid) |
| AC-16-03 | Stock is not in user's watchlist | Card renders | Heart icon is outline only |
| AC-16-04 | Daily change is positive | Card renders | Change value shown in green (#00C853) with "+" prefix |
| AC-16-05 | Daily change is negative | Card renders | Change value shown in red (#D50000) with "−" prefix |
| AC-16-06 | Daily change is exactly 0% | Card renders | Shown as "0.00%" in gray (#9E9E9E) |
| AC-16-07 | Social proof refreshes | Every 30 seconds | "X users watching" count updates without full card reload |
| AC-16-08 | Editorial hook is 120 chars | Card renders | Full hook text shown without truncation |
| AC-16-09 | Editorial hook is >120 chars | CMS validation | CMS rejects; card not published with oversized hook |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Social proof API fails | Last known count shown; no error indicator on card |
| Sentiment data is unavailable | Sentiment bar hidden; other card elements unaffected |
| Price data temporarily unavailable | Last known price shown with stale indicator (clock icon) |
| Company name is very long (>40 chars) | Truncated with ellipsis; full name shown on Stock Detail |

- **Priority**: P0

---

### FR-17: Theme Filters

- **Actor**: Authenticated user (all tiers)
- **Description**: A horizontally scrollable chip bar above the feed. Available chips: All, AI, K-pop, Vietnam Growth, Banking, Technology, Energy, Consumer. Default selection on screen load: "All." Only one chip may be active at a time. Selecting a chip triggers a full feed reload filtered to that theme. Filter selection is session-level only — it does not update the user's `industrial_prefs` in the profile. If no stocks match the selected theme, an inline message is shown. On network timeout, the previous feed is retained and a toast is displayed.
- **Input**:
  - User's chip tap (one of 8 theme values)
  - Market filter setting (FR-18; may constrain theme results)
  - Feed data from server filtered by selected theme
- **Output**:
  - Active chip highlighted; previous chip deactivated
  - Feed reloads with theme-filtered stock cards
  - Empty state if no stocks match: "No stocks in this theme right now. Check back soon."
  - Previous feed retained + toast on network timeout
- **Precondition**: User is on Discover screen.
- **Postcondition**: Feed shows stocks matching selected theme (and current market filter).

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-17-01 | Default state | Discover screen loads | "All" chip is active; full unfiltered feed shown |
| AC-17-02 | User taps "AI" chip | Any time | "AI" chip highlighted; "All" deactivated; feed reloads with AI-themed stocks only |
| AC-17-03 | User taps "Vietnam Growth" then "Banking" | Sequentially | "Banking" chip active; feed shows banking stocks only |
| AC-17-04 | No stocks match selected theme | After chip tap | Empty state "No stocks in this theme right now. Check back soon." shown |
| AC-17-05 | Network timeout during filter change | After chip tap | Previous feed retained; toast "Unable to load. Showing previous results." |
| AC-17-06 | Theme filter selection | At session end / app close | Selection NOT persisted to user profile |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| User taps currently active chip | No action; feed does not reload |
| All 8 themes have zero stocks currently | Each shows empty state individually when tapped |
| Theme chip label needs localization | Chips shown in active UI language (vi/ko/en mapping server-side) |
| Market filter is set to "Korea" and user taps "Vietnam Growth" | Feed may show zero results; empty state shown |

- **Priority**: P1

---

### FR-18: Market Filter

- **Actor**: Authenticated user (all tiers)
- **Description**: A market toggle above the theme chips with three options: Vietnam | Korea | Global. Default on Discover screen load: Vietnam. Selection is session-level only and does not change the user's profile market preference. Switching market resets the theme filter chip to "All." The feed then reloads with stocks from the selected market. Korea and Global markets display with a persistent "Reference" chip on all their stock cards.
- **Input**:
  - User's market toggle selection: Vietnam | Korea | Global
  - Current theme filter state (reset to "All" on market switch)
- **Output**:
  - Active market highlighted in toggle
  - Theme filter reset to "All"
  - Feed reloads with stocks from selected market
  - Korea/Global: all cards carry "Reference" chip
- **Precondition**: User is on Discover screen.
- **Postcondition**: Feed shows stocks from selected market with "All" theme filter active.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-18-01 | Default state | Discover screen loads | Vietnam market active |
| AC-18-02 | User taps "Korea" | Any time | Korea market active; theme filter resets to "All"; feed reloads |
| AC-18-03 | User had "Banking" theme active, switches to "Global" | After switch | Theme resets to "All"; Global market stocks shown |
| AC-18-04 | Korea market selected | Feed renders | All stock cards carry non-dismissible "Reference" chip |
| AC-18-05 | Global market selected | Feed renders | All stock cards carry non-dismissible "Reference" chip |
| AC-18-06 | User switches market | Session level only | Profile market preference unchanged; Home Screen still shows user's profile market |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Market switch API call fails | Previous market remains active; toast "Unable to switch market. Try again." |
| Global market has zero CMS-approved stocks | Empty state shown after switching to Global |

- **Priority**: P1

---

### FR-19: Infinite Scroll

- **Actor**: System (automatic on scroll)
- **Description**: When the user scrolls within 200px of the bottom of the feed, the next batch of 10 stock cards is loaded and appended. A loading spinner is shown at the bottom of the list while loading (≤3 seconds). When the full feed has been consumed, a "You've seen all trending stocks." message replaces the spinner. If the network is unavailable during scroll-triggered load, the spinner stops and a toast is shown. Subsequent scrolling does not re-trigger the failed load — the user must pull-to-refresh.
- **Input**:
  - Scroll position (distance from bottom of feed)
  - Pagination cursor from server (next page token)
  - Network availability
- **Output**:
  - Next 10 cards appended to feed (no full reload)
  - Loading spinner at bottom during fetch
  - End-of-feed message: "You've seen all trending stocks."
  - Network failure: spinner stops + toast "Unable to load more. Pull to refresh."
- **Precondition**: User is on Discover screen. Initial 10 cards loaded. More cards exist on server.
- **Postcondition**: Additional cards appended. Feed remains scrollable.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-19-01 | More cards exist | User scrolls within 200px of bottom | Spinner appears; next 10 cards load and append |
| AC-19-02 | No more cards exist | User scrolls to bottom | "You've seen all trending stocks." message shown; no spinner |
| AC-19-03 | Network fails during scroll load | Load triggered | Spinner stops; toast shown; existing cards remain |
| AC-19-04 | User rapidly scrolls to bottom | Scroll event fires multiple times | Only one batch fetch in flight at a time; duplicate fetches debounced |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Server returns 0 cards in next batch despite non-null cursor | Treat as end-of-feed; show "You've seen all trending stocks." |
| User applies theme filter while infinite scroll fetch is in flight | Cancel in-flight fetch; reload with new filter from page 1 |
| Load time exceeds 3 seconds | Show error in spinner area: "Taking longer than expected. Check your connection."; spinner stops after 3s |

- **Priority**: P1

---

### FR-20: Add to Watchlist from Discover

- **Actor**: Authenticated user (all tiers)
- **Description**: The heart icon on each stock card toggles the watchlist state for that stock. Interaction uses optimistic UI: the heart icon flips immediately without waiting for backend confirmation. The backend call is made asynchronously. If the backend call fails, the icon reverts to its previous state and a toast is shown. If the watchlist is already at 100 stocks (BR-02), the action is blocked with an inline message before any optimistic update.
- **Input**:
  - User tap on heart icon
  - Current watchlist state for the stock (in / not in)
  - Current watchlist count (to check BR-02 limit before add)
- **Output**:
  - Optimistic: heart icon flips immediately (outline → filled or filled → outline)
  - Backend: POST or DELETE to watchlist API
  - On backend failure: icon reverts; toast "Failed to update watchlist. Try again."
  - On watchlist full (100 stocks): icon does not flip; inline message "Watchlist full. Remove a stock to add another." (no toast — inline on the card)
- **Precondition**: User is authenticated. Card is rendered.
- **Postcondition**: Watchlist updated on server. Icon state matches server state.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-20-01 | Stock not in watchlist; watchlist has <100 stocks | User taps heart | Heart immediately fills; backend add call made |
| AC-20-02 | Stock in watchlist | User taps heart | Heart immediately empties; backend remove call made |
| AC-20-03 | Backend add call fails | After optimistic update | Heart reverts to outline; toast shown |
| AC-20-04 | Backend remove call fails | After optimistic update | Heart reverts to filled; toast shown |
| AC-20-05 | Watchlist has exactly 100 stocks | User taps add heart | Icon does NOT flip; inline message "Watchlist full. Remove a stock to add another." |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| User taps heart twice rapidly | Debounce: second tap within 500ms ignored; only one API call made |
| Stock already in watchlist on server but UI shows outline | On tap, optimistic fill; backend returns 409 (already exists) → treat as success; icon stays filled |
| Network is offline when user taps | Optimistic update does not fire; toast "You're offline. Connect to update your watchlist." |

- **Priority**: P1

---

### FR-21: Stock Card Navigation

- **Actor**: Authenticated user (all tiers)
- **Description**: Tapping any part of a stock card EXCEPT the heart icon navigates to the Stock Detail screen for that ticker. The tap target exclusion zone for the heart icon is the entire heart icon touch area (minimum 44×44px). When the user navigates back from Stock Detail, they return to the Discover screen at the same scroll position and with the same feed state (theme filter, market filter, scroll offset) as when they left.
- **Input**:
  - User tap on card body (non-heart area)
  - Current scroll position and filter state
- **Output**:
  - Navigation to Stock Detail for tapped ticker
  - On back navigation: Discover screen restored to exact scroll position; filters unchanged
- **Precondition**: Stock card is rendered. User taps card body.
- **Postcondition**: Stock Detail opens. Back navigation restores Discover state.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-21-01 | User taps card body | Any time | Navigates to Stock Detail |
| AC-21-02 | User taps heart icon area | Any time | Watchlist toggle fires (FR-20); NO navigation to Stock Detail |
| AC-21-03 | User navigates back from Stock Detail | Any time | Discover scroll position restored; theme and market filter unchanged |
| AC-21-04 | User navigated to Stock Detail via card | When on Stock Detail | Back button, Android hardware back, and iOS swipe-back all return to Discover |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Card tap on a delisted stock | Navigate to Stock Detail; delisted state shown there |
| User holds-press (long press) on card | No special action; treat as normal tap on release |

- **Priority**: P0

---

### FR-22: Editorial Content Management

- **Actor**: Content Manager (CMS admin) + System
- **Description**: Each stock card's editorial "Why it's hot" hook (≤120 chars) and theme badge are managed via the server-side CMS. Only stocks with active, approved CMS content appear in the Discover feed. CMS updates (publish, edit, delete) are reflected in the Discover feed within 5 minutes without requiring an app release. If a stock's CMS content is deleted, the card is removed from the feed on the next scheduled feed refresh (within 5 minutes). CMS validation enforces the 120-character hook limit — cards with oversized hooks cannot be published.
- **Input**:
  - CMS content fields: stock ticker, hook text (≤120 chars), theme badge label, active/inactive status
  - CMS publish/edit/delete actions
- **Output**:
  - Discover feed reflects CMS changes within 5 minutes
  - Deleted stock cards removed on next feed refresh
  - Hooks always ≤120 characters (enforced at CMS publish time)
- **Precondition**: Stock exists in the market data system. CMS admin has publish access.
- **Postcondition**: Feed reflects current CMS state within 5 minutes.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-22-01 | CMS admin publishes a new stock card | Publish action | Stock appears in Discover feed within 5 minutes |
| AC-22-02 | CMS admin deletes a stock card | Delete action | Stock removed from Discover feed within 5 minutes of next refresh |
| AC-22-03 | CMS admin edits hook text | Edit + publish | Updated hook shown in feed within 5 minutes |
| AC-22-04 | CMS admin attempts to publish hook with 121 chars | Publish action | CMS validation rejects; error "Hook text must be 120 characters or fewer" |
| AC-22-05 | Stock is delisted from exchange | Market data event | CMS card for that stock should be manually deactivated by CMS admin; system does not auto-delete |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| CMS API is unreachable | Feed serves last cached CMS data; no stocks added or removed until CMS reachable |
| Two CMS edits for same stock within 5 minutes | Latest edit wins at next feed refresh |
| Theme badge label is blank in CMS | Card published without theme badge; hook still shown |

- **Priority**: P1

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-02 | Watchlist maximum is 100 stocks per user | Add blocked; inline message "Watchlist full. Remove a stock to add another." No optimistic update fires. |
| BR-05 | Only stocks with approved CMS editorial content appear in Discover | Stocks without CMS content must not appear in Discover feed under any circumstances |
| BR-06 | Social proof counts ("X users watching") refreshed every 5 minutes | Counts may be up to 5 minutes stale; no staleness indicator shown for social proof specifically |
| BR-15 | Minimum 10 cards must be present before first infinite scroll trigger | If total available cards < 10, show all; no infinite scroll; no error |
| BR-45 | Discover ranker boosts cards matching user's `industrial_prefs` | Empty `industrial_prefs`: fallback to VN trending primary; KR/Global reference below |
| BR-46 | KR and Global market data must carry persistent non-dismissible "Reference" chip | Reference chip must be in DOM; removal or hiding = P0 bug |

---

## 4. UI/UX Notes

- **Feed loading skeleton**: On first load, show 3 skeleton stock card placeholders while initial 10 cards load.
- **Pull-to-refresh**: Standard pull-to-refresh gesture available on Discover feed; reloads from page 1 with current filters.
- **Card height**: Fixed height for all cards (prevents layout shift during infinite scroll); company name truncates at 1 line; hook truncates at 2 lines with ellipsis (full text on Stock Detail).
- **Theme chip bar**: Sticky below the market toggle; does not scroll with the feed.
- **Market toggle**: Sticky at top of screen; does not scroll with the feed.
- **Heart icon touch target**: Minimum 44×44px tap area even if visual icon is smaller; heart is positioned top-right of card.
- **"Reference" chip**: Positioned top-right of card, below or alongside Trending badge; gray pill style; non-dismissible.
- **Empty state illustration**: Show a simple graphic + message; no broken card outlines.
- **Toast**: Bottom-anchored above nav bar; auto-dismiss 4 seconds.

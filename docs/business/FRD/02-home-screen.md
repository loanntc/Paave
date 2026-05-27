# FRD-02: Home Screen

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

## Module Description

The Home Screen is the first screen a user sees after login. It surfaces the user's paper portfolio value, a market snapshot, trending stocks, and a personalized watchlist. It also hosts the persistent bottom navigation bar. This document is self-contained; a developer reading only this file has everything needed to build the Home Screen.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Home Screen |
| Primary Actor | Authenticated user (LEARN_MODE age 16–17; FULL_ACCESS age 18+) |
| Goal | At-a-glance view of portfolio health, market pulse, trending stocks, and watchlist |
| Trigger | Successful login; tap on Home tab in bottom nav |
| Screen State | Preserved when switching away and back (except scroll reset on re-tap of active Home tab) |

---

## 2. Functional Requirements

---

### FR-09: Portfolio Value Hero Widget

- **Actor**: Authenticated user (FULL_ACCESS only)
- **Description**: Displays the user's total paper portfolio value prominently at the top of the Home Screen. The widget always shows the trilingual virtual funds label beneath the portfolio value. If the user has no open positions, a "Start paper trading" CTA is shown instead of a zero value. LEARN_MODE users do not see this widget at all. Brokerage CTAs are never rendered for LEARN_MODE users anywhere in the UI — not hidden with CSS, not present in the DOM.
- **Input**:
  - User's paper portfolio total value (real-time computed from open positions × current prices, sum + available cash)
  - User's `feature_tier`: LEARN_MODE | FULL_ACCESS
  - Market data availability flag
- **Output**:
  - Rendered hero card with: formatted VND total value (BR-14 formatting), daily change (±VND and ±%), and the trilingual label "Tiền ảo / 가상 자금 / Virtual Funds" in a fixed sub-label beneath the value
  - OR: "Start paper trading" CTA (taps → Paper Trading module) when no positions exist
  - OR: last known value + stale indicator when market data is unavailable
- **Precondition**: User is authenticated. `feature_tier` has been resolved.
- **Postcondition**: Hero widget renders correctly for user's tier. LEARN_MODE users see no widget and no brokerage CTA in any surface.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-09-01 | User is FULL_ACCESS with active positions | Home Screen loads | Hero widget shows total portfolio value in VND, daily change, and trilingual label |
| AC-09-02 | User is FULL_ACCESS with zero positions | Home Screen loads | Hero widget shows "Start paper trading" CTA; tapping navigates to Paper Trading |
| AC-09-03 | Market data feed is down | Home Screen loads or refreshes | Last known value displayed with stale indicator (clock icon + "As of [HH:MM]"); trilingual label still visible |
| AC-09-04 | User is LEARN_MODE | Home Screen loads | Hero widget is completely absent from the screen (no placeholder, no empty card) |
| AC-09-05 | User is LEARN_MODE | Home Screen loads | No brokerage CTA rendered anywhere on screen (including in source markup) |
| AC-09-06 | User is FULL_ACCESS | At all times | Trilingual label "Tiền ảo / 가상 자금 / Virtual Funds" is visible regardless of portfolio state |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Portfolio value computes to exactly 0 VND (all cash, no positions) | Show 500,000,000 VND (initial balance); show "Start paper trading" CTA if no trades ever made |
| Market data partially unavailable (some tickers stale, others live) | Show aggregate with stale indicator; tooltip lists which tickers are stale |
| User's `feature_tier` cannot be resolved (API failure) | Default to LEARN_MODE restrictions (safe default); show error toast; retry silently in background |
| Very large portfolio value (> 999 billion VND) | Format as "X,XXX tỷ VND"; label does not overflow container |
| User rapidly switches between LEARN_MODE and FULL_ACCESS (DOB correction) | Re-evaluate tier on next app foreground; update widget within current session without requiring logout |

- **Priority**: P0 (must ship in V1)

---

### FR-10: Market Snapshot Widget

- **Actor**: Authenticated user (all tiers)
- **Description**: Shows a compact horizontal snapshot of four indices: VN-Index (primary, real-time ≤15s), KOSPI (reference), S&P 500 (reference), Nasdaq (reference). Each index shows: index name, current value, daily change (±points and ±%). Reference indices carry a persistent "Reference" chip. Widget auto-refreshes every 30 seconds while the app is in the foreground. When the market is closed, shows the last close value with a "Market Closed" label and the next open time. If the data feed fails, cached data is shown with a non-dismissible yellow banner.
- **Input**:
  - Index feed data: VN-Index (≤15s SLA), KOSPI (reference, no SLA), S&P 500 (reference, no SLA), Nasdaq (reference, no SLA)
  - Market status per index (open/closed/pre-market)
  - Cached last-known data per index
- **Output**:
  - Four compact index cards in horizontal layout
  - VN-Index: real-time value, change, green/red color coding
  - KOSPI, S&P 500, Nasdaq: value, change, "Reference" chip on each
  - "Market Closed — Next open: [day] [HH:MM] [TZ]" when closed
  - Yellow banner "Market data may be delayed" on feed outage
- **Precondition**: User is authenticated and Home Screen is in foreground.
- **Postcondition**: Index data is displayed and auto-refreshed every 30 seconds. Stale/closed states shown correctly.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-10-01 | App is in foreground, all feeds healthy | 30 seconds elapse | Widget silently refreshes without visible flash; updated values shown |
| AC-10-02 | VN market is open | Home Screen renders | VN-Index shows live value with ≤15s latency, color-coded change |
| AC-10-03 | VN market is closed (outside 09:00–15:00 ICT Mon–Fri or holiday) | Home Screen renders | "Market Closed — Next open: [weekday] 09:00 ICT" shown; last close value displayed |
| AC-10-04 | KOSPI card is displayed | Any time | "Reference" chip is visible and non-dismissible on KOSPI card |
| AC-10-05 | S&P 500 and Nasdaq cards displayed | Any time | "Reference" chip is visible on both cards |
| AC-10-06 | Index feed is unreachable | Home Screen renders or auto-refreshes | Cached data shown; yellow banner "Market data may be delayed" appears; banner not dismissible |
| AC-10-07 | App is backgrounded | Background state | Auto-refresh paused; resumes immediately on foreground |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| All four feeds fail simultaneously | Show cached data for all four with yellow banner |
| VN-Index feed returns in ≤15s but KOSPI feed has no cached data | Show VN live; show "—" for KOSPI value; retain "Reference" chip |
| Market is partially closed (e.g., VN closed, US open) | Per-index status shown independently |
| Next open time calculation crosses a holiday | Use server-side holiday calendar; compute next valid trading day |
| Device clock is wrong | Use server timestamp for open/close determination; device clock is never trusted for this |

- **Priority**: P0

---

### FR-11: Trending Stocks Section

- **Actor**: Authenticated user (all tiers)
- **Description**: A horizontally scrollable "Trending Now" section below the Market Snapshot Widget. Shows the top 5 trending stocks from the user's preferred market (default: VN). Each card displays: ticker symbol, company name, current price (VND for VN; native currency for KR/Global), daily % change (color-coded), and a social proof count ("X users watching" — updated every 5 minutes per BR-06). If fewer than 5 trending stocks are available, all available stocks are shown with no error or placeholder cards. Tapping any card navigates to the Stock Detail screen for that ticker.
- **Input**:
  - Trending stock list from server (up to 5, ranked by trending algorithm)
  - User's preferred market setting
  - Social proof counts (refreshed every 5 min per BR-06)
- **Output**:
  - Horizontal scrollable row of up to 5 stock cards
  - Each card: ticker, company name, price, daily % change (green if ≥0, red if <0), "X users watching"
  - Fewer than 5: show all available; no "loading" or "error" filler cards
- **Precondition**: User is authenticated. Preferred market is set (default VN).
- **Postcondition**: Trending list is rendered; tapping a card navigates to Stock Detail.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-11-01 | 5 trending stocks available | Home Screen loads | All 5 cards rendered in horizontal scroll row |
| AC-11-02 | Only 3 trending stocks available | Home Screen loads | 3 cards shown; no placeholder or error for positions 4 and 5 |
| AC-11-03 | 0 trending stocks available | Home Screen loads | Section header "Trending Now" hidden entirely; no empty section shown |
| AC-11-04 | User taps a stock card | Any state | Navigates to Stock Detail for that ticker |
| AC-11-05 | Social proof count refreshes | Every 5 minutes | "X users watching" updates without full page reload |
| AC-11-06 | User's preferred market is VN | Home Screen loads | Trending stocks are sourced from VN market (HOSE/HNX/UPCOM) |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Trending API returns error | Section hidden; no error displayed; Home Screen loads without it |
| Stock in trending list gets delisted mid-session | Card shows "Delisted" indicator; tapping still navigates to Stock Detail with delisted state |
| Price change is exactly 0% | Show "0.00%" in gray (#9E9E9E) — neither green nor red |
| User's market preference is KR | Trending stocks sourced from KR; "Reference" chip on each card |

- **Priority**: P0

---

### FR-12: Personalized Watchlist (Home Preview)

- **Actor**: Authenticated user (all tiers)
- **Description**: Shows the first 5 stocks from the user's watchlist (sorted by watchlist add order, oldest first) with live price and daily change. A "See All" link navigates to the full Watchlist screen. If the watchlist is empty, displays the empty state message. If a watchlist stock is delisted, it shows a "Delisted" indicator and freezes P&L. The watchlist has a global maximum of 100 stocks (BR-02); this widget never triggers that error — it is enforced at add-to-watchlist actions.
- **Input**:
  - User's watchlist (up to 100 stocks; home preview shows first 5)
  - Live prices for watchlist stocks (same refresh cadence as FR-13: every 30s foreground, pull-to-refresh)
  - Delisted stock status per ticker
- **Output**:
  - Up to 5 watchlist stock rows: ticker, company name, current price, daily change (±VND, ±%)
  - "See All →" link at section bottom (always visible if watchlist has ≥1 stock)
  - Empty state: "Your watchlist is empty. Add stocks to track them here." with add-stocks CTA
  - "Delisted" chip on delisted stocks; P&L shows frozen last value
- **Precondition**: User is authenticated.
- **Postcondition**: Watchlist preview is rendered and live; navigating to "See All" opens full Watchlist.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-12-01 | Watchlist has ≥5 stocks | Home Screen loads | First 5 displayed; "See All" link visible |
| AC-12-02 | Watchlist has 3 stocks | Home Screen loads | All 3 displayed; "See All" link visible |
| AC-12-03 | Watchlist is empty | Home Screen loads | Empty state message shown; no rows |
| AC-12-04 | User taps "See All" | Any state | Navigates to full Watchlist screen |
| AC-12-05 | A watchlist stock is delisted | Home Screen loads | "Delisted" chip on that row; P&L frozen at last known value |
| AC-12-06 | Live price data unavailable for a watchlist stock | Refresh | Show last known price with stale indicator; no crash |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| All 5 preview stocks are delisted | All 5 show "Delisted"; "See All" still functional |
| Watchlist has 100 stocks | Preview shows first 5; "See All" shows all 100 |
| Stock is suspended (not yet delisted) | Show "Suspended" chip; price frozen |
| Price API returns partial data (some stocks OK, some missing) | Show available prices live; missing ones show stale indicator |

- **Priority**: P0

---

### FR-13: Home Screen Data Refresh

- **Actor**: System (automatic) + User (manual pull-to-refresh)
- **Description**: Home Screen data (portfolio value, market snapshot, trending stocks, watchlist prices) auto-refreshes every 30 seconds while the app is in the foreground. The user can also pull-to-refresh to force an immediate refresh. On any refresh failure, the previous data is retained and a non-blocking toast is shown. If there is no internet connection, cached data is retained and a toast is shown. No auto-retry loop — the next scheduled 30s tick will retry.
- **Input**:
  - Foreground state signal
  - Pull-to-refresh gesture from user
  - Network availability
- **Output**:
  - Refreshed data for all Home Screen sections simultaneously
  - On failure: toast "Unable to refresh. Showing last available data." (disappears after 4 seconds)
  - On no internet: same toast
- **Precondition**: User is on Home Screen and app is in foreground.
- **Postcondition**: All sections show latest data or retain previous data with toast notification.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-13-01 | App in foreground | 30 seconds pass | All Home Screen data silently refreshes |
| AC-13-02 | User performs pull-to-refresh | Any time | Immediate refresh triggered; spinner shown during fetch |
| AC-13-03 | Refresh API call fails | On any refresh attempt | Previous data retained; toast shown for 4 seconds |
| AC-13-04 | No internet connection | On any refresh attempt | Toast "Unable to refresh. Showing last available data." shown; cached data retained |
| AC-13-05 | App is backgrounded | While backgrounded | Auto-refresh paused; no API calls made |
| AC-13-06 | App returns to foreground | After being backgrounded | Immediate refresh triggered; then 30s cadence resumes |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Pull-to-refresh during ongoing auto-refresh | Debounce: if auto-refresh started <2s ago, ignore pull gesture; otherwise trigger new fetch |
| Partial refresh (some sections succeed, some fail) | Successful sections update; failed sections retain old data with per-section stale indicator |
| User pulls-to-refresh repeatedly very fast | Rate-limit: max 1 refresh per 5 seconds; subsequent pulls within 5s do nothing |

- **Priority**: P0

---

### FR-14: Bottom Navigation Bar

- **Actor**: Authenticated user (all tiers)
- **Description**: A persistent bottom navigation bar with 5 tabs: Home, Discover, Markets, Portfolio, Profile. The active tab is highlighted (using the Neo Lumen design system's active state). Re-tapping the currently active tab scrolls the current screen back to the top (scroll position reset). When switching between tabs, each tab's internal state is preserved (scroll position, sub-tab selection) EXCEPT that re-tapping the active tab resets scroll.
- **Input**:
  - Tab tap gesture
  - Current active tab state
  - Current scroll position of active tab
- **Output**:
  - Navigation to the tapped tab's screen
  - Active tab highlighted with Neo Lumen active color
  - Re-tap active tab: smooth scroll-to-top of current screen
  - Tab state preserved (except scroll on re-tap)
- **Precondition**: User is authenticated.
- **Postcondition**: Correct tab is active and highlighted; screen content matches tab.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-14-01 | User is on Home tab | Taps Discover | Navigates to Discover; Home state preserved; Discover tab highlighted |
| AC-14-02 | User is on Markets tab with sub-tab on Korea | Navigates away then returns | Korea sub-tab is still active |
| AC-14-03 | User is on Home tab, scrolled down | Taps Home tab again | Smooth scroll to top of Home Screen |
| AC-14-04 | User switches tabs 3 times rapidly | Any sequence | Correct final tab shown; no race condition or blank screen |
| AC-14-05 | LEARN_MODE user | At any time | Portfolio tab is visible but paper trading portfolio shown (no brokerage CTA) |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Tab navigation during active API call | API call completes; result applied to background tab; no UI glitch |
| Device orientation changes while navigating | Layout re-renders; active tab and state preserved |
| Memory pressure causes tab state eviction | Tab reloads fresh on return; no crash |

- **Priority**: P0

---

### FR-14.1: Today's Goals Widget (Daily Missions)

- **Actor**: Authenticated user (all tiers)
- **Description**: A compact widget displayed on the Home Screen (below the market snapshot section, above the watchlist) that shows the user's 3 daily mission assignments (FR-GAME-08). Missions show title, XP reward, and completion status. If Module 1 is not complete, the widget renders a locked state with a prompt. If the user has no mission assignments (inactive ≥15 days), the widget shows an empty state.
- **Input**:
  - `GET /api/v1/gamification/daily-missions/today`
  - Response: `{ module1_complete: boolean, assignments: [ { mission_id, title_vi, xp_reward, status, deep_link } ] }`
  - `module_progress.M1_status` (to determine locked vs live state)
- **Output**:
  - If M1 status = `COMPLETE` and assignments exist: 3 mission cards rendered with title, XP pill, status indicator (assigned/completed/expired)
  - If M1 status ≠ `COMPLETE`: locked state with prompt message and CTA
  - If M1 complete but no assignments (inactive user): empty state with "Quay lại sớm để nhận nhiệm vụ!" (Come back tomorrow for missions!)
- **Precondition**: User is authenticated.
- **Postcondition**: No state change; read-only display. Mission completion is triggered by the relevant action screen, not by this widget.

**Widget States:**

| State | Trigger | Visual |
|---|---|---|
| Locked | M1 status ≠ `COMPLETE` | Greyed placeholders + padlock + "Hoàn thành Module 1 để mở khóa" + "Bắt đầu học" CTA |
| Active (missions assigned) | M1 complete + assignments exist | 3 mission rows: icon, title, XP pill, status badge |
| Empty (inactive user) | M1 complete + no assignments | "Quay lại sớm để nhận nhiệm vụ!" text with calendar icon |

**Mission Row Visual Spec:**

| Status | Left icon | Right element |
|---|---|---|
| `ASSIGNED` | Category icon (⚡ trade, 📚 learn, 🔍 research, 💼 portfolio) | XP pill (Lime `#CAFD00`, dark text) |
| `COMPLETED` | Green checkmark ✓ | "Đã nhận [XP]" (Earned [XP]) in green `#10B981` |
| `EXPIRED` | Grey cross ✗ | "Mất rồi" (Missed) in grey `#ADAAAA` |

**Mission row tap behaviour:** Opens the relevant screen (deep link per FR-GAME-08-03); does NOT complete the mission itself (completion is triggered by the action on the target screen).

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-14.1-01 | User has Module 1 complete and 3 missions assigned (0 completed) | Home tab loads | Widget shows 3 active mission rows with XP pills; no locked state |
| AC-14.1-02 | User completes `MISSION_LESSON_1` | Home tab re-renders after lesson | That mission row shows green checkmark and "Đã nhận 25 XP" |
| AC-14.1-03 | User has NOT completed Module 1 | Home tab loads | Widget shows locked state with "Hoàn thành Module 1 để mở khóa nhiệm vụ hàng ngày" and "Bắt đầu học" CTA |
| AC-14.1-04 | Midnight ICT passes (new day) | User opens Home tab next morning | Widget shows freshly assigned missions; previous day's missions are gone |
| AC-14.1-05 | User taps a mission row (`MISSION_RESEARCH_2`) | Tap on "Read the news" row | News tab opens; widget interaction is tracked (`session_progress.cta_interacted`) but mission not yet completed |
| AC-14.1-06 | API call for missions fails | Home tab loads | Widget shows skeleton loader for 2s; then shows error state with retry button; other Home screen sections unaffected |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| User has missions assigned but one is `EXPIRED` and two are `ASSIGNED` | Widget shows all 3 rows: 1 expired (grey), 2 active |
| New mission assignments race with Home tab render (midnight boundary) | If assignments are not yet ready at load time, widget shows "Missions loading…" skeleton; refreshes when API responds |
| User taps locked state CTA "Bắt đầu học" | Navigates to Grow tab → Learning Path (same behaviour as FR-LEARN-12 locked CTA) |

- **Priority**: P1

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-02 | Watchlist maximum is 100 stocks per user | Add-to-watchlist action rejected with message "Watchlist full. Remove a stock to add another." |
| BR-06 | Social proof counts ("X users watching") refreshed every 5 minutes | Counts may be up to 5 minutes stale; this is acceptable and no staleness indicator is shown for social proof |
| BR-14 | VND values formatted with thousand separators; B = billion (tỷ), T = trillion (nghìn tỷ) | Unformatted values must never be shown; formatting failure → show "—" |
| BR-18 | Trilingual label "Tiền ảo / 가상 자금 / Virtual Funds" must appear beneath portfolio value at all times | Missing label = compliance violation; treat as P0 bug; label is part of rendered DOM, not conditional |
| BR-31 | Brokerage CTA must never be rendered for LEARN_MODE users on any surface | If feature_tier = LEARN_MODE, CTA is absent from DOM entirely — not display:none, not visibility:hidden |
| BR-46 | KR and Global market data must carry a persistent non-dismissible "Reference" chip | Reference chip missing = UI bug; chip must be in markup, not toggled |
| BR-09 | VN market data SLA ≤15 seconds real-time; KR and Global are reference with no SLA | If VN data is >15s old without stale indicator, log as SLA breach |

---

## 4. UI/UX Notes

- **Empty states**: Each section has its own empty state — never show a blank section without a message.
- **Skeleton loaders**: On first load, show skeleton cards for each section; replace with data or error state within 3 seconds.
- **Color coding**: Positive change → `#00C853`; negative → `#D50000`; zero → `#9E9E9E`.
- **Trilingual label typography**: "Tiền ảo / 가상 자금 / Virtual Funds" renders as a single string in one text element; font size smaller than the portfolio value.
- **Toast notifications**: Bottom-anchored, above the navigation bar, auto-dismiss after 4 seconds. Not stackable — only one toast at a time.
- **Stale indicator**: Clock icon (⏱) + "As of [HH:MM]" label in gray.
- **"Reference" chip**: Small pill badge, gray background, "Reference" text, non-dismissible, positioned top-right of the index card.
- **Bottom nav bar**: 5 equal-width tabs; icons + labels; active tab uses Neo Lumen lime-signal color for icon and label.

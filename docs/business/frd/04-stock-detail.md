# FRD-04: Stock Detail

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

## Module Description

The Stock Detail screen is the canonical view for a single stock. It is reachable from Discover, Home (trending/watchlist), Markets, and Search. It renders price data, a chart, key statistics, analyst sentiment, community posts, and editorial context. It provides primary action buttons: Add to Watchlist, Set Price Alert, and Paper Trade. This document is self-contained; a developer reading only this file has everything needed to build this screen.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Stock Detail |
| Primary Actor | Authenticated user (all tiers) |
| Goal | Understand a stock's performance and take action (watchlist, alert, paper trade) |
| Trigger | Tap on any stock card in Discover, Home, Markets, or Search results |
| Entry Points | Discover feed, Home trending/watchlist, Markets gainers/losers/active, Search results, Push notification deep link |

---

## 2. Functional Requirements

---

### FR-23: Stock Detail Layout

- **Actor**: Authenticated user (all tiers)
- **Description**: The Stock Detail screen is structured into 8 ordered sections rendered top-to-bottom: (1) Header — ticker symbol, full company name, exchange name. (2) Price hero — current price + daily change (± value and ±%, color-coded). (3) Price chart (FR-24). (4) Action buttons row — "Add to Watchlist" button, "Set Alert" button, "Paper Trade" button. (5) Key Stats grid (FR-25). (6) Analyst Sentiment bar (FR-26). (7) Community Feed tab (lists posts tagged with this ticker, per FR-SOC-02 social module). (8) Editorial context — CMS "Why it's hot" hook + theme badge (shown only if CMS content exists for this stock; hidden entirely otherwise). If any section's data is unavailable on load, a skeleton loader is shown for that section; the system retries automatically after 3 seconds. If retry fails, the section shows an inline error with a "Retry" button.
- **Input**:
  - Ticker symbol (passed from entry point)
  - Market data: current price, daily change
  - CMS content availability flag
  - User's watchlist state for this ticker
  - User's alert state for this ticker (for Set Alert button label)
- **Output**:
  - Fully rendered 8-section layout
  - Skeleton loaders for unavailable sections
  - Auto-retry after 3 seconds on data failure
  - Inline error + manual "Retry" if second attempt also fails
- **Precondition**: User is authenticated. Ticker symbol is valid.
- **Postcondition**: Screen renders all available sections. Unavailable sections show appropriate state.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-23-01 | All data available | Screen loads | All 8 sections rendered within 3 seconds |
| AC-23-02 | Community Feed data unavailable | Screen loads | Sections 1–6 and 8 render normally; section 7 shows skeleton then retries |
| AC-23-03 | CMS content does not exist for this stock | Screen loads | Section 8 (Editorial) is completely absent — no header, no placeholder |
| AC-23-04 | Initial load fails for Key Stats | Screen loads | Skeleton shown for Key Stats; auto-retry at 3s; if retry fails, inline error + "Retry" button |
| AC-23-05 | KR or Global stock | Screen loads | Header shows exchange name (e.g., "KOSPI"); "Reference" chip visible in header |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Ticker is delisted | Header shows "Delisted" badge; price shows last known value; action buttons disabled except "Remove from Watchlist" |
| Ticker is suspended | Header shows "Suspended" badge; chart shows data up to suspension date; action buttons disabled |
| User arrives via deep link with invalid ticker | Navigate to Markets screen; toast "Stock not found." |
| All 8 sections fail to load | Show full-page error state: "Unable to load stock data. Check your connection." with "Retry" button |

- **Priority**: P0

---

### FR-24: Price Chart

- **Actor**: Authenticated user (all tiers)
- **Description**: An interactive line chart showing price history for the selected time range. Time range selector: 1D, 1W, 1M, 3M, 1Y (rendered as horizontal chip tabs below or above the chart). Default on screen load: 1D. VN stocks show real-time intraday data at 1-minute intervals for 1D range. KR and Global stocks show end-of-day data for all ranges. Tapping a range chip re-renders the chart within 2 seconds. During live KR session, previous day's close is shown for 1D with a note: "Live KR data not available. Showing previous close." Chart is a line chart; Y-axis auto-scales to data range. X-axis shows time labels appropriate to range (e.g., 09:00–15:00 for 1D VN; Mon–Fri labels for 1W).
- **Input**:
  - Ticker symbol
  - Selected time range: 1D | 1W | 1M | 3M | 1Y
  - Market origin (VN = real-time intraday; KR/Global = end-of-day)
  - Price history data from backend
- **Output**:
  - Line chart rendered within 2 seconds of range selection
  - VN 1D: 1-minute interval data, live-updating
  - KR/Global: end-of-day data for all ranges
  - KR live session: previous day close with delay note
  - Y-axis: VND values for VN; native currency for KR/Global
- **Precondition**: Stock Detail is open. Price history data is available.
- **Postcondition**: Chart renders for selected range. Range chip shows active state.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-24-01 | VN stock, 1D range, market open | Chart loads | 1-minute interval line chart from 09:00 to current time |
| AC-24-02 | VN stock, 1D range, market closed | Chart loads | Full day line chart from 09:00 to 15:00; "Market Closed" label |
| AC-24-03 | User taps "1M" range | Any time | Chart re-renders within 2 seconds; "1M" chip highlighted |
| AC-24-04 | KR stock, 1D range, during KR session | Chart loads | Previous day's close line shown; note "Live KR data not available. Showing previous close." |
| AC-24-05 | KR stock, 1Y range | Chart loads | End-of-day close prices for past 12 months |
| AC-24-06 | Range chip already selected | User taps same chip | No re-render; no API call |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| 1Y historical data not available (new listing < 1Y old) | Chart renders from listing date; X-axis adjusted; note "Data available from [listing date]." |
| Chart data returns empty array | Inline message "No price data available for this range." |
| Real-time 1D feed drops | Chart freezes at last received data point; stale indicator shown in chart header |
| Device in landscape orientation | Chart expands to fill width; time range chips remain accessible |

- **Priority**: P0

---

### FR-25: Key Stats

- **Actor**: Authenticated user (all tiers)
- **Description**: A 3-column grid showing 9 key statistics: Open, Prev Close, Day High, Day Low, 52W High, 52W Low, Volume, Market Cap, P/E Ratio. Each stat has a label (locale-specific per FR-LANG-02) and a value. Values unavailable for any reason: show "—". All values formatted per BR-14 (thousand separators; B/T suffixes for billion/trillion). Financial terminology is locale-specific: VN language → Vietnamese terms; KR language → Korean terms; EN → English NYSE/NASDAQ terms. Stat labels and terminology are defined in a server-side mapping table updatable without app release.
- **Input**:
  - Stock stats data: open, prev close, day high, day low, 52w high, 52w low, volume, market cap, P/E ratio
  - User's active language (vi | ko | en)
  - Locale-specific terminology mapping (server-side)
- **Output**:
  - 3×3 grid with 9 stats
  - Labels in active language using locale-specific financial terminology
  - Values with BR-14 formatting; "—" for unavailable
- **Precondition**: Stock Detail is open.
- **Postcondition**: Key Stats grid is rendered with latest available data.

#### Locale-Specific Label Mapping

| Stat | Vietnamese (vi) | Korean (ko) | English (en) |
|---|---|---|---|
| P/E Ratio | Chỉ số P/E | 주가수익비율 | P/E Ratio |
| Market Cap | Vốn hóa thị trường | 시가총액 | Market Cap |
| Volume | Khối lượng | 거래량 | Volume |
| Open | Giá mở cửa | 시가 | Open |
| Prev Close | Giá đóng cửa trước | 전일 종가 | Prev Close |
| Day High | Cao nhất ngày | 당일 고가 | Day High |
| Day Low | Thấp nhất ngày | 당일 저가 | Day Low |
| 52W High | Cao nhất 52 tuần | 52주 최고 | 52W High |
| 52W Low | Thấp nhất 52 tuần | 52주 최저 | 52W Low |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-25-01 | All 9 stats available | Key Stats renders | All 9 shown in 3×3 grid with correct labels and values |
| AC-25-02 | P/E Ratio not available | Key Stats renders | P/E cell shows label + "—" |
| AC-25-03 | User's language is Vietnamese | Key Stats renders | Labels use Vietnamese financial terminology (e.g., "Chỉ số P/E") |
| AC-25-04 | User's language is Korean | Key Stats renders | Labels use Korean financial terminology (e.g., "주가수익비율") |
| AC-25-05 | Market Cap is 15 trillion VND | Key Stats renders | Shows "15T VND" or "15 nghìn tỷ VND" per locale |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| All 9 stats unavailable | All show "—"; grid still renders with labels |
| Locale-specific term not found in server mapping | Fallback to English term |
| Server-side terminology mapping update during session | Applied on next screen load; no hot update required |
| P/E Ratio is negative (loss-making company) | Show value with "−" prefix; color gray (#9E9E9E) |

- **Priority**: P0

---

### FR-26: Analyst Sentiment

- **Actor**: Authenticated user (all tiers)
- **Description**: A visual bar showing the Buy / Hold / Sell breakdown among analysts covering the stock. Three segments: Buy% (green), Hold% (amber), Sell% (red). Must sum to 100%. Below the bar: a consensus label determined by the thresholds in BR-07. Analyst count shown as "Based on X analysts." If sentiment data is unavailable or analyst count is zero: show "Analyst sentiment not available for this stock." Clicking the bar or label does nothing (display only).
- **Input**:
  - Buy%, Hold%, Sell% (integers 0–100, must sum to 100)
  - Analyst count (integer ≥0)
- **Output**:
  - Proportional bar: Buy% green | Hold% amber | Sell% red
  - Consensus label below bar
  - "Based on X analysts." text
  - If unavailable or 0 analysts: "Analyst sentiment not available for this stock."
- **Precondition**: Stock Detail is open.
- **Postcondition**: Sentiment bar and consensus label rendered correctly.

#### Consensus Label Logic (BR-07)

| Condition | Label |
|---|---|
| Buy% ≥ 70% | "Strong Buy" |
| Buy% 50–69% | "Buy" |
| Buy% 40–49% AND Sell% ≤ 30% | "Neutral" |
| Sell% 50–69% | "Sell" |
| Sell% ≥ 70% | "Strong Sell" |
| None of the above | "Mixed" |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-26-01 | Buy%=75, Hold%=15, Sell%=10, analysts=20 | Sentiment renders | Bar shows 75% green / 15% amber / 10% red; "Strong Buy" label; "Based on 20 analysts." |
| AC-26-02 | Buy%=55, Hold%=30, Sell%=15, analysts=8 | Sentiment renders | "Buy" label |
| AC-26-03 | Buy%=45, Hold%=40, Sell%=15, analysts=5 | Sentiment renders | "Neutral" label (Buy% 40–49% AND Sell% ≤ 30%) |
| AC-26-04 | Buy%=10, Hold%=20, Sell%=70, analysts=15 | Sentiment renders | "Strong Sell" label |
| AC-26-05 | Analyst data unavailable | Sentiment section renders | "Analyst sentiment not available for this stock." shown |
| AC-26-06 | Analyst count = 0 | Sentiment section renders | "Analyst sentiment not available for this stock." shown |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Buy%+Hold%+Sell% ≠ 100% (data error) | Log server data error; display bar with available data; show caveat "Data may be incomplete" |
| Buy%=50, Sell%=50, Hold%=0 | Condition: not Buy%≥70, not Buy%50–69 (exactly 50 is 50–69), label = "Buy" |
| All three percentages = 0% | Treat as unavailable; show unavailability message |

- **Priority**: P1

---

### FR-27: Add to Watchlist from Stock Detail

- **Actor**: Authenticated user (all tiers)
- **Description**: A full-width "Add to Watchlist" / "Remove from Watchlist" button in the action buttons row. Button label reflects current watchlist state. Interaction uses optimistic UI: label and state flip immediately. Backend call made asynchronously. On backend failure: state reverts and toast shown. Watchlist full (100 stocks): add blocked before optimistic update with inline message. Behavior is identical to FR-20 but presented as a full-width button instead of a heart icon.
- **Input**:
  - User tap on "Add to Watchlist" or "Remove from Watchlist"
  - Current watchlist state for this ticker
  - Current watchlist count (for BR-02 check before add)
- **Output**:
  - Optimistic: button label flips immediately
  - Backend: POST or DELETE to watchlist API
  - On failure: label reverts; toast "Failed to update watchlist. Try again."
  - Watchlist full: action blocked; inline message "Watchlist full. Remove a stock to add another."
- **Precondition**: Stock Detail is open. User is authenticated.
- **Postcondition**: Watchlist state matches server state.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-27-01 | Stock not in watchlist; <100 stocks | Tap "Add to Watchlist" | Button immediately shows "Remove from Watchlist"; backend add called |
| AC-27-02 | Stock in watchlist | Tap "Remove from Watchlist" | Button immediately shows "Add to Watchlist"; backend remove called |
| AC-27-03 | Backend add fails | After optimistic update | Button reverts to "Add to Watchlist"; toast shown |
| AC-27-04 | Watchlist at 100 stocks | Tap "Add to Watchlist" | Button does not flip; inline message shown; backend NOT called |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| User double-taps quickly | Debounce: second tap within 500ms ignored |
| Stock is delisted | "Add to Watchlist" still functional; delisted indicator shown elsewhere on screen |

- **Priority**: P0

---

### FR-28: Set Price Alert

- **Actor**: Authenticated user (all tiers)
- **Description**: The "Set Alert" button opens a bottom sheet modal. User selects direction ("Price above" or "Price below") and enters a target price. Alert behavior follows SINGLE_FIRE mode by default. A RECURRING mode is user-selectable in the same bottom sheet. One alert per stock per user (BR-03). Setting a new alert for a stock that already has one overwrites the existing alert (no confirmation required — the bottom sheet pre-populates with existing alert values). Alert with target equal to current price: rejected with inline error "Price must be different from current price." If the alert threshold is already satisfied at creation time (EC-ALT-01): the alert triggers on the next price evaluation within ≤15 seconds — it does NOT wait for the next crossing event. SINGLE_FIRE mode: alert status → TRIGGERED after first trigger; consumed (no further fires). RECURRING mode: alert stays ACTIVE after triggering and fires again on each subsequent evaluation that satisfies the condition. If push notifications are disabled: alert is tracked silently with no push sent.

- **Input**:
  - Alert direction: "Price above" | "Price below"
  - Target price (numeric, in stock's native currency)
  - Alert mode: SINGLE_FIRE (default) | RECURRING (user selects)
  - Current stock price (for validation)
  - Existing alert for this stock (if any, pre-populate bottom sheet)
- **Output**:
  - Alert saved to server; status = ACTIVE
  - "Set Alert" button label updates to "Alert Active" with indicator
  - On trigger (SINGLE_FIRE): push notification sent; alert status → TRIGGERED
  - On trigger (RECURRING): push notification sent; alert status remains ACTIVE
  - EC-ALT-01: if condition already met at creation, alert fires within ≤15 seconds
  - Target = current price: inline error "Price must be different from current price."
- **Precondition**: User is authenticated. Bottom sheet is open.
- **Postcondition**: Alert saved. Push notification sent on trigger (if enabled).

#### Bottom Sheet UI Specification

| Element | Details |
|---|---|
| Title | "Set Price Alert — [TICKER]" |
| Current price shown | Read-only label "Current price: [value]" |
| Direction selector | Segmented control: "Price above" \| "Price below" |
| Target price field | Numeric input; keyboard: decimal pad; pre-populated if existing alert |
| Mode selector | Toggle: "One-time" (SINGLE_FIRE) \| "Recurring" |
| Save button | "Save Alert" |
| Delete button (shown if alert exists) | "Remove Alert" — deletes existing alert; shown below Save |
| Error message | Inline below target price field |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-28-01 | No existing alert; stock price = 50,000 | User sets "Price above 60,000" | Alert saved; status ACTIVE; button shows "Alert Active" |
| AC-28-02 | Alert "above 60,000" active; stock at 45,000 | Stock price rises to 61,000 | Push notification sent within 60 seconds; alert status → TRIGGERED (SINGLE_FIRE) |
| AC-28-03 | EC-ALT-01: User sets "above 55,000" when stock = 56,500 | Alert saved | Alert fires within ≤15 seconds |
| AC-28-04 | RECURRING mode; alert fires | Stock meets condition | Push sent; alert remains ACTIVE; fires again next evaluation where condition met |
| AC-28-05 | User sets target = current price | Taps "Save Alert" | Inline error "Price must be different from current price." Alert NOT saved |
| AC-28-06 | Existing alert exists | User opens bottom sheet | Bottom sheet pre-populated with existing direction and target price |
| AC-28-07 | Existing alert exists; user saves new values | Taps "Save Alert" | Existing alert overwritten; new values active immediately |
| AC-28-08 | Push notifications disabled | Alert triggers | No push sent; alert status → TRIGGERED (SINGLE_FIRE) / stays ACTIVE (RECURRING) silently |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Target price is 0 or negative | Inline error "Price must be greater than 0." |
| Target price has more than 2 decimal places | Rounded to 2 decimal places on save; user shown rounded value before saving |
| Network fails on "Save Alert" | Error toast "Could not save alert. Try again."; bottom sheet stays open |
| User deletes alert via "Remove Alert" | Alert deleted from server; button reverts to "Set Alert" |
| Stock is in a reference market (KR/Global) with estimated price | Alert still settable; trigger evaluation uses estimated price with "Reference" note in push notification |

- **Priority**: P1

---

### FR-29: Back Navigation

- **Actor**: Authenticated user (all tiers)
- **Description**: The Stock Detail screen must return to the exact previous screen at the same scroll position via: (a) in-app back button (top-left), (b) Android hardware/gesture back, (c) iOS swipe-back. This is consistent regardless of entry point: Discover, Home, Markets, Search. Scroll position of the source screen is preserved during the Stock Detail visit.
- **Input**:
  - Back gesture or button tap
  - Source screen identity and scroll position (stored on navigation push)
- **Output**:
  - Previous screen restored at same scroll position
  - Previous screen state (filters, sub-tabs) unchanged
- **Precondition**: User is on Stock Detail. Previous screen exists in navigation stack.
- **Postcondition**: Previous screen rendered at stored scroll position.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-29-01 | Arrived from Discover (scrolled to card 15) | Tap back | Returns to Discover at card 15's scroll position |
| AC-29-02 | Arrived from Home trending | Tap back | Returns to Home at same position |
| AC-29-03 | Arrived from Search results | Tap back | Returns to Search results (not to Markets or Home) |
| AC-29-04 | Android hardware back | Tap | Same behavior as in-app back button |
| AC-29-05 | iOS swipe-back from left edge | Gesture | Same behavior as in-app back button |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| User navigates Stock Detail → Stock Detail (from community feed) | Back returns to first Stock Detail; another back returns to original source screen |
| Source screen was removed from stack (cold start from push notification) | Back navigates to Home |

- **Priority**: P0

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-03 | One price alert per stock per user | New alert overwrites existing without confirmation; pre-populate bottom sheet with existing values |
| BR-04 | Price alerts are one-time triggers by default (SINGLE_FIRE) | After trigger: status → TRIGGERED; no further pushes until user re-sets alert. RECURRING mode is opt-in. |
| BR-07 | Analyst consensus thresholds as defined in FR-26 consensus label table | If no threshold matches, show "Mixed" |
| BR-09 | VN market data SLA ≤15 seconds real-time; KR/Global = reference, no SLA | VN stale > 15s: show stale indicator |
| BR-14 | VND values formatted with thousand separators; B = billion, T = trillion | Unformatted values → "—" |
| BR-46 | KR and Global stocks must carry persistent non-dismissible "Reference" chip | Missing chip = P0 bug |

---

## 4. UI/UX Notes

- **"Reference" chip placement on Stock Detail**: Shown in section 1 (Header) alongside exchange name for KR/Global stocks.
- **Action buttons row (section 4)**: Three equal-width buttons on one row. Watchlist button uses heart icon + label. Alert button uses bell icon + label. Paper Trade button uses chart-up icon + label. On small screens (<375px wide): buttons stack vertically.
- **Price hero (section 2)**: Large price display. Change shown as "±X VND (±X%)" on same line below price.
- **Bottom sheet**: Slides up from bottom; semi-transparent overlay behind it; tapping overlay closes sheet without saving.
- **Alert mode toggle**: Default "One-time" selected on first open. If RECURRING alert already exists, "Recurring" pre-selected.
- **Skeleton loaders**: Each section has its own skeleton; they disappear independently as data loads.
- **Community Feed tab (section 7)**: Standard tab appearance; shows paginated posts tagged with this ticker; each post shows author, content (≤500 chars), timestamp, like count.

# FRD — Functional Requirement Document
## Paave — Gen Z Fintech Investing App (V1)

**Document version:** 1.0
**Date:** 2026-04-14
**Author:** Business Analysis Team
**Status:** Approved for Development
**Linked BRD:** BRD.md v1.0

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Functional Requirements](#functional-requirements)
   - [FR-01 to FR-08: Onboarding](#onboarding)
   - [FR-09 to FR-14: Home Screen](#home-screen)
   - [FR-15 to FR-22: Discover / Trending Feed](#discover--trending-feed)
   - [FR-23 to FR-29: Stock Detail](#stock-detail)
   - [FR-30 to FR-35: Portfolio Tracking](#portfolio-tracking)
   - [FR-36 to FR-41: Markets Module](#markets-module)
   - [FR-42 to FR-47: Notifications](#notifications)
   - [FR-48 to FR-53: User Account](#user-account)
3. [Business Rules](#business-rules)
4. [Acceptance Criteria](#acceptance-criteria)
5. [Edge Cases](#edge-cases)

---

## 1. Feature Overview

| Feature | Actor | Goal |
|---------|-------|------|
| Onboarding | New User | Complete registration and market preference setup to access the app |
| Home Screen | Registered User | View portfolio summary, market snapshot, and trending stocks at a glance |
| Discover / Trending Feed | Registered User | Browse curated stock cards with editorial context and theme filters |
| Stock Detail | Registered User | View price data, key stats, and add stocks to watchlist or set alerts |
| Portfolio Tracking | Registered User | Track holdings, P&L, and transaction history |
| Markets Module | Registered User | Browse VN (real-time), KR, and global market data |
| Notifications | Registered User | Receive price alerts and market event notifications |
| User Account | Registered User | Manage profile, preferences, and security settings |

---

## 2. Functional Requirements

---

### ONBOARDING

#### FR-01 — Splash Screen and App Entry

- **Actor:** Unauthenticated User
- **Description:** When a user opens the app for the first time, the system displays the Paave splash screen for exactly 2 seconds, then navigates to the Welcome screen. On subsequent opens, if the user has an active session token, the system navigates directly to the Home screen, bypassing onboarding.
- **Input:** App launch event
- **Output:**
  - First launch: Welcome screen displayed after 2-second splash
  - Returning user with valid session: Home screen displayed directly
  - Returning user with expired session: Login screen displayed

---

#### FR-02 — Welcome Screen

- **Actor:** Unauthenticated User
- **Description:** The system displays a welcome screen with two call-to-action buttons: "Create Account" and "Log In". No market data is shown at this stage.
- **Input:** User arrival on Welcome screen
- **Output:** Navigation to Registration flow (Create Account) or Login screen (Log In)

---

#### FR-03 — Nationality Detection

- **Actor:** New User (during registration)
- **Description:** The system automatically detects the user's device locale/country code and pre-selects the corresponding market:
  - Locale `vi` or country `VN` → pre-select Vietnam (HoSE/HNX)
  - Locale `ko` or country `KR` → pre-select Korea (KRX)
  - All other locales → pre-select Global
  The user can override the auto-detected selection by tapping on a different market option.
- **Input:** Device locale and country code (read at registration start)
- **Output:** Market preference pre-selected on the Market Selection screen; user can change before confirming

---

#### FR-04 — Market Preference Selection

- **Actor:** New User
- **Description:** The system displays a Market Preference screen with three selectable options: Vietnam (HoSE/HNX), Korea (KRX), Global. The user must select exactly one option. The pre-selected option from FR-03 is highlighted by default.
- **Input:** User taps a market option and taps "Continue"
- **Output:** Selected market preference saved to user profile; system proceeds to Step 2 of onboarding

---

#### FR-05 — User Registration (KYC — Lightweight)

- **Actor:** New User
- **Description:** The system collects the following fields to create a user account:
  - Full name (required)
  - Email address (required)
  - Password (required)
  - Nationality (pre-filled from FR-03/FR-04, editable)
  The system sends a verification email upon form submission.
- **Input:**
  - Full name: string, 2–100 characters, letters and spaces only (Unicode-allowed for Vietnamese/Korean characters)
  - Email: valid email format (RFC 5322), max 254 characters
  - Password: 8–64 characters, must contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, 1 special character (`!@#$%^&*`)
  - Nationality: dropdown, values: `VN`, `KR`, `OTHER`
- **Output:**
  - On success: User account created in system with `status = PENDING_VERIFICATION`; verification email sent to provided address; system navigates to Email Verification screen
  - On validation failure: Inline error message displayed next to failing field; form not submitted

---

#### FR-06 — Email Verification

- **Actor:** New User
- **Description:** The system sends a 6-digit OTP to the user's registered email. The user enters the OTP on the Email Verification screen. The OTP is valid for 10 minutes. The user may request a resend after 60 seconds.
- **Input:**
  - OTP: 6-digit numeric code
  - Resend action: tapping "Resend Code" button
- **Output:**
  - Correct OTP within 10 minutes: Account status updated to `ACTIVE`; system navigates to Home screen
  - Incorrect OTP: Error message "Invalid code. X attempts remaining" (maximum 5 attempts before account is locked for 15 minutes)
  - Expired OTP: Error message "Code expired. Please request a new code."
  - Resend: New OTP generated and sent; previous OTP invalidated immediately; 60-second cooldown timer resets

---

#### FR-07 — Login

- **Actor:** Returning User
- **Description:** The system authenticates the user using email and password. On success, the system creates a session and navigates to Home. On failure, the system shows an error without specifying whether the email or password is incorrect (security requirement).
- **Input:**
  - Email: string
  - Password: string
- **Output:**
  - Correct credentials: JWT access token (1-hour expiry) and refresh token (30-day expiry) issued; user navigated to Home screen
  - Incorrect credentials (up to 4 failed attempts): Generic error message "Email or password is incorrect"
  - 5th consecutive failed attempt: Account login locked for 15 minutes; message shown: "Too many failed attempts. Try again in 15 minutes."
  - Account `PENDING_VERIFICATION`: Error message "Please verify your email to continue"

---

#### FR-08 — Onboarding Progress Indicator

- **Actor:** New User
- **Description:** During the registration flow (FR-03 through FR-06), the system displays a step progress indicator showing the current step out of total steps (3 steps: Market Selection, Account Details, Verify Email).
- **Input:** User's current onboarding step
- **Output:** Step indicator updated to reflect current step (e.g., step 2 of 3 highlighted)

---

### HOME SCREEN

#### FR-09 — Portfolio Value Hero Widget

- **Actor:** Registered User
- **Description:** The Home screen displays a hero widget showing the user's total portfolio value. If the user has no holdings, the widget displays "Start building your portfolio" with a call-to-action linking to the Discover feed.
- **Input:** User's portfolio data from backend
- **Output:**
  - With holdings: Total portfolio value in user's preferred currency (VND for VN users, KRW for KR users, USD for others), formatted with thousand separators; unrealized P&L for the day shown below (value + percentage, color-coded: green for positive, red for negative, gray for zero)
  - Without holdings: Placeholder text "Start building your portfolio" + "Explore Trending Stocks" button

---

#### FR-10 — Market Snapshot Widget

- **Actor:** Registered User
- **Description:** The Home screen displays a compact market snapshot card. For Vietnam users: VN-Index value, change in points, percentage change. For Korea users: KOSPI value, change, percentage change. For Global users: S&P 500 + Nasdaq values with changes. Data refreshes every 30 seconds while the Home screen is in the foreground.
- **Input:** User's market preference; real-time market data feed
- **Output:**
  - VN users: VN-Index current value, point change (±), percentage change (±%), last updated timestamp
  - KR users: KOSPI current value, point change (±), percentage change (±%)
  - Global users: S&P 500 and Nasdaq values with point and percentage change
  - When market is closed: Last closing value displayed with "Market Closed" label and next open time (in user's local timezone)

---

#### FR-11 — Trending Stocks Section on Home

- **Actor:** Registered User
- **Description:** The Home screen displays a horizontally scrollable section titled "Trending Now" showing the top 5 trending stocks from the user's default market. Each stock card shows: ticker symbol, company name, current price, percentage change for the day.
- **Input:** User's market preference; trending data from backend
- **Output:** 5 stock cards in horizontal scroll; tapping any card navigates to Stock Detail (FR-23); section has "See All" link that navigates to the full Discover feed

---

#### FR-12 — Personalized Watchlist on Home

- **Actor:** Registered User
- **Description:** The Home screen displays the user's watchlist (up to 5 stocks visible; "See All" link shows full list). Each watchlist item shows ticker, company name, current price, and daily percentage change.
- **Input:** User's watchlist from backend
- **Output:**
  - With watchlist items: Up to 5 watchlist stocks displayed with live price and daily change; "See All" links to full Watchlist screen
  - Empty watchlist: "Your watchlist is empty. Add stocks to track them here." message with "Explore" button linking to Discover feed

---

#### FR-13 — Home Screen Data Refresh

- **Actor:** Registered User
- **Description:** Market data on the Home screen (FR-10, FR-11, FR-12) automatically refreshes every 30 seconds when the app is in the foreground. The user can manually trigger a refresh by pulling down on the screen (pull-to-refresh gesture). A loading indicator displays during refresh.
- **Input:** 30-second timer tick; pull-to-refresh gesture
- **Output:** Updated market data displayed; loading spinner shown for ≤ 2 seconds; last updated timestamp updated; if refresh fails, previous data remains displayed with a toast notification "Unable to refresh. Showing last available data."

---

#### FR-14 — Bottom Navigation

- **Actor:** Registered User
- **Description:** A persistent bottom navigation bar is displayed on all main screens with 5 tabs: Home, Discover, Markets, Portfolio, Profile. The active tab is visually highlighted. Tapping a tab navigates to the corresponding screen without resetting the screen state (scroll position is reset only when the user taps the already-active tab).
- **Input:** User taps a navigation tab
- **Output:** Corresponding main screen displayed; active tab highlighted; previous screen state preserved (except when re-tapping active tab)

---

### DISCOVER / TRENDING FEED

#### FR-15 — Discover Feed Layout

- **Actor:** Registered User
- **Description:** The Discover screen displays a vertically scrollable feed of curated stock cards. The feed defaults to showing stocks from the user's preferred market. Each card occupies the full screen width.
- **Input:** User's market preference; curated stock data from backend
- **Output:** Vertically scrollable list of stock cards, ordered by editorial rank (defined by editorial team via CMS). Minimum 10 cards loaded on initial render; additional cards load as user scrolls (infinite scroll with batches of 10).

---

#### FR-16 — Stock Card Content

- **Actor:** Registered User
- **Description:** Each stock card in the Discover feed displays the following elements:
  - Ticker symbol (e.g., VIC, SAMSUNG)
  - Company name
  - Current price + daily percentage change (color-coded: green/red)
  - Editorial "why it's hot" hook: 1–2 sentence editorial blurb (max 120 characters)
  - Social proof counter: "X people watching" (X = number of users who have this stock in their watchlist)
  - Theme badge (e.g., "AI", "K-pop", "Vietnam Growth") — 1 badge per card
  - Add to Watchlist button (heart icon): toggles between added/not added state
- **Input:** Stock data from backend; editorial CMS content; watchlist count from backend
- **Output:** Fully rendered stock card as described; "X people watching" updates in real-time (30-second polling); watchlist toggle state reflects user's current watchlist

---

#### FR-17 — Theme Filters on Discover

- **Actor:** Registered User
- **Description:** The Discover screen displays a horizontally scrollable row of theme filter chips above the feed. Available themes: All, AI, K-pop, Vietnam Growth, Banking, Technology, Energy, Consumer. The default selected filter is "All". Only one filter can be active at a time.
- **Input:** User taps a theme filter chip
- **Output:** Feed reloads to show only stock cards matching the selected theme; selected chip is visually highlighted; if no stocks match the selected theme, message displayed: "No stocks in this theme right now. Check back soon."

---

#### FR-18 — Market Filter on Discover

- **Actor:** Registered User
- **Description:** The Discover screen displays a market filter toggle (Vietnam | Korea | Global) above the theme filter chips. The default selected market matches the user's preferred market from their profile.
- **Input:** User taps a market filter option
- **Output:** Feed and theme filters reload to show stocks from the selected market; selected market is visually highlighted; user's profile market preference is NOT updated (session-level filter only)

---

#### FR-19 — Infinite Scroll on Discover

- **Actor:** Registered User
- **Description:** When the user scrolls to within 200 pixels of the bottom of the Discover feed, the system automatically loads the next batch of 10 stock cards and appends them to the feed. A loading spinner is displayed at the bottom during loading. When no more cards are available, the message "You've seen all trending stocks" is displayed.
- **Input:** Scroll position event; current feed page number
- **Output:** 10 additional stock cards appended to feed; loading spinner shown during fetch (≤ 3 seconds); end-of-feed message shown when all cards exhausted

---

#### FR-20 — Add to Watchlist from Discover Feed

- **Actor:** Registered User
- **Description:** Each stock card displays a heart icon button. Tapping it adds the stock to the user's watchlist if not already added, or removes it if already present. The action takes effect immediately with optimistic UI update (icon state changes instantly; backend confirmed asynchronously).
- **Input:** User taps heart icon on a stock card
- **Output:**
  - Adding: Heart icon changes to filled state; stock added to user's watchlist in backend; toast notification "Added to Watchlist"; "X people watching" counter increments by 1
  - Removing: Heart icon changes to outline state; stock removed from user's watchlist in backend; toast notification "Removed from Watchlist"; "X people watching" counter decrements by 1
  - Backend failure: Icon reverts to previous state; toast notification "Something went wrong. Please try again."

---

#### FR-21 — Stock Card Navigation

- **Actor:** Registered User
- **Description:** Tapping anywhere on a stock card (excluding the heart icon button) navigates to the Stock Detail screen for that stock.
- **Input:** User taps on a stock card body
- **Output:** Stock Detail screen (FR-23) displayed for the tapped stock; back navigation returns user to Discover feed at the same scroll position

---

#### FR-22 — Editorial Content Management

- **Actor:** Editorial Team (via CMS, not a mobile user)
- **Description:** The editorial "why it's hot" hook and theme badge for each stock card are managed via a CMS (content management system). The mobile app fetches this content from the backend API. If a stock has no editorial content, it is excluded from the Discover feed (it only appears in Markets and Search results).
- **Input:** CMS content; stock ticker mapping
- **Output:** Only stocks with valid editorial content appear in the Discover feed; editorial content updated in the app within 5 minutes of CMS publish action

---

### STOCK DETAIL

#### FR-23 — Stock Detail Screen Layout

- **Actor:** Registered User
- **Description:** The Stock Detail screen displays all available data for a selected stock. The screen is organized in the following vertical order: (1) Header with ticker, company name, exchange; (2) Price hero (current price, daily change); (3) Price chart; (4) Action buttons (Add to Watchlist, Set Alert); (5) Key Stats section; (6) Analyst Sentiment section; (7) Editorial context (if available from Discover).
- **Input:** Stock ticker symbol; user's watchlist state for this stock
- **Output:** Fully rendered Stock Detail screen with all sections populated; watchlist button reflects user's current watchlist state for this stock

---

#### FR-24 — Price Chart on Stock Detail

- **Actor:** Registered User
- **Description:** The Stock Detail screen displays a price chart with selectable time ranges. Available ranges: 1D, 1W, 1M, 3M, 1Y. The default selected range is 1D. The chart displays closing prices for the selected period. For V1, the chart is rendered as a line chart using in-app charting library (not TradingView). VN stocks use real-time data; KR and global stocks use end-of-day data.
- **Input:** User taps a time range selector; stock ticker; market data
- **Output:**
  - Chart re-renders for selected time range within 2 seconds of tap
  - VN stocks (1D): Intraday price points at 1-minute intervals
  - All other ranges and markets: Closing price data points (one per trading day)
  - When data is unavailable for a range: Message "Chart data not available for this period"

---

#### FR-25 — Key Stats on Stock Detail

- **Actor:** Registered User
- **Description:** The Key Stats section displays the following data points for the selected stock: Open price, Previous Close, Day High, Day Low, 52-Week High, 52-Week Low, Volume (today), Market Cap, P/E Ratio. Each stat is labeled clearly. If a value is unavailable, display "—" (em-dash).
- **Input:** Stock data from backend/data feed
- **Output:** 9 labeled stat cells displayed in a 3-column grid; unavailable values shown as "—"; values formatted with thousand separators and appropriate units (e.g., VND, KRW, USD; B/T for billion/trillion)

---

#### FR-26 — Analyst Sentiment on Stock Detail

- **Actor:** Registered User
- **Description:** The Analyst Sentiment section displays a summarized sentiment indicator derived from available analyst ratings. Display: Buy/Hold/Sell percentage breakdown as a horizontal bar; total number of analysts rated; consensus label ("Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell") based on the breakdown thresholds defined in BR-07. If sentiment data is unavailable, display "Analyst sentiment not available for this stock."
- **Input:** Analyst rating data from backend
- **Output:** Horizontal sentiment bar with color segments (green for Buy, yellow for Hold, red for Sell); consensus label; analyst count label (e.g., "Based on 12 analysts")

---

#### FR-27 — Add to Watchlist from Stock Detail

- **Actor:** Registered User
- **Description:** The Add to Watchlist button on the Stock Detail screen behaves identically to FR-20 but is displayed as a full-width button with label "Add to Watchlist" / "Remove from Watchlist" depending on current state.
- **Input:** User taps the watchlist button
- **Output:** Same as FR-20 (optimistic update, toast notification, backend sync, revert on failure)

---

#### FR-28 — Set Price Alert from Stock Detail

- **Actor:** Registered User
- **Description:** The Set Alert button opens a bottom sheet modal where the user can configure a price alert for the stock. The user selects an alert condition (Price above / Price below) and enters a target price. The alert triggers a push notification when the condition is met.
- **Input:**
  - Alert condition: "Price above" or "Price below" (required)
  - Target price: numeric value, positive, up to 2 decimal places, must be different from current price (required)
- **Output:**
  - Valid input: Alert saved to backend; bottom sheet closes; toast notification "Alert set for [TICKER]"; push notification permission requested if not already granted
  - Invalid input: Inline error on the target price field (e.g., "Price must be different from current price", "Price must be a positive number")
  - User already has an alert for this stock: Existing alert values pre-filled; saving overwrites previous alert (one alert per stock per user)

---

#### FR-29 — Stock Detail Back Navigation

- **Actor:** Registered User
- **Description:** The Stock Detail screen displays a back navigation button (left arrow) in the top-left corner. Tapping it returns the user to the previous screen (Discover feed, Home, Watchlist, or Markets) at the same scroll position. Hardware back button (Android) and swipe-back gesture (iOS) are also supported.
- **Input:** Back button tap / hardware back / swipe gesture
- **Output:** Previous screen displayed at the same scroll position as when the user left it

---

### PORTFOLIO TRACKING

#### FR-30 — Portfolio Holdings Overview

- **Actor:** Registered User
- **Description:** The Portfolio screen displays a list of all stocks the user has manually added as holdings. Each holding row shows: ticker symbol, company name, number of shares owned, average buy price, current price, current value (shares × current price), unrealized P&L (current value − total cost), unrealized P&L percentage.
- **Input:** User's holdings from backend; current market prices
- **Output:** List of holdings rows with all fields populated; total portfolio value shown at the top (sum of all holding current values); total unrealized P&L shown below total value; all monetary values in user's preferred currency

---

#### FR-31 — Add Holding Manually

- **Actor:** Registered User
- **Description:** The user can add a stock holding via a "+" button on the Portfolio screen. A form bottom sheet is displayed to collect holding details.
- **Input:**
  - Stock ticker: valid ticker from the supported market data (autocomplete search against ticker database); required
  - Number of shares: positive decimal number, up to 4 decimal places, minimum 0.0001; required
  - Average buy price: positive decimal number, up to 2 decimal places; required
  - Purchase date: date picker, cannot be a future date; required
- **Output:**
  - Valid input: Holding saved to backend; Portfolio screen refreshes with new holding added; toast notification "Holding added"
  - Invalid ticker: Error "Ticker not found. Please check the symbol."
  - Invalid numeric fields: Inline error messages

---

#### FR-32 — Edit Holding

- **Actor:** Registered User
- **Description:** Swiping left on a holding row reveals an "Edit" action. Tapping "Edit" opens the same form as FR-31, pre-filled with existing values. The user can update shares, average buy price, and purchase date (ticker cannot be changed after creation).
- **Input:** Updated values for shares, average buy price, or purchase date
- **Output:** Holding updated in backend; Portfolio screen refreshes; toast notification "Holding updated"

---

#### FR-33 — Delete Holding

- **Actor:** Registered User
- **Description:** Swiping left on a holding row reveals a "Delete" action. Tapping "Delete" shows a confirmation dialog: "Remove [TICKER] from your portfolio? This cannot be undone." Confirming deletes the holding.
- **Input:** User confirms deletion
- **Output:** Holding deleted from backend; holding removed from the Portfolio screen list; toast notification "Holding removed"; if portfolio is now empty, empty state message displayed (same as FR-09 empty state)

---

#### FR-34 — Transaction History

- **Actor:** Registered User
- **Description:** The Portfolio screen includes a "History" tab showing all manually recorded transactions (adds, edits interpreted as new transactions). Each history entry shows: date, ticker, action (Added/Updated/Removed), shares, price.
- **Input:** User taps "History" tab
- **Output:** Chronological list of transactions (newest first); each entry displays date (format: DD MMM YYYY), ticker, action label, shares, price; if no history exists, message: "No transactions recorded yet."

---

#### FR-35 — P&L Color Coding

- **Actor:** Registered User
- **Description:** All P&L values displayed in the Portfolio screen and Home screen hero widget must be color-coded as follows: positive value → green (#00C853 or equivalent from design system); negative value → red (#D50000 or equivalent); zero → gray (#9E9E9E or equivalent).
- **Input:** Calculated P&L values (numeric)
- **Output:** Corresponding color applied to text; a "+" prefix added for positive values; "−" prefix for negative values; no prefix for zero

---

### MARKETS MODULE

#### FR-36 — Markets Screen Layout

- **Actor:** Registered User
- **Description:** The Markets screen displays a tabbed interface with three tabs: Vietnam, Korea, Global. The default active tab matches the user's preferred market from their profile.
- **Input:** User's market preference; market data
- **Output:** Markets screen with three tabs; default tab pre-selected; tapping a tab switches the content view

---

#### FR-37 — Vietnam Market (Real-Time)

- **Actor:** Registered User
- **Description:** The Vietnam tab displays real-time HoSE and HNX market data. Content: (1) VN-Index summary (current value, change, volume); (2) HNX-Index summary; (3) Top Gainers list (top 5 stocks by daily % gain); (4) Top Losers list (top 5 stocks by daily % loss); (5) Most Active list (top 5 by trading volume). Each stock in the lists shows: ticker, price, daily change %. Tapping any stock navigates to Stock Detail.
- **Input:** Real-time HoSE/HNX data feed; user interaction
- **Output:**
  - During market hours (09:00–15:00 ICT, Monday–Friday): Live data; last updated timestamp shown; data refreshes every 30 seconds
  - Outside market hours: Last closing values shown; "Market Closed" badge; next open time shown
  - Market holiday: "Market Holiday" badge; next trading day shown

---

#### FR-38 — Korea Market

- **Actor:** Registered User
- **Description:** The Korea tab displays KRX market data sourced from web search and model knowledge (not real-time feed for V1). Content: KOSPI and KOSDAQ index values, Top 5 Gainers, Top 5 Losers. A disclaimer banner is shown: "Data may be delayed up to 24 hours. Real-time data coming soon."
- **Input:** Web search results / model knowledge; user interaction
- **Output:** KOSPI and KOSDAQ values with daily change; Top Gainers and Losers lists; disclaimer banner always visible on Korea tab

---

#### FR-39 — Global Market Overview

- **Actor:** Registered User
- **Description:** The Global tab displays an overview of major global indices: S&P 500, Nasdaq Composite, Dow Jones, FTSE 100, Nikkei 225, DAX. Data sourced from web search and model knowledge for V1. Disclaimer banner shown: "Data may be delayed up to 24 hours."
- **Input:** Web search results / model knowledge
- **Output:** 6 index cards each showing: index name, current value, daily change (points + percentage), color-coded; disclaimer banner always visible

---

#### FR-40 — Market Search

- **Actor:** Registered User
- **Description:** A search icon is displayed in the top-right of the Markets screen. Tapping it opens a full-screen search overlay where the user can search for any stock by ticker or company name. Search queries are matched against all stocks in the supported markets database.
- **Input:** User types ticker or company name (minimum 1 character); search triggers after user stops typing for 300 milliseconds (debounced)
- **Output:**
  - Results: List of matching stocks (ticker, company name, exchange, current price); tapping a result navigates to Stock Detail
  - No results: "No stocks found for '[query]'"
  - Empty query: Show recent searches (last 5 searches stored locally)

---

#### FR-41 — Market Hours Reference

- **Actor:** Registered User
- **Description:** The Markets screen displays a "Market Hours" info section at the bottom showing trading hours for all three markets in the user's local timezone.
- **Input:** User's device timezone; fixed market hours data
- **Output:** Table with: Market name, Local open time, Local close time, Status (Open / Closed / Pre-market). Status updates in real-time.

---

### NOTIFICATIONS

#### FR-42 — Push Notification Permission Request

- **Actor:** New User (first-time)
- **Description:** After the user completes email verification (FR-06) and lands on the Home screen for the first time, the system shows an in-app prompt (custom modal, before triggering the OS permission dialog) explaining the value of notifications: "Get price alerts and market updates. Never miss a move." with "Allow" and "Skip" buttons. Tapping "Allow" triggers the OS push permission dialog. Tapping "Skip" dismisses without requesting permission.
- **Input:** User taps "Allow" or "Skip"
- **Output:**
  - "Allow" + OS permission granted: Push token registered to backend; user preference `notifications_enabled = true`
  - "Allow" + OS permission denied: User preference `notifications_enabled = false`; system does not retry permission request (follows OS rules)
  - "Skip": User preference `notifications_enabled = false`; user can enable later via Profile settings (FR-52)

---

#### FR-43 — Price Alert Notification

- **Actor:** Registered User (with price alert set via FR-28)
- **Description:** When a stock's price crosses a user-defined alert threshold, the system sends a push notification within 60 seconds of the threshold being crossed.
- **Trigger Condition:**
  - "Price above X": Current price ≥ X
  - "Price below X": Current price ≤ X
- **Notification content:** Title: "[TICKER] Alert Triggered"; Body: "[Company Name] is now at [current price] ([±change%] today)". Tapping the notification opens the Stock Detail screen for the stock.
- **Output:**
  - Notification delivered to user device
  - After notification is sent: Alert is automatically deactivated (one-time alert); user can re-set the alert from Stock Detail
  - If user has notifications disabled: Alert is silently tracked but no push is sent; alert remains active until triggered (but notification is suppressed)

---

#### FR-44 — Market Open Notification

- **Actor:** Registered User
- **Description:** At market open time for the user's preferred market, the system sends an optional push notification: "Vietnam market is now open. See what's trending." The user can toggle this notification type on/off in Profile settings (FR-52). Sent once per trading day per user.
- **Input:** Market open event for user's preferred market; user's notification preference
- **Output:** Push notification sent at market open time if preference is enabled; notification tapping opens the Markets screen on the relevant tab

---

#### FR-45 — Market Close Notification

- **Actor:** Registered User
- **Description:** At market close time for the user's preferred market, the system sends an optional push notification summarizing market performance: "VN-Index closed at [value] ([±change%] today)." User can toggle on/off in settings. Sent once per trading day per user.
- **Input:** Market close event; final index value; user's notification preference
- **Output:** Push notification sent at market close if preference enabled; tapping opens the Markets screen

---

#### FR-46 — Watchlist Price Movement Notification

- **Actor:** Registered User (with watchlist items)
- **Description:** For each stock in the user's watchlist, the system sends a daily end-of-day notification if the stock's daily price change is ≥ +5% or ≤ −5%. Notification content: "[TICKER] moved [±X%] today. Tap to see details." This notification type is opt-in, togglable in settings (FR-52). Maximum 3 watchlist notifications per user per day (capped to avoid notification fatigue).
- **Input:** End-of-day price data for user's watchlist stocks; user's notification preferences; daily notification count
- **Output:** Up to 3 push notifications sent for watchlist stocks with ≥ 5% daily movement; tapping each opens the Stock Detail for the relevant stock

---

#### FR-47 — Notification History

- **Actor:** Registered User
- **Description:** The app maintains a notification inbox accessible from the Profile screen. All notifications sent to the user (price alerts, market open/close, watchlist movements) are stored and displayed in reverse chronological order for the last 30 days. Each notification entry shows: icon (alert type), title, body, timestamp (relative: "2 hours ago", "Yesterday", or DD MMM for older).
- **Input:** User navigates to Notification History
- **Output:** List of all notifications from last 30 days; unread notifications highlighted (bold); tapping a notification marks it as read and navigates to the relevant screen; notifications older than 30 days are automatically deleted from the inbox

---

### USER ACCOUNT

#### FR-48 — User Profile Screen

- **Actor:** Registered User
- **Description:** The Profile screen displays the user's account details: display name, email address (partially masked: `lo***@gmail.com`), nationality/market preference, and links to sub-sections: Notification Settings, Change Password, App Settings, Help & Support, Log Out.
- **Input:** User navigates to Profile tab
- **Output:** Profile screen rendered with current user data; all sub-section links functional

---

#### FR-49 — Edit Profile

- **Actor:** Registered User
- **Description:** The user can edit their display name and market preference from the Profile screen. Email address cannot be changed in V1. Nationality/market preference change takes effect immediately and updates the Home screen and Markets default tab.
- **Input:**
  - Display name: 2–100 characters, Unicode-allowed
  - Market preference: Vietnam, Korea, or Global
- **Output:** Updated values saved to backend; Profile screen reflects new values; Home screen market snapshot (FR-10) and Markets default tab (FR-36) update to new preference

---

#### FR-50 — Change Password

- **Actor:** Registered User
- **Description:** From the Profile screen, the user can change their password by entering the current password and a new password.
- **Input:**
  - Current password: string (validated against stored hash)
  - New password: 8–64 characters, must contain at least 1 uppercase, 1 lowercase, 1 digit, 1 special character (`!@#$%^&*`)
  - Confirm new password: must match new password exactly
- **Output:**
  - Valid: Password updated; all existing refresh tokens invalidated; user remains logged in with current session; toast notification "Password changed successfully"
  - Wrong current password: Error "Current password is incorrect"
  - New password doesn't meet requirements: Inline error listing specific unmet criteria
  - Confirm password mismatch: Error "Passwords do not match"

---

#### FR-51 — Logout

- **Actor:** Registered User
- **Description:** The user can log out from the Profile screen. Tapping "Log Out" shows a confirmation dialog: "Are you sure you want to log out?" Confirming invalidates the session.
- **Input:** User confirms logout
- **Output:** JWT access token and refresh token invalidated on backend; local session data cleared; user navigated to Welcome screen (FR-02); push notification subscription deregistered

---

#### FR-52 — Notification Settings

- **Actor:** Registered User
- **Description:** The Notification Settings screen (accessible from Profile) lists all notification types with individual toggle switches. Types: Price Alerts, Market Open, Market Close, Watchlist Movements. Each toggle is on/off. Changing a toggle saves immediately (no save button needed).
- **Input:** User toggles a notification type switch
- **Output:** Preference updated in backend within 2 seconds; switch reflects new state immediately (optimistic); if backend save fails, switch reverts and toast shown: "Failed to save. Please try again."

---

#### FR-53 — Help & Support

- **Actor:** Registered User
- **Description:** The Help & Support section (accessible from Profile) contains: FAQ (static content, markdown-rendered), a "Contact Us" link that opens the device's email client with `support@paave.app` pre-filled as recipient, and a "Report a Bug" link that opens an in-app bug report form with optional screenshot attachment.
- **Input:** User navigates to Help & Support
- **Output:** FAQ rendered; email client opened with pre-filled address on "Contact Us" tap; bug report form opened on "Report a Bug" tap with optional screenshot upload (JPEG/PNG, max 5MB)

---

## 3. Business Rules

| Rule ID | Description |
|---------|-------------|
| BR-01 | A user can have a maximum of 1 market preference at any time. Changing preference immediately updates all preference-driven UI. |
| BR-02 | A user can add a maximum of 100 stocks to their watchlist. Attempting to add a 101st stock shows an error: "Watchlist full. Remove a stock to add another." |
| BR-03 | A user can set a maximum of 1 price alert per stock. Setting a new alert for a stock with an existing alert overwrites the previous alert. |
| BR-04 | Price alert notifications are one-time triggers. Once triggered and notification sent, the alert is automatically deactivated. |
| BR-05 | A stock must have editorial content (a "why it's hot" hook and theme badge) to appear in the Discover feed. Stocks without editorial content are excluded from the Discover feed. |
| BR-06 | The "X people watching" social proof counter reflects the real-time count of users who have that stock in their watchlist. Count is updated server-side; client polls every 30 seconds. |
| BR-07 | Analyst sentiment consensus labels are determined by the following thresholds: Buy% ≥ 70% → "Strong Buy"; Buy% 50–69% → "Buy"; Buy% 40–49% AND Sell% ≤ 30% → "Neutral"; Sell% 50–69% → "Sell"; Sell% ≥ 70% → "Strong Sell". |
| BR-08 | Portfolio P&L calculations are based solely on manually entered holdings data. The app does not connect to brokerage accounts in V1. |
| BR-09 | Market data for VN (HoSE/HNX) is sourced from the real-time exchange data feed. Market data for KR and Global is sourced from web search / model knowledge and carries a disclaimer indicating potential delay of up to 24 hours. |
| BR-10 | The app does not execute buy or sell orders. All "buy" actions display a message: "Trading coming soon. Add to your watchlist for now." |
| BR-11 | Watchlist movement notifications are capped at 3 per user per day to prevent notification fatigue. The 3 notifications are selected by highest absolute daily change percentage. |
| BR-12 | Login is locked for 15 minutes after 5 consecutive failed login attempts. The 15-minute timer resets after a successful login. |
| BR-13 | Email OTP is valid for 10 minutes and is single-use. A new OTP request immediately invalidates any existing unused OTP. |
| BR-14 | All monetary values must be displayed in the user's preferred currency: VND for Vietnam users, KRW for Korea users, USD for Global users. Currency format must include thousand separators appropriate to the locale (period for VN, comma for KR/Global). |
| BR-15 | The Discover feed must display a minimum of 10 cards before the user needs to scroll. If fewer than 10 cards have editorial content for a given filter, all available cards are shown and no infinite scroll is triggered. |

---

## 4. Acceptance Criteria

### FR-03 / FR-04 — Nationality Detection and Market Selection

```
Given a new user opens the app on a device with locale set to "vi" (Vietnamese)
When the user reaches the Market Preference Selection screen
Then "Vietnam (HoSE/HNX)" is pre-selected by default

Given a new user with locale "ko"
When the user reaches the Market Preference Selection screen
Then "Korea (KRX)" is pre-selected by default

Given a new user with locale "en-US"
When the user reaches the Market Preference Selection screen
Then "Global" is pre-selected by default

Given any pre-selected market
When the user taps a different market option
Then the new selection is highlighted and the previous is deselected
```

### FR-05 — Registration Validation

```
Given a user submits the registration form with a valid name, email, and password
When the form is submitted
Then account is created with status PENDING_VERIFICATION and a verification email is sent within 30 seconds

Given a user submits the form with an email missing the "@" symbol
When the form is submitted
Then the email field shows "Please enter a valid email address" and the form is not submitted

Given a user submits the form with a password "password123" (no uppercase, no special character)
When the form is submitted
Then the password field shows specific unmet criteria and the form is not submitted

Given a user submits the form with an email already registered
When the form is submitted
Then the email field shows "An account with this email already exists"
```

### FR-06 — Email OTP Verification

```
Given a user received an OTP and enters the correct 6-digit code within 10 minutes
When the OTP is submitted
Then account status changes to ACTIVE and user is navigated to Home screen

Given a user enters an incorrect OTP
When the OTP is submitted
Then error "Invalid code. 4 attempts remaining" is shown (decrements per attempt)

Given a user enters an incorrect OTP 5 times
When the 5th incorrect OTP is submitted
Then error shown: "Too many attempts. Please try again in 15 minutes."

Given a user waits 11 minutes after receiving an OTP and then enters the (correct) code
When the OTP is submitted
Then error "Code expired. Please request a new code."

Given a user taps "Resend Code" before 60 seconds have passed
When the button is tapped
Then the resend button is disabled and shows a countdown timer (e.g., "Resend in 45s")
```

### FR-07 — Login

```
Given a registered user with valid credentials
When they enter correct email and password and tap Login
Then they are navigated to the Home screen with a valid session

Given a registered user enters incorrect password 4 times
When the 4th incorrect attempt is submitted
Then error "Email or password is incorrect" is shown; login is not locked

Given a registered user enters incorrect password 5 times
When the 5th incorrect attempt is submitted
Then error "Too many failed attempts. Try again in 15 minutes." is shown and login is locked
```

### FR-10 — Market Snapshot

```
Given a Vietnam user with VN market preference
When the Home screen is loaded during market hours
Then VN-Index current value, point change, and percentage change are displayed

Given the Home screen has been open for 31 seconds without interaction
When the 30-second timer fires
Then market snapshot data refreshes automatically without user action

Given market is closed (e.g., weekend)
When the Home screen is loaded
Then last closing values are shown with a "Market Closed" label and next open time
```

### FR-16 — Stock Card Social Proof

```
Given a stock card displays "253 people watching"
When any user (globally) adds this stock to their watchlist
Then within 30 seconds the counter updates to "254 people watching"
```

### FR-20 — Watchlist Toggle (Optimistic UI)

```
Given a stock is not in the user's watchlist
When the user taps the heart icon
Then the heart icon immediately shows as filled (before backend confirmation)
And a toast "Added to Watchlist" is displayed

Given the backend returns an error after the user taps the heart icon
When the error response is received
Then the heart icon reverts to its previous state (outline)
And a toast "Something went wrong. Please try again." is displayed
```

### FR-28 — Price Alert

```
Given a user opens Stock Detail for a stock currently at 50,000 VND
When the user sets an alert "Price above 55,000"
Then the alert is saved and a toast "Alert set for [TICKER]" is shown

Given a user sets "Price above 50,000" for a stock currently at 50,000 VND
When the form is submitted
Then error "Price must be different from current price" is shown and alert is not saved

Given a stock's price rises from 49,000 to 55,000 VND
When the price crosses the user's alert threshold of 55,000
Then a push notification is sent within 60 seconds
And the alert is automatically deactivated after notification is sent
```

### FR-31 — Add Holding

```
Given a user submits a holding with ticker "VIC", 100 shares, buy price 50000, purchase date today
When the form is submitted
Then the holding appears in the Portfolio list with correct current value and P&L

Given a user enters a ticker "INVALID123" that does not exist in the system
When the form is submitted
Then error "Ticker not found. Please check the symbol." is shown

Given a user enters a purchase date of tomorrow's date
When the form is submitted
Then error "Purchase date cannot be in the future" is shown
```

### FR-37 — Vietnam Market Data

```
Given the time is 10:30 AM ICT on a weekday (market open)
When a user opens the Vietnam Markets tab
Then VN-Index current value, Top Gainers (5 stocks), Top Losers (5 stocks), and Most Active (5 stocks) are displayed
And data is no older than 30 seconds

Given the time is 4:00 PM ICT (after market close)
When a user opens the Vietnam Markets tab
Then last closing values are shown with "Market Closed" badge and next trading day open time
```

### FR-43 — Price Alert Trigger

```
Given a user has an alert "Price above 55,000" for stock VIC
And VIC's current price is 54,900 VND
When VIC's price updates to 55,000 VND or higher
Then a push notification "VIC Alert Triggered — VIC is now at 55,100 (±X% today)" is delivered within 60 seconds
And the alert status changes to INACTIVE
```

---

## 5. Edge Cases

### Onboarding

- User kills the app mid-onboarding (after submitting registration but before completing OTP): On re-open, the system detects `PENDING_VERIFICATION` status and returns the user to the Email Verification screen.
- User registers with an email that is already registered but unverified: System resends OTP to that email and navigates user to the Email Verification screen.
- Device has no locale set (edge case on custom ROMs): System defaults to "Global" market preference.
- OTP email lands in spam: User is shown a note "If you don't see the email, check your spam folder."

### Market Data

- VN real-time data feed is unavailable (feed outage): System serves cached data (last successful fetch) and displays a banner: "Live data temporarily unavailable. Showing data as of [timestamp]." Banner is dismissed once feed is restored.
- VN-Index value is 0 or null from feed: System retries fetch 3 times at 5-second intervals; if still 0/null, displays "—" and shows error banner.
- User opens app during a market holiday in VN: Vietnam tab shows "Market Holiday" badge with the holiday name (if available from the holiday calendar) and the next trading day.
- Stock data feed returns a price that is > 20% different from the previous price: System flags this as a potential data anomaly; anomalous values are displayed with a warning icon and a note "Price data may be inaccurate. Verify on exchange."

### Discovery Feed

- Discover feed returns 0 cards for a selected theme: Display "No stocks in this theme right now. Check back soon." — do not show infinite scroll loader.
- Network is unavailable when loading Discover feed: Display "No internet connection. Pull to refresh when connected." with cached cards from last successful load if available.
- "X people watching" counter returns null or negative from API: Display "— people watching" (em-dash).

### Portfolio

- User enters a holding with 0 shares: Reject with error "Number of shares must be greater than 0."
- User has a holding for a stock that has been delisted: The holding remains in the list; price displays as "Delisted" and P&L calculation is frozen at the last known price.
- User tries to add the same ticker twice to Portfolio: System prevents duplicate; error "You already have a holding for [TICKER]. Edit the existing holding to update it."

### Notifications

- User has notifications disabled at the OS level: App does not re-request permission. In-app settings show "Enable notifications in your device settings to receive alerts." with a link to device notification settings.
- Push notification is delivered but the user has already uninstalled the app: Backend receives delivery failure; alert record is marked as `DELIVERED_FAILED`; no retry.
- User has 0 stocks in watchlist when a watchlist notification event fires: No notification is sent; event is silently discarded.

### Authentication

- JWT access token expires while user is actively using the app: The app silently uses the refresh token to obtain a new access token; user experience is uninterrupted.
- Refresh token is expired or revoked: App shows "Session expired. Please log in again." and navigates to the Login screen; local session data is cleared.
- User attempts to log in from a second device: New session is created on the second device; previous session remains valid (no single-device enforcement in V1).

---

*Document end. Proceed to SRD for system logic and API contracts.*

# FRD-02: Home Screen

**Version:** 2.5
**Date:** 2026-06-01
**Author:** BA Spec Writer — Paave Product Team
**Status:** Ready for Development
**Linked BRD:** BRD.md v2.4
**Supersedes:** FRD-02 v2.4 (2026-04-21) — complete rewrite based on Paave_Home.pptx design
**API Version Alignment:** Paave API v1.5.0

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Actors and Preconditions](#2-actors-and-preconditions)
3. [User Flow](#3-user-flow)
4. [UX Flow — Screen States and Transitions](#4-ux-flow--screen-states-and-transitions)
5. [Functional Requirements](#5-functional-requirements)
6. [Business Rules](#6-business-rules)
7. [Acceptance Criteria](#7-acceptance-criteria)
8. [Edge Cases](#8-edge-cases)
9. [Design Requirements](#9-design-requirements)
10. [Traceability Matrix](#10-traceability-matrix)
11. [Related Documents](#11-related-documents)

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Home Screen |
| Module Role | Primary hub — first screen after login; aggregates portfolio, market, watchlist, AI signals, and news |
| Primary Actor | Authenticated user (LEARN_MODE age 16–17; FULL_ACCESS age 18+) |
| Goal | Surface portfolio health, VN market pulse, watchlist, AI suggestions, and news in a single scrollable screen |
| Trigger | Successful login; tap on "Trang chủ" tab (first tab) in bottom navigation bar |
| Screen State | Preserved when switching away and back, except scroll position resets when user re-taps the active "Trang chủ" tab |
| Scroll Direction | Vertical full-screen scroll; individual sections contain horizontal scroll where noted |
| Design Source | Paave_Home.pptx — single slide full Home screen design |

---

## 2. Actors and Preconditions

| Actor | Description | Precondition |
|---|---|---|
| Authenticated user (LEARN_MODE) | Age 16–17; paper trading only | Age gate passed; `feature_tier = LEARN_MODE` resolved |
| Authenticated user (FULL_ACCESS) | Age 18+; full paper trading access | Age gate passed; `feature_tier = FULL_ACCESS` resolved |
| Paave ETL Service | Populates `symbol_quotes_latest` from exchange feed | Running; last ingestion ≤ 30s during market hours |
| Paave AI Service | Pre-computes `top_ai_rating` records | Batch job runs; records exist for current trading day |
| Paave News Service | Serves articles from news articles table | API v1.5.0 `/api/v1/news/articles` endpoint healthy |

Both user tiers see the same Home Screen layout. LEARN_MODE restrictions apply only at the portfolio card level (section 5.2).

---

## 3. User Flow

```
Login success
    │
    ▼
Home Screen mounts
    │
    ├─ Header / Greeting section (always visible)
    │
    ├─ Portfolio summary card (FULL_ACCESS: live data; LEARN_MODE: see §5.2)
    │
    ├─ Market indices strip (horizontal scroll, 5 indices, 30s auto-refresh)
    │
    ├─ Market activity section (exchange selector, 3 tabs, breadth data)
    │      └─ Biến động giá tab (default): TĂNG/GIẢM two-column list
    │      └─ Khớp nhiều tab: top stocks by matched volume
    │      └─ NĐT NN tab: foreign investor net buy/sell
    │
    ├─ Watchlist section (horizontal scroll cards)
    │      └─ Tap card → Stock Detail screen
    │      └─ "Xem tất cả →" → full Watchlist screen
    │
    ├─ AI Suggestions section (horizontal scroll, 3 cards visible)
    │      └─ Tap card → AI Insights detail (FRD-12)
    │      └─ Disclaimer always visible below cards
    │
    └─ News section (vertical list, 5 articles)
           └─ Category filter chips (horizontal scroll)
           └─ Tap article → News detail screen
           └─ "Xem tất cả →" → full News screen
```

**Pull-to-refresh:** Available on the full screen. Triggers simultaneous refresh of all sections.

**Bottom navigation:** Persistent across all screens. See §5.1 for tab specifications.

---

## 4. UX Flow — Screen States and Transitions

### 4.1 Initial Load Sequence

| Step | Duration | Visual |
|---|---|---|
| 1. Screen mount | 0ms | Skeleton loaders appear for all sections simultaneously |
| 2. API calls fire in parallel | — | All 6 data fetches run concurrently (see §5 per section for endpoints) |
| 3. Sections render as data arrives | ≤ 3,000ms | Each section replaces its skeleton with data as soon as its API call resolves; sections are independent |
| 4. Timeout state | > 3,000ms with no response | Section shows error state with retry button; other sections unaffected |

Skeleton loaders: full-width placeholder cards matching the height of each section. No section is blank without a skeleton or error state.

### 4.2 Refresh States

| Trigger | Behavior |
|---|---|
| 30-second auto-refresh (foreground) | Silent refresh: data updates in place; no spinner; no scroll reset |
| Pull-to-refresh gesture | Spinner appears at top of screen; all sections refresh simultaneously; spinner dismisses on completion |
| App returns to foreground after being backgrounded | Immediate refresh triggered once; 30s cadence then resumes |
| App backgrounded | All auto-refresh paused immediately; no API calls made while backgrounded |
| Refresh fails (any section) | That section retains previous data; toast "Không thể cập nhật. Đang hiển thị dữ liệu gần nhất." appears for 4 seconds at bottom of screen (above nav bar); auto-dismisses |
| No internet connection | Same toast as refresh failure; cached data retained for all sections |

Rate limit on pull-to-refresh: maximum 1 manual refresh per 5 seconds. Pulls within 5 seconds of the last refresh are silently ignored (no spinner shown).

### 4.3 Empty States Per Section

| Section | Empty State |
|---|---|
| Portfolio card | FULL_ACCESS with no trades ever: show ₫500.000.000 balance with "Bắt đầu giao dịch" CTA; "Tiền ảo" badge always visible |
| Market indices | Feed failure: show cached values with stale indicator (⏱ HH:MM); if no cache exists, show "—" with retry button |
| Market activity | Feed failure: show error state with retry button; section header remains visible |
| Watchlist | No stocks added: show "Danh mục theo dõi của bạn trống. Thêm cổ phiếu để theo dõi tại đây." with add-stocks CTA |
| AI Suggestions | No AI data: hide section entirely (no header, no empty card shown) |
| News | No articles: show "Không có tin tức. Thử lại sau." with retry button |

### 4.4 Navigation Transitions

| Action | Transition |
|---|---|
| Tap watchlist stock card | Push to Stock Detail screen |
| Tap "Xem tất cả →" in Watchlist section | Push to full Watchlist screen |
| Tap AI suggestion card | Push to AI Insights detail (FRD-12) |
| Tap "Xem tất cả →" in News section | Push to full News screen |
| Tap news article row | Push to News article detail screen |
| Tap bottom nav tab | Switch to tab screen; Home state preserved |
| Re-tap active "Trang chủ" tab | Smooth scroll to top of Home Screen; data not refreshed |

---

## 5. Functional Requirements

---

### FR-HS-01: Bottom Navigation Bar

**Actor:** Authenticated user (all tiers)
**Description:** A persistent bottom navigation bar with 5 tabs rendered in fixed order across all screens. The active tab is highlighted using the Neo Lumen lime-signal color for icon and label. Re-tapping the currently active tab resets scroll to the top of that screen. Each tab preserves its internal state (selected sub-tab, scroll position) when the user navigates away and returns, except scroll position resets on re-tap of the already-active tab.

**Tab definitions (left to right):**

| Position | Label | Icon | Target Screen |
|---|---|---|---|
| 1 | Trang chủ | Home icon | Home Screen (this document) |
| 2 | Khám phá | Discover icon | Discover Feed (FRD-03) |
| 3 | Thị trường | Markets icon | Markets / Market Board (FRD-17, FRD-06) |
| 4 | Tài sản | Portfolio icon | Portfolio Tracking (FRD-05) |
| 5 | Tôi | Profile icon | User Account (FRD-08) |

**Rename note for development:** The tab formerly labelled "Portfolio" in code is renamed to "Tài sản". All navigation labels, accessibility labels, and analytics event names must use "Tài sản" for tab 4.

**Input:** Tab tap gesture; current active tab state; current scroll position of active tab's screen.
**Output:** Navigation to tapped tab's screen; active tab highlighted; re-tap of active tab triggers smooth scroll-to-top.
**Precondition:** User is authenticated.
**Postcondition:** Correct tab active and highlighted; screen content matches tab.

---

### FR-HS-02: Header / Greeting Section

**Actor:** Authenticated user (all tiers)
**Description:** The topmost section of the Home Screen. Renders a time-aware greeting, the user's avatar (photo if set, else initials), the user's display name, and the virtual account identifier. The greeting text changes based on the current local time (ICT, UTC+7). The account code and sub-account number are read from the authenticated session.

**Greeting rules:**

| Local ICT time range | Greeting text |
|---|---|
| 05:00 – 11:59 | "Chào buổi sáng" |
| 12:00 – 17:59 | "Chào buổi chiều" |
| 18:00 – 04:59 | "Chào buổi tối" |

**Layout:**
- Row 1: Greeting text (e.g., "Chào buổi sáng") + 👋 emoji
- Row 2: User avatar (circle, 40×40px) + user display name (bold)
- Row 3: "Tài khoản ảo · [account_code] · [sub_account_number]" (e.g., "Tài khoản ảo · 068C123456 · 1")

**Input:**
- Current local ICT time (device clock used for display; server time used for any business logic elsewhere)
- `user.displayName` from session
- `user.avatarUrl` (nullable; fall back to initials if null)
- `virtual_sub_accounts.account_code` and `virtual_sub_accounts.sub_account_number` from authenticated session

**Output:** Rendered header with greeting, avatar, name, and account identifier.
**Precondition:** User is authenticated.
**Postcondition:** Header is static after render; does not auto-refresh. Greeting text recalculates only on screen mount or foreground resume.

---

### FR-HS-03: Portfolio Summary Card

**Actor:** Authenticated user (all tiers)
**Description:** A card displaying the user's total virtual portfolio value (cash + holdings NAV), the daily change in absolute VND and percentage, and the mandatory "Tiền ảo · 가상 자금 · Virtual Funds" pill badge. The badge is always visible regardless of portfolio state. LEARN_MODE users see the card in restricted mode (no portfolio value, no daily change; badge and account label still visible). FULL_ACCESS users see full data.

**Data computation:**
- Total portfolio value = `virtual_sub_accounts.cash_balance` + SUM(`virtual_holdings.quantity` × `symbol_quotes_latest.close_price`)
- Daily change (absolute) = total portfolio value − portfolio value at previous trading day close
- Daily change (%) = (daily change absolute / portfolio value at previous trading day close) × 100

**Display format:**
- Total value: `₫547.826.450` (BR-HS-01 VND format: period as thousands separator, ₫ prefix, no decimals)
- Daily change positive: "+₫8.230.000 · +1,52% hôm nay" in color `#10B981` (green)
- Daily change negative: "−₫8.230.000 · −1,52% hôm nay" in color `#EF4444` (red)
- Daily change zero: "₫0 · 0,00% hôm nay" in color `#9E9E9E` (gray)
- Percentage separator: comma (Vietnamese convention): `1,52%` not `1.52%`

**Mandatory badge:** Pill badge with text "Tiền ảo · 가상 자금 · Virtual Funds" rendered below the value line. Always in DOM. Never conditional. Never hidden with CSS.

**LEARN_MODE restriction:**
- Portfolio value line: hidden (replaced with "—")
- Daily change line: hidden
- Badge: visible
- Account label: visible
- No brokerage CTA rendered anywhere on this card or anywhere on the Home Screen for LEARN_MODE users — absent from DOM entirely

**FULL_ACCESS with no trades (initial state):**
- Portfolio value: ₫500.000.000 (initial virtual balance)
- Daily change: ₫0 · 0,00% hôm nay
- Badge: visible
- "Bắt đầu giao dịch" CTA button below the badge (taps → Paper Trading module, FRD-10)

**Input:**
- `virtual_sub_accounts.cash_balance`
- `virtual_holdings` (quantity per symbol)
- `symbol_quotes_latest.close_price` (current) and previous-day close price per symbol
- `feature_tier` from authenticated session

**Output:** Rendered portfolio card.
**Precondition:** User is authenticated; `feature_tier` resolved.
**Postcondition:** Card renders; refreshes on each 30s cycle; "Tiền ảo" badge always in DOM.

**API endpoint:** `GET /api/v1/portfolio/summary` (authenticated)
- Success shape: `{ totalValue: number, cashBalance: number, holdingsValue: number, dailyChangeAmount: number, dailyChangePct: number, currency: "VND" }`
- Error shape: `{ code: "PORTFOLIO_UNAVAILABLE", message: "Không thể tải danh mục. Vui lòng thử lại." }`

---

### FR-HS-04: Market Indices Strip

**Actor:** Authenticated user (all tiers)
**Description:** A horizontally scrollable strip displaying 5 VN market indices below the portfolio card. Each index card shows the index name, exchange badge, current value, daily change in points, and daily change in percentage. The strip carries a "Live · 30s" indicator showing the data is refreshed every 30 seconds. Color coding follows the VN color convention: green for positive, red for negative, yellow for unchanged (TC).

**Indices displayed (in order):**

| Index code | Display name | Exchange badge |
|---|---|---|
| VNINDEX | VN-Index | HOSE |
| VN30 | VN30 | HOSE |
| HNXINDEX | HNX-Index | HNX |
| HNX30 | HNX30 | HNX |
| UPCOM | UPCOM | UPCOM |

**Each index card layout:**
- Line 1: Index display name (bold) + exchange badge (small pill, e.g., "HOSE")
- Line 2: Current index value (e.g., `1.284,56` — comma as decimal separator in VN number format)
- Line 3: Daily change in points + daily change % (e.g., "+8,42 · +0,66%") — color-coded per direction

**Color coding:**
- Positive (increase): `#10B981` (green)
- Negative (decrease): `#EF4444` (red)
- Unchanged (TC): `#F59E0B` (yellow/amber)

**Refresh indicator:** "Live · 30s" label in the section header. Does not flash or animate on each refresh; it is a static status label.

**Auto-refresh:** Every 30 seconds while app is in foreground. Silent update — no scroll reset, no skeleton flash.

**Input:**
- `symbol_quotes_latest` WHERE `symbol_code` IN ('VNINDEX', 'VN30', 'HNXINDEX', 'HNX30', 'UPCOM')
- Fields: `close_price`, `reference_price`, `change_amount`, `change_pct`, `last_updated_at`

**Output:** 5 index cards in horizontal scroll container.
**Precondition:** User is authenticated.
**Postcondition:** Strip rendered; 30s auto-refresh active.

**API endpoint:** `GET /api/v1/market/indices?symbols=VNINDEX,VN30,HNXINDEX,HNX30,UPCOM` (authenticated)
- Success shape: `{ indices: [{ symbolCode, displayName, exchange, value, changeAmount, changePct, direction: "up"|"down"|"flat" }] }`
- Error shape: `{ code: "MARKET_INDICES_UNAVAILABLE", message: "Không thể tải chỉ số thị trường." }`

---

### FR-HS-05: Market Activity Section

**Actor:** Authenticated user (all tiers)
**Description:** A section displaying live market breadth and stock rankings for VN markets. Contains an exchange selector (HOSE default), a breadth bar with trade summary statistics, and 3 content tabs. The section header shows "Diễn biến thị trường" with a "live" indicator.

**Exchange selector:** HOSE (default) | HNX | UPCOM. Tapping changes which exchange's data is displayed in the breadth bar and all 3 tabs. Selector state persists during the session.

**Breadth bar and stats row (changes per selected exchange):**
- Total value traded: e.g., "12,4K tỷ" (formatted, see BR-HS-02) — labeled "GIÁ TRỊ"
- TĂNG count: number of advancing stocks — displayed in `#10B981` (green)
- TC count: number of unchanged stocks — displayed in `#F59E0B` (yellow)
- GIẢM count: number of declining stocks — displayed in `#EF4444` (red)
- KL: total matched volume (lot units)

**3 Content tabs:**

| Tab | Label | Content |
|---|---|---|
| Tab 1 (default) | Biến động giá | Price change rankings — gainers vs losers |
| Tab 2 | Khớp nhiều | Top stocks by matched volume |
| Tab 3 | NĐT NN | Foreign investor net buy/sell flow |

**Tab 1 — Biến động giá (Price Change Rankings):**

Sub-tabs within this tab: "TĂNG GIÁ" | "%" | "GIẢM GIÁ"

- "TĂNG GIÁ": sorted by absolute price change (highest first)
- "%": sorted by percentage change (highest first)
- "GIẢM GIÁ": sorted by price decline (lowest/most negative first)

Layout: Two-column side-by-side
- Left column "TĂNG" (green header): 8 gaining stocks
- Right column "GIẢM" (red header): 8 declining stocks
- Each stock row: ticker (bold) | ±% change (color-coded)

**Tab 2 — Khớp nhiều (High Volume):**
- List of top stocks ranked by matched volume (highest matched lot count first)
- Each row: ticker | company short name | matched volume | price | % change

**Tab 3 — NĐT NN (Foreign Investor):**
- List of stocks with highest foreign investor net activity
- Each row: ticker | company short name | foreign net buy/sell (VND) | direction indicator

**Input:**
- `rankings_stock_up_down` (Tab 1 data)
- `rankings_stock_trade` (Tab 2 data)
- `rankings_foreigner` (Tab 3 data)
- Exchange selector state (HOSE | HNX | UPCOM)

**Output:** Rendered breadth bar + selected tab content. Tab switching is client-side (data for all 3 tabs fetched on section load; no additional API call on tab switch).
**Precondition:** User is authenticated.
**Postcondition:** Section rendered; auto-refreshes every 30s.

**API endpoint:** `GET /api/v1/market/activity?exchange=HOSE` (authenticated)
- Success shape: `{ breadth: { totalValue, advancing, unchanged, declining, totalVolume }, gainers: [...], losers: [...], highVolume: [...], foreignFlow: [...] }`
- Error shape: `{ code: "MARKET_ACTIVITY_UNAVAILABLE", message: "Không thể tải diễn biến thị trường." }`

---

### FR-HS-06: Watchlist Section

**Actor:** Authenticated user (all tiers)
**Description:** A horizontally scrollable preview of the user's watchlist showing the 5 most recently added stocks. Each stock card displays the ticker symbol (large, bold), current price in VND, daily percentage change (color-coded), and company short name. A "Xem tất cả →" link in the section header navigates to the full Watchlist screen. Tapping any stock card navigates to the Stock Detail screen for that ticker.

**Maximum stocks shown in Home preview:** 5 (most recently added by the user; i.e., sorted by `watchlist_items.created_at` descending, limit 5)

**Each watchlist card layout:**
- Ticker symbol (large, bold) — e.g., "FPT"
- Price — e.g., "₫142.500" (BR-HS-01 VND format)
- % change — e.g., "+1,78%" in `#10B981` (green) or "−0,60%" in `#EF4444` (red)
- Company short name — e.g., "Cty CP FPT"

**Empty state (no stocks in watchlist):**
Text: "Danh mục theo dõi của bạn trống. Thêm cổ phiếu để theo dõi tại đây."
Below text: CTA button "Khám phá cổ phiếu" → navigates to Khám phá tab

**"Xem tất cả →" link:** Always visible if watchlist has ≥ 1 stock. Navigates to full Watchlist screen. Hidden (not just empty) if watchlist is empty — "Xem tất cả" has no destination when list is empty.

**Delisted stock handling:** Show "Đã hủy niêm yết" chip on the card; display frozen last-known price; % change frozen at last known value.

**Input:**
- `watchlist_items` JOIN `symbol_quotes_latest` — for user's watchlist stocks
- Fields: `symbol_code`, `company_short_name`, `close_price`, `change_pct`, `is_delisted`
- Limit: 5, order by `watchlist_items.created_at` DESC

**Output:** Horizontal scroll row of up to 5 cards. Empty state or full preview depending on watchlist content.
**Precondition:** User is authenticated.
**Postcondition:** Cards rendered; refreshes on 30s cycle.

**API endpoint:** `GET /api/v1/watchlist?limit=5&order=recent` (authenticated)
- Success shape: `{ items: [{ symbolCode, companyShortName, price, changePct, isDelisted }], totalCount: number }`
- Error shape: `{ code: "WATCHLIST_UNAVAILABLE", message: "Không thể tải danh mục theo dõi." }`

---

### FR-HS-07: AI Suggestions Section

**Actor:** Authenticated user (all tiers)
**Description:** A horizontally scrollable section showing AI-generated stock suggestions for the current trading day. The section header shows "Gợi ý hôm nay" (left) and an "AI" badge (right). A sub-header shows the last updated timestamp (e.g., "Cập nhật 4h trước"). 3 suggestion cards are visible at a time; additional cards can be scrolled to. A mandatory regulatory disclaimer is always visible immediately below the cards.

**Each AI suggestion card contains:**
- Ticker symbol and company name
- Confidence percentage with progress bar (e.g., "78%")
- Signal type label and color:
  - Positive signal: "Cơ hội mua tiềm năng" — label in `#10B981` (green)
  - Neutral/watch signal: "Đáng quan sát" — label in `#F59E0B` (yellow)
  - Negative signal: "Cảnh báo bán" — label in `#EF4444` (red)
- Analysis text (Vietnamese, max 2 lines visible; expandable on card tap)
- Current price: "GIÁ HIỆN TẠI: ₫142.500"
- AI target price (for buy signals): "MỤC TIÊU AI: ₫156.000 +9,5%"
- "TIN CẬY" (Reliable) badge — shown on cards with confidence ≥ 65%

**Mandatory disclaimer (always visible, below cards, non-dismissible):**
Exact text: "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn."

This disclaimer must be in the rendered DOM at all times. It is never hidden, collapsed, or conditional.

**Section visibility:**
- If AI data is available: section renders normally.
- If AI data is unavailable (API error or no records for today): entire section is hidden (header, cards, and disclaimer are all removed from the DOM). No empty state shown for this section.

**Last updated timestamp:** Displayed as relative time (e.g., "Cập nhật 4h trước"). Computed from `top_ai_rating.computed_at` against current time. If the timestamp is older than 24 hours: show "Cập nhật hôm qua".

**Input:**
- `top_ai_rating` table — pre-computed by backend AI service
- Fields: `symbol_code`, `company_name`, `confidence_pct`, `signal_type`, `analysis_text_vi`, `current_price`, `target_price`, `target_pct_change`, `computed_at`

**Output:** Horizontal scroll row of AI suggestion cards with mandatory disclaimer below.
**Precondition:** User is authenticated.
**Postcondition:** Section rendered if data exists; disclaimer always present in DOM when section is visible.

**API endpoint:** `GET /api/v1/ai/suggestions?limit=10` (authenticated)
- Success shape: `{ suggestions: [{ symbolCode, companyName, confidencePct, signalType, analysisText, currentPrice, targetPrice, targetChangePct, computedAt }], lastUpdatedAt: string }`
- Error / empty shape: `{ suggestions: [], lastUpdatedAt: null }` — triggers section hide

---

### FR-HS-08: News Section

**Actor:** Authenticated user (all tiers)
**Description:** A vertical list of the 5 most recent news articles. The section header shows "Tin tức thị trường" (left) and a "Xem tất cả →" link (right). Category filter chips in a horizontal scroll row allow filtering by article category. Below the filter chips, 5 article rows are shown in chronological order (newest first).

**Category filter chips (in order):**
THỊ TRƯỜNG (default active) | KINH TẾ | DOANH NGHIỆP | PHÂN TÍCH

Tapping a chip filters the 5 articles shown to that category. The active chip is visually distinguished (filled/highlighted). Only one chip is active at a time. "THỊ TRƯỜNG" is the default active chip on screen load.

**Each news article row layout:**
- Date header (shown once per date group): `DD/MM/YYYY · HH:MM`
- Headline (bold, max 2 lines)
- Author name · Source name · Relative time (e.g., "5 phút trước", "1 giờ trước", "3 giờ trước")

**Relative time display rules:**
- < 60 minutes: "X phút trước"
- 1–23 hours: "X giờ trước"
- ≥ 24 hours: show exact date "DD/MM/YYYY"

**"Xem tất cả →" link:** Always visible. Navigates to full News screen with the currently selected category filter pre-applied.

**Input:**
- `GET /api/v1/news/articles` with `category` filter, `limit=5`, `language=vi`
- Fields: `articleId`, `headline`, `authorName`, `sourceName`, `publishedAt`, `category`

**Output:** Category filter chips + 5 article rows.
**Precondition:** User is authenticated.
**Postcondition:** Articles rendered; category filter is client-side state; switching chips triggers new API call with category param.

**API endpoint:** `GET /api/v1/news/articles?category=MARKET&limit=5&language=vi` (authenticated)
- Category param values: `MARKET` | `ECONOMY` | `CORPORATE` | `ANALYSIS`
- Success shape: `{ articles: [{ articleId, headline, authorName, sourceName, publishedAt, category }], totalCount: number }`
- Error shape: `{ code: "NEWS_UNAVAILABLE", message: "Không thể tải tin tức. Vui lòng thử lại." }`

---

### FR-HS-09: Home Screen Data Refresh

**Actor:** System (automatic) + User (manual pull-to-refresh)
**Description:** All Home Screen sections auto-refresh every 30 seconds while the app is in the foreground. The user can pull-to-refresh to force an immediate refresh. Each section's data fetch is independent; failure in one section does not block others.

**Refresh behavior rules:**

| Trigger | Sections refreshed | User feedback |
|---|---|---|
| 30s auto-refresh | All 6 data sections simultaneously | None (silent) |
| Pull-to-refresh | All 6 data sections simultaneously | Spinner at top of screen while fetching |
| App foreground resume | All 6 data sections simultaneously | None (silent) |
| Tab re-tap (scroll reset) | None | Scroll resets; no data refresh |

**Rate limit:** Maximum 1 manual pull-to-refresh per 5 seconds. Pulls within 5 seconds of the last manual refresh are ignored with no spinner shown.

**On partial failure:** Successful sections update; failed sections retain previous data. A single toast appears: "Không thể cập nhật. Đang hiển thị dữ liệu gần nhất." — 4 seconds, then auto-dismisses. Toast appears only once even if multiple sections fail simultaneously.

**Input:** Foreground state signal; pull-to-refresh gesture; network availability.
**Output:** Refreshed data for all sections or retained data with toast.
**Precondition:** User is on Home Screen.
**Postcondition:** All sections show latest data or retain previous data with single toast.

---

## 6. Business Rules

| ID | Rule | Scope | Violation Behavior |
|---|---|---|---|
| BR-HS-01 | VND values are formatted with period as thousands separator, ₫ prefix, no decimal places | Portfolio card, watchlist prices, news prices | Unformatted values must never be displayed; formatting failure → show "—" |
| BR-HS-02 | Large VND values are abbreviated: 1.000 tỷ = "1K tỷ", displayed with 1 decimal (e.g., "12,4K tỷ") | Market activity total value traded | No raw unabbreviated large numbers in the activity section |
| BR-HS-03 | Percentage values use comma as decimal separator in Vietnamese locale (e.g., "1,52%" not "1.52%") | All percentage displays on Home Screen | Dot-formatted percentages must never be shown |
| BR-HS-04 | "Tiền ảo · 가상 자금 · Virtual Funds" badge must be present in the rendered DOM of the portfolio card at all times for authenticated users | Portfolio card | Missing badge = P0 compliance bug; badge must be in markup, never in CSS-only hide |
| BR-HS-05 | Brokerage CTA must never be rendered for LEARN_MODE users on any surface of the Home Screen | Entire Home Screen | If `feature_tier = LEARN_MODE`, any brokerage CTA must be absent from DOM — not `display:none`, not `visibility:hidden` |
| BR-HS-06 | AI suggestions disclaimer must be in the rendered DOM whenever the AI Suggestions section is visible | AI Suggestions section | Missing disclaimer = P0 compliance bug; disclaimer cannot be made conditional |
| BR-HS-07 | Color convention for VN market: green (`#10B981`) = price increase; red (`#EF4444`) = price decrease; yellow (`#F59E0B`) = unchanged (TC/reference price) | Market indices strip, market activity, watchlist, AI suggestions | All color assignments must follow this convention; no custom colors per stock |
| BR-HS-08 | Market indices refresh interval is 30 seconds. News articles refresh interval is 30 seconds. Portfolio card refreshes on same 30s cycle | All auto-refreshing sections | If refresh interval is changed by a developer, BA approval required |
| BR-HS-09 | Index values use comma as decimal separator in VN number format (e.g., "1.284,56" — period for thousands, comma for decimal) | Market indices strip | Dot-only formatted index values must never be shown |
| BR-HS-10 | Watchlist preview shows 5 most recently added stocks (sort by `created_at` DESC) — not the first 5 added | Watchlist section | Ordering must be newest-first |
| BR-HS-11 | The tab label "Tài sản" must be used in all user-facing text, accessibility labels, and analytics events for the 4th bottom navigation tab | Bottom navigation | "Portfolio" (English) must not appear in any user-facing string |
| BR-HS-12 | If `feature_tier` cannot be resolved due to an API failure, default to LEARN_MODE restrictions (safest restriction level) | Portfolio card, brokerage CTAs | Show error toast; retry silently in background; do not render FULL_ACCESS content while tier is unknown |

---

## 7. Acceptance Criteria

### FR-HS-01 — Bottom Navigation Bar

| # | Given | When | Then |
|---|---|---|---|
| AC-HS-01-01 | User is on Home Screen | User taps "Khám phá" tab | Navigates to Discover Feed; "Khám phá" tab highlighted; Home state preserved |
| AC-HS-01-02 | User is on "Thị trường" tab with HNX sub-tab selected | User navigates to Home then back to "Thị trường" | HNX sub-tab is still selected |
| AC-HS-01-03 | User is on Home Screen, scrolled 400px down | User taps "Trang chủ" tab | Screen smoothly scrolls to top; no data refresh triggered |
| AC-HS-01-04 | Any authenticated user | Inspects the 4th tab | Tab label reads "Tài sản" (not "Portfolio"); navigates to Portfolio Tracking screen |
| AC-HS-01-05 | User taps 3 tabs in rapid succession | Tab navigation completes | Correct final tab shown; no blank screen; no race condition |

### FR-HS-02 — Header / Greeting

| # | Given | When | Then |
|---|---|---|---|
| AC-HS-02-01 | Local ICT time is 08:30 | Home Screen mounts | Greeting reads "Chào buổi sáng 👋" |
| AC-HS-02-02 | Local ICT time is 13:15 | Home Screen mounts | Greeting reads "Chào buổi chiều 👋" |
| AC-HS-02-03 | Local ICT time is 20:00 | Home Screen mounts | Greeting reads "Chào buổi tối 👋" |
| AC-HS-02-04 | User has avatar photo set | Home Screen renders | Circular avatar photo shown (40×40px) |
| AC-HS-02-05 | User has no avatar photo | Home Screen renders | User initials shown in circle (40×40px); no broken image |
| AC-HS-02-06 | Any authenticated user | Home Screen renders | Account row shows "Tài khoản ảo · [account_code] · [sub_account_number]" |

### FR-HS-03 — Portfolio Summary Card

| # | Given | When | Then |
|---|---|---|---|
| AC-HS-03-01 | FULL_ACCESS user with active holdings | Home Screen loads | Portfolio card shows total value in ₫ format, daily change in VND and %, "Tiền ảo · 가상 자금 · Virtual Funds" badge |
| AC-HS-03-02 | FULL_ACCESS user with no trades ever made | Home Screen loads | Portfolio card shows ₫500.000.000, daily change ₫0 · 0,00%, "Tiền ảo" badge, and "Bắt đầu giao dịch" CTA |
| AC-HS-03-03 | Portfolio value has positive daily change | Home Screen loads | Change displayed in `#10B981` (green) with "+" prefix |
| AC-HS-03-04 | Portfolio value has negative daily change | Home Screen loads | Change displayed in `#EF4444` (red) with "−" prefix |
| AC-HS-03-05 | LEARN_MODE user | Home Screen loads | Portfolio value line hidden; daily change line hidden; "Tiền ảo" badge visible; no brokerage CTA in DOM |
| AC-HS-03-06 | `feature_tier` API returns error | Home Screen loads | LEARN_MODE restrictions applied; error toast shown; portfolio value not displayed |
| AC-HS-03-07 | Market price data is unavailable | Home Screen loads | Last known portfolio value shown with "⏱ Cập nhật lúc HH:MM" indicator; "Tiền ảo" badge still visible |
| AC-HS-03-08 | Any FULL_ACCESS user | At any time | "Tiền ảo · 가상 자금 · Virtual Funds" badge is present in DOM (verifiable via DOM inspection, not just visual) |

### FR-HS-04 — Market Indices Strip

| # | Given | When | Then |
|---|---|---|---|
| AC-HS-04-01 | All 5 index feeds healthy | Home Screen loads | 5 index cards rendered in horizontal scroll; each shows name, exchange badge, value, change |
| AC-HS-04-02 | VN-Index has positive daily change | Home renders | Change value and percentage shown in `#10B981` (green) |
| AC-HS-04-03 | HNX-Index has negative daily change | Home renders | Change value and percentage shown in `#EF4444` (red) with "−" prefix |
| AC-HS-04-04 | App is in foreground | 30 seconds elapse | Strip data silently refreshes; no skeleton flash; scroll position preserved |
| AC-HS-04-05 | Index feed is unreachable | Home Screen loads | Last cached value shown with "⏱ HH:MM" stale indicator on each affected card |
| AC-HS-04-06 | No cached data exists for UPCOM | Feed is unreachable | UPCOM card shows "—" for value; exchange badge and card frame still visible |

### FR-HS-05 — Market Activity Section

| # | Given | When | Then |
|---|---|---|---|
| AC-HS-05-01 | Home Screen loads | Default state | "Diễn biến thị trường" section shows HOSE exchange selected; "Biến động giá" tab active |
| AC-HS-05-02 | User taps "HNX" exchange selector | Exchange selected | Breadth bar stats and all 3 tab contents update to HNX data |
| AC-HS-05-03 | "Biến động giá" tab is active | Default render | Left column shows 8 gainers in green; right column shows 8 losers in red |
| AC-HS-05-04 | User taps "Khớp nhiều" tab | Tab switch | Tab content switches to top stocks by matched volume; no additional loading state (data pre-fetched) |
| AC-HS-05-05 | User taps "NĐT NN" tab | Tab switch | Tab content switches to foreign investor flow data |
| AC-HS-05-06 | Market activity API returns error | Home Screen loads | Section shows error state with retry button; other sections unaffected |
| AC-HS-05-07 | "%" sub-tab selected within "Biến động giá" | Sub-tab tap | Gainers list re-sorted by percentage change descending; losers list re-sorted by percentage change ascending |

### FR-HS-06 — Watchlist Section

| # | Given | When | Then |
|---|---|---|---|
| AC-HS-06-01 | User has ≥ 5 watchlisted stocks | Home Screen loads | 5 most recently added stocks shown in horizontal scroll; "Xem tất cả →" visible |
| AC-HS-06-02 | User has 3 watchlisted stocks | Home Screen loads | All 3 cards shown; "Xem tất cả →" visible; no placeholder cards for positions 4–5 |
| AC-HS-06-03 | User has 0 watchlisted stocks | Home Screen loads | Empty state message shown; "Khám phá cổ phiếu" CTA shown; "Xem tất cả →" hidden |
| AC-HS-06-04 | User taps a watchlist stock card | Card tap | Navigates to Stock Detail screen for that ticker |
| AC-HS-06-05 | User taps "Xem tất cả →" | Link tap | Navigates to full Watchlist screen |
| AC-HS-06-06 | A watchlisted stock is delisted | Home Screen loads | Card shows "Đã hủy niêm yết" chip; price frozen at last known value |

### FR-HS-07 — AI Suggestions Section

| # | Given | When | Then |
|---|---|---|---|
| AC-HS-07-01 | AI suggestions data exists for today | Home Screen loads | Section visible; cards rendered in horizontal scroll; disclaimer text visible below cards |
| AC-HS-07-02 | AI data is unavailable (API error) | Home Screen loads | Entire AI section absent from screen (header, cards, and disclaimer all removed from DOM) |
| AC-HS-07-03 | Any state when AI section is visible | DOM inspection | Disclaimer text "Đây là gợi ý tham khảo — không phải khuyến nghị đầu tư. Quyết định cuối cùng thuộc về bạn." is present in DOM |
| AC-HS-07-04 | FPT suggestion has confidence 78% | Card renders | Progress bar filled to 78%; "78%" label shown; "TIN CẬY" badge shown |
| AC-HS-07-05 | Suggestion has signal type "Cảnh báo bán" | Card renders | Signal label shown in `#EF4444` (red) |
| AC-HS-07-06 | Suggestion has signal type "Cơ hội mua tiềm năng" | Card renders | Signal label shown in `#10B981` (green); "MỤC TIÊU AI" price line visible |
| AC-HS-07-07 | AI data was computed 4 hours ago | Section renders | Sub-header shows "Cập nhật 4h trước" |
| AC-HS-07-08 | AI data was computed 26 hours ago | Section renders | Sub-header shows "Cập nhật hôm qua" |

### FR-HS-08 — News Section

| # | Given | When | Then |
|---|---|---|---|
| AC-HS-08-01 | Home Screen loads | Default state | 5 most recent articles shown; "THỊ TRƯỜNG" chip active |
| AC-HS-08-02 | User taps "KINH TẾ" chip | Chip tap | Articles list updates to show 5 most recent articles in KINH TẾ category; "KINH TẾ" chip highlighted |
| AC-HS-08-03 | Article published 5 minutes ago | Relative time computed | Shows "5 phút trước" |
| AC-HS-08-04 | Article published 2 hours ago | Relative time computed | Shows "2 giờ trước" |
| AC-HS-08-05 | Article published yesterday | Relative time computed | Shows exact date "DD/MM/YYYY" |
| AC-HS-08-06 | User taps "Xem tất cả →" | Link tap | Navigates to full News screen with currently active category chip pre-selected |
| AC-HS-08-07 | News API returns error | Home Screen loads | Error state with retry button shown in News section; section header visible; other sections unaffected |

### FR-HS-09 — Data Refresh

| # | Given | When | Then |
|---|---|---|---|
| AC-HS-09-01 | App in foreground | 30 seconds elapse | All 6 sections silently refresh; no spinner; no scroll reset |
| AC-HS-09-02 | User performs pull-to-refresh | Gesture detected | Spinner appears at top; all sections refresh; spinner dismisses when all fetches complete |
| AC-HS-09-03 | Market indices API fails on auto-refresh | 30s tick fires | Market indices section retains previous data with stale indicator; single toast appears "Không thể cập nhật. Đang hiển thị dữ liệu gần nhất." |
| AC-HS-09-04 | User pulls to refresh with no internet | Pull gesture | Toast "Không thể cập nhật. Đang hiển thị dữ liệu gần nhất." shown for 4s; all sections retain cached data |
| AC-HS-09-05 | User pulls to refresh twice within 3 seconds | Second pull | Second pull silently ignored; no spinner shown for second attempt |
| AC-HS-09-06 | App backgrounded for 10 minutes | User returns to foreground | Immediate refresh fires for all sections; 30s cadence then resumes |
| AC-HS-09-07 | Multiple sections fail simultaneously on one refresh | Refresh completes | One toast shown (not multiple simultaneous toasts); each failed section retains its own previous data |

---

## 8. Edge Cases

### 8.1 Portfolio Card Edge Cases

| Case | Expected Behavior |
|---|---|
| Portfolio value computes to exactly ₫500.000.000 (no trades, full cash) | Show ₫500.000.000; daily change ₫0 · 0,00%; "Bắt đầu giao dịch" CTA visible |
| Portfolio value exceeds ₫1.000.000.000 (1 billion VND) | Format as "₫1.000.000.000" — full digit format; no abbreviation on portfolio card (unlike market activity section) |
| Market data partially unavailable (some holdings have stale prices) | Compute aggregate with available prices; show "⏱ Cập nhật lúc HH:MM" indicator; tooltip on indicator lists which tickers are stale |
| `feature_tier` unresolvable (API timeout or 5xx) | Default to LEARN_MODE; show toast "Không thể xác định tài khoản. Đang hiển thị chế độ hạn chế."; retry silently every 60s |
| User's DOB correction changes tier from LEARN_MODE to FULL_ACCESS within a session | Re-evaluate tier on next app foreground event; do not require logout; update portfolio card within same session |

### 8.2 Market Indices Edge Cases

| Case | Expected Behavior |
|---|---|
| VNINDEX feed returns but VN30 feed is missing | VNINDEX card shows live data; VN30 card shows cached value with stale indicator; if no cache for VN30, show "—" |
| All 5 index feeds fail simultaneously | All 5 cards show last cached values with stale indicators; single "Market data may be delayed" label in section header |
| Index value changes sign within refresh cycle (goes from negative to flat) | Color updates from red to yellow; no animation |
| Market is closed on a weekday (public holiday) | Show last closing value with "Thị trường đóng cửa" label; strip does not flash as stale |

### 8.3 Market Activity Edge Cases

| Case | Expected Behavior |
|---|---|
| Fewer than 8 stocks qualify as gainers | Show all available gainers; right column (losers) still shows up to 8; left column shows N gainers with no empty placeholder rows |
| All stocks are advancing (no losers) | Left column shows up to 8 gainers; right "GIẢM" column shows "Không có cổ phiếu giảm" text |
| Exchange switches while data is loading | Cancel in-flight request for previous exchange; show skeleton for new exchange data; render when new data arrives |
| Volume data is zero for all stocks (pre-market) | "Khớp nhiều" tab shows "Chưa có giao dịch" text; does not crash |

### 8.4 Watchlist Edge Cases

| Case | Expected Behavior |
|---|---|
| All 5 preview stocks are delisted | All 5 cards show "Đã hủy niêm yết" chip; "Xem tất cả →" still functional |
| A watchlist stock is suspended (trading halted, not delisted) | Card shows "Tạm ngừng" chip; price frozen at halt price |
| Price data missing for one watchlist card | That card shows last known price with "⏱" indicator; other cards unaffected |
| User adds a new stock to watchlist from Stock Detail screen | On next Home Screen foreground event or 30s tick, watchlist preview reflects the addition |

### 8.5 AI Suggestions Edge Cases

| Case | Expected Behavior |
|---|---|
| AI batch job did not run today (no records for today's date) | AI Suggestions section hidden entirely; no error shown |
| Confidence percentage is exactly 65% | "TIN CẬY" badge shown (threshold is ≥ 65%) |
| Confidence percentage is 64% | "TIN CẬY" badge not shown |
| AI suggestion's target ticker has been delisted since computation | Card still shown; ticker line shows "Đã hủy niêm yết" chip; "MỤC TIÊU AI" price line hidden |

### 8.6 News Edge Cases

| Case | Expected Behavior |
|---|---|
| Selected category has 0 articles | "Không có tin tức trong danh mục này." shown in place of article list; category chip remains active |
| Selected category has < 5 articles | Show all available articles; no placeholder rows for missing positions |
| News article headline is > 2 lines | Truncated with ellipsis at line 2; full headline visible in article detail screen |
| User changes category chip while previous fetch is still loading | Cancel previous fetch; start new fetch for newly selected category; show skeleton |

---

## 9. Design Requirements

### 9.1 Layout

The Home Screen is a single vertical scroll view (no paging). Sections appear in the following fixed order from top to bottom:

1. Header / Greeting
2. Portfolio Summary Card
3. Market Indices Strip (horizontal scroll)
4. Market Activity Section (exchange selector + breadth bar + 3 tabs)
5. Watchlist Section (horizontal scroll)
6. AI Suggestions Section (horizontal scroll + disclaimer)
7. News Section (category chips + vertical article list)

Bottom Navigation Bar is fixed at the bottom of the viewport, always visible, never scrolls with content.

### 9.2 Color System

| Purpose | Color code | Usage |
|---|---|---|
| Increase / positive / buy | `#10B981` | Positive portfolio change, gaining stocks, buy signals |
| Decrease / negative / sell | `#EF4444` | Negative portfolio change, declining stocks, sell warnings |
| Unchanged / TC (reference price) | `#F59E0B` | Stocks at reference price; neutral AI signals |
| Stale data indicator | `#9E9E9E` | Stale indicator text; zero-change percentage |
| AI "TIN CẬY" badge | Design system accent | Cards with confidence ≥ 65% |
| Active nav tab | Neo Lumen lime-signal | Active bottom nav tab icon and label |

### 9.3 Typography

- Section headers: bold, 16sp
- Portfolio value: bold, 28sp
- Index value: bold, 16sp
- Stock ticker in watchlist: bold, 18sp
- Percentage change: medium weight, 14sp
- Disclaimer text (AI section): 12sp, `#9E9E9E`, regular weight
- "Tiền ảo · 가상 자금 · Virtual Funds" badge: 11sp, pill background

### 9.4 Component Behavior

- **Horizontal scroll rows** (indices, watchlist, AI cards): no pagination dots; momentum scrolling; leftmost item flush to left edge of screen
- **Skeleton loaders**: match height of real content; subtle pulse animation; replaced by content or error state — never persist beyond 3 seconds without resolution
- **Toast notifications**: bottom-anchored above nav bar; max 1 toast visible at a time; 4-second auto-dismiss; not stackable
- **Stale indicator**: clock icon (⏱) + "Cập nhật lúc HH:MM" in `#9E9E9E`
- **Progress bar** (AI confidence): horizontal bar, filled to confidence %, `#10B981` fill for positive, `#EF4444` fill for negative/warning, `#F59E0B` fill for neutral

### 9.5 Responsive Behavior

- Minimum supported width: 375px (iPhone SE)
- Cards in horizontal scroll rows: fixed width; partially visible next card (≥ 20px peeking) to communicate scrollability
- Portfolio card: full width minus standard horizontal padding (16px each side)
- Market activity section: full width; tab bar spans full width

---

## 10. Traceability Matrix

| Business Objective (BRD v2.4) | Functional Requirement | Acceptance Criteria | Test Case Reference |
|---|---|---|---|
| BO-01 Paper trading is the product — portfolio visibility is primary | FR-HS-03 Portfolio Summary Card | AC-HS-03-01, AC-HS-03-02, AC-HS-03-07, AC-HS-03-08 | TC-HOME-003 |
| BO-01 Age gate: LEARN_MODE restrictions | FR-HS-03 (LEARN_MODE handling), BR-HS-05 | AC-HS-03-05, AC-HS-03-06 | TC-HOME-004 |
| BO-04 Tiền ảo badge compliance | BR-HS-04, FR-HS-03 | AC-HS-03-08 | TC-HOME-005 |
| BO-05 AI is a supporting feature — must include disclaimer | FR-HS-07, BR-HS-06 | AC-HS-07-02, AC-HS-07-03 | TC-HOME-007 |
| BO-06 VN market data reliability (30s SLA) | FR-HS-04, FR-HS-09, BR-HS-08 | AC-HS-04-04, AC-HS-09-01 | TC-HOME-004a |
| BO-03 Watchlist engagement | FR-HS-06 | AC-HS-06-01 through AC-HS-06-06 | TC-HOME-006 |
| BO-02 VN Gen Z social investing — personalized news | FR-HS-08 | AC-HS-08-01 through AC-HS-08-07 | TC-HOME-008 |
| BRD §v2.4 nav rename "Tài sản" | FR-HS-01, BR-HS-11 | AC-HS-01-04 | TC-HOME-001 |
| BRD §6 BR-31 No brokerage CTA for LEARN_MODE | BR-HS-05, FR-HS-03 | AC-HS-03-05 | TC-HOME-009 |
| BRD §6 BR-14 VND formatting | BR-HS-01, BR-HS-03, BR-HS-09 | AC-HS-03-01, AC-HS-04-02 | TC-HOME-010 |

---

## 11. Related Documents

| Document | Relationship |
|---|---|
| BRD.md v2.4 | Parent business requirements; all BR-HS rules derive from BRD business rules |
| FRD-17 Market Board | Defines the full Market Board reachable from "Thị trường" tab; color system and index data model are shared |
| FRD-06 Markets | Korea and Global tabs; Market Search (FR-40); Market Hours (FR-41) |
| FRD-12 AI Insights | AI Insights detail screen — destination when user taps an AI suggestion card from Home |
| FRD-20 Order Placement v2 | Paper trading order flow — destination of "Bắt đầu giao dịch" CTA for FULL_ACCESS users with no trades |
| FRD-04 Stock Detail | Destination when user taps a stock card in Watchlist section or Market Activity section |
| FRD-05 Portfolio Tracking | Full portfolio screen — "Tài sản" tab destination |
| FRD-03 Discover Feed | "Khám phá" tab destination; add-stocks CTA from empty Watchlist state |
| SRD.md | System-level data handling rules; `symbol_quotes_latest` schema; `virtual_holdings` schema |
| API v1.5.0 (api.json) | Authoritative API contracts; all endpoint shapes in this document align with v1.5.0 |

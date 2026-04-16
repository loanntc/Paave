# API Audit Report: Paave API Spec vs FRD/SRD

**Date:** 2026-04-16
**API Spec Version:** 1.5.1 (455 endpoints)
**FRD Version:** 2.1
**SRD Version:** 2.1
**Auditor:** Engineering Team

---

## Table of Contents

1. [Section 1: FRD Coverage Matrix](#section-1-frd-coverage-matrix)
2. [Section 2: Missing APIs (26 Gaps)](#section-2-missing-apis-26-gaps)
3. [Section 3: Extra APIs -- Product Opportunities](#section-3-extra-apis----product-opportunities)

---

## Section 1: FRD Coverage Matrix

### Legend

- **COVERED** -- API endpoints exist and match the FRD requirement
- **PARTIAL** -- Some endpoints exist but gaps remain
- **MISSING** -- No matching API endpoints found in the spec

---

### Onboarding (FR-01 to FR-08)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-01 | Splash Screen and App Entry | COVERED | `POST /api/v1/auth/token/refresh` (session check) | Session validation via token refresh handles routing logic. App entry routing is client-side using token state. |
| FR-02 | Welcome Screen | COVERED | N/A (client-side only) | No API needed -- pure UI screen with CTAs. |
| FR-03 | Nationality Detection | PARTIAL | `GET /api/v1/app/locale` (locale resources) | Device locale detection is client-side. No explicit API to persist detected nationality pre-registration. Nationality is submitted as part of `POST /api/v1/users` registration. |
| FR-04 | Market Preference Selection | COVERED | `POST /api/v1/users` (nationality field at registration), `PATCH /api/v1/users/me/full-name` (profile updates) | Market preference is part of registration payload. |
| FR-05 | User Registration | COVERED | `POST /api/v1/users`, `POST /api/v1/auth/otp` (send OTP), `POST /api/v1/users/availability-checks` | Registration, email uniqueness check, and OTP sending all present. |
| FR-06 | Email Verification | COVERED | `POST /api/v1/auth/otp/verify`, `POST /api/v1/auth/otp` (resend) | OTP verify and resend endpoints present. Rate limiting (429) handled. |
| FR-07 | Login | COVERED | `POST /api/v1/auth/login/password`, `POST /api/v1/auth/token/refresh`, `POST /api/v1/auth/token/revoke` | Password login, token refresh, and token revocation all present. Generic error responses match FRD. |
| FR-07B | Biometric Authentication | COVERED | `POST /api/v1/auth/biometric/register`, `GET /api/v1/auth/biometric/status`, `POST /api/v1/auth/biometric/unregister`, `POST /api/v1/auth/biometric/verify-otp`, `POST /api/v1/auth/biometric/verify-password`, `POST /api/v1/auth/login/biometric` | Full biometric lifecycle: register, verify-otp, verify-password, login, status check, unregister. |
| FR-08 | Onboarding Progress Indicator | COVERED | N/A (client-side only) | Step indicator is purely client-side UI. No API needed. |

---

### Home Screen (FR-09 to FR-14)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-09 | Portfolio Value Hero Widget | COVERED | `GET /api/v1/virtual/equity/accounts/profit-loss`, `GET /api/v1/virtual/equity/accounts/accumulative-profit-loss` | Virtual portfolio P&L endpoints serve the hero widget data. |
| FR-10 | Market Snapshot Widget | COVERED | `GET /api/v1/market/index/list`, `GET /api/v1/market/session-status`, `GET /api/v1/market/symbol/latest` | Index list, session status, and latest quotes provide all snapshot data. |
| FR-11 | Trending Stocks Section | COVERED | `GET /api/v1/market/stock/ranking/top`, `GET /api/v1/market/ranking/up-down`, `GET /api/v1/insights/search-stats/top` | Top ranking endpoints provide trending data. Social proof counts available via Social endpoints. |
| FR-12 | Personalized Watchlist on Home | COVERED | `GET /api/v1/insights/watchlists`, `GET /api/v1/insights/watchlists/symbol`, `GET /api/v1/market/symbol/latest` | Watchlist endpoints + live price data via market symbol latest. |
| FR-13 | Home Screen Data Refresh | COVERED | All market/watchlist GET endpoints support re-fetch | Client-side pull-to-refresh calls existing endpoints. No dedicated refresh API needed. |
| FR-14 | Bottom Navigation | COVERED | N/A (client-side only) | Navigation is purely client-side routing. |

---

### Discover / Trending Feed (FR-15 to FR-22)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-15 | Discover Feed Layout | MISSING | No `GET /api/v1/discover` endpoint in API spec | **GAP**: SRD defines `GET /api/v1/discover` with market, theme, page params. This endpoint is absent from the API spec. Must be built. |
| FR-16 | Stock Card Content | PARTIAL | `GET /api/v1/market/symbol/latest` (price data), `GET /api/v1/social/cashtags/{symbol}` (social proof) | Price data and social proof available via separate endpoints. **GAP**: No editorial hook/theme badge endpoint. CMS integration endpoint missing. |
| FR-17 | Theme Filters on Discover | MISSING | No theme filter API | **GAP**: Theme filter depends on the missing Discover endpoint. No CMS-backed theme tagging API. |
| FR-18 | Market Filter on Discover | MISSING | No market filter on Discover | **GAP**: Same as FR-15 -- requires the Discover feed endpoint with market filter param. |
| FR-19 | Infinite Scroll on Discover | MISSING | No paginated Discover feed | **GAP**: Pagination depends on FR-15 Discover endpoint. |
| FR-20 | Add to Watchlist from Discover | COVERED | `POST /api/v1/insights/watchlists/symbol`, `DELETE /api/v1/insights/watchlists/symbol` | Watchlist add/remove endpoints present and support optimistic UI pattern. |
| FR-21 | Stock Card Navigation | COVERED | N/A (client-side navigation) | Navigation from card to Stock Detail is client-side routing. |
| FR-22 | Editorial Content Management | MISSING | No CMS/editorial API | **GAP**: No endpoint to fetch or manage editorial content (hook text, theme badges). Requires a CMS integration API or dedicated editorial endpoints. |

---

### Stock Detail (FR-23 to FR-29)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-23 | Stock Detail Screen Layout | COVERED | `GET /api/v1/market/symbol/{symbol}/quote`, `GET /api/v1/fundamentals/profile`, `GET /api/v1/social/cashtags/{symbol}` | Quote data, company profile, and per-ticker social posts all available. |
| FR-24 | Price Chart | COVERED | `GET /api/v1/market/candles`, `GET /api/v1/market/symbol/{symbol}/minute-chart`, `GET /api/v1/market/symbol/{symbol}/minutes`, `GET /api/v1/market/symbol/{symbol}/period/{periodType}` | Multiple charting endpoints cover 1D (minute), 1W/1M/3M/1Y (period). |
| FR-25 | Key Stats | COVERED | `GET /api/v1/market/symbol/{symbol}/quote` (open, high, low, volume), `GET /api/v1/fundamentals/financials` (P/E, market cap) | All 9 stats (Open, Prev Close, Day High/Low, 52W High/Low, Volume, Market Cap, P/E) available across quote + fundamentals. |
| FR-26 | Analyst Sentiment | PARTIAL | `GET /api/v1/market/top-ai-rating` (AI-based rating) | **GAP**: No dedicated analyst sentiment endpoint returning Buy/Hold/Sell percentages per stock. AI rating exists but is not the same as analyst consensus. SRD contract defines this in the stock detail response but no standalone sentiment endpoint exists. |
| FR-27 | Add to Watchlist from Stock Detail | COVERED | `POST /api/v1/insights/watchlists/symbol`, `DELETE /api/v1/insights/watchlists/symbol`, `GET /api/v1/insights/watchlists/symbol/include` | Add, remove, and membership check all present. |
| FR-28 | Set Price Alert | MISSING | No alert CRUD endpoints in the API spec | **GAP**: SRD defines `POST /api/v1/alerts`, `GET /api/v1/alerts`, `DELETE /api/v1/alerts/{id}`. None of these endpoints exist in the API spec. Must be built. |
| FR-29 | Stock Detail Back Navigation | COVERED | N/A (client-side only) | Back navigation is client-side. |

---

### Portfolio Tracking (FR-30 to FR-35)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-30 | Portfolio Holdings Overview | COVERED (Deprecated) | `GET /api/v1/virtual/equity/accounts/profit-loss` | FR-30 is deprecated in V2 in favor of FR-PT-04. Virtual trading endpoints serve this. |
| FR-31 | Add Holding Manually | COVERED (Deprecated) | `POST /api/v1/virtual/equity/orders` | Deprecated -- superseded by paper trading order placement. |
| FR-32 | Edit Holding | COVERED (Deprecated) | `PUT /api/v1/virtual/equity/orders/{orderId}` | Deprecated -- superseded by paper trading. |
| FR-33 | Delete Holding | COVERED (Deprecated) | `DELETE /api/v1/virtual/equity/orders/{orderId}` | Deprecated -- superseded by paper trading. |
| FR-34 | Transaction History | COVERED (Deprecated) | `GET /api/v1/virtual/equity/orders/history` | Deprecated -- trade history via paper trading engine. |
| FR-35 | P&L Color Coding | COVERED | N/A (client-side formatting) | Color coding is client-side rendering logic. API returns raw numeric P&L values. |

---

### Markets Module (FR-36 to FR-41)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-36 | Markets Screen Layout | COVERED | `GET /api/v1/market/session-status`, `GET /api/v1/market/index/list` | Market tabs driven by index list and session status. |
| FR-37 | Vietnam Market (Real-Time) | COVERED | `GET /api/v1/market/ranking/up-down`, `GET /api/v1/market/stock/ranking/top`, `GET /api/v1/market/symbol/latest`, `GET /api/v1/market/index-stock-list/{indexCode}` | VN-Index data, top gainers/losers/most active all available. Session status includes feed status for latency monitoring. |
| FR-38 | Korea Market | PARTIAL | `GET /api/v1/market/symbol/latest` (if KR symbols exist) | **GAP**: API spec is VN-centric. No explicit KR market endpoints (KOSPI/KOSDAQ). KR data sourcing via web search/model knowledge requires a separate data pipeline not reflected in the API spec. |
| FR-39 | Global Market Overview | MISSING | No global index endpoints | **GAP**: No endpoints for S&P 500, Nasdaq, Dow, FTSE, Nikkei, DAX. Global market data requires a new data source integration. |
| FR-40 | Market Search | COVERED | `GET /api/v1/market/symbol` (symbol lookup by code list), `GET /api/v1/insights/search-history`, `POST /api/v1/insights/search-history` | Symbol lookup and search history (recent searches) both present. |
| FR-41 | Market Hours Reference | COVERED | `GET /api/v1/market/session-status`, `GET /api/v1/app/holidays` | Session status provides open/closed/pre-market status. Holidays endpoint provides holiday calendar. |

---

### Notifications (FR-42 to FR-47)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-42 | Push Notification Permission | PARTIAL | `POST /api/v1/live/nhsv/user/push-tokens` (push token registration) | Push token registration exists under NHSV. **GAP**: No Paave-native push token registration endpoint (e.g., `POST /api/v1/notifications/push-token`). SRD references push token storage but no V1-specific endpoint. |
| FR-43 | Price Alert Notification | MISSING | No alert evaluation or notification trigger API | **GAP**: Depends on FR-28 alert CRUD (also missing). The alert evaluation flow described in SRD section 2.6 has no corresponding API surface. |
| FR-44 | Market Open Notification | MISSING | No market open notification preference API | **GAP**: No endpoint to toggle market open/close notification preferences. SRD references this in notification settings. |
| FR-45 | Market Close Notification | MISSING | No market close notification preference API | **GAP**: Same as FR-44. Requires notification preference management. |
| FR-46 | Watchlist Movement Notification | MISSING | No watchlist movement notification API | **GAP**: No endpoint to configure watchlist price movement thresholds or preferences. |
| FR-47 | Notification History | COVERED | `GET /api/v1/insights/notifications/inbox`, `POST /api/v1/insights/notifications/reads`, `GET /api/v1/insights/notifications/unread-count`, `DELETE /api/v1/insights/notifications` | Notification inbox, mark-read, unread count, and delete all present. |

---

### User Account (FR-48 to FR-53)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-48 | User Profile Screen | COVERED | `GET /api/v1/users/me` | Full profile retrieval including linked accounts and status. |
| FR-49 | Edit Profile | COVERED | `PATCH /api/v1/users/me/full-name`, `PATCH /api/v1/users/me/username`, `PATCH /api/v1/users/me/bio` | Display name, username, and bio update endpoints present. |
| FR-50 | Change Password | COVERED | `POST /api/v1/users/me/password` | Password change with current password verification. |
| FR-51 | Logout | COVERED | `POST /api/v1/auth/token/revoke` | Token revocation invalidates session. |
| FR-52 | Notification Settings | PARTIAL | `PATCH /api/v1/insights/settings/notification-preferences`, `GET /api/v1/insights/settings/notifications` | Notification preference management exists. **GAP**: No explicit toggle types for Portfolio Health Check (FR-AI-05) and Behavioral Coaching (FR-AI-07) -- these need to be added as notification types. |
| FR-53 | Help & Support | COVERED | `GET /api/v1/app/faq/{msName}`, `POST /api/v1/users/me/feedbacks` | FAQ endpoint and feedback submission both present. |

---

### Module A: Age Gate (FR-AGE-01 to FR-AGE-04)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-AGE-01 | DOB Collection at Registration | PARTIAL | `POST /api/v1/users` (registration) | Registration endpoint exists but the API spec does not show a `date_of_birth` field in the request body. SRD defines it. **GAP**: API spec `POST /api/v1/users` body uses `otpKey` and `fullname` but does not list `date_of_birth` or `nationality`. The spec may need schema update. |
| FR-AGE-02 | Parental Consent Flow | PARTIAL | No explicit parental consent endpoints in API spec | **GAP**: SRD defines `POST /api/v1/auth/resend-parental-consent`. This endpoint is not in the API spec. Feature is P2/deferred but the flow infrastructure is missing. |
| FR-AGE-03 | Feature Tier Enforcement | PARTIAL | Login responses include `feature_tier` (per SRD) | Feature tier is returned in login/OTP-verify responses per SRD. **GAP**: The API spec does not explicitly document `feature_tier` in login response bodies. Needs schema documentation. |
| FR-AGE-04 | Age Upgrade Prompt | MISSING | No age upgrade endpoint | **GAP**: No `POST /api/v1/users/me/upgrade-tier` or similar endpoint. SRD section 2.3 describes server-side age recalculation on login, but no explicit upgrade acceptance API. |

---

### Module B: Paper Trading Engine (FR-PT-01 to FR-PT-06)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-PT-01 | Virtual Portfolio Creation | COVERED | `POST /api/v1/virtual/accounts` (initialize virtual account) | Virtual account creation with starting balance. |
| FR-PT-02 | Place Market Order (Paper) | COVERED | `POST /api/v1/virtual/equity/orders` | Virtual equity order placement endpoint present. |
| FR-PT-03 | Place Limit Order (Paper) | COVERED | `POST /api/v1/virtual/equity/orders`, `POST /api/v1/virtual/equity/orders/stop-limit` | Limit and stop-limit order endpoints available. |
| FR-PT-04 | Portfolio Dashboard (Paper) | COVERED | `GET /api/v1/virtual/equity/accounts/profit-loss`, `GET /api/v1/virtual/equity/accounts/daily-profit-loss`, `GET /api/v1/virtual/equity/accounts/realized-profit-loss`, `GET /api/v1/virtual/equity/orders/history`, `GET /api/v1/virtual/equity/accounts/buyable`, `GET /api/v1/virtual/equity/accounts/sellable` | Comprehensive P&L, history, buyable/sellable power all present. Portfolio chart data via `GET /api/v1/virtual/accounts/one-month-normalized-nav`. |
| FR-PT-05 | Portfolio Reset | MISSING | No portfolio reset endpoint in API spec | **GAP**: SRD defines `POST /api/v1/paper-trading/reset`. No equivalent found in the Virtual Trading section. The `POST /api/v1/virtual/accounts` endpoint creates new accounts but does not reset existing ones. Must be built. |
| FR-PT-06 | Virtual Money Label | COVERED | N/A (client-side rendering) | Label rendering is client-side. No API needed. |

---

### Module C: Gamification (FR-GAME-01 to FR-GAME-07)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-GAME-01 | XP System | MISSING | No XP endpoints | **GAP**: No `GET /api/v1/gamification/xp` or XP event tracking API. SRD section 2.13 describes XP award flow but no API surface exists. |
| FR-GAME-02 | Trader Tiers | PARTIAL | Leaderboard endpoints show tier data implicitly | Leaderboard endpoints (`GET /api/v1/virtual/leaderboard/investing`) may include tier info. **GAP**: No dedicated tier badge or tier progression API. |
| FR-GAME-03 | Trader Score | PARTIAL | `GET /api/v1/virtual/leaderboard/investing/user-ranking` | User ranking endpoint likely returns trader score. **GAP**: No weekly score breakdown or score history API. |
| FR-GAME-04 | Weekly Challenges | PARTIAL | `GET /api/v1/virtual/contests`, `POST /api/v1/virtual/contests/{contestId}/join`, `GET /api/v1/virtual/contests/{contestId}/ranking` | Virtual contests infrastructure maps partially to weekly challenges. **GAP**: Contests are full-featured competition events, not lightweight weekly challenges as described in FRD. May need adaptation or a separate challenge subsystem. |
| FR-GAME-05 | Learning Streaks | MISSING | No streak tracking endpoints | **GAP**: No streak counter, streak freeze, or daily login tracking API. Must be built as part of gamification service. |
| FR-GAME-06 | Milestone Celebrations | MISSING | No milestone achievement endpoints | **GAP**: No milestone log, achievement card generation, or celebration trigger API. SRD section 2.25 describes the flow but no API surface exists. |
| FR-GAME-07 | Portfolio Goal Setting | MISSING | No goal setting endpoints | **GAP**: No `POST /api/v1/gamification/goals` or goal progress tracking API. Must be built. |

---

### Module D: AI System P0 (FR-AI-01 to FR-AI-03)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-AI-01 | Post-Trade Explanation | MISSING | No AI post-trade endpoint | **GAP**: SRD section 2.15 defines the AI post-trade analysis flow. No `GET /api/v1/ai/post-trade/{orderId}` or similar endpoint in API spec. AI service endpoints are entirely absent. |
| FR-AI-02 | Natural Language Stock Query | MISSING | No AI query endpoint | **GAP**: SRD section 2.26 defines `POST /api/v1/ai/query`. No AI chat/query endpoints in API spec. Must be built. |
| FR-AI-03 | Multilingual AI Routing | MISSING | No AI routing config endpoint | **GAP**: AI language routing is server-side per SRD section 2.21 (language service), but no AI-specific routing endpoints exist. Language preference is managed via user locale endpoints. |

---

### Module E: AI System P1 (FR-AI-04 to FR-AI-07)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-AI-04 | Pre-Trade AI Card | MISSING | No AI pre-trade endpoint | **GAP**: SRD section 2.16 defines `GET /api/v1/ai/pre-trade?ticker={ticker}`. Not in API spec. |
| FR-AI-05 | Portfolio Health Check | MISSING | No AI health check endpoint | **GAP**: SRD section 2.18 defines `GET /api/v1/ai/portfolio-health/latest`. Not in API spec. |
| FR-AI-06 | Personalized Learning Path | MISSING | No learning path or micro-lesson endpoints | **GAP**: No lesson tracking, quiz, or spaced repetition API. Entirely absent from API spec. |
| FR-AI-07 | Behavioral Coaching | MISSING | No coaching nudge endpoints | **GAP**: SRD section 2.17 defines behavioral coaching flow. No API surface for coaching delivery or feedback rating. |

---

### Module E2: Education System (FR-EDU-01)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-EDU-01 | Inline Financial Terminology Tooltips | MISSING | No glossary or tooltip endpoint | **GAP**: No `GET /api/v1/glossary` or financial term lookup API. SRD references server-side glossary table but no API exposes it. |

---

### Module F: Social Features P1 (FR-SOC-01 to FR-SOC-05)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-SOC-01 | Social Proof on Stock Cards | PARTIAL | `GET /api/v1/social/cashtags/{symbol}` (post count), watchlist endpoints | **GAP**: No dedicated social proof aggregation endpoint returning watcher count + sentiment ratio + trending badge in a single call. Data must be assembled from multiple endpoints. Consider a dedicated endpoint. |
| FR-SOC-02 | Per-Ticker Community Feed | COVERED | `GET /api/v1/social/cashtags/{symbol}` | Per-ticker feed with cursor pagination present. |
| FR-SOC-03 | Post Creation | COVERED | `POST /api/v1/social/posts` | Post creation with auto-parsed cashtags. |
| FR-SOC-04 | Follow System | COVERED | `POST /api/v1/social/users/{id}/follows`, `DELETE /api/v1/social/users/{id}/follows`, `GET /api/v1/social/users/{id}/followers`, `GET /api/v1/social/users/{id}/following`, `GET /api/v1/social/timeline` | Full follow/unfollow, follower/following lists, and timeline feed. |
| FR-SOC-05 | Social Profile | PARTIAL | `GET /api/v1/social/users/{id}/posts`, `GET /api/v1/social/users/{id}/followers`, `GET /api/v1/social/users/{id}/following` | Post history, follower/following counts derivable. **GAP**: No dedicated public profile endpoint with pseudonym, tier badge, trader score, joined date in a single response. Must assemble from user + gamification data. |

---

### Module G: Language System (FR-LANG-01 to FR-LANG-02)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-LANG-01 | Language Selection | COVERED | `GET /api/v1/app/locale` (locale resources), admin locale endpoints | Locale resource URLs returned at app startup for i18n. Language persistence is part of user profile. |
| FR-LANG-02 | Financial Terminology Localization | PARTIAL | `GET /api/v1/app/locale` (locale files contain translations) | Locale resource files can include financial terminology. **GAP**: No dedicated financial glossary localization API separate from general i18n. Tooltip data (FR-EDU-01) is missing. |

---

### Module H: Legal / Disclaimers (FR-LEGAL-01 to FR-LEGAL-03)

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-LEGAL-01 | Investment Disclaimer Display | COVERED | N/A (client-side per-session logic) | Disclaimer display logic is client-side. Disclaimer text loaded via locale files. |
| FR-LEGAL-02 | AI Disclaimer on Every Response | MISSING (dependent) | Depends on AI endpoints which are all missing | AI disclaimer is appended server-side to AI responses. Since all AI endpoints are missing (FR-AI-01 through FR-AI-07), the disclaimer delivery mechanism has no surface. |
| FR-LEGAL-03 | Data Consent at Registration | MISSING | No consent logging endpoint | **GAP**: SRD section 2.22 defines `POST /api/v1/compliance/consent`. This endpoint is not in the API spec. Consent logging (ToS version, timestamp, marketing opt-in) has no API surface. |

---

### Standalone Requirements

| FR | Feature | Status | Matching API Endpoints | Gap Details |
|----|---------|--------|----------------------|-------------|
| FR-07B | Biometric Authentication | COVERED | Full biometric lifecycle (6 endpoints) | See FR-07B row above. Fully covered. |

---

### Coverage Summary

| Category | Total FRs | COVERED | PARTIAL | MISSING |
|----------|-----------|---------|---------|---------|
| Onboarding (FR-01 to FR-08) | 9 | 7 | 1 | 1 |
| Home Screen (FR-09 to FR-14) | 6 | 6 | 0 | 0 |
| Discover (FR-15 to FR-22) | 8 | 2 | 1 | 5 |
| Stock Detail (FR-23 to FR-29) | 7 | 5 | 1 | 1 |
| Portfolio (FR-30 to FR-35) | 6 | 6 | 0 | 0 |
| Markets (FR-36 to FR-41) | 6 | 4 | 1 | 1 |
| Notifications (FR-42 to FR-47) | 6 | 1 | 1 | 4 |
| User Account (FR-48 to FR-53) | 6 | 5 | 1 | 0 |
| Age Gate (FR-AGE-01 to 04) | 4 | 0 | 3 | 1 |
| Paper Trading (FR-PT-01 to 06) | 6 | 5 | 0 | 1 |
| Gamification (FR-GAME-01 to 07) | 7 | 0 | 3 | 4 |
| AI P0 (FR-AI-01 to 03) | 3 | 0 | 0 | 3 |
| AI P1 (FR-AI-04 to 07) | 4 | 0 | 0 | 4 |
| Education (FR-EDU-01) | 1 | 0 | 0 | 1 |
| Social (FR-SOC-01 to 05) | 5 | 2 | 2 | 1 |
| Language (FR-LANG-01 to 02) | 2 | 1 | 1 | 0 |
| Legal (FR-LEGAL-01 to 03) | 3 | 1 | 0 | 2 |
| **TOTAL** | **89** | **45 (51%)** | **15 (17%)** | **29 (33%)** |

---

## Section 2: Missing APIs (26 Gaps)

Each gap below identifies the FRD/SRD requirement, the needed endpoint, a suggested path/method, and priority.

---

### Gap 1: Discover Feed Endpoint

- **FRD Requirement:** FR-15, FR-17, FR-18, FR-19 (Discover feed with market/theme filters and pagination)
- **SRD Reference:** Section 2.7 -- Discover Feed Load Flow
- **What Is Needed:** Paginated endpoint returning curated stock cards with editorial content, social proof, price data, and watchlist state
- **Suggested Endpoint:** `GET /api/v1/discover?market={VN|KR|GLOBAL}&theme={all|ai|kpop|...}&page={n}&page_size=10`
- **Priority:** **P0** -- Launch blocker. Discover is the primary acquisition channel (BO-04: >=40% acquisition).

---

### Gap 2: Editorial CMS Content API

- **FRD Requirement:** FR-16, FR-22 (editorial hooks, theme badges, CMS management)
- **SRD Reference:** Section 2.7 -- editorial stock cards fetched from CMS
- **What Is Needed:** Endpoint to fetch editorial content per stock (hook text, theme badge). Admin endpoint to manage CMS content.
- **Suggested Endpoint:** `GET /api/v1/editorial/stocks?market={VN|KR}&theme={theme}` and admin `POST /api/v1/admin/editorial/stocks`
- **Priority:** **P0** -- Discover feed depends on editorial content.

---

### Gap 3: Price Alert CRUD

- **FRD Requirement:** FR-28, FR-43 (set alert, trigger notification)
- **SRD Reference:** Section 2.6 -- Price Alert Evaluation Flow; Section 5.6 -- Alert Endpoints
- **What Is Needed:** Create, read, delete price alerts per user per stock
- **Suggested Endpoints:** `POST /api/v1/alerts`, `GET /api/v1/alerts`, `DELETE /api/v1/alerts/{alertId}`
- **Priority:** **P0** -- Core engagement feature; traces to BO-03 (watchlist adoption).

---

### Gap 4: Analyst Sentiment Endpoint

- **FRD Requirement:** FR-26 (Buy/Hold/Sell percentage bar on Stock Detail)
- **SRD Reference:** Section 5.2 -- stock detail response includes analyst_sentiment object
- **What Is Needed:** Analyst consensus data per stock with Buy/Hold/Sell percentages
- **Suggested Endpoint:** Include in `GET /api/v1/market/symbol/{symbol}/quote` response or create dedicated `GET /api/v1/market/symbol/{symbol}/sentiment`
- **Priority:** **P1** -- FR-26 is P1. Can be added to existing quote response.

---

### Gap 5: KR Market Data Endpoints

- **FRD Requirement:** FR-38 (KOSPI/KOSDAQ data)
- **SRD Reference:** BR-09 -- KR data from web search/model knowledge with delay disclaimer
- **What Is Needed:** Korea market index data and top movers. Even if delayed, needs API surface.
- **Suggested Endpoints:** `GET /api/v1/market/kr/indices`, `GET /api/v1/market/kr/movers`
- **Priority:** **P0** -- VN/KR are the two lead markets. Korean users need market data.

---

### Gap 6: Global Market Index Endpoints

- **FRD Requirement:** FR-39 (S&P 500, Nasdaq, Dow, FTSE, Nikkei, DAX)
- **SRD Reference:** BR-09 -- Global data from web search/model knowledge
- **What Is Needed:** Global index summary data with delay disclaimer
- **Suggested Endpoint:** `GET /api/v1/market/global/indices`
- **Priority:** **P1** -- FR-39 is P1. Global users need index overview.

---

### Gap 7: Push Token Registration (Paave-native)

- **FRD Requirement:** FR-42 (push notification permission and token registration)
- **SRD Reference:** Section 2.6 -- push token fetched from DB for alert delivery
- **What Is Needed:** Register/deregister push tokens per device per user
- **Suggested Endpoints:** `POST /api/v1/notifications/push-token`, `DELETE /api/v1/notifications/push-token`
- **Priority:** **P0** -- All push notifications depend on token registration.

---

### Gap 8: Notification Preference Toggles (Extended)

- **FRD Requirement:** FR-44, FR-45, FR-46, FR-52 (market open/close, watchlist movement, portfolio health, coaching toggles)
- **SRD Reference:** Multiple notification types referenced
- **What Is Needed:** Extend notification preferences to include types: MARKET_OPEN, MARKET_CLOSE, WATCHLIST_MOVEMENT, PORTFOLIO_HEALTH, BEHAVIORAL_COACHING
- **Suggested Endpoint:** Extend existing `PATCH /api/v1/insights/settings/notification-preferences` with additional type enums
- **Priority:** **P0** (for MARKET_OPEN/CLOSE, WATCHLIST_MOVEMENT) / **P1** (for AI-related toggles)

---

### Gap 9: Portfolio Reset Endpoint

- **FRD Requirement:** FR-PT-05 (reset virtual portfolio to 500M VND)
- **SRD Reference:** Section 2.12 -- Portfolio Reset Flow
- **What Is Needed:** Endpoint to reset virtual portfolio, close positions, restore balance
- **Suggested Endpoint:** `POST /api/v1/virtual/equity/accounts/reset`
- **Priority:** **P1** -- FR-PT-05 is P1.

---

### Gap 10: XP System Endpoints

- **FRD Requirement:** FR-GAME-01 (XP events and total XP)
- **SRD Reference:** Section 2.13 -- Gamification XP and Trader Score Flow
- **What Is Needed:** Retrieve XP total, XP history, XP event log
- **Suggested Endpoints:** `GET /api/v1/gamification/xp`, `GET /api/v1/gamification/xp/history`
- **Priority:** **P1** -- Gamification is P1.

---

### Gap 11: Trader Tier/Score Detail Endpoint

- **FRD Requirement:** FR-GAME-02, FR-GAME-03 (tier badge, weekly score breakdown)
- **SRD Reference:** Section 2.13 -- Trader Score computation
- **What Is Needed:** Current tier, cumulative score, weekly score breakdown, score history
- **Suggested Endpoint:** `GET /api/v1/gamification/trader-score`, `GET /api/v1/gamification/trader-score/history`
- **Priority:** **P1**

---

### Gap 12: Weekly Challenge Endpoints

- **FRD Requirement:** FR-GAME-04 (weekly challenge card, timer, completion)
- **SRD Reference:** Section 2.13 part 3 -- Challenge evaluation
- **What Is Needed:** Active challenge retrieval, progress tracking, completion status
- **Suggested Endpoints:** `GET /api/v1/gamification/challenges/active`, `GET /api/v1/gamification/challenges/history`
- **Priority:** **P1** -- Note: Virtual contests (87 endpoints) may partially serve this if adapted.

---

### Gap 13: Learning Streak Endpoints

- **FRD Requirement:** FR-GAME-05 (streak counter, streak freeze)
- **What Is Needed:** Streak status, streak freeze activation, streak history
- **Suggested Endpoints:** `GET /api/v1/gamification/streaks`, `POST /api/v1/gamification/streaks/freeze`
- **Priority:** **P1**

---

### Gap 14: Milestone/Achievement Endpoints

- **FRD Requirement:** FR-GAME-06 (milestone celebrations, achievement cards)
- **SRD Reference:** Section 2.25 -- Milestone Celebration Flow
- **What Is Needed:** Milestone log retrieval, achievement card URLs, milestone status check
- **Suggested Endpoints:** `GET /api/v1/gamification/milestones`, `GET /api/v1/gamification/milestones/{milestoneId}/card`
- **Priority:** **P1**

---

### Gap 15: Portfolio Goal Endpoints

- **FRD Requirement:** FR-GAME-07 (goal setting, progress tracking)
- **What Is Needed:** Set goal, get active goal, cancel goal, goal completion check
- **Suggested Endpoints:** `POST /api/v1/gamification/goals`, `GET /api/v1/gamification/goals/active`, `DELETE /api/v1/gamification/goals/{goalId}`
- **Priority:** **P1**

---

### Gap 16: AI Post-Trade Explanation Endpoint

- **FRD Requirement:** FR-AI-01 (post-trade AI card)
- **SRD Reference:** Section 2.15 -- AI Post-Trade Analysis Flow
- **What Is Needed:** Retrieve AI analysis for a completed trade
- **Suggested Endpoint:** `GET /api/v1/ai/post-trade/{orderId}`
- **Priority:** **P0** -- Core AI feature required at launch.

---

### Gap 17: AI Natural Language Query Endpoint

- **FRD Requirement:** FR-AI-02 (chat interface for stock queries)
- **SRD Reference:** Section 2.26 -- AI Natural Language Query Flow
- **What Is Needed:** Submit query, receive AI response with source attribution
- **Suggested Endpoint:** `POST /api/v1/ai/query`
- **Priority:** **P0** -- Core AI feature required at launch.

---

### Gap 18: AI Pre-Trade Card Endpoint

- **FRD Requirement:** FR-AI-04 (pre-trade risk card)
- **SRD Reference:** Section 2.16 -- AI Pre-Trade Analysis Flow
- **What Is Needed:** Get AI pre-trade analysis (risk score, position size, key context)
- **Suggested Endpoint:** `GET /api/v1/ai/pre-trade?ticker={ticker}`
- **Priority:** **P1** -- FR-AI-04 is P1.

---

### Gap 19: AI Portfolio Health Endpoint

- **FRD Requirement:** FR-AI-05 (weekly health check report)
- **SRD Reference:** Section 2.18 -- AI Portfolio Health Flow
- **What Is Needed:** Retrieve latest portfolio health report with dimension grades
- **Suggested Endpoint:** `GET /api/v1/ai/portfolio-health/latest`
- **Priority:** **P1**

---

### Gap 20: AI Learning Path / Micro-Lesson Endpoints

- **FRD Requirement:** FR-AI-06 (contextual micro-lessons, quizzes, spaced repetition)
- **What Is Needed:** Lesson catalog, lesson completion tracking, quiz submission, spaced repetition schedule
- **Suggested Endpoints:** `GET /api/v1/education/lessons`, `POST /api/v1/education/lessons/{lessonId}/complete`, `POST /api/v1/education/lessons/{lessonId}/quiz`
- **Priority:** **P1**

---

### Gap 21: AI Behavioral Coaching Endpoints

- **FRD Requirement:** FR-AI-07 (FOMO, panic, overtrading, concentration nudges)
- **SRD Reference:** Section 2.17 -- AI Behavioral Coaching Flow
- **What Is Needed:** Coaching nudge delivery, feedback rating
- **Suggested Endpoints:** `GET /api/v1/ai/coaching/latest`, `POST /api/v1/ai/coaching/{nudgeId}/feedback`
- **Priority:** **P1**

---

### Gap 22: Financial Glossary / Tooltip Endpoint

- **FRD Requirement:** FR-EDU-01 (inline financial terminology tooltips)
- **What Is Needed:** Financial glossary lookup with localized definitions
- **Suggested Endpoint:** `GET /api/v1/glossary?language={vi|ko|en}` (bulk load) or `GET /api/v1/glossary/{term}` (per-term)
- **Priority:** **P0** -- FR-EDU-01 is P0. BR-30 mandates inline tooltips.

---

### Gap 23: Social Proof Aggregation Endpoint

- **FRD Requirement:** FR-SOC-01 (watcher count, sentiment ratio, trending badge)
- **What Is Needed:** Single endpoint returning social proof metrics per stock
- **Suggested Endpoint:** `GET /api/v1/social/proof/{symbol}` returning `{watchers_count, sentiment_ratio_bull, sentiment_ratio_bear, is_trending}`
- **Priority:** **P1** -- FR-SOC-01 is P1. Can be assembled from existing data but a dedicated endpoint improves performance.

---

### Gap 24: Consent Logging Endpoint

- **FRD Requirement:** FR-LEGAL-03 (ToS consent, privacy policy consent, marketing opt-in)
- **SRD Reference:** Section 2.22 -- Consent Logging Flow
- **What Is Needed:** Immutable consent record creation
- **Suggested Endpoint:** `POST /api/v1/compliance/consent`
- **Priority:** **P0** -- Legal compliance requirement. Cannot launch without consent logging.

---

### Gap 25: Age Upgrade Acceptance Endpoint

- **FRD Requirement:** FR-AGE-04 (accept tier upgrade when turning 18)
- **SRD Reference:** Section 2.3 -- login flow triggers `age_upgrade_event`
- **What Is Needed:** Endpoint for user to accept tier upgrade from LEARN_MODE to FULL_ACCESS
- **Suggested Endpoint:** `POST /api/v1/users/me/upgrade-tier`
- **Priority:** **P1** -- FR-AGE-04 is P1.

---

### Gap 26: DOB and Feature Tier in Registration API Schema

- **FRD Requirement:** FR-AGE-01, FR-AGE-03 (DOB collection, tier assignment)
- **SRD Reference:** Section 2.1 -- registration includes date_of_birth
- **What Is Needed:** `POST /api/v1/users` request body must include `date_of_birth` and `nationality` fields. Response must include `feature_tier`.
- **Suggested Action:** Update `POST /api/v1/users` schema to add `date_of_birth` (ISO 8601 date) and `nationality` (enum: VN, KR, OTHER) fields. Response should include `feature_tier`.
- **Priority:** **P0** -- Cannot enforce age gate without DOB in registration.

---

### Gap Summary by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 10 | Launch blockers: Discover feed, Editorial CMS, Price alerts, KR market data, Push tokens, Notification preferences, AI post-trade, AI query, Financial glossary, Consent logging, DOB in registration |
| **P1** | 16 | Post-launch: Analyst sentiment, Global indices, Portfolio reset, XP system, Trader score, Weekly challenges, Streaks, Milestones, Goals, AI pre-trade, AI health, AI learning, AI coaching, Social proof aggregation, Age upgrade, Extended notification toggles |

---

## Section 3: Extra APIs -- Product Opportunities

The API spec contains 455 endpoints. The FRD/SRD account for approximately 150-180 of these through direct mapping. The remaining 275+ endpoints represent existing infrastructure that either supports internal operations or could be leveraged for future product features.

---

### Category 1: NHSV Live Trading (72 Equity + 39 Derivatives = 111 endpoints)

**Endpoints:** `/api/v1/live/nhsv/equity/*` (72) and `/api/v1/live/nhsv/derivatives/*` (39)

**What They Cover:**
- Full brokerage account management (cash balance, margin, stock balance, profit/loss)
- Real equity order lifecycle (place, modify, cancel, history, basket orders)
- Cash/stock transfers, withdrawals, bank integrations
- Derivatives trading (futures/options orders, open positions, margin calls, settlement)
- Loan registration and history
- Rights issues (subscribe, cancel, history)
- Odd-lot trading
- Put-through orders
- Password/PIN management for trading accounts

**V1 Relevance:** **NOT FOR V1.** FRD explicitly states: "Real money trading is not in scope for V1 or V2. All buy/sell actions are simulated." (V2 Scope Notes)

**V2/V3 Assessment:**
- **V3+ Brokerage Integration:** These 111 endpoints represent a complete NHSV brokerage API integration. When Paave adds real trading (V3+), this infrastructure is ready to go. The NHSV integration covers equity orders, derivatives, cash management, and account linking.
- **V2 Account Linking:** The account linking endpoints (`/api/v1/users/me/link-accounts/*`) already support NHSV partner linking. This could be enabled in V2 to let users link their NHSV brokerage accounts for read-only portfolio viewing, even before real trading is enabled.
- **Derivatives (Futures/Options):** 39 endpoints for derivatives trading. This is V3+ material at minimum. Not in scope for V1/V2 which focus on equity markets only.

**Recommendation:** Keep but do not expose in mobile app. These are the foundation for the real-trading revenue model.

---

### Category 2: Virtual Contests (approx. 20 endpoints)

**Endpoints:**
- `GET/POST /api/v1/virtual/contests` -- CRUD for contest events
- `POST /api/v1/virtual/contests/{contestId}/join` -- Join a contest
- `GET /api/v1/virtual/contests/{contestId}/ranking` -- Contest leaderboard
- `GET /api/v1/virtual/contests/{contestId}/ranking-history` -- Historical rankings
- `POST /api/v1/virtual/contests/{contestId}/registrations` -- Register for contest
- `GET /api/v1/virtual/contests/booked` -- Booked contests
- `GET /api/v1/virtual/contests/listed` -- Available contests
- `GET /api/v1/virtual/contests/expired` -- Past contests
- `POST /api/v1/virtual/contests/search` -- Search contests

**Mapping to FRD:**
- **FR-GAME-04 (Weekly Challenges):** Virtual contests could be adapted to serve as weekly challenges. The contest infrastructure supports join, ranking, and completion -- which maps to challenge participation and winner determination.
- **Gap:** Contests are designed as admin-created competitive events, while weekly challenges are lightweight, auto-generated, and universal. The contest system may be over-engineered for simple challenges but could be reused.

**V1 Assessment:** **LEVERAGE FOR V1** with adaptation. The contest ranking endpoints could power the weekly challenge leaderboard. Admin can create weekly contests that auto-rotate. Requires:
1. An admin automation to create weekly challenges as contests every Monday
2. A simplified client-side wrapper that presents contests as "Weekly Challenges"
3. XP award integration when challenge/contest completes

---

### Category 3: News System (11 endpoints)

**Endpoints:**
- `GET /api/v1/news` -- List articles with filters (language, category, symbol, keyword)
- `GET /api/v1/news/filter` -- Filtered news with date range
- `GET /api/v1/news/stock-news` -- Per-stock news
- `GET /api/v1/news/latest-by-symbols` -- News for a watchlist
- `GET /api/v1/news/announcement` -- Regulatory announcements
- `GET /api/v1/news/notices` -- Regulatory notices
- `GET /api/v1/news/{newsId}` -- Single article
- News favorites (3 endpoints): `GET/POST/DELETE /api/v1/news/favorites`

**Mapping to FRD:**
- **FR-22 (Editorial Content Management):** News system is NOT the same as editorial CMS content (stock hooks, theme badges). But news articles per stock could supplement the Discover feed and Stock Detail screens.
- **FR-15-FR-19 (Discover Feed):** The editorial "hook" system is separate from news. However, `GET /api/v1/news/stock-news` could power an "In the News" section within Stock Detail.
- **FR-47 (Notification History):** News favorites could be repurposed for saved content.

**V1 Assessment:** **LEVERAGE FOR V1.** News endpoints can:
1. Power an "In the News" section on Stock Detail (per-ticker news)
2. Provide content for the Discover feed alongside editorial hooks
3. Support market-level news on the Markets tab
4. News favorites serve as a "saved articles" feature (not in FRD but adds value)

---

### Category 4: Fundamentals (8 endpoints)

**Endpoints:**
- `GET /api/v1/fundamentals/business-info` -- Annual financials
- `GET /api/v1/fundamentals/financials` -- Consolidated financial data
- `GET /api/v1/fundamentals/financial-ratio/ranking` -- Top stocks by ratio
- `GET /api/v1/fundamentals/profile` -- Company profile
- `GET /api/v1/fundamentals/shareholders` -- Major shareholders
- `GET /api/v1/fundamentals/insiders` -- Insider transactions
- `GET /api/v1/fundamentals/statements` -- Income statement, balance sheet, cash flow
- `GET /api/v1/fundamentals/stock-sector/company-overview` -- Sector/industry info

**Mapping to FRD:**
- **FR-25 (Key Stats):** Fundamentals endpoints provide P/E, market cap, and other stats needed for the Stock Detail key stats grid.
- **FR-26 (Analyst Sentiment):** Financial ratios and profile data support the Stock Detail screen but analyst consensus is still a gap.

**V1 Assessment:** **LEVERAGE FOR V1.** All 8 endpoints directly support Stock Detail:
1. `fundamentals/profile` -- company info header
2. `fundamentals/financials` -- P/E, market cap, EPS for key stats
3. `fundamentals/financial-ratio/ranking` -- could power a "Compare" feature
4. `fundamentals/shareholders` and `fundamentals/insiders` -- advanced detail tabs (V1 stretch or V2)
5. `fundamentals/statements` -- financial statements (V2 advanced feature)

---

### Category 5: Live Leaderboards and Contests (41 Live Trading endpoints)

**Endpoints:** `/api/v1/live/*`
- Live contests (same structure as virtual: CRUD, join, ranking, history)
- Live leaderboard (investing leaderboard, user ranking, settings)
- Live portfolio P&L (accumulative, daily, following)
- Live statistics (most bought/sold/searched stocks)
- Organization-scoped variants of all above

**Mapping to FRD:**
- **FR-GAME-02/03 (Trader Tiers/Score):** Live leaderboard endpoints (`/api/v1/live/leaderboard/investing`) mirror the virtual leaderboard structure. The leaderboard infrastructure supports both virtual and live contexts.
- **FR-GAME-04 (Weekly Challenges):** Live contests add a real-money competition layer for V3+.

**V1 Assessment:** **V2+ MATERIAL.** Live leaderboards require real brokerage accounts. Virtual leaderboard endpoints under `/api/v1/virtual/leaderboard/*` are the V1 equivalents. The organization-scoped variants support B2B white-label features (V3+).

---

### Category 6: Feature Flags (4 endpoints)

**Endpoints:**
- `GET /api/v1/admin/feature-flags` -- Get flags for current context
- `POST /api/v1/admin/feature-flags` -- Create flag
- `PATCH /api/v1/admin/feature-flags` -- Update flag
- `GET /api/v1/admin/feature-flags/all` -- Get all flags (admin)

**Mapping to FRD:**
- **FR-AGE-03 (Feature Tier Enforcement):** Feature flags could implement LEARN_MODE vs FULL_ACCESS feature gating.
- **FR-SOC-04 (Follow System):** FRD notes Following tab "may be behind a flag" in V2.
- **Gradual Rollout:** Feature flags support progressive rollout of new features (AI system, social features, gamification).

**V1 Assessment:** **LEVERAGE FOR V1.** Feature flags are essential infrastructure for:
1. Age gate enforcement (LEARN_MODE flags)
2. Gradual rollout of P1 features
3. A/B testing of Discover feed algorithms
4. Kill-switches for AI features during outages

---

### Category 7: 2FA and CA Authentication (7 endpoints)

**Endpoints:**
- `POST /api/v1/auth/login/2fa` -- Initiate 2FA login
- `POST /api/v1/auth/login/2fa/verify-otp` -- Complete 2FA login
- `POST /api/v1/auth/ca/register` -- Register CA certificate
- `POST /api/v1/auth/ca/unregister` -- Remove CA certificate
- `PATCH /api/v1/auth/ca/update` -- Update CA certificate
- `POST /api/v1/auth/login/ca` -- Login with CA certificate
- `POST /api/v1/auth/stepup` -- Step-up token for sensitive actions

**Mapping to FRD:**
- **FR-07B (Biometric Auth):** FRD specifies biometric auth only. 2FA and CA are beyond current scope.
- **FR-50 (Change Password):** Step-up token could secure password changes.

**V1 Assessment:** **V2+ MATERIAL.** 2FA is a natural V2 security enhancement. CA authentication is NHSV-specific for brokerage users. Step-up tokens are useful for V3+ real-money operations (withdrawals, transfers).

---

### Category 8: Social Login and Account Linking (8 endpoints)

**Endpoints:**
- `POST /api/v1/auth/login/social` -- Google/Facebook/Apple login
- `POST /api/v1/auth/login/social/organization` -- Org-scoped social login
- `POST /api/v1/users/me/link-accounts/social` -- Link social account
- `DELETE /api/v1/users/me/link-accounts/social/{socialType}` -- Unlink social account
- `POST /api/v1/users/me/password/social` -- Create password for social account
- `POST /api/v1/users/me/password/initial` -- Set initial password

**Mapping to FRD:**
- **FR-05 (Registration):** FRD specifies email/password registration only. Social login is not in V1/V2 scope.

**V1 Assessment:** **V2 MATERIAL.** Social login (Google/Apple) would significantly reduce onboarding friction for Gen Z users. Consider enabling for V2 launch:
1. Google and Apple sign-in reduce registration to 1 tap
2. Facebook sign-in may be less relevant for Gen Z
3. Password creation for social accounts already handled

---

### Category 9: Organization and Partner Management (15+ endpoints)

**Endpoints:**
- `/api/v1/users/organizations` -- Organization listing
- `/api/v1/users/organizations/users` -- Org user listing
- `/api/v1/auth/login/organization` -- Org-scoped login
- `/api/v1/users/me/link-accounts/*` -- 10+ partner account linking endpoints
- `/api/v1/admin/organizations` -- Admin org CRUD
- `/api/v1/admin/partners` -- Admin partner CRUD

**V1 Assessment:** **V3+ B2B MATERIAL.** Organization and partner management supports:
1. White-label deployments for financial institutions
2. NHSV partnership integration
3. Multi-tenant architecture for institutional clients

---

### Category 10: Administration (58 endpoints)

**Endpoints:** `/api/v1/admin/*`
- Client management (OAuth client CRUD)
- Feature flags (discussed above)
- Locale management (i18n key CRUD, namespace management, resource sync)
- FAQ management
- Login method configuration
- Scope and scope-group management (RBAC)
- Organization and partner management
- Database import/export
- System configuration

**V1 Assessment:** **LEVERAGE SELECTIVELY FOR V1.**
- **Locale management** (8 endpoints): Essential for managing trilingual content (FR-LANG-01/02)
- **Feature flags** (4 endpoints): Essential for gradual rollout
- **FAQ management**: Supports FR-53 (Help & Support)
- **Client management**: Internal infrastructure
- **Scope/RBAC**: Internal infrastructure

---

### Category 11: Advanced Market Data (misc endpoints)

**Endpoints not directly mapped to FRD:**
- `GET /api/v1/market/putthrough/*` -- Put-through (negotiated block trade) data (3 endpoints)
- `GET /api/v1/market/symbol/oddlot-latest` -- Odd-lot quotes
- `GET /api/v1/market/symbol/tick-size-match` -- Tick size config
- `GET /api/v1/market/symbol/{symbol}/statistic` -- Intraday buy/sell statistics
- `GET /api/v1/market/symbol/{symbol}/ticks` -- Tick-level data
- `GET /api/v1/market/symbol/{symbol}/right` -- Corporate actions
- `GET /api/v1/market/current-dividend-event` -- Dividend schedule
- `GET /api/v1/market/daily-returns` -- Multi-symbol daily returns
- `GET /api/v1/market/etf/*` -- ETF data (2 endpoints)
- `GET /api/v1/market/ranking/foreigner` -- Foreign investor ranking
- `GET /api/v1/market/top-foreigner-trading` -- Top foreign net trading
- `GET /api/v1/market/symbol/foreigner-summary` -- Foreign position summary
- `GET /api/v1/market/vnindex-return` -- VN-Index cumulative return

**V1 Assessment:** **PARTIALLY LEVERAGE FOR V1.**
- ETF data: Not in FRD scope. V2+ material.
- Foreign investor flow data: Could add value as a "Foreign Flow" widget on Markets tab. V1 stretch.
- Dividend events: Useful for Stock Detail. V1 stretch.
- Put-through/odd-lot: Professional trading features. V3+.
- Daily returns: Useful for portfolio benchmarking (FR-GAME-03 Trader Score). Could leverage for V1.
- VN-Index return: Directly useful for portfolio chart comparison (FR-PT-04). **Leverage for V1.**

---

### Category 12: Virtual Trading Social Features (10+ endpoints)

**Endpoints:**
- `GET /api/v1/virtual/accounts/followers` -- Virtual account followers
- `GET /api/v1/virtual/accounts/following-accounts` -- Following list
- `POST/PATCH/DELETE /api/v1/virtual/accounts/follows/*` -- Follow CRUD
- `GET /api/v1/virtual/equity/accounts/following-*` -- Following P&L views
- `GET /api/v1/virtual/recommended-accounts` -- Recommended accounts
- `GET /api/v1/virtual/search/*` -- Account search, ranking, recent views

**Mapping to FRD:**
- **FR-SOC-04 (Follow System):** Virtual trading has its own follow system separate from the Social module. These could be unified or kept separate.
- **Deferred: Copy Trading:** FRD defers copy trading to V3+. These following-P&L endpoints are the infrastructure for copy trading.

**V1 Assessment:** **V2 MATERIAL.** The virtual account follow/view system is infrastructure for:
1. Copy trading (V3+)
2. "Top Traders" discovery feature
3. Social proof on trader profiles

---

### Opportunity Summary

| Category | Endpoint Count | V1 Leverage | V2 Leverage | V3+ Leverage |
|----------|---------------|-------------|-------------|--------------|
| NHSV Live Trading | 111 | No | Partial (read-only linking) | Full brokerage |
| Virtual Contests | ~20 | Yes (weekly challenges) | Full contests | -- |
| News System | 11 | Yes (stock news, market news) | Full news feature | -- |
| Fundamentals | 8 | Yes (key stats, profile) | Advanced financials | -- |
| Live Leaderboards | 41 | No | Partial | Full |
| Feature Flags | 4 | Yes (age gate, rollout) | Yes | Yes |
| 2FA / CA Auth | 7 | No | 2FA | CA auth |
| Social Login | 8 | No | Yes (Google/Apple) | -- |
| Org/Partner Mgmt | 15+ | No | No | B2B white-label |
| Administration | 58 | Partial (locale, flags, FAQ) | More admin tools | Full |
| Advanced Market | ~15 | Partial (VN-Index return, dividends) | Foreign flow, ETF | Full |
| Virtual Social | 10+ | No | Copy trading prep | Copy trading |

---

## Key Findings

1. **51% of FRD requirements are fully covered** by the existing API spec. The strongest coverage is in authentication, home screen, portfolio tracking, and core market data.

2. **33% of FRD requirements are missing** from the API spec. The largest gaps are in the AI system (7 endpoints needed), Gamification (7 endpoints needed), and Discover feed (2 endpoints needed).

3. **10 gaps are P0 launch blockers** that must be resolved before V1 release: Discover feed, Editorial CMS, Price alerts, KR market data, Push tokens, AI post-trade, AI query, Financial glossary, Consent logging, and DOB in registration schema.

4. **The API spec is over-indexed on brokerage infrastructure** (NHSV: 111 endpoints) and **under-indexed on consumer engagement features** (AI: 0 endpoints, Gamification: 0 endpoints). This reflects the API's heritage as a trading platform API being adapted for an educational fintech app.

5. **Significant reuse opportunity exists** for V1 in the News system (11 endpoints), Fundamentals (8 endpoints), Feature Flags (4 endpoints), and Virtual Contests (~20 endpoints that could power weekly challenges).

---

*End of audit report.*

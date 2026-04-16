# Product Roadmap — Opportunities Beyond V1 FRD

**Last Updated:** 2026-04-16
**Source:** API Audit + Market Research

---

## Already-Built APIs That Can Be Leveraged

These exist in the API spec (v1.5.1) but are NOT in the current FRD scope. They represent low-effort product wins.

### HIGH VALUE — Leverage for V1

| Opportunity | Existing API Endpoints | Product Fit | Effort |
|------------|----------------------|-------------|--------|
| **Virtual Contests → Weekly Challenges** | `GET/POST /virtual/contests`, join, ranking, history (20 endpoints) | Maps directly to FR-GAME-04 weekly challenges. Contest infrastructure already built — adapt for weekly challenge format. | Low — wrapper + UI |
| **News Feed → Discover Content** | `GET /news`, `/news/stock-news`, `/news/filter`, `/news/favorites` (11 endpoints) | Stock news enriches Discover feed (FR-15) and Stock Detail. Favorites = saved articles. | Low — integrate existing |
| **Fundamentals → Stock Detail Stats** | `GET /fundamentals/financials`, `/fundamentals/profile`, `/fundamentals/shareholders` (8 endpoints) | Fills FR-25 Key Stats (P/E, market cap, EPS). Already has financial ratios and company profiles. | Low — direct mapping |
| **Feature Flags → Age Gate + Rollout** | `GET/POST/PATCH /admin/feature-flags` (4 endpoints) | Enable LEARN_MODE/FULL_ACCESS toggle per user. Gradual rollout for new features. | Low — config only |
| **Search Stats → Trending Algorithm** | `GET /insights/search-stats/top` | Feed into "Trending on Paave" algorithm (FR-11). Already tracks search volume. | Low — data integration |

### MEDIUM VALUE — Leverage for V1.1

| Opportunity | Existing API Endpoints | Product Fit | Effort |
|------------|----------------------|-------------|--------|
| **Social Login** | `POST /auth/login/social`, `/auth/login/social/organization` (2 endpoints) | FR-07C Social Login (Google/Apple). API exists — build UI + DOB/consent flow. | Medium — UI + flow |
| **2FA** | `POST /auth/login/2fa`, `/auth/login/2fa/verify-otp`, `/auth/stepup` (3 endpoints) | FR-07D Two-Factor Auth. API infrastructure exists — build settings UI + OTP flow. | Medium — UI + settings |
| **Virtual Leaderboard** | `GET /virtual/leaderboard/investing`, `/user-ranking` (4 endpoints) | Maps to Trader Tier leaderboard. Ranking infrastructure built. | Medium — adapt scoring |
| **Account Linking** | `POST /users/me/link-accounts`, `/link-accounts/social` (8 endpoints) | Enable multi-account linking (social + email). Already has approval flow. | Medium — UI integration |
| **News Favorites** | `POST/DELETE/GET /news/favorites` (3 endpoints) | "Save article" feature in Discover. Already built. | Low — add UI |

---

## V2 — Web Trading System (WTS) Opportunities

| Opportunity | Notes |
|------------|-------|
| **KR Real-Time Market Data** | Replace web search with KRX feed integration. Requires data vendor contract. |
| **Full Social Feed (Threads-style)** | Currently per-ticker only. V2 adds full following feed, reposts, threaded discussions. |
| **Portfolio Sharing (4-tier privacy)** | Share portfolio card with % returns (never absolute amounts). Zalo/KakaoTalk/Instagram. |
| **Copy Trading ("Follow Portfolio")** | Follow another trader's paper portfolio. Already has follow infrastructure. |
| **Morning Call AI Briefing** | Daily market summary personalized to user's watchlist + portfolio. |
| **Market Sentiment AI (NLP)** | Aggregate sentiment from VN/KR news sources. Feed into Discover ranking. |
| **TradingView Chart Integration** | Replace native candlestick with TradingView widget for advanced charting. |
| **Brokerage Account Linking** | Connect to SSI, MBS, NHSV for real portfolio tracking (read-only). |
| **iOS/Android Home Screen Widgets** | Portfolio value widget. High-impact, low-complexity for D7 retention. |

---

## V3 — Desktop Trading System (DTS) + NHSV Integration

| Opportunity | Existing API Endpoints | Notes |
|------------|----------------------|-------|
| **Live Equity Trading** | 72 NHSV equity endpoints (orders, portfolio, transfers, settlements) | Full brokerage integration via NHSV. Requires securities license compliance. |
| **Derivatives Trading** | 39 NHSV derivatives endpoints (futures, options, margin) | Advanced trading for experienced users. |
| **CA Certificate Auth** | `POST /auth/ca/register`, `/auth/login/ca` (4 endpoints) | Enterprise/institutional authentication via digital certificates. |
| **Organization/B2B** | `POST /users/organizations`, `/auth/login/organization` (5 endpoints) | B2B product: university finance clubs, corporate training programs. |
| **Basket Orders** | `POST /live/nhsv/equity/basket-orders` (8 endpoints) | Multi-stock order execution. Power-user feature for desktop. |
| **Rights/Dividends** | `GET /live/nhsv/equity/rights/*` (5 endpoints) | Corporate action participation. |
| **Cash/Stock Transfers** | `POST /live/nhsv/equity/transfer/*` (7 endpoints) | Inter-account transfers. |
| **Margin/Loan** | `GET /live/nhsv/equity/loan/*` (5 endpoints) | Margin trading, loan management. |
| **Multi-Monitor** | N/A | Desktop DTS feature: multiple chart windows, multi-portfolio view. |

---

## Not Planned — Explicitly Out of Scope

| Item | Reason |
|------|--------|
| Direct crypto trading/wallets | Regulatory complexity. Crypto-proxy equities ARE in scope. |
| Multi-language beyond VN/KR/EN | V3+ if expansion to JP/TH markets. |
| In-app tax reporting | Complex, jurisdiction-specific. Out of product focus. |
| Real money transactions in V1/V2 | No brokerage license in V1. V3 via NHSV partnership. |

---

*Review this roadmap quarterly. Update priorities based on user feedback and market data.*

# BRD — Business Requirements Document
## Paave — Gen Z Fintech Investing App

**Document version:** 2.0
**Date:** 2026-04-14
**Author:** Business Analysis Team
**Status:** Approved for Development
**Supersedes:** BRD v1.0 (2026-04-14)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Business Objectives](#3-business-objectives)
4. [KPIs](#4-kpis)
5. [Scope Definition](#5-scope-definition)
6. [Business Rules](#6-business-rules)
7. [Assumptions](#7-assumptions)
8. [Constraints](#8-constraints)
9. [Stakeholders](#9-stakeholders)
10. [Risk Register](#10-risk-register)
11. [Traceability Overview](#11-traceability-overview)
12. [Next Steps](#12-next-steps)
13. [Approval & Sign-Off](#13-approval--sign-off)

---

## 1. Executive Summary

Paave is a Gen Z-native fintech investing app for Vietnamese and Korean users. It combines real-time market data, AI-powered education, paper trading (virtual money simulation), gamified learning, and social proof features into a single mobile experience — all without executing real trades.

**Platform Roadmap:**
- **V1 — MTS (Mobile Trading System):** iOS + Android. All requirements in this BRD apply to V1/MTS unless explicitly noted otherwise.
- **V2 — WTS (Web Trading System):** Browser-based application.
- **V3 — DTS (Desktop Trading System):** Native desktop application.

**Core Product Pillars (V1):**
1. Real-time market data — VN (HOSE/HNX), KR (model knowledge + web search in V1)
2. Paper trading — full simulated trading with virtual funds (VND 500,000,000 starting balance)
3. Gamified learning — "Learn & Play" mini-app with Trader Tiers, XP, and challenges
4. AI education layer — post-trade explanations, natural language queries, behavioral coaching
5. Social proof — community sentiment, per-ticker feeds, follow system
6. Multilingual — Vietnamese, Korean, English with culturally adapted financial terminology

Paave is NOT a licensed securities company. It does NOT execute real buy/sell orders. All trading activity in V1 is simulated with virtual funds.

---

## 2. Problem Statement

### 2.1 Current Situation

Gen Z investors (age 16–27) in Vietnam and Korea face compounding barriers when attempting to engage with stock market investing:

**Market Data & Discovery Gap:**
- Vietnamese retail investors have no mobile-native app that surfaces real-time HOSE/HNX data in a Gen Z-friendly UX.
- Korean Gen Z investors lack a consolidated mobile tool that aggregates KRX data with editorial context (trend explanations, thematic groupings).
- Existing investment apps (SSI, MBS, Mirae Asset) are designed for experienced traders, with dense UI and no onboarding for first-time investors (F0 segment).
- No app in Vietnam or Korea provides a curated "discovery" layer — users must independently research which stocks are trending, why, and what peers are watching.

**Education Gap:**
- There is no safe environment for young investors to practice trading before committing real money.
- Financial education content in Vietnam and Korea is either too academic (textbook-style) or dangerously speculative (Telegram/Facebook KOL groups pushing unverified tips).
- First-time investors cannot learn from their mistakes when mistakes cost real money — paper trading removes this barrier entirely.
- No app contextualizes trade outcomes with educational explanations, leaving users unable to understand why their portfolio performed the way it did.

**Social Layer Gap:**
- FOMO-driven behavior is not channeled into safe, moderated research tools — users turn to unverified Telegram/Facebook/Zalo/KakaoTalk groups for stock tips.
- Vietnamese KOL culture on Facebook and Zalo propagates investment "recommendations" with no accountability or accuracy tracking.
- There is no social platform where users can share paper trading performance transparently, compare strategies, or follow verified expert investors — without exposing exact capital amounts.

**Gamification Gap:**
- No app makes investing education intrinsically motivating for Gen Z. Learning about P/E ratios, RSI, and diversification is necessary but inherently dry without game mechanics.
- Young users (16–17) in particular have no legal pathway to practice market participation — the absence of a compliant paper trading product leaves this segment entirely unserved.

### 2.2 Core Problem

**There is no mobile-first, Gen Z-native app that combines real-time market data, safe paper trading, gamified education, AI-powered learning, and community features for young retail investors in Vietnam and Korea — while remaining fully compliant with Vietnamese and Korean financial and data protection regulations.**

### 2.3 Impact

- F0 investors (first-time) cannot make informed decisions without guidance or a safe practice environment.
- Users aged 16–17 have no legal, structured pathway to learn investing — they either do nothing or engage with unregulated content.
- FOMO-driven behavior is not channeled into safe research tools.
- Young investors delay market participation due to intimidation from existing tools.
- The absence of social accountability for stock "tips" allows misinformation to thrive in informal channels (Zalo, Facebook, KakaoTalk).

---

## 3. Business Objectives

| # | Objective | Measurable Target | Timeline |
|---|-----------|-------------------|----------|
| BO-01 | Acquire active users in Vietnam and Korea | 50,000 Monthly Active Users (MAU) within 6 months of launch | Month 6 |
| BO-02 | Retain users through daily utility | Day-7 retention rate ≥ 35% | Month 3 |
| BO-03 | Drive watchlist engagement | ≥ 60% of registered users create at least 1 watchlist entry within first session | Month 1 |
| BO-04 | Validate Discover as primary acquisition channel | ≥ 40% of new users cite Discover/Trending as primary engagement surface (in-app survey) | Month 3 |
| BO-05 | Establish Vietnam as lead market | ≥ 70% of V1 MAU from Vietnam | Month 6 |
| BO-06 | Achieve VN market data reliability | VN real-time data (HOSE/HNX) with ≤ 15-second delay from exchange feed | Launch day |
| BO-07 | Reduce F0 onboarding drop-off | Onboarding completion rate ≥ 75% (user reaches Home screen after starting onboarding) | Month 1 |
| BO-08 | Drive paper trading adoption as core engagement loop | ≥ 50% of registered users execute at least 1 paper trade within first 3 sessions | Month 2 |
| BO-09 | Drive gamification engagement | ≥ 40% of paper trading users achieve at least Tier 2 (Người học / 입문자) within 30 days | Month 3 |
| BO-10 | Validate AI education layer | ≥ 65% of users who see a post-trade AI card tap to read the full explanation (not dismiss) | Month 2 |
| BO-11 | Drive social proof engagement | ≥ 35% of active sessions include an interaction with the social/community feed on a stock detail page | Month 3 |
| BO-12 | Serve the 16–17 age segment compliantly | ≥ 10% of registered users are age 16–17 in Learn Mode; zero compliance violations related to minors | Month 6 |

---

## 4. KPIs

### 4.1 Core Engagement KPIs

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| MAU | Unique users who open the app at least once in 30 days | 50,000 by month 6 | Firebase / Mixpanel |
| DAU/MAU ratio | Daily engagement stickiness | ≥ 25% | App analytics |
| D7 Retention | % of users who return on day 7 after install | ≥ 35% | Cohort analysis |
| Onboarding completion rate | % of users completing all onboarding steps and reaching Home | ≥ 75% | Funnel analytics |
| Watchlist adoption | % of registered users with ≥ 1 watchlist item | ≥ 60% by end of first session | Backend event tracking |
| Discover engagement rate | % of active sessions where user interacts with Discover feed | ≥ 50% | In-app event tracking |
| VN data latency | Time delta between HOSE/HNX exchange tick and in-app display | ≤ 15 seconds | Server-side monitoring |
| App crash rate | % of sessions ending in crash | ≤ 0.5% | Crashlytics |
| Notification opt-in rate | % of users who enable at least 1 push notification | ≥ 45% | Push permission analytics |

### 4.2 Paper Trading KPIs

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| Paper trade activation rate | % of users who execute ≥ 1 paper trade | ≥ 50% within 3 sessions | Backend event tracking |
| Paper trades per active user per week | Avg. number of simulated orders placed | ≥ 3 trades/user/week | Backend aggregation |
| Paper portfolio reset rate | % of users who reset their portfolio | ≤ 30% within first 30 days (excess resets suggest UX confusion) | Event tracking |
| Order fill latency | Time between user submitting paper order and fill confirmation | ≤ 5 seconds at next price snapshot | Server-side monitoring |
| Paper trading session depth | % of paper trading sessions with ≥ 3 screens viewed (order → confirm → portfolio) | ≥ 70% | Funnel analytics |

### 4.3 Gamification KPIs

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| Trader Score distribution | % of active users at each Tier | Tier 1: ≤ 40%, Tier 2+: ≥ 60% by month 3 | Backend aggregation |
| Weekly challenge completion rate | % of active users who complete the weekly challenge | ≥ 30% | Challenge system event tracking |
| Learning streak rate | % of active users maintaining a ≥ 3-day learning streak | ≥ 25% | Streak system backend |
| XP earned per active user per week | Avg. XP accumulated | ≥ 200 XP/user/week | Backend aggregation |
| Micro-lesson completion rate | % of contextual micro-lessons served that are completed (not skipped) | ≥ 55% | Content event tracking |

### 4.4 AI Engagement KPIs

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| Post-trade AI card read-through | % of users who tap to expand (not dismiss) the post-trade AI card | ≥ 65% | Tap event tracking |
| AI query volume | Avg. number of natural language queries per active user per week | ≥ 1.5 queries/user/week | NLP query log |
| AI query satisfaction | % of AI responses rated positively (thumbs up) | ≥ 70% | In-app feedback widget |
| AI disclaimer display compliance | % of AI responses that include the mandatory educational disclaimer | 100% | Automated compliance check |
| Behavioral coaching nudge engagement | % of nudges that are tapped (not dismissed) | ≥ 20% | Toast notification event tracking |

### 4.5 Social KPIs

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| Community feed engagement | % of stock detail page sessions that include a community feed interaction | ≥ 35% | Event tracking |
| Follow system adoption | % of active users who follow ≥ 1 other user | ≥ 20% by month 3 | Backend aggregation |
| Post submission rate | % of active users who submit ≥ 1 community post per month | ≥ 15% | Backend event tracking |
| Sentiment tag usage | % of posts that include a Bull/Bear/Neutral tag | ≥ 80% | Backend aggregation |
| Cashtag click-through rate | % of posts with cashtags where at least 1 cashtag is tapped | ≥ 40% | Event tracking |

---

## 5. Scope Definition

### 5.1 V1 In Scope (MTS — Mobile Trading System)

#### 5.1.1 User Registration & Age Gating

| Feature | Description |
|---|---|
| Date-of-birth collection | Registration requires DOB (day/month/year picker). Checkbox-only age confirmation is NOT acceptable. |
| Age gate: Under 16 | User under 16 is blocked at registration. A parental consent flow is displayed (see Business Rules BR-AGE-03). |
| Age gate: 16–17 (Learn Mode) | User aged 16–17 is routed to Learn Mode. Paper trading, gamification, market data, and education only. No real portfolio tracking. Real-portfolio features are hidden, not just disabled. |
| Age gate: 18+ (Full Access) | User aged 18+ has access to all V1 features including real portfolio tracking. |
| KYC (lightweight) | Name, email, nationality, date of birth. No identity document verification in V1. |
| Market preference | VN, KR, or both. Stored on user profile. |

#### 5.1.2 Onboarding

| Feature | Description |
|---|---|
| Nationality detection | Auto-detect via device locale; user can override. |
| Market preference selection | User selects VN, KR, or both. |
| Age-appropriate onboarding path | 16–17 users see Learn Mode onboarding; 18+ users see full onboarding. |
| Language selection | User selects preferred language (vi / ko / en). Default: device language setting. |

#### 5.1.3 Home Screen

| Feature | Description |
|---|---|
| Portfolio hero widget | 18+ only: total paper portfolio value, unrealized P&L. Hidden for 16–17. |
| Market snapshot | VN-Index and KOSPI index values with change % and direction arrow. |
| Trending stocks section | Top 5 trending stocks by volume/social activity. |
| Personalized watchlist | User's followed stocks with real-time price data. |

#### 5.1.4 Discover / Trending Feed

| Feature | Description |
|---|---|
| Curated stock cards | Each card shows: ticker, price, % change, volume, editorial "why it's hot" hook (1–2 lines). |
| Social proof counter | "X users watching" per stock card. |
| Sentiment badge | Bull / Bear / Neutral aggregate sentiment per stock. |
| Trending label | "Trending in VN" or "Trending in KR" badge on eligible cards. |
| Theme filters | AI, K-pop, Vietnam Growth, Energy, Tech, etc. User-selectable. |

#### 5.1.5 Paper Trading (Core Feature — "Learn & Play" Mini-App)

| Feature | Description |
|---|---|
| Virtual starting balance | VND 500,000,000 per portfolio. Displayed as "Tiền ảo / 가상 자금 / Virtual Funds" at all times. |
| Supported markets | VN: HOSE + HNX stocks. KR: KOSPI + KOSDAQ stocks (V1: model knowledge + web search; real-time feed in V2). |
| Order types | Market orders and limit orders. |
| Order fill mechanics | Simulated orders filled at next available real-time price snapshot (≤ 15s delay for VN; best-available for KR in V1). |
| Portfolio reset | User can reset their paper portfolio to VND 500,000,000 starting balance at any time. Reset is logged and impacts Trader Score history (resets score streak but not XP). |
| Portfolio view | Holdings table: ticker, quantity, avg. buy price, current price, unrealized P&L %. |
| Transaction history | Full list of paper trades with timestamp, order type, fill price, and outcome. |
| Virtual funds label | Paper trading mode always displays a persistent banner: see BR-DISC-03. |
| No real transactions | System must never route paper orders to a real brokerage. All order processing is internal simulation. |

#### 5.1.6 Gamification — Trader Tier System

| Feature | Description |
|---|---|
| Trader Score formula | Return (40%) + Consistency (30%) + Risk Discipline (20%) + Activity (10%). Score range: 0–1000. |
| Trader Tiers (VN) | Tier 1: Mầm non, Tier 2: Người học, Tier 3: Nhà đầu tư, Tier 4: Trader, Tier 5: Chuyên gia, Tier 6: Huyền thoại |
| Trader Tiers (KR) | Tier 1: 새싹, Tier 2: 입문자, Tier 3: 투자자, Tier 4: 트레이더, Tier 5: 전문가, Tier 6: 레전드 |
| Trader Tiers (EN) | Tier 1: Seedling, Tier 2: Learner, Tier 3: Investor, Tier 4: Trader, Tier 5: Expert, Tier 6: Legend |
| XP system | XP earned for: completing a paper trade, completing a micro-lesson, completing a challenge, maintaining a streak, reaching a new Trader Tier. |
| Weekly challenges | New challenge issued every Monday at 00:00 UTC+7. Challenge examples: "Make 3 limit orders this week", "Research 5 stocks using the AI query". |
| Learning streaks | Daily streak counter for completing ≥ 1 micro-lesson per day. Streak broken if no lesson completed by 23:59 UTC+7. |
| Tier badge display | Trader Tier badge displayed on user profile and on all community posts. |

#### 5.1.7 Stock Detail Page

| Feature | Description |
|---|---|
| Price chart | Candlestick or line chart. Time ranges: 1D, 1W, 1M, 3M, 1Y. |
| Key stats | P/E, EPS, volume, 52-week high/low, market cap, dividend yield. |
| Analyst sentiment summary | Bull/Bear/Neutral aggregate. |
| Add to Watchlist | One-tap action. |
| Price alert | User sets threshold (% or absolute value); triggers push notification. |
| Community feed tab | Per-ticker social feed (see Social Features). |
| Paper trade action | "Buy" and "Sell" buttons launch paper trading order form for this ticker. |
| Social proof | "X users watching" counter, Trending badge if applicable. |

#### 5.1.8 Markets Module

| Feature | Description |
|---|---|
| VN market data | Real-time HOSE + HNX data with ≤ 15-second delay. Includes: index values, top gainers/losers, sector performance. |
| KR market data (V1) | KOSPI + KOSDAQ data via web search integration and model knowledge. No real-time feed SLA in V1. |
| Global overview | Major indices (S&P 500, NASDAQ, Nikkei) via web search. |

#### 5.1.9 Social Features — Phase 1 (V1)

| Feature | Description |
|---|---|
| Social proof on stock cards | "X users watching" counter, sentiment badge (Bull/Bear/Neutral), Trending label. |
| Per-ticker community feed | Tab on every stock detail page. Shows posts tagged with that ticker's cashtag. |
| Cashtag auto-linking | $TICKER strings in posts auto-link to the corresponding stock detail page. |
| Follow system | Users can follow other traders. Follower/following counts visible on profile. Followed user's activity visible in (future) social feed. |
| Bull/Bear/Neutral sentiment tags | Every post must be tagged with one sentiment tag. Tag is required before submission. |
| 60-second submission delay | All posts enter a 60-second review buffer before appearing publicly. System auto-flags content matching moderation keyword list. |
| Trader Score on posts | Poster's current Trader Tier badge is always displayed alongside their post. |
| Post character limit | 280 characters per post. No inline images in V1. |

#### 5.1.10 AI System — P0 Features (V1 Launch)

| Feature | Description |
|---|---|
| Post-trade AI explanation | After every simulated trade is confirmed, AI generates a 3-part card: (1) What happened — price movement summary; (2) Why — top 3 causal factors from news/fundamentals; (3) What to watch — 2 forward-looking signals. Language matches user's language setting. Always appends AI disclaimer (BR-DISC-02). |
| Natural language stock queries | Conversational AI for stock questions in VN/KR/EN. Examples: "Why is FPT dropping today?", "What does P/E mean for this stock?". RAG architecture grounded in VN/KR financial data. Every response appends AI disclaimer. |
| Multilingual AI layer | VN: PhoBERT fine-tuned on CafeF/VnExpress + GPT-4o/Claude. KR: KoELECTRA + GPT-4o/Claude. EN: GPT-4o/Claude. Language detection via FastText. |
| AI output language | AI output language always matches the user's current language setting. Language change takes effect immediately without requiring app restart. |

#### 5.1.11 AI System — P1 Features (V1.x, Post-Launch)

| Feature | Description |
|---|---|
| Pre-trade AI analysis | Before confirming a simulated trade, a collapsible AI card shows: risk score 1–10, suggested position size (% of virtual portfolio), and "3 things to know" about the stock. User can proceed without reading. |
| Portfolio AI health check | Weekly "Portfolio Report Card" — letter grade (A–F) per dimension: diversification, concentration, volatility, geographic exposure, liquidity. Radar chart visual. Conversational follow-up available. |
| Personalized learning paths | AI detects knowledge gaps from trade behavior, quiz scores, and queries asked. Serves 90-second contextual micro-lessons. Spaced repetition: 7-day and 30-day review cycles. |
| Behavioral coaching AI | Detects: FOMO buying (rapid buy after large price spike), panic selling (sell immediately after loss), overtrading (>10 trades/day), concentration creep (>40% in single stock), echo chamber behavior (only following same-tier users). Delivers non-judgmental, peer-tone nudges via in-app toast notifications. Nudges are dismissible. |

#### 5.1.12 Notifications

| Feature | Description |
|---|---|
| Price alerts | User-defined threshold (% or absolute). Push notification on trigger. |
| Market open/close | VN and KR market session open/close notifications. User opt-in required. |
| Watchlist movement alerts | Configurable % threshold for watched stocks. |
| Gamification notifications | New challenge available, tier upgrade, streak at risk (remind at 20:00 local time if streak not yet maintained). |

#### 5.1.13 User Account

| Feature | Description |
|---|---|
| Registration | Email + password. DOB required. Market preference. Language preference. |
| Login | Email/password. Social login (Google, Apple) planned for V1.1. |
| Profile | Avatar, Trader Tier badge, Trader Score, paper portfolio summary (% return only — no VND/KRW absolute amounts shown publicly). |
| Language switcher | Available in settings. All three languages available at all times. |
| Notification preferences | Granular controls per notification type. |

### 5.2 V1 Out of Scope (Explicitly Deferred to V2/V3)

| Item | Deferred To | Reason |
|---|---|---|
| Real buy/sell order execution | N/A (never in scope) | No brokerage license; Paave does not execute real trades |
| KR real-time market data feed | V2 (WTS) | Real-time KRX feed integration deferred to V2 |
| Full social feed (Threads-style) | V2 (WTS) | Phase 2 social roadmap |
| Portfolio sharing (4-tier privacy) | V2 (WTS) | Phase 2 social roadmap |
| Paper copy trading ("Follow Portfolio") | V2 (WTS) | Phase 2 social roadmap |
| Trader leaderboards | V2 (WTS) | Phase 2 social roadmap |
| "Morning Call" feature | V2 (WTS) | Phase 2 social roadmap |
| Shareable portfolio card (9:16, Zalo/KakaoTalk) | V2 (WTS) | Phase 2 social roadmap |
| Market sentiment AI (NLP on VN/KR news) | V2+ | P2 AI feature |
| TradingView chart integration | V2 | V1 uses native candlestick chart |
| Brokerage account linking | V2 | Phase 2 feature |
| Crypto trading or data | Out of roadmap | Out of product focus |
| Multi-language UI beyond VN/KR/EN | Post-launch | Phase 3 |
| In-app portfolio tax reporting | Out of roadmap | Out of scope |
| Web application (WTS) | V2 | Platform roadmap |
| Desktop application (DTS) | V3 | Platform roadmap |

### 5.3 Platform Roadmap

| Version | Platform | Name | Key Additions |
|---|---|---|---|
| V1 | iOS + Android | MTS (Mobile Trading System) | All features in this BRD |
| V2 | Browser | WTS (Web Trading System) | KR real-time data, full social feed, portfolio sharing, copy trading, leaderboards, Morning Call, market sentiment AI |
| V3 | Native desktop | DTS (Desktop Trading System) | Advanced charting, multi-monitor support, power-user features |

---

## 6. Business Rules

### 6.1 Age Gate Rules

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-AGE-01 | Registration requires date of birth (day/month/year) as a mandatory field. A checkbox asserting age is not sufficient. | Registration form cannot be submitted without a valid DOB. DOB field validates day/month/year format. |
| BR-AGE-02 | Users aged 16–17 at registration are routed to Learn Mode. Learn Mode hides all real portfolio tracking features (portfolio hero widget, real P&L, real holdings). These features must be hidden in the data layer, not just via UI toggle. | A test account with DOB = 16 years and 364 days must not receive real portfolio data from any API endpoint. |
| BR-AGE-03 | Users under 16 at registration see a parental consent screen. Access to the app is blocked until parental consent is completed. Parental consent flow: parent email entry → confirmation email → parent approval link valid for 72 hours. | A test account with DOB < 16 must not reach the Home screen without parental consent. Consent links expire after 72 hours. |
| BR-AGE-04 | When a Learn Mode user (16–17) turns 18, the app must detect this at next login and prompt upgrade to Full Access. User must explicitly confirm to upgrade. | A test account with DOB that crosses 18 must trigger the upgrade prompt on next login after the birthday date. |
| BR-AGE-05 | Learn Mode users (16–17) can access all paper trading, gamification, market data, and education features. SSC regulations on securities trading do NOT apply to paper trading (no real transactions). | Learn Mode users can execute paper trades. Learn Mode users cannot access real portfolio tracking. |
| BR-AGE-06 | Legal basis for DOB collection and age gating: Vietnam Civil Code 2015 (Articles 20–21 on legal capacity of minors) and Decree 13/2023/ND-CP on personal data protection. DOB is classified as personal data and must be stored encrypted. | DOB field in the database must be encrypted at rest. Privacy policy must reference both legal instruments. |

### 6.2 Paper Trading Rules

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-PT-01 | Paper trading is a core product feature, not an optional or beta feature. It must be available from first login for all age groups (16+). | Paper trading section is accessible from the main navigation tab bar. Not behind a settings toggle or beta flag. |
| BR-PT-02 | Virtual funds label: the string "Tiền ảo / 가상 자금 / Virtual Funds" (in user's language) must be permanently visible in any paper trading screen. This is a persistent UI element, not a one-time toast. | UI audit: paper trading portfolio page and order confirmation page must both display the virtual funds label in a visible, non-dismissible position. |
| BR-PT-03 | Paper orders must NEVER be routed to any real brokerage API. All order fills are internal simulation only. | Integration test: place a paper order and verify zero outbound calls to any external brokerage API endpoint. |
| BR-PT-04 | Simulated orders are filled at the next available real-time price snapshot for VN stocks (≤ 15-second delay). KR stocks in V1 are filled at best-available model/search price at time of order. Fill must be labeled with the price source. | VN order fill timestamp must be ≤ 15 seconds after order submission. KR orders display "Price estimated" label. |
| BR-PT-05 | Portfolio reset is always available. Resetting: (a) restores balance to VND 500,000,000; (b) clears all holdings and transaction history; (c) resets Trader Score to baseline for that portfolio session; (d) does NOT reset XP or Trader Tier. | Post-reset state: balance = 500,000,000, holdings = 0, history = empty. XP and Tier badge unchanged. |
| BR-PT-06 | Paper trading is clearly separated from any future real portfolio tracking. No mixing of real and virtual data in any view. | Test account with both paper trades and real holdings (V2+): paper and real sections must render in separate, clearly labeled sections. |

### 6.3 AI Rules

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-AI-01 | AI must NEVER provide buy/sell recommendations or price targets. All AI output must be framed as educational, not advisory. | Test: prompt the AI with "Should I buy VNM?" — response must not contain buy/sell/hold recommendation language. Must contain educational framing. |
| BR-AI-02 | Every AI response must append the AI disclaimer (see BR-DISC-02) in the user's current language. | Automated test: 100 sample AI responses must all contain the correct disclaimer string. 100% pass rate required. |
| BR-AI-03 | AI output language must exactly match the user's current language setting (vi / ko / en). Language mismatch is a P1 bug. | Test: set language to Korean, ask a stock question in English — response must be in Korean. |
| BR-AI-04 | AI responses must be grounded in factual financial data via RAG where available. Hallucinated financial figures (prices, earnings, dates) are a P0 bug. | Test suite: 50 factual financial queries against known ground truth. Accuracy ≥ 95%. |
| BR-AI-05 | Behavioral coaching nudges must use non-judgmental, peer-tone language. Nudges must be dismissible. No nudge should use words that imply criticism (e.g., "mistake", "wrong", "bad"). | Copy review: all nudge templates must be reviewed and approved by UX Writing team. Nudge dismiss button must be visible without scrolling. |
| BR-AI-06 | AI-generated content is not cached and re-served if the underlying market data has changed. Post-trade explanations are generated fresh per trade. | Cache test: two identical trade types in different market conditions must produce different AI explanations. |

### 6.4 Disclaimer Requirements

All disclaimers must be displayed in the user's current language setting. All three language variants must be present in the codebase.

#### BR-DISC-01: Investment Disclaimer
Displayed on every market data screen (Home, Discover, Stock Detail, Markets). Non-dismissible. Font size minimum 11pt. Color: secondary text color (#6B7280 or equivalent in dark theme).

- **VI:** "Đầu tư chứng khoán có rủi ro. Thông tin và dữ liệu trên Paave chỉ mang tính tham khảo và không phải là khuyến nghị đầu tư. Paave không phải là công ty chứng khoán được cấp phép và không thực hiện lệnh mua/bán chứng khoán thực."
- **KR:** "증권 투자에는 위험이 따릅니다. Paave의 정보 및 데이터는 참고용이며 투자 권유가 아닙니다. Paave는 인가된 증권회사가 아니며 실제 매수/매도 주문을 실행하지 않습니다."
- **EN:** "Securities investment carries risk. Information and data on Paave are for reference only and do not constitute investment recommendations. Paave is not a licensed securities company and does not execute real buy/sell orders."

#### BR-DISC-02: AI Output Disclaimer
Appended to every AI-generated response (post-trade explanations, natural language queries, health checks, nudges). Displayed as a footer label within the AI card component. Font size minimum 10pt.

- **VI:** "Đây là nội dung giáo dục, không phải tư vấn đầu tư."
- **KR:** "이 내용은 교육 목적이며 투자 조언이 아닙니다."
- **EN:** "This is educational content, not investment advice."

#### BR-DISC-03: Paper Trading Disclaimer
Persistent banner displayed at all times within the paper trading module (portfolio view, order form, confirmation screen, transaction history). Non-dismissible. Background color: amber/warning tone.

- **VI:** "Bạn đang dùng tiền ảo — không có giao dịch thực nào được thực hiện."
- **KR:** "가상 자금을 사용 중입니다 — 실제 거래는 실행되지 않습니다."
- **EN:** "You are using virtual funds — no real transactions are executed."

#### BR-DISC-04: Minor Disclaimer (Learn Mode users age 16–17)
Displayed on the Learn Mode home screen and paper trading onboarding. Replaces (does not augment) the standard investment disclaimer for minors.

- **VI:** "Tính năng này chỉ mang tính chất giáo dục và mô phỏng. Thông tin trên ứng dụng không phải là tư vấn đầu tư."

### 6.5 Social Rules

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-SOC-01 | Portfolio amounts (VND/KRW) must NEVER be displayed publicly. Public-facing portfolio data shows percentage returns only. | Test: inspect social post and public profile API responses — no VND or KRW absolute values in response payload. |
| BR-SOC-02 | Default portfolio privacy is private. Users must explicitly opt in to share. | New account test: portfolio visibility setting = "private" on first login. Requires user action to change. |
| BR-SOC-03 | All posts enter a 60-second moderation buffer before public display. Posts auto-flagged by keyword list are held for manual review. | Post submission test: post does not appear in feed until 60 seconds have elapsed. |
| BR-SOC-04 | Every post must display the poster's Trader Tier badge at time of posting. Badge must reflect Tier at time of post, not current Tier (to prevent retroactive credibility manipulation). | Downgrade scenario test: user posts at Tier 4, then score drops to Tier 2 — the post still shows Tier 4 badge. |
| BR-SOC-05 | Sentiment tag (Bull/Bear/Neutral) is mandatory on every post. Post cannot be submitted without selecting a tag. | UI test: submit button is disabled until a sentiment tag is selected. |
| BR-SOC-06 | Per-ticker community feeds are NOT real-time chat rooms. Posts are threaded, non-ephemeral, and feed-ranked. No "last seen" indicators. | Architecture test: community feed endpoint returns paginated posts, not a live WebSocket stream. |

### 6.6 Language Rules

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-LANG-01 | All three languages (vi, ko, en) must be fully supported in the app at launch. A language setting cannot be in a "partial" state — if a screen shows mixed languages, it is a P1 bug. | Full localization audit: every string in the app must have vi, ko, and en translations. Automated i18n missing-key test must pass with 0 missing keys. |
| BR-LANG-02 | Default language is the device language setting. If device language is not vi, ko, or en, default is en. | Test: device set to Japanese → app defaults to English. |
| BR-LANG-03 | Financial terminology must be culturally adapted, not just translated. VN: HOSE/HNX terminology, Gen Z casual register. KR: KOSPI/KOSDAQ terminology, Korean financial terms. EN: NYSE/NASDAQ global context. | Terminology review: approved financial glossary per language must be maintained. Term deviations are copy bugs. |
| BR-LANG-04 | Language change in settings takes effect immediately without requiring app restart. | Test: change language from Korean to Vietnamese mid-session — all visible strings change immediately. |

### 6.7 Data Privacy Rules

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-PRIV-01 | Date of birth is classified as personal data under Decree 13/2023/ND-CP and must be stored encrypted at rest using AES-256 or equivalent. | Security audit: DOB field in database must be encrypted. Plaintext DOB must not appear in logs. |
| BR-PRIV-02 | User data must not be stored on servers outside Vietnam for VN users, per Decree 13/2023/ND-CP data localization requirements. | Infrastructure audit: VN user data (PII) must reside in Vietnam-region cloud infrastructure. |
| BR-PRIV-03 | User financial data (paper trading history, portfolio) must comply with Korea's PIPA for KR users. | PIPA compliance checklist: data retention limits, deletion rights, consent records. |
| BR-PRIV-04 | Users must be able to request deletion of their account and all associated personal data within 30 days of request. | Test: submit data deletion request — verify all PII removed from database and backups within 30 days. |

---

## 7. Assumptions

- VN real-time market data feed (HOSE/HNX) is licensed and available at launch with ≤ 15-second SLA.
- Korea and global market data for V1 will be sourced via web search integration and model knowledge; real-time KRX feed SLA is not guaranteed in V1 and is not promised to users.
- App will launch on both iOS (App Store) and Android (Google Play) simultaneously.
- KYC in V1 is lightweight (email + date of birth + nationality) — no identity document verification required for V1.
- Push notifications are delivered via FCM (Android) and APNs (iOS).
- The app does NOT execute real trades; all "buy/sell" actions in V1 are simulated paper trades only.
- Parental consent flow for under-16 users is email-based in V1. In-app biometric or government ID verification is deferred to V2.
- AI models (GPT-4o, Claude) are available via API with sufficient rate limits and uptime SLA for the projected V1 MAU.
- PhoBERT and KoELECTRA fine-tuned models are available and deployed by launch for the VN and KR NLP layers.
- The Trader Score algorithm is finalized by the end of technical design phase and does not change within a V1 version cycle (changes require a migration plan for existing scores).
- Paper trading order simulation does not require integration with any real exchange order matching engine. All fills are price-snapshot-based simulation.
- SSC (State Securities Commission of Vietnam) regulations on licensed securities activities do not apply to paper trading with virtual funds. Legal counsel has confirmed this assumption (see Risk Register RISK-06).
- Content moderation keyword list is maintained by the Operations team and updated weekly.
- The 60-second submission delay is sufficient for automated moderation in V1; human moderation escalation queue is maintained by the Operations team.

---

## 8. Constraints

- V1 launch timeline: within 6 months of project kickoff.
- No real-money transaction processing in V1 or any future version.
- All VN user data must comply with Vietnam's Cybersecurity Law and Decree 13/2023/ND-CP.
- All KR user data must comply with Korea's PIPA (Personal Information Protection Act).
- App must function on devices running iOS 15+ and Android 10+.
- Maximum acceptable API response time for market data: 3 seconds for 95th percentile of requests under normal load.
- Maximum acceptable AI response time for post-trade explanation generation: 8 seconds from trade confirmation to card display.
- Paper trading order fill time: ≤ 5 seconds for VN stocks (next price snapshot within 15s delay window); KR best-effort.
- All disclaimers (BR-DISC-01 through BR-DISC-04) are non-negotiable — they cannot be removed, minimized below specified font sizes, or made dismissible without explicit legal counsel approval.
- Paave must not use any language anywhere in the product that implies brokerage services, investment advisory services, or the ability to execute real trades.
- Design system is fixed for V1: dark navy base #0D1117, Paave Blue #3B82F6, Cyan accent #06B6D4, font Pretendard (supports Korean, Latin, and Vietnamese diacritics), dark-mode-native. No design system changes in V1 scope.

---

## 9. Stakeholders

| Role | Name / Team | Responsibility |
|---|---|---|
| Product Owner | Paave Product Team | Final sign-off on feature scope and priority; owns roadmap |
| Business Analyst | BA Team | Requirements authoring, acceptance criteria, traceability |
| Engineering Lead | Mobile + Backend Teams | Technical feasibility, architecture decisions, API design |
| Mobile Engineers (iOS) | iOS Team | iOS feature implementation (Swift/SwiftUI) |
| Mobile Engineers (Android) | Android Team | Android feature implementation (Kotlin/Jetpack Compose) |
| Backend Engineers | API + Data Team | Market data feeds, paper trading simulation engine, API layer, notification system |
| AI / Data Science Team | ML/AI Team | AI pillar implementation, model fine-tuning (PhoBERT, KoELECTRA), RAG architecture, behavioral detection algorithms |
| Data Provider — VN | HOSE/HNX data vendor | Real-time VN stock data feed (≤ 15-second SLA) |
| Data Provider — KR | KRX / third-party KR data vendor | V1: web search integration; V2: real-time KRX feed |
| UX/UI Designer | Design Team | Dark-mode design system, screen flows, gamification UI, age-appropriate UX variants |
| QA Team | QA Team | Test case execution, regression testing, compliance checks (disclaimer display, age gate enforcement) |
| Marketing Team | Growth Team | User acquisition campaigns, App Store / Play Store optimization, influencer strategy |
| Legal Counsel — Vietnam | VN Legal | Vietnam Civil Code compliance, Decree 13/2023/ND-CP, SSC paper trading classification, content moderation legal requirements |
| Legal Counsel — Korea | KR Legal | PIPA compliance, KRX data licensing, Korean financial consumer protection regulations |
| Operations Team | Ops Team | Content moderation queue, keyword list maintenance, user support |
| End Users | Gen Z (age 16–27) in Vietnam and Korea | Primary consumers of the product |

---

## 10. Risk Register

| Risk ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| RISK-01 | VN real-time data feed SLA breach (>15s delay) | Medium | High | Contractual SLA with data vendor; server-side monitoring with automated alerting; fallback to 20-minute delayed data with visible user label "Delayed data" |
| RISK-02 | AI hallucination — AI generates incorrect financial figures (prices, earnings, ratios) | Medium | High | RAG architecture grounds responses in real data; post-generation factual validation for numeric claims; mandatory educational disclaimer on all AI output; P0 bug classification for confirmed hallucinations |
| RISK-03 | Social moderation failure — harmful investment advice or market manipulation content appears in community feeds | Medium | High | 60-second submission delay; automated keyword filtering; Operations team moderation queue; user reporting mechanism; repeat violators account suspension |
| RISK-04 | Age verification circumvention — user provides false date of birth | High | Medium | DOB is self-declared in V1 (known limitation); terms of service require accurate DOB; V2 plan includes document verification for KYC upgrade; legal disclaimer on consequences of false declaration |
| RISK-05 | Regulatory classification risk — SSC or Vietnamese regulator classifies Paave's features as requiring a securities license | Low | Critical | Legal counsel confirmation that paper trading with virtual funds is not a regulated securities activity; no real order execution in any code path; prominent disclaimers at all times; maintain ongoing dialogue with SSC |
| RISK-06 | KR PIPA non-compliance — improper handling of Korean user PII | Low | High | PIPA compliance checklist implemented before launch; Korean legal counsel engaged; data localization for KR users; deletion request flow tested |
| RISK-07 | AI model API outage — GPT-4o/Claude API unavailable | Medium | Medium | Graceful degradation: AI cards display "AI analysis unavailable" with retry option; core market data and paper trading continue to function without AI layer |
| RISK-08 | Gamification Trader Score manipulation — users game the score formula | Medium | Medium | Score formula details not fully exposed in UI; rate limiting on paper trades (max 50 orders/day per user); anomaly detection on score velocity; tunable formula weights |
| RISK-09 | Under-age user harm — 16–17 user misinterprets paper trading performance as investment advice for real money | Medium | High | Learn Mode persistent disclaimer (BR-DISC-04); AI outputs always appended with educational disclaimer; no feature in Learn Mode simulates or references real brokerage accounts; onboarding explicitly communicates virtual-only nature |
| RISK-10 | Pretendard font rendering issues on older Android devices (Android 10–11) | Low | Medium | Font load testing on Android 10–11; fallback to system sans-serif if Pretendard fails to load; automated visual regression tests on minimum supported OS versions |
| RISK-11 | KR market data accuracy in V1 (model knowledge + web search) | High | Medium | Clear in-app label on KR data: "Data sourced from web search — may be delayed or estimated". No user-facing SLA promise for KR data in V1. |
| RISK-12 | Community feed spam or coordinated pump-and-dump posts | Medium | High | Trader Score threshold required to post (minimum Tier 1 with ≥ 5 completed trades before posting); rate limit: max 5 posts per hour per user; Operations team monitors leaderboard-linked accounts |

---

## 11. Traceability Overview

| Business Objective | Features / Rules |
|---|---|
| BO-01: Acquire 50K MAU | Onboarding, Discover/Trending Feed, Notification system, Social proof, Gamification (viral loop) |
| BO-02: D7 Retention ≥ 35% | Learning streaks, Weekly challenges, Personalized watchlist, Price alerts, Daily market open notifications |
| BO-03: Watchlist adoption ≥ 60% | Stock Detail "Add to Watchlist" action, Watchlist on Home Screen, Price alert setup |
| BO-04: Discover as acquisition channel | Discover/Trending Feed, Editorial "why it's hot" hooks, Social proof counters, Theme filters |
| BO-05: VN as lead market | HOSE/HNX real-time data, VN Trader Tiers (localized names), Vietnamese language default, VN market challenges |
| BO-06: VN data latency ≤ 15s | Data vendor SLA, BR-PT-04, Server-side monitoring, RISK-01 mitigation |
| BO-07: Onboarding completion ≥ 75% | Age-appropriate onboarding paths, Language selection, Simple KYC (email + DOB + nationality) |
| BO-08: Paper trade activation ≥ 50% | Paper trading as core tab bar feature (BR-PT-01), "Learn & Play" mini-app, Post-trade AI explanation (immediate reward loop) |
| BO-09: Gamification Tier 2 ≥ 40% | Trader Tier system, XP system, Weekly challenges, Learning streaks, Contextual micro-lessons |
| BO-10: AI card read-through ≥ 65% | Post-trade AI 3-part card design, P0 AI feature, Natural language query accessibility |
| BO-11: Community feed engagement ≥ 35% | Per-ticker community feed on Stock Detail, Cashtag auto-linking, Social proof counters, Follow system |
| BO-12: Age 16–17 segment with zero violations | BR-AGE-01 through BR-AGE-06, BR-DISC-04, Learn Mode feature gating, RISK-09 mitigation |

---

## 12. Next Steps

| # | Action Item | Owner | Due |
|---|---|---|---|
| 1 | Obtain legal counsel sign-off on SSC paper trading classification (confirms ASSUMPTION-07 and closes RISK-05) | Legal Counsel VN | Before architecture phase |
| 2 | Obtain legal counsel sign-off on PIPA compliance design (closes RISK-06) | Legal Counsel KR | Before architecture phase |
| 3 | Execute VN real-time market data feed contract with data vendor (HOSE/HNX); confirm ≤ 15-second SLA in writing | Engineering Lead + Data Provider VN | Before development kickoff |
| 4 | Finalize Trader Score algorithm parameters (weights for Return/Consistency/Risk Discipline/Activity) and document immutability policy for V1 | AI/Data Science Team + Product Owner | Technical Design Phase |
| 5 | Produce FRD (Functional Requirements Document) decomposing each BRD feature into user stories, acceptance criteria, and API contracts | BA Team | Technical Design Phase |
| 6 | Produce SRD (System Requirements Document) for paper trading simulation engine, AI RAG architecture, and real-time data pipeline | Engineering Lead + AI/Data Science Team | Technical Design Phase |
| 7 | Finalize localization glossary for all three languages (VN/KR/EN financial terminology) and establish translation review process | UX Writing + Legal Counsel | Before content production |
| 8 | Design and validate parental consent flow with legal counsel; confirm 72-hour link expiry is compliant with Decree 13/2023/ND-CP | Legal Counsel VN + UX/UI Designer | Technical Design Phase |
| 9 | Establish content moderation keyword list v1.0 and Operations moderation SLA (response time for flagged posts) | Operations Team + Legal Counsel VN | Before social feature development |
| 10 | Confirm AI model API rate limits and uptime SLAs from OpenAI/Anthropic; design graceful degradation plan (closes RISK-07) | AI/Data Science Team + Engineering Lead | Technical Design Phase |

---

## 13. Approval & Sign-Off

| Role | Name | Signature | Date |
|---|---|---|---|
| Product Owner | | | |
| Engineering Lead | | | |
| Legal Counsel — Vietnam | | | |
| Legal Counsel — Korea | | | |
| AI / Data Science Lead | | | |
| QA Lead | | | |

---

*Document end. Proceed to FRD for functional decomposition and user story mapping.*

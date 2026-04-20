# BRD — Business Requirements Document
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Document version:** 2.2
**Date:** 2026-04-20
**Author:** Business Analysis Team
**Status:** Approved for Development
**Supersedes:** BRD v2.1 (2026-04-20)

### v2.1 Product Direction Update *(retained from v2.1 — still active)*

1. **Paper trading is the product, not a feature.** Paave's main purpose is safe, realistic paper trading. Every other surface exists to deepen or socialize that loop.
2. **Community exists to support social trading.** The social layer is how traders compare strategies, follow signals, and size conviction — not a peer-learning forum. Education is a small, contextual supporting role, not a pillar.
3. **Real trading ships via licensed brokerage partners (V1.x).** When a user graduates from paper trading, Paave bridges them into real markets through licensed securities-company partners. Paave itself remains unlicensed and never takes custody of funds or executes orders.

### v2.2 Product Direction Update *(new in this revision)*

Three changes land in v2.2, all additive on top of v2.1:

4. **Vietnam Gen Z is the sole PRIMARY user.** Korea and US/global market data remains *for reference only* in V1 — no SLA, no real-time feed obligation, no primary-persona product decisions driven by KR/US needs. All scope, copy, marketing, success-metric targets, and design priority are Vietnam-first. KR expansion is V2+; US/global is reference-data-only for the foreseeable roadmap.
5. **Onboarding collects industrial preference + investment goal.** Two new onboarding steps capture (a) a multi-select of sector/industry preferences (VN-context-first: Banking, Real Estate, Tech, Consumer, Energy, Healthcare, Industrials, Materials, Utilities, Retail) and (b) a single primary investment goal (Learn & explore / Grow savings / Beat inflation / High returns / Long-term wealth / Just for fun). These feed Discover personalization, weekly challenge seeding, and onboarding-completion KPIs.
6. **Multi-method signup: email/password OR social (Google, Apple, Zalo).** Email + password remains standard. Social signup uses OAuth provider verification; after the provider returns a verified identity, Paave auto-creates an account using the provider's display name. Because OAuth providers do not reliably return date of birth, a **post-social-handshake DOB prompt is mandatory** before age gating (BR-AGE-01..06) can be enforced. Zalo is a required provider for VN Gen Z reach; Apple is required on iOS per App Store policy; Google is required for Android reach.

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

Paave is a **Vietnam-Gen-Z-native paper-trading and social-investing app**. Its **sole primary audience** is Vietnamese users aged 16–27. Its main purpose is to let Vietnamese Gen Z trade HOSE/HNX stocks in a safe, realistic simulated environment, then socialize that activity with a community of VN peers. Korean and US/global market data is surfaced for **reference only** in V1 — no SLA, no localized KR community in V1 — and exists to help VN users track regional context (K-pop / semiconductor / mega-cap narratives) from a single app. AI and learning surfaces are supporting features, not the headline product. When users are ready to move from practice to real markets, Paave bridges them out through licensed VN securities-company partners.

**Platform Roadmap:**
- **V1 — MTS (Mobile Trading System):** iOS + Android. All requirements in this BRD apply to V1/MTS unless explicitly noted otherwise.
- **V1.x — Brokerage partner integration:** Account-linking and order-routing with licensed securities-company partners (see §5.3). Paave itself remains unlicensed and never takes custody of funds.
- **V2 — WTS (Web Trading System):** Browser-based application.
- **V3 — DTS (Desktop Trading System):** Native desktop application.

**Core Product Pillars (V1), in priority order:**
1. **Paper trading (MAIN)** — full simulated trading on **VN (HOSE/HNX, real-time, ≤ 15s SLA)** as primary; KR and US/global as **reference-data-only** markets (informational, no real-time SLA). Virtual starting balance: VND 500,000,000. This is the product.
2. **VN Gen Z social trading community** — follow Vietnamese traders, share strategies, compare paper-trading performance, aggregate sentiment, cashtag-driven per-ticker feeds. VN-first Vietnamese default language and Zalo-first sharing. The community exists to support trading decisions, not to teach.
3. **Personalized VN discovery** — industrial-sector preferences + investment goal (collected at onboarding) drive the Discover feed, weekly challenges, and home widgets.
4. **Brokerage partner bridge (V1.x)** — one-tap handoff from a paper position to a real account at a **licensed Vietnamese securities-company partner**, so graduating users can act on strategies they've proven. KR/US partner bridges are out of V1.x scope.
5. **AI insights (supporting role)** — contextual post-trade explanations, portfolio health checks, and behavioral nudges. Intentionally small; not a standalone learning product.
6. **Light gamification & localized UX** — Trader Tiers, XP, streaks layered on top of paper trading; **Vietnamese default**, Korean and English available for accessibility but not marketing-prioritized.
7. **Low-friction signup** — email + password, Google, Apple, or Zalo. All social signups run an OAuth verification handshake and prompt for DOB post-handshake (age gate is non-negotiable).

Paave itself is NOT a licensed securities company and does NOT execute real buy/sell orders or hold customer funds. All trading inside the app is simulated. Real-money trading in V1.x is performed exclusively by licensed brokerage partners under their own regulatory umbrella; Paave acts as a referral and UX layer (see §6.8 and §8).

---

## 2. Problem Statement

### 2.1 Current Situation

**Vietnamese Gen Z investors (age 16–27) — the primary audience of Paave V1** — face compounding barriers when attempting to engage with stock market investing. The same barriers exist in neighboring markets (KR, US) but V1 is scoped to Vietnam first; regional data is surfaced only as a reference layer to help VN Gen Z stay aware of foreign context without leaving the app.

**Paper Trading Gap (primary):**
- There is no mobile-native app in Vietnam or Korea that offers realistic, multi-market paper trading built for Gen Z — existing simulators are clunky, English-only, desktop-first, or locked inside brokerage apps that require a real account to access.
- Young users cannot practice placing orders, managing a portfolio, or sizing conviction before committing real money; the only "practice" available is real losses in a live account.
- Users aged 16–17 have no legal pathway to participate in the market at all — the absence of a compliant paper-trading product leaves this segment entirely unserved.
- Existing investment apps (SSI, MBS, Mirae Asset) are designed for experienced traders, with dense UI and no onboarding for first-time investors (F0 segment).

**Social Trading Gap:**
- FOMO-driven behavior is not channeled into transparent, track-record-based research — users turn to unverified Telegram/Facebook/Zalo/KakaoTalk groups for stock tips.
- Vietnamese KOL culture on Facebook and Zalo propagates investment "recommendations" with no accountability or accuracy tracking.
- There is no social platform where users can share paper-trading performance transparently, compare strategies, or follow traders whose signals have a visible track record — without exposing exact capital amounts.
- Aggregated community sentiment on a per-ticker basis (bull/bear, volume of conviction) does not exist in a mobile-native Gen Z format.

**Market Data & Discovery Gap:**
- Vietnamese retail investors have no mobile-native app that surfaces real-time HOSE/HNX data in a Gen Z-friendly UX.
- Korean Gen Z investors lack a consolidated mobile tool that aggregates KRX data with editorial context (trend explanations, thematic groupings).
- No app in Vietnam or Korea provides a curated "discovery" layer — users must independently research which stocks are trending, why, and what peers are watching.

**Paper-to-Real Bridge Gap:**
- Even when users are ready to graduate from paper trading to a real account, moving from "strategy I've practiced" to "order at a licensed broker" is a fractured, re-onboarding-heavy experience.
- Brokerage apps are optimized for account opening, not for continuity of strategy from a practice environment — paper PnL, watchlists, and followed traders do not carry across.

**Education Gap (secondary):**
- Financial education content in Vietnam and Korea is either too academic (textbook-style) or dangerously speculative (KOL groups pushing unverified tips); however, solving education in isolation does not convert users into capable traders. Learning lands best when attached to an actual trade or position, which is why Paave keeps education as a small, contextual layer rather than a core product pillar.

### 2.2 Core Problem

**There is no mobile-first, Gen Z-native app where young retail investors in Vietnam and Korea can practice trading across VN, KR, and global markets with virtual funds, socialize their strategies with a transparent track-record-based community, and — when ready — bridge into a real account at a licensed brokerage partner, all while remaining fully compliant with Vietnamese and Korean financial and data-protection regulations.**

### 2.3 Impact

- F0 investors (first-time) cannot build conviction without a safe practice environment, so they either avoid the market or enter it with real money they cannot afford to lose.
- Users aged 16–17 have no legal, structured pathway to participate — they either do nothing or engage with unregulated content.
- The absence of social accountability for stock "tips" allows misinformation to thrive in informal channels (Zalo, Facebook, KakaoTalk), and young investors have no way to distinguish signal from noise on a track-record basis.
- When practice-ready users are ready to commit real capital, they drop out of the journey at the brokerage sign-up wall, losing the context (watchlists, followed traders, tested strategies) they built up.
- Young investors delay market participation due to intimidation from existing tools, or enter poorly prepared because there is no bridge between "I watched some content" and "I have a broker account."

---

## 3. Business Objectives

| # | Objective | Measurable Target | Timeline |
|---|-----------|-------------------|----------|
| BO-01 | Acquire active Vietnamese Gen Z users | 50,000 Monthly Active Users (MAU) from Vietnam within 6 months of launch | Month 6 |
| BO-02 | Retain users through daily utility | Day-7 retention rate ≥ 35% | Month 3 |
| BO-03 | Drive watchlist engagement | ≥ 60% of registered users create at least 1 watchlist entry within first session | Month 1 |
| BO-04 | Validate Discover as primary acquisition channel | ≥ 40% of new users cite Discover/Trending as primary engagement surface (in-app survey) | Month 3 |
| BO-05 | **Concentrate V1 on Vietnam** (KR/US reference-only) | ≥ **90%** of V1 MAU from Vietnam; 0 KR-localized marketing campaigns in V1 | Month 6 |
| BO-06 | Achieve VN market data reliability | VN real-time data (HOSE/HNX) with ≤ 15-second delay from exchange feed. KR + US data explicitly labeled "reference" — no SLA required | Launch day |
| BO-07 | Reduce F0 onboarding drop-off | Onboarding completion rate ≥ 75% (user reaches Home screen after starting onboarding, including the new industrial-preference and investment-goal steps) | Month 1 |
| BO-08 | **Establish paper trading as the product's primary loop** | ≥ 70% of registered users execute ≥ 1 paper trade within first 3 sessions; ≥ 3 paper trades per active user per week by month 3 | Month 2–3 |
| BO-09 | Drive social trading engagement as the second core loop | ≥ 35% of active sessions include a social interaction (view feed, follow user, react to post) on a stock or profile page; ≥ 20% of active users follow ≥ 1 trader by month 3 | Month 3 |
| BO-10 | Drive gamification retention on top of paper trading | ≥ 40% of paper trading users achieve at least Tier 2 (Người học / 입문자) within 30 days | Month 3 |
| BO-11 | Keep AI insights lightweight but valued | ≥ 55% of users who see a post-trade AI card tap to expand (not dismiss); AI insights treated as supporting, not headline | Month 2 |
| BO-12 | Serve the 16–17 age segment compliantly | ≥ 10% of registered users are age 16–17 in Learn Mode; zero compliance violations related to minors | Month 6 |
| BO-13 | Validate the paper-to-real brokerage bridge (V1.x) | ≥ 10% of active paper traders who have reached Tier 3+ initiate a brokerage-partner account-link flow within 90 days of V1.x launch; zero incidents of Paave executing orders or taking custody of funds | Month 9 (V1.x launch) |
| BO-14 | **Validate multi-method signup for VN Gen Z reach** | ≥ 60% of new registrations via social providers (Google + Apple + Zalo combined); Zalo specifically captures ≥ 25% of VN-signed-up users in the first 30 days post-launch | Month 2 |
| BO-15 | **Capture onboarding personalization signal for ≥ 90% of users** | ≥ 90% of users who complete onboarding submit both a non-empty industrial-preference set (≥ 1 sector) and an investment goal before reaching Home | Month 1 |
| BO-16 | **Prove onboarding-preference personalization lifts engagement** | Users with ≥ 3 industrial preferences have Day-7 retention ≥ 8 percentage points higher than users with 0–1 preferences (A/B on retention cohort analysis) | Month 4 |

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

### 4.5 Social Trading KPIs

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| Community feed engagement | % of stock detail page sessions that include a community feed interaction | ≥ 35% | Event tracking |
| Follow system adoption | % of active users who follow ≥ 1 other trader | ≥ 20% by month 3 | Backend aggregation |
| Followed-trader → paper-trade conversion | % of active sessions where a user places a paper trade on a ticker they saw from a followed trader's post within 24h | ≥ 12% | Event tracking + attribution |
| Post submission rate | % of active users who submit ≥ 1 community post per month | ≥ 15% | Backend event tracking |
| Sentiment tag usage | % of posts that include a Bull/Bear/Neutral tag | ≥ 80% | Backend aggregation |
| Cashtag click-through rate | % of posts with cashtags where at least 1 cashtag is tapped | ≥ 40% | Event tracking |

### 4.6 Brokerage Bridge KPIs (V1.x)

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| Brokerage bridge CTA impression → initiation | % of eligible users (Tier 3+, 18+, ≥ 30 paper trades) who tap "Open real account with partner" | ≥ 20% | Event tracking |
| Partner account-link completion | % of initiations that complete partner onboarding and return a linked-account confirmation to Paave | ≥ 40% | Partner-side callback + event tracking |
| Paper-to-real strategy carry-over | % of newly linked users whose first real order ticker was in their Paave watchlist or paper portfolio | ≥ 50% | Cross-reference watchlist/paper data vs. partner callback payload (ticker only, no amounts) |
| Custody/order-execution incident count | # of incidents where Paave handled funds, routed orders, or displayed itself as the executing broker | 0 | Quarterly legal & engineering audit |

### 4.7 Signup & Account KPIs (new in v2.2)

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| Signup method distribution | % breakdown of new registrations by method (email/password, Google, Apple, Zalo) | Social combined ≥ 60%; Zalo ≥ 25% of VN registrations | Registration event tracking |
| Social OAuth handshake success rate | % of social OAuth attempts that complete provider verification within 30s | ≥ 97% per provider (Google / Apple / Zalo) | OAuth callback event tracking |
| Post-handshake DOB capture rate | % of social-signed-up users who complete DOB entry within the same session | 100% (blocking screen; no user may reach Home without DOB) | Funnel analytics |
| Signup abandonment by method | % of started signups per method that are not completed within 10 minutes | ≤ 25% per method | Funnel analytics |
| Account-linking conflict rate | % of social signups where the returned email already exists in Paave and triggers account-linking UX | < 8% (measured monthly); all resolved via linking flow, 0 duplicate accounts created | Registration backend logs |
| Zalo provider availability | % of hours per month when Zalo OAuth endpoint returns successful handshakes | ≥ 99.0% | Provider-status monitoring |

### 4.8 Onboarding Personalization KPIs (new in v2.2)

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| Industrial preference capture | % of users completing onboarding who select ≥ 1 industrial/sector preference | ≥ 90% | Onboarding event tracking |
| Industrial preference depth | Avg. number of sectors selected per user | ≥ 2.5 sectors/user | Backend aggregation |
| Investment-goal capture | % of users completing onboarding who select an investment goal | ≥ 95% (single-choice, required-to-continue) | Onboarding event tracking |
| Discover feed relevance (post-personalization) | % of Discover impressions that align with the user's selected industrial preferences | ≥ 55% of card impressions tagged with ≥ 1 preferred sector | Feed attribution analytics |
| Preference-driven retention lift | D7 retention delta between users with ≥ 3 preferences vs. 0–1 preferences | ≥ 8pp lift | Cohort analysis |
| Goal-aligned challenge acceptance | % of weekly challenges accepted by users when the challenge is tagged to match their selected goal | ≥ 35% (vs. ≤ 20% for off-goal challenges) | Challenge event tracking |

---

## 5. Scope Definition

### 5.1 V1 In Scope (MTS — Mobile Trading System)

#### 5.1.1 User Registration & Age Gating

V1 supports **four signup methods**: email + password, Google OAuth, Apple OAuth, and Zalo OAuth. Age gating (BR-AGE-01..06) is enforced after the identity step for all four methods — no method may bypass DOB collection.

| Feature | Description |
|---|---|
| **Method A — Email + password** | User provides email, password (≥ 8 chars, 1 digit, 1 uppercase), plus full onboarding fields (display name, DOB, nationality, language, industrial preferences, investment goal). |
| **Method B — Google OAuth** | User authenticates with Google. Paave receives: Google-verified email, display name, locale (where available). Account is auto-created using the Google-returned display name. DOB is NOT trusted from Google and must be collected in the post-handshake DOB step. |
| **Method C — Apple OAuth** | User authenticates with Apple ("Sign in with Apple"). Mandatory on iOS per App Store guidelines 4.8 if Google or Zalo is offered. Apple may return a private relay email; Paave must store the relay email verbatim and respect Apple's email-hiding. DOB is not returned; post-handshake DOB step applies. |
| **Method D — Zalo OAuth (VN-critical)** | User authenticates with Zalo. Paave receives: Zalo user ID, display name, avatar (where granted). Email may or may not be returned by Zalo — if absent, user is prompted for an email for account recovery. Zalo is a required provider for V1 to hit BO-14. DOB is not returned; post-handshake DOB step applies. |
| Post-handshake DOB prompt (Methods B/C/D) | After any social OAuth returns a verified identity, the user is presented with a **mandatory, non-skippable DOB screen** before any other app surface. Screen cannot be dismissed or deferred. This closes the age-gate gap left by OAuth providers that do not reliably return DOB. |
| Date-of-birth collection | Registration requires DOB (day/month/year picker) regardless of method. Checkbox-only age confirmation is NOT acceptable. |
| Age gate: Under 16 | User under 16 is blocked at registration. A parental consent flow is displayed (see BR-AGE-03). Applies regardless of signup method. |
| Age gate: 16–17 (Learn Mode) | User aged 16–17 is routed to Learn Mode. Paper trading, gamification, market data, and education only. No real portfolio tracking. Real-portfolio features are hidden, not just disabled. |
| Age gate: 18+ (Full Access) | User aged 18+ has access to all V1 features including real portfolio tracking. |
| Account linking (same email across providers) | If a social-returned email matches an existing Paave account, user is shown an account-linking prompt ("You already signed up with email/Google/Apple. Link this Zalo account?"). No second account is created. See BR-SIGNUP-04. |
| Account linking (Apple private relay) | If Apple returns a private relay email, linking is by Apple Sub ID, not email. A user who re-signs-in with a different method later must be linkable by verified alternate contact. |
| Display name source (social) | For Methods B/C/D, Paave pre-fills display name from the provider. User may edit in the same onboarding flow. Empty or profanity-flagged names trigger re-entry. |
| Password (email method only) | Social accounts have no Paave password. Attempting to "log in with email/password" on an email that was registered via social returns a "Sign in with [provider]" redirect, never a password prompt. |
| KYC (lightweight) | Display name (from provider or user entry), email (provider-verified or user-entered), nationality (defaulted from device locale), DOB (required). No identity document verification in V1. Full KYC for real-money use is performed by the brokerage partner in V1.x. |
| Market preference | Defaulted to **VN** for V1 (VN Gen Z is the sole primary persona). User may add KR or Global (reference-only) in settings. No market-selection step in onboarding (removed in v2.1; KR/US are reference data in V1). |
| Provider downtime handling | If an OAuth provider is unreachable, the failing provider's button is disabled in-app and a message is shown ("Google sign-in is temporarily unavailable — try another method"). Other methods remain available. See BR-SIGNUP-06. |

#### 5.1.2 Onboarding

Onboarding order (v2.2), applied after identity/DOB for all signup methods:

1. Language selection → 2. Age-appropriate path (Learn Mode vs Full Access) → 3. **Industrial preferences (multi-select, new)** → 4. **Investment goal (single-choice, new)** → 5. Consent / legal acceptance → 6. Home.

| Feature | Description |
|---|---|
| Nationality detection | Auto-detect via device locale; user can override. |
| Market preference | **Defaulted to VN for all users in V1** (single primary market). KR and Global remain reference-only; no explicit market-selection step is shown in V1 onboarding (removed in v2.1 — see `c7b3b1c` commit: "remove market preference step, default to VN market"). |
| Age-appropriate onboarding path | 16–17 users see Learn Mode onboarding; 18+ users see full onboarding. |
| Language selection | User selects preferred language (vi / ko / en). Default: device language setting; if device language is vi, default is Vietnamese (BR-LANG-02). |
| **Industrial / sector preferences (new in v2.2)** | Multi-select screen. User picks ≥ 1 and ≤ 10 sectors from a VN-context-first list: Banking (Ngân hàng), Real Estate (Bất động sản), Tech (Công nghệ), Consumer (Tiêu dùng), Energy (Năng lượng), Healthcare (Y tế), Industrials (Công nghiệp), Materials (Nguyên vật liệu), Utilities (Tiện ích), Retail (Bán lẻ). Localized in all three languages. "Skip for now" is permitted but reduces Discover personalization quality (a dismissible banner explains this). Stored on user profile; editable later in Settings. Feeds Discover (§5.1.4), weekly challenge seeding (§5.1.6), and home widgets (§5.1.3). |
| **Investment goal (new in v2.2)** | Single-choice screen. User picks exactly 1 of: **Learn & explore** / **Grow savings** / **Beat inflation** / **High returns** / **Long-term wealth** / **Just for fun**. Required to proceed; no "Skip" option (goal drives AI tone, challenge difficulty, and default suggested tickers). Goal is editable later in Settings. Feeds AI insight tone (FR-AI-01), weekly challenge seeding, and Discover card ordering. |
| Onboarding progress indicator | Persistent step-count indicator (e.g. "3 of 6") visible on every onboarding screen so the user knows how much remains. |
| Onboarding skip policy | DOB, language, industrial preferences (at least 1), and investment goal are required. Only industrial-preference "Skip" returns the user with an empty set (shown a degradation notice); everything else is blocking. |

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

#### 5.1.5 Paper Trading — **PRIMARY PRODUCT PILLAR**

Paper trading is the main product. Every other module in this BRD exists to feed it, deepen it, socialize it, or graduate users out of it into a real brokerage account.

| Feature | Description |
|---|---|
| Virtual starting balance | VND 500,000,000 per portfolio. Displayed as "Tiền ảo / 가상 자금 / Virtual Funds" at all times. |
| Supported markets | VN: HOSE + HNX stocks. KR: KOSPI + KOSDAQ stocks (V1: model knowledge + web search; real-time feed in V2). Global: major US names (AAPL, TSLA, NVDA, etc.) via web-search-grounded pricing in V1; expanded in V1.x. |
| Order types | Market orders and limit orders. Stop-loss and take-profit attach to open positions (V1.x if not V1). |
| Order fill mechanics | Simulated orders filled at next available real-time price snapshot (≤ 15s delay for VN; best-available for KR and global in V1). |
| Portfolio reset | User can reset their paper portfolio to VND 500,000,000 starting balance at any time. Reset is logged and impacts Trader Score history (resets score streak but not XP). |
| Multiple portfolios (V1.x) | User may run a "growth" paper portfolio and a "strategy test" paper portfolio in parallel; each tracks its own PnL and Tier score. |
| Portfolio view | Holdings table: ticker, quantity, avg. buy price, current price, unrealized P&L %, position age. |
| Transaction history | Full list of paper trades with timestamp, order type, fill price, and outcome. Exportable as CSV in V1.x for users who want to prove a track record to a broker. |
| Virtual funds label | Paper trading mode always displays a persistent banner: see BR-DISC-03. |
| No real transactions (inside Paave) | Paave itself never routes paper orders to a real brokerage or executes real trades. Real-money order routing happens exclusively through a licensed brokerage partner's surface (see §5.1.14). |
| Paper → real hand-off | Any paper position, watchlist entry, or followed-trader signal can trigger a "Open at partner broker" CTA that hands off to the brokerage partner flow (V1.x). No funds or orders pass through Paave. |

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

In v2.2, the Markets module distinguishes clearly between **primary (VN, real-time, SLA-backed)** and **reference (KR + Global, best-effort, labeled)** data. KR and Global markets are not primary product decisions — they exist to keep VN Gen Z users aware of regional context.

| Feature | Description |
|---|---|
| VN market data (**PRIMARY**) | Real-time HOSE + HNX data with ≤ 15-second delay. Includes: index values, top gainers/losers, sector performance. **Only market backed by an SLA in V1** (see BO-06). |
| KR market data (**REFERENCE ONLY**) | KOSPI + KOSDAQ data via web search integration and model knowledge. Every KR screen labels the data with a persistent "Reference data — may be delayed" chip. **No real-time SLA in V1.** |
| Global overview (**REFERENCE ONLY**) | Major indices (S&P 500, NASDAQ, Nikkei) and mega-cap names (AAPL, TSLA, NVDA) via web search. Labeled "Reference data" in UI. **No SLA.** |
| Reference-data badge | Any KR or Global ticker card, row, or detail page displays a "Reference" chip that opens a tooltip explaining V1 data sourcing. |
| Market switcher | Primary market is VN by default; user may switch to KR or Global view in the Markets tab but cannot change paper-trading SLA guarantees (paper fills still use best-available price for KR/Global). |

#### 5.1.9 Social Trading — Phase 1 (V1)

Social in Paave is explicitly a **social-trading** layer, not a peer-learning forum. It surfaces who is trading what, with what conviction, and with what track record — so users can size and time their own paper trades with community signal.

| Feature | Description |
|---|---|
| Social proof on stock cards | "X traders watching" counter, sentiment badge (Bull/Bear/Neutral), Trending label. |
| Per-ticker community feed | Tab on every stock detail page. Shows posts tagged with that ticker's cashtag. |
| Cashtag auto-linking | $TICKER strings in posts auto-link to the corresponding stock detail page. |
| Follow system | Users can follow other traders. Follower/following counts visible on profile. Followed trader's activity surfaces in a dedicated "Following" feed (Phase 1 V1) and enriches the Home feed. |
| Trader profile — track record | Each profile surfaces % return, win rate, Tier history, and top-held tickers (paper only, no absolute VND/KRW values). This is the core "who should I follow" signal. |
| Bull/Bear/Neutral sentiment tags | Every post must be tagged with one sentiment tag. Tag is required before submission. |
| Trade receipts (optional attach) | Users may attach a paper-trade receipt to a post — renders as an anonymized card showing ticker, direction, entry price, and PnL % (no absolute amounts). Attaches at time of post; cannot be backdated. |
| 60-second submission delay | All posts enter a 60-second review buffer before appearing publicly. System auto-flags content matching moderation keyword list. |
| Trader Score on posts | Poster's current Trader Tier badge is always displayed alongside their post. |
| Post character limit | 280 characters per post. No inline images in V1. |

**Out of scope for V1 social-trading layer (see §5.2):** real-money copy trading, verified-KOL status, paid signal subscriptions, DMs. These are deliberately deferred — V1 proves the track-record-visible feed first.

#### 5.1.10 AI Insights (Supporting Feature) — P0 (V1 Launch)

AI in Paave is a **supporting layer**, not a headline product. It enriches a paper trade or a portfolio view with context. It never stands on its own as a "learn finance" destination. Scope is deliberately kept tight.

| Feature | Description |
|---|---|
| Post-trade AI insight card | After every simulated trade is confirmed, AI generates a 3-part card: (1) What happened — price movement summary; (2) Why — top 3 causal factors from news/fundamentals; (3) What to watch — 2 forward-looking signals. Language matches user's language setting. Always appends AI disclaimer (BR-DISC-02). |
| Natural language stock queries | Conversational AI for stock questions in VN/KR/EN. Examples: "Why is FPT dropping today?", "What does P/E mean for this stock?". RAG architecture grounded in VN/KR/global financial data. Every response appends AI disclaimer. |
| Multilingual AI layer | VN: PhoBERT fine-tuned on CafeF/VnExpress + GPT-4o/Claude. KR: KoELECTRA + GPT-4o/Claude. EN: GPT-4o/Claude. Language detection via FastText. |
| AI output language | AI output language always matches the user's current language setting. Language change takes effect immediately without requiring app restart. |

#### 5.1.11 AI Insights — P1 (V1.x, Post-Launch)

Scope tightened in v2.1: two capabilities only, both attached to paper trading or portfolio state. No standalone learning product, no spaced-repetition lesson engine.

| Feature | Description |
|---|---|
| Portfolio health check | Weekly "Portfolio Report Card" on the user's paper portfolio — letter grade (A–F) per dimension: diversification, concentration, volatility, geographic exposure, liquidity. Radar chart visual. Conversational follow-up available. |
| Behavioral nudges | Detects: FOMO buying (rapid buy after large price spike), panic selling (sell immediately after loss), overtrading (>10 trades/day), concentration creep (>40% in single stock). Delivers non-judgmental, peer-tone nudges via in-app toast. Nudges are dismissible. |

**Explicitly removed from scope (was in BRD v2.0):**
- *Pre-trade AI analysis card (risk score, suggested position size).* Risked feeling advisory and conflicting with BR-AI-01.
- *Personalized learning paths, 90-second micro-lessons, spaced repetition.* Belongs to an education product; Paave is not that product in v2.1.
- *Echo-chamber behavioral detection.* Overlaps with the social-trading layer and was high-false-positive.

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
| Registration | Four methods at V1 launch: email + password, Google OAuth, Apple OAuth, Zalo OAuth (see §5.1.1). DOB, language, industrial preferences, and investment goal required regardless of method. |
| Login | Email/password, Google, Apple, or Zalo. Method used at registration is remembered; users who mix methods on the same email are linked via the account-linking flow (BR-SIGNUP-04). |
| Linked providers panel (Settings) | Shows which providers are linked to the account. User may add additional providers (e.g. add Zalo to an email account). User may remove a provider only if ≥ 1 usable method remains. |
| Profile | Avatar (from provider for social signup, editable), display name (from provider for social signup, editable), Trader Tier badge, Trader Score, paper portfolio summary (% return only — no VND/KRW absolute amounts shown publicly). |
| Preference editing | Industrial preferences (multi-select) and investment goal (single-choice) editable at any time from Settings. Changes take effect immediately on Discover and challenge-seeding. |
| Language switcher | Available in settings. All three languages available at all times. |
| Notification preferences | Granular controls per notification type. |
| Account deletion | Available from Settings. Triggers BR-PRIV-04 30-day deletion; for social-linked accounts, also revokes OAuth tokens on Paave's side and prompts the user to remove Paave from their provider's connected-apps list. |

#### 5.1.14 Brokerage Partner Integration (V1.x)

When a paper trader is ready to move to real markets, Paave bridges them into a licensed securities-company partner. Paave remains unlicensed, handles no funds, and does not execute orders. This module only ships in V1.x (post-V1 launch) after a partner agreement is signed.

| Feature | Description |
|---|---|
| Partner directory | In-app list of licensed brokerage partners, scoped per market (VN-licensed partners for VN users, KR-licensed for KR users). Each partner card shows: name, license number, supported markets, fee highlights, and "Open account" CTA. |
| Eligibility gate | Brokerage CTAs are only shown to users who are 18+, have completed ≥ 30 paper trades, and have reached Trader Tier 3+ (see BR-BRK-02). 16–17 Learn Mode users never see a real-brokerage CTA. |
| Account-link handoff | Tapping "Open real account" launches the partner's onboarding (web view or deep link). Paave passes only: user ID (opaque), chosen market, and optional ticker context. No credentials, no funds, no order details. |
| Linked-account status | Once the partner confirms account creation (via callback), the user's Paave profile shows a "Linked: Partner X" badge. No real balance or real holdings are ever stored in or shown by Paave. |
| Ticker deep-link into partner | From a Paave stock detail page, a "Open this ticker at [Partner]" CTA deep-links into the partner app/web for real order placement. Paave does not pre-fill price, size, or direction. |
| Paper-to-real attribution | Paave tracks (anonymously) which partner-linked users had the linked ticker in their paper watchlist or paper portfolio in the prior 30 days — for BO-13 measurement only. No trade PnL flows back. |
| Compliance boundary | Every brokerage CTA displays a disclaimer: "Real trading is executed by [Partner], a licensed securities company. Paave is not a broker and does not execute trades." (BR-DISC-05) |

### 5.2 V1 Out of Scope

| Item | Deferred To | Reason |
|---|---|---|
| Paave-operated real buy/sell order execution | N/A (never in scope) | Paave is never a broker; real execution is always through a licensed partner |
| Custody of user funds | N/A (never in scope) | Paave never holds, moves, or transmits user money |
| Brokerage partner integration module | **V1.x** | Requires signed partner agreement(s); see §5.1.14 and §5.3 |
| Real-money copy trading / signal subscriptions | V2+ | Requires partner integration + additional regulatory review |
| KR-localized marketing & KR-localized social community | V2+ | VN is the sole primary persona in V1; 0 KR marketing campaigns in V1 (BO-05) |
| KR real-time market data feed | V2 (WTS) | Real-time KRX feed integration deferred to V2 |
| Additional social-login providers (Facebook, KakaoTalk, Line, Naver) | V2+ | V1 social providers are scoped to Google, Apple, Zalo — VN Gen Z reach focus |
| KYC document verification at signup | V1.x (for brokerage partner path only) | V1 uses self-declared DOB; partner performs full KYC for real-money |
| Full social feed (Threads-style) | V2 (WTS) | Phase 2 social-trading roadmap |
| Public portfolio sharing (4-tier privacy) | V2 (WTS) | Phase 2 social-trading roadmap |
| Trader leaderboards | V2 (WTS) | Phase 2 social-trading roadmap |
| "Morning Call" feature | V2 (WTS) | Phase 2 social-trading roadmap |
| Shareable portfolio card (9:16, Zalo/KakaoTalk) | V2 (WTS) | Phase 2 social-trading roadmap |
| Market sentiment AI (NLP on VN/KR news) | V2+ | P2 AI feature |
| Pre-trade AI risk score & suggested size | Out of roadmap | Removed in v2.1 — risks feeling advisory |
| Personalized learning paths, micro-lesson engine, spaced repetition | Out of roadmap | Removed in v2.1 — Paave is not an education product |
| TradingView chart integration | V2 | V1 uses native candlestick chart |
| Crypto trading or data | Out of roadmap | Out of product focus |
| Multi-language UI beyond VN/KR/EN | Post-launch | Phase 3 |
| In-app portfolio tax reporting | Out of roadmap | Out of scope |
| Web application (WTS) | V2 | Platform roadmap |
| Desktop application (DTS) | V3 | Platform roadmap |

### 5.3 Platform Roadmap

| Version | Platform | Name | Key Additions |
|---|---|---|---|
| V1 | iOS + Android | MTS (Mobile Trading System) | VN-primary paper trading (HOSE/HNX real-time); KR + Global as reference data only; multi-method signup (email / Google / Apple / Zalo); industrial-preference + investment-goal onboarding; social trading; AI insights (P0); light gamification; multilingual |
| **V1.x** | iOS + Android | MTS + Brokerage Bridge | Licensed VN brokerage partner integration (§5.1.14), paper-to-real hand-off, P1 AI (portfolio health + behavioral nudges), multi-portfolio, CSV export, stop-loss/take-profit |
| V2 | Browser | WTS (Web Trading System) | KR real-time data, KR-localized marketing & social, full social feed, public portfolio sharing, trader leaderboards, Morning Call, market sentiment AI |
| V3 | Native desktop | DTS (Desktop Trading System) | Advanced charting, multi-monitor support, power-user features |

---

## 6. Business Rules

### 6.1 Age Gate Rules

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-AGE-01 | Registration requires date of birth (day/month/year) as a mandatory field **regardless of signup method**. A checkbox asserting age is not sufficient. For social OAuth signups, DOB is collected in a mandatory post-handshake screen that cannot be skipped or dismissed (see BR-SIGNUP-03). | Registration form cannot be submitted without a valid DOB. DOB field validates day/month/year format. Social-signup users cannot reach Home without completing the DOB screen. |
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
| BR-PT-06 | Paper trading and any linked-broker real account (V1.x) must be rendered in clearly separated, labelled sections. Paper PnL and real PnL must never be aggregated into a single number. Real balances are NEVER stored in Paave — only a "Linked at Partner" badge. | Test account with a paper portfolio and a linked broker account: UI renders two distinct sections, each with its own label ("Virtual / Real-partner"); no API endpoint in Paave returns a real-money balance. |

### 6.3 AI Rules

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-AI-01 | AI must NEVER provide buy/sell recommendations, price targets, or suggested position sizes. All AI output is contextual insight, not advice. | Test: prompt the AI with "Should I buy VNM?" — response must not contain buy/sell/hold recommendation language or numeric price targets. |
| BR-AI-02 | Every AI response must append the AI disclaimer (see BR-DISC-02) in the user's current language. | Automated test: 100 sample AI responses must all contain the correct disclaimer string. 100% pass rate required. |
| BR-AI-03 | AI output language must exactly match the user's current language setting (vi / ko / en). Language mismatch is a P1 bug. | Test: set language to Korean, ask a stock question in English — response must be in Korean. |
| BR-AI-04 | AI responses must be grounded in factual financial data via RAG where available. Hallucinated financial figures (prices, earnings, dates) are a P0 bug. | Test suite: 50 factual financial queries against known ground truth. Accuracy ≥ 95%. |
| BR-AI-05 | Behavioral nudges must use non-judgmental, peer-tone language. Nudges must be dismissible. No nudge should use words that imply criticism (e.g., "mistake", "wrong", "bad"). | Copy review: all nudge templates must be reviewed and approved by UX Writing team. Nudge dismiss button must be visible without scrolling. |
| BR-AI-06 | AI-generated content is not cached and re-served if the underlying market data has changed. Post-trade insights are generated fresh per trade. | Cache test: two identical trade types in different market conditions must produce different AI insights. |
| BR-AI-07 | AI surfaces are always attached to a paper-trading artifact (a trade, a holding, a portfolio, a ticker). No standalone "learn finance" AI tutor surface exists in V1 or V1.x. | Nav audit: no top-level AI-only tab, no standalone chat launcher outside a ticker/portfolio context. |

### 6.4 Disclaimer Requirements

All disclaimers must be displayed in the user's current language setting. All three language variants must be present in the codebase.

#### BR-DISC-01: Investment Disclaimer
Displayed on every market data screen (Home, Discover, Stock Detail, Markets). Non-dismissible. Font size minimum 11pt. Color: secondary text color (#6B7280 or equivalent in dark theme).

- **VI:** "Đầu tư chứng khoán có rủi ro. Thông tin và dữ liệu trên Paave chỉ mang tính tham khảo và không phải là khuyến nghị đầu tư. Paave không phải là công ty chứng khoán được cấp phép, không giữ tiền của người dùng và không thực hiện lệnh mua/bán chứng khoán thực. Giao dịch thực được thực hiện bởi các công ty chứng khoán đối tác được cấp phép."
- **KR:** "증권 투자에는 위험이 따릅니다. Paave의 정보 및 데이터는 참고용이며 투자 권유가 아닙니다. Paave는 인가된 증권회사가 아니며 사용자 자금을 보관하거나 실제 매수/매도 주문을 실행하지 않습니다. 실제 거래는 인가된 파트너 증권회사를 통해 이루어집니다."
- **EN:** "Securities investment carries risk. Information and data on Paave are for reference only and do not constitute investment recommendations. Paave is not a licensed securities company, does not hold user funds, and does not execute real buy/sell orders. Real trading is carried out through licensed partner brokerages."

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

#### BR-DISC-05: Brokerage Partner Handoff Disclaimer (V1.x)
Displayed on every brokerage-partner CTA, partner directory card, and immediately before any deep link / web view opens into a partner flow. Non-dismissible at the CTA moment; a confirmation tap is required to continue.

- **VI:** "Giao dịch thực được thực hiện bởi [Partner], công ty chứng khoán được cấp phép. Paave không phải là công ty chứng khoán, không giữ tiền và không đặt lệnh thay bạn."
- **KR:** "실제 거래는 인가된 증권회사인 [Partner]에서 이루어집니다. Paave는 증권회사가 아니며, 자금을 보관하거나 귀하를 대신하여 주문을 실행하지 않습니다."
- **EN:** "Real trading is executed by [Partner], a licensed securities company. Paave is not a broker, does not hold funds, and does not place orders on your behalf."

### 6.5 Social Trading Rules

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

### 6.8 Brokerage Integration Rules (V1.x)

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-BRK-01 | Paave must NEVER execute, route, broker, or clear a real-money securities order. All real execution is performed by the licensed partner on the partner's own infrastructure and under the partner's license. | Code audit: no Paave code path places real orders; no outbound request from Paave servers to an exchange or clearing system. |
| BR-BRK-02 | Brokerage partner CTAs may only be shown to users who are (a) 18+ at time of display, (b) have completed ≥ 30 paper trades, and (c) have reached Trader Tier 3 or higher. 16–17 Learn Mode users must never see a real-brokerage CTA. | Eligibility test matrix: accounts failing any of (a)(b)(c) must not receive any brokerage CTA in any surface (Home, Portfolio, Stock Detail, Settings). |
| BR-BRK-03 | Paave must NEVER take custody of, transmit, or display user funds. No PII beyond what is strictly needed to initiate the partner handoff (opaque user ID, chosen market, optional ticker context) may be sent to the partner. | Network audit of the handoff request: payload contains only the approved fields. No email, DOB, or Paave-side balance is in the payload. |
| BR-BRK-04 | Every user-facing brokerage surface (partner card, CTA, handoff screen) must display BR-DISC-05 verbatim in the user's language, with the partner's legal name and license number substituted into `[Partner]`. | UI audit: every brokerage surface passes a snapshot test that asserts the full disclaimer string is present and the partner name/license are rendered. |
| BR-BRK-05 | A partner may only be added to the in-app directory after (a) a signed partnership agreement is on file, (b) the partner's licensing has been verified by Paave Legal, and (c) the partner has been load-tested on the handoff callback contract. | Admin test: attempting to publish a partner record missing any of (a)(b)(c) must be blocked at the admin-tool layer. |
| BR-BRK-06 | Paave does not advertise or imply that it is a broker, that it executes trades, or that paper-trading results are predictive of real returns. All marketing and in-product copy must route real-trading language through "licensed partner" framing. | Copy review: automated scan of strings against a banned-phrases list ("Paave broker", "trade live on Paave", etc.) returns zero hits. |
| BR-BRK-07 | The paper-to-real attribution pipeline (for BO-13) must be anonymous: ticker + timestamp bucket only, never tied to a real-money order value or to identifying user data on the partner side. | Data audit: attribution records schema contains no real-money amounts and no partner-side order identifiers. |

### 6.9 Signup & Account Rules (new in v2.2)

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-SIGNUP-01 | At V1 launch, Paave must offer all four signup methods: email + password, Google OAuth, Apple OAuth, and Zalo OAuth. All four must be functional on day one; removing any one is a P0 release blocker. | Launch smoke test: sign up one new account via each of the four methods; all succeed end-to-end. |
| BR-SIGNUP-02 | On iOS, if Google OAuth or Zalo OAuth is offered, "Sign in with Apple" must also be offered with equal prominence (App Store Guideline 4.8). | iOS build UI test: sign-in screen shows all three social buttons with equal sizing, spacing, and tap target. |
| BR-SIGNUP-03 | Social OAuth signups must route through a mandatory post-handshake DOB collection screen before reaching any other surface. This screen cannot be dismissed, backgrounded, or bypassed. If the user abandons the screen, the account is held in a "pending" state and cannot log in until DOB is collected. | Test: complete Google OAuth, force-quit app at the DOB screen. On re-open, user is routed back to the DOB screen, not to Home. |
| BR-SIGNUP-04 | If an OAuth-returned email matches an existing Paave account, no second account is created. Paave shows an account-linking flow that asks the user to confirm ownership (via the existing login method) before linking the new provider. | Conflict test: email `x@example.com` registered via email/password; sign in with Google returning same email → account-linking prompt appears, no duplicate row in `users` table. |
| BR-SIGNUP-05 | For Apple "private relay" emails, linking is by stable Apple Sub ID, not email. If a user later signs in with a different method, linking is offered via a verified alternate contact (email verification or Zalo phone verification). | Test: Apple sign-up with private relay; subsequent Google sign-in prompts for email verification before linking. |
| BR-SIGNUP-06 | If any OAuth provider is unreachable (network error, provider outage, token refresh failure), the affected provider's button must be disabled with an explanatory label in the user's language. Other methods remain available. No silent retry loop. | Chaos test: simulate Zalo OAuth 5xx → "Zalo sign-in is temporarily unavailable" label shown, button disabled, Google/Apple/email still available. |
| BR-SIGNUP-07 | OAuth tokens (access + refresh) must never be logged, displayed to the user, or transmitted outside the Paave auth backend. Tokens at rest must be encrypted per BR-PRIV-01. | Log audit: 0 hits for access-token/refresh-token substrings in application logs. DB audit: OAuth tokens column encrypted. |
| BR-SIGNUP-08 | A Paave account created via social OAuth has NO Paave password. Attempting to "log in with email/password" on such an email must return a "Sign in with [provider name]" redirect — never a password prompt, never a password reset offer. | Negative-path test: email-password form submitted for a social-only account → 200 OK with redirect-to-provider, not 401 password-mismatch. |
| BR-SIGNUP-09 | Paave must not store any social-provider field that is not strictly required for account function (email, display name, avatar URL, provider sub ID). Additional fields — phone, address, friends list, gender — are not requested and not stored even if the provider would return them. | Scope audit: OAuth scopes requested per provider are reviewed quarterly. Only `email`, `profile` (Google), `name email` (Apple), `id name avatar` (Zalo) permitted. |
| BR-SIGNUP-10 | Consent to Paave's Privacy Policy and Terms of Service is a separate, explicit screen shown once after identity is established — never pre-ticked, never bundled into the OAuth provider's consent. Language matches the user's language setting. | UI test: consent checkboxes default to unchecked; "Continue" button disabled until both are ticked. |

### 6.10 Onboarding Personalization Rules (new in v2.2)

| Rule ID | Rule | Testable Condition |
|---|---|---|
| BR-ONBOARD-01 | Industrial preferences are stored as an array of enum values from the approved sector list (Banking, Real Estate, Tech, Consumer, Energy, Healthcare, Industrials, Materials, Utilities, Retail). Freeform entries are not permitted. Minimum 0 (if user chose "Skip"), maximum 10. | Schema test: `industrial_prefs` column is an enum[]; insertion of a non-enum value is rejected by the DB. |
| BR-ONBOARD-02 | Investment goal is a single-choice enum: `learn_explore`, `grow_savings`, `beat_inflation`, `high_returns`, `long_term_wealth`, `just_for_fun`. Selection is mandatory for onboarding to complete. | Schema test: `investment_goal` column is a non-null enum; onboarding-complete flag requires it. |
| BR-ONBOARD-03 | Sector and investment-goal labels must be localized in vi, ko, and en. The enum value stored in the DB is the canonical English slug — displayed strings are resolved at render time via i18n. | i18n audit: all 10 sector slugs and 6 goal slugs resolve to non-empty strings in vi/ko/en. |
| BR-ONBOARD-04 | Discover feed ranking must factor in industrial preferences when present (boost cards matching preferences by a configurable weight). When preferences are empty ("Skip" path), Discover falls back to VN trending. | A/B test hook: user with `[Banking, Tech]` preferences has at least 2× the impression rate of `Banking`/`Tech` cards vs. a control user with empty preferences, other factors equal. |
| BR-ONBOARD-05 | Weekly challenge seeding must consider investment goal — a `learn_explore` user and a `high_returns` user should not be served the same difficulty-weighted challenges by default. | Challenge-engine test: across 1,000 synthetic users, the challenge distribution differs measurably between the two goal cohorts (χ² significance test on distribution). |
| BR-ONBOARD-06 | Users may edit industrial preferences and investment goal at any time from Settings. Changes take effect on Discover, home widgets, and next weekly-challenge cycle within one session. | Settings-edit test: modify preferences, pull-to-refresh Discover — ranking reflects new preferences on the same session. |
| BR-ONBOARD-07 | The onboarding-complete flag (`onboarded_at`) is set only when all required steps (DOB, language, ≥ 0 industrial prefs + explicit "Skip" OR ≥ 1 selection, investment goal, consent) have been persisted. Partial onboarding never flips the flag. | Backend test: abandoning at the investment-goal screen leaves `onboarded_at = NULL`. Re-opening the app routes back to the investment-goal step. |
| BR-ONBOARD-08 | The in-app Discover feed must reflect the VN-primary framing: when industrial preferences are empty, fallback ranking surfaces VN trending first, KR reference tickers second (labeled "Reference"), Global third. | Feed audit: for a user with empty preferences and VN market, first 10 Discover cards contain ≥ 7 VN tickers; any KR/Global cards carry the "Reference" chip. |

---

## 7. Assumptions

- VN real-time market data feed (HOSE/HNX) is licensed and available at launch with ≤ 15-second SLA.
- Korea and global market data for V1 will be sourced via web search integration and model knowledge; real-time KRX feed SLA is not guaranteed in V1 and is not promised to users.
- App will launch on both iOS (App Store) and Android (Google Play) simultaneously.
- KYC in V1 is lightweight (email + date of birth + nationality) — no identity document verification required for V1. Full KYC for real-money use is performed by the brokerage partner in V1.x, under the partner's own license.
- Push notifications are delivered via FCM (Android) and APNs (iOS).
- Paave itself never executes real trades in any version; all "buy/sell" actions inside Paave are simulated paper trades. Real-money trading in V1.x is executed by a licensed securities-company partner through its own systems (see §5.1.14 and §6.8).
- Parental consent flow for under-16 users is email-based in V1. In-app biometric or government ID verification is deferred to V2.
- AI models (GPT-4o, Claude) are available via API with sufficient rate limits and uptime SLA for the projected V1 MAU.
- PhoBERT and KoELECTRA fine-tuned models are available and deployed by launch for the VN and KR NLP layers.
- The Trader Score algorithm is finalized by the end of technical design phase and does not change within a V1 version cycle (changes require a migration plan for existing scores).
- Paper trading order simulation does not require integration with any real exchange order matching engine. All fills are price-snapshot-based simulation.
- SSC (State Securities Commission of Vietnam) regulations on licensed securities activities do not apply to paper trading with virtual funds. Legal counsel has confirmed this assumption (see Risk Register RISK-05).
- At least one VN-licensed brokerage partner agreement is signable within 6 months of V1 launch to unblock V1.x. If no partner signs, V1.x ships with the directory empty and the brokerage CTAs hidden.
- Brokerage partners operate under their own regulatory license and assume all real-money responsibility (KYC, order execution, custody, clearing, tax reporting). Paave is a referral and UX layer only.
- Content moderation keyword list is maintained by the Operations team and updated weekly.
- The 60-second submission delay is sufficient for automated moderation in V1; human moderation escalation queue is maintained by the Operations team.
- **v2.2** Google OAuth and Apple Sign-in client credentials can be registered in time for V1 launch under a Paave legal entity acceptable to both providers (Google Cloud project + Apple Developer Program).
- **v2.2** Zalo OpenAPI access (OAuth 2.0 with `id`, `name`, `avatar` scopes) is available under Paave's Vietnamese business registration. If Zalo approval is delayed, Zalo ships dark and the three remaining methods are launch-eligible (BO-14's ≥ 25% Zalo target is pushed to Zalo-live + 30 days).
- **v2.2** OAuth providers do not reliably return date of birth. Paave does not rely on provider-returned DOB under any condition; DOB is always collected in-app post-handshake (BR-SIGNUP-03).
- **v2.2** Apple Sign-in private relay email is treated as a first-class email for communication purposes. Paave sends to the relay address as-is; Apple forwards.
- **v2.2** Industrial-preference and investment-goal schemas are finalized before dev kickoff. Adding or renaming enum values post-launch requires a migration plan (values are stored as enum in DB, not freeform).
- **v2.2** At V1 launch, the Discover ranker supports industrial-preference weighting; the cold-start behavior for users with empty preferences is a documented fallback, not a bug.

---

## 8. Constraints

- V1 launch timeline: within 6 months of project kickoff.
- Paave itself never processes real-money transactions, takes custody of user funds, or executes securities orders in any version. Real-money flows in V1.x are entirely handled by licensed brokerage partners under their own license (see §5.1.14 and §6.8).
- All VN user data must comply with Vietnam's Cybersecurity Law and Decree 13/2023/ND-CP.
- All KR user data must comply with Korea's PIPA (Personal Information Protection Act).
- App must function on devices running iOS 15+ and Android 10+.
- Maximum acceptable API response time for market data: 3 seconds for 95th percentile of requests under normal load.
- Maximum acceptable AI response time for post-trade insight generation: 8 seconds from trade confirmation to card display.
- Paper trading order fill time: ≤ 5 seconds for VN stocks (next price snapshot within 15s delay window); KR and global best-effort.
- All disclaimers (BR-DISC-01 through BR-DISC-05) are non-negotiable — they cannot be removed, minimized below specified font sizes, or made dismissible without explicit legal counsel approval.
- Paave must not use any language anywhere in the product that implies Paave itself is a broker, executes trades, holds funds, or provides investment advice. Real-trading language must always attribute execution to the licensed partner.
- Design system is fixed for V1: **Neo Lumen** tokens — Ink-Violet base (#0B0A1A), Signal Lime (#B5E82F), Deep Violet (#534AB7), Streak Peach (#FF8A5B, reward-only), font Pretendard Variable (unified KR/VN/Latin). No design system changes in V1 scope.
- **v2.2** App Store Guideline 4.8 — if any non-Apple social login (Google, Zalo) is offered on iOS, "Sign in with Apple" MUST be offered with equal prominence. Non-negotiable.
- **v2.2** Vietnam Decree 53/2022/ND-CP and Decree 13/2023/ND-CP — OAuth tokens, email addresses, and DOB for VN users must be stored on Vietnam-region infrastructure and encrypted at rest. Applies to all signup methods including social.
- **v2.2** VN Gen Z is the **sole primary persona** for V1. All user-acquisition budget, paid marketing, press, influencer, and community-manager effort targets Vietnam in V1. KR and US/Global are reference data only — 0 KR-localized marketing campaigns in V1 (BO-05). Changing this requires a V2+ roadmap revision.

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
| RISK-05 | Regulatory classification risk — SSC or Vietnamese regulator classifies Paave's features as requiring a securities license | Low | Critical | Legal counsel confirmation that paper trading with virtual funds is not a regulated securities activity; no real order execution in any Paave code path; all real trading routed to licensed partners under BR-BRK-01..07; prominent disclaimers at all times; maintain ongoing dialogue with SSC |
| RISK-06 | KR PIPA non-compliance — improper handling of Korean user PII | Low | High | PIPA compliance checklist implemented before launch; Korean legal counsel engaged; data localization for KR users; deletion request flow tested |
| RISK-07 | AI model API outage — GPT-4o/Claude API unavailable | Medium | Medium | Graceful degradation: AI cards display "AI analysis unavailable" with retry option; core market data and paper trading continue to function without AI layer |
| RISK-08 | Gamification Trader Score manipulation — users game the score formula | Medium | Medium | Score formula details not fully exposed in UI; rate limiting on paper trades (max 50 orders/day per user); anomaly detection on score velocity; tunable formula weights |
| RISK-09 | Under-age user harm — 16–17 user misinterprets paper trading performance as investment advice for real money | Medium | High | Learn Mode persistent disclaimer (BR-DISC-04); AI outputs always appended with educational disclaimer; no feature in Learn Mode references real brokerage accounts; BR-BRK-02 hides all brokerage CTAs from under-18 users; onboarding explicitly communicates virtual-only nature |
| RISK-10 | Pretendard font rendering issues on older Android devices (Android 10–11) | Low | Medium | Font load testing on Android 10–11; fallback to system sans-serif if Pretendard fails to load; automated visual regression tests on minimum supported OS versions |
| RISK-11 | KR market data accuracy in V1 (model knowledge + web search) | High | Medium | Clear in-app label on KR data: "Data sourced from web search — may be delayed or estimated". No user-facing SLA promise for KR data in V1. |
| RISK-12 | Community feed spam or coordinated pump-and-dump posts | Medium | High | Trader Score threshold required to post (minimum Tier 1 with ≥ 5 completed trades before posting); rate limit: max 5 posts per hour per user; Operations team monitors leaderboard-linked accounts |
| RISK-13 | Brokerage partner misattribution — users perceive Paave itself as the broker (V1.x) | Medium | Critical | BR-DISC-05 on every partner surface; partner legal name and license number always rendered; copy-scan pipeline for banned "Paave broker" phrasing; confirmation tap required before every handoff; AppStore / Play Store listing language reviewed by Legal |
| RISK-14 | Brokerage partner outage or onboarding rejection cascades into Paave UX (V1.x) | Medium | Medium | Partner availability status per card (green/amber/red); if partner rejects account creation, Paave surfaces the partner's error verbatim and never retries silently; user is not blocked from continuing paper trading |
| RISK-15 | No suitable brokerage partner signs in time for V1.x | Medium | High | V1.x module ships partner-gated — if directory is empty, CTAs are hidden and the V1 experience is unchanged; BO-13 measurement starts only after the first partner is live; contingency: delay V1.x rather than ship a half-baked or unlicensed bridge |
| RISK-16 | Paper-to-real attribution leaks real-money data back into Paave | Low | Critical | BR-BRK-07 locks schema to anonymous ticker + timestamp bucket; quarterly data audit; partner-side contract prohibits sending real PnL or order values to Paave |
| RISK-17 | Zalo OAuth onboarding delayed / rejected by Zalo business review (v2.2) | Medium | High | Zalo button ships dark if not approved by launch — other three methods carry V1; BO-14's Zalo-specific target shifts to Zalo-live + 30 days; Business Development owns weekly status with Zalo |
| RISK-18 | OAuth provider outage at launch (Google/Apple/Zalo) (v2.2) | Medium | Medium | BR-SIGNUP-06 disables the failing button and shows provider-specific label; other methods remain; server-side health check every 60s; no silent retries |
| RISK-19 | Social OAuth returns stale or corrupted display name (empty, profanity, unicode tricks) (v2.2) | Medium | Low | Client-side validation pass on returned name; user forced to review/edit display name in same onboarding flow before reaching Home; moderation keyword list applied |
| RISK-20 | Apple private-relay email bounces / user cannot be reached (v2.2) | Low | Medium | Send critical messages to relay email as-is; retry with in-app messaging fallback; account recovery requires provider sign-in, not email link; document behavior in Privacy Policy |
| RISK-21 | User chooses 0 industrial preferences via "Skip" → Discover personalization quality drops (v2.2) | High | Low | BR-ONBOARD-08 defines cold-start fallback to VN trending; "Skip" screen shows explanatory notice; Settings banner nudges user to add preferences after 7 days |
| RISK-22 | Industrial-preference enum drift (marketing/product disagree on sector set later) (v2.2) | Medium | Medium | Enum values frozen before dev kickoff; changes require versioned migration plan; analytics continues under old enum for cohort comparisons |
| RISK-23 | User exploits account-linking to merge two accounts for Trader Tier inflation (v2.2) | Low | Medium | Account-linking requires proving ownership of the pre-existing account (login via its original method); Trader Tier does NOT merge across accounts — the linked account adopts the already-existing Paave account's Tier; duplicate accounts are rejected at linking, not merged with score arithmetic |
| RISK-24 | KR/US reference data user confusion — users believe KR tickers are tradeable with same SLA as VN (v2.2) | Medium | Medium | Persistent "Reference" chip on every KR/Global card and detail page (BR-ONBOARD-08 / §5.1.8); BR-DISC-01 updated; paper-trade order form surfaces "Estimated price" label for KR/Global orders (BR-PT-04) |

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
| BO-08: Paper trading as primary loop (≥ 70% activation, ≥ 3 trades/user/week) | Paper trading as primary product pillar (§5.1.5, BR-PT-01..06), Post-trade AI insight (immediate reward loop), multi-market support (VN/KR/global) |
| BO-09: Social-trading engagement ≥ 35% + follow adoption ≥ 20% | Per-ticker community feed (§5.1.9), cashtag auto-linking, follow system, trader-profile track record, trade-receipt attachment |
| BO-10: Gamification Tier 2 ≥ 40% | Trader Tier system, XP system, weekly challenges, learning streaks |
| BO-11: AI insight card read-through ≥ 55% (supporting, not headline) | Post-trade AI 3-part card, P0 AI only, BR-AI-07 (AI never standalone), natural-language query accessibility |
| BO-12: Age 16–17 segment with zero violations | BR-AGE-01 through BR-AGE-06, BR-DISC-04, Learn Mode feature gating, BR-BRK-02 under-18 brokerage CTA block, RISK-09 mitigation |
| BO-13: Brokerage bridge initiation ≥ 20% of eligible users (V1.x) | Brokerage partner integration module (§5.1.14), BR-BRK-01..07, BR-DISC-05, eligibility gate (18+ / Tier 3+ / ≥ 30 paper trades), RISK-13..16 mitigation |
| BO-14: Multi-method signup (≥ 60% social, Zalo ≥ 25% VN) | §5.1.1 multi-method signup (email + Google + Apple + Zalo), BR-SIGNUP-01..10, §4.7 Signup KPIs, RISK-17/18/19/20 mitigation |
| BO-15: Onboarding personalization capture ≥ 90% | §5.1.2 industrial preferences + investment goal steps, BR-ONBOARD-01..07, §4.8 Onboarding KPIs |
| BO-16: Preference-driven retention lift ≥ 8pp | BR-ONBOARD-04/05 (Discover ranker + challenge seeding honor preferences), §4.8 preference-driven retention KPI, RISK-21 mitigation |

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
| 11 | Shortlist candidate VN- and KR-licensed brokerage partners for V1.x; produce due-diligence scorecard (license, API quality, UX compatibility, fee structure) | Business Development + Legal Counsel | Month 2 post-V1 kickoff |
| 12 | Execute first brokerage partner agreement and define handoff callback contract (closes prerequisites for BO-13 and RISK-15) | Business Development + Engineering Lead | Before V1.x development kickoff |
| 13 | Produce FRD section and SRD appendix for the Brokerage Partner Integration module (§5.1.14, §6.8) | BA Team + Engineering Lead | V1.x Technical Design Phase |
| 14 | Update all marketing, AppStore, and Play Store copy against the BR-BRK-06 banned-phrases list before V1.x launch | Growth Team + Legal Counsel | Before V1.x launch |
| 15 | Register and verify OAuth clients for Google (Cloud project + OAuth consent screen), Apple (Developer Program + Sign in with Apple capability), and Zalo (Open Platform business review with Vietnamese legal entity) | Engineering Lead + Business Development | Before development kickoff |
| 16 | Legal review of Privacy Policy & Terms to cover OAuth data receipt (email, display name, avatar, sub IDs), Apple private-relay behavior, Zalo VN-data-residency commitments, and BR-SIGNUP-09 minimal-scope pledge | Legal Counsel VN + KR | Before V1 launch |
| 17 | Finalize industrial sector enum and investment goal enum with Product, Data Science (Discover ranker), and Marketing; sign off on localized vi/ko/en strings | Product Owner + BA Team + UX Writing | Before development kickoff |
| 18 | Design and ship the Discover ranker preference-weighting logic and document cold-start fallback (BR-ONBOARD-04, BR-ONBOARD-08) | AI/Data Science Team + Engineering | Technical Design Phase |
| 19 | Implement account-linking UX with ownership verification (BR-SIGNUP-04, BR-SIGNUP-05) and QA conflict matrix (same email across providers, Apple private-relay, Zalo-no-email edge) | Mobile + Backend Teams + QA | V1 development |
| 20 | Publish post-handshake DOB screen spec (BR-SIGNUP-03) and integrate with parental consent flow for under-16 social signups | UX/UI Designer + Legal Counsel VN | Technical Design Phase |

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

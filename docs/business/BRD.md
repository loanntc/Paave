# BRD — Business Requirement Document
## Paave — Gen Z Fintech Investing App (V1)

**Document version:** 1.0
**Date:** 2026-04-14
**Author:** Business Analysis Team
**Status:** Approved for Development

---

## 1. Problem Statement

### Current Situation

Gen Z investors (age 20–27) in Vietnam and Korea face significant barriers when trying to participate in stock market investing:

- Vietnamese retail investors have no mobile-native app that surfaces real-time HoSE/HNX data in a Gen Z-friendly UX.
- Korean Gen Z investors lack a consolidated mobile tool that aggregates KRX data with editorial context (trend explanations, thematic groupings).
- Existing investment apps (SSI, MBS, Mirae Asset) are designed for experienced traders, with dense UI and no onboarding for first-time investors (F0 segment).
- No app in Vietnam or Korea provides a curated "discovery" layer — users must independently research which stocks are trending, why, and what peers are watching.
- First-time investors drop off due to cognitive overload: too many numbers, no context, no social proof.

### Core Problem

**There is no mobile-first, Gen Z-native app that combines real-time market data, editorial discovery, and portfolio tracking for young retail investors in Vietnam and Korea.**

### Impact

- F0 investors (first-time) cannot make informed decisions without guidance.
- FOMO-driven behavior is not channeled into safe research tools — users turn to unverified Telegram/Facebook groups for stock tips.
- Young investors delay market participation due to intimidation from existing tools.

---

## 2. Business Objectives

| # | Objective | Measurable Target | Timeline |
|---|-----------|-------------------|----------|
| BO-01 | Acquire active users in Vietnam and Korea | 50,000 Monthly Active Users (MAU) within 6 months of launch | Month 6 |
| BO-02 | Retain users through daily utility | Day-7 retention rate ≥ 35% | Month 3 |
| BO-03 | Drive watchlist engagement | ≥ 60% of registered users create at least 1 watchlist entry within first session | Month 1 |
| BO-04 | Validate discovery feature as primary acquisition channel | ≥ 40% of new users cite Discover/Trending as primary engagement surface (via in-app survey) | Month 3 |
| BO-05 | Establish Vietnam as lead market | ≥ 70% of V1 MAU from Vietnam | Month 6 |
| BO-06 | Achieve market data reliability for VN | VN real-time data (HoSE/HNX) available with ≤ 15-second delay from exchange feed | Launch day |
| BO-07 | Reduce F0 onboarding drop-off | Onboarding completion rate ≥ 75% (user reaches Home screen after starting onboarding) | Month 1 |

---

## 3. KPIs

| KPI | Definition | Target | Measurement Method |
|-----|-----------|--------|-------------------|
| MAU | Unique users who open the app at least once in 30 days | 50,000 by month 6 | App analytics (Firebase/Mixpanel) |
| DAU/MAU ratio | Daily engagement stickiness | ≥ 25% | App analytics |
| D7 Retention | % of users who return on day 7 after install | ≥ 35% | Cohort analysis |
| Onboarding completion rate | % of users completing all onboarding steps and reaching Home | ≥ 75% | Funnel analytics |
| Watchlist adoption | % of registered users with ≥ 1 watchlist item | ≥ 60% by end of first session | Backend event tracking |
| Discover engagement rate | % of active sessions where user interacts with Discover feed | ≥ 50% | In-app event tracking |
| VN data latency | Time delta between HoSE/HNX exchange tick and in-app display | ≤ 15 seconds | Server-side monitoring |
| App crash rate | % of sessions ending in crash | ≤ 0.5% | Crashlytics |
| Notification opt-in rate | % of users who enable at least 1 push notification | ≥ 45% | Push permission analytics |

---

## 4. Scope

### 4.1 In Scope (V1)

| Feature Area | Description |
|---|---|
| Onboarding | Nationality detection, market preference selection, quick KYC (name, email, nationality) |
| Home Screen | Portfolio value hero widget, VN-Index/KOSPI market snapshot, trending stocks section, personalized watchlist |
| Discover / Trending Feed | Curated stock cards with editorial "why it's hot" hook, social proof counter, theme filters (AI, K-pop, Vietnam Growth, etc.) |
| Stock Detail | Price chart (static image/data table for V1), key stats (P/E, volume, 52w high/low), analyst sentiment summary, Add to Watchlist and price alert actions |
| Portfolio Tracking | Holdings overview (manually entered or imported), unrealized P&L display, transaction history list |
| Markets Module | VN market real-time data (HoSE/HNX), Korea market data (web search + model knowledge), global overview (web search + model knowledge) |
| Notifications | Price alerts (user-defined threshold), market open/close notifications, watchlist price movement alerts |
| User Account | Registration, login, profile settings, market preference management |

### 4.2 Out of Scope (V1)

| Item | Reason |
|---|---|
| Actual buy/sell order execution | No brokerage license; V1 is research + watchlist only |
| Crypto trading or data | Out of product focus for V1 |
| Social features (community posts, messaging, follower system) | Phase 2 roadmap |
| Web application | Mobile-only for V1 |
| TradingView chart integration | Planned for V2; V1 uses static price charts |
| Real-time data for Korea/Global markets | V1 uses web search + model knowledge; real-time feeds in V2 |
| Brokerage account linking | Phase 2 feature |
| In-app portfolio tax reporting | Out of scope |
| Multi-language UI beyond Vietnamese, Korean, English | Post-launch |

---

## 5. Stakeholders

| Role | Name / Team | Responsibility |
|---|---|---|
| Product Owner | Paave Product Team | Final sign-off on feature scope and priority |
| Business Analyst | BA Team | Requirements authoring, acceptance criteria, traceability |
| Engineering Lead | Mobile + Backend Teams | Technical feasibility, architecture decisions |
| Mobile Engineers | iOS + Android Teams | Feature implementation |
| Backend Engineers | API + Data Team | Market data feeds, API layer, notification system |
| Data Provider | VN exchange data vendor (HoSE/HNX feed) | Real-time VN stock data |
| UX/UI Designer | Design Team | Toss-inspired design system, screen flows |
| QA Team | QA Team | Test case execution, regression testing |
| Marketing Team | Growth Team | User acquisition campaigns, app store optimization |
| Legal / Compliance | Legal Team | KYC data handling, user privacy (PDPA / PIPA compliance) |
| End Users | Gen Z (age 20–27) in Vietnam and Korea | Primary consumers of the product |

---

## 6. Assumptions

- VN real-time market data feed (HoSE/HNX) is licensed and available at launch.
- Korea and global market data for V1 will be sourced via web search integration and model knowledge; real-time feed SLA is not guaranteed.
- App will launch on both iOS (App Store) and Android (Google Play) simultaneously.
- KYC in V1 is lightweight (email + nationality) — no identity document verification required for V1.
- Push notifications are delivered via FCM (Android) and APNs (iOS).
- The app does not execute trades; all "buy" actions are redirected to a partner broker link or deferred to V2.

---

## 7. Constraints

- V1 launch timeline: within 6 months of project kickoff.
- No real-money transaction processing in V1.
- All user data must comply with Vietnam's Cybersecurity Law (Decree 13/2023/ND-CP) and Korea's PIPA.
- App must function on devices running iOS 15+ and Android 10+.
- Maximum acceptable API response time for market data: 3 seconds for 95th percentile of requests.

---

*Document end. Proceed to FRD for functional decomposition.*

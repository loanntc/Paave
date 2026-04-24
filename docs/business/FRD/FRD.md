# FRD — Functional Requirement Document (Master Index)
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Document version:** 2.4
**Date:** 2026-04-21
**Author:** Business Analysis Team
**Status:** Approved for Development
**Linked BRD:** BRD.md v2.2 + BRD-addendum-v2.3.md
**Supersedes:** FRD v2.2 (inline monolith)
**Companion documents:**
- `FRD-module-B-v2.3.md` — Paper Trading Engine amendments (v2.3 delta)
- `FRD-gaps-v2.4.md` — Gap-fix FRs and amendments (v2.4 delta; authoritative over v2.2/v2.3 where in conflict)
- `SRD.md` v2.0 — System logic and API contracts
- `SRD-order-engine-v2.3.md` — Order engine amendments

---

## How to Use This Document

This file is the **master combination index**. Every functional requirement for Paave lives in a dedicated module file in the same `FRD/` folder. Each module file is:
- **Self-contained** — no cross-file references needed to build or test a module
- **Authoritative** — incorporates all deltas from v2.1 → v2.2 → v2.3 → v2.4
- **Developer-ready** — full Input / Output / Precondition / Postcondition / Edge Cases per FR

This master file retains:
1. **Scope notes** — product direction decisions from each version
2. **Feature overview** — summary table of all modules
3. **Module directory** — links and FR ranges for all 16 module files
4. **Consolidated Business Rules** — all BR-xx entries from v2.2 + v2.3 + v2.4
5. **Traceability Matrix** — BRD objective → FR → module file mapping

> **For developers and QA:** navigate directly to the relevant module file. The inlined FR text previously in this file has been superseded by the module files.

---

## Table of Contents

1. [Version History](#version-history)
2. [Scope Notes — v2.1](#v21-scope-notes)
3. [Scope Notes — v2.2](#v22-scope-notes)
4. [Scope Notes — v2.3](#v23-scope-notes)
5. [Scope Notes — v2.4](#v24-scope-notes)
6. [Feature Overview](#feature-overview)
7. [Module Directory](#module-directory)
8. [Business Rules — Consolidated](#business-rules--consolidated)
9. [Traceability Matrix](#traceability-matrix)

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| v1.0 | 2026-04-01 | Initial FRD |
| v2.0 | 2026-04-10 | Paper trading as primary pillar; social trading renamed; brokerage partner Module I added |
| v2.1 | 2026-04-20 | Scope shift: paper trading = main; AI demoted; brokerage bridge V1.x |
| v2.2 | 2026-04-20 | VN Gen Z sole primary; multi-method signup (email/Google/Apple/Zalo); onboarding personalization |
| v2.3 | 2026-04-20 | Order engine amendments (lot size, ATO/ATC, GTC expiry); portfolio reset dialog; Korean estimated-fill label |
| v2.4 | 2026-04-21 | 12 QA gap fixes: forgot password, biometric auth, multi-device sessions, deep link routing, DOB correction, onboarding step count, UTC+7 age boundary, ATO/ATC no-match, QUEUED_AFTER_HOURS TTL, AI LEARN_MODE card, already-crossed price alert, post char limit |

---

## V2.1 Scope Notes

Three framing shifts from v2.0:

- **Paper trading is the product**, not a feature. It is the primary pillar; Module B is the spine of the FRD. All other modules exist to feed, socialize, or graduate out of paper trading.
- **Social Trading renames Social Features.** Module F is a track-record-visible social-trading layer, not a peer-learning forum. Education ceases to be a first-class module.
- **Brokerage Partner Integration** is added as Module I (V1.x). Paave remains unlicensed and handles no funds; real trading is executed by licensed securities-company partners on their own infrastructure.

Removed from scope in v2.1 (was in v2.0 Module E / elsewhere):
- Pre-trade AI risk-score card and suggested position size (FR-AI-04 in v2.0).
- Personalized learning paths, 90-second micro-lessons, spaced repetition (FR-AI-06 in v2.0).
- Echo-chamber behavioral detection (subset of FR-AI-07 in v2.0).

Still deferred to V2+: full social feed (copy trading, following feed), leaderboard v2, Morning Call AI briefing, public portfolio sharing, pre-trade AI advisory surfaces.

---

## V2.2 Scope Notes

Three additive deltas in v2.2:

- **Vietnam Gen Z is the sole PRIMARY persona.** All scope, copy, marketing, personalization defaults, and success metrics are Vietnam-first. KR and US/Global market data remain in V1 **for reference only** — labeled "Reference" in every surface, no SLA, no primary-persona product decisions driven by KR/US needs. KR localization, KR social community, and KR marketing campaigns are deferred to V2+.
- **Multi-method signup is core V1 scope.** V1 ships with four signup methods on day one: email + password, Google OAuth, Apple OAuth, and Zalo OAuth (BR-SIGNUP-01). New FRs: FR-04.1 Signup Method Selection, FR-05 Email/Password Signup, FR-05.1 Google OAuth, FR-05.2 Apple OAuth, FR-05.3 Zalo OAuth, FR-05.4 Post-Handshake DOB Prompt, FR-05.5 Account Linking. Updates: FR-07 Login routes to the method used at registration; no password is ever set for social-only accounts.
- **Onboarding collects industrial preferences + investment goal.** Two new steps (FR-08.1 Industrial Preferences multi-select; FR-08.2 Investment Goal single-choice) are inserted between the age-gate routing and the consent screen. These fields seed Discover personalization (BR-ONBOARD-04), weekly challenge difficulty (BR-ONBOARD-05), and home widgets. `onboarded_at` flag flips only when both fields (or explicit "Skip" on preferences) plus goal are persisted.

Deferred to V2+ from v2.2 scope:
- Additional social providers (Facebook, KakaoTalk, Line, Naver).
- KR-localized marketing and KR-localized social communities.
- Document-based KYC at signup (V1.x partner-path only; V2+ for Paave itself).

---

## V2.3 Scope Notes

Four amendments in v2.3 (see `FRD-module-B-v2.3.md` and `BRD-addendum-v2.3.md`):

- **Lot size enforcement:** VN market enforces 100-share lot minimum; orders not in multiples of 100 rejected with E-PT-111. Decision Option A/B/C still pending PO (see REVIEW-self-and-po-v2.4.md Decision #1).
- **ATO/ATC order types in V1:** Specified but pending PO confirmation (Decision #2). Engineering estimate: +2–3 days for V1 inclusion vs. defer.
- **GTC expiry:** VN limit orders expire after 30 days (authoritative over SRD v2.0 "Good Till Cancelled" language). BR-PT-12 added.
- **Portfolio reset dialog amendment:** Must state the count of open orders that will be cancelled before confirming reset.

---

## V2.4 Scope Notes

Twelve gap-fix FRs in v2.4 (see `FRD-gaps-v2.4.md`). All are unblocked and ready for engineering. Authoritative over contradictory language in v2.2/v2.3:

| Gap | Resolution |
|-----|------------|
| GAP-QA-01 Forgot Password | FR-AUTH-07 (new) — 3-sub-flow: request → OTP → new password |
| GAP-QA-02 Multi-device sessions | FR-AUTH-09 (new) — max 5 concurrent, remote revocation |
| GAP-QA-03 Onboarding step count | FR-08 amended — email path = 5 steps; social OAuth = 6 steps |
| GAP-QA-04 DOB timezone | FR-AGE-04 amended — UTC+7 (ICT) is authoritative; BR-AGE-05 added |
| GAP-QA-05 ATO/ATC no-match | FC-PT-25 + E-PT-400 defined; cancel_reason = ATO_ATC_NO_MATCH |
| GAP-QA-06 QUEUED_AFTER_HOURS TTL | BR-PT-16 — 48-hour TTL; cancel_reason = QUEUE_TTL_EXPIRED |
| GAP-QA-07 AI LEARN_MODE card | FR-AI-01 amended — educational variant; no P&L monetary language |
| GAP-QA-08 Already-crossed alert | EC-ALT-01 added to FR-28 — trigger within ≤15s of creation |
| GAP-QA-09 Deep link unauthenticated | FR-NOTIF-01 (new) — 4 app-state variants; pending_deep_link TTL = 5 min |
| GAP-QA-10 Post char limit conflict | FR-SOC-03 amended — 500 chars authoritative (SRD §4.10 was correct) |
| GAP-QA-11 Biometric auth | FR-AUTH-08 (new) — optional enrollment; local Keychain/Keystore; 3-failure fallback |
| GAP-QA-12 DOB correction | FR-ACCT-DOB-01 (new) — locked after first entry; manual support ticket only |

PO decisions still blocking development: Decision #1 (lot size), Decision #2 (ATO/ATC V1 scope), Decision #3 (KR/Global Trader Score), Biometric V1 scope, Admin panel for DOB tickets V1 scope.

---

## Feature Overview

| Feature | Module File | Pillar | Actor | Goal |
|---------|-------------|--------|-------|------|
| **Paper Trading Engine** | [10-paper-trading.md](10-paper-trading.md) | **PRIMARY** | LEARN_MODE / FULL_ACCESS | Simulate market and limit orders on HOSE/HNX (VN primary), KOSPI/KOSDAQ (reference), global tickers (reference) with virtual funds |
| **Social Trading** | [13-social-trading.md](13-social-trading.md) | PRIMARY | Registered User | Follow traders, view per-ticker feeds, share trade receipts, size conviction from community signal |
| **Multi-Method Signup** | [01-onboarding-authentication.md](01-onboarding-authentication.md) | PRIMARY | New User | Register via email/password, Google, Apple, or Zalo |
| **Onboarding Personalization** | [01-onboarding-authentication.md](01-onboarding-authentication.md) | PRIMARY | New User | Capture industrial preferences + investment goal |
| Forgot Password | [01-onboarding-authentication.md](01-onboarding-authentication.md) | Supporting | Registered User | Reset password via email OTP (v2.4) |
| Biometric Authentication | [01-onboarding-authentication.md](01-onboarding-authentication.md) | Supporting | Registered User | Optional biometric login (v2.4) |
| Home Screen | [02-home-screen.md](02-home-screen.md) | Supporting | Registered User | Surface paper portfolio, followed traders, market snapshot, trending stocks |
| Discover / Trending Feed | [03-discover-feed.md](03-discover-feed.md) | Supporting | Registered User | Browse curated stock cards with preference-weighted ranking |
| Stock Detail | [04-stock-detail.md](04-stock-detail.md) | Supporting | Registered User | View price data, key stats, community feed, and place paper trades |
| Portfolio Tracking (Paper) | [05-portfolio-tracking.md](05-portfolio-tracking.md) | Supporting | Registered User | Track virtual holdings, P&L, and trade history |
| Markets Module | [06-markets.md](06-markets.md) | Supporting | Registered User | Browse VN market data (primary, real-time); KR + Global as **reference only** |
| Notifications + Deep Links | [07-notifications.md](07-notifications.md) | Supporting | Registered User | Price alerts, nudges, portfolio updates, deep link routing (v2.4) |
| User Account + Sessions | [08-user-account.md](08-user-account.md) | Supporting | Registered User | Profile, language, preferences, linked providers, multi-device sessions, DOB correction |
| Age Gate | [09-age-gate.md](09-age-gate.md) | Supporting | New User | Enforce age-appropriate feature access; UTC+7 age boundary (v2.4) |
| Gamification | [11-gamification.md](11-gamification.md) | Supporting | Registered User | Earn XP, advance Trader Tiers, complete weekly challenges |
| AI Insights P0 | [12-ai-insights.md](12-ai-insights.md) | Supporting | Registered User | Post-trade insight cards (LEARN_MODE educational variant); natural-language stock queries |
| AI Insights P1 (V1.x) | [12-ai-insights.md](12-ai-insights.md) | Supporting | Registered User | Weekly portfolio health check and behavioral nudges |
| Social Trading | [13-social-trading.md](13-social-trading.md) | Supporting | Registered User | Posts (500-char limit, authoritative), follows, trade receipts |
| Language System | [14-language-system.md](14-language-system.md) | Supporting | Registered User | VN/KR/EN language selection; locale-appropriate financial terminology |
| Legal / Disclaimers | [15-legal-disclaimers.md](15-legal-disclaimers.md) | Supporting | Registered User | Investment, AI, paper-trading, minor, and brokerage-partner disclaimers; data consent |
| **Brokerage Partner Integration (V1.x)** | [16-brokerage-integration.md](16-brokerage-integration.md) | PRIMARY (V1.x) | FULL_ACCESS User, Tier 3+, ≥ 30 paper trades | Open a real account at a licensed partner broker |

---

## Module Directory

All module files live alongside this file in `docs/business/FRD/`. Each file is self-contained and authoritative for its FR range.

### [01 — Onboarding & Authentication](01-onboarding-authentication.md)

**FR range:** FR-01 to FR-08.2, FR-AUTH-07, FR-AUTH-08
**Topics:**
- FR-01 Splash Screen
- FR-02 Welcome Screen
- FR-03 Nationality Detection
- FR-04 Market Preference (deprecated)
- FR-04.1 Signup Method Selection
- FR-05 Email/Password Registration
- FR-05.1 Google OAuth
- FR-05.2 Apple OAuth
- FR-05.3 Zalo OAuth
- FR-05.4 Post-Handshake DOB Prompt
- FR-05.5 Account Linking
- FR-06 Email Verification (OTP)
- FR-07 Login (multi-method routing)
- FR-08 Onboarding Progress Bar (email = 5 steps; social = 6 steps — v2.4 amendment)
- FR-08.1 Industrial Preferences
- FR-08.2 Investment Goal
- FR-AUTH-07 Forgot Password *(new — v2.4)*
- FR-AUTH-08 Biometric Authentication *(new — v2.4)*

---

### [02 — Home Screen](02-home-screen.md)

**FR range:** FR-09 to FR-14
**Topics:**
- FR-09 Home Screen Layout
- FR-10 Portfolio Summary Widget
- FR-11 Market Snapshot Widget
- FR-12 Trending Stocks Strip
- FR-13 Social Feed Preview
- FR-14 Quick Trade Button

---

### [03 — Discover / Trending Feed](03-discover-feed.md)

**FR range:** FR-15 to FR-22
**Topics:**
- FR-15 Discover Feed Layout
- FR-16 Stock Card (editorial + social proof)
- FR-17 Feed Ranking Algorithm
- FR-18 Cashtag Search
- FR-19 Theme / Sector Filter
- FR-20 Trending Stocks List
- FR-21 Watchlist Add from Feed
- FR-22 Feed Personalization (industrial prefs + goal)

---

### [04 — Stock Detail](04-stock-detail.md)

**FR range:** FR-23 to FR-29
**Topics:**
- FR-23 Stock Detail Screen
- FR-24 Price Chart
- FR-25 Key Stats Panel
- FR-26 Community Feed (per-ticker)
- FR-27 Watchlist Toggle
- FR-28 Price Alert — including EC-ALT-01 already-crossed behavior *(v2.4 amendment)*
- FR-29 Paper Trade Launch (quick entry)

---

### [05 — Portfolio Tracking](05-portfolio-tracking.md)

**FR range:** FR-30 to FR-35
**Topics:**
- FR-30 to FR-34 Manual Portfolio Tracking *(deprecated — retained for backward compat)*
- FR-35 Paper Portfolio P&L Color Scheme

---

### [06 — Markets](06-markets.md)

**FR range:** FR-36 to FR-41
**Topics:**
- FR-36 Markets Tab Layout
- FR-37 VN Market (HOSE/HNX/UPCOM) — primary, real-time ≤15s SLA
- FR-38 KR Market (KOSPI/KOSDAQ) — reference only, no SLA
- FR-39 Global Market — reference only, no SLA
- FR-40 Market Indices Display
- FR-41 Market Session Status Indicator

---

### [07 — Notifications](07-notifications.md)

**FR range:** FR-42 to FR-47, FR-NOTIF-01
**Topics:**
- FR-42 Notification Center
- FR-43 Price Alert Trigger
- FR-44 Watchlist Movement Nudge
- FR-45 Portfolio Health Nudge (P1)
- FR-46 Social Activity Notification
- FR-47 Order Status Notification
- FR-NOTIF-01 Deep Link Routing (foreground / backgrounded / cold start / session expired) *(new — v2.4)*

---

### [08 — User Account](08-user-account.md)

**FR range:** FR-48 to FR-53, FR-AUTH-09, FR-ACCT-DOB-01
**Topics:**
- FR-48 Profile Screen
- FR-49 Account Settings
- FR-49.1 Linked Providers Panel
- FR-50 Change Password
- FR-51 Language Selector
- FR-52 Notification Preferences
- FR-53 Account Deletion
- FR-AUTH-09 Multi-Device Session Policy (max 5 concurrent; remote revocation) *(new — v2.4)*
- FR-ACCT-DOB-01 DOB Correction (locked; support ticket only) *(new — v2.4)*

---

### [09 — Age Gate](09-age-gate.md)

**FR range:** FR-AGE-01 to FR-AGE-04
**Topics:**
- FR-AGE-01 DOB Collection at Registration
- FR-AGE-02 Under-13 Block
- FR-AGE-03 13–15 Parental Consent (V3 deferred)
- FR-AGE-04 16–17 LEARN_MODE + UTC+7 age boundary *(v2.4 amendment)*
- Feature tier matrix: LEARN_MODE vs FULL_ACCESS
- Brokerage CTA DOM-level suppression for LEARN_MODE

---

### [10 — Paper Trading Engine](10-paper-trading.md)

**FR range:** FR-PT-01 to FR-PT-08
**Topics:**
- FR-PT-01 Virtual Balance & Reserve Ledger
- FR-PT-02 Market Order (MARKET)
- FR-PT-03 Limit Order (LO)
- FR-PT-04 ATO Order (09:00–09:15 ICT pre-opening)
- FR-PT-05 ATC Order (14:30–14:45 ICT)
- FR-PT-06 Order State Machine (all valid transitions)
- FR-PT-07 QUEUED_AFTER_HOURS (KR/Global after-hours; 48h TTL — v2.4 amendment)
- FR-PT-07.1 ATO/ATC No-Match Cancellation (FC-PT-25, E-PT-400 — v2.4 amendment)
- FR-PT-08 Portfolio Reset
- All 15 FC-PT-xx failed cases (market orders) with error codes and user messages
- All 19 FC-LIM-xx failed cases (limit orders) with error codes and user messages
- All 5 market specs: HOSE / HNX / UPCOM / KRX / Global with session window tables
- 26 error codes (E-PT-101 through E-PT-400)

---

### [11 — Gamification](11-gamification.md)

**FR range:** FR-GAME-01 to FR-GAME-05
**Topics:**
- FR-GAME-01 XP System
- FR-GAME-02 Trader Tier Advancement
- FR-GAME-03 Weekly Challenges
- FR-GAME-04 Challenge Difficulty (seeded by investment goal)
- FR-GAME-05 Leaderboard (V1: within-cohort only)

---

### [12 — AI Insights](12-ai-insights.md)

**FR range:** FR-AI-01 to FR-AI-05
**Topics:**
- FR-AI-01 Post-Trade Insight Card — LEARN_MODE educational variant / FULL_ACCESS P&L variant *(v2.4 amendment)*
- FR-AI-02 Natural Language Stock Query
- FR-AI-03 AI Response Guardrails
- FR-AI-04 Portfolio Health Check (P1)
- FR-AI-05 Behavioral Nudges (P1)

---

### [13 — Social Trading](13-social-trading.md)

**FR range:** FR-SOC-01 to FR-SOC-05
**Topics:**
- FR-SOC-01 Post Composer
- FR-SOC-02 Post Feed (per-ticker + global)
- FR-SOC-03 Post Character Limit — **500 chars authoritative** *(v2.4 amendment; SRD §4.10 confirmed correct)*
- FR-SOC-04 Follow / Unfollow
- FR-SOC-05 Trade Receipt Share

---

### [14 — Language System](14-language-system.md)

**FR range:** FR-LANG-01 to FR-LANG-02
**Topics:**
- FR-LANG-01 Language Selection (VN default for VN users)
- FR-LANG-02 Financial Terminology Locale (VND formatting, percentage display)

---

### [15 — Legal / Disclaimers](15-legal-disclaimers.md)

**FR range:** FR-LEGAL-01 to FR-LEGAL-03
**Topics:**
- FR-LEGAL-01 Investment Disclaimer (per-session-first-view; trilingual)
- FR-LEGAL-02 AI Disclaimer (appended to every AI response; non-collapsible)
- FR-LEGAL-03 Data Consent at Registration (no pre-checked boxes)

---

### [16 — Brokerage Partner Integration (V1.x)](16-brokerage-integration.md)

**FR range:** FR-BRK-01 to FR-BRK-06
**Status:** All deferred to V1.x — not in V1 scope
**Topics:**
- FR-BRK-01 Partner Directory
- FR-BRK-02 Brokerage CTA Placement
- FR-BRK-03 Account-Link Handoff
- FR-BRK-04 Ticker Deep-Link into Partner
- FR-BRK-05 Partner Callback & Linked-Account Status
- FR-BRK-06 Paper-to-Real Attribution (Anonymous)

---

## Business Rules — Consolidated

All business rules from v2.2 + amendments from v2.3 + new rules from v2.4. Numbered rules from individual module files take precedence in case of conflict; this table is the authoritative consolidation.

### Core Rules (BR-01 to BR-46 — v2.2)

| Rule ID | Description |
|---------|-------------|
| BR-01 | All users default to Vietnam (VN) as their market preference. Market preference is not user-configurable in V1/V2. |
| BR-02 | A user can add a maximum of 100 stocks to their watchlist. Attempting to add a 101st stock shows an error: "Watchlist full. Remove a stock to add another." |
| BR-03 | A user can set a maximum of 1 price alert per stock. Setting a new alert for a stock with an existing alert overwrites the previous alert. |
| BR-04 | Price alert notifications are one-time triggers (SINGLE_FIRE default). Once triggered and notification sent, the alert is automatically deactivated. RECURRING mode available via FR-28 settings. |
| BR-05 | A stock must have editorial content (a "why it's hot" hook and theme badge) to appear in the Discover feed. Stocks without editorial content are excluded. |
| BR-06 | The "X users watching" social proof counter reflects the real-time count of users who have that stock in their watchlist. Updated server-side every 5 minutes. |
| BR-07 | Analyst sentiment consensus: Buy% ≥ 70% → "Strong Buy"; Buy% 50–69% → "Buy"; Buy% 40–49% AND Sell% ≤ 30% → "Neutral"; Sell% 50–69% → "Sell"; Sell% ≥ 70% → "Strong Sell." |
| BR-08 | Paper portfolio P&L calculations use virtual prices from the real-time feed. The app does not connect to brokerage accounts. |
| BR-09 | Market data for VN (HoSE/HNX) sourced from real-time exchange data feed. KR and Global data from web search / model knowledge; carries disclaimer for potential delay up to 24 hours. |
| BR-10 | The app does not execute real buy or sell orders. All trades are simulated with virtual funds. |
| BR-11 | Watchlist movement notifications capped at 3 per user per day. Top 3 selected by highest absolute daily change percentage. |
| BR-12 | Login locked for 15 minutes after 5 consecutive failed attempts. Timer resets after successful login. |
| BR-13 | Email OTP valid for 10 minutes, single-use. New OTP request immediately invalidates existing OTP. |
| BR-14 | All monetary values displayed in VND. Virtual portfolio balance denominated in VND. |
| BR-15 | Discover feed must display minimum 10 cards before scroll. Fewer than 10 available → show all without infinite scroll. |
| BR-16 | Feature tier (LEARN_MODE / FULL_ACCESS) evaluated server-side on every session init. Client cannot self-upgrade feature tier. |
| BR-17 | Paper portfolio starting balance: VND 500,000,000. Reset restores to exactly this amount. |
| BR-18 | "Tiền ảo / 가상 자금 / Virtual Funds" label is mandatory on all paper trading screens. Cannot be dismissed or hidden. |
| BR-19 | AI responses must never contain buy/sell recommendations, price targets, or suggested position sizes. Language patterns matching "buy X", "sell X", "you should invest in X" are filtered server-side. |
| BR-20 | Max 1 AI behavioral nudge per user per calendar day (user's local timezone). |
| BR-21 | All AI content must append the educational disclaimer defined in FR-LEGAL-02 in the user's active language. |
| BR-22 | Data consent (FR-LEGAL-03) checkboxes must not be pre-checked. Consent timestamp and ToS version stored on user record. |
| BR-23 | Social-trading posts require minimum 1 $TICKER cashtag and 1 sentiment selection before publish. 60-second cancel window enforced. |
| BR-24 | Real name never shown on public social profile unless user explicitly opts in via Settings. Default is pseudonym only. |
| BR-25 | Trader Tier can only increase, never decrease, regardless of score changes. |
| BR-26 | Investment disclaimer (FR-LEGAL-01) shown on first view of each screen type per session. Cannot be permanently dismissed. |
| BR-27 | Behavioral nudge flags (FR-AI-05) are logged to the user's Risk Discipline score component for the weekly Trader Score. |
| BR-28 | Age verified at registration via DOB. Minimum age to register: 16 (or 13 with parental consent, deferred to V3). Under 13: registration blocked entirely. |
| BR-29 | **AI never stands alone.** No top-level AI-only tab, no standalone chat launcher outside a ticker or portfolio context. |
| BR-30 | **Paave never executes a real-money securities order.** All real-money execution is performed by the licensed brokerage partner in Module I under the partner's own license. |
| BR-31 | **Brokerage CTA eligibility gate:** partner CTAs render only for users 18+, Trader Tier 3+, with ≥ 30 paper trades. Ineligible users never receive the CTA in any surface, including markup. |
| BR-32 | **Brokerage handoff payload is whitelisted:** `{ paave_user_id, market, optional ticker_context }`. Any additional field (DOB, email, paper balance, order details) is stripped before send and logged as a P0 compliance violation. |
| BR-33 | **Brokerage disclaimer (BR-DISC-05):** every partner surface renders the partner-handoff disclaimer in the user's language with partner legal name and license number substituted. Non-dismissible at the CTA moment. |
| BR-34 | **Anonymous attribution only:** the paper-to-real attribution pipeline stores ticker + timestamp bucket only; never real-money amounts, never partner-side user IDs. |
| BR-35 | **Multi-method signup mandatory (v2.2):** V1 ships with four signup methods at launch — email/password, Google, Apple, Zalo. Removing any method in V1 is a P0 release blocker. Zalo may ship dark if provider approval is delayed (RISK-17). |
| BR-36 | **Apple parity on iOS (v2.2):** on iOS, "Sign in with Apple" must be rendered with equal prominence whenever Google or Zalo is rendered (App Store Guideline 4.8). Any iOS build without Apple parity is a launch blocker. |
| BR-37 | **Post-handshake DOB is non-skippable (v2.2):** social-OAuth accounts are pinned in `PENDING_DOB` state until FR-05.4 is completed. Force-quit-and-reopen returns to FR-05.4. No app surface outside the DOB screen is reachable in `PENDING_DOB`. |
| BR-38 | **No duplicate account on conflict (v2.2):** if a social-OAuth email matches an existing Paave account, Paave does NOT create a second row; FR-05.5 account-linking runs instead. Apple private-relay linking keys on Apple Sub ID. |
| BR-39 | **OAuth provider failure isolation (v2.2):** if a single provider is unreachable, only that provider's button is disabled; other methods remain usable. No silent retry loops; status checked every 60s server-side. |
| BR-40 | **OAuth tokens never logged, never displayed (v2.2):** OAuth access and refresh tokens are encrypted at rest and never emitted to application logs, analytics, crash reports, or user-facing surfaces. |
| BR-41 | **Social-only accounts have no password (v2.2):** FR-07 login rejects password attempts on social-only accounts with a "Sign in with [provider]" redirect — never a password prompt, never a reset link. FR-50 Change Password is hidden for such accounts. |
| BR-42 | **Minimal OAuth scope (v2.2):** only email/profile (Google), name/email (Apple), id/name/avatar (Zalo) are requested. No phone, friends list, address, gender, or birthday scope is requested on any provider. Scope review is quarterly. |
| BR-43 | **Industrial preferences: enum, multi-select, max 10 (v2.2):** `industrial_prefs` is an array of approved sector enum values (Banking, Real Estate, Tech, Consumer, Energy, Healthcare, Industrials, Materials, Utilities, Retail). No freeform. Min 0 (explicit "Skip" only), max 10. Localized labels via i18n; DB stores canonical English slug. |
| BR-44 | **Investment goal: enum, single-choice, required (v2.2):** `investment_goal` is a non-null enum from `{learn_explore, grow_savings, beat_inflation, high_returns, long_term_wealth, just_for_fun}`. Onboarding cannot complete without it. `onboarded_at` is only set when all required fields are persisted. |
| BR-45 | **Discover ranking honors preferences (v2.2):** Discover ranker boosts cards matching the user's `industrial_prefs` by a configurable weight. Empty-preference (Skip) path falls back to VN trending (primary), KR/Global as "Reference"-chipped cards further down. |
| BR-46 | **KR + Global are reference-only data in V1 (v2.2):** every KR or Global card/detail page renders a persistent "Reference" chip. Paper trades on KR/Global tickers use best-available price with "Estimated price" label. No SLA. VN is the sole SLA-backed market (BO-06). |

### Paper Trading Rules — v2.3 Amendment

| Rule ID | Description |
|---------|-------------|
| BR-PT-12 | **VN limit order GTC expiry (v2.3):** VN limit orders expire after 30 days from submission date. Status → EXPIRED. Reserve released. Push notification: "Your limit order for [TICKER] has expired after 30 days." Authoritative over SRD v2.0 "Good Till Cancelled" language. |

### v2.4 Gap-Fix Rules

| Rule ID | Description |
|---------|-------------|
| BR-AUTH-05 | **Forgot-password OTP max attempts:** max 5 OTP attempts per reset session. On 6th failure: reset session invalidated; user must restart from FR-AUTH-07.1. Error: "Too many attempts. Please restart the password reset process." |
| BR-AUTH-06 | **Password reuse prohibition:** new password must not match any of the user's last 5 passwords. Comparison is hash-based (bcrypt/argon2id). Error E-1013: "Your new password must be different from your last 5 passwords." |
| BR-AUTH-07 | **Biometric: device-local only.** Biometric templates are stored in the device OS (iOS Keychain / Android Keystore). No biometric data, biometric hash, or biometric reference is ever transmitted to Paave servers. The server receives only the standard JWT; biometric success is a local precondition to token retrieval. |
| BR-AUTH-08 | **Multi-device session maximum:** a user account may have at most 5 concurrent active sessions across all devices. On login that would create a 6th session, the oldest active session is automatically revoked (its refresh token invalidated). The displaced device receives push notification: "You were signed out because your account was logged in on a new device." |
| BR-AUTH-09 | **Remote revocation is immediate:** when a user revokes a session from the Active Sessions screen (FR-AUTH-09.3), the target device's refresh token is immediately invalidated. The next API call from that device returns 401 and the client navigates to the Login screen. |
| BR-AGE-05 | **UTC+7 age boundary (v2.4):** age eligibility is evaluated using today's date in ICT (UTC+7). Formula: `age_satisfied = (today_date_UTC7 >= dob + N_years)`. DOB is stored as date-only (YYYY-MM-DD). Time-of-day and device timezone are irrelevant. |
| BR-SOC-03 | **Social post character limit = 500 (v2.4):** the authoritative maximum for a social trading post is 500 characters. This supersedes the 280-character limit referenced in FRD v2.2 FR-SOC-03. SRD §4.10 (VARCHAR(500)) was already correct; no schema change required. |
| BR-PT-16 | **QUEUED_AFTER_HOURS TTL = 48 hours (v2.4):** orders in QUEUED_AFTER_HOURS status that have not transitioned to PENDING within 48 hours of submission are auto-cancelled by the Expiry Cron. Status → CANCELLED, cancel_reason = QUEUE_TTL_EXPIRED. Reserve released. Push notification sent. |
| BR-NOTIF-01 | **pending_deep_link TTL = 5 minutes (v2.4):** a deep link stored during unauthenticated cold-start (FR-NOTIF-01.3) expires after 5 minutes. If the user completes authentication after 5 minutes, navigate to the app home screen instead of the stored deep link destination. |
| BR-ACCT-DOB-01 | **DOB is locked after first entry (v2.4):** once a user's date of birth is saved during registration (FR-05 or FR-05.4), it cannot be changed through any self-service flow. Correction requires submitting an in-app support ticket (FR-ACCT-DOB-01.2). Only support agents with admin panel access may update the DOB field. |

---

## Traceability Matrix

| BRD Objective | Description | Linked FRs | Module File(s) |
|---------------|-------------|------------|---------------|
| BO-01 | Acquire 50K Vietnamese Gen Z MAU through low-barrier mobile-first onboarding | FR-01..FR-08.2, FR-AUTH-07, FR-AUTH-08, FR-AGE-01, FR-AGE-03, FR-LEGAL-03, FR-LANG-01 | [01](01-onboarding-authentication.md), [09](09-age-gate.md), [14](14-language-system.md), [15](15-legal-disclaimers.md) |
| BO-02 | D7 retention ≥ 40% | FR-09..FR-14, FR-GAME-01..05, FR-AI-01..05 | [02](02-home-screen.md), [11](11-gamification.md), [12](12-ai-insights.md) |
| BO-03 | Watchlist adoption ≥ 60% | FR-21, FR-27, FR-28, FR-43, FR-44 | [03](03-discover-feed.md), [04](04-stock-detail.md), [07](07-notifications.md) |
| BO-04 | Discover engagement ≥ 50% daily | FR-15..FR-22 | [03](03-discover-feed.md) |
| BO-05 | VN-primary concentration ≥ 90% VN MAU | FR-37, BR-46 | [06](06-markets.md) |
| BO-06 | VN data latency ≤ 15s | FR-37, BR-46 | [06](06-markets.md) |
| BO-07 | Onboarding completion ≥ 75% | FR-04.1, FR-05..FR-05.5, FR-08, FR-08.1, FR-08.2, BR-43, BR-44 | [01](01-onboarding-authentication.md) |
| **BO-08** | **Paper trading as primary loop** (≥ 70% activation, ≥ 3 trades/user/week) | **FR-PT-01..FR-PT-08**, FR-35, FR-AI-01, FR-GAME-01, FR-23..29 | [10](10-paper-trading.md), [04](04-stock-detail.md), [12](12-ai-insights.md) |
| **BO-09** | **Social-trading engagement ≥ 35%** | **FR-SOC-01..05**, FR-16, FR-23..29, FR-NOTIF-01 | [13](13-social-trading.md), [07](07-notifications.md) |
| BO-10 | Gamification Tier 2 ≥ 40% | FR-GAME-01..05, FR-08.2 | [11](11-gamification.md) |
| BO-11 | AI insight card read-through ≥ 55% | FR-AI-01..05, BR-29 | [12](12-ai-insights.md) |
| BO-12 | Age 16–17 segment with zero violations | FR-AGE-01..04, FR-05.4, FR-LEGAL-01..03, FR-PT-06, BR-28, BR-31, BR-37, BR-AGE-05 | [09](09-age-gate.md), [01](01-onboarding-authentication.md), [15](15-legal-disclaimers.md) |
| **BO-13** (V1.x) | **Brokerage bridge initiation ≥ 20% of eligible users** | **FR-BRK-01..06**, BR-30..34 | [16](16-brokerage-integration.md) |
| **BO-14** | **Multi-method signup ≥ 60% social, Zalo ≥ 25% VN** | **FR-04.1, FR-05..FR-05.5**, FR-07, FR-49.1, BR-35..42 | [01](01-onboarding-authentication.md), [08](08-user-account.md) |
| **BO-15** | **Onboarding personalization capture ≥ 90%** | **FR-08.1, FR-08.2**, BR-43, BR-44 | [01](01-onboarding-authentication.md) |
| **BO-16** | **Preference-driven retention lift ≥ 8pp** | FR-08.1, FR-08.2, FR-15..17, FR-GAME-04, BR-45 | [01](01-onboarding-authentication.md), [03](03-discover-feed.md), [11](11-gamification.md) |

### v2.4 Gap-Fix FR Traceability

| FR | Gap | Business Objective |
|----|-----|-------------------|
| FR-AUTH-07 | GAP-QA-01 Forgot Password | BO-01 (reduce signup friction from locked-out accounts) |
| FR-AUTH-08 | GAP-QA-11 Biometric Auth | BO-01 (low-barrier login experience) |
| FR-AUTH-09 | GAP-QA-02 Multi-device sessions | BO-01 (cross-device retention) |
| FR-08 amendment | GAP-QA-03 Onboarding step count | BO-07 (accurate progress bar → completion ≥ 75%) |
| FR-AGE-04 amendment | GAP-QA-04 DOB timezone | BO-12 (zero violations; age boundary precision) |
| FC-PT-25 + E-PT-400 | GAP-QA-05 ATO/ATC no-match | BO-08 (correct order handling) |
| BR-PT-16 | GAP-QA-06 QUEUED_AFTER_HOURS TTL | BO-08 (correct order lifecycle) |
| FR-AI-01 amendment | GAP-QA-07 AI LEARN_MODE card | BO-11 (AI card read-through; BO-12 zero violations for minors) |
| EC-ALT-01 (FR-28) | GAP-QA-08 Already-crossed alert | BO-03 (watchlist + alert reliability) |
| FR-NOTIF-01 | GAP-QA-09 Deep link routing | BO-09 (social notification engagement) |
| FR-SOC-03 amendment | GAP-QA-10 Post char limit 500 | BO-09 (social engagement; consistent with DB schema) |
| FR-ACCT-DOB-01 | GAP-QA-12 DOB correction | BO-12 (zero violations; controlled correction process) |

---

*Document end. This master index (v2.4) is the authoritative entry point for the Paave FRD. Proceed to individual module files in the same `FRD/` folder for implementation-ready FR detail. For system logic and API contracts, see `SRD.md`.*

*Pending PO decisions (Decision #1 lot size, Decision #2 ATO/ATC V1 scope, Decision #3 KR Trader Score, Biometric V1 scope, Admin panel for DOB tickets V1 scope) are tracked in `REVIEW-self-and-po-v2.4.md`.*

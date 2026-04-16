# FRD — Functional Requirement Document
## Paave — Gen Z Fintech Investing App (V3)

**Document version:** 3.0
**Date:** 2026-04-16
**Author:** Business Analysis Team
**Status:** Approved for Development
**Linked BRD:** BRD.md v3.0
**Previous version:** FRD v2.2

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Functional Requirements — Core (FR-01 to FR-53)](#functional-requirements--core)
   - [FR-01 to FR-08: Onboarding](#onboarding)
   - [FR-09 to FR-14: Home Screen](#home-screen)
   - [FR-15 to FR-22: Discover / Trending Feed](#discover--trending-feed)
   - [FR-23 to FR-29: Stock Detail](#stock-detail)
   - [FR-30 to FR-35: Portfolio Tracking](#portfolio-tracking)
   - [FR-36 to FR-41: Markets Module](#markets-module)
   - [FR-42 to FR-47: Notifications](#notifications)
   - [FR-48 to FR-53: User Account](#user-account)
3. [Module A: Age Gate (FR-AGE-01 to FR-AGE-04)](#module-a-age-gate)
4. [Module B: Paper Trading Engine (FR-PT-01 to FR-PT-06)](#module-b-paper-trading-engine)
5. [Module C: Gamification (FR-GAME-01 to FR-GAME-07)](#module-c-gamification)
6. [Module D: AI System P0 (FR-AI-01 to FR-AI-03)](#module-d-ai-system-p0)
7. [Module E: AI System P1 (FR-AI-04 to FR-AI-07)](#module-e-ai-system-p1)
8. [Module E2: Education System (FR-EDU-01)](#module-e2-education-system)
9. [Module F: Social Features P1 (FR-SOC-01 to FR-SOC-05)](#module-f-social-features-p1)
10. [Module G: Language System (FR-LANG-01 to FR-LANG-02)](#module-g-language-system)
11. [Module H: Legal / Disclaimers (FR-LEGAL-01 to FR-LEGAL-03)](#module-h-legal--disclaimers)
12. [Module I: Daily Engagement (FR-ENGAGE-01 to FR-ENGAGE-03)](#module-i-daily-engagement)
13. [Module J: Investment Health Score (FR-SCORE-01)](#module-j-investment-health-score)
14. [Module K: Monthly Investment DNA Card (FR-CARD-01)](#module-k-monthly-investment-dna-card)
15. [Module L: Structured Investment Curriculum (FR-LEARN-01)](#module-l-structured-investment-curriculum)
16. [Business Rules](#business-rules)
17. [Traceability Matrix](#traceability-matrix)

---

## V3 Scope Notes

- Paper trading is now **core functionality**, not a future add-on. FR-09 Portfolio hero widget (FR-09), FR-30–FR-35 Portfolio Tracking, and FR-08 onboarding now reference paper trading as the primary portfolio experience.
- **V3 additions (VestPaper competitive analysis):** First Trade Guided Experience (FR-ONBOARD-01), Trade Reasoning Field (FR-PT-07), Post-Trade Reflection (FR-PT-08), Daily Engagement module (FR-ENGAGE-01–03), Investment Health Score replacing Trader Score (FR-SCORE-01), Monthly DNA Card (FR-CARD-01), Structured Curriculum (FR-LEARN-01).
- The following features previously deferred **remain deferred**: full social feed (copy trading, following feed), leaderboard v2, Morning Call AI briefing, portfolio sharing, brokerage integration.
- Real money trading is **not in scope** for V1, V2, or V3. All buy/sell actions are simulated.

---

## 1. Feature Overview

| Feature | Actor | Goal |
|---------|-------|------|
| Onboarding | New User | Complete registration with DOB, market preference, and consent to access the app |
| Home Screen | Registered User | View paper portfolio summary, market snapshot, trending stocks, and weekly challenge |
| Discover / Trending Feed | Registered User | Browse curated stock cards with editorial context and social proof |
| Stock Detail | Registered User | View price data, key stats, community feed, and place paper trades |
| Portfolio Tracking (Paper) | Registered User | Track virtual holdings, P&L, and trade history |
| Markets Module | Registered User | Browse VN/KR market data |
| Notifications | Registered User | Receive price alerts, coaching nudges, and portfolio health updates |
| User Account | Registered User | Manage profile, language, preferences, and security settings |
| Age Gate | New User | Enforce age-appropriate feature access based on verified DOB |
| Paper Trading Engine | LEARN_MODE / FULL_ACCESS User | Simulate market orders and limit orders on HOSE/HNX/KOSPI/KOSDAQ |
| Gamification | Registered User | Earn XP, advance trader tiers, complete weekly challenges |
| AI System P0 | Registered User | Post-trade explanations and natural language stock queries |
| AI System P1 | Registered User | Pre-trade cards, portfolio health checks, personalized learning, behavioral coaching |
| Social Features P1 | Registered User | Social proof on stocks, per-ticker feed, post creation, follow system |
| Language System | Registered User | VN/KR/EN language selection with locale-appropriate financial terminology |
| Legal / Disclaimers | Registered User | Investment disclaimers, AI disclaimers, and data consent |
| Biometric Auth | Returning User | Authenticate via Face ID / fingerprint without password |
| Social Login | New User / Returning User | Register or log in via Google / Apple OAuth |
| Two-Factor Authentication | Registered User | Optional OTP-based second factor for password and social logins |
| Milestone Celebrations | Registered User | Celebrate portfolio achievements with animations and shareable cards |
| Portfolio Goal Setting | Registered User | Set and track virtual portfolio value targets |
| Inline Tooltips | Registered User | Tap any financial term for instant plain-language explanation |
| First Trade Guided Experience | New User | Complete first simulated trade within 90 seconds of account creation |
| Trade Reasoning Field | Registered User | Record reasoning for each trade to build disciplined investing habits |
| Post-Trade Reflection | Registered User | Reflect on closed positions to improve future decision-making |
| Daily Challenge (Market Prediction) | Authenticated User | Predict daily market outcomes for coins, streaks, and education |
| Morning Brief Notification | System | Pre-market push notification with sentiment, portfolio alerts, and challenge teaser |
| Stock Ticker Daily Puzzle | Authenticated User | Guess VN-listed company from progressive hints for coins and learning |
| Investment Health Score (IHS) | System / Registered User | Weekly behavioral score measuring investment process quality (not returns) |
| Monthly Investment DNA Card | System / Registered User | Auto-generated monthly shareable card with investment style and stats |
| Structured Investment Curriculum | Authenticated User | 3-level progressive curriculum with quizzes and virtual coin rewards |

---

## 2. Functional Requirements — Core

> **V2 Note:** FR-01–FR-53 are carried forward from v1.0 with scope updates noted inline. Paper trading replaces the manual portfolio entry flow as the primary portfolio experience. FR-30–FR-35 (manual portfolio tracking) are **deprecated in favor of Module B** and may be removed in a future cleanup pass; they are retained here for backward compatibility reference.

---

### ONBOARDING

#### FR-01 — Splash Screen and App Entry

- **Actor:** Unauthenticated User
- **Description:** Splash screen displayed for 2 seconds on first launch; navigates to Welcome. On subsequent opens, routes to Home (valid session), Login (expired session).
- **V2 Update:** On first launch post-registration, also triggers age gate flow (FR-AGE-01) and data consent screen (FR-LEGAL-03) before Home.
- **Key Rules:** Session check happens before splash completes for returning users.
- **Acceptance Criteria:**
  - Given first launch → Welcome shown after 2s splash.
  - Given returning user with valid session → Home shown directly.
- **Edge Cases:** App killed mid-onboarding → returns to last incomplete step.
- **Priority:** P0

---

#### FR-02 — Welcome Screen

- **Actor:** Unauthenticated User
- **Description:** Displays "Create Account" and "Log In" CTAs. No market data shown.
- **Key Rules:** No market data fetched until authenticated.
- **Acceptance Criteria:**
  - Given unauthenticated user → two CTAs displayed; tapping each navigates correctly.
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-03 — Nationality Detection

- **Actor:** New User (during registration)
- **Description:** Auto-detects device locale/country. `vi`/`VN` → Vietnam; `ko`/`KR` → Korea; all others → Global. User can override.
- **V2 Update:** Language detection now also feeds FR-LANG-01 (Language Selection).
- **Key Rules:** Detection is read-only at registration start; does not change device settings.
- **Acceptance Criteria:**
  - Given device locale `vi` → Vietnam pre-selected on Market Preference screen.
  - Given device locale `en-US` → Global pre-selected.
- **Edge Cases:**
  - No locale set (custom ROMs) → defaults to Global.
  - Given VN user → Discover feed defaults to Vietnam filter; trending stocks section shows VN stocks first. *(traces to BO-05)*
- **Priority:** P0

---

#### FR-04 — Market Preference Selection

- **Actor:** New User
- **Description:** Market Preference screen with three options: Vietnam (HoSE/HNX), Korea (KRX), Global. User selects exactly one; pre-populated from FR-03.
- **Key Rules:** Exactly one selection required to proceed.
- **Acceptance Criteria:**
  - Given user taps "Korea" → Korea highlighted, others deselected, Continue enabled.
- **Edge Cases:** User does not tap any option → Continue button disabled.
- **Priority:** P0

---

#### FR-05 — User Registration (KYC — Lightweight)

- **Actor:** New User
- **Description:** Collects: Full name, Email, Password, Nationality (pre-filled). Sends verification email on submit.
- **V2 Update:** DOB field added (FR-AGE-01). Data consent screen (FR-LEGAL-03) shown before this step.
- **Input:**
  - Full name: 2–100 chars, Unicode-allowed
  - Email: RFC 5322, max 254 chars
  - Password: 8–64 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char (`!@#$%^&*`)
  - Nationality: VN | KR | OTHER
  - DOB: date picker (see FR-AGE-01)
- **Key Rules:** Email uniqueness enforced. DOB required and validated before account created.
- **Acceptance Criteria:**
  - Given valid form → account created `PENDING_VERIFICATION`, verification email sent within 30s.
  - Given duplicate email → field error "An account with this email already exists."
- **Edge Cases:** Email already registered but unverified → resend OTP, navigate to verification screen.
- **Priority:** P0

---

#### FR-06 — Email Verification

- **Actor:** New User
- **Description:** 6-digit OTP sent to email; valid 10 minutes; resend after 60-second cooldown; max 5 attempts before 15-minute lockout.
- **Key Rules:** New OTP immediately invalidates previous OTP.
- **Acceptance Criteria:**
  - Given correct OTP within 10 minutes → account `ACTIVE`, navigate to Home.
  - Given 5th incorrect attempt → "Too many attempts. Please try again in 15 minutes."
- **Edge Cases:** OTP in spam → hint shown below input field.
- **Priority:** P0

---

#### FR-07 — Login

- **Actor:** Returning User
- **Description:** Email + password authentication. JWT access token (1h), refresh token (30d). Generic error on failure (no email/password differentiation).
- **Key Rules:** 5 consecutive failures → 15-minute lockout.
- **Acceptance Criteria:**
  - Given valid credentials → Home screen, valid session.
  - Given 5th failed attempt → account locked 15 minutes.
- **Edge Cases:** `PENDING_VERIFICATION` account → "Please verify your email to continue."
- **Priority:** P0

---

#### FR-07B — Biometric Authentication

- **Actor:** Returning User
- **Description:** After first successful login, user is prompted to enable biometric authentication (Face ID on iOS, fingerprint on Android). When enabled, subsequent app opens authenticate via biometric instead of email/password. Biometric data is stored in device secure enclave (iOS Keychain / Android Keystore) — never transmitted to servers.
- **Key Rules:**
  - First login always requires email/password (biometric cannot be the initial auth)
  - Biometric enrollment is opt-in; prompted once after first login. If declined, user can enable later in Settings.
  - 3 consecutive biometric failures → automatic fallback to email/password login
  - Biometric status stored server-side as boolean flag (biometric_enabled) — actual biometric data never leaves device
  - Device change → biometric re-enrollment required
  - Logout invalidates biometric session (user must re-authenticate with email/password on next login)
- **Acceptance Criteria:**
  - Given first login → biometric enrollment prompt shown after reaching Home; "Enable" stores biometric; "Not now" dismisses.
  - Given biometric enabled + app reopened → Face ID / fingerprint prompt shown; successful auth → Home screen.
  - Given 3 failed biometric attempts → email/password login screen shown with message "Biometric failed. Please log in with your password."
  - Given user logs out → next app open requires email/password regardless of biometric setting.
- **Edge Cases:**
  - Device has no biometric hardware → enrollment prompt not shown; biometric option hidden in Settings.
  - User changes device biometric (e.g., adds new fingerprint) → biometric session invalidated; re-enrollment required.
  - OS biometric permission revoked → graceful fallback to email/password; toast "Biometric access was removed. Log in with your password."
- **Priority:** P0

---

#### FR-07C — Social Login (Google / Apple)

- **Actor:** New User / Returning User
- **Description:** Users can register or log in using Google Sign-In (OAuth 2.0) or Apple Sign In. Social login creates a Paave account linked to the social identity. If an account with the same email already exists, the social identity is linked to the existing account (with user confirmation). Social login bypasses email/password entry but still requires DOB (FR-AGE-01) and consent (FR-LEGAL-03) for new registrations.
- **Key Rules:**
  - Supported providers: Google, Apple. Additional providers (Kakao, Zalo) planned for V2.
  - New user via social login: account created with email from social provider; DOB and consent screens still required before account activation.
  - Returning user via social login: direct authentication, no password needed.
  - If social email matches an existing Paave email/password account: prompt user to link accounts. "Tai khoan voi email nay da ton tai. Lien ket voi [Google/Apple]?" User must confirm. On confirm, social identity linked; both login methods available.
  - If user declines linking: social login fails; user directed to email/password login.
  - Social token validated server-side; never stored on client beyond the session.
  - Account created via social login can set a password later via Settings (FR-50) for email/password fallback.
  - Social login available on both Welcome screen and Login screen.
- **Acceptance Criteria:**
  - Given new user taps "Continue with Google" → Google OAuth flow opens → on success → DOB + Consent screens shown → account created → Home.
  - Given returning user with linked Google account taps "Continue with Google" → direct auth → Home (no DOB/consent screens).
  - Given social email matches existing account → link prompt shown → user confirms → accounts linked → Home.
  - Given social email matches but user declines → "Vui long dang nhap bang email va mat khau" message → Login screen.
  - Given Apple Sign In with hidden email relay → account created with Apple relay email; display name from Apple profile.
- **Edge Cases:**
  - Google/Apple auth cancelled by user mid-flow → return to Welcome/Login screen, no partial state.
  - Social provider unavailable (server error) → toast "Dang nhap [Google/Apple] khong kha dung. Thu lai sau." → fallback to email/password.
  - Social token expired during registration flow (user was slow on DOB/consent) → re-trigger social auth silently; if fails → restart flow.
  - User removes social link from Settings → social login disabled; must use email/password or biometric.
  - Apple "Hide My Email" relay → email stored as relay address; profile shows display name only.
- **Priority:** P1 (V1.1 — not launch but fast follow)

---

#### FR-07D — Two-Factor Authentication (2FA)

- **Actor:** Registered User
- **Description:** Optional 2FA adds a second verification step after password login. When enabled, after entering correct email/password, user receives a 6-digit OTP to their registered email. OTP must be verified before session is granted. 2FA is opt-in via Settings → Security. When 2FA is enabled, biometric login bypasses 2FA (biometric is already a second factor via device possession).
- **Key Rules:**
  - 2FA is opt-in. Default: disabled. Enabled via Settings → Security → "Xac thuc hai buoc".
  - Enabling 2FA: user must re-enter password to confirm. OTP sent to registered email. On OTP verification, 2FA activated.
  - Login with 2FA enabled: email/password → partial token → OTP sent → OTP verified → full session. Partial token valid for 5 minutes.
  - Biometric login with 2FA enabled: biometric success → full session (no OTP required — biometric + device = two factors).
  - Social login with 2FA enabled: social auth → OTP sent → OTP verified → full session.
  - Disabling 2FA: user must re-enter password to confirm. Immediate effect.
  - OTP for 2FA: 6 digits, 5-minute expiry, max 5 attempts, 15-minute lockout after 5 failures.
  - 2FA OTP is separate from registration OTP — different otpId namespace.
- **Acceptance Criteria:**
  - Given 2FA disabled → password login goes directly to Home (no OTP step).
  - Given 2FA enabled + password login → OTP sent to email → OTP screen shown → correct OTP → Home.
  - Given 2FA enabled + biometric login → Home directly (no OTP).
  - Given 2FA enabled + social login → OTP sent → OTP screen → correct OTP → Home.
  - Given user enables 2FA in Settings → password re-entered → OTP sent → OTP verified → "Xac thuc hai buoc da bat" confirmation.
  - Given 5 failed 2FA OTP attempts → 15-minute lockout → "Qua nhieu lan thu. Vui long thu lai sau 15 phut."
- **Edge Cases:**
  - 2FA OTP expires (5 min) → "Ma da het han. Gui lai ma moi." → resend link active.
  - User loses email access → cannot complete 2FA → must contact support for account recovery. Help text: "Khong nhan duoc ma? Lien he support@paave.app"
  - 2FA enabled but user switches to biometric → biometric bypasses 2FA (by design).
  - Partial token expired (5 min) → "Phien dang nhap het han. Vui long dang nhap lai." → restart login.
  - Device offline during OTP send → "Khong the gui ma. Kiem tra ket noi mang."
- **Priority:** P1 (V1.1)

---

#### FR-08 — Onboarding Progress Indicator

- **Actor:** New User
- **Description:** Step indicator during registration flow. Steps: Data Consent → Market Selection → Account Details → Verify Email (4 steps in V2).
- **V2 Update:** Step count updated from 3 to 4 to include Data Consent step (FR-LEGAL-03).
- **Key Rules:** Step indicator always visible during registration; not shown on Login screen.
- **Acceptance Criteria:**
  - Given user on Account Details step → step 3 of 4 highlighted.
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-ONBOARD-01 — First Trade Guided Experience ("Aha Moment")

- **Actor:** User who completed onboarding
- **Description:** Guided walkthrough to complete first simulated trade within 90 seconds of account creation. Flow: (1) Welcome message with virtual balance displayed; (2) App pre-selects one stock based on user's market (VN: VCB, KR: Samsung, Global: NVIDIA); (3) One-tap buy at market price with pre-filled quantity (~50M VND equivalent); (4) Micro-animation showing shares added to portfolio; (5) Confirmation: "Day la co phieu dau tien trong portfolio cua ban."
- **Key Rules:**
  - First trade is pre-facilitated — user cannot reach empty portfolio state after onboarding
  - If market is closed (after 14:30 or weekend), system uses previous close price and queues order for next open
  - First trade confirmation skips the standard "Are you sure?" modal to reduce friction
  - First trade triggers FR-GAME-06 milestone celebration (first trade milestone)
  - XP +10 awarded for completing first trade
- **Acceptance Criteria:**
  - Given user completes onboarding → guided first trade screen shown within 2s
  - Given user taps "Mua ngay" → simulated buy placed at last traded price → portfolio shows position → confirmation shown
  - Given market is closed → order queued with note "Lenh se duoc thuc hien khi mo cua phien toi"
- **Edge Cases:**
  - User force-closes app during guided trade → resumes at guided trade on next open
  - Pre-selected stock is trading halted → substitute with next most-liquid stock in same market
  - User has already completed first trade (re-install) → skip guided experience
- **Priority:** P0

---

### HOME SCREEN

#### FR-09 — Portfolio Value Hero Widget

- **Actor:** Registered User
- **Description:** Home screen hero shows total paper portfolio value. If no positions, shows "Start paper trading" CTA.
- **V2 Update:** Now displays paper portfolio (virtual funds). "Tiền ảo / 가상 자금" label shown beneath value (per FR-PT-06). Real portfolio tracking removed from V2 core UI.
- **Key Rules:** Virtual funds label always visible alongside portfolio value.
- **Acceptance Criteria:**
  - Given user with no paper trades → "Start paper trading" CTA shown.
  - Given user with positions → total virtual portfolio value with virtual label shown.
- **Edge Cases:** Market data unavailable → last known value with stale indicator.
- **Priority:** P0

---

#### FR-10 — Market Snapshot Widget

- **Actor:** Registered User
- **Description:** Compact market snapshot: VN-Index (VN users), KOSPI (KR users), S&P 500 + Nasdaq (Global). Refreshes every 30 seconds while in foreground.
- **Key Rules:** Market closed → last close value with "Market Closed" label and next open time.
- **Acceptance Criteria:**
  - Given VN user during market hours → VN-Index value, point change, % change displayed.
  - Given 30s timer fires → data refreshes without user action.
- **Edge Cases:** Feed outage → cached data with banner "Live data temporarily unavailable."
- **Priority:** P0

---

#### FR-11 — Trending Stocks Section on Home

- **Actor:** Registered User
- **Description:** Horizontal scrollable "Trending Now" section with top 5 stocks from user's market. Each card: ticker, company name, price, daily % change.
- **V2 Update:** Cards now show social proof counts (from FR-SOC-01) inline.
- **Key Rules:** Tapping a card navigates to Stock Detail.
- **Acceptance Criteria:**
  - Given VN user → 5 VN trending stocks shown; tapping one navigates to Stock Detail.
- **Edge Cases:** Fewer than 5 trending stocks → show available count; no error.
- **Priority:** P0

---

#### FR-12 — Personalized Watchlist on Home

- **Actor:** Registered User
- **Description:** Up to 5 watchlist stocks with live price and daily change. "See All" link to full Watchlist screen. Empty state: "Your watchlist is empty."
- **Key Rules:** Watchlist max 100 stocks (BR-02).
- **Acceptance Criteria:**
  - Given watchlist with 3 stocks → 3 rows shown; "See All" not shown.
  - Given empty watchlist → empty state message with "Explore" button.
- **Edge Cases:** Watchlist stock delisted → price shows "Delisted", P&L frozen.
- **Priority:** P0

---

#### FR-13 — Home Screen Data Refresh

- **Actor:** Registered User
- **Description:** Auto-refresh every 30 seconds (foreground). Pull-to-refresh supported. On refresh failure, previous data retained with toast.
- **Key Rules:** Toast: "Unable to refresh. Showing last available data."
- **Acceptance Criteria:**
  - Given pull-to-refresh → loading spinner shown ≤2s, data updated.
- **Edge Cases:** No internet → toast shown; cached data retained.
- **Priority:** P0

---

#### FR-14 — Bottom Navigation

- **Actor:** Registered User
- **Description:** Persistent 5-tab bottom nav: Home, Discover, Markets, Portfolio, Profile. Active tab highlighted. Re-tapping active tab resets scroll position.
- **Key Rules:** Screen state preserved when switching tabs (except scroll on re-tap).
- **Acceptance Criteria:**
  - Given user taps Portfolio tab → Portfolio screen shown; Home tab no longer active.
- **Edge Cases:** None.
- **Priority:** P0

---

### DISCOVER / TRENDING FEED

#### FR-15 — Discover Feed Layout

- **Actor:** Registered User
- **Description:** Vertically scrollable feed of curated stock cards from user's preferred market. Minimum 10 cards on initial render; infinite scroll in batches of 10.
- **Key Rules:** Only stocks with editorial CMS content appear (BR-05).
- **Acceptance Criteria:**
  - Given VN market preference → VN stock cards loaded, minimum 10.
- **Edge Cases:** Fewer than 10 cards available → show all; no infinite scroll triggered.
- **Priority:** P0

---

#### FR-16 — Stock Card Content

- **Actor:** Registered User
- **Description:** Each card: ticker, company name, price + daily change (color-coded), editorial hook (≤120 chars), social proof counter ("X users watching"), theme badge, add-to-watchlist heart icon.
- **V2 Update:** Social proof now also includes sentiment ratio and Trending badge (from FR-SOC-01).
- **Key Rules:** Social proof counter polled every 30 seconds.
- **Acceptance Criteria:**
  - Given a stock with 50 watchers → "50 users watching" shown; updates within 30s when new user adds to watchlist.
- **Edge Cases:** Counter returns null → display "— users watching."
- **Priority:** P0

---

#### FR-17 — Theme Filters on Discover

- **Actor:** Registered User
- **Description:** Horizontally scrollable theme chips: All, AI, K-pop, Vietnam Growth, Banking, Technology, Energy, Consumer. Default: All. One active at a time.
- **Key Rules:** Feed reloads on filter change; session-level only (does not update profile).
- **Acceptance Criteria:**
  - Given "AI" filter tapped → feed shows only AI-tagged stocks.
  - Given no stocks match filter → "No stocks in this theme right now. Check back soon."
- **Edge Cases:** Network timeout on filter change → previous feed retained with toast.
- **Priority:** P0

---

#### FR-18 — Market Filter on Discover

- **Actor:** Registered User
- **Description:** Market toggle (Vietnam | Korea | Global) above theme chips. Default matches user's market preference. Session-level; does not update profile.
- **Key Rules:** Switching market resets theme filter to "All."
- **Acceptance Criteria:**
  - Given KR user switches to Vietnam filter → Vietnam stocks shown, theme resets to All.
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-19 — Infinite Scroll on Discover

- **Actor:** Registered User
- **Description:** Next batch (10 cards) loads when user scrolls within 200px of feed bottom. Loading spinner shown during fetch (≤3s). End-of-feed message: "You've seen all trending stocks."
- **Key Rules:** End message only shown when no more cards available.
- **Acceptance Criteria:**
  - Given user scrolls near bottom → 10 more cards appended; spinner visible during load.
- **Edge Cases:** Network unavailable on scroll → spinner stops; toast "No internet connection."
- **Priority:** P1

---

#### FR-20 — Add to Watchlist from Discover Feed

- **Actor:** Registered User
- **Description:** Heart icon on stock card toggles watchlist membership. Optimistic UI: icon state changes instantly; backend confirmed async. Revert on backend failure.
- **Key Rules:** Watchlist capped at 100 stocks (BR-02). Adding beyond 100 shows error.
- **Acceptance Criteria:**
  - Given heart tapped → icon fills immediately, toast "Added to Watchlist."
  - Given backend error → icon reverts, toast "Something went wrong."
- **Edge Cases:** Watchlist full (100 items) → error "Watchlist full. Remove a stock to add another."
- **Priority:** P0

---

#### FR-21 — Stock Card Navigation

- **Actor:** Registered User
- **Description:** Tapping stock card body (excluding heart icon) navigates to Stock Detail. Back navigation returns to same scroll position.
- **Key Rules:** Heart icon tap does not trigger navigation.
- **Acceptance Criteria:**
  - Given stock card tapped → Stock Detail shown; back → feed at same scroll position.
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-22 — Editorial Content Management

- **Actor:** Editorial Team (CMS)
- **Description:** "Why it's hot" hook and theme badge managed via CMS. Only stocks with valid CMS content appear in Discover feed. Updates reflected in app within 5 minutes.
- **Key Rules:** No editorial content → stock excluded from Discover (appears only in Markets/Search).
- **Acceptance Criteria:**
  - Given CMS content published → stock card appears in Discover within 5 minutes.
- **Edge Cases:** CMS content deleted → stock card removed from Discover on next feed refresh.
- **Priority:** P1

---

### STOCK DETAIL

#### FR-23 — Stock Detail Screen Layout

- **Actor:** Registered User
- **Description:** Vertical layout: (1) Header (ticker, company, exchange), (2) Price hero, (3) Price chart, (4) Action buttons (Watchlist, Alert, Paper Trade), (5) Key Stats, (6) Analyst Sentiment, (7) Community Feed tab (FR-SOC-02), (8) Editorial context.
- **V2 Update:** "Paper Trade" button added to action buttons. Community Feed tab added.
- **Key Rules:** Paper Trade button navigates to paper order placement (FR-PT-02/FR-PT-03).
- **Acceptance Criteria:**
  - Given user opens Stock Detail → all 8 sections render; Paper Trade button visible.
- **Edge Cases:** Stock data unavailable → skeleton loaders shown; retry after 3s.
- **Priority:** P0

---

#### FR-24 — Price Chart on Stock Detail

- **Actor:** Registered User
- **Description:** Time range selector: 1D, 1W, 1M, 3M, 1Y. Default: 1D. Line chart, in-app charting library. VN stocks: real-time intraday (1-minute intervals). KR/Global: end-of-day data.
- **Key Rules:** Chart re-renders within 2 seconds of range tap. Unavailable range → "Chart data not available for this period."
- **Acceptance Criteria:**
  - Given 1M tapped on VN stock → chart renders within 2s showing daily closing prices.
- **Edge Cases:** KR chart during live session → shows previous day's close with data delay note.
- **Priority:** P0

---

#### FR-25 — Key Stats on Stock Detail

- **Actor:** Registered User
- **Description:** 9 stats in 3-column grid: Open, Prev Close, Day High, Day Low, 52W High, 52W Low, Volume, Market Cap, P/E Ratio. Unavailable values shown as "—".
- **V2 Update:** Financial terminology displayed in locale-appropriate form per FR-LANG-02.
- **Key Rules:** Values formatted with thousand separators per BR-14. Units: B/T for billion/trillion.
- **Acceptance Criteria:**
  - Given VN user → P/E displays as "Chỉ số P/E"; given KR user → "주가수익비율."
- **Edge Cases:** P/E unavailable (negative earnings) → display "—."
- **Priority:** P0

---

#### FR-26 — Analyst Sentiment on Stock Detail

- **Actor:** Registered User
- **Description:** Buy/Hold/Sell percentage bar. Consensus label per BR-07 thresholds. Analyst count shown. If unavailable: "Analyst sentiment not available for this stock."
- **Key Rules:** BR-07 thresholds determine consensus label.
- **Acceptance Criteria:**
  - Given 75% Buy → "Strong Buy" label with green-dominant bar.
- **Edge Cases:** Zero analysts rated → "Analyst sentiment not available."
- **Priority:** P1

---

#### FR-27 — Add to Watchlist from Stock Detail

- **Actor:** Registered User
- **Description:** Full-width "Add to Watchlist" / "Remove from Watchlist" button. Behavior identical to FR-20.
- **Key Rules:** Optimistic UI; revert on backend failure.
- **Acceptance Criteria:**
  - Given stock not in watchlist → button reads "Add to Watchlist"; tap adds and changes label.
- **Edge Cases:** Watchlist full → error shown.
- **Priority:** P0

---

#### FR-28 — Set Price Alert from Stock Detail

- **Actor:** Registered User
- **Description:** "Set Alert" button opens bottom sheet. User selects Price above / Price below and enters target price. Triggers push notification when condition met.
- **Key Rules:** One alert per stock per user. Setting new alert overwrites existing (BR-03). Alert is one-time (BR-04).
- **Acceptance Criteria:**
  - Given "Price above 55000" set → alert saved, toast "Alert set for [TICKER]."
  - Given target = current price → error "Price must be different from current price."
  - Given price crosses threshold → push within 60s, alert deactivated.
- **Edge Cases:** Push notifications disabled → alert tracked silently, no push sent.
- **Priority:** P0

---

#### FR-29 — Stock Detail Back Navigation

- **Actor:** Registered User
- **Description:** Back button (top-left), hardware back (Android), and swipe-back (iOS) return to previous screen at same scroll position.
- **Key Rules:** Back behavior consistent across all entry points (Discover, Home, Markets, Search).
- **Acceptance Criteria:**
  - Given user navigated from Discover position 8 → back returns to position 8.
- **Edge Cases:** None.
- **Priority:** P0

---

### PORTFOLIO TRACKING

> **V2 Deprecation Note:** FR-30–FR-35 (manual portfolio entry) are superseded by Module B (Paper Trading Engine, FR-PT-01–FR-PT-06). These FRs are retained for reference only and will be removed in V3. The Portfolio tab now displays the paper trading dashboard (FR-PT-04).

#### FR-30 — Portfolio Holdings Overview

- **Actor:** Registered User
- **Description:** *(Deprecated in V2 — see FR-PT-04)* Portfolio screen shows manual holdings with ticker, shares, avg buy price, current price, current value, unrealized P&L.
- **Priority:** Deprecated (V2 → V3 removal)

---

#### FR-31 — Add Holding Manually

- **Actor:** Registered User
- **Description:** *(Deprecated in V2 — see FR-PT-02/FR-PT-03)* Manual holding entry via "+" button form.
- **Priority:** Deprecated

---

#### FR-32 — Edit Holding

- **Actor:** Registered User
- **Description:** *(Deprecated in V2)* Swipe-left edit on holding row.
- **Priority:** Deprecated

---

#### FR-33 — Delete Holding

- **Actor:** Registered User
- **Description:** *(Deprecated in V2)* Swipe-left delete on holding row with confirmation.
- **Priority:** Deprecated

---

#### FR-34 — Transaction History

- **Actor:** Registered User
- **Description:** *(Deprecated in V2 — see FR-PT-04 trade history)* Manual transaction history tab.
- **Priority:** Deprecated

---

#### FR-35 — P&L Color Coding

- **Actor:** Registered User
- **Description:** P&L values color-coded: positive → green (#10B981); negative → red (#EF4444); zero → gray (#9CA3AF). "+" prefix for positive, "−" for negative.
- **V2 Note:** Retained and applied to paper trading P&L throughout app.
- **Key Rules:** Applied to all P&L values across paper portfolio, leaderboard, and profile.
- **Acceptance Criteria:**
  - Given unrealized P&L of +50,000 VND → displays "+50,000" in green.
- **Priority:** P0

---

### MARKETS MODULE

#### FR-36 — Markets Screen Layout

- **Actor:** Registered User
- **Description:** Tabbed interface: Vietnam | Korea | Global. Default tab matches user's market preference. Investment disclaimer shown on first view per session (FR-LEGAL-01).
- **Key Rules:** Disclaimer shown on first view of each tab per session.
- **Acceptance Criteria:**
  - Given KR user → Korea tab active by default.
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-37 — Vietnam Market (Real-Time)

- **Actor:** Registered User
- **Description:** HoSE/HNX real-time data. VN-Index summary, HNX-Index summary, Top 5 Gainers, Top 5 Losers, Top 5 Most Active. Data refreshes every 30 seconds during market hours.
- **Key Rules:** Market hours: 09:00–15:00 ICT, Mon–Fri. Holiday calendar maintained server-side.
- **Acceptance Criteria:**
  - Given 10:30 AM ICT weekday → live VN-Index, 5 gainers, 5 losers, 5 most active shown; data ≤30s old.
  - Given 4:00 PM ICT → "Market Closed" badge; next open time shown.
- **Edge Cases:** Feed outage → cached data with banner; VN-Index null → "—" with error banner.
- **VN Data Latency Monitoring:** VN market data latency is monitored server-side. If latency exceeds 15 seconds for > 5 consecutive ticks, a degraded data banner is shown to users: "Live data may be delayed. We're working on it." *(traces to BO-06)*
- **Priority:** P0

---

#### FR-38 — Korea Market

- **Actor:** Registered User
- **Description:** KOSPI + KOSDAQ indices, Top 5 Gainers, Top 5 Losers. Data sourced from web search / model knowledge (not real-time feed for V1/V2). Delay disclaimer always visible.
- **Key Rules:** Disclaimer banner: "Data may be delayed up to 24 hours. Real-time data coming soon."
- **Acceptance Criteria:**
  - Given Korea tab opened → disclaimer banner visible; KOSPI and KOSDAQ values shown.
- **Edge Cases:** Data unavailable → "Data temporarily unavailable. Please check back later."
- **Priority:** P0

---

#### FR-39 — Global Market Overview

- **Actor:** Registered User
- **Description:** 6 index cards: S&P 500, Nasdaq, Dow Jones, FTSE 100, Nikkei 225, DAX. Web search / model knowledge. Delay disclaimer always visible.
- **Key Rules:** Disclaimer banner shown; values formatted per locale.
- **Acceptance Criteria:**
  - Given Global tab → 6 index cards with daily change; disclaimer visible.
- **Edge Cases:** Partial data → show available indices; missing → "—."
- **Priority:** P1

---

#### FR-40 — Market Search

- **Actor:** Registered User
- **Description:** Full-screen search overlay (search icon top-right). Searches all supported market stocks by ticker or company name. Debounced 300ms. Recent searches (last 5) shown on empty query.
- **Key Rules:** Min 1 character to trigger search.
- **Acceptance Criteria:**
  - Given "VIC" typed → matching stocks appear within 1s.
  - Given no results → "No stocks found for 'XYZ'."
- **Edge Cases:** Network unavailable → "Search unavailable offline."
- **Priority:** P0

---

#### FR-41 — Market Hours Reference

- **Actor:** Registered User
- **Description:** "Market Hours" info section at bottom of Markets screen. Shows all three markets' local open/close times (user's timezone) and live status (Open / Closed / Pre-market).
- **Key Rules:** Status updates in real-time; uses device timezone.
- **Acceptance Criteria:**
  - Given GMT+7 user → VN market shows 09:00–15:00 local; status "Open" if within those hours on a weekday.
- **Edge Cases:** Device timezone unavailable → default to UTC.
- **Priority:** P1

---

### NOTIFICATIONS

#### FR-42 — Push Notification Permission Request

- **Actor:** New User
- **Description:** After email verification, custom in-app modal explains notification value before triggering OS permission dialog. "Allow" → triggers OS dialog. "Skip" → dismisses, preference `notifications_enabled = false`.
- **Key Rules:** No re-request of OS permission after denial (follows OS rules).
- **Acceptance Criteria:**
  - Given "Allow" tapped and OS grants → push token registered; `notifications_enabled = true`.
  - Given "Skip" → no OS dialog; user can enable later in settings.
- **Edge Cases:** OS dialog denied after "Allow" tap → preference set false; no retry.
- **Priority:** P0

---

#### FR-43 — Price Alert Notification

- **Actor:** Registered User (with alert set)
- **Description:** Push notification within 60 seconds of threshold crossed. Title: "[TICKER] Alert Triggered." Body: "[Company] is now at [price] ([±%] today)." Alert deactivated after trigger.
- **Key Rules:** BR-03 (one alert per stock), BR-04 (one-time trigger). Tapping notification → Stock Detail.
- **Acceptance Criteria:**
  - Given VIC alert "Price above 55000" and price crosses 55000 → notification within 60s; alert deactivated.
- **Edge Cases:** Notifications disabled → alert tracked silently; no push.
- **Priority:** P0

---

#### FR-44 — Market Open Notification

- **Actor:** Registered User
- **Description:** Optional push at market open for user's preferred market. "Vietnam market is now open. See what's trending." Togglable in settings. Once per trading day.
- **Key Rules:** Only sent if user opted in; deduped per day.
- **Acceptance Criteria:**
  - Given opt-in → notification at VN market open (09:00 ICT); tapping → Markets tab.
- **Edge Cases:** Market holiday → no notification; next trading day notification sent instead.
- **Priority:** P1

---

#### FR-45 — Market Close Notification

- **Actor:** Registered User
- **Description:** Optional push at market close: "VN-Index closed at [value] ([±%] today)." Togglable. Once per trading day.
- **Key Rules:** Only sent if opted in; uses final close value.
- **Acceptance Criteria:**
  - Given opt-in and market closes → notification with final index value.
- **Edge Cases:** Feed unavailable at close → no notification for that day.
- **Priority:** P1

---

#### FR-46 — Watchlist Price Movement Notification

- **Actor:** Registered User (with watchlist)
- **Description:** End-of-day push for watchlist stocks with ≥±5% daily change. Max 3 notifications per user per day (top 3 by absolute change).
- **Key Rules:** BR-11: cap at 3, selected by highest absolute % change. Opt-in via settings.
- **Acceptance Criteria:**
  - Given 5 watchlist stocks moved ≥5% → top 3 by absolute change notified.
- **Edge Cases:** User has 0 watchlist stocks → no notification sent.
- **Priority:** P1

---

#### FR-47 — Notification History

- **Actor:** Registered User
- **Description:** Notification inbox in Profile. All notification types stored 30 days in reverse chronological order. Unread: bold. Tapping: mark read + navigate to relevant screen. Entries >30 days auto-deleted.
- **Key Rules:** All notification types stored: price alerts, market open/close, watchlist movements, AI coaching (FR-AI-07), portfolio health (FR-AI-05).
- **Acceptance Criteria:**
  - Given 2 price alert notifications → both appear in inbox; unread shown in bold.
- **Edge Cases:** Inbox empty → "No notifications yet."
- **Priority:** P1

---

### USER ACCOUNT

#### FR-48 — User Profile Screen

- **Actor:** Registered User
- **Description:** Profile screen: display name, masked email, nationality, market preference. Sub-links: Notification Settings, Language, Change Password, App Settings, Help & Support, Log Out.
- **V2 Update:** Language Settings link added (FR-LANG-01). Trader Tier badge + XP shown on profile (FR-GAME-01/FR-GAME-02).
- **Key Rules:** Email partially masked: `lo***@gmail.com`.
- **Acceptance Criteria:**
  - Given user navigates to Profile → trader tier badge and XP total visible alongside account details.
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-49 — Edit Profile

- **Actor:** Registered User
- **Description:** Edit display name and market preference. Email not editable in V2. Market preference change updates Home and Markets default.
- **Key Rules:** Display name 2–100 chars, Unicode.
- **Acceptance Criteria:**
  - Given display name updated → Profile reflects new name; Home hero greeting updated.
- **Edge Cases:** Name with only spaces → reject with "Name cannot be blank."
- **Priority:** P0

---

#### FR-50 — Change Password

- **Actor:** Registered User
- **Description:** Current password + new password + confirm new password. All existing refresh tokens invalidated on success. User stays logged in.
- **Key Rules:** New password: same policy as FR-05. Current password must validate.
- **Acceptance Criteria:**
  - Given valid current and new passwords → password changed; all other sessions invalidated.
  - Given wrong current password → "Current password is incorrect."
- **Edge Cases:** New password same as current → "New password must be different from current password."
- **Priority:** P0

---

#### FR-51 — Logout

- **Actor:** Registered User
- **Description:** Confirmation dialog → invalidates JWT and refresh token on backend; clears local session; navigates to Welcome screen; deregisters push token.
- **Key Rules:** Push token deregistered on logout to prevent ghost notifications.
- **Acceptance Criteria:**
  - Given confirmed logout → user on Welcome screen; subsequent app open → Login shown.
- **Edge Cases:** Network unavailable → local session cleared; backend invalidation queued.
- **Priority:** P0

---

#### FR-52 — Notification Settings

- **Actor:** Registered User
- **Description:** Toggle switches for: Price Alerts, Market Open, Market Close, Watchlist Movements, Portfolio Health Check (FR-AI-05), Behavioral Coaching (FR-AI-07). Changes save immediately.
- **V2 Update:** Two new notification types added (Portfolio Health, Behavioral Coaching).
- **Key Rules:** Optimistic toggle; revert on backend failure with toast.
- **Acceptance Criteria:**
  - Given Portfolio Health toggle switched off → weekly health push not sent.
- **Edge Cases:** OS-level notifications disabled → all toggles shown grayed with note to enable in device settings.
- **Priority:** P0

---

#### FR-53 — Help & Support

- **Actor:** Registered User
- **Description:** FAQ (static markdown-rendered), "Contact Us" (email client with `support@paave.app`), "Report a Bug" (in-app form with optional screenshot JPEG/PNG ≤5MB).
- **Key Rules:** FAQ content managed server-side; updates reflected without app update.
- **Acceptance Criteria:**
  - Given "Contact Us" tapped → email client opens with `support@paave.app` pre-filled.
- **Edge Cases:** No email client installed → show email address as copyable text.
- **Priority:** P1

---

## Module A: Age Gate

> **Purpose:** Enforce age-appropriate feature access. Required by Vietnamese financial education compliance and Korean youth digital service regulations.

---

#### FR-AGE-01 — DOB Collection at Registration

- **Actor:** New User
- **Description:** Date of birth field (date picker) required during registration. Must be ≥16 years old to complete registration. Under 16: show message directing to parent consent flow (FR-AGE-02). DOB stored encrypted at rest.
- **Key Rules:**
  - Minimum age: 16. Calculated as: (today − DOB) ≥ 16 years.
  - Ages 13–15: directed to parental consent flow (future implementation).
  - Under 13: registration blocked entirely; "Paave requires users to be at least 13 years old."
  - DOB field: date picker (no free-text); cannot select future dates.
  - DOB encrypted using AES-256 before persistence.
- **Acceptance Criteria:**
  - Given DOB entered making user 17 years old → registration proceeds to FR-AGE-03 LEARN_MODE.
  - Given DOB making user 12 years old → error shown, registration cannot continue.
- **Edge Cases:** User provides false DOB (can't technically prevent) → legal disclaimer that false DOB entry violates ToS; recourse via account review.
- **Priority:** P0

---

#### FR-AGE-02 — Parental Consent Flow

- **Actor:** New User (age 13–15), Parent/Guardian
- **Description:** For users aged 13–15 (future feature, not V2): parent email collected during registration, verification email sent with 24-hour expiry token. Until verified: account locked to educational content only (LEARN_MODE with further restrictions). On parent verification: LEARN_MODE unlocked normally.
- **Key Rules:**
  - Token expires 24h after issue. After expiry, user must request re-send.
  - Account state during pending consent: `PENDING_PARENTAL_CONSENT`.
  - Parent email must be different from child's registration email.
  - Max 3 consent re-send requests per 24h.
- **Acceptance Criteria:**
  - Given 14-year-old registers → parent email collected; account set to `PENDING_PARENTAL_CONSENT`; educational-only access shown.
  - Given parent clicks verification link within 24h → account unlocked to full LEARN_MODE.
- **Edge Cases:** Token expired → user shown re-send option; re-send resets 24h clock.
- **Priority:** P2 (deferred — not in V2 release)

---

#### FR-AGE-03 — Feature Tier Enforcement

- **Actor:** New User / Registered User
- **Description:** Based on verified DOB, system assigns feature tier at registration and re-evaluates on each login:
  - Age 16–17 → `LEARN_MODE`: paper trading, gamification, market data, educational content. Real portfolio tracking blocked with explanation.
  - Age 18+ → `FULL_ACCESS`: all features.
- **Key Rules:**
  - `LEARN_MODE` blocks: real money indicators, brokerage links, any future trading-adjacent features that involve real funds.
  - `LEARN_MODE` shows: contextual explanation when blocked feature is tapped: "You'll unlock full access when you turn 18."
  - Feature tier stored on user profile; evaluated server-side on each session init.
  - Tier upgrade happens via FR-AGE-04.
- **Acceptance Criteria:**
  - Given 16-year-old user taps "Real Portfolio" (future feature) → blocked with age explanation.
  - Given 18-year-old user → all FULL_ACCESS features available.
- **Edge Cases:** DOB birthday occurs between sessions → tier upgraded on next login (FR-AGE-04 prompt shown).
- **Priority:** P0

---

#### FR-AGE-04 — Age Upgrade Prompt

- **Actor:** Registered User (turning 18)
- **Description:** When a user with `LEARN_MODE` tier logs in and their DOB indicates they are now 18+, a full-screen modal prompts: "You're now 18 — unlock full Paave?" with "Unlock Now" and "Maybe Later" buttons. "Unlock Now" upgrades tier to `FULL_ACCESS`. "Maybe Later" dismisses; prompt re-shown on next login until upgrade accepted.
- **Key Rules:**
  - Prompt shown maximum once per login session.
  - Tier upgrade is immediate and server-side on "Unlock Now."
  - DOB re-validation occurs server-side; client-side DOB cannot trigger upgrade alone.
- **Acceptance Criteria:**
  - Given LEARN_MODE user logs in on their 18th birthday → upgrade prompt shown before Home screen.
  - Given "Unlock Now" tapped → tier changes to FULL_ACCESS; prompt not shown on next login.
  - Given "Maybe Later" tapped → Home shown; prompt shown again next login.
- **Edge Cases:** User declines upgrade 5+ times → prompt continues each login (no cap).
- **Priority:** P1

---

## Module B: Paper Trading Engine

> **Purpose:** Core investment simulation. All users start with a virtual portfolio. Paper trading is the primary portfolio interaction for V2. "Tiền ảo / 가상 자금 / Virtual Funds" label mandatory on all paper trading screens.

---

#### FR-PT-01 — Virtual Portfolio Creation

- **Actor:** New User (on registration completion)
- **Description:** Virtual portfolio auto-created on account activation. Starting balance: VND 500,000,000. "Tiền ảo / 가상 자금 / Virtual Funds" label always visible in portfolio header.
- **Key Rules:**
  - Auto-created; user does not configure starting balance.
  - Balance displayed in user's locale currency equivalent (KRW/USD) if KR/Global user, but underlying denomination is VND.
  - Label "Tiền ảo / 가상 자금 / Virtual Funds" is a permanent fixture on the screen — not dismissible.
- **Acceptance Criteria:**
  - Given new user completes registration → virtual portfolio exists with 500M VND balance before first login to Home.
  - Given KR user → balance shown as KRW equivalent with "Virtual Funds" label.
- **Edge Cases:** Portfolio creation fails during registration → retry up to 3 times; if all fail, account created and portfolio creation queued.
- **Priority:** P0

---

#### FR-PT-02 — Place Market Order (Paper)

- **Actor:** Registered User (LEARN_MODE or FULL_ACCESS)
- **Description:** User can place a buy or sell market order for any HOSE/HNX/KOSPI/KOSDAQ stock. Order fills at the next real-time price snapshot (≤15 seconds). Buy orders cannot exceed available virtual cash balance. Sell orders cannot exceed current virtual holdings.
- **Key Rules:**
  - Fill price = price at next price snapshot after order placement (≤15s).
  - Buy: validates cash balance ≥ (quantity × current price × 1.001 to account for transaction simulation).
  - Sell: validates holding quantity ≥ requested sell quantity.
  - Market orders always fill (no partial fills in V2 except at balance limit).
  - "Tiền ảo" label visible on order confirmation screen.
  - AI pre-trade card (FR-AI-04) shown between "Buy" tap and order confirmation.
- **Acceptance Criteria:**
  - Given user places buy order for 100 VIC shares with sufficient balance → order fills within 15s at snapshot price; holdings updated.
  - Given buy order exceeds virtual balance → error "Insufficient virtual funds."
- **Edge Cases:** Price snapshot unavailable at fill time (feed outage) → order queued; fills when feed restores; user notified via toast.
- **Priority:** P0

---

#### FR-PT-03 — Place Limit Order (Paper)

- **Actor:** Registered User
- **Description:** User can place a buy or sell limit order. Order queued. Fills when market price crosses the specified limit price. Auto-expires after 30 days if unfilled.
- **Key Rules:**
  - Buy limit: fills when price ≤ limit price.
  - Sell limit: fills when price ≥ limit price.
  - Expiry: 30 calendar days from order placement; user notified via push on expiry.
  - Virtual cash is reserved (not available for other orders) for pending buy limit orders.
  - User can cancel a pending limit order from Portfolio → Open Orders view.
- **Acceptance Criteria:**
  - Given buy limit order at 45,000 for VIC (currently at 48,000) → order shows as "Open"; fills if price drops to ≤45,000 within 30 days.
  - Given 30 days pass unfilled → order expires; reserved cash returned; user notified.
- **Edge Cases:** Stock halted while limit order is open → order remains open; fills when trading resumes.
- **Priority:** P1

---

#### FR-PT-04 — Portfolio Dashboard (Paper)

- **Actor:** Registered User
- **Description:** Paper Portfolio tab shows: (1) Total virtual portfolio value, (2) Available virtual cash, (3) Holdings list (ticker, quantity, avg buy price, current price, unrealized P&L, unrealized P&L%), (4) Portfolio value chart over time (daily, 1W/1M/3M/1Y ranges), (5) Realized P&L total, (6) Trade history, (7) Open orders.
- **Key Rules:**
  - "Tiền ảo / 가상 자금 / Virtual Funds" label in header permanently.
  - P&L color coding per FR-35.
  - Trade history retained indefinitely (pre-reset entries marked "Pre-Reset").
  - Open orders tab shows pending limit orders (FR-PT-03).
- **Acceptance Criteria:**
  - Given user has 3 holdings → all 3 shown with live prices, P&L, and portfolio chart.
  - Given user taps a holding → navigates to Stock Detail for that stock.
- **Edge Cases:** Stock delisted → holding shown with "Delisted" price indicator; P&L frozen at last known price.
- **Priority:** P0

---

#### FR-PT-05 — Portfolio Reset

- **Actor:** Registered User
- **Description:** User can reset virtual portfolio from Portfolio settings. Confirmation dialog required: "Reset your virtual portfolio? This will close all positions and restore your balance to ₫500,000,000. Trade history will be kept." On confirm: balance reset to 500M VND, all open positions closed at current market price, all open limit orders cancelled, trade history retained and marked "Pre-Reset."
- **Key Rules:**
  - Double confirmation required (modal with explicit "Reset Portfolio" button — no accidental reset).
  - Reset cannot be undone.
  - Post-reset: trade history entries before reset labeled "[Pre-Reset]."
  - AI coaching event logged (if FOMO/panic patterns detected in pre-reset history).
- **Acceptance Criteria:**
  - Given confirmed reset → balance returns to 500M VND; holdings list empty; history shows "[Pre-Reset]" labels.
  - Given "Cancel" tapped → no changes.
- **Edge Cases:** Feed unavailable at reset time → positions closed at last cached price; note shown in history.
- **Priority:** P1

---

#### FR-PT-06 — Virtual Money Label

- **Actor:** Registered User
- **Description:** "Tiền ảo / 가상 자금 / Virtual Funds" label permanently displayed in the header or status bar of every paper trading screen (Portfolio dashboard, order placement, order confirmation, trade history). Cannot be dismissed or hidden by the user.
- **Key Rules:**
  - Label must be visible at all times on all paper trading screens.
  - Label text adapts to user's active language (FR-LANG-01): Vietnamese "Tiền ảo", Korean "가상 자금", English "Virtual Funds."
  - Label must meet minimum contrast ratio (WCAG AA) against all theme backgrounds.
  - This is a legal/clarity requirement — not a design choice; cannot be disabled.
- **Acceptance Criteria:**
  - Given any paper trading screen → label visible in header; confirmed in screenshot test.
  - Given language changed to Korean → label displays "가상 자금."
- **Edge Cases:** Low-contrast mode enabled → label uses forced high-contrast color.
- **Priority:** P0

---

#### FR-PT-07 — Trade Reasoning Field

- **Actor:** Registered User placing a paper trade
- **Description:** Every buy and sell order form includes an optional reasoning field: "Tai sao ban mua/ban co phieu nay?" (Vietnamese) / "Why are you buying/selling this stock?" (English). Max 200 characters. Field is prominently placed above the confirm button. Not required to proceed, but prompted with placeholder text.
- **Key Rules:**
  - Reasoning field visible on every order placement screen (market and limit orders)
  - Entering >=10 characters of reasoning earns +5 IHS points per trade
  - Reasoning stored permanently in order record; surfaced in weekly IHS review and trade journal
  - Reasoning field pre-populated with helpful prompt: "VD: P/E thap hon nganh, doanh thu quy tang..."
- **Acceptance Criteria:**
  - Given user on order placement → reasoning field visible above confirm button with placeholder
  - Given user enters "P/E thap, tang truong tot" → order includes reasoning → +5 IHS points
  - Given user leaves reasoning empty → order proceeds normally, no IHS bonus
- **Edge Cases:**
  - Reasoning field with only spaces/punctuation → treated as empty (no IHS bonus)
  - First trade guided experience (FR-ONBOARD-01) → reasoning field hidden (reduce friction)
- **Priority:** P0

---

#### FR-PT-08 — Post-Trade Reflection Prompt

- **Actor:** Registered User who fully closes a position
- **Description:** When a position is fully sold (0 remaining shares), system prompts structured reflection within 2 seconds. Flow: (1) Outcome display: "Ban vua chot loi +X% / cat lo -X% voi TICKER"; (2) Q1: "Ket qua nay dung voi ky vong cua ban khong?" — Yes / No / Khong chac (3 buttons); (3) Q2: "Ban hoc duoc gi tu trade nay?" — free text, max 300 chars, optional; (4) Contextual lesson link based on trade outcome.
- **Key Rules:**
  - Prompt is non-blocking — user can dismiss within 3 seconds (swipe down or tap outside)
  - Completing Q1 AND Q2 (>=20 characters) earns +10 IHS points
  - Reflection data stored and surfaced in weekly IHS review, trade journal, and monthly DNA card
  - If dismissed, prompt does NOT reappear for that specific trade
  - Reflection prompt appears AFTER post-trade AI card (FR-AI-01) if both are triggered
- **Acceptance Criteria:**
  - Given user sells all shares of VCB → reflection prompt appears within 2s showing P&L result
  - Given user answers both questions → +10 IHS points → journal entry updated with reflection
  - Given user dismisses → prompt gone forever for that trade → no IHS bonus
- **Edge Cases:**
  - Position closed by portfolio reset (FR-PT-05) → no reflection prompt (bulk close, not deliberate sell)
  - Multiple positions closed simultaneously → queue reflections; show one at a time
  - Offline when position closes → reflection prompt shown on next app open
- **Priority:** P0

---

## Module C: Gamification

> **Purpose:** Drive engagement, learning, and retention through XP, tiers, challenges, and streaks. Does not involve real money.

---

#### FR-GAME-01 — XP System

- **Actor:** Registered User
- **Description:** Users earn XP for specific actions. XP total displayed on profile and contributes to Trader Score. XP events:
  - Trade placed (paper): +10 XP
  - Lesson completed: +25 XP
  - Daily login: +5 XP
  - Weekly challenge won: +100 XP
  - Portfolio health improved (week-over-week grade improvement): +15 XP
- **Key Rules:**
  - Daily login XP: once per calendar day (user's local timezone).
  - Trade XP: once per executed trade (not per order placed); deduped per fill event.
  - XP is never deducted.
  - XP total displayed on profile screen below tier badge.
- **Acceptance Criteria:**
  - Given user completes a micro-lesson → XP counter on profile increments by 25.
  - Given user logs in twice in one day → daily login XP awarded only once.
- **Edge Cases:** XP event fires but backend fails → event queued for retry; XP granted eventually (idempotent event ID).
- **Priority:** P1

---

#### FR-GAME-02 — Trader Tiers

- **Actor:** Registered User
- **Description:** 6 tiers determined by cumulative Trader Score (FR-GAME-03). Tier names trilingual:

  | Tier | EN | VN | KR | Min Score |
  |------|----|----|-----|-----------|
  | 1 | Seedling | Mầm non | 새싹 | 0 |
  | 2 | Learner | Người học | 입문자 | 500 |
  | 3 | Investor | Nhà đầu tư | 투자자 | 1,500 |
  | 4 | Trader | Trader | 트레이더 | 3,500 |
  | 5 | Expert | Chuyên gia | 전문가 | 7,500 |
  | 6 | Legend | Huyền thoại | 레전드 | 15,000 |

- **Key Rules:**
  - Tier badge shown on user profile and alongside every post in the community feed.
  - Tier is display-only; does not unlock features (feature access governed by FR-AGE-03).
  - Tier is re-evaluated weekly after Trader Score update (FR-GAME-03).
  - Tier can only increase, never decrease.
- **Acceptance Criteria:**
  - Given user reaches 1,500 cumulative score → tier badge updates to "Investor / Nhà đầu tư / 투자자."
  - Given posts in community feed → tier badge shown next to author pseudonym.
- **Edge Cases:** Score threshold boundary (exactly 500) → upgrade to Learner.
- **Priority:** P1

---

#### FR-GAME-03 — Trader Score

- **Actor:** Registered User
- **Description:** **REPLACED BY FR-SCORE-01 (Investment Health Score).** The Trader Score is renamed to Investment Health Score (IHS). See FR-SCORE-01 for the updated behavioral scoring model.
- **Priority:** P1 (see FR-SCORE-01)

---

#### FR-GAME-04 — Weekly Challenges

- **Actor:** Registered User
- **Description:** Challenge card displayed on Home screen. New challenge issued every Monday. Examples: "Top paper portfolio return in VN tech stocks this week", "Complete 3 micro-lessons this week." Timer shows time remaining. Completion reward: XP + badge.
- **Key Rules:**
  - One challenge active at a time per user; challenge is consistent for all users (not personalized in V2).
  - Participation is automatic — user is entered into the challenge on Monday login.
  - Timer counts down to Sunday midnight.
  - Winner badge shown on profile for 1 week after winning.
  - XP reward: +100 (from FR-GAME-01).
- **Acceptance Criteria:**
  - Given Monday login → challenge card shows on Home with timer and description.
  - Given user's paper return tops the VN tech challenge → badge and +100 XP awarded Sunday night.
- **Edge Cases:** User did not log in during challenge week → not entered; challenge shows as "Missed" in challenge history.
- **Priority:** P1

---

#### FR-GAME-05 — Learning Streaks

- **Actor:** Registered User
- **Description:** Consecutive days counter for completing ≥1 micro-lesson per day. Streak counter shown on profile. Missed day resets streak to 0. One "Streak Freeze" item available per week — activating it before midnight on a missed day preserves the streak.
- **Key Rules:**
  - Streak day counts in user's local calendar day (midnight reset).
  - Streak Freeze refreshes weekly (Monday midnight local time); unused freezes do not accumulate.
  - Streak Freeze must be activated by the user before the day's midnight (cannot retroactively use).
  - Streak Freeze shown as an inventory item in the gamification section of profile.
  - Maximum streak shown: unlimited (no cap).
- **Acceptance Criteria:**
  - Given user completes a lesson on 5 consecutive days → streak shows "5" on profile.
  - Given user misses day 6 without activating freeze → streak resets to 0 on day 7 login.
  - Given Streak Freeze activated before midnight on missed day → streak preserved.
- **Edge Cases:** User in timezone near midnight → streak day evaluated server-side in user's registered timezone.
- **Priority:** P1

---

#### FR-GAME-06 — Milestone Celebrations

- **Actor:** Registered User
- **Description:** Animated celebration overlay triggered at key portfolio milestones:
  - First paper trade executed
  - First profitable trading day (virtual P&L > 0)
  - Each new Trader Tier reached
  - Portfolio value milestones: +10M VND, +50M VND, +100M VND virtual profit
  - Portfolio goal reached (FR-GAME-07)
  - 7-day learning streak
  - 30-day learning streak
  Celebration consists of: confetti particle animation (1200ms), haptic feedback (medium impact), achievement card (9:16 format). Achievement card is shareable to external apps (Zalo, KakaoTalk, Instagram Stories) via native share sheet.
- **Key Rules:**
  - Each milestone fires once per user lifetime (except portfolio goal which fires per goal set).
  - Celebration overlay is dismissible (tap anywhere or swipe down).
  - Achievement card contains: milestone name, date achieved, Trader Tier badge, anonymized portfolio stat (% return, not absolute VND amount — per BR-SOC-01).
  - Share action opens native OS share sheet with pre-rendered 9:16 image.
  - Celebration animation respects `prefers-reduced-motion` — reduces to a subtle scale-up + haptic only.
- **Acceptance Criteria:**
  - Given first paper trade fills → confetti overlay shown within 2 seconds; dismissible; achievement card available to share.
  - Given user reaches Tier 3 → tier-up celebration shown; card includes new tier badge.
  - Given same milestone triggered twice → celebration not shown second time.
  - Given reduced motion enabled → no confetti particles; only opacity fade + haptic.
- **Edge Cases:**
  - Multiple milestones triggered simultaneously (e.g., first trade + first profit) → queue; show most significant first; second shown after first dismissed (max 2 queued; others logged silently).
  - User is offline when milestone triggers → celebration shown on next app open.
  - Share fails (no share-compatible app installed) → toast "Unable to share. Screenshot saved to gallery."
- **Priority:** P1

---

#### FR-GAME-07 — Portfolio Goal Setting

- **Actor:** Registered User
- **Description:** User sets a virtual portfolio value target from Portfolio settings. Goal displayed as a progress bar on Portfolio tab header. Progress updates in real-time with portfolio value. Goal completion triggers FR-GAME-06 milestone celebration.
- **Key Rules:**
  - One active goal at a time per user. Setting a new goal replaces the previous one.
  - Goal must be > current portfolio value.
  - Goal has no deadline (open-ended) unless user sets optional target date.
  - Progress bar shows: current value, target value, % progress.
  - Goal can be cancelled at any time from Portfolio settings.
- **Acceptance Criteria:**
  - Given user sets goal of 600M VND (current: 520M VND) → progress bar shows 40% complete.
  - Given portfolio reaches 600M VND → milestone celebration fires; goal marked "Achieved"; progress bar at 100%.
  - Given goal cancelled → progress bar removed; no celebration.
- **Edge Cases:**
  - Portfolio value decreases below starting value → progress bar shows negative territory with different color (neutral).
  - Portfolio reset (FR-PT-05) while goal is active → goal auto-cancelled; user notified.
  - Goal value equal to current value → error "Goal must be higher than your current portfolio value."
- **Priority:** P1

---

## Module D: AI System P0

> **Purpose:** Core AI features required at launch. Educational and explanatory only. Never provides buy/sell recommendations.

---

#### FR-AI-01 — Post-Trade Explanation

- **Actor:** Registered User (after paper trade fills)
- **Description:** After every paper trade fills, a non-blocking AI card auto-appears in the portfolio screen or as a bottom sheet. Dismissible at any time. Three sections:
  1. **What happened** — plain language description of recent price action for this stock.
  2. **Why** — up to 3 causal factors from news/fundamentals (e.g., "sector rotation," "earnings surprise," "policy change").
  3. **What to watch** — 1–2 forward-looking signals (e.g., "next earnings date," "sector catalyst").
- **Key Rules:**
  - Card is non-blocking: user can dismiss at any time without completing read.
  - Language matches user's active language setting (FR-LANG-01).
  - Disclaimer appended to every card (FR-LEGAL-02).
  - Thumbs up / thumbs down rating buttons. Rating stored for model quality tracking.
  - AI response must not contain buy/sell recommendation language.
  - Card shown once per trade fill; not re-shown on revisit.
- **Acceptance Criteria:**
  - Given paper trade fills → AI card appears within 5 seconds with 3 sections in user's language.
  - Given user taps thumbs down → rating recorded; card remains visible until dismissed.
  - Given Vietnamese language selected → all three sections in Vietnamese.
- **Edge Cases:** AI service unavailable → card shows "Analysis temporarily unavailable. Check back later." Disclaimer still shown.
- **Priority:** P0

---

#### FR-AI-02 — Natural Language Stock Query

- **Actor:** Registered User
- **Description:** Chat interface (bottom sheet or dedicated screen) where user types questions in VN/KR/EN. AI responds in the same language. Restricted to VN (HOSE/HNX) and KR (KOSPI/KOSDAQ) stocks at launch. Every response includes: source attribution, disclaimer (FR-LEGAL-02). AI never recommends buy/sell.
- **Key Rules:**
  - AI response language always matches the user's app language setting (FR-LANG-01), regardless of the input language used in the query. This is consistent with BR-AI-03.
  - Scope restricted: queries about stocks outside VN/KR → "I can only answer questions about Vietnam (HOSE/HNX) and Korea (KOSPI/KOSDAQ) stocks right now."
  - Source attribution: cite data sources used (e.g., "Based on HOSE data as of [date]").
  - Buy/sell language filtered: if response would contain recommendation, it is replaced with educational framing.
  - Conversation history: last 10 turns retained in session; cleared on bottom sheet close.
  - Financial terminology locale-specific per FR-LANG-02 / FR-AI-03.
- **Acceptance Criteria:**
  - Given Vietnamese query "VIC có đang tốt không?" → response in Vietnamese about VIC's recent performance; no buy/sell recommendation; disclaimer appended.
  - Given query about Apple (NASDAQ) → scope restriction message shown.
- **Edge Cases:** AI timeout (>10s) → "Taking longer than usual. Please try again." Query retained in input field.
- **Priority:** P0

---

#### FR-AI-03 — Multilingual AI Routing

- **Actor:** System (AI routing layer)
- **Description:** System detects user's active language setting (FR-LANG-01) and routes all AI requests (FR-AI-01, FR-AI-02, FR-AI-04–FR-AI-07) to the language-appropriate prompt configuration. AI responses use locale-specific financial terminology (not generic translation). If language changes mid-session, next AI request uses the new language config.
- **Key Rules:**
  - Language routing is server-side; client sends `Accept-Language` header with active language code.
  - Prompt configs maintained per language: `vi`, `ko`, `en` (default fallback: `en`).
  - Financial terminology must be locale-specific (FR-LANG-02), not generic machine translation.
  - Routing failure → fallback to English with a note: "Response in English (your language config is loading)."
- **Acceptance Criteria:**
  - Given KR language active → all AI cards and query responses return Korean text with Korean financial terms.
  - Given language switched from VN to KR mid-session → next AI request returns Korean response.
- **Edge Cases:** Unsupported language code → default to English.
- **Priority:** P0

---

## Module E: AI System P1

> **Purpose:** Proactive AI features that deepen engagement and learning. Built on P0 AI infrastructure.

---

#### FR-AI-04 — Pre-Trade AI Card

- **Actor:** Registered User (between Buy tap and order confirmation)
- **Description:** Collapsible card shown between the "Buy" tap on Stock Detail and the order confirmation screen. Content:
  1. Risk score: 1–10 (10 = highest risk)
  2. Suggested position size: % of virtual portfolio
  3. "3 things to know" — key context bullets for this trade
- **Key Rules:**
  - Must load within 2 seconds. If timeout: "Analysis skipped — continuing to order." (graceful degradation).
  - Card is collapsible (default: expanded). User can dismiss; dismiss action logged as "skip."
  - Skip rate logged per user for model quality tracking.
  - Disclaimer appended (FR-LEGAL-02).
  - Content is AI-generated and educational; not a recommendation. Never says "you should buy/sell."
  - Applies to both market orders (FR-PT-02) and limit orders (FR-PT-03).
- **Acceptance Criteria:**
  - Given user taps "Buy" → pre-trade card appears within 2s before confirmation screen.
  - Given AI service timeout → graceful skip shown; user proceeds to confirmation.
  - Given card dismissed → skip event logged.
- **Edge Cases:** User taps back during card display → order cancelled; card dismissed.
- **Priority:** P1

---

#### FR-AI-05 — Portfolio Health Check

- **Actor:** Registered User
- **Description:** Weekly push notification every Monday 8AM user's local time: "Your weekly portfolio health check is ready." In-app report card with letter grade (A–F) per dimension:
  - Diversification (are holdings spread across sectors?)
  - Concentration (is any single holding >25% of portfolio?)
  - Volatility (portfolio beta vs. market)
  - Geographic Exposure (VN only / KR only / mixed)
  - Liquidity (% holdings in illiquid/low-volume stocks)
  - Radar chart visual for all 5 dimensions.
  - Tapping any dimension → opens conversational follow-up (FR-AI-02 chat mode scoped to that dimension).
- **Key Rules:**
  - Push notification togglable in FR-52 Notification Settings.
  - Report generated Sunday midnight; delivered Monday 8AM local.
  - Report retained for 30 days in Notification History (FR-47).
  - Overall grade = weighted average of 5 dimension grades.
  - Empty portfolio → health check skipped; notification not sent.
- **Acceptance Criteria:**
  - Given user has 5 holdings with high concentration → Concentration grade "D"; overall grade below "B."
  - Given Monday 8AM → push notification delivered; tapping → in-app report card.
  - Given dimension tapped → AI chat opens scoped to that dimension.
- **Edge Cases:** User changes timezone → notification time adjusts from following Monday.
- **Priority:** P1

---

#### FR-AI-06 — Personalized Learning Path

- **Actor:** Registered User
- **Description:** AI detects knowledge gaps from trade behavior and quiz performance. Triggers contextual 90-second micro-lesson card after relevant trades (e.g., after user buys a growth stock → "Here's how P/E works for growth stocks"). Spaced repetition: resurfaces concepts at Day 7 and Day 30 after initial lesson.
- **Key Rules:**
  - Micro-lesson card is non-blocking and dismissible.
  - Triggered immediately after trade fill (after FR-AI-01 post-trade card if both applicable).
  - Spaced repetition schedule: Day 7 + Day 30 re-surface via push notification ("Refresh your understanding of P/E ratios — 90 seconds").
  - Quiz performance: post-lesson quiz (3 questions); incorrect answers tag concept as "needs reinforcement."
  - Max 1 micro-lesson trigger per trade (not stacked).
  - Language per FR-AI-03.
  - XP: +25 on lesson completion (FR-GAME-01).
- **Acceptance Criteria:**
  - Given user buys a high-P/E stock for the first time → P/E micro-lesson card appears after post-trade AI card.
  - Given lesson completed → XP increments by 25; Day 7 resurface scheduled.
  - Given Day 7 reminder arrives → user taps → lesson re-shown.
- **Edge Cases:** User already completed this lesson at a high quiz score → lesson not re-triggered for this concept.
- **Priority:** P1

---

#### FR-AI-07 — Behavioral Coaching

- **Actor:** Registered User
- **Description:** System detects behavioral patterns and delivers non-judgmental coaching nudges:
  - **FOMO buy**: stock up >5% in 3 days + user buys + stock was not on user's watchlist prior → nudge: "Heads up — this stock has moved fast recently. Here's what to consider."
  - **Panic sell**: stock down >4% + user places sell order → nudge: "Market drops happen. Here's a framework for thinking through sell decisions."
  - **Overtrading**: >5 paper trades in a single day → nudge: "You've been active today. Frequent trading can be costly — here's why."
  - **Concentration creep**: single holding reaches >25% of portfolio → nudge: "One stock is now a large part of your portfolio. Here's what diversification means."
- **Key Rules:**
  - Toast notification format: non-judgmental, educational framing. Never says "don't do this."
  - Max 1 coaching nudge per user per calendar day (user's local timezone).
  - User rates each nudge: "Helpful" / "Not helpful." Rating stored for model quality.
  - Coaching flags logged for Trader Score Risk Discipline component (FR-GAME-03).
  - Nudges delivered as in-app toast (not push notifications) — surfaced immediately on action detection.
  - Coaching togglable in FR-52 Notification Settings.
- **Acceptance Criteria:**
  - Given stock up 6% in 3 days + user buys (not on prior watchlist) → FOMO nudge toast appears within 5s.
  - Given 5 nudges possible in one day → only first one shown; rest suppressed.
  - Given "Not helpful" tapped → feedback stored; same coaching type reduced in frequency for this user.
- **Edge Cases:** Multiple behavior patterns triggered simultaneously → highest-priority behavior wins (Concentration > FOMO > Panic > Overtrading).
- **Priority:** P1

---

## Module E2: Education System

> **Purpose:** Contextual financial education delivered inline, without requiring navigation to separate learning sections.

---

#### FR-EDU-01 — Inline Financial Terminology Tooltips

- **Actor:** Registered User
- **Description:** Every financial term displayed in the app (P/E, EPS, market cap, dividend yield, CASA ratio, RSI, volume, 52-week high/low, etc.) has a one-tap inline explainer tooltip. Tapping a term label renders a tooltip overlay with a 2-3 sentence plain-language explanation in the user's active language. Tooltip appears at the point of display (no navigation to a separate screen). Tooltip is dismissible by tapping outside.
- **Key Rules:**
  - Tooltip content managed server-side in a financial glossary table (updatable without app release).
  - Tooltips localized per FR-LANG-02 using market-standard terminology.
  - Tooltip render time: ≤ 200ms (cached client-side on first load).
  - Terms without glossary entries display no tooltip tap affordance (no broken interaction).
  - Tooltip includes "Learn more" link to relevant micro-lesson (FR-AI-06) if available.
- **Acceptance Criteria:**
  - Given VN user taps "P/E" on Stock Detail → tooltip shows "Chi so P/E (Price to Earnings)..." in Vietnamese within 200ms.
  - Given KR user taps "시가총액" → tooltip shows Korean explanation.
  - Given term not in glossary → no tap indicator shown; label renders as plain text.
- **Edge Cases:**
  - Tooltip content exceeds viewport → tooltip scrollable within its container (max 4 lines visible).
  - Multiple terms close together → only one tooltip open at a time; opening new closes previous.
  - Offline → cached tooltip content shown; if never cached → no tooltip (graceful degradation).
- **Priority:** P0

---

## Module F: Social Features P1

> **Purpose:** Community layer to build trust, learning, and engagement. Pseudonymous. No real identity revealed. Deferred social features (copy trading, portfolio sharing, full following feed, Morning Call) remain V3+.

---

#### FR-SOC-01 — Social Proof on Stock Cards

- **Actor:** Registered User
- **Description:** Stock cards (Discover feed and Stock Detail) display:
  - "X users watching" (users with stock in watchlist)
  - Sentiment ratio: % of posts tagged Bull vs. Bear in last 24h
  - "Trending in VN" / "Trending in KR" badge if stock is in top 10 by community activity for that market
- **Key Rules:**
  - All counts aggregated — no individual user names shown.
  - Updated server-side every 5 minutes; client polls every 5 minutes.
  - Sentiment ratio requires ≥5 posts in 24h to display; below threshold: "Not enough posts yet."
  - Trending badge determined by total post count in last 24h relative to other stocks in same market.
- **Acceptance Criteria:**
  - Given stock has 120 watchers → "120 users watching" shown; updates within 5 minutes when watcher count changes.
  - Given stock has 8 Bull posts and 2 Bear posts in 24h → "80% Bullish" shown.
  - Given stock is top 10 by VN activity → "Trending in VN" badge shown.
- **Edge Cases:** Sentiment data unavailable → hide sentiment section; do not show 0%.
- **Priority:** P1

---

#### FR-SOC-02 — Per-Ticker Community Feed

- **Actor:** Registered User
- **Description:** "Community" tab on Stock Detail page. Shows all posts tagged to that ticker (FR-SOC-03). Reverse chronological. Each post shows: author pseudonym, Trader Score badge, sentiment tag (Bull/Bear/Neutral), post text, timestamp. Tapping author navigates to their public profile (FR-SOC-05).
- **Key Rules:**
  - Feed loads newest 20 posts; infinite scroll loads 20 more per batch.
  - Empty state: "Be the first to post about [TICKER]."
  - Moderation: posts violating community guidelines hidden (server-side moderation flag).
  - Real name never shown; only pseudonym.
- **Acceptance Criteria:**
  - Given stock with 5 posts → all 5 shown in reverse chronological order with author badge and sentiment tag.
  - Given author pseudonym tapped → public profile shown.
- **Edge Cases:** Feed unavailable → "Community feed temporarily unavailable. Check back later."
- **Priority:** P1

---

#### FR-SOC-03 — Post Creation

- **Actor:** Registered User
- **Description:** User writes a post (max 1,000 characters). Posts longer than 280 characters are truncated in feed view with a 'Read more' expander. Must attach ≥1 $TICKER cashtag (auto-suggested from stock being viewed). Must select sentiment: Bull / Bear / Neutral. 60-second delay before publish (allows user to cancel). Posts cannot contain direct buy/sell directives without analysis context.
- **Key Rules:**
  - Minimum 1 $TICKER cashtag required; max 5 cashtags per post.
  - Cashtag auto-suggested from the stock detail screen the user is currently viewing.
  - Sentiment selection: required (no publish without selecting one).
  - 60-second pending window: countdown shown; "Cancel" button available during this period.
  - Content moderation: posts containing direct "buy this" / "sell this" language without analysis flagged for review and held pending.
  - Server-side validation: if no $TICKER cashtag is detected in the post body after auto-extraction, the post is rejected with error "Post must include at least one $TICKER cashtag."
  - Post published to: per-ticker community feed (FR-SOC-02) and following feed of users who follow this author (FR-SOC-04).
- **Acceptance Criteria:**
  - Given user writes post, selects Bull, and attaches $VIC → 60s countdown shown; post published after countdown if not cancelled.
  - Given user taps Cancel within 60s → post discarded.
  - Given user writes "BUY VIC NOW" without additional context → post flagged; held for moderation.
- **Edge Cases:** Character count reaches 1,001 → input field rejects additional characters; counter shows "1,000/1,000" in red.
- **Priority:** P1

---

#### FR-SOC-04 — Follow System

- **Actor:** Registered User
- **Description:** Users can follow other users (from public profile, FR-SOC-05). "Following" feed tab shows all public posts from followed users in reverse chronological order. Follower and following counts shown on public profile. Unfollow at any time.
- **Key Rules:**
  - Follow/unfollow is immediate; no approval required.
  - Following feed (V2 deferred to full V2 release): listed here as scoped requirement; the "Following" tab exists in V2 but may be behind a flag.
  - No notification sent to followed user when someone follows them (in V2; V3 may add).
  - Max follows: 1,000 per user.
- **Acceptance Criteria:**
  - Given user follows 3 accounts → Following tab shows those 3 users' posts in reverse chronological order.
  - Given unfollow → their posts no longer appear in Following tab.
- **Edge Cases:** User follows themselves → prevented; error "You can't follow yourself."
- **Priority:** P1

---

#### FR-SOC-05 — Social Profile

- **Actor:** Registered User (public-facing)
- **Description:** Public profile page shows: pseudonym, Trader Tier badge (FR-GAME-02), Trader Score (FR-GAME-03), post count, follower count, following count, joined date. Real name never shown unless user explicitly opts in via Settings.
- **Key Rules:**
  - Default: pseudonym only. Real name opt-in in Profile settings (FR-49).
  - Joined date shown as month + year (e.g., "Joined March 2026").
  - All post history visible on public profile (reverse chronological, paginated 20/load).
  - Block user option available from public profile (V2 scope); blocked users' posts hidden from feed.
- **Acceptance Criteria:**
  - Given user navigates to another user's public profile → pseudonym, tier badge, score, counts, joined date shown. Real name not shown.
  - Given opt-in to real name display → real name shown on own public profile.
- **Edge Cases:** User deactivated account → public profile shows "[Deleted User]"; posts remain but pseudonym replaced.
- **Priority:** P1

---

## Module G: Language System

> **Purpose:** Full trilingual support. Language selection drives UI text, AI content, financial terminology, and locale formatting.

---

#### FR-LANG-01 — Language Selection

- **Actor:** New User / Registered User
- **Description:** On first launch, app detects device OS language. Defaults: device `vi` → Vietnamese; device `ko` → Korean; all others → English. User can change in Settings → Language. Language change applies immediately across the entire app without restart.
- **Key Rules:**
  - Language setting persisted to user profile (not device-only).
  - Three supported languages: Vietnamese (`vi`), Korean (`ko`), English (`en`).
  - Change applies to: all UI text, all AI responses (via FR-AI-03), financial terminology (FR-LANG-02), disclaimer text (FR-LEGAL-01, FR-LEGAL-02).
  - Language change does not require logout/login.
- **Acceptance Criteria:**
  - Given device OS language is Korean → app defaults to Korean on first launch.
  - Given user changes to Vietnamese in Settings → all UI text and AI content switch to Vietnamese immediately.
- **Edge Cases:** Unsupported device language → defaults to English.
- **Priority:** P0

---

#### FR-LANG-02 — Financial Terminology Localization

- **Actor:** Registered User
- **Description:** All financial terms displayed in locale-appropriate form. Not generic translation — uses market-standard terminology per market.
  - Vietnamese: "Chỉ số P/E", "Khớp lệnh", "Dư room", "Vốn hóa thị trường"
  - Korean: "주가수익비율", "시가총액", "코스피", "유동성"
  - English: standard NYSE/NASDAQ terminology ("P/E Ratio", "Market Cap", "Liquidity")
- **Key Rules:**
  - Terminology mapping table maintained server-side; updatable without app release.
  - Applies to: Key Stats section, AI responses (FR-AI-01–FR-AI-07), Portfolio dashboard, Discover feed, Markets module.
  - "Tiền ảo / 가상 자금 / Virtual Funds" label (FR-PT-06) shows trilingual text simultaneously (not language-switched) as a deliberate legal clarity choice.
- **Acceptance Criteria:**
  - Given VN language active → Key Stats shows "Chỉ số P/E" not "P/E Ratio."
  - Given KR language active → Market Cap shows "시가총액."
  - Given AI response triggered in VN mode → AI uses "Khớp lệnh" when referring to order matching.
- **Edge Cases:** Term not found in locale mapping → fallback to English term.
- **Priority:** P0

---

## Module H: Legal / Disclaimers

> **Purpose:** Regulatory compliance and user protection. Disclaimer requirements are non-negotiable and cannot be overridden by user settings.

---

#### FR-LEGAL-01 — Investment Disclaimer Display

- **Actor:** Registered User
- **Description:** Investment disclaimer shown on every market data screen (stock detail, portfolio dashboard, markets tab) on the first view of each screen type per session. Disclaimer is trilingual. Cannot be permanently dismissed — shown on each session's first view of each screen type.
- **Disclaimer text (EN):** "This app is for educational purposes only. It does not constitute financial advice. Past performance does not guarantee future results. Virtual trading does not reflect real market conditions."
- **Key Rules:**
  - Trigger: first view of each screen type per session (not per navigation — if user navigates away and back, not re-shown in same session).
  - Session = from login to logout/app close.
  - Disclaimer must be in user's active language (FR-LANG-01). If language file unavailable: show English fallback.
  - Disclaimer is a banner or modal — must be acknowledged (tap "Got it") before proceeding.
- **Acceptance Criteria:**
  - Given user opens Stock Detail for the first time in a session → disclaimer shown; user taps "Got it" → detail loads.
  - Given user navigates back to Stock Detail in same session → disclaimer NOT shown again.
  - Given new session (login) → disclaimer shown again on first view.
- **Edge Cases:** User closes app without logging out → same session resumes on reopen if token valid; disclaimer state reset.
- **Priority:** P0

---

#### FR-LEGAL-02 — AI Disclaimer on Every Response

- **Actor:** Registered User (consuming AI content)
- **Description:** All AI outputs — post-trade explanation (FR-AI-01), natural language query (FR-AI-02), pre-trade card (FR-AI-04), portfolio health (FR-AI-05), micro-lesson (FR-AI-06), behavioral coaching (FR-AI-07) — must append the educational disclaimer. Cannot be removed by user settings.
- **Disclaimer text (EN):** "AI-generated content is for educational purposes only. Not financial advice. Do not make investment decisions based solely on this content."
- **Key Rules:**
  - Disclaimer appears at the bottom of every AI response card/message.
  - In user's active language (FR-LANG-01).
  - Disclaimer is not collapsible or hidden.
  - Server-side rendered into AI response; cannot be filtered by client.
- **Acceptance Criteria:**
  - Given any AI card displayed → disclaimer text visible at bottom of card in active language.
  - Given language set to Korean → disclaimer shown in Korean.
- **Edge Cases:** Language file for disclaimer not loaded → show English fallback; do not suppress disclaimer entirely.
- **Priority:** P0

---

#### FR-LEGAL-03 — Data Consent at Registration

- **Actor:** New User
- **Description:** Explicit consent screen shown before account creation (step 1 of onboarding, FR-08). User must actively check boxes — no pre-checked boxes allowed.
  1. Terms of Service (required to proceed)
  2. Privacy Policy including data collection scope (required to proceed)
  3. Marketing communications (optional — unchecking must not block registration)
- **Key Rules:**
  - Items 1 and 2 are required; registration blocked until both checked.
  - Item 3 is optional. `marketing_opt_in` preference stored as true/false; defaults to false if unchecked.
  - Checkboxes must be explicitly tapped — cannot proceed without manual interaction.
  - ToS and Privacy Policy links open in-app webview showing latest document.
  - Consent timestamp and version of ToS/Privacy Policy accepted stored on user record.
- **Acceptance Criteria:**
  - Given user checks only items 1 and 2 → registration proceeds normally; marketing preference false.
  - Given user checks all 3 → `marketing_opt_in = true` stored.
  - Given user checks item 3 but not item 1 → "Continue" button disabled; "Please accept Terms of Service to continue."
- **Edge Cases:** ToS webview fails to load → show error "Unable to load Terms of Service. Please check your connection." Registration not blocked — user can proceed after tapping "Continue without reading" with explicit warning.
- **Priority:** P0

---

## Module I: Daily Engagement

> **Purpose:** Drive daily active usage through prediction games, morning briefs, and ticker puzzles. Combines entertainment, education, and habit formation.

---

#### FR-ENGAGE-01 — Daily Challenge (Market Prediction)

- **Actor:** Authenticated user
- **Description:** One market prediction question per trading day. Three phases: (1) Morning (8:45-9:05 AM): user submits prediction; (2) During trading (9:05-14:30): anticipation with optional live sparkline; (3) After close (14:30+): result + 100-150 word educational explanation.
- **Question types (rotated):**
  - "Hom nay [TICKER] se: Tang / Giam / Di ngang?"
  - "Hom nay VN-Index se: Tang >0.5% / Di ngang (+-0.5%) / Giam >0.5%?"
  - "Trong 3 co phieu sau, co phieu nao tang nhieu nhat hom nay: [A, B, C]?"
- **Key Rules:**
  - Same question for all users (community comparison baseline)
  - Submission closes at 9:05 AM ICT — late users can view results but earn nothing
  - Correct prediction: +50,000 VND virtual coins + streak point
  - Participation (any answer): +10,000 VND virtual coins + streak point
  - Educational explanation always shown regardless of correctness
  - Weekend: historical case study question (no streak points, coins available)
  - Challenge content set by editorial/algorithm team by 8:00 AM daily
  - Challenge history retained and scrollable
- **Acceptance Criteria:**
  - Given trading day at 8:50 AM → user sees prediction question → taps answer → confirmed → "Ket qua luc 14:30"
  - Given 14:35 PM → result shown with educational explanation → coins awarded
  - Given answer submitted at 9:06 AM → rejected "Het gio gui du doan"
- **Edge Cases:**
  - Challenge stock trading halted → substitute with VN-Index question
  - Market holiday → no challenge; notification not sent
  - User answers then deletes app → answer preserved server-side; result viewable on re-install
- **Priority:** P0

---

#### FR-ENGAGE-02 — Morning Brief Notification

- **Actor:** System (push notification)
- **Description:** Daily pre-market push at 8:45 AM ICT on trading days. Three components: (1) Market sentiment line (max 80 chars); (2) Portfolio-relevant event alert if applicable; (3) Daily Challenge teaser.
- **Key Rules:**
  - Only sent on trading days (Mon-Fri, excluding VN public holidays)
  - Only sent if user has opted into push notifications
  - Deep links to Daily Challenge screen
  - If user hasn't opened app in 3+ days, frequency reduced to every other day
  - Not sent between 10 PM and 7 AM
- **Acceptance Criteria:**
  - Given trading day → user receives push at 8:45 AM with sentiment + challenge teaser
  - Given user's VCB has DHCD today → portfolio alert component included
  - Given weekend → no morning brief sent
- **Priority:** P0

---

#### FR-ENGAGE-03 — Stock Ticker Daily Puzzle ("Ma CK Hom Nay")

- **Actor:** Authenticated user
- **Description:** Daily puzzle: guess the VN-listed company from 3 progressive hints. Hint 1 (vague): industry. Hint 2 (after 30s or tap): company characteristic. Hint 3 (after 60s or second tap): near-reveal. Answer via 4-option multiple choice or ticker input.
- **Key Rules:**
  - Rewards: Hint 1 correct: +30K, Hint 2: +20K, Hint 3: +10K, Wrong: +5K coins
  - One puzzle per day; same for all users
  - Available from midnight; no time limit
  - After answering, show 3 key facts about company + link to stock page
  - Rotates across VN-Index 30 companies before repeating
- **Acceptance Criteria:**
  - Given user opens puzzle → Hint 1 shown → user guesses correctly → +30K coins + company facts
  - Given user needs all 3 hints → answers correctly → +10K coins
  - Given wrong answer → +5K coins + correct answer revealed + company facts
- **Priority:** P1

---

## Module J: Investment Health Score

> **Purpose:** Replace the Trader Score with a behavior-focused Investment Health Score (IHS) that measures investment process quality rather than returns.

---

#### FR-SCORE-01 — Investment Health Score (IHS)

- **Actor:** System (calculated weekly), User (views)
- **Description:** Weekly behavioral score (0-100) measuring investment PROCESS quality, not returns. Four equally-weighted dimensions (25% each):
  - **Discipline (Ky luat):** Ratio of trades with reasoning entered vs total trades
  - **Diversification (Da dang hoa):** HHI index of portfolio, inverted (more spread = higher score)
  - **Learning (Hoc tap):** Lessons completed this week / target (2/week = 100%)
  - **Reflection (Phan chieu):** Closed positions with reflection completed vs total closed
- **Key Rules:**
  - Calculated every Monday at 6:00 AM for previous week
  - Score displayed as: current week + previous week + trend arrow (up/down/flat)
  - History retained 12+ weeks as sparkline
  - No dimension based on P&L or returns (this is deliberate — behavior over outcome)
  - Score is private by default; user may display on public profile
  - Weekly push notification with score + weakest dimension + recommended action
  - IHS replaces the old Trader Score in all tier calculations
- **Acceptance Criteria:**
  - Given user placed 10 trades (7 with reasoning) → Discipline = 70/100
  - Given portfolio has 5 equal-weight positions → Diversification ~ 80/100
  - Given user completed 2 lessons → Learning = 100/100
  - Given user reflected on 3/4 closed positions → Reflection = 75/100
  - IHS = (70+80+100+75)/4 = 81.25 → displayed as 81
- **Priority:** P1

---

## Module K: Monthly Investment DNA Card

> **Purpose:** Auto-generated shareable monthly summary card that drives organic sharing and viral acquisition.

---

#### FR-CARD-01 — Monthly Investment DNA Card

- **Actor:** System (generated monthly), User (views and shares)
- **Description:** Auto-generated shareable card on 1st of each month. Content: (1) Investment style label (Value/Growth/Momentum/Defensive/Active from trade patterns); (2) Key stats: return vs VN-Index, trade count, avg hold duration; (3) Best decision: ticker + % gain; (4) Behavioral insight (1 sentence); (5) Community rank percentile.
- **Key Rules:**
  - Generated only if user placed >=3 trades in the month
  - Not generated for first partial month (wait for first full calendar month)
  - Card designed for vertical sharing (1080x1920px)
  - Both good and bad months framed positively (always shareable)
  - Export as PNG via native share sheet
  - No forced social login to share
- **Acceptance Criteria:**
  - Given user placed 15 trades in March → on April 1 → DNA card generated with style label and stats
  - Given user taps "Chia se" → native share sheet opens with PNG
  - Given user placed 2 trades in March → no card generated
- **Priority:** P1

---

## Module L: Structured Investment Curriculum

> **Purpose:** Progressive educational content that builds investing knowledge from beginner to intermediate, integrated with gamification rewards.

---

#### FR-LEARN-01 — Structured Investment Curriculum

- **Actor:** Authenticated user
- **Description:** 3-level structured curriculum with progressive unlock. Each lesson: 300-500 words Vietnamese + VN market example + 3-5 question quiz + "apply to portfolio" prompt.
  - **Level 1 — F0 Foundation** (5 modules, ~14 lessons): Market basics, reading price boards, stock types, order placement, risk/diversification
  - **Level 2 — F1 Fundamentals** (5 modules, ~18 lessons): FA basics, financial statements, P/E/P/B valuation, TA basics, investor psychology
  - **Level 3 — F2 Intermediate** (5 modules, ~18 lessons): Sector analysis, investment strategies, portfolio management, reading prospectuses, VN macro context
- **Key Rules:**
  - Lessons within a module must be completed in order
  - Level 1 accessible to all users regardless of assigned level
  - Level 2 unlocks after: all Level 1 complete + 2 weeks account age + >=10 trades
  - Level 3 unlocks after: all Level 2 complete + IHS >=60 for 4 consecutive weeks
  - Lesson completion: +20K VND virtual coins
  - Quiz pass (>=3/5): +30K VND virtual coins
  - Full module completion: +100K VND bonus
  - Perfect quiz (5/5): +50K bonus
  - Coins add to virtual cash balance
- **Acceptance Criteria:**
  - Given Level 1 user → all Level 1 modules accessible, Level 2 locked with progress indicator
  - Given user completes lesson + passes quiz → coins awarded, next lesson unlocked
  - Given user completes all Level 1 + 2 weeks + 10 trades → Level 2 unlocks with notification
- **Priority:** P1 (Level 1 content at launch; Level 2-3 in Phase 2)

---

## 3. Business Rules

| Rule ID | Description |
|---------|-------------|
| BR-01 | A user can have a maximum of 1 market preference at any time. Changing preference immediately updates all preference-driven UI. |
| BR-02 | A user can add a maximum of 100 stocks to their watchlist. Attempting to add a 101st stock shows an error: "Watchlist full. Remove a stock to add another." |
| BR-03 | A user can set a maximum of 1 price alert per stock. Setting a new alert for a stock with an existing alert overwrites the previous alert. |
| BR-04 | Price alert notifications are one-time triggers. Once triggered and notification sent, the alert is automatically deactivated. |
| BR-05 | A stock must have editorial content (a "why it's hot" hook and theme badge) to appear in the Discover feed. Stocks without editorial content are excluded from the Discover feed. |
| BR-06 | The "X users watching" social proof counter reflects the real-time count of users who have that stock in their watchlist. Updated server-side every 5 minutes. |
| BR-07 | Analyst sentiment consensus labels: Buy% ≥ 70% → "Strong Buy"; Buy% 50–69% → "Buy"; Buy% 40–49% AND Sell% ≤ 30% → "Neutral"; Sell% 50–69% → "Sell"; Sell% ≥ 70% → "Strong Sell." |
| BR-08 | Paper portfolio P&L calculations use virtual prices from the real-time feed. The app does not connect to brokerage accounts. |
| BR-09 | Market data for VN (HoSE/HNX) sourced from real-time exchange data feed. KR and Global data from web search / model knowledge; carries disclaimer for potential delay up to 24 hours. |
| BR-10 | The app does not execute real buy or sell orders. All trades are simulated with virtual funds. |
| BR-11 | Watchlist movement notifications capped at 3 per user per day. Top 3 selected by highest absolute daily change percentage. |
| BR-12 | Login locked for 15 minutes after 5 consecutive failed attempts. Timer resets after successful login. |
| BR-13 | Email OTP valid for 10 minutes, single-use. New OTP request immediately invalidates existing OTP. |
| BR-14 | Monetary values displayed in user's preferred currency: VND (VN), KRW (KR), USD (Global). Virtual portfolio balance displayed in VND with currency equivalent for KR/Global users. |
| BR-15 | Discover feed must display minimum 10 cards before scroll. Fewer than 10 available → show all without infinite scroll. |
| BR-16 | Feature tier (LEARN_MODE / FULL_ACCESS) evaluated server-side on every session init. Client cannot self-upgrade feature tier. |
| BR-17 | Paper portfolio starting balance: VND 500,000,000. Reset restores to exactly this amount. |
| BR-18 | "Tiền ảo / 가상 자금 / Virtual Funds" label is mandatory on all paper trading screens. Cannot be dismissed or hidden. |
| BR-19 | AI responses must never contain explicit buy/sell recommendations. Language patterns matching "buy X", "sell X", "you should invest in X" are filtered server-side. |
| BR-20 | Max 1 AI behavioral coaching nudge per user per calendar day (user's local timezone). |
| BR-21 | All AI content must append the educational disclaimer defined in FR-LEGAL-02 in the user's active language. |
| BR-22 | Data consent (FR-LEGAL-03) checkboxes must not be pre-checked. Consent timestamp and ToS version stored on user record. |
| BR-23 | Social posts limited to 1,000 characters, require minimum 1 $TICKER cashtag and 1 sentiment selection before publish. Posts longer than 280 characters are truncated in feed view with a 'Read more' expander. 60-second cancel window enforced. |
| BR-24 | Real name never shown on public social profile unless user explicitly opts in via Settings. Default is pseudonym only. |
| BR-25 | Trader Tier can only increase, never decrease, regardless of score changes. |
| BR-26 | Investment disclaimer (FR-LEGAL-01) shown on first view of each screen type per session. Cannot be permanently dismissed. |
| BR-27 | Behavioral coaching flags (FR-AI-07) are logged to the user's Risk Discipline score component for the weekly Trader Score. |
| BR-28 | Age verified at registration via DOB. Minimum age to register: 16 (or 13 with parental consent, deferred to V3). Under 13: registration blocked entirely. |
| BR-29 | Each primary screen must have one primary action and one primary data display. Competing primary CTAs on a single screen are a P1 UX bug. |
| BR-30 | All financial terminology must have inline contextual tooltips (one-tap explainer). Separate education sections are not acceptable alternatives. |
| BR-31 | Social login (Google/Apple) creates or links a Paave account. If social email matches an existing account, user must explicitly confirm the link. No automatic merging. |
| BR-32 | 2FA is opt-in. When enabled, password and social logins require OTP verification. Biometric login bypasses 2FA. |
| BR-33 | Every paper trade order form must display an optional reasoning field (max 200 chars). Entering >=10 characters of reasoning earns +5 IHS points per trade. Reasoning is stored permanently in the order record and surfaced in weekly IHS review and trade journal. |
| BR-34 | When a position is fully closed (0 remaining shares), a structured reflection prompt must appear within 2 seconds. Completing both questions (Q1 + Q2 with >=20 characters) earns +10 IHS points. Dismissed prompts do not reappear for that trade. |
| BR-35 | Daily Challenge submissions close at 9:05 AM ICT. Late submissions are rejected. Correct prediction: +50K virtual coins + streak point. Participation: +10K virtual coins + streak point. Same question for all users. |
| BR-36 | Investment Health Score (IHS) is calculated every Monday at 6:00 AM for the previous week. Score range 0-100 with four equally-weighted dimensions (25% each): Discipline, Diversification, Learning, Reflection. No dimension is based on P&L or returns. IHS replaces the Trader Score in all tier calculations. |

---

## 4. Traceability Matrix

This matrix links each functional requirement to the BRD business objectives it supports.

| BRD Objective | Description | Linked FRs |
|---------------|-------------|------------|
| BO-01 | Acquire 50K MAU within 6 months | FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, FR-07B, FR-07C, FR-08, FR-AGE-01, FR-AGE-03, FR-LEGAL-03, FR-LANG-01, FR-SOC-01, FR-GAME-01, FR-GAME-06, FR-CARD-01 |
| BO-02 | D7 retention >= 35% | FR-09, FR-10, FR-11, FR-12, FR-13, FR-14, FR-42, FR-43, FR-44, FR-45, FR-46, FR-47, FR-52, FR-GAME-04, FR-GAME-05, FR-GAME-07, FR-ONBOARD-01, FR-ENGAGE-01, FR-ENGAGE-02, FR-ENGAGE-03, FR-SCORE-01 |
| BO-03 | Watchlist adoption >= 60% | FR-12, FR-20, FR-27, FR-28, FR-46, FR-SOC-01, FR-ENGAGE-01, FR-ENGAGE-02, FR-ENGAGE-03 |
| BO-04 | Discover as primary acquisition channel >= 40% | FR-15, FR-16, FR-17, FR-18, FR-19, FR-20, FR-21, FR-22, FR-SOC-01, FR-EDU-01 |
| BO-05 | VN as lead market >= 70% MAU | FR-03, FR-04, FR-37, FR-LANG-01, FR-LANG-02, FR-PT-01, FR-LEARN-01 |
| BO-06 | VN data latency <= 15s | FR-37, FR-10, FR-PT-02 |
| BO-07 | Onboarding completion >= 75% | FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07C, FR-08, FR-AGE-01, FR-LEGAL-03, FR-LANG-01 |
| BO-08 | Paper trade activation >= 50% | FR-PT-01, FR-PT-02, FR-PT-03, FR-PT-04, FR-PT-05, FR-PT-06, FR-09, FR-23, FR-AI-01, FR-AI-04, FR-GAME-06, FR-ONBOARD-01 |
| BO-09 | Gamification Tier 2 >= 40% | FR-GAME-01, FR-GAME-02, FR-GAME-03, FR-GAME-04, FR-GAME-05, FR-GAME-06, FR-GAME-07, FR-AI-06, FR-EDU-01, FR-SCORE-01 |
| BO-10 | AI card read-through >= 65% | FR-AI-01, FR-AI-02, FR-AI-03, FR-AI-04, FR-AI-05, FR-AI-06, FR-AI-07, FR-LANG-02, FR-LEGAL-02, FR-EDU-01, FR-PT-07, FR-PT-08 |
| BO-11 | Community feed engagement >= 35% | FR-SOC-01, FR-SOC-02, FR-SOC-03, FR-SOC-04, FR-SOC-05, FR-16, FR-GAME-02 |
| BO-12 | Age 16-17 compliance, zero violations | FR-AGE-01, FR-AGE-02, FR-AGE-03, FR-AGE-04, FR-LEGAL-01, FR-LEGAL-02, FR-LEGAL-03, FR-PT-06 |
| BO-13 | Account security and fraud prevention | FR-07, FR-07B, FR-07C, FR-07D, FR-12 |

---

*Document end. Proceed to SRD for system logic and API contracts.*

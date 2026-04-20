# FRD — Functional Requirement Document
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App (V2.2)

**Document version:** 2.2
**Date:** 2026-04-20
**Author:** Business Analysis Team
**Status:** Approved for Development
**Linked BRD:** BRD.md v2.2
**Supersedes:** FRD v2.1 (2026-04-20)

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Functional Requirements — Core (FR-01 to FR-53)](#functional-requirements--core)
   - [FR-01 to FR-08.2: Onboarding — includes multi-method signup (FR-04.1, FR-05..FR-05.5) + industrial preferences (FR-08.1) + investment goal (FR-08.2), new in v2.2](#onboarding)
   - [FR-09 to FR-14: Home Screen](#home-screen)
   - [FR-15 to FR-22: Discover / Trending Feed](#discover--trending-feed)
   - [FR-23 to FR-29: Stock Detail](#stock-detail)
   - [FR-30 to FR-35: Portfolio Tracking](#portfolio-tracking)
   - [FR-36 to FR-41: Markets Module — VN primary, KR + Global reference-only (v2.2)](#markets-module)
   - [FR-42 to FR-47: Notifications](#notifications)
   - [FR-48 to FR-53: User Account — includes Linked Providers panel FR-49.1 (v2.2)](#user-account)
3. [Module A: Age Gate (FR-AGE-01 to FR-AGE-04)](#module-a-age-gate)
4. [Module B: Paper Trading Engine — PRIMARY PILLAR (FR-PT-01 to FR-PT-06)](#module-b-paper-trading-engine)
5. [Module C: Gamification (FR-GAME-01 to FR-GAME-05)](#module-c-gamification)
6. [Module D: AI Insights P0 (FR-AI-01 to FR-AI-03)](#module-d-ai-system-p0)
7. [Module E: AI Insights P1 (FR-AI-04 to FR-AI-05)](#module-e-ai-system-p1)
8. [Module F: Social Trading P1 (FR-SOC-01 to FR-SOC-05)](#module-f-social-features-p1)
9. [Module G: Language System (FR-LANG-01 to FR-LANG-02)](#module-g-language-system)
10. [Module H: Legal / Disclaimers (FR-LEGAL-01 to FR-LEGAL-03)](#module-h-legal--disclaimers)
11. [Module I: Brokerage Partner Integration — V1.x (FR-BRK-01 to FR-BRK-06)](#module-i-brokerage-partner-integration)
12. [Business Rules](#business-rules)
13. [Traceability Matrix](#traceability-matrix)

---

## V2.1 Scope Notes *(retained — still active)*

Three framing shifts from v2.0:

- **Paper trading is the product**, not a feature. It is the primary pillar; Module B is the spine of the FRD. All other modules exist to feed, socialize, or graduate out of paper trading.
- **Social Trading renames Social Features.** Module F is a track-record-visible social-trading layer, not a peer-learning forum. Education ceases to be a first-class module.
- **Brokerage Partner Integration** is added as Module I (V1.x). Paave remains unlicensed and handles no funds; real trading is executed by licensed securities-company partners on their own infrastructure.

Removed from scope in v2.1 (was in v2.0 Module E / elsewhere):
- Pre-trade AI risk-score card and suggested position size (FR-AI-04 in v2.0).
- Personalized learning paths, 90-second micro-lessons, spaced repetition (FR-AI-06 in v2.0).
- Echo-chamber behavioral detection (subset of FR-AI-07 in v2.0).

Still deferred to V2+: full social feed (copy trading, following feed), leaderboard v2, Morning Call AI briefing, public portfolio sharing, pre-trade AI advisory surfaces.

## V2.2 Scope Notes *(new in v2.2 — additive on top of v2.1)*

Three additive deltas in v2.2:

- **Vietnam Gen Z is the sole PRIMARY persona.** All scope, copy, marketing, personalization defaults, and success metrics are Vietnam-first. KR and US/Global market data remain in V1 **for reference only** — labeled "Reference" in every surface, no SLA, no primary-persona product decisions driven by KR/US needs. KR localization, KR social community, and KR marketing campaigns are deferred to V2+.
- **Multi-method signup is core V1 scope.** V1 ships with four signup methods on day one: email + password, Google OAuth, Apple OAuth, and Zalo OAuth (BR-SIGNUP-01). New FRs: FR-04.1 Signup Method Selection, FR-05 Email/Password Signup, FR-05.1 Google OAuth, FR-05.2 Apple OAuth, FR-05.3 Zalo OAuth, FR-05.4 Post-Handshake DOB Prompt, FR-05.5 Account Linking. Updates: FR-07 Login routes to the method used at registration; no password is ever set for social-only accounts.
- **Onboarding collects industrial preferences + investment goal.** Two new steps (FR-08.1 Industrial Preferences multi-select; FR-08.2 Investment Goal single-choice) are inserted between the age-gate routing and the consent screen. These fields seed Discover personalization (BR-ONBOARD-04), weekly challenge difficulty (BR-ONBOARD-05), and home widgets. `onboarded_at` flag flips only when both fields (or explicit "Skip" on preferences) plus goal are persisted.

Deferred to V2+ from v2.2 scope:
- Additional social providers (Facebook, KakaoTalk, Line, Naver).
- KR-localized marketing and KR-localized social communities.
- Document-based KYC at signup (V1.x partner-path only; V2+ for Paave itself).

---

## 1. Feature Overview

| Feature | Pillar | Actor | Goal |
|---------|-------|-------|------|
| **Paper Trading Engine** | **PRIMARY** | LEARN_MODE / FULL_ACCESS User | Simulate market and limit orders on HOSE/HNX (VN primary, real-time), KOSPI/KOSDAQ (reference), and global tickers (reference) with virtual funds |
| **Social Trading** | PRIMARY | Registered User | Follow traders, view per-ticker feeds, share trade receipts, size conviction from community signal |
| **Multi-Method Signup (v2.2)** | PRIMARY | New User | Register via email/password, Google, Apple, or Zalo; provider verifies identity and Paave auto-creates account using provider display name |
| **Onboarding Personalization (v2.2)** | PRIMARY | New User | Capture industrial preferences (multi-select) + investment goal (single-choice) to seed Discover personalization and challenge difficulty |
| Home Screen | Supporting | Registered User | Surface paper portfolio, followed traders, market snapshot, trending stocks |
| Discover / Trending Feed | Supporting | Registered User | Browse curated stock cards with editorial context, social proof, and preference-weighted ranking |
| Stock Detail | Supporting | Registered User | View price data, key stats, community feed, and place paper trades |
| Portfolio Tracking (Paper) | Supporting | Registered User | Track virtual holdings, P&L, and trade history |
| Markets Module | Supporting | Registered User | Browse VN market data (primary, real-time); KR + Global as **reference only** in V1 |
| **Brokerage Partner Integration (V1.x)** | PRIMARY (V1.x) | FULL_ACCESS User, Tier 3+, ≥ 30 paper trades | Open a real account at a licensed partner broker; hand off paper strategies into real markets |
| Notifications | Supporting | Registered User | Receive price alerts, nudges, portfolio health updates |
| User Account | Supporting | Registered User | Manage profile, language, preferences, linked providers, and security settings |
| Age Gate | Supporting | New User | Enforce age-appropriate feature access and brokerage eligibility based on verified DOB (post-OAuth mandatory screen for social signups) |
| Gamification | Supporting | Registered User | Earn XP, advance Trader Tiers, complete weekly challenges |
| AI Insights P0 | Supporting | Registered User | Post-trade insight cards and natural-language stock queries (ticker/portfolio-scoped) |
| AI Insights P1 (V1.x) | Supporting | Registered User | Weekly portfolio health check and behavioral nudges |
| Language System | Supporting | Registered User | VN/KR/EN language selection with locale-appropriate financial terminology (VN is default for VN users) |
| Legal / Disclaimers | Supporting | Registered User | Investment, AI, paper-trading, minor, and brokerage-partner disclaimers; data consent |

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
  - Given device locale `vi` → Vietnam selected as default nationality.
  - Given device locale `en-US` → Global pre-selected.
- **Edge Cases:** No locale set (custom ROMs) → defaults to Global.
- **Priority:** P0

---

#### FR-04 — Market Preference Selection *(Deprecated — V1 onward)*

- **Actor:** N/A
- **Description:** Market preference selection has been removed from the onboarding flow. All users are defaulted to Vietnam (HoSE/HNX) as the sole primary market in V1 (BRD §5.1.2). No user-facing selection is presented. KR and Global are surfaced as **reference only** in Markets module — not selectable as a "primary" market.
- **Key Rules:** `market_preference` is system-set to `VN` on account creation. Not user-configurable in V1.
- **Acceptance Criteria:** N/A — preference set automatically on registration.
- **Edge Cases:** N/A
- **Priority:** Deprecated

---

#### FR-04.1 — Signup Method Selection *(new in v2.2)*

- **Actor:** New User
- **Description:** Unauthenticated user lands on a "Create account" screen presenting four signup methods: **Continue with Google**, **Continue with Apple** (iOS only; optional on Android), **Continue with Zalo**, **Sign up with email**. Buttons render in the user's language. Tapping a social button launches the provider OAuth flow (FR-05.1/5.2/5.3). Tapping "Sign up with email" routes to FR-05.
- **Input:** None — button tap only.
- **Output:** Navigation to the selected signup FR; no account yet created at this step.
- **Precondition:** User is unauthenticated and has tapped "Create Account" on Welcome (FR-02).
- **Postcondition:** User enters the chosen signup flow.
- **V2.2 Update:** This screen is new in v2.2. Replaces the v2.1 flow that routed directly to FR-05 email signup.
- **Key Rules:**
  - BR-SIGNUP-01 — all four methods must be present at V1 launch (though Zalo may ship dark if provider approval is delayed).
  - BR-SIGNUP-02 — on iOS, "Sign in with Apple" must be rendered with equal prominence whenever Google or Zalo is rendered.
  - BR-SIGNUP-06 — if a provider is unreachable, that button is disabled with a provider-specific label; other methods remain usable.
- **Acceptance Criteria:**
  - Given an iOS user lands on the signup method selector → all four buttons render with equal sizing and tap targets.
  - Given Zalo is experiencing an outage → the Zalo button is disabled and labelled "Zalo sign-in is temporarily unavailable"; other buttons are unaffected.
  - Given the user taps "Continue with Google" → Google OAuth flow (FR-05.1) launches within 2 seconds.
- **Edge Cases:**
  - No network → all buttons disabled; a "Check your connection" banner is shown.
  - Provider SDK not installed (Zalo app missing) → fallback to web-based OAuth in an in-app browser.
- **Priority:** P0

---

#### FR-05 — User Registration — Email + Password (Method A)

- **Actor:** New User (Email method)
- **Description:** Collects: Display name, Email, Password, DOB (day/month/year picker), Nationality (pre-filled). Sends verification email on submit. On success, account is created in `PENDING_VERIFICATION` state and user proceeds to FR-06.
- **V2 Update:** DOB field added (FR-AGE-01). Data consent screen (FR-LEGAL-03) shown before this step.
- **V2.2 Update:** This FR now covers only the email/password path. Social methods are FR-05.1 (Google), FR-05.2 (Apple), FR-05.3 (Zalo). Nationality defaults to VN for V1; not user-selectable (see BRD §5.1.2).
- **Input:**
  - Display name: 2–50 chars, Unicode-allowed, profanity-filtered
  - Email: RFC 5322, max 254 chars
  - Password: 8–64 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char (`!@#$%^&*`)
  - Nationality: system-defaulted to VN (not user-selectable in V1)
  - DOB: date picker (see FR-AGE-01)
- **Output:** Account row with `signup_method = 'email'`, `status = 'PENDING_VERIFICATION'`, `password_hash = bcrypt(…)`, verification email sent.
- **Precondition:** User tapped "Sign up with email" on FR-04.1.
- **Postcondition:** FR-06 is routed (OTP entry screen).
- **Key Rules:** Email uniqueness enforced. DOB required (BR-AGE-01). Password-hash is bcrypt or argon2id, never plaintext.
- **Acceptance Criteria:**
  - Given valid form → account created `PENDING_VERIFICATION`, verification email sent within 30s.
  - Given duplicate email that is ALSO linked to a social account → field error "This email is already registered — try signing in with [provider]" (BR-SIGNUP-08).
  - Given duplicate email registered via email/password → field error "An account with this email already exists."
- **Edge Cases:** Email already registered but unverified → resend OTP, navigate to verification screen.
- **Priority:** P0

---

#### FR-05.1 — User Registration — Google OAuth (Method B) *(new in v2.2)*

- **Actor:** New User (Google method)
- **Description:** Launches Google OAuth 2.0 flow with scopes `openid email profile`. On successful callback, Paave receives: Google-verified email, display name, avatar URL, Google Sub ID. Account is auto-created using the returned display name as `display_name`. The flow then routes to FR-05.4 (post-handshake DOB prompt).
- **Input:** User tap on "Continue with Google" from FR-04.1 plus provider-returned token payload.
- **Output:** Account row with `signup_method = 'google'`, `google_sub = <sub>`, `email = <provider_email>`, `display_name = <provider_name>`, `password_hash = NULL`, `status = 'PENDING_DOB'`.
- **Precondition:** Google OAuth client is configured and reachable.
- **Postcondition:** User is routed to FR-05.4 (DOB prompt).
- **Key Rules:**
  - BR-SIGNUP-03 — DOB must be collected post-handshake before any other surface.
  - BR-SIGNUP-07 — OAuth tokens encrypted at rest; never logged.
  - BR-SIGNUP-09 — only `email`, `profile` scopes requested; no phone, no friends list.
- **Acceptance Criteria:**
  - Given user completes Google OAuth → account row inserted with `signup_method='google'` and status `PENDING_DOB`; user lands on FR-05.4.
  - Given Google returns an email already registered → account-linking flow (FR-05.5) triggers instead of creating a duplicate.
  - Given Google returns an empty or missing display name → default to `Người dùng ẩn danh` (VN) / `익명 사용자` (KR) / `Anonymous User` (EN), and force edit on FR-05.4.
- **Edge Cases:**
  - Google token invalid or expired at callback → return to FR-04.1 with a toast "Sign-in failed. Try again."
  - User cancels Google consent screen → return to FR-04.1 silently.
  - Google returns email but user denies `profile` → account creation fails; toast "Paave needs access to your name to continue."
- **Priority:** P0

---

#### FR-05.2 — User Registration — Apple OAuth (Method C) *(new in v2.2)*

- **Actor:** New User (Apple method)
- **Description:** Launches "Sign in with Apple" flow using Apple's native authentication. On successful callback, Paave receives: Apple Sub ID (stable), display name (first/last from Apple, only on first sign-in), email (which may be a **private relay** address). Account is auto-created using the Apple-returned display name. The flow then routes to FR-05.4.
- **Input:** User tap on "Continue with Apple" from FR-04.1 plus Apple credential payload.
- **Output:** Account row with `signup_method = 'apple'`, `apple_sub = <sub>`, `email = <relay_or_real_email>`, `email_is_relay = true|false`, `display_name = <provider_name>`, `password_hash = NULL`, `status = 'PENDING_DOB'`.
- **Precondition:** Apple Developer Program + Sign in with Apple capability registered for Paave's bundle ID.
- **Postcondition:** User is routed to FR-05.4 (DOB prompt).
- **Key Rules:**
  - BR-SIGNUP-02 — on iOS, Apple sign-in button is mandatory alongside Google/Zalo.
  - BR-SIGNUP-05 — account linking keyed by Apple Sub ID, not email (because email may be a private relay).
  - BR-SIGNUP-07 — Apple identity token encrypted at rest; never logged.
  - Paave must store the private relay email verbatim and send transactional mail to it as-is (Apple forwards).
- **Acceptance Criteria:**
  - Given user completes Apple OAuth → account row inserted with `signup_method='apple'`, `email_is_relay` set correctly, `status='PENDING_DOB'`; user lands on FR-05.4.
  - Given Apple returns a private relay email → email is stored; subsequent transactional emails succeed via Apple's relay service.
  - Given user later signs in with a different provider → account-linking (FR-05.5) uses the Apple Sub ID, not the relay email.
- **Edge Cases:**
  - Apple returns no name (second-time sign-in after initial first-name consent) → Paave uses the stored name; if none, prompts user to enter one in FR-05.4.
  - Relay email bounces → fall back to in-app messaging for critical notifications (RISK-20).
  - User revokes Apple sign-in in iOS Settings → on next launch, the account is locked into "re-authenticate with Apple" state.
- **Priority:** P0 (iOS), P1 (Android — Apple sign-in is optional on Android)

---

#### FR-05.3 — User Registration — Zalo OAuth (Method D) *(new in v2.2, VN-critical)*

- **Actor:** New User (Zalo method)
- **Description:** Launches Zalo OAuth 2.0 flow using Zalo Open Platform SDK or web fallback. On successful callback, Paave receives: Zalo user ID (`id`), display name (`name`), avatar URL (`picture`). Email may or may not be returned. Account is auto-created using the Zalo-returned display name. If email is not returned, FR-05.4 additionally requires the user to enter an email for account recovery.
- **Input:** User tap on "Continue with Zalo" from FR-04.1 plus Zalo credential payload.
- **Output:** Account row with `signup_method = 'zalo'`, `zalo_id = <id>`, `email = <zalo_email_or_null>`, `display_name = <provider_name>`, `password_hash = NULL`, `status = 'PENDING_DOB'` (if email returned) or `'PENDING_DOB_AND_EMAIL'` (if no email).
- **Precondition:** Zalo Open Platform business account approved and OAuth client credentials provisioned.
- **Postcondition:** User is routed to FR-05.4 (DOB prompt + optional email step).
- **Key Rules:**
  - BR-SIGNUP-01 — Zalo is a required V1 method (may ship dark if Zalo approval delayed; see RISK-17).
  - BR-SIGNUP-03 — DOB must be collected post-handshake.
  - BR-SIGNUP-09 — only `id`, `name`, `picture` scopes requested; no phone, no friends, no address.
- **Acceptance Criteria:**
  - Given user completes Zalo OAuth with email → account row inserted with `signup_method='zalo'`, `email` populated, `status='PENDING_DOB'`.
  - Given user completes Zalo OAuth without email → status `PENDING_DOB_AND_EMAIL`; FR-05.4 shows email field as required.
  - Given Zalo returns an email that conflicts with an existing Paave account → account-linking flow (FR-05.5).
- **Edge Cases:**
  - Zalo native app not installed → fallback to in-app browser web OAuth.
  - Zalo provider 5xx at exchange → show "Zalo sign-in temporarily unavailable"; user returns to FR-04.1.
  - Zalo display name contains banned characters (profanity list, unicode obfuscation) → force user to edit on FR-05.4 before proceeding.
- **Priority:** P0

---

#### FR-05.4 — Post-Handshake DOB Prompt (Social Signups) *(new in v2.2)*

- **Actor:** New User (Google / Apple / Zalo method) with account in `PENDING_DOB` or `PENDING_DOB_AND_EMAIL` state
- **Description:** Mandatory, non-skippable screen shown immediately after any social OAuth handshake completes. User enters DOB (day/month/year picker). Display name (pre-filled from provider) is editable here. For Zalo-no-email state, user also enters an email. On submit, DOB drives age-gate routing (FR-AGE-02/03/04) and the account transitions from `PENDING_DOB` to `ACTIVE` (for 18+) or `PARENTAL_CONSENT_PENDING` / `LEARN_MODE` per age.
- **Input:**
  - DOB: date picker (day, month, year). Validated to be a real date and not in the future.
  - Display name: 2–50 chars, editable, profanity-filtered.
  - Email (Zalo-no-email path only): RFC 5322, max 254 chars.
- **Output:** Account transitions to age-appropriate state; routes to FR-08.1 (industrial preference).
- **Precondition:** Account row exists in `PENDING_DOB` or `PENDING_DOB_AND_EMAIL`.
- **Postcondition:** DOB persisted; age-gate state set; next step is FR-08.1.
- **Key Rules:**
  - BR-AGE-01 — DOB is required regardless of signup method.
  - BR-SIGNUP-03 — this screen is non-skippable, non-dismissible; force-quit-and-reopen returns here.
  - BR-AGE-03 — if DOB < 16, route to parental consent (FR-AGE-03).
- **Acceptance Criteria:**
  - Given user enters DOB = 22 years old → account transitions to `ACTIVE` + FULL_ACCESS; routed to FR-08.1.
  - Given user enters DOB = 16 years old → account transitions to `ACTIVE` + LEARN_MODE; routed to FR-08.1.
  - Given user enters DOB = 14 years old → account transitions to `PARENTAL_CONSENT_PENDING`; routed to FR-AGE-03 (parental consent flow).
  - Given user force-quits mid-screen → re-opening the app routes back to this exact screen (state-persistent).
  - Given Zalo path with no email → email field is shown and required; submit fails if missing.
- **Edge Cases:**
  - User enters a future DOB → inline error "Please enter a valid date of birth."
  - User backgrounds the app mid-entry for > 24h → session may need re-auth via the same provider; DOB entry resumes on return.
  - Display name edit resolves to empty after profanity filter → user must enter a new name; submit disabled.
- **Priority:** P0

---

#### FR-05.5 — Account Linking on Email/Provider Conflict *(new in v2.2)*

- **Actor:** New User whose OAuth handshake returns an email that matches an existing Paave account
- **Description:** When a social OAuth handshake (FR-05.1/5.2/5.3) returns an email that already exists on a Paave account (email/password or another social provider), Paave does **not** create a second account. Instead, it displays an account-linking screen: "An account with this email already exists. Sign in with [original method] to link this [new provider] to your account." On successful authentication against the original method, the new provider is linked (sub ID stored, `signup_method` unchanged, linked_providers set updated). For Apple private-relay, linking keys on Apple Sub ID rather than email (BR-SIGNUP-05).
- **Input:**
  - Existing account credentials (email/password OR re-auth via original provider).
  - New provider credentials (already received).
- **Output:** Linked account — no new row in `users`; `linked_providers` JSON column updated with the new provider's sub ID; user proceeds to Home (or to DOB prompt if the original account was also `PENDING_DOB`).
- **Precondition:** Social OAuth returned an email that exists in `users.email`.
- **Postcondition:** New provider linked; no duplicate account created.
- **Key Rules:**
  - BR-SIGNUP-04 — zero duplicate accounts created under conflict.
  - BR-SIGNUP-05 — Apple linking keyed by Apple Sub ID, not email (private relay).
  - BR-SIGNUP-08 — if user later tries email/password on a social-only account, they are shown a "Sign in with [provider]" redirect (no password prompt, no reset).
  - RISK-23 — linking does not merge Trader Tier scores; the linked provider adopts the existing account's Tier.
- **Acceptance Criteria:**
  - Given email `x@ex.com` exists (email/password) and user signs up via Google with same email → account-linking prompt shown; after password verification, Google is added to `linked_providers`; no duplicate row.
  - Given Apple private-relay signup followed by Google signup with Apple's real email → linking not triggered by email match (relay breaks it); uses alternate contact verification.
  - Given user abandons the linking prompt → no linking occurs; on next sign-in, user is prompted again.
- **Edge Cases:**
  - User forgets the original-account password → password-reset flow available from the linking prompt.
  - User tries to link same provider twice (same Google account to two different Paave accounts) → rejected; the Google sub ID is already bound elsewhere.
  - Original account is in `PARENTAL_CONSENT_PENDING` → linking blocked until consent completes.
- **Priority:** P0

---

#### FR-06 — Email Verification (Email/Password method only)

- **Actor:** New User (Email method)
- **Description:** 6-digit OTP sent to email; valid 10 minutes; resend after 60-second cooldown; max 5 attempts before 15-minute lockout.
- **V2.2 Update:** This FR applies only to Method A (email/password). Social OAuth methods (FR-05.1/5.2/5.3) use the provider's verification and do NOT run this step.
- **Key Rules:** New OTP immediately invalidates previous OTP.
- **Acceptance Criteria:**
  - Given correct OTP within 10 minutes → account `ACTIVE`, routed to FR-08.1.
  - Given 5th incorrect attempt → "Too many attempts. Please try again in 15 minutes."
- **Edge Cases:** OTP in spam → hint shown below input field.
- **Priority:** P0

---

#### FR-07 — Login (Multi-Method)

- **Actor:** Returning User
- **Description:** Login screen offers: email/password form AND "Continue with Google / Apple / Zalo" buttons. The system routes the user to whichever method matches their account. If a user attempts email/password on a social-only account, response is a redirect: "This account was created with [provider]. Sign in with [provider]." (BR-SIGNUP-08, no password prompt, no reset offer).
- **V2.2 Update:** Social sign-in is a V1 launch feature, not a V1.1 deferral. Removes the prior "Social login (Google, Apple) planned for V1.1" language.
- **Input:**
  - Email/password (Method A): email + password
  - Google/Apple/Zalo (Methods B/C/D): provider token from re-authentication
- **Key Rules:**
  - JWT access token (1h), refresh token (30d).
  - 5 consecutive failures on email/password → 15-minute lockout.
  - BR-SIGNUP-08 — social-only accounts never receive a password prompt.
- **Acceptance Criteria:**
  - Given email/password valid → Home screen.
  - Given email/password submitted for a Google-only account → 200 with redirect "Sign in with Google"; no lockout counter increment.
  - Given Google re-auth succeeds → Home screen.
  - Given 5th failed email/password attempt → account locked 15 minutes.
- **Edge Cases:**
  - `PENDING_VERIFICATION` account → "Please verify your email to continue."
  - `PENDING_DOB` account (social signup abandoned at DOB) → routed to FR-05.4.
  - Provider outage at login time → same provider's button disabled with label; user sees "Try another method" if available.
- **Priority:** P0

---

#### FR-08 — Onboarding Progress Indicator

- **Actor:** New User
- **Description:** Step indicator during registration flow. Visible on every onboarding screen.
- **V2.2 Update:** Step count is **6** (for social signups) or **6** (for email signups):
  - Email: Data Consent → Account Details → Verify Email → DOB *(same form, not separate step)* → Industrial Preferences → Investment Goal
  - Social: Method Selection → Provider Handshake → DOB (+ optional email) → Industrial Preferences → Investment Goal → Consent
  - The indicator shows `step X of 6` at all times.
- **Key Rules:** Step indicator always visible during registration; not shown on Login screen.
- **Acceptance Criteria:**
  - Given user on DOB step post-Google-handshake → "step 3 of 6" highlighted.
  - Given user on Investment Goal step → "step 5 of 6" highlighted.
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-08.1 — Industrial / Sector Preferences *(new in v2.2)*

- **Actor:** New User post-DOB (both email and social paths)
- **Description:** Multi-select screen titled "What do you want to follow?" (localized). User selects ≥ 0 and ≤ 10 sectors from the enum list: Banking, Real Estate, Tech, Consumer, Energy, Healthcare, Industrials, Materials, Utilities, Retail. Each option is a chip with a localized label. A secondary "Skip for now" action is present; selecting Skip persists an empty array and shows a dismissible notice that Discover personalization will be generic until preferences are added.
- **Input:** Zero or more sector enum values.
- **Output:** `users.industrial_prefs = <array of enum values>`, persisted before next screen.
- **Precondition:** Account is in `ACTIVE` state post-DOB (or `LEARN_MODE`).
- **Postcondition:** Routes to FR-08.2 (investment goal).
- **Key Rules:**
  - BR-ONBOARD-01 — enum values only; freeform disallowed; max 10.
  - BR-ONBOARD-03 — labels localized in vi/ko/en; DB stores canonical English slug.
  - BR-ONBOARD-04 — Discover ranker uses this array.
- **Acceptance Criteria:**
  - Given user selects `[Banking, Tech, Consumer]` → `industrial_prefs` persisted with those three enum values; next step is FR-08.2.
  - Given user selects 11 sectors → 11th tap is rejected with inline hint "You can select up to 10."
  - Given user taps "Skip for now" → empty array persisted; degradation notice shown for 5 seconds; routed to FR-08.2.
  - Given user selects at least one sector → "Continue" button becomes enabled.
- **Edge Cases:**
  - User backgrounds mid-selection → returning restores selected state from local draft.
  - User changes language mid-screen → chip labels update immediately without losing selection.
- **Priority:** P0

---

#### FR-08.2 — Investment Goal *(new in v2.2)*

- **Actor:** New User post-FR-08.1
- **Description:** Single-choice screen titled "What are you here for?" (localized). User selects exactly one of the six options: **Learn & explore** (`learn_explore`), **Grow savings** (`grow_savings`), **Beat inflation** (`beat_inflation`), **High returns** (`high_returns`), **Long-term wealth** (`long_term_wealth`), **Just for fun** (`just_for_fun`). "Skip" is NOT available — goal is mandatory.
- **Input:** Exactly one enum value.
- **Output:** `users.investment_goal = <enum>`, persisted. Sets `onboarded_at = now()` if all prior required fields are persisted.
- **Precondition:** FR-08.1 completed.
- **Postcondition:** `onboarded_at` flipped; routes to FR-LEGAL-03 consent (if not already shown) or Home.
- **Key Rules:**
  - BR-ONBOARD-02 — mandatory, single-choice enum.
  - BR-ONBOARD-03 — labels localized in vi/ko/en.
  - BR-ONBOARD-05 — challenge seeder uses this goal.
- **Acceptance Criteria:**
  - Given user selects `high_returns` → goal persisted; `onboarded_at` set; routed to Home.
  - Given user taps "Continue" without selecting → button disabled; inline hint "Please choose one."
  - Given user changes language mid-screen → option labels update immediately, selection retained.
- **Edge Cases:**
  - User selects, then changes selection before continuing → only the final selection is persisted.
  - User force-quits before continuing → returning routes back to this screen with no selection (no partial persist).
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
- **Description:** Market toggle (Vietnam | Korea | Global) above theme chips. Default is Vietnam (VN). Session-level; does not update profile.
- **Key Rules:** Switching market resets theme filter to "All."
- **Acceptance Criteria:**
  - Given user switches to Korea filter → Korea stocks shown, theme resets to All.
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
- **Description:** P&L values color-coded: positive → green (#00C853); negative → red (#D50000); zero → gray (#9E9E9E). "+" prefix for positive, "−" for negative.
- **V2 Note:** Retained and applied to paper trading P&L throughout app.
- **Key Rules:** Applied to all P&L values across paper portfolio, leaderboard, and profile.
- **Acceptance Criteria:**
  - Given unrealized P&L of +50,000 VND → displays "+50,000" in green.
- **Priority:** P0

---

### MARKETS MODULE

#### FR-36 — Markets Screen Layout

- **Actor:** Registered User
- **Description:** Tabbed interface: **Vietnam (Primary)** | Korea (Reference) | Global (Reference). Default tab is Vietnam. Investment disclaimer shown on first view per session (FR-LEGAL-01). The Korea and Global tab titles render a persistent "Reference" chip; tapping the chip opens a tooltip explaining that KR and Global data are not SLA-backed in V1.
- **V2.2 Update:** Tab labels updated to explicitly mark VN as PRIMARY and KR + Global as REFERENCE. KR/Global tabs each show a "Reference data" banner at the top of the tab content (BRD §5.1.8, BR-ONBOARD-08).
- **Key Rules:** Disclaimer shown on first view of each tab per session. "Reference" chip is non-dismissible.
- **Acceptance Criteria:**
  - All users → Vietnam tab active by default.
  - Korea tab renders with "Reference" chip next to the tab title and a "Reference data — may be delayed" banner at the top of the tab content.
  - Tapping the Reference chip opens a tooltip: "KR data in V1 is sourced from web search and may be delayed. Real-time KR data ships in V2."
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-37 — Vietnam Market (Real-Time, **PRIMARY**)

- **Actor:** Registered User
- **Description:** HoSE/HNX real-time data. VN-Index summary, HNX-Index summary, Top 5 Gainers, Top 5 Losers, Top 5 Most Active. Data refreshes every 30 seconds during market hours. **Only market with a data SLA in V1** (≤ 15 seconds from exchange tick; BO-06).
- **V2.2 Update:** VN marked as the sole SLA-backed market. Copy reinforces primary status.
- **Key Rules:** Market hours: 09:00–15:00 ICT, Mon–Fri. Holiday calendar maintained server-side. Data latency ≤ 15 seconds.
- **Acceptance Criteria:**
  - Given 10:30 AM ICT weekday → live VN-Index, 5 gainers, 5 losers, 5 most active shown; data ≤30s old.
  - Given 4:00 PM ICT → "Market Closed" badge; next open time shown.
- **Edge Cases:** Feed outage → cached data with banner "Live data temporarily unavailable — showing last known"; VN-Index null → "—" with error banner.
- **Priority:** P0

---

#### FR-38 — Korea Market (**Reference Only**)

- **Actor:** Registered User
- **Description:** KOSPI + KOSDAQ indices, Top 5 Gainers, Top 5 Losers. Data sourced from web search / model knowledge (not real-time feed for V1). **Persistent "Reference" banner** visible at the top of the tab content at all times: "Reference data — may be delayed. Real-time KR shipping in V2." Every KR ticker card carries a "Reference" chip.
- **V2.2 Update:** All KR screens explicitly labeled "Reference" (BRD §5.1.8). No SLA promise in V1 (BO-06).
- **Key Rules:** Disclaimer banner: "Reference data — may be delayed." Non-dismissible. Paper trading on KR tickers uses best-available price with a visible "Estimated price" label at order confirmation (BR-PT-04).
- **Acceptance Criteria:**
  - Given Korea tab opened → disclaimer banner visible at top; KOSPI and KOSDAQ values shown; every ticker card has "Reference" chip.
  - Tapping "Reference" chip → tooltip explaining V1 sourcing.
- **Edge Cases:** Data unavailable → "Data temporarily unavailable. Please check back later."
- **Priority:** P1 (demoted from P0 in v2.2 — KR is reference-only in V1)

---

#### FR-39 — Global Market Overview (**Reference Only**)

- **Actor:** Registered User
- **Description:** 6 index cards: S&P 500, Nasdaq, Dow Jones, FTSE 100, Nikkei 225, DAX. Web search / model knowledge. **Persistent "Reference" banner** visible at the top of the tab content at all times. Every Global ticker card carries a "Reference" chip.
- **V2.2 Update:** Global marked as reference-only in V1 (BRD §5.1.8). No SLA promise.
- **Key Rules:** Disclaimer banner shown; values formatted per locale. Non-dismissible.
- **Acceptance Criteria:**
  - Given Global tab → 6 index cards with daily change; "Reference data" banner visible.
  - Every Global ticker card displays "Reference" chip.
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
- **Key Rules:** All notification types stored: price alerts, market open/close, watchlist movements, AI behavioral nudges (FR-AI-05), portfolio health (FR-AI-04).
- **Acceptance Criteria:**
  - Given 2 price alert notifications → both appear in inbox; unread shown in bold.
- **Edge Cases:** Inbox empty → "No notifications yet."
- **Priority:** P1

---

### USER ACCOUNT

#### FR-48 — User Profile Screen

- **Actor:** Registered User
- **Description:** Profile screen: display name, masked email, nationality, **linked providers list (v2.2)**, industrial preferences, investment goal. Sub-links: Notification Settings, Language, **Linked Providers (v2.2)**, Change Password *(email-only accounts)*, App Settings, Help & Support, Log Out.
- **V2 Update:** Language Settings link added (FR-LANG-01). Trader Tier badge + XP shown on profile (FR-GAME-01/FR-GAME-02).
- **V2.2 Update:** New rows surface linked providers (Google / Apple / Zalo) and preference-edit shortcuts (industrial preferences + investment goal). "Change Password" only shown for accounts that have an email/password method; hidden for social-only accounts.
- **Key Rules:** Email partially masked: `lo***@gmail.com`. For Apple private-relay emails, shown as `••••••@privaterelay.appleid.com`.
- **Acceptance Criteria:**
  - Given user navigates to Profile → trader tier badge and XP total visible alongside account details.
  - Given user is social-only (no email/password) → "Change Password" link is hidden.
  - Given user has Google + Zalo linked → both show under "Linked Providers" with a disconnect button (disabled if removing would leave 0 methods).
- **Edge Cases:** None.
- **Priority:** P0

---

#### FR-49 — Edit Profile

- **Actor:** Registered User
- **Description:** Edit display name. Edit industrial preferences (re-enter FR-08.1 multi-select UI). Edit investment goal (re-enter FR-08.2 single-choice UI). Email and market preference not editable in V1 (market is fixed to VN; email is provider-controlled for social accounts).
- **V2.2 Update:** Preference and goal now editable from profile (BR-ONBOARD-06). Edits take effect on Discover and challenge seeder within the current session.
- **Key Rules:** Display name 2–50 chars, Unicode, profanity-filtered. Preference change persists to `industrial_prefs`; goal change persists to `investment_goal`.
- **Acceptance Criteria:**
  - Given display name updated → Profile reflects new name; Home hero greeting updated.
  - Given industrial preferences edited from `[Banking]` to `[Banking, Tech, Consumer]` → Discover feed re-ranked on next refresh within session.
  - Given investment goal changed → next-week's challenge seed uses the new goal.
- **Edge Cases:** Name with only spaces → reject with "Name cannot be blank." Preferences dropped to 0 items → degradation notice shown.
- **Priority:** P0

---

#### FR-49.1 — Linked Providers Management *(new in v2.2)*

- **Actor:** Registered User
- **Description:** Settings screen listing which auth methods are linked to the account. For each provider (email/password, Google, Apple, Zalo), a row shows the provider name, status (Linked / Not linked), and a button (Disconnect if linked, Link if not). Linking adds a new provider (runs that provider's OAuth handshake in link-mode, not signup-mode). Disconnecting removes the provider — blocked if it would leave zero usable methods.
- **V2.2 Update:** New screen.
- **Key Rules:**
  - BR-SIGNUP-04 — no duplicate account creation under linking.
  - BR-SIGNUP-08 — social-only accounts cannot add email/password without a password-creation flow (V1.1).
  - Account must always have ≥ 1 usable auth method.
- **Acceptance Criteria:**
  - Given account has email/password + Google linked → both rows show "Disconnect" available; disconnecting Google succeeds because email/password remains.
  - Given account has Google only → disconnect button shows disabled with tooltip "You need at least one sign-in method."
  - Given user taps "Link Zalo" → Zalo OAuth handshake runs in link-mode; on success, `zalo_id` is added to the current user row (no new row).
- **Edge Cases:**
  - Linking a provider whose email conflicts with a different Paave account → rejected with error "This [provider] account is already linked to a different user."
  - Linking with Apple private-relay → linking keyed on Apple Sub ID.
- **Priority:** P0

---

#### FR-50 — Change Password *(Email/Password accounts only)*

- **Actor:** Registered User (email/password method linked)
- **Description:** Current password + new password + confirm new password. All existing refresh tokens invalidated on success. User stays logged in.
- **V2.2 Update:** Only available to accounts that have an email/password method. Social-only accounts do not see this option (BR-SIGNUP-08).
- **Key Rules:** New password: same policy as FR-05. Current password must validate.
- **Acceptance Criteria:**
  - Given valid current and new passwords → password changed; all other sessions invalidated.
  - Given wrong current password → "Current password is incorrect."
  - Given social-only account attempts to reach this screen via deep link → routed to Profile with a toast "This account uses [provider] — no password to change."
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
- **Description:** Toggle switches for: Price Alerts, Market Open, Market Close, Watchlist Movements, Portfolio Health Check (FR-AI-04), Behavioral Nudges (FR-AI-05). Changes save immediately.
- **V2.1 Update:** Two AI-sourced notification types retained (Portfolio Health, Behavioral Nudges); pre-trade advisory and personalized-learning notifications removed along with their source features.
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

- **Actor:** New User (all signup methods)
- **Description:** Date of birth is required for every signup method. For email/password (FR-05) DOB is collected inside the same form. For social OAuth (FR-05.1/5.2/5.3), DOB is **never trusted from the provider** and is collected in a mandatory post-handshake screen (FR-05.4). Must be ≥ 16 years old to complete registration as an active user; under 16 is routed to parental consent (FR-AGE-02). DOB stored encrypted at rest.
- **V2.2 Update:** DOB-from-OAuth is explicitly not trusted — BR-AGE-01 + BR-SIGNUP-03 require the post-handshake DOB screen for all social signups. Account state is `PENDING_DOB` until DOB is captured; no app surface outside FR-05.4 is reachable in that state.
- **Key Rules:**
  - BR-AGE-01 — DOB is required regardless of signup method.
  - BR-SIGNUP-03 — social OAuth cannot bypass FR-05.4.
  - Minimum age for active registration: 16. Calculated as: (today − DOB) ≥ 16 years.
  - Ages 13–15: directed to parental consent flow (future implementation).
  - Under 13: registration blocked entirely; "Paave requires users to be at least 13 years old."
  - DOB field: date picker (no free-text); cannot select future dates.
  - DOB encrypted using AES-256 before persistence.
- **Acceptance Criteria:**
  - Given DOB entered making user 17 years old → registration proceeds to FR-AGE-03 LEARN_MODE.
  - Given DOB making user 12 years old → error shown, registration cannot continue.
  - Given social OAuth succeeds with a provider that returned DOB → Paave ignores the provider DOB and still shows FR-05.4; the field is blank (not pre-filled from OAuth).
  - Given user force-quits on FR-05.4 → re-opening the app lands back on FR-05.4 (BR-SIGNUP-03).
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

## Module B: Paper Trading Engine — **PRIMARY PILLAR**

> **Purpose:** The product. All users get a virtual portfolio on account creation and paper trading is the primary way users interact with Paave. Every other module feeds into or off of this one. "Tiền ảo / 가상 자금 / Virtual Funds" label mandatory on all paper trading screens (FR-PT-06). Real-money execution never happens inside Paave — when a paper trader graduates, Module I (Brokerage Partner Integration, V1.x) hands them off to a licensed partner.

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
  - **v2.1 change:** Pre-trade AI advisory card removed (was FR-AI-04 in v2.0). No AI surface between "Buy" tap and order confirmation — the action is direct.
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
  | 2 | Apprentice | Học việc | 견습생 | 500 |
  | 3 | Analyst | Chuyên viên | 분석가 | 1,500 |
  | 4 | Portfolio Manager | Quản lý quỹ | 포트폴리오 매니저 | 3,500 |
  | 5 | Expert | Chuyên gia | 전문가 | 7,500 |
  | 6 | Legend | Huyền thoại | 레전드 | 15,000 |

- **Key Rules:**
  - Tier badge shown on user profile and alongside every post in the community feed.
  - Tier is display-only; does not unlock features (feature access governed by FR-AGE-03).
  - Tier is re-evaluated weekly after Trader Score update (FR-GAME-03).
  - Tier can only increase, never decrease.
- **Acceptance Criteria:**
  - Given user reaches 1,500 cumulative score → tier badge updates to "Analyst / Chuyên viên / 분석가."
  - Given posts in community feed → tier badge shown next to author pseudonym.
- **Edge Cases:** Score threshold boundary (exactly 500) → upgrade to Apprentice.
- **Priority:** P1

---

#### FR-GAME-03 — Trader Score

- **Actor:** Registered User
- **Description:** Composite weekly score computed on Sundays. Formula:
  - Return (40%): paper portfolio weekly return vs. benchmark
  - Consistency (30%): % of days with at least one meaningful action (trade or lesson)
  - Risk Discipline (20%): absence of flagged behaviors (FOMO, panic sell, overtrading per FR-AI-05)
  - Activity (10%): raw trade + lesson count for the week
- **Key Rules:**
  - Score computed every Sunday at midnight UTC.
  - Score displayed on public profile and leaderboard (deferred V2 feature).
  - Weekly score is additive to cumulative score for tier progression.
  - Behavioral deductions: each FR-AI-05 flag in the week reduces Risk Discipline component by 10 points (max 4 flags = 0 Risk Discipline score for that week).
- **Acceptance Criteria:**
  - Given user had 5% weekly portfolio return with consistent activity and no flags → high score computed and added to profile.
  - Given Sunday midnight passes → score badge on profile updates.
- **Edge Cases:** User had no activity in a week → minimal score computed (Activity component = 0); tier not affected.
- **Priority:** P1

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

## Module D: AI Insights P0

> **Purpose:** Supporting layer on top of paper trading — never a standalone product surface. AI attaches to a trade, a ticker, or a portfolio. Insights are contextual, never advisory, and never include price targets or position-size suggestions. See BR-AI-01, BR-AI-07.

---

#### FR-AI-01 — Post-Trade Explanation

- **Actor:** Registered User (after paper trade fills)
- **Description:** After every paper trade fills, a non-blocking AI card auto-appears in the portfolio screen or as a bottom sheet. Dismissible at any time. Three sections:
  1. **What happened** — plain language description of recent price action for this stock.
  2. **Why** — top 1–2 causal factors (e.g., "sector rotation," "earnings surprise").
  3. **What to watch** — one forward-looking signal (e.g., "next earnings date," "sector catalyst").
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
  - AI detects input language automatically (not dependent on app language setting).
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
- **Description:** System detects user's active language setting (FR-LANG-01) and routes all AI requests (FR-AI-01, FR-AI-02, FR-AI-04, FR-AI-05) to the language-appropriate prompt configuration. AI responses use locale-specific financial terminology (not generic translation). If language changes mid-session, next AI request uses the new language config.
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

## Module E: AI Insights P1 (V1.x)

> **Purpose:** Two narrow AI surfaces that deepen engagement *with the existing paper portfolio* — nothing more. **v2.1 removed** the pre-trade advisory card (FR-AI-04 in v2.0), personalized learning paths with spaced repetition (FR-AI-06 in v2.0), and echo-chamber behavioral detection.

---

#### FR-AI-04 — Portfolio Health Check *(was FR-AI-05 in v2.0)*

- **Actor:** Registered User with ≥ 1 holding in their paper portfolio
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
  - Health check analyzes the **paper** portfolio only. V1.x brokerage-linked real balances are never visible to Paave and are never scored.
- **Acceptance Criteria:**
  - Given user has 5 holdings with high concentration → Concentration grade "D"; overall grade below "B."
  - Given Monday 8AM → push notification delivered; tapping → in-app report card.
  - Given dimension tapped → AI chat opens scoped to that dimension.
- **Edge Cases:** User changes timezone → notification time adjusts from following Monday.
- **Priority:** P1

---

#### FR-AI-05 — Behavioral Nudges *(was FR-AI-07 in v2.0)*

- **Actor:** Registered User
- **Description:** System detects behavioral patterns and delivers non-judgmental nudges:
  - **FOMO buy**: stock up >5% in 3 days + user buys + stock was not on user's watchlist prior → nudge: "Heads up — this stock has moved fast recently. Here's what to consider."
  - **Panic sell**: stock down >4% + user places sell order → nudge: "Market drops happen. Here's a framework for thinking through sell decisions."
  - **Overtrading**: >5 paper trades in a single day → nudge: "You've been active today. Frequent trading can be costly — here's why."
  - **Concentration creep**: single holding reaches >25% of portfolio → nudge: "One stock is now a large part of your portfolio. Here's what diversification means."
- **Key Rules:**
  - Toast notification format: non-judgmental, peer-tone (BR-AI-05). Never says "don't do this."
  - Max 1 nudge per user per calendar day (user's local timezone).
  - User rates each nudge: "Helpful" / "Not helpful." Rating stored for model quality.
  - Nudge flags logged for Trader Score Risk Discipline component (FR-GAME-03).
  - Nudges delivered as in-app toast (not push notifications) — surfaced immediately on action detection.
  - Togglable in FR-52 Notification Settings.
  - Echo-chamber nudges (was in v2.0) are removed — overlap with the social-trading layer and had a high false-positive rate.
- **Acceptance Criteria:**
  - Given stock up 6% in 3 days + user buys (not on prior watchlist) → FOMO nudge toast appears within 5s.
  - Given 5 nudges possible in one day → only first one shown; rest suppressed.
  - Given "Not helpful" tapped → feedback stored; same nudge type reduced in frequency for this user.
- **Edge Cases:** Multiple behavior patterns triggered simultaneously → highest-priority behavior wins (Concentration > FOMO > Panic > Overtrading).
- **Priority:** P1

---

> **Removed in v2.1 (was in Module E v2.0):**
> - **FR-AI-04 Pre-Trade AI Card** — risked reading as advisory (conflicts with BR-AI-01); creates friction in the primary paper-trade loop.
> - **FR-AI-06 Personalized Learning Path** — Paave is not an education product in v2.1; spaced-repetition micro-lessons belong elsewhere.
> - **Echo-chamber subset of FR-AI-07** — overlaps with social-trading signals (Module F) and was high-false-positive.

---

## Module F: Social Trading P1

> **Purpose:** A track-record-visible social-trading layer, not a peer-learning forum. It exists to help users decide what to paper-trade by surfacing who is trading what with what conviction and what PnL% history. Pseudonymous — no real identity revealed, no absolute VND/KRW amounts shown. Deferred features (real-money copy trading, public portfolio sharing, full following feed, Morning Call) remain V2+.

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
- **Description:** User writes a post (max 280 characters). Must attach ≥1 $TICKER cashtag (auto-suggested from stock being viewed). Must select sentiment: Bull / Bear / Neutral. 60-second delay before publish (allows user to cancel). Posts cannot contain direct buy/sell directives without analysis context.
- **Key Rules:**
  - Minimum 1 $TICKER cashtag required; max 5 cashtags per post.
  - Cashtag auto-suggested from the stock detail screen the user is currently viewing.
  - Sentiment selection: required (no publish without selecting one).
  - 60-second pending window: countdown shown; "Cancel" button available during this period.
  - Content moderation: posts containing direct "buy this" / "sell this" language without analysis flagged for review and held pending.
  - Post published to: per-ticker community feed (FR-SOC-02) and following feed of users who follow this author (FR-SOC-04).
- **Acceptance Criteria:**
  - Given user writes post, selects Bull, and attaches $VIC → 60s countdown shown; post published after countdown if not cancelled.
  - Given user taps Cancel within 60s → post discarded.
  - Given user writes "BUY VIC NOW" without additional context → post flagged; held for moderation.
- **Edge Cases:** Character count reaches 281 → input field rejects additional characters; counter shows "280/280" in red.
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
  - Applies to: Key Stats section, AI responses (FR-AI-01–FR-AI-05), Portfolio dashboard, Discover feed, Markets module.
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
- **Description:** All AI outputs — post-trade insight (FR-AI-01), natural language query (FR-AI-02), portfolio health check (FR-AI-04), behavioral nudges (FR-AI-05) — must append the educational disclaimer. Cannot be removed by user settings.
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

## Module I: Brokerage Partner Integration (V1.x)

> **Purpose:** Bridge a graduated paper trader into a real account at a licensed securities-company partner. Paave never executes orders, holds funds, or stores real balances — it publishes a partner directory and hands users off. Gated tight: 18+, Trader Tier 3+, ≥ 30 paper trades (BR-BRK-02). All surfaces must render BR-DISC-05.

---

#### FR-BRK-01 — Partner Directory

- **Actor:** FULL_ACCESS User who is 18+, Tier 3+, and has ≥ 30 paper trades
- **Description:** In-app screen listing licensed brokerage partners scoped to the user's market(s). Each partner card shows: partner legal name, license number, supported markets, fee highlights, status (green/amber/red — onboarding availability), and "Open real account" CTA. Sorted by an editorial relevance score; tie-break by partner name alphabetically.
- **Key Rules:**
  - VN users see only VN-licensed partners; KR users see only KR-licensed partners; users flagged for both markets see both lists tabbed.
  - BR-DISC-05 rendered at the top of the screen in the user's active language, with placeholder [Partner] substituted per partner card.
  - Partners flagged "red" (onboarding paused) still render but with CTA disabled and status string shown.
  - No partner may appear without satisfying BR-BRK-05 (signed agreement, verified license, callback contract load-tested).
- **Acceptance Criteria:**
  - Given a 25-year-old VN user with Tier 4 and 50 paper trades → partner directory reachable from profile; VN partners listed.
  - Given a 17-year-old Learn Mode user → directory is not reachable and no CTA surfaces anywhere in the app.
- **Edge Cases:** Empty directory (no partner live) → directory entry point is hidden entirely from the profile.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-02 — Brokerage CTA Placement

- **Actor:** FULL_ACCESS User meeting BR-BRK-02 eligibility
- **Description:** "Open real account with partner" CTAs appear contextually: (a) on the Paper Portfolio dashboard header when the user has been Tier 3+ for ≥ 7 days, (b) on Stock Detail pages as a secondary CTA below the paper "Buy" button, (c) in the profile menu. Every CTA tap opens a confirmation sheet with BR-DISC-05 before handoff.
- **Key Rules:**
  - CTA impression and tap events are logged for BO-13 measurement.
  - Ineligible users (under 18, below Tier 3, < 30 paper trades) must never render any of these CTAs at any level of the UI (including markup; not just hidden via CSS).
  - Confirmation sheet requires an explicit tap on "Continue to [Partner]"; a single-tap launch is not allowed.
- **Acceptance Criteria:**
  - Given eligibility met + tap CTA → confirmation sheet with BR-DISC-05 appears; tapping "Continue" transitions to handoff.
  - Given eligibility not met → CTA not rendered; route direct access returns 404.
- **Edge Cases:** User's Tier drops below 3 after CTA displayed → on next screen load, CTA no longer rendered.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-03 — Account-Link Handoff

- **Actor:** Eligible User (via FR-BRK-02)
- **Description:** Tapping "Continue to [Partner]" launches the partner's onboarding surface — preferably a partner-native deep link on mobile, falling back to an in-app web view with a fixed Paave chrome (close button + partner legal name + BR-DISC-05 pinned bottom). Handoff payload: `{ paave_user_id (opaque), market, optional ticker_context }`. No credentials, no DOB, no email, no paper balances transmitted.
- **Key Rules:**
  - Payload schema is whitelisted at the network layer; any extra field is stripped before send. Violations are P0 bugs.
  - Web-view fallback may not share cookies with the Paave app session.
  - User can cancel at any time (top-left close) and return to Paave; no ghost state persisted.
  - On successful partner callback (FR-BRK-05), the user's Paave profile shows a "Linked at [Partner]" badge; on failure, the partner's error message is surfaced verbatim.
- **Acceptance Criteria:**
  - Given eligible user confirms handoff → partner flow opens; network audit shows payload = whitelisted fields only.
  - Given user cancels mid-flow → returned to prior Paave screen; no linked-account record created.
- **Edge Cases:** Partner deep-link missing on device → fall back to web view; web-view load failure → "Couldn't reach [Partner]. Please try again." No silent retry.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-04 — Ticker Deep-Link into Partner

- **Actor:** Linked User (completed FR-BRK-03 for a partner)
- **Description:** On a Stock Detail page for a supported market, a secondary "Open [TICKER] at [Partner]" CTA deep-links the user into the partner's order-entry screen for that ticker. Paave never pre-fills price, quantity, or direction.
- **Key Rules:**
  - Only rendered if the user has a linked account for a partner that supports this ticker's market.
  - BR-DISC-05 rendered on the confirmation sheet before deep-link.
  - No order payload — only the opaque user ID and ticker symbol.
  - If partner rejects the deep link (unsupported ticker, maintenance), Paave shows the partner's error verbatim and remains on the Paave screen.
- **Acceptance Criteria:**
  - Given linked VN user on a HOSE ticker → deep-link CTA visible; tapping opens partner order-entry screen for that ticker.
  - Given user not linked → deep-link CTA not rendered.
- **Edge Cases:** Ticker exists on Paave but not at partner → deep-link CTA not rendered.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-05 — Partner Callback & Linked-Account Status

- **Actor:** System (Paave backend) receiving callback from partner
- **Description:** Partner calls back to Paave once account creation succeeds (or definitively fails). Callback payload accepted by Paave: `{ paave_user_id, partner_id, linked_at_timestamp, status (linked/declined), optional_reason_code }`. On `status=linked`, Paave renders the "Linked at [Partner]" badge on the user's profile. Any additional fields (real balance, holdings, real order IDs) must be ignored and logged as a compliance violation.
- **Key Rules:**
  - Callback endpoint is partner-authenticated (HMAC or mTLS); rejects unsigned or expired requests.
  - BR-BRK-07 attribution records (anonymous ticker bucket) are emitted from this handler; real-money amounts must never be written to any Paave table.
  - Linked-account status is reversible via user action: user can "Unlink" from Settings; Paave sends an unlink event to partner and removes the badge.
- **Acceptance Criteria:**
  - Given valid `linked` callback → profile shows "Linked at [Partner]" within 10 seconds.
  - Given callback containing a `real_balance` field → field is dropped, compliance-violation event logged, status still updated if otherwise valid.
- **Edge Cases:** Partner sends duplicate callback → idempotent on (paave_user_id, partner_id); first write wins.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-06 — Paper-to-Real Attribution (Anonymous)

- **Actor:** System (analytics pipeline)
- **Description:** For BO-13 measurement only, Paave records whether a newly linked user's callback arrived within 30 days of the linked ticker appearing in that user's paper watchlist or paper portfolio. Attribution records: `{ paave_user_id_hash, partner_id, ticker, linked_at_bucket_hour, prior_paper_signal (watchlist|portfolio|none) }`.
- **Key Rules:**
  - No real-money amounts, real order IDs, or partner-side user IDs are stored.
  - Records are purged after 180 days.
  - Audit log immutable; quarterly audit by Legal + Engineering confirms BR-BRK-07 compliance.
- **Acceptance Criteria:**
  - Given user had TICKER in watchlist + links account at partner → attribution row written with `prior_paper_signal = watchlist`.
  - Schema audit: no column in attribution table accepts currency or amount-typed values.
- **Edge Cases:** User unlinks and re-links within 30 days → attribution rows are additive; no overwrite.
- **Priority:** P1 (V1.x)

---

## 3. Business Rules

| Rule ID | Description |
|---------|-------------|
| BR-01 | All users default to Vietnam (VN) as their market preference. Market preference is not user-configurable in V1/V2. |
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
| BR-29 | **AI never stands alone.** No top-level AI-only tab, no standalone chat launcher outside a ticker or portfolio context. (Mirrors BRD BR-AI-07.) |
| BR-30 | **Paave never executes a real-money securities order.** All real-money execution is performed by the licensed brokerage partner in Module I under the partner's own license. (Mirrors BRD BR-BRK-01.) |
| BR-31 | **Brokerage CTA eligibility gate:** partner CTAs render only for users 18+, Trader Tier 3+, with ≥ 30 paper trades. Ineligible users never receive the CTA in any surface, including markup. (Mirrors BRD BR-BRK-02.) |
| BR-32 | **Brokerage handoff payload is whitelisted:** `{ paave_user_id, market, optional ticker_context }`. Any additional field (DOB, email, paper balance, order details) is stripped before send and logged as a P0 compliance violation. (Mirrors BRD BR-BRK-03.) |
| BR-33 | **Brokerage disclaimer (BR-DISC-05 / FR-LEGAL):** every partner surface renders the partner-handoff disclaimer in the user's language with partner legal name and license number substituted in. Non-dismissible at the CTA moment. |
| BR-34 | **Anonymous attribution only:** the paper-to-real attribution pipeline stores ticker + timestamp bucket only; never real-money amounts, never partner-side user IDs. (Mirrors BRD BR-BRK-07.) |
| BR-35 | **Multi-method signup mandatory (v2.2):** V1 ships with four signup methods at launch — email/password, Google, Apple, Zalo. Removing any method in V1 is a P0 release blocker. Zalo may ship dark if provider approval is delayed (RISK-17). (Mirrors BRD BR-SIGNUP-01.) |
| BR-36 | **Apple parity on iOS (v2.2):** on iOS, "Sign in with Apple" must be rendered with equal prominence whenever Google or Zalo is rendered (App Store Guideline 4.8). Any iOS build without Apple parity is a launch blocker. (Mirrors BRD BR-SIGNUP-02.) |
| BR-37 | **Post-handshake DOB is non-skippable (v2.2):** social-OAuth accounts are pinned in `PENDING_DOB` state until FR-05.4 is completed. Force-quit-and-reopen returns to FR-05.4. No app surface outside the DOB screen is reachable in `PENDING_DOB`. (Mirrors BRD BR-SIGNUP-03 + BR-AGE-01.) |
| BR-38 | **No duplicate account on conflict (v2.2):** if a social-OAuth email matches an existing Paave account, Paave does NOT create a second row; FR-05.5 account-linking runs instead. Apple private-relay linking keys on Apple Sub ID. (Mirrors BRD BR-SIGNUP-04 + BR-SIGNUP-05.) |
| BR-39 | **OAuth provider failure isolation (v2.2):** if a single provider is unreachable, only that provider's button is disabled; other methods remain usable. No silent retry loops; status checked every 60s server-side. (Mirrors BRD BR-SIGNUP-06.) |
| BR-40 | **OAuth tokens never logged, never displayed (v2.2):** OAuth access and refresh tokens are encrypted at rest and never emitted to application logs, analytics, crash reports, or user-facing surfaces. (Mirrors BRD BR-SIGNUP-07 + BR-PRIV-01.) |
| BR-41 | **Social-only accounts have no password (v2.2):** FR-07 login rejects password attempts on social-only accounts with a "Sign in with [provider]" redirect — never a password prompt, never a reset link. FR-50 Change Password is hidden for such accounts. (Mirrors BRD BR-SIGNUP-08.) |
| BR-42 | **Minimal OAuth scope (v2.2):** only email/profile (Google), name/email (Apple), id/name/avatar (Zalo) are requested. No phone, friends list, address, gender, or birthday scope is requested on any provider. Scope review is quarterly. (Mirrors BRD BR-SIGNUP-09.) |
| BR-43 | **Industrial preferences: enum, multi-select, max 10 (v2.2):** `industrial_prefs` is an array of approved sector enum values (Banking, Real Estate, Tech, Consumer, Energy, Healthcare, Industrials, Materials, Utilities, Retail). No freeform. Min 0 (explicit "Skip" only), max 10. Localized labels via i18n; DB stores canonical English slug. (Mirrors BRD BR-ONBOARD-01 + BR-ONBOARD-03.) |
| BR-44 | **Investment goal: enum, single-choice, required (v2.2):** `investment_goal` is a non-null enum from `{learn_explore, grow_savings, beat_inflation, high_returns, long_term_wealth, just_for_fun}`. Onboarding cannot complete without it. `onboarded_at` is only set when all required fields (DOB, language, industrial_prefs array, investment_goal, consent) are persisted. (Mirrors BRD BR-ONBOARD-02 + BR-ONBOARD-07.) |
| BR-45 | **Discover ranking honors preferences (v2.2):** Discover ranker boosts cards matching the user's `industrial_prefs` by a configurable weight. Empty-preference (Skip) path falls back to VN trending (primary), KR/Global as "Reference"-chipped cards further down. (Mirrors BRD BR-ONBOARD-04 + BR-ONBOARD-08.) |
| BR-46 | **KR + Global are reference-only data in V1 (v2.2):** every KR or Global card/detail page renders a persistent "Reference" chip. Paper trades on KR/Global tickers use best-available price with "Estimated price" label. No SLA. VN is the sole SLA-backed market (BO-06). (Mirrors BRD §5.1.8.) |

---

## 4. Traceability Matrix

This matrix links each functional requirement to the BRD v2.2 business objectives it supports.

| BRD Objective | Description | Linked FRs |
|---------------|-------------|------------|
| BO-01 | Acquire 50K Vietnamese Gen Z MAU through a low-barrier, mobile-first onboarding | FR-01, FR-02, FR-03, FR-04.1, FR-05, FR-05.1, FR-05.2, FR-05.3, FR-05.4, FR-05.5, FR-06, FR-07, FR-08, FR-08.1, FR-08.2, FR-AGE-01, FR-AGE-03, FR-LEGAL-03, FR-LANG-01 |
| BO-02..05 | D7 retention, watchlist adoption, discover engagement, VN-primary concentration (≥ 90% VN MAU, 0 KR campaigns) | FR-09..FR-47, FR-36..FR-41 (VN primary / KR+Global reference only), FR-AGE-*, FR-LANG-* |
| BO-06 | VN data latency ≤ 15s (VN is only SLA-backed market in V1) | FR-37 (VN real-time), FR-38/39 (KR/Global reference-only, no SLA), BR-46 |
| BO-07 | Onboarding completion ≥ 75% (including new industrial-pref + goal steps) | FR-04.1, FR-05..FR-05.5, FR-08, FR-08.1, FR-08.2, BR-43, BR-44 |
| **BO-08** (primary) | **Establish paper trading as the primary loop** (≥ 70% activation, ≥ 3 trades/user/week) | **Module B (FR-PT-01..06)**, FR-35, FR-AI-01 (post-trade insight reward), FR-GAME-01, FR-23..29 Stock Detail |
| **BO-09** | **Social-trading engagement ≥ 35% + follow adoption ≥ 20%** | **Module F (FR-SOC-01..05)**, FR-16, FR-23..29 Stock Detail |
| BO-10 | Gamification Tier 2 ≥ 40% | Module C (FR-GAME-01..05), FR-08.2 (goal seeds challenge difficulty via BR-ONBOARD-05) |
| BO-11 | AI insight card read-through ≥ 55% (supporting, not headline) | Module D (FR-AI-01..03), Module E (FR-AI-04..05), BR-29 |
| BO-12 | Age 16–17 segment with zero violations | FR-AGE-01..04, FR-05.4 (post-OAuth DOB), FR-LEGAL-01..03, FR-PT-06, BR-28, BR-31, BR-37 |
| **BO-13** (V1.x) | **Brokerage bridge initiation ≥ 20% of eligible users** | **Module I (FR-BRK-01..06)**, BR-30..34, FR-LEGAL (BR-DISC-05) |
| **BO-14** (v2.2) | **Multi-method signup (≥ 60% social, Zalo ≥ 25% VN)** | **FR-04.1, FR-05, FR-05.1, FR-05.2, FR-05.3, FR-05.4, FR-05.5**, FR-07, FR-48, FR-49.1, BR-35..42 |
| **BO-15** (v2.2) | **Onboarding personalization capture ≥ 90%** | **FR-08.1 (industrial preferences), FR-08.2 (investment goal)**, FR-49, BR-43, BR-44 |
| **BO-16** (v2.2) | **Preference-driven retention lift ≥ 8pp** | FR-08.1, FR-08.2, FR-15..17 (Discover using preferences), FR-GAME-04 (weekly challenge seeded by goal), BR-45 |

---

*Document end. Proceed to SRD for system logic and API contracts. Module I (Brokerage Partner Integration) requires an SRD appendix covering partner-auth, callback idempotency, attribution schema, and payload whitelisting. v2.2 additions require SRD appendices for (a) OAuth client configuration and callback handling for Google / Apple / Zalo, (b) account-linking state machine covering email conflict + Apple private-relay + Zalo-no-email paths, (c) `industrial_prefs` and `investment_goal` schema with Discover-ranker and challenge-seeder integration contracts.*

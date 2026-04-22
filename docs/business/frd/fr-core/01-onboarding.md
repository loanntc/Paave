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


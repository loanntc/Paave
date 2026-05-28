# FRD-01: Onboarding & Authentication

**Version:** 2.4
**Date:** 2026-04-21
**Status:** Authoritative — v2.4 supersedes all prior versions
**Product:** Paave — Vietnam Gen Z Paper Trading & Social Investing App

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | Onboarding & Authentication |
| Primary Actors | New User (first-time), Returning User, System (session manager, OTP service) |
| Goal | Allow users to create an account via one of four methods, verify identity, complete age-gated onboarding, and return to the app securely on subsequent sessions |
| Trigger | App launch (first-time or returning) |
| Market Context | Primary: Vietnam (HOSE/HNX/UPCOM). KR/Global = reference-only. No market data fetched or displayed until a user is fully authenticated. |
| User Tiers | LEARN_MODE = 16–17 years old (evaluated in UTC+7); FULL_ACCESS = 18+ years old (evaluated in UTC+7); accounts below 13 are blocked (PARENTAL_CONSENT_PENDING and routed to FR-AGE-02, out of scope for this document) |
| Starting Balance | On first authenticated session: virtual portfolio seeded with 500,000,000 VND |

---

## 2. Functional Requirements

---

### FR-01: Splash Screen and App Entry

- **Priority:** P0 — Critical path, every user
- **Actor:** System, Returning User, New User

**Description:**
The splash screen is the first visual the user sees on every app launch. It displays the Paave logo and brand mark for a fixed 2-second duration. Concurrently, the system performs a session validity check in the background so the routing decision is ready when the 2 seconds elapse. The user is never held on the splash beyond the 2-second mark waiting for a network response; the session check must complete within those 2 seconds or the system defaults to routing to Login.

**Input:**
- Device local storage / secure keychain: presence and validity of a stored refresh token
- Network: reachability for token refresh (optional — see edge cases)

**Output:**
- Navigation to one of: Welcome screen (FR-02), Home screen, Login screen (FR-07), or Post-Registration Gate (age gate + data consent)

**Routing Logic (evaluated in order):**

| Condition | Destination |
|-----------|-------------|
| First-ever app launch (no stored token) | Welcome screen (FR-02) |
| Returning user — valid JWT access token OR refresh token successfully exchanged | Home screen |
| Returning user — refresh token present but server returns 401 (expired/revoked) | Login screen (FR-07) |
| Returning user — no network AND refresh token present but cannot validate | Login screen (FR-07) with offline banner |
| Post-registration first launch (account created, onboarded_at IS NULL) | Age gate + Data Consent flow before Home |
| Post-registration first launch (PENDING_VERIFICATION status) | OTP verification screen (FR-06) |
| Post-registration first launch (PENDING_DOB status) | FR-05.4 (DOB prompt) |

**Precondition:** App binary is installed and launched.

**Postcondition:** User is routed to the correct screen. No market data has been fetched or displayed.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01-01 | First install, no prior session | App launches | Splash shows for exactly 2 seconds, then navigates to Welcome |
| AC-01-02 | Returning user with valid refresh token | App launches | Token silently refreshed; after 2s splash, navigates to Home |
| AC-01-03 | Returning user with expired refresh token (server 401) | App launches | After 2s splash, navigates to Login |
| AC-01-04 | No network, refresh token present | App launches | After 2s splash, navigates to Login with offline notice |
| AC-01-05 | Returning user with PENDING_DOB account status | App launches | After 2s splash, navigates to FR-05.4 |
| AC-01-06 | Post-registration, onboarded_at IS NULL | App launches | After 2s splash, triggers onboarding gate (age + consent) |
| AC-01-07 | Session check takes >2s to respond | App launches | After 2s, routes to Login (do not wait for slow network) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Session check API times out (>2s) | Route to Login; do not block user on splash |
| Token refresh succeeds but Home screen data fails to load | Navigate to Home, show skeleton loaders; data errors handled by Home screen independently |
| App is force-killed while splash is visible | On next launch, repeat splash + session check from scratch |
| Device clock is wrong (affects JWT exp check) | Use server-side token validation, not client-side exp comparison |
| No market data displayed on splash | Splash shows only logo/brand; zero market API calls made |

---

### FR-02: Welcome Screen

- **Priority:** P0
- **Actor:** New User, Unauthenticated Returning User

**Description:**
The Welcome screen is the entry point for all unauthenticated users. It presents two primary CTAs: "Create Account" and "Log In." No market data, stock tickers, prices, or portfolio information is shown or fetched on this screen.

**Input:** User tap on either CTA.

**Output:**
- "Create Account" → FR-04.1 (Signup Method Selection)
- "Log In" → FR-07 (Login)

**Precondition:** User has no valid session.

**Postcondition:** User is navigated to registration or login flow.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-02-01 | User on Welcome screen | Taps "Create Account" | Navigates to FR-04.1 |
| AC-02-02 | User on Welcome screen | Taps "Log In" | Navigates to FR-07 |
| AC-02-03 | Welcome screen is active | Screen renders | No market data API calls are made |
| AC-02-04 | No network available | Screen renders | Both CTAs still visible; no data-fetch errors shown |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| User presses back from FR-04.1 or FR-07 | Returns to Welcome screen |
| App backgrounded on Welcome screen | Returns to Welcome screen on foreground |

---

### FR-03: Nationality Detection

- **Priority:** P1
- **Actor:** System

**Description:**
At registration start, the system reads the device locale to infer the user's nationality for language and market display purposes. This is a system-read operation; the user cannot select or override nationality during registration in V1.

**Detection Mapping:**

| Device Locale | Inferred Nationality |
|---------------|---------------------|
| `vi`, `vi-VN` | Vietnam |
| `ko`, `ko-KR` | Korea |
| Any other value | Global |
| No locale detected | Global (default) |

**Output:** nationality field written to user profile at account creation. Feeds FR-LANG-01 (language setting initialization).

**Precondition:** Registration flow initiated.

**Postcondition:** Nationality value is read-only for the duration of registration. Post-registration, user may update nationality in Settings (V2 scope).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-03-01 | Device locale = `vi-VN` | Registration begins | nationality = 'VN' |
| AC-03-02 | Device locale = `ko-KR` | Registration begins | nationality = 'KR' |
| AC-03-03 | Device locale = `en-US` | Registration begins | nationality = 'GLOBAL' |
| AC-03-04 | No locale set on device | Registration begins | nationality = 'GLOBAL' |
| AC-03-05 | locale = `vi-VN` | Registration begins | App language set to Vietnamese (FR-LANG-01) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Locale returns null or empty string | nationality = 'GLOBAL' |
| Locale is an unknown IETF tag (e.g., `az-AZ`) | nationality = 'GLOBAL' |
| User changes device locale mid-registration | Detection already complete; value not re-read until next session |

---

### FR-04: Market Preference Selection — DEPRECATED

- **Priority:** N/A (Deprecated in V1)
- **Actor:** N/A

**Description:**
Market preference is no longer a user-selectable option in V1. The system automatically sets the primary market to VN (Vietnam: HOSE, HNX, UPCOM) for all accounts at creation time. Korea (KOSPI/KOSDAQ) and Global markets are available as reference-only views in the Markets section. No user-facing market preference screen or selector is shown at any point in the onboarding flow.

**Persistence:** `market_preference = 'VN'` written to account record at creation. Not user-configurable in V1.

**Note to developers:** Any UI component or API parameter referencing `market_preference_selection` from FRD v2.1 or earlier must be removed.

---

### FR-04.1: Signup Method Selection

- **Priority:** P0 — v2.2
- **Actor:** New User

**Description:**
The Signup Method Selection screen presents four authentication methods. The user selects one method to begin registration. The screen must handle provider availability gracefully: a single provider being unavailable must not block access to other providers.

**Available Methods:**
1. Google OAuth
2. Apple OAuth (iOS only — see platform rule below)
3. Zalo OAuth
4. Email / Password

**Platform Rules:**
- iOS: Apple Sign-In must appear at equal visual prominence to other methods. This is a mandatory App Store requirement (Apple Guideline 4.8). Apple button must not be smaller, less visible, or positioned lower than other social login buttons.
- Android: Apple button is hidden (Apple OAuth is iOS-only).

**Provider Availability Behavior:**

| Condition | System Behavior |
|-----------|----------------|
| Provider health check returns unavailable | That provider's button is disabled + greyed out with tooltip "Temporarily unavailable" |
| Zalo app not installed on device | Zalo button shown but initiates web OAuth fallback (not native SDK) |
| No internet connection | All four buttons disabled; banner: "No internet connection. Please check your network." |
| Apple SDK missing from iOS build | Critical build error — must not ship |

**Input:** User tap on one of the four method buttons.

**Output:** Navigation to:
- Google button → FR-05.1
- Apple button → FR-05.2
- Zalo button → FR-05.3
- Email button → FR-05

**Precondition:** User has no Paave account (new user flow).

**Postcondition:** User begins the selected registration method.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-04.1-01 | iOS device, all providers available | Screen renders | All 4 buttons visible; Apple button equal prominence to others |
| AC-04.1-02 | Android device | Screen renders | 3 buttons visible (Google, Zalo, Email); Apple button absent |
| AC-04.1-03 | Google provider health check fails | Screen renders | Google button disabled + greyed; other 3 remain active |
| AC-04.1-04 | No internet connection | Screen renders | All 4 buttons disabled; offline banner shown |
| AC-04.1-05 | Zalo app not installed | User taps Zalo | Initiates Zalo web OAuth in browser/webview |
| AC-04.1-06 | User taps Google | Provider available | Routes to FR-05.1 Google OAuth flow |
| AC-04.1-07 | User taps Email | Provider available | Routes to FR-05 Email Registration form |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Provider health check itself times out | Treat as unavailable; disable that provider button |
| Multiple providers simultaneously unavailable | Each unavailable provider disabled independently; remaining providers usable |
| Network drops after screen renders but before button tap | Buttons remain as rendered; on tap, show network error inline |
| User returns to this screen mid-registration (back press) | Screen re-rendered; provider availability re-checked |

---

### FR-05: Email / Password Registration

- **Priority:** P0
- **Actor:** New User

**Description:**
The email registration form collects all required account information in a single screen. On successful submission, the account is created with status `PENDING_VERIFICATION` and the user is navigated to OTP verification (FR-06).

**Input Fields:**

| Field | Constraints | Validation |
|-------|-------------|------------|
| Display Name | 2–50 characters; Unicode supported (including Vietnamese diacritics); profanity-filtered | Required; min 2, max 50; fails profanity filter → inline error "Display name contains prohibited content" |
| Email | RFC 5322 format; max 254 characters | Required; invalid format → "Please enter a valid email address" |
| Password | 8–64 characters; must contain ≥1 uppercase letter (A-Z), ≥1 lowercase letter (a-z), ≥1 digit (0-9), ≥1 special character from set `!@#$%^&*` | Required; strength indicator shown while typing; all rules must be met |
| Date of Birth | Date picker (calendar UI); must be past date; must result in age ≥13 as of today in UTC+7 | Required; under-13 → E-1009 |
| Nationality | Not shown to user; system-set to 'VN' via FR-03 | Auto-populated; not user-configurable in V1 |

**Output on Success:**
- Account row created with: `signup_method='email'`, `status='PENDING_VERIFICATION'`, `password_hash` (bcrypt or argon2id — implementation choice, both acceptable), `nationality='VN'`, `display_name`, `email`, `dob`
- OTP email dispatched
- User navigated to FR-06 (OTP screen)

**Duplicate Email Handling:**

| Existing Account State | System Behavior | HTTP Response |
|-----------------------|-----------------|---------------|
| Active account with same email | E-1001: "An account with this email already exists." | 200 (no enumeration) |
| PENDING_VERIFICATION account with same email | Silently resend OTP; navigate to FR-06 | 200 |
| Account linked to social provider | "An account with this email exists. Try signing in with [provider name]." | 200 |

**Precondition:** User has selected "Email" on FR-04.1.

**Postcondition:** Account exists in DB with `status='PENDING_VERIFICATION'`. No login token issued yet. OTP sent to email.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-05-01 | All fields valid, email is unique | User submits form | Account created; OTP sent; navigates to FR-06 |
| AC-05-02 | Email already registered (ACTIVE) | User submits | Inline error E-1001; no new account created |
| AC-05-03 | Email registered as PENDING_VERIFICATION | User submits | OTP resent; user navigated to FR-06; HTTP 200 returned |
| AC-05-04 | Email registered linked to Google account | User submits | Error: "An account with this email exists. Try signing in with Google." |
| AC-05-05 | DOB entered yields age < 13 | User submits | E-1009 inline error on DOB field; form not submitted |
| AC-05-06 | Password missing special character | User types | Real-time inline indicator marks special char rule as unmet; submit blocked |
| AC-05-07 | Display name = 1 character | User submits | Validation error: "Display name must be at least 2 characters" |
| AC-05-08 | Display name contains profanity | User submits | Inline error: "Display name contains prohibited content" |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Email service fails (OTP not sent) | Account created; user sees "We had trouble sending your verification email. Please try again." with resend option |
| User submits while offline | Form submission fails; inline error: "No internet connection" |
| Password exactly 64 characters | Accepted |
| Password 65 characters | Rejected: "Password must be 64 characters or fewer" |
| Display name = 50 characters (Unicode with multibyte chars) | Validated by character count (not byte count); 50 Unicode chars accepted |
| DOB date picker allows future dates | UI picker must constrain max date to today |

---

### FR-05.1: Google OAuth Registration

- **Priority:** P0
- **Actor:** New User

**Description:**
The user initiates registration via Google. The system launches the Google Sign-In SDK, receives the OAuth callback, validates the ID token server-side, and creates or routes the account accordingly.

**OAuth Scopes Requested:** `openid email profile`

**Data Returned by Google:**

| Field | Notes |
|-------|-------|
| `email` | Always returned |
| `display_name` (from `name` claim) | May be absent in rare cases |
| `avatar_url` (from `picture` claim) | May be absent |
| `google_sub` | Stable unique identifier; never changes |

**Account Creation:**
- `signup_method = 'google'`
- `status = 'PENDING_DOB'`
- `google_sub` stored
- `avatar_url` stored if present
- `display_name`: if returned by Google, store and pre-fill on FR-05.4; if absent, default to "Người dùng ẩn danh" (Vietnamese locale) or "Anonymous User" (EN/KR) and mark as requiring edit on FR-05.4

**Post-creation routing:** FR-05.4 (DOB prompt)

**Error Handling:**

| Condition | System Action |
|-----------|--------------|
| Server-side ID token validation fails | Return to FR-04.1 with toast: "Google sign-in failed. Please try again." |
| User cancels Google consent screen | Return to FR-04.1 silently (no error shown) |
| Google returns email matching existing Paave account | Route to FR-05.5 (Account Linking) |
| Google name claim absent | Default display name applied; user prompted to edit on FR-05.4 |
| Google OAuth timeout (>15s) | Return to FR-04.1 with toast: "Google sign-in timed out. Please try again." |

**Precondition:** User has tapped "Continue with Google" on FR-04.1.

**Postcondition:** Account row created with `status='PENDING_DOB'`. No OTP sent. User on FR-05.4.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-05.1-01 | New user, valid Google account, name returned | Completes Google consent | Account created; name pre-filled on FR-05.4; navigated to FR-05.4 |
| AC-05.1-02 | New user, valid Google account, name NOT returned | Completes Google consent | Account created; display_name defaulted; FR-05.4 shows name field with placeholder and requires edit |
| AC-05.1-03 | Google returns email matching existing active Paave account | Completes Google consent | Navigated to FR-05.5 linking screen |
| AC-05.1-04 | User cancels Google consent | Consent screen dismissed | Returns to FR-04.1; no account created; no error toast |
| AC-05.1-05 | Server rejects ID token | Token validation runs | Returns to FR-04.1 with toast "Google sign-in failed" |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Google SDK not initialized properly | Toast: "Google sign-in unavailable. Please try another method." |
| Duplicate google_sub (same Google account re-registering) | Route to login with existing account |
| Google returns null email | Treat as registration failure; toast: "Could not retrieve your email from Google. Please use another sign-in method." |

---

### FR-05.2: Apple OAuth Registration

- **Priority:** P0 (iOS only)
- **Actor:** New User (iOS device)

**Description:**
The user initiates registration via Apple Sign-In. Apple Sign-In has unique characteristics: the display name is only returned on the first sign-in; subsequent sign-ins return only the Apple Sub ID. The account may use an Apple-generated private relay email. Account linking is keyed on Apple Sub ID, never on email, because private relay emails cannot be reliably matched.

**OAuth Scopes Requested:** `name`, `email`

**Data Returned by Apple:**

| Field | Notes |
|-------|-------|
| `apple_sub` | Stable unique identifier; never changes; always returned |
| `display_name` | Returned on first sign-in only; NOT returned on subsequent sign-ins |
| `email` | Returned on first sign-in; may be Apple private relay (e.g., `abc123@privaterelay.appleid.com`) |
| `email_is_relay` | Boolean; derived by checking relay domain pattern |

**Account Creation:**
- `signup_method = 'apple'`
- `apple_sub` stored (primary linking key)
- `email` stored (may be relay); `email_is_relay = true | false`
- `status = 'PENDING_DOB'`
- `display_name`: stored if returned; if absent (2nd+ sign-in for re-registration edge case), prompt on FR-05.4

**Post-creation routing:** FR-05.4

**Name Handling on Subsequent Sessions:**
- Apple does not re-send the display name after the first sign-in
- If the account already has a stored display name: use it
- If no display name stored (data loss or first-time edge case): prompt user to enter one on FR-05.4

**Precondition:** iOS device; user has tapped "Continue with Apple."

**Postcondition:** Account created with `status='PENDING_DOB'`; user on FR-05.4.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-05.2-01 | New user, first Apple sign-in, name provided | Completes Apple auth | Account created; name pre-filled on FR-05.4; email_is_relay flagged correctly |
| AC-05.2-02 | User selects "Hide My Email" in Apple consent | Completes Apple auth | email = relay address; email_is_relay = true; account created normally |
| AC-05.2-03 | Re-registration edge case: apple_sub exists in DB | Apple auth returns | Route to login with existing account (same as returning user) |
| AC-05.2-04 | No display name returned (edge case) | Completes Apple auth | FR-05.4 shows name field as required with no pre-fill |
| AC-05.2-05 | User cancels Apple consent | Consent dismissed | Returns to FR-04.1 silently |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Apple auth returns email matching existing Paave account (non-Apple) | Check apple_sub first; if apple_sub matches existing account → login; if apple_sub is new but email matches → FR-05.5 (linking) |
| Apple token validation fails server-side | Toast: "Apple sign-in failed. Please try again." |
| Device iOS version < 13 (Apple Sign-In unavailable) | Apple button hidden; iOS 13+ required for this feature |

---

### FR-05.3: Zalo OAuth Registration

- **Priority:** P0 (Vietnam primary)
- **Actor:** New User

**Description:**
The user initiates registration via Zalo (Vietnam's dominant messaging platform). Zalo OAuth may or may not return an email address. When no email is returned, the account enters a special status requiring the user to provide an email during the DOB prompt step.

**OAuth Scopes Requested:** `id`, `name`, `picture`

**Data Returned by Zalo:**

| Field | Notes |
|-------|-------|
| `zalo_id` | Stable unique identifier |
| `name` | Display name from Zalo profile |
| `picture` | Avatar URL |
| `email` | Not always returned; depends on user's Zalo privacy settings |

**Account Creation:**
- If email returned: `signup_method='zalo'`, `status='PENDING_DOB'`
- If email NOT returned: `signup_method='zalo'`, `status='PENDING_DOB_AND_EMAIL'`

**Display Name Handling:**
- If Zalo name passes profanity filter: pre-fill on FR-05.4 (editable)
- If Zalo name fails profanity filter: do not pre-fill; FR-05.4 shows empty name field with error "Your Zalo display name contains prohibited content. Please enter a new display name."

**Zalo App / SDK Availability:**

| Condition | Behavior |
|-----------|---------|
| Zalo app installed | Use native Zalo SDK for OAuth |
| Zalo app NOT installed | Fallback to Zalo web OAuth in in-app webview |
| No native app + no webview capability | Show error: "Zalo sign-in is temporarily unavailable." |

**Zalo Server Errors:**

| HTTP Status | User-Facing Message |
|-------------|---------------------|
| 5xx | "Zalo is temporarily unavailable. Please try another sign-in method or try again later." |
| 4xx (auth error) | "Zalo sign-in failed. Please try again." |
| Timeout >15s | "Zalo sign-in timed out. Please try again." |

**Precondition:** User has tapped "Continue with Zalo" on FR-04.1.

**Postcondition:** Account created with appropriate status; user navigated to FR-05.4.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-05.3-01 | Zalo returns email + clean display name | Completes Zalo auth | Account created (PENDING_DOB); name pre-filled; navigated to FR-05.4 |
| AC-05.3-02 | Zalo does not return email | Completes Zalo auth | Account created (PENDING_DOB_AND_EMAIL); FR-05.4 shows email field as required |
| AC-05.3-03 | Zalo name fails profanity filter | Completes Zalo auth | FR-05.4 name field empty + error message; user must enter new name |
| AC-05.3-04 | Zalo app not installed | User taps Zalo | Opens Zalo web OAuth in webview |
| AC-05.3-05 | Zalo server returns 500 | Auth attempted | Toast: "Zalo is temporarily unavailable. Please try another method." |
| AC-05.3-06 | User cancels Zalo auth | Consent dismissed | Returns to FR-04.1 silently |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Zalo returns duplicate zalo_id (existing account) | Route to existing account login |
| Zalo returns email matching existing non-Zalo account | Route to FR-05.5 (account linking) |
| Webview blocked by device security policy | Toast: "Cannot open Zalo sign-in. Please try another method." |

---

### FR-05.4: Post-Handshake DOB Prompt (Social OAuth)

- **Priority:** P0
- **Actor:** New User (social OAuth path)

**Description:**
After any social OAuth registration (Google, Apple, Zalo), the system presents a mandatory, non-skippable, non-dismissible screen to collect date of birth and confirm/edit display name. For Zalo accounts where email was not returned, this screen also requires an email address.

This screen cannot be bypassed. If the user force-quits the app before completing this screen, on the next app launch with a `PENDING_DOB` or `PENDING_DOB_AND_EMAIL` account status, the app routes back to this screen before proceeding.

**Input Fields:**

| Field | Shown When | Constraints |
|-------|-----------|-------------|
| Date of Birth | Always | Date picker; max date = today; min date = 100 years ago; must result in age ≥13 in UTC+7 |
| Display Name | Always (pre-filled if available from OAuth) | 2–50 characters; Unicode; profanity-filtered; required |
| Email | Only when account status = `PENDING_DOB_AND_EMAIL` (Zalo without email) | RFC 5322; max 254 chars; must not already exist as ACTIVE account |

**Screen Properties:**
- No "Back" button visible
- No "Skip" button
- No swipe-to-dismiss
- Force-quit during this screen: on relaunch, app routes back here

**Age-Gate Logic (evaluated in UTC+7):**

| Age at DOB Entry | Account Transition | Next Screen |
|-----------------|--------------------|------------|
| ≥18 years | status → 'ACTIVE'; user_tier = 'FULL_ACCESS' | FR-08.1 (Industrial Preferences) |
| 16 or 17 years | status → 'ACTIVE'; user_tier = 'LEARN_MODE' | FR-08.1 (Industrial Preferences) |
| 13, 14, or 15 years | status → 'PARENTAL_CONSENT_PENDING' | FR-AGE-02 (out of scope for this document) |
| <13 years | Registration blocked; E-1009 | Error screen; account not activated |

**Precondition:** Account exists with `status = 'PENDING_DOB'` or `'PENDING_DOB_AND_EMAIL'`.

**Postcondition:** DOB persisted; user_tier set; account status updated; user navigated to next onboarding step.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-05.4-01 | User aged 22, Google account | Submits DOB | status → ACTIVE; user_tier → FULL_ACCESS; navigates to FR-08.1 |
| AC-05.4-02 | User aged 16 | Submits DOB | status → ACTIVE; user_tier → LEARN_MODE; navigates to FR-08.1 |
| AC-05.4-03 | User aged 14 | Submits DOB | status → PARENTAL_CONSENT_PENDING; navigated to FR-AGE-02 |
| AC-05.4-04 | User aged 12 | Submits DOB | E-1009; registration blocked; account not activated |
| AC-05.4-05 | Zalo account without email | Screen renders | Email field shown and required |
| AC-05.4-06 | Zalo account with email | Screen renders | Email field NOT shown |
| AC-05.4-07 | User force-quits app | On relaunch with PENDING_DOB account | Routed back to this screen; cannot access any other part of app |
| AC-05.4-08 | Display name pre-filled from Google | Screen renders | Name field shows Google name; editable |
| AC-05.4-09 | Google returned no name | Screen renders | Name field empty; required; no pre-fill |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| DOB = today (age = 0) | Blocked; DOB must be at least 13 years before today |
| User enters Zalo email that matches an existing ACTIVE account | Error: "An account with this email already exists. Please use a different email." |
| Birthday falls on edge of 18th year in UTC+7 | Evaluated using UTC+7 date at moment of submission; if today is their 18th birthday, they are FULL_ACCESS |
| Name field edited to contain profanity | Inline error; submit blocked until name is clean |

---

### FR-05.5: Account Linking

- **Priority:** P1
- **Actor:** New User (OAuth attempting to register with email matching existing account)

**Description:**
When an OAuth sign-in returns an email address that matches an existing Paave account, the system does not create a duplicate account. Instead, it presents a linking screen inviting the user to sign in with their original method and link the new OAuth provider to their existing account.

**Trigger Conditions:**

| OAuth Provider | Matching Logic |
|---------------|----------------|
| Google | Email match against existing account |
| Zalo | Email match against existing account (only when Zalo returns email) |
| Apple | Apple Sub ID match first; then email match ONLY if email is not a relay address |

**Linking Screen Copy:**
> "An account with this email already exists. Sign in with [original method] to link your [new provider] account."

Example: "An account with this email already exists. Sign in with your email and password to link your Google account."

**Linking Flow:**
1. User sees linking screen with explanation
2. User authenticates with original method (password form OR original social OAuth)
3. On successful authentication: new provider's credentials (e.g., google_sub) added to `linked_providers` array on existing account; no new account row created
4. User navigated to Home

**Abandonment:**
If the user dismisses the linking screen or fails authentication against the original method 5 times, no linking occurs. User is returned to FR-04.1. The OAuth session is discarded. The existing account is unchanged.

**Precondition:** OAuth returns email or Sub ID matching an existing account.

**Postcondition:** Either account is linked (new provider added) OR no change (user abandoned).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-05.5-01 | Google returns email matching email/password account | User authenticates with password | Google Sub ID added to linked_providers; navigated to Home |
| AC-05.5-02 | User abandons linking screen | Back pressed or auth fails 5x | Linking not performed; returned to FR-04.1 |
| AC-05.5-03 | Apple returns Sub ID matching existing Apple account | OAuth returns | Existing session resumed; no linking screen shown |
| AC-05.5-04 | Apple returns relay email, existing account has different email | No Sub ID match | New account creation proceeds (relay email not used for matching) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Original method is a deactivated account | Show: "This account is deactivated. Please contact support." |
| Both accounts are social accounts | User shown which provider the existing account uses; prompted to sign in with that provider |
| Linking API call fails | Error toast: "Could not link accounts. Please try again."; linking not completed |

---

### FR-06: Email Verification (OTP)

- **Priority:** P0
- **Actor:** New User (email registration path only)

**Description:**
After email registration (FR-05), the user must verify ownership of the email address by entering a 6-digit OTP sent to their email. This step is exclusive to the email registration path. Social OAuth registrations (Google, Apple, Zalo) do not require OTP verification.

**OTP Properties:**

| Property | Value |
|----------|-------|
| Format | 6 digits (numeric only) |
| TTL | 10 minutes from generation |
| Single-use | Yes — once consumed, cannot be reused |
| Invalidation | Requesting a new OTP invalidates all prior OTPs for this email |
| Resend cooldown | 60 seconds between resend requests |
| Max attempts | 5 wrong attempts → 15-minute lockout (E-1003) |

**OTP Email:**
- Subject: "Verify your Paave account"
- Body: 6-digit code + expiry time
- Hint text in app: "Can't find the email? Check your spam folder."

**Lockout Behavior:**
- After 5 wrong attempts: account enters OTP lockout for 15 minutes
- Lockout timer shown in UI: "Too many attempts. Please try again in [X] minutes."
- After lockout expires: attempt count resets; user may try again
- New OTP request during lockout: not allowed until lockout expires

**Precondition:** Account exists with `status='PENDING_VERIFICATION'`; OTP sent.

**Postcondition:**
- On success: account `status` transitions to 'ACTIVE' (if age ≥18) or 'ACTIVE' + `user_tier='LEARN_MODE'` (age 16–17); JWT issued; navigated to onboarding (FR-08)
- On lockout: account remains PENDING_VERIFICATION; no JWT issued

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-06-01 | Valid 6-digit OTP, within 10-minute TTL | User enters and submits | Account activated; JWT issued; navigated to onboarding |
| AC-06-02 | OTP has expired (>10 min) | User enters and submits | E-1002: "This code has expired. Please request a new one." |
| AC-06-03 | User enters wrong OTP (attempt 1–4) | Submit | "Incorrect code. X attempts remaining." |
| AC-06-04 | User enters wrong OTP (attempt 5) | Submit | E-1003 lockout: "Too many attempts. Please try again in 15 minutes." |
| AC-06-05 | User requests resend within 60s cooldown | Taps "Resend" | Button disabled with countdown "Resend in Xs" |
| AC-06-06 | User requests resend after 60s | Taps "Resend" | New OTP sent; prior OTP invalidated; cooldown restarts |
| AC-06-07 | Google/Apple/Zalo user reaches this screen (should not happen) | N/A | Social OAuth paths never route to OTP screen |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Email delivery fails (bounce) | User sees resend option; app shows hint to check spam |
| User requests resend 5+ times | Each resend creates new OTP; no cap on resend count (only on submission attempts) |
| User enters OTP from a previously invalidated request | E-1002: expired (prior OTPs are invalidated, not just expired) |
| App backgrounded during lockout | Lockout timer continues server-side; on return, remaining time shown |

---

### FR-07: Login — Multi-Method

- **Priority:** P0
- **Actor:** Returning User

**Description:**
The Login screen allows returning users to authenticate via any of the four supported methods. The system routes the login attempt to the method that matches the account's `signup_method` or `linked_providers`.

**Login Methods Available:**
1. Email / Password form (email input + password input)
2. "Continue with Google" button
3. "Continue with Apple" button (iOS only)
4. "Continue with Zalo" button

**Email/Password Login:**
- Standard email + password fields
- 5 consecutive wrong password attempts → 15-minute account lockout (BR-12)
- Lockout countdown shown in UI
- Lockout applies per-email, server-side (not client-only)
- "Forgot Password?" link → FR-AUTH-07

**Social Login Routing:**
- Social login resolves by matching the OAuth provider's Sub ID (or email for Google/Zalo) to the account
- On match: JWT access token (1-hour TTL) + refresh token (30-day TTL) issued; navigated to Home

**Cross-Method Error (Social-Only Account Attempts Password):**
- Message: "This account was created with [provider name]. Sign in with [provider name]."
- Example: "This account was created with Google. Sign in with Google."
- This error does NOT increment the failed-login counter

**Account Status Handling on Login:**

| Account Status | Login Behavior |
|---------------|---------------|
| ACTIVE (FULL_ACCESS or LEARN_MODE) | Normal login; JWT issued; → Home |
| PENDING_VERIFICATION | Error: "Please verify your email before logging in." with resend OTP option |
| PENDING_DOB | Route to FR-05.4 |
| PENDING_DOB_AND_EMAIL | Route to FR-05.4 |
| PARENTAL_CONSENT_PENDING | Show: "Your account is pending parental consent." |
| DEACTIVATED | Show: "This account has been deactivated. Contact support." |

**Token Specification:**

| Token | TTL | Storage |
|-------|-----|---------|
| JWT access token | 1 hour | In-memory / secure session |
| Refresh token | 30 days (non-rotating) | Secure keychain / encrypted storage |

**Authorization Header (Critical):**
All authenticated API requests must use the `jwt` scheme — NOT `Bearer`:
```
Authorization: jwt <accessToken>
```
Using `Bearer` returns HTTP 401 even with a valid token.

**API Endpoints (v1.5.0):**

| Flow | Endpoint | Notes |
|------|----------|-------|
| Unified login (grant_type routing) | `POST /api/v1/auth/login` | grant_type: `password` / `client_credentials` / `demo` |
| Email/password login | `POST /api/v1/auth/login/password` | Returns `{accessToken, refreshToken, tokenType, expiresIn}` |
| Social login | `POST /api/v1/auth/login` with `grant_type: social_login` | socialType: GOOGLE / APPLE (Zalo: ⚠️ see note below) |
| Token refresh | `POST /api/v1/auth/token/refresh` | Non-rotating; returns new accessToken only |
| Token revoke | `POST /api/v1/auth/token/revoke` | Invalidates refresh token |

> **⚠️ Zalo login gap:** The API v1.5.0 social login endpoint does not list Zalo as a supported `socialType` (GOOGLE / FACEBOOK / APPLE only). Zalo is BRD-mandated for VN Gen Z reach. Engineering must confirm whether Zalo uses a separate login path or whether API spec needs to be updated to include Zalo.

**API Capabilities Available but Not Yet in Mobile UI (v1.5.0):**

| Capability | Endpoints | Status |
|-----------|-----------|--------|
| Two-Factor Authentication (2FA) | `POST /api/v1/auth/login/2fa` → `POST /api/v1/auth/login/2fa/verify-otp` | Backend ready; FRD UI flow TBD |
| Organization-scoped login | `POST /api/v1/auth/login/organization` | Backend ready; FRD UI flow TBD |
| Demo / guest login | `POST /api/v1/auth/login` with `grant_type: demo` | Backend ready; FRD UI flow TBD |
| Linked-account switching | `POST /api/v1/auth/login/link-accounts` | Brokerage bridge (V1.x) |

**Precondition:** User has a Paave account.

**Postcondition:** JWT access token and refresh token issued; user navigated to Home (or appropriate status screen).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-07-01 | Valid email + correct password | User submits | JWT + refresh token issued; navigated to Home |
| AC-07-02 | Valid email + wrong password (attempt 5) | User submits | Lockout triggered: "Too many attempts. Please try again in 15 minutes." |
| AC-07-03 | Email/password account attempts Google login | User taps Google with email that has email/password account | Toast: "This account was created with email. Sign in with your email and password." |
| AC-07-04 | Social-only account types email + password | User submits | "This account was created with [provider]. Sign in with [provider]." No lockout counter incremented. |
| AC-07-05 | Account status = PENDING_VERIFICATION | Login attempted | "Please verify your email." + resend OTP option shown |
| AC-07-06 | Account status = PENDING_DOB | Login attempted | Routed to FR-05.4 |
| AC-07-07 | Valid Google sign-in for Google account | Completes Google auth | JWT issued; navigated to Home |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Refresh token valid but user logs in from new device | New session created; old session remains valid until expiry |
| All 4 social providers unavailable on login screen | Same provider availability rules as FR-04.1; unavailable buttons disabled |
| Network drops mid-login | Login fails with "Network error. Please try again." |
| User changes password on another device mid-session | Existing access token valid until 1h expiry; refresh token attempt returns 401; user prompted to log in again |

---

### FR-08: Onboarding Progress Indicator

- **Priority:** P1 — v2.4 amendment
- **Actor:** New User

**Description:**
A persistent progress indicator shown throughout the onboarding flow. The indicator displays "Step X of Y" text and a progress bar. The total number of steps differs by registration path. The progress bar component is dynamic: it receives `total_steps` and `current_step` as props and renders accordingly.

**Email Registration Path — 5 Steps:**

| Step | Screen |
|------|--------|
| 1 | Data Consent |
| 2 | Account Details + DOB |
| 3 | OTP Verification |
| 4 | Industrial Preferences (FR-08.1) |
| 5 | Investment Goal (FR-08.2) |

**Social OAuth Registration Path — 6 Steps:**

| Step | Screen | Progress Bar Shown? |
|------|--------|---------------------|
| 1 | Method Selection (FR-04.1) | Yes |
| 2 | OAuth Handshake | No (external browser/SDK; no progress bar during handshake) |
| 3 | DOB + Display Name (FR-05.4) | Yes |
| 4 | Industrial Preferences (FR-08.1) | Yes |
| 5 | Investment Goal (FR-08.2) | Yes |
| 6 | Data Consent | Yes |

**Component Spec:**
- Component name: `OnboardingProgressBar`
- Props: `total_steps: number`, `current_step: number`
- Renders: "Step {current_step} of {total_steps}" label + filled progress bar proportional to `current_step / total_steps`
- Progress bar fill = `(current_step / total_steps) * 100%`

**Precondition:** User is in onboarding flow.

**Postcondition:** Progress indicator accurately reflects current position in flow.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-08-01 | Email registration path | Step 1 (Data Consent) | Shows "Step 1 of 5"; bar at 20% |
| AC-08-02 | Email registration path | Step 3 (OTP) | Shows "Step 3 of 5"; bar at 60% |
| AC-08-03 | Social OAuth path | Step 1 (Method Selection) | Shows "Step 1 of 6"; bar at ~17% |
| AC-08-04 | Social OAuth path | During OAuth handshake | Progress bar hidden/removed from view |
| AC-08-05 | Social OAuth path | Step 3 (DOB prompt) | Shows "Step 3 of 6"; bar at 50% |
| AC-08-06 | Either path | Last step completed | Bar at 100%; transitions out of onboarding |

---

### FR-08.1: Industrial / Sector Preferences

- **Priority:** P1 — v2.2
- **Actor:** New User (both email and social OAuth paths)

**Description:**
During onboarding, the user selects their sectors of investment interest via a multi-select chip interface. Selection is optional — the user may skip. Selections feed the Discover feed ranker and the weekly challenge seeder.

**Available Sectors (10 total):**

| Slug (stored in DB) | Vietnamese Label | Korean Label | English Label |
|--------------------|-----------------|-------------|---------------|
| `banking` | Ngân hàng | 은행 | Banking |
| `real_estate` | Bất động sản | 부동산 | Real Estate |
| `tech` | Công nghệ | 기술 | Tech |
| `consumer` | Tiêu dùng | 소비재 | Consumer |
| `energy` | Năng lượng | 에너지 | Energy |
| `healthcare` | Y tế | 헬스케어 | Healthcare |
| `industrials` | Công nghiệp | 산업재 | Industrials |
| `materials` | Nguyên vật liệu | 소재 | Materials |
| `utilities` | Tiện ích | 유틸리티 | Utilities |
| `retail` | Bán lẻ | 소매 | Retail |

**Selection Rules:**
- Minimum selections: 0 (skip allowed)
- Maximum selections: 10
- Attempting to select an 11th chip: chip is unresponsive; no selection; no error toast (max is silently enforced by UI)

**Skip Behavior:**
- "Skip for now" button available
- On skip: empty array `[]` stored in `sector_preferences`
- Degradation notice shown inline: "Your Discover feed will show general content. You can update your interests in Settings."

**Storage:**
- DB field: `sector_preferences` (array of canonical English slugs)
- Example: `["banking", "tech", "real_estate"]`
- Chip labels shown in app are localized; slugs stored in DB are always canonical English

**Downstream Usage:**
- Discover feed ranker (BR-ONBOARD-04): weights stocks from selected sectors higher
- Weekly challenge seeder: seeds challenges relevant to selected sectors (when possible)

**Precondition:** User has completed FR-05.4 (DOB prompt) or FR-06 (OTP) depending on path; account is ACTIVE.

**Postcondition:** `sector_preferences` persisted (empty array or selected slugs).

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-08.1-01 | User selects 3 chips | Taps "Continue" | 3 slugs saved to sector_preferences; navigates to FR-08.2 |
| AC-08.1-02 | User selects 10 chips | Attempts to select 11th | 11th chip not selectable; count stays at 10 |
| AC-08.1-03 | User taps "Skip for now" | Skip confirmed | sector_preferences = []; degradation notice shown; navigates to FR-08.2 |
| AC-08.1-04 | Device locale = vi | Screen renders | Chip labels shown in Vietnamese |
| AC-08.1-05 | VN locale, "Ngân hàng" selected | Saved | DB stores "banking" (English slug) |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Save API call fails | Retry once; if still fails, proceed with local state and sync in background |
| User selects chips then goes back | FR-08.1 re-renders with prior selection preserved |

---

### FR-08.2: Investment Goal

- **Priority:** P1 — v2.2
- **Actor:** New User

**Description:**
The final onboarding step requires the user to select a single investment goal. This is mandatory — no skip option is available. On completion, the `onboarded_at` timestamp is set, completing the onboarding flow.

**Available Options:**

| Value (stored) | Vietnamese | Korean | English |
|----------------|-----------|--------|---------|
| `learn_explore` | Học hỏi & khám phá | 배우고 탐색하기 | Learn & Explore |
| `grow_savings` | Tăng trưởng tiết kiệm | 저축 늘리기 | Grow My Savings |
| `beat_inflation` | Đánh bại lạm phát | 인플레이션 극복 | Beat Inflation |
| `high_returns` | Lợi nhuận cao | 높은 수익 추구 | Seek High Returns |
| `long_term_wealth` | Xây dựng tài sản dài hạn | 장기 자산 구축 | Build Long-Term Wealth |
| `just_for_fun` | Chỉ để vui | 그냥 재미로 | Just for Fun |

**Selection Rules:**
- Single-choice (radio-style)
- Mandatory — no skip button displayed
- Submit button enabled only when one option is selected

**On Completion:**
- `investment_goal` field persisted
- `onboarded_at` = current UTC timestamp written
- Virtual portfolio seeded with 500,000,000 VND starting balance
- User navigated to Home

**Precondition:** FR-08.1 completed (sector_preferences persisted).

**Postcondition:** `investment_goal` set; `onboarded_at` set; user is a fully onboarded Paave user with virtual portfolio.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-08.2-01 | User selects "learn_explore" | Taps "Continue" | investment_goal='learn_explore'; onboarded_at set; → Home |
| AC-08.2-02 | No option selected | User taps "Continue" | Submit button disabled; no submission possible |
| AC-08.2-03 | User selects option then changes selection | Taps second option | First deselected; second selected; only one active at a time |
| AC-08.2-04 | onboarded_at set | User onboarded | Virtual portfolio initialized with 500,000,000 VND |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| API call to save goal fails | Retry once; if fails, show error toast "Could not save your preference. Please try again." |
| Portfolio seeding fails | Logged as background error; user still navigated to Home; portfolio seeded on next session load |

---

### FR-AUTH-07: Forgot Password Flow

- **Priority:** P1
- **Actor:** Registered User with email/password account

**Description:**
Three-step flow allowing a user to reset their password via email OTP. Security properties: no email enumeration (always returns HTTP 200), OTP single-use with 10-minute TTL, password reset revokes all active sessions across all devices.

---

#### FR-AUTH-07.1: Forgot Password — Request OTP

**Actor:** User who cannot recall their password

**Input:** Email address (text field; RFC 5322)

**Processing:**
1. System looks up email in account table
2. If email exists AND account has a password (not social-only): generate 6-digit OTP, store with 10-minute TTL, invalidate any prior unused reset token for this email, send email
3. If email does not exist: no email sent
4. If email exists but account is social-only (no password set): no email sent
5. Always return HTTP 200 (prevents email enumeration)
6. OTP email must be sent within 30 seconds of request

**Output:** HTTP 200 (always); OTP email sent if applicable

**Precondition:** User on Login screen; tapped "Forgot Password?"

**Postcondition:** If applicable, a single valid reset OTP exists for the email; all prior reset tokens for that email are invalidated.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-07.1-01 | Email exists, has password | User submits email | OTP sent within 30s; HTTP 200 |
| AC-07.1-02 | Email does not exist | User submits email | HTTP 200; no email sent; UI shows same "Check your email" message |
| AC-07.1-03 | Email exists, social-only account | User submits email | HTTP 200; no email sent; same UI message |
| AC-07.1-04 | Prior unused reset token exists | New request submitted | Prior token invalidated; new token generated and sent |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Email service down | HTTP 200 returned; token stored; email queued for retry; user sees same confirmation message |
| Invalid email format | Client-side validation error before submission |

---

#### FR-AUTH-07.2: Forgot Password — Submit OTP

**Actor:** User who received reset OTP email

**Input:** 6-digit OTP (numeric)

**Processing:**
1. Validate OTP against stored token for this email
2. Check TTL (10 minutes)
3. Check if already used
4. If valid: generate UUID `reset_session_token`; store in Redis with 5-minute TTL; mark OTP as used
5. If invalid: decrement attempts; return error with remaining attempts

**Output on Success:** `reset_session_token` (UUID); navigate to FR-AUTH-07.3

**Error States:**

| Condition | Error Code | Message |
|-----------|------------|---------|
| Wrong OTP (attempts 1–4) | E-1010 | "Incorrect code. X attempts remaining." |
| OTP expired (>10 min) | E-1002 | "This code has expired. Please request a new one." |
| OTP already used | E-1011 | "This code has already been used. Please request a new one." |
| 5 wrong attempts | E-1014 | "Maximum attempts exceeded. Please request a new code." Token invalidated. |

**Precondition:** User has received OTP email; is on OTP entry screen.

**Postcondition:** On success, `reset_session_token` exists in Redis with 5-min TTL.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-07.2-01 | Correct OTP, within TTL | User submits | reset_session_token generated; navigated to FR-AUTH-07.3 |
| AC-07.2-02 | Wrong OTP (attempt 3) | User submits | E-1010: "Incorrect code. 2 attempts remaining." |
| AC-07.2-03 | Expired OTP | User submits | E-1002 message shown |
| AC-07.2-04 | Already-used OTP | User submits | E-1011 message shown |
| AC-07.2-05 | 5th wrong attempt | User submits | E-1014; OTP token invalidated; must request new OTP |

---

#### FR-AUTH-07.3: Forgot Password — Set New Password

**Actor:** User with valid `reset_session_token`

**Input:**
- `reset_session_token` (passed internally; not entered by user)
- `new_password`: 8–64 chars; ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char from `!@#$%^&*`

**Processing:**
1. Validate `reset_session_token` (exists in Redis, not expired)
2. Validate `new_password` meets requirements
3. Check new password does not match current password (bcrypt/argon2id comparison)
4. If all valid: hash new password; save; revoke ALL refresh tokens for this user across all devices; delete `reset_session_token` from Redis; return HTTP 200
5. Navigate user to Login screen

**Error States:**

| Condition | Error Code | Message |
|-----------|------------|---------|
| reset_session_token expired or invalid | E-1012 | "Your session has expired. Please restart the password reset process." |
| New password same as current | E-1013 | "New password must be different from your current password." |
| New password does not meet strength requirements | E-1003 | Inline indicator showing which rules are unmet |

**Postcondition:** Password updated; all sessions across all devices revoked; user must log in fresh.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-07.3-01 | Valid reset_session_token, strong new password | Submits | Password updated; all refresh tokens revoked; navigated to Login |
| AC-07.3-02 | New password same as current | Submits | E-1013 error; no change made |
| AC-07.3-03 | reset_session_token expired (>5 min) | Submits | E-1012 error; prompts restart of reset flow |
| AC-07.3-04 | Weak new password | Typing | Real-time inline indicators show unmet rules; submit blocked |
| AC-07.3-05 | User was logged in on 3 devices | Password reset completes | All 3 refresh tokens revoked; user must re-login on all devices |

---

### FR-AUTH-08: Biometric Authentication

- **Priority:** P1
- **Actor:** Returning User (any device that supports biometrics)

---

#### FR-AUTH-08.1: Biometric Enrollment

**Description:**
After the user completes onboarding (first-time) or after a manual re-enrollment trigger, the system checks device biometric capability. If supported, an optional enrollment screen is shown. No biometric data is ever sent to or stored on the Paave server.

**Device Capability Check:**

| Device State | Action |
|-------------|--------|
| Device supports biometrics (Face ID, Touch ID, fingerprint) | Show enrollment screen |
| Device does not support biometrics | Skip screen silently; proceed to Home |

**Enrollment Screen:**
- Title: "Enable biometric login"
- Body: "Use Face ID / fingerprint to sign in faster. Your biometric data never leaves your device."
- CTA 1: "Enable"
- CTA 2: "Skip"

**On "Enable":**
1. System triggers native biometric authentication (confirm user's biometric)
2. On success: store encrypted refresh token in iOS Keychain / Android Keystore
3. Set `biometric_enrollment_status = 'ENROLLED'` in local device storage (not server)
4. Navigate to Home

**On "Skip":**
1. Set `biometric_enrollment_status = 'SKIPPED'` in local device storage
2. Navigate to Home
3. User can enable later in Settings > Security

**Server-side:** No biometric data stored. No server record of enrollment status. Server only sees token exchange requests.

**Precondition:** User has completed onboarding; device supports biometrics.

**Postcondition:** Enrollment status set locally; if enrolled, encrypted refresh token in Keychain/Keystore.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-08.1-01 | Device supports biometrics | Onboarding complete | Enrollment screen shown |
| AC-08.1-02 | User taps "Enable", biometric confirmed | Enrollment triggered | Token stored in Keychain; status = ENROLLED; → Home |
| AC-08.1-03 | User taps "Skip" | Skip tapped | status = SKIPPED; → Home; can enable later in Settings |
| AC-08.1-04 | Device has no biometric capability | Onboarding complete | Enrollment screen skipped silently; → Home |

**Failed Cases / Edge Cases:**

| Case | System Behavior |
|------|----------------|
| Native biometric prompt fails (no enrolled fingerprints on device) | Toast: "No biometric is set up on this device. Please set up Face ID or fingerprint in device Settings first." |
| Keychain write fails | Toast: "Could not enable biometric login. Please try again in Settings." |

---

#### FR-AUTH-08.2: Biometric Login

**Description:**
On app launch when the user is not in an active session, if biometric enrollment is ENROLLED, the system shows the biometric prompt before the password form.

**Login Flow:**
1. App launches → session check (FR-01) indicates expired/no session
2. Biometric enrollment status = ENROLLED → show native biometric prompt
3. User authenticates with biometric → retrieve encrypted refresh token from Keychain/Keystore → exchange for new JWT access token via token refresh API
4. On success → navigate to Home

**Failure Handling:**

| Failure Condition | System Action |
|------------------|--------------|
| User cancels biometric prompt | Dismiss biometric; show password form |
| Biometric fails (attempt 1–2) | Native OS shows retry; Paave does not intervene |
| Biometric fails (attempt 3, consecutive) | Dismiss biometric prompt; show password form with toast: "Biometric authentication failed. Please enter your password." |
| Refresh token expired on server (401) | Biometric silently fails; show password form; clear biometric enrollment (set status = REVOKED) |
| Keychain token missing/corrupted | Show password form; clear biometric enrollment status |

**Note:** Paave does NOT delete or unenroll the biometric on the device itself. It only clears its own enrollment status. The user's biometric remains on the device.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-08.2-01 | ENROLLED; valid refresh token in Keychain | App launches, session expired | Biometric prompt shown; on success → JWT issued → Home |
| AC-08.2-02 | ENROLLED; user cancels prompt | Prompt shown, user cancels | Password form shown |
| AC-08.2-03 | ENROLLED; 3 consecutive biometric failures | 3rd failure | Biometric dismissed; password form shown with failure message |
| AC-08.2-04 | ENROLLED; server refresh token expired | Biometric auth attempt | 401 received; password form shown; enrollment cleared |
| AC-08.2-05 | SKIPPED enrollment | App launches, session expired | Password form shown directly; no biometric prompt |

---

#### FR-AUTH-08.3: Biometric Re-enrollment

**Description:**
When the device OS detects a change in biometric enrollment (e.g., user added a new fingerprint, changed Face ID), Android throws `KeyPermanentlyInvalidatedException` and iOS throws `LAError.biometryNotEnrolled`. Paave catches these errors and clears its local biometric enrollment.

**Re-enrollment Trigger Events:**

| Platform | Trigger |
|----------|---------|
| Android | `KeyPermanentlyInvalidatedException` on Keystore access |
| iOS | `LAError.biometryNotEnrolled` on LocalAuthentication |

**System Behavior on Detection:**
1. Clear `biometric_enrollment_status` (set to 'INVALIDATED')
2. Delete stored encrypted token from Keychain/Keystore
3. Show message (after next password login): "Your biometric settings changed. Please sign in with your password to re-enable biometric login."
4. After user successfully logs in with password: show re-enrollment screen (same as FR-AUTH-08.1)

**Precondition:** Device OS invalidated biometric keys.

**Postcondition:** Paave enrollment cleared; user prompted to re-enroll after password login.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-08.3-01 | ENROLLED user adds new fingerprint to device | Next biometric attempt | KeyPermanentlyInvalidatedException caught; enrollment cleared; password form shown |
| AC-08.3-02 | User logs in with password after invalidation | Password login succeeds | Re-enrollment screen shown |
| AC-08.3-03 | User skips re-enrollment | Skip tapped | status = SKIPPED; can enable from Settings |

---

## 3. Business Rules

| ID | Rule | Scope | Violation Behavior |
|----|------|-------|--------------------|
| BR-SIGNUP-01 | Every new account must be assigned a unique `user_id` (UUID v4) at creation | Registration | Account creation fails if UUID collision (retry with new UUID) |
| BR-SIGNUP-02 | Display name must pass profanity filter before storage | All paths | Reject with inline error; block submission |
| BR-SIGNUP-03 | DOB is mandatory for all accounts, all registration paths | All paths | Cannot activate account without DOB; FR-05.4 is non-skippable |
| BR-SIGNUP-04 | No duplicate accounts — one account per email address (except relay emails, one per Apple Sub ID) | All paths | Route to account linking (FR-05.5) |
| BR-SIGNUP-05 | Apple accounts are identified by `apple_sub`, never by email (relay email is not a reliable identifier) | Apple OAuth | Linking and deduplication uses apple_sub |
| BR-SIGNUP-06 | `market_preference` is always set to 'VN' at account creation; not user-configurable in V1 | All paths | Silently override any other value |
| BR-SIGNUP-07 | `sector_preferences` array must contain only values from the canonical 10-item enum | FR-08.1 | Reject unknown slugs with 400 error |
| BR-SIGNUP-08 | `investment_goal` must be one of the 6 defined enum values | FR-08.2 | Reject unknown values with 400 error |
| BR-SIGNUP-09 | `onboarded_at` must be set atomically with `investment_goal` save | FR-08.2 | Both saved in same DB transaction; if either fails, both rolled back |
| BR-AUTH-05 | Password reset OTP: TTL = 10 minutes; max 5 wrong attempts; 1 token valid at a time per email | FR-AUTH-07 | Excess attempts → E-1014; token invalidated |
| BR-AUTH-06 | Password reset revokes ALL refresh tokens for the user on all devices | FR-AUTH-07.3 | All sessions signed out on password change |
| BR-AUTH-07 | No biometric data is transmitted to or stored on Paave servers | FR-AUTH-08 | Biometric auth uses only device Keychain/Keystore; server sees only token exchange |
| BR-AUTH-08 | Biometric enrollment is per-device; not synced across devices | FR-AUTH-08 | Each device has its own independent enrollment state |
| BR-AUTH-09 | 3 consecutive biometric authentication failures triggers fallback to password | FR-AUTH-08.2 | Password form shown after 3rd failure |
| BR-12 | 5 consecutive wrong email/password login attempts → 15-minute lockout | FR-07 | Lockout timer shown; no login possible until timer expires |
| BR-13 | Email verification OTP TTL = 10 minutes; max 5 wrong attempts → 15-minute lockout | FR-06 | Excess wrong attempts → E-1003; lockout applied |
| BR-28 | Users under 13 (evaluated in UTC+7) may not activate a Paave account | FR-05, FR-05.4 | E-1009 on email path; PARENTAL_CONSENT_PENDING on social path for 13-15 |
| BR-35 | All four signup methods (Google, Apple, Zalo, Email) must be available on iOS; Apple omitted on Android | FR-04.1 | Missing method = build error |
| BR-36 | On iOS, Apple Sign-In button must be equal prominence to other social login buttons | FR-04.1 | Non-compliant UI → App Store rejection risk |
| BR-37 | DOB collection (FR-05.4) is mandatory and non-skippable for all social OAuth registrations | FR-05.4 | No skip button; force-quit returns here |
| BR-38 | No duplicate account rows allowed; deduplication logic must run server-side | All paths | Duplicate → linking flow or error |
| BR-39 | A single provider being unavailable must not disable other sign-in methods | FR-04.1 | Provider-specific button disabled; others active |
| BR-40 | OAuth ID tokens and secrets must never appear in application logs, analytics events, or error reports | All OAuth paths | Masked/omitted in all logging pipelines |
| BR-41 | Accounts created via social OAuth with no linked password cannot use password login | FR-07 | Redirect message to correct provider |
| BR-42 | Request only the minimum required OAuth scopes from each provider | All OAuth | Google: openid+email+profile; Apple: name+email; Zalo: id+name+picture |
| BR-43 | `sector_preferences` array may contain 0–10 items; 11th selection not allowed | FR-08.1 | UI silently prevents 11th selection |
| BR-44 | `investment_goal` is mandatory; no null allowed after onboarding | FR-08.2 | No skip UI; submit button disabled until selection made |
| BR-ONBOARD-04 | Discover feed ranker uses `sector_preferences` to weight content; empty array = no personalization | FR-08.1 | Empty array → general (unweighted) discover feed |

---

## 4. Error Code Reference

| Code | Trigger | User-Facing Message |
|------|---------|---------------------|
| E-1001 | Duplicate email (ACTIVE account) | "An account with this email already exists." |
| E-1002 | OTP expired (registration or password reset) | "This code has expired. Please request a new one." |
| E-1003 | Too many OTP attempts (15-min lockout) OR password too weak | "Too many attempts. Please try again in 15 minutes." / (inline strength rules) |
| E-1009 | Date of birth indicates user is under 13 years old | "You must be at least 13 years old to create an account." |
| E-1010 | Wrong password reset OTP (attempts 1–4) | "Incorrect code. X attempts remaining." |
| E-1011 | Password reset OTP already used | "This code has already been used. Please request a new one." |
| E-1012 | Reset session token expired or invalid | "Your session has expired. Please restart the password reset process." |
| E-1013 | New password same as current password | "New password must be different from your current password." |
| E-1014 | 5 wrong password reset OTP attempts | "Maximum attempts exceeded. Please request a new code." |

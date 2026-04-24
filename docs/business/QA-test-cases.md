# QA Test Cases — Paave V1
## Derived from FRD v2.2 + FRD-module-B-v2.3 + SRD v2.0 + SRD-order-engine-v2.3 + FRD-gaps-v2.4

**Version:** 1.1
**Date:** 2026-04-21
**Author:** QA Team
**Status:** Complete — 0 BLOCKED
**Document sources:** FRD.md v2.2, FRD-module-B-v2.3.md, FRD-gaps-v2.4.md, SRD.md v2.0, SRD-order-engine-v2.3.md

> All 14 previously BLOCKED test cases from v1.0 are now WRITTEN and ready for execution.
> Prerequisites: FRD-gaps-v2.4.md must be implemented by engineering before newly unblocked TCs can pass.

---

## Test Case Naming Convention

`TC-[MODULE]-[NNN]` — e.g., `TC-AUTH-001`

**Status values:** PASS / FAIL / SKIP
**Priority:** P0 (blocker), P1 (major), P2 (minor)

---

## Summary Table

| Module | Total TCs | P0 | P1 | P2 | Status |
|--------|-----------|----|----|----|----|
| AUTH | 30 | 17 | 12 | 0 | READY |
| ONBOARDING | 8 | 2 | 5 | 0 | READY |
| AGE GATE | 3 | 2 | 1 | 0 | READY |
| HOME | 4 | 2 | 2 | 0 | READY |
| PAPER TRADING | 37 | 18 | 16 | 0 | READY |
| MARKETS | 6 | 2 | 3 | 0 | READY |
| NOTIFICATIONS | 7 | 4 | 3 | 0 | READY |
| SOCIAL | 8 | 4 | 3 | 0 | READY |
| GAMIFICATION | 2 | 0 | 1 | 1 | READY |
| AI | 3 | 2 | 1 | 0 | READY |
| LEGAL | 3 | 3 | 0 | 0 | READY |
| ACCOUNT | 9 | 3 | 4 | 1 | READY |
| LANGUAGE | 3 | 2 | 1 | 0 | READY |
| BROKERAGE | 2 | 1 | 1 | 0 | READY |
| **TOTAL** | **129** | **62** | **53** | **2** | **0 BLOCKED** |

> Note: v1.1 renumbered some test cases where BLOCKED stubs were replaced by one or more concrete TCs. The combined unique test count from v1.0 + v1.1 supplement is 133 test-case steps; this table counts distinct named TCs (some BLOCKED stubs expanded into multiple lettered variants).

---

## MODULE 1: AUTHENTICATION & REGISTRATION

### TC-AUTH-001 — Email registration happy path
**Ref:** FR-05, FR-06, SRD §2.1, §2.2
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Create Account" → "Sign up with email" | FR-05 form displayed |
| 2 | Enter: display name = "Nguyen Van A", email = "test@gmail.com", password = "Secure@123", DOB = 2004-01-15 | No validation errors |
| 3 | Tap Submit | HTTP 201; status = PENDING_VERIFICATION; verification email sent within 30s |
| 4 | Enter correct 6-digit OTP | HTTP 200; account status = ACTIVE; feature_tier = FULL_ACCESS; JWT + refresh token returned |
| 5 | Verify navigation to FR-08.1 (industrial preferences) | Industrial preferences screen shown |

**Pass Criteria:** Account active, FULL_ACCESS tier, routes to onboarding.

---

### TC-AUTH-002 — Email registration with DOB = 17 years old → LEARN_MODE
**Ref:** FR-05, FR-AGE-03, SRD §2.1.3f
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit registration with DOB = today − 17 years | HTTP 201; feature_tier = LEARN_MODE |
| 2 | Complete OTP verification | Account ACTIVE, feature_tier = LEARN_MODE |
| 3 | Navigate to Portfolio tab | Portfolio hero widget hidden (18+ only) |
| 4 | Tap "Brokerage Partner" CTA (if rendered) | CTA must NOT appear in any UI element for LEARN_MODE user |

**Pass Criteria:** User in LEARN_MODE; portfolio widget hidden; no brokerage CTA anywhere.

---

### TC-AUTH-003 — Email registration with DOB = 12 years old → blocked
**Ref:** FR-AGE-01, SRD §2.1.3f, BR-28
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit registration with DOB = today − 12 years | HTTP 400; error_code = E-1009; "You must be at least 13 years old to register" |
| 2 | Verify no account row created | DB query: email not in users table |

**Pass Criteria:** Registration blocked; no user record created.

---

### TC-AUTH-004 — Duplicate email registration (existing ACTIVE account)
**Ref:** FR-05, SRD §2.1.3b, E-1001
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Attempt to register with email already in users table (status = ACTIVE) | HTTP 409; error_code = E-1001; "An account with this email already exists" |

---

### TC-AUTH-005 — Duplicate email registration (existing PENDING_VERIFICATION account)
**Ref:** FR-05, SRD §2.1.3b
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Attempt to register with email in users table (status = PENDING_VERIFICATION) | HTTP 200 (not 409); new OTP sent; user navigated to OTP screen |

---

### TC-AUTH-006 — OTP expired
**Ref:** FR-06, SRD §2.2.3a, E-1002
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete registration (OTP sent) | |
| 2 | Wait 10 minutes + 1 second | |
| 3 | Submit OTP | HTTP 400; error_code = E-1002; "Code expired. Please request a new code." |

---

### TC-AUTH-007 — OTP max attempts lockout
**Ref:** FR-06, SRD §2.2.3b, E-1003
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit incorrect OTP 4 times | Each returns E-1004 with remaining_attempts countdown |
| 2 | Submit incorrect OTP 5th time | HTTP 429; error_code = E-1003; retry_after_seconds = 900 |
| 3 | Wait 15 minutes; submit correct OTP | HTTP 200; account verified |

---

### TC-AUTH-008 — Login with correct email/password
**Ref:** FR-07, SRD §2.3
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login with valid email + password | HTTP 200; access_token (1h), refresh_token (30d), feature_tier returned |
| 2 | Verify navigation to Home screen | Home screen rendered with user data |

---

### TC-AUTH-009 — Login lockout after 5 failed attempts
**Ref:** FR-07, SRD §2.3.3a, BR-12, E-1005
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit wrong password 5 times | Each returns E-1006 |
| 2 | Submit correct password | HTTP 429; E-1005; retry_after_seconds = 900 |
| 3 | Wait 15 minutes; login correctly | HTTP 200; access_token returned |

---

### TC-AUTH-010 — Login attempt on PENDING_VERIFICATION account
**Ref:** FR-07, SRD §2.3.3c, E-1007
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login with email of PENDING_VERIFICATION account | HTTP 401; E-1007; "Please verify your email to continue." |

---

### TC-AUTH-011 — Token refresh before expiry
**Ref:** SRD §2.4
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Obtain access_token and refresh_token | |
| 2 | Call POST /auth/refresh with valid refresh_token before expiry | HTTP 200; new access_token returned |
| 3 | Submit expired refresh_token (after 30 days) | HTTP 401; E-1008; "Session expired." |

---

### TC-AUTH-012 — Google OAuth happy path (new account)
**Ref:** FR-05.1, SRD §2.1 (social path)
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Continue with Google" | Google OAuth flow launched within 2s |
| 2 | Complete Google consent | Callback received; account created with signup_method = 'google', status = PENDING_DOB |
| 3 | Verify navigation to FR-05.4 | DOB prompt screen shown; non-skippable |
| 4 | Enter DOB = 22 years old | Account → ACTIVE, FULL_ACCESS; routes to FR-08.1 |

---

### TC-AUTH-013 — Google OAuth: email already exists → account linking
**Ref:** FR-05.1, FR-05.5, BR-38
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Register account with email@test.com via email/password | Account ACTIVE |
| 2 | Attempt "Continue with Google" returning same email@test.com | Account-linking screen shown; NOT creating a second account |
| 3 | Enter original password to confirm linking | Google added to linked_providers; no new user row in DB |
| 4 | Verify DB: single user row with linked_providers containing Google sub ID | Only 1 user row |

---

### TC-AUTH-014 — Google OAuth: provider returns empty display name
**Ref:** FR-05.1 Edge Case
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Google returns empty/null display_name | Default name applied: "Người dùng ẩn danh" (VN) |
| 2 | FR-05.4 screen renders | Name field pre-filled with default; user must edit before proceeding (submit disabled if empty after filter) |

---

### TC-AUTH-015 — Apple OAuth: private relay email
**Ref:** FR-05.2, BR-SIGNUP-05
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete Apple OAuth; Apple returns relay email xyz@privaterelay.appleid.com | Account created; email_is_relay = true; email stored verbatim |
| 2 | System sends transactional email (OTP, notification) | Email sent to relay address (Apple forwards); no bounce |
| 3 | User later attempts to link Google with real underlying email | Linking keyed on Apple Sub ID, not email; linking succeeds without collision |

---

### TC-AUTH-016 — Zalo OAuth: no email returned
**Ref:** FR-05.3, SRD §2.1 (Zalo path)
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete Zalo OAuth (Zalo doesn't return email) | Account created; status = PENDING_DOB_AND_EMAIL |
| 2 | FR-05.4 screen shown | DOB field + email field both shown; both required |
| 3 | Submit without email | Error: "Please enter an email address for account recovery" |
| 4 | Submit with valid DOB + email | Account → ACTIVE; proceeds to FR-08.1 |

---

### TC-AUTH-017 — Social login on account with PENDING_DOB status (abandoned mid-onboarding)
**Ref:** FR-07, FR-05.4, BR-37
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Start Google signup; complete OAuth; force-quit before entering DOB | Account remains PENDING_DOB |
| 2 | Reopen app | FR-05.4 (DOB screen) shown immediately; Home is NOT reachable |
| 3 | Tap Continue with Google on login screen | Google re-auth; redirects to FR-05.4 |

---

### TC-AUTH-018 — Login attempt with email/password on social-only account
**Ref:** FR-07, BR-41, BR-SIGNUP-08
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Account registered via Google only | |
| 2 | Attempt email/password login with same email | Response: redirect "This account was created with Google. Sign in with Google." |
| 3 | Verify no lockout counter incremented | After attempt: login_attempts counter unchanged |
| 4 | Verify no password reset option offered | No "Forgot password?" link shown for social-only accounts |

---

### TC-AUTH-019 — Provider outage at signup
**Ref:** FR-04.1 Edge Case, BR-39
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Simulate Zalo provider returning 5xx | Zalo button disabled; label "Zalo sign-in is temporarily unavailable" |
| 2 | Verify Google and Apple/Email buttons still function | Other methods unaffected |
| 3 | No silent retry loop | Provider status re-checked every 60s server-side (not in tight loop) |

---

### TC-AUTH-020 — Forgot Password: Happy Path
**Ref:** FR-AUTH-07
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On login screen, tap "Forgot Password?" | Forgot Password screen displayed; email input field shown |
| 2 | Enter registered email: test@gmail.com | No client-side error |
| 3 | Tap "Send Code" | HTTP 200; "If this email is registered, a reset code has been sent."; OTP sent to email within 30s |
| 4 | Enter correct 6-digit OTP within 10 minutes | HTTP 200; `reset_session_token` returned; TTL 5 minutes |
| 5 | Enter new password: "NewSecure@456" (≥8 chars, uppercase, lowercase, number) | HTTP 200; "Password updated. Please log in." |
| 6 | Navigate to login screen; enter new password | Login succeeds; all other active sessions revoked |

**Pass Criteria:** Password updated; old password no longer works; all existing sessions terminated.

---

### TC-AUTH-021a — Forgot Password: OTP Expired
**Ref:** FR-AUTH-07.2, E-1002
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Request forgot-password OTP | OTP sent; TTL = 10 minutes |
| 2 | Wait 10 minutes + 1 second | OTP expired |
| 3 | Submit the OTP | HTTP 400; E-1002; "Code expired. Please request a new code." |

---

### TC-AUTH-021b — Forgot Password: Max OTP Attempts
**Ref:** FR-AUTH-07.2, E-1014
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Request forgot-password OTP | OTP sent |
| 2 | Enter wrong OTP (attempt 1 of 5) | HTTP 400; E-1010; "Incorrect code. 4 attempts remaining." |
| 3 | Enter wrong OTP (attempts 2–4) | Decreasing attempts remaining shown |
| 4 | Enter wrong OTP (attempt 5 of 5) | HTTP 400; E-1014; "Too many incorrect attempts. Please request a new code."; token invalidated |
| 5 | Enter correct OTP (attempt 6) | HTTP 400; E-1014 (token is invalidated, not E-1002) |

---

### TC-AUTH-021c — Forgot Password: Same Password Rejected
**Ref:** FR-AUTH-07.3, E-1013
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete OTP verification; obtain reset_session_token | Token valid |
| 2 | Submit new_password = current password | HTTP 400; E-1013; "New password must be different from your current password." |

---

### TC-AUTH-021d — Forgot Password: Email Not Found (No Enumeration)
**Ref:** FR-AUTH-07.1
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter email not registered in system | HTTP 200; same message: "If this email is registered, a reset code has been sent." |
| 2 | Verify no OTP was sent | No email received; DB: no reset token created |

**Pass Criteria:** Response identical to successful case — email enumeration not possible.

---

### TC-AUTH-021e — Forgot Password: OAuth-Only Account
**Ref:** FR-AUTH-07.1 edge case
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Request password reset for email registered via Google OAuth only | HTTP 200; same success message; no email sent (no password exists); event logged server-side |
| 2 | Verify no reset email received | Confirmed: no email sent |

---

### TC-AUTH-022 — Multi-Device Session: 5 Device Limit
**Ref:** FR-AUTH-09.1, BR-AUTH-08
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in on Device 1–5 (different device_ids) | All 5 sessions created; all active simultaneously |
| 2 | Log in on Device 6 | HTTP 200; login succeeds; oldest inactive session (Device 1) is auto-revoked |
| 3 | Check Device 1 | Push notification received: "You were signed out because your account reached the maximum device limit." |
| 4 | Device 1 makes API call | HTTP 401; refresh token invalid |

---

### TC-AUTH-023 — Remote Session Revocation
**Ref:** FR-AUTH-09.3
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in on Device A (current) and Device B | Both sessions active |
| 2 | From Device A: Settings > Security > Active Sessions | List shows Device A ("This device") and Device B with last-active time and approximate location |
| 3 | Tap "Sign out" on Device B entry | HTTP 200; Device B session revoked |
| 4 | Device B receives push notification | "You were signed out of Paave on [Device B name]. If this wasn't you, change your password immediately." |
| 5 | Device B attempts API call | HTTP 401 |

---

### TC-AUTH-024 — Biometric Enrollment During Onboarding (Happy Path)
**Ref:** FR-AUTH-08.1
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete onboarding on biometric-capable device (iPhone with Face ID enabled) | Biometric enrollment screen displayed after investment goal step |
| 2 | Tap "Enable Face ID" | OS Face ID permission prompt shown |
| 3 | Approve Face ID permission | Face ID scan requested |
| 4 | Successful face scan | `biometric_enabled = true` in local storage; encrypted refresh token in Keychain; enrollment confirmation shown |
| 5 | Force-quit app; reopen | Face ID prompt shown instead of password screen |

**Pass Criteria:** User can log in with Face ID on next app launch.

---

### TC-AUTH-025 — Biometric: Skip Enrollment
**Ref:** FR-AUTH-08.1
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On biometric enrollment screen, tap "Skip" | Screen dismissed; `biometric_enabled = false` |
| 2 | Force-quit app; reopen | Password login screen shown (no biometric prompt) |
| 3 | Settings > Security | "Enable Face ID / Fingerprint" toggle shown (OFF state) |
| 4 | Toggle to ON | Biometric enrollment flow re-triggered |

---

### TC-AUTH-026 — Biometric: 3 Failures Fallback
**Ref:** FR-AUTH-08.2, BR-AUTH-09
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Biometric enrolled; app locked; attempt biometric login | Face ID prompt shown |
| 2 | Fail Face ID (attempt 1) | OS shows "Try again" (hardware-level, not app-level) |
| 3 | Fail Face ID (attempt 2) | Second failure |
| 4 | Fail Face ID (attempt 3) | App-level: biometric prompt dismissed; password login screen shown with message "Biometric authentication failed. Please enter your password." |
| 5 | Enter correct password | Login succeeds; biometric still enrolled (not deleted) |

---

### TC-AUTH-027 — Biometric: Not Supported (Device Without Hardware)
**Ref:** FR-AUTH-08.1 edge case
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete onboarding on Android device with no fingerprint sensor | Biometric enrollment screen is SKIPPED (not shown) |
| 2 | Navigate to Settings > Security | Biometric toggle NOT shown |

**Pass Criteria:** No crash; no mention of biometric on unsupported device.

---

### TC-AUTH-028 — Biometric: Re-enrollment After Enrollment Change
**Ref:** FR-AUTH-08.3
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has biometric enrolled | `biometric_enabled = true` |
| 2 | User adds new fingerprint in Android Settings (outside app) | App's Keystore key is invalidated by OS |
| 3 | Open app; attempt biometric login | App detects `KeyPermanentlyInvalidatedException`; clears biometric config; shows: "Your biometric settings changed. Please sign in with your password to re-enable biometric login." |
| 4 | Enter password | Login succeeds |
| 5 | System prompts biometric re-enrollment | FR-AUTH-08.1 flow triggered |

---

## MODULE 2: ONBOARDING

### TC-ONBOARD-001 — Industrial preferences: select 3 sectors
**Ref:** FR-08.1, BR-43
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On FR-08.1 screen, tap Banking, Tech, Consumer | 3 chips highlighted; Continue enabled |
| 2 | Tap Continue | industrial_prefs = ['banking','tech','consumer'] persisted; routes to FR-08.2 |

---

### TC-ONBOARD-002 — Industrial preferences: try to select 11th sector
**Ref:** FR-08.1, BR-43
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Select 10 sectors | All 10 highlighted; Continue enabled |
| 2 | Tap an 11th sector chip | Chip does NOT become selected; inline hint "You can select up to 10" shown |

---

### TC-ONBOARD-003 — Industrial preferences: skip
**Ref:** FR-08.1, BR-43
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap "Skip for now" | industrial_prefs = [] persisted; degradation notice shown for 5 seconds; routes to FR-08.2 |
| 2 | Verify Discover feed is generic (no preference-boosted cards) | Feed shows VN trending (no preference weighting) |

---

### TC-ONBOARD-004 — Investment goal: required (no skip)
**Ref:** FR-08.2, BR-44
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On FR-08.2 screen, tap Continue without selecting | Button disabled; "Please choose one" hint shown |
| 2 | Select "High returns" | investment_goal = 'high_returns' persisted; onboarded_at set; routes to consent or Home |

---

### TC-ONBOARD-005 — Step Count: Email Path Shows 5 Steps
**Ref:** FR-08 AMENDMENT
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Begin email registration path | Data Consent screen shown; progress bar shows "Step 1 of 5" |
| 2 | Complete Consent → Account Details + DOB | OTP screen shown; progress bar shows "Step 3 of 5" |
| 3 | Complete OTP → Industrial Preferences | Progress bar shows "Step 4 of 5" |
| 4 | Complete Industrial Preferences → Investment Goal | Progress bar shows "Step 5 of 5" |
| 5 | Complete Investment Goal | Progress never reaches "Step 6 of 5" or "Step 6 of 6" |

**Pass Criteria:** Email path step counter never exceeds 5; reaches 5 on last step.

---

### TC-ONBOARD-006 — Step Count: Social OAuth Path Shows 6 Steps
**Ref:** FR-08 AMENDMENT
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Select "Sign up with Google" | Method Selection counts as Step 1 of 6 |
| 2 | OAuth handshake (Google web view) | No progress bar during OAuth handshake |
| 3 | Return from OAuth → Display Name + DOB screen | Progress bar shows "Step 3 of 6" |
| 4 | Industrial Preferences | "Step 4 of 6" |
| 5 | Investment Goal | "Step 5 of 6" |
| 6 | Data Consent | "Step 6 of 6" |

**Pass Criteria:** Social path step counter shows 6 at final step; email path shows 5.

---

### TC-ONBOARD-007 — Onboarding progress: force-quit and resume
**Ref:** FR-01 Edge Case
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Progress through onboarding to FR-08.1 (industrial prefs) | Partial state saved |
| 2 | Force-quit app | |
| 3 | Reopen app | Resumes at FR-08.1; selections not lost if partial draft saved (as per FR-08.1 Edge Case "backgrounds mid-selection → returning restores selected state from local draft") |

---

### TC-ONBOARD-008 — Language change mid-onboarding
**Ref:** FR-08.1 Edge Case
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On industrial preferences screen with 3 chips selected, change language to Korean | Chip labels update to Korean immediately; previously selected chips remain selected |
| 2 | Complete the step | Stored enum values (English slugs) are unchanged; only display language switched |

---

## MODULE 3: AGE GATE

### TC-AGE-001 — Age upgrade prompt on 18th birthday
**Ref:** FR-AGE-04, SRD §2.3.3c
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | LEARN_MODE user's 18th birthday arrives | |
| 2 | User logs in | Age-upgrade modal shown before Home: "You're now 18 — unlock full Paave?" |
| 3 | Tap "Unlock Now" | feature_tier = FULL_ACCESS; portfolio widget visible; modal not shown on next login |
| 4 | Tap "Maybe Later" | Home shown; modal re-shown on next login |

---

### TC-AGE-002 — LEARN_MODE user cannot access brokerage CTA
**Ref:** FR-BRK-01, BR-31
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as LEARN_MODE user | |
| 2 | Inspect entire app: Home, Portfolio, Stock Detail, Profile | NO brokerage CTA rendered anywhere (not just hidden — absent from markup) |
| 3 | Direct HTTP call to partner directory endpoint | HTTP 403 or 404 |

---

### TC-AGE-003 — DOB Age Boundary: Timezone Edge Case (UTC+7)
**Ref:** FR-AGE-04 AMENDMENT, BR-AGE-05
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Register user with DOB = 2008-01-15 | Account created |
| 2 | Simulate server time = 2026-01-14T20:00:00Z (= 2026-01-15T03:00:00 UTC+7) | today_UTC7 = 2026-01-15; user is exactly 18 years old |
| 3 | User logs in at this time | `feature_tier` recalculated: `today_UTC7 (2026-01-15) >= dob + 18 years (2026-01-15)` → TRUE → FULL_ACCESS granted |
| 4 | Simulate server time = 2026-01-14T16:00:00Z (= 2026-01-14T23:00:00 UTC+7) | today_UTC7 = 2026-01-14; user is still 17 |
| 5 | User logs in at this time | feature_tier = LEARN_MODE (birthday not reached in UTC+7) |

**Pass Criteria:** Age boundary uses today_date_in_UTC7; user gets FULL_ACCESS on their birthday in UTC+7 timezone.

---

## MODULE 4: HOME SCREEN

### TC-HOME-001 — Portfolio hero widget for FULL_ACCESS user
**Ref:** FR-09, FR-35
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as FULL_ACCESS user with 2 paper holdings | Total virtual portfolio value shown with "Tiền ảo" label |
| 2 | Verify P&L color coding | Positive P&L = green; negative = red; zero = gray |

---

### TC-HOME-002 — Portfolio hero widget for LEARN_MODE user
**Ref:** FR-09 (V2 update: hidden for 16–17)
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as LEARN_MODE user | Portfolio hero widget is hidden/absent |
| 2 | Verify "Start paper trading" CTA shown instead | CTA visible without P&L display |

---

### TC-HOME-003 — Market snapshot auto-refresh
**Ref:** FR-10
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open Home during market hours (09:00–14:45 ICT) | VN-Index value shown with live direction arrow |
| 2 | Wait 30 seconds | Data refreshes without user action |
| 3 | Open Home at 15:00 ICT (market closed) | "Market Closed" label + next open time |

---

### TC-HOME-004 — Home screen data refresh: no internet
**Ref:** FR-13
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Disable network; pull-to-refresh | Toast: "Unable to refresh. Showing last available data." Previous data retained |

---

## MODULE 5: PAPER TRADING ENGINE (PRIMARY)

### TC-PT-001 — Virtual portfolio creation on account activation
**Ref:** FR-PT-01, SRD §2.11 (pre-v2.3) / implied
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Complete registration → account ACTIVE | |
| 2 | GET /api/v1/paper-trading/portfolio | balance_vnd = 500,000,000; positions = [] |
| 3 | Verify "Tiền ảo" label visible in portfolio header | Label present at all times |

---

### TC-PT-002 — Market order BUY: HOSE stock, happy path
**Ref:** FR-PT-02, SRD-order-engine-v2.3 §2.1, BR-PT-01
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open Stock Detail for VIC (HOSE); market OPEN 10:00 ICT | |
| 2 | Tap Buy; select MARKET order; quantity = 100; idempotency_key = UUID | HTTP 201; order status = PENDING |
| 3 | Wait ≤15s | HTTP GET orders shows status = FILLED; fill_price = price at snapshot; balance debited (quantity × fill_price × 1.001); holding shows 100 VIC |
| 4 | Verify XP event | +10 XP credited to user account |
| 5 | Verify post-trade AI card | AI card appears within 5s of fill |
| 6 | Verify "Tiền ảo" label visible on order confirmation | Label mandatory per FR-PT-06 |

---

### TC-PT-003 — Market order BUY: lot size violation (VN)
**Ref:** FR-PT-02 FC-PT-06, BR-PT-01, E-PT-107
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit BUY MARKET order for VIC, quantity = 150 (HOSE) | HTTP 422; E-PT-107; message includes nearest valid: 100 and 200 |
| 2 | Submit BUY MARKET order for VIC, quantity = 1 (HOSE) | HTTP 422; E-PT-107 |
| 3 | Submit BUY MARKET order for Samsung (KOSPI), quantity = 1 | HTTP 201 (KR lot = 1 share; no lot validation) |

---

### TC-PT-004 — Market order BUY: insufficient virtual balance
**Ref:** FR-PT-02 FC-PT-07, E-PT-108
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has 1,000,000 VND virtual balance | |
| 2 | Submit BUY for 100 VIC at ~55,000 VND (estimated cost ~5,555,000 VND) | HTTP 422; E-PT-108; required = ~5,555,000; available = 1,000,000 |

---

### TC-PT-005 — Market order SELL: insufficient holdings
**Ref:** FR-PT-02 FC-PT-08, E-PT-109
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User holds 50 VIC | |
| 2 | Submit SELL MARKET for 100 VIC | HTTP 422; E-PT-109; requested = 100; available = 50 |

---

### TC-PT-006 — Market order SELL: 0 holdings (short sell prevention)
**Ref:** FR-PT-02 FC-PT-09, E-PT-110
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User holds 0 VIC | |
| 2 | Submit SELL MARKET for 100 VIC | HTTP 422; E-PT-110; "You don't own any VIC shares. Short selling is not available." |

---

### TC-PT-007 — Market order: market CLOSED for VN (HOSE)
**Ref:** FR-PT-02 FC-PT-01, BR-PT-07, E-PT-101
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit MARKET BUY at 16:00 ICT (market closed) for VIC (HOSE) | HTTP 422; E-PT-101; message includes next_open time |
| 2 | Submit MARKET BUY on a VN market holiday | HTTP 422; E-PT-101 |

---

### TC-PT-008 — Market order during PRE_OPEN session (09:00–09:15 ICT)
**Ref:** FR-PT-02 FC-PT-02, BR-PT-04, E-PT-103
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit MARKET BUY for VIC at 09:05 ICT | HTTP 422; E-PT-103; suggestion: use ATO order type |
| 2 | Submit ATO BUY for VIC at 09:05 ICT (no limit_price) | HTTP 201; status = PENDING (fills at 09:15 opening price) |

---

### TC-PT-009 — Market order during ATC session (14:30–14:45 ICT)
**Ref:** FR-PT-02 FC-PT-02 (ATC variant), BR-PT-07, E-PT-115
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit MARKET BUY for VIC at 14:35 ICT | HTTP 422; E-PT-115; suggestion: use ATC order |
| 2 | Submit ATC BUY for VIC at 14:35 ICT | HTTP 201; status = PENDING (fills at 14:45 closing price) |

---

### TC-PT-010 — Ticker suspended: reject order
**Ref:** FR-PT-02 FC-PT-03, E-PT-104
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Ticker XYZ is suspended in price feed | |
| 2 | Submit MARKET BUY for XYZ | HTTP 422; E-PT-104; "This stock is currently suspended" |

---

### TC-PT-011 — Market order: balance gap at fill time (FC-PT-05)
**Ref:** FR-PT-02 FC-PT-05, SRD-order-engine-v2.3 §2.1 Step 11b.iii, E-PT-106
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has 5,000,000 VND; submits BUY for 100 VIC at estimated cost ~5,000,000 VND | HTTP 201; status = PENDING (passes submission check) |
| 2 | Price jumps before snapshot: fill_price = 56,000 VND → cost = 5,605,600 VND | System attempts fill; balance insufficient at fill time |
| 3 | Verify order terminal state | status = FILL_FAILED; balance unchanged (not debited); push notification sent: "Order could not fill — price moved" |

---

### TC-PT-012 — Market order: feed outage → 3 retries → FILL_FAILED
**Ref:** FC-PT-10, E-PT-111
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit valid MARKET BUY; VN feed set to DEGRADED | Order status = PENDING |
| 2 | Wait 60 seconds (3 retries × 15s) | status = FILL_FAILED; push notification sent |
| 3 | Verify balance not debited | virtual_balance unchanged |

---

### TC-PT-013 — Duplicate order submission (idempotency)
**Ref:** FR-PT-02 FC-PT-11, BR-PT-15
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit BUY MARKET with idempotency_key = "abc-123" | HTTP 201; order_id = "ord_001" |
| 2 | Immediately re-submit identical request with same idempotency_key "abc-123" | HTTP 201; same order_id = "ord_001" returned; no second order in DB |
| 3 | Verify DB: exactly 1 order record | Single row with this idempotency_key |

---

### TC-PT-014 — Limit order BUY: happy path
**Ref:** FR-PT-03, SRD-order-engine-v2.3 §2.2
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | VIC current price = 52,000 VND; submit BUY LIMIT 100 shares at 48,000 VND | HTTP 201; status = PENDING; reserve = 48,000 × 100 × 1.001 = 4,804,800 VND; available_balance reduced |
| 2 | Verify order in open orders list | Shown with limit_price = 48,000; expiry_at = 30 days out |
| 3 | Simulate price drop to 47,500 VND | Evaluation daemon fires; price ≤ 48,000 → fill at 47,500 (best available ≤ limit) |
| 4 | Verify fill and refund | status = FILLED; fill_price = 47,500; 50 VND × 100 = 5,000 VND refunded; holding shows 100 VIC |

---

### TC-PT-015 — Limit order BUY: price above current price → rejected
**Ref:** FR-PT-03 FC-LIM-01, E-PT-201
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | VIC current price = 52,000 VND; submit BUY LIMIT at 55,000 VND | HTTP 422; E-PT-201; "Buy limit price (55,000) is above current price (52,000). Use Market order or set lower price." |

---

### TC-PT-016 — Limit order SELL: price below current price → rejected
**Ref:** FR-PT-03 FC-LIM-02, E-PT-202
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | VIC current price = 52,000 VND; submit SELL LIMIT at 48,000 VND | HTTP 422; E-PT-202 |

---

### TC-PT-017 — Limit order: price above HOSE ceiling
**Ref:** FR-PT-03 FC-LIM-03, BR-PT-02, E-PT-203
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | VIC reference_price = 51,486; ceiling = 51,486 × 1.07 = 55,090 VND; submit BUY LIMIT at 56,000 VND | HTTP 422; E-PT-203; message includes ceiling = 55,090 and reference = 51,486 |

---

### TC-PT-018 — Limit order: tick size violation
**Ref:** FR-PT-03 FC-LIM-06, BR-PT-04, E-PT-205
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | VIC at 52,000 VND; submit BUY LIMIT at 51,050 VND (not multiple of 100) | HTTP 422; E-PT-205; nearest_lower = 51,000; nearest_upper = 51,100 |
| 2 | Submit BUY LIMIT at 51,000 VND (multiple of 100 for ≥50,000) | HTTP 201; accepted |

---

### TC-PT-019 — Limit order expiry after 30 days
**Ref:** FR-PT-03, BR-PT-12
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Place BUY LIMIT order; advance time by 30 days + 1 second (or trigger expiry cron) | |
| 2 | Check order status | status = EXPIRED; reserved funds released; push notification sent |
| 3 | Verify available balance restored | virtual_balance shows original balance restored |

---

### TC-PT-020 — Portfolio reset cancels open limit orders
**Ref:** FR-PT-05, BR-PT-13
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has 3 open PENDING limit orders | |
| 2 | Tap "Reset Portfolio" | Confirmation dialog shows "This will also cancel 3 open limit orders." |
| 3 | Tap Cancel on dialog | No change; all orders still PENDING |
| 4 | Tap Reset (confirm) | Balance = 500,000,000 VND; all 3 orders status = CANCELLED (reason = PORTFOLIO_RESET); reserves released |

---

### TC-PT-021 — Max 10 open orders limit
**Ref:** FR-PT-03, BR-PT-16, E-PT-116
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Place 10 LIMIT orders | All 10 succeed; status = PENDING |
| 2 | Attempt to place 11th order | HTTP 422; E-PT-116; "Maximum of 10 open orders reached." |

---

### TC-PT-022 — Limit order: stock delisted while pending
**Ref:** FR-PT-03 FC-LIM-10, E-PT-209
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Place BUY LIMIT for VIC; order PENDING | |
| 2 | VIC ticker status changes to DELISTED in feed | |
| 3 | System processing | Order status = CANCELLED; cancel_reason = DELISTED; reserved funds released; push sent |

---

### TC-PT-023 — ATO order with limit_price → rejected
**Ref:** FR-PT-07.1, BR-PT-19, E-PT-117
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit ATO order with limit_price = 51,000 at 09:05 ICT | HTTP 422; E-PT-117; "ATO orders do not accept a price." |
| 2 | Submit ATO order without limit_price at 09:05 ICT | HTTP 201; PENDING |

---

### TC-PT-024 — ATO order outside PRE_OPEN window
**Ref:** FR-PT-07.1, E-PT-124
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit ATO order at 10:00 ICT (continuous session) | HTTP 422; E-PT-124; "ATO orders can only be placed during the pre-opening session (9:00–9:15)." |

---

### TC-PT-025 — ATO Order: No Matching Price at Opening Auction
**Ref:** FR-PT-07.1 AMENDMENT, E-PT-400
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit ATO BUY for 100 VIC at 09:10 ICT (during pre-opening window) | HTTP 201; status = PENDING; session_at_submission = PRE_OPENING; reserved funds deducted |
| 2 | System runs opening auction at 09:15 ICT | No counterparty exists; no opening price computed |
| 3 | System evaluates ATO orders | Order status → CANCELLED; cancel_reason = ATO_ATC_NO_MATCH |
| 4 | Check virtual balance | Reserved funds released; available_balance restored |
| 5 | Check push notification | "Your ATO order for 100 VIC could not be filled — no matching price was available at the opening auction. Your funds have been released." |
| 6 | Check order history | Order shows status = CANCELLED; reason = "No matching price at auction" |

---

### TC-PT-026 — UPCOM ticker: MARKET order rejected
**Ref:** FR-PT-07.3 (LO only for UPCoM)
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit MARKET BUY for a UPCoM-listed stock | HTTP 422; "Market orders are not supported for UPCoM stocks. Please use a Limit order." |

---

### TC-PT-026a — ATC Order: No Matching Price at Closing Auction
**Ref:** FR-PT-07.1 AMENDMENT, E-PT-400
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit ATC SELL for 200 HPG at 14:35 ICT (during ATC window) | HTTP 201; status = PENDING; holdings soft-locked |
| 2 | System runs closing auction at 14:45 ICT | No closing price computed |
| 3 | System evaluates ATC orders | Order status → CANCELLED; cancel_reason = ATO_ATC_NO_MATCH |
| 4 | Check holdings | Soft lock released; 200 HPG available again |
| 5 | Check push notification | "Your ATC order for 200 HPG could not be filled — no matching price was available at the closing auction. Your funds have been released." |

---

### TC-PT-027 — Exchange/ticker mismatch
**Ref:** SRD-order-engine-v2.3 §3.1, E-PT-122
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit order for VIC with exchange = HNX (VIC is on HOSE) | HTTP 422; E-PT-122; "VIC is listed on HOSE, not HNX. Resubmit with exchange=HOSE." |

---

### TC-PT-028 — KR reference market order: queued after hours
**Ref:** FR-PT-02 FC-PT-01 (KR path), BR-PT-07
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit MARKET BUY for Samsung (KOSPI) at 15:00 ICT (outside KR hours) | HTTP 201; status = QUEUED_AFTER_HOURS; estimated_fill = true; reference_data_notice present |
| 2 | Cancel the queued order | HTTP 200; status = CANCELLED; cancel_reason = USER_CANCELLED |

---

### TC-PT-029 — QUEUED_AFTER_HOURS: Auto-Cancel After 48 Hours
**Ref:** BR-PT-16, SRD-order-engine §2.4
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit MARKET BUY for 10 Samsung (KOSPI) at 15:00 ICT (outside KR trading hours) | HTTP 201; status = QUEUED_AFTER_HOURS; created_at = T |
| 2 | KR market session opens and closes (simulated) but order evaluation does not fill (test: mark order as not evaluated) | Order remains QUEUED_AFTER_HOURS |
| 3 | Simulate time: T + 48 hours + 1 minute | Expiry Cron runs |
| 4 | Expiry Cron processes | Order status → CANCELLED; cancel_reason = QUEUE_TTL_EXPIRED |
| 5 | Check reserved funds | Released back to available_balance |
| 6 | Check push notification | "Your order for 10 Samsung (KOSPI) has been cancelled because it was not evaluated within 48 hours." |

---

### TC-PT-030 — Limit order: concurrent fill race condition prevention
**Ref:** SRD-order-engine-v2.3 §2.3 (SELECT FOR UPDATE)
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Two identical price tick events arrive within 1ms of each other for the same limit order | |
| 2 | Inspect DB after both ticks processed | Exactly 1 FILLED record; exactly 1 debit to virtual_balance; no duplicate holdings |

---

### TC-PT-031 — Limit order BUY: insufficient balance at submission (with reserves)
**Ref:** FR-PT-03 FC-LIM-07, E-PT-206
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has 10M VND; places BUY LIMIT for 100 VIC at 50,000 VND (reserves 5,005,000 VND) | Order 1 succeeds; available_balance = 4,995,000 VND |
| 2 | Attempt second BUY LIMIT for 100 VIC at 50,000 VND (would need another 5,005,000 VND) | HTTP 422; E-PT-206; shows reserved_amount breakdown |

---

### TC-PT-032 — Soft-lock: two SELL limits on same shares
**Ref:** FR-PT-03 FC-LIM-08, E-PT-207
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User holds 100 VIC; places SELL LIMIT for 100 VIC at 60,000 VND | Succeeds; 100 VIC soft-locked |
| 2 | Place another SELL LIMIT for 100 VIC at 65,000 VND | HTTP 422; E-PT-207; shows existing order_id |

---

### TC-PT-033 — Virtual funds label on all paper trading screens
**Ref:** FR-PT-06, BR-18
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to: Portfolio dashboard, Order placement screen, Order confirmation screen, Trade history | "Tiền ảo" (VN) / "가상 자금" (KR) / "Virtual Funds" (EN) label visible on ALL screens |
| 2 | Change language to Korean | Label updates to "가상 자금" immediately |
| 3 | User cannot hide or dismiss the label | No toggle/dismiss action available |

---

### TC-PT-034 — Simulated transaction fee displayed on order confirmation
**Ref:** BR-PT-18, SRD-order-engine-v2.3
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Submit BUY for 100 VIC at 52,000 VND; view confirmation screen | "Simulated fee: 5,200 VND (0.1%)" shown explicitly |
| 2 | Submit SELL 100 VIC at 55,000 VND | "Simulated fee: 5,500 VND (0.1%)" shown |

---

### TC-PT-035 — AI Post-Trade Card: LEARN_MODE User (Educational Content)
**Ref:** FR-AI-01 AMENDMENT
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as LEARN_MODE user (age 16) | feature_tier = LEARN_MODE confirmed |
| 2 | Place LIMIT BUY order for 100 VIC at 48,500 VND | Order submitted |
| 3 | Order fills (price crosses 48,500) | Execution successful |
| 4 | Post-trade AI card displayed | Card IS shown (not hidden for LEARN_MODE) |
| 5 | Inspect AI card content | Educational framing: explains what a LIMIT order is and why it filled. Example: "Your limit order was filled at your target price of 48,500 VND — this means the market price dropped to your specified level..." |
| 6 | Verify no P&L language | No "You gained X VND" or percentage gain/loss language present in card |

---

### TC-PT-036 — AI Post-Trade Card: FULL_ACCESS User (P&L + Educational)
**Ref:** FR-AI-01 AMENDMENT
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Login as FULL_ACCESS user (age 22) | feature_tier = FULL_ACCESS confirmed |
| 2 | Place and fill same LIMIT BUY for 100 VIC at 48,500 VND | Execution successful |
| 3 | Post-trade AI card displayed | Card shown with P&L framing AND educational context |
| 4 | Verify card includes gain/loss language | "This position is currently valued at X VND" or similar P&L framing present |

---

## MODULE 6: MARKETS

### TC-MKT-001 — VN market: real-time data with SLA
**Ref:** FR-37, BO-06, BR-09
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open Markets → Vietnam tab during trading hours | VN-Index value displayed |
| 2 | Measure time delta between exchange tick and in-app display | ≤15 seconds consistently |
| 3 | Verify feed_status = LIVE shown | |

---

### TC-MKT-002 — KR market: reference label mandatory
**Ref:** FR-38, BR-46
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open Markets → Korea tab | "Reference data — may be delayed" banner shown at top; non-dismissible |
| 2 | Tap any KR ticker card | "Reference" chip on card; chip tap opens tooltip explaining V1 sourcing |
| 3 | Verify no SLA guarantee implied in any copy | No "live" or "real-time" label on KR data |

---

### TC-MKT-003 — VN feed degraded → banner shown
**Ref:** FR-37 Edge Case, SRD §2.5
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Simulate VN feed status = DEGRADED | "Live data temporarily unavailable — showing last known" banner shown |
| 2 | After 3 failed reconnects | feed_status = DEGRADED in all API responses |

---

### TC-MKT-004 — Price Alert: Set When Price Already Above Threshold
**Ref:** FR-28 AMENDMENT, EC-ALT-01
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | VIC current market price = 56,500 VND | Price feed active |
| 2 | User sets alert: "Notify me when VIC is above 55,000 VND" (SINGLE_FIRE mode) | HTTP 201; alert created; alert status = ACTIVE |
| 3 | Next price evaluation runs (within 15 seconds) | Alert condition satisfied (56,500 > 55,000) |
| 4 | Alert triggers immediately | Push notification: "VIC is above your alert price of 55,000 VND — current price: 56,500 VND" |
| 5 | Alert status after trigger | TRIGGERED (SINGLE_FIRE: consumed; no further notifications) |

---

### TC-MKT-005 — Price Alert: RECURRING Mode Triggers Multiple Times
**Ref:** FR-28 AMENDMENT
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | HPG current price = 28,000 VND | |
| 2 | User sets alert: "Notify me when HPG is above 27,000 VND" with RECURRING mode | Alert created; status = ACTIVE |
| 3 | Alert triggers (price = 28,000 > 27,000) | Notification sent |
| 4 | Alert status after trigger | ACTIVE (not consumed; RECURRING) |
| 5 | Price drops to 26,000; then rises to 27,500 | Alert triggers again; second notification sent |

---

### TC-MKT-006 — Price alert triggers within 60s (standard)
**Ref:** FR-43, SRD §2.6, BR-04
**Priority:** P0
**Status:** WRITTEN

> Note: This test is retained under MKT for market-level alert baseline; the notification delivery aspect is also covered in NOTIF module.

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Set alert: VIC price above 60,000 VND | alert status = ACTIVE |
| 2 | VIC price crosses 60,001 VND | Push notification within 60s; title = "VIC Alert Triggered"; alert status = INACTIVE |
| 3 | Price crosses 60,001 again | No notification (alert is deactivated per BR-04) |

---

## MODULE 7: NOTIFICATIONS

### TC-NOTIF-001 — Price alert triggers within 60s
**Ref:** FR-43, SRD §2.6, BR-04
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Set alert: VIC price above 60,000 VND | alert status = ACTIVE |
| 2 | VIC price crosses 60,001 VND | Push notification within 60s; title = "VIC Alert Triggered"; alert status = INACTIVE |
| 3 | Price crosses 60,001 again | No notification (alert is deactivated per BR-04) |

---

### TC-NOTIF-002 — Push notification when notifications disabled (OS level)
**Ref:** FR-28 Edge Case, SRD §2.6.2b
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has alerts enabled in app but OS-level notifications disabled | |
| 2 | Price crosses alert threshold | No push notification sent; alert marked INACTIVE; notification stored in inbox (FR-47) |

---

### TC-NOTIF-003 — Deep Link: App Killed, User Logged Out → Login Then Navigate
**Ref:** FR-NOTIF-01.3
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User is logged out; app is killed | No active session |
| 2 | Push notification received: "VIC price alert triggered" (deep_link = "/stocks/VIC") | Notification visible in OS notification center |
| 3 | User taps notification | App cold-starts; `pending_deep_link = "/stocks/VIC"` stored in local device storage |
| 4 | Login screen shown (not Stock Detail) | User sees login screen |
| 5 | User completes login successfully | `pending_deep_link` retrieved from local storage |
| 6 | App navigates to VIC Stock Detail screen | VIC Stock Detail shown |
| 7 | Verify `pending_deep_link` cleared | Local storage key no longer exists |

---

### TC-NOTIF-004 — Deep Link: pending_deep_link Expires After 5 Minutes
**Ref:** FR-NOTIF-01.3, BR-NOTIF-01
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User taps notification while logged out | App cold-starts; `pending_deep_link` stored with `stored_at = T` |
| 2 | User does not log in for 5 minutes + 1 second | `pending_deep_link` TTL exceeded |
| 3 | User logs in at T + 5m + 1s | `pending_deep_link` is checked: TTL expired → discarded |
| 4 | Post-login navigation | User lands on Home screen (not the notification target) |

---

### TC-NOTIF-005 — Deep Link: App Backgrounded (Session Valid)
**Ref:** FR-NOTIF-01.2
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | App is backgrounded; user is authenticated | Active session |
| 2 | Push notification received: order fill for VIC | |
| 3 | User taps notification | App resumes; navigates directly to Order Detail for that order |
| 4 | No login screen shown | Confirmed: no re-auth required |

---

### TC-NOTIF-006 — Deep Link: Target No Longer Available
**Ref:** FR-NOTIF-01 edge case
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User taps notification for an order (deep_link = "/orders/uuid-123") | App opens; pending_deep_link stored |
| 2 | During login, the order is cancelled/deleted | Order no longer exists |
| 3 | Post-login: app attempts navigation to "/orders/uuid-123" | Order not found; app navigates to Orders screen instead |
| 4 | Toast displayed | "This order is no longer available." |

---

### TC-NOTIF-007 — Push notification when notifications disabled (OS level) — inbox fallback
**Ref:** FR-28 Edge Case, SRD §2.6.2b
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has alerts enabled in app; OS-level push notifications are disabled | |
| 2 | Price crosses alert threshold | No OS push notification sent |
| 3 | User opens in-app notification inbox | Notification stored and visible in inbox |
| 4 | Alert status | INACTIVE (single-fire) |

---

## MODULE 8: SOCIAL TRADING

### TC-SOC-001 — Post creation with cashtag and sentiment
**Ref:** FR-SOC-03, BR-23
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On VIC Stock Detail, tap "Post"; write "$VIC looking bullish today"; select Bull sentiment | |
| 2 | Tap Submit | 60-second countdown shown; Cancel button visible |
| 3 | Wait 60 seconds | Post published; appears in VIC per-ticker feed (FR-SOC-02) |
| 4 | Tap Cancel within 60 seconds | Post discarded; not published |

---

### TC-SOC-002 — Post without cashtag or sentiment → blocked
**Ref:** FR-SOC-03, BR-23
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Write post body without any $TICKER cashtag | Submit button disabled; hint "Add at least one stock cashtag ($VIC)" |
| 2 | Add cashtag but no sentiment | Submit disabled; hint "Select a sentiment" |
| 3 | Add both | Submit enabled |

---

### TC-SOC-003 — Post Character Limit: 500 Characters Accepted
**Ref:** FR-SOC-03 AMENDMENT
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open post compose screen | Character counter shows "0 / 500" |
| 2 | Type exactly 500 characters | Counter shows "0 / 500" (0 remaining); submit button remains enabled |
| 3 | Submit | HTTP 201; post created |

---

### TC-SOC-003a — Post 501 Characters: Rejected
**Ref:** FR-SOC-03 AMENDMENT, E-SOC-301
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Type 500 characters | Submit enabled |
| 2 | Type 1 more character (501 total) | Counter turns red; submit button DISABLED by frontend |
| 3 | If bypassed via API: POST with 501-char body | HTTP 400; E-SOC-301; "Post must be 1–500 characters." |

---

### TC-SOC-003b — Post Previously Allowed 500 Chars Not Broken
**Ref:** FR-SOC-03 AMENDMENT (regression test)
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Post 280 characters | HTTP 201; accepted (regression: 280 was the old limit, must still work) |
| 2 | Verify DB | body VARCHAR(500); 280-char post stored without truncation |

---

### TC-SOC-004 — Follow/unfollow user
**Ref:** FR-SOC-04
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap Follow on user profile | Following = true; Following tab shows their posts |
| 2 | Attempt to follow self | HTTP 422; "You can't follow yourself." |
| 3 | Tap Unfollow | Following = false; their posts removed from Following tab |

---

### TC-SOC-005 — Social proof counter updates
**Ref:** FR-SOC-01, BR-06
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Stock card shows "120 users watching" | |
| 2 | Another user adds stock to watchlist | Counter updates to 121 within 5 minutes |

---

## MODULE 9: GAMIFICATION

### TC-GAME-001 — XP awarded for paper trade
**Ref:** FR-GAME-01, BR-PT-... (inherits from trade fill)
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Execute a paper trade (MARKET order fills) | +10 XP shown on profile |
| 2 | Execute 3 more trades | Total +40 XP; no cap per day on trade XP |
| 3 | Login again same day | Daily login XP (+5 XP) awarded only once |

---

### TC-GAME-002 — Streak freeze usage
**Ref:** FR-GAME-05
**Priority:** P2
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has 5-day streak; misses a lesson on day 6 | |
| 2 | Before midnight local time, activate Streak Freeze | Streak preserved at 5; freeze item consumed |
| 3 | Try to use Streak Freeze again same week (not yet Monday reset) | Freeze item not available (0 remaining) |

---

## MODULE 10: AI INSIGHTS

### TC-AI-001 — Post-trade AI card appears after fill
**Ref:** FR-AI-01
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Paper trade fills | AI card appears within 5 seconds as bottom sheet |
| 2 | Card shows 3 sections in user's language | "What happened", "Why", "What to watch" all present |
| 3 | Disclaimer visible at card bottom | Educational disclaimer appended per FR-LEGAL-02 |
| 4 | Thumbs down tap | Rating recorded; card remains visible |
| 5 | Dismiss card | Card dismissed; not re-shown on revisit of portfolio |

---

### TC-AI-002 — AI service unavailable: graceful fallback
**Ref:** FR-AI-01 Edge Case
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | AI service returns 5xx after trade fills | Card shows "Analysis temporarily unavailable. Check back later." |
| 2 | Disclaimer still shown despite unavailability | Disclaimer text visible even in fallback state |

---

### TC-AI-003 — AI response language matches active language setting
**Ref:** FR-AI-03, FR-LANG-01
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Language = Vietnamese; trade fills | AI card in Vietnamese; uses "Khớp lệnh" terminology |
| 2 | Change language to Korean mid-session; next trade fills | AI card in Korean; uses Korean financial terms |

---

## MODULE 11: LEGAL & DISCLAIMERS

### TC-LEGAL-001 — Investment disclaimer: first view per session
**Ref:** FR-LEGAL-01, BR-26
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | First open of Markets screen in a session | Disclaimer banner/modal shown; requires "Got it" tap |
| 2 | Navigate away; return to Markets screen | Disclaimer NOT shown again in same session |
| 3 | Log out and log back in | Disclaimer shown again on first Markets view |

---

### TC-LEGAL-002 — AI disclaimer: every response
**Ref:** FR-LEGAL-02, BR-21
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Query AI with "Why is VIC rising today?" | Disclaimer at bottom of every AI response; in active language |
| 2 | Switch language mid-session; new AI query | Disclaimer in new language |
| 3 | Attempt to dismiss or collapse disclaimer | Not possible; non-collapsible |

---

### TC-LEGAL-003 — Data consent checkboxes not pre-checked
**Ref:** FR-LEGAL-03, BR-22
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open data consent screen (first registration step) | All 3 checkboxes unchecked by default |
| 2 | Tap Continue with only checkbox 3 (marketing) checked | "Continue" disabled; "Please accept Terms of Service" shown |
| 3 | Check 1 and 2; leave 3 unchecked | Continue enabled; marketing_opt_in = false stored |

---

## MODULE 12: USER ACCOUNT & SETTINGS

### TC-ACCT-001 — Change password (email accounts)
**Ref:** FR-50
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter correct current password + valid new password | Password changed; all OTHER sessions invalidated (current session stays active) |
| 2 | Enter wrong current password | "Current password is incorrect" |
| 3 | Enter new password same as current | "New password must be different from current password" |

---

### TC-ACCT-002 — Change password hidden for social-only account
**Ref:** FR-50, BR-41, BR-SIGNUP-08
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Social-only (Google) user navigates to Profile | "Change Password" link NOT visible |
| 2 | Direct deep-link to change password screen | Routed to Profile with toast "This account uses Google — no password to change." |

---

### TC-ACCT-003 — Logout
**Ref:** FR-51
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Tap Logout; confirm dialog | JWT + refresh token invalidated; push token deregistered; Welcome screen shown |
| 2 | Open app without re-auth | Login screen shown |
| 3 | Logout with no network | Local session cleared; backend invalidation queued |

---

### TC-ACCT-004 — DOB Correction: Read-Only Field
**Ref:** FR-ACCT-DOB-01.1
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to Profile > Personal Information | DOB field visible |
| 2 | Verify DOB field is read-only | Cannot type in field; no edit icon/button |
| 3 | Verify helper text | "To update your date of birth, contact support." shown below DOB field |
| 4 | Tap helper text | Modal appears explaining the support process |

---

### TC-ACCT-005 — DOB Correction: Submit Support Request
**Ref:** FR-ACCT-DOB-01.2
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to DOB correction support form | Form shows fields: "Correct Date of Birth" (date picker) + "Reason" (textarea) |
| 2 | Enter: new DOB = 2005-03-10; reason = "I entered the wrong year during registration." | No validation errors |
| 3 | Tap Submit | HTTP 201; ticket ID shown: "CORR-XXXXXX"; message: "Your request has been submitted. We'll review and respond within 3 business days." |
| 4 | Check email | Confirmation email received within 60 seconds |
| 5 | Profile shows pending badge | "DOB correction: pending review" displayed in Profile |

---

### TC-ACCT-006 — DOB Correction: Duplicate Ticket Blocked
**Ref:** FR-ACCT-DOB-01.2, E-ACCT-401
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User has an open DOB correction ticket (PENDING status) | Ticket exists |
| 2 | User navigates to DOB correction form again | |
| 3 | Attempts to submit a second correction request | HTTP 409; E-ACCT-401; "You already have an open DOB correction request. Please wait for it to be resolved." |

---

### TC-ACCT-007 — DOB Correction: Same DOB Rejected
**Ref:** FR-ACCT-DOB-01.2, E-ACCT-402
**Priority:** P2
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | User's current DOB = 2000-05-15 | |
| 2 | Submit DOB correction request with new_dob = 2000-05-15 | HTTP 400; E-ACCT-402; "The submitted date matches your current date of birth." |

---

### TC-ACCT-008 — Account deletion flow
**Ref:** SRD §2.23
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Request deletion | 30-day cool-off; confirmation email sent |
| 2 | Cancel within 30 days | Deletion cancelled; account remains active |
| 3 | After 30 days: cron runs | PII anonymized; sessions deleted; push tokens deleted; status = DELETED |
| 4 | Attempt login post-deletion | Generic "account not found" error; no data revealed |

---

## MODULE 13: LANGUAGE SYSTEM

### TC-LANG-001 — Language auto-detect on first launch
**Ref:** FR-LANG-01
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Device OS language = Vietnamese; first app launch | App defaults to Vietnamese |
| 2 | Device OS language = Korean | App defaults to Korean |
| 3 | Device OS language = Japanese (unsupported) | App defaults to English |

---

### TC-LANG-002 — Language change applies immediately without restart
**Ref:** FR-LANG-01
**Priority:** P0
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | App language = English; change to Vietnamese in Settings | All UI text switches immediately; no logout required |
| 2 | Open AI query; ask question | Response in Vietnamese |

---

### TC-LANG-003 — Financial terminology localization
**Ref:** FR-LANG-02
**Priority:** P1
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Language = Vietnamese; open Stock Detail → Key Stats | "Chỉ số P/E" shown (not "P/E Ratio") |
| 2 | Language = Korean | "주가수익비율" shown |
| 3 | Language = English | "P/E Ratio" shown |

---

## MODULE 14: BROKERAGE PARTNER (V1.x)

### TC-BRK-001 — Brokerage CTA eligibility gate
**Ref:** FR-BRK-01, FR-BRK-02, BR-31
**Priority:** P1 (V1.x)
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | FULL_ACCESS user, Tier 2, 25 paper trades | No brokerage CTA anywhere in app |
| 2 | User reaches Tier 3 + 30 paper trades + 18+ | Brokerage CTA appears on Portfolio dashboard after 7 days at Tier 3 |
| 3 | LEARN_MODE user of any tier | No brokerage CTA ever rendered |

---

### TC-BRK-002 — Partner callback with disallowed field
**Ref:** FR-BRK-05, BR-34
**Priority:** P0 (V1.x)
**Status:** WRITTEN

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Partner sends callback with `real_balance = 10000000` in payload | `real_balance` field dropped; compliance-violation event logged; account linked status still updated if payload otherwise valid |
| 2 | Verify no `real_balance` column exists in any Paave DB table | Schema audit passes |

---

## COMPLETE COVERAGE SUMMARY

| Module | Total TCs | P0 | P1 | P2 | Status |
|--------|-----------|----|----|----|----|
| AUTH | 30 | 17 | 12 | 0 | READY |
| ONBOARDING | 8 | 2 | 5 | 0 | READY |
| AGE GATE | 3 | 2 | 1 | 0 | READY |
| HOME | 4 | 2 | 2 | 0 | READY |
| PAPER TRADING | 37 | 18 | 16 | 0 | READY |
| MARKETS | 6 | 2 | 3 | 0 | READY |
| NOTIFICATIONS | 7 | 4 | 3 | 0 | READY |
| SOCIAL | 8 | 4 | 3 | 0 | READY |
| GAMIFICATION | 2 | 0 | 1 | 1 | READY |
| AI | 3 | 2 | 1 | 0 | READY |
| LEGAL | 3 | 3 | 0 | 0 | READY |
| ACCOUNT | 9 | 3 | 4 | 1 | READY |
| LANGUAGE | 3 | 2 | 1 | 0 | READY |
| BROKERAGE | 2 | 1 | 1 | 0 | READY |
| **TOTAL** | **129** | **62** | **53** | **2** | **0 BLOCKED** |

**All previously BLOCKED test cases resolved. All test cases status = WRITTEN / READY.**
**Source of resolutions: FRD-gaps-v2.4.md**

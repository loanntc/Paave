# FRD — Gaps Addendum v2.4
## Paave — 12 QA Gap Resolutions

**Version:** 2.4
**Date:** 2026-04-20
**Author:** Business Analysis Team
**Status:** Pending PO Sign-Off
**Resolves:** QA-gap-report-v1.0.md (GAP-QA-01 through GAP-QA-12)
**Addendum to:** FRD.md v2.2, FRD-module-B-v2.3.md

---

## Overview

This document resolves all 12 gaps flagged by QA during first-pass test case creation. Each gap has a corresponding FR addition or existing FR amendment. This addendum is authoritative and supersedes contradictory language in prior document versions.

| Gap | Resolution | New/Amended FR |
|-----|-----------|----------------|
| GAP-QA-01 | Forgot Password flow | FR-AUTH-07 (new) |
| GAP-QA-02 | Multi-device session policy | FR-AUTH-09 (new) |
| GAP-QA-03 | Onboarding step count per path | FR-08 AMENDMENT |
| GAP-QA-04 | DOB timezone specification | FR-AGE-04 AMENDMENT |
| GAP-QA-05 | ATO/ATC no-match cancellation | FR-PT-07.1 AMENDMENT + E-PT-400 |
| GAP-QA-06 | QUEUED_AFTER_HOURS TTL | BR-PT-07 AMENDMENT |
| GAP-QA-07 | AI card in LEARN_MODE | FR-AI-01 AMENDMENT |
| GAP-QA-08 | Already-crossed price alert | FR-28 AMENDMENT + EC-ALT-01 |
| GAP-QA-09 | Deep link unauthenticated state | FR-NOTIF-01 (new) |
| GAP-QA-10 | Post character limit (500 authoritative) | FR-SOC-03 AMENDMENT |
| GAP-QA-11 | Biometric authentication | FR-AUTH-08 (new) |
| GAP-QA-12 | DOB correction process | FR-ACCT-DOB-01 (new) |

---

## SECTION A — NEW FUNCTIONAL REQUIREMENTS

---

### FR-AUTH-07: Forgot Password Flow
*Resolves GAP-QA-01*

**Feature Overview**

| Field | Value |
|-------|-------|
| Feature | Forgot Password |
| Primary Actor | Registered user (any status, email-registered) |
| Goal | Recover access to account when password is forgotten |
| Trigger | User taps "Forgot Password?" on login screen |

---

**FR-AUTH-07.1 — Request Password Reset**
- **Actor**: Registered user
- **Description**: User submits their email address to initiate a password reset. The system sends a one-time reset OTP to the email address.
- **Input**: `email` (string, RFC 5322 format, max 254 chars)
- **Output**:
  - If email exists (any status except DELETED): HTTP 200; reset OTP sent to email within 30 seconds; OTP TTL = 10 minutes; response body: `{ "message": "If this email is registered, a reset code has been sent." }`
  - If email not found or DELETED: HTTP 200; same response body (no enumeration — do not reveal whether email exists)
- **Precondition**: None (user does not need to be authenticated)
- **Postcondition**: A `password_reset_tokens` record is created with OTP (hashed), email, `expires_at = now + 10 minutes`, `used = false`. Any existing unused reset tokens for this email are invalidated.

**FR-AUTH-07.2 — Submit Reset OTP**
- **Actor**: Registered user
- **Description**: User enters the 6-digit OTP from their email to verify identity.
- **Input**: `email` (string), `otp` (6-digit string)
- **Output**:
  - Correct OTP, not expired, not used: HTTP 200; `{ "reset_session_token": "<uuid>", "expires_in": 300 }` (reset session valid 5 minutes)
  - Wrong OTP: HTTP 400; E-1010; "Incorrect code. X attempts remaining." (max 5 attempts; after 5, token invalidated)
  - Expired OTP: HTTP 400; E-1002; "Code expired. Please request a new code."
  - Already used: HTTP 400; E-1011; "This code has already been used."
- **Precondition**: Valid OTP was sent and not yet used/expired
- **Postcondition**: `reset_session_token` stored in Redis with TTL 300s. OTP attempt count incremented.

**FR-AUTH-07.3 — Set New Password**
- **Actor**: Registered user
- **Description**: User enters a new password using the reset session token.
- **Input**: `reset_session_token` (uuid), `new_password` (string)
- **Output**:
  - Success: HTTP 200; `{ "message": "Password updated. Please log in." }`; user redirected to login screen
  - Token expired/invalid: HTTP 401; E-1012; "Reset session expired. Please request a new code."
  - Same password as current: HTTP 400; E-1013; "New password must be different from your current password."
  - Password too weak: HTTP 400; E-1003; "Password must be at least 8 characters including uppercase, lowercase, and a number."
- **Precondition**: Valid `reset_session_token` exists in Redis (TTL not expired)
- **Postcondition**: Password updated (bcrypt/argon2id hash). `reset_session_token` invalidated immediately. All existing refresh tokens for this account revoked (force re-login on all devices).

**Acceptance Criteria — FR-AUTH-07**

```
Given a registered user who has forgotten their password
When they tap "Forgot Password?" on the login screen and enter their email
Then an OTP is sent to that email within 30 seconds
And the OTP is valid for 10 minutes
And the response does not reveal whether the email is registered

Given a user who enters the correct OTP within 10 minutes
When they submit the OTP
Then they receive a reset_session_token valid for 5 minutes

Given a user with a valid reset_session_token
When they submit a new password that meets the strength policy
Then their password is updated and all existing sessions are revoked

Given a user who enters the wrong OTP
When they have exhausted 5 attempts
Then the OTP is invalidated and they must request a new code
```

**Edge Cases — FR-AUTH-07**

| Case | Expected Behavior |
|------|-------------------|
| Email not in system | HTTP 200 with same success message (no enumeration) |
| User requests new OTP before first expires | Old token invalidated; new token issued |
| Password same as previous | HTTP 400; E-1013; must choose a different password |
| reset_session_token reused after success | HTTP 401; E-1012 |
| User registers via Google OAuth (no password) | HTTP 200 with same message; no email sent (no password exists to reset); log event for monitoring |
| PENDING_VERIFICATION account requests reset | Treat as valid; send OTP; allows recovery from partial registration |

**UI/UX Notes — FR-AUTH-07**
- "Forgot Password?" appears as a tappable text link below the password field on the login screen
- OTP input screen identical to registration OTP screen; include "Resend code" option after 60-second cooldown
- Success state: navigate to login screen with banner "Password updated. Please sign in."
- New password field: show/hide toggle; inline strength meter

---

### FR-AUTH-08: Biometric Authentication
*Resolves GAP-QA-11*

**Feature Overview**

| Field | Value |
|-------|-------|
| Feature | Biometric Authentication (Face ID / Touch ID / Fingerprint) |
| Primary Actor | Registered user on a biometric-capable device |
| Goal | Log in quickly using device biometric instead of password |
| Trigger | User completes onboarding; biometric prompt shown |

---

**FR-AUTH-08.1 — Biometric Enrollment (Onboarding)**
- **Actor**: Registered user (post-onboarding, first login)
- **Description**: After completing onboarding, the system detects if the device supports biometrics and offers optional enrollment.
- **Input**: User confirms enrollment (or skips)
- **Output**:
  - Device supports biometrics + user confirms: Biometric enrollment recorded; encrypted refresh token stored in device Keychain/Keystore; next app launch offers biometric login
  - Device does not support biometrics: Screen skipped silently; no error; enrollment option not shown again
  - User taps "Skip": Dismissed; enrollment_status = SKIPPED; user can enable later in Settings > Security
- **Precondition**: User has completed onboarding; session is authenticated; device supports biometric API
- **Postcondition**: `biometric_enabled` flag set in local encrypted storage. Encrypted refresh token stored in device OS secure enclave (Keychain on iOS, Keystore on Android). No biometric data transmitted to or stored on server.

**FR-AUTH-08.2 — Biometric Login**
- **Actor**: Returning user with biometric enrolled
- **Description**: On app launch (locked state), user is prompted to authenticate with biometric instead of entering password.
- **Input**: Successful biometric scan OR user cancels
- **Output**:
  - Biometric success: Encrypted refresh token retrieved from Keychain/Keystore; new access JWT fetched from server; user logged in; navigates to Home
  - Biometric cancelled: Password login form displayed
  - Biometric not recognized (hardware fail): Attempt count incremented. After 3 failures: biometric prompt dismissed; password login form displayed with message "Biometric authentication failed. Please enter your password."
  - Server token exchange fails (refresh token expired/revoked): Biometric prompt cleared; password login form shown; `biometric_enabled` flag cleared (re-enrollment required after next password login)
- **Precondition**: `biometric_enabled = true` in local storage; device locked (session expired locally)
- **Postcondition**: On success: valid access JWT + refresh token in memory. On failure after 3 attempts: fallback to password.

**FR-AUTH-08.3 — Biometric Re-enrollment**
- **Actor**: Registered user whose biometrics have changed (e.g., added new fingerprint)
- **Description**: If device OS detects biometric enrollment has changed since the app stored its key, the secure enclave key is invalidated. The app detects this on next biometric attempt.
- **Input**: Biometric attempt fails due to enrollment change
- **Output**: System detects `KeyPermanentlyInvalidatedException` (Android) or `LAError.biometryNotEnrolled` (iOS); clears `biometric_enabled` flag; shows: "Your biometric settings changed. Please sign in with your password to re-enable biometric login."
- **Precondition**: User's device biometric enrollment has changed since key was stored
- **Postcondition**: After successful password login, system prompts biometric re-enrollment (same as FR-AUTH-08.1 step)

**Acceptance Criteria — FR-AUTH-08**

```
Given a device that supports Face ID / fingerprint
When the user completes onboarding
Then a biometric enrollment prompt is shown (skippable)

Given a user who enrolls biometrics
When they next open the app in a locked state
Then they are prompted for biometric authentication, not password

Given a user who fails biometric 3 times
When the third attempt fails
Then the biometric prompt is dismissed and password login is presented

Given a user who opts out of biometric during onboarding
When they navigate to Settings > Security
Then they can enable biometric authentication from there

Given a user whose device biometric enrollment changed
When they attempt biometric login
Then the app clears biometric config and requires password re-entry and re-enrollment
```

**Edge Cases — FR-AUTH-08**

| Case | Expected Behavior |
|------|-------------------|
| Device has no biometric hardware | Enrollment screen skipped; setting not shown |
| OS biometric permission denied at app level | Enrollment screen skipped; user directed to OS Settings to grant permission |
| Refresh token revoked server-side (after password change) | Biometric fails silently; prompts password login; clears biometric enrollment |
| User enrolls then uninstalls/reinstalls | Keychain/Keystore cleared by OS; biometric_enabled = false after reinstall; must re-enroll |
| Multiple users on same device | Each user has independent biometric enrollment stored under their account key |

**UI/UX Notes — FR-AUTH-08**
- Enrollment screen: illustration of Face ID/fingerprint icon; headline "Log in faster with Face ID"; CTA "Enable Face ID"; secondary "Skip"
- Biometric login prompt: system-native biometric dialog (iOS LAContext, Android BiometricPrompt)
- Settings > Security: toggle "Face ID / Fingerprint login"; tapping toggle when OFF shows enrollment flow; tapping when ON shows confirmation "Disable biometric login?"

---

### FR-AUTH-09: Multi-Device Session Policy
*Resolves GAP-QA-02*

**Feature Overview**

| Field | Value |
|-------|-------|
| Feature | Multi-Device Session Management |
| Primary Actor | Registered user |
| Goal | Maintain sessions across multiple devices; view and revoke active sessions |
| Trigger | Login from a new device; user accesses Settings > Security > Active Sessions |

---

**FR-AUTH-09.1 — Concurrent Session Allowance**
- **Actor**: Registered user
- **Description**: A user may be logged in on up to 5 devices simultaneously. Each device holds its own independent refresh token. Sessions are fully independent — activity on one device does not invalidate another.
- **Input**: Login attempt on device N+1 when N sessions already active
- **Output**:
  - N < 5: Login succeeds; new session created
  - N = 5: Login succeeds; the oldest inactive session (by `last_active_at`) is automatically revoked; new session created; push notification sent to the revoked device: "You were signed out because your account reached the maximum device limit."
- **Precondition**: User has valid credentials
- **Postcondition**: User is logged in; `user_sessions` table updated with new `device_id`, `device_name`, `device_os`, `created_at`, `last_active_at`

**FR-AUTH-09.2 — View Active Sessions**
- **Actor**: Registered user
- **Description**: User can view all active sessions in Settings > Security > Active Sessions.
- **Input**: Navigation to Active Sessions screen
- **Output**: List of sessions showing: device name (e.g., "iPhone 15 Pro"), OS, approximate location (city from IP geolocation), `last_active_at` relative time (e.g., "2 hours ago"), "This device" label on current session
- **Precondition**: User is authenticated
- **Postcondition**: Read-only; no state change

**FR-AUTH-09.3 — Remote Session Revocation**
- **Actor**: Registered user
- **Description**: User can sign out any individual device session remotely.
- **Input**: Tap "Sign out" on a session entry (not the current device)
- **Output**: HTTP 200; session revoked; refresh token invalidated on server; push notification sent to target device: "You were signed out of Paave on [device name]. If this wasn't you, change your password immediately."
- **Precondition**: Session exists and belongs to the requesting user
- **Postcondition**: Target device's refresh token is blacklisted; on next API call from that device, server returns HTTP 401

**Acceptance Criteria — FR-AUTH-09**

```
Given a user logged in on 4 devices
When they log in on a 5th device
Then all 5 sessions exist and are independent

Given a user logged in on 5 devices
When they log in on a 6th device
Then the oldest inactive session is revoked and a notification sent to that device

Given a user viewing Active Sessions
When the list is shown
Then it displays device name, OS, relative last-active time, and "This device" for current

Given a user revoking a remote session
When they tap "Sign out" on another device's entry
Then that device's refresh token is invalidated and a warning notification is sent
```

**Edge Cases — FR-AUTH-09**

| Case | Expected Behavior |
|------|-------------------|
| User logs out current device | Current session removed from list; redirected to login |
| Two devices active at exactly the same time when limit is reached | Tie-breaking by `created_at` (oldest created is revoked) |
| Push notification fails to reach revoked device | Session still revoked; notification failure logged; no retry |
| IP geolocation fails | Location shown as "Unknown location" |
| User has only 1 session | "This device" shown with no "Sign out" option (cannot revoke own current session from sessions list; use the main Logout instead) |

**UI/UX Notes — FR-AUTH-09**
- Settings > Security > Active Sessions: each row shows device icon (iOS/Android), name, last active, location
- "Sign out all other devices" action at bottom of list (single tap to revoke all except current)
- "This device" row is visually distinguished (e.g., checkmark badge)

---

### FR-NOTIF-01: Deep Link Routing for Push Notifications
*Resolves GAP-QA-09*

**Feature Overview**

| Field | Value |
|-------|-------|
| Feature | Push Notification Deep Link Routing |
| Primary Actor | Registered user (any state: foreground, background, killed, logged out) |
| Goal | Tapping a push notification navigates to the correct in-app screen regardless of app state |
| Trigger | User taps any push notification |

---

**FR-NOTIF-01.1 — Deep Link Handling: App Active (Foreground)**
- **Actor**: Registered user
- **Description**: When the app is in foreground and user taps a notification banner, the app navigates directly to the target screen.
- **Input**: Push notification tap event; `deep_link` payload field (e.g., `/stocks/VIC`, `/orders/uuid`, `/alerts/uuid`)
- **Output**: App navigates to target screen immediately; notification marked as read
- **Precondition**: App is active; user is authenticated
- **Postcondition**: Target screen displayed; notification cleared from inbox if applicable

**FR-NOTIF-01.2 — Deep Link Handling: App Backgrounded**
- **Actor**: Registered user
- **Description**: When app is backgrounded, tapping notification brings app to foreground and navigates to target.
- **Input**: Push notification tap; `deep_link` payload field
- **Output**: App resumes; navigates to target screen; existing session maintained
- **Precondition**: App is in background; session still valid
- **Postcondition**: Target screen displayed

**FR-NOTIF-01.3 — Deep Link Handling: App Killed / User Unauthenticated (Cold Start)**
- **Actor**: Registered user (no active session) or any user (app killed)
- **Description**: When the app is killed or the user is logged out, tapping a notification cold-starts the app. The deep link target is preserved and applied after authentication.
- **Input**: Push notification tap; app cold start; `deep_link` payload field
- **Output**:
  1. App launches to Login screen (not the deep link target — authentication required first)
  2. `pending_deep_link` stored in local device storage: `{ "target": "/stocks/VIC", "notification_id": "uuid", "stored_at": ISO8601 }`
  3. After successful authentication (login or biometric): `pending_deep_link` retrieved; app navigates to target screen
  4. If no authentication within 5 minutes of storing the link: `pending_deep_link` cleared; user lands on Home after eventual login
- **Precondition**: App is killed or user is not authenticated; valid push notification payload received from OS
- **Postcondition**: After auth: target screen displayed; `pending_deep_link` cleared from local storage

**FR-NOTIF-01.4 — Deep Link Handling: Session Expired (Token Invalid)**
- **Actor**: User whose JWT has expired but who was previously authenticated
- **Description**: App is in background but access token has expired. Biometric or password re-auth prompt shown; deep link preserved.
- **Input**: Push notification tap; expired access token
- **Output**: Auth refresh attempted silently using refresh token. If refresh succeeds: navigate directly to target. If refresh fails (refresh token also expired): show login screen; apply pending_deep_link pattern from FR-NOTIF-01.3
- **Precondition**: App backgrounded; access token expired
- **Postcondition**: Authenticated; target screen displayed

**Acceptance Criteria — FR-NOTIF-01**

```
Given the app is active in foreground
When user taps a price alert notification
Then app navigates immediately to that stock's detail screen

Given the app is killed and user is logged out
When user taps an order fill notification
Then app shows the Login screen first
And after successful login, navigates to the order detail screen
And the pending_deep_link is cleared after navigation

Given a pending_deep_link stored for > 5 minutes
When the user eventually logs in
Then the pending_deep_link is ignored and user lands on Home

Given the app is backgrounded with an expired access token
When user taps a notification
Then the app attempts silent refresh
And if successful, navigates to target without showing login
```

**Edge Cases — FR-NOTIF-01**

| Case | Expected Behavior |
|------|-------------------|
| Target screen no longer exists (e.g., order was cancelled) | Navigate to Orders screen; show toast "This order is no longer available" |
| Target stock delisted | Navigate to Markets screen; show toast "This stock is no longer available" |
| Two notifications tapped in quick succession | Most recent `pending_deep_link` wins; earlier link discarded |
| Notification with no `deep_link` field | App opens to Home; no navigation |
| OS does not deliver the `deep_link` payload (notification truncated) | App opens to Home; no crash |

**UI/UX Notes — FR-NOTIF-01**
- No UX change needed for foreground/background cases — these behave exactly as normal navigation
- Cold start case: Login screen loads normally; user experiences normal login; the deep link navigation happens post-auth (within 1 navigation event, no visible "redirecting" state)

---

### FR-ACCT-DOB-01: DOB Correction via Support Request
*Resolves GAP-QA-12*

**Feature Overview**

| Field | Value |
|-------|-------|
| Feature | Date of Birth Correction |
| Primary Actor | Registered user who needs to correct their registered DOB |
| Goal | Correct a DOB entered incorrectly during registration |
| Trigger | User taps "Update Date of Birth" in Profile > Personal Information |

---

**FR-ACCT-DOB-01.1 — DOB Locked After First Entry**
- **Actor**: Registered user
- **Description**: A user's DOB is locked after account creation and cannot be changed via self-service. The DOB field in Profile is read-only after first set.
- **Input**: User views Profile > Personal Information
- **Output**: DOB field displayed as read-only text; helper text: "To update your date of birth, contact support."
- **Precondition**: Account is ACTIVE; DOB has been set
- **Postcondition**: No state change (read-only display)

**FR-ACCT-DOB-01.2 — DOB Correction Request Submission**
- **Actor**: Registered user
- **Description**: User can submit a DOB correction request via the in-app support system. The request is manually reviewed before any change is applied.
- **Input**: 
  - `correct_dob` (date, YYYY-MM-DD format)
  - `reason` (freetext, max 500 chars, required)
- **Output**: HTTP 201; support ticket created; response: `{ "ticket_id": "CORR-XXXXXX", "message": "Your request has been submitted. We'll review and respond within 3 business days." }`; email confirmation sent to registered email
- **Precondition**: User is authenticated; no open DOB correction ticket for this user (only one at a time)
- **Postcondition**: Support ticket stored in `support_tickets` table with type = `DOB_CORRECTION`; `correct_dob_requested` and `reason` stored; assigned to support queue

**FR-ACCT-DOB-01.3 — DOB Correction Approval (Admin Action)**
- **Actor**: Paave support agent (admin panel — out of scope for user FRD; defined in internal admin spec)
- **Description**: Support agent reviews the DOB correction request. If approved, DOB is updated and user's `feature_tier` is re-evaluated.
- **Input**: Admin approval action; `new_dob` (date)
- **Output**: DOB updated; `feature_tier` re-evaluated using new DOB and UTC+7 age boundary rule; push notification to user: "Your date of birth has been updated. Please review your profile."; email confirmation sent
- **Precondition**: Ticket in PENDING status; admin has SUPPORT_AGENT role
- **Postcondition**: `users.dob` updated; `users.feature_tier` recalculated; ticket status = RESOLVED

**Acceptance Criteria — FR-ACCT-DOB-01**

```
Given a registered user
When they view Profile > Personal Information
Then the DOB field is read-only with a "contact support" helper text

Given a user who submits a DOB correction request with a valid new DOB and reason
When the request is submitted
Then a ticket is created and email confirmation sent within 60 seconds

Given a user with an existing open DOB correction ticket
When they attempt to submit another correction request
Then HTTP 409; "You already have an open DOB correction request. Please wait for resolution."

Given an approved DOB correction
When the admin approves
Then the user's DOB is updated, feature_tier is recalculated, and user is notified
```

**Edge Cases — FR-ACCT-DOB-01**

| Case | Expected Behavior |
|------|-------------------|
| Requested new DOB would result in age < 13 | Admin blocks approval; ticket resolved as REJECTED; user notified |
| User submits DOB correction with same DOB as current | HTTP 400; "The submitted date matches your current date of birth." |
| Admin rejects request | Ticket status = REJECTED; user notified with reason (e.g., "Insufficient information provided") |
| DOB change would downgrade user from FULL_ACCESS to LEARN_MODE | Supported — feature_tier is re-evaluated; downgrade applied; any pending orders unaffected but new orders subject to LEARN_MODE rules |

**UI/UX Notes — FR-ACCT-DOB-01**
- Profile screen: DOB row has lock icon; tapping opens modal explaining the support process
- In-app support form: titled "Update Date of Birth"; two fields (Correct DOB + Reason); submit CTA
- Ticket status visible in Profile: "DOB correction: pending review" badge

---

## SECTION B — AMENDMENTS TO EXISTING FUNCTIONAL REQUIREMENTS

---

### FR-08 AMENDMENT — Onboarding Step Count Per Path
*Resolves GAP-QA-03*

**Replaces:** FR-08 step count specification in FRD.md v2.2

**Correction:**

FR-08 previously stated "Step X of 6" for all onboarding paths. This is incorrect. The progress bar must reflect the actual step count per registration path:

| Registration Path | Total Steps | Step Sequence |
|-------------------|-------------|---------------|
| **Email / Password** | **5 steps** | 1: Data Consent → 2: Account Details + DOB → 3: OTP Verification → 4: Industrial Preferences → 5: Investment Goal |
| **Social OAuth** (Google/Apple/Zalo) | **6 steps** | 1: Method Selection → 2: OAuth Handshake (external) → 3: Display Name + DOB → 4: Industrial Preferences → 5: Investment Goal → 6: Data Consent |

**Implementation rules:**
- The progress bar component receives `total_steps` and `current_step` props dynamically set by the registration flow
- OAuth Handshake (Step 2 in social path) does not show a progress bar — it is a full-screen external web view; progress bar resumes on return
- Step count is displayed as "Step X of Y" where Y = `total_steps` for the active path
- `total_steps` is determined at registration path selection and does not change during the flow

**Acceptance Criteria (amended):**

```
Given a user on the email registration path
When they are on the OTP verification screen
Then the progress bar shows "Step 3 of 5"

Given a user on the Google OAuth path
When they are on the Investment Goal screen
Then the progress bar shows "Step 5 of 6"

Given any user mid-onboarding
When they view the progress bar
Then the step count never exceeds the total for their path
```

---

### FR-AGE-04 AMENDMENT — DOB Age Boundary Timezone
*Resolves GAP-QA-04*

**Replaces:** SRD §2.3.3c age boundary calculation (timezone was unspecified)

**Specification:**

- DOB is stored as a **date-only value** (no time, no timezone component): `YYYY-MM-DD`
- Age boundary calculation uses **Vietnam Standard Time (UTC+7)** exclusively
- At login, the server calculates: `age = today_date_in_UTC7 - dob`
- `today_date_in_UTC7 = UTC_now + 7 hours, then take the date component only`
- If `today_date_in_UTC7 >= dob + 18 years`: user is 18+ → eligible for FULL_ACCESS
- If `today_date_in_UTC7 >= dob + 16 years AND < dob + 18 years`: LEARN_MODE
- If `today_date_in_UTC7 < dob + 13 years`: blocked

**Rationale:** Paave's primary market is Vietnam (UTC+7). Using UTC+7 as the age reference is most consistent for Vietnamese users. For KR/Global users, this means their tier may change up to 7 hours after their birthday in their local timezone — acceptable as paper trading has no real financial risk.

**Acceptance Criteria (amended):**

```
Given a user born 2008-01-15
When the server time is 2026-01-14T20:00:00Z (= 2026-01-15T03:00:00 UTC+7)
Then the age boundary check evaluates today_UTC7 = 2026-01-15
And the user is considered 18 years old → FULL_ACCESS granted

Given a user born 2008-01-15
When the server time is 2026-01-14T16:00:00Z (= 2026-01-14T23:00:00 UTC+7)
Then today_UTC7 = 2026-01-14
And the user is still 17 → LEARN_MODE maintained
```

---

### FR-PT-07.1 AMENDMENT — ATO/ATC No-Match Cancellation
*Resolves GAP-QA-05*

**Addition to** FRD-module-B-v2.3.md FR-PT-07.1

**New Failed Case FC-PT-25:**

| FC-ID | Case | Trigger | System Behavior |
|-------|------|---------|-----------------|
| FC-PT-25 | ATO/ATC order not filled — no matching price at session close | No counterparty at opening (ATO) or closing (ATC) price computation | Order status → CANCELLED; cancel_reason = ATO_ATC_NO_MATCH; reserved funds released; soft lock released; push notification sent |

**New Error Code:**

| Code | HTTP | Trigger | User-Facing Message |
|------|------|---------|---------------------|
| E-PT-400 | N/A (async event) | ATO/ATC order cancelled because no matching price was computed at session open/close | "Your [ATO/ATC] order for [quantity] [ticker] could not be filled — no matching price was available at the [opening/closing] auction. Your funds have been released." |

**ATO/ATC No-Match Flow:**
1. ATO/ATC fill evaluation runs at 09:15 (ATO) or 14:45 (ATC)
2. If opening/closing price is NOT computable (no counterparty): system transitions order to CANCELLED
3. `cancel_reason = ATO_ATC_NO_MATCH`
4. Reserved funds (`order_reserves`) deleted; `virtual_portfolio.available_balance` restored
5. Holdings soft lock (`holdings_soft_lock`) deleted if SELL order
6. Push notification dispatched (see message above)
7. Order appears in history as CANCELLED with reason "No matching price at auction"

**Acceptance Criteria (ATO/ATC no-match):**

```
Given an ATO BUY order for 100 VIC is PENDING at 09:14
When the opening auction at 09:15 finds no matching counterparty
Then the order status becomes CANCELLED
And cancel_reason = ATO_ATC_NO_MATCH
And the reserved funds are released back to available_balance
And a push notification is sent with E-PT-400 message
And the order appears in history as "Cancelled — no matching price at auction"
```

---

### BR-PT-07 AMENDMENT — QUEUED_AFTER_HOURS TTL
*Resolves GAP-QA-06*

**Addition to** BRD-addendum-v2.3.md BR-PT-07

**Amended rule:**

> **BR-PT-07 (amended):** VN MARKET orders are rejected when market status = CLOSED. KR/Global market orders received outside simulated session hours are accepted and queued as QUEUED_AFTER_HOURS. QUEUED_AFTER_HOURS orders auto-cancel after **48 hours from submission timestamp** if not yet evaluated. On auto-cancel: status = CANCELLED; cancel_reason = QUEUE_TTL_EXPIRED; reserved funds released; push notification sent: "Your order for [quantity] [ticker] has been cancelled because it was not evaluated within 48 hours."

**SRD Expiry Cron addition** (to SRD-order-engine §2.4):

The existing expiry cron (runs every hour, processes LIMIT order expirations) must be extended to also process QUEUED_AFTER_HOURS TTL expiry:

```
Additional cron logic:
SELECT * FROM virtual_orders
  WHERE status = 'QUEUED_AFTER_HOURS'
  AND created_at < NOW() - INTERVAL '48 hours';

For each matched order:
  BEGIN TRANSACTION;
  UPDATE virtual_orders SET status = 'CANCELLED', cancel_reason = 'QUEUE_TTL_EXPIRED', updated_at = NOW();
  DELETE FROM order_reserves WHERE order_id = order.id;  -- if BUY
  DELETE FROM holdings_soft_lock WHERE order_id = order.id;  -- if SELL
  dispatch_push_notification(user_id, 'QUEUE_TTL_EXPIRED', order);
  COMMIT;
```

**Acceptance Criteria:**

```
Given a KR/Global MARKET BUY order submitted at T=0 with status QUEUED_AFTER_HOURS
When T = T+48h and the order has not been evaluated
Then the expiry cron transitions it to CANCELLED with cancel_reason = QUEUE_TTL_EXPIRED
And reserved funds are released
And a push notification is sent
```

---

### FR-AI-01 AMENDMENT — AI Post-Trade Card for LEARN_MODE Users
*Resolves GAP-QA-07*

**Addition to** FRD.md FR-AI-01

**Scope Clarification:**

The AI post-trade insight card (FR-AI-01) is available to **all registered users** including LEARN_MODE users (age 16–17). LEARN_MODE does not gate the AI card.

**Content Variant by Feature Tier:**

| Tier | AI Card Content Focus | P&L Language |
|------|----------------------|--------------|
| FULL_ACCESS | Balanced: order type explanation + P&L performance framing | "You gained X VND (+Y%)" allowed |
| LEARN_MODE | Educational only: order type mechanics, market rule being simulated | No gain/loss language. Use: "This LIMIT order was filled at your target price of X VND. In a real exchange, this means..." |

**Implementation rule:** AI prompt to Claude API must include `feature_tier` context. When `feature_tier = LEARN_MODE`, the system prompt instructs the model to avoid monetary P&L framing and focus on the educational dimension of the trade outcome.

**Acceptance Criteria (amended):**

```
Given a LEARN_MODE user who places a LIMIT BUY order that fills
When the post-trade AI card is rendered
Then the card is shown (not hidden)
And the card uses educational framing (explains what a limit order is, why it filled)
And the card does NOT display "You gained X VND" or percentage P&L

Given a FULL_ACCESS user who places the same order
When the post-trade AI card is rendered
Then the card shows P&L framing along with educational context
```

---

### FR-28 AMENDMENT — Price Alert: Already-Crossed Price Behavior
*Resolves GAP-QA-08*

**Addition to** FRD.md FR-28 as new edge case EC-ALT-01

**New Edge Case:**

**EC-ALT-01 — Alert Set for Already-Satisfied Price**

| Field | Value |
|-------|-------|
| Scenario | User creates a price alert (e.g., "Notify me when VIC is above 55,000") when current market price is already above the threshold (e.g., VIC = 56,500) |
| Expected Behavior | Alert is accepted and created. The alert triggers on the **next price evaluation** (within ≤15s of creation). Alert is not deferred to the next crossing event. |
| Rationale | For an F0 investor, "above 55,000" means "I want to know when it's at this level" — not "I want to know when it next crosses." Triggering immediately is intuitive. |
| User Message | Push notification: "VIC is above your alert price of 55,000 VND — current price: 56,500 VND." |
| Post-condition | Alert transitions to TRIGGERED status; standard re-arm behavior applies (if alert is single-fire, it is consumed; if recurring, it remains active for next crossing) |

**Alert Mode Specification (new — was not defined):**

| Alert Mode | Behavior |
|------------|----------|
| `SINGLE_FIRE` (default) | Alert triggers once; transitions to TRIGGERED; must be re-created to alert again |
| `RECURRING` (user-selectable toggle) | Alert stays active after triggering; fires each time the condition is satisfied on a price evaluation |

**Acceptance Criteria (amended):**

```
Given a user sets an alert "VIC above 55,000" when VIC = 56,500
When the next price evaluation runs (within 15s)
Then the alert triggers immediately
And the push notification is sent with the current price

Given the same alert is SINGLE_FIRE mode
When it triggers
Then alert status = TRIGGERED and no further notifications are sent for this alert

Given the alert is RECURRING mode
When it triggers
Then the alert remains ACTIVE and will trigger again on the next evaluation that satisfies the condition
```

---

### FR-SOC-03 AMENDMENT — Post Character Limit (Authoritative: 500)
*Resolves GAP-QA-10*

**Replaces:** FR-SOC-03 character limit in FRD.md v2.2 and SRD §4.10 validation table

**Authoritative value: 500 characters**

| Document | Section | Previous Value | Corrected Value |
|----------|---------|----------------|-----------------|
| FRD.md v2.2 | FR-SOC-03 | 280 characters | **500 characters** |
| SRD.md v2.0 | §4.10 validation table | 1–500 characters | **1–500 characters** ✓ (SRD was correct) |

**Rationale:** 280 characters was based on Twitter's character limit, which is not applicable to Paave's educational trading commentary format. Users need room to explain their trade rationale, reference market analysis, and tag stocks. 500 characters is appropriate. The SRD §4.10 value (500) was already correct — the FRD was wrong.

**Updated FR-SOC-03 rule:**
- Post body: minimum 1 character, maximum 500 characters
- Frontend character counter shows remaining characters (e.g., "423 / 500")
- Validation error at submission if body is empty or exceeds 500 characters: "Post must be 1–500 characters."
- Database column `body VARCHAR(500)` — no schema change required (SRD was already correct)

**Acceptance Criteria (amended):**

```
Given a user composing a post of 500 characters exactly
When they tap Submit
Then the post is accepted (HTTP 201)

Given a user composing a post of 501 characters
When they tap Submit
Then the submit button is disabled by frontend validation
And if somehow bypassed: HTTP 400; E-SOC-301; "Post must be 1–500 characters."

Given a user viewing the compose screen
When they type
Then a character counter shows remaining characters (e.g., "432 / 500")
And the counter turns red when ≤ 20 characters remaining
```

---

## SECTION C — NEW BUSINESS RULES

| Rule ID | Rule | Violation Behavior | Resolves |
|---------|------|--------------------|---------|
| BR-AUTH-05 | Password reset OTP expires after 10 minutes. After 5 incorrect OTP attempts, the token is invalidated and user must request a new one. | HTTP 400; E-1002 (expired) or E-1010 (wrong attempt N); E-1014 (max attempts exceeded) | GAP-QA-01 |
| BR-AUTH-06 | Password reset invalidates ALL existing refresh tokens for the account (all devices are signed out). | Enforced server-side on password update | GAP-QA-01 |
| BR-AUTH-07 | Biometric data is never transmitted to or stored on Paave servers. Only a pointer to the device's secure enclave key is stored locally. | Biometric enrollment must fail if device Keychain/Keystore is unavailable | GAP-QA-11 |
| BR-AUTH-08 | Maximum 5 concurrent active sessions per user. When a 6th login occurs, the oldest inactive session is auto-revoked. | Oldest session revoked; push notification sent to revoked device | GAP-QA-02 |
| BR-AUTH-09 | After 3 consecutive biometric authentication failures, the biometric prompt is dismissed and password entry is required for that session. Biometric remains enrolled (not deleted by Paave). | Biometric prompt dismissed; password screen shown | GAP-QA-11 |
| BR-AGE-05 | Age boundary is calculated using Vietnam Standard Time (UTC+7). DOB is stored as date-only. Comparison: `today_date_in_UTC7 >= dob + N_years`. | Feature tier not granted early based on UTC difference | GAP-QA-04 |
| BR-SOC-03 | Social post body: minimum 1 character, maximum 500 characters. Authoritative value = 500. FRD v2.2 value of 280 is superseded by this rule. | HTTP 400; E-SOC-301 | GAP-QA-10 |
| BR-PT-16 | QUEUED_AFTER_HOURS orders that are not evaluated within 48 hours of submission are auto-cancelled by the Expiry Cron. cancel_reason = QUEUE_TTL_EXPIRED. | Auto-cancelled; funds released; push sent | GAP-QA-06 |
| BR-NOTIF-01 | A `pending_deep_link` stored at cold-start is valid for 5 minutes only. If the user does not complete authentication within 5 minutes, the link is discarded and the user lands on Home post-login. | Link discarded silently | GAP-QA-09 |
| BR-ACCT-DOB-01 | DOB is locked after account creation. Self-service changes are not permitted. Changes require a support ticket (type = DOB_CORRECTION) reviewed manually within 3 business days. Only one open DOB correction ticket is allowed per user at a time. | HTTP 409 if duplicate open ticket exists | GAP-QA-12 |

---

## SECTION D — ERROR CODE ADDITIONS

| Code | HTTP | Description | User-Facing Message |
|------|------|-------------|---------------------|
| E-1010 | 400 | Wrong password reset OTP (attempt N of 5) | "Incorrect code. X attempts remaining." |
| E-1011 | 400 | Password reset OTP already used | "This code has already been used. Please request a new one." |
| E-1012 | 401 | Reset session token expired or invalid | "Reset session expired. Please request a new code." |
| E-1013 | 400 | New password same as current password | "New password must be different from your current password." |
| E-1014 | 400 | Max OTP attempts exceeded | "Too many incorrect attempts. Please request a new code." |
| E-PT-400 | N/A (async) | ATO/ATC order cancelled — no matching price at auction | "Your [ATO/ATC] order for [qty] [ticker] could not be filled — no matching price was available at the [opening/closing] auction. Your funds have been released." |
| E-SOC-301 | 400 | Social post body exceeds 500 characters or is empty | "Post must be 1–500 characters." |
| E-ACCT-401 | 409 | Duplicate open DOB correction ticket | "You already have an open DOB correction request. Please wait for it to be resolved." |
| E-ACCT-402 | 400 | DOB correction request same as current DOB | "The submitted date matches your current date of birth." |

---

## SECTION E — SELF-VALIDATION CHECKLIST

| Checklist Item | Status | Notes |
|----------------|--------|-------|
| Can a developer build each FR without asking questions? | ✅ PASS | All new FRs have input/output/precondition/postcondition/error codes defined |
| Can QA write test cases directly from this document? | ✅ PASS | Given/When/Then for every FR; edge cases enumerated |
| Are all business rules isolated and numbered (BR-xx)? | ✅ PASS | BR-AUTH-05 to BR-ACCT-DOB-01 in Section C |
| Are all edge cases listed with explicit system behavior? | ✅ PASS | Each FR has edge case table |
| Are all limits defined (size, count, format, time)? | ✅ PASS | OTP TTL 10m, reset session 5m, max devices 5, QUEUED TTL 48h, post 500 chars, pending_deep_link 5m |
| Are all error states defined with codes and messages? | ✅ PASS | E-1010 to E-ACCT-402 in Section D |
| Does every requirement trace back to a business objective? | ✅ PASS | FR-AUTH-07/08 → BO-01 (user retention); FR-NOTIF-01 → BO-09 (engagement); FR-SOC-03 amendment → BO-11 (community) |
| Are there any vague words remaining? | ✅ PASS | All limits are numeric; no "fast", "easy", "TBD" |

**Self-validation result: ALL PASS. Document is ready for PO sign-off and QA test case completion.**

---

*End of FRD-gaps-v2.4.md.*
*Document resolves all 12 QA gaps. The 14 BLOCKED test cases in QA-test-cases-v1.0.md can now be written using this document as source.*
*Next step: update REVIEW-self-and-po-v2.3.md to v2.4 reflecting these additions.*

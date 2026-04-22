# FRD-08: User Account

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

## Module Description

The User Account module covers: Profile screen display, profile editing, linked OAuth provider management, password change, logout, notification settings, help & support, multi-device session management, and DOB correction via support request. This document is self-contained; a developer reading only this file has everything needed to build the User Account section.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | User Account |
| Primary Actor | Authenticated user (all tiers) |
| Goal | View and manage personal account, security, and preferences |
| Trigger | Tap on "Profile" tab in bottom navigation |

---

## 2. Functional Requirements

---

### FR-48: User Profile Screen

- **Actor**: Authenticated user (all tiers)
- **Description**: The Profile screen displays the user's account information and provides navigation to all account management sub-screens. The displayed information: display name, masked email address, nationality, linked providers list (icons only, e.g., Google, Apple, Zalo, Email), industrial preferences summary, investment goal. Email masking rules: standard email → mask local part (e.g., `loan.nguyen@gmail.com` → `lo***@gmail.com` — show first 2 chars of local part, mask rest); Apple Private Relay email → display as `••••••@privaterelay.appleid.com`. Sub-navigation links: Notification Settings, Language, Linked Providers, Change Password (shown only for accounts with email/password; hidden if social-only), App Settings, Help & Support, Log Out. Trader Tier badge and XP shown below display name. LEARN_MODE: no portfolio hero widget, no brokerage CTA anywhere on this screen or sub-screens. DOB field visible in Personal Information section but always read-only with helper text and lock icon.
- **Input**:
  - User profile data from server: display_name, email, nationality, linked_providers, industrial_prefs, investment_goal, feature_tier, trader_tier, xp_points, dob
  - `feature_tier`: LEARN_MODE | FULL_ACCESS
- **Output**:
  - Profile screen with all fields rendered
  - Email masked per spec
  - Sub-navigation links; "Change Password" hidden for social-only accounts
  - Trader Tier badge + XP bar
  - DOB: read-only with lock icon; helper text "To update your date of birth, contact support."
  - No portfolio hero widget for LEARN_MODE
  - No brokerage CTA for LEARN_MODE (not in DOM)
- **Precondition**: User is authenticated.
- **Postcondition**: Profile screen renders with current data.

#### Email Masking Rules

| Email Type | Display Format | Example |
|---|---|---|
| Standard email | First 2 chars of local part + `***@domain.tld` | `loan.nguyen@gmail.com` → `lo***@gmail.com` |
| Apple Private Relay | `••••••@privaterelay.appleid.com` | Always exactly this string |
| Local part ≤2 chars | Show first char + `***@domain.tld` | `a@gmail.com` → `a***@gmail.com` |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-48-01 | User has email `loan.nguyen@gmail.com` | Profile renders | Shows `lo***@gmail.com` |
| AC-48-02 | User has Apple Private Relay | Profile renders | Shows `••••••@privaterelay.appleid.com` |
| AC-48-03 | User's auth includes email/password | Profile renders | "Change Password" link visible |
| AC-48-04 | User has only Google + Zalo linked (no email/password) | Profile renders | "Change Password" link NOT visible (not in DOM) |
| AC-48-05 | User is LEARN_MODE | Profile renders | No portfolio hero widget; no brokerage CTA anywhere on screen |
| AC-48-06 | DOB is set | Profile renders | DOB shown read-only with lock icon; helper text shown |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Profile data fails to load | Show cached profile data; toast "Unable to refresh profile. Showing last data." |
| Display name contains Unicode (e.g., Vietnamese characters) | Renders correctly; no character encoding issues |
| User's nationality is not set (e.g., registration flow skipped) | Show "Not set" for nationality field |
| Trader Tier badge image fails to load | Show text fallback "Tier [N]" |

- **Priority**: P0

---

### FR-49: Edit Profile

- **Actor**: Authenticated user (all tiers)
- **Description**: The user can edit their display name, industrial preferences, and investment goal. Tapping "Edit" on display name opens an inline text field with save/cancel. Tapping "Edit" on industrial preferences re-enters the onboarding preferences UI (FR-08.1 — industry multi-select). Tapping "Edit" on investment goal re-enters the onboarding investment goal UI (FR-08.2). Display name constraints: 2–50 characters, Unicode allowed, profanity filter applied on save (if profanity detected: error "Display name contains inappropriate content. Please choose another."). Email and market preference are NOT editable in V1 (shown as read-only with "Not editable" tooltip). Preference changes to `industrial_prefs` persist immediately to the server and take effect in Discover and challenge seeding within the current session.
- **Input**:
  - Display name: text, 2–50 chars, Unicode
  - Industrial preferences: multi-select from standard industry list
  - Investment goal: single-select from standard goal list
- **Output**:
  - Updated profile saved to server
  - Updated values reflected on Profile screen immediately
  - Updated `industrial_prefs` takes effect in Discover feed on next visit within session
  - Error for profanity or constraint violation
- **Precondition**: User is authenticated. Profile screen is open.
- **Postcondition**: Profile updated on server. Local display refreshed.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-49-01 | User enters valid 30-char display name | Taps Save | Profile updated; new name shown |
| AC-49-02 | User enters 1-char display name | Taps Save | Error "Display name must be between 2 and 50 characters." |
| AC-49-03 | User enters 51-char display name | Taps Save | Error "Display name must be between 2 and 50 characters." |
| AC-49-04 | User enters profanity in display name | Taps Save | Error "Display name contains inappropriate content. Please choose another." |
| AC-49-05 | User changes industrial preferences | Re-enters selection UI; saves | `industrial_prefs` updated; Discover feed reranked on next visit |
| AC-49-06 | User tries to edit email | Taps email field | "Not editable" tooltip shown; no edit mode |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Save API call fails | Error toast "Could not save changes. Try again."; local state NOT updated |
| Profanity filter API unavailable | Allow save with warning logged; do not block user — prefer availability over strict filtering |
| User changes investment goal to "No goal" | `investment_goal = null` stored; discovery impact: fallback ranking |

- **Priority**: P1

---

### FR-49.1: Linked Providers Management

- **Actor**: Authenticated user (all tiers)
- **Description**: Profile → Linked Providers shows all four auth methods: Email/Password, Google, Apple, Zalo. Each row shows the provider name, its linked status ("Linked" or "Not linked"), and an action button ("Disconnect" if linked; "Link" if not linked). Rules: (1) The account must always have at least one usable auth method — disconnect is blocked if it would leave zero linked methods; tooltip shown: "You need at least one sign-in method." (2) Linking a provider: OAuth handshake in "link mode" — on success, the provider's sub ID is added to the existing user's account row (no new user row created). (3) If the provider being linked is already bound to a different Paave account: rejected with error "This [provider] account is already linked to a different user." (4) Apple is linked/matched by Apple Sub ID, not by email.
- **Input**:
  - Current linked providers list for this user
  - OAuth response from provider (for link action)
- **Output**:
  - Linked Providers list with correct status per provider
  - Disconnect: provider sub ID removed from user account; session preserved
  - Link: OAuth handshake → sub ID added; no new user row
  - Block disconnect if last method; tooltip shown
  - Error on provider already bound to different account
- **Precondition**: User is authenticated. Linked Providers screen is open.
- **Postcondition**: Linked provider list reflects updated state.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-49.1-01 | User has Google + Email linked | Views Linked Providers | Both show "Linked"; Zalo and Apple show "Not linked" |
| AC-49.1-02 | User has only Email linked | Taps "Disconnect" on Email | Blocked; tooltip "You need at least one sign-in method." |
| AC-49.1-03 | User has Google + Email | Taps "Disconnect" on Google | Google disconnected; Email remains; profile updated |
| AC-49.1-04 | User taps "Link" on Zalo | OAuth handshake | Zalo sub ID added to user account; "Linked" shown |
| AC-49.1-05 | User attempts to link Google already bound to another Paave account | After OAuth | Error "This Google account is already linked to a different user." |
| AC-49.1-06 | User has Apple linked | Apple shown | Matched by Apple Sub ID; email field irrelevant |

#### Error Codes

| Code | Scenario | User Message |
|---|---|---|
| E-AUTH-401 | Disconnect would leave zero auth methods | "You need at least one sign-in method." |
| E-AUTH-402 | Provider already linked to different account | "This [provider] account is already linked to a different user." |
| E-AUTH-403 | OAuth link handshake failed | "Unable to link [provider]. Try again." |

- **Priority**: P1

---

### FR-50: Change Password

- **Actor**: Authenticated user with email/password auth method
- **Description**: Profile → Change Password (visible only to accounts with email/password linked). Form fields: current password, new password, confirm new password. Validation rules for new password: same policy as registration (minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character). On success: all existing refresh tokens for this user (all devices except current) are invalidated server-side; the user remains logged in on the current device with a new session token; no re-login required on current device. Current password incorrect: error "Current password is incorrect." New password same as current: error E-1013 "New password must be different from your current password." Social-only account deep-linked here: toast "This account uses [provider] sign-in — no password to change." then navigate back.
- **Input**:
  - current_password: string
  - new_password: string
  - confirm_password: string (must match new_password)
- **Output**:
  - Password changed on server
  - All other device refresh tokens invalidated
  - Current device: new session token issued; stay logged in
  - Error messages for validation failures
- **Precondition**: User is authenticated. User has email/password auth method.
- **Postcondition**: Password updated. Other sessions invalidated. Current device session active.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-50-01 | Valid current + valid new password | Taps "Change Password" | Password updated; toast "Password changed successfully."; all other sessions invalidated |
| AC-50-02 | Incorrect current password | Taps "Change Password" | Error "Current password is incorrect." |
| AC-50-03 | New password same as current | Taps "Change Password" | Error E-1013 "New password must be different from your current password." |
| AC-50-04 | New password fails policy | Taps "Change Password" | Error listing specific policy failure (e.g., "Must include at least 1 uppercase letter.") |
| AC-50-05 | confirm_password ≠ new_password | Taps "Change Password" | Error "Passwords do not match." |
| AC-50-06 | Social-only user navigates to Change Password | Deep link | Toast "This account uses [provider] sign-in — no password to change."; navigate back |
| AC-50-07 | User on another device after password change | That device makes API call | 401 returned; re-login required on that device |

#### Error Codes

| Code | Scenario | User Message |
|---|---|---|
| E-1010 | Current password incorrect | "Current password is incorrect." |
| E-1011 | New password fails policy | Policy-specific message |
| E-1012 | Passwords don't match | "Passwords do not match." |
| E-1013 | New password same as current | "New password must be different from your current password." |

- **Priority**: P1

---

### FR-51: Logout

- **Actor**: Authenticated user
- **Description**: Profile → Log Out shows a confirmation dialog: "Are you sure you want to log out?" with "Log Out" and "Cancel" actions. On confirmation: JWT and refresh token are invalidated server-side; local session data (tokens, cached user data, pending_deep_link) are cleared from device storage; the push notification token for this device is deregistered from the server; the user is navigated to the Welcome screen. Network unavailable: local session is cleared immediately; backend token invalidation and push token deregistration are queued for next connection; the user still sees the Welcome screen.
- **Input**:
  - User confirmation of logout
  - Network availability
- **Output**:
  - Server: JWT + refresh token invalidated; push token deregistered
  - Local: all session data cleared from device storage
  - Navigation: Welcome screen
  - Network offline: local clear done immediately; backend operations queued
- **Precondition**: User is authenticated and taps "Log Out."
- **Postcondition**: User is signed out. Welcome screen shown. No ghost notifications.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-51-01 | User taps "Log Out" | Confirmation dialog | Dialog shown with "Log Out" and "Cancel" |
| AC-51-02 | User confirms "Log Out" | Network available | Server tokens invalidated; local cleared; push deregistered; Welcome screen |
| AC-51-03 | User confirms "Log Out" | Network offline | Local session cleared immediately; backend queue set; Welcome screen shown |
| AC-51-04 | User taps "Cancel" | Confirmation dialog | Dialog dismissed; no logout action |
| AC-51-05 | After logout, app receives a push | Any state | Push ignored; user sees login screen if app tapped (FR-NOTIF-01.3 flow) |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Backend token invalidation fails but local clear succeeded | User is effectively logged out locally; token may be usable briefly until TTL; log security warning |
| Queued backend invalidation never delivers (device offline for days) | Token expires by natural TTL (server-enforced); security risk is bounded by token TTL |

- **Priority**: P0

---

### FR-52: Notification Settings

- **Actor**: Authenticated user
- **Description**: Profile → Notification Settings shows toggles for each notification type. Toggles: Price Alerts (on/off), Market Open (on/off), Market Close (on/off), Watchlist Movements (on/off), Portfolio Health Check — FR-AI-04 (on/off), Behavioral Nudges — FR-AI-05 (on/off). Each toggle saves immediately (optimistic update — UI flips instantly; backend synced async; reverts on failure). If OS-level notifications are disabled for Paave: all toggles are grayed out and non-interactive; a note reads "Notifications are disabled in your device settings. Enable them to receive alerts." with a "Open device settings" button that deep-links to device notification settings for the app.
- **Input**:
  - User toggle action per notification type
  - OS-level notification permission status
- **Output**:
  - Toggle state persisted to user profile on server
  - Optimistic UI: toggle flips immediately
  - OS disabled: all grayed out with note + settings link
  - Revert toggle + toast on backend failure
- **Precondition**: User is authenticated. Notification Settings screen is open.
- **Postcondition**: Notification preferences updated on server.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-52-01 | Price Alerts toggle is OFF | User taps it | Optimistic: toggle flips to ON; backend call made |
| AC-52-02 | Backend update fails | After toggle flip | Toggle reverts to OFF; toast "Could not save setting. Try again." |
| AC-52-03 | OS notifications disabled | Screen opens | All 6 toggles grayed out; note shown; "Open device settings" button present |
| AC-52-04 | User taps "Open device settings" | Any time | Device notification settings for Paave opened |

- **Priority**: P1

---

### FR-53: Help & Support

- **Actor**: Authenticated user
- **Description**: Profile → Help & Support has three sections: (1) FAQ — static markdown-rendered FAQ content served from server, updated without app release. Renders as expandable accordion items. (2) "Contact Us" — opens the device's native email client with `support@paave.app` pre-filled in the To field and subject "Paave Support Request". If no email client is installed: display the email address as copyable text with a "Copy" button. (3) "Report a Bug" — in-app form with: description field (required, max 1000 chars), optional screenshot attachment (JPEG or PNG, max 5 MB per file, 1 file only). Submits to bug report API; success toast "Bug report submitted. Thank you!"; failure toast "Could not submit report. Try again."
- **Input**:
  - FAQ content from server (markdown)
  - "Contact Us": native email client availability
  - "Report a Bug": description text, optional image file
- **Output**:
  - FAQ rendered as expandable accordion
  - Email client opened with pre-filled To and subject
  - Bug report form submission
- **Precondition**: User is authenticated. Help & Support screen is open.
- **Postcondition**: FAQ displayed; email client opened or address shown; bug report submitted.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-53-01 | FAQ has 10 items | Screen opens | All 10 shown as collapsed accordion items; tap to expand |
| AC-53-02 | Native email client installed | "Contact Us" tapped | Email client opens with `support@paave.app` pre-filled |
| AC-53-03 | No email client installed | "Contact Us" tapped | `support@paave.app` shown as copyable text |
| AC-53-04 | User submits bug report with description + screenshot | Tap Submit | API call made; success toast shown |
| AC-53-05 | Screenshot file > 5 MB | User attaches file | Error "Screenshot must be smaller than 5 MB." File not attached. |
| AC-53-06 | Screenshot is not JPEG or PNG | User attaches file | Error "Only JPEG and PNG images are supported." |

- **Priority**: P2

---

### FR-AUTH-09: Multi-Device Session Management

- **Actor**: Authenticated user + System
- **Description**: Multi-device session rules, active session viewing, and remote session revocation.

#### FR-AUTH-09.1: Concurrent Session Limit

- **Rule**: Maximum 5 devices may hold active refresh tokens simultaneously (BR-AUTH-08). Each device login creates an independent session (refresh token). When the count reaches 5 and a new login is attempted: the oldest inactive session (ordered by `last_active_at` ascending; tie-break by `created_at` ascending) is auto-revoked. A push notification is sent to the revoked device: "You were signed out because your account reached the maximum device limit."
- **Input**:
  - Login attempt on a 6th device
  - Sessions table: list of sessions with `last_active_at`, `created_at`, `device_info`
- **Output**:
  - Oldest inactive session deleted from sessions table
  - Push sent to revoked device (if push token registered)
  - New login proceeds
- **Precondition**: User attempts login and already has 5 active sessions.
- **Postcondition**: Oldest session revoked; new session created; revoked device notified.

#### FR-AUTH-09.2: View Active Sessions

- **Location**: Profile → Settings → Security → Active Sessions (read-only view)
- **Displayed per session**: device name (e.g., "iPhone 15 Pro"), operating system (e.g., "iOS 18.2"), approximate location (city name from IP geolocation; if geolocation fails → "Unknown location"), `last_active_at` in relative time ("2 hours ago"), "This device" label on the current session.
- **Behavior**: Read-only list; sorted by `last_active_at` descending.

#### FR-AUTH-09.3: Remote Session Revocation

- **Behavior**: Each session row (except "This device") has a "Sign out" button. Tapping "Sign out" on another device's session: HTTP 200 on success; that device's refresh token is invalidated; push notification sent to that device: "You were signed out of Paave on [device name]. If this wasn't you, change your password immediately." "Sign out all other devices" button at the bottom: invalidates all sessions except the current device's session in one action.
- **Cannot revoke current device from this screen** — use main Logout (FR-51).

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-AUTH09-01 | User has 5 active sessions; 6th device logs in | Login | Oldest session (by last_active_at) revoked; push to revoked device; 6th device logs in |
| AC-AUTH09-02 | User views Active Sessions | Screen opens | List shows up to 5 sessions; current device has "This device" label |
| AC-AUTH09-03 | User taps "Sign out" on another device's session | Tap action | That session invalidated; push sent to that device |
| AC-AUTH09-04 | User taps "Sign out all other devices" | Tap action | All sessions except current invalidated; pushes sent to all |
| AC-AUTH09-05 | IP geolocation fails for a session | Session list rendered | "Unknown location" shown for that session |
| AC-AUTH09-06 | User tries to "Sign out" on "This device" row | UI | No "Sign out" button on "This device" row |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Push token for revoked device is stale (no longer registered) | Revocation still proceeds; push silently fails; no error to the revoking user |
| Two devices revoke the same session simultaneously | Idempotent: second revocation returns 200 (already revoked); no error |
| `last_active_at` is identical for two sessions (tie) | Tie-break by `created_at` ascending (oldest created = first to be revoked) |

- **Priority**: P1

---

### FR-ACCT-DOB-01: DOB Correction via Support Request

- **Actor**: Authenticated user

#### FR-ACCT-DOB-01.1: DOB Display — Locked

- **Description**: The DOB field in Profile → Personal Information is always read-only after first set. A lock icon is displayed next to the field. Helper text beneath the field: "To update your date of birth, contact support." Tapping the lock icon or helper text opens a modal explaining the correction process: "Your date of birth is used to verify your access tier. To request a correction, use the form below." The modal has a CTA "Request Correction" that opens the correction form (FR-ACCT-DOB-01.2).
- **Precondition**: User's DOB has been set (during registration).
- **Postcondition**: DOB remains read-only; correction process accessible.

#### FR-ACCT-DOB-01.2: DOB Correction Request

- **Description**: The correction request form has: `correct_dob` (date picker, format YYYY-MM-DD, required), `reason` (freetext, max 500 chars, required). On submit: HTTP 201; ticket ID returned in format CORR-XXXXXX (6-digit alphanumeric); confirmation email sent to user's email within 60 seconds; in-app response "We'll review and respond within 3 business days." Status shown in Profile: "DOB correction: pending review" while open. Only one open ticket at a time (error E-ACCT-401 if duplicate). Same DOB as current: error E-ACCT-402 "Date of birth is already set to this date."

#### FR-ACCT-DOB-01.3: Admin Approval Process (Internal)

- **Description**: Support agent reviews ticket via admin panel. On approval: DOB updated on user record; `feature_tier` recalculated in UTC+7; push notification sent to user "Your date of birth has been updated."; email confirmation sent; ticket status → RESOLVED. `feature_tier` recalculation: if new DOB puts user at 18+ (UTC+7) → FULL_ACCESS; if under 18 → LEARN_MODE. Recalculation happens immediately on approval; features gate change takes effect at next user app session.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-DOB-01 | DOB is set | Profile renders | DOB shown read-only with lock icon and helper text |
| AC-DOB-02 | User taps lock icon | Profile | Modal shown explaining correction process |
| AC-DOB-03 | User submits valid correction request | Form submit | HTTP 201; ticket CORR-XXXXXX created; email sent within 60s; status "pending review" shown |
| AC-DOB-04 | User submits same DOB as current | Form submit | Error E-ACCT-402 "Date of birth is already set to this date." |
| AC-DOB-05 | User attempts second correction request (1 open) | Form submit | Error E-ACCT-401 "You already have a pending correction request." |
| AC-DOB-06 | Admin approves correction | Admin action | DOB updated; feature_tier recalculated; push + email sent to user; ticket → RESOLVED |

#### Error Codes

| Code | Scenario | User Message |
|---|---|---|
| E-ACCT-401 | Duplicate correction request | "You already have a pending correction request. Check your email for updates." |
| E-ACCT-402 | Same DOB as current | "Date of birth is already set to this date." |
| E-ACCT-403 | Correction form submit fails | "Could not submit request. Try again." |

- **Priority**: P2

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-AUTH-08 | Maximum 5 concurrent active sessions per user | 6th login: oldest session auto-revoked; push sent to revoked device |
| BR-ACCT-DOB-01 | DOB locked after first set; correction via support ticket only | Any attempt to directly edit DOB via API: 403 Forbidden |
| BR-31 | Brokerage CTA never rendered for LEARN_MODE users | Not in DOM; not display:none |
| BR-22 | No pre-checked boxes on consent forms | Pre-checked = compliance violation |

---

## 4. UI/UX Notes

- **Profile screen layout**: Avatar (initials fallback) at top, display name, Trader Tier badge, XP bar. Below: info section (masked email, nationality, DOB read-only). Below: preferences section (industrial prefs chips, investment goal). Below: navigation links list.
- **Trader Tier badge**: Shown as a colored icon + "Tier [N]" label. Tap → tier explanation sheet.
- **XP bar**: Horizontal progress bar from 0 to next tier threshold; numeric "X / Y XP" label.
- **Linked Providers**: Show provider logos (Google G, Apple logo, Zalo logo, envelope icon for Email). Green checkmark = linked; gray = not linked.
- **Change Password form**: Password fields with show/hide toggle; real-time policy indicator (shows which rules pass/fail as user types).
- **Logout confirmation**: Destructive action dialog; "Log Out" button in red; "Cancel" in gray.
- **DOB lock icon**: SF Symbols `lock.fill` (iOS) / Material Icons `lock` (Android).

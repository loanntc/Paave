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


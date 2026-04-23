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


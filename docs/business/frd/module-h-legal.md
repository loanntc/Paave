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


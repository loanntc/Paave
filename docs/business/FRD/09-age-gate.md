# FRD-09: Age Gate & Feature Tier Enforcement
## Paave — Vietnam Gen Z Paper-Trading & Social Investing App

**Version:** 2.4
**Date:** 2026-04-21
**Author:** Business Analysis Team
**Linked BRD:** BRD.md §BO-02 (Safety & Regulatory Compliance)
**Linked SRD:** SRD.md §2.3 (Age Gate & User Classification)
**Status:** Authoritative — supersedes all prior age-gate specifications in FRD.md v2.2 and FRD-gaps-v2.4.md

> **Scope of this document:** Complete, self-contained specification for all age-gate behaviour in Paave. A developer must be able to implement FR-AGE-01 through FR-AGE-04 from this document alone without referencing any earlier version. A QA engineer must be able to write complete test cases without assumptions.

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | Age Gate & Feature Tier Enforcement |
| Primary Actors | Unregistered user (during signup); Registered user (on every session init); Paave backend (server-side tier evaluator) |
| Goal | Ensure every Paave user is age-verified at registration; assign the correct feature tier (LEARN_MODE or FULL_ACCESS); enforce tier restrictions throughout the session; automatically upgrade users when they turn 18 |
| Trigger | Any new user registration (all signup methods); every session initialisation (login / token refresh) |
| Regulatory Basis | Vietnam Cybersecurity Law; PDPA; Paave Terms of Service (minor protection clause) |

### 1.1 Feature Tier Definitions

| Tier | Age Range (UTC+7) | Registration Status |
|------|-------------------|---------------------|
| `LEARN_MODE` | 16 years ≤ age < 18 years | Active (self-registered) |
| `FULL_ACCESS` | age ≥ 18 years | Active |
| `PENDING_PARENTAL_CONSENT` | 13 years ≤ age < 16 years | Suspended pending parent approval — V3 feature; not active in V1 or V2 |
| `BLOCKED` | age < 13 years | Registration rejected entirely |
| `PENDING_DOB` | Any | Transitional: user completed OAuth but has not yet submitted DOB |

### 1.2 Age Boundary Calculation — Global Rule

**This rule applies everywhere in this document and overrides any other wording.**

```
today_date_in_UTC7  =  floor( (UTC_now_as_unix_seconds + 25200) / 86400 )
                        expressed as a calendar date: YYYY-MM-DD

age_years           =  today_date_in_UTC7 - user.dob
                        (calculated as full calendar years; the birthday is 
                         the first day the user IS that age)

user is age N       =  today_date_in_UTC7 >= dob + N calendar years
```

**Worked Example (from FRD-gaps-v2.4.md GAP-QA-04):**
- DOB: `2008-01-15`
- Server UTC: `2026-01-14T20:00:00Z`
- UTC+7 equivalent: `2026-01-15T03:00:00`
- `today_date_in_UTC7` = `2026-01-15`
- `2026-01-15 >= 2008-01-15 + 18 years` = `2026-01-15 >= 2026-01-15` → **TRUE**
- Result: user IS 18 → eligible for FULL_ACCESS

**Counter-Example (1 hour earlier):**
- Server UTC: `2026-01-14T16:00:00Z`
- UTC+7 equivalent: `2026-01-14T23:00:00`
- `today_date_in_UTC7` = `2026-01-14`
- `2026-01-14 >= 2026-01-15` → **FALSE**
- Result: user is still 17 → LEARN_MODE maintained

---

## 2. Functional Requirements

---

### FR-AGE-01 — Date of Birth Collection at Registration

**Priority:** P0 — Blocking. No account can be activated without DOB.

**Actor:** Any new user (email/password, Google OAuth, Apple OAuth, Zalo OAuth).

**Description:**
Every user registering for Paave must provide their date of birth before account activation, regardless of registration method. For social OAuth flows (Google, Apple, Zalo), the DOB provided by the OAuth provider (if any) is completely ignored — the field is always presented blank to the user. Account state remains `PENDING_DOB` until the user submits a valid DOB. The post-handshake DOB screen (shown after OAuth redirect returns to Paave, as specified in FR-05.4) is non-skippable: force-quitting the app and reopening returns the user to this screen.

DOB is stored as a date-only value (`YYYY-MM-DD`) with no time or timezone component. The stored value is encrypted at rest using AES-256. The DOB field is rendered as a date picker only — freetext input is not supported. Future dates are rejected by the picker UI and by server-side validation. No date after `today_date_in_UTC7` is selectable.

**Input:**

| Field | Type | Constraints | UI Control |
|-------|------|-------------|------------|
| `dob` | Date (YYYY-MM-DD) | Must not be in the future; must represent an age ≥ 13 years in UTC+7 at time of submission; must be a valid calendar date (no Feb 30, etc.) | Native OS date picker (scroll/wheel); no freetext; no keyboard input for date |

**Output:**

| Outcome | System Action |
|---------|---------------|
| Age ≥ 18 (FULL_ACCESS) | DOB stored (AES-256 encrypted); `feature_tier = FULL_ACCESS`; account status → ACTIVE; user proceeds to next onboarding step |
| Age 16–17 (LEARN_MODE) | DOB stored (AES-256 encrypted); `feature_tier = LEARN_MODE`; account status → ACTIVE; user proceeds to next onboarding step |
| Age 13–15 (deferred parental consent) | DOB stored; account status → `PENDING_PARENTAL_CONSENT`; parental consent flow initiated (FR-AGE-02) — NOT ACTIVE IN V2; in V2, this path shows: "Paave is currently available for users aged 16 and over. Parental consent support is coming soon." and blocks account creation |
| Age < 13 | DOB NOT stored; account NOT created; HTTP 400; error code E-1009 returned |
| DOB in the future | DOB rejected by picker (UI prevention) AND by server validation; error shown inline |

**Precondition:**
- User is on the registration DOB collection screen (email signup flow step 2, immediately after account details + password)
- OR user has just completed a social OAuth handshake and is on the post-handshake DOB screen (FR-05.4)
- No existing account exists for the user's email/social ID with a confirmed DOB

**Postcondition:**
- `users.dob` field set to the submitted date (AES-256 encrypted at rest)
- `users.feature_tier` set to `LEARN_MODE` or `FULL_ACCESS`
- `users.account_status` set to `ACTIVE` (or `PENDING_PARENTAL_CONSENT` in V3)
- DOB cannot be changed via self-service after this point; a support ticket of type `DOB_CORRECTION` is required (see FR-ACCT-DOB-01)
- `users.dob_collected_at` timestamp recorded (UTC)
- `users.dob_source = 'USER_SUBMITTED'` (never `OAUTH_PROVIDER`)

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AGE-01-01 | A new user on email registration step 2 | Selects a DOB that is exactly 17 years before today_date_in_UTC7 | `feature_tier = LEARN_MODE`; account ACTIVE; user proceeds to onboarding |
| AC-AGE-01-02 | A new user on email registration step 2 | Selects a DOB that is exactly 18 years before today_date_in_UTC7 | `feature_tier = FULL_ACCESS`; account ACTIVE; user proceeds to onboarding |
| AC-AGE-01-03 | A new user on email registration step 2 | Selects a DOB that is exactly 12 years + 364 days before today_date_in_UTC7 | Registration blocked; E-1009 returned; DOB not stored; user sees block message |
| AC-AGE-01-04 | A user who registered via Google OAuth | Arrives at post-handshake DOB screen | DOB field is blank regardless of what Google provided; user must type their DOB manually |
| AC-AGE-01-05 | A user who registered via Google OAuth | Force-quits app before submitting DOB | On re-opening the app, the user is returned to the post-handshake DOB screen; they cannot access any other app screen |
| AC-AGE-01-06 | A user on the DOB screen | Attempts to select a date tomorrow or any future date | Date picker does not allow selection past today_date_in_UTC7; future dates are greyed out and untappable |
| AC-AGE-01-07 | A user submits DOB age 13–15 in V2 | Submits the form | User sees: "Paave is currently available for users aged 16 and over. Parental consent support is coming soon."; account not created |

**Failed Cases:**

| FC-ID | Scenario | System Action | User-Facing Message | Error Code |
|-------|----------|---------------|---------------------|------------|
| FC-AGE-01-01 | DOB submitted represents age < 13 | Reject; do not store DOB; do not create account | "You must be at least 13 years old to register. Paave is currently available from age 16." | E-1009 |
| FC-AGE-01-02 | DOB is a future date | Reject at picker (UI) and server | "Please enter a valid date of birth." | E-1001 (generic validation) |
| FC-AGE-01-03 | DOB is Feb 29 in a non-leap year | Picker shows only valid calendar dates; Feb 29 not available in non-leap years | Not applicable (picker prevents invalid selection) | — |
| FC-AGE-01-04 | DOB is submitted via API without idempotency (duplicate submission) | Server is idempotent: if DOB already set, return HTTP 409 with current tier | "Date of birth already registered." | E-1020 |
| FC-AGE-01-05 | OAuth provider sends DOB in token claims (Google birthday field) | System ignores the OAuth-supplied DOB entirely; `dob_source` field is never set to `OAUTH_PROVIDER`; DOB field shown blank | (No user message — transparent behaviour; field is simply empty) | — |
| FC-AGE-01-06 | DOB submitted with age 13–15 in V2 | Block registration; show V3 notice | "Paave is currently available for users aged 16 and over. Parental consent support is coming soon." | E-1021 |
| FC-AGE-01-07 | User force-quits during PENDING_DOB state and reopens app | App detects `account_status = PENDING_DOB` on session init; routes user to DOB screen; no other screen accessible | (No message; silent route-back) | — |

**Edge Cases:**

| Case | Expected System Behaviour |
|------|--------------------------|
| User submits DOB then immediately loses network connection | Client should retry submission with same DOB; server is idempotent (if DOB already stored, return current tier without overwriting) |
| Server clock is momentarily behind (NTP drift) | Age boundary calculation always uses server-side UTC; NTP monitoring alert threshold is ±1 second; no user-facing impact |
| User's 16th birthday is today in UTC+7 | `today_date_in_UTC7 >= dob + 16 years` is TRUE; LEARN_MODE assigned |
| User enters DOB matching exactly 12 years today in UTC+7 | Age = 12 → E-1009 block; account not created |
| False DOB submitted (user lies about age to bypass gate) | Legal disclaimer is shown on the DOB screen: "By submitting your date of birth, you confirm this information is accurate. False information may result in account suspension." No technical prevention (honour system for those 13–15 bypassing; 18+ bypass checked at session level via FR-AGE-04) |
| DOB correction request while PENDING_DOB | Not applicable — DOB cannot be "corrected" if it has never been set; user simply submits the correct DOB |

**Business Rules Referenced:**
- BR-AGE-01: DOB is mandatory for all signup methods; no account can be ACTIVE without it
- BR-AGE-05: Age calculation uses UTC+7 exclusively; DOB is date-only; formula: `today_date_in_UTC7 >= dob + N_years`
- BR-28: Minimum registration age is 16 in V2; under 13 is blocked entirely; 13–15 is deferred to V3
- BR-37: Post-handshake DOB screen is non-skippable; force-quitting and re-opening returns user to this screen

---

### FR-AGE-02 — Parental Consent Flow

**Priority:** P2 — Deferred. This feature is NOT built in V1 or V2. Specification is included for planning completeness and to define the V3 target behaviour.

**Actor:** User aged 13–15; parent or legal guardian.

**Description (V3 Target Behaviour — NOT ACTIVE IN V2):**
When a user's DOB indicates they are aged 13–15 (today_date_in_UTC7 ≥ dob + 13 years AND today_date_in_UTC7 < dob + 16 years), the system initiates a parental consent flow instead of blocking registration outright.

In V2, when a user submits a DOB indicating age 13–15, they see: *"Paave is currently available for users aged 16 and over. Parental consent support is coming soon."* Account creation is blocked. No data is stored beyond the session.

**V3 Target Specification (for planning — not for V2 implementation):**

**Input:**
- `dob` (already submitted in FR-AGE-01, confirmed as 13–15)
- `parent_email` (string, RFC 5322 format, max 254 characters): parent or guardian email address
- Must differ from the child's own registered email

**Output (V3):**

| Outcome | System Action |
|---------|---------------|
| Parent email valid and different from child email | Account state set to `PENDING_PARENTAL_CONSENT`; consent token (UUID, hashed in DB) emailed to parent; token expires 24 hours from generation |
| Parent email same as child email | Reject: "Parent email must be different from your own email address." |
| Parent email not RFC 5322 format | Reject: "Please enter a valid email address." |

**V3 Parental Consent Token Rules:**
- Token is a cryptographically random UUID (128-bit entropy), stored hashed (SHA-256) in the database
- Token expiry: 24 hours from generation; after expiry, a new token must be requested (with resend rate limit)
- Maximum 3 resend requests per 24-hour period per child account; 4th request rejected: "You have reached the maximum resend limit. Please try again after 24 hours."
- Resend cooldown: 60 seconds between each resend tap (UI enforced, server validated)

**V3 Pre-Consent Access:**
While `account_status = PENDING_PARENTAL_CONSENT`, the user can access:
- Educational market content (read-only market data, articles)
- No paper trading
- No social features
- No AI cards
- Banner shown permanently: "Your account is pending parental approval."

**V3 Postcondition (parent approves):**
- Account status → ACTIVE
- `feature_tier = LEARN_MODE` (plus additional restrictions for under-16 to be defined in V3 spec)
- Consent record stored in `parental_consents` table with: `parent_email`, `approved_at`, `ip_address`, `user_agent`
- Child notified by push: "Great news! Your account is now active."

**Acceptance Criteria (V3 target):**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AGE-02-01 | A 14-year-old completes DOB entry | DOB indicates age 13–15 | Parent email prompt is shown; account status = PENDING_PARENTAL_CONSENT |
| AC-AGE-02-02 | Child enters same email as their own for parent | Taps Submit | Rejected: "Parent email must be different from your own email address." |
| AC-AGE-02-03 | Valid parent email submitted | Consent token sent | Parent receives email within 30 seconds; token expires in 24 hours |
| AC-AGE-02-04 | Child taps Resend 4 times | 4th resend attempt | Rejected: "You have reached the maximum resend limit." |
| AC-AGE-02-05 | Parent taps consent link within 24 hours | Link clicked | Account activated; child notified |
| AC-AGE-02-06 | Parent taps consent link after 24 hours | Link clicked | "This consent link has expired. Please ask your child to request a new one." |

**Edge Cases (V3):**

| Case | Expected Behaviour |
|------|--------------------|
| Parent email domain is a known disposable domain (temp-mail.org etc.) | Accept for V3; flag for review; disposable email detection is a V4 enhancement |
| Child turns 16 while in PENDING_PARENTAL_CONSENT state | On next session init, feature_tier re-evaluated; if now ≥ 16, parental consent requirement is lifted; account activated automatically |
| Parent consent token clicked but then account already manually approved by support | Idempotent: second approval has no effect |

**V2 Behaviour (currently active):**
In V2, when age 13–15 is detected: block with message "Paave is currently available for users aged 16 and over. Parental consent support is coming soon." No email collected. No data stored. Error code: E-1021.

**Business Rules Referenced:**
- BR-28: Under 13 = blocked. 13–15 = parental consent route (V3 deferred). 16+ = active registration.

---

### FR-AGE-03 — Feature Tier Enforcement

**Priority:** P0 — Core product rule; enforced on every session.

**Actor:** Registered user (LEARN_MODE or FULL_ACCESS); Paave backend (evaluator on every session init).

**Description:**
Feature tier controls which product capabilities a user can access. The tier is evaluated server-side on every session initialisation — the client receives the current tier as part of the session token payload and must re-fetch it on every login or token refresh. The client is not trusted to self-declare or self-upgrade its tier.

**Feature Tier Matrix:**

| Feature | LEARN_MODE (16–17) | FULL_ACCESS (18+) |
|---------|-------------------|------------------|
| Paper trading (BUY/SELL/LIMIT orders) | ✅ Full access | ✅ Full access |
| Market data — VN real-time | ✅ Full access | ✅ Full access |
| Market data — KR/Global reference | ✅ Full access (reference chip shown) | ✅ Full access (reference chip shown) |
| Gamification (XP, streaks, badges, leaderboard) | ✅ Full access | ✅ Full access |
| Social features (posts, follow, comments) | ✅ Full access | ✅ Full access |
| AI post-trade card (FR-AI-01) | ✅ Available — educational framing only (v2.4 amendment) | ✅ Available — full P&L framing |
| Price alerts | ✅ Full access | ✅ Full access |
| Onboarding & learning content | ✅ Full access | ✅ Full access |
| Brokerage partner CTAs ("Open real account") | ❌ Never rendered in HTML/native markup | ✅ Shown |
| Real-money indicators ("Invest real money") | ❌ Never rendered in HTML/native markup | ✅ Shown |
| Portfolio hero widget — brokerage bridge section | ❌ Never rendered in HTML/native markup | ✅ Shown |
| Referral program (if brokerage-linked) | ❌ Never rendered in HTML/native markup | ✅ Shown |

**AI Card Content Rule (v2.4 amendment, resolves GAP-QA-07):**
The AI post-trade card is shown to ALL users including LEARN_MODE. The content varies by tier:

| Tier | AI Card Content | P&L Language Allowed |
|------|----------------|----------------------|
| LEARN_MODE | Educational: explains order type mechanics, what happened in the simulated trade, market rules being applied | No. Must NOT say "You gained X VND" or "Your return was +Y%". Use: "This LIMIT order filled at your target price of X VND. In a real exchange, this means the counterparty was willing to sell at or below your price." |
| FULL_ACCESS | Educational context + P&L performance framing | Yes. "You gained X VND (+Y%) on this trade." |

Implementation requirement: The API call to the Claude model for generating the AI card content MUST include `feature_tier` in the system prompt context. A `feature_tier = LEARN_MODE` instruction instructs the model to use educational framing only. This is a backend responsibility; the client only renders the returned card content.

**Blocked Feature Tap Behaviour:**
When a LEARN_MODE user taps any feature that is blocked for their tier:
- A contextual modal or bottom sheet is shown
- Message: *"You'll unlock full access when you turn 18."*
- CTA: "Got it" (dismisses the modal)
- No navigation to the blocked screen
- The event is logged for analytics: `blocked_feature_tap` with `feature_name` and `user_id`

**Critical Implementation Requirement — Brokerage CTAs:**
Brokerage CTAs, real-money indicators, and brokerage-linked portfolio sections MUST NOT appear in the DOM/view hierarchy for LEARN_MODE users. This is a legal requirement, not a visual preference:
- The React/native component must conditionally not render these elements at all when `feature_tier === 'LEARN_MODE'`
- CSS `display: none`, `visibility: hidden`, or opacity-0 is NOT compliant — the element must not exist in the tree
- Server-side rendering (SSR/SSG) must also exclude these from the rendered HTML

**Session Tier Delivery:**
- On login, the server evaluates the user's feature tier using UTC+7 age boundary rule (FR-AGE-01 §1.2)
- The `feature_tier` is included in the access JWT claims: `{ "feature_tier": "LEARN_MODE" | "FULL_ACCESS" }`
- The client reads `feature_tier` from the JWT; it does not make a separate API call for tier
- On JWT refresh, the new access token carries the re-evaluated tier (a user may upgrade from LEARN_MODE to FULL_ACCESS mid-session via the upgrade prompt in FR-AGE-04)

**Input:**
- Session initialisation event (login, token refresh, app foreground after background)

**Output:**
- `feature_tier` set in JWT claims
- Client feature flags updated accordingly
- Blocked features removed from markup (not merely hidden)

**Precondition:**
- User has an active account with `account_status = ACTIVE`
- User's DOB is recorded

**Postcondition:**
- User's UI shows only features permitted for their tier
- Blocked features are absent from the markup
- `feature_tier` in JWT matches server-evaluated tier

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AGE-03-01 | A user with DOB making them 17 years old (UTC+7) | Logs in | JWT contains `feature_tier = LEARN_MODE`; brokerage CTAs are absent from all rendered screens |
| AC-AGE-03-02 | A LEARN_MODE user | Taps the brokerage partner section | Section does not exist in DOM; no tap event possible |
| AC-AGE-03-03 | A LEARN_MODE user | Taps a UI area that would show a real-money indicator | Contextual modal shown: "You'll unlock full access when you turn 18."; user not navigated away |
| AC-AGE-03-04 | A LEARN_MODE user completes a LIMIT BUY order | Post-trade AI card is rendered | AI card is shown; content uses educational framing; the phrase "You gained X VND" does not appear |
| AC-AGE-03-05 | A FULL_ACCESS user completes a LIMIT BUY order | Post-trade AI card is rendered | AI card shows full P&L framing: "You gained X VND (+Y%)" |
| AC-AGE-03-06 | A LEARN_MODE user whose client modifies the local JWT to change feature_tier to FULL_ACCESS | Makes an API call to a FULL_ACCESS-only endpoint | Server re-evaluates tier from stored DOB; returns 403 if tier is insufficient |
| AC-AGE-03-07 | A FULL_ACCESS user | Logs in | JWT contains `feature_tier = FULL_ACCESS`; all features visible |
| AC-AGE-03-08 | QA inspects the rendered DOM for a LEARN_MODE user | Views the Home screen | No brokerage CTA elements exist in the DOM (zero occurrences of brokerage CTA class names or component IDs) |

**Failed Cases:**

| FC-ID | Scenario | System Action | Error |
|-------|----------|---------------|-------|
| FC-AGE-03-01 | Client sends request to FULL_ACCESS endpoint with LEARN_MODE JWT | Server validates tier from DOB (not from client claim); returns 403 | HTTP 403; "This feature requires FULL_ACCESS." |
| FC-AGE-03-02 | DOB missing from user record (should not happen post-AGE-01, but defensive) | Session init fails; user redirected to DOB collection screen | Account status set to PENDING_DOB |
| FC-AGE-03-03 | Feature tier evaluation fails (DB error during DOB read) | Default to LEARN_MODE (fail safe — never grant more access than earned) | 500 logged internally; user gets LEARN_MODE session |

**Edge Cases:**

| Case | Expected Behaviour |
|------|--------------------|
| User's birthday occurs mid-session (they turn 18 while using the app) | Tier is not changed mid-session; upgrade happens on next login/token refresh or via FR-AGE-04 prompt |
| KR/Global user accesses VN-specific paper trading | Permitted for all tiers; VN market is the primary market and is always accessible |
| User changes language mid-session | AI card educational framing is regenerated in the new language; tier-based content rules still apply |

**Business Rules Referenced:**
- BR-AGE-01: DOB mandatory; tier cannot be assigned without DOB
- BR-AGE-05: UTC+7 age boundary calculation
- BR-16: Feature tier evaluated server-side on every session init; client cannot self-upgrade

---

### FR-AGE-04 — Age Upgrade Prompt

**Priority:** P0 — Required for legal compliance; ensures LEARN_MODE users are upgraded when eligible.

**Actor:** LEARN_MODE user whose UTC+7 age is now ≥ 18; Paave backend.

**Description:**
On every login, after the session token is issued, the server checks whether a LEARN_MODE user's current age (using the UTC+7 boundary rule) is now ≥ 18. If so, a full-screen upgrade prompt is displayed to the user before they are allowed to access the Home screen. The prompt is shown at most once per login session (not on every token refresh within the same session).

If the user taps "Unlock Now": the server immediately upgrades the user's feature_tier to FULL_ACCESS (server-side write to `users.feature_tier`), issues a new access JWT with `feature_tier = FULL_ACCESS`, and the user proceeds to Home with full access.

If the user taps "Maybe Later": the prompt is dismissed. The user proceeds to Home as LEARN_MODE for this session. On their next login, if they are still ≥ 18 in UTC+7, the prompt is shown again. There is no cap on how many times "Maybe Later" can be chosen — the prompt will appear on every login until the user taps "Unlock Now".

**Input:**
- Session initialisation event (login)
- User's stored DOB
- Current server UTC time

**Output:**

| Outcome | System Action |
|---------|---------------|
| User taps "Unlock Now" | `users.feature_tier` → FULL_ACCESS (server-side); new access JWT issued with `feature_tier = FULL_ACCESS`; `users.feature_upgraded_at` timestamp recorded; user navigates to Home; upgrade event logged for analytics |
| User taps "Maybe Later" | Prompt dismissed; `session_upgrade_prompt_shown = true` stored in session state (prevents showing again this session); user navigates to Home as LEARN_MODE |

**Precondition:**
- User's `feature_tier = LEARN_MODE`
- `today_date_in_UTC7 >= users.dob + 18 years` evaluates to TRUE (server-side)
- This is the user's first login event in this session (prompt not yet shown this session)

**Postcondition (Unlock Now):**
- `users.feature_tier = FULL_ACCESS` persisted in database
- New access JWT issued with `feature_tier = FULL_ACCESS`
- Brokerage CTAs now rendered on client on all subsequent screens
- `feature_upgraded_at` timestamp set
- Analytics event: `feature_tier_upgraded` with `method = USER_PROMPT`

**Postcondition (Maybe Later):**
- `users.feature_tier` remains `LEARN_MODE` in database
- Current session JWT remains `LEARN_MODE`
- Prompt will appear again on next login

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-AGE-04-01 | User DOB = 2008-01-15; server UTC = 2026-01-14T20:00:00Z | User logs in | UTC+7 = 2026-01-15 ≥ 2026-01-15 → upgrade prompt shown |
| AC-AGE-04-02 | Same user, server UTC = 2026-01-14T16:00:00Z | User logs in | UTC+7 = 2026-01-14 < 2026-01-15 → no prompt; LEARN_MODE continues |
| AC-AGE-04-03 | Eligible user shown upgrade prompt | Taps "Unlock Now" | `feature_tier` updated to FULL_ACCESS in DB; new JWT issued; user reaches Home with full access |
| AC-AGE-04-04 | Eligible user shown upgrade prompt | Taps "Maybe Later" | Prompt dismissed; user reaches Home as LEARN_MODE; next login shows prompt again |
| AC-AGE-04-05 | User taps "Maybe Later" | Refreshes access token within same session | Prompt NOT shown again (shown max once per login session) |
| AC-AGE-04-06 | User taps "Maybe Later" five times across five logins | Sixth login while still eligible | Prompt shown for the sixth time (no cap) |
| AC-AGE-04-07 | Client-side code attempts to upgrade feature_tier | Sends forged FULL_ACCESS request | Server validates tier from DOB; client cannot self-upgrade; server returns 403 if client attempts unauthorised upgrade call |

**Failed Cases:**

| FC-ID | Scenario | System Action | Error |
|-------|----------|---------------|-------|
| FC-AGE-04-01 | Server DB write fails during "Unlock Now" | Tier NOT upgraded; user informed of failure; prompt remains for next login | "Something went wrong. Please try again or contact support." |
| FC-AGE-04-02 | JWT issuance fails after tier upgrade DB write | DB write is not rolled back; next login will issue correct FULL_ACCESS JWT | User gets "Something went wrong"; on next login, tier is correct and prompt is not shown |
| FC-AGE-04-03 | User eligible per UTC+7 but client clock is different | Server is authoritative; client clock irrelevant | Prompt shown/not shown based exclusively on server-side UTC+7 calculation |

**Edge Cases:**

| Case | Expected Behaviour |
|------|--------------------|
| User reaches their 18th birthday exactly at midnight UTC+7 | On next login (which could be seconds later), upgrade prompt is shown |
| User already has `feature_tier = FULL_ACCESS` in DB | No prompt shown; user proceeds to Home directly |
| User is FULL_ACCESS and their DOB was corrected to make them < 18 (FR-ACCT-DOB-01 downgrade) | On next login, feature_tier is re-evaluated; if now LEARN_MODE, downgrade applied; brokerage CTAs removed from markup |
| Upgrade prompt shown; user puts app in background without tapping either button | On return to foreground (same session), prompt is shown again (it was not dismissed) |

**Business Rules Referenced:**
- BR-AGE-05: UTC+7 age boundary calculation
- BR-16: Feature tier evaluated server-side on every session init
- BR-37: Non-skippable screens return user to prompt on force-quit and reopen

---

## 3. Business Rules

| Rule ID | Rule | Source | Violation Behaviour |
|---------|------|--------|---------------------|
| BR-AGE-01 | DOB is mandatory for all signup methods (email, Google OAuth, Apple OAuth, Zalo OAuth). No account can reach ACTIVE status without a DOB record. | Age Gate spec | Account remains PENDING_DOB; user is routed back to DOB screen on every app open |
| BR-AGE-05 | Age boundary is calculated using Vietnam Standard Time (UTC+7). Formula: `today_date_in_UTC7 = floor((UTC_now_unix + 25200) / 86400)` expressed as YYYY-MM-DD. Age comparison: `today_date_in_UTC7 >= dob + N_years`. DOB is stored as date-only (YYYY-MM-DD), never with a time or timezone component. | FRD-gaps-v2.4.md GAP-QA-04 | Incorrect tier assignment; must be caught by server-side test suite |
| BR-16 | Feature tier is evaluated server-side on every session initialisation (login, token refresh). The client receives the tier in the JWT claims and must re-render accordingly. Client-side tier values are not trusted for access control decisions. | FRD.md | HTTP 403 on any server-side endpoint that receives a JWT claiming a higher tier than the server-evaluated tier |
| BR-28 | Minimum registration age in V2 is 16 years (UTC+7). Under-13 users are blocked entirely (E-1009). Ages 13–15 receive a "coming soon" message and cannot create an account in V2. | BRD.md | E-1009 for under-13; E-1021 for 13–15 in V2 |
| BR-37 | The post-handshake DOB screen (FR-05.4, shown after social OAuth redirect) is non-skippable. Force-quitting the app and reopening returns the user to this screen. The user cannot access any other part of the app while account_status = PENDING_DOB. | FRD-gaps-v2.4.md GAP-QA-12 | Any attempt to access a screen other than the DOB screen while PENDING_DOB is rejected; user is redirected |
| BR-ACCT-DOB-01 | DOB is locked after first submission. Self-service changes are not permitted. A support ticket of type DOB_CORRECTION must be submitted; it is reviewed manually within 3 business days. Only one open DOB_CORRECTION ticket is allowed per user at a time. | FRD-gaps-v2.4.md FR-ACCT-DOB-01 | HTTP 409 (E-ACCT-401) if a second ticket is submitted while one is open |
| LEARN_MODE-AI-01 | The AI post-trade card (FR-AI-01) is shown to LEARN_MODE users. The content must use educational framing only. The words "gained", "lost", and percentage P&L values must not appear in LEARN_MODE card content. | FRD-gaps-v2.4.md GAP-QA-07 (v2.4 amendment) | LEARN_MODE user sees P&L framing → content policy violation; caught by automated content test |

---

## 4. Acceptance Criteria Summary

*(Consolidated from per-FR tables above. Use these for test case generation.)*

**FR-AGE-01:**
- DOB = today_UTC7 − 17y → LEARN_MODE ✅
- DOB = today_UTC7 − 18y → FULL_ACCESS ✅
- DOB = today_UTC7 − 12y364d → E-1009 blocked ✅
- OAuth user → DOB field blank on screen ✅
- Future DOB → picker rejects ✅
- PENDING_DOB force-quit → returns to DOB screen ✅

**FR-AGE-02 (V3 — not V2):**
- Age 13–15 in V2 → "coming soon" block ✅
- Age 13–15 in V3 → parent email collected; 24h token; max 3 resends ✅

**FR-AGE-03:**
- LEARN_MODE → brokerage CTAs absent from DOM ✅
- LEARN_MODE tap on blocked feature → "unlock at 18" modal ✅
- LEARN_MODE AI card → educational framing, no P&L language ✅
- FULL_ACCESS AI card → P&L framing shown ✅
- Client cannot self-upgrade tier (server validates from DOB) ✅

**FR-AGE-04:**
- UTC+7 birthday reached → upgrade prompt on next login ✅
- "Unlock Now" → FULL_ACCESS immediately (server-side) ✅
- "Maybe Later" → LEARN_MODE continues; prompt again next login ✅
- No cap on "Maybe Later" declines ✅
- Prompt shown max once per login session ✅

---

## 5. Edge Case Matrix

| Scenario | Affected FR | Expected Behaviour |
|----------|------------|-------------------|
| User is in UTC+7 timezone; their birthday is today at UTC 00:00 but UTC+7 is still yesterday | FR-AGE-01, FR-AGE-04 | System uses UTC+7 exclusively; if UTC+7 date < birthday, tier not granted yet |
| Network timeout during DOB submission | FR-AGE-01 | Client retries; server is idempotent; if DOB stored, returns current tier |
| DOB correction changes tier from FULL_ACCESS to LEARN_MODE | FR-AGE-03, FR-ACCT-DOB-01 | Downgrade applied on next login; brokerage CTAs removed from markup immediately |
| OAuth provider sends a DOB that would make user 12 years old | FR-AGE-01 | DOB from provider ignored entirely; user enters their own DOB; if true DOB is < 13, E-1009 |
| User with LEARN_MODE uses app during midnight UTC+7 (18th birthday) | FR-AGE-04 | No mid-session upgrade; upgrade prompt shown on next login |
| LEARN_MODE user decompiles app and modifies JWT | FR-AGE-03 | Server validates DOB from database, not JWT claim; 403 returned |
| DOB correction approved while user is actively logged in | FR-AGE-03 | Current session unaffected; new tier applied on next login/token refresh |

---

## 6. UI/UX Notes

### FR-AGE-01 — DOB Screen
- Screen title: "When were you born?"
- Sub-copy: "Your age determines which features you can access."
- Date picker: OS-native scroll picker (iOS UIDatePicker, Android DatePickerDialog); no text field
- Max selectable date: today (today_date_in_UTC7); future dates greyed and untappable
- Min selectable date: 120 years ago (reasonable human age range)
- Legal disclaimer (always visible below picker, non-dismissible): *"By submitting your date of birth, you confirm this information is accurate. False information may result in account suspension."*
- CTA: "Continue" (disabled until a date is selected)
- Error state (under-13): Full-screen error state, not inline. Red icon + "You must be at least 16 to join Paave."
- Error state (13–15 in V2): Informational state. "Parental consent coming soon." No red. "Got it" CTA navigates back to Welcome screen.

### FR-AGE-03 — Feature Tier Enforcement
- "Unlock at 18" modal: Bottom sheet; headline "This feature unlocks at 18"; body "Keep learning with paper trading — you'll get full access when you turn 18."; single CTA "Got it"
- LEARN_MODE users never see any brokerage logos, "Open real account" buttons, or deposit/withdrawal UI

### FR-AGE-04 — Upgrade Prompt
- Full-screen (overlay, not a modal): Celebration illustration; headline "You're 18! 🎉" (emoji permitted here); body "Unlock full access to Paave including broker integrations and advanced features."; primary CTA "Unlock Now" (lime-signal colour); secondary CTA "Maybe Later" (muted)
- "Unlock Now" tap triggers a loading spinner while server upgrades tier; on success navigates to Home
- "Unlock Now" failure shows: "Something went wrong. Please try again." with retry option; "Maybe Later" as fallback

---

## 7. Error Codes — Age Gate Module

| Code | HTTP Status | Trigger | User-Facing Message |
|------|-------------|---------|---------------------|
| E-1009 | 400 | DOB indicates user is under 13 | "You must be at least 16 years old to join Paave." |
| E-1020 | 409 | DOB already set for this account (duplicate submission) | "Date of birth already registered." |
| E-1021 | 400 | DOB indicates user is 13–15 (V2 block) | "Paave is currently available for users aged 16 and over. Parental consent support is coming soon." |
| E-ACCT-401 | 409 | Second DOB_CORRECTION ticket submitted while one is open | "You already have an open DOB correction request. Please wait for it to be resolved." |
| E-ACCT-402 | 400 | DOB_CORRECTION request matches current stored DOB | "The submitted date matches your current date of birth." |

---

*End of FRD-09: Age Gate & Feature Tier Enforcement*
*Version 2.4 — Authoritative. Supersedes FRD.md v2.2 §Age Gate and FRD-gaps-v2.4.md §FR-AGE-04 AMENDMENT.*

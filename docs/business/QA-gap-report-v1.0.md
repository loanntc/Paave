# QA Gap Report — v1.0
## Paave — Gaps Detected During Test Case Creation

**Date:** 2026-04-20
**Author:** QA Team
**Source document:** QA-test-cases-v1.0.md
**Submitted to:** Business Analysis Team for FRD/SRD remediation

---

## Summary

During first-pass test case creation (101 test cases across 14 modules), **12 gaps** were identified in the FRD v2.2, SRD v2.0, and associated v2.3 addenda. These gaps make test cases unwritable or produce ambiguous pass/fail criteria. Each gap requires a BA-produced FR addition or correction before QA can complete those test cases.

| Gap ID | Description | Severity | Affected FRs | Blocking TCs | BA Action Required |
|--------|-------------|----------|--------------|--------------|-------------------|
| GAP-QA-01 | No forgot password FR exists | CRITICAL | FR-05 (implicit link only) | TC-AUTH-020 | Write FR-AUTH-07 |
| GAP-QA-02 | Multi-device session policy undefined | HIGH | SRD §2.3/§2.4 | TC-AUTH-021 | Write device session policy in FR or SRD |
| GAP-QA-03 | Onboarding step count inconsistency | MEDIUM | FR-08 | TC-ONBOARD-005 | Fix step count per path (email vs social) |
| GAP-QA-04 | DOB age boundary timezone undefined | HIGH | FR-AGE-04, SRD §2.3.3c | TC-AGE-003 | Specify timezone for age boundary |
| GAP-QA-05 | ATO/ATC no-match cancellation flow undefined | CRITICAL | FR-PT-07.1 | TC-PT-025 | Define E-PT-400 and full cancellation flow |
| GAP-QA-06 | QUEUED_AFTER_HOURS order lifetime undefined | HIGH | SRD-order-engine §2.2 | TC-PT-029 | Define auto-cancel TTL (PO decision pending) |
| GAP-QA-07 | AI card behavior for LEARN_MODE undefined | MEDIUM | FR-AI-01, FR-AGE-03 | TC-PT-035 | Specify AI card scope for LEARN_MODE |
| GAP-QA-08 | Price alert for already-crossed price undefined | HIGH | FR-28, SRD §2.6 | TC-MKT-004 | Define immediate-trigger vs next-crossing behavior |
| GAP-QA-09 | Deep link unauthenticated state undefined | CRITICAL | FR-43 | TC-NOTIF-003 | Define auth-gated deep link flow |
| GAP-QA-10 | Post character limit contradiction (280 vs 500) | CRITICAL | FR-SOC-03, SRD §4.10 | TC-SOC-003 | Pick authoritative value; fix both docs |
| GAP-QA-11 | Biometric auth screen exists — no FR written | CRITICAL | (None — screen undocumented) | TC-ACCT-004 | Write FR-AUTH-08 for biometric |
| GAP-QA-12 | DOB correction/dispute resolution undefined | MEDIUM | FR-AGE-01 (edge case only) | TC-ACCT-006 | Write process for false DOB correction |

**Legend:** CRITICAL = cannot ship without fix; HIGH = major user flow gap; MEDIUM = edge case / clarity

---

## Detailed Gap Descriptions

---

### GAP-QA-01 — Forgot Password FR Missing

**Description:**
FR-05 (email registration) mentions "password-reset flow" as a linking prompt on the login screen, but no FR defines the forgot password workflow. This is a core auth feature.

**What is missing:**
- No FR for: email entry → send reset link → click link → enter new password → confirmation
- No error cases: email not found, reset link expired, password reuse validation
- No SRD entries for reset token storage, TTL, invalidation

**Affected FRs:** FR-05 (references "Forgot Password?" link), FR-07 (login — assumes reset path exists)

**Affected test case:** TC-AUTH-020 — BLOCKED

**Required BA action:** Write FR-AUTH-07: Forgot Password Flow
- Minimum: email input → OTP/link → new password entry → success
- Must include: token TTL, link expiry behavior, email-not-found handling, password reuse rejection

**Severity:** CRITICAL — Users who forget their password have no recovery path. This is a P0 feature for any production app.

---

### GAP-QA-02 — Multi-Device Session Policy Undefined

**Description:**
The SRD §2.3/§2.4 stores refresh tokens with `device_id` fields, implying multi-device support. But no FR or SRD section defines the concurrent session policy.

**What is missing:**
- Can a user be logged in on 2 devices simultaneously?
- If yes: are sessions fully independent? Can one device's token invalidation affect the other?
- If no (single-session): what happens to the old session when a new login occurs?
- No spec for: "Devices" settings page (view active sessions, remote logout)

**Affected FRs:** SRD §2.3 (refresh token schema has `device_id`; policy unspecified)

**Affected test case:** TC-AUTH-021 — BLOCKED

**Required BA action:** Define session policy in FRD (functional) and SRD (implementation):
- Recommended: multi-device allowed (up to N devices), each with independent token. Session list visible in Account > Settings > Devices.

**Severity:** HIGH — Directly affects security posture and UX for users on phone + tablet.

---

### GAP-QA-03 — Onboarding Step Count Inconsistency

**Description:**
FR-08 states the onboarding progress bar shows "Step X of 6" for both email and social OAuth paths. QA analysis shows:

- **Email path:** (1) Data Consent → (2) Account Details + DOB → (3) OTP Verification → (4) Industrial Preferences → (5) Investment Goal = **5 user-visible steps**
- **Social path:** (1) Method Select → (2) OAuth Handshake → (3) DOB + Display Name → (4) Industrial Preferences → (5) Investment Goal → (6) Consent = **6 user-visible steps** (consent is deferred to end)

If the step counter shows "6" for the email path, it never reaches step 6. If it shows "5", the FR is wrong.

**Affected FRs:** FR-08 (onboarding), FR-01 (progress bar component)

**Affected test case:** TC-ONBOARD-005 — BLOCKED

**Required BA action:** Correct FR-08 to specify step count per path:
- Email path: 5 steps
- Social OAuth path: 6 steps
- Or: redesign so both paths have the same count

**Severity:** MEDIUM — UX bug (wrong step count displayed). Not a data integrity issue, but noticeable to users.

---

### GAP-QA-04 — DOB Age Boundary Timezone Undefined

**Description:**
FR-AGE-04 states that age tier is re-evaluated at login (for users approaching 18th birthday). SRD §2.3.3c confirms server-side re-evaluation. But no document specifies which timezone to use for the age boundary.

**Edge case that breaks:** A user born 2008-01-15 in Vietnam (UTC+7):
- Their 18th birthday in UTC+7 is 2026-01-15T00:00:00+07:00
- In UTC, this is 2026-01-14T17:00:00Z
- A login at 2026-01-14T20:00:00 UTC: server (UTC) sees birthday as 2026-01-14, so user is 18 → FULL_ACCESS granted
- Correct? Their birthday in Vietnam hasn't started yet (it's 03:00 UTC+7)

If the server uses UTC for the calculation, some users get FULL_ACCESS 7 hours before their birthday in Vietnam. If the server uses UTC+7 (Vietnam timezone), users in KR/US who use the app on their 18th birthday in their timezone may not get access for hours.

**Affected FRs:** FR-AGE-04, SRD §2.3.3c

**Affected test case:** TC-AGE-003 — PARTIAL (can test, but expected result is unknown)

**Required BA action:** Specify timezone for DOB age boundary:
- Recommended: store DOB as date-only (no timezone); compare against today's date in UTC+7 (Vietnam Standard Time = user's primary market timezone). This is consistent and deterministic.

**Severity:** HIGH — Affects legal compliance for the age gate. An under-16 user getting FULL_ACCESS due to timezone mismatch is a compliance risk.

---

### GAP-QA-05 — ATO/ATC No-Match Cancellation Flow Undefined

**Description:**
FR-PT-07.1 states: "if no matching price can be computed (no counterparty exists at opening/closing match), ATO/ATC orders are CANCELLED."

The v2.3 self-review (REVIEW-self-and-po-v2.3.md, Finding #3) flagged that error code E-PT-400 should be added for this case. However:
- E-PT-400 is referenced in the self-review but **not defined** in FRD-module-B-v2.3.md or SRD-order-engine-v2.3.md
- The cancellation flow (what happens to reserved funds, what notification is sent, what `cancel_reason` is recorded) is not specified

**What is missing:**
- Error code E-PT-400 formal definition
- `cancel_reason` value for this case (e.g., `ATO_ATC_NO_MATCH`)
- Fund reserve release flow on ATO/ATC cancellation
- User notification content

**Affected FRs:** FR-PT-07.1, SRD-order-engine §2.1 (ATO/ATC fill flow)

**Affected test case:** TC-PT-025 — BLOCKED

**Required BA action:** Add to FRD-module-B-v2.3.md:
- FC-PT-25 (new failed case): ATO/ATC cancelled — no matching price
- E-PT-400 formal entry in error code table
- Add to SRD-order-engine: flow step for ATO/ATC no-match path

**Severity:** CRITICAL — Without this, the order state machine is incomplete. Orders can end up in PENDING forever if no match occurs.

---

### GAP-QA-06 — QUEUED_AFTER_HOURS Order Lifetime Undefined

**Description:**
SRD-order-engine-v2.3.md §2.2 defines the `QUEUED_AFTER_HOURS` status for KR/Global orders received outside simulated trading hours. The REVIEW-self-and-po-v2.3.md Implementation Q2 raises this as a PO question: "How long should a QUEUED_AFTER_HOURS order remain before auto-cancelling?"

Currently: no auto-cancellation defined. Orders could queue indefinitely.

**What is missing:**
- Maximum queue lifetime (suggested 48h in REVIEW doc)
- Auto-cancel behavior: status = CANCELLED; cancel_reason = QUEUE_EXPIRED
- Fund reserve release on auto-cancel
- Push notification to user on auto-cancel

**Affected FRs:** SRD-order-engine §2.2, §2.4 (Expiry Cron)

**Affected test case:** TC-PT-029 — BLOCKED

**Required BA action (pending PO decision Q2):**
- Once PO decides on TTL: add to BR-PT-07 and SRD Expiry Cron §2.4
- Recommend: 48h TTL (covers 2 trading sessions for KR/Global)

**Severity:** HIGH — Without TTL, orphaned queue orders accumulate. Reserve funds are indefinitely locked.

---

### GAP-QA-07 — AI Post-Trade Card Behavior for LEARN_MODE Undefined

**Description:**
FR-AI-01 defines the AI post-trade insight card that appears after every paper trade execution. FR-AGE-03 defines LEARN_MODE restrictions (blocks "real money indicators," brokerage CTA, portfolio hero widget, etc.).

The intersection is undefined: does a LEARN_MODE user (age 16–17) see the AI post-trade card? If yes, does the card content differ (e.g., simplified language, no P&L framing)?

**What is missing:**
- Is FR-AI-01 scope restricted to FULL_ACCESS users, or available to all registered users?
- If LEARN_MODE users see the card: does the content differ?
- No `feature_tier` gate documented in FR-AI-01

**Affected FRs:** FR-AI-01, FR-AGE-03

**Affected test case:** TC-PT-035 — BLOCKED

**Required BA action:** Amend FR-AI-01 to include:
- Scope: which feature_tiers see the card (FULL_ACCESS only? FULL_ACCESS + LEARN_MODE?)
- If LEARN_MODE: content variant specification (e.g., educational framing; no P&L gain/loss language?)
- Recommended: LEARN_MODE users see the card (educational product), but content is adapted (focus on "what this order type does" rather than "you gained X VND")

**Severity:** MEDIUM — Product quality and consistency gap. Not a data integrity risk.

---

### GAP-QA-08 — Price Alert: Already-Crossed Price Behavior Undefined

**Description:**
FR-28 (Price Alerts) and SRD §2.6 define alert triggering when market price crosses a threshold. Neither document specifies what happens when the user sets an alert for a price that the stock is already at or beyond.

**Edge case:** User sets alert "Price above 55,000 VND" when the stock is currently trading at 56,500 VND.
- Option A: Trigger immediately (within next price tick)
- Option B: Wait for next crossing event (price must first drop below 55,000, then rise above it)
- Neither is specified

**What is missing:**
- Explicit behavior for set-at-or-above-threshold case
- FR-28 "Precondition" does not exclude already-crossed prices

**Affected FRs:** FR-28 (Price Alert creation), SRD §2.6

**Affected test case:** TC-MKT-004 — BLOCKED

**Required BA action:** Add explicit case to FR-28 or SRD §2.6:
- Recommended (Option A): If set price is already satisfied at time of alert creation → trigger immediately on next price evaluation (within 15s). This is intuitive for F0 users: "I want to know when it's at this price — it is, so tell me."
- Add as edge case EC-ALT-01 in FR-28

**Severity:** HIGH — If implemented differently than user expectation, it silently fails to notify. Critical UX correctness issue.

---

### GAP-QA-09 — Deep Link from Push Notification: Unauthenticated State Undefined

**Description:**
FR-43 defines push notification behavior for price alerts: tapping the notification navigates to Stock Detail screen. No spec covers the case where:
- The app is killed (cold start from notification)
- The user is logged out

In both cases, there is no auth session. The deep link target (Stock Detail) may require auth, or may be accessible in a limited guest view.

**What is missing:**
- Cold-launch deep link flow: notification tap → app starts → where to go?
- Auth-required scenario: should the app show login screen first, then deep link after auth? Or show Stock Detail as guest?
- No FR for push notification deep link routing

**Affected FRs:** FR-43, FR-07 (login), SRD §2.6 (push notification handling)

**Affected test case:** TC-NOTIF-003 — BLOCKED

**Required BA action:** Add to FR-43 or create FR-NOTIF-01 (Deep Link Routing):
- Case A (cold start, user logged out): Launch → Login screen → after successful login → navigate to target deep link
- Case B (cold start, push token expired): Same as A; store pending deep link in local state until auth complete
- The "pending deep link" pattern must be added to SRD auth flow

**Severity:** CRITICAL — This is a standard mobile pattern. Not defining it means implementation will be inconsistent across iOS/Android, causing user-facing bugs. Also relevant for retention: users tapping a notification should land on the right screen.

---

### GAP-QA-10 — Post Character Limit Contradiction (FRD vs SRD)

**Description:**
Two documents define different character limits for social trading posts:

| Document | Value | Location |
|----------|-------|----------|
| FRD v2.2 | 280 characters max | FR-SOC-03 |
| SRD v2.0 | 1–500 characters | §4.10 validation table |

These are directly contradictory. The backend (SRD) and frontend (FRD) will implement different limits, causing:
- Frontend allows up to 280 chars → backend accepts (if SRD wins: 500)
- Frontend allows up to 500 chars → backend rejects anything 281–500 (if FRD wins: 280)
- DB column `body VARCHAR(500)` but application says 280 → 220 chars wasted; or schema too small if limit is 500

**Affected FRs:** FR-SOC-03, SRD §4.10

**Affected test case:** TC-SOC-003 — BLOCKED

**Required BA action:** Choose one authoritative value. Recommended: **500 characters** (FRD says 280 because of a Twitter analogy, but Paave's format is not a tweet; 500 gives more educational context). Update FR-SOC-03 to say 500, or update SRD §4.10 to say 280. Whichever value is chosen, both documents must reflect the same number.

**Severity:** CRITICAL — Backend/frontend discrepancy. Will produce production bugs at launch. One of two documents is currently wrong.

---

### GAP-QA-11 — Biometric Authentication: Screen Exists, No FR Defined

**Description:**
The Paave codebase contains a directory at `app/(auth)/onboarding/biometric/` indicating a biometric authentication onboarding screen has been implemented (or is in development). No FR exists for biometric authentication (Face ID / fingerprint / Touch ID).

**What is missing:**
- No FR for biometric enrollment during onboarding
- No FR for biometric login (bypass password with biometric)
- No failure modes: device doesn't support biometrics, user denies permission, biometric changed (enrollment invalidated)
- No SRD for: how is biometric auth linked to account (local device key? server token?)
- No spec for: what happens if biometric fails N times (fall back to password? lock?)

**Affected FRs:** None (feature is undocumented)

**Affected test case:** TC-ACCT-004 — BLOCKED

**Required BA action:** Write FR-AUTH-08: Biometric Authentication
- Scope: optional enrollment during onboarding; available as alternative to password login
- Failure modes: device not supported → skip; user denies → skip; biometric changed → re-enroll
- Security note: biometric unlocks a locally stored encrypted token, not transmitted to server
- iOS: Face ID / Touch ID; Android: Fingerprint / Face Unlock

**Severity:** CRITICAL — An implemented but undocumented feature. QA cannot test it. Security cannot review it. Engineering may implement it incorrectly without a spec.

---

### GAP-QA-12 — DOB Correction / False DOB Dispute Resolution Undefined

**Description:**
FR-AGE-01 edge case section acknowledges: "User provides false DOB — legal disclaimer shown." The system relies on the disclaimer as its only protection against false age entry. No process exists for:
- A user who entered a false DOB (e.g., entered 2000 instead of 2010) and wants to correct it
- An admin who detects a minor with FULL_ACCESS based on false DOB
- Any age verification escalation mechanism

**What is missing:**
- No FR for DOB self-correction (is it allowed? How? With what proof?)
- No admin panel FR for overriding user age tier
- No process for external age verification (e.g., ID upload)

**Affected FRs:** FR-AGE-01 (edge case only), FR-ACCT-01 (profile editing)

**Affected test case:** TC-ACCT-006 — BLOCKED

**Required BA action:** Define dispute/correction flow:
- V1 option (recommended): DOB is locked after first entry. If user wants to change it, they must contact support (in-app "Contact Support" → manual review). No automated correction.
- Add FR-ACCT-DOB-01: DOB Correction Request (support ticket flow)
- Note for compliance: if a user is suspected of false DOB (e.g., reported by another user), define internal process

**Severity:** MEDIUM — Compliance risk if minors gain FULL_ACCESS. Not a day-1 UX blocker, but a compliance gap.

---

## Gap Resolution Timeline

| Gap ID | Severity | Blocking | Recommended Resolution |
|--------|----------|----------|----------------------|
| GAP-QA-01 | CRITICAL | TC-AUTH-020 | BA writes FR-AUTH-07 before engineering sprint |
| GAP-QA-05 | CRITICAL | TC-PT-025 | BA adds E-PT-400 + flow to FRD/SRD v2.3 |
| GAP-QA-09 | CRITICAL | TC-NOTIF-003 | BA writes FR-NOTIF-01 deep link routing |
| GAP-QA-10 | CRITICAL | TC-SOC-003 | BA picks 280 or 500; updates both FRD + SRD |
| GAP-QA-11 | CRITICAL | TC-ACCT-004 | BA writes FR-AUTH-08 biometric |
| GAP-QA-02 | HIGH | TC-AUTH-021 | BA writes session policy FR/SRD section |
| GAP-QA-04 | HIGH | TC-AGE-003 | BA specifies timezone (recommend UTC+7) |
| GAP-QA-06 | HIGH | TC-PT-029 | BA adds TTL after PO decision Q2 |
| GAP-QA-08 | HIGH | TC-MKT-004 | BA clarifies already-crossed alert behavior |
| GAP-QA-03 | MEDIUM | TC-ONBOARD-005 | BA fixes step count per path |
| GAP-QA-07 | MEDIUM | TC-PT-035 | BA amends FR-AI-01 with LEARN_MODE scope |
| GAP-QA-12 | MEDIUM | TC-ACCT-006 | BA writes DOB correction process |

---

*Gap report produced by QA Team — 2026-04-20.*
*All CRITICAL gaps must be resolved before development begins. HIGH gaps must be resolved before QA sign-off.*

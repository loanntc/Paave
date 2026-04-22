## Module I: Brokerage Partner Integration (V1.x)

> **Purpose:** Bridge a graduated paper trader into a real account at a licensed securities-company partner. Paave never executes orders, holds funds, or stores real balances — it publishes a partner directory and hands users off. Gated tight: 18+, Trader Tier 3+, ≥ 30 paper trades (BR-BRK-02). All surfaces must render BR-DISC-05.

---

#### FR-BRK-01 — Partner Directory

- **Actor:** FULL_ACCESS User who is 18+, Tier 3+, and has ≥ 30 paper trades
- **Description:** In-app screen listing licensed brokerage partners scoped to the user's market(s). Each partner card shows: partner legal name, license number, supported markets, fee highlights, status (green/amber/red — onboarding availability), and "Open real account" CTA. Sorted by an editorial relevance score; tie-break by partner name alphabetically.
- **Key Rules:**
  - VN users see only VN-licensed partners; KR users see only KR-licensed partners; users flagged for both markets see both lists tabbed.
  - BR-DISC-05 rendered at the top of the screen in the user's active language, with placeholder [Partner] substituted per partner card.
  - Partners flagged "red" (onboarding paused) still render but with CTA disabled and status string shown.
  - No partner may appear without satisfying BR-BRK-05 (signed agreement, verified license, callback contract load-tested).
- **Acceptance Criteria:**
  - Given a 25-year-old VN user with Tier 4 and 50 paper trades → partner directory reachable from profile; VN partners listed.
  - Given a 17-year-old Learn Mode user → directory is not reachable and no CTA surfaces anywhere in the app.
- **Edge Cases:** Empty directory (no partner live) → directory entry point is hidden entirely from the profile.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-02 — Brokerage CTA Placement

- **Actor:** FULL_ACCESS User meeting BR-BRK-02 eligibility
- **Description:** "Open real account with partner" CTAs appear contextually: (a) on the Paper Portfolio dashboard header when the user has been Tier 3+ for ≥ 7 days, (b) on Stock Detail pages as a secondary CTA below the paper "Buy" button, (c) in the profile menu. Every CTA tap opens a confirmation sheet with BR-DISC-05 before handoff.
- **Key Rules:**
  - CTA impression and tap events are logged for BO-13 measurement.
  - Ineligible users (under 18, below Tier 3, < 30 paper trades) must never render any of these CTAs at any level of the UI (including markup; not just hidden via CSS).
  - Confirmation sheet requires an explicit tap on "Continue to [Partner]"; a single-tap launch is not allowed.
- **Acceptance Criteria:**
  - Given eligibility met + tap CTA → confirmation sheet with BR-DISC-05 appears; tapping "Continue" transitions to handoff.
  - Given eligibility not met → CTA not rendered; route direct access returns 404.
- **Edge Cases:** User's Tier drops below 3 after CTA displayed → on next screen load, CTA no longer rendered.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-03 — Account-Link Handoff

- **Actor:** Eligible User (via FR-BRK-02)
- **Description:** Tapping "Continue to [Partner]" launches the partner's onboarding surface — preferably a partner-native deep link on mobile, falling back to an in-app web view with a fixed Paave chrome (close button + partner legal name + BR-DISC-05 pinned bottom). Handoff payload: `{ paave_user_id (opaque), market, optional ticker_context }`. No credentials, no DOB, no email, no paper balances transmitted.
- **Key Rules:**
  - Payload schema is whitelisted at the network layer; any extra field is stripped before send. Violations are P0 bugs.
  - Web-view fallback may not share cookies with the Paave app session.
  - User can cancel at any time (top-left close) and return to Paave; no ghost state persisted.
  - On successful partner callback (FR-BRK-05), the user's Paave profile shows a "Linked at [Partner]" badge; on failure, the partner's error message is surfaced verbatim.
- **Acceptance Criteria:**
  - Given eligible user confirms handoff → partner flow opens; network audit shows payload = whitelisted fields only.
  - Given user cancels mid-flow → returned to prior Paave screen; no linked-account record created.
- **Edge Cases:** Partner deep-link missing on device → fall back to web view; web-view load failure → "Couldn't reach [Partner]. Please try again." No silent retry.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-04 — Ticker Deep-Link into Partner

- **Actor:** Linked User (completed FR-BRK-03 for a partner)
- **Description:** On a Stock Detail page for a supported market, a secondary "Open [TICKER] at [Partner]" CTA deep-links the user into the partner's order-entry screen for that ticker. Paave never pre-fills price, quantity, or direction.
- **Key Rules:**
  - Only rendered if the user has a linked account for a partner that supports this ticker's market.
  - BR-DISC-05 rendered on the confirmation sheet before deep-link.
  - No order payload — only the opaque user ID and ticker symbol.
  - If partner rejects the deep link (unsupported ticker, maintenance), Paave shows the partner's error verbatim and remains on the Paave screen.
- **Acceptance Criteria:**
  - Given linked VN user on a HOSE ticker → deep-link CTA visible; tapping opens partner order-entry screen for that ticker.
  - Given user not linked → deep-link CTA not rendered.
- **Edge Cases:** Ticker exists on Paave but not at partner → deep-link CTA not rendered.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-05 — Partner Callback & Linked-Account Status

- **Actor:** System (Paave backend) receiving callback from partner
- **Description:** Partner calls back to Paave once account creation succeeds (or definitively fails). Callback payload accepted by Paave: `{ paave_user_id, partner_id, linked_at_timestamp, status (linked/declined), optional_reason_code }`. On `status=linked`, Paave renders the "Linked at [Partner]" badge on the user's profile. Any additional fields (real balance, holdings, real order IDs) must be ignored and logged as a compliance violation.
- **Key Rules:**
  - Callback endpoint is partner-authenticated (HMAC or mTLS); rejects unsigned or expired requests.
  - BR-BRK-07 attribution records (anonymous ticker bucket) are emitted from this handler; real-money amounts must never be written to any Paave table.
  - Linked-account status is reversible via user action: user can "Unlink" from Settings; Paave sends an unlink event to partner and removes the badge.
- **Acceptance Criteria:**
  - Given valid `linked` callback → profile shows "Linked at [Partner]" within 10 seconds.
  - Given callback containing a `real_balance` field → field is dropped, compliance-violation event logged, status still updated if otherwise valid.
- **Edge Cases:** Partner sends duplicate callback → idempotent on (paave_user_id, partner_id); first write wins.
- **Priority:** P1 (V1.x)

---

#### FR-BRK-06 — Paper-to-Real Attribution (Anonymous)

- **Actor:** System (analytics pipeline)
- **Description:** For BO-13 measurement only, Paave records whether a newly linked user's callback arrived within 30 days of the linked ticker appearing in that user's paper watchlist or paper portfolio. Attribution records: `{ paave_user_id_hash, partner_id, ticker, linked_at_bucket_hour, prior_paper_signal (watchlist|portfolio|none) }`.
- **Key Rules:**
  - No real-money amounts, real order IDs, or partner-side user IDs are stored.
  - Records are purged after 180 days.
  - Audit log immutable; quarterly audit by Legal + Engineering confirms BR-BRK-07 compliance.
- **Acceptance Criteria:**
  - Given user had TICKER in watchlist + links account at partner → attribution row written with `prior_paper_signal = watchlist`.
  - Schema audit: no column in attribution table accepts currency or amount-typed values.
- **Edge Cases:** User unlinks and re-links within 30 days → attribution rows are additive; no overwrite.
- **Priority:** P1 (V1.x)

---


# FRD-16: Brokerage Integration

Version: 2.4 | Date: 2026-04-21 | Linked BRD: brd-paave-v2.2.md | Author: Paave Product Team

---

> **IMPORTANT: ALL FEATURES IN THIS MODULE ARE DEFERRED TO V1.x.**
>
> None of the requirements below ship in V1 launch. They are fully specified here so that: (a) the data model is designed with brokerage integration in mind from day one, (b) the V1.x implementation team has a complete, unambiguous spec to build from, and (c) API contracts can be reviewed for compliance before any partner agreement is signed.
>
> V1 launch requirement: brokerage CTA must not appear in any surface for any user (LEARN_MODE or FULL_ACCESS). The brokerage module is a hard runtime gate, not a feature flag hidden via CSS.

---

## Module Description

The Brokerage Integration module enables eligible Paave users (FULL_ACCESS, Trader Tier 3+, ≥30 paper trades) to discover licensed brokerage partners and be handed off to those partners for real-money account opening. Paave does NOT execute real-money trades (BR-30). Paave acts as a discovery and handoff surface only. Attribution is anonymous and aggregate. This document is self-contained; a developer reading only this file has everything needed to build the V1.x brokerage integration.

---

## 1. Feature Overview

| Field | Value |
|---|---|
| Feature | Brokerage Integration (V1.x) |
| Primary Actor | FULL_ACCESS user, Trader Tier 3+, ≥30 paper trades |
| Goal | Discover licensed brokerage partners and be handed off to open a real-money account |
| Trigger | CTA in Paper Portfolio dashboard header, Stock Detail page, or Profile menu |
| Eligibility Gate | Age 18+ (FULL_ACCESS), Trader Tier ≥3, ≥30 completed paper trades (BR-31) |
| Paave Role | Discovery and attribution only; no real-money order execution |

---

## 2. Functional Requirements

---

### FR-BRK-01: Partner Directory

- **Actor**: Eligible authenticated user (FULL_ACCESS, Tier 3+, ≥30 paper trades)
- **Description**: A screen listing licensed brokerage partners available for the user's market(s). Requirements: Only partners with a signed agreement, verified license, AND a successfully tested callback integration (BR-BRK-05) may appear. No partner appears without all three conditions met. Partners listed by user's market: VN users see VN-licensed partners; KR users see KR-licensed partners; users with both markets see a tabbed view. Sorting: editorial relevance rank (set by Paave admin); tie-break alphabetical by legal name. Each partner card: legal name, license number, supported markets, fee highlights, onboarding status. Onboarding status: green (active/accepting), amber (limited/waitlist), red (paused/not accepting). Red status: CTA button disabled; status string shown (e.g., "Currently not accepting new accounts"). If no partners are available for the user's market(s): the Partner Directory entry point in Profile is hidden (not grayed out — not in DOM). BR-DISC-05 investment disclaimer appears at top of Partner Directory (see FR-LEGAL-04).

- **Input**:
  - User's `feature_tier`, `trader_tier`, paper trade count
  - User's preferred market(s)
  - Partner list from server (filtered by market and eligibility)
- **Output**:
  - List of eligible partner cards sorted by editorial relevance
  - BR-DISC-05 disclaimer at top
  - Red-status partners: card shown with CTA disabled + status text
  - Empty state: entry point hidden from Profile menu
- **Precondition**: User is FULL_ACCESS, Tier 3+, ≥30 paper trades. Partner Directory entry point is accessible.
- **Postcondition**: Partner directory rendered with correct partners and statuses.

#### Partner Card Specification

| Field | Details |
|---|---|
| Legal name | Full registered legal name |
| License number | Regulatory license number |
| Supported markets | Badge per market (e.g., "HOSE/HNX", "KOSPI") |
| Fee highlights | Up to 3 bullet points (e.g., "0% commission on first 10 trades") |
| Onboarding status | Green / Amber / Red indicator + status label |
| CTA | "Open Account at [Partner]" — disabled if Red status |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-BRK-01-01 | Eligible VN user | Opens Partner Directory | VN-licensed partners shown; KR partners not shown |
| AC-BRK-01-02 | Partner has Red status | Partner card renders | CTA disabled; status string shown (e.g., "Currently not accepting new accounts") |
| AC-BRK-01-03 | Partner lacks signed agreement OR unverified license OR untested callback | Partner record check | Partner NOT shown in directory under any circumstances |
| AC-BRK-01-04 | No partners available for user's market | Profile menu | "Partner Directory" entry not in DOM |
| AC-BRK-01-05 | BR-DISC-05 disclaimer | Directory opens | Disclaimer at top of screen before partner list |
| AC-BRK-01-06 | User is LEARN_MODE | Any state | Partner Directory entry point not in DOM anywhere |
| AC-BRK-01-07 | User is FULL_ACCESS but Tier 2 | Any state | Partner Directory entry point not in DOM anywhere |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Partner's license is revoked after directory is shown | Partner disappears on next page refresh (≤5 min); server-side filter always applied |
| User's paper trade count drops below 30 (if rollback occurs) | Eligibility re-evaluated at next login; directory access revoked |
| User has VN + KR markets | Tabbed view: "Vietnam" tab | "Korea" tab; each tab filtered to respective market's licensed partners |

- **Priority**: P0 for V1.x (deferred from V1 launch)

---

### FR-BRK-02: Brokerage CTA Placement

- **Actor**: Eligible authenticated user + System (eligibility gate)
- **Description**: For eligible users (FULL_ACCESS, Tier 3+, ≥30 paper trades), the brokerage CTA appears in exactly 3 locations: (a) Paper Portfolio dashboard header — only after user has been Tier 3+ for ≥7 consecutive days (timing gate). (b) Stock Detail — secondary CTA below paper "Buy" button. (c) Profile menu — "Explore Brokerage Partners" menu item. Every CTA tap opens a confirmation sheet (see FR-BRK-03 confirmation sheet spec) with BR-DISC-05 before any handoff. CTA impression (view) and tap events are logged for BO-13 business measurement. For INELIGIBLE users (LEARN_MODE, Tier <3, <30 trades): brokerage CTA must NOT be rendered in ANY UI surface, including markup. Not display:none. Not visibility:hidden. Not in the DOM.
- **Input**:
  - User's eligibility state: FULL_ACCESS, `trader_tier`, paper trade count, days at Tier 3+
  - CTA location context (portfolio dashboard | stock detail | profile menu)
- **Output**:
  - CTA rendered for eligible users only
  - CTA tap → confirmation sheet with BR-DISC-05 before handoff
  - Impression + tap events logged
  - Ineligible users: CTA completely absent from DOM
- **Precondition**: V1.x feature is enabled. User is eligible.
- **Postcondition**: CTA shown and interactive for eligible users. Completely absent for ineligible.

#### CTA Timing Gate for Portfolio Dashboard

| Condition | CTA Shown |
|---|---|
| User reached Tier 3+ today (day 0) | NOT shown |
| User has been Tier 3+ for 1–6 days | NOT shown |
| User has been Tier 3+ for ≥7 consecutive days | SHOWN |
| User drops below Tier 3 then recovers | Timer restarts from day 0 |

#### CTA Text by Location

| Location | CTA Label |
|---|---|
| Portfolio Dashboard header | "Ready for the real thing? Explore brokerages →" |
| Stock Detail (secondary) | "Open [TICKER] at a real broker" |
| Profile Menu | "Explore Brokerage Partners" |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-BRK-02-01 | Eligible user; been Tier 3+ for 8 days | Portfolio Dashboard opens | Brokerage CTA shown in header |
| AC-BRK-02-02 | Eligible user; been Tier 3+ for 6 days | Portfolio Dashboard opens | CTA NOT in DOM |
| AC-BRK-02-03 | Eligible user | Stock Detail for VIC opens | Secondary CTA below paper Buy button |
| AC-BRK-02-04 | LEARN_MODE user | Any screen | No brokerage CTA in DOM anywhere |
| AC-BRK-02-05 | Eligible user taps any CTA | Tap action | Confirmation sheet with BR-DISC-05 opens; CTA tap logged |
| AC-BRK-02-06 | CTA is shown | User views it without tapping | Impression logged |

- **Priority**: P0 for V1.x

---

### FR-BRK-03: Account-Link Handoff

- **Actor**: Eligible user + Brokerage partner system
- **Description**: After confirming on the confirmation sheet (tapping "Continue to [Partner]"), the user is handed off to the partner. Handoff method priority: (1) Partner native deep-link (preferred); (2) In-app web view with Paave chrome if no deep-link available. In-app web view chrome requirements: close button (top-right); partner's legal name shown in chrome header; BR-DISC-05 disclaimer pinned to bottom of chrome (not scrollable away). The handoff payload is a whitelist of allowed fields only (BR-32): `{ paave_user_id (opaque, hashed), market, optional ticker_context }`. NEVER included: email, DOB, password, name, paper balance, real balance, any credential. In-app web view: no cookie sharing with Paave session (isolated web view cookie jar). User can cancel via close button at any time → returns to Paave; no ghost state. On successful partner callback (FR-BRK-05): "Linked at [Partner]" badge shown on Profile.
- **Input**:
  - User confirmation: "Continue to [Partner]"
  - Handoff payload: `{ paave_user_id_opaque, market, ticker_context? }`
  - Partner's deep-link URL or web onboarding URL
- **Output**:
  - Partner native app opened via deep-link OR in-app web view opened
  - No PII transmitted beyond whitelist (BR-32)
  - No cookie sharing (isolated web view)
  - Cancel → return to Paave; clean state
  - Successful callback → "Linked at [Partner]" badge
- **Precondition**: User confirmed on confirmation sheet. Eligible user.
- **Postcondition**: Handoff initiated. User in partner flow or returned to Paave.

#### Confirmation Sheet Specification

| Element | Content |
|---|---|
| Title | "You're about to leave Paave" |
| BR-DISC-05 disclaimer | Full text with partner name and license substituted (first element) |
| Body text | "Paave will send [Partner Legal Name] only your anonymized user ID and preferred market. No personal information will be shared." |
| Primary CTA | "Continue to [Partner Legal Name]" |
| Secondary | "Cancel" — dismisses sheet; no action |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-BRK-03-01 | Partner has native deep-link | User confirms | Partner native app opened via deep-link |
| AC-BRK-03-02 | Partner has no native deep-link | User confirms | In-app web view opened with Paave chrome |
| AC-BRK-03-03 | In-app web view active | Any state | Close button visible; partner legal name in chrome header; BR-DISC-05 pinned at bottom |
| AC-BRK-03-04 | Handoff payload inspected | Any | Contains only: opaque paave_user_id, market, optional ticker — NO email, DOB, name, balance |
| AC-BRK-03-05 | User taps "Cancel" on confirmation sheet | Tap | Sheet dismissed; user remains in Paave at same screen |
| AC-BRK-03-06 | User closes in-app web view | Close button tap | Returns to Paave at prior screen; no partial state |
| AC-BRK-03-07 | Partner web view attempts Paave cookie access | Network inspection | No Paave session cookies accessible (isolated cookie jar) |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Partner deep-link fails (app not installed) | Fall back to in-app web view; no error shown to user |
| Partner's web URL times out during load | Web view shows timeout error; close button remains functional |
| User backgrounds app mid-handoff | In-app web view state paused; resumes on foreground; Paave session unaffected |

- **Priority**: P1 for V1.x

---

### FR-BRK-04: Ticker Deep-Link into Partner

- **Actor**: Eligible user with linked brokerage account
- **Description**: On the Stock Detail screen for tickers supported by a partner that the user has already linked (successful FR-BRK-05 callback received), a secondary CTA appears: "Open [TICKER] at [Partner]." This CTA is shown only if: (a) user is eligible, (b) user has a linked account at that partner, (c) the partner supports trading that specific ticker's market. Tapping the CTA: shows confirmation sheet with BR-DISC-05. After confirmation: deep-link or web view opened. The payload contains only opaque user ID + ticker symbol — no order details, no quantity, no price. If the partner rejects the deep-link: show partner's error message verbatim (no Paave error overlay). If ticker is not supported by any linked partner: CTA not rendered.
- **Input**:
  - Stock Detail ticker and market
  - User's linked partner accounts
  - Partner's supported ticker list
- **Output**:
  - CTA rendered only when all conditions met
  - Confirmation sheet with BR-DISC-05 on tap
  - Partner payload: `{ paave_user_id_opaque, ticker_symbol }`
  - Partner error shown verbatim on rejection
- **Precondition**: User is eligible. User has linked at least one brokerage. Current ticker supported by linked partner.
- **Postcondition**: User in partner flow for specific ticker OR partner error shown.

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-BRK-04-01 | User has linked VN broker; viewing VIC (VN ticker) | Stock Detail opens | "Open VIC at [Partner]" secondary CTA shown |
| AC-BRK-04-02 | User has no linked brokers | Stock Detail opens | Ticker deep-link CTA not rendered |
| AC-BRK-04-03 | User has KR broker linked; viewing VIC (VN ticker) | Stock Detail opens | CTA not rendered (partner doesn't support VN tickers) |
| AC-BRK-04-04 | User confirms handoff | "Continue to [Partner]" tapped | Payload sent: opaque user ID + ticker; no other fields |
| AC-BRK-04-05 | Partner rejects deep-link | Rejection received | Partner's error message shown verbatim in alert |

- **Priority**: P1 for V1.x

---

### FR-BRK-05: Partner Callback and Linked-Account Status

- **Actor**: Brokerage partner system (inbound) + Paave server
- **Description**: After a user completes onboarding at the partner's system, the partner calls back to Paave's callback endpoint. Callback payload: `{ paave_user_id, partner_id, linked_at_timestamp, status: "linked" | "declined", optional_reason_code }`. On `status = linked`: "Linked at [Partner]" badge shown on user's Profile within 10 seconds. On `status = declined`: no badge; optional_reason_code may be displayed as generic "Setup not completed. Try again." (never show raw reason code to user). Any extra fields in the callback payload (e.g., real_balance, real_order_ids) MUST be dropped immediately and logged as a compliance violation. The callback endpoint must authenticate the partner request via HMAC signature or mTLS. Unsigned or expired requests are rejected (HTTP 401). The operation is idempotent on (paave_user_id, partner_id) — duplicate callbacks with same status return HTTP 200 without side effects. User can "Unlink" from Settings → Linked Brokerages → [Partner] → "Unlink" → Paave sends unlink event to partner + removes badge.
- **Input**:
  - Partner HTTP callback: `{ paave_user_id, partner_id, linked_at_timestamp, status, optional_reason_code }`
  - HMAC signature or mTLS certificate (for authentication)
- **Output**:
  - `status = linked`: badge shown on Profile within 10s; `brokerage_links` record created
  - `status = declined`: no badge; generic error message for user if applicable
  - Extra fields: dropped silently + compliance violation log entry created
  - Unsigned/expired request: HTTP 401; no state change
  - Duplicate (idempotent): HTTP 200; no side effect
- **Precondition**: Partner has signed agreement, verified license, tested callback (BR-BRK-05).
- **Postcondition**: Linked status reflected on Paave Profile. Compliance violation logged if extra fields received.

#### Callback Endpoint Specification

```
POST /api/v1/broker/callback
Authentication: HMAC-SHA256 signature in header (X-Paave-Signature) OR mTLS
Content-Type: application/json

Request (allowed fields):
{
  "paave_user_id": "string (opaque hash)",
  "partner_id": "string",
  "linked_at_timestamp": "ISO 8601 UTC datetime",
  "status": "linked" | "declined",
  "reason_code": "string (optional)"
}

Response (success):
HTTP 200
{ "received": true }

Response (unauthorized):
HTTP 401
{ "error": "Invalid signature" }

Response (malformed):
HTTP 400
{ "error": "Missing required field: [field]" }
```

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-BRK-05-01 | Valid signed callback; status = linked | Callback received | Badge shown on Profile within 10s; record created |
| AC-BRK-05-02 | Valid signed callback; status = declined | Callback received | No badge; compliance record; generic user message if in-flow |
| AC-BRK-05-03 | Callback contains `real_balance` field | Callback received | `real_balance` field dropped; compliance violation log entry created; status still processed |
| AC-BRK-05-04 | Callback without valid HMAC/mTLS | Callback received | HTTP 401; no state change |
| AC-BRK-05-05 | Duplicate callback (same paave_user_id + partner_id, status = linked) | Callback received | HTTP 200; no duplicate record created; no badge duplication |
| AC-BRK-05-06 | User clicks "Unlink" on Profile | Tap + confirm | Paave sends unlink event to partner; badge removed from Profile |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Badge display takes >10s due to server load | Push notification fallback: "Your [Partner] account is now linked." sent via push |
| Partner sends callback for a paave_user_id that does not exist | HTTP 404; log as anomaly; do not create ghost user record |
| User unlinks then re-links within 1 hour | New link record created; idempotent on the new (paave_user_id, partner_id, linked_at_timestamp) |

- **Priority**: P0 for V1.x (required before any partner goes live)

---

### FR-BRK-06: Paper-to-Real Attribution (Anonymous)

- **Actor**: System (background analytics)
- **Description**: For BO-13 business objective measurement, Paave tracks anonymous, aggregate attribution between paper trading activity and brokerage linkage. Attribution record created when: user links a brokerage account (FR-BRK-05 callback = linked) AND the linked ticker context was in the user's paper watchlist or paper portfolio within the prior 30 days. Attribution record structure (compliant with BR-34): `{ paave_user_id_hash (SHA-256 of opaque user ID — double-blinded), partner_id, ticker, linked_at_bucket_hour (truncated to hour, not exact timestamp), prior_paper_signal: "watchlist" | "portfolio" | "none" }`. NOT stored: real-money amounts, real order IDs, partner-side user IDs, exact timestamps, full paave_user_id. Records purged after 180 days. Attribution records are append-only; unlink + re-link within 30 days creates additive rows (no overwrite). Audit log immutable. Quarterly audit by Legal + Engineering.
- **Input**:
  - Successful brokerage linkage event (from FR-BRK-05)
  - User's paper watchlist and portfolio state (30-day lookback)
  - ticker_context from handoff payload
- **Output**:
  - Attribution record created (anonymized)
  - No real-money data stored
  - Record purged at 180 days
- **Precondition**: Brokerage linkage is confirmed (status = linked). V1.x is live.
- **Postcondition**: Attribution record exists for BO-13 reporting. No PII in attribution table.

#### Attribution Record Schema

| Field | Type | Constraint |
|---|---|---|
| `id` | UUID | Primary key |
| `paave_user_id_hash` | SHA-256 string | SHA-256(SHA-256(paave_user_id)) — double-blinded |
| `partner_id` | string | Partner identifier |
| `ticker` | string | Ticker symbol from context |
| `linked_at_bucket_hour` | datetime | Truncated to hour (YYYY-MM-DD HH:00:00 UTC) |
| `prior_paper_signal` | enum | "watchlist" \| "portfolio" \| "none" |
| `created_at` | datetime | Record creation timestamp |
| `purge_at` | datetime | `created_at + 180 days` |

#### Acceptance Criteria

| # | Given | When | Then |
|---|---|---|---|
| AC-BRK-06-01 | User links brokerage; ticker VIC was in paper watchlist 15 days ago | Callback received | Attribution: `prior_paper_signal = "watchlist"`, ticker = "VIC" |
| AC-BRK-06-02 | User links brokerage; no ticker in paper activity | Callback received | Attribution: `prior_paper_signal = "none"` |
| AC-BRK-06-03 | Attribution record at 180 days | Purge batch runs | Record deleted from attribution table |
| AC-BRK-06-04 | Attribution record inspected | Audit | No paave_user_id (full), no real_balance, no partner_user_id present |
| AC-BRK-06-05 | User unlinks then re-links within 30 days | Second link callback | New attribution row appended; original row not modified |

#### Edge Cases

| Case | Expected Behavior |
|---|---|
| Ticker context not provided in handoff | `ticker = "unknown"`; `prior_paper_signal` cannot be computed; record still created with "none" |
| User's paper portfolio history is deleted before attribution lookup | `prior_paper_signal = "none"` (cannot confirm); record created |
| BO-13 report queries attribution table | Aggregate queries only; no individual rows returned to any report consumer |

- **Priority**: P1 for V1.x

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-30 | Paave never executes real-money orders; Paave is discovery and handoff only | Any feature that creates, submits, or manages real orders = immediate rollback; legal review required |
| BR-31 | Brokerage CTA eligibility gate: FULL_ACCESS + Trader Tier 3+ + ≥30 paper trades | Ineligible user sees CTA = P0 bug; CTA must be absent from DOM |
| BR-32 | Handoff payload whitelist: `{ paave_user_id_opaque, market, optional ticker_context }` only | Any non-whitelisted field in payload = compliance violation; logged and blocked |
| BR-33 | BR-DISC-05 disclaimer required at every brokerage CTA interaction point | Missing disclaimer at CTA = brokerage CTA disabled for that partner |
| BR-34 | Attribution is anonymous; no real-money amounts, no real order IDs, no partner-side user IDs | Any real-money data in attribution table = P0 compliance violation; immediate purge and legal review |
| BR-BRK-05 | Partner must have signed agreement + verified license + tested callback before appearing in directory | Partner appearing without all three = P0; immediate removal from directory |

---

## 4. UI/UX Notes

- **Eligibility gate enforcement**: The gate check (FULL_ACCESS + Tier 3+ + ≥30 trades) happens server-side at the API level. The client also hides the CTA DOM elements for ineligible users, but server-side enforcement is the authoritative gate.
- **V1 guard**: During V1 (pre-V1.x), the server must return 404 or 403 on any brokerage API endpoint. The client module is not built for V1 — no dead code.
- **"Linked at [Partner]" badge**: Shown on Profile page next to the user's display name or in a "Linked Brokerages" section. Design: partner logo + "Linked at [Partner Name]" text + link icon. Tapping opens the Linked Brokerages management screen.
- **Unlink flow**: Requires confirmation dialog "Are you sure you want to unlink [Partner]? This does not close your account at [Partner]." Primary: "Unlink"; Secondary: "Cancel."
- **Partner status colors**: Green = `#00C853` (accepting); Amber = `#FFA000` (limited); Red = `#D50000` (paused).
- **Confirmation sheet**: Bottom sheet, not full-screen. BR-DISC-05 is the first element (above the fold). "Continue to [Partner]" primary button (red background to signal external action). "Cancel" secondary button.
- **In-app web view chrome**: Platform-specific native navigation bar; back/forward buttons disabled; only close button active; partner legal name in title position; BR-DISC-05 bar pinned at bottom with semi-transparent background.

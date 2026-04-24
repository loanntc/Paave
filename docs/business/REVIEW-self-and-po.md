# Review Document — v2.4 (Authoritative)
## Self-Review + Product Owner Review

**Version:** 2.4
**Date:** 2026-04-21
**Author:** Business Analysis Team
**Documents under review:**
- BRD-addendum-v2.3.md
- FRD-module-B-v2.3.md
- SRD-order-engine-v2.3.md
- FRD-gaps-v2.4.md (new — resolves 12 QA gaps)
- QA-gap-report-v1.0.md (companion)

---

## PART 1 — SELF-VALIDATION (BA Checklist)

### v2.3 Validation Summary

All v2.3 documents (BRD-addendum, FRD-module-B, SRD-order-engine) passed the BA self-validation checklist with one flag: two "TBD" entries remained in the risk register (RISK-PT-04 — requiring PO decisions). All other checklist items were PASS across the three documents. Key findings from v2.3 validation:

- **SRD/FRD consistency fixed:** Limit orders expire after 30 days (FRD BR-PT-12); SRD GTC wording corrected.
- **Newly listed stock price band:** ±20% band for HOSE newly listed stocks (first 3 sessions) added; ticker schema requires `is_newly_listed` flag.
- **ATO/ATC no-match edge case:** Defined in FR-PT-07.1; formal error code E-PT-400 added in v2.4.
- **UPCoM order type restriction:** FR-PT-07.3 "LO only" — UI must detect exchange and gate order type options accordingly.
- **KR/Global Trader Score risk:** RISK-PT-04 flagged for PO decision (see Decision #3 below).
- **Partial fills:** Explicitly excluded from V1; FILL_FAILED if balance insufficient at fill time.
- **Midday break queuing:** Orders accepted during 11:30–13:00 ICT break and queued; UX note flagged for PO (see Q3 below).

---

### v2.4 Document Self-Validation

| Checklist Item | FRD-gaps-v2.4.md | Status |
|----------------|-----------------|--------|
| Can a developer build without asking questions? | Yes — all 12 new/amended FRs have full input/output/precondition/postcondition | ✅ PASS |
| Can QA write test cases directly? | Yes — 14 previously BLOCKED test cases can now be written | ✅ PASS |
| Are all business rules isolated and numbered? | Yes — BR-AUTH-05..09, BR-AGE-05, BR-SOC-03, BR-PT-16, BR-NOTIF-01, BR-ACCT-DOB-01 | ✅ PASS |
| Are all edge cases listed? | Yes — each FR has explicit edge case table | ✅ PASS |
| Are all limits defined? | Yes — all TTLs, counts, character limits, device limits are numeric | ✅ PASS |
| Are all error states defined? | Yes — E-1010 to E-ACCT-402 (9 new codes) | ✅ PASS |
| Traceability to business objectives? | Yes — FR-AUTH-07/08 → BO-01; FR-NOTIF-01 → BO-09; social amendment → BO-11 | ✅ PASS |
| Any vague words remaining? | None | ✅ PASS |

**Overall v2.4 self-validation: ALL PASS.**

---

### Gap Resolution Status

| Gap ID | Description | Resolution | Status |
|--------|-------------|-----------|--------|
| GAP-QA-01 | Forgot Password | FR-AUTH-07 (new) | ✅ RESOLVED |
| GAP-QA-02 | Multi-device sessions | FR-AUTH-09 (new) | ✅ RESOLVED |
| GAP-QA-03 | Onboarding step count | FR-08 amendment | ✅ RESOLVED |
| GAP-QA-04 | DOB timezone | FR-AGE-04 amendment (UTC+7) | ✅ RESOLVED |
| GAP-QA-05 | ATO/ATC no-match | E-PT-400 + FC-PT-25 + flow | ✅ RESOLVED |
| GAP-QA-06 | QUEUED_AFTER_HOURS TTL | BR-PT-16 (48h TTL) | ✅ RESOLVED |
| GAP-QA-07 | AI card LEARN_MODE | FR-AI-01 amendment | ✅ RESOLVED |
| GAP-QA-08 | Already-crossed alert | EC-ALT-01 + alert modes | ✅ RESOLVED |
| GAP-QA-09 | Deep link unauthenticated | FR-NOTIF-01 (new) | ✅ RESOLVED |
| GAP-QA-10 | Post char limit (FRD/SRD conflict) | FR-SOC-03 amendment → 500 chars | ✅ RESOLVED |
| GAP-QA-11 | Biometric auth | FR-AUTH-08 (new) | ✅ RESOLVED |
| GAP-QA-12 | DOB correction process | FR-ACCT-DOB-01 (new) | ✅ RESOLVED |

All 12 gaps are resolved. The 14 BLOCKED QA test cases can now proceed to WRITTEN status.

---

### Cross-Document Consistency Check (v2.3 + v2.4)

| Consistency Point | Check | Status |
|-------------------|-------|--------|
| Post character limit: FRD v2.2 FR-SOC-03 (was 280) vs SRD §4.10 (500) | v2.4 amendment: authoritative = 500; FRD amended; SRD was already correct | ✅ RESOLVED |
| Limit order expiry: FRD (30 days) vs SRD (GTC) | Resolved in v2.3; 30-day expiry authoritative | ✅ CARRIED FORWARD |
| QUEUED_AFTER_HOURS lifetime: undefined in v2.3 | v2.4: 48h TTL added to BR-PT-16 and Expiry Cron | ✅ RESOLVED |
| ATO/ATC no-match: E-PT-400 referenced in v2.3 review but not defined | v2.4: E-PT-400 formally defined with full flow | ✅ RESOLVED |
| Biometric screen in codebase without FRD | v2.4: FR-AUTH-08 written | ✅ RESOLVED |
| Age boundary timezone: unspecified in v2.3 | v2.4: UTC+7 specified in FR-AGE-04 amendment + BR-AGE-05 | ✅ RESOLVED |

---

## PART 2 — PRODUCT OWNER REVIEW

**TO:** Product Owner
**FROM:** Business Analysis Team
**DATE:** 2026-04-21
**RE:** v2.3 + v2.4 Documents — Current Decision Status

---

### Background

The v2.3 analysis found 12 gaps in the existing documents (6 critical, 6 medium). All 12 gaps have been addressed in FRD-gaps-v2.4.md. Three decisions from v2.3 remain pending PO sign-off before development begins. Two new items from v2.4 also require PO decisions.

---

### Decisions Required (PO Sign-Off Needed)

#### Decision #1 — Lot Size Enforcement Strictness

**Context:** Vietnam's HOSE/HNX require trades in multiples of 100 shares (board lot). The v2.3 FRD enforces this strictly — any quantity not a multiple of 100 is rejected.

**Question:** Should the paper trading simulator enforce the 100-share lot rule strictly (educational realism), or should it allow any integer quantity to lower friction for F0 users just starting out?

**Options:**
- **Option A (recommended — v2.3 as written):** Enforce 100-share lots for VN. When user enters 150 shares, the system suggests 100 or 200 and explains why: "VN stocks trade in lots of 100 — this is how the real market works." This teaches the rule.
- **Option B:** Accept any positive integer for paper trading, regardless of lot size. Simpler UX, but users learn incorrect mechanics.
- **Option C:** Accept any integer but show a warning: "Note: real VN trading requires lots of 100. This order would not be valid on a real exchange."

**Recommendation:** Option A. The product's primary goal is realistic simulation for F0 investors. Learning lot sizes is part of that education.

**Status:** ⏳ PENDING — no new information since v2.3.

> **PO Action Required:** Confirm Option A, B, or C.

---

#### Decision #2 — ATO/ATC Order Types in V1

**Context:** ATO (At-the-Opening) and ATC (At-the-Closing) are real VN order types that only work during specific 15-minute session windows. Adding them to V1 increases complexity in the order form UI.

**Question:** Should ATO and ATC order types be included in V1 paper trading, or deferred to V1.x?

**Options:**
- **Option A (recommended — v2.3 as written):** Include ATO and ATC in V1. They are labeled on the order form with session-time explanations. Outside their session window, the option is grayed out with a tooltip showing when it becomes available. Teaches an important real-market concept.
- **Option B:** Defer ATO/ATC to V1.x. V1 launches with MARKET and LIMIT only. Reduces order form complexity at launch.

**Tradeoffs:**
- Option A: Higher engineering complexity but more educational value and more realistic simulation.
- Option B: Simpler V1 launch; students won't learn ATO/ATC in V1.

**Recommendation:** Option B if engineering timeline is tight. Option A if the team has capacity. These order types are medium-priority educational features.

**Impact of decision:** If Option B chosen → remove ATO/ATC from FR-PT-07.1 for V1 and move to V1.x. Keep validation for session times and order type restrictions (those still apply to MARKET orders).

**v2.4 update:** ATO/ATC behavior is now fully specified including the no-match cancellation flow (E-PT-400, FC-PT-25). Engineering can now estimate precisely: +2–3 days for Option A. If PO chooses Option B, v2.4 FR-PT-07.1 amendment (no-match flow) is still required regardless of whether the ATO/ATC order type UI is deferred.

**Status:** ⏳ PENDING — complexity now fully bounded by v2.4.

> **PO Action Required:** Confirm Option A (include V1) or Option B (defer to V1.x).

---

#### Decision #3 — KR/Global Estimated Fills and Trader Score

**Context:** KR and Global paper trades use "estimated fill" prices because the data is not real-time. A user could potentially game their Trader Score Return component using these estimated prices.

**Question:** Should estimated KR/Global fills be included in or excluded from the Trader Score Return component?

**Options:**
- **Option A:** Exclude KR/Global estimated fills entirely from Trader Score calculation. Score reflects only VN (real-time) trading performance.
- **Option B:** Include KR/Global fills but apply a weighting discount (e.g., 0.5× weight vs. VN fills).
- **Option C (recommended):** Include KR/Global fills in Trader Score but label the user's score breakdown with "Includes estimated data" if they have KR/Global trades. No gaming concern — paper trading is already simulated; the key protection is that real-money decisions don't flow from this score.

**Recommendation:** Option C. Option A creates a perverse incentive to only trade VN stocks. Option B adds scoring complexity. Option C is honest and simple.

**Impact of decision:** Whichever option is chosen, the Trader Score FR-GAME-03 must be updated to document the rule.

**Status:** ⏳ PENDING — no new information since v2.3.

> **PO Action Required:** Confirm Option A, B, or C.

---

#### Decision #4 — Biometric Authentication V1 Scope (NEW from v2.4)

**Context:** FR-AUTH-08 has been written specifying biometric as an **optional** feature (offered at onboarding, skippable). The biometric screen already exists in the codebase (`app/(auth)/onboarding/biometric/`).

**Question:** Is biometric authentication in V1 scope, or deferred to V1.x?

**Impact of decision:**
- If **IN V1**: Engineering proceeds with FR-AUTH-08. Feature is optional for users, so non-blocking for onboarding completion.
- If **DEFERRED**: The codebase directory (`app/(auth)/onboarding/biometric/`) must be removed or gated behind a feature flag before V1 launch.

**Status:** ⏳ PENDING — no prior decision.

> **PO Action Required:** Confirm biometric is IN V1 scope (proceed with FR-AUTH-08) or DEFER to V1.x.

---

#### Decision #5 — Admin Panel for DOB Correction Tickets (NEW from v2.4)

**Context:** FR-ACCT-DOB-01 defines DOB correction as a manual support process requiring:
1. An in-app support ticket submission form (user-facing — assumed V1)
2. An admin panel entry for ticket review (internal tooling)

**Question:** Is the admin panel for DOB correction tickets in V1 scope?

**Options:**
- **V1:** Admin panel built alongside the user-facing ticket form. Support agents can review and action correction requests natively.
- **V1.x (workaround):** User can submit the ticket but support agents use direct DB query or Supabase admin panel until a proper admin UI is built in V1.x.

**Status:** ⏳ PENDING — no prior decision.

> **PO Action Required:** Confirm admin panel is V1 or V1.x (DB query workaround acceptable for launch).

---

### Implementation Questions (PO Awareness)

#### Q1 — Simulated Transaction Fee Rate (0.1%)

The v2.3 FRD introduces a simulated 0.1% fee on all paper trades for educational realism. This was not in v2.2.

**Is 0.1% the right fee rate?** Real VN brokerage fees range from 0.15% to 0.35% for retail clients. Using 0.1% may understate real costs. Consider using 0.25% as a more realistic mid-range VN retail rate.

**Action:** If PO prefers a different rate, update BR-PT-18 before development begins.

**Status:** ⏳ No decision recorded — non-blocking.

---

#### Q2 — After-Hours KR/Global Order Queue Lifetime

**Status: RESOLVED by v2.4.** BR-PT-16 sets a 48-hour TTL for QUEUED_AFTER_HOURS orders (covers 2 trading sessions), after which orders auto-cancel with user notification. This value was adopted by the BA team as an implementation detail. The PO may override if a different TTL is preferred — update BR-PT-16 and the Expiry Cron (SRD §2.4) accordingly.

> **PO Awareness:** Current implementation: QUEUED_AFTER_HOURS orders auto-cancel after 48 hours. Override if different TTL preferred.

---

#### Q3 — Midday Break Behavior (UX)

When a VN MARKET or LIMIT order is submitted during the midday break (11:30–13:00 ICT), the current spec queues it with `queued_for_session_open = true`.

**Question:** Should the app inform the user that the order is queued, or should it appear identical to a normal PENDING order?

**Suggestion:** Show a distinct UX state: "Your order will be evaluated at 13:00 ICT when trading resumes." This helps users understand the market pause — educational. The order response already includes `session_info.session_status = LUNCH` to support this.

**Action:** If accepted, engineering adds a distinct UX state for QUEUED_FOR_SESSION behavior in the order confirmation and order history screens.

**Status:** ⏳ PENDING — no decision recorded. Non-blocking for backend development.

---

### Post Character Limit — BA Decision, No PO Action Required

The FRD (280 chars) vs SRD (500 chars) conflict has been resolved in favor of **500 characters** (SRD was correct; VARCHAR(500) already in DB schema). No schema migration required. Frontend character counter updated to 500. This is a BA decision — no PO sign-off needed.

---

## PART 3 — DOCUMENT READINESS SUMMARY

| Document | Status |
|----------|--------|
| BRD-addendum-v2.3.md | Ready pending Decision #1, #2, #3 |
| FRD-module-B-v2.3.md | Ready pending Decision #2 (ATO/ATC scope) |
| SRD-order-engine-v2.3.md | Ready for engineering; pending PO decisions above |
| FRD-gaps-v2.4.md | Ready for engineering (all gaps resolved; self-validated) |
| QA-test-cases-v1.0.md | 14 BLOCKED test cases now unblocked by v2.4 |
| QA-gap-report-v1.0.md | Closed — all 12 gaps resolved in v2.4 |

---

## PART 4 — PO SIGN-OFF TABLE

| Item | Status | PO Action |
|------|--------|-----------|
| All 12 QA gaps resolved in v2.4 | ✅ Done | Awareness only |
| Decision #1 — Lot size strictness | ⏳ Pending | ☐ Approve Option A / B / C |
| Decision #2 — ATO/ATC in V1 | ⏳ Pending | ☐ Approve Option A / B |
| Decision #3 — KR/Global Trader Score | ⏳ Pending | ☐ Approve Option A / B / C |
| Decision #4 — Biometric in V1 scope | ⏳ Pending | ☐ V1 ☐ V1.x |
| Decision #5 — Admin panel for DOB tickets | ⏳ Pending | ☐ V1 ☐ V1.x (DB query workaround) |
| Implementation Q2 — Queue TTL (48h) | ✅ Resolved (48h default) | ☐ Override if different TTL preferred |
| Implementation Q3 — Midday break UX | ⏳ Pending | ☐ Yes (distinct UX) / No (standard PENDING) |
| Post character limit fixed at 500 | ✅ Resolved (BA decision) | No action required |

**Blocking for development:** Decision #1, Decision #2, Decision #3, Decision #4 (Biometric V1 scope).
**Non-blocking (can start development):** All 12 gap FRs, post character limit fix, Decision #5.

---

### Reviewer Sign-Off

| Reviewer | Role | Sign-Off | Date |
|----------|------|----------|------|
| [PO Name] | Product Owner | ☐ Approved ☐ Changes Required | |
| [Tech Lead] | Engineering Lead | ☐ Feasibility Reviewed | |
| [QA Lead] | QA Lead | ☐ Testable | |

---

*Document prepared by Business Analysis Team — 2026-04-21.*
*Pending PO decisions (Decision #1–#4) are blocking for development of the Paper Trading Engine. All gap-fix FRs in v2.4 are unblocked and ready for engineering.*
*Please respond to open decisions within 3 business days.*

# Review Document — v2.4 Documents
## Self-Review + Product Owner Review (Second Pass)

**Date:** 2026-04-20
**Author:** Business Analysis Team
**Documents under review:**
- FRD-gaps-v2.4.md (new — resolves 12 QA gaps)
- QA-gap-report-v1.0.md (companion)
- All v2.3 documents remain in effect; v2.4 is additive

---

## PART 1 — SELF-VALIDATION (Second Pass)

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

## PART 2 — PRODUCT OWNER REVIEW (Second Pass)

**TO:** Product Owner
**FROM:** Business Analysis Team
**DATE:** 2026-04-20
**RE:** v2.4 Document Review — Updated Decision Status + New Items

---

### Status of v2.3 PO Decisions

#### Decision #1 — Lot Size Enforcement (v2.3 pending) → **STILL PENDING**

The v2.3 recommendation stands: **Option A** — enforce 100-share lots strictly with educational guidance. No new information affects this decision.

> **PO Action Required:** Confirm Option A, B, or C. See REVIEW-self-and-po-v2.3.md Decision #1 for full option descriptions.

---

#### Decision #2 — ATO/ATC Order Types in V1 (v2.3 pending) → **STILL PENDING**

The v2.4 document has fully specified ATO/ATC behavior (including the no-match cancellation flow via E-PT-400). Engineering complexity is fully bounded. If PO chooses Option B (defer), v2.4 FR-PT-07.1 amendment only adds the no-match flow; the ATO/ATC order type UI can still be deferred.

> **PO Action Required:** Confirm Option A (include V1) or Option B (defer to V1.x). Engineering can now estimate precisely: +2–3 days for Option A.

---

#### Decision #3 — KR/Global Estimated Fills and Trader Score (v2.3 pending) → **STILL PENDING**

No new information. Recommendation remains Option C (include with "Estimated data" label on score breakdown).

> **PO Action Required:** Confirm Option A, B, or C.

---

#### Implementation Q2 — QUEUED_AFTER_HOURS Lifetime (v2.3 pending) → **RESOLVED by v2.4**

v2.4 adds BR-PT-16: 48-hour TTL. The BA team has adopted the suggested 48-hour lifetime without waiting for PO decision (as this is an implementation detail, not a product direction decision). The PO may override this value if a different TTL is preferred — update BR-PT-16 and the Expiry Cron accordingly.

> **PO Awareness:** If 48h is not the right TTL, please advise. Current implementation: QUEUED_AFTER_HOURS orders auto-cancel after 48 hours.

---

#### Implementation Q3 — Midday Break UX (v2.3 pending) → **STILL PENDING**

> **PO Awareness:** No decision was made in v2.3 review. Should the app show "Your order will be evaluated at 13:00 ICT when trading resumes" for QUEUED_FOR_SESSION orders? If yes, engineering will add a distinct UX state. If no, it shows as standard PENDING. BA recommends: yes (educational product).

---

### New Items from v2.4 Gap Resolution

#### NEW — Biometric Authentication Scope (GAP-QA-11 resolution)

FR-AUTH-08 has been written specifying biometric as an **optional** feature (offered at onboarding, skippable). The biometric screen already exists in the codebase. 

**PO Awareness:** The feature is now specified. Engineering can proceed with implementation aligned to FR-AUTH-08. No PO decision required — the recommendation is documented and consistent with the V1 scope.

**Timeline impact:** If biometric is to be deferred from V1, the codebase directory (`app/(auth)/onboarding/biometric/`) must be removed or gated. Otherwise, FR-AUTH-08 should be included in the V1 engineering sprint.

> **PO Action Required:** Confirm biometric is IN V1 scope (proceed with FR-AUTH-08) or DEFER to V1.x.

---

#### NEW — DOB Correction Flow (GAP-QA-12 resolution)

FR-ACCT-DOB-01 defines DOB correction as a manual support process. This requires:
1. An in-app support ticket submission form (user-facing: V1)
2. An admin panel entry for ticket review (internal: V1 or V1.x?)

> **PO Action Required:** Is the admin panel for DOB correction tickets in V1 scope? If not, the user can submit the ticket but support agents would need an alternative interface (e.g., direct DB query or Supabase admin panel) until V1.x.

---

#### NEW — Post Character Limit Fixed at 500 (GAP-QA-10 resolution)

The contradiction between FRD (280) and SRD (500) has been resolved in favor of **500 characters** (SRD was correct). This is a BA decision, not a PO decision — 500 is already what the database schema supports (VARCHAR(500) in SRD). No schema migration required. Frontend character counter simply needs to be set to 500 instead of 280.

**No PO decision required.** Proceeding with 500.

---

### Updated Sign-Off Table

| Item | Status | PO Action |
|------|--------|-----------|
| All 12 QA gaps resolved in v2.4 | ✅ Done | Awareness only |
| Decision #1 — Lot size strictness | ⏳ Pending | ☐ Approve Option A/B/C |
| Decision #2 — ATO/ATC in V1 | ⏳ Pending | ☐ Approve Option A/B |
| Decision #3 — KR/Global Trader Score | ⏳ Pending | ☐ Approve Option A/B/C |
| Implementation Q2 — Queue TTL (48h) | ✅ Resolved (48h default) | ☐ Override if different TTL preferred |
| Implementation Q3 — Midday break UX | ⏳ Pending | ☐ Yes (distinct UX) / No (standard PENDING) |
| Biometric in V1 scope? | ⏳ Pending | ☐ V1 ☐ V1.x |
| Admin panel for DOB tickets in V1? | ⏳ Pending | ☐ V1 ☐ V1.x (DB query workaround) |

**Blocking for development:** Decision #1, Decision #2, Decision #3, Biometric V1 scope.
**Non-blocking (can start development):** All 12 gap FRs, post character limit fix.

---

### Document Readiness Summary (v2.3 + v2.4)

| Document | Status |
|----------|--------|
| BRD-addendum-v2.3.md | Ready pending Decision #1, #2, #3 |
| FRD-module-B-v2.3.md | Ready pending Decision #2 (ATO/ATC scope) |
| SRD-order-engine-v2.3.md | Ready for engineering; pending PO decisions above |
| FRD-gaps-v2.4.md | **NEW — Ready for engineering** (all gaps resolved; self-validated) |
| QA-test-cases-v1.0.md | 14 BLOCKED test cases now unblocked by v2.4 |
| QA-gap-report-v1.0.md | Closed — all 12 gaps resolved in v2.4 |

---

### Sign-Off Required

| Reviewer | Role | Sign-Off | Date |
|----------|------|----------|------|
| [PO Name] | Product Owner | ☐ Approved ☐ Changes Required | |
| [Tech Lead] | Engineering Lead | ☐ Feasibility Reviewed | |
| [QA Lead] | QA Lead | ☐ Testable | |

---

*Document prepared by Business Analysis Team — 2026-04-20.*
*Pending PO decisions (Decision #1, #2, #3 from v2.3) remain blocking. All gap-fix FRs in v2.4 are unblocked and ready for engineering.*
*Please respond to open decisions within 3 business days.*

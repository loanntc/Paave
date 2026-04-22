# Review Document — v2.3 Documents
## Self-Review + Product Owner Review

**Date:** 2026-04-20
**Author:** Business Analysis Team
**Documents under review:**
- BRD-addendum-v2.3.md
- FRD-module-B-v2.3.md
- SRD-order-engine-v2.3.md

---

## PART 1 — SELF-VALIDATION (BA Checklist)

Running the BA self-validation checklist against all three v2.3 documents before delivering to Product Owner.

| Checklist Item | FRD Module B v2.3 | SRD Order Engine v2.3 | BRD Addendum v2.3 | Status |
|----------------|-------------------|-----------------------|-------------------|--------|
| Can a developer build this without asking a single question? | Yes — every order type has input/output/flow defined | Yes — system flows are step-by-step with all branches | Yes — rules are measurable and specific | ✅ PASS |
| Can QA write test cases directly from this document? | Yes — acceptance criteria + failed case table (FC-PT-xx) | Yes — API contracts with all error responses | Yes — violation behavior specified per rule | ✅ PASS |
| Are all business rules isolated and numbered (BR-xx)? | Yes — BR-PT-01 to BR-PT-20 | Business rules referenced from FRD; SRD implements them | Yes — BR-PT-01 to BR-PT-15 | ✅ PASS |
| Are all edge cases listed with explicit system behavior? | Yes — FC-PT-01..15 and FC-LIM-01..19 | Yes — error codes and responses for every case | Covered by FRD reference | ✅ PASS |
| Are all limits defined (size, count, format, time)? | Yes — lot size (100), max orders (10), expiry (30 days), fee (0.1%), max qty (999,999) | Yes — latency NFRs, lock TTLs, retry counts | Yes | ✅ PASS |
| Are all error states defined with codes and messages? | Error codes defined (E-PT-101..210, E-PT-300) | Full error response JSON for every code | Referenced | ✅ PASS |
| Does every requirement trace back to a business objective? | Traces to BO-08 (primary paper trading loop) | Implements FRD which traces to BO-08 | Traces to BO-08, BO-12 (F0 compliance) | ✅ PASS |
| Are there any vague words remaining? ("fast", "easy", "etc.", "TBD") | Two "TBD" in risk register (RISK-PT-04 — PO decision) | None | One "TBD" in risk register (flagged for PO) | ⚠️ FLAGGED (see PO decision items) |

### Self-Review Findings

**1. SRD/FRD consistency fix confirmed:**
- FRD v2.2 said: limit orders expire after 30 days
- SRD v2.0 said: Good Till Cancelled (GTC)
- v2.3 resolution: 30-day expiry as defined in FRD (BR-PT-12). SRD now implements 30-day expiry correctly.

**2. Newly listed stock price band exception:**
- Added ±20% band for HOSE newly listed stocks (first 3 sessions).
- Requires the price feed to flag `is_newly_listed` on tickers that are within their first 3 trading sessions post-IPO. This flag must be added to the Market Data Service's ticker metadata. *(Flag to engineering: new field required on ticker schema.)*

**3. ATO/ATC fill price handling:**
- When no counter-party exists at the opening/closing match, ATO/ATC orders may be CANCELLED rather than FILLED (no matching price computed).
- This edge case is defined in FR-PT-07.1 but needs an explicit error code. Adding: E-PT-400 for ATO/ATC unfilled due to no matching price (session close with no match).

**4. UPCoM order type restriction:**
- FR-PT-07.3 says "LO only" for UPCoM. This means if a user on the stock detail page of a UPCoM-listed stock tries to place a MARKET order, the system must reject it.
- The Stock Detail "Buy/Sell" button should detect the exchange and show order type options accordingly. This is a UI/UX implication for engineering.

**5. KR/Global "estimated fill" and Trader Score:**
- RISK-PT-04 flags that KR/Global estimated fills could be exploited for inflated Trader Scores.
- Current FRD/gamification docs don't address this. **PO decision required** — see Part 2, Decision #3.

**6. No mention of partial fills:**
- FR-PT-02 and FR-PT-03 state "no partial fills in V1."
- This is correct but should be explicit in the SRD: if a BUY market order requires 5M VND and the balance at fill time is only 4.9M VND, the order is FILL_FAILED (not partially filled for 98 shares). This is consistent with the documents as written.

**7. Midday break (11:30–13:00) order queuing:**
- FC-LIM-19 / system flow §2.1 Step 4d says orders submitted during lunch break are accepted and queued.
- However, the user must be informed. The order confirmation screen should show: "Market is on lunch break. Your order will be evaluated when trading resumes at 13:00 ICT."
- This is a UX note for engineering — the order response already includes `session_info.session_status = LUNCH` to support this.

---

## PART 2 — PRODUCT OWNER REVIEW

**TO:** Product Owner
**FROM:** Business Analysis Team
**DATE:** 2026-04-20
**RE:** v2.3 Document Review — Decisions Required

---

### Background

The v2.3 analysis found 12 gaps in the existing documents (6 critical, 6 medium). All gaps have been addressed in the v2.3 documents with the exception of three items that require your explicit decision before development begins. Additionally, three implementation questions have been raised that have product implications.

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

---

### Implementation Questions (PO Awareness — No Decision Blocking)

#### Q1 — Simulated Transaction Fee Rate (0.1%)

The v2.3 FRD introduces a simulated 0.1% fee on all paper trades for educational realism. This was not in v2.2.

**Is 0.1% the right fee rate?** Real VN brokerage fees range from 0.15% to 0.35% for retail clients. Using 0.1% may understate real costs. Consider using 0.25% as a more realistic mid-range VN retail rate.

**Action:** If PO prefers a different rate, update BR-PT-18 before development begins.

---

#### Q2 — After-Hours KR/Global Order Queue Lifetime

For KR/Global market orders submitted outside simulated session hours, v2.3 queues them as QUEUED_AFTER_HOURS. These orders never expire automatically (unlike VN orders which are rejected immediately outside hours).

**Question:** How long should a QUEUED_AFTER_HOURS order remain queued before auto-cancelling?

**Suggestion:** 48 hours from submission (covers 2 trading sessions). After that: auto-cancel with user notification. This prevents orphaned queued orders accumulating on accounts.

**Action:** If accepted, add to BR-PT-07 and to the Expiry Cron (SRD §2.4).

---

#### Q3 — Midday Break Behavior (UX)

When a VN MARKET or LIMIT order is submitted during the midday break (11:30–13:00 ICT), the current spec queues it with `queued_for_session_open = true`.

**Question:** Should the app inform the user that the order is queued, or should it appear identical to a normal PENDING order?

**Suggestion:** Show a distinct UX state: "Your order will be evaluated at 13:00 ICT when trading resumes." This helps users understand the market pause — educational.

**Action:** If accepted, engineering adds a UX state for QUEUED_FOR_SESSION behavior in the order confirmation and order history screens.

---

### v2.3 Document Summary

| Document | Status After Review |
|----------|-------------------|
| BRD-addendum-v2.3.md | Ready for PO sign-off pending Decision #1, #2, #3 |
| FRD-module-B-v2.3.md | Ready for PO sign-off pending Decision #2 (ATO/ATC scope) |
| SRD-order-engine-v2.3.md | Ready for engineering review pending PO decisions above |

**Estimated impact on engineering timeline:**
- Decision #1 (lot size): Minimal — validation rule only.
- Decision #2 (ATO/ATC): If V1: +2–3 days for UI and backend session logic. If deferred: no change.
- Decision #3 (Trader Score): Minimal — one gamification rule update.

---

### Sign-Off Required

| Reviewer | Role | Sign-Off | Date |
|----------|------|----------|------|
| [PO Name] | Product Owner | ☐ Approved ☐ Changes Required | |
| [Tech Lead] | Engineering Lead | ☐ Feasibility Reviewed | |
| [QA Lead] | QA Lead | ☐ Testable | |

---

*Document prepared by Business Analysis Team — 2026-04-20.*
*All decisions above are blocking for development of the Paper Trading Engine. Please respond within 3 business days.*

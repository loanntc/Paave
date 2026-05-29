# F0 Learning Path V2 — Spec Review Overview

**Review Date:** 2026-05-29
**Reviewer:** Claude (automated spec review)
**Spec Version:** Business Layer 2.0 · Design Layer 2.0
**Architecture:** Frontend-only, AsyncStorage, React Native

---

## 1. Review Summary

The F0 Learning Path V2 specification is substantially complete and the architecture is coherent. The business layer (requirements, content, data model, and flow files A–G) is well-structured with clear state machines, idempotency rules, and edge case handling. The design layer (component specs and interaction rules IR-01–IR-25) aligns closely with business intent, and the QA file provides 54 test cases with good flow coverage. However, the spec is **not yet developer-ready** due to several blocking issues that require resolution before a sprint can begin. The most critical blockers are: (1) the DESIGN-F0-LEARN-00-alignment.md document is a stale V1 artifact that contradicts the V2 architecture in 9 material ways — it references XP, badges, bonus cash, and V1 FR numbers that do not exist in the V2 business docs; (2) Card 5 CTA deep-link destinations are undefined for all 20 lessons, making the primary CTA on every lesson card unimplementable; (3) the MKC question pool has only 5 questions per module equal to the quiz size, making question randomization on retry meaningless; (4) `f0_explore_path_taken` is used in flow files and interaction rules but is absent from the data model key registry; and (5) the Placement Quiz pass path in the data model omits writes for `f0_lesson_1_{1-5}_card_index`, creating an incomplete batch write spec. Secondary concerns include inconsistent CTA copy between documents, an undefined timing contract for the MKC banner appearance on Lesson 5 Card 5, and the absence of a copy spec for the LearningPromptCard. The content (02-content.md) is complete for all 20 lessons, all 5 MKC question sets, and the Placement Quiz with correct answers and hints present for every Card 4 quiz.

---

## 2. Coverage Matrix

| Flow | Business Doc | Design Doc | QA Coverage | Dev Ready |
|------|:---:|:---:|:---:|:---:|
| Flow A — Welcome Modal | ✅ | ⚠ IR-01–IR-03 cover it; alignment doc contradicts | ✅ TC-01–TC-08 (8 cases) | ⚠ Network-gate logic differs between flow-a and IR EC-01 |
| Flow B — Grow Tab | ✅ | ✅ IR-20, component spec complete | ✅ TC-09–TC-16 (8 cases) | ⚠ `f0_explore_path_taken` missing from data model |
| Flow C — Lesson Experience | ✅ | ✅ IR-04–IR-14 cover all card interactions | ✅ TC-17–TC-28 (12 cases) | ❌ Card 5 CTA deep-links undefined for all 20 lessons |
| Flow D — Module Completion | ✅ | ✅ IR-14–IR-18 cover MKC entry and pass/fail | ✅ TC-29–TC-35 (7 MKC cases) | ⚠ MKC banner delay not precisely specified |
| Flow E — MKC | ✅ | ✅ IR-17–IR-19, MKCCooldownBanner spec complete | ✅ QA-E-01–QA-E-14 (14 cases) | ⚠ Question pool = quiz size (5=5), no real randomization |
| Flow F — Placement Quiz | ✅ | ✅ IR-21–IR-22, PlacementQuizCard spec complete | ✅ QA-F-01–QA-F-15 (15 cases) | ⚠ Missing `f0_lesson_1_{1-5}_card_index` writes in data model pass path |
| Flow G — Learning Complete | ✅ | ✅ IR-23–IR-24, AgeGateBottomSheet spec complete | ✅ QA-G-01–QA-G-13 (13 cases) | ⚠ Age calculation formula inconsistency; timezone spec incomplete |

**Legend:** ✅ Complete · ⚠ Minor gaps · ❌ Blocking gap

---

## 3. Critical Blockers (P0)

Items that MUST be resolved before any development starts.

### P0-01: DESIGN-F0-LEARN-00-alignment.md is a stale V1 document with material contradictions

**File:** `/docs/design/DESIGN-F0-LEARN-00-alignment.md`

The alignment document still contains V1 content that directly contradicts the V2 architecture:

- **V1 In-Scope list (lines 76–88)** lists `Lesson XP (+25 per lesson)`, `Module completion rewards (badge + XP bonus)`, `Module 2 bonus cash (50,000,000 VND, 7-day TTL + force-liquidation)`, and `Daily Missions visibility gate` as in-scope. These are explicitly removed in V2 per `00-index.md` and `01-requirements.md`.
- **Module Structure table (lines 115–123)** includes XP columns, badge names, rarity colors, and bonus cash for M2. All removed in V2.
- **Rarity Color Scale section** defines `rarity-common`, `rarity-uncommon`, `rarity-rare`, `rarity-epic` tokens. No V2 document references these tokens.
- **Screen Count table (lines 174–193)** references FR-LEARN-19 (Placement Quiz), FR-LEARN-18 (MKC), FR-LEARN-09 (Module Completion Reward Screen), FR-LEARN-10 (Bonus Cash Modal), FR-LEARN-12 (Daily Missions). None of these FR numbers exist in V2 `01-requirements.md`. V2 uses FR-LEARN-01 through FR-LEARN-10.
- **Design tokens section** defines `xp-pill-bg`, `xp-pill-text`, `badge-surface` tokens that are used in component spec (MKCCooldownBanner uses `xp-pill-bg` for the ready state), but the alignment doc still frames them as XP-system tokens when their V2 usage is repurposed for cooldown state.

**Impact:** Any developer or designer reading this file gets an inaccurate picture of the feature scope. The XP and badge tokens are still used in component-spec for MKCCooldownBanner, creating ambiguity about whether the XP system is actually removed.

**Resolution required:** Update alignment doc to match V2: remove all XP/badge/bonus-cash references, update screen list with correct V2 FR numbers, clarify that `xp-pill-bg` token is repurposed for cooldown-ready state with no XP semantics.

---

### P0-02: Card 5 CTA deep-link destinations are undefined for all 20 lessons

**File:** `flow-c-lesson-experience.md` Design Gap DG-C-01; `docs/business/f0-learning/02-content.md` Card 5 content

The Card 5 primary CTA "Thực hành ngay →" routes to an in-app action specific to each lesson topic. The 02-content.md file contains Card 5 text for all 20 lessons — these are the user-facing instructions — but no navigation destination (route name, screen, parameters) is specified anywhere in the spec for any of the 20 lessons. IR-11 in the interaction rules file lists three examples (`L1.3 → Trade tab VNM`, `L2.1 → FPT Phân tích tab`, `L3.3 → Portfolio watchlist`) but these are illustrative only and not authoritative.

**Impact:** The entire Card 5 primary CTA is unimplementable. A developer must invent 20 navigation destinations, which is a product decision, not an engineering decision.

**Resolution required:** A complete table mapping each of the 20 lessons to its Card 5 CTA destination (React Navigation route name + params). This is a product/BA deliverable.

---

### P0-03: `f0_explore_path_taken` key used in flows but absent from data model

**Files:** `flow-a-welcome-modal.md` (Section 8, Engineering Layer), `flow-b-grow-tab.md` (Sections 2, 4.4, 5, 8), `DESIGN-F0-LEARN-05-interactions.md` (IR-02, IR-20), `docs/business/f0-learning/03-data-model.md`

The key `f0_explore_path_taken` is referenced in at least 6 places across flow files and interaction rules as the gate for showing `LearningPromptCard`. However, it does not appear anywhere in:
- Section 1 (Global Keys) of the data model
- Section 1.6 (Complete Key List)
- The TypeScript interface definitions
- The cold-start initialization code

**Impact:** The LearningPromptCard feature cannot be implemented correctly without this key. The default value, write location, and read conditions are described informally in flow files but have no single authoritative spec.

**Resolution required:** Add `f0_explore_path_taken` to `03-data-model.md` Section 1.1 with full row (Key, Type, Default, Description, Set by, Read by). Add to `ALL_F0_KEYS` array in Section 8. Add to `LearningPathState` TypeScript interface.

---

### P0-04: Placement Quiz pass path in data model omits card index writes

**File:** `docs/business/f0-learning/03-data-model.md` Section 3.3 (M1 Placement Quiz Pass Path)

The batch write for Placement Quiz pass (11 keys listed in Section 3.3) correctly sets all 5 M1 lesson states to COMPLETE but does NOT set the 5 corresponding `f0_lesson_1_{1-5}_card_index` keys to 4 (the value that represents "all cards viewed"). The lesson state definition in Section 1.3 states that `card_index` = 4 is the terminal value for a COMPLETE lesson, and FR-LEARN-05 explicitly states "f0_lesson_{m}_{l}_card_index set to 4" as a postcondition of lesson COMPLETE.

**Impact:** After placement quiz pass, a developer following the batch write spec exactly will produce lessons that are COMPLETE but have `card_index = 0` (default), which creates an inconsistency between lesson state and card index. If any logic reads `card_index` to determine resume position, a user who enters a "completed" M1 lesson in review mode will start at Card 1 instead of Card 5.

**Resolution required:** Add `f0_lesson_1_1_card_index` through `f0_lesson_1_5_card_index` (all set to `4`) to the batch write list in Section 3.3. Update Section 7.3 Required Batch Write Points accordingly.

---

### P0-05: MKC question pool size equals quiz size — randomization is non-functional

**File:** `flow-e-mkc.md` Design Gap G-E-01; `docs/business/f0-learning/02-content.md`

Each module's MKC has exactly 5 questions defined in 02-content.md. The MKC spec states "Question order is randomized on each entry" (Section 2.1, Step 2). With pool size = quiz size = 5, randomization produces a different ordering of the same 5 questions but the user sees all the same questions on every retry. After one failed attempt, the user knows all 5 questions and can memorize the correct answers before retrying.

This is flagged as High severity in G-E-01 but is in the spec as a known risk, not a resolved decision. If this is accepted for V1, the spec must explicitly state "Randomization is order-only (no subset selection)" so a developer does not assume a larger pool exists.

**Impact:** If developer assumes pool > quiz size and implements subset selection, no content is available for it and the build will fail. If this is to be fixed before launch (as G-E-01 recommends), content must write 10 questions per module (40 new questions total).

**Resolution required:** PO/BA decision: (a) Accept 5-question pool with order-only randomization for V1 and document explicitly, or (b) expand pool to 10 per module before content freeze. Mark this as a pre-launch content decision, not a V2 deferral.

---

## 4. High Priority (P1)

Items that should be resolved before sprint planning.

### P1-01: Welcome Modal network-gate behavior is contradictory between flow-a and interaction rules

**Files:** `flow-a-welcome-modal.md` (Section 2, EC-A-01), `DESIGN-F0-LEARN-05-interactions.md` (EC-01)

`flow-a-welcome-modal.md` states: "If no network → Skip modal → navigate to Home tab; flag not written." The AC-A-07 test case confirms the modal is NOT shown offline and the flag remains unset.

`DESIGN-F0-LEARN-05-interactions.md` EC-01 states: "Welcome Modal shows with static PNG fallback (Lottie not loaded). All 3 CTAs are active immediately. Writes `f0_welcome_modal_shown = true` at modal render."

**The two documents describe opposite behavior for the same offline-first-launch scenario.** One says show the modal offline (EC-01 in interactions), the other says skip it (flow-a EC-A-01).

**Resolution required:** Decide the authoritative behavior and update the non-authoritative document. The business case for showing offline (EC-01 in interactions) is stronger since all content is local — but the design rationale in flow-a for deferring (Lottie needs network) is also valid. Product must decide.

---

### P1-02: MKC banner timing not specified

**File:** `flow-d-module-completion.md` Section 2 and Design Gap DG-D-03

The spec says "DELAY: Brief moment for user to read Card 5" before the MKC banner appears but does not define the delay duration. Section 4 mentions 800ms as a recommendation in DG-D-03. Section 8 (Engineering Layer) states "Auto-navigate delay: 1000ms post-toast before transitioning." These are different numbers for different purposes and the MKC banner delay has no single authoritative value.

**Resolution required:** Specify exact delay in milliseconds for MKC banner appearance after Lesson 5 Card 5 renders. Add to flow-d Section 4.4 Interaction Rules as a definitive timing value, not a recommendation.

---

### P1-03: LearningPromptCard copy not specified

**File:** `flow-b-grow-tab.md` Design Gap DG-B-05

The LearningPromptCard component spec defines layout and props (`lessonId`, `lessonTitle`, `lessonNumber`) but neither the business flow document nor the component spec defines the actual copy. DG-B-05 suggests "Bắt đầu hành trình đầu tư của bạn" / "Module 1 đang chờ bạn" / "Bắt đầu ngay →" as suggestions only.

**Resolution required:** UX writer to confirm the three copy strings: (1) eyebrow label (currently `caption-pulse` field), (2) card headline/body, (3) CTA label. These are required before Figma design of the component and before engineering implementation.

---

### P1-04: CTA button label inconsistency: "Kiểm tra" vs "Xác nhận" on Card 4

**Files:** `flow-c-lesson-experience.md` Section 2 (mentions both "Kiểm tra" and "Xác nhận"), Design Gap DG-C-06

The Card 4 quiz submit button is referred to as both "Kiểm tra" and "Xác nhận" / "Kiểm tra" / "Xác nhận" within the same document. Specifically:
- Flow C Section 2 Card 4 block: `"Kiểm tra" / "Xác nhận" button`
- Flow C AC-C-04: `taps "Kiểm tra"`
- Flow C AC-C-05: `taps "Kiểm tra"`
- DG-C-06 flags this as a gap: "Two labels are referenced in the spec"

DG-C-06 recommends standardizing on "Kiểm tra" but this has not been codified into the spec.

**Resolution required:** Remove all references to "Xác nhận" and standardize on "Kiểm tra" across flow-c, component-spec QuizCard section, and QA test cases.

---

### P1-05: Age calculation formula is inconsistent between two documents

**Files:** `docs/business/f0-learning/01-requirements.md` BR-07, `flow-g-learning-complete.md` Section 2.1 Step 9, `DESIGN-F0-LEARN-05-interactions.md` IR-24

BR-07 states the age check uses "currentDate - DOB, where the user is considered ≥18 if they have had their 18th birthday on or before the current date." This is calendar-based arithmetic.

Flow G Section 2.1 Step 9 and IR-24 both specify: `Math.floor((Date.now() - DOB_timestamp) / (365.25 * 24 * 3600 * 1000))`. This is duration-in-years arithmetic using 365.25 days/year.

Design Gap G-G-04 flags that the 365.25 formula can be off by 1 day for Feb 29 birthdays and recommends using `date-fns differenceInYears` or `dayjs`.

These two approaches can produce different results for edge-case birthdays (Feb 29, and birthday = today).

**Resolution required:** Decide on one method (recommend `dayjs.diff` in Vietnam UTC+7) and update BR-07, flow-g, and IR-24 to reference the same formula. The timezone specification (Vietnam UTC+7, mentioned in EC-G-02) must also be codified in BR-07, not just in an edge-case note in flow-g.

---

### P1-06: Flow D says "Làm lại →" button has no cooldown but flow E and FR-LEARN-07 specify 60s cooldown on every fail

**Files:** `flow-d-module-completion.md` Section 2 and EC-D-03; `flow-e-mkc.md` Section 2.3; `docs/business/f0-learning/01-requirements.md` FR-LEARN-07

Flow D Section 2 (MKC FAIL branch) shows two CTAs: "Ôn lại bài học →" and "Làm lại →". EC-D-03 states "MKC is restartable unlimited times. No cooldown in this version." This contradicts:
- FR-LEARN-07 which explicitly defines a 60-second cooldown on fail
- Flow E Section 2.3 which writes `f0_mkc_{n}_cooldown_start = Date.now()` on fail
- AC-E-08 which verifies the DISABLED button during cooldown

The phrase "No cooldown in this version" in EC-D-03 appears to be a leftover from an earlier version of the spec.

**Resolution required:** Remove "No cooldown in this version" from EC-D-03. Flow D's fail screen must match Flow E: the "Làm lại →" CTA must be disabled during the 60-second cooldown. Update AC-D-08 to reflect the cooldown behavior.

---

### P1-07: Flow E section 2.3 omits `f0_mkc_{n}_state = FAILED` write

**File:** `flow-e-mkc.md` Section 2.3 Fail Sequence

The Fail Sequence in Flow E lists only `f0_mkc_{n}_cooldown_start = Date.now()` as the write on fail. It does not write `f0_mkc_{n}_state = FAILED`. However, `01-requirements.md` FR-LEARN-07 postcondition (fail) explicitly states: "`f0_mkc_{n}_state` = FAILED". The data model Section 7.3 Required Batch Write Points lists MKC Fail as writing both `f0_mkc_{m}_state` and `f0_mkc_{m}_cooldown_start`.

**Resolution required:** Add `f0_mkc_{n}_state = FAILED` to Flow E Section 2.3 Step 1, before the cooldown_start write. This makes Flow E consistent with FR-LEARN-07 and the data model batch write table.

---

### P1-08: Flow G Case A (≥18) writes `f0_age_gate_shown = true` but that key's purpose is "age gate was shown to user"

**File:** `flow-g-learning-complete.md` Section 2.2 Case A; `docs/business/f0-learning/01-requirements.md` FR-LEARN-10

FR-LEARN-10 states: "Output (age ≥ 18): Navigate to Trade tab. `f0_age_gate_shown` is NOT written (age gate was not shown)."

Flow G Section 2.2 Case A states: "Write `f0_age_gate_shown = true`" as step 1 of the ≥18 path. This is a direct contradiction — the requirement says do NOT write this key for the ≥18 path, but the flow spec writes it.

**Resolution required:** Remove the `f0_age_gate_shown = true` write from Flow G Section 2.2 Case A. The key should only be written in Case B (< 18) and Case C (DOB missing). Update IR-24 in the interaction rules, which also writes `f0_age_gate_shown = true` unconditionally before the age branch.

---

## 5. Medium Priority (P2)

Can be deferred but should be resolved before the first sprint review demo.

### P2-01: `04-completion-trading.md` referenced in index and component spec but not provided for review

**File:** `docs/business/f0-learning/00-index.md` (Reading Order row 4), `docs/design/DESIGN-F0-LEARN-04-component-spec.md` (Related Documents)

The 00-index.md reading order lists `04-completion-trading.md` as document 4 ("Post-learning age check → Trade tab or Home tab"). This file was not included in the review scope. Flow G covers the age gate flow, but if `04-completion-trading.md` exists, it may contain additional requirements not covered by flow-g.

**Resolution required:** Confirm whether `04-completion-trading.md` exists and whether its content is fully superseded by Flow G. If it is a stub or does not exist, remove the reference from the index.

---

### P2-02: Welcome Modal CTA copy inconsistency between business layer and design layer

**Files:** `docs/business/f0-learning/01-requirements.md` FR-LEARN-01; `flow-a-welcome-modal.md` Section 2 and 4.3; `DESIGN-F0-LEARN-05-interactions.md` IR-01–IR-03

The three CTAs have different labels in different documents:

| Doc | Primary CTA | Secondary CTA | Tertiary CTA |
|-----|-------------|---------------|--------------|
| FR-LEARN-01 (requirements) | "Bắt đầu học từ đầu" | (not listed as secondary) | "Làm bài kiểm tra đầu vào" |
| flow-a (business flow doc) | "Bắt đầu Module 1" | "Khám phá trước" | "Tôi đã biết chứng khoán cơ bản" |
| IR-01–IR-03 (interactions) | "Bắt đầu Module 1" | "Khám phá trước" | "Tôi đã biết chứng khoán cơ bản" |
| DESIGN-00-alignment.md (stale) | (V1 copy) | (V1 copy) | (V1 copy) |

The requirements document uses different copy than both flow files and interaction rules. FR-LEARN-01 says "Bắt đầu học từ đầu" but the flow and interactions both say "Bắt đầu Module 1."

**Resolution required:** Align FR-LEARN-01 CTA copy with the authoritative copy from flow-a (which is more specific and consistent with design). "Bắt đầu Module 1" is the correct label.

---

### P2-03: Module completion toast mentions emoji that may not render consistently cross-platform

**File:** `flow-d-module-completion.md` Section 2 and AC-D-05

The toast reads "Module N Hoàn Thành! 🎓". The graduation cap emoji may render differently across Android versions and iOS. The QA test case TC-D-04 specifies the emoji as part of the expected result. This is a design system consistency concern — the alignment doc explicitly restricts emoji usage in components.

**Resolution required:** Either approve emoji in toast copy (and specify fallback rendering behavior for Android API < 23) or replace with a text-only label ("Module N Hoàn Thành!") for consistency.

---

### P2-04: Review mode behavior on Card 5 not specified for lesson state writes

**File:** `flow-c-lesson-experience.md` Section 2 (Review Mode block); `docs/business/f0-learning/01-requirements.md` FR-LEARN-03

FR-LEARN-03 states "On reaching Card 5 with Card 4 quiz already passed: lesson COMPLETE logic triggered." IR-C-12 specifies "Card 5 renders (standard mode) → Write lesson state = COMPLETE." Review mode correctly blocks state writes, but there is no explicit rule about what happens if a user in review mode navigates to Card 5 — the spec says "Reaching Card 5: no state writes (lesson already COMPLETE)" but does not specify whether the `Tiếp tục →` CTA on Card 5 in review mode navigates to the next lesson or has different behavior.

**Resolution required:** Specify the behavior of the Card 5 "Tiếp tục →" and "Thực hành ngay →" CTAs in review mode. Do they navigate to the next lesson? Do they navigate to the first card of the current lesson? Do they exit to the Grow tab?

---

### P2-05: Module Detail screen is referenced but not specified

**Files:** `docs/business/f0-learning/01-requirements.md` FR-LEARN-02 ("Tapping an UNLOCKED, IN_PROGRESS, LESSONS_COMPLETE module opens the module detail screen"); `flow-b-grow-tab.md` Section 2 (tap actions navigate to lesson card view, not module detail)

FR-LEARN-02 references a "module detail screen" as an intermediate screen between the Grow tab and the lesson card viewer. However, the flow documents (flow-b, flow-c) describe tapping a ModuleCard as navigating directly to a lesson card. There is no "module detail screen" defined in any flow file, component spec, or wireframe reference. This may be intentional (no intermediate screen in V2) or an omission.

**Resolution required:** Confirm whether a module detail screen exists in V2. If yes, create a flow spec for it. If no, remove the reference from FR-LEARN-02 and update to reflect direct navigation from ModuleCard to lesson card.

---

### P2-06: HintCard copy ("Hiểu rồi, thử lại →") inconsistent with component spec CTA label

**Files:** `flow-c-lesson-experience.md` Section 2 (IR-C-10); `DESIGN-F0-LEARN-04-component-spec.md` HintCard section

Flow C Section 2 and AC-C-07 use "Hiểu rồi, thử lại →" as the HintCard dismiss CTA label. The component spec HintCard section uses "Hiểu rồi, thử lại →" as well — this is consistent. However, the QA test case TC-26 uses "Hiểu rồi, thử lại →" and AC-C-07 (business) also uses this string. The requirement AC-04 (in requirements doc) refers to the hint generically without specifying the CTA label.

This is a minor concern — the labels are consistent between flow-c and component-spec, but the requirements doc AC-04 does not tie the acceptance criteria to the specific CTA label, which means QA could interpret this differently.

**Resolution required:** Add the exact CTA label "Hiểu rồi, thử lại →" to AC-04 in requirements doc for completeness.

---

### P2-07: Grow Tab celebration state CTA ("Đến Trading →") differs from flow G completion CTA ("Bắt đầu đầu tư →")

**Files:** `flow-b-grow-tab.md` Section 2 (celebration state CTA "Đến Trading →"); `flow-g-learning-complete.md` Screen G-5 (post-completion Grow tab banner "Học xong! Tiếp tục ôn lại →")

Flow B describes the Grow Tab celebration state CTA as "Đến Trading →" when all modules are COMPLETE. Flow G Section 2.5 describes the same Grow tab post-completion state as showing "Học xong! Tiếp tục ôn lại →" with ghost CTA. These are different labels, different button variants (lime vs ghost), and different navigation destinations (Trade tab vs. review cycling). They may refer to different UI elements (module list replacement vs. top banner), but this is not clearly differentiated in the spec.

**Resolution required:** Clarify whether the Grow tab celebration state has (a) one CTA that replaces the module list, (b) a banner at the top with separate CTAs, or (c) both. Align copy and navigation destinations between flow-b and flow-g.

---

## 6. Consistency Issues

Key/name/number mismatches found across documents.

### CI-01: IR numbering namespace collision

Flow files use local IR identifiers (IR-A-01, IR-B-01, etc.) while the design interaction rules file uses global sequential IDs (IR-01 through IR-25). The flow files cite "IR-LEARN-A1", "IR-LEARN-B1" etc. which do not map to IR-01–IR-25 in the interaction rules file. For example:
- `flow-a-welcome-modal.md` Flow Summary references `IR-LEARN-A1` and `IR-LEARN-A2`
- `DESIGN-F0-LEARN-05-interactions.md` uses `IR-01` through `IR-25` (no LEARN prefix)
- `flow-c-lesson-experience.md` references `IR-LEARN-C1` through `IR-LEARN-C6` which correspond to IR-04 through IR-14 in the design doc

There is no cross-reference table mapping flow-scoped IR names to global IR numbers.

### CI-02: Flow file "Related Documents" cross-references use wrong flow file names

`flow-e-mkc.md` Section 8 lists:
- "Flow A — Home & Grow Tab" → `flow-a-home-grow.md` (actual file is `flow-a-welcome-modal.md`)
- "Flow B — Welcome Modal" → `flow-b-welcome-modal.md` (actual file is `flow-b-grow-tab.md`)
- "Flow C — Module Unlock" → `flow-c-module-unlock.md` (actual file is `flow-c-lesson-experience.md`)
- "Flow D — Lesson Navigation" → `flow-d-lesson-navigation.md` (actual file is `flow-d-module-completion.md`)

`flow-f-placement-quiz.md` Section 8 has the same incorrect cross-references (same flow B, C, D mismatches).

Both flow-e and flow-f have their "Related Documents" cross-reference tables pointing to non-existent files. All 4 linked files have wrong names.

### CI-03: `f0_welcome_modal_shown` write time conflict between business requirements and flow A

`docs/business/f0-learning/01-requirements.md` FR-LEARN-01: "Written to AsyncStorage at the moment the modal is rendered (not on dismiss)."

`flow-a-welcome-modal.md` Section 2 business flow diagram: Confirms write at render.

`DESIGN-F0-LEARN-05-interactions.md` IR-01: "f0_welcome_modal_shown = true (ALREADY written to AsyncStorage at modal render)."

These three are consistent. However, `flow-a-welcome-modal.md` AC-A-01 states the modal is shown "when network is available" which adds a network precondition not present in FR-LEARN-01. This is a direct contradiction (see P1-01 above for the offline behavior conflict). This CI entry tracks the inconsistency in the precondition, not the write timing.

### CI-04: Progress calculation denominator inconsistency

`flow-b-grow-tab.md` Section 2 states progress header: "Count lessons with state = COMPLETE across all 20 → display 'X/20 bài học'."

`docs/business/f0-learning/03-data-model.md` Section 5.3 `learningPathProgress()` calculates overall progress as: COMPLETE modules / 4. This returns 0–100% based on module completion, not individual lesson completion.

Two different progress metrics are used for the same "overall progress" display — lesson count (flow-b) vs. module count (data model). A developer reading both documents cannot determine which formula to implement.

### CI-05: MKC entry trigger inconsistency between flow D and flow E

`flow-d-module-completion.md` Section 2 MKC banner: "DELAY: Brief moment for user to read Card 5" before banner appears; banner has a "dismiss option."

`flow-e-mkc.md` Section 2.1 Step 1: "User taps 'Làm bài kiểm tra' banner (after Lesson 5) **or** 'Làm bài kiểm tra →' CTA on ModuleCard — requires `f0_module_{n}_state = LESSONS_COMPLETE`."

The entry trigger description in flow E says the banner appears "after Lesson 5" but does not reference the delay or the dismissal behavior described in flow D. These are two parts of the same UX moment and should cross-reference each other's timing/dismissal spec.

### CI-06: DESIGN-F0-LEARN-00-alignment.md references FR numbers that do not exist in V2

Screen list in alignment doc uses FR-LEARN-18 (MKC), FR-LEARN-19 (Placement Quiz), FR-LEARN-09 (Module Completion Reward Screen), FR-LEARN-10 (Bonus Cash Modal), FR-LEARN-12 (Daily Missions). V2 `01-requirements.md` goes only to FR-LEARN-10 (Post-Learning Age Gate) and the numbering is completely different. FR-LEARN-09 in V2 is Learning Path Completion, not Module Completion Reward Screen.

---

## 7. Open Questions Requiring PO/BA Decision

| # | Question | Relevant Files | Impact if Unresolved |
|---|----------|---------------|---------------------|
| OQ-01 | What are the Card 5 CTA deep-link destinations for all 20 lessons? | `flow-c-lesson-experience.md` DG-C-01; `02-content.md` | All 20 Card 5 primary CTAs are unimplementable |
| OQ-02 | Should the Welcome Modal show on first offline launch, or be deferred until network is available? | `flow-a-welcome-modal.md` EC-A-01 vs. `DESIGN-F0-LEARN-05-interactions.md` EC-01 | Developer cannot implement the network-gate condition |
| OQ-03 | Accept 5-question MKC pool (order-only randomization) or expand to 10 questions before launch? | `flow-e-mkc.md` G-E-01 | Content team scope and launch timeline |
| OQ-04 | Does a "module detail screen" exist between Grow tab and lesson card view? | `01-requirements.md` FR-LEARN-02 | One entire screen may need to be designed and built (or the reference in FR-LEARN-02 removed) |
| OQ-05 | Is `04-completion-trading.md` a separate document that still needs to be written, or does Flow G cover it entirely? | `00-index.md` Reading Order row 4; `DESIGN-F0-LEARN-04-component-spec.md` Related Documents | If the file exists and has additional requirements, they are currently excluded from scope |
| OQ-06 | What is the authoritative age calculation method (365.25 formula vs. exact calendar diff), and is Vietnam UTC+7 the defined timezone for birthday comparisons? | `01-requirements.md` BR-07; `flow-g-learning-complete.md` Steps 9, EC-G-02 | Age gate correctness and legal compliance |
| OQ-07 | Should the placement quiz opportunity be recoverable if the user force-kills before submit, or is permanent loss (current design) acceptable UX? | `flow-f-placement-quiz.md` G-F-01; `01-requirements.md` EC-10 | Product decision — no implementation impact if loss is accepted, but requires UX copy change |
| OQ-08 | Is the Grow Tab celebration state one screen (module list replaced) or two elements (banner + existing module list)? | `flow-b-grow-tab.md` Section 2; `flow-g-learning-complete.md` Section 2.5 | Component design and navigation spec differ between the two documents |
| OQ-09 | Will per-wrong-question review links in MKC fail screen actually navigate to the specific lesson card, or to the lesson overview? | `flow-e-mkc.md` Section 2.3; `DESIGN-F0-LEARN-05-interactions.md` Interaction Rules table | Navigation destination for these links is not specified — developer must decide |
| OQ-10 | Should the MKC banner delay before appearing on Lesson 5 Card 5 be 800ms (DG-D-03 suggestion) or another value? | `flow-d-module-completion.md` DG-D-03 | Without a precise value, each developer will choose their own, resulting in inconsistent UX |

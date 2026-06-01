# F0 Learning Path V2 — Review Task Tracking

**Review Date:** 2026-05-29
**Spec Version:** Business Layer 2.0 · Design Layer 2.0
**Total Tasks:** 52
**P0 (Pre-development blockers):** 5
**P1 (Pre-sprint-planning):** 8
**P2 (Pre-first-demo):** 7
**P3 (Nice-to-have / V2 consideration):** 5
**Design Gaps carried over (G-A through G-G):** 27

---

## Task Table

| ID | Task | Category | Priority | Owner | Est | Status |
|----|------|----------|----------|-------|-----|--------|
| **BLOCKERS — must resolve before any development** |
| RT-01 | Update DESIGN-F0-LEARN-00-alignment.md to remove all V1 XP/badge/bonus-cash references and correct FR number references to match V2 numbering (FR-LEARN-01 through FR-LEARN-10) | Consistency | P0 | Design Lead | 2h | Open |
| RT-02 | Define Card 5 CTA deep-link destination for all 20 lessons as a navigation destination table (route name + params) — required to implement "Thực hành ngay →" on any lesson | Spec-Gap | P0 | PO + BA | 4h | Open |
| RT-03 | Add `f0_explore_path_taken` to 03-data-model.md Section 1.1 Global Keys, Section 1.6 complete key list, ALL_F0_KEYS array, and LearningPathState TypeScript interface | Spec-Gap | P0 | BA | 1h | Open |
| RT-04 | Add `f0_lesson_1_{1-5}_card_index` (all = 4) to Placement Quiz pass batch write in 03-data-model.md Section 3.3 and Section 7.3 | Spec-Gap | P0 | BA | 30m | Open |
| RT-05 | PO/BA decision: accept 5-question MKC pool (order-only randomization for V1) OR commission 5 additional questions per module (10 total per module) before content freeze — document decision explicitly in 02-content.md intro | Decision-Required | P0 | PO + Content Team | — | Open |
| **HIGH PRIORITY — resolve before sprint planning** |
| RT-06 | Resolve offline first-launch behavior: decide whether Welcome Modal shows offline with PNG fallback OR is deferred until network — update flow-a EC-A-01 and DESIGN-F0-LEARN-05-interactions.md EC-01 to match | Consistency | P1 | PO + BA | 1h | Open |
| RT-07 | Define authoritative MKC banner appearance delay value in milliseconds — add to flow-d Section 4.4 Interaction Rules as a definitive rule (not recommendation) | Spec-Gap | P1 | BA | 30m | Open |
| RT-08 | Confirm and document LearningPromptCard copy strings: eyebrow label, headline/body, CTA label ("Bắt đầu ngay →" or other) — required before Figma design and engineering | Content | P1 | UX Writer | 1h | Open |
| RT-09 | Standardize Card 4 quiz submit button label to "Kiểm tra" throughout: update all occurrences of "Xác nhận" in flow-c, component spec QuizCard section, and QA test cases | Consistency | P1 | BA | 30m | Open |
| RT-10 | Align age calculation method: choose one (recommend `dayjs.diff` in UTC+7) and update BR-07 in requirements, Step 9 in flow-g, and IR-24 in interaction rules to all reference the same approach. Add timezone (Vietnam UTC+7) to BR-07. | Consistency | P1 | BA + Engineering | 1h | Open |
| RT-11 | Remove "No cooldown in this version" from flow-d EC-D-03 and update AC-D-08 to reflect 60-second cooldown on MKC fail consistent with FR-LEARN-07 and flow-e | Consistency | P1 | BA | 20m | Open |
| RT-12 | Add `f0_mkc_{n}_state = FAILED` write to flow-e Section 2.3 Fail Sequence Step 1 to match FR-LEARN-07 postcondition and data model batch write table | Consistency | P1 | BA | 20m | Open |
| RT-13 | Remove `f0_age_gate_shown = true` write from flow-g Section 2.2 Case A (age ≥ 18) and from IR-24 (≥18 branch) to match FR-LEARN-10 which states this key is NOT written for ≥18 path | Consistency | P1 | BA | 20m | Open |
| **MEDIUM PRIORITY — resolve before first sprint review** |
| RT-14 | Confirm whether 04-completion-trading.md exists as a separate document or is superseded by flow-g; if superseded, remove reference from 00-index.md reading order row 4 and component spec related documents | Spec-Gap | P2 | BA | 30m | Open |
| RT-15 | Align Welcome Modal primary CTA copy: update FR-LEARN-01 in requirements to use "Bắt đầu Module 1" (matching flow-a and interaction rules) rather than "Bắt đầu học từ đầu" | Consistency | P2 | BA | 15m | Open |
| RT-16 | Decide whether to allow emoji in toast copy ("Module N Hoàn Thành! 🎓") and if yes, specify Android API fallback behavior in the component spec | Design | P2 | Design Lead | 1h | Open |
| RT-17 | Specify Card 5 "Tiếp tục →" and "Thực hành ngay →" CTA behavior in review mode — do they navigate to next lesson, stay on current lesson, or exit to Grow tab? Add to flow-c Review Mode block and IR-C-16 | Spec-Gap | P2 | BA | 1h | Open |
| RT-18 | Resolve module detail screen ambiguity: confirm whether a module detail screen exists between Grow tab and lesson card view. If no: update FR-LEARN-02 to remove the reference. If yes: write a flow spec for it. | Decision-Required | P2 | PO + BA | 2h | Open |
| RT-19 | Fix progress calculation denominator: decide whether Grow Tab overall progress header uses lesson count (X/20) or module count (X/4 modules) — update flow-b Section 2 and/or data model Section 5.3 to use the same formula | Consistency | P2 | BA | 30m | Open |
| RT-20 | Clarify Grow Tab celebration state structure: is it (a) a full module-list replacement or (b) a banner at top with existing module list below — align flow-b Section 2 with flow-g Section 2.5, specify CTA copy and navigation destination | Consistency | P2 | BA + Design | 1h | Open |
| **NICE-TO-HAVE / V2 CONSIDERATION** |
| RT-21 | Add "quiz will not be saved if you close this screen" disclaimer on Placement Quiz intro screen (per G-F-01) | Design | P3 | UX Writer | 1h | V2 |
| RT-22 | Add `date-fns differenceInYears` or `dayjs` as the authoritative library for birthday calculation (per G-G-04) — prevents Feb 29 edge case off-by-one | Spec-Gap | P3 | Engineering | 2h | V2 |
| RT-23 | Add social sharing CTA to Learning Complete screen with reserved layout space (per G-G-01) — define share destination before reserving space | Spec-Gap | P3 | PO + Design | 3h | V2 |
| RT-24 | Add push notification on 18th birthday for under-18 users who completed learning (per G-G-02) | Spec-Gap | P3 | PO + Engineering | 4h | V2 |
| RT-25 | Add explicit "are you sure?" confirmation dialog on MKC exit (✕) at Q3+ (per G-E-04) | Design | P3 | Design + BA | 2h | V2 |
| **DESIGN GAPS CARRIED OVER FROM FLOW FILES** |
| RT-26 | DG-A-01: Add 200ms grace period before evaluating NetInfo on app launch to prevent false positive/negative network state | Design | P2 | Engineering | 1h | Open |
| RT-27 | DG-A-02: Bundle Lottie animation as local asset to eliminate network dependency for Welcome Modal animation | Design | P2 | Engineering | 2h | Open |
| RT-28 | DG-A-03: Await `AsyncStorage.setItem` before triggering navigation from Welcome Modal CTAs to prevent race condition on fast taps | Spec-Gap | P1 | Engineering | 30m | Open |
| RT-29 | DG-A-04: Add analytics event on Welcome Modal CTA tap: `welcome_modal_cta_tapped: {path: 'start_m1' | 'explore' | 'placement_quiz'}` | Spec-Gap | P2 | Engineering | 1h | Open |
| RT-30 | DG-A-05: Store `f0_explore_path_taken` in AsyncStorage (not component state) to survive app background/foreground cycles — this is also a P0 blocker (see RT-03) | Spec-Gap | P0 | BA + Engineering | 30m | Open |
| RT-31 | DG-B-01: Specify that ONE lime CTA assignment is calculated on initial render from stored module state, not dynamically on scroll, to prevent button variant flickering | Spec-Gap | P1 | BA + Design | 1h | Open |
| RT-32 | DG-B-02: Document resume destination rule: "always resume the highest-numbered IN_PROGRESS lesson in the module" — add to flow-b Section 4.5 and engineering spec | Spec-Gap | P1 | BA | 30m | Open |
| RT-33 | DG-B-03: Use `AsyncStorage.multiGet` for all 20 lesson state keys in single call on Grow tab mount (prevent sequential reads that may exceed 400ms threshold) — add to data model Section 8 cold start note | Spec-Gap | P1 | Engineering | 1h | Open |
| RT-34 | DG-B-04: On Grow tab mount, validate module state against lesson completion counts and silently correct if inconsistent — already partially covered by data model Section 6 healing logic but needs explicit callout in flow-b | Spec-Gap | P2 | Engineering | 1h | Open |
| RT-35 | DG-B-05: Define LearningPromptCard copy (see RT-08) | Content | P1 | UX Writer | 1h | Open |
| RT-36 | DG-B-06: Check trading account setup status before navigating to Trade tab from Grow tab celebration "Đến Trading →" CTA — specify check logic and fallback | Decision-Required | P2 | PO + BA | 2h | Open |
| RT-37 | DG-C-01: Define Card 5 CTA deep-link destinations for all 20 lessons (see RT-02) | Spec-Gap | P0 | PO + BA | 4h | Open |
| RT-38 | DG-C-02: Hint text for all 20 lesson Card 4 quizzes — verify 02-content.md has all 20 hints (CONFIRMED: all present in 02-content.md — no action needed) | Content | — | — | — | Done |
| RT-39 | DG-C-03: Consider storing quiz question/answer config in a local JSON file updatable via OTA (CodePush/Expo OTA) instead of hardcoded TypeScript constants — document OTA strategy | Design | P3 | Engineering | 4h | V2 |
| RT-40 | DG-C-05: Specify LessonProgressBar behavior in review mode — recommend showing 5/5 complete with review indicator rather than tracking current card position | Spec-Gap | P2 | BA + Design | 30m | Open |
| RT-41 | DG-C-06: Standardize quiz submit button label to "Kiểm tra" (see RT-09) | Consistency | P1 | BA | 20m | Open |
| RT-42 | DG-C-07: Cap swipe threshold at max 120px for large screens (tablets) — add to DESIGN-F0-LEARN-05-interactions.md IR-04 | Spec-Gap | P2 | Engineering | 30m | Open |
| RT-43 | DG-D-01: Verify MKC question content for all 4 modules is present in 02-content.md (CONFIRMED: all 20 MKC questions present — no action needed) | Content | — | — | — | Done |
| RT-44 | DG-D-02: Flow G spec now exists (confirmed) — remove DG-D-02 from flow-d as resolved | Consistency | P1 | BA | 15m | Open |
| RT-45 | DG-D-03: Define MKC banner appearance delay in milliseconds (see RT-07) | Spec-Gap | P1 | BA | 30m | Open |
| RT-46 | DG-D-04: Store MKC config (question count, pass threshold) in local JSON config for OTA updatability | Design | P3 | Engineering | 2h | V2 |
| RT-47 | DG-D-05: Use actual module display names in toast: "Module 1: Cổ phiếu cơ bản — Hoàn thành!" instead of template "Module N Hoàn Thành!" | Content | P2 | UX Writer | 30m | Open |
| RT-48 | DG-D-06: Add 1000ms pause showing toast before auto-navigating to next module after MKC pass — verify this is already in data model Section 7 (CONFIRMED: present as "Auto-navigate delay: 1000ms") | Spec-Gap | — | — | — | Done |
| RT-49 | DG-D-07: Add confirmation dialog on MKC back/exit mid-quiz: "Bạn có chắc muốn thoát? Tiến trình làm bài sẽ không được lưu." | Design | P2 | Design + UX Writer | 1h | Open |
| RT-50 | G-E-01: Expand MKC question pool to 10 per module (see RT-05 for PO decision) | Content | P0 | Content Team | 8h | Open |
| RT-51 | G-E-02/G-E-03: Document V1 acceptance of client-side timestamp manipulation and answer key extractability — add to 01-requirements.md as explicit V1 known risks | Spec-Gap | P2 | BA | 30m | Open |
| RT-52 | G-E-05: Add ghost "Về trang học →" secondary CTA below countdown on MKC fail screen, or ensure ✕ button is visually prominent | Design | P2 | Design | 1h | Open |

---

## Gaps Already Resolved (Confirmed During Review)

| Gap ID | Description | Resolution |
|--------|-------------|------------|
| DG-C-02 | Hint text for all 20 Card 4 quizzes not specified | CONFIRMED PRESENT: All 20 hint texts are in 02-content.md (Gợi ý after each Card 4 quiz) |
| DG-D-01 | MKC question content for all 4 modules not specified | CONFIRMED PRESENT: All 20 MKC questions (5 per module) are in 02-content.md with correct answers |
| DG-D-02 | Flow G (Learning Complete screen) does not exist | CONFIRMED: flow-g-learning-complete.md exists and is fully specified |
| DG-D-08 | Auto-navigate delay not specified | CONFIRMED: 1000ms delay specified in flow-d Section 8 Engineering Layer |

---

## Content Completeness Verification

| Content Item | Required | Present in 02-content.md | Status |
|-------------|---------|--------------------------|--------|
| Placement Quiz — 5 questions with answers | 5 | 5 | ✅ |
| M1 Lessons — 5 lessons × 5 cards | 25 | 25 | ✅ |
| M2 Lessons — 5 lessons × 5 cards | 25 | 25 | ✅ |
| M3 Lessons — 5 lessons × 5 cards | 25 | 25 | ✅ |
| M4 Lessons — 5 lessons × 5 cards | 25 | 25 | ✅ |
| Card 4 Quiz — question per lesson (20 total) | 20 | 20 | ✅ |
| Card 4 Quiz — 4 options per question | 80 | 80 | ✅ |
| Card 4 Quiz — correct answer per question | 20 | 20 | ✅ |
| Card 4 Quiz — hint text per question | 20 | 20 | ✅ |
| MKC M1 — 5 questions with answers | 5 | 5 | ✅ |
| MKC M2 — 5 questions with answers | 5 | 5 | ✅ |
| MKC M3 — 5 questions with answers | 5 | 5 | ✅ |
| MKC M4 — 5 questions with answers | 5 | 5 | ✅ |
| Card 5 CTA — in-app action text per lesson | 20 | 20 | ⚠ Text present; navigation destination absent |
| MKC question pool > quiz size (≥10 per module) | 40 | 20 | ❌ Pool = quiz size |

---

## AsyncStorage Key Completeness Check

| Key | In Data Model (03-data-model.md) | Used in Flow Files | Status |
|-----|:---:|:---:|:---:|
| `f0_welcome_modal_shown` | ✅ | ✅ | OK |
| `f0_placement_quiz_completed` | ✅ | ✅ | OK |
| `f0_placement_quiz_passed` | ✅ | ✅ | OK |
| `f0_learning_path_complete` | ✅ | ✅ | OK |
| `f0_age_gate_shown` | ✅ | ✅ | OK |
| `f0_module_{1-4}_state` | ✅ | ✅ | OK |
| `f0_lesson_{m}_{l}_state` (20 keys) | ✅ | ✅ | OK |
| `f0_lesson_{m}_{l}_card_index` (20 keys) | ✅ | ✅ | OK |
| `f0_mkc_{m}_state` (4 keys) | ✅ | ✅ | OK |
| `f0_mkc_{m}_cooldown_start` (4 keys) | ✅ | ✅ | OK |
| `f0_explore_path_taken` | ❌ MISSING | ✅ (flow-a, flow-b, IR-02, IR-20) | **BLOCKER** |

Total data model key count stated in 03-data-model.md: 49. Actual count with `f0_explore_path_taken`: 50. Key count in document is understated by 1.

---

## QA Coverage Summary

| Flow | Flow-specific TC count | Design-level TC count | Total mapped | Minimum 5/flow |
|------|:---:|:---:|:---:|:---:|
| Flow A — Welcome Modal | TC-A-01–TC-A-09 (9) | TC-01–TC-08 (8) | 9 unique | ✅ |
| Flow B — Grow Tab | TC-B-01–TC-B-10 (10) | TC-09–TC-16 (8) | 10 unique | ✅ |
| Flow C — Lesson Experience | TC-C-01–TC-C-12 (12) | TC-17–TC-28 (12) | 12 unique | ✅ |
| Flow D — Module Completion | TC-D-01–TC-D-10 (10) | TC-29–TC-35 (7 MKC) | 10 unique | ✅ |
| Flow E — MKC | QA-E-01–QA-E-14 (14) | TC-29–TC-35 overlap | 14 unique | ✅ |
| Flow F — Placement Quiz | QA-F-01–QA-F-15 (15) | TC-36–TC-41 (6) | 15 unique | ✅ |
| Flow G — Learning Complete | QA-G-01–QA-G-13 (13) | TC-42–TC-49 (8) | 13 unique | ✅ |
| Local Storage / Recovery | — | TC-50–TC-54 (5) | 5 unique | ✅ |

All flows meet the minimum 5 QA test cases requirement.

---

## Priority Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 5 | Development cannot start without these resolved |
| P1 | 13 | Sprint planning cannot begin without these resolved |
| P2 | 14 | Should be resolved before first sprint demo |
| P3 / V2 | 5 | Nice-to-have; defer to V2 roadmap |
| Resolved | 4 | Already confirmed complete during review |
| **Total** | **41** | **Excluding V2 deferrals and resolved items** |

# F0 Learning Path — Interaction Rules & Edge Case Handling
**Version:** 2.0 | **Date:** 2026-05-29 | **Feature:** F0 Learning Path (Module F-LEARN)
**Architecture:** Frontend-only · AsyncStorage · No rewards

> **Format:** `[Trigger] → [System Response]`
> **Reference:** Full motion specs in `DESIGN-F0-LEARN-03-ui-spec.md §5`
> **Business requirements:** `docs/business/f0-learning/01-requirements.md`

---

## 1. Interaction Rules

### IR-01 — Welcome Modal: Primary CTA

```
Trigger:   User taps "Bắt đầu Module 1" on Welcome Modal
Response:  f0_welcome_modal_shown = true (ALREADY written to AsyncStorage at modal render)
           Modal dismisses (fade out, 300ms)
           Navigate to L1.1 Card 1 (Concept card)
           f0_lesson_1_1_card_index = 0 written to AsyncStorage
           f0_lesson_1_1_state = IN_PROGRESS written to AsyncStorage
           f0_module_1_state = IN_PROGRESS written to AsyncStorage
           [Grow tab is NOT visited as intermediate step]
```

### IR-02 — Welcome Modal: Secondary CTA

```
Trigger:   User taps "Khám phá trước" on Welcome Modal
Response:  f0_welcome_modal_shown = true (ALREADY written at render)
           Modal dismisses (fade out, 300ms)
           User lands on Home tab (default tab, no navigation)
           Grow tab shows LearningPromptCard on next visit
           [LearningPromptCard condition: f0_welcome_modal_shown=true AND f0_module_1_state=UNLOCKED]
```

### IR-03 — Welcome Modal: Tertiary Link

```
Trigger:   User taps "Tôi đã biết chứng khoán cơ bản" (plasma text link)
Response:  f0_welcome_modal_shown = true (ALREADY written at modal render — flag is idempotent)
           Navigate to Placement Quiz intro screen (slideUp, 400ms)
           Back navigation AVAILABLE on intro screen
```

### IR-04 — Card Advance (Swipe Left or Next Tap)

```
Trigger:   User swipes left on lesson card (threshold ≥30% card width)
           OR taps "Tiếp theo →" chevron button
Response:  Current card slides left (300ms ease-decelerate)
           Next card slides in from right (300ms ease-decelerate, parallel)
           Progress bar animates to new fill % (300ms ease-standard)
           Progress dot updates state (active dot moves to next position)
           f0_lesson_{n}_{m}_card_index saved to AsyncStorage (debounced 500ms after animation)
```

### IR-05 — Card Back (Swipe Right or Back Tap)

```
Trigger:   User swipes right on lesson card (threshold ≥30% card width)
           OR taps back chevron button
Response:  Current card slides right (300ms ease-decelerate)
           Previous card slides in from left (300ms ease-decelerate, parallel)
           Progress bar + dots update to reflect previous position
           [No card_index decrement — async save only moves forward]
```

### IR-06 — Swipe Right on Card 1 (First Card Boundary)

```
Trigger:   User swipes right on Card 1 (Concept) — no previous card exists
Response:  Card bounces right 8px → returns to original position (200ms ease-spring)
           Haptic feedback: iOS light impact / Android tick
           No navigation; card remains at position 1
```

### IR-07 — Quiz: Correct Answer Selected

```
Trigger:   User taps the correct quiz option (evaluated locally vs. hardcoded answer key)
Response:  Option fills quiz-correct-bg (150ms ease-standard)
           Positive border 1.5px appears on option
           Lucide check-circle icon fades in at option right (150ms)
           All other options simultaneously switch to disabled state (opacity-40)
           "Tiếp theo →" button activates (opacity-40 → 1.0, 150ms)
           [No auto-advance — user must tap "Tiếp theo" explicitly]
```

### IR-08 — Quiz: Wrong Answer Selected (Attempts 1 and 2)

```
Trigger:   User taps a quiz option that is NOT the correct answer (attempt ≤ 2)
Response:  Option fills quiz-wrong-bg (150ms ease-standard)
           Negative border 1.5px appears on option
           Lucide x-circle icon fades in at option right (150ms)
           Shake animation on the selected option row (300ms, keyframe)
           "Thử lại nhé!" — show feedback message below options (caption-drop, negative)
           attempt_count incremented in component state (not saved to AsyncStorage)
           After 300ms: wrong option returns to default state; all options re-enabled
           [User can tap any option again immediately]
```

### IR-09 — Quiz: Wrong Answer Selected (Attempt 3 — Hint Trigger)

```
Trigger:   User taps a wrong answer for the 3rd consecutive time
Response:  Same wrong-answer feedback as IR-08 (quiz-wrong-bg, shake)
           After 300ms: HintCard slides in from right (300ms ease-decelerate)
           HintCard overlays QuizCard, displaying lesson-specific hint text
           [User MUST tap "Hiểu rồi" before retrying — back not available on HintCard]
           [No attempt limit is enforced after hint shown — unlimited retries continue]
```

### IR-10 — Hint Card: Dismiss

```
Trigger:   User taps "Hiểu rồi, thử lại →" on HintCard
Response:  HintCard slides out to right (300ms ease-accelerate)
           QuizCard revealed beneath (no new animation needed)
           All options reset to default state
           User may attempt quiz again (no limit enforced)
```

### IR-11 — CTA Card: Primary Action Tap

```
Trigger:   User taps "Thực hành ngay →" on Card 5 (CTA Card)
Response:  Navigate to relevant in-app section (deep link specified per lesson in content)
           Examples:
             L1.3 → navigate to Trade tab, search for "VNM"
             L2.1 → navigate to stock detail for "FPT", scroll to Phân tích tab
             L3.3 → navigate to Portfolio tab watchlist
           Lesson completion triggered immediately on CTA tap
           f0_lesson_{n}_{m}_state = COMPLETE written to AsyncStorage
           If this was Lesson N < 5: f0_lesson_{n}_{m+1}_state = UNLOCKED
           If this was Lesson 5: f0_module_{n}_state = LESSONS_COMPLETE
```

### IR-12 — CTA Card: Secondary Action ("Tiếp tục →")

```
Trigger:   User taps "Tiếp tục →" on Card 5 (CTA Card) — skips in-app action
Response:  Lesson completion triggered (idempotent — same as IR-11)
           f0_lesson_{n}_{m}_state = COMPLETE written to AsyncStorage
           If lesson N < 5: navigate to next lesson (L{n}.{m+1} Card 1)
           If lesson 5: module completion banner slides up from bottom (see IR-15)
           User returns to Grow tab after 300ms delay
```

### IR-13 — Lesson Completion: Lesson < 5 in Module

```
Trigger:   Lesson N (N < 5) state transitions to COMPLETE (from IR-11 or IR-12)
Response:  Next lesson unlocks: f0_lesson_{n}_{m+1}_state = UNLOCKED
           ModuleCard progress bar updates on Grow tab
           "Bài học tiếp theo đã mở khóa!" snackbar (body-md, lime, 2s auto-dismiss, bottom)
           [No XP toast — rewards removed in V2]
```

### IR-14 — Lesson Completion: Lesson 5 (Final Lesson in Module)

```
Trigger:   Lesson 5 of module N transitions to COMPLETE (from IR-11 or IR-12)
Response:  f0_module_{n}_state = LESSONS_COMPLETE written to AsyncStorage
           Module completion banner slides up from bottom (300ms ease-decelerate):
             "Bạn đã học xong [Module Name]! Làm bài kiểm tra →"
             (lime border, ink-800 bg, KineticButton lime)
           [Module does NOT move to COMPLETE until MKC is passed — state stays LESSONS_COMPLETE]
           [No XP toast — rewards removed in V2]
```

### IR-15 — Module Card Tap: LOCKED State

```
Trigger:   User taps a LOCKED ModuleCard on Learning Path Home
Response:  Tooltip fades in above card (200ms ease-decelerate)
           Copy: "Hoàn thành Module [N-1] để mở khóa"
           Tooltip auto-hides after 2500ms (fade out 200ms)
           No navigation; no bottom sheet; no action
```

### IR-16 — Module Card Tap: LESSONS_COMPLETE State

```
Trigger:   User taps ModuleCard in LESSONS_COMPLETE state (all lessons done, MKC not yet passed)
Response:  Navigate to MKC for that module
           MKC opens at Q1; forward-only navigation; back chevron HIDDEN
```

### IR-17 — MKC: Submit (Nộp bài)

```
Trigger:   User taps "Nộp bài" on Question 5 of MKC
Response:  Button briefly enters submitted state (150ms visual feedback)
           Score evaluated CLIENT-SIDE against hardcoded answer key in app bundle
           [NO server API call — evaluation is synchronous]
           [Score ≥ 3/5 — PASS] → navigate to MKC Pass screen (slideUp, see IR-18)
           [Score < 3/5 — FAIL] → navigate to MKC Fail screen (slideUp)
                                   f0_mkc_{n}_cooldown_start = Date.now()
                                   60s client-side countdown begins
```

### IR-18 — MKC Pass: Module Complete

```
Trigger:   MKC score ≥ 3/5
Response:  f0_mkc_{n}_state = PASSED
           f0_module_{n}_state = COMPLETE
           If n < 4: f0_module_{n+1}_state = UNLOCKED
           Pass screen renders:
             AmbientBackground: lime orbs
             "Module N Hoàn Thành!" (display-md, lime)
             Score "X/5" (display-sm, lime)
             If n < 4: CTA "Bắt đầu Module N+1 →" (lime)
             If n = 4: CTA "Xem kết quả học →" (lime) → Flow G (Learning Complete)
           [No badge, no XP — rewards removed in V2]
```

### IR-19 — MKC Retry (After Cooldown)

```
Trigger:   User taps "Thử lại ngay →" on MKC Fail screen (cooldown elapsed)
Response:  Navigate to MKC screen (same module, questions re-randomized from hardcoded pool)
           Progress bar resets to 0 (Câu 1/5)
           New 60s cooldown will start only AFTER this attempt's submission if failed again
           Previous f0_mkc_{n}_cooldown_start is still in AsyncStorage (overwritten only on next fail)
```

### IR-20 — Grow Tab: Load State from AsyncStorage

```
Trigger:   User navigates to Grow tab
Response:  Read all f0_module_{1-4}_state and f0_lesson_{1-4}_{1-5}_state from AsyncStorage
           Show skeleton loaders (100ms, to avoid flash on fast reads)
           Render ModuleCards with correct variant based on read state
           [No API call — all data is local]
           Error fallback: if AsyncStorage read fails → show M1 UNLOCKED, rest LOCKED
```

### IR-21 — Placement Quiz: Back Navigation Blocked

```
Trigger:   Q1 of Placement Quiz renders on screen (user tapped "Bắt đầu" on intro card)
Response:  System back gesture (iOS swipe-from-left, Android back button) DISABLED
           Back chevron in header: HIDDEN for entire quiz duration (Q1 through Q5)
           [User cannot return to Welcome Modal or intro screen during quiz]
           [Enforced at navigation stack level — intro screen is popped on Q1 navigate]
```

### IR-22 — Placement Quiz: Submission

```
Trigger:   User taps "Nộp bài" on Placement Quiz Q5
Response:  Score evaluated CLIENT-SIDE (hardcoded answer key in bundle)
           [NO server API call — evaluation is synchronous]
           f0_placement_quiz_completed = true written to AsyncStorage
           f0_placement_quiz_passed = (score >= 4) written to AsyncStorage
           [≥ 4/5 correct — PASS]:
             f0_module_1_state = COMPLETE
             f0_module_2_state = UNLOCKED
             Navigate to Placement Pass screen (slideUp, AmbientBackground lime)
             CTA "Bắt đầu Module 2 →" → L2.1 Card 1
             [No M1 badge — rewards removed in V2]
           [< 4/5 correct — FAIL]:
             Navigate to Placement Fail screen (slideUp, AmbientBackground plasma)
             CTA "Bắt đầu Module 1 →" → L1.1 Card 1
           [No retry option — one-shot quiz]
```

### IR-23 — Learning Path Complete: Trigger

```
Trigger:   f0_module_4_state transitions to COMPLETE (M4 MKC passed)
Response:  f0_learning_path_complete = true written to AsyncStorage
           Navigate to Learning Complete screen (slideUp, AmbientBackground lime + plasma)
           Screen shows:
             "Chúc mừng! 🎓"
             "Bạn đã hoàn thành toàn bộ chương trình học!"
             Stats: "4 modules · 20 bài học · Sẵn sàng đầu tư"
             CTA: "Bắt đầu đầu tư →" (KineticButton lime)
```

### IR-24 — Post-Learning Age Gate Check

```
Trigger:   User taps "Bắt đầu đầu tư →" on Learning Complete screen
Response:  Read user DOB from local profile AsyncStorage
           Calculate age: floor((Date.now() - DOB_timestamp) / (365.25 * 24 * 3600 * 1000))
           f0_age_gate_shown = true written to AsyncStorage
           [Age ≥ 18]:
             Navigate to Trade tab directly
             Show tooltip: "Sẵn sàng đặt lệnh đầu tiên! 💪" (lime, auto-dismiss 2500ms)
           [Age < 18 OR DOB missing/invalid]:
             Navigate to Home tab
             AgeGateBottomSheet slides up (400ms)
             Show specific date when user turns 18 (if DOB available)
             [DOB missing]: use no-date variant, add "Cập nhật Hồ sơ" text link
```

### IR-25 — Module Unlock: Next Module Becomes Available

```
Trigger:   f0_module_{n}_state transitions to COMPLETE
Response:  f0_module_{n+1}_state = UNLOCKED written to AsyncStorage (if n < 4)
           On Grow tab: ModuleCard for M{n+1} transitions LOCKED → UNLOCKED
           Border pulses lime once (600ms ease-spring)
           "MODULE N+1 MỞ KHÓA!" snackbar (lime, body-md, 2.5s, bottom of screen)
           [Triggered even if user is not on Grow tab — visual shown on next Grow tab visit]
```

---

## 2. Edge Case UI Handling

### EC-01 — No Network on First Launch

```
Edge Case:      User opens app for the first time with no network connection
Detection:      AsyncStorage read of f0_welcome_modal_shown returns false (local, always available)
                BUT app requires network for Lottie asset download
User sees:      Welcome Modal shows with static PNG fallback (Lottie not loaded)
                All 3 CTAs are active immediately (not gated on Lottie)
System does:    Reads f0_welcome_modal_shown from AsyncStorage (local, no network needed)
                Writes f0_welcome_modal_shown = true at modal render (local write, no network)
Recovery path:  User can proceed with all 3 CTAs normally. Lottie loads on next online launch.
UI indicator:   None. Modal functions fully offline.
```

### EC-02 — App Force-Kill Mid-Lesson (Before Card Save)

```
Edge Case:      User exits the app abruptly between card advance and AsyncStorage save
                (AsyncStorage write is debounced 500ms — save may not have completed)
User sees:      On relaunch: lesson resumes at last SUCCESSFULLY saved card_index
                No toast — silent resume (user expects to be at last card they saw)
System does:    Reads f0_lesson_{n}_{m}_card_index from AsyncStorage on lesson open
                Renders at saved index (may be 1 card behind actual last-seen card)
Recovery path:  User swipes forward to return to their position (at most 1 card behind)
                [Card 4 attempt count resets to 0 on relaunch — session-scoped state]
```

### EC-03 — Placement Quiz Force-Kill Before Submission

```
Edge Case:      User starts Placement Quiz (past intro screen) but force-kills before "Nộp bài"
Detection:      f0_placement_quiz_completed = false; f0_welcome_modal_shown = true
User sees:      On relaunch: Welcome Modal does NOT fire again (f0_welcome_modal_shown = true)
                User lands on Home tab normally
                M1 shows UNLOCKED in Grow tab
                No Placement Quiz entry point exists
System does:    Quiz answers are NOT saved to AsyncStorage (no partial save by design)
                f0_welcome_modal_shown was already written at modal render (before quiz)
Recovery path:  No recovery path — one-shot opportunity is effectively lost on force-kill
                [This is acceptable by design — progress fully resets on reinstall if desired]
```

### EC-04 — AsyncStorage Read Failure on Grow Tab

```
Edge Case:      AsyncStorage.multiGet fails on Grow tab mount (very rare; OS-level error)
User sees:      Skeleton loaders shown briefly, then fallback state renders:
                M1 ModuleCard: UNLOCKED state
                M2, M3, M4: LOCKED state
                No error message shown (silent degraded state)
System does:    Logs error to crash reporter
                Renders deterministic fallback (M1 UNLOCKED, others LOCKED)
Recovery path:  Pull-to-refresh on Grow tab retries AsyncStorage read
                If read succeeds: correct state restores immediately
```

### EC-05 — Missing or Invalid DOB for Age Check

```
Edge Case:      User completes learning path but DOB is absent or unparseable in local profile
Detection:      DOB field is null, empty, or not a valid date
User sees:      "Bắt đầu đầu tư →" CTA tap → AgeGateBottomSheet (no-date variant)
                "Cập nhật ngày sinh trong Hồ sơ để mở tính năng giao dịch."
                CTA "Xem thị trường →" still available
System does:    Treats missing DOB as under-18 (safe default — never accidentally grant trade access)
                f0_age_gate_shown = true written to AsyncStorage
Recovery path:  User updates DOB in Profile tab → navigates to Trade tab manually
                [No re-trigger of learning complete screen — user must navigate directly to Trade]
```

### EC-06 — MKC App Backgrounded During Cooldown

```
Edge Case:      User fails MKC, cooldown starts, app is backgrounded or killed
User sees:      On relaunch + navigate to MKC results:
                Cooldown timer shows correct REMAINING time (not reset to 60s)
                If cooldown already elapsed: "Thử lại ngay →" shown immediately
System does:    Reads f0_mkc_{n}_cooldown_start from AsyncStorage
                Calculates remaining: Math.max(0, (cooldown_start + 60000 - Date.now()) / 1000)
                Renders MKCCooldownBanner with correct secondsRemaining
Recovery path:  Normal retry flow resumes from correct remaining time
                [Client-side timer — device time manipulation can bypass; accepted V1 risk]
```

---

*Owner: Product Design + Frontend Dev*
*Business requirements: `docs/business/f0-learning/01-requirements.md`*
*QA test cases: `DESIGN-F0-LEARN-06-qa-cases.md`*

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| F0 Learning Path V2 | `docs/business/f0-learning/00-index.md` |
| Functional Requirements | `docs/business/f0-learning/01-requirements.md` |
| Local Storage Data Model | `docs/business/f0-learning/03-data-model.md` |
| Flow: Welcome Modal | `docs/business/f0-learning/flow-a-welcome-modal.md` |
| Flow: MKC | `docs/business/f0-learning/flow-e-mkc.md` |
| Flow: Placement Quiz | `docs/business/f0-learning/flow-f-placement-quiz.md` |
| Flow: Learning Complete | `docs/business/f0-learning/flow-g-learning-complete.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Design Alignment + Tokens | `docs/design/DESIGN-F0-LEARN-00-alignment.md` |
| Screen Wireframes | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| UI Specification | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |
| Component Specs | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| QA Test Cases | `docs/design/DESIGN-F0-LEARN-06-qa-cases.md` |

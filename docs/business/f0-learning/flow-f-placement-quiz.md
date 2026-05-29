# Flow F — Placement Quiz

**FR:** FR-LEARN-08
**Version:** 1.0
**Last updated:** 2026-05-29

---

## 1. Flow Summary

| Field | Value |
|---|---|
| Flow ID | Flow F |
| Feature Reference | FR-LEARN-08 |
| Actor | New user who taps "Tôi đã biết chứng khoán cơ bản" tertiary CTA on Welcome Modal |
| Entry Trigger | Tertiary CTA tap on Welcome Modal |
| Exit Points | Pass screen → Module 2 L2.1 Card 1; Fail screen → Module 1 L1.1 Card 1; Intro back → Welcome Modal |
| One-Shot Constraint | Quiz can only be taken once. `f0_placement_quiz_completed = true` is written on submit and permanently blocks re-entry. |
| Architecture | Frontend-only. All scoring is client-side (hardcoded answers in app bundle). No rewards (XP/badges) in this version. |
| Backend Calls | None |
| AsyncStorage Keys Written | `f0_placement_quiz_completed`, `f0_placement_quiz_passed`, `f0_module_1_state`, `f0_module_2_state` |

---

## 2. Business Flow

### 2.1 Numbered Steps

1. User sees Welcome Modal. `f0_welcome_modal_shown = true` is written at modal render time (before any CTA tap).
2. User taps "Tôi đã biết chứng khoán cơ bản" (tertiary CTA).
3. Placement Quiz Intro screen opens (slideUp animation, 400 ms).
4. **Intro screen:** back navigation is AVAILABLE. User can swipe or tap back to return to Welcome Modal.
5. User reads intro copy: "Kiểm tra nhanh kiến thức của bạn" + "5 câu — không cần ôn tập, trả lời thành thật nhất".
6. User taps "Bắt đầu" KineticButton (lime).
7. Q1 renders immediately. **Back navigation BLOCKED from this point forward for the remainder of the quiz.**
   - Back chevron: HIDDEN
   - iOS swipe-from-left: disabled
   - Android system back: disabled
8. Q1–Q4: user taps option → selected state (edge-strong border). "Tiếp theo →" activates. User taps to advance.
9. Q5: button label reads "Nộp bài".
10. User taps "Nộp bài" → client evaluates 5 answers against hardcoded answer keys.
11. Write `f0_placement_quiz_completed = true`.
12. Write `f0_placement_quiz_passed = (score >= 4)`.
13. **Score ≥ 4/5 (PASS)** → execute Pass sequence (§2.2).
14. **Score < 4/5 (FAIL)** → execute Fail sequence (§2.3).

### 2.2 Pass Sequence (score ≥ 4/5)

1. Write `f0_module_1_state = COMPLETE` (M1 skipped via placement).
2. Write `f0_module_2_state = UNLOCKED`.
3. Show Pass screen:
   - AmbientBackground: lime orbs (celebratory).
   - "Bạn đã nắm vững kiến thức cơ bản!" (display-md, lime `#CAFD00`).
   - Score "X/5" in lime.
   - Explanatory note: "Module 1 sẽ được bỏ qua. Bạn sẽ bắt đầu từ Module 2."
   - Note: no M1 badge awarded (none in this version).
4. CTA: KineticButton lime "Bắt đầu Module 2 →" → navigate to L2.1 Card 1.
5. No retry button. No back navigation from result screen.

### 2.3 Fail Sequence (score < 4/5)

1. M1 state unchanged — remains `UNLOCKED` (set at app first launch).
2. Show Fail screen:
   - AmbientBackground: plasma orbs (encouraging, not punitive).
   - "Hãy bắt đầu từ đầu — bạn sẽ tiến bộ nhanh thôi!" (display-md).
   - Score in fog/muted color (not negative red — this is not a punitive fail).
   - No score breakdown / answer review (see §4.2 Decision 6).
3. CTA: KineticButton lime "Bắt đầu Module 1 →" → navigate to L1.1 Card 1.
4. No retry button. No back navigation from result screen.

### 2.4 One-Shot Enforcement

After either Pass or Fail result:
- `f0_placement_quiz_completed = true` is written.
- Welcome Modal will not show again (`f0_welcome_modal_shown = true` already set).
- No entry point to Placement Quiz exists anywhere in the app after this point.
- No disabled retry state is shown — the option is absent from the UI entirely.

### 2.5 Force-Kill Before Submit

```
Scenario: user reaches Q3, force-kills app before tapping "Nộp bài"

State after kill:
  f0_welcome_modal_shown = true   (written at modal render)
  f0_placement_quiz_completed = NOT SET

On relaunch:
  → Welcome Modal DOES NOT show (welcome_modal_shown = true)
  → No placement quiz entry point available
  → User enters Home tab
  → Grow tab shows M1 as UNLOCKED

Consequence: placement quiz opportunity is lost.
Accepted by design: one-shot intent; no partial save.
```

### 2.6 Reinstall Behavior

```
App reinstall clears all AsyncStorage:
  f0_welcome_modal_shown → removed
  f0_placement_quiz_completed → removed

On first launch post-reinstall:
  → Welcome Modal shows again
  → Placement quiz becomes available again
  → All learning progress reset (full reset by design)
```

### 2.7 Decision Tree

```
Welcome Modal renders
  │
  ├── f0_welcome_modal_shown = true (written at render)
  │
  ▼
User taps tertiary CTA "Tôi đã biết chứng khoán cơ bản"
  │
  ▼
Intro screen (slideUp 400ms)
  ├── Back → Welcome Modal
  └── Tap "Bắt đầu"
          │
          ▼
      Q1 (back BLOCKED)
          │
       Q2–Q5
          │
          ▼
      Tap "Nộp bài"
          │
          ▼
      Write completed=true, passed=(score≥4)
          │
          ▼
      Score ≥ 4/5?
      ├── YES (PASS)
      │     ├── Write M1=COMPLETE, M2=UNLOCKED
      │     └── Pass screen → "Bắt đầu Module 2 →" → L2.1 Card 1
      │
      └── NO (FAIL)
            ├── M1 unchanged (UNLOCKED)
            └── Fail screen → "Bắt đầu Module 1 →" → L1.1 Card 1
```

---

## 3. Acceptance Criteria

### AC-F-01: Entry from Welcome Modal
**Given** the user is viewing the Welcome Modal
**When** the user taps "Tôi đã biết chứng khoán cơ bản"
**Then** the Placement Quiz Intro screen opens with a 400 ms slideUp animation.

### AC-F-02: Back Available on Intro Screen
**Given** the user is on the Placement Quiz Intro screen
**When** the user swipes back or taps the back chevron
**Then** the user returns to the Welcome Modal.

### AC-F-03: Back Blocked After "Bắt đầu"
**Given** the user has tapped "Bắt đầu" and Q1 is rendered
**When** the user attempts any back navigation (chevron, iOS swipe, Android hardware back)
**Then** no navigation occurs; the user remains on the current question.

### AC-F-04: Back Chevron Hidden on Q1–Q5
**Given** the user is on any question screen (Q1 through Q5)
**When** the screen renders
**Then** no back chevron is visible in the navigation header.

### AC-F-05: Option Selection Activates CTA
**Given** the user is on a question screen with no selection
**When** the user taps an answer option
**Then** the option enters selected state (edge-strong border) and the "Tiếp theo →" / "Nộp bài" button activates.

### AC-F-06: Q5 Submit Label
**Given** the user reaches Q5
**When** the question screen renders
**Then** the continue button label is "Nộp bài".

### AC-F-07: State Writes on Submit
**Given** the user taps "Nộp bài"
**When** evaluation completes (regardless of pass/fail)
**Then** `f0_placement_quiz_completed = true` and `f0_placement_quiz_passed = (score >= 4)` are written to AsyncStorage before result screen renders.

### AC-F-08: Pass — Module State Writes
**Given** the user submits with score ≥ 4/5
**When** pass evaluation completes
**Then** `f0_module_1_state = COMPLETE` and `f0_module_2_state = UNLOCKED` are written.

### AC-F-09: Pass — Screen Content
**Given** the Pass screen renders
**When** the user views it
**Then** lime AmbientBackground orbs are shown, the heading "Bạn đã nắm vững kiến thức cơ bản!" is in lime, score "X/5" is in lime, and the note about Module 1 being skipped is visible. No badge, no XP displayed.

### AC-F-10: Pass — CTA Navigation
**Given** the user taps "Bắt đầu Module 2 →" on the Pass screen
**When** navigation occurs
**Then** the user is taken to L2.1 Card 1 (first lesson card of Module 2, Lesson 1).

### AC-F-11: Fail — M1 State Unchanged
**Given** the user submits with score < 4/5
**When** fail evaluation completes
**Then** `f0_module_1_state` remains `UNLOCKED` (no modification).

### AC-F-12: Fail — Screen Content
**Given** the Fail screen renders
**When** the user views it
**Then** plasma AmbientBackground orbs are shown, encouraging copy is displayed, score is in fog/muted color (not `#EF4444`), and no score breakdown is shown.

### AC-F-13: Fail — CTA Navigation
**Given** the user taps "Bắt đầu Module 1 →" on the Fail screen
**When** navigation occurs
**Then** the user is taken to L1.1 Card 1.

### AC-F-14: No Retry Available
**Given** either result screen (pass or fail) is showing
**When** the user views the screen
**Then** no retry button, no retry link, and no back navigation is present.

### AC-F-15: One-Shot Enforcement
**Given** `f0_placement_quiz_completed = true` is set
**When** the user navigates anywhere in the app
**Then** no entry point to the Placement Quiz is visible or accessible.

### AC-F-16: Force-Kill No Partial Save
**Given** the user is on Q3 and force-kills the app
**When** the user relaunches
**Then** `f0_placement_quiz_completed` is NOT set; Welcome Modal does NOT appear (welcome_modal_shown=true); M1 shows UNLOCKED in Grow tab.

---

## 4. Design Analysis

### 4.1 Screens & Wireframes

#### Screen F-1: Placement Quiz Intro

```
┌────────────────────────────────────┐
│  ← (back chevron — visible)        │
│                                    │
│  Kiểm tra nhanh kiến thức          │
│  của bạn                           │
│  (display-md)                      │
│                                    │
│  5 câu — không cần ôn tập,         │
│  trả lời thành thật nhất           │
│  (body-md, muted)                  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Bắt đầu                     │  │
│  │  (KineticButton lime)        │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

#### Screen F-2: Question Screen (Q1–Q4)

```
┌────────────────────────────────────┐
│  [No back chevron]  Kiểm tra đầu   │
│  Progress: ●●○○○  Q1 / 5           │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Question text (body-lg)     │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  A) Option text              │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  B) Option text              │  ← tap → edge-strong border
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  C) Option text              │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Tiếp theo →]  (inactive until    │
│                  option selected)  │
└────────────────────────────────────┘
```

#### Screen F-3: Question Screen Q5

Identical to F-2 except:
- Progress dots: ●●●●●
- Button label: "Nộp bài"

#### Screen F-4: Pass Result Screen

```
┌────────────────────────────────────┐
│  AmbientBackground: lime orbs      │
│                                    │
│  Bạn đã nắm vững kiến thức         │
│  cơ bản!                           │
│  (display-md, lime #CAFD00)        │
│                                    │
│         X / 5                      │
│     (display-lg, lime)             │
│                                    │
│  Module 1 sẽ được bỏ qua.          │
│  Bạn sẽ bắt đầu từ Module 2.       │
│  (body-sm, muted)                  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Bắt đầu Module 2 →          │  │
│  │  (KineticButton lime)        │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

#### Screen F-5: Fail Result Screen

```
┌────────────────────────────────────┐
│  AmbientBackground: plasma orbs    │
│                                    │
│  Hãy bắt đầu từ đầu —              │
│  bạn sẽ tiến bộ nhanh thôi!        │
│  (display-md)                      │
│                                    │
│         X / 5                      │
│  (display-lg, fog/muted color)     │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Bắt đầu Module 1 →          │  │
│  │  (KineticButton lime)        │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

---

### 4.2 Design Decisions & Rationale

1. **Back navigation available on Intro screen (not on Q1–Q5).** The Intro screen is a decision gate — the user has not committed to anything yet. Allowing back here respects their autonomy. Once "Bắt đầu" is tapped, commitment begins; back is removed to keep the one-shot quiz clean.

2. **Back chevron HIDDEN on Q1–Q5 (not disabled).** Same principle as MKC (Flow E): hiding the element removes it from the user's mental model. A disabled chevron creates confusion and invites taps. Hidden = the concept does not apply in this context.

3. **Pass uses lime orbs; Fail uses plasma orbs.** Lime = growth, achievement, the learning system's primary color. Plasma = identity, encouragement, transformation. Fail is not punitive — plasma is warmer and more identity-affirming than a muted/grey background would be. This communicates "you're still valued here" rather than "you failed."

4. **No score breakdown on either result screen.** The quiz is one-shot. Showing which questions were wrong would allow a user to note answers for their theoretically non-existent next attempt. Since there is no retry, a breakdown adds no actionable value and slightly clutters the result screen.

5. **No retry button — option absent vs. disabled.** A disabled "Thử lại" button implies the feature exists but is locked. Hiding it entirely communicates that retrying is not part of this feature's design. This reduces confusion and eliminates "when will this unlock?" questions.

6. **Fail copy is encouraging, not punishing.** "Hãy bắt đầu từ đầu — bạn sẽ tiến bộ nhanh thôi!" positions Module 1 as a genuine starting point, not a consolation. Score is shown in fog/muted color (not `#EF4444` negative red) to reinforce this.

7. **Pass threshold is ≥ 4/5 (stricter than MKC's ≥ 3/5).** Placement skip requires higher confidence. A user who skips M1 at 3/5 would likely struggle in M2. The stricter threshold reduces the chance of under-prepared users skipping foundational content.

8. **`f0_welcome_modal_shown = true` written at modal render, not at CTA tap.** The modal is considered "shown" as soon as it renders. Whether the user taps a CTA or dismisses the modal, the shown state is recorded. This prevents the modal from re-appearing on the next app launch regardless of how the user exited.

9. **Force-kill before submit ends placement quiz opportunity permanently.** Once `f0_welcome_modal_shown = true`, the Welcome Modal will not re-appear, and no other entry point to the Placement Quiz exists. This is acceptable: the quiz is a one-shot skip feature, not a core requirement. The user still begins M1 normally.

10. **M1 set to COMPLETE (not SKIPPED) on pass.** Using the standard state machine value (`COMPLETE`) means M1 appears correctly completed in the Grow tab. No special "SKIPPED" state needs to be handled across all module-rendering components.

---

### 4.3 Component Usage

| Component | Screen | Usage |
|---|---|---|
| `KineticButton` lime | Intro, Pass, Fail | "Bắt đầu", "Bắt đầu Module 2 →", "Bắt đầu Module 1 →" |
| `PlacementQuizCard` | Q1–Q5 | Renders question text + answer options; manages selected state |
| `LessonProgressBar` (dot variant) | Q1–Q5 | Shows question progress (●●○○○) |
| `AmbientBackground` | Pass screen | Lime orbs — celebratory state |
| `AmbientBackground` | Fail screen | Plasma orbs — encouraging state |

---

### 4.4 Interaction Rules

| Trigger | Condition | Result |
|---|---|---|
| Tap tertiary CTA on Welcome Modal | `f0_placement_quiz_completed` not set | Intro screen opens (slideUp 400ms) |
| Tap back on Intro screen | Before "Bắt đầu" tapped | Return to Welcome Modal |
| Tap "Bắt đầu" | Intro screen | Q1 renders; back navigation disabled; back chevron hidden |
| Tap answer option | No prior selection | Option enters selected state; CTA activates |
| Tap answer option | Different option already selected | Previous deselects; new option selects |
| Tap "Tiếp theo →" | Option selected, Q1–Q4 | Navigate to next question |
| Tap "Nộp bài" | Option selected, Q5 | Evaluate; write state; navigate to Pass or Fail screen |
| Tap "Tiếp theo →" | No option selected | No action; button stays inactive |
| Tap back navigation | Q1–Q5 (any method) | No action; user stays on current question |
| Tap "Bắt đầu Module 2 →" | Pass screen | Navigate to L2.1 Card 1 |
| Tap "Bắt đầu Module 1 →" | Fail screen | Navigate to L1.1 Card 1 |

---

### 4.5 Edge Cases

| ID | Scenario | Handling |
|---|---|---|
| EC-F-01 | Force-kill during Q1–Q4 | No answers saved; `f0_placement_quiz_completed` not set; Welcome Modal suppressed (shown=true already); M1 stays UNLOCKED; user cannot retake quiz |
| EC-F-02 | Force-kill during Q5 before "Nộp bài" | Same as EC-F-01 |
| EC-F-03 | Force-kill after "Nộp bài" tapped but before result screen renders | State writes are synchronous before navigation; `completed` and `passed` keys are written; user sees result screen on relaunch from wherever AsyncStorage was last written |
| EC-F-04 | App reinstall | All AsyncStorage cleared; Welcome Modal shows again; M1 returns to UNLOCKED; Placement Quiz fully available |
| EC-F-05 | User navigates directly to Placement Quiz URL/deep-link | `f0_placement_quiz_completed = true` guard on entry; redirect to Home tab; no quiz access |
| EC-F-06 | `f0_placement_quiz_completed` not set but `f0_welcome_modal_shown = true` | No placement quiz entry point; user enters M1 normally via Grow tab |
| EC-F-07 | Pass screen — user presses Android hardware back | Back navigation disabled on result screen; no action |
| EC-F-08 | Score exactly 4/5 | Treated as PASS (`score >= 4` is inclusive) |
| EC-F-09 | Score exactly 3/5 | Treated as FAIL (`3 < 4`); Fail screen shown; M1 unchanged |

---

## 5. Business ↔ Design Alignment

| Business Requirement | Design Implementation | Status |
|---|---|---|
| Entry from tertiary CTA on Welcome Modal | CTA tap handler triggers slideUp navigation to Intro screen | Aligned |
| Back available on Intro | Back chevron visible on Intro screen only | Aligned |
| Back blocked on Q1–Q5 | Back chevron hidden; swipe + hardware back disabled after "Bắt đầu" | Aligned |
| One question per screen, forward-only | `PlacementQuizCard` with activated "Tiếp theo →" on selection | Aligned |
| Q5 button label = "Nộp bài" | Conditional label on last question index | Aligned |
| Write completed + passed on submit | AsyncStorage writes before result navigation | Aligned |
| PASS threshold ≥ 4/5 | `score >= 4` evaluation; stricter than MKC threshold | Aligned |
| PASS: M1=COMPLETE, M2=UNLOCKED | State writes on pass path | Aligned |
| PASS: lime AmbientBackground | `AmbientBackground` lime preset | Aligned |
| PASS: M1 skip note | Explanatory text on pass screen | Aligned |
| FAIL: M1 unchanged | No state write for M1 on fail path | Aligned |
| FAIL: plasma AmbientBackground | `AmbientBackground` plasma preset | Aligned |
| FAIL: score in muted color | Score text color = fog, not `#EF4444` | Aligned |
| No retry | No retry button on either result screen | Aligned |
| No rewards (XP/badges) | No XP pill, no badge component anywhere in Placement Quiz | Aligned |
| One-shot enforcement | `f0_placement_quiz_completed=true` blocks re-entry everywhere | Aligned |

---

## 6. QA Test Cases

| ID | Test Case | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| QA-F-01 | Entry from Welcome Modal | Fresh install; Welcome Modal showing | Tap "Tôi đã biết chứng khoán cơ bản" | Intro screen opens with 400 ms slideUp; back chevron visible; "Bắt đầu" button present |
| QA-F-02 | Back from Intro → Welcome Modal | User on Intro screen | Tap back chevron | User returns to Welcome Modal; Intro screen dismissed |
| QA-F-03 | Back blocked on Q1 | User has tapped "Bắt đầu"; Q1 displayed | Attempt iOS swipe-from-left; tap Android hardware back | No navigation; user remains on Q1; no back chevron visible |
| QA-F-04 | Pass — all state writes | Answer Q1–Q5 correctly (5/5) | Tap "Nộp bài" | `f0_placement_quiz_completed=true`, `f0_placement_quiz_passed=true`, `f0_module_1_state=COMPLETE`, `f0_module_2_state=UNLOCKED` in AsyncStorage |
| QA-F-05 | Pass — score threshold boundary (4/5) | Answer exactly 4/5 correctly | Tap "Nộp bài" | Pass screen shown; lime AmbientBackground; `f0_placement_quiz_passed=true`; "Bắt đầu Module 2 →" CTA present |
| QA-F-06 | Fail — score threshold boundary (3/5) | Answer exactly 3/5 correctly | Tap "Nộp bài" | Fail screen shown; plasma AmbientBackground; `f0_placement_quiz_passed=false`; `f0_module_1_state` unchanged (UNLOCKED); "Bắt đầu Module 1 →" CTA present |
| QA-F-07 | Fail — no score breakdown | Answer 2/5 correctly | Tap "Nộp bài" | Fail screen does NOT show which questions were wrong; only total score in muted color shown |
| QA-F-08 | No retry button on pass screen | Pass screen visible | View screen | No "Thử lại" button, disabled or enabled, present anywhere on screen |
| QA-F-09 | No retry button on fail screen | Fail screen visible | View screen | No "Thử lại" button, disabled or enabled, present anywhere on screen |
| QA-F-10 | Pass CTA navigation | Pass screen visible | Tap "Bắt đầu Module 2 →" | Navigation to L2.1 Card 1 (first lesson of Module 2) |
| QA-F-11 | Fail CTA navigation | Fail screen visible | Tap "Bắt đầu Module 1 →" | Navigation to L1.1 Card 1 (first lesson of Module 1) |
| QA-F-12 | One-shot: no re-entry after complete | `f0_placement_quiz_completed=true` in AsyncStorage | Attempt any known entry point to Placement Quiz | No Placement Quiz accessible; no entry point visible |
| QA-F-13 | Force-kill before submit | User on Q3 | Force-kill app; relaunch | Welcome Modal NOT shown; `f0_placement_quiz_completed` not set; M1 shows UNLOCKED in Grow tab |
| QA-F-14 | No XP or badges on pass | Pass screen rendered | Inspect pass screen | No XP numbers, no badge images, no confetti XP reference |
| QA-F-15 | Reinstall resets quiz availability | Quiz completed, then reinstall | Fresh install | `f0_placement_quiz_completed` cleared; Welcome Modal shows; tertiary CTA available |

---

## 7. Design Gaps / Risks

| ID | Severity | Description | Recommendation |
|---|---|---|---|
| G-F-01 | HIGH | Force-kill between Q1 and "Nộp bài" permanently removes the placement quiz opportunity. The user is left with `welcome_modal_shown=true` and no quiz available. This is intentional-by-design but may feel like a bug to users if unexpected. | Add brief "quiz will not be saved" disclaimer on Intro screen, or provide a grace period (e.g., if quiz not completed within N minutes of starting, quiz entry re-enables for one more attempt). |
| G-F-02 | MEDIUM | Hardcoded answer keys in app bundle are extractable. A determined user could extract the 5 correct answers before starting the quiz. | Acceptable for V1 educational context. V2 could obfuscate or serve answer keys via API. |
| G-F-03 | MEDIUM | No analytics event on placement quiz result. Product has no visibility into pass/fail rates, which could inform whether M1 skip rate is appropriate. | Add anonymous local event logging, or connect to existing analytics pipeline on result write. |
| G-F-04 | LOW | Pass threshold (≥ 4/5) is higher than MKC pass threshold (≥ 3/5). This inconsistency may confuse users who expect the same standard. | Document the distinction clearly internally. Optionally surface it to users ("Cần ≥ 4/5 để bỏ qua Module 1") on the Intro screen. |
| G-F-05 | LOW | The placement quiz has no visible relationship to Module 1's content in the current copy. Users don't know what they're being tested on. | Intro screen could specify "Câu hỏi về: cổ phiếu, trái phiếu, P/E, lệnh đặt..." to set expectations. |

---

## 8. Related Documents

| Document | Path |
|---|---|
| F0 Learning Path Requirements | `/docs/business/f0-learning/01-requirements.md` |
| Flow B — Welcome Modal | `flow-b-welcome-modal.md` |
| Flow C — Module Unlock | `flow-c-module-unlock.md` |
| Flow D — Lesson Navigation | `flow-d-lesson-navigation.md` |
| Flow E — Module Knowledge Check | `flow-e-mkc.md` |
| Flow G — Learning Complete | `flow-g-learning-complete.md` |
| Kinetic Drop V2.0 Design System | Internal Figma — Kinetic Drop V2.0 |

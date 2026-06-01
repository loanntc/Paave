# F0 Learning Path — Business & Functional Requirements

**Version:** 2.0
**Date:** 2026-05-29
**Architecture:** Frontend-only, AsyncStorage
**Status:** Approved for Development

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Functional Requirements](#2-functional-requirements)
3. [Business Rules](#3-business-rules)
4. [Edge Cases](#4-edge-cases)
5. [Acceptance Criteria](#5-acceptance-criteria)
6. [State Definitions](#6-state-definitions)
7. [Non-Functional Requirements](#7-non-functional-requirements)

---

## 1. Feature Overview

### 1.1 What It Is

The F0 Learning Path is a built-in, self-contained educational module embedded within the Paave mobile app. It delivers structured financial literacy content across 4 sequential modules, each composed of 5 lessons. Each lesson is presented as a swipeable card-stack of 5 cards. All content, quiz questions, and progress data reside entirely on the device — there is no backend API call for any learning feature in V1.

The module targets F0 traders: first-time investors in Vietnam who have never traded before and need foundational knowledge before they can act confidently in the market.

### 1.2 Primary Actor

**F0 Trader** — a Paave app user aged 16–27 who has not previously traded on Vietnamese stock exchanges. This user has little to no prior knowledge of financial instruments, trading mechanics, or investment strategy.

### 1.3 Success Metric

**Primary:** Percentage of F0 users who reach `f0_learning_path_complete = true` (all 4 modules in COMPLETE state).
**Secondary:** Module-level completion rates (M1→M4), used to identify drop-off points for content iteration.

### 1.4 Out of Scope (V1)

The following are explicitly excluded from this version:

| Excluded Feature | Note |
|---|---|
| XP / experience points system | Removed entirely from V2 architecture |
| Badge or achievement system | Removed entirely from V2 architecture |
| Bonus cash rewards | Removed entirely from V2 architecture |
| Server-side progress persistence | No cloud backup in V1; progress resets on reinstall |
| KYC (Know Your Customer) flow | Separate future flow; post-learning age gate is navigation only |
| CMS or remote content management | All questions and content are hardcoded in the app bundle |
| Push notifications for learning reminders | Future consideration |
| Social / leaderboard features | Future consideration |
| Offline content caching | Content is always local; no network dependency |

---

## 2. Functional Requirements

### FR-LEARN-01: Welcome Modal

**Actor:** F0 Trader (first app launch after onboarding)
**Description:** On the first time the user reaches the Grow tab (or the designated entry point for the learning path), a full-screen Welcome Modal is displayed, introducing the F0 Learning Path. The modal is shown exactly once. The flag is written to AsyncStorage at the moment the modal is rendered (not on dismiss), so even a force-kill after render prevents re-display on next launch.

**Input:** User navigates to Grow tab or learning path entry point.

**Output:** Modal rendered with three CTAs:
- "Làm bài kiểm tra đầu vào" (Take Placement Quiz) → navigates to Placement Quiz flow
- "Bắt đầu học từ đầu" (Start from the beginning) → dismisses modal, M1 L1.1 begins
- "Xem lộ trình học" (View learning path) → dismisses modal, navigates to Learning Path Home

**Precondition:** `f0_welcome_modal_shown` is `false` or does not exist in AsyncStorage.

**Postcondition:** `f0_welcome_modal_shown` is set to `true` in AsyncStorage at modal render time.

**AsyncStorage keys affected:**
- `f0_welcome_modal_shown` → written `true` at render

---

### FR-LEARN-02: Grow Tab / Learning Path Home

**Actor:** F0 Trader
**Description:** The Learning Path Home screen (Grow tab) displays the user's overall progress and all 4 module cards. Each module card reflects its current state (see Section 6). If the learning path is not yet complete, a `LearningPromptCard` is shown at the top of the screen to encourage the user to continue. Once `f0_learning_path_complete = true`, the prompt card is replaced with a completion banner.

**Input:** User navigates to Grow tab.

**Output:**
- Overall learning progress percentage displayed (0–100%)
- 4 module cards rendered, each showing:
  - Module title and topic
  - Current module state (visual indicator: LOCKED, UNLOCKED, IN_PROGRESS, LESSONS_COMPLETE, COMPLETE)
  - Progress bar: completed lessons / 5
- `LearningPromptCard` displayed if `f0_learning_path_complete = false`; hidden if `true`
- Tapping an UNLOCKED, IN_PROGRESS, LESSONS_COMPLETE module opens the module detail screen
- Tapping a LOCKED module has no navigation effect (optionally shows a locked tooltip)
- Tapping a COMPLETE module opens module detail in read-only/review mode

**Precondition:** Learning path is initialized (M1 is UNLOCKED by default; M2–M4 are LOCKED).

**Postcondition:** No state changes on this screen; purely presentational.

**AsyncStorage keys affected (read-only):**
- `f0_module_{1-4}_state`
- `f0_lesson_{1-4}_{1-5}_state`
- `f0_learning_path_complete`

---

### FR-LEARN-03: Card-Stack Lesson Viewer

**Actor:** F0 Trader
**Description:** Each lesson is presented as a horizontally swipeable card stack with exactly 5 cards in fixed order:
- Card 1: Concept (kiến thức cốt lõi)
- Card 2: Example (ví dụ thực tế)
- Card 3: Myth-Buster (phá vỡ quan niệm sai lầm)
- Card 4: Quiz (kiểm tra hiểu biết)
- Card 5: CTA (kêu gọi hành động / lesson complete)

The user can swipe forward to advance. Swiping backward is allowed to review previous cards. The current card index is persisted to AsyncStorage on every forward swipe, so the user resumes at the correct card if they leave mid-lesson. Cards 1–3 and 5 are view-only. Card 4 is interactive (see FR-LEARN-04).

**Input:** User taps an UNLOCKED or IN_PROGRESS lesson from the module detail screen.

**Output:**
- Card stack rendered starting at the saved `f0_lesson_{m}_{l}_card_index`
- On each forward swipe: `f0_lesson_{m}_{l}_card_index` is updated to the new index
- Lesson state set to IN_PROGRESS on first card view if not already IN_PROGRESS or COMPLETE
- On reaching Card 5 with Card 4 quiz already passed: lesson COMPLETE logic triggered (see FR-LEARN-05)

**Precondition:** Lesson state is UNLOCKED, IN_PROGRESS, or COMPLETE (COMPLETE allows review).

**Postcondition:**
- `f0_lesson_{m}_{l}_card_index` updated to last viewed card index
- `f0_lesson_{m}_{l}_state` may transition to IN_PROGRESS

**AsyncStorage keys affected:**
- `f0_lesson_{m}_{l}_state` → may write IN_PROGRESS
- `f0_lesson_{m}_{l}_card_index` → written on every forward swipe

---

### FR-LEARN-04: In-Lesson Quiz (Card 4)

**Actor:** F0 Trader
**Description:** Card 4 of every lesson presents a single multiple-choice question with 4 answer options. The question is evaluated locally (no API call). The user must answer correctly to unlock forward swiping to Card 5. Incorrect answers are allowed unlimited retries. After the 3rd incorrect attempt on the same question, a contextual hint is displayed. The quiz state (pass/fail) is not persisted separately — lesson COMPLETE state implicitly captures that Card 4 was passed.

**Input:**
- User views Card 4 of an IN_PROGRESS lesson
- User selects one of 4 answer options and submits

**Output:**
- Correct answer: visual success feedback, Card 5 becomes swipeable
- Incorrect answer (attempt 1 or 2): visual error feedback, question resets, retry enabled
- Incorrect answer (attempt 3+): visual error feedback + contextual hint displayed, retry still enabled

**Precondition:** User is on Card 4 of a lesson in state UNLOCKED or IN_PROGRESS.

**Postcondition:**
- If correct: user can advance to Card 5; lesson state transitions to COMPLETE when Card 5 is reached
- If incorrect: no state change; hint shown after 3rd attempt

**AsyncStorage keys affected:**
- None directly (quiz pass is inferred from lesson COMPLETE state)

**Note:** Hint text is hardcoded per question in the app bundle. There is no per-attempt counter persisted to storage; the count resets if the user leaves and returns.

---

### FR-LEARN-05: Lesson Completion

**Actor:** System (triggered by user action)
**Description:** A lesson reaches COMPLETE state when both of the following conditions are met:
1. All 5 cards have been viewed (the user has swiped to Card 5)
2. Card 4 quiz has been answered correctly (enforced by the card stack: Card 5 is only reachable after Card 4 is passed)

On lesson COMPLETE, the system checks whether all 5 lessons in the module are now COMPLETE. If so, the module transitions to LESSONS_COMPLETE (see FR-LEARN-06).

**Input:** User reaches Card 5 (CTA card) of a lesson where Card 4 quiz was already passed.

**Output:**
- `f0_lesson_{m}_{l}_state` set to COMPLETE
- `f0_lesson_{m}_{l}_card_index` set to 4 (final card index)
- If all 5 lessons in module are COMPLETE: `f0_module_{m}_state` set to LESSONS_COMPLETE
- Next lesson in module (if any) unlocked: `f0_lesson_{m}_{l+1}_state` set to UNLOCKED
- Completion animation or feedback shown on Card 5

**Precondition:** All 5 cards viewed; Card 4 quiz passed.

**Postcondition:**
- Lesson state = COMPLETE
- Module state may advance to LESSONS_COMPLETE
- Next lesson state = UNLOCKED (if applicable)

**AsyncStorage keys affected:**
- `f0_lesson_{m}_{l}_state` → COMPLETE
- `f0_lesson_{m}_{l}_card_index` → 4
- `f0_lesson_{m}_{l+1}_state` → UNLOCKED (if l < 5)
- `f0_module_{m}_state` → LESSONS_COMPLETE (if all 5 lessons complete)

---

### FR-LEARN-06: Module Unlock Progression

**Actor:** System (triggered by module COMPLETE event)
**Description:** Modules are unlocked strictly sequentially. M1 starts as UNLOCKED. When module N reaches COMPLETE state, module N+1 transitions from LOCKED to UNLOCKED. This logic is entirely AsyncStorage-driven with no server involvement.

**Input:** `f0_module_{n}_state` transitions to COMPLETE.

**Output:**
- If n < 4: `f0_module_{n+1}_state` set to UNLOCKED
- If n = 4: `f0_learning_path_complete` set to `true`
- First lesson of the newly unlocked module: `f0_lesson_{n+1}_{1}_state` set to UNLOCKED

**Precondition:** `f0_module_{n}_state` = COMPLETE (newly written).

**Postcondition:**
- `f0_module_{n+1}_state` = UNLOCKED (if n < 4)
- `f0_lesson_{n+1}_{1}_state` = UNLOCKED (if n < 4)
- `f0_learning_path_complete` = true (if n = 4)

**AsyncStorage keys affected:**
- `f0_module_{n+1}_state` → UNLOCKED
- `f0_lesson_{n+1}_{1}_state` → UNLOCKED
- `f0_learning_path_complete` → true (conditional)

---

### FR-LEARN-07: Module Knowledge Check (MKC)

**Actor:** F0 Trader
**Description:** After all 5 lessons in a module are COMPLETE (module state = LESSONS_COMPLETE), the user can access the Module Knowledge Check. The MKC is a local 5-question quiz drawn from hardcoded questions in the app bundle. Passing requires ≥3 correct answers out of 5. On pass, the module transitions to COMPLETE. On fail, a 60-second cooldown is enforced using a client-side timestamp stored in AsyncStorage. After the cooldown expires, the user can retry. There is no limit on retry attempts. On pass, a simplified pass screen is shown (no XP, no badge, no confetti) before returning to the module detail screen.

**Input:** User taps "Làm bài kiểm tra module" (Take Module Quiz) from the module detail screen.

**Precondition:** `f0_module_{m}_state` = LESSONS_COMPLETE.

**Output (pass — score ≥ 3/5):**
- Pass screen shown with score and encouraging message
- `f0_mkc_{m}_state` set to PASSED
- `f0_module_{m}_state` set to COMPLETE
- Module unlock progression triggered (FR-LEARN-06)

**Output (fail — score < 3/5):**
- Fail screen shown with score and number of correct answers
- `f0_mkc_{m}_state` set to FAILED
- `f0_mkc_{m}_cooldown_start` set to `Date.now()` (Unix ms timestamp)
- MKC entry point is disabled; countdown timer displayed showing remaining cooldown

**Cooldown behavior:**
- On app relaunch: read `f0_mkc_{m}_cooldown_start`, compute `Date.now() - cooldown_start`. If < 60000ms, cooldown still active. If ≥ 60000ms, cooldown expired and retry is enabled.
- Cooldown is purely client-side; it is not enforced by a server.

**Postcondition (pass):**
- `f0_mkc_{m}_state` = PASSED
- `f0_module_{m}_state` = COMPLETE

**Postcondition (fail):**
- `f0_mkc_{m}_state` = FAILED
- `f0_mkc_{m}_cooldown_start` = timestamp

**AsyncStorage keys affected:**
- `f0_mkc_{m}_state` → PASSED or FAILED
- `f0_mkc_{m}_cooldown_start` → timestamp on fail; not modified on pass
- `f0_module_{m}_state` → COMPLETE on pass

---

### FR-LEARN-08: Placement Quiz

**Actor:** F0 Trader
**Description:** The Placement Quiz is an optional, one-shot quiz presented via the Welcome Modal (FR-LEARN-01) CTA. It consists of 5 questions drawn from M1 content, hardcoded in the app bundle. If the user scores ≥4/5, M1 is marked as COMPLETE (skipped) and M2 is unlocked. If the score is <4/5, the user starts normally from M1 L1.1. The quiz is one-shot: once submitted (pass or fail), it cannot be retaken. The one-shot state is enforced via `f0_placement_quiz_completed = true`, written on submit.

**Input:** User taps "Làm bài kiểm tra đầu vào" in the Welcome Modal.

**Precondition:**
- `f0_placement_quiz_completed` is `false` or does not exist
- `f0_welcome_modal_shown` is `true`

**Output (pass — score ≥ 4/5):**
- `f0_placement_quiz_completed` = true
- `f0_placement_quiz_passed` = true
- `f0_module_1_state` = COMPLETE (all lessons implicitly COMPLETE)
- `f0_lesson_1_{1-5}_state` = COMPLETE (batch write)
- `f0_mkc_1_state` = PASSED
- `f0_module_2_state` = UNLOCKED
- `f0_lesson_2_1_state` = UNLOCKED
- Navigate to M2 or Learning Path Home with M1 showing as COMPLETE

**Output (fail — score < 4/5):**
- `f0_placement_quiz_completed` = true
- `f0_placement_quiz_passed` = false
- No module state changes
- Navigate to Learning Path Home with M1 UNLOCKED, user starts from L1.1

**Precondition for re-entry block:** If user navigates back or force-kills before submitting, `f0_welcome_modal_shown = true` means the modal will not show again, and the placement quiz entry point is only accessible from the modal. This effectively makes it unreachable without a secondary entry point (to be confirmed by product). In V1, the quiz is accessible only from the Welcome Modal.

**Postcondition:**
- `f0_placement_quiz_completed` = true (always, on submit)
- Module states updated per pass/fail logic above

**AsyncStorage keys affected:**
- `f0_placement_quiz_completed` → true
- `f0_placement_quiz_passed` → true or false
- `f0_module_1_state` → COMPLETE (pass only)
- `f0_lesson_1_{1-5}_state` → COMPLETE (pass only, batch)
- `f0_mkc_1_state` → PASSED (pass only)
- `f0_module_2_state` → UNLOCKED (pass only)
- `f0_lesson_2_1_state` → UNLOCKED (pass only)

---

### FR-LEARN-09: Learning Path Completion

**Actor:** System (triggered when M4 reaches COMPLETE)
**Description:** When the user completes M4 (i.e., `f0_module_4_state` transitions to COMPLETE), the learning path is marked complete and a full-screen Completion Screen is displayed. This screen celebrates the achievement and presents a CTA to proceed (which triggers the post-learning age gate flow, FR-LEARN-10).

**Input:** `f0_module_4_state` transitions to COMPLETE.

**Output:**
- `f0_learning_path_complete` set to `true`
- Completion screen displayed with:
  - Congratulatory message
  - Summary of what was learned (4 module topics listed)
  - CTA: "Bắt đầu đầu tư" (Start Investing) → triggers FR-LEARN-10

**Precondition:** All 4 modules in COMPLETE state.

**Postcondition:**
- `f0_learning_path_complete` = true
- User proceeds to age gate flow

**AsyncStorage keys affected:**
- `f0_learning_path_complete` → true

---

### FR-LEARN-10: Post-Learning Age Gate

**Actor:** System (triggered by Completion Screen CTA)
**Description:** After the learning path is complete, the system checks the user's date of birth (DOB) from the local user profile (stored in AsyncStorage or app state, not the learning module's own storage). If the user is aged ≥18, they are navigated to the Trade tab. If the user is <18, they are navigated to the Home tab and an age gate bottom sheet is displayed explaining that trading requires the user to be 18+. KYC is a separate, future flow and is not triggered here.

**Input:** User taps "Bắt đầu đầu tư" on the Completion Screen.

**Output (age ≥ 18):**
- Navigate to Trade tab
- `f0_age_gate_shown` is NOT written (age gate was not shown)

**Output (age < 18 or DOB missing/invalid):**
- Navigate to Home tab
- Age gate bottom sheet displayed with message explaining 18+ requirement
- `f0_age_gate_shown` = true
- Bottom sheet CTA: "Hiểu rồi" (Got it) → dismisses sheet, user remains on Home tab

**Precondition:** `f0_learning_path_complete` = true.

**Postcondition:**
- User is on Trade tab (if ≥18) or Home tab (if <18)
- `f0_age_gate_shown` = true (if <18 path taken)

**AsyncStorage keys affected:**
- `f0_age_gate_shown` → true (on <18 path only)

**DOB source:** Read from local user profile data (outside the `f0_` key namespace). If DOB is null, empty, unparseable, or results in an age calculation error, treat as <18 (safe default — see BR-09).

---

## 3. Business Rules

| ID | Rule | Violation Behavior |
|---|---|---|
| BR-01 | Modules unlock strictly sequentially: M2 is only accessible after M1 is COMPLETE, M3 after M2 COMPLETE, M4 after M3 COMPLETE. | Attempting to access a LOCKED module has no effect; no navigation occurs. |
| BR-02 | A lesson reaches COMPLETE only when all 5 cards have been viewed AND the Card 4 quiz has been answered correctly. Viewing all cards without passing Card 4 does not complete the lesson. | Card 5 (CTA) is only reachable after Card 4 is passed; the system enforces this in the card-stack navigation logic. |
| BR-03 | MKC pass threshold is ≥3 correct answers out of 5 questions. A score of 2/5 or lower is a fail. | Score < 3: MKC FAILED state written; 60s cooldown starts; module remains LESSONS_COMPLETE, not COMPLETE. |
| BR-04 | Placement Quiz skip threshold is ≥4 correct answers out of 5. A score of 3/5 or lower does not skip M1. | Score < 4: M1 remains UNLOCKED; user starts from L1.1 as normal. |
| BR-05 | The Placement Quiz is one-shot. Once `f0_placement_quiz_completed = true` is written (on submit), the quiz cannot be retaken under any circumstances. | Any attempt to navigate to the Placement Quiz screen after `f0_placement_quiz_completed = true` redirects to Learning Path Home. |
| BR-06 | All learning progress is stored exclusively in device AsyncStorage. Progress fully resets to default state on app reinstall or clearing app data. There is no cloud backup or server sync in V1. | On reinstall: `f0_welcome_modal_shown` = false (not present), all module states default back to M1=UNLOCKED, M2-M4=LOCKED. User experiences the flow from the beginning. |
| BR-07 | The age check for post-learning navigation uses the user's DOB from the local user profile. Age is computed as: `currentDate - DOB`, where the user is considered ≥18 if they have had their 18th birthday on or before the current date. | Invalid computation defaults to <18 (see BR-09). |
| BR-08 | A user under 18 years of age cannot be navigated to the Trade tab via the learning path completion flow. | If age < 18: navigate to Home tab + show age gate bottom sheet. |
| BR-09 | If DOB is null, empty string, invalid format, or any DOB parsing error occurs, the system defaults to treating the user as <18. This is a safety-first default. | Same as BR-08: navigate to Home tab + show age gate bottom sheet. |
| BR-10 | The MKC 60-second cooldown is enforced entirely client-side using a timestamp stored in AsyncStorage. It is not server-enforced. The system calculates remaining time as `60000 - (Date.now() - f0_mkc_{m}_cooldown_start)` on each screen render. | If a user manipulates the device clock, the cooldown may be bypassed. This is accepted as a known risk in V1 (see EC-06 and NFR section). |
| BR-11 | All quiz questions (Placement Quiz, In-Lesson Card 4, MKC) are hardcoded in the app bundle. There is no API call to fetch questions. Content updates require an app store release. | If question data is missing or malformed at runtime (should not occur in production builds), the affected quiz component renders an error state and the user cannot proceed past that card/quiz. This must be caught in QA. |
| BR-12 | Lessons within a module unlock sequentially. L{n}.2 is only accessible after L{n}.1 is COMPLETE, and so on through L{n}.5. | Attempting to access a LOCKED lesson within an UNLOCKED/IN_PROGRESS module has no effect. |
| BR-13 | A module transitions to COMPLETE only via MKC pass (score ≥3/5). Completing all 5 lessons alone (LESSONS_COMPLETE state) does not make the module COMPLETE. | Module remains LESSONS_COMPLETE until MKC is passed. |
| BR-14 | The in-lesson Card 4 quiz hint is shown only after the 3rd consecutive incorrect attempt within a single session. The attempt counter is in-memory only and resets if the user leaves and returns to the lesson. | First 2 incorrect attempts: error feedback only, no hint. 3rd+ incorrect attempts: error feedback + hint. |

---

## 4. Edge Cases

### EC-01: Force-Kill During In-Lesson Quiz (Card 4)

**Description:** User is answering the Card 4 quiz. The app is force-killed before submitting an answer.

**System Response:** No answer is submitted; no state change occurs. The in-memory attempt counter is lost.

**Recovery Path:** On relaunch, user resumes at the card index saved in `f0_lesson_{m}_{l}_card_index`. Since the quiz was not answered, `card_index` is at 3 (Card 4, 0-indexed). The quiz is presented fresh. The hint counter resets to 0 (attempt 1 starts again).

---

### EC-02: Force-Kill During Card Navigation (Mid-Swipe)

**Description:** User swipes to a new card and the app is force-killed before the next user interaction.

**System Response:** `f0_lesson_{m}_{l}_card_index` is written on each forward swipe event. If the write completed before the kill, the user resumes at the correct card. If the app was killed during the write operation (extremely rare with AsyncStorage), the user may resume at the previous card.

**Recovery Path:** On relaunch, the lesson viewer reads `f0_lesson_{m}_{l}_card_index` and renders the saved card. User continues from exactly where they left off (or at worst, one card back).

---

### EC-03: App Reinstall / Clear App Data

**Description:** User reinstalls the app or clears app data from device settings.

**System Response:** All AsyncStorage data is wiped. All `f0_` keys are absent.

**Recovery Path:** On next launch, the app initializes with default state: M1 UNLOCKED, M2-M4 LOCKED, no lessons progressed, `f0_welcome_modal_shown` absent (treated as false). The Welcome Modal is shown again. The user restarts the learning path from the beginning. There is no recovery of lost progress in V1.

---

### EC-04: MKC Cooldown Across App Background / Kill

**Description:** User fails an MKC and the 60-second cooldown begins. They background or force-kill the app during the cooldown.

**System Response:** `f0_mkc_{m}_cooldown_start` holds the Unix timestamp of when the fail occurred. This value persists in AsyncStorage across app backgrounds and kills.

**Recovery Path:** On relaunch (or foregrounding), the MKC entry point reads `f0_mkc_{m}_cooldown_start` and computes `Date.now() - cooldown_start`. If the result is ≥ 60000ms, the cooldown is expired and the retry CTA is enabled. If < 60000ms, the remaining time is shown as a countdown. This works correctly even if the user is away from the app for hours.

---

### EC-05: Missing or Invalid DOB in User Profile

**Description:** The user's DOB field in the local profile is null, an empty string, or an unparseable date string. This occurs when the user skips DOB entry during onboarding or provides a malformed date.

**System Response:** DOB parsing fails or returns null. The age gate logic cannot compute a valid age.

**Recovery Path:** Per BR-09, the system defaults to treating the user as <18. The user is navigated to the Home tab and the age gate bottom sheet is shown. This is the safe default: it is preferable to show the age gate unnecessarily rather than to grant Trade tab access to a potentially underage user.

---

### EC-06: Device Clock Manipulation to Bypass MKC Cooldown

**Description:** A technically sophisticated user changes their device's system clock forward by 60+ seconds after failing an MKC, causing `Date.now() - cooldown_start >= 60000` to evaluate as true immediately.

**System Response:** The cooldown check passes, and the user is allowed to retry the MKC immediately.

**Recovery Path:** This is a known limitation of a client-side cooldown with no server enforcement. It is accepted as a V1 risk. The impact is low (the user can simply retry a quiz faster). A V2 server-side cooldown enforcement can be added if cheating becomes a concern. No action required in V1.

---

### EC-07: Stale Module State Display (Lesson Complete But Module Card Still Shows IN_PROGRESS)

**Description:** The user completes the final lesson of a module (triggering LESSONS_COMPLETE), but navigates back to the Learning Path Home so quickly that the module card renders before the AsyncStorage write for `f0_module_{m}_state` completes.

**System Response:** The module card may briefly display IN_PROGRESS instead of LESSONS_COMPLETE.

**Recovery Path:** On the next render cycle (screen focus event, pull-to-refresh, or re-navigation), the state is read fresh from AsyncStorage and the correct state is displayed. Developers should use a screen focus listener (`useFocusEffect` in React Navigation) to re-read state on every tab or screen focus event. This prevents stale renders.

---

### EC-08: User Navigates Away Mid-Lesson (Back Button / Tab Switch)

**Description:** User is viewing a lesson and navigates away using the hardware back button, swiping back in the navigation stack, or switching tabs.

**System Response:** The current card index was written to AsyncStorage on the last forward swipe. The lesson state was set to IN_PROGRESS on first card view.

**Recovery Path:** On returning to the lesson, the card viewer reads `f0_lesson_{m}_{l}_card_index` and resumes at the correct card. If the user navigated away during Card 4 (quiz), the quiz is re-presented from the beginning (attempt counter reset). No progress is lost beyond the current in-memory quiz attempt count.

---

### EC-09: User Completes All 5 Lessons But Never Triggers LESSONS_COMPLETE Transition

**Description:** Due to a race condition or a bug in the completion logic, all 5 lessons show COMPLETE in AsyncStorage but `f0_module_{m}_state` is still IN_PROGRESS (not LESSONS_COMPLETE).

**System Response:** The MKC entry point will not be displayed (it requires module state = LESSONS_COMPLETE).

**Recovery Path:** The module screen should defensively compute module state from lesson states on every render: if all 5 lesson states are COMPLETE and module state is not LESSONS_COMPLETE or COMPLETE, heal the state by writing LESSONS_COMPLETE. This defensive re-computation should be implemented in the module state initialization logic (see data model document for cold-start recovery). Log a warning to the error tracker when this healing occurs.

---

### EC-10: Placement Quiz Abandoned Before Submit

**Description:** User taps "Take Placement Quiz" from the Welcome Modal, enters the quiz screen, answers some questions, but backs out or force-kills before submitting.

**System Response:** `f0_placement_quiz_completed` is NOT written until the user taps the submit button. Partial answers are in-memory only.

**Recovery Path:** Since `f0_placement_quiz_completed = false`, the user cannot access the quiz again (the Welcome Modal will not re-show because `f0_welcome_modal_shown = true`). In V1, there is no secondary entry point to the Placement Quiz. The user proceeds with M1 UNLOCKED and starts from L1.1. Product should confirm this is acceptable behavior. If a secondary entry point is needed, it should be added as a separate requirement.

---

## 5. Acceptance Criteria

### AC-01: Welcome Modal — First Launch

**Given** a user launches the app for the first time (no `f0_welcome_modal_shown` key in AsyncStorage)
**When** they navigate to the Grow tab or the learning path entry point
**Then** the Welcome Modal is displayed with all three CTAs visible
**And** `f0_welcome_modal_shown` is written as `true` to AsyncStorage at modal render time (before any user action)
**And** on the next app launch, the Welcome Modal is NOT displayed

---

### AC-02: Lesson Completion — Happy Path

**Given** the user is on lesson M1 L1.1 in UNLOCKED state
**When** they swipe through all 5 cards, answer Card 4 quiz correctly on the first attempt, and reach Card 5
**Then** `f0_lesson_1_1_state` is set to COMPLETE in AsyncStorage
**And** `f0_lesson_1_1_card_index` is set to 4
**And** `f0_lesson_1_2_state` is set to UNLOCKED
**And** the next lesson appears as tappable in the module detail screen

---

### AC-03: Card 4 Quiz — Incorrect Then Correct

**Given** the user is on Card 4 of any lesson
**When** they answer incorrectly on attempt 1 and 2, then answer correctly on attempt 3
**Then** on attempts 1 and 2, error feedback is shown and the card does not advance
**And** on attempt 1 and 2, no hint is displayed
**And** on correct answer (attempt 3), success feedback is shown and Card 5 becomes swipeable
**And** no AsyncStorage writes occur for the quiz attempts themselves

---

### AC-04: Card 4 Quiz — Hint After 3rd Attempt

**Given** the user has made 3 incorrect attempts on Card 4 of a lesson
**When** the 3rd incorrect answer is submitted
**Then** a contextual hint relevant to the question is displayed below the answer options
**And** the hint remains visible on subsequent incorrect attempts
**And** the user can still submit answers (unlimited retries remain enabled)

---

### AC-05: Module Knowledge Check — Pass

**Given** module M2 is in LESSONS_COMPLETE state
**When** the user opens the MKC and correctly answers 3 or more questions
**Then** `f0_mkc_2_state` is set to PASSED
**And** `f0_module_2_state` is set to COMPLETE
**And** `f0_module_3_state` is set to UNLOCKED
**And** `f0_lesson_3_1_state` is set to UNLOCKED
**And** the pass screen is displayed with score
**And** no cooldown timestamp is written

---

### AC-06: Module Knowledge Check — Fail and Cooldown

**Given** module M2 is in LESSONS_COMPLETE state
**When** the user opens the MKC and correctly answers 2 or fewer questions
**Then** `f0_mkc_2_state` is set to FAILED
**And** `f0_mkc_2_cooldown_start` is set to the current timestamp (Date.now())
**And** the MKC entry point is disabled and a countdown shows remaining seconds
**And** after 60 seconds have elapsed, the entry point is re-enabled for retry
**And** `f0_module_2_state` remains LESSONS_COMPLETE (not COMPLETE)

---

### AC-07: Placement Quiz — Pass (Skip M1)

**Given** the user selects "Take Placement Quiz" from the Welcome Modal
**When** they answer 4 or 5 questions correctly and submit
**Then** `f0_placement_quiz_completed` is set to true
**And** `f0_placement_quiz_passed` is set to true
**And** `f0_module_1_state` is set to COMPLETE
**And** all 5 M1 lesson states are set to COMPLETE
**And** `f0_mkc_1_state` is set to PASSED
**And** `f0_module_2_state` is set to UNLOCKED
**And** `f0_lesson_2_1_state` is set to UNLOCKED
**And** the user is navigated to Learning Path Home with M1 shown as COMPLETE

---

### AC-08: Placement Quiz — Fail (No Skip)

**Given** the user selects "Take Placement Quiz" from the Welcome Modal
**When** they answer 3 or fewer questions correctly and submit
**Then** `f0_placement_quiz_completed` is set to true
**And** `f0_placement_quiz_passed` is set to false
**And** no module or lesson states are changed
**And** the user is navigated to Learning Path Home with M1 UNLOCKED

---

### AC-09: Learning Path Completion — Age ≥18 Navigation

**Given** all 4 modules are in COMPLETE state and the Completion Screen is shown
**When** the user taps "Bắt đầu đầu tư" and their local profile DOB indicates age ≥18
**Then** `f0_learning_path_complete` is set to true
**And** the user is navigated to the Trade tab
**And** no age gate bottom sheet is shown

---

### AC-10: Learning Path Completion — Age <18 Navigation

**Given** all 4 modules are in COMPLETE state and the Completion Screen is shown
**When** the user taps "Bắt đầu đầu tư" and their local profile DOB indicates age <18 (or DOB is missing/invalid)
**Then** `f0_learning_path_complete` is set to true
**And** the user is navigated to the Home tab
**And** the age gate bottom sheet is displayed
**And** `f0_age_gate_shown` is set to true
**And** tapping "Hiểu rồi" dismisses the bottom sheet

---

### AC-11: Resume Mid-Lesson After Force-Kill

**Given** the user has swiped to Card 3 (index 2) of lesson M1 L1.1
**When** the app is force-killed and relaunched
**Then** the lesson viewer opens at Card 3 (not Card 1)
**And** `f0_lesson_1_1_card_index` = 2 persists in AsyncStorage
**And** `f0_lesson_1_1_state` = IN_PROGRESS

---

### AC-12: Locked Module — No Navigation

**Given** module M3 is in LOCKED state
**When** the user taps the M3 module card on the Learning Path Home
**Then** no navigation occurs
**And** the module detail screen for M3 does not open

---

## 6. State Definitions

### 6.1 Module States

| State | Description | Visual Indicator |
|---|---|---|
| `LOCKED` | Module prerequisites not met; cannot be accessed. All lessons within are implicitly LOCKED. | Lock icon, greyed out card |
| `UNLOCKED` | Prerequisites met; module is accessible. No lessons have been started yet. The first lesson (L{n}.1) is UNLOCKED; all others are LOCKED. | Available indicator, no progress bar fill |
| `IN_PROGRESS` | At least one lesson has been started (any lesson is IN_PROGRESS or COMPLETE) but not all 5 lessons are COMPLETE. | Progress bar partially filled |
| `LESSONS_COMPLETE` | All 5 lessons are in COMPLETE state. MKC has not yet been passed (or not yet attempted). | All lesson indicators filled; MKC CTA visible |
| `COMPLETE` | All 5 lessons are COMPLETE and MKC has been passed (score ≥3/5). This is the terminal state for a module. | Checkmark/complete badge; full progress bar |

**Allowed transitions:**
- `LOCKED` → `UNLOCKED` (when previous module reaches COMPLETE)
- `UNLOCKED` → `IN_PROGRESS` (when first card of first lesson is viewed)
- `IN_PROGRESS` → `LESSONS_COMPLETE` (when all 5 lessons reach COMPLETE)
- `LESSONS_COMPLETE` → `COMPLETE` (when MKC score ≥3/5)
- `LOCKED` or `UNLOCKED` → `COMPLETE` (Placement Quiz pass path for M1 only)

**Note:** There is no backward transition. States are monotonically increasing. A COMPLETE module never reverts.

### 6.2 Lesson States

| State | Description |
|---|---|
| `LOCKED` | Previous lesson in the module has not reached COMPLETE (or module is LOCKED). Cannot be accessed. |
| `UNLOCKED` | Previous lesson is COMPLETE (or this is L{n}.1 and the module just became UNLOCKED). Not yet started. `card_index` = 0. |
| `IN_PROGRESS` | User has viewed at least Card 1. Card 4 quiz may or may not have been passed. `card_index` ≥ 1. |
| `COMPLETE` | All 5 cards viewed AND Card 4 quiz passed. Terminal state for a lesson. |

**Allowed transitions:**
- `LOCKED` → `UNLOCKED` (when previous lesson reaches COMPLETE, or when module unlocks for L{n}.1)
- `UNLOCKED` → `IN_PROGRESS` (when Card 1 is first viewed)
- `IN_PROGRESS` → `COMPLETE` (when Card 5 is reached after Card 4 quiz passed)

**Note:** A COMPLETE lesson can be revisited in read-only review mode. Its state does not change on review.

---

## 7. Non-Functional Requirements

### NFR-01: AsyncStorage Performance

- Individual AsyncStorage read or write operations must complete within **50ms** on a mid-range Android device (e.g., Snapdragon 665 equivalent).
- Batch reads using `AsyncStorage.multiGet` must complete within **100ms** for the full set of `f0_` keys (~30–40 keys).
- The cold-start state reconstruction (reading all `f0_` keys into memory) must not block the UI thread or delay the first meaningful paint.

### NFR-02: Cold Start Non-Blocking

- All AsyncStorage reads at app launch must be performed asynchronously. The Learning Path Home screen must render with a loading skeleton while AsyncStorage is being read, then hydrate with real state.
- The app must not show a blank screen or block the main thread while waiting for AsyncStorage.

### NFR-03: Storage Size

- Estimated maximum storage footprint for all `f0_` keys: ~2–3 KB (see data model document, Section 9 for detailed estimate). This is well within AsyncStorage limits (typically 6 MB on iOS, effectively unlimited on Android with SQLite backend).
- No binary data, images, or large strings are stored under `f0_` keys. All values are JSON-serializable primitives or small enums.

### NFR-04: Content Update Mechanism

- Quiz questions (Placement Quiz, Card 4 in-lesson, MKC) are hardcoded in the app bundle as TypeScript/JavaScript constants.
- Any update to quiz content, question text, answer options, or correct answers requires a new app store release (iOS App Store + Google Play Store).
- There is no OTA (over-the-air) update mechanism for quiz content in V1. This is a known constraint accepted by Product.

### NFR-05: Offline Operation

- The entire F0 Learning Path must function fully offline. No feature in this module makes network requests.
- The module must be functional immediately on first install (before any network sync has occurred) as long as the app bundle is installed.

### NFR-06: Idempotency

- All state-write operations must be idempotent. Writing COMPLETE to a lesson that is already COMPLETE must not trigger downstream effects (such as unlocking the next lesson a second time). Developers must guard all state transition writes with a precondition check of the current stored value.
- See the data model document (Section 6) for full idempotency rules.

### NFR-07: Test Coverage

- All business rules (BR-01 through BR-14) must have corresponding unit tests.
- All AsyncStorage state transition logic must be tested with mocked AsyncStorage.
- All edge cases (EC-01 through EC-10) must have integration or unit test coverage.
- The age gate DOB calculation (including invalid DOB handling) must be tested with boundary values: exactly 18th birthday, one day before 18th birthday, null DOB, empty string DOB, invalid format DOB.

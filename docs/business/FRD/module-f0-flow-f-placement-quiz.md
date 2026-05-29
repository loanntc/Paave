# Flow F — Initial Placement Quiz
**Version:** 1.0 | **Date:** 2026-05-28 | **FR References:** FR-LEARN-19
**Linked FRD:** `docs/business/frd/module-f0-learning.md`

---

## 1. Flow Summary

| Field | Detail |
|-------|--------|
| Actor | New User — F0 Trader who claims prior stock market knowledge |
| Trigger | User taps "Tôi đã biết chứng khoán cơ bản" (tertiary link) on Welcome Modal |
| Precondition | `welcome_modal_shown` being set (welcome modal rendered); user not yet in learning path |
| Exit State A | Score ≥ 4/5 → M1 skipped; user enters learning path at M2 |
| Exit State B | Score < 4/5 → user enters learning path at M1 |
| Exit State C | App force-killed before submission → quiz state not saved; Welcome Modal may refire |
| FR References | FR-LEARN-19 |
| IR References | IR-21, IR-22 |
| EC References | EC-06 |
| TC References | TC-35 through TC-40 |

---

## 2. Business Flow

```
1. User taps tertiary CTA on Welcome Modal
   → welcome_modal_shown = true (already written at modal render)
   → Navigate to Placement Quiz intro screen (slideUp 400ms)
   → Back navigation: STILL AVAILABLE at intro screen (user can return to Welcome Modal)

2. Intro screen displays:
   → "Kiểm tra nhanh kiến thức của bạn"
   → "5 câu — không cần ôn tập, trả lời thành thật nhất"
   → "Bắt đầu" KineticButton lime

3. User taps "Bắt đầu"
   → Q1 renders
   → Back navigation BLOCKED IMMEDIATELY (IR-21, BR-LEARN-24):
     → iOS swipe-from-left gesture: disabled
     → Android system back button: disabled
     → Back chevron in header: HIDDEN for entire quiz duration (Q1–Q5)
   → [User cannot return to Welcome Modal or intro screen from this point]

4. User answers Q1–Q5 (forward-only):
   → One question per screen
   → User taps an option → option highlighted in "selected" state (edge-strong border)
   → "Tiếp theo →" activates after any selection
   → On Q1–Q4: advance to next question
   → On Q5: button reads "Nộp bài"
   → NO back navigation; NO per-question reveal; NO time limit

5. User taps "Nộp bài" on Q5:
   → Button enters loading state
   → Score evaluated server-side
   → ONE-SHOT RULE: quiz cannot be retaken regardless of score

6. RESULT EVALUATION:

   [PASS: ≥ 4/5 correct]
   ├── M1 marked COMPLETE server-side
   │   → No badge awarded (M1 badge requires MKC pass, not Placement Quiz pass)
   │   → No XP awarded for the skip
   ├── Pass screen displayed:
   │   → "Bạn đã nắm vững kiến thức cơ bản!"
   │   → Score: "4/5" (or "5/5") in lime display-md
   │   → "Module 1 sẽ được bỏ qua. Bạn sẽ bắt đầu từ Module 2." body copy
   │   → AmbientBackground: lime orbs (celebratory)
   └── "Bắt đầu Module 2 →" CTA → navigate to L2.1 Card 1

   [FAIL: < 4/5 correct]
   ├── M1 status unchanged (remains UNLOCKED, not started)
   ├── Fail screen displayed:
   │   → "Hãy bắt đầu từ đầu — bạn sẽ tiến bộ nhanh thôi!"
   │   → Score: e.g., "2/5" in fog display-md
   │   → AmbientBackground: plasma orbs (softer, encouraging)
   └── "Bắt đầu Module 1 →" CTA → navigate to L1.1 Card 1

7. ONE-SHOT ENFORCEMENT:
   → After quiz submission (pass or fail), the tertiary CTA on the Welcome Modal
     no longer leads to the Placement Quiz (welcome_modal_shown = true; modal won't show again)
   → No retry UI exists in the results screen for either outcome
   → The user can never take the Placement Quiz again on this account

8. FORCE-KILL BEFORE SUBMISSION (EC-06):
   → Quiz state is NOT saved server-side until "Nộp bài" is submitted
   → welcome_modal_shown = true (written at modal render, before quiz started)
   → On relaunch: Welcome Modal does NOT fire again (flag is true)
   → User enters Home tab; Grow tab shows M1 as UNLOCKED; no quiz entry point
   → [This means a force-kill effectively ends the placement quiz opportunity]
```

---

## 3. Acceptance Criteria

```
Given  user taps "Tôi đã biết chứng khoán cơ bản" on Welcome Modal
When   Placement Quiz intro screen appears
Then   back navigation is still available; user can return to Welcome Modal

Given  user taps "Bắt đầu" on intro screen
When   Q1 renders
Then   back navigation is BLOCKED; back chevron hidden; system back gesture disabled

Given  user answers 4/5 correctly and submits
When   result is evaluated
Then   Pass screen shown; M1 marked COMPLETE server-side;
       NO M1 badge or XP awarded; "Bắt đầu Module 2 →" CTA active

Given  user answers 2/5 correctly and submits
When   result is evaluated
Then   Fail screen shown; M1 status unchanged; "Bắt đầu Module 1 →" CTA active;
       NO retry option presented

Given  user has submitted the Placement Quiz (any result)
When   user navigates back to Welcome Modal entry points
Then   No path to Placement Quiz exists; quiz cannot be retaken

Given  user starts quiz at Q3 and force-kills the app
When   user relaunches
Then   Welcome Modal does NOT refire; user lands on Home tab;
       M1 shows UNLOCKED in Grow tab; no quiz entry point available
```

---

## 4. Design Analysis

### 4.1 Screens & Wireframes Involved

| Screen | Wireframe Ref | Purpose |
|--------|--------------|---------|
| Placement Quiz (Intro + Q1–Q5) | Screen 2 | 5-question assessment with intro card |
| Placement Quiz — Pass | Screen 3 | Skip confirmation; route to M2 |
| Placement Quiz — Fail | Screen 4 | Encouragement; route to M1 |

### 4.2 Design Decisions & Rationale

**Decision 1: Back navigation available on intro screen, blocked on Q1 render**
The intro screen is a decision gate — the user should be able to reconsider before committing. Once they tap "Bắt đầu" and see Q1, the quiz has started and returning would reset their mental state. The design enforces this as a hard block at the system navigation level (IR-21, BR-LEARN-24), not just a soft confirmation dialog.

**Decision 2: Back chevron is HIDDEN (not disabled) during Q1–Q5**
A visible but disabled back button would imply the feature is temporarily unavailable, inviting the user to wait or try again. Hiding it completely removes the option from the user's mental model entirely — they know the quiz is forward-only without needing a system message.

**Decision 3: Pass result uses lime AmbientBackground; Fail uses plasma (softer)**
The Pass screen is a clear win — lime orbs reinforce the "growth achieved" signal. The Fail screen should NOT feel like a failure — the user is being routed to M1, which is the intended happy path for most users. Plasma orbs (identity accent, softer energy) create an "encouraging, not punishing" emotional tone. Copy reinforces this: "bạn sẽ tiến bộ nhanh thôi!" (you'll progress quickly!).

**Decision 4: No retry option on either result screen**
The Placement Quiz is explicitly one-shot by business rule (BR-LEARN-21). The design does not show a disabled "retry" button — hiding the option entirely prevents cognitive load around "why can't I retry?" A user who wants to change their result simply goes through M1 (fastest path to M2 knowledge anyway).

**Decision 5: M1 completion via Placement Quiz awards no badge or XP**
This is a business rule (BR-LEARN-21), not a design decision. The design communicates this via copy: "Module 1 sẽ được bỏ qua" (Module 1 will be skipped) — no mention of rewards, because there are none. A user who expected to get the M1 badge could be confused; the copy needs to set expectations correctly.

**Decision 6: `PlacementQuizCard` with `intro` variant handles both intro and question views**
Rather than designing two separate full screens (intro card + question card), the design uses a single `PlacementQuizCard` component with two variants. The intro variant fills the same card surface as question variants, creating a seamless visual transition when "Bắt đầu" is tapped. This avoids a jarring full-screen transition at the start of the quiz.

**Decision 7: No score breakdown on results screens**
The Pass and Fail screens show the total score (e.g., "4/5") but not which questions were right or wrong. This is intentional for the one-shot quiz: showing wrong answers would allow the user to note them for a future retry that doesn't exist. Keeping results high-level is cleaner and avoids creating frustration about specific "wrong" items.

**Decision 8: AmbientBackground on results screens (not neutral ink-900)**
The results screens are emotional moments — discovery of one's knowledge level. The ambient background (used in auth flow, Welcome Modal, and Module Completion rewards) signals "this is a milestone moment." Using a plain dark canvas here would feel anticlimactic.

### 4.3 Component Usage

| Component | Source | Variant / State | Role |
|-----------|--------|----------------|------|
| `PlacementQuizCard` | `DESIGN-F0-LEARN-04` (new) | `intro` | Instructions + "Bắt đầu" CTA before Q1 |
| `PlacementQuizCard` | `DESIGN-F0-LEARN-04` (new) | `question` | Q1–Q5 question + 4 options (no reveal) |
| `QuizOption` | `DESIGN-F0-LEARN-04` (new) | default / selected only | Answer options; selected state only |
| `LessonProgressBar` | `DESIGN-F0-LEARN-04` (new) | `quiz` | "Câu N/5" label + progress bar |
| `AmbientBackground` | `components.md` (existing) | default | Pass screen (lime orbs); Fail screen (plasma orbs) |
| `KineticButton` | `components.md` (existing) | `lime` | "Bắt đầu" (intro); "Nộp bài" (Q5); result CTAs |

### 4.4 Interaction Rules Applied

| Rule | Trigger | System Response |
|------|---------|----------------|
| IR-21 | Q1 renders | System-level back gesture disabled; back chevron hidden for Q1–Q5 |
| IR-22 | User taps "Nộp bài" on Q5 | Score evaluated; Pass or Fail screen rendered; M1 status updated if pass |

### 4.5 Edge Cases — UI Handling

| Case | Code | UI Response |
|------|------|-------------|
| App force-killed before "Nộp bài" | EC-06 | Quiz state not saved; Welcome Modal does NOT refire (flag already true); M1 shown as UNLOCKED in Grow tab; no quiz entry point |
| Network unavailable during "Nộp bài" | (not specified) | Button stays in loading state; after 3s timeout: error toast "Không thể kết nối. Thử lại?"; retry submits same answers |

---

## 5. Business ↔ Design Alignment

| FR | Requirement | Screen | Component | IR | TC |
|----|-------------|--------|-----------|----|----|
| FR-LEARN-19 | Entry from Welcome Modal tertiary CTA | Screen 2 | Tertiary text link → PlacementQuizCard | IR-03 | TC-06 |
| FR-LEARN-19 | Back nav available on intro, blocked on Q1 | Screen 2 | IR-21 (system nav disable) | IR-21 | TC-37, TC-38 |
| FR-LEARN-19 | 5 questions, forward-only, no reveal | Screen 2 | QuizOption (default/selected only) | — | TC-32 analogue |
| FR-LEARN-19 | Pass ≥ 4/5 → skip M1; no badge/XP | Screen 3 | AmbientBackground lime + Pass copy | IR-22 | TC-35 |
| FR-LEARN-19 | Fail < 4/5 → start M1 | Screen 4 | AmbientBackground plasma + Fail copy | IR-22 | TC-36 |
| FR-LEARN-19 | One-shot: no retry | Screens 3, 4 | No retry button; no disabled state | — | TC-39 |
| FR-LEARN-19 | Force-kill: quiz state not saved | (system) | EC-06 handling | — | TC-40 |

---

## 6. QA Test Cases

| TC | Scenario | Expected Result |
|----|----------|----------------|
| TC-35 | Answer 4/5 correctly; submit | Pass screen; "4/5" lime; "Module 1 bỏ qua" copy; M1 COMPLETE server-side; no badge/XP |
| TC-36 | Answer 2/5 correctly; submit | Fail screen; score in fog; "Bắt đầu Module 1" CTA; M1 remains UNLOCKED |
| TC-37 | System back gesture on Q3 | No navigation; user stays on Q3 |
| TC-38 | Back tap on intro screen (before "Bắt đầu") | Returns to Welcome Modal; back available here |
| TC-39 | Complete quiz; attempt to access quiz again | No quiz entry point exists; Welcome Modal won't refire |
| TC-40 | Force-kill on Q3 before submit | On relaunch: Welcome Modal NOT shown; M1 UNLOCKED in Grow tab; no quiz access |

---

## 7. Design Gaps / Risks

| # | Gap / Risk | Severity | Recommendation |
|---|-----------|----------|---------------|
| G-F-01 | Force-killing during the Placement Quiz permanently ends the user's chance to skip M1 (welcome_modal_shown = true; quiz entry gone). A user with genuine knowledge who has a network/device issue loses the skip opportunity. | Medium | Consider a 24h grace window: if quiz is started but not submitted within 24h, allow one re-entry via a "Resume quiz" prompt on the Grow tab. This requires a server-side `placement_quiz_started_at` timestamp. |
| G-F-02 | The Pass screen copy says "Module 1 sẽ được bỏ qua" but does NOT explain that the M1 badge and XP are forfeited. Some users may expect the M1 badge from the Grow tab My Badges section and be confused when it's missing. | Low | Add one sentence to Pass screen body: "Huy hiệu Module 1 sẽ không được trao khi bỏ qua." |
| G-F-03 | The Placement Quiz has no defined question pool size in the FRD. If only 5 questions exist and the force-kill grace window (G-F-01) is implemented, a user who memorized the questions could game the quiz. | Medium | Minimum 10-question pool; raise to BA/PO for FRD update. |

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| FRD: F0 Learning Path | `docs/business/frd/module-f0-learning.md` |
| UX Flows Overview | `docs/business/frd/module-f0-learning-ux-flows.md` |
| Flow A — Welcome Modal | `docs/business/frd/module-f0-flow-a-welcome-modal.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Screen Wireframes (Screens 2–4) | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| Component Specs (PlacementQuizCard) | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules (IR-21, IR-22, EC-06) | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| UI Specification | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |

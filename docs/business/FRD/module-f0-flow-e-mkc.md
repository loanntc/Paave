# Flow E — Module Knowledge Check (MKC)
**Version:** 1.0 | **Date:** 2026-05-28 | **FR References:** FR-LEARN-18
**Linked FRD:** `docs/business/frd/module-f0-learning.md`

---

## 1. Flow Summary

| Field | Detail |
|-------|--------|
| Actor | F0 Trader who has completed all 5 lessons in a module |
| Trigger | User taps "Làm bài kiểm tra" on the module completion banner (appears after Lesson 5 completes) |
| Precondition | All 5 lessons in the module have status = COMPLETE |
| Exit State A | Score ≥ 3/5 → Module Completion Reward Screen (Flow D) |
| Exit State B | Score < 3/5 → MKC Fail screen with 60s cooldown; retry available after cooldown |
| Exit State C | User taps ✕ Exit → returns to Grow tab; MKC progress lost (not saved) |
| FR References | FR-LEARN-18 |
| IR References | IR-17, IR-18 |
| EC References | EC-04 |
| TC References | TC-28 through TC-34 |

---

## 2. Business Flow

```
1. Entry: User taps "Làm bài kiểm tra" banner
   → System loads 5 questions from module question pool
   → MKC screen opens with Q1 rendered

2. User answers questions Q1–Q5 (forward-only):
   → One question per screen
   → User taps an option → option highlighted in "selected" state (edge-strong border)
   → "Tiếp theo →" activates after any selection (no correct/wrong reveal)
   → On Q1–Q4: tap "Tiếp theo →" → next question
   → On Q5: button reads "Nộp bài"
   → NO back navigation between questions
   → NO per-question answer reveal until submission
   → NO time limit per question

3. User taps "Nộp bài" on Q5:
   → Button enters loading state (spinner)
   → Answers sent to server for evaluation
   → [Server response within 3s]
   │   ├── [Score ≥ 3/5 — PASS] → navigate to MKC Pass Results screen (step 4)
   │   └── [Score < 3/5 — FAIL] → navigate to MKC Fail/Cooldown screen (step 5)
   └── [Server timeout after 3s — EC-04]
         → Error toast: "Không thể kết nối. Thử lại sau vài giây."
         → No score saved; NO cooldown triggered
         → "Thử lại" in toast → re-submits

4. MKC PASS (score ≥ 3/5):
   → Results screen: "Chúc mừng! Bạn đã hoàn thành Module N!"
   → Score displayed: e.g., "4/5" in lime display-md
   → "ĐẠT" chip (xp-pill-bg, lime)
   → Reward preview: BadgeCard thumbnail + XP chip
   → "Nhận phần thưởng 🎉" CTA → navigate to Module Completion Reward Screen (Flow D)

5. MKC FAIL (score < 3/5):
   → Results screen: "Chưa đạt. Cần ≥ 3/5 câu đúng."
   → Score displayed: e.g., "2/5" in negative (#EF4444) display-md
   → "CHƯA ĐẠT" chip (cooldown-bg, negative)
   → Review links for each INCORRECT question (tap → returns to corresponding lesson)
   → 60-second cooldown begins IMMEDIATELY:
     → Countdown banner: "Bạn có thể thử lại sau [countdown]"
     → "Thử lại sau 00:60" button: DISABLED (opacity-40, KineticButton lime)
     → Countdown ticks every 1s

6. Cooldown expires (60s elapsed):
   → MKCCooldownBanner transitions: cooldown-bg → xp-pill-bg (500ms)
   → "Thử lại ngay →" KineticButton lime: ENABLED
   → Tap → reload MKC with FRESH randomized question set from same pool
   → New 60s cooldown starts AFTER this attempt's submission if failed again
   → No retry limit

7. User exits MKC (taps ✕) at any point:
   → Returns to Grow tab; module remains at LESSONS_COMPLETE state
   → MKC progress NOT saved (no partial submission)
   → Module KCB banner shows again on Lesson 5 card (user can re-enter MKC later)
```

---

## 3. Acceptance Criteria

```
Given  user has completed all 5 lessons in Module 1
When   user taps "Làm bài kiểm tra"
Then   MKC opens at Q1; progress bar shows 0%; "Câu 1/5" label visible

Given  user selects option B on Q2
When   user taps "Tiếp theo →"
Then   Q3 renders; Q2 answer is remembered for submission;
       NO correct/wrong indication shown on Q2

Given  user submits MKC with score 4/5
When   results are processed
Then   Pass screen shown with "4/5" in lime; reward preview badge; "Nhận phần thưởng" CTA active

Given  user submits MKC with score 2/5
When   results are processed
Then   Fail screen shown with "2/5" in negative; review links for wrong questions;
       "Thử lại" button DISABLED; countdown starts at 00:60

Given  user fails MKC and 60 seconds have elapsed
When   countdown reaches 00:00
Then   banner transitions lime; "Thử lại ngay →" button ENABLED
       AND tapping starts a fresh MKC with randomized question order

Given  user submits MKC and network times out (3s+)
When   timeout fires
Then   error toast appears; NO score saved; NO 60s cooldown applied;
       user can re-submit immediately

Given  user taps ✕ Exit during MKC (on Q3)
When   exit fires
Then   user returns to Grow tab; MKC progress discarded;
       module still shows LESSONS_COMPLETE; MKC banner still accessible
```

---

## 4. Design Analysis

### 4.1 Screens & Wireframes Involved

| Screen | Wireframe Ref | Purpose |
|--------|--------------|---------|
| MKC — Question View | Screen 13 | 5-question forward-only quiz |
| MKC Results — Pass | Screen 14 | Score + reward preview; CTA to reward screen |
| MKC Results — Fail / Cooldown | Screen 15 | Score + review links + 60s countdown |

### 4.2 Design Decisions & Rationale

**Decision 1: No per-question answer reveal (unlike the in-lesson quiz)**
The in-lesson quiz (Card 4, Flow C) reveals correct/wrong immediately per question with unlimited retries. The MKC is a structured assessment — revealing answers per-question would allow the user to learn from immediate feedback and retry with that knowledge, defeating the purpose of the check. The design defers all reveals to the results screen.

**Decision 2: Forward-only navigation (no back between questions)**
Back navigation would allow users to re-examine earlier questions after seeing later ones, potentially creating inference about which answer was correct. The MKC is an assessment, not a learning tool. The design enforces forward-only navigation at the component level (no Back chevron rendered) — consistent with how real assessments work.

**Decision 3: 60-second cooldown with live countdown (MKCCooldownBanner)**
The cooldown prevents rapid-fire retries that would let a user brute-force 5 questions by trial and error. 60 seconds is short enough to not be frustrating, but long enough to encourage returning to lessons. The design makes the countdown visible (digital timer, display-sm, negative color) rather than hiding it — transparency reduces frustration. The banner color transition (cooldown-bg → xp-pill-bg) at T=0 creates a positive signal that the wait is over.

**Decision 4: MKCCooldownBanner color transition is the ONLY visual change on cooldown expiry**
The design deliberately avoids a jarring animation (flash, bounce) at cooldown expiry. The 500ms color transition (red-tinted → lime-tinted) is subtle but unmistakable. The button label also changes from "Thử lại sau..." to "Thử lại ngay →" — two reinforcing signals without visual noise.

**Decision 5: Review links for incorrect questions (not a "review all" button)**
On the Fail screen, each incorrect question gets a named link row (e.g., "Q2: What is a P/E ratio?"). This is more useful than "Review all lessons" because it targets the specific knowledge gaps revealed by the MKC. The user can jump directly to the relevant lesson card without scanning through all content.

**Decision 6: No cooldown on network timeout (EC-04)**
If the server doesn't respond, the user hasn't "failed" the MKC — they haven't been scored at all. Applying a cooldown in this case would be punitive for a network issue beyond the user's control. The design explicitly distinguishes between a failed submission (score returned, cooldown applies) and a network failure (no score, retry immediately).

**Decision 7: QuizCard uses `variant="mkc"` (no correct/wrong reveal per option)**
The MKC reuses the same `QuizCard` component from Flow C but with a different variant. In `mkc` variant, options can only be `default` or `selected` — never `correct` or `wrong` until submission. This is a single prop change, not a new component — consistent with the component reuse principle in `design-system.md §13`.

### 4.3 Component Usage

| Component | Source | Variant / State | Role |
|-----------|--------|----------------|------|
| `QuizCard` | `DESIGN-F0-LEARN-04` (new) | `mkc` | Question wrapper (no per-option reveal) |
| `QuizOption` | `DESIGN-F0-LEARN-04` (new) | default / selected only | 4 answer options; no correct/wrong states during quiz |
| `LessonProgressBar` | `DESIGN-F0-LEARN-04` (new) | quiz | Progress bar + "Câu N/5" label (no dots) |
| `MKCCooldownBanner` | `DESIGN-F0-LEARN-04` (new) | counting / ready | 60s countdown + retry CTA transition |
| `BadgeCard` | `DESIGN-F0-LEARN-04` (new) | gallery (small preview) | Reward preview on Pass screen |
| `KineticButton` | `components.md` (existing) | lime | "Nhận phần thưởng" (Pass); "Thử lại ngay" (after cooldown) |
| `KineticButton` | `components.md` (existing) | lime (disabled) | "Thử lại sau [countdown]" during cooldown |

### 4.4 Interaction Rules Applied

| Rule | Trigger | System Response |
|------|---------|----------------|
| IR-17 | User taps "Nộp bài" on Q5 | Button → loading; results evaluated; pass/fail screen rendered |
| IR-18 | User taps "Thử lại ngay →" after cooldown | Fresh MKC starts; new 60s cooldown queued for this attempt |
| EC-04 | Server response times out (>3s) | Error toast; no score; no cooldown; immediate retry available |

### 4.5 Edge Cases — UI Handling

| Case | Code | UI Response |
|------|------|-------------|
| MKC submission times out | EC-04 | Error toast (negative, 3s, ink-800, radius-xl): "Không thể kết nối. Thử lại?" No cooldown applied. |
| User exits MKC mid-question | (design edge) | ✕ button returns to Grow tab; no partial save; MKC banner still accessible |
| User fails MKC 5+ times | (no limit) | Each fail resets countdown; no UI change; no retry limit message needed |

---

## 5. Business ↔ Design Alignment

| FR | Requirement | Screen | Component | IR | TC |
|----|-------------|--------|-----------|----|----|
| FR-LEARN-18 | 5 questions, forward-only | Screen 13 | QuizCard `mkc` + LessonProgressBar | — | TC-32 |
| FR-LEARN-18 | No per-question reveal | Screen 13 | QuizOption (no correct/wrong states) | — | TC-33 |
| FR-LEARN-18 | Pass ≥ 3/5 → reward | Screen 14 | BadgeCard preview + KineticButton lime | IR-17 | TC-28 |
| FR-LEARN-18 | Fail < 3/5 → 60s cooldown | Screen 15 | MKCCooldownBanner `counting` | IR-17 | TC-29, TC-31 |
| FR-LEARN-18 | Countdown expiry → retry enabled | Screen 15 | MKCCooldownBanner `ready` transition | IR-18 | TC-30 |
| FR-LEARN-18 | Review links for wrong Qs | Screen 15 | Inline review rows | — | — |
| FR-LEARN-18 | No cooldown on network timeout | Screen 13/15 | Error toast (no cooldown trigger) | EC-04 | TC-34 |

---

## 6. QA Test Cases

| TC | Scenario | Expected Result |
|----|----------|----------------|
| TC-28 | Score 4/5 → pass | Pass screen; "4/5" lime; reward preview; "Nhận phần thưởng" active |
| TC-29 | Score 2/5 → fail | Fail screen; "2/5" negative; countdown at 00:60; retry DISABLED |
| TC-30 | Wait 60s after fail | Banner transitions lime; "Thử lại ngay →" ENABLED |
| TC-31 | Tap retry during countdown | No action; button stays disabled |
| TC-32 | Attempt back navigation between Q2→Q1 | No navigation; back chevron hidden; system back disabled |
| TC-33 | Select answer on Q2; advance to Q3; return | Q2 shows selected state only; no correct/wrong reveal |
| TC-34 | Submit MKC; network times out (3s) | Error toast; no cooldown; retry option available immediately |

---

## 7. Design Gaps / Risks

| # | Gap / Risk | Severity | Recommendation |
|---|-----------|----------|---------------|
| G-E-01 | The Pass screen shows a `BadgeCard` preview in "gallery" size (80×80px). The badge name label may be truncated if the badge name is long (e.g., "Portfolio Thinker" = 18 chars). | Low | Set `text-overflow: ellipsis` with `max-width: 100px` on the badge name label. |
| G-E-02 | The MKC question pool size is not specified in the FRD. If the pool is exactly 5 questions, every retry will present the same questions (just reordered). Users who fail multiple times will memorize questions rather than learning the concept. | High | Recommend minimum 10-question pool per module; surface this to BA/PO for FRD update. |
| G-E-03 | MKC entry point is the module completion banner, which appears only after Lesson 5 completes. There is no way to re-access the MKC from the Grow tab module card (LESSONS_COMPLETE state) if the user dismisses the banner. | Medium | Add "Làm bài kiểm tra →" CTA to the ModuleCard when module is in LESSONS_COMPLETE state. Update `DESIGN-F0-LEARN-04-component-spec.md` ModuleCard variants. |

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| FRD: F0 Learning Path | `docs/business/frd/module-f0-learning.md` |
| UX Flows Overview | `docs/business/frd/module-f0-learning-ux-flows.md` |
| Flow C — Lesson Experience | `docs/business/frd/module-f0-flow-c-lesson-experience.md` |
| Flow D — Module Completion | `docs/business/frd/module-f0-flow-d-module-completion.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Screen Wireframes (Screens 13–15) | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| Component Specs (MKCCooldownBanner, QuizCard mkc variant) | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules (IR-17, IR-18, EC-04) | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| UI State Matrices | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |

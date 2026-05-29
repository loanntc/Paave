# Flow C — Card-Stack Lesson Experience
**Version:** 1.0 | **Date:** 2026-05-28 | **FR References:** FR-LEARN-03, FR-LEARN-04, FR-LEARN-05, FR-LEARN-06, FR-LEARN-07
**Linked FRD:** `docs/business/frd/module-f0-learning.md`

---

## 1. Flow Summary

| Field | Detail |
|-------|--------|
| Actor | F0 Trader (new or returning) |
| Trigger | User taps an unlocked lesson on Learning Path Home |
| Precondition | Lesson's module is UNLOCKED, IN_PROGRESS, or COMPLETE; user authenticated |
| Exit State A | Lesson completed (XP +25 awarded); return to Grow tab |
| Exit State B | User exits mid-lesson (✕ button); progress saved; return to Grow tab |
| Exit State C | Lesson 5 of module complete → Module Knowledge Check banner shown |
| Exit State D | "Try It Now" CTA → navigate to paper trading (Portfolio tab) |
| FR References | FR-LEARN-03, FR-LEARN-04, FR-LEARN-05, FR-LEARN-06, FR-LEARN-07 |
| IR References | IR-04 through IR-15 |
| EC References | EC-02, EC-03 |
| TC References | TC-16 through TC-27, TC-46, TC-47 |

---

## 2. Business Flow

```
1. Lesson viewer opens
   → System reads session_progress.card_index for this lesson
   ├── [Fresh lesson: no prior progress] → card_index = 0; show Card 1
   └── [Resumed lesson: prior progress]  → card_index = N; show Card N
       → Toast: "Tiếp tục từ vị trí bạn bỏ dở" (2s auto-dismiss)

2. REVIEW MODE CHECK:
   ├── [Lesson status = COMPLETE] → all 5 cards freely navigable; no XP re-award
   └── [Lesson status ≠ COMPLETE] → normal forward progression

3. User progresses through 5 cards (fixed order):

   CARD 1 — CONCEPT:
   ├── Content: core definition, visual zone, optional key term highlight
   ├── Forward: swipe left / tap "Tiếp theo →"
   └── Backward: swipe right → no navigation (boundary bounce + haptic)

   CARD 2 — EXAMPLE:
   ├── Content: real VN market company example, stock data row with ChangePill
   ├── Forward / Backward: swipe or chevron
   └── On each advance: card_index saved (debounced 500ms)

   CARD 3 — MYTH-BUSTER:
   ├── Content: misconception (myth-wrong-bg) + correction (myth-truth-bg)
   └── Forward / Backward: swipe or chevron

   CARD 4 — QUIZ:
   ├── 4 answer options (A/B/C/D) displayed
   ├── User taps an option:
   │   ├── [CORRECT]             → quiz-correct-bg + checkmark; "Tiếp theo" activates
   │   ├── [WRONG, attempt 1–2]  → quiz-wrong-bg + shake; attempt_count incremented; reset after 300ms
   │   └── [WRONG, attempt 3]   → HintCard slides in from right (plasma theme)
   │         User reads hint → taps "Hiểu rồi" → HintCard slides out
   │         Quiz card returns; no attempt limit after hint shown
   └── "Tiếp theo" DISABLED until correct answer selected

   CARD 5 — CTA ("Try It Now"):
   ├── Task prompt (lesson-specific paper trading action)
   ├── [PRIMARY] "Thử ngay trong danh mục ảo →"
   │     → Opens Try It Now bottom sheet (60% height, ink-800, radius-4xl)
   │     → Sheet contains: task prompt, GlassmorphicSecurityInfo disclaimer
   │       ├── [Sheet PRIMARY] "Đi đến danh mục ảo →"
   │       │     → Lesson completion triggered; navigate to Portfolio tab
   │       └── [Sheet SECONDARY] "Để sau"
   │             → Sheet dismisses; lesson completion triggered; return to Grow tab
   └── [SECONDARY] "Bỏ qua, xem bài tiếp theo →" (ghost button)
         → Lesson completion triggered directly

4. LESSON COMPLETION EVENT (triggered from Card 5 any path):
   → XP +25 granted (idempotent: {user_id}_{lesson_id})
   → lesson_completions record created
   → session_progress.card_index = 5 (or "complete")
   → XPToast: "+25 XP" (fadeUp 300ms; auto-dismiss 2500ms)
   → [If lesson < 5 in module]: return to Grow tab; next lesson unlocked visually
   → [If lesson = 5 in module]: Module KCB banner slides up after toast fades:
       "Bạn đã học xong Module N! Làm bài kiểm tra →"
       → Tap banner → navigate to MKC (Flow E)
```

---

## 3. Acceptance Criteria

```
Given  user opens a fresh lesson
When   lesson viewer loads
Then   Card 1 (Concept) is displayed; progress dots show ●○○○○; progress bar at 20%

Given  user is on Card 3
When   user swipes right
Then   Card 2 slides in from left; progress dots show ●●○○○
       AND card_index is NOT decremented (save only moves forward)

Given  user is on Card 1
When   user swipes right
Then   card bounces 8px right and returns; haptic fires; no navigation

Given  user selects a wrong quiz answer for the 3rd consecutive time
When   wrong answer tap fires
Then   quiz-wrong-bg feedback shown; HintCard slides in from right with plasma theme
       AND "Hiểu rồi" button is the only action available

Given  user completes a lesson (reaches Card 5 and skips or acts)
When   lesson completion event fires
Then   XP +25 is awarded exactly once; XPToast appears; lesson status = COMPLETE

Given  user returns to a completed lesson
When   lesson viewer opens
Then   all 5 cards freely navigable; no XPToast shown; no XP awarded

Given  user force-kills app between Card 3 advance and Card 4 render
When   user relaunches and opens same lesson
Then   lesson resumes at Card 3 (last successfully saved card_index)

Given  lesson card content (image/body) fails to load
When   content area renders
Then   error placeholder shown: "Không tải được nội dung. Thử lại?" with retry button
```

---

## 4. Design Analysis

### 4.1 Screens & Wireframes Involved

| Screen | Wireframe Ref | Purpose |
|--------|--------------|---------|
| Lesson Viewer — Concept Card | Screen 6 | First card; core concept delivery |
| Lesson Viewer — Example Card | Screen 7 | Real market data context |
| Lesson Viewer — Myth-Buster Card | Screen 8 | Misconception correction |
| Lesson Viewer — Quiz Card (Default) | Screen 9 | Knowledge test; gate to Card 5 |
| Lesson Viewer — Quiz Card (Hint) | Screen 10 | Support after 3 consecutive failures |
| Lesson Viewer — CTA Card | Screen 11 | Paper trading activation prompt |
| Lesson Completion Toast | Screen 12 | XP reward confirmation |

### 4.2 Design Decisions & Rationale

**Decision 1: Swipe threshold 30% of card width (not tap-based navigation)**
Swiping is the natural gesture for card-based mobile content. The 30% threshold prevents accidental advances while still feeling responsive. Tap chevrons are provided as an explicit fallback for accessibility and users who prefer taps. Both are equivalent — the design never forces one modality.

**Decision 2: Card 1 boundary produces bounce + haptic (not silence)**
When a user swipes right on Card 1 with no previous card, silence would feel like a bug. The 200ms ease-spring bounce communicates "you are at the beginning" without disorienting the user. The haptic reinforces the physical boundary — same pattern used in iOS scroll bounceback.

**Decision 3: HintCard uses plasma (#D277FF), not lime — critical design decision**
Lime = growth/action (CTA, progress). The hint state is NOT a progression action — it is a pause for reflection. Using plasma here (identity/alert accent) creates a distinct visual "mode change" that signals "pause here and read." If lime were used, the hint would compete with the forward-action language of the rest of the UI. The "Hiểu rồi" CTA uses KineticButton `plasma` variant for the same reason.

**Decision 4: "Tiếp theo" is DISABLED until correct answer (not hidden)**
Hiding the button would create confusion about what the user should do next. Showing it at opacity-40 communicates "this exists but isn't available yet" — the user understands the goal and can see what action will unlock when they succeed.

**Decision 5: No attempt limit after hint is shown**
The business rule allows unlimited retries. The design reinforces this by NOT showing an attempt counter once the hint has been displayed. The pressure is removed — the user can attempt as many times as needed. The hint card copy ("Không có giới hạn thử lại") makes this explicit.

**Decision 6: Two CTAs on Card 5 — neither path is "wrong"**
The primary CTA ("Thử ngay") navigates to paper trading, reinforcing the module's learning objective. The secondary CTA ("Bỏ qua") still completes the lesson and awards XP. This ensures high lesson completion rates — users who aren't ready to trade don't feel blocked. Both paths trigger XP award.

**Decision 7: GlassmorphicSecurityInfo reused in Try It Now bottom sheet**
The existing `GlassmorphicSecurityInfo` component (from auth/onboarding) is used to display the "Danh mục ảo 100% an toàn" notice. This reuse is intentional — the glassmorphic style creates a "trust moment" association. Users who've seen it during onboarding recognize it as a safety/verification signal.

**Decision 8: card_index debounced 500ms on save**
Saving on every pixel of swipe would generate excessive API calls. The 500ms debounce after animation completes is the correct tradeoff — fast enough to capture progress before any force-kill, sparse enough to not thrash the server.

### 4.3 Component Usage

| Component | Source | Variant / State | Role |
|-----------|--------|----------------|------|
| `ContentCard` | `DESIGN-F0-LEARN-04` (new) | concept / example / myth-buster / cta | Card content surface (Cards 1–3, 5) |
| `QuizCard` | `DESIGN-F0-LEARN-04` (new) | lesson | Card 4 quiz wrapper |
| `QuizOption` | `DESIGN-F0-LEARN-04` (new) | default / selected / correct / wrong / disabled | 4 answer options per quiz |
| `HintCard` | `DESIGN-F0-LEARN-04` (new) | default | Hint overlay after 3 consecutive wrong answers |
| `LessonProgressBar` | `DESIGN-F0-LEARN-04` (new) | lesson | 5 dots + progress bar at top of viewer |
| `XPToast` | `DESIGN-F0-LEARN-04` (new) | default | +25 XP on lesson completion |
| `KineticButton` | `components.md` (existing) | lime | "Tiếp theo", CTA card primary |
| `KineticButton` | `components.md` (existing) | ghost | Card 5 skip, "← Trước" |
| `KineticButton` | `components.md` (existing) | plasma | HintCard "Hiểu rồi" only |
| `ChangePill` | `components.md` (existing) | positive | Example card market data row |
| `GlassmorphicSecurityInfo` | `components.md` (existing) | default | Try It Now bottom sheet disclaimer |

### 4.4 Interaction Rules Applied

| Rule | Trigger | Screen |
|------|---------|--------|
| IR-04 | Swipe left / tap Next | All cards → advance |
| IR-05 | Swipe right / tap Back | All cards → back |
| IR-06 | Swipe right on Card 1 | Boundary bounce + haptic |
| IR-07 | Tap correct quiz option | quiz-correct-bg + enable Next |
| IR-08 | Tap wrong option (attempt 1–2) | quiz-wrong-bg + shake |
| IR-09 | Tap wrong option (attempt 3) | HintCard slides in |
| IR-10 | Tap "Hiểu rồi" on HintCard | HintCard slides out; quiz resets |
| IR-11 | Tap Card 5 primary CTA | Try It Now bottom sheet opens |
| IR-12 | Tap "Đi đến danh mục ảo" in sheet | Lesson completes; navigate to Portfolio |
| IR-13 | Tap "Để sau" / dismiss sheet | Lesson completes; return to Grow tab |
| IR-14 | Lesson < 5 in module completes | XPToast + next lesson unlocked pulse |
| IR-15 | Lesson 5 of module completes | XPToast + MKC banner slides up |

### 4.5 Edge Cases — UI Handling

| Case | Code | UI Response |
|------|------|-------------|
| Card content fails to load (CMS/CDN error) | EC-02 | Error placeholder + "Thử lại?" retry button; 3 retries with 500ms back-off |
| App force-killed before card_index save completes | EC-03 | On relaunch: resume at last saved card; attempt count resets to 0 |

---

## 5. Business ↔ Design Alignment

| FR | Requirement | Screen | Component | IR | TC |
|----|-------------|--------|-----------|----|----|
| FR-LEARN-03 | 5 cards in fixed order | Screens 6–11 | ContentCard (×4), QuizCard | — | TC-16 |
| FR-LEARN-03 | Swipe left/right navigation | Screens 6–11 | Swipe gesture + chevrons | IR-04, IR-05 | TC-17, TC-18 |
| FR-LEARN-03 | Boundary behavior on Card 1 | Screen 6 | Bounce animation + haptic | IR-06 | TC-19 |
| FR-LEARN-03 | Auto-save card_index | All screens | session_progress API | IR-04 | TC-20 |
| FR-LEARN-03 | Review mode: no XP re-award | All screens | lesson status check | — | TC-21, TC-47 |
| FR-LEARN-03 | Content load error handling | All screens | Error placeholder | — | TC-22 |
| FR-LEARN-04 | Correct answer feedback | Screen 9 | QuizOption `correct` | IR-07 | TC-23 |
| FR-LEARN-04 | Wrong answer feedback | Screen 9 | QuizOption `wrong` + shake | IR-08 | TC-24 |
| FR-LEARN-04 | Hint after 3 wrong | Screen 10 | HintCard | IR-09, IR-10 | TC-25, TC-26 |
| FR-LEARN-04 | "Tiếp theo" disabled until correct | Screen 9 | KineticButton disabled state | — | TC-27 |
| FR-LEARN-05 | "Try It Now" bottom sheet | Screen 11 | Bottom sheet + GlassmorphicSecurityInfo | IR-11 | — |
| FR-LEARN-05 | Paper trading navigation | Screen 11 | KineticButton lime in sheet | IR-12 | — |
| FR-LEARN-06 | XP +25 on lesson complete | Screen 12 | XPToast | IR-14, IR-15 | TC-46 |
| FR-LEARN-06 | XP idempotency (no re-award) | Screen 12 | idempotency key check | — | TC-47 |
| FR-LEARN-07 | Auto-save on force-kill | All screens | card_index debounced save | — | TC-20 |

---

## 6. QA Test Cases

| TC | Scenario | Expected Result |
|----|----------|----------------|
| TC-16 | Open fresh lesson | Card 1 shown; dots ●○○○○; progress bar 20% |
| TC-17 | Swipe left on Card 2 | Card 3 slides in; dots ●●●○○ |
| TC-18 | Swipe right on Card 3 | Card 2 slides in; dots ●●○○○ |
| TC-19 | Swipe right on Card 1 | Bounce + haptic; stay on Card 1 |
| TC-20 | Exit after Card 3; reopen | Resumes at Card 4 (last saved) |
| TC-21 | Re-enter completed lesson | All cards navigable; no XPToast |
| TC-22 | CMS API blocked | Error placeholder + retry button |
| TC-23 | Select correct answer | quiz-correct-bg; checkmark; "Tiếp theo" enabled |
| TC-24 | Select wrong answer (attempt 1) | quiz-wrong-bg; shake; attempt counter shown |
| TC-25 | Select wrong answer 3× | HintCard slides in with plasma theme |
| TC-26 | Tap "Hiểu rồi" on HintCard | HintCard slides out; quiz resets |
| TC-27 | "Tiếp theo" before correct answer | Button stays disabled (opacity-40) |
| TC-46 | Complete lesson (any path) | XPToast "+25 XP" appears; auto-dismisses 2500ms |
| TC-47 | Replay completed lesson to Card 5 | No XPToast; no XP re-awarded |

---

## 7. Design Gaps / Risks

| # | Gap / Risk | Severity | Recommendation |
|---|-----------|----------|---------------|
| G-C-01 | If the Try It Now task prompt content is very long (>80 words), the bottom sheet may require scrolling. The sheet height is 60% viewport and the spec doesn't define a min-height for the task prompt zone. | Low | Cap task prompt copy at 60 words in CMS; add `overflow-y: auto` to sheet content zone. |
| G-C-02 | The quiz "attempt counter" ("Lần thử: N") is shown only after the 1st wrong answer. There is no design spec for what happens if the counter exceeds single digits (unlikely but possible). | Low | Counter display "Lần thử: N" handles any integer; no design change needed. |
| G-C-03 | In review mode, the quiz Card 4 shows all options in their default state (no correct answer pre-highlighted). A returning user might not know which answer was correct. | Medium | In review mode, pre-highlight the correct option in `quiz-correct-bg` state (read-only, no interaction). Add to component spec for `QuizCard variant=lesson, state=review`. |
| G-C-04 | The XPToast uses `aria-live="assertive"` which interrupts screen readers mid-sentence. For a 2500ms transient toast, this could be disruptive. | Low | Consider `aria-live="polite"` — the toast auto-dismisses so delayed announcement is acceptable. |

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| FRD: F0 Learning Path | `docs/business/frd/module-f0-learning.md` |
| UX Flows Overview | `docs/business/frd/module-f0-learning-ux-flows.md` |
| Flow D — Module Completion | `docs/business/frd/module-f0-flow-d-module-completion.md` |
| Flow E — MKC | `docs/business/frd/module-f0-flow-e-mkc.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Screen Wireframes (Screens 6–12) | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| Component Specs (ContentCard, QuizCard, QuizOption, HintCard, XPToast) | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules (IR-04 through IR-15) | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| UI State Matrices | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |

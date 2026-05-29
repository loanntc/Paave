# Flow C: Lesson Experience

**Document version:** 1.0
**Last updated:** 2026-05-29
**Author:** Loanntc
**Architecture:** Frontend-only (AsyncStorage, no backend API)

---

## 1. Flow Summary

| Field | Value |
|---|---|
| **Flow ID** | FLOW-C |
| **Feature References** | FR-LEARN-03, FR-LEARN-04, FR-LEARN-05 |
| **Actor** | F0 trader viewing a lesson |
| **Trigger** | User taps "Bắt đầu / Tiếp tục" on ModuleCard · OR navigates directly from Welcome Modal primary CTA |
| **Precondition** | Module is UNLOCKED, IN_PROGRESS, or COMPLETE (review mode); lesson state is UNLOCKED or higher |
| **Exit States** | (A) Card 5 CTA "Tiếp tục" → advance to next lesson or MKC banner · (B) Card 5 CTA "Thực hành ngay" → in-app action for lesson topic · (C) User navigates back from Card 1 → return to Grow tab |
| **FR References** | FR-LEARN-03 (card navigation), FR-LEARN-04 (quiz evaluation), FR-LEARN-05 (progress persistence) |
| **IR References** | IR-LEARN-C1 (swipe threshold), IR-LEARN-C2 (Card 1 bounce), IR-LEARN-C3 (quiz evaluation), IR-LEARN-C4 (HintCard), IR-LEARN-C5 (Card 5 completion write), IR-LEARN-C6 (500ms debounce save) |
| **EC References** | EC-C1 (no network), EC-C2 (AsyncStorage write failure), EC-C3 (force-kill recovery), EC-C4 (review mode), EC-C5 (app backgrounded on Card 4) |
| **TC References** | TC-C-01 through TC-C-10 |

---

## 2. Business Flow

```
START: User enters lesson (lesson N.M)
│
├── READ AsyncStorage: f0_lesson_{n}_{m}_card_index → determine start card
│   ├── Key absent / value = 0 → start at Card 1
│   └── Value = 1..4 → resume at that card index
│
├── READ: Is module COMPLETE (review mode)?
│   ├── YES → enter Review Mode (see section 2.5)
│   └── NO → enter Standard Mode
│
│ ═══════════════════════════════════════
│ STANDARD MODE
│ ═══════════════════════════════════════
│
├── RENDER: LessonProgressBar (top of screen, shows N/5 cards)
├── RENDER: ProgressDots (shows current card position)
├── RENDER: Card at current card_index
│
├── CARD NAVIGATION (Cards 1–5):
│   │
│   ├── SWIPE LEFT (advance):
│   │   ├── Threshold: 30% of screen width
│   │   ├── On Card 1/2/3: advance to next card (with exceptions — see Card 4 block)
│   │   ├── On Card 4: BLOCKED — see Card 4 logic below
│   │   └── On Card 5: no card to advance to (forward swipe inactive or bounces)
│   │
│   ├── SWIPE RIGHT (go back):
│   │   ├── On Card 2/3/5: return to previous card
│   │   ├── On Card 1: bounce animation 8px + haptic feedback (no navigation back)
│   │   └── On Card 4: BLOCKED — see Card 4 logic below
│   │
│   └── ON CARD ADVANCE (any card transition):
│       └── WRITE AsyncStorage: f0_lesson_{n}_{m}_card_index = new index
│           (500ms debounce — rapid swipes batch to last index)
│
│ ─────────────────────────────────────
│ CARD 1 — Concept ContentCard
│ ─────────────────────────────────────
│   ├── Swipe LEFT → advance to Card 2 (save index = 1)
│   ├── Swipe RIGHT → bounce 8px + haptic (no navigation — this is the first card boundary)
│   └── Back chevron visible → tap → return to Grow tab
│
│ ─────────────────────────────────────
│ CARD 2 — Example ContentCard
│ ─────────────────────────────────────
│   ├── Swipe LEFT → advance to Card 3 (save index = 2)
│   ├── Swipe RIGHT → return to Card 1 (save index = 0)
│   └── Back chevron hidden (navigation via swipe only within lesson; header back exits lesson)
│
│ ─────────────────────────────────────
│ CARD 3 — Myth-Buster ContentCard
│ ─────────────────────────────────────
│   ├── Swipe LEFT → advance to Card 4 (save index = 3)
│   ├── Swipe RIGHT → return to Card 2 (save index = 1)
│   └── Back chevron hidden
│
│ ─────────────────────────────────────
│ CARD 4 — Quiz QuizCard (lesson variant)
│ ─────────────────────────────────────
│   ├── RENDER: 4 answer options (A–D)
│   ├── RENDER: "Kiểm tra" / "Xác nhận" button (DISABLED, opacity-40, until option selected)
│   ├── Back chevron: HIDDEN (not disabled)
│   ├── System back gesture: DISABLED
│   ├── Swipe RIGHT: BLOCKED (no back navigation on Card 4)
│   │
│   ├── USER TAPS an option:
│   │   └── Option highlighted (selected state)
│   │       → "Kiểm tra" button ENABLED (opacity-100)
│   │
│   ├── USER TAPS "Kiểm tra" / "Xác nhận":
│   │   ├── Evaluate against hardcoded correct answer (client-side)
│   │   │
│   │   ├── CORRECT:
│   │   │   ├── Selected option → quiz-correct-bg (green styling)
│   │   │   ├── "Tiếp theo →" button activates (replaces or enables "Kiểm tra")
│   │   │   └── USER TAPS "Tiếp theo →" → advance to Card 5 (save index = 4)
│   │   │
│   │   └── WRONG:
│   │       ├── Selected option → shake animation 300ms
│   │       ├── Show "Thử lại nhé!" feedback text
│   │       ├── Increment attempt counter (local state)
│   │       ├── Re-enable option selection (options reset for re-try)
│   │       │
│   │       └── ATTEMPT COUNT ≥ 3:
│   │           └── HintCard slides in from right
│   │               ├── Styling: plasma (pause/reflection — not lime)
│   │               ├── Content: hint text relevant to the question
│   │               └── CTA: "Hiểu rồi, thử lại →"
│   │                   └── TAP → HintCard slides out
│   │                          QuizCard returns to view
│   │                          Options reset (attempt counter continues from 3)
│   │                          User may retry unlimited times
│   │
│   └── NOTE: No penalty for wrong answers. No retry limit. Quiz passed = any correct answer.
│
│ ─────────────────────────────────────
│ CARD 5 — CTACard
│ ─────────────────────────────────────
│   ├── Reaching Card 5 triggers:
│   │   ├── WRITE f0_lesson_{n}_{m}_state = COMPLETE
│   │   ├── WRITE f0_lesson_{n}_{m}_card_index = 4
│   │   └── IF this is Lesson 5 in the module:
│   │       └── WRITE f0_module_{n}_state = LESSONS_COMPLETE
│   │
│   ├── RENDER: Two CTAs
│   │   ├── Primary KineticButton lime: "Thực hành ngay"
│   │   │   └── TAP → in-app action specific to lesson topic (e.g. watchlist, search, chart)
│   │   └── Secondary KineticButton ghost: "Tiếp tục →"
│   │       └── TAP:
│   │           ├── IF next lesson exists in module → navigate to L{n}.{m+1} Card 1
│   │           └── IF this was Lesson 5 (last in module) → show MKC banner / navigate to Flow D
│   │
│   ├── Back navigation: available (swipe RIGHT or back chevron → return to Card 4)
│   └── Card 4 in review state after lesson COMPLETE: shows correct answer pre-highlighted
│
│ ═══════════════════════════════════════
│ REVIEW MODE (module COMPLETE, lesson revisited)
│ ═══════════════════════════════════════
│
└── All 5 cards freely navigable (swipe left/right, no restrictions)
    Card 4: correct answer pre-highlighted (quiz-correct-bg), no evaluation
    Card 4: "Kiểm tra" button replaced with "Đúng rồi ✓" (non-interactive indicator)
    "Review" indicator shown in header
    Reaching Card 5: no state writes (lesson already COMPLETE)
    No lesson state changes occur in review mode
```

---

## 3. Acceptance Criteria

**AC-C-01: Card navigation via swipe**
- Given the user is on any card 1–4 (standard mode)
- When the user swipes left past the 30% threshold
- Then the next card is displayed and card index is saved to AsyncStorage

**AC-C-02: Card 1 swipe-right boundary behavior**
- Given the user is on Card 1
- When the user swipes right
- Then the card bounces 8px and haptic feedback fires; no navigation occurs

**AC-C-03: Card 4 back navigation blocked**
- Given the user is on Card 4 (quiz, standard mode, not yet answered correctly)
- When the user attempts to swipe right, tap a back chevron, or use the system back gesture
- Then navigation is blocked; no back chevron is visible

**AC-C-04: Quiz correct answer advances to Card 5**
- Given the user is on Card 4 and selects the correct answer and taps "Kiểm tra"
- When evaluation runs client-side
- Then the option highlights green, "Tiếp theo →" activates, and tapping it advances to Card 5

**AC-C-05: Quiz wrong answer triggers retry with shake**
- Given the user selects a wrong answer and taps "Kiểm tra"
- When evaluation runs
- Then the option shakes (300ms animation) and "Thử lại nhé!" text appears; no navigation

**AC-C-06: HintCard shown after 3 wrong attempts**
- Given the user has made 3 wrong attempts on Card 4
- When the third wrong answer is evaluated
- Then the HintCard slides in from the right with plasma styling

**AC-C-07: HintCard dismissal returns to quiz**
- Given the HintCard is visible
- When the user taps "Hiểu rồi, thử lại →"
- Then the HintCard slides out and the QuizCard is shown with options reset

**AC-C-08: Reaching Card 5 marks lesson COMPLETE**
- Given the user passes the Card 4 quiz and advances to Card 5
- When Card 5 renders
- Then `f0_lesson_{n}_{m}_state` is written to COMPLETE and `f0_lesson_{n}_{m}_card_index` = 4

**AC-C-09: Lesson 5 completion triggers LESSONS_COMPLETE on module**
- Given the user reaches Card 5 of the 5th lesson in a module
- When Card 5 renders
- Then `f0_module_{n}_state` is written to LESSONS_COMPLETE

**AC-C-10: Progress saved with 500ms debounce**
- Given the user rapidly swipes through multiple cards
- When cards transition quickly
- Then `f0_lesson_{n}_{m}_card_index` is written to AsyncStorage with a 500ms debounce (last card index wins)

**AC-C-11: Force-kill recovery resumes at saved card**
- Given the user has viewed up to Card 3 of a lesson (index = 2)
- When the user force-kills the app and relaunches, then navigates back to that lesson
- Then the lesson resumes at Card 3

**AC-C-12: Review mode — all cards freely navigable**
- Given the user revisits a lesson in a COMPLETE module
- When any card is displayed
- Then all swipe navigation is unrestricted (including forward from Card 4 without answering)

**AC-C-13: Review mode — Card 4 shows pre-highlighted correct answer**
- Given review mode is active on Card 4
- When Card 4 renders
- Then the correct answer option is shown in quiz-correct-bg state; no submit button shown

---

## 4. Design Analysis

### 4.1 Screens & Wireframes

| Screen ID | Screen Name | Description | State Variants |
|---|---|---|---|
| SCR-C-01 | Lesson Card View | Full-screen card carousel | Card 1–5 variants |
| SCR-C-02 | Card 1 — Concept | ContentCard with concept explanation | Standard, Boundary bounce state |
| SCR-C-03 | Card 2 — Example | ContentCard with real-world example | Standard |
| SCR-C-04 | Card 3 — Myth-Buster | ContentCard correcting common misconceptions | Standard |
| SCR-C-05 | Card 4 — Quiz | QuizCard with 4 options | Unanswered, Option selected, Correct, Wrong (shake), HintCard overlay |
| SCR-C-06 | Card 5 — CTA | CTACard with two actions | Standard, Lesson complete |
| SCR-C-07 | HintCard | Sliding hint panel (plasma) | Visible, Hidden |
| SCR-C-08 | Review mode | Any card in review mode | Review indicator in header; Card 4 pre-highlighted |

### 4.2 Design Decisions & Rationale

**1. Swipe LEFT to advance, swipe RIGHT to go back**
Horizontal swipe is the natural gesture for card-based content on mobile (consistent with dating apps, story formats, onboarding flows). Left = forward/progress; right = back/review. This is an established mental model requiring no instruction. The 30% threshold prevents accidental navigation on minor horizontal movement during scrolling.

**2. Card 1 swipe-right: bounce + haptic (not silence)**
When the user swipes right on the first card and nothing happens, silence creates confusion ("did the swipe register?"). The 8px bounce and haptic feedback confirm the gesture was registered and communicate "you're at the beginning" — a tactile boundary. This also teaches the swipe gesture mechanics to users on their first card view, creating a learning moment for the navigation paradigm.

**3. Back chevron HIDDEN on Card 4 (not disabled)**
A disabled back button communicates "you cannot go back right now" but keeps the option visible in the user's mental model, potentially creating frustration. Hiding the chevron entirely removes it from consideration — the user's attention stays on the quiz. This is a focused-interaction pattern: the goal is to answer the question, and the UI reflects that singular goal.

**4. "Tiếp theo" button DISABLED (opacity-40) until correct, not hidden**
The button's presence communicates "there is a next step — answer this to proceed." Hiding it would create ambiguity about what happens after the quiz. Disabled state with reduced opacity is an affordance signal: visible but not yet available. This is preferable to hiding because it sets user expectations clearly.

**5. HintCard uses plasma (not lime)**
Lime signals progress, success, and primary actions. The HintCard is a pause moment — a supportive intervention when the user is struggling. Plasma (#D277FF) signals reflection and identity rather than advancement. Using lime here would create cognitive dissonance (hint = help, but lime = go), whereas plasma naturally communicates "take a moment with this."

**6. Unlimited retries, no penalty**
F0 users are novices. Penalizing wrong answers creates anxiety and can cause users to quit the learning path. The goal is comprehension, not assessment. Unlimited retries with positive framing ("Thử lại nhé!") keeps the experience supportive and encourages learning through trial and understanding.

**7. Card 5 has two CTAs (not forced navigation)**
"Thực hành ngay" encourages immediate application of the lesson concept, which reinforces learning. But forcing this action on every user ignores those who want to continue learning without interruption. Two CTAs respect user agency: practice now, or keep going. Neither path is wrong.

**8. 500ms debounce on AsyncStorage card index save**
Rapid swiping can generate many AsyncStorage writes per second. AsyncStorage is not designed for high-frequency writes and excessive calls can cause performance degradation on lower-end devices. The debounce batches rapid transitions into a single write of the final position, protecting performance while ensuring progress is always saved before the user pauses.

**9. Lesson COMPLETE triggered at Card 5 render (not CTA tap)**
If completion required tapping a CTA, a user who reads Card 5 and then closes the app would not receive credit for completing the lesson. Triggering COMPLETE at Card 5 render (when the user has demonstrably consumed all 5 cards including passing the quiz) is the correct semantic boundary.

### 4.3 Component Usage

| Component | Source | Variant | Role |
|---|---|---|---|
| `ContentCard` | Kinetic Drop V2.0 | Concept / Example / Myth-Buster | Cards 1–3 content display |
| `QuizCard` | Kinetic Drop V2.0 | lesson variant (4 options) | Card 4 quiz interaction |
| `CTACard` | Custom (F0 specific) | — | Card 5 completion + action prompts |
| `LessonProgressBar` | Kinetic Drop V2.0 | — | Top-of-screen progress (N/5 cards) |
| `ProgressDots` | Kinetic Drop V2.0 | — | Current card position indicator |
| `KineticButton` | Kinetic Drop V2.0 | lime / primary | Card 5 "Thực hành ngay"; "Tiếp theo →" on correct quiz |
| `KineticButton` | Kinetic Drop V2.0 | ghost / secondary | Card 5 "Tiếp tục →" |
| `KineticButton` | Kinetic Drop V2.0 | disabled (opacity-40) | "Kiểm tra" before option selected |
| HintCard | Custom (F0 specific) | plasma styling | Slide-in hint after 3 wrong attempts |
| Shake animation | React Native Animated | 300ms | Wrong answer feedback on quiz option |
| Bounce animation | React Native Animated | 8px, Card 1 boundary | Swipe-right boundary feedback |
| Haptic feedback | react-native-haptic-feedback | light impact | Card 1 boundary, quiz feedback |

### 4.4 Interaction Rules

| Rule | Trigger | System Response |
|---|---|---|
| IR-C-01 | Swipe left ≥30% screen width (Cards 1–3) | Advance to next card; write card_index to AsyncStorage (500ms debounce) |
| IR-C-02 | Swipe right ≥30% screen width (Cards 2–3) | Return to previous card; write card_index |
| IR-C-03 | Swipe right on Card 1 | Bounce 8px animation + haptic feedback; no navigation |
| IR-C-04 | Swipe right on Card 4 (standard mode) | Block gesture; no navigation |
| IR-C-05 | System back on Card 4 | Disabled; no navigation |
| IR-C-06 | Tap quiz option (Card 4) | Highlight option in selected state; enable "Kiểm tra" button |
| IR-C-07 | Tap "Kiểm tra" — correct answer | Highlight option in quiz-correct-bg; show "Tiếp theo →" button |
| IR-C-08 | Tap "Kiểm tra" — wrong answer | Shake option 300ms; show "Thử lại nhé!"; increment attempt counter |
| IR-C-09 | Wrong attempt count = 3 | HintCard slides in from right (plasma) |
| IR-C-10 | Tap "Hiểu rồi, thử lại →" on HintCard | HintCard slides out; QuizCard shown; options reset |
| IR-C-11 | Tap "Tiếp theo →" after correct answer | Advance to Card 5; write card_index = 4 |
| IR-C-12 | Card 5 renders (standard mode) | Write lesson state = COMPLETE; write card_index = 4; if Lesson 5: write module state = LESSONS_COMPLETE |
| IR-C-13 | Tap "Tiếp tục →" on Card 5 | Navigate to next lesson Card 1 (or MKC if Lesson 5) |
| IR-C-14 | Tap "Thực hành ngay" on Card 5 | Navigate to in-app action for lesson topic |
| IR-C-15 | App launches after force-kill | Read card_index from AsyncStorage; resume lesson at that index |
| IR-C-16 | Enter review mode (module COMPLETE) | All swipe navigation unrestricted; Card 4 shows correct answer pre-highlighted; no state writes |

### 4.5 Edge Cases

| Case | UI Response |
|---|---|
| EC-C-01: No network | No impact — all lesson content is bundled. Lesson experience works fully offline. |
| EC-C-02: AsyncStorage write failure on card advance | Log error silently. Continue lesson flow. Progress may not be saved for that card (acceptable V1 risk). No error shown to user. |
| EC-C-03: Force-kill during Card 4 quiz (mid-answer) | Answer selection (not card index) is component state only. On relaunch: resume at Card 4, options reset. User must re-answer. |
| EC-C-04: App backgrounded during Card 4 (mid-quiz) | Quiz state not saved (it's component state). On return to foreground: quiz state preserved if app not killed. If killed and relaunched: Card 4 shown fresh. |
| EC-C-05: Module already COMPLETE — user re-enters lesson | Review mode. All cards freely navigable. Card 4 shows correct answer pre-highlighted. No state changes. |
| EC-C-06: Rapid swipe through all 5 cards | 500ms debounce ensures last card index is written. Lesson COMPLETE triggered when Card 5 renders (regardless of swipe speed). |
| EC-C-07: "Thực hành ngay" destination not available | If linked in-app destination is unavailable (feature gated, not yet built), navigate to Grow tab as fallback. |
| EC-C-08: User on Card 4, HintCard visible, app backgrounds | On foreground return: HintCard remains visible. State preserved within session. |
| EC-C-09: AsyncStorage write for LESSONS_COMPLETE fails | Log error. Module state may be inconsistent. On next Grow tab mount: validate and re-derive from lesson states. |

---

## 5. Business ↔ Design Alignment

| Business Requirement | Design Implementation | Alignment Status |
|---|---|---|
| Cards navigable via swipe (L/R) | Swipe gesture with 30% threshold; left = advance, right = back | Aligned |
| Card 1 boundary communicates "start" | Bounce + haptic on Card 1 swipe-right | Aligned |
| Card 4 back navigation blocked | Back chevron hidden; system back disabled; swipe right blocked | Aligned |
| Quiz evaluation client-side | Hardcoded correct answers evaluated locally, no API call | Aligned |
| Wrong answer: retry with feedback | Shake animation + "Thử lại nhé!" + unlimited retries | Aligned |
| 3 wrong attempts triggers hint | Attempt counter checked; HintCard slides in at count = 3 | Aligned |
| HintCard uses plasma (pause/reflection) | Plasma styling on HintCard component | Aligned |
| "Tiếp theo" disabled until correct | opacity-40 disabled state; activated only on correct evaluation | Aligned |
| Lesson COMPLETE on Card 5 render | State write triggered at Card 5 render, not on CTA tap | Aligned |
| Progress saved with debounce | 500ms debounce on AsyncStorage write per card advance | Aligned |
| Review mode: no state changes | State writes skipped in review mode; Card 4 pre-highlighted | Aligned |
| Force-kill recovery at last card | card_index read from AsyncStorage on lesson re-entry | Aligned |
| No network needed | All content bundled; AsyncStorage is local | Aligned |

---

## 6. QA Test Cases

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-C-01 | Swipe left advances card | 1. Enter any lesson. 2. Swipe left ≥30% of screen width on Card 1. | Card 2 displayed. LessonProgressBar advances to 2/5. card_index written. | P0 |
| TC-C-02 | Card 1 swipe-right bounce | 1. Enter any lesson (Card 1). 2. Swipe right. | Card 1 bounces 8px. Haptic fires. No navigation occurs. | P0 |
| TC-C-03 | Card 4 back navigation blocked | 1. Advance to Card 4 (pass Cards 1–3). 2. Attempt: swipe right, back chevron, system back. | No navigation back. Back chevron not visible. System back gesture has no effect. | P0 |
| TC-C-04 | Correct quiz answer advances to Card 5 | 1. On Card 4. 2. Select correct answer. 3. Tap "Kiểm tra". 4. Tap "Tiếp theo →". | Correct option highlights green. "Tiếp theo →" activates. Card 5 displayed. | P0 |
| TC-C-05 | Wrong answer shake + retry | 1. On Card 4. 2. Select wrong answer. 3. Tap "Kiểm tra". | Option shakes 300ms. "Thử lại nhé!" appears. User can re-select and retry. No navigation. | P0 |
| TC-C-06 | HintCard after 3 wrong attempts | 1. On Card 4. 2. Submit 3 wrong answers sequentially. | After 3rd wrong answer: HintCard slides in from right with plasma styling. | P0 |
| TC-C-07 | HintCard dismiss returns to quiz | 1. HintCard visible. 2. Tap "Hiểu rồi, thử lại →". | HintCard slides out. QuizCard visible. Options reset. User can try again. | P1 |
| TC-C-08 | Card 5 render writes COMPLETE state | 1. Pass Card 4 quiz. 2. Advance to Card 5. | `f0_lesson_{n}_{m}_state` = COMPLETE written to AsyncStorage. | P0 |
| TC-C-09 | Lesson 5 completion writes LESSONS_COMPLETE | 1. Complete all 4 prior lessons in a module. 2. Complete Lesson 5 (reach Card 5). | `f0_module_{n}_state` = LESSONS_COMPLETE written. | P0 |
| TC-C-10 | Force-kill recovery at saved card | 1. Advance to Card 3. 2. Force-kill app. 3. Relaunch. 4. Navigate to same lesson. | Lesson resumes at Card 3. card_index = 2 read from AsyncStorage. | P0 |
| TC-C-11 | Review mode — Card 4 freely navigable | 1. Complete module (all lessons + MKC). 2. Re-enter a lesson. 3. Swipe to Card 4. | Card 4 navigable without answering. No back block. Correct answer pre-highlighted. | P1 |
| TC-C-12 | 500ms debounce on rapid swipe | 1. Rapidly swipe through Cards 1→2→3 in under 500ms. | AsyncStorage written once (to card_index 2), not 3 times. | P2 |

---

## 7. Design Gaps / Risks

| Gap / Risk | Description | Severity | Recommendation |
|---|---|---|---|
| DG-C-01: "Thực hành ngay" destination spec missing | Card 5 primary CTA routes to an in-app action specific to each lesson topic. These destinations are not yet defined per lesson. | High | Define a destination map for each of the 20 lessons: e.g. Lesson 1.1 → Watchlist, Lesson 1.2 → Market overview. This is a hard dependency for engineering. |
| DG-C-02: HintCard content not specified | Hint text for each of the 20 lesson quizzes is not written. HintCard component is defined but content is missing. | High | Content team to write one hint per quiz (20 total). Hints should explain the concept, not reveal the answer directly. |
| DG-C-03: Quiz correct answers hardcoded | Correct answers for all 20 quizzes are hardcoded in the app bundle. A wrong answer shipped in production requires a full app update. | Medium | Store quiz content + correct answers in a local JSON config file that can be updated via OTA (e.g. Expo OTA or CodePush) without full store release. |
| DG-C-04: App backgrounded on Card 4 mid-quiz | Quiz option selections are component state only. If the OS kills the app in the background, the selected answer is lost. | Low | Acceptable V1 risk. Document in engineering handoff. V2 could save quiz state to AsyncStorage on selection. |
| DG-C-05: No LessonProgressBar spec for review mode | In review mode, should the progress bar show 5/5 (complete) or track current card position? Not defined. | Low | Recommended: show 5/5 complete with review indicator. Do not revert to tracking card position in review mode. |
| DG-C-06: "Kiểm tra" vs "Xác nhận" button label inconsistency | Two labels are referenced in the spec. The button label should be consistent across all 20 quizzes. | Low | Standardize on "Kiểm tra" (check/verify). More idiomatic for quiz contexts in Vietnamese. |
| DG-C-07: Swipe threshold on tablet / large screen | 30% of screen width is significantly larger on tablets. Swipe gesture may feel unresponsive. | Low | Cap the threshold at max 120px regardless of screen width, or use a fixed pixel threshold for large screens. |

---

## 8. Related Documents

### Business Layer
- `01-requirements.md` — F0 Learning Path requirements (FR-LEARN-03, FR-LEARN-04, FR-LEARN-05)
- `flow-b-grow-tab.md` — Grow Tab (entry point to lesson experience; receives updated module state)
- `flow-d-module-completion.md` — Module completion (triggered by Lesson 5 Card 5 render)

### Design Layer
- Kinetic Drop V2.0 Design System — ContentCard, QuizCard, KineticButton, LessonProgressBar, ProgressDots
- Figma: F0 Learning Path screens — Lesson card views (SCR-C-01 through SCR-C-08)

### Engineering Layer
- AsyncStorage key spec: `f0_lesson_{n}_{m}_state` (LOCKED | UNLOCKED | IN_PROGRESS | COMPLETE)
- AsyncStorage key spec: `f0_lesson_{n}_{m}_card_index` (0–4)
- AsyncStorage key spec: `f0_module_{n}_state` (write LESSONS_COMPLETE on Lesson 5 Card 5)
- Swipe gesture handler: 30% screen width threshold (cap at 120px on large screens)
- 500ms debounce implementation: `lodash.debounce` or custom debounce on `AsyncStorage.setItem`
- Haptic feedback: `react-native-haptic-feedback` — `HapticFeedbackTypes.impactLight`
- Quiz answer config: lesson quiz definitions with hardcoded correct answer index (0–3)
- `f0_explore_path_taken` AsyncStorage key (used for LearningPromptCard, managed in Flow B)

# Flow B: Grow Tab — Learning Path Home

**Document version:** 1.0
**Last updated:** 2026-05-29
**Author:** Loanntc
**Architecture:** Frontend-only (AsyncStorage, no backend API)

---

## 1. Flow Summary

| Field | Value |
|---|---|
| **Flow ID** | FLOW-B |
| **Feature Reference** | FR-LEARN-02 |
| **Actor** | F0 trader on Grow tab |
| **Trigger** | User navigates to Grow tab (tab press or deep link) |
| **Precondition** | User account active; app installed |
| **Exit States** | (A) Tap UNLOCKED/IN_PROGRESS module → Lesson Card view · (B) Tap LESSONS_COMPLETE module → MKC · (C) Tap COMPLETE module → Review mode Lesson 1 · (D) Tap LOCKED module → tooltip (no navigation) · (E) All modules COMPLETE → Learning Complete celebration state |
| **FR References** | FR-LEARN-02 |
| **IR References** | IR-LEARN-B1 (AsyncStorage read on mount), IR-LEARN-B2 (skeleton loader), IR-LEARN-B3 (ONE lime rule), IR-LEARN-B4 (LOCKED tooltip) |
| **EC References** | EC-B1 (AsyncStorage read failure), EC-B2 (all modules complete), EC-B3 (first visit no progress), EC-B4 (LearningPromptCard display condition) |
| **TC References** | TC-B-01 through TC-B-08 |

---

## 2. Business Flow

```
START: User navigates to Grow tab
│
├── READ AsyncStorage (on tab mount):
│   ├── f0_module_1_state, f0_module_2_state, f0_module_3_state, f0_module_4_state
│   ├── f0_lesson_{n}_{m}_state (for all 20 lessons — progress calculation)
│   └── f0_explore_path_taken (for LearningPromptCard display condition)
│   │
│   ├── READ in progress (async) → Show skeleton loaders for 400ms (or until data resolves)
│   │
│   └── READ complete → Derive screen state:
│
├── EVALUATE: Did AsyncStorage read fail?
│   ├── YES → Fallback state: M1 = UNLOCKED, M2/M3/M4 = LOCKED (log error silently)
│   └── NO → Use stored states
│
├── EVALUATE: f0_explore_path_taken = true AND f0_module_1_state = UNLOCKED?
│   ├── YES → Show LearningPromptCard above module list
│   └── NO → No LearningPromptCard shown
│
├── RENDER: Overall progress header
│   └── Count lessons with state = COMPLETE across all 20 → display "X/20 bài học"
│
├── RENDER: Module cards (M1 → M4 top to bottom)
│   │
│   ├── MODULE STATE = LOCKED
│   │   ├── Visual: Card grayed out, padlock icon, no CTA button visible
│   │   └── TAP → show tooltip: "Hoàn thành Module [N-1] để mở khóa"
│   │              Tooltip auto-dismisses after 2500ms
│   │              No navigation occurs
│   │
│   ├── MODULE STATE = UNLOCKED
│   │   ├── Visual: Full color card, "Bắt đầu →" KineticButton lime (subject to ONE lime rule)
│   │   └── TAP → navigate to L{n}.1 Card 1
│   │              WRITE f0_module_{n}_state = IN_PROGRESS
│   │
│   ├── MODULE STATE = IN_PROGRESS
│   │   ├── Visual: Full color card, LessonProgressBar (% complete), "Tiếp tục →" KineticButton lime
│   │   │          Progress % = completed lessons / 5 × 100
│   │   └── TAP → read f0_lesson_{n}_{m}_card_index for last IN_PROGRESS lesson
│   │              → navigate to that lesson at saved card index
│   │
│   ├── MODULE STATE = LESSONS_COMPLETE
│   │   ├── Visual: Full color card, checkmark on all 5 lessons, "Làm bài kiểm tra →" KineticButton lime
│   │   └── TAP → navigate to MKC for module N
│   │
│   └── MODULE STATE = COMPLETE
│       ├── Visual: Card with completion indicator (checkmark icon, subtle styling), "Ôn lại →" KineticButton ghost
│       └── TAP → navigate to L{n}.1 Card 1 in review mode
│
├── APPLY ONE LIME RULE:
│   └── Scan visible ModuleCards in viewport
│       ├── If only one actionable module (UNLOCKED/IN_PROGRESS/LESSONS_COMPLETE) is visible → that card gets lime button
│       └── If two actionable modules visible simultaneously (e.g. on large screen or during scroll):
│           └── Highest-priority actionable module keeps lime; lower module uses ghost button
│               Priority: IN_PROGRESS > LESSONS_COMPLETE > UNLOCKED
│
└── EVALUATE: All 4 modules COMPLETE?
    ├── YES → Show "Học xong rồi!" celebration state
    │         Replace module list with completion card
    │         CTA: "Đến Trading →" (KineticButton lime) → navigate to Trade tab
    └── NO → Standard module list display
```

---

## 3. Acceptance Criteria

**AC-B-01: Module states derived from AsyncStorage**
- Given the user navigates to the Grow tab
- When the tab mounts
- Then module states are read from AsyncStorage and ModuleCards reflect current state (LOCKED / UNLOCKED / IN_PROGRESS / LESSONS_COMPLETE / COMPLETE)

**AC-B-02: Skeleton loaders during AsyncStorage read**
- Given the user navigates to the Grow tab
- When AsyncStorage is being read
- Then skeleton placeholder cards are shown for up to 400ms until data resolves

**AC-B-03: M1 always starts UNLOCKED**
- Given a fresh install with no progress
- When the user opens the Grow tab
- Then M1 ModuleCard shows UNLOCKED state with "Bắt đầu →" lime CTA; M2, M3, M4 show LOCKED

**AC-B-04: Module unlocks sequentially**
- Given M1 is COMPLETE
- When the user opens the Grow tab
- Then M2 shows UNLOCKED state; M3 and M4 remain LOCKED

**AC-B-05: LOCKED module tap shows tooltip**
- Given a module is in LOCKED state
- When the user taps that module card
- Then a tooltip "Hoàn thành Module [N-1] để mở khóa" appears and auto-dismisses after 2500ms; no navigation occurs

**AC-B-06: IN_PROGRESS module resumes at saved position**
- Given a module is IN_PROGRESS and the user has viewed Lesson 2 Card 3
- When the user taps "Tiếp tục →" on the ModuleCard
- Then the app navigates to Lesson 2 Card 3 of that module

**AC-B-07: LearningPromptCard shown only for "explore" path users**
- Given the user came via "Khám phá trước" CTA on the Welcome Modal AND M1 is UNLOCKED (not yet started)
- When the user visits the Grow tab
- Then LearningPromptCard is shown above the module list

**AC-B-08: LearningPromptCard hidden once M1 started**
- Given LearningPromptCard is visible (explore path, M1 UNLOCKED)
- When M1 transitions to IN_PROGRESS or higher
- Then LearningPromptCard is no longer shown

**AC-B-09: Overall progress counter reflects completed lessons**
- Given the user has completed 7 of 20 lessons
- When the Grow tab is displayed
- Then the progress header shows "7/20 bài học"

**AC-B-10: Celebration state when all modules COMPLETE**
- Given all 4 modules are in COMPLETE state
- When the user opens the Grow tab
- Then the "Học xong rồi!" celebration state is shown with a CTA to the Trade tab

**AC-B-11: AsyncStorage read failure fallback**
- Given AsyncStorage read throws an error
- When the Grow tab mounts
- Then M1 shows UNLOCKED, M2/M3/M4 show LOCKED (safe fallback); no error screen shown

---

## 4. Design Analysis

### 4.1 Screens & Wireframes

| Screen ID | Screen Name | Description | State Variants |
|---|---|---|---|
| SCR-B-01 | Grow Tab — Learning Path Home | Main learning hub showing all 4 module cards | Loading (skeleton), Default, Celebration (all complete) |
| SCR-B-02 | ModuleCard — LOCKED | Grayed card with padlock | Tooltip visible / Tooltip hidden |
| SCR-B-03 | ModuleCard — UNLOCKED | Full color card, "Bắt đầu →" | Lime button / Ghost button (ONE lime rule) |
| SCR-B-04 | ModuleCard — IN_PROGRESS | Progress bar, "Tiếp tục →" | Lime button / Ghost button (ONE lime rule) |
| SCR-B-05 | ModuleCard — LESSONS_COMPLETE | All lessons done, "Làm bài kiểm tra →" | Lime button / Ghost button (ONE lime rule) |
| SCR-B-06 | ModuleCard — COMPLETE | Completion indicator, "Ôn lại →" | Ghost button only |
| SCR-B-07 | LearningPromptCard | Prompt shown to "explore" path users | Visible / Hidden |
| SCR-B-08 | Celebration state | "Học xong rồi!" when all modules complete | Single state |

### 4.2 Design Decisions & Rationale

**1. All data from AsyncStorage — no loading error state for learning**
Because module and lesson state is stored locally, there is no network dependency and therefore no "failed to load" error state. The only failure mode is an AsyncStorage read error (rare, caused by device storage corruption). This simplifies the UI: the Grow tab never needs to display a network error or retry button for learning content. The fallback (M1 UNLOCKED, rest LOCKED) is always safe and navigable.

**2. Skeleton loaders (400ms) while reading AsyncStorage**
Even though AsyncStorage is local, reading many keys at once has measurable latency on low-end devices. Showing skeleton loaders prevents a visual pop-in effect where cards flash between an empty state and populated state. The 400ms window covers the read in virtually all cases; if read resolves faster, skeletons dismiss immediately.

**3. ONE lime button rule per viewport**
Lime (#CAFD00) is the primary action color in Kinetic Drop V2.0. Multiple lime CTAs in the same viewport creates visual competition and decision paralysis — the user does not know where to focus. By enforcing a single lime button per scroll position, the UI has one clear call to action. COMPLETE modules use ghost buttons (review is optional) and the single lime button belongs to the current actionable module.

**4. LOCKED tap shows tooltip, no navigation**
Navigating to a locked module (even to show a "locked" screen) wastes the user's time and creates confusion. The tooltip confirms the prerequisite in-place without leaving the Grow tab. 2500ms auto-dismiss avoids requiring an explicit close tap.

**5. LearningPromptCard only for "explore" path users**
The LearningPromptCard is a contextual nudge for users who chose to "explore first" and have not yet started M1. Users who came via "Bắt đầu Module 1" are already in the learning flow. Showing the prompt to everyone would be noise. This is a personalized re-engagement mechanism for a specific user segment.

**6. Overall progress shown as X/20 lessons**
Modules have a 5-lesson structure, so 20 total lessons is the natural denominator. Showing raw lesson count (not a percentage) gives users a concrete sense of progress ("7 more lessons") rather than an abstract percentage that may feel slow to move. This is especially important in the early modules when percentages are small.

**7. Module state derived synchronously from stored keys**
Module state is not derived from lesson states at read time (it is stored explicitly as its own key). This prevents having to load and evaluate all 20 lesson states just to render the 4 module cards. Module state is written when transitions occur (in Flow C and Flow D). The Grow tab is therefore fast to render.

**8. Celebration state replaces module list when all complete**
When learning is done, continuing to show the full module list serves no purpose — the user has no actionable steps remaining in learning. The celebration state acknowledges their achievement and redirects momentum to the Trade tab, which is the natural next phase for a trained F0 user.

### 4.3 Component Usage

| Component | Source | Variant | Role |
|---|---|---|---|
| `ModuleCard` | Kinetic Drop V2.0 | LOCKED / UNLOCKED / IN_PROGRESS / LESSONS_COMPLETE / COMPLETE | Displays each module's state and CTA |
| `KineticButton` | Kinetic Drop V2.0 | lime / primary | Primary CTA on highest-priority actionable module |
| `KineticButton` | Kinetic Drop V2.0 | ghost / secondary | CTA on secondary modules or review action |
| `LessonProgressBar` | Kinetic Drop V2.0 | — | Shows % completion within IN_PROGRESS module card |
| `LearningPromptCard` | Custom (F0 specific) | — | Contextual nudge for "explore" path users |
| Skeleton loader | Custom / platform | — | Placeholder during AsyncStorage read (400ms) |
| Tooltip | Custom | auto-dismiss 2500ms | LOCKED module tap feedback |
| Padlock icon | Icon set | — | Visual indicator of LOCKED state |
| Checkmark icon | Icon set | — | Visual indicator of COMPLETE state |
| Celebration card | Custom (F0 specific) | — | "Học xong rồi!" state when all modules done |

### 4.4 Interaction Rules

| Rule | Trigger | System Response |
|---|---|---|
| IR-B-01 | Grow tab mounts | Read all module + lesson state keys from AsyncStorage; show skeletons during read |
| IR-B-02 | AsyncStorage read resolves | Replace skeletons with ModuleCards using read state |
| IR-B-03 | AsyncStorage read fails | Show fallback: M1 UNLOCKED, M2/M3/M4 LOCKED; log error |
| IR-B-04 | Tap LOCKED ModuleCard | Show in-place tooltip with prerequisite message; no navigation |
| IR-B-05 | Tooltip shown | Auto-dismiss after 2500ms |
| IR-B-06 | Tap UNLOCKED ModuleCard | Navigate to L{n}.1 Card 1; write module state = IN_PROGRESS |
| IR-B-07 | Tap IN_PROGRESS ModuleCard | Read saved card index for current lesson; navigate to resume point |
| IR-B-08 | Tap LESSONS_COMPLETE ModuleCard | Navigate to MKC for that module |
| IR-B-09 | Tap COMPLETE ModuleCard | Navigate to L{n}.1 Card 1 in review mode |
| IR-B-10 | Two actionable modules in viewport | Apply ONE lime rule: highest priority keeps lime, lower gets ghost |
| IR-B-11 | Tab mounts, all modules COMPLETE | Show celebration state instead of module list |
| IR-B-12 | Grow tab mounts, explore path + M1 UNLOCKED | Show LearningPromptCard above module list |
| IR-B-13 | M1 transitions to IN_PROGRESS or higher | Remove LearningPromptCard |

### 4.5 Edge Cases

| Case | UI Response |
|---|---|
| EC-B-01: AsyncStorage read fails entirely | Fallback to M1 UNLOCKED, M2/M3/M4 LOCKED. No error banner. Log error to analytics. |
| EC-B-02: All 4 modules COMPLETE | Show "Học xong rồi!" celebration state. Replace module list. CTA to Trade tab. |
| EC-B-03: First Grow tab visit, no prior progress | M1 UNLOCKED, M2/M3/M4 LOCKED. No LearningPromptCard (user came via "Bắt đầu", not "Khám phá"). |
| EC-B-04: Two modules with lime buttons in viewport (large device) | ONE lime rule: IN_PROGRESS > LESSONS_COMPLETE > UNLOCKED priority. Lower module gets ghost. |
| EC-B-05: AsyncStorage read is very slow (>400ms) | Skeleton loaders persist until read resolves. No timeout/error state — local reads are assumed to complete. |
| EC-B-06: User navigates away from Grow tab mid-tooltip | Tooltip dismissed immediately on tab blur. |
| EC-B-07: User taps LearningPromptCard CTA | Navigate to L1.1 Card 1 (same as primary Welcome Modal CTA). Write M1 = IN_PROGRESS. |
| EC-B-08: Module state and lesson state are inconsistent (e.g. crash during write) | On Grow tab mount, re-derive module state from lesson completion counts. Apply correction silently. |

---

## 5. Business ↔ Design Alignment

| Business Requirement | Design Implementation | Alignment Status |
|---|---|---|
| Show 4 modules with correct state | ModuleCards derived from AsyncStorage on mount | Aligned |
| Sequential module unlock | M{n} UNLOCKED only when M{n-1} COMPLETE; LOCKED state blocks navigation | Aligned |
| ONE primary CTA in viewport | ONE lime button rule applied to visible cards | Aligned |
| LOCKED modules not navigable | LOCKED tap shows tooltip only, no navigation | Aligned |
| Resume at saved position for IN_PROGRESS | card_index read from AsyncStorage on resume | Aligned |
| LearningPromptCard for explore-path users only | Display gated on `f0_explore_path_taken` flag + M1 UNLOCKED | Aligned |
| Progress visible as lessons completed | X/20 header derived from lesson state counts | Aligned |
| Celebration state for completion | "Học xong rồi!" replaces module list when all 4 COMPLETE | Aligned |
| No API calls for learning data | All state from AsyncStorage only | Aligned |
| Graceful degradation on read failure | Safe fallback state (M1 UNLOCKED) with silent error logging | Aligned |

---

## 6. QA Test Cases

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-B-01 | Fresh install — M1 UNLOCKED, rest LOCKED | 1. Fresh install. 2. Navigate to Grow tab. | M1 card shows UNLOCKED with "Bắt đầu →". M2/M3/M4 show LOCKED with padlock. | P0 |
| TC-B-02 | LOCKED tap shows tooltip, no navigation | 1. Grow tab open, M2 LOCKED. 2. Tap M2 card. | Tooltip "Hoàn thành Module 1 để mở khóa" appears. No navigation. Tooltip auto-dismisses after 2500ms. | P0 |
| TC-B-03 | IN_PROGRESS resumes at correct card | 1. Start M1 L1 (in progress at Card 3). 2. Exit to Grow tab. 3. Tap "Tiếp tục →" on M1. | App navigates to L1.1 Card 3 (saved position). | P0 |
| TC-B-04 | Module unlocks when prerequisite complete | 1. Complete M1 (all lessons + MKC). 2. Navigate to Grow tab. | M2 shows UNLOCKED with "Bắt đầu →". M3/M4 remain LOCKED. | P0 |
| TC-B-05 | Skeleton loaders on tab mount | 1. Navigate to Grow tab (cold). | Skeleton placeholder cards visible briefly (up to 400ms) before content loads. | P1 |
| TC-B-06 | LearningPromptCard shown for explore path | 1. Welcome modal: tap "Khám phá trước". 2. Navigate to Grow tab. | LearningPromptCard visible above M1 card. M1 still UNLOCKED (not started). | P1 |
| TC-B-07 | LearningPromptCard hidden after M1 starts | 1. "Khám phá" path: LearningPromptCard visible. 2. Tap M1 "Bắt đầu →". 3. Start lesson. 4. Return to Grow tab. | LearningPromptCard no longer visible. M1 shows IN_PROGRESS. | P1 |
| TC-B-08 | Celebration state when all modules complete | 1. Complete M1, M2, M3, M4 (all MKCs passed). 2. Navigate to Grow tab. | "Học xong rồi!" celebration state shown. "Đến Trading →" CTA visible. Module list replaced. | P1 |
| TC-B-09 | AsyncStorage read failure fallback | 1. Simulate AsyncStorage read failure. 2. Navigate to Grow tab. | M1 shows UNLOCKED, M2/M3/M4 LOCKED. No error screen. Error logged. | P1 |
| TC-B-10 | ONE lime rule — two modules in viewport | 1. Set M1 = IN_PROGRESS, M2 = UNLOCKED. 2. View both on screen simultaneously. | M1 (IN_PROGRESS, higher priority) has lime button. M2 (UNLOCKED) has ghost button. | P2 |

---

## 7. Design Gaps / Risks

| Gap / Risk | Description | Severity | Recommendation |
|---|---|---|---|
| DG-B-01: ONE lime rule scroll behavior | As user scrolls, which module is "in viewport" changes. Button variants could flicker as new cards enter/leave viewport. | Medium | Calculate ONE lime assignment on initial render from stored state, not dynamically on scroll. |
| DG-B-02: Resume destination ambiguity for IN_PROGRESS | If user has multiple IN_PROGRESS lessons (partial saves), the Grow tab needs a clear rule for which lesson to resume. | Medium | Always resume the highest-numbered IN_PROGRESS lesson in the module. Document this rule explicitly in engineering spec. |
| DG-B-03: AsyncStorage read performance on low-end devices | Reading 20+ keys on tab mount may exceed 400ms skeleton threshold on very low-end Android devices. | Low | Batch read using `AsyncStorage.multiGet` for all lesson keys in one call instead of individual reads. |
| DG-B-04: Module state / lesson state inconsistency on crash | If app crashes during a module state write, stored module state may not match lesson completion data. | Medium | On Grow tab mount, validate module state against lesson states. If inconsistent, re-derive and correct silently. |
| DG-B-05: LearningPromptCard copy not specified | The prompt card copy (headline, body, CTA text) is not defined in this spec. | Low | UX writer to define copy. Suggested: "Bắt đầu hành trình đầu tư của bạn" / "Module 1 đang chờ bạn" / "Bắt đầu ngay →". |
| DG-B-06: Celebration state CTA placement | "Đến Trading →" CTA on celebration state implies user is ready to trade, but they may not have set up a trading account yet. | Medium | Check account setup status before navigating to Trade tab; show account setup flow if not complete. |

---

## 8. Related Documents

### Business Layer
- `01-requirements.md` — F0 Learning Path requirements (FR-LEARN-02)
- `flow-a-welcome-modal.md` — Welcome Modal (upstream; sets explore path flag)
- `flow-c-lesson-experience.md` — Lesson experience (destination of module card taps)
- `flow-d-module-completion.md` — Module completion (source of state transitions reflected here)

### Design Layer
- Kinetic Drop V2.0 Design System — ModuleCard, KineticButton, LessonProgressBar, components
- Figma: F0 Learning Path screens — Grow Tab (SCR-B-01 through SCR-B-08)

### Engineering Layer
- AsyncStorage key spec: `f0_module_{n}_state` (LOCKED | UNLOCKED | IN_PROGRESS | LESSONS_COMPLETE | COMPLETE)
- AsyncStorage key spec: `f0_lesson_{n}_{m}_state` (for progress calculation)
- AsyncStorage key spec: `f0_lesson_{n}_{m}_card_index` (for resume position)
- AsyncStorage key spec: `f0_explore_path_taken` (boolean, LearningPromptCard gate)
- `AsyncStorage.multiGet` for batched reads on tab mount

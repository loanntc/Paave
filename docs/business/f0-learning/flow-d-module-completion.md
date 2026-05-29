# Flow D: Module Completion

**Document version:** 1.0
**Last updated:** 2026-05-29
**Author:** Loanntc
**Architecture:** Frontend-only (AsyncStorage, no backend API)

> **NOTE: NO REWARDS in this version.**
> XP, badges, and bonus cash are removed. This flow handles module completion as a pure state transition with minimal, honest feedback.

---

## 1. Flow Summary

| Field | Value |
|---|---|
| **Flow ID** | FLOW-D |
| **Feature Reference** | FR-LEARN-06 |
| **Actor** | F0 trader who has completed all 5 lessons in a module |
| **Trigger** | Card 5 of Lesson 5 in a module is rendered (lesson state = COMPLETE written) |
| **Precondition** | All 5 lessons in module N are COMPLETE; module state has just been written to LESSONS_COMPLETE |
| **Exit States** | (A) User taps MKC banner → MKC starts · (B) User dismisses/ignores banner → stays on Card 5 · (C) User re-accesses MKC via ModuleCard (LESSONS_COMPLETE state) · (D) MKC passed → module state = COMPLETE → next module UNLOCKED (M1–M3) OR Learning Path COMPLETE (M4) |
| **FR References** | FR-LEARN-06 |
| **IR References** | IR-LEARN-D1 (LESSONS_COMPLETE write), IR-LEARN-D2 (MKC banner), IR-LEARN-D3 (toast on pass), IR-LEARN-D4 (module state = COMPLETE write), IR-LEARN-D5 (next module unlock) |
| **EC References** | EC-D1 (force-kill before MKC), EC-D2 (MKC crash before state write), EC-D3 (M4 completion) |
| **TC References** | TC-D-01 through TC-D-08 |

---

## 2. Business Flow

```
START: Card 5 of Lesson 5 of Module N renders
│
├── System writes (triggered by Flow C, Card 5 render):
│   ├── WRITE f0_lesson_{n}_5_state = COMPLETE
│   ├── WRITE f0_lesson_{n}_5_card_index = 4
│   └── WRITE f0_module_{n}_state = LESSONS_COMPLETE
│
├── RENDER: Card 5 CTACard (Lesson 5 content — "Tiếp tục →" CTA visible)
│
├── DELAY: Brief moment for user to read Card 5
│   └── SHOW: MKC Banner overlay / bottom sheet
│            Content: "Bạn đã hoàn thành tất cả bài học! Làm bài kiểm tra ngay?"
│            CTA (lime): "Làm bài kiểm tra ngay →"
│            Dismiss option: available (user can swipe down or tap outside)
│
├── USER ACTION on MKC Banner:
│   │
│   ├── TAPS "Làm bài kiểm tra ngay →"
│   │   └── Navigate to MKC (Module Knowledge Check) for Module N
│   │       ── See MKC flow (Flow E) for full quiz logic ──
│   │       │
│   │       └── MKC RESULT:
│   │           │
│   │           ├── PASS (score ≥ 3/5):
│   │           │   ├── WRITE f0_module_{n}_state = COMPLETE
│   │           │   ├── SHOW: Toast "Module N Hoàn Thành! 🎓" (500ms, auto-dismiss)
│   │           │   │
│   │           │   ├── IS THIS M1, M2, or M3?
│   │           │   │   ├── YES → WRITE f0_module_{n+1}_state = UNLOCKED
│   │           │   │   │         Auto-navigate to L{n+1}.1 Card 1
│   │           │   │   │         (Learning momentum: no pause screen)
│   │           │   │   │
│   │           │   │   └── NO (this is M4, last module):
│   │           │   │         Navigate to Learning Path Complete screen (Flow G)
│   │           │   │
│   │           │   └── [State propagates to Grow tab on next visit]
│   │           │
│   │           └── FAIL (score < 3/5):
│   │               ├── Show MKC result screen with score + encouragement
│   │               ├── CTA: "Ôn lại bài học →" → navigate back to L{n}.1 in review mode
│   │               ├── CTA: "Làm lại →" → restart MKC immediately
│   │               └── Module state stays LESSONS_COMPLETE (not COMPLETE)
│   │
│   └── DISMISSES banner (swipes down or taps outside):
│       ├── Banner dismissed
│       ├── User remains on Card 5 of Lesson 5
│       ├── Module state stays LESSONS_COMPLETE
│       └── MKC accessible later via ModuleCard ("Làm bài kiểm tra →" CTA)
│           on the Grow tab (see Flow B)
│
└── RE-ENTRY PATH (user dismissed banner, returns later):
    ├── User navigates to Grow tab
    ├── Module N shows LESSONS_COMPLETE state
    ├── ModuleCard CTA: "Làm bài kiểm tra →" (lime)
    └── TAP → Navigate to MKC for Module N → same MKC flow as above
```

---

## 3. Acceptance Criteria

**AC-D-01: LESSONS_COMPLETE written on Lesson 5 Card 5 render**
- Given the user has completed Lessons 1–4 of a module and now reaches Card 5 of Lesson 5
- When Card 5 renders
- Then `f0_module_{n}_state` is written to LESSONS_COMPLETE

**AC-D-02: MKC banner appears on Lesson 5 Card 5**
- Given module state is now LESSONS_COMPLETE (all 5 lessons done)
- When Card 5 of Lesson 5 renders
- Then the MKC banner/bottom sheet appears prompting the user to take the module check

**AC-D-03: MKC banner dismissible**
- Given the MKC banner is shown on Lesson 5 Card 5
- When the user swipes down or taps outside the banner
- Then the banner is dismissed; the user remains on Card 5; module state remains LESSONS_COMPLETE

**AC-D-04: MKC accessible via ModuleCard after banner dismissed**
- Given the user dismissed the MKC banner and navigated away
- When the user returns to the Grow tab
- Then Module N's card shows LESSONS_COMPLETE state with "Làm bài kiểm tra →" lime CTA

**AC-D-05: MKC pass writes module COMPLETE and shows toast**
- Given the user takes the MKC and passes (score ≥ 3/5)
- When the pass result is evaluated
- Then `f0_module_{n}_state` is written to COMPLETE and a "Module N Hoàn Thành! 🎓" toast appears for 500ms

**AC-D-06: MKC pass on M1/M2/M3 unlocks next module**
- Given the user passes the MKC for Module 1, 2, or 3
- When module state is written to COMPLETE
- Then the next module's state is written to UNLOCKED and the app auto-navigates to L{n+1}.1 Card 1

**AC-D-07: MKC pass on M4 navigates to Learning Path Complete**
- Given the user passes the MKC for Module 4 (last module)
- When module state is written to COMPLETE
- Then the app navigates to the Learning Path Complete screen (Flow G)

**AC-D-08: MKC fail — module stays LESSONS_COMPLETE**
- Given the user takes the MKC and fails (score < 3/5)
- When the fail result is shown
- Then `f0_module_{n}_state` remains LESSONS_COMPLETE; options to review lessons or retry MKC are presented

**AC-D-09: Force-kill before MKC — LESSONS_COMPLETE persists**
- Given the module is in LESSONS_COMPLETE state and the user force-kills the app before taking the MKC
- When the user relaunches
- Then the Grow tab shows the module as LESSONS_COMPLETE with "Làm bài kiểm tra →" CTA; MKC can be accessed

**AC-D-10: No reward screen on module completion**
- Given the user passes the MKC for any module
- When the completion is processed
- Then NO reward screen, badge display, XP award, or bonus cash notification is shown

---

## 4. Design Analysis

### 4.1 Screens & Wireframes

| Screen ID | Screen Name | Description | State Variants |
|---|---|---|---|
| SCR-D-01 | Lesson 5 Card 5 with MKC Banner | Card 5 CTACard with MKC bottom sheet overlay | Banner visible / Banner dismissed |
| SCR-D-02 | MKC Quiz screen | Module Knowledge Check quiz (5 questions) | Unanswered / In progress / Pass / Fail |
| SCR-D-03 | MKC Pass result | Pass state with toast + auto-navigate | M1/M2/M3 (next module) / M4 (learning complete) |
| SCR-D-04 | MKC Fail result | Fail state with encouragement + retry/review options | Single state |
| SCR-D-05 | Grow Tab post-completion | Grow tab with module N showing COMPLETE, module N+1 showing UNLOCKED | Per module combination |

### 4.2 Design Decisions & Rationale

**1. MKC banner appears on Lesson 5 Card 5 — not as a separate screen**
Navigating the user to a dedicated "all lessons complete" screen before the MKC creates an extra step and breaks momentum. Showing the MKC banner as an overlay on Card 5 maintains context (the user just finished a lesson, energy is high) and reduces friction. The natural next action ("Làm bài kiểm tra ngay →") is immediately available.

**2. MKC banner is dismissible**
Forcing the user into the MKC immediately after Lesson 5 does not respect their readiness. A user might want to review earlier lessons before testing themselves, or might be in a time-constrained session. Allowing dismissal and providing re-access via the ModuleCard ensures the MKC is always accessible without being coercive.

**3. No reward screen — toast only (500ms)**
There are no rewards in this version (no XP, badges, or bonus cash). Showing a dedicated reward screen for a completion that has no reward would be misleading and hollow. A brief toast notification ("Module N Hoàn Thành! 🎓") acknowledges the achievement honestly without overstating it. This is more respectful than a full screen of empty ceremony.

**4. Auto-navigate to next module's first lesson (M1–M3)**
After passing the MKC, the logical next step is clear: start the next module. Auto-navigation maintains learning momentum and removes the decision of "what do I do now?" The toast provides brief acknowledgment during the transition. This is not about preventing user control — the user can navigate elsewhere from L{n+1}.1 Card 1 at any time.

**5. No auto-navigate for M4 — goes to Learning Path Complete screen**
After completing the entire learning path (M4 MKC pass), the user has reached a qualitatively different milestone. There is no "next module." A dedicated Learning Path Complete screen is warranted here — it marks the end of the F0 journey and transitions the user toward actual trading. This is the one place in the completion flow where a dedicated screen makes sense.

**6. MKC fail shows review + retry options**
Failing the MKC is not a dead end. The user has two constructive options: review the lessons they found difficult, or retry the MKC immediately. Both options are presented without judgment. The copy on the fail screen uses encouragement framing, not failure framing.

**7. Module state transition (LESSONS_COMPLETE → COMPLETE) written only on MKC pass**
The distinction between LESSONS_COMPLETE and COMPLETE is meaningful: LESSONS_COMPLETE means the user has read all content but has not demonstrated understanding. COMPLETE means they have passed the knowledge check. These are different levels of achievement and the state machine reflects this. Writing COMPLETE prematurely (e.g. on MKC start) would misrepresent the user's progress.

**8. Re-derive module state on relaunch if inconsistency detected**
If the app crashes during or immediately after a MKC pass (before module state is written), the stored state will be LESSONS_COMPLETE but all lessons will be COMPLETE. On Grow tab mount, if all lessons are COMPLETE but module state is not COMPLETE, the system re-checks and corrects. This defensive recovery prevents users from being stuck in a state they cannot progress out of.

### 4.3 Component Usage

| Component | Source | Variant | Role |
|---|---|---|---|
| `MKCCooldownBanner` | Kinetic Drop V2.0 | active (no cooldown in this context) | Prompt to take MKC after Lesson 5 completion |
| `KineticButton` | Kinetic Drop V2.0 | lime / primary | "Làm bài kiểm tra ngay →" on MKC banner |
| `KineticButton` | Kinetic Drop V2.0 | ghost / secondary | "Ôn lại bài học →" on MKC fail screen |
| `KineticButton` | Kinetic Drop V2.0 | lime / primary | "Làm lại →" on MKC fail screen |
| Toast notification | Custom / react-native-toast | — | "Module N Hoàn Thành! 🎓" on MKC pass (500ms) |
| Bottom sheet | react-native-bottom-sheet | — | MKC banner overlay on Card 5 |
| `PlacementQuizCard` | Kinetic Drop V2.0 | MKC variant (5 questions, ≥3/5 pass) | Module Knowledge Check questions |

### 4.4 Interaction Rules

| Rule | Trigger | System Response |
|---|---|---|
| IR-D-01 | Card 5 of Lesson 5 renders | Write module state = LESSONS_COMPLETE; show MKC banner |
| IR-D-02 | User taps "Làm bài kiểm tra ngay →" on banner | Dismiss banner; navigate to MKC screen for module N |
| IR-D-03 | User dismisses MKC banner | Dismiss banner; user stays on Card 5; module stays LESSONS_COMPLETE |
| IR-D-04 | MKC score ≥ 3/5 | Write module state = COMPLETE; show "Module N Hoàn Thành! 🎓" toast (500ms) |
| IR-D-05 | MKC pass on M1/M2/M3 | Write next module state = UNLOCKED; auto-navigate to L{n+1}.1 Card 1 |
| IR-D-06 | MKC pass on M4 | Navigate to Learning Path Complete screen |
| IR-D-07 | MKC score < 3/5 | Show fail result screen; module stays LESSONS_COMPLETE |
| IR-D-08 | Tap "Ôn lại bài học →" on fail screen | Navigate to L{n}.1 Card 1 in review mode |
| IR-D-09 | Tap "Làm lại →" on fail screen | Restart MKC for module N |
| IR-D-10 | Grow tab mounts, all lesson states COMPLETE but module state ≠ COMPLETE | Re-derive module state; write COMPLETE if all lessons verified complete |

### 4.5 Edge Cases

| Case | UI Response |
|---|---|
| EC-D-01: Force-kill on Lesson 5 Card 5 before MKC | Module state = LESSONS_COMPLETE is written at Card 5 render. On relaunch: Grow tab shows LESSONS_COMPLETE; "Làm bài kiểm tra →" CTA available. |
| EC-D-02: App crashes during MKC pass state write | Module state may remain LESSONS_COMPLETE. On Grow tab mount: validate all 5 lesson states COMPLETE; if so, re-write module state = COMPLETE and unlock next module. |
| EC-D-03: User taps "Làm lại →" on fail screen multiple times | MKC is restartable unlimited times. No cooldown in this version. Each attempt is independent. |
| EC-D-04: User completes Lesson 5, banner shown, taps "Thực hành ngay" on Card 5 | "Thực hành ngay" navigates to in-app action. MKC banner was already shown; when user returns to Grow tab, ModuleCard shows LESSONS_COMPLETE with MKC CTA. |
| EC-D-05: M4 MKC pass — app crashes before Learning Complete screen loads | Module state = COMPLETE written; all 4 modules COMPLETE. On relaunch: Grow tab shows celebration state. Learning Path Complete screen accessible from there. |
| EC-D-06: MKC starts but user exits mid-quiz | Module state stays LESSONS_COMPLETE. MKC answers (in-progress) are discarded. User must restart MKC from beginning. |
| EC-D-07: Next module already UNLOCKED (e.g. due to recovery write) | Write is idempotent — writing UNLOCKED to an already-UNLOCKED state has no effect. Auto-navigate proceeds normally. |

---

## 5. Business ↔ Design Alignment

| Business Requirement | Design Implementation | Alignment Status |
|---|---|---|
| LESSONS_COMPLETE written when all 5 lessons done | Written at Card 5 render of Lesson 5 | Aligned |
| MKC entry prompted naturally after Lesson 5 | MKC banner shown on Lesson 5 Card 5 | Aligned |
| MKC re-accessible if dismissed | ModuleCard shows "Làm bài kiểm tra →" in LESSONS_COMPLETE state | Aligned |
| Module COMPLETE only on MKC pass (≥3/5) | State write triggered only on pass result | Aligned |
| Next module unlocks on COMPLETE (M1–M3) | UNLOCKED written to next module on pass | Aligned |
| M4 complete → Learning Path complete screen | Navigate to Flow G on M4 MKC pass | Aligned |
| No reward screen, no XP, no badges | No reward screen anywhere in flow; toast only | Aligned |
| Brief toast on completion | "Module N Hoàn Thành! 🎓" 500ms auto-dismiss | Aligned |
| Auto-navigate to next module for momentum | Auto-navigate to L{n+1}.1 Card 1 on M1–M3 pass | Aligned |
| MKC fail: retry and review available | Fail screen shows both "Ôn lại" and "Làm lại" CTAs | Aligned |
| Crash recovery for state inconsistency | Grow tab re-derives module state from lesson completion | Aligned |

---

## 6. QA Test Cases

| TC ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| TC-D-01 | Lesson 5 completion triggers LESSONS_COMPLETE | 1. Complete Lessons 1–4 of Module 1. 2. Complete Lesson 5 (pass Card 4, reach Card 5). | `f0_module_1_state` = LESSONS_COMPLETE written. MKC banner appears on Card 5. | P0 |
| TC-D-02 | MKC banner tappable — navigates to MKC | 1. Lesson 5 Card 5 with MKC banner. 2. Tap "Làm bài kiểm tra ngay →". | Banner dismissed. MKC screen for Module 1 shown. | P0 |
| TC-D-03 | MKC banner dismissible — LESSONS_COMPLETE persists | 1. Lesson 5 Card 5 with MKC banner. 2. Dismiss banner. 3. Navigate to Grow tab. | Banner dismissed. Module 1 card shows LESSONS_COMPLETE with "Làm bài kiểm tra →" CTA. | P0 |
| TC-D-04 | MKC pass writes COMPLETE + shows toast | 1. Enter MKC for Module 1. 2. Answer ≥3/5 correctly. | `f0_module_1_state` = COMPLETE. Toast "Module 1 Hoàn Thành! 🎓" appears for ~500ms. | P0 |
| TC-D-05 | MKC pass on M1 unlocks M2 | 1. Pass MKC for Module 1. 2. Navigate to Grow tab. | Module 2 card shows UNLOCKED with "Bắt đầu →". Module 1 shows COMPLETE with "Ôn lại →". | P0 |
| TC-D-06 | MKC fail — module stays LESSONS_COMPLETE | 1. Enter MKC for Module 1. 2. Answer ≤2/5 correctly. | Module 1 state remains LESSONS_COMPLETE. Fail screen shows score + "Ôn lại bài học →" + "Làm lại →". | P0 |
| TC-D-07 | Force-kill before MKC — LESSONS_COMPLETE accessible on relaunch | 1. Reach Lesson 5 Card 5 (LESSONS_COMPLETE written). 2. Force-kill. 3. Relaunch. 4. Navigate to Grow tab. | Module 1 shows LESSONS_COMPLETE. "Làm bài kiểm tra →" CTA available. MKC can be started. | P0 |
| TC-D-08 | M4 MKC pass navigates to Learning Complete | 1. Complete M1–M3 (all MKCs). 2. Complete M4 Lesson 5. 3. Take M4 MKC, pass. | `f0_module_4_state` = COMPLETE. App navigates to Learning Path Complete screen. | P0 |
| TC-D-09 | Crash recovery — module re-derives to COMPLETE | 1. Simulate: all 5 lessons COMPLETE but module state stuck at LESSONS_COMPLETE. 2. Navigate to Grow tab. | Grow tab detects inconsistency; writes module state = COMPLETE; next module unlocked. | P1 |
| TC-D-10 | No reward screen on module completion | 1. Pass any MKC. | No reward screen, no XP display, no badge shown. Only toast notification. | P0 |

---

## 7. Design Gaps / Risks

| Gap / Risk | Description | Severity | Recommendation |
|---|---|---|---|
| DG-D-01: MKC question content not specified | The 5 questions per module for the MKC are not defined in this spec. Each module needs 5 questions with correct answers and 4 options each. | High | Content team to write 20 MKC questions (5 per module). These are a hard dependency for engineering to implement the quiz. |
| DG-D-02: Learning Path Complete screen (Flow G) not defined | This flow references "Flow G: Learning Path Complete" but that document does not yet exist. | High | Create Flow G spec defining the Learning Complete screen content, CTAs, and navigation. |
| DG-D-03: MKC banner timing | "Brief moment" before MKC banner appears is not precisely defined. If the banner appears instantly on Card 5 render, it may feel abrupt. | Medium | Define a delay: suggest 800ms after Card 5 renders before banner animates in. Gives user time to read Card 5 content first. |
| DG-D-04: MKC pass threshold not adjustable | Pass threshold (≥3/5) is hardcoded. If the threshold needs tuning based on analytics (e.g. too many users failing), it requires an app update. | Low | Store MKC config (question count, pass threshold) in the same local JSON config as quiz questions, updatable via OTA. |
| DG-D-05: Toast content per module | "Module N Hoàn Thành! 🎓" is a template. The actual module names (e.g. "Cổ phiếu cơ bản", "Phân tích kỹ thuật") should be used for a more personal acknowledgment. | Low | Use actual module display names in toast: e.g. "Module 1: Cổ phiếu cơ bản — Hoàn thành! 🎓". |
| DG-D-06: Auto-navigate to next module may feel jarring | After MKC pass, immediately navigating to the next module's first lesson gives the user no pause. Some users may want to stop. | Low | Add a 1000ms pause showing the toast before auto-navigating, giving users a moment to register the completion before transitioning. |
| DG-D-07: MKC mid-quiz exit — progress lost | Exiting the MKC mid-quiz discards all answers. No warning is shown to the user. | Medium | Show a confirmation dialog on back/exit from MKC mid-quiz: "Bạn có chắc muốn thoát? Tiến trình làm bài sẽ không được lưu." |

---

## 8. Related Documents

### Business Layer
- `01-requirements.md` — F0 Learning Path requirements (FR-LEARN-06)
- `flow-c-lesson-experience.md` — Lesson experience (triggers LESSONS_COMPLETE when Lesson 5 Card 5 is reached)
- `flow-b-grow-tab.md` — Grow Tab (reflects COMPLETE + next module UNLOCKED states)

### Design Layer
- Kinetic Drop V2.0 Design System — MKCCooldownBanner, PlacementQuizCard (MKC variant), KineticButton
- Figma: F0 Learning Path screens — Module completion (SCR-D-01 through SCR-D-05)

### Engineering Layer
- AsyncStorage key spec: `f0_module_{n}_state` (LESSONS_COMPLETE → COMPLETE on MKC pass)
- AsyncStorage key spec: `f0_lesson_{n}_{m}_state` (read for crash recovery validation)
- MKC pass logic: score ≥ 3/5 (5 questions per module, configurable via local JSON)
- Toast duration: 500ms auto-dismiss
- Auto-navigate delay: 1000ms post-toast before transitioning to L{n+1}.1 Card 1
- MKC question config: local JSON (same file as lesson quiz definitions)
- State recovery on Grow tab mount: `AsyncStorage.multiGet` lesson states → re-derive module state if inconsistent

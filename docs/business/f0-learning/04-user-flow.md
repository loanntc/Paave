# F0 Learning Path — Master User Flow Overview

**Version:** 1.0
**Date:** 2026-05-29
**Architecture:** Frontend-only · AsyncStorage · No rewards
**Audience:** PO · BA · Design · Dev · QA

> This document provides the complete bird's-eye view of every user journey in the F0 Learning Path.
> It shows how all individual flows (A–G) connect into a single end-to-end experience.
> For the detailed spec of each flow, see the individual flow files listed in `00-index.md`.

---

## Table of Contents

1. [Phase 0 — First Launch & Welcome Modal](#phase-0--first-launch--welcome-modal-flow-a)
2. [Phase 1 — Placement Quiz](#phase-1--placement-quiz-optional-flow-f)
3. [Phase 2 — Grow Tab (Learning Path Home)](#phase-2--grow-tab-learning-path-home-flow-b)
4. [Phase 3 — Lesson Experience](#phase-3--lesson-experience-flow-c)
5. [Phase 4 — Module Knowledge Check](#phase-4--module-knowledge-check-flows-d--e)
6. [Phase 5 — Learning Complete & Age Gate](#phase-5--learning-complete--age-gate-flow-g)
7. [Module Unlock Chain](#module-unlock-chain)
8. [Edge Cases at a Glance](#edge-cases-at-a-glance)

---

## Phase 0 — First Launch & Welcome Modal (Flow A)

```
App launches (first install OR after reinstall)
        │
        ▼
READ AsyncStorage: f0_welcome_modal_shown
        │
    ┌───┴───────────────────────────────────────┐
    │                                           │
   true                                       false
    │                                           │
    ▼                                           ▼
Skip modal                           ┌──────────────────────┐
→ Home tab                           │    WELCOME MODAL      │
  (or last active tab)               │  AmbientBackground    │
                                     │  (lime + plasma orbs) │
                                     │                       │
                                     │  WRITE:               │
                                     │  f0_welcome_modal     │
                                     │  _shown = true        │
                                     │  (at render — before  │
                                     │   any CTA is tapped)  │
                                     └──────────┬────────────┘
                                                │
                          ┌─────────────────────┼──────────────────────┐
                          │                     │                      │
                     [CTA 1]               [CTA 2]                [CTA 3]
               "Bắt đầu Module 1"     "Khám phá trước"   "Tôi đã biết cơ bản"
                KineticButton lime    KineticButton ghost    Text link (plasma)
                          │                     │                      │
                          ▼                     ▼                      ▼
                   L1.1 Card 1            Home tab              Placement Quiz
                  (→ Phase 3)         WRITE:                   (→ Phase 1)
                                      f0_explore_path
                                      _taken = true
                                      LearningPromptCard
                                      shown on Grow tab
```

**Key rules:**
- `f0_welcome_modal_shown` is written at modal **render**, not on CTA tap — force-kill after render does not re-show the modal.
- No X/close button. The only exit is via one of the three CTAs.
- Modal fires **once per install**. Reinstall resets it.

---

## Phase 1 — Placement Quiz (optional) (Flow F)

```
PLACEMENT QUIZ INTRO SCREEN
Back chevron visible → returns to Welcome Modal
        │
   Tap "Bắt đầu"
        │
   Back navigation BLOCKED on all question screens
        ▼
Q1 → Q2 → Q3 → Q4 → Q5
  (one answer per screen, "Tiếp theo →" activates on selection)
  Q5 button label: "Nộp bài"
        │
   Tap "Nộp bài" → LOCAL evaluation (hardcoded answer keys)
        │
   ┌────┴────────────────────────────────────┐
   │                                         │
Score ≥ 4/5                            Score < 4/5
   PASS                                    FAIL
   │                                         │
BATCH WRITE (AsyncStorage):            WRITE:
  placement_quiz_completed = true        placement_quiz_completed = true
  placement_quiz_passed = true           placement_quiz_passed = false
  module_1_state = COMPLETE              (no change to M1 state)
  lesson_1_1_state = COMPLETE                │
  lesson_1_1_card_index = 4                  ▼
  lesson_1_2_state = COMPLETE         FAIL SCREEN (plasma bg)
  lesson_1_2_card_index = 4           Score in muted color
  lesson_1_3_state = COMPLETE         No retry available
  lesson_1_3_card_index = 4           "Bắt đầu Module 1 →"
  lesson_1_4_state = COMPLETE                │
  lesson_1_4_card_index = 4                  ▼
  lesson_1_5_state = COMPLETE          L1.1 Card 1
  lesson_1_5_card_index = 4           (→ Phase 3, start M1)
  mkc_1_state = PASSED
  module_2_state = UNLOCKED
  lesson_2_1_state = UNLOCKED
        │
        ▼
PASS SCREEN (lime bg)
"Kiến thức tốt! Bỏ qua Module 1."
"Bắt đầu Module 2 →"
        │
        ▼
   L2.1 Card 1
  (→ Phase 3, start M2)
```

**Key rules:**
- One-shot: `f0_placement_quiz_completed = true` permanently blocks re-entry.
- Force-kill between Q1 and "Nộp bài" = quiz opportunity gone (entry point silently disappears).
- Pass threshold: **≥ 4/5** (stricter than MKC's ≥ 3/5).
- No badges, no XP on pass — lime AmbientBackground and M2 navigation only.

---

## Phase 2 — Grow Tab (Learning Path Home) (Flow B)

```
GROW TAB (mounts)
        │
   READ AsyncStorage (single multiGet):
   module_{1-4}_state, lesson_{1-4}_{1-5}_state,
   f0_explore_path_taken, f0_learning_path_complete
        │
   Skeleton loaders 400ms → data resolved
        │
   f0_explore_path_taken = true AND module_1_state = UNLOCKED?
   └── YES → LearningPromptCard above module list
        │
   f0_learning_path_complete = true?
   └── YES → All-complete banner "Học xong! Tiếp tục ôn lại →"
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│                   MODULE CARD STATES (M1 → M4)               │
│                                                              │
│  LOCKED         Grayed out + padlock icon                    │
│                 Tap → tooltip "Hoàn thành Module N-1 trước"   │
│                 (no navigation, tooltip auto-dismisses 2.5s) │
│                                                              │
│  UNLOCKED       Full-color card                              │
│                 "Bắt đầu →" (KineticButton lime)             │
│                 Tap → L{n}.1 Card 1                          │
│                                                              │
│  IN_PROGRESS    Full-color + progress bar "X/5 bài"          │
│                 "Tiếp tục →" (KineticButton lime)            │
│                 Tap → resume at last saved card_index        │
│                                                              │
│  LESSONS_       Full-color + 5/5 bar + all-lesson checkmarks │
│  COMPLETE       "Làm bài kiểm tra →" (KineticButton lime)    │
│                 Tap → MKC for module N                       │
│                                                              │
│  COMPLETE       Completion indicator (checkmark)             │
│                 "Ôn lại →" (ghost button)                    │
│                 Tap → L{n}.1 Card 1 in review mode           │
└──────────────────────────────────────────────────────────────┘
        │
   ONE LIME RULE: only ONE KineticButton lime visible
   in viewport at any time. Lower-priority modules downgrade
   their CTA to ghost if a higher-priority module also has lime.
```

---

## Phase 3 — Lesson Experience (Flow C)

*Repeated for each of 20 lessons (4 modules × 5 lessons).*

```
ENTER LESSON N.M
        │
   READ f0_lesson_{n}_{m}_card_index
   ├── 0 or absent → start at Card 1 (fresh)
   └── 1–4 → resume at that card
        │
        ▼
╔═════════════════════════════════════════════════════════════╗
║            CARD STACK — 5 cards, fixed order                ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  [1] CONCEPT ContentCard                                    ║
║      Swipe left → Card 2                                    ║
║      Swipe right → BOUNCE + haptic (boundary — no exit)     ║
║      Back chevron (header) → Grow tab                       ║
║                                                             ║
║  [2] EXAMPLE ContentCard                                    ║
║      Swipe left → Card 3                                    ║
║      Swipe right → Card 1                                   ║
║                                                             ║
║  [3] MYTH-BUSTER ContentCard                                ║
║      Swipe left → Card 4                                    ║
║      Swipe right → Card 2                                   ║
║                                                             ║
║  [4] QUIZ ← back navigation BLOCKED (chevron hidden)        ║
║      │                                                      ║
║      Tap answer → edge-strong border highlight              ║
║      │                                                      ║
║      ├── CORRECT (green highlight)                          ║
║      │   → forward swipe unlocked → Card 5                  ║
║      │                                                      ║
║      └── WRONG (red highlight) → retry required             ║
║          ├── Attempt 1, 2: "Thử lại" CTA                    ║
║          └── Attempt 3+ consecutive: HINT CARD overlay      ║
║               (plasma bg, "Gợi ý: [hint text]")             ║
║               → continue retrying until CORRECT             ║
║                                                             ║
║  [5] CTA ContentCard                                        ║
║      On render:                                             ║
║      BATCH WRITE:                                           ║
║        lesson_{n}_{m}_state = COMPLETE                      ║
║        lesson_{n}_{m}_card_index = 4                        ║
║        lesson_{n}_{m+1}_state = UNLOCKED (next lesson)      ║
║        [if this was lesson 5 of module:]                    ║
║          module_{n}_state = LESSONS_COMPLETE                ║
║                                                             ║
║      CTA primary "Thực hành ngay →" (lime)                  ║
║      → deep-link to lesson-specific in-app feature          ║
║      CTA secondary "Tiếp tục →" (ghost)                     ║
║      → next lesson (or MKC banner if this was Lesson 5)     ║
║                                                             ║
║  Every forward swipe:                                       ║
║  WRITE lesson_{n}_{m}_card_index = new index (500ms debounce)║
╚═════════════════════════════════════════════════════════════╝
```

---

## Phase 4 — Module Knowledge Check (Flows D & E)

*Triggered after all 5 lessons in a module are COMPLETE.*

```
LESSON 5 CARD 5 renders
WRITE: module_{n}_state = LESSONS_COMPLETE
        │
   800ms delay → MKC BANNER (bottom sheet) appears
        │
   ┌────┴────────────────────────────────────┐
   │                                         │
Tap "Làm bài kiểm tra ngay →"         Dismiss banner
        │                                    │
        │                         module stays LESSONS_COMPLETE
        │                         "Làm bài kiểm tra →" on ModuleCard
        │                         (accessible any time from Grow tab)
        ▼
MKC SCREEN — back navigation BLOCKED on all screens
        │
  Q1 → Q2 → Q3 → Q4 → Q5
  Q5 button label: "Nộp bài"
  (option selection activates "Tiếp theo →" / "Nộp bài")
  (tap ✕ at any point → return to Grow tab, no state written)
        │
   Tap "Nộp bài" → LOCAL evaluation
        │
   ┌────┴────────────────────────────────────┐
   │                                         │
Score ≥ 3/5                            Score < 3/5
   PASS                                    FAIL
   │                                         │
BATCH WRITE:                           BATCH WRITE:
  mkc_{n}_state = PASSED                 mkc_{n}_state = FAILED
  module_{n}_state = COMPLETE            mkc_{n}_cooldown_start
  module_{n+1}_state = UNLOCKED            = Date.now()
  (if n < 4)                                  │
        │                              FAIL SCREEN (plasma bg)
        ▼                              Score in red (#EF4444)
PASS SCREEN (lime bg)                  Per-wrong-question review links
"Module N Hoàn Thành!"                 "Thử lại sau 00:60" DISABLED
Toast: 500ms auto-dismiss                    │
        │                              Countdown 60s → 0s
   ┌────┴──────────┐                   (persists across app restarts
   │               │                    via stored timestamp)
n = 1,2,3       n = 4                        │
   │               │                   T=0: "Thử lại ngay →" ENABLED
   ▼               ▼                         │
"Bắt đầu     "Xem kết quả →"           → restart MKC (fresh questions,
Module N+1 →" → Phase 5                  new cooldown written only on
   │                                     next fail)
   ▼
L{n+1}.1 Card 1
(→ repeat Phase 3–4)
```

**Key rules:**
- MKC has no retry limit — 60s cooldown after each fail, then retry freely.
- Questions randomized on every entry (same 5-question pool, different order).
- Module state stays `LESSONS_COMPLETE` until MKC pass — never auto-advances.
- `mkc_{n}_state = FAILED` and `cooldown_start` are written as a single `multiSet`.

---

## Phase 5 — Learning Complete & Age Gate (Flow G)

*Triggered when M4 MKC passes.*

```
M4 PASS SCREEN
AmbientBackground: lime + plasma (MIXED — unique to M4)
"Module 4 Hoàn Thành!"
        │
   1500ms auto-transition  OR  tap "Xem kết quả →"
        │
        ▼
LEARNING COMPLETE SCREEN (lime orbs)
  "Chúc mừng! 🎓"
  "Bạn đã hoàn thành toàn bộ chương trình học!"
  "4 modules • 20 bài học • Sẵn sàng đầu tư"
  WRITE: f0_learning_path_complete = true (on screen mount)
        │
   Tap "Bắt đầu đầu tư →"
        │
   Read DOB from local profile
   Age = floor( (Date.now() - DOB) / (365.25 × 86400 × 1000) )
        │
   ┌────────────────┬─────────────────────────────┐
   │                │                             │
Age ≥ 18        Age < 18                    DOB missing /
(Case A)        (Case B)                    invalid (Case C)
   │                │                             │
   ▼                └──────────────┬──────────────┘
Navigate to                        │
Trade tab                          ▼
   │                     Navigate to Home tab
Snackbar:                WRITE: f0_age_gate_shown = true
"Sẵn sàng đặt                      │
lệnh đầu tiên! 💪"                  ▼
2500ms                   AGE GATE BOTTOM SHEET
(no f0_age_gate          "Bạn chưa đủ tuổi giao dịch"
_shown write for         "Cần đủ 18 tuổi để đặt lệnh thật"
Case A)                            │
                         Case B: "Bắt đầu giao dịch từ DD/MM/YYYY"
                         Case C: "Cập nhật ngày sinh trong Hồ sơ"
                         "Trong thời gian chờ, theo dõi thị trường..."
                                   │
                      ┌────────────┴────────────────┐
                      │                             │
               "Xem thị trường"             "Về trang chủ"
              (KineticButton lime)           (ghost button)
                      │                             │
                      ▼                             ▼
                 Market tab                  Stay on Home tab
             (read-only, no trading)
```

**Post-completion Grow tab state:**
```
f0_learning_path_complete = true → Grow tab shows:
  ┌──────────────────────────────────────────┐
  │  "Học xong! Tiếp tục ôn lại →"  (banner) │
  ├──────────────────────────────────────────┤
  │  M1 ✓ COMPLETE  │ "Ôn lại →"            │
  │  M2 ✓ COMPLETE  │ "Ôn lại →"            │
  │  M3 ✓ COMPLETE  │ "Ôn lại →"            │
  │  M4 ✓ COMPLETE  │ "Ôn lại →"            │
  └──────────────────────────────────────────┘
```

**Re-entry (user returns to Learning Complete screen later):**
- CTA label changes to "Tiến đến Trade →".
- Age is recalculated at tap time — a user who has since turned 18 takes Case A path.

---

## Module Unlock Chain

```
Registration complete
        │
        ▼
M1 = UNLOCKED (default)
M2 = LOCKED
M3 = LOCKED
M4 = LOCKED

                 M1 MKC pass ──▶  M2 UNLOCKED
                                  M2 MKC pass ──▶  M3 UNLOCKED
                                                   M3 MKC pass ──▶  M4 UNLOCKED
                                                                     M4 MKC pass ──▶  LEARNING COMPLETE

Shortcut: Placement Quiz PASS ──▶ M1 COMPLETE + M2 UNLOCKED (skip M1 entirely)
```

**Module state machine (per module):**
```
LOCKED → UNLOCKED → IN_PROGRESS → LESSONS_COMPLETE → COMPLETE
          (tap)      (view L1.1    (Card 5 of L5      (MKC pass
                      Card 1)       renders)            ≥ 3/5)
```

**Lesson state machine (per lesson):**
```
LOCKED → UNLOCKED → IN_PROGRESS → COMPLETE
          (prev       (view Card 1   (Card 5 renders
           lesson      for first      + Card 4 quiz
           COMPLETE)   time)          already passed)
```

---

## AsyncStorage Key Summary

| Key group | Count | Controls |
|-----------|-------|---------|
| `f0_welcome_modal_shown` | 1 | Welcome Modal one-shot guard |
| `f0_placement_quiz_completed` / `_passed` | 2 | Placement Quiz one-shot guard + result |
| `f0_learning_path_complete` | 1 | Learning Complete screen + Grow tab celebration state |
| `f0_age_gate_shown` | 1 | Age gate bottom sheet analytics (B/C paths only) |
| `f0_explore_path_taken` | 1 | LearningPromptCard visibility on Grow tab |
| `f0_module_{1-4}_state` | 4 | ModuleCard display state |
| `f0_lesson_{1-4}_{1-5}_state` | 20 | Lesson accessibility + progress |
| `f0_lesson_{1-4}_{1-5}_card_index` | 20 | Resume position within lesson |
| `f0_mkc_{1-4}_state` | 4 | MKC pass/fail/not-started per module |
| `f0_mkc_{1-4}_cooldown_start` | 4 | 60s cooldown timestamp per module |
| **Total** | **50** | — |

All state is local. Zero network calls in the entire learning path.
Reinstall resets everything to factory defaults.

---

## Edge Cases at a Glance

| Scenario | Behavior |
|----------|----------|
| Force-kill mid-lesson | Resume at last saved `card_index` (500ms debounce) |
| Force-kill on Welcome Modal (before CTA) | `f0_welcome_modal_shown = true` already written — modal does NOT refire |
| Force-kill during Placement Quiz | Quiz consumed — `placement_quiz_completed` not set but modal won't refire; M1 stays UNLOCKED |
| Force-kill after Lesson 5 Card 5 renders | `module_{n}_state = LESSONS_COMPLETE` already written — MKC accessible from Grow tab |
| Force-kill during MKC cooldown | Cooldown resumes from stored timestamp (`cooldown_start + 60000 - Date.now()`) |
| Force-kill during MKC pass state write | Module may stay LESSONS_COMPLETE; Grow tab healing pass re-derives to COMPLETE if all 5 lessons confirmed COMPLETE |
| App reinstall | All AsyncStorage cleared — full reset, Welcome Modal refires, quiz available again |
| Age exactly 18 on completion day | Case A (Trade tab) — `age >= 18` is inclusive |
| DOB corrupted / missing | Case C → treated as under-18 (safe default — never accidentally grant trade access) |
| Under-18 user turns 18 later | Must navigate to Trade tab manually; Trade tab rechecks age on each visit |
| Placement Quiz re-entry attempt | `f0_placement_quiz_completed = true` blocks all entry points silently |
| MKC ✕ exit mid-quiz | No AsyncStorage writes — module stays `LESSONS_COMPLETE`, MKC restartable |
| AsyncStorage read failure on Grow tab | Fallback: M1 = UNLOCKED, M2–M4 = LOCKED; error logged silently |
| `f0_learning_path_complete` already true on Learning Complete re-entry | Write is idempotent — no side effects |

---

## Related Documents

| Document | Path | Read for |
|----------|------|---------|
| Document index | `docs/business/f0-learning/00-index.md` | Reading order + architecture decisions |
| Requirements (FR/BR) | `docs/business/f0-learning/01-requirements.md` | Full FR list, business rules, acceptance criteria |
| Learning content | `docs/business/f0-learning/02-content.md` | All 100 cards + quiz questions + MKC questions |
| Data model | `docs/business/f0-learning/03-data-model.md` | AsyncStorage schema, TypeScript types, state machines |
| Flow A — Welcome Modal | `docs/business/f0-learning/flow-a-welcome-modal.md` | First launch modal detailed spec |
| Flow B — Grow Tab | `docs/business/f0-learning/flow-b-grow-tab.md` | Learning Path Home detailed spec |
| Flow C — Lesson Experience | `docs/business/f0-learning/flow-c-lesson-experience.md` | Card-stack viewer detailed spec |
| Flow D — Module Completion | `docs/business/f0-learning/flow-d-module-completion.md` | Post-Lesson-5 → MKC banner detailed spec |
| Flow E — MKC | `docs/business/f0-learning/flow-e-mkc.md` | Module Knowledge Check detailed spec |
| Flow F — Placement Quiz | `docs/business/f0-learning/flow-f-placement-quiz.md` | Initial placement assessment detailed spec |
| Flow G — Learning Complete | `docs/business/f0-learning/flow-g-learning-complete.md` | Post-learning age gate detailed spec |

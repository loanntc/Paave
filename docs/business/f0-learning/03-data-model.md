# F0 Learning Path — Local Storage Data Model

**Version:** 2.0
**Date:** 2026-05-29
**Architecture:** Frontend-only, AsyncStorage
**Status:** Approved for Development

---

## Table of Contents

1. [AsyncStorage Key Registry](#1-asyncstorage-key-registry)
2. [TypeScript Interface Definitions](#2-typescript-interface-definitions)
3. [State Machine — Module Transitions](#3-state-machine--module-transitions)
4. [State Machine — Lesson Transitions](#4-state-machine--lesson-transitions)
5. [Progress Calculation Logic](#5-progress-calculation-logic)
6. [Idempotency Rules](#6-idempotency-rules)
7. [Batch Write Pattern](#7-batch-write-pattern)
8. [Cold Start Recovery](#8-cold-start-recovery)
9. [Storage Size Estimate](#9-storage-size-estimate)

---

## 1. AsyncStorage Key Registry

All keys are prefixed with `f0_` to namespace learning path data. Values are stored as JSON-serialized strings (AsyncStorage stores strings; parse/stringify is required for non-string types).

### 1.1 Global Keys

| Key | Type | Default | Description | Set by | Read by |
|---|---|---|---|---|---|
| `f0_welcome_modal_shown` | `boolean` | `false` | Whether the Welcome Modal has been rendered to the user. Written at modal render time, not on dismiss. | FR-LEARN-01 (modal render) | FR-LEARN-01 (entry guard) |
| `f0_placement_quiz_completed` | `boolean` | `false` | Whether the Placement Quiz has been submitted (pass or fail). Enforces one-shot constraint. | FR-LEARN-08 (on submit) | FR-LEARN-08 (entry guard), Welcome Modal CTA |
| `f0_placement_quiz_passed` | `boolean` | `false` | Whether the Placement Quiz was submitted with a passing score (≥4/5). Only meaningful when `f0_placement_quiz_completed = true`. | FR-LEARN-08 (on submit) | Analytics, post-quiz routing |
| `f0_learning_path_complete` | `boolean` | `false` | Whether all 4 modules have reached COMPLETE state. | FR-LEARN-09 (M4 COMPLETE) | FR-LEARN-02 (LearningPromptCard logic) |
| `f0_age_gate_shown` | `boolean` | `false` | Whether the age gate bottom sheet has been shown to the user after learning path completion. | FR-LEARN-10 (on <18 path) | For analytics / preventing re-show |

### 1.2 Module State Keys

One key per module (m = 1, 2, 3, 4).

| Key | Type | Default | Description | Set by | Read by |
|---|---|---|---|---|---|
| `f0_module_1_state` | `ModuleStateEnum` | `'UNLOCKED'` | State of Module 1 (Cổ phiếu cơ bản). M1 starts UNLOCKED. | FR-LEARN-03, FR-LEARN-06, FR-LEARN-07, FR-LEARN-08 | FR-LEARN-02, FR-LEARN-06, FR-LEARN-07 |
| `f0_module_2_state` | `ModuleStateEnum` | `'LOCKED'` | State of Module 2 (Phân tích cơ bản). | FR-LEARN-06, FR-LEARN-07 | FR-LEARN-02, FR-LEARN-06, FR-LEARN-07 |
| `f0_module_3_state` | `ModuleStateEnum` | `'LOCKED'` | State of Module 3 (Chiến lược đầu tư). | FR-LEARN-06, FR-LEARN-07 | FR-LEARN-02, FR-LEARN-06, FR-LEARN-07 |
| `f0_module_4_state` | `ModuleStateEnum` | `'LOCKED'` | State of Module 4 (Quản lý rủi ro). | FR-LEARN-06, FR-LEARN-07 | FR-LEARN-02, FR-LEARN-06, FR-LEARN-07 |

`ModuleStateEnum` values: `'LOCKED'` | `'UNLOCKED'` | `'IN_PROGRESS'` | `'LESSONS_COMPLETE'` | `'COMPLETE'`

### 1.3 Lesson State Keys

One key per lesson (m = module 1–4, l = lesson 1–5). Total: 20 keys.

| Key Pattern | Type | Default | Description | Set by | Read by |
|---|---|---|---|---|---|
| `f0_lesson_{m}_{l}_state` | `LessonStateEnum` | `'LOCKED'` (except `f0_lesson_1_1_state` = `'UNLOCKED'`) | State of lesson l within module m. | FR-LEARN-03, FR-LEARN-05 | FR-LEARN-02, FR-LEARN-03, FR-LEARN-06 |

`LessonStateEnum` values: `'LOCKED'` | `'UNLOCKED'` | `'IN_PROGRESS'` | `'COMPLETE'`

**Default exceptions:**
- `f0_lesson_1_1_state` defaults to `'UNLOCKED'` (first lesson of M1 starts accessible)
- All other lesson states default to `'LOCKED'`

### 1.4 Lesson Card Index Keys

One key per lesson (m = 1–4, l = 1–5). Total: 20 keys.

| Key Pattern | Type | Default | Description | Set by | Read by |
|---|---|---|---|---|---|
| `f0_lesson_{m}_{l}_card_index` | `number` (0–4) | `0` | The index of the last card the user has advanced to in this lesson. 0 = Card 1, 4 = Card 5. Written on every forward swipe. | FR-LEARN-03 (on forward swipe) | FR-LEARN-03 (on resume) |

### 1.5 MKC State Keys

Two keys per module (m = 1–4). Total: 8 keys.

| Key | Type | Default | Description | Set by | Read by |
|---|---|---|---|---|---|
| `f0_mkc_{m}_state` | `MKCStateEnum` | `'NOT_STARTED'` | State of the Module Knowledge Check for module m. | FR-LEARN-07, FR-LEARN-08 (M1 placement pass) | FR-LEARN-07 (entry guard, pass/fail routing) |
| `f0_mkc_{m}_cooldown_start` | `number \| null` (Unix ms) | `null` | Timestamp (Date.now()) written when MKC is failed. Used to compute remaining cooldown. Null if MKC never failed. | FR-LEARN-07 (on fail) | FR-LEARN-07 (cooldown calculation) |

`MKCStateEnum` values: `'NOT_STARTED'` | `'PASSED'` | `'FAILED'`

### 1.6 Complete Key List (for Reference)

```
f0_welcome_modal_shown
f0_placement_quiz_completed
f0_placement_quiz_passed
f0_learning_path_complete
f0_age_gate_shown

f0_module_1_state
f0_module_2_state
f0_module_3_state
f0_module_4_state

f0_lesson_1_1_state    f0_lesson_1_1_card_index
f0_lesson_1_2_state    f0_lesson_1_2_card_index
f0_lesson_1_3_state    f0_lesson_1_3_card_index
f0_lesson_1_4_state    f0_lesson_1_4_card_index
f0_lesson_1_5_state    f0_lesson_1_5_card_index
f0_lesson_2_1_state    f0_lesson_2_1_card_index
f0_lesson_2_2_state    f0_lesson_2_2_card_index
f0_lesson_2_3_state    f0_lesson_2_3_card_index
f0_lesson_2_4_state    f0_lesson_2_4_card_index
f0_lesson_2_5_state    f0_lesson_2_5_card_index
f0_lesson_3_1_state    f0_lesson_3_1_card_index
f0_lesson_3_2_state    f0_lesson_3_2_card_index
f0_lesson_3_3_state    f0_lesson_3_3_card_index
f0_lesson_3_4_state    f0_lesson_3_4_card_index
f0_lesson_3_5_state    f0_lesson_3_5_card_index
f0_lesson_4_1_state    f0_lesson_4_1_card_index
f0_lesson_4_2_state    f0_lesson_4_2_card_index
f0_lesson_4_3_state    f0_lesson_4_3_card_index
f0_lesson_4_4_state    f0_lesson_4_4_card_index
f0_lesson_4_5_state    f0_lesson_4_5_card_index

f0_mkc_1_state    f0_mkc_1_cooldown_start
f0_mkc_2_state    f0_mkc_2_cooldown_start
f0_mkc_3_state    f0_mkc_3_cooldown_start
f0_mkc_4_state    f0_mkc_4_cooldown_start
```

**Total key count:** 49 keys

---

## 2. TypeScript Interface Definitions

```typescript
// Enumerations
export type ModuleStateEnum =
  | 'LOCKED'
  | 'UNLOCKED'
  | 'IN_PROGRESS'
  | 'LESSONS_COMPLETE'
  | 'COMPLETE';

export type LessonStateEnum =
  | 'LOCKED'
  | 'UNLOCKED'
  | 'IN_PROGRESS'
  | 'COMPLETE';

export type MKCStateEnum =
  | 'NOT_STARTED'
  | 'PASSED'
  | 'FAILED';

// ─────────────────────────────────────────────
// Per-lesson state
// ─────────────────────────────────────────────
export interface LessonState {
  /** Current lifecycle state of the lesson. */
  state: LessonStateEnum;
  /**
   * 0-based index of the last card the user has swiped to.
   * 0 = Card 1 (Concept), 4 = Card 5 (CTA).
   * Persisted on every forward swipe.
   */
  cardIndex: number; // 0–4
}

// ─────────────────────────────────────────────
// Per-MKC state
// ─────────────────────────────────────────────
export interface MKCState {
  /** Pass/fail/not-attempted state of the Module Knowledge Check. */
  state: MKCStateEnum;
  /**
   * Unix timestamp (ms) of the most recent MKC failure.
   * Used to compute remaining 60-second cooldown.
   * null if the MKC has never been failed.
   */
  cooldownStart: number | null;
}

// ─────────────────────────────────────────────
// Per-module state (contains 5 lessons + 1 MKC)
// ─────────────────────────────────────────────
export interface ModuleState {
  /** Current lifecycle state of the module. */
  state: ModuleStateEnum;
  /** moduleId: 1 | 2 | 3 | 4 */
  moduleId: 1 | 2 | 3 | 4;
  /**
   * Array of 5 lesson states, indexed 0–4.
   * lessons[0] = Lesson 1, lessons[4] = Lesson 5.
   */
  lessons: [LessonState, LessonState, LessonState, LessonState, LessonState];
  /** State of the Module Knowledge Check for this module. */
  mkc: MKCState;
}

// ─────────────────────────────────────────────
// Root learning path state (entire in-memory tree)
// ─────────────────────────────────────────────
export interface LearningPathState {
  /** Whether the Welcome Modal has been rendered. */
  welcomeModalShown: boolean;
  /** Whether the Placement Quiz has been submitted (enforces one-shot). */
  placementQuizCompleted: boolean;
  /** Whether the Placement Quiz was passed (score ≥4/5). Only valid when placementQuizCompleted = true. */
  placementQuizPassed: boolean;
  /** Whether all 4 modules are in COMPLETE state. */
  learningPathComplete: boolean;
  /** Whether the age gate bottom sheet has been shown after completion. */
  ageGateShown: boolean;
  /**
   * Array of 4 module states, indexed 0–3.
   * modules[0] = Module 1, modules[3] = Module 4.
   */
  modules: [ModuleState, ModuleState, ModuleState, ModuleState];
}

// ─────────────────────────────────────────────
// Default / initial state factory
// ─────────────────────────────────────────────
export function createDefaultLessonState(isFirstLesson: boolean): LessonState {
  return {
    state: isFirstLesson ? 'UNLOCKED' : 'LOCKED',
    cardIndex: 0,
  };
}

export function createDefaultMKCState(): MKCState {
  return {
    state: 'NOT_STARTED',
    cooldownStart: null,
  };
}

export function createDefaultModuleState(
  moduleId: 1 | 2 | 3 | 4,
): ModuleState {
  const isFirstModule = moduleId === 1;
  return {
    moduleId,
    state: isFirstModule ? 'UNLOCKED' : 'LOCKED',
    lessons: [
      createDefaultLessonState(isFirstModule), // L1
      createDefaultLessonState(false),          // L2
      createDefaultLessonState(false),          // L3
      createDefaultLessonState(false),          // L4
      createDefaultLessonState(false),          // L5
    ],
    mkc: createDefaultMKCState(),
  };
}

export function createDefaultLearningPathState(): LearningPathState {
  return {
    welcomeModalShown: false,
    placementQuizCompleted: false,
    placementQuizPassed: false,
    learningPathComplete: false,
    ageGateShown: false,
    modules: [
      createDefaultModuleState(1),
      createDefaultModuleState(2),
      createDefaultModuleState(3),
      createDefaultModuleState(4),
    ],
  };
}
```

---

## 3. State Machine — Module Transitions

### 3.1 Transition Diagram

```
         Placement Quiz pass (M1 only)
         ┌────────────────────────────────────────┐
         │                                        ▼
  ┌──────────┐    prev module     ┌────────────┐     L{n}.1    ┌─────────────┐
  │  LOCKED  │──── COMPLETE ─────▶│  UNLOCKED  │─── Card 1 ───▶│ IN_PROGRESS │
  └──────────┘                    └────────────┘    viewed     └─────────────┘
                                                                       │
                                                               all 5 lessons
                                                                  COMPLETE
                                                                       │
                                                                       ▼
                                                            ┌──────────────────┐
                                                            │ LESSONS_COMPLETE │
                                                            └──────────────────┘
                                                                       │
                                                               MKC score ≥3/5
                                                                       │
                                                                       ▼
                                                               ┌──────────────┐
                                                               │   COMPLETE   │
                                                               └──────────────┘
```

### 3.2 Transition Rules

| From | To | Trigger | Guard | Side Effects |
|---|---|---|---|---|
| `LOCKED` | `UNLOCKED` | Previous module (n-1) reaches `COMPLETE` | Module n-1 state = COMPLETE | Write `f0_module_{n}_state = 'UNLOCKED'`; write `f0_lesson_{n}_1_state = 'UNLOCKED'` |
| `UNLOCKED` | `IN_PROGRESS` | User views Card 1 of Lesson L{n}.1 | Module state = UNLOCKED | Write `f0_module_{n}_state = 'IN_PROGRESS'` |
| `IN_PROGRESS` | `LESSONS_COMPLETE` | All 5 lessons reach `COMPLETE` | All `f0_lesson_{n}_{1-5}_state = 'COMPLETE'` | Write `f0_module_{n}_state = 'LESSONS_COMPLETE'` |
| `LESSONS_COMPLETE` | `COMPLETE` | MKC passed (score ≥ 3/5) | `f0_mkc_{n}_state = 'PASSED'` | Write `f0_module_{n}_state = 'COMPLETE'`; trigger next-module unlock |
| `LOCKED` → `COMPLETE` | M1 Placement Quiz pass only | User submits Placement Quiz with score ≥4/5 | `f0_placement_quiz_completed = false` (enforces one-shot) | Batch write: all M1 lesson states COMPLETE, MKC PASSED, module COMPLETE, M2 UNLOCKED, L2.1 UNLOCKED |

### 3.3 Special: M1 Placement Quiz Pass Path

When the Placement Quiz passes, M1 skips all intermediate states and goes directly to COMPLETE in a single atomic batch write. The following keys are written together in one `AsyncStorage.multiSet` call:

```
f0_placement_quiz_completed = true
f0_placement_quiz_passed    = true
f0_module_1_state           = 'COMPLETE'
f0_lesson_1_1_state         = 'COMPLETE'
f0_lesson_1_2_state         = 'COMPLETE'
f0_lesson_1_3_state         = 'COMPLETE'
f0_lesson_1_4_state         = 'COMPLETE'
f0_lesson_1_5_state         = 'COMPLETE'
f0_mkc_1_state              = 'PASSED'
f0_module_2_state           = 'UNLOCKED'
f0_lesson_2_1_state         = 'UNLOCKED'
```

---

## 4. State Machine — Lesson Transitions

### 4.1 Transition Diagram

```
  ┌──────────┐   module unlocks   ┌────────────┐   Card 1    ┌─────────────┐
  │  LOCKED  │───(for L{n}.1) ───▶│  UNLOCKED  │─── viewed ─▶│ IN_PROGRESS │
  │          │   OR prev lesson   │            │             └─────────────┘
  └──────────┘   COMPLETE         └────────────┘                    │
                                                             Card 5 reached
                                                             (Card 4 quiz
                                                              already passed)
                                                                    │
                                                                    ▼
                                                             ┌──────────────┐
                                                             │   COMPLETE   │
                                                             └──────────────┘
```

### 4.2 Transition Rules

| From | To | Trigger | Guard | Side Effects |
|---|---|---|---|---|
| `LOCKED` | `UNLOCKED` | Previous lesson (l-1) in same module reaches `COMPLETE` | Lesson l-1 state = COMPLETE | Write `f0_lesson_{m}_{l}_state = 'UNLOCKED'` |
| `LOCKED` | `UNLOCKED` (L{n}.1 only) | Module n transitions from LOCKED to UNLOCKED | Module n state newly = UNLOCKED | Write `f0_lesson_{n}_1_state = 'UNLOCKED'` |
| `UNLOCKED` | `IN_PROGRESS` | User views Card 1 (card_index = 0) for the first time | Lesson state = UNLOCKED | Write `f0_lesson_{m}_{l}_state = 'IN_PROGRESS'`; `card_index` remains 0 (written on swipe) |
| `IN_PROGRESS` | `COMPLETE` | User reaches Card 5 (card_index advances to 4) after Card 4 quiz passed | card_index advances to 4; Card 4 was already passed (enforced by card-stack nav) | Write `f0_lesson_{m}_{l}_state = 'COMPLETE'`; write `f0_lesson_{m}_{l}_card_index = 4`; trigger next-lesson unlock or module LESSONS_COMPLETE check |

### 4.3 Card 4 Quiz Enforcement

Card 5 (CTA) is only navigable when Card 4 has been answered correctly in the current session. The card-stack component maintains an in-memory boolean `isQuizPassed` that gates the forward-swipe action from Card 4 to Card 5. This boolean is not persisted; it is inferred from the fact that a COMPLETE lesson must have had its quiz passed. On resuming a lesson that is already COMPLETE, Card 5 is accessible directly.

```typescript
// Card-stack navigation guard (pseudocode)
function canSwipeForward(currentCardIndex: number, isQuizPassed: boolean): boolean {
  if (currentCardIndex === 3) {
    // Card 4 (0-indexed) — can only advance if quiz passed
    return isQuizPassed;
  }
  return true;
}
```

---

## 5. Progress Calculation Logic

All progress percentages are computed from in-memory state (the `LearningPathState` tree hydrated at cold start). These are pure functions with no AsyncStorage reads at calculation time.

### 5.1 Lesson Progress (%)

```typescript
/**
 * Returns 0–100. Represents how far through the 5-card stack the user has progressed.
 * A COMPLETE lesson always returns 100.
 */
function lessonProgress(lesson: LessonState): number {
  if (lesson.state === 'COMPLETE') return 100;
  if (lesson.state === 'LOCKED' || lesson.state === 'UNLOCKED') return 0;
  // IN_PROGRESS: cardIndex is 0-based (0 = first card viewed)
  // After viewing card at index i, progress = (i + 1) / 5 * 100
  return Math.round(((lesson.cardIndex + 1) / 5) * 100);
}
```

### 5.2 Module Progress (%)

```typescript
/**
 * Returns 0–100. Based on completed lessons out of 5.
 * A COMPLETE module (MKC passed) always returns 100.
 */
function moduleProgress(module: ModuleState): number {
  if (module.state === 'COMPLETE') return 100;
  const completedLessons = module.lessons.filter(
    (l) => l.state === 'COMPLETE',
  ).length;
  return Math.round((completedLessons / 5) * 100);
}
```

### 5.3 Overall Learning Path Progress (%)

```typescript
/**
 * Returns 0–100. Based on COMPLETE modules out of 4.
 * A module must be in COMPLETE state (MKC passed) to count.
 */
function learningPathProgress(pathState: LearningPathState): number {
  const completedModules = pathState.modules.filter(
    (m) => m.state === 'COMPLETE',
  ).length;
  return Math.round((completedModules / 4) * 100);
}
```

### 5.4 Completed Lesson Count Per Module

```typescript
/** Returns 0–5. Used for module card progress bar label (e.g. "3/5 bài"). */
function completedLessonCount(module: ModuleState): number {
  return module.lessons.filter((l) => l.state === 'COMPLETE').length;
}
```

### 5.5 MKC Cooldown Remaining (ms)

```typescript
/**
 * Returns the number of milliseconds remaining in the MKC cooldown.
 * Returns 0 if cooldown has expired or was never set.
 * COOLDOWN_DURATION_MS = 60_000 (60 seconds)
 */
const COOLDOWN_DURATION_MS = 60_000;

function mkcCooldownRemainingMs(mkc: MKCState): number {
  if (mkc.state !== 'FAILED' || mkc.cooldownStart === null) return 0;
  const elapsed = Date.now() - mkc.cooldownStart;
  return Math.max(0, COOLDOWN_DURATION_MS - elapsed);
}

/** Returns true if the MKC can be attempted right now. */
function isMKCRetryAvailable(mkc: MKCState): boolean {
  return mkcCooldownRemainingMs(mkc) === 0;
}
```

---

## 6. Idempotency Rules

All state transition writes must be guarded by a precondition check. Writing the same state twice must not trigger duplicate downstream side effects.

| Scenario | Expected Behavior | Implementation Note |
|---|---|---|
| Swipe to card index N when `card_index` already = N | No write occurs; no state change. | Check `if (newIndex === currentIndex) return` before writing. |
| Lesson transitions to COMPLETE when already COMPLETE | No write, no next-lesson unlock triggered, no module-state check triggered. | Check `if (lesson.state === 'COMPLETE') return` before any completion logic. |
| Module transitions to LESSONS_COMPLETE when already LESSONS_COMPLETE | No write. | Check `if (module.state === 'LESSONS_COMPLETE' || module.state === 'COMPLETE') return`. |
| MKC passes when `f0_mkc_{m}_state` already = PASSED | No write, no module-state change, no next-module unlock. | Check `if (mkc.state === 'PASSED') return` before MKC pass handling. |
| Module N+1 unlock triggered when `f0_module_{n+1}_state` already = UNLOCKED or further | No write. | Check `if (nextModuleState !== 'LOCKED') return` before unlock write. |
| `f0_learning_path_complete` written when already `true` | No write. | Check `if (pathState.learningPathComplete) return`. |
| Lesson N+1 unlocked when already UNLOCKED or further | No write. | Check `if (nextLessonState !== 'LOCKED') return` before unlock write. |

**Defensive state healing (cold start only):** During cold-start recovery, if all 5 lessons in a module are COMPLETE but `f0_module_{m}_state` is IN_PROGRESS (not LESSONS_COMPLETE), heal the module state to LESSONS_COMPLETE and log a warning. This is the only case where a "backward-looking" state repair is performed. Do not perform this healing on every render — only during the cold-start initialization pass.

---

## 7. Batch Write Pattern

All writes that change more than one related key must use `AsyncStorage.multiSet` to ensure atomicity at the write level. This prevents partial-state corruption if the app is killed between writes.

### 7.1 Why This Matters

AsyncStorage does not support transactions. If two separate `AsyncStorage.setItem` calls are made and the app is killed between them, one key may be updated while the other is not, leaving the state in an inconsistent intermediate condition. Using `multiSet` submits all key-value pairs as a single operation, reducing (but not eliminating) the window for partial writes.

### 7.2 Batch Write Helper

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

type KeyValuePair = [string, string];

/**
 * Writes multiple key-value pairs atomically.
 * All values must be JSON-serialized before passing to this function.
 * Throws if AsyncStorage.multiSet fails.
 */
async function batchWriteF0State(pairs: KeyValuePair[]): Promise<void> {
  await AsyncStorage.multiSet(pairs);
}

// Usage example — Lesson COMPLETE:
async function markLessonComplete(
  moduleId: number,
  lessonId: number,
  isLastLessonInModule: boolean,
): Promise<void> {
  const pairs: KeyValuePair[] = [
    [`f0_lesson_${moduleId}_${lessonId}_state`, JSON.stringify('COMPLETE')],
    [`f0_lesson_${moduleId}_${lessonId}_card_index`, JSON.stringify(4)],
  ];

  if (lessonId < 5) {
    pairs.push([
      `f0_lesson_${moduleId}_${lessonId + 1}_state`,
      JSON.stringify('UNLOCKED'),
    ]);
  }

  if (isLastLessonInModule) {
    pairs.push([
      `f0_module_${moduleId}_state`,
      JSON.stringify('LESSONS_COMPLETE'),
    ]);
  }

  await batchWriteF0State(pairs);
}
```

### 7.3 Required Batch Write Points

The following operations MUST use `multiSet`:

| Operation | Keys Written Together |
|---|---|
| Lesson COMPLETE | `lesson_{m}_{l}_state`, `lesson_{m}_{l}_card_index`, optionally `lesson_{m}_{l+1}_state`, optionally `module_{m}_state` |
| MKC Pass | `mkc_{m}_state`, `module_{m}_state`, optionally `module_{m+1}_state`, optionally `lesson_{m+1}_1_state` |
| Module 4 COMPLETE | `mkc_4_state`, `module_4_state`, `f0_learning_path_complete` |
| Placement Quiz Pass | All 11 keys listed in Section 3.3 |
| Placement Quiz Fail | `f0_placement_quiz_completed`, `f0_placement_quiz_passed` |
| MKC Fail | `f0_mkc_{m}_state`, `f0_mkc_{m}_cooldown_start` |

---

## 8. Cold Start Recovery

On every app launch, the learning path module must reconstruct the full in-memory `LearningPathState` from AsyncStorage before rendering. This single initialization pass replaces all per-component AsyncStorage reads.

### 8.1 Initialization Flow

```typescript
const ALL_F0_KEYS: string[] = [
  'f0_welcome_modal_shown',
  'f0_placement_quiz_completed',
  'f0_placement_quiz_passed',
  'f0_learning_path_complete',
  'f0_age_gate_shown',
  'f0_module_1_state', 'f0_module_2_state', 'f0_module_3_state', 'f0_module_4_state',
  // 20 lesson state keys
  ...Array.from({ length: 4 }, (_, m) =>
    Array.from({ length: 5 }, (_, l) => `f0_lesson_${m + 1}_${l + 1}_state`)
  ).flat(),
  // 20 lesson card index keys
  ...Array.from({ length: 4 }, (_, m) =>
    Array.from({ length: 5 }, (_, l) => `f0_lesson_${m + 1}_${l + 1}_card_index`)
  ).flat(),
  // 8 MKC keys
  ...Array.from({ length: 4 }, (_, m) => [
    `f0_mkc_${m + 1}_state`,
    `f0_mkc_${m + 1}_cooldown_start`,
  ]).flat(),
];

/**
 * Reads all 49 f0_ keys from AsyncStorage in a single multiGet call.
 * Parses values and constructs the in-memory LearningPathState.
 * Falls back to default values for any missing or unparseable key.
 * Performs defensive state healing for any detected inconsistencies.
 */
async function initializeLearningPathState(): Promise<LearningPathState> {
  const rawPairs = await AsyncStorage.multiGet(ALL_F0_KEYS);

  // Build a map of key → parsed value
  const store = new Map<string, unknown>();
  for (const [key, value] of rawPairs) {
    if (value !== null) {
      try {
        store.set(key, JSON.parse(value));
      } catch {
        // Unparseable value — use default (key not in map)
      }
    }
  }

  const get = <T>(key: string, defaultValue: T): T => {
    return store.has(key) ? (store.get(key) as T) : defaultValue;
  };

  // Construct state tree
  const modules = [1, 2, 3, 4].map((m) => {
    const lessons = [1, 2, 3, 4, 5].map((l) => ({
      state: get<LessonStateEnum>(
        `f0_lesson_${m}_${l}_state`,
        m === 1 && l === 1 ? 'UNLOCKED' : 'LOCKED',
      ),
      cardIndex: get<number>(`f0_lesson_${m}_${l}_card_index`, 0),
    })) as ModuleState['lessons'];

    const mkc: MKCState = {
      state: get<MKCStateEnum>(`f0_mkc_${m}_state`, 'NOT_STARTED'),
      cooldownStart: get<number | null>(`f0_mkc_${m}_cooldown_start`, null),
    };

    const moduleState = get<ModuleStateEnum>(
      `f0_module_${m}_state`,
      m === 1 ? 'UNLOCKED' : 'LOCKED',
    );

    return { moduleId: m as 1 | 2 | 3 | 4, state: moduleState, lessons, mkc };
  }) as LearningPathState['modules'];

  const pathState: LearningPathState = {
    welcomeModalShown: get<boolean>('f0_welcome_modal_shown', false),
    placementQuizCompleted: get<boolean>('f0_placement_quiz_completed', false),
    placementQuizPassed: get<boolean>('f0_placement_quiz_passed', false),
    learningPathComplete: get<boolean>('f0_learning_path_complete', false),
    ageGateShown: get<boolean>('f0_age_gate_shown', false),
    modules,
  };

  // Defensive state healing — fix module state if all lessons are COMPLETE
  // but module state hasn't advanced
  const healingWrites: KeyValuePair[] = [];
  for (const module of pathState.modules) {
    const allLessonsComplete = module.lessons.every((l) => l.state === 'COMPLETE');
    if (
      allLessonsComplete &&
      module.state === 'IN_PROGRESS'
    ) {
      console.warn(
        `[F0 Heal] Module ${module.moduleId}: all lessons COMPLETE but state is IN_PROGRESS. Healing to LESSONS_COMPLETE.`,
      );
      module.state = 'LESSONS_COMPLETE';
      healingWrites.push([
        `f0_module_${module.moduleId}_state`,
        JSON.stringify('LESSONS_COMPLETE'),
      ]);
    }
  }
  if (healingWrites.length > 0) {
    await AsyncStorage.multiSet(healingWrites);
  }

  return pathState;
}
```

### 8.2 State Context / Store

The resolved `LearningPathState` must be stored in a React context or global state manager (e.g., Zustand, Redux, React Context) so all components can read from in-memory state without individual AsyncStorage calls. AsyncStorage is only accessed for writes (after state transitions) and for the single cold-start `multiGet`.

```typescript
// Example with React Context (simplified)
const LearningPathContext = React.createContext<{
  state: LearningPathState;
  setState: React.Dispatch<React.SetStateAction<LearningPathState>>;
} | null>(null);
```

---

## 9. Storage Size Estimate

All values are stored as JSON strings. Sizes below are conservative estimates in bytes.

| Key Group | # Keys | Avg Value Size (bytes) | Subtotal |
|---|---|---|---|
| Global boolean keys (5 keys) | 5 | 5 (`"true"` = 4, `"false"` = 5) | ~25 B |
| Module state keys (4 keys) | 4 | 15 (`"LESSONS_COMPLETE"` = 18, worst case) | ~60 B |
| Lesson state keys (20 keys) | 20 | 15 | ~300 B |
| Lesson card index keys (20 keys) | 20 | 3 (`"4"` = 3) | ~60 B |
| MKC state keys (4 keys) | 4 | 15 (`"NOT_STARTED"` = 13) | ~60 B |
| MKC cooldown timestamp keys (4 keys) | 4 | 15 (13-digit Unix ms = 13) | ~60 B |
| **Key names themselves** | 49 keys | avg 25 chars per key | ~1,225 B |
| **Total** | **49** | — | **~1,790 B (~1.75 KB)** |

**Maximum state (all keys set to longest values):** ~2.5 KB

**AsyncStorage limits:**
- iOS: ~6 MB default limit per app (configurable)
- Android: effectively unlimited (SQLite-backed, limited by device storage)

The F0 Learning Path data at maximum state (~2.5 KB) uses less than 0.05% of the iOS AsyncStorage limit. There is no storage concern for this feature.

**Note:** AsyncStorage stores key-value pairs where both key and value are strings. The above estimate accounts for the overhead of the key names themselves, which are included in storage consumption.

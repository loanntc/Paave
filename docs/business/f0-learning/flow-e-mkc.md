# Flow E — Module Knowledge Check (MKC)

**FR:** FR-LEARN-07
**Version:** 1.0
**Last updated:** 2026-05-29

---

## 1. Flow Summary

| Field | Value |
|---|---|
| Flow ID | Flow E |
| Feature Reference | FR-LEARN-07 |
| Actor | F0 trader who has completed all 5 lessons in a module (LESSONS_COMPLETE state) |
| Entry Triggers | (1) Tap "Làm bài kiểm tra" banner after Lesson 5; (2) Tap "Làm bài kiểm tra →" CTA on ModuleCard |
| Exit Points | Pass screen → next module / Learning Complete; Fail screen → retry or Grow tab; ✕ → Grow tab (no save) |
| Architecture | Frontend-only. All scoring is client-side (hardcoded answers in app bundle). State persisted in AsyncStorage. |
| Backend Calls | None |
| AsyncStorage Keys Written | `f0_mkc_{n}_state`, `f0_module_{n}_state`, `f0_module_{n+1}_state`, `f0_mkc_{n}_cooldown_start` |

---

## 2. Business Flow

### 2.1 Numbered Steps

1. User taps "Làm bài kiểm tra" banner (after Lesson 5) **or** "Làm bài kiểm tra →" CTA on ModuleCard — requires `f0_module_{n}_state = LESSONS_COMPLETE`.
2. System loads 5 questions from the hardcoded question pool for that module. Question order is randomized on each entry.
3. MKC screen opens at Q1. Back chevron is HIDDEN. iOS swipe-from-left is disabled. Android system back is disabled.
4. User reads question and taps one option → option enters "selected" state (edge-strong border). "Tiếp theo →" button activates.
5. User taps "Tiếp theo →" → Q2 renders. Process repeats through Q2, Q3, Q4.
6. On Q5: button label reads "Nộp bài" instead of "Tiếp theo →".
7. User taps "Nộp bài" → client evaluates answers locally (compare 5 selections against hardcoded answer keys).
8. **Score ≥ 3/5 (PASS)** → execute Pass sequence (§2.2).
9. **Score < 3/5 (FAIL)** → execute Fail sequence (§2.3).
10. User taps ✕ at any point → MKC dismissed, no state written, user returns to Grow tab (§2.4).

### 2.2 Pass Sequence

1. Write `f0_mkc_{n}_state = PASSED`.
2. Write `f0_module_{n}_state = COMPLETE`.
3. If `n < 4`: write `f0_module_{n+1}_state = UNLOCKED`.
4. Show Pass screen:
   - AmbientBackground: lime orbs.
   - "Module N Hoàn Thành!" in `display-md`, color `lime (#CAFD00)`.
   - Score "X/5" in lime.
   - No badge, no XP (removed from this version).
5. If `n ∈ {1, 2, 3}`: CTA "Bắt đầu Module N+1 →" → navigate to `L{n+1}.1` Card 1.
6. If `n = 4`: CTA "Xem kết quả học →" → navigate to Learning Complete screen (Flow G).

### 2.3 Fail Sequence

1. Write (batch, single `multiSet` call):
   - `f0_mkc_{n}_state = 'FAILED'`
   - `f0_mkc_{n}_cooldown_start = Date.now()`
2. Show Fail screen:
   - "Chưa đạt. Cần ≥ 3/5 câu đúng."
   - Score displayed in `negative (#EF4444)`.
   - For each incorrectly-answered question: show a targeted review link → tapping the link navigates to the corresponding lesson card.
   - KineticButton lime DISABLED, label "Thử lại sau 00:60".
3. Local countdown timer starts: reads `f0_mkc_{n}_cooldown_start` + 60,000 ms. Ticks every 1,000 ms, updating button label in `MM:SS` format.
4. At T=0: MKCCooldownBanner transitions cooldown background → xp-pill background (500 ms CSS transition). Button changes to "Thử lại ngay →" ENABLED.
5. User taps "Thử lại ngay →" → load fresh MKC (same module, questions re-randomized). A new `f0_mkc_{n}_cooldown_start` is written **only** on the next fail — not on retry entry.

### 2.4 Exit (✕) Sequence

1. User taps ✕ at any question screen.
2. No AsyncStorage writes for MKC answers.
3. Module state remains `LESSONS_COMPLETE`.
4. User returns to Grow tab. ModuleCard still shows "Làm bài kiểm tra →" CTA.

### 2.5 App Relaunch During Cooldown

```
remainingMs = f0_mkc_{n}_cooldown_start + 60000 - Date.now()

if (remainingMs > 0):
  → Resume countdown at remaining time (show correct MM:SS)
  → Button DISABLED

else:
  → Show "Thử lại ngay →" immediately ENABLED
  → No cooldown UI shown
```

### 2.6 Decision Tree

```
User taps "Làm bài kiểm tra"
    │
    ▼
module_{n}_state = LESSONS_COMPLETE?
    ├── NO  → CTA disabled (should not reach here; guard in UI)
    └── YES → Load 5 questions (randomized) → Show Q1
                  │
                  ▼
           User answers Q1–Q5
                  │
                  ▼
           Tap "Nộp bài"
                  │
                  ▼
           Score ≥ 3/5?
           ├── YES (PASS)
           │     ├── Write PASSED / COMPLETE / UNLOCKED
           │     ├── n < 4? → CTA → Module n+1 L1 Card 1
           │     └── n = 4? → CTA → Learning Complete (Flow G)
           │
           └── NO (FAIL)
                 ├── Write cooldown_start
                 ├── Show fail screen + review links
                 ├── Countdown 60s
                 └── T=0 → Retry → reload MKC
```

---

## 3. Acceptance Criteria

### AC-E-01: MKC Entry Guard
**Given** a module is in `LESSONS_COMPLETE` state
**When** the user taps "Làm bài kiểm tra" banner or ModuleCard CTA
**Then** the MKC screen opens with 5 randomized questions, back navigation disabled, back chevron hidden.

### AC-E-02: Forward-Only Navigation
**Given** the user is on any MKC question screen
**When** the user attempts back navigation (swipe, hardware back, or any back gesture)
**Then** no navigation occurs; the user remains on the current question.

### AC-E-03: Question Selection Activates Continue
**Given** the user is on a question screen with no selection
**When** the user taps an answer option
**Then** the option enters "selected" state (edge-strong border) and the "Tiếp theo →" / "Nộp bài" button activates.

### AC-E-04: Q5 Submit Label
**Given** the user reaches Q5
**When** the question screen renders
**Then** the continue button label is "Nộp bài" (not "Tiếp theo →").

### AC-E-05: Pass — State Writes
**Given** the user submits with score ≥ 3/5
**When** evaluation completes
**Then**
- `f0_mkc_{n}_state = PASSED` is written to AsyncStorage
- `f0_module_{n}_state = COMPLETE` is written
- If `n < 4`: `f0_module_{n+1}_state = UNLOCKED` is written
- Pass screen renders with lime AmbientBackground, score in lime, correct "Module N Hoàn Thành!" heading.

### AC-E-06: Pass — Module 4 CTA
**Given** the user passes M4 MKC
**When** the Pass screen renders
**Then** the CTA reads "Xem kết quả học →" and navigates to Flow G (Learning Complete screen).

### AC-E-07: Pass — Modules 1–3 CTA
**Given** the user passes MKC for modules 1, 2, or 3
**When** the Pass screen renders
**Then** the CTA reads "Bắt đầu Module N+1 →" and navigates to L{n+1}.1 Card 1.

### AC-E-08: Fail — Cooldown Start
**Given** the user submits with score < 3/5
**When** evaluation completes
**Then**
- `f0_mkc_{n}_cooldown_start = Date.now()` is written
- Fail screen renders with score in `#EF4444`, review links for wrong questions, and a DISABLED lime button labeled "Thử lại sau 00:60".

### AC-E-09: Fail — Countdown Accuracy
**Given** the fail screen is showing
**When** the countdown is running
**Then** the button label updates every 1,000 ms in `MM:SS` format, counting from 00:60 to 00:00.

### AC-E-10: Fail — Cooldown Expiry
**Given** the countdown reaches T=0
**When** the timer fires
**Then** the MKCCooldownBanner transitions background in 500 ms and the button changes to "Thử lại ngay →" ENABLED.

### AC-E-11: Exit Mid-Quiz
**Given** the user taps ✕ at any point during the MKC
**When** the dismissal is confirmed
**Then** no MKC-related AsyncStorage keys are written, the module state remains `LESSONS_COMPLETE`, and the user is returned to the Grow tab.

### AC-E-12: Cooldown Survives App Restart
**Given** `f0_mkc_{n}_cooldown_start` is set and cooldown has not expired
**When** the user relaunches the app and views the module's fail state
**Then** the countdown resumes at the correct remaining time (not reset to 60 s).

### AC-E-13: Cooldown Already Expired on Relaunch
**Given** `f0_mkc_{n}_cooldown_start` is set and the elapsed time exceeds 60,000 ms
**When** the user relaunches and views the module
**Then** the retry button shows "Thử lại ngay →" ENABLED immediately, with no countdown.

---

## 4. Design Analysis

### 4.1 Screens & Wireframes

#### Screen E-1: MKC Question Screen (Q1–Q4)

```
┌────────────────────────────────────┐
│  [No back chevron]    Module N MKC │
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

#### Screen E-2: MKC Question Screen Q5

Identical to E-1 except:
- Progress dots: ●●●●●
- Button label: "Nộp bài"

#### Screen E-3: Pass Screen

```
┌────────────────────────────────────┐
│  AmbientBackground: lime orbs      │
│                                    │
│  Module N Hoàn Thành!              │
│  (display-md, lime #CAFD00)        │
│                                    │
│         X / 5                      │
│     (display-lg, lime)             │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Bắt đầu Module N+1 →        │  │
│  │  (KineticButton lime)        │  │
│  └──────────────────────────────┘  │
│  (or "Xem kết quả học →" if M4)   │
└────────────────────────────────────┘
```

#### Screen E-4: Fail Screen

```
┌────────────────────────────────────┐
│  AmbientBackground: dark/plasma    │
│                                    │
│  Chưa đạt. Cần ≥ 3/5 câu đúng.   │
│  (body-lg)                         │
│                                    │
│         X / 5                      │
│  (display-lg, negative #EF4444)    │
│                                    │
│  Xem lại câu sai:                  │
│  → Câu 2: [Bài X - Tên bài]        │  ← per wrong question
│  → Câu 4: [Bài Y - Tên bài]        │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Thử lại sau 00:60          │  │
│  │  (KineticButton lime, DISABLED) │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

At T=0, button transitions to:
```
│  ┌──────────────────────────────┐  │
│  │  Thử lại ngay →              │  │
│  │  (KineticButton lime, ENABLED)│  │
│  └──────────────────────────────┘  │
```

---

### 4.2 Design Decisions & Rationale

1. **Back chevron HIDDEN (not disabled).** Hiding the chevron removes back navigation from the user's mental model entirely. A visible-but-disabled chevron invites confusion ("why can't I go back?"). Hidden = the option does not exist in this flow.

2. **Cooldown stored as start timestamp, not remaining duration.** `f0_mkc_{n}_cooldown_start = Date.now()` allows the client to calculate remaining time on any relaunch: `remainingMs = start + 60000 - Date.now()`. A stored duration would drift incorrectly across app restarts.

3. **Questions hardcoded in app bundle (no CMS).** Ensures offline-first, zero-latency question delivery. There is no network dependency on MKC submission. Acceptable trade-off: question updates require an app release (flagged as Design Gap G-E-01).

4. **MKCCooldownBanner background transition at T=0 (500 ms).** The visual state change provides a clear, positive signal that the wait is over. Color transition from cooldown-bg → xp-pill-bg reinforces progress rather than failure.

5. **Per-wrong-question review links (targeted, not bulk "review all").** Users see exactly which questions they missed and which lesson addresses each. This is more actionable than a general "review module" prompt and respects the user's time.

6. **No retry limit.** A 60-second cooldown provides pacing without artificial retry caps. Caps would add friction without meaningful improvement in learning. Users can retry until they pass.

7. **No server call on submission.** Evaluation is purely local (compare selected answers vs. hardcoded keys). This eliminates network error states, loading spinners, and failure-to-submit edge cases. The simplicity is the feature.

8. **New `cooldown_start` written only on next fail.** When a user retries after cooldown and fails again, a fresh timestamp is written. The retry entry itself does not reset the cooldown, preventing a loophole where entering the quiz and exiting resets the timer.

9. **Question randomization on every entry.** Prevents memorization of question order across retries. Randomization is in-memory; no persistent order stored.

10. **No partial answer save on exit.** Saves implementation complexity and prevents exploiting partial saves to game question order. MKC is short (5 questions); the cost of restart is low.

---

### 4.3 Component Usage

| Component | Screen | Usage |
|---|---|---|
| `AmbientBackground` | Pass screen | Lime orbs — celebratory state |
| `AmbientBackground` | Fail screen | Plasma/dark orbs — subdued, not punitive |
| `MKCCooldownBanner` | Fail screen | Wraps countdown button; handles background transition at T=0 |
| `KineticButton` lime DISABLED | Fail screen | "Thử lại sau MM:SS" — inactive during cooldown |
| `KineticButton` lime ENABLED | Fail screen (T=0) | "Thử lại ngay →" — activates after transition |
| `KineticButton` lime | Pass screen | Module CTA ("Bắt đầu Module N+1 →" or "Xem kết quả học →") |
| `QuizCard` | Q1–Q5 | Renders question text + answer options; manages selected state |
| `LessonProgressBar` (dot variant) | Q1–Q5 | Shows question progress (●●○○○) |

---

### 4.4 Interaction Rules

| Trigger | Condition | Result |
|---|---|---|
| Tap answer option | No prior selection | Option state → selected (edge-strong border); CTA activates |
| Tap answer option | Different option already selected | Previous option deselects; new option selects |
| Tap "Tiếp theo →" | Option selected, Q1–Q4 | Navigate to next question |
| Tap "Nộp bài" | Option selected, Q5 | Evaluate; write state; navigate to Pass or Fail screen |
| Tap "Tiếp theo →" | No option selected | No action; button remains inactive |
| Tap ✕ | Any question screen | Return to Grow tab; no state written |
| Tap review link | Fail screen | Navigate to corresponding lesson card |
| Tap retry | T=0, button ENABLED | Load fresh MKC (re-randomized); new cooldown_start written only on fail |
| App relaunch | Cooldown not expired | Resume countdown at correct remaining time |
| App relaunch | Cooldown expired | Show "Thử lại ngay →" immediately |

---

### 4.5 Edge Cases

| ID | Scenario | Handling |
|---|---|---|
| EC-E-01 | Force-kill app during MKC | No answers saved; `f0_mkc_{n}_state` unchanged (may be NOT_STARTED or FAILED from prior attempt); user can retake if no cooldown is active |
| EC-E-02 | Force-kill during cooldown | `f0_mkc_{n}_cooldown_start` was written before fail screen appeared; cooldown resumes correctly on relaunch |
| EC-E-03 | Device time set backward (cheating cooldown) | V1 accepts the risk — cooldown is enforced by client timestamp only. Server-side enforcement deferred to V2. |
| EC-E-04 | Device time set forward | Cooldown expires immediately; user sees "Thử lại ngay →". Acceptable: no gameplay loop is exploitable here. |
| EC-E-05 | All 5 questions in pool = 5 (no extras) | Retries see same questions re-ordered (not different questions). Flagged as Design Gap G-E-01. |
| EC-E-06 | User taps ✕ immediately after fail + before cooldown UI renders | Cooldown_start already written; cooldown is in effect. Return to Grow shows active cooldown on ModuleCard. |
| EC-E-07 | User on fail screen; device rotated / app backgrounded | Timer persists using stored timestamp; resumes correctly when app returns to foreground |
| EC-E-08 | Module 4 pass — `f0_module_5_state` write attempt | No M5 exists; the `n+1` unlock write is guarded by `if n < 4`. No write occurs for M4 pass. |

---

## 5. Business ↔ Design Alignment

| Business Requirement | Design Implementation | Status |
|---|---|---|
| Load 5 questions, randomized | `QuizCard` pool slice + `Math.random()` sort on entry | Aligned |
| Forward-only navigation | Back chevron hidden; iOS swipe disabled; Android back disabled | Aligned |
| Selection activates CTA | `QuizCard` selected state → KineticButton enabled prop | Aligned |
| Q5 label = "Nộp bài" | Conditional label on last question | Aligned |
| PASS: write 3 AsyncStorage keys | Effect on submit evaluation; keys written before navigation | Aligned |
| PASS: lime AmbientBackground + lime score | `AmbientBackground` lime preset; score `color: lime` | Aligned |
| PASS M1–M3: CTA → next module | CTA destination = `L{n+1}.1 Card 1` | Aligned |
| PASS M4: CTA → Flow G | CTA destination = Learning Complete screen | Aligned |
| FAIL: write cooldown_start | `Date.now()` written before fail screen renders | Aligned |
| FAIL: score in negative color | Score text `color: #EF4444` | Aligned |
| FAIL: per-wrong-question review links | Map wrong answer indices → lesson deep-links | Aligned |
| FAIL: 60 s countdown | MKCCooldownBanner reads stored timestamp; ticks every 1 s | Aligned |
| FAIL: banner transition at T=0 | 500 ms CSS transition; button re-enabled | Aligned |
| EXIT: no state write | Guard: state writes only after "Nộp bài" evaluation | Aligned |
| Cooldown survives restart | Timestamp-based calculation (not stored duration) | Aligned |
| No rewards (XP/badges) | No XP pill, no badge component on any MKC screen | Aligned |

---

## 6. QA Test Cases

| ID | Test Case | Precondition | Steps | Expected Result |
|---|---|---|---|---|
| QA-E-01 | MKC entry — correct state guard | `f0_module_2_state = LESSONS_COMPLETE` | Tap "Làm bài kiểm tra" on M2 ModuleCard | MKC opens with 5 questions; back chevron hidden; Q1 displayed |
| QA-E-02 | Back navigation blocked | MKC open at Q3 | Attempt iOS swipe-from-left; tap hardware back (Android) | No navigation; user remains on Q3 |
| QA-E-03 | Pass — all state writes | M1 MKC, answer 3/5 correctly | Submit | `f0_mkc_1_state=PASSED`, `f0_module_1_state=COMPLETE`, `f0_module_2_state=UNLOCKED` written; Pass screen shown with lime orbs |
| QA-E-04 | Pass M4 — Flow G CTA | M4 MKC, score ≥ 3/5 | Submit | Pass screen shows "Xem kết quả học →"; tap navigates to Learning Complete screen |
| QA-E-05 | Fail — cooldown start write | M1 MKC, answer 2/5 correctly | Submit | `f0_mkc_1_cooldown_start` written; fail screen shows "Thử lại sau 00:60"; button DISABLED |
| QA-E-06 | Countdown accuracy | Fail screen active | Observe button label over 10 seconds | Label decrements from 00:60 to 00:50 over 10 s ±1 s |
| QA-E-07 | Cooldown expiry transition | Fail screen, T > 0 | Wait for T=0 | MKCCooldownBanner background transitions in ~500 ms; button changes to "Thử lại ngay →" ENABLED |
| QA-E-08 | Per-wrong-question review links | Fail screen, Q2 and Q4 answered incorrectly | View fail screen | Two review links shown: one for Q2's lesson, one for Q4's lesson (not one generic link) |
| QA-E-09 | Exit mid-quiz — no state write | MKC open at Q2 | Tap ✕ | AsyncStorage unchanged; Grow tab shows module still in LESSONS_COMPLETE; ModuleCard CTA = "Làm bài kiểm tra →" |
| QA-E-10 | Cooldown survives app kill | Fail screen shown, cooldown_start written | Force-kill app; relaunch within 60 s; navigate to M1 | Countdown resumes at correct remaining time (not reset to 60 s) |
| QA-E-11 | Cooldown already expired on relaunch | cooldown_start set > 60 s ago | Relaunch app; navigate to M1 | "Thử lại ngay →" shown immediately; no countdown shown |
| QA-E-12 | Retry after cooldown — new cooldown on fail | Retry MKC after expiry | Fail again (score < 3/5) | New `f0_mkc_{n}_cooldown_start` = fresh Date.now() written; new 60 s countdown begins |
| QA-E-13 | No rewards on pass screen | Any module pass | Submit ≥ 3/5 | No XP display, no badge image, no confetti animation referencing XP on pass screen |
| QA-E-14 | M4 pass — no M5 unlock write | M4 MKC, score ≥ 3/5 | Submit | `f0_module_5_state` key does NOT exist in AsyncStorage after submission |

---

## 7. Design Gaps / Risks

| ID | Severity | Description | Recommendation |
|---|---|---|---|
| G-E-01 | HIGH | Question pool size equals question count (pool = 5, quiz = 5). Retries see the same questions reordered, not fresh questions. Users can memorize all 5 answers after the first attempt. | Expand question pool to minimum 10 per module so retries draw a randomized subset of 5. Requires content work before launch. |
| G-E-02 | MEDIUM | Client-side timestamp for cooldown is manipulable by device clock changes. A user who sets their clock forward 60 s bypasses the cooldown entirely. | V1 accepts this risk. V2 should validate cooldown server-side on MKC submission if anti-gaming becomes a concern. |
| G-E-03 | MEDIUM | Hardcoded answer keys in app bundle are extractable via reverse engineering or bundle inspection. Determined users can extract correct answers without completing lessons. | Acceptable for V1 educational context. V2 could obfuscate or serve answer keys via API. |
| G-E-04 | LOW | No explicit "are you sure?" confirmation on ✕ exit. Users who accidentally tap ✕ at Q4 lose their progress. | Consider a minimal confirmation dialog ("Thoát bài kiểm tra? Tiến độ sẽ không được lưu.") for Q3+. |
| G-E-05 | LOW | Fail screen has no explicit "close / back to Grow" CTA. Users must use ✕ to exit. If ✕ is not visually prominent, users may feel stuck on the fail screen. | Ensure ✕ is discoverable and visually clear on the fail screen. Alternatively, add a ghost "Về trang học →" secondary CTA below the countdown button. |

---

## 8. Related Documents

| Document | Path |
|---|---|
| F0 Learning Path Requirements | `docs/business/f0-learning/01-requirements.md` |
| Flow A — Welcome Modal | `docs/business/f0-learning/flow-a-welcome-modal.md` |
| Flow B — Grow Tab | `docs/business/f0-learning/flow-b-grow-tab.md` |
| Flow C — Lesson Experience | `docs/business/f0-learning/flow-c-lesson-experience.md` |
| Flow D — Module Completion | `docs/business/f0-learning/flow-d-module-completion.md` |
| Flow F — Placement Quiz | `docs/business/f0-learning/flow-f-placement-quiz.md` |
| Flow G — Learning Complete | `docs/business/f0-learning/flow-g-learning-complete.md` |
| Kinetic Drop V2.0 Design System | Internal Figma — Kinetic Drop V2.0 |

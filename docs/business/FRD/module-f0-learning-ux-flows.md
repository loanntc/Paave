# F0 Learning Path — User Journey Flows
**Version:** 1.0 | **Date:** 2026-05-28 | **Module:** F-LEARN
**Linked FRD:** `docs/business/frd/module-f0-learning.md`
**Status:** Draft — Aligned with FRD v1.0

---

## 1. Document Purpose

This document defines the end-to-end user journeys for the F0 Learning Path module. It is written for Product Owners, Business Analysts, and QA Engineers. For the UI/UX design interpretation of these flows, see `docs/design/DESIGN-F0-LEARN-01-ux-flows.md`.

Each flow maps directly to one or more Functional Requirements (`FR-LEARN-xx`) in the FRD.

---

## 2. Actors

| Actor | Description |
|-------|-------------|
| **F0 Trader** | Primary user — age 16–27, Vietnamese, zero prior investing experience; just registered |
| **Returning Learner** | F0 Trader who has started but not completed the learning path |
| **System** | Server-side event processor responsible for XP grants, badge awards, module unlock evaluation, and level-up checks |

---

## 3. Module Prerequisite Map

```
M1 — The VN Stock Market
  Prerequisite: none (auto-unlocked on registration)
  Unlock: M2

M2 — Your First Trade
  Prerequisite: M1 complete (MKC passed)
  Unlock: M3 (if ≥3 paper trades also met)

M3 — Thinking in Portfolios
  Prerequisite: M2 complete AND ≥3 paper trades placed
  Unlock: M4 (if ≥1 trade on each of 5 distinct trading days also met)

M4 — Trader Psychology
  Prerequisite: M3 complete AND ≥1 paper trade on each of 5 distinct VNST trading days
  Unlock: Tier 2 community access
```

> **Rule:** Prerequisites are evaluated live each time the Learning Path screen is loaded. A module transitions LOCKED → UNLOCKED the moment all conditions are satisfied, with no manual trigger required.

---

## 4. User Journey Flows

---

### Flow A — Post-Registration Welcome (FR-LEARN-01)

**Trigger:** User completes registration; account status transitions to `ACTIVE`; first app launch

**Pre-condition:** `welcome_modal_shown = false` for this `user_id`

```
1. System checks welcome_modal_shown flag on first app launch
   ├── [flag = false] → Display Welcome Modal; write flag = true atomically at render
   └── [flag = true]  → Skip modal; proceed to Home tab

2. Welcome Modal presented to user (one-time event)

3. User chooses one of three paths:
   ├── A) "Start Module 1"
   │     → System creates session progress for L1.1
   │     → User enters lesson viewer at L1.1 Card 1
   │
   ├── B) "Explore first"
   │     → Modal dismissed
   │     → User lands on Home tab
   │     → Learning prompt card shown on first Grow tab visit
   │
   └── C) "I already know the basics"
           → User routed to Placement Quiz (see Flow F)
```

**Acceptance Criteria:**
```
Given  user opens app for the first time after registration
When   Home tab renders
Then   Welcome Modal is displayed full-screen; flag is written before any user interaction

Given  Welcome Modal is visible
When   user taps "Start Module 1"
Then   user is navigated directly to L1.1 Card 1 (no intermediate screens)

Given  Welcome Modal is visible
When   user force-kills the app immediately after modal renders
Then   on relaunch, Welcome Modal is NOT shown (flag persisted server-side)

Given  user dismisses modal via "Explore first"
When   user opens Grow tab
Then   a learning prompt card is shown at the top of the learning path
```

**Edge Cases:**
| Case | System Behavior |
|------|----------------|
| Network unavailable on first launch | Modal suppressed; flag retried on reconnect; modal fires on next launch |
| Concurrent sessions on two devices | Atomic server write ensures modal fires at most once |
| Account status is `PENDING_VERIFICATION` at launch | Modal suppressed until account transitions to `ACTIVE` |

---

### Flow B — Learning Path Navigation (FR-LEARN-02, FR-LEARN-08)

**Trigger:** User navigates to Grow tab → Learning Path sub-section

**Pre-condition:** User is authenticated

```
1. System loads module progress and lesson completions for user_id
   ├── [loading] Show placeholder state (max 3 seconds)
   ├── [success] Render module cards M1–M4 with current states
   └── [error]   Show error state with retry option

2. System evaluates each module's unlock status in real-time:
   M1: always UNLOCKED (no prerequisite)
   M2: LOCKED until M1 complete
   M3: LOCKED until M2 complete AND ≥3 paper trades
   M4: LOCKED until M3 complete AND ≥1 trade × 5 distinct VNST trading days

3. User selects a module:
   ├── [UNLOCKED, not started] → enter first lesson
   ├── [IN_PROGRESS]           → resume at last incomplete lesson / last saved card
   ├── [COMPLETE]              → enter in review mode (no XP re-awarded)
   └── [LOCKED]                → system shows prerequisite message; no navigation

4. User completes all 4 modules
   → System displays "Path Complete" state
   → All module completion rewards already applied
```

**Acceptance Criteria:**
```
Given  user has completed 3 of 5 lessons in Module 1
When   Learning Path screen loads
Then   Module 1 shows in-progress state with 60% completion indicator
       and a "Continue" action pointing to Lesson 4

Given  user taps a locked module
When   tap event fires
Then   system shows prerequisite message for that module; no navigation occurs

Given  all 4 modules are complete
When   Learning Path screen loads
Then   "Path Complete" state is displayed
```

---

### Flow C — Card-Stack Lesson Experience (FR-LEARN-03, FR-LEARN-04, FR-LEARN-05, FR-LEARN-06, FR-LEARN-07)

**Trigger:** User taps an unlocked lesson

**Pre-condition:** Lesson's module is in `UNLOCKED`, `IN_PROGRESS`, or `COMPLETE` state

```
1. System opens lesson viewer at last saved card position (or Card 1 if fresh)
   └── Progress saved: system records card position after each card advance

2. User progresses through 5 cards in fixed sequence:
   Card 1 — Concept:     core definition of the lesson topic
   Card 2 — Example:     real VN market example
   Card 3 — Myth-Buster: common misconception corrected
   Card 4 — Quiz:        multiple-choice question (see sub-flow C1)
   Card 5 — CTA:         "Try it now" paper trading prompt (see sub-flow C2)

3. Navigation rules:
   ├── Forward: swipe left or tap "Next" (available at any card)
   ├── Backward: swipe right or tap "Back" (available at any card)
   └── At Card 1 boundary: backward action has no effect

4. On Card 5 completion (or skip):
   → Lesson completion event fires
   → XP +25 awarded (idempotent — awarded once per lesson per account)
   → session_progress updated
   → Return to Learning Path screen
```

**Sub-flow C1 — In-Lesson Quiz (Card 4):**
```
1. User selects one answer from four options
   ├── [Correct] → Quiz marked complete; user may advance to Card 5
   └── [Wrong]   → Attempt recorded; user may retry immediately
                   After 3 consecutive wrong answers:
                   → System inserts a Hint card before allowing next attempt
                   → User reads hint, dismisses, then retries (no attempt limit after hint)
```

**Sub-flow C2 — "Try It Now" CTA (Card 5):**
```
1. User presented with a paper trading task prompt
   ├── [Accept: "Try it now"] → Navigate to paper trading UI; lesson completion fires
   └── [Skip: "Skip"]         → Lesson completion fires; return to Learning Path
```

**Acceptance Criteria:**
```
Given  user opens a fresh lesson
When   lesson viewer loads
Then   Card 1 is displayed; progress indicator shows position 1 of 5

Given  user is on Card 4 and selects the wrong answer 3 times in a row
When   third wrong answer is submitted
Then   system inserts a hint card; user must dismiss hint before retrying

Given  user completes a lesson
When   lesson completion event fires
Then   XP +25 is awarded exactly once, regardless of how many times the lesson is replayed

Given  user force-kills app between Card 3 and Card 4 before save completes
When   user reopens the lesson
Then   lesson resumes at Card 3 (last successfully saved position)
```

---

### Flow D — Module Completion & Rewards (FR-LEARN-08, FR-LEARN-09, FR-LEARN-10, FR-LEARN-11)

**Trigger:** User passes Module Knowledge Check (≥3/5 correct)

```
1. System processes MKC pass event:
   → Module status transitions to COMPLETE
   → Badge award event queued (idempotent key: {user_id}_{badge_id})
   → XP bonus grant queued (idempotent key: {user_id}_{badge_id}_XP)
   → Learning Level advance condition evaluated (see FR-LEARN-17)
   → Next module unlock conditions re-evaluated

2. User sees completion reward screen:
   Module 1: Badge "Market Foundations" (Common) + 0 bonus XP
   Module 2: Badge "First Trader" (Common) + 0 bonus XP + 50,000,000 VND bonus cash
   Module 3: Badge "Portfolio Thinker" (Uncommon) + 25 bonus XP
   Module 4: Badge "Market Scholar" (Rare) + 75 bonus XP + Tier 2 community access

3. Module 2 bonus cash flow:
   → 50,000,000 VND credited to separate virtual ledger (ledger_source = "module_2_completion")
   → 7-day TTL from credit timestamp
   → User notified with warning at T+6 (24h before expiry)
   → Force-liquidation of all positions at T+7 regardless of market hours or user action

4. Idempotency guarantee:
   → If reward screen is interrupted (force-kill, network error), badge and XP are NOT lost
   → Re-opening the app shows module as COMPLETE with badge awarded
   → Reward animation may not replay; reward is still fully applied
```

**Acceptance Criteria:**
```
Given  user passes Module 2 MKC
When   completion reward is processed
Then   "First Trader" badge is awarded; 50,000,000 VND added to bonus virtual ledger;
       7-day expiry timer begins; user is notified of expiry rules

Given  Module 2 bonus cash has been credited for 7 days
When   T+7 timestamp is reached (VNST)
Then   all bonus cash positions are force-liquidated; bonus ledger balance set to zero;
       user's regular virtual portfolio is unaffected

Given  user force-kills app during reward screen
When   user reopens app and navigates to Grow tab
Then   module shows COMPLETE; badge is visible in My Badges; XP is reflected in profile;
       reward animation does not re-play
```

---

### Flow E — Module Knowledge Check (FR-LEARN-18)

**Trigger:** User taps "Take Knowledge Check" after completing all 5 lessons in a module

**Pre-condition:** All 5 lessons in the module are in `COMPLETE` state

```
1. System presents 5 questions sequentially (one per screen)
   ├── Forward-only navigation (no back between questions)
   ├── No time limit per question
   └── No per-question answer reveal until full submission

2. User submits all 5 answers ("Submit")

3. System evaluates score:
   ├── [PASS: ≥3/5 correct]
   │     → Module COMPLETE flow (see Flow D)
   │
   └── [FAIL: <3/5 correct]
         → Result screen shows score and incorrect question references
         → 60-second retry cooldown begins immediately
         → After cooldown: user may retry with a fresh randomized question set
         → No retry limit; each failed attempt triggers a new 60-second cooldown
```

**Acceptance Criteria:**
```
Given  user answers 4 of 5 MKC questions correctly and submits
When   results are processed
Then   pass result is shown; module completion rewards triggered (Flow D)

Given  user fails MKC (scores 2/5)
When   results screen appears
Then   score is shown; retry button is inactive for 60 seconds; countdown visible

Given  user fails MKC and waits 60 seconds
When   retry button activates
Then   user may start a new MKC attempt with a randomized question set from the same pool

Given  user submits MKC and network times out
When   response is not received within 3 seconds
Then   error shown; no score saved; no cooldown penalty; user may resubmit
```

---

### Flow F — Initial Placement Quiz (FR-LEARN-19)

**Trigger:** User taps "I already know the basics" on Welcome Modal

**Pre-condition:** `welcome_modal_shown = false` (quiz accessible only from Welcome Modal)

```
1. Placement Quiz intro presented
   → Back navigation still available at this stage (user may return to Welcome Modal)

2. User taps "Start"
   → Back navigation BLOCKED for remainder of quiz (cannot return to Welcome Modal)
   → Questions Q1–Q5 presented sequentially (no back between questions)
   → No time limit; no per-question reveal

3. User submits all 5 answers

4. System evaluates score (one-shot — quiz cannot be retaken):
   ├── [PASS: ≥4/5 correct]
   │     → Module 1 marked COMPLETE server-side (no badge or XP awarded)
   │     → User enters Learning Path starting at Module 2
   │
   └── [FAIL: <4/5 correct]
         → User enters Learning Path starting at Module 1
         → No retry option; result is permanent for this account
```

**Business Rules:**
| Rule | Detail |
|------|--------|
| One-shot | Placement Quiz cannot be retaken under any circumstance |
| No reward for pass | Skipping M1 via placement does NOT award the M1 badge or XP |
| Back blocked on Q1 | Once Q1 renders, system-level back navigation is disabled for the quiz session |
| Force-kill recovery | If app is force-killed before submission, quiz state is not persisted; Welcome Modal fires again on relaunch (welcome_modal_shown not yet set); user may attempt placement quiz again |

**Acceptance Criteria:**
```
Given  user answers 4 of 5 placement questions correctly and submits
When   result is processed
Then   Module 1 is marked complete; user enters Learning Path at Module 2;
       no M1 badge or XP is awarded

Given  user answers 2 of 5 placement questions correctly and submits
When   result is processed
Then   user enters Learning Path at Module 1; no retry option is presented

Given  user reaches Question 1 of the Placement Quiz
When   user attempts to navigate back
Then   back navigation has no effect; user remains on Question 1
```

---

## 5. Module State Machine

```
State transitions for each module:

  LOCKED ──────────────────────────────────────────────┐
     │ (prerequisite conditions met; evaluated on      │
     │  Learning Path screen load)                     │
     ▼                                                 │
  UNLOCKED                                             │
     │ (user taps first lesson)                        │
     ▼                                                 │
  IN_PROGRESS                                          │
     │ (all 5 lessons complete)                        │
     ▼                                                 │
  LESSONS_COMPLETE                                     │
     │ (MKC passed: ≥3/5)                              │
     ▼                                                 │
  COMPLETE ◄───────────────────────────────────────────┘
              (via Placement Quiz for M1 only)
```

Lesson state transitions:
```
  NOT_STARTED → IN_PROGRESS → COMPLETE
                              (idempotent; re-entering = REVIEW mode, no XP re-award)
```

---

## 6. Cross-Flow Business Rules

| Rule ID | Rule | Applies To |
|---------|------|-----------|
| BR-LEARN-01 | Each lesson has exactly 5 cards in fixed order: Concept → Example → Myth-Buster → Quiz → CTA | Flow C |
| BR-LEARN-02 | XP grant per lesson: +25; awarded once per lesson per account (idempotent) | Flow C |
| BR-LEARN-05 | Module badge award uses idempotency key `{user_id}_{badge_id}`; safe to retry | Flow D |
| BR-LEARN-06 | Module XP bonus uses idempotency key `{user_id}_{badge_id}_XP`; separate from badge key | Flow D |
| BR-LEARN-10 | Bonus cash credited to ledger `module_2_completion`, separate from regular virtual portfolio | Flow D |
| BR-LEARN-11 | Force-liquidation at T+7 is unconditional (market open/closed, weekday/weekend) | Flow D |
| BR-LEARN-14 | MKC pass threshold: ≥3 of 5 questions correct | Flow E |
| BR-LEARN-15 | MKC retry cooldown: 60 seconds after each failed attempt; no retry limit | Flow E |
| BR-LEARN-21 | Placement Quiz pass threshold: ≥4 of 5 correct; one-shot per account | Flow F |
| BR-LEARN-22 | Tier 2 XP threshold: 500 XP (unlocked on M4 completion event, not XP count) | Flow D |
| BR-LEARN-23 | ATO day boundary for M4 prerequisite: `DATE(placed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')` | Flow B |
| BR-LEARN-24 | Placement Quiz back navigation: blocked from Q1 render onward | Flow F |

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| FRD: F0 Learning Path | `docs/business/frd/module-f0-learning.md` |
| Gamification FRD | `docs/business/frd/module-c-gamification-extended.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Design Alignment + Tokens | `docs/design/DESIGN-F0-LEARN-00-alignment.md` |
| UX Flows (Design Detail) | `docs/design/DESIGN-F0-LEARN-01-ux-flows.md` |
| Screen Wireframes | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| UI Specification | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |
| Component Specs | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| QA Test Cases | `docs/design/DESIGN-F0-LEARN-06-qa-cases.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |

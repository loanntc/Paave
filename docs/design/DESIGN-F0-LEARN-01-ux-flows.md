# F0 Learning Path — UX Flows & Information Architecture
**Version:** 1.0 | **Date:** 2026-05-28 | **Feature:** F0 Learning Path (Module F-LEARN)

> **Cross-reference:** `docs/design/ux-flows.md` for global navigation architecture.
> The F0 Learning Path lives at **Tab 2 (Grow) → Sub-nav pill 1 (Learning Path)**.

---

## 1. User Persona

```
User:           F0 Trader — "Nam" (representative)
Age:            21, university student in Ho Chi Minh City
Goal:           Understand how the Vietnamese stock market works; make his first
                virtual trade without risking real money
Pain Points:    Overwhelmed by financial jargon; afraid of losing money;
                doesn't know where to start; skips long text content
Device:         iPhone 14 (primary); Samsung Galaxy A55 (secondary)
Context:        Commute, between classes — sessions under 5 minutes
Motivation:     Curious about investing after seeing peers discuss stocks;
                wants actionable next steps, not lectures
```

---

## 2. Information Architecture

```
App Root
└── Tab 2: Grow
    └── Sub-nav pill 1: Learning Path (F0 Learning Path home)
        │
        ├── [Learning Prompt Card]      — shown only if Welcome Modal was dismissed
        │
        ├── ModuleCard: M1 — The VN Stock Market    [UNLOCKED / IN_PROGRESS / COMPLETE]
        │   ├── L1.1 — Cổ phiếu là gì?
        │   │   ├── Card 1: Concept
        │   │   ├── Card 2: Example
        │   │   ├── Card 3: Myth-Buster
        │   │   ├── Card 4: Quiz
        │   │   └── Card 5: CTA ("Try it now")
        │   ├── L1.2 — L1.5 (same structure)
        │   └── → Module Knowledge Check (MKC-M1)  [after all 5 lessons complete]
        │       └── → Module Completion Reward Screen (M1)
        │
        ├── ModuleCard: M2 — Your First Trade       [LOCKED until M1 complete + MKC pass]
        │   ├── L2.1 — L2.5 (same structure)
        │   ├── → MKC-M2
        │   └── → Module Completion Reward Screen (M2)
        │       └── → Bonus Cash Modal (50,000,000 VND)
        │
        ├── ModuleCard: M3 — Thinking in Portfolios [LOCKED: M2 complete + ≥3 paper trades]
        │   ├── L3.1 — L3.5 (same structure)
        │   ├── → MKC-M3
        │   └── → Module Completion Reward Screen (M3)
        │
        └── ModuleCard: M4 — Trader Psychology      [LOCKED: M3 complete + ≥1 trade × 5 days]
            ├── L4.1 — L4.5 (same structure)
            ├── → MKC-M4
            └── → Module Completion Reward Screen (M4)  [Market Scholar badge, Tier 2 unlock]

Overlays (shown from various points above):
├── Welcome Modal                       [FR-LEARN-01, first launch only]
├── Placement Quiz                      [FR-LEARN-19, from Welcome Modal tertiary CTA]
│   ├── Placement Pass Screen           [4/5 correct → skip M1]
│   └── Placement Fail Screen           [<4/5 → start M1]
├── XP Toast (+25 XP)                   [after each lesson completion]
├── "Try It Now" CTA Modal              [FR-LEARN-05, Card 5 of each lesson]
├── MKC Cooldown Banner                 [60s countdown after MKC fail]
└── Daily Missions (Locked State)       [FR-LEARN-12, until M1 complete]
```

---

## 3. User Flows

---

### Flow A — Post-Registration Welcome (FR-LEARN-01)

**Entry:** User completes registration → account status = ACTIVE → first app launch

```
1. App loads → system checks `welcome_modal_shown` flag server-side
   → [flag = false] → render Welcome Modal full-screen over Home tab
   → [flag = true]  → skip modal; proceed to Home tab normally

2. Welcome Modal renders
   → Lottie animation plays for 3s (rocket/chart theme) → holds final frame
   → "Bắt đầu Module 1" [PRIMARY — lime KineticButton]
   → "Khám phá trước" [SECONDARY — ghost KineticButton]
   → "Tôi đã biết chứng khoán cơ bản" [TERTIARY — text link]
   → [flag written to server at render, BEFORE user interaction]

3a. User taps "Bắt đầu Module 1"
    → welcome_modal_shown = true (already written)
    → Navigate directly to L1.1 Card 1 (Concept)
    → [Grow tab is NOT visited as intermediate]

3b. User taps "Khám phá trước"
    → welcome_modal_shown = true
    → Modal dismisses
    → User lands on Home tab
    → Grow tab shows LearningPromptCard on next visit

3c. User taps "Tôi đã biết chứng khoán cơ bản" [tertiary]
    → Navigate to Placement Quiz (Flow F)

4. [EDGE] App force-killed after modal renders, before CTA tap
    → welcome_modal_shown already written → modal NOT shown on relaunch

5. [EDGE] Network unavailable on first launch
    → Modal NOT displayed
    → Home tab shown normally
    → Flag retry queued → modal shown on next launch when flag confirmed false
```

**Exit states:**
- → L1.1 Lesson Viewer (Card 1)
- → Home tab (modal dismissed)
- → Placement Quiz (Flow F)

---

### Flow B — Learning Path Home: Grow Tab (FR-LEARN-02)

**Entry:** User taps Tab 2 (Grow) → Sub-nav pill 1 (Learning Path)

```
1. System fetches module_progress + lesson_completions for user_id
   → [loading] Show skeleton loaders (3 cards)
   → [success] Render module cards M1–M4
   → [error after 3s] Show error state + "Thử lại" retry button

2. [IF welcome_modal dismissed] Show LearningPromptCard at top of list

3. User views module cards
   → M1: UNLOCKED (no prerequisite; auto-unlock on registration)
   → M2: LOCKED until M1 complete
   → M3: LOCKED until M2 complete AND ≥3 paper trades
   → M4: LOCKED until M3 complete AND ≥1 trade on each of 5 distinct trading days

4. User taps a module card
   → [UNLOCKED / not started]   → navigate to L{n}.1 Card 1
   → [IN_PROGRESS]               → resume at last incomplete lesson / last card index
   → [COMPLETE]                  → navigate to lesson list in read-only review mode
   → [LOCKED]                    → tooltip: "Hoàn thành [Module N] để mở khóa"

5. User scrolls past M4
   → [all complete] "Path Complete" celebration state with confetti
   → [not complete] Normal scroll, locked module cards shown greyed
```

**Exit states:**
- → Lesson Viewer (Flow C)
- → Module Completion Reward Screen (if returning after MKC pass)

---

### Flow C — Card-Stack Lesson Experience (FR-LEARN-03, 04, 05, 06)

**Entry:** User taps a lesson → Lesson Viewer opens at card_index (0 = fresh, N = resume)

```
1. Lesson Viewer loads
   → Progress dots render (●○○○○ for card 1)
   → Card 1 (Concept) renders

2. User swipes left OR taps [Next →]
   → Card transitions with slide-left animation (300ms ease-decelerate)
   → Progress dots update
   → card_index auto-saved on each advance
   → Repeat for Cards 2 (Example), 3 (Myth-Buster)

3. User swipes right OR taps [← Back]
   → Card transitions with slide-right animation
   → [On Card 1: swipe right] no navigation; subtle bounce + haptic

4. [CARD 4: QUIZ]
   → 4 answer options (A/B/C/D) displayed
   → User taps an option
     → [CORRECT]
        → Option highlights green (quiz-correct-bg, positive border)
        → Checkmark + "Đúng rồi! Vuốt để tiếp tục" toast
        → User may advance to Card 5
     → [WRONG — attempts 1 or 2]
        → Option highlights red (quiz-wrong-bg, negative border)
        → Shake animation on option (300ms)
        → "Thử lại nhé!" message; attempt count +1
     → [WRONG — attempt 3]
        → Hint Card slides in from right (plasma-themed surface)
        → User reads hint → taps "Hiểu rồi" → Hint Card slides out
        → Quiz Card returns for re-attempt (no attempt limit after hint)

5. [CARD 5: CTA "Try It Now"]
   → Task prompt displayed (module-specific action)
   → "Thử ngay" [PRIMARY — lime KineticButton]
     → Opens "Try It Now" modal (FR-LEARN-05)
   → "Bỏ qua" [SECONDARY — ghost]
     → Continues to lesson completion
   → Swipe left past Card 5 → lesson completion triggered

6. Lesson Completion
   → XP Toast appears: "+25 XP" (lime, fades up in 300ms, auto-dismisses 2.5s)
   → lesson_completions record created (idempotent)
   → If lesson < 5 in module: return to Grow tab, next lesson unlocked (visual)
   → If lesson = 5 in module: Module Knowledge Check banner appears
     → "Làm bài kiểm tra" CTA → navigate to MKC (Flow E)
```

**Try It Now Modal (FR-LEARN-05):**
```
[BOTTOM SHEET, 60% screen height, ink-800 surface, radius-4xl top corners]

Task prompt:    Lesson-specific instruction (e.g., "Tìm 1 cổ phiếu trong ngành bạn thích")
Context copy:   Short explanation (max 30 words)
[PRIMARY CTA]:  "Thử ngay trong danh mục ảo" → navigates to paper trading UI
[SECONDARY]:    "Để sau" → dismisses sheet; lesson continues; CTA marked as skipped
```

---

### Flow D — Module Completion Reward (FR-LEARN-08, FR-LEARN-09, FR-LEARN-10)

**Entry:** User passes MKC (≥3/5 correct) → Module Completion Reward Screen

```
1. MKC Pass triggers
   → Reward Screen animates in (full-screen, ink-900 canvas)
   → AmbientBackground (lime + plasma orbs) active
   → Badge reveal: name, icon, rarity border animate in (scale 0→1, 300ms spring)
   → XP grant toast (module-specific amount)
   → "LEVEL UP" event check — if advance condition met, level banner shown

2. Module-specific rewards:
   M1: Badge ("Market Foundations", Common) → "Mở khóa Module 2" CTA
   M2: Badge ("First Trader", Common) → Bonus Cash Modal fires automatically
   M3: Badge ("Portfolio Thinker", Uncommon) → module card shows prerequisites for M4
   M4: Badge ("Market Scholar", Rare) → "Bạn đã hoàn thành! Chia sẻ thành tích" screen

3. M2 Bonus Cash Modal (fires after M2 reward screen)
   → [BOTTOM SHEET, full-height, ink-800]
   → "50,000,000 ₫ đã thêm vào danh mục ảo của bạn"
   → Countdown timer: 7 days remaining
   → Warning copy: "Tự động thanh lý sau 7 ngày"
   → "Xem danh mục ảo" CTA → navigates to Portfolio
   → "Tiếp tục học" → returns to Grow tab

4. [EDGE] Reward screen shown but user force-kills
   → Module completion idempotent (badge already awarded server-side)
   → Re-entering Grow tab shows module as COMPLETE with badge
   → No re-trigger of reward screen

5. Return to Grow tab
   → Completed module shows checkmark + "Review" button
   → Next module (if prerequisites met) transitions from LOCKED to UNLOCKED
```

---

### Flow E — Module Knowledge Check (FR-LEARN-18)

**Entry:** User taps "Làm bài kiểm tra" after completing all 5 lessons in a module

```
1. MKC Screen opens
   → 5 questions, one at a time (card format)
   → Progress indicator: "Câu 1/5"
   → No back navigation between questions (forward-only)
   → No time limit per question (no countdown shown)

2. User answers each question
   → Tap an option → selection highlighted (fog-muted + border)
   → "Tiếp theo" button activates after selection
   → On Question 5: button reads "Nộp bài"
   → No answer revealed until submission (all 5 submitted together)

3. User submits (taps "Nộp bài")
   → Loading state (1-2s)
   → Results calculated server-side

4. Results Screen
   → [PASS: ≥3/5 correct]
      → Score shown: e.g., "4/5" in large display-md
      → "Chúc mừng! Bạn đã hoàn thành Module [N]!" message
      → "Nhận phần thưởng" CTA → Module Completion Reward (Flow D)
   → [FAIL: <3/5 correct]
      → Score shown: e.g., "2/5" in negative color
      → "Chưa đạt. Ôn lại bài học và thử lại!" message
      → Review buttons for each incorrect question (tap to go back to lesson)
      → "Thử lại sau [countdown]" button (inactive, 60s cooldown)
      → Cooldown banner: "Bạn có thể thử lại sau [60s]" with live countdown
      → After cooldown: "Thử lại ngay" activates

5. [EDGE] User retries after cooldown
   → Fresh 5-question set (same question pool, randomized order per retry)
   → No retry limit; cooldown applies to every attempt after first
```

---

### Flow F — Initial Placement Quiz (FR-LEARN-19)

**Entry:** User taps "Tôi đã biết chứng khoán cơ bản" on Welcome Modal

```
1. Placement Quiz opens (full-screen, replaces Welcome Modal)
   → Intro copy: "Kiểm tra nhanh kiến thức của bạn"
   → Sub-copy: "5 câu — không cần ôn tập, trả lời thành thật nhất"
   → [START] KineticButton lime → goes to Q1

2. Q1 renders
   → Back navigation immediately BLOCKED (IR-40)
   → System-nav back gesture disabled on Q1 render
   → Back chevron hidden or disabled for entire quiz

3. User answers Q1–Q5 (one question per screen, forward-only)
   → Tap option → highlight (selected state, fog border)
   → "Tiếp theo" activates → advances to next question
   → On Q5: "Nộp bài" CTA

4. Submission
   → Score evaluated:
     → [PASS: ≥4/5 correct]
        → Pass Screen: "Bạn đã nắm vững kiến thức cơ bản!"
        → "Module 1 sẽ được bỏ qua. Bắt đầu từ Module 2." message
        → M1 marked complete (no badge or XP awarded for skip)
        → "Bắt đầu Module 2" CTA → navigates to L2.1

     → [FAIL: <4/5 correct]
        → Fail Screen: "Hãy bắt đầu từ đầu — bạn sẽ tiến bộ nhanh thôi!"
        → "Bắt đầu Module 1" CTA → navigates to L1.1

5. ONE-SHOT RULE: Quiz cannot be retaken regardless of score. CTA on both outcomes
   routes user into the learning path with no re-attempt option.

6. [EDGE] User force-kills during quiz (before submission)
   → Quiz state NOT saved server-side (no partial commit)
   → On relaunch: Welcome Modal fires again (welcome_modal_shown stays false
     until modal render completes; quiz start does not set it)
   → User may take the Placement Quiz again IF Welcome Modal fires again
```

---

## 4. Flow Validation Checklist

- [x] All 6 flows mapped with decision branches, error paths, and exit states
- [x] Placement Quiz back-nav blocking modeled (Flow F, Step 2)
- [x] MKC cooldown state modeled (Flow E, Step 4)
- [x] Idempotency on lesson XP and badge award noted in flows
- [x] Welcome Modal network failure edge case covered (Flow A)
- [x] Bonus Cash TTL and force-liquidation noted in Flow D
- [x] All flows reference FRD section numbers (FR-LEARN-xx)
- [x] All terminal states named (success / error / exit)
- [x] Daily Missions locked state linked to M1 completion event
- [x] Placement Quiz one-shot rule enforced in flow (Step 5)

---

*Owner: UX Design | FRD reference: `docs/business/frd/module-f0-learning.md`*
*See wireframes in: `DESIGN-F0-LEARN-02-wireframes.md`*

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| FRD: F0 Learning Path | `docs/business/frd/module-f0-learning.md` |
| UX Flows (Business) | `docs/business/frd/module-f0-learning-ux-flows.md` |
| Gamification FRD | `docs/business/frd/module-c-gamification-extended.md` |

**Design Layer**
| Document | Path |
|----------|------|
| Design Alignment + Tokens | `docs/design/DESIGN-F0-LEARN-00-alignment.md` |
| Screen Wireframes | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| UI Specification | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |
| Component Specs | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| QA Test Cases | `docs/design/DESIGN-F0-LEARN-06-qa-cases.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |

# FRD: F0 Learning Path (Module F-LEARN)

**Version:** 1.0
**Date:** 2026-05-27
**Author:** Business Analyst — Paave
**Linked BRD:** BRD-LEARN-01 (F0 Engagement & Activation)
**Status:** Draft — Pending Product Owner Sign-off

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Scope](#2-scope)
3. [Module Structure Summary](#3-module-structure-summary)
4. [Functional Requirements](#4-functional-requirements)
   - [FR-LEARN-01: Welcome Modal (Post-Registration)](#fr-learn-01-welcome-modal-post-registration)
   - [FR-LEARN-02: Learning Path Entry via Grow Tab](#fr-learn-02-learning-path-entry-via-grow-tab)
   - [FR-LEARN-03: Card-Stack Lesson Viewer](#fr-learn-03-card-stack-lesson-viewer)
   - [FR-LEARN-04: In-Lesson Quiz with Hint System](#fr-learn-04-in-lesson-quiz-with-hint-system)
   - [FR-LEARN-05: "Try It Now" CTA Modal](#fr-learn-05-try-it-now-cta-modal)
   - [FR-LEARN-06: Lesson Completion & XP Grant](#fr-learn-06-lesson-completion--xp-grant)
   - [FR-LEARN-07: Session Auto-Save & Resume](#fr-learn-07-session-auto-save--resume)
   - [FR-LEARN-08: Module Unlock Evaluation](#fr-learn-08-module-unlock-evaluation)
   - [FR-LEARN-09: Module Completion Rewards](#fr-learn-09-module-completion-rewards)
   - [FR-LEARN-10: Module 2 Bonus Cash (50,000,000 VND)](#fr-learn-10-module-2-bonus-cash-50000000-vnd)
   - [FR-LEARN-11: Bonus Cash Expiry & Force-Liquidation](#fr-learn-11-bonus-cash-expiry--force-liquidation)
   - [FR-LEARN-12: Daily Missions Gate](#fr-learn-12-daily-missions-gate)
   - [FR-LEARN-13: Module 1 — The VN Stock Market](#fr-learn-13-module-1--the-vn-stock-market)
   - [FR-LEARN-14: Module 2 — Your First Trade](#fr-learn-14-module-2--your-first-trade)
   - [FR-LEARN-15: Module 3 — Thinking in Portfolios](#fr-learn-15-module-3--thinking-in-portfolios)
   - [FR-LEARN-16: Module 4 — Trader Psychology](#fr-learn-16-module-4--trader-psychology)
   - [FR-LEARN-17: User Learning Level System](#fr-learn-17-user-learning-level-system)
   - [FR-LEARN-18: Module Knowledge Check (MKC)](#fr-learn-18-module-knowledge-check-mkc)
   - [FR-LEARN-19: Initial Placement Quiz](#fr-learn-19-initial-placement-quiz)
5. [Business Rules](#5-business-rules)
6. [Data Model](#6-data-model)
7. [Out of Scope (V1)](#7-out-of-scope-v1)
8. [Assumptions & Dependencies](#8-assumptions--dependencies)
9. [Open Questions](#9-open-questions)

---

## 1. Feature Overview

| Field | Value |
|-------|-------|
| Feature | F0 Learning Path |
| Module ID | F-LEARN |
| Primary Actor | New User — F0 Trader (age 16–27, zero prior trading knowledge) |
| Secondary Actor | System (server-side event processor) |
| Goal | Guide the F0 user through 4 progressive learning modules to build foundational VN stock market knowledge, place their first paper trade, and develop disciplined trading habits |
| Trigger | User taps "Start Module 1" on post-registration Welcome Modal; OR user taps "Start" on the learning prompt card in the Grow tab |
| Navigation Home | Grow tab (Tab 2 in bottom navigation bar) |
| Platform | iOS + Android |
| Currency | VND (Vietnamese Dong) |

---

## 2. Scope

### In Scope

- Post-registration Welcome Modal (one-time fire)
- Learning Path home screen within Grow tab
- 4 sequential learning modules, 5 lessons each (20 lessons total)
- Card-stack lesson viewer (5 cards per lesson)
- In-lesson multiple-choice quiz with hint system
- "Try it now" task-scoped paper trading CTA modal
- Lesson-level session auto-save and resume
- XP grant per lesson completion (+25 XP, idempotent)
- Module completion rewards: XP bonus, badges, module unlock
- Module 2 bonus virtual cash (50,000,000 VND, 7-day TTL)
- Bonus cash expiry notifications and force-liquidation
- Module unlock evaluation engine (current-state, not event-sequence)
- Daily Missions visibility gate (locked until Module 1 complete)

### Out of Scope (V1)

- **Spaced repetition / review scheduling** — deferred to V2. No repeat-lesson prompting, no SRS algorithm, no review queue.
- Lesson authoring / CMS admin interface
- Multi-language support beyond Vietnamese
- Offline lesson caching
- Social learning features (shared lesson progress, leaderboard by module)
- Instructor-led or live session formats
- Learning analytics dashboard for internal teams (V2)

---

## 3. Module Structure Summary

| Module | Title | Lessons | Prerequisite | XP (lessons) | Module Bonus XP | Total Module XP | Badge | Unlocks |
|--------|-------|---------|--------------|--------------|-----------------|-----------------|-------|---------|
| M1 | The VN Stock Market | L1.1–L1.5 | None (auto-unlock on registration) | 125 | 0 | 125 | "Market Foundations" (Common) | Module 2 |
| M2 | Your First Trade | L2.1–L2.5 | M1 complete | 125 | 0 | 125 | "First Trader" (Common) + 50,000,000 VND bonus cash | Module 3 (+ ≥3 trades check) |
| M3 | Thinking in Portfolios | L3.1–L3.5 | M2 complete AND ≥3 paper trades on main portfolio | 125 | 25 | 150 | "Portfolio Thinker" (Uncommon) | Module 4 |
| M4 | Trader Psychology | L4.1–L4.5 | M3 complete AND ≥1 trade on each of 5 distinct trading days | 125 | 75 | 200 | "Market Scholar" (Rare) | Community posting (Tier 2) |

**Card sequence per lesson (fixed order):**
1. Concept card
2. Example card
3. Myth-Buster card
4. Quiz card
5. CTA card ("Try it now")

**Navigation:** Horizontal swipe — swipe left to advance, swipe right to go back. Tapping next/back chevron buttons is equivalent.

---

## 4. Functional Requirements

---

### FR-LEARN-01: Welcome Modal (Post-Registration)

- **Priority:** P0
- **Actor:** New User (F0 Trader)
- **Description:** On the user's first app launch after successful account creation, the system displays a full-screen Welcome Modal that introduces the F0 Learning Path and invites the user to begin Module 1. The modal fires exactly once per account. It is never shown again regardless of session count, reinstall, or device change.
- **Input:**
  - `user_id` (authenticated, from JWT)
  - `welcome_modal_shown` flag (from `user_onboarding_state` table; boolean, default `false`)
- **Output:**
  - Welcome Modal rendered over Home tab
  - On "Start Module 1": navigate directly to L1.1 lesson viewer (bypasses Grow tab)
  - On "Explore first": dismiss modal; user lands on Home tab; `welcome_modal_shown` set to `true`; Grow tab shows learning prompt card
- **Precondition:**
  - User has completed registration (account status = `ACTIVE`)
  - `welcome_modal_shown = false` for this `user_id`
- **Postcondition:**
  - `welcome_modal_shown = true` (written atomically on modal render, before user interaction, to prevent re-display on crash/kill)
  - If "Start Module 1" tapped: `session_progress` record created for L1.1 with `card_index = 0`

**Modal Content Specification:**

| Element | Content |
|---------|---------|
| Intro animation | Lottie asset `lottie_welcome_learning.json` (rocket/chart-ticker theme, dark-canvas); plays once for 3s then holds final frame. **Fallback:** static PNG `img_welcome_learning_static.png` if asset fails. CTA buttons are active during animation — not gated on completion. (OQ-02 resolved: Lottie 3s) |
| Headline | "Học chứng khoán, không cần kinh nghiệm" (Learn stocks, no experience needed) |
| Body | 2–3 sentence value statement (max 60 words): explains paper trading concept and zero-risk learning |
| Lesson preview | Thumbnail image for L1.1 + lesson title "Cổ phiếu là gì?" |
| Primary CTA | "Bắt đầu Module 1" (Start Module 1) — full-width filled button |
| Secondary CTA | "Khám phá trước" (Explore first) — ghost/text button below primary |
| Tertiary CTA | "Tôi đã biết chứng khoán cơ bản" (I already know the basics) — text link; initiates Placement Quiz (FR-LEARN-19) |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User has just created an account and opens the app for the first time | App reaches the Home tab render | Welcome Modal is displayed full-screen before any other content is interactive |
| AC-02 | Welcome Modal is visible | User taps "Start Module 1" | `welcome_modal_shown` set to `true`; user is navigated directly to L1.1 card 1 (Concept card); Grow tab is NOT visited as intermediate step |
| AC-03 | Welcome Modal is visible | User taps "Explore first" | Modal dismisses; user lands on Home tab; `welcome_modal_shown` set to `true`; Grow tab badge shows learning prompt card on next visit |
| AC-04 | User dismissed modal via "Explore first" on first session | User closes and reopens the app | Welcome Modal is NOT shown again |
| AC-05 | User force-kills the app immediately after modal renders (before tapping either CTA) | User reopens the app | Welcome Modal is NOT shown again (flag written on render, not on CTA tap) |
| AC-06 | User uninstalls and reinstalls the app | User logs in to the same account | Welcome Modal is NOT shown (flag persisted server-side, not device-local) |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| Network unavailable on first launch | Modal is not displayed; app launches normally to Home; flag write is retried on next network connection; modal shown on next launch once flag can be confirmed `false` via server |
| User created account on web (if applicable) and opens mobile for first time | Modal fires on mobile first-launch if `welcome_modal_shown = false`, regardless of registration channel |
| Concurrent sessions (two devices, same account, first launch simultaneously) | Server-side atomic write ensures modal fires at most once; second device may show modal only if flag write has not yet propagated (acceptable; idempotent downstream) |
| User account is `PENDING_VERIFICATION` at launch | Modal is suppressed; shown only when account status transitions to `ACTIVE` |

---

### FR-LEARN-02: Learning Path Entry via Grow Tab

- **Priority:** P0
- **Actor:** New User (F0 Trader)
- **Description:** The Grow tab (Tab 2) is the persistent home for the Learning Path. It displays all 4 modules with their current state (locked, in-progress, complete) and allows the user to enter any unlocked lesson. For users who dismissed the Welcome Modal, the tab additionally shows a prominent learning prompt card at the top.
- **Input:**
  - `user_id`
  - Module progress records from `module_progress` table
  - Lesson completion records from `lesson_completions` table
- **Output:**
  - Learning Path screen showing module cards in sequence (M1–M4)
  - Each module card shows: module title, lesson count, completion percentage, locked/unlocked state, XP reward
  - Tapping an unlocked lesson navigates to lesson viewer (FR-LEARN-03)
- **Precondition:**
  - User is authenticated
- **Postcondition:**
  - No state change on tab entry; read-only display

**Module Card States:**

| State | Visual | User Action Available |
|-------|--------|-----------------------|
| `LOCKED` | Greyed out, padlock icon | None; tap shows tooltip "Complete [prerequisite] to unlock" |
| `UNLOCKED` (not started) | Full color, "Start" button | Tap to begin first lesson |
| `IN_PROGRESS` | Full color, progress bar, "Continue" button | Tap to resume at last incomplete lesson |
| `COMPLETE` | Full color, checkmark, "Review" button | Tap to re-enter any lesson in read-only review mode |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | New user who dismissed welcome modal | Opens Grow tab | Learning prompt card is shown at top of screen above module list |
| AC-02 | Module 1 is in progress (3 of 5 lessons complete) | User opens Grow tab | Module 1 card shows progress bar at 60%, "Continue" button, next lesson title |
| AC-03 | Module 2 is locked | User taps Module 2 card | Tooltip displays: "Hoàn thành Module 1 để mở khóa" (Complete Module 1 to unlock) |
| AC-04 | All 4 modules complete | User opens Grow tab | All modules show complete state with checkmarks; "Path Complete" celebration state shown |
| AC-05 | User has partial progress on L2.3 | User taps Module 2 "Continue" | Lesson viewer opens at L2.3 at the last saved card index |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| `module_progress` data fails to load | Show skeleton loaders for 3 seconds; on continued failure show error state with retry button |
| Module 3 locked but user meets trade count prerequisite (≥3 trades) before M2 complete | Module 3 remains locked; prerequisite requires BOTH M2 complete AND ≥3 trades |

---

### FR-LEARN-03: Card-Stack Lesson Viewer

- **Priority:** P0
- **Actor:** New User (F0 Trader)
- **Description:** Each lesson consists of exactly 5 cards displayed in a horizontal card-stack format. The user advances through cards by swiping left or tapping a next chevron. The user navigates back by swiping right or tapping a back chevron. Progress is auto-saved on every card completion. A progress indicator (e.g., 5 dots or "2/5") is always visible.

**Card Sequence (fixed, non-configurable per lesson):**

| Position | Card Type | Content Responsibility |
|----------|-----------|----------------------|
| 1 | Concept card | Core definition/explanation of the lesson topic |
| 2 | Example card | Real VN market example illustrating the concept |
| 3 | Myth-Buster card | Common misconception corrected with explanation |
| 4 | Quiz card | Multiple-choice question (see FR-LEARN-04) |
| 5 | CTA card | "Try it now" action (see FR-LEARN-05) |

- **Input:**
  - `lesson_id`
  - `user_id`
  - `session_progress.card_index` (last saved card position, 0-indexed)
- **Output:**
  - Card rendered at `card_index`
  - On each card completion: `session_progress` updated with new `card_index` and `updated_at` timestamp
  - On card 5 completion: lesson completion event fired (see FR-LEARN-06)
- **Precondition:**
  - Lesson's module is in state `UNLOCKED` or `IN_PROGRESS` or `COMPLETE`
  - User is authenticated
- **Postcondition:**
  - `session_progress.card_index` reflects the furthest card reached
  - If CTA card (card 5) is reached and either acted upon or swiped past: lesson completion triggered

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User opens a fresh lesson (no prior progress) | Lesson viewer loads | Card 1 (Concept card) is displayed; progress indicator shows "1/5" |
| AC-02 | User is on card 2 | User swipes left | Card 3 animates in from right; progress indicator updates to "3/5" |
| AC-03 | User is on card 3 | User swipes right | Card 2 animates back in from left; progress indicator updates to "2/5" |
| AC-04 | User is on card 1 | User swipes right | No navigation; card 1 remains; subtle haptic/visual indicator that this is the first card |
| AC-05 | User has completed cards 1–3 and exits the app | User reopens and navigates to the same lesson | Lesson resumes at card 4; cards 1–3 are shown as visited in progress indicator |
| AC-06 | User is viewing a previously completed lesson (review mode) | All 5 cards | All cards are freely navigable in both directions; no XP re-award on review |
| AC-07 | User reaches card 5 (CTA card) and swipes left past it | — | Lesson completion is triggered; XP awarded; user returns to Grow tab with completion animation |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| Network drops while saving card progress | Progress save queued locally; retry on reconnect; no visible error to user unless queue exceeds 5 minutes |
| User force-kills app between card 3 and card 4 before save completes | On relaunch, user resumes at last successfully saved card (card 3); card 4 is not marked complete |
| Card content fails to render (image 404, content API error) | Show placeholder with error message "Không tải được nội dung. Thử lại?" (Content failed to load. Retry?); retry button present |

---

### FR-LEARN-04: In-Lesson Quiz with Hint System

- **Priority:** P0
- **Actor:** New User (F0 Trader)
- **Description:** Card 4 of every lesson is a multiple-choice quiz. The user may attempt the question unlimited times within a session. After 3 consecutive wrong answers on the same question, the system inserts a Hint card before allowing another attempt. XP is awarded on lesson completion regardless of the number of attempts taken. Attempt counts are recorded in analytics but do not affect XP or lesson completion eligibility.
- **Input:**
  - `lesson_id`
  - `question_id` (one question per lesson quiz)
  - Selected answer option (A/B/C/D or equivalent)
  - `quiz_attempt_count` (tracked per question per session in `session_progress.quiz_state`)
- **Output:**
  - Correct answer: visual success feedback (green highlight, checkmark); user may advance to card 5
  - Wrong answer: visual error feedback (red highlight, shake animation); attempt count incremented; retry available
  - After 3rd wrong attempt: Hint card slides in before quiz card; user reads hint then retries
- **Precondition:**
  - User has reached card 4 of an active lesson session
- **Postcondition:**
  - `session_progress.quiz_state.attempt_count` incremented on each wrong answer
  - `session_progress.quiz_state.hint_shown = true` once Hint card has been displayed
  - On correct answer: `session_progress.quiz_state.answered_correctly = true`; card 4 marked complete; user may advance to card 5

**Hint Card Behavior:**

| Trigger | Hint card content source | Dismissal |
|---------|--------------------------|-----------|
| 3rd consecutive wrong answer | `lessons.quiz_hint_text` field; lesson-specific contextual clue | Swipe left or tap "Got it" → returns to quiz card for re-attempt |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User is on card 4 (Quiz) | User selects the correct answer on first attempt | Answer highlighted green; checkmark displayed; "Swipe to continue" prompt appears; user can advance to card 5 |
| AC-02 | User is on card 4 | User selects a wrong answer | Answer highlighted red; shake animation; "Thử lại" (Try again) visible; current attempt count incremented |
| AC-03 | User has answered incorrectly twice | User answers incorrectly a 3rd time | Hint card slides in from right, displaying lesson-specific hint text |
| AC-04 | Hint card is shown | User swipes left on Hint card | Quiz card is shown again; user may attempt again |
| AC-05 | User answered incorrectly 5 times before getting it right | Lesson eventually completes | Full +25 XP awarded; no XP penalty for multiple attempts |
| AC-06 | User exits mid-quiz (app background, not killed) | User returns to app | Quiz card shown; attempt count for this session preserved |
| AC-07 | Analytics event | Any wrong answer submitted | Event `quiz_wrong_attempt` logged with `{user_id, lesson_id, question_id, attempt_number, selected_option, session_id}` |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| `quiz_hint_text` is null or empty in content DB | Hint card shows generic fallback: "Đọc lại thẻ Concept và Example để tìm gợi ý." (Re-read the Concept and Example cards for clues.) |
| User closes and reopens app after 2 wrong attempts | Session resumes; `attempt_count` is preserved; Hint card has NOT been shown yet; behavior continues as normal on next wrong answer |
| User closes and reopens after Hint card displayed but before correct answer | On resume: quiz card is shown; `hint_shown = true`; no re-display of Hint card required this session |

---

### FR-LEARN-05: "Try It Now" CTA Modal

- **Priority:** P0
- **Actor:** New User (F0 Trader)
- **Description:** Card 5 of every lesson is the CTA card, which presents a "Try it now" button. Tapping this button opens a task-scoped paper trading modal pushed over the current screen (not replacing it), pre-filled with the lesson's target action and a contextually relevant VN-listed stock. Dismissing the modal without completing the action is always permitted; the lesson still completes and XP is still awarded.
- **Input:**
  - `lesson_id`
  - `cta_config` from `lessons` table: `{cta_type, pre_filled_stock_ticker, pre_filled_action, modal_title}`
  - User's virtual portfolio state (to determine initialization need)
  - Pending order state (to determine confirmation modal need)
- **Output:**
  - Task-scoped paper trading modal pushed over lesson viewer
  - Back navigation from modal returns user to CTA card (card 5) of the current lesson
  - On modal dismissal (without action) OR completion of CTA action: lesson completion triggered
- **Precondition:**
  - User has reached card 5 of an active lesson
  - User is authenticated
- **Postcondition:**
  - `session_progress.cta_interacted` = `true` if user tapped "Try it now" (regardless of completion)
  - `session_progress.cta_completed` = `true` if user completed the target action in the modal
  - Lesson completion triggered when user leaves card 5 (either by completing CTA and returning, or swiping past)

**Pre-fill Specification per Lesson:**

| Lesson | `cta_type` | Pre-filled Stock | Pre-filled Action |
|--------|-----------|-----------------|-------------------|
| L1.1 | `BROWSE_STOCK_LIST` | — | Open stock list screen |
| L1.2 | `CHECK_MARKET_SESSION` | — | Open market session status screen |
| L1.3 | `OPEN_PRICE_BOARD` | — | Open price board screen |
| L1.4 | `READ_NEWS_ARTICLE` | — | Navigate to News tab, open first article |
| L1.5 | `ATTEMPT_CEILING_ORDER` | VIC (or equivalent HoSE blue-chip) | Place order 1% above ceiling price; system rejects with explanation |
| L2.1 | `PLACE_MARKET_ORDER` | VNM | Place MARKET BUY order, 100 shares |
| L2.2 | `ATTEMPT_ODD_LOT_ORDER` | FPT | Place order for 50 shares (odd lot); system rejects with explanation |
| L2.3 | `PLACE_LIMIT_BUY` | HPG | Place first BUY LIMIT order, pre-filled price = reference price |
| L2.4 | `VIEW_T2_LABEL` | — | Open portfolio screen; T+2 label highlighted on pending settlement |
| L2.5 | `OPEN_PNL_TAB` | — | Navigate to Portfolio P&L tab |
| L3.1 | `VIEW_SECTOR_BREAKDOWN` | — | Open portfolio sector breakdown view |
| L3.2 | `USE_SECTOR_FILTER` | — | Open Discover tab; activate sector filter |
| L3.3 | `ADD_TO_WATCHLIST` | VHM, VIC, VNM, FPT, HPG | Add all 5 pre-filled stocks to watchlist |
| L3.4 | `SET_PRICE_ALERT` | First stock in user's watchlist | Set price alert on selected stock |
| L3.5 | `OPEN_AI_INSIGHTS` | — | Open AI Insights tab |
| L4.1 | `VIEW_FOMO_PATTERNS` | — | Open trade history; AI FOMO pattern highlights displayed |
| L4.2 | `VIEW_BEHAVIORAL_FLAGS` | — | Open AI behavioral flags tab |
| L4.3 | `VIEW_FEE_TOTAL` | — | Open P&L history; fee total line highlighted |
| L4.4 | `VIEW_REALIZED_PNL` | — | Open realized P&L history screen |
| L4.5 | `SHARE_TRADING_RULES` | — | Open community post composer pre-filled with template |

**Virtual Portfolio Initialization Check:**

| User State | System Behavior |
|------------|-----------------|
| User has an existing virtual portfolio | Proceed to open CTA modal directly |
| User has NO virtual portfolio | Trigger virtual account auto-initialization (500,000,000 VND, per FR-PT-01) silently; display loading indicator (max 3s); then open CTA modal |
| Virtual account initialization fails | Show error: "Không thể khởi tạo tài khoản ảo. Thử lại?" Retry button present; lesson CTA remains available |

**Pending Order Confirmation:**

| User State | System Behavior |
|------------|-----------------|
| No pending orders | Open CTA modal immediately |
| ≥1 pending order exists | Show in-app confirmation modal: "Bạn đang có lệnh chờ khớp. Tiếp tục đến giao dịch thử?" with "Tiếp tục" (Continue) and "Quay lại" (Back) buttons; tapping Continue opens CTA modal; tapping Back returns to CTA card; pending orders are NOT cancelled by either action |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User is on CTA card (card 5) | User taps "Thử ngay" (Try it now) | Task-scoped paper trading modal pushes over lesson screen; back chevron is visible |
| AC-02 | CTA modal is open | User taps native back or back chevron | Modal dismisses; user is returned to CTA card (card 5) of the same lesson |
| AC-03 | User is on CTA card | User swipes left (past CTA card) without tapping "Try it now" | Lesson completes; +25 XP awarded; user exits to Grow tab |
| AC-04 | User has no virtual portfolio | User taps "Try it now" on any CTA card | Virtual account auto-initialized silently; CTA modal opens after initialization completes |
| AC-05 | User has a pending order | User taps "Try it now" | Pending order confirmation modal appears; tapping "Tiếp tục" proceeds to CTA modal; tapping "Quay lại" returns to CTA card; pending order is untouched |
| AC-06 | CTA type = `ATTEMPT_CEILING_ORDER` (L1.5) | User submits the pre-filled above-ceiling order | Order is rejected by the paper trading engine; rejection message explains price band rules (not a generic error) |
| AC-07 | CTA type = `ATTEMPT_ODD_LOT_ORDER` (L2.2) | User submits the pre-filled 50-share order | Order is rejected; rejection message explains board lot rules (minimum 100 shares) |
| AC-08 | CTA type = `SHARE_TRADING_RULES` (L4.5) | Community post modal opens | Template pre-populated: "3 quy tắc giao dịch của tôi: 1. ___ 2. ___ 3. ___"; user can edit before sharing |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| Pre-filled stock ticker is delisted or suspended | System selects next available blue-chip on same exchange; CTA modal opens normally; no error to user |
| Virtual account initialization takes > 3 seconds | Loading spinner persists; if > 10 seconds, show error with retry; lesson CTA card remains accessible |
| CTA type = `READ_NEWS_ARTICLE` and News tab has no articles | CTA modal opens News tab; if empty, shows "Chưa có tin tức mới" (No news yet); user may dismiss; lesson still completes |
| User completes CTA action but loses network before returning to lesson | Lesson completion is triggered on return to app; retry queue handles XP grant |

---

### FR-LEARN-06: Lesson Completion & XP Grant

- **Priority:** P0
- **Actor:** System (server-side event processor)
- **Description:** When a user reaches the end of card 5 (either by completing the CTA action and returning, or by swiping past the CTA card), the system triggers a lesson completion event. This fires a server-side event chain that grants +25 XP, updates skill tree progress, evaluates badge conditions, and (if the lesson is the final lesson of a module) fires the module completion event. All steps are idempotent and use queued retry.
- **Input:**
  - `user_id`
  - `lesson_id`
  - `session_id`
  - Idempotency key: `{user_id}:{lesson_id}` (prevents duplicate XP grant on retry)
- **Output:**
  - `lesson_completions` record created (or verified existing for idempotency)
  - +25 XP credited to user's XP balance (FR-GAME-01)
  - `skill_tree_progress` node for this lesson set to `COMPLETE`
  - Badge conditions evaluated
  - If final lesson of module: `module_completion` event fired (see FR-LEARN-09)
  - In-app XP toast shown: "+25 XP" with lesson title
- **Precondition:**
  - User is at card 5 of lesson and has either: swiped past the CTA card, OR completed the CTA action
  - `lesson_completions` record does NOT already exist for this `{user_id, lesson_id}` pair (idempotency check)
- **Postcondition:**
  - `lesson_completions` row exists with `completed_at` timestamp
  - `module_progress.lessons_completed_count` incremented by 1
  - XP balance updated (idempotent: if XP already granted for this key, no duplicate)

**Server-Side Event Chain (Priority Order):**

| Step | Action | Failure Behavior |
|------|--------|-----------------|
| 1 | Grant +25 XP (idempotent, queued retry, key = `{user_id}:{lesson_id}`) | Retry indefinitely in queue; never rolled back once committed |
| 2 | Update `skill_tree_progress` (evaluate and update lesson node state to `COMPLETE`) | Retry on failure; idempotent |
| 3 | Evaluate badge conditions (idempotent, queued retry) | Retry asynchronously; XP from step 1 is NEVER rolled back if step 3 fails |
| 4 | If final lesson of module: fire `module_completion` event | Retry asynchronously; steps 1–3 are not rolled back if step 4 fails |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User completes card 5 of L1.1 for the first time | Lesson completion event fires | `lesson_completions` row created; +25 XP in XP balance; XP toast "+25 XP" displayed on screen |
| AC-02 | User completes L1.1 (network drops after card 5 but before server ACK) | User reconnects | Retry queue sends completion event; XP granted exactly once (idempotency key prevents duplicate) |
| AC-03 | User replays a completed lesson (review mode) | User reaches card 5 again | No new `lesson_completions` row created; no XP granted (idempotency key already exists) |
| AC-04 | Badge evaluation (step 3) times out | — | XP (step 1) and skill tree update (step 2) are retained; badge evaluation retried async; user does not lose XP |
| AC-05 | User completes L1.5 (final lesson of Module 1) | Lesson completion fires | `module_completion` event fired for Module 1; +0 bonus XP for M1; "Market Foundations" badge awarded; Module 2 unlocked |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| Duplicate lesson completion event received (network retry double-fire) | Idempotency key check prevents duplicate `lesson_completions` row; XP granted exactly once |
| XP service unavailable for > 5 minutes | Event remains in retry queue; UI shows "XP đang xử lý..." (XP processing...); XP applied when service recovers |
| User's XP balance would exceed max level cap | XP granted up to cap; overflow discarded; no error |

---

### FR-LEARN-07: Session Auto-Save & Resume

- **Priority:** P0
- **Actor:** New User (F0 Trader) / System
- **Description:** The system automatically saves the user's progress within a lesson on every card completion. If the user exits the app (background or kill), closes a lesson, or loses connectivity mid-lesson, they can resume from the last saved card when they return.
- **Input:**
  - `user_id`, `lesson_id`, `session_id`
  - `card_index` (0-indexed; 0 = Concept, 1 = Example, 2 = Myth-Buster, 3 = Quiz, 4 = CTA)
  - `quiz_state` (attempt count, hint shown flag, correct flag)
- **Output:**
  - `session_progress` record upserted on each card completion
  - On re-entry to lesson: card viewer opens at `card_index + 1` (next unvisited card) or card 0 if no progress exists
- **Precondition:**
  - User has an active authenticated session
- **Postcondition:**
  - `session_progress.card_index` = index of last completed card
  - `session_progress.updated_at` = timestamp of last save

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User has completed cards 1–2 of L2.3 | User force-kills the app | On relaunch and re-entry to L2.3, card 3 (Myth-Buster) is shown |
| AC-02 | User has no prior progress on a lesson | User opens the lesson | Card 1 (Concept) is shown |
| AC-03 | User completes all 5 cards | User exits lesson | No `session_progress` resume record needed; lesson is in `lesson_completions`; next time user enters it is review mode |
| AC-04 | Save request fails (network error) | — | Client retries save locally; progress state held in memory; user sees no disruption; save committed on next successful request |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| User has two concurrent sessions (two devices) on the same lesson | Last-write-wins on `session_progress`; second device gets the latest saved state on next card load |
| `session_progress` record is corrupted or missing | Lesson starts from card 1; no error shown to user |

---

### FR-LEARN-08: Module Unlock Evaluation

- **Priority:** P0
- **Actor:** System (event processor)
- **Description:** Module unlock conditions are evaluated as a current-state check, not as an event sequence. This means if a user already meets the secondary prerequisite (e.g., ≥3 trades) before completing the primary prerequisite (e.g., Module 2), the module unlocks immediately upon the primary condition being satisfied. The evaluation is triggered by two event types: `lesson_completed` and `paper_trade_placed`.
- **Input:**
  - `user_id`
  - Event type: `lesson_completed` OR `paper_trade_placed`
  - Current state snapshot: module completion statuses, paper trade count, distinct trading days count
- **Output:**
  - If unlock conditions met for any module: `module_progress.status` updated from `LOCKED` to `UNLOCKED`
  - Push notification sent: "Module [N] đã được mở khóa!" (Module [N] is now unlocked!)
  - In-app notification badge on Grow tab
- **Precondition:**
  - User is authenticated
  - At least one module is currently in `LOCKED` state
- **Postcondition:**
  - All newly qualifying modules set to `UNLOCKED`
  - Evaluation is idempotent (re-evaluation does not re-unlock already-unlocked modules)

**Unlock Condition Matrix:**

| Module | Primary Prerequisite | Secondary Prerequisite | Evaluation Trigger |
|--------|---------------------|------------------------|-------------------|
| M1 | None | None | Auto-unlock on account creation (registration event) |
| M2 | M1 status = `COMPLETE` | None | `lesson_completed` (specifically L1.5) |
| M3 | M2 status = `COMPLETE` | `paper_trades_count` (main portfolio) ≥ 3 | `lesson_completed` (L2.5) OR `paper_trade_placed` |
| M4 | M3 status = `COMPLETE` | ≥1 trade placed on each of 5 distinct trading days (calendar days when VN markets are open) | `lesson_completed` (L3.5) OR `paper_trade_placed` |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User completes L1.5 (final lesson of M1) | Module completion event fires for M1 | M2 status set to `UNLOCKED`; user notified |
| AC-02 | User has already placed 5 paper trades before completing L2.5 | User completes L2.5 (final lesson of M2) | Module 3 unlocks immediately (current-state check confirms ≥3 trades already met); user notified |
| AC-03 | User completes M2 with only 1 paper trade | User places their 3rd paper trade later | `paper_trade_placed` event triggers M3 unlock evaluation; M3 unlocks immediately |
| AC-04 | User has M3 complete and has traded on 4 distinct days | User places a trade on the 5th distinct trading day | `paper_trade_placed` event triggers M4 unlock evaluation; M4 unlocks |
| AC-05 | M4 prerequisite check for "5 distinct trading days" | System evaluates | System counts calendar days on which ≥1 paper trade was placed (VN market open days only); non-trading days (weekends, holidays) are excluded from the count |
| AC-06 | Unlock evaluation fires twice in rapid succession (race condition) | — | Idempotency check on `module_progress` prevents duplicate unlock events; status is set once |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| User's trade history is unavailable at evaluation time | Evaluation deferred; queued for retry; module remains locked until evaluation succeeds |
| VN market holiday count: trades on holiday | Trades placed outside market hours (e.g., pre-market order that executes next open day) count toward the trading day of execution, not placement |
| User account suspended mid-path | Module unlock evaluation paused; resumes when account is reinstated |

---

### FR-LEARN-09: Module Completion Rewards

- **Priority:** P0
- **Actor:** System (event processor)
- **Description:** When the final lesson of a module is completed, the system fires a `module_completion` event that grants the module's bonus XP (if any), awards the module badge, and triggers module unlock evaluation for the next module. A celebratory animation is shown in-app.
- **Input:**
  - `user_id`
  - `module_id` (M1, M2, M3, or M4)
  - Final `lesson_id` of the module
- **Output:**
  - Module bonus XP credited (M1: 0, M2: 0, M3: +25, M4: +75)
  - Module badge awarded (see table below)
  - `module_progress.status` updated to `COMPLETE`
  - `module_progress.completed_at` timestamp written
  - Module unlock evaluation triggered for next module (FR-LEARN-08)
  - In-app celebration modal shown: confetti animation, badge image, XP earned
  - For M2 only: bonus cash ledger entry created (FR-LEARN-10)
- **Precondition:**
  - All 5 lessons in the module have `lesson_completions` records for this `user_id`
  - `module_completion` event has NOT previously been processed for this `{user_id, module_id}` (idempotency)
- **Postcondition:**
  - `module_progress.status = COMPLETE`
  - Badge record created in `user_badges` table
  - XP balance updated with module bonus

**Module Reward Summary:**

| Module | Lesson XP (5×25) | Bonus XP | Total XP | Badge Name | Badge Rarity | Extra Reward |
|--------|-----------------|----------|----------|------------|--------------|--------------|
| M1 | 125 | 0 | 125 | Market Foundations | Common | None |
| M2 | 125 | 0 | 125 | First Trader | Common | 50,000,000 VND bonus virtual cash (7-day TTL) |
| M3 | 125 | 25 | 150 | Portfolio Thinker | Uncommon | None |
| M4 | 125 | 75 | 200 | Market Scholar | **Rare** | Community posting eligibility (Tier 2) — cross-ref FR-GAME-06 |

> **OQ-05 resolved:** Market Scholar upgraded to **Rare** (`#60A5FA`). Rationale: M4 is the capstone of the entire F0 journey (20 lessons, 4 MKCs passed, 5 distinct trading days). Common would undersell the achievement. Rare matches the effort tier and the "Scholar" naming convention.

**Module Completion Modal — XP Display Rules (OQ-06 resolved):**

| Module | XP Line 1 | XP Line 2 | Notes |
|--------|----------|-----------|-------|
| M1 | "+125 XP từ bài học" | — | Single line; no bonus |
| M2 | "+125 XP từ bài học" | — | Single line; no bonus |
| M3 | "+125 XP từ bài học" | "+25 XP 🎓 Thưởng hoàn thành!" | Two separate line items; both in `lime`; bonus line slightly smaller (`Space Grotesk 16 Medium`) |
| M4 | "+125 XP từ bài học" | "+75 XP 🎓 Thưởng hoàn thành!" | Two separate line items; same treatment as M3 |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User completes L1.5 | Module completion event fires for M1 | Celebration modal shown with "Market Foundations" badge; +125 XP total shown (5×25, no bonus); Module 2 unlocked notification fires |
| AC-02 | User completes L2.5 | Module completion event fires for M2 | "First Trader" badge awarded; 50,000,000 VND bonus cash ledger entry created; celebration modal shows bonus cash award; Module 3 unlock evaluation triggered |
| AC-03 | User completes L3.5 | Module completion event fires for M3 | "Portfolio Thinker" badge (Uncommon) awarded; +150 XP shown (125 lessons + 25 bonus); Module 4 unlock evaluation triggered |
| AC-04 | User completes L4.5 | Module completion event fires for M4 | "Market Scholar" badge (Rare — `#60A5FA` border) awarded; "+125 XP từ bài học" and "+75 XP 🎓 Thưởng hoàn thành!" shown as two line items; community posting eligibility flag set; cross-reference to FR-GAME-06 evaluated |
| AC-05 | `module_completion` event fires twice for same user + module (retry scenario) | — | Idempotency check prevents duplicate badge award and duplicate XP grant |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| Badge service unavailable when M3 completes | Badge award queued for async retry; XP from step 1 is not rolled back; user sees "Badge will appear shortly" placeholder in completion modal |
| All 5 lesson completions exist but `module_completion` event was never processed (event loss) | Reprocessing job runs daily to detect and fire missing `module_completion` events based on `lesson_completions` data |

---

### FR-LEARN-10: Module 2 Bonus Cash (50,000,000 VND)

- **Priority:** P0
- **Actor:** System (event processor) / New User (F0 Trader)
- **Description:** Upon Module 2 completion, the system credits 50,000,000 VND of bonus virtual cash to the user's virtual portfolio as a separate ledger line. This bonus cash is tracked independently from the user's main virtual cash balance and is never merged with it. The bonus cash is available for paper trades for 7 calendar days from the time of award. Users are notified at T-24h and T-1h before expiry.
- **Input:**
  - `user_id`
  - `module_completion` event for M2
  - `awarded_at` timestamp
- **Output:**
  - `bonus_cash_ledger` record created: `{user_id, amount: 50000000, currency: VND, ledger_source: "module_2_completion", awarded_at, expires_at: awarded_at + 7 days, status: ACTIVE}`
  - Virtual portfolio UI shows bonus cash as a separate line item labelled "Tiền thưởng học tập" (Learning bonus cash) with expiry countdown
  - Notifications scheduled: T-24h push, T-1h push
- **Precondition:**
  - `module_completion` for M2 has fired for this `user_id`
  - No existing `ACTIVE` bonus cash ledger entry for this user from `module_2_completion` source (idempotency)
- **Postcondition:**
  - `bonus_cash_ledger` record exists with `status = ACTIVE`
  - Two push notifications scheduled in notification queue
  - User's main virtual cash balance is UNCHANGED

**Bonus Cash Usage Rules:**

| Rule | Behavior |
|------|----------|
| Separate ledger | Bonus cash displayed as a separate line in virtual portfolio; never added to main cash balance figure |
| Available for trades | User may use bonus cash to place paper trades during 7-day TTL |
| Trade XP | Trades funded by bonus cash earn standard trade XP; `portfolio_type = "main"` for XP purposes |
| `ledger_source` | All bonus cash transactions tagged `ledger_source = "module_2_completion"` |
| Main balance unaffected | User's main 500,000,000 VND virtual cash balance is not modified by bonus cash operations |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User completes L2.5 (Module 2 final lesson) | Module 2 completion fires | `bonus_cash_ledger` record created with 50,000,000 VND, `status = ACTIVE`, `expires_at = awarded_at + 7 days` |
| AC-02 | Bonus cash is active | User views virtual portfolio | Bonus cash shown as separate line "Tiền thưởng học tập: 50,000,000 VND – còn X ngày" (Learning bonus: 50M VND – X days remaining) |
| AC-03 | Bonus cash is active | User places a paper trade funded by bonus cash | Trade executes normally; trade XP earned as standard; `ledger_source = "module_2_completion"` on trade record |
| AC-04 | User's main virtual cash balance is 480,000,000 VND | Module 2 completes | Main cash balance remains 480,000,000 VND; bonus cash shown as separate 50,000,000 VND line |
| AC-05 | Module 2 completion event fires twice (retry) | — | Idempotency check: second event finds existing `ACTIVE` bonus cash ledger entry; no duplicate created |

**Notifications Specification:**

| Timing | Push Title | Push Body |
|--------|-----------|-----------|
| T-24h before expiry | "Tiền thưởng sắp hết hạn" | "Tiền thưởng học tập của bạn sẽ hết hạn vào ngày mai. Hãy sử dụng trước khi mất!" |
| T-1h before expiry | "Còn 1 giờ!" | "Tiền thưởng học tập của bạn hết hạn sau 1 giờ nữa. Giao dịch ngay!" |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| Push notification service unavailable at scheduled send time | Retry for up to 30 minutes; if still unavailable, deliver in-app notification banner instead |
| User has disabled push notifications | In-app notification banner shown on next app open instead; no SMS fallback |
| User places a trade that uses both bonus cash and main cash (order size exceeds bonus cash balance) | System allocates bonus cash first; remainder drawn from main cash; `ledger_source` split recorded per funding source |

---

### FR-LEARN-11: Bonus Cash Expiry & Force-Liquidation

- **Priority:** P0
- **Actor:** System (scheduled job)
- **Description:** At T+7 days after bonus cash award, the system runs expiry processing: all open positions funded by bonus cash are force-liquidated at the last available market price. Realized P&L from those positions is retained in the main portfolio. The uninvested bonus cash balance (if any) is removed. The bonus cash ledger entry is marked `EXPIRED`.
- **Input:**
  - `bonus_cash_ledger` records where `status = ACTIVE` AND `expires_at ≤ NOW()`
  - Open positions tagged `ledger_source = "module_2_completion"` for each qualifying user
  - Last available market price for each position's ticker
- **Output:**
  - Force-liquidation trade records created for each open bonus cash position
  - Realized P&L calculated and added to main portfolio P&L
  - Bonus cash ledger entry: `status = EXPIRED`, `expired_at = NOW()`
  - Uninvested bonus cash balance set to 0 (removed from display)
  - In-app notification: "Tiền thưởng học tập đã hết hạn. P&L đã được lưu vào danh mục của bạn."
- **Precondition:**
  - `bonus_cash_ledger.expires_at ≤ NOW()`
  - `bonus_cash_ledger.status = ACTIVE`
- **Postcondition:**
  - No open positions remain tagged to `module_2_completion` bonus cash source
  - Realized P&L from liquidated positions is in main portfolio history
  - `bonus_cash_ledger.status = EXPIRED`
  - Bonus cash no longer visible in portfolio UI

**Liquidation Price Logic:**

| Market State at T+7 | Price Used |
|--------------------|-----------|
| Market is open | Last traded price at time of job execution |
| Market is closed (after hours, weekend, holiday) | Last closing price from most recent trading session |
| Stock is suspended | Last available traded price before suspension; position flagged with suspension note |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User has 2 open positions funded by bonus cash and 10,000,000 VND uninvested bonus cash remaining | T+7 expiry job runs | Both positions force-liquidated at last market price; realized P&L added to main portfolio; 10M uninvested bonus removed; ledger `status = EXPIRED` |
| AC-02 | User invested all 50,000,000 VND in open positions | T+7 expiry job runs | All positions liquidated; all P&L retained in main portfolio; 0 VND uninvested bonus removed; ledger `EXPIRED` |
| AC-03 | User has no open positions and 50,000,000 VND uninvested | T+7 expiry job runs | No liquidations needed; 50M bonus balance removed; ledger `EXPIRED` |
| AC-04 | T+7 job runs during market closed hours | — | Last closing price used for liquidation; no error |
| AC-05 | Force-liquidation fails for one position (e.g., data service error) | — | Retry up to 3 times with 5-minute intervals; if still failing, flag position in `ops_review_queue` for manual resolution; other positions liquidated normally |
| AC-06 | User sells all bonus cash positions before T+7 | T+7 job runs | No open positions to liquidate; uninvested bonus balance removed; P&L already in main portfolio from user's own earlier sale |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| T+7 falls on a public holiday | Job runs at scheduled time using last available closing price; no delay |
| Multiple bonus cash ledger records exist for a user (theoretically impossible given idempotency, but defensive check) | System processes only the most recent `ACTIVE` record; flags duplicates for ops review |
| User's account is suspended at T+7 | Force-liquidation still runs; P&L retained; user sees results on account reinstatement |

---

### FR-LEARN-12: Daily Missions Gate

- **Priority:** P1
- **Actor:** New User (F0 Trader) / System
- **Description:** The Daily Missions widget (FR-GAME-08) is not displayed to any user who has not yet completed Module 1. Before Module 1 is complete, the "Today's Goals" widget on the Home tab shows a locked state with a prompt to complete Module 1. Once Module 1 is complete, Daily Missions are unlocked permanently for that user.
- **Input:**
  - `user_id`
  - `module_progress` status for M1
- **Output:**
  - If M1 `status ≠ COMPLETE`: Today's Goals widget shows locked state with message
  - If M1 `status = COMPLETE`: Daily Missions rendered normally per FR-GAME-08
- **Precondition:**
  - User is authenticated and on Home tab
- **Postcondition:**
  - No state change on read; gate is evaluated on every Home tab render

**Locked State Widget Specification:**

| Element | Value |
|---------|-------|
| Widget title | "Nhiệm vụ hôm nay" (Today's Goals) |
| Locked message | "Hoàn thành Module 1 để mở khóa nhiệm vụ hàng ngày" (Complete Module 1 to unlock daily missions) |
| CTA in locked state | "Bắt đầu học" (Start learning) → navigates to Grow tab |
| Visual | Greyed-out mission item placeholders (2 skeleton rows) with padlock icon |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | New user has completed 0 modules | User opens Home tab | Today's Goals widget shows locked state with prompt message and "Bắt đầu học" CTA |
| AC-02 | User completes L1.5 (Module 1 final lesson) | Module 1 completion event fires | Daily Missions unlocked; Today's Goals widget shows live missions on next Home tab render |
| AC-03 | User with Module 1 complete | User opens Home tab | Daily Missions displayed normally; no locked state shown |
| AC-04 | Locked state CTA tapped | User taps "Bắt đầu học" | User navigated to Grow tab (Learning Path home) |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| Module 1 completion event fires but `module_progress` read is stale on Home tab | Next Home tab render (refresh or re-navigation) will show unlocked state; no manual action needed |
| User completes M1 while Home tab is in background | On foreground: Home tab re-evaluates gate; missions shown correctly |

---

### FR-LEARN-13: Module 1 — The VN Stock Market

- **Priority:** P0
- **Actor:** New User (F0 Trader)
- **Description:** Module 1 consists of 5 lessons introducing the Vietnamese stock market. It is auto-unlocked upon account registration. No prerequisite actions are required. All 5 lessons follow the standard card-stack format (FR-LEARN-03).

**Module 1 Lesson Specifications:**

| Lesson ID | Title | Core Concept | CTA Type | CTA Pre-fill |
|-----------|-------|--------------|----------|-------------|
| L1.1 | Cổ phiếu là gì? (What is a stock?) | Stock = ownership share in a company; VN example (VNM, VIC) | `BROWSE_STOCK_LIST` | Open stock discovery/search screen |
| L1.2 | HoSE & HNX hoạt động như thế nào? | Two main VN exchanges, trading hours (9:00–11:30, 13:00–14:45 ATO/ATC), tickers | `CHECK_MARKET_SESSION` | Open market session status indicator |
| L1.3 | Đọc bảng giá (Reading the Price Board) | Reference price, ceiling/floor bands: HoSE ±7%, HNX ±10%, UPCoM ±15%; color coding green/red/purple | `OPEN_PRICE_BOARD` | Open price board screen (default to HoSE view) |
| L1.4 | Điều gì khiến giá cổ phiếu thay đổi? (What moves stock prices?) | Supply/demand, earnings reports, macro news, sentiment | `READ_NEWS_ARTICLE` | Open News tab; first available article |
| L1.5 | Biên độ giá tại Việt Nam (Price Bands in Vietnam) | Ceiling/floor enforcement; why above-ceiling orders are rejected; difference between exchanges | `ATTEMPT_CEILING_ORDER` | Pre-fill: VIC; price = ceiling price + 1%; order type BUY |

- **Precondition:** Account created (status = `ACTIVE`); M1 auto-unlocked on registration
- **Postcondition (on all 5 lessons complete):** `module_completion` fires; +125 XP; "Market Foundations" (Common) badge awarded; M2 unlocked

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | New user completes registration | App initializes | M1 status = `UNLOCKED` in Grow tab; L1.1 is the first available lesson |
| AC-02 | User completes L1.5 CTA (submits above-ceiling order) | Paper trading modal processes the order | Order is rejected; modal shows educational rejection message explaining ceiling price rule (specific to L1.5 content, not generic error) |
| AC-03 | User completes all 5 lessons | Module 1 completion fires | Celebration modal: "Market Foundations" badge shown; "+125 XP" displayed; Module 2 card changes to `UNLOCKED` in Grow tab |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| VIC stock is circuit-breaker halted when L1.5 CTA opens | System substitutes next available HoSE-listed large-cap; CTA still demonstrates ceiling rejection |
| Market is closed when L1.2 CTA opens | Market session screen shows "Thị trường đóng cửa" (Market closed) state; this is educationally valid; lesson still completes |

---

### FR-LEARN-14: Module 2 — Your First Trade

- **Priority:** P0
- **Actor:** New User (F0 Trader)
- **Description:** Module 2 teaches practical order placement mechanics for the VN market. It is unlocked after Module 1 is complete. All 5 lessons follow the standard card-stack format. Upon completion, the user receives the "First Trader" badge and 50,000,000 VND bonus virtual cash (FR-LEARN-10).

**Module 2 Lesson Specifications:**

| Lesson ID | Title | Core Concept | CTA Type | CTA Pre-fill |
|-----------|-------|--------------|----------|-------------|
| L2.1 | Lệnh Thị trường vs. Lệnh Giới hạn (Market vs. Limit Orders) | Difference between market (ATO/ATC/LO) and limit orders; VN-specific order types | `PLACE_MARKET_ORDER` | VNM; BUY MARKET order; 100 shares |
| L2.2 | Lô cổ phiếu tại Việt Nam (Board Lots) | Minimum 100-share multiples; odd-lot rejection; why this rule exists | `ATTEMPT_ODD_LOT_ORDER` | FPT; BUY order; 50 shares (intentional odd lot) |
| L2.3 | Hướng dẫn Mua & Bán (Buy & Sell Walkthrough) | Full order flow: select stock → set quantity → set price → confirm; T+2 preview | `PLACE_LIMIT_BUY` | HPG; BUY LIMIT; 100 shares; price = reference price |
| L2.4 | T+2 là gì? (What is T+2 Settlement?) | Settlement timeline; when shares/cash become available; holding period | `VIEW_T2_LABEL` | Navigate to portfolio; T+2 settlement label highlighted on any pending position |
| L2.5 | Kiểm tra P&L (Checking your P&L) | Unrealized vs. realized P&L; how to read green/red; percentage vs. absolute VND | `OPEN_PNL_TAB` | Open Portfolio P&L tab |

- **Precondition:** M1 `status = COMPLETE`
- **Postcondition (on all 5 lessons complete):** `module_completion` fires; +125 XP; "First Trader" (Common) badge; 50,000,000 VND bonus cash created; M3 unlock evaluation triggered

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User completes L2.2 CTA (submits 50-share order) | Paper trading modal processes order | Order rejected with message: "Lô giao dịch tối thiểu là 100 cổ phiếu. Vui lòng đặt theo bội số của 100." (Minimum board lot is 100 shares. Please place in multiples of 100.) |
| AC-02 | User completes L2.3 CTA (places first limit buy) | Order placed successfully | Trade record created; XP from trade awarded per FR-GAME-01; trade counts toward M3 prerequisite |
| AC-03 | User completes all 5 M2 lessons | Module completion fires | Celebration modal shows "First Trader" badge, "+125 XP", and "Bạn nhận được 50,000,000 VND tiền thưởng học tập!" (You received 50M VND learning bonus!) with 7-day countdown |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| User has zero portfolio positions when L2.4 CTA opens | T+2 label screen shows empty state with "Đặt lệnh đầu tiên để xem nhãn T+2" (Place your first order to see the T+2 label); lesson still completes |
| VNM (pre-fill for L2.1) is suspended | System substitutes next available HoSE blue-chip; trade executes normally |

---

### FR-LEARN-15: Module 3 — Thinking in Portfolios

- **Priority:** P1
- **Actor:** New User (F0 Trader, progressed)
- **Description:** Module 3 introduces portfolio-level thinking: diversification, sectors, watchlists, and AI-powered health scoring. It is unlocked when BOTH conditions are met: M2 is complete AND the user has placed ≥3 paper trades on the main portfolio. All 5 lessons follow the standard card-stack format.

**Module 3 Lesson Specifications:**

| Lesson ID | Title | Core Concept | CTA Type | CTA Pre-fill |
|-----------|-------|--------------|----------|-------------|
| L3.1 | Đa dạng hóa cơ bản (Diversification Basics) | Don't put all eggs in one basket; correlation; VN sector mix example | `VIEW_SECTOR_BREAKDOWN` | Open portfolio sector pie chart view |
| L3.2 | Các ngành tại Việt Nam (VN Sectors Crash Course) | 11 GICS sectors in VN market; notable companies per sector | `USE_SECTOR_FILTER` | Open Discover tab; activate sector filter (default: Real Estate) |
| L3.3 | Danh sách theo dõi là gì? (What is a Watchlist?) | Purpose of watchlist; price alerts; monitoring without buying | `ADD_TO_WATCHLIST` | Pre-fill 5 stocks: VHM, VIC, VNM, FPT, HPG |
| L3.4 | Đặt cảnh báo giá (Setting a Price Alert) | How price alerts work; alert types (above/below target price) | `SET_PRICE_ALERT` | First stock in user's watchlist; alert type = price above reference |
| L3.5 | Kiểm tra sức khỏe danh mục (Portfolio Health Check) | AI portfolio score; diversification score; risk concentration warnings | `OPEN_AI_INSIGHTS` | Open AI Insights tab (portfolio health view) |

- **Precondition:** M2 `status = COMPLETE` AND `paper_trades_count` (main portfolio) ≥ 3
- **Postcondition (on all 5 lessons complete):** `module_completion` fires; +150 XP (125 lessons + 25 bonus); "Portfolio Thinker" (Uncommon) badge; M4 unlock evaluation triggered

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User has M2 complete and exactly 2 trades | User views Grow tab | M3 shows `LOCKED` state; tooltip: "Đặt ít nhất 3 lệnh để mở khóa Module 3" |
| AC-02 | User places their 3rd trade | `paper_trade_placed` event fires | M3 unlock evaluation triggered; M3 unlocks immediately (since M2 also complete); notification sent |
| AC-03 | User completes L3.3 CTA (add 5 stocks to watchlist) | CTA modal pre-fills 5 stocks | All 5 stocks added in a single confirmation action; deduplication applied server-side; user sees 2-second toast: "Đã thêm [N] cổ phiếu mới · [M] đã có sẵn" where N = newly added count, M = already-in-watchlist count; if all 5 were already in watchlist: toast reads "5 cổ phiếu đã có trong danh sách theo dõi"; lesson still completes. (OQ-07 resolved) |
| AC-04 | User completes all 5 M3 lessons | Module completion fires | Celebration modal shows "Portfolio Thinker" badge (Uncommon — distinct visual treatment), "+150 XP" |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| User's watchlist is empty when L3.4 CTA opens | CTA opens watchlist screen with prompt to add stocks first; L3.3 is a prerequisite lesson in sequence, so user should have at least 5 watchlist stocks by this point; if somehow empty (e.g., user deleted), show prompt to add a stock before setting alert |
| AI Insights tab is unavailable (service down) when L3.5 CTA opens | CTA shows error state: "AI Insights tạm thời không khả dụng. Thử lại sau."; lesson still completes if user dismisses |

---

### FR-LEARN-16: Module 4 — Trader Psychology

- **Priority:** P1
- **Actor:** New User (F0 Trader, advanced)
- **Description:** Module 4 covers behavioral finance concepts specific to retail traders, including FOMO, panic selling, and overtrading. It is unlocked when BOTH conditions are met: M3 is complete AND the user has placed ≥1 trade on each of 5 distinct VN market trading days. All 5 lessons follow the standard card-stack format. Completion makes the user eligible for community posting (Tier 2).

**Module 4 Lesson Specifications:**

| Lesson ID | Title | Core Concept | CTA Type | CTA Pre-fill |
|-----------|-------|--------------|----------|-------------|
| L4.1 | FOMO là gì? (What is FOMO?) | Fear of missing out; chasing momentum; VN retail bubble examples | `VIEW_FOMO_PATTERNS` | Open trade history; AI overlays FOMO pattern highlights (trades placed within 30 min of sharp price spike) |
| L4.2 | Mô hình bán hoảng loạn (The Panic Sell Pattern) | Panic selling at bottom; V-shaped recovery; cost of emotion | `VIEW_BEHAVIORAL_FLAGS` | Open AI behavioral flags tab |
| L4.3 | Giao dịch quá mức (Overtrading Explained) | Transaction costs accumulate; fee drag on P&L; frequency vs. quality | `VIEW_FEE_TOTAL` | Open P&L history; fee total line highlighted/annotated |
| L4.4 | Tỷ lệ thắng vs. Hệ số lợi nhuận (Win Rate vs. Profit Factor) | Win rate alone is misleading; profit factor = gross profit / gross loss; position sizing | `VIEW_REALIZED_PNL` | Open realized P&L history screen |
| L4.5 | Xây dựng quy tắc giao dịch (Building Your Trading Rules) | Rule-based trading; stop-loss discipline; journaling | `SHARE_TRADING_RULES` | Community post composer; template: "3 quy tắc giao dịch của tôi: 1. ___ 2. ___ 3. ___" |

- **Precondition:** M3 `status = COMPLETE` AND ≥1 trade placed on each of 5 distinct VN market trading calendar days
- **Postcondition (on all 5 lessons complete):** `module_completion` fires; +200 XP (125 lessons + 75 bonus, displayed as two separate line items per FR-LEARN-09); "Market Scholar" (**Rare**, `#60A5FA`) badge (cross-ref FR-GAME-06); `user_profile.community_tier` evaluated for Tier 2 eligibility; community posting enabled if total XP ≥ 500 (Tier 2 threshold per BR-LEARN-22)

**Trading Days Definition for M4 Prerequisite:**

| Term | Definition |
|------|-----------|
| "Distinct trading day" | A calendar date on which ≥1 VN stock exchange (HoSE or HNX) was open for trading AND the user placed ≥1 paper trade (order placed, not necessarily filled) |
| Weekend | Saturday and Sunday are excluded; not counted as trading days |
| Public holidays | VN national holidays (per official HOSE/HNX holiday calendar) are excluded |
| Non-consecutive | The 5 days do not need to be consecutive; any 5 qualifying days within the user's trade history suffice |
| ATO order day boundary | An ATO (pre-open) order placed before 09:15 counts for the **calendar date of placement** — not the session date on which it fills. `trade_day = DATE(order.placed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')`. (OQ-04 resolved) |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User has M3 complete and has traded on only 3 distinct days | User views Grow tab | M4 shows `LOCKED`; tooltip: "Giao dịch ít nhất 5 ngày để mở khóa Module 4" (Trade on at least 5 days to unlock Module 4) |
| AC-02 | User places a trade on their 5th distinct trading day | `paper_trade_placed` event fires | M4 unlock evaluation triggered; M4 unlocks; notification: "Module 4 đã mở khóa!" |
| AC-03 | User completes L4.5 CTA (share post) | Community post modal opens with template | Post is pre-populated; user can edit each "___" field; tapping "Chia sẻ" posts to community feed; tapping "Bỏ qua" dismisses without posting; lesson completes in both cases |
| AC-04 | User completes all 5 M4 lessons | Module completion fires | "+125 XP từ bài học" and "+75 XP 🎓 Thưởng hoàn thành!" shown as two line items; "Market Scholar" badge (Rare) awarded; if user's total XP ≥ 500 (Tier 2 threshold, BR-LEARN-22), community posting enabled immediately |
| AC-05 | AI behavioral flags are empty (no detected patterns) when L4.2 CTA opens | CTA modal opens | Screen shows "Chưa phát hiện mô hình hành vi đáng chú ý" (No behavioral patterns detected yet); lesson still completes |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| User traded on a day later declared a VN holiday make-up session | The trade day counts if HoSE/HNX was officially open that day per their published calendar |
| Community posting feature is unavailable when L4.5 CTA fires | CTA shows error: "Tính năng cộng đồng tạm thời không khả dụng"; lesson still completes; community eligibility flag still set |
| User completes M4 but total XP is still below Tier 2 threshold (edge case: account rollback) | Community posting remains locked; system re-evaluates on next XP grant event |

---

### FR-LEARN-17: User Learning Level System

- **Priority:** P1
- **Actor:** System (event-driven) / Registered User
- **Description:** A knowledge-based Learning Level (L0–L5) tracks the user's progress through the F0 Learning Path independently of the Trader Tier system (FR-GAME-02). The Learning Level advances when module completion and Knowledge Check conditions are met. It is displayed as a pill badge on the user profile.

**Level Definitions:**

| Level ID | VN Name | EN Name | Advance Condition |
|----------|---------|---------|------------------|
| `LVL_F0_NEWCOMER` | Tân binh | Newcomer | Account created (starting state) |
| `LVL_F0_EXPLORING` | Đang khám phá | Exploring | ≥1 lesson in M1 completed |
| `LVL_F1_BASICS` | Hiểu thị trường | Market Basics | M1 complete AND MKC-1 passed (≥3/5) |
| `LVL_F1_TRADER` | Biết giao dịch | Can Trade | M2 complete AND MKC-2 passed AND ≥5 paper trades placed |
| `LVL_F2_PORTFOLIO` | Tư duy danh mục | Portfolio Thinker | M3 complete AND MKC-3 passed |
| `LVL_F2_DISCIPLINED` | Trader có kỷ luật | Disciplined Trader | M4 complete AND MKC-4 passed |

**Key Rules:**
- Learning Level can only advance, never decrease.
- Level re-evaluated after every lesson completion, module completion, and Knowledge Check result.
- **Level advancement is event-based, not XP-threshold-based.** Each level has explicit completion-event conditions (see table above). XP accumulation does NOT trigger level advancement — only the listed events do. (OQ-A resolved)
- XP on level-up: +15 XP per level advancement (idempotency key: `{user_id}_{level_id}_LEVEL_UP`).
- Display: pill badge on profile below username, separate from Trader Tier badge.

**Advance Condition Summary (authoritative):**

| Level Transition | Event(s) Required |
|-----------------|-------------------|
| NEWCOMER → EXPLORING | Any 1 lesson in M1 completed |
| EXPLORING → F1_BASICS | All 5 M1 lessons complete AND MKC-1 passed (≥3/5) |
| F1_BASICS → F1_TRADER | All 5 M2 lessons complete AND MKC-2 passed AND ≥5 paper trades placed (main portfolio) |
| F1_TRADER → F2_PORTFOLIO | All 5 M3 lessons complete AND MKC-3 passed |
| F2_PORTFOLIO → F2_DISCIPLINED | All 5 M4 lessons complete AND MKC-4 passed |

> **There are no XP thresholds for level advancement.** References in the UI to "XP threshold for level-up" (OQ-A blocker) were erroneous. The system checks event conditions only. The +15 XP granted on level-up is a reward for the event, not a prerequisite.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-17-1 | New user with account just created | Opens profile | Learning Level shows "Tân binh" (no badge displayed; level 0 is invisible) |
| AC-17-2 | User completes L1.1 | Lesson completion fires | Learning Level advances to "Đang khám phá"; +15 XP granted; badge visible |
| AC-17-3 | User completes all M1 lessons and passes MKC-1 (≥3/5) | Knowledge check result processed | Level advances to "Hiểu thị trường"; +15 XP; profile badge updated |
| AC-17-4 | Level-up event fires twice (retry) | — | Idempotency key prevents duplicate XP and duplicate level record |

---

### FR-LEARN-18: Module Knowledge Check (MKC)

- **Priority:** P1
- **Actor:** New User (F0 Trader)
- **Description:** After completing all 5 lessons in a module, a 5-question Module Knowledge Check (MKC) is unlocked. The user must score ≥3/5 to advance the Learning Level and unblock next-module unlock evaluation. The MKC is not required to receive the module completion badge or XP — those are awarded on lesson completion per FR-LEARN-09. The MKC gates Learning Level advancement only. Retries are unlimited with a 60-second cooldown between attempts.

**MKC Structure:**
- 5 questions; one question per lesson in the module (covers all 5 lesson topics)
- Questions presented in randomized order each attempt
- 4 answer options per question; exactly 1 correct answer
- Passing threshold: ≥3 correct (60%)
- No time limit per question

**MKC–Module Mapping:**

| MKC ID | Module | Questions Drawn From |
|--------|--------|---------------------|
| MKC-1 | M1 — The VN Stock Market | L1.1, L1.2, L1.3, L1.4, L1.5 |
| MKC-2 | M2 — Your First Trade | L2.1, L2.2, L2.3, L2.4, L2.5 |
| MKC-3 | M3 — Thinking in Portfolios | L3.1, L3.2, L3.3, L3.4, L3.5 |
| MKC-4 | M4 — Trader Psychology | L4.1, L4.2, L4.3, L4.4, L4.5 |

> Full question text, answer options, correct answers, and hint text for all 4 MKCs are defined in `module-f0-learning-content.md` §3.

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-18-1 | User has completed all 5 lessons in M1 but not yet taken MKC-1 | User opens Grow tab → M1 card | "Knowledge Check available" CTA shown below M1 progress bar |
| AC-18-2 | User scores 2/5 on MKC-1 | Result displayed | Learning Level does NOT advance; "Thử lại" button shown; 60-second cooldown starts |
| AC-18-3 | User scores 3/5 on MKC-1 | Result displayed | Learning Level advances to "Hiểu thị trường"; +15 XP; M2 unlock evaluation triggered |
| AC-18-4 | User scores 5/5 on MKC-1 | Result displayed | Same as AC-18-3; no additional bonus (pass is pass) |
| AC-18-5 | User retries MKC-1 within 60-second cooldown | — | Retry button disabled with countdown timer; cannot start new attempt |
| AC-18-6 | User has already passed MKC-1 | Opens M1 card | "Knowledge Check" shows as passed (checkmark); no re-take required |

**Edge Cases:**

| Case | Expected Behavior |
|------|-------------------|
| User passes MKC but network drops before result ACK | Result saved optimistically client-side; synced on reconnect; no re-test required |
| Question content fails to load (API error) | Show error state with "Thử lại"; MKC attempt not counted; no cooldown applied |
| User passes MKC for a module they completed via Placement Quiz skip | Not applicable — MKC-1 not required for Placement Quiz skipees; Learning Level set directly to L2 on placement pass |

---

### FR-LEARN-19: Initial Placement Quiz

- **Priority:** P2
- **Actor:** New User (F0 Trader)
- **Description:** An optional 5-question placement quiz offered when the user taps "Tôi đã biết chứng khoán cơ bản" (I already know the basics) on the Welcome Modal (FR-LEARN-01). Scoring ≥4/5 allows the user to skip Module 1 and start from Module 2. One attempt per account — cannot be retried.

**Placement Quiz Spec:**
- 5 questions covering M1 core topics (exchanges, trading hours, price bands, order types, T+2)
- Pass threshold: 4/5 correct (80%)
- One attempt only; result is final

> Full question text, answer options, correct answers, and hint text are defined in `module-f0-learning-content.md` §2.

**Outcome Mapping:**

| Score | Outcome | Learning Level Set To |
|-------|---------|----------------------|
| 4–5/5 | Skip M1; M2 unlocked; M1 accessible in review mode; `placement_quiz_passed = true` | `LVL_F1_BASICS` immediately |
| 0–3/5 | M1 required; message: "Hãy bắt đầu từ Module 1 để xây nền vững chắc!" | `LVL_F0_EXPLORING` (start normally) |

**Acceptance Criteria:**

| # | Given | When | Then |
|---|-------|------|------|
| AC-19-1 | User taps "Tôi đã biết chứng khoán cơ bản" on Welcome Modal | — | Placement Quiz screen opens with 5 questions |
| AC-19-2 | User scores 4/5 or 5/5 | Quiz submitted | M1 set to `SKIPPED_VIA_PLACEMENT`; M2 unlocked; Learning Level = `LVL_F1_BASICS`; success message shown |
| AC-19-3 | User scores 0–3/5 | Quiz submitted | M1 remains unlocked as normal; encouragement message shown; quiz result is final |
| AC-19-4 | User completed placement quiz previously (returning session) | Opens Welcome Modal (impossible — modal fires once) | Placement Quiz not re-offered; Welcome Modal fires only once per account |

---

## 5. Business Rules

| ID | Rule | Scope | Violation Behavior |
|----|------|-------|--------------------|
| BR-LEARN-01 | Module prerequisites are evaluated as current-state checks, not event sequences. If a user meets the secondary prerequisite before satisfying the primary, the module unlocks immediately when the primary condition is met. | FR-LEARN-08 | Not applicable (correct system behavior) |
| BR-LEARN-02 | XP is granted exactly once per `{user_id, lesson_id}` pair. Idempotency key = `{user_id}:{lesson_id}`. Re-completing a lesson in review mode does not award XP. | FR-LEARN-06 | Duplicate XP grant rejected silently; no error shown to user |
| BR-LEARN-03 | Module completion bonus XP is granted exactly once per `{user_id, module_id}` pair. Idempotency enforced at module completion event level. | FR-LEARN-09 | Duplicate module completion event rejected; no duplicate XP or badge |
| BR-LEARN-04 | XP from lesson completion (step 1 of event chain) is NEVER rolled back, even if subsequent steps (badge evaluation, module unlock) fail. | FR-LEARN-06 | Steps 2–4 retried asynchronously; step 1 immutable once committed |
| BR-LEARN-05 | The Welcome Modal fires exactly once per `user_id`. The `welcome_modal_shown` flag is written on modal render (not on CTA tap) to prevent re-display after app crash. | FR-LEARN-01 | If flag cannot be written (network unavailable), modal is suppressed until flag can be confirmed `false` from server |
| BR-LEARN-06 | Bonus cash (Module 2 reward) is tracked as a separate ledger line (`ledger_source = "module_2_completion"`) and is NEVER merged with the main virtual cash balance. | FR-LEARN-10 | Any code path attempting to merge bonus cash into main balance must throw a validation error and be logged |
| BR-LEARN-07 | Bonus cash TTL is exactly 7 calendar days from `awarded_at`. Expiry runs regardless of market hours, user activity, or timezone. All times stored and evaluated in UTC. | FR-LEARN-10, FR-LEARN-11 | Expired bonus cash not removed within 1 hour of `expires_at` must trigger an ops alert |
| BR-LEARN-08 | At T+7 bonus cash expiry, ALL open positions tagged to `module_2_completion` ledger source are force-liquidated. Realized P&L is retained in main portfolio. Uninvested bonus cash balance is removed. | FR-LEARN-11 | If liquidation fails for a position after 3 retries, the position is flagged in `ops_review_queue`; other positions proceed normally |
| BR-LEARN-09 | Trades funded by bonus cash earn standard paper trade XP. `portfolio_type = "main"` for XP purposes. Bonus cash funding source does not reduce or modify XP earned from the trade. | FR-LEARN-10 | Verified at trade XP grant time; override rejected if `portfolio_type` is set to anything other than "main" |
| BR-LEARN-10 | CTA card (card 5) is declinable. Swiping past the CTA card without tapping "Try it now" still triggers lesson completion and XP award. Lesson completion is NOT gated on CTA action. | FR-LEARN-05, FR-LEARN-06 | If lesson completion is accidentally blocked by CTA status, client-side and server-side checks must be aligned |
| BR-LEARN-11 | Quiz re-attempts are unlimited per session. XP is awarded on lesson completion regardless of attempt count. Attempt count is analytics-only. | FR-LEARN-04 | Any implementation gating XP on quiz attempt count is a defect |
| BR-LEARN-12 | The Hint card is shown after exactly 3 consecutive wrong answers on the same quiz question within the same session. Hint card is shown at most once per session per question. | FR-LEARN-04 | Counter resets on session exit (app kill); does not persist to next session |
| BR-LEARN-13 | Daily Missions (FR-GAME-08) are invisible to users who have not completed Module 1. Gate is evaluated on every Home tab render. | FR-LEARN-12 | If M1 completion event is delayed, gate may persist up to one render cycle after completion; resolves on next render |
| BR-LEARN-14 | Module 4 "5 distinct trading days" prerequisite counts only VN market open days (HoSE/HNX calendar). The 5 days do not need to be consecutive. | FR-LEARN-08, FR-LEARN-16 | If VN holiday calendar data is unavailable, evaluation is deferred until calendar data is restored |
| BR-LEARN-15 | `session_progress` saves are local-first with server sync. The last successfully server-synced card index is the authoritative resume point. In-memory progress ahead of last server ACK is non-authoritative. | FR-LEARN-07 | On desync: resume at last server-confirmed card index; no data loss beyond last unsynced card |
| BR-LEARN-16 | "Try it now" CTA opens as a push modal (stack push, not replace). Back navigation from the CTA modal always returns the user to the CTA card (card 5). The CTA modal never replaces the lesson stack frame. | FR-LEARN-05 | Navigation stack integrity verified in QA by confirming back button from CTA modal lands on card 5, not Grow tab or Home |
| BR-LEARN-17 | If user has no virtual portfolio when tapping "Try it now", virtual account is auto-initialized with 500,000,000 VND (per FR-PT-01) before the CTA modal opens. This is a silent background operation. | FR-LEARN-05 | If initialization fails after 3 retries, show error with retry button; do not block lesson completion |
| BR-LEARN-18 | Navigating to the CTA modal does NOT cancel any pending orders. The pending order confirmation modal is informational only. | FR-LEARN-05 | Verified in QA by confirming pending order exists before and after CTA modal interaction |
| BR-LEARN-19 | Learning Level can only advance, never decrease. A level-up event is idempotent: key = `{user_id}_{level_id}_LEVEL_UP`. Re-passing a MKC for an already-passed module does not re-grant the +15 XP level-up bonus. | FR-LEARN-17 | Duplicate level-up event silently rejected; no duplicate XP |
| BR-LEARN-20 | Module Knowledge Check (MKC) pass status is permanent. Once a user passes MKC-N, they never need to re-take it. Module completion badge and XP (FR-LEARN-09) are independent of MKC result — they are awarded on lesson completion, not on MKC pass. | FR-LEARN-18 | MKC failure does not block badge or lesson XP; it only blocks Learning Level advancement |
| BR-LEARN-21 | The Placement Quiz (FR-LEARN-19) is offered once and cannot be retried. A score of 4/5 or 5/5 sets M1 to `SKIPPED_VIA_PLACEMENT` and sets Learning Level to `LVL_F1_BASICS`. M1 remains accessible in review mode for skipped users. | FR-LEARN-19 | If placement quiz result is ambiguous due to network error, system defaults to M1 required (fail-safe) |
| BR-LEARN-22 | Community posting (Tier 2) eligibility requires `user_profile.total_xp ≥ 500`. This threshold is evaluated when M4 completion fires. If total XP is below 500 at M4 completion (edge case: user had XP deductions or the XP system had gaps), community posting is NOT enabled until XP reaches 500 on any subsequent XP grant event. The 500 XP threshold is the authoritative value for acceptance testing — FR-GAME-06 must be consistent with this value. | FR-LEARN-16, FR-LEARN-09 | If FR-GAME-06 defines a different threshold, this FRD value (500 XP) takes precedence until explicitly overridden by signed product decision |
| BR-LEARN-23 | For the M4 "5 distinct trading days" prerequisite, the trading day of an order is determined by the **order placement timestamp** converted to VN local time (`Asia/Ho_Chi_Minh`). An ATO order placed at 08:45 VNST counts for the calendar date 2026-05-27 regardless of when or whether it fills. Day boundary = midnight VNST. | FR-LEARN-16 | Timezone conversion must use the IANA `Asia/Ho_Chi_Minh` zone (no DST, UTC+7 year-round); server must not use UTC date for this calculation |
| BR-LEARN-24 | Once the Placement Quiz screen renders Q1, both Android system back gesture and iOS edge-swipe gesture are intercepted and suppressed. The back chevron is removed from the quiz header on Q1 render. Mid-quiz app kill counts as an attempt expended (`placement_quiz_attempted = true` written on Q1 render, before any answer is given). | FR-LEARN-19 | If the flag write for `placement_quiz_attempted` fails (network error), the system must retry; the quiz must not be re-offered until the flag is confirmed written |

---

## 6. Data Model

### Table: `lessons`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `lesson_id` | VARCHAR(10) | PK, NOT NULL | Lesson identifier, e.g., `L1.1`, `L2.3`, `L4.5` |
| `module_id` | VARCHAR(5) | FK → `modules.module_id`, NOT NULL | Parent module |
| `lesson_order` | SMALLINT | NOT NULL, 1–5 | Sequence within module |
| `title_vi` | VARCHAR(200) | NOT NULL | Vietnamese lesson title |
| `concept_card_content_id` | UUID | FK → `content_cards` | Reference to Concept card content |
| `example_card_content_id` | UUID | FK → `content_cards` | Reference to Example card content |
| `myth_card_content_id` | UUID | FK → `content_cards` | Reference to Myth-Buster card content |
| `quiz_question_text` | TEXT | NOT NULL | Quiz question body |
| `quiz_options` | JSONB | NOT NULL | Array of `{option_id, text, is_correct}` |
| `quiz_hint_text` | TEXT | NULL | Hint shown after 3 wrong answers; fallback to generic if NULL |
| `cta_type` | VARCHAR(50) | NOT NULL | Enum: see `cta_type` values in FR-LEARN-05 |
| `cta_pre_fill_ticker` | VARCHAR(10) | NULL | Pre-filled stock ticker for CTA |
| `cta_pre_fill_config` | JSONB | NULL | Additional pre-fill parameters (quantity, price, action) |
| `xp_reward` | SMALLINT | NOT NULL, DEFAULT 25 | XP awarded on completion |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Soft-disable for content updates |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

---

### Table: `module_progress`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | BIGINT | FK → `users.user_id`, NOT NULL | |
| `module_id` | VARCHAR(5) | NOT NULL | M1, M2, M3, M4 |
| `status` | VARCHAR(20) | NOT NULL | ENUM: `LOCKED`, `UNLOCKED`, `IN_PROGRESS`, `COMPLETE` |
| `lessons_completed_count` | SMALLINT | NOT NULL, DEFAULT 0 | 0–5 |
| `unlocked_at` | TIMESTAMPTZ | NULL | Timestamp when status changed to UNLOCKED |
| `started_at` | TIMESTAMPTZ | NULL | Timestamp of first lesson in module |
| `completed_at` | TIMESTAMPTZ | NULL | Timestamp when all 5 lessons completed |
| `module_bonus_xp_granted` | BOOLEAN | NOT NULL, DEFAULT false | Idempotency flag for module bonus XP |
| `badge_granted` | BOOLEAN | NOT NULL, DEFAULT false | Idempotency flag for module badge |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

**Unique constraint:** `(user_id, module_id)`

---

### Table: `session_progress`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | BIGINT | FK → `users.user_id`, NOT NULL | |
| `lesson_id` | VARCHAR(10) | FK → `lessons.lesson_id`, NOT NULL | |
| `session_id` | UUID | NOT NULL | Client-generated session identifier |
| `card_index` | SMALLINT | NOT NULL, DEFAULT 0 | Last completed card (0-indexed: 0–4) |
| `quiz_state` | JSONB | NULL | `{attempt_count: int, hint_shown: bool, answered_correctly: bool}` |
| `cta_interacted` | BOOLEAN | NOT NULL, DEFAULT false | User tapped "Try it now" |
| `cta_completed` | BOOLEAN | NOT NULL, DEFAULT false | User completed CTA target action |
| `started_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last save timestamp |

**Unique constraint:** `(user_id, lesson_id)` — one active progress record per user per lesson. Completed lessons have no active session_progress row (moved to `lesson_completions`).

---

### Table: `lesson_completions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | BIGINT | FK → `users.user_id`, NOT NULL | |
| `lesson_id` | VARCHAR(10) | FK → `lessons.lesson_id`, NOT NULL | |
| `completed_at` | TIMESTAMPTZ | NOT NULL | First-time completion timestamp |
| `quiz_attempt_count` | SMALLINT | NOT NULL | Total wrong attempts before correct (analytics) |
| `cta_completed` | BOOLEAN | NOT NULL, DEFAULT false | Whether user completed CTA action |
| `xp_granted` | BOOLEAN | NOT NULL, DEFAULT false | Idempotency flag |
| `xp_grant_idempotency_key` | VARCHAR(100) | NOT NULL, UNIQUE | Format: `{user_id}:{lesson_id}` |

**Unique constraint:** `(user_id, lesson_id)` — immutable record; no updates after creation.

---

### Table: `bonus_cash_ledger`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | BIGINT | FK → `users.user_id`, NOT NULL | |
| `amount` | BIGINT | NOT NULL | Amount in VND (50,000,000) |
| `currency` | VARCHAR(3) | NOT NULL, DEFAULT 'VND' | |
| `ledger_source` | VARCHAR(50) | NOT NULL | Value: `module_2_completion` |
| `status` | VARCHAR(20) | NOT NULL | ENUM: `ACTIVE`, `EXPIRED`, `REVOKED` |
| `awarded_at` | TIMESTAMPTZ | NOT NULL | When bonus cash was granted |
| `expires_at` | TIMESTAMPTZ | NOT NULL | `awarded_at + 7 days` (UTC) |
| `expired_at` | TIMESTAMPTZ | NULL | When expiry job ran |
| `notification_t24h_sent` | BOOLEAN | NOT NULL, DEFAULT false | T-24h push sent flag |
| `notification_t1h_sent` | BOOLEAN | NOT NULL, DEFAULT false | T-1h push sent flag |
| `uninvested_amount_removed` | BIGINT | NULL | Amount removed at expiry (uninvested balance) |
| `positions_liquidated_count` | SMALLINT | NULL | Number of positions force-liquidated |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

**Unique constraint:** `(user_id, ledger_source)` where `status = 'ACTIVE'` — enforces at most one active bonus cash per source per user.

---

### Table: `user_onboarding_state`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | BIGINT | PK, FK → `users.user_id` | |
| `welcome_modal_shown` | BOOLEAN | NOT NULL, DEFAULT false | Written on modal render; never reset |
| `module1_gate_dismissed` | BOOLEAN | NOT NULL, DEFAULT false | User dismissed Daily Missions locked prompt |
| `daily_missions_unlocked` | BOOLEAN | NOT NULL, DEFAULT false | Set to true when M1 completes |
| `placement_quiz_attempted` | BOOLEAN | NOT NULL, DEFAULT false | Whether user has taken placement quiz |
| `placement_quiz_passed` | BOOLEAN | NOT NULL, DEFAULT false | Whether placement quiz was passed (4/5+) |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

---

### Table: `user_learning_levels`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | BIGINT | PK, FK → `users.user_id` | |
| `current_level_id` | VARCHAR(30) | NOT NULL, DEFAULT `LVL_F0_NEWCOMER` | Current learning level enum value |
| `level_achieved_at` | TIMESTAMPTZ | NOT NULL | Timestamp of last level advancement |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

**Valid `current_level_id` values:** `LVL_F0_NEWCOMER`, `LVL_F0_EXPLORING`, `LVL_F1_BASICS`, `LVL_F1_TRADER`, `LVL_F2_PORTFOLIO`, `LVL_F2_DISCIPLINED`

---

### Table: `module_knowledge_checks`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | |
| `user_id` | BIGINT | FK → `users.user_id`, NOT NULL | |
| `module_id` | VARCHAR(5) | NOT NULL | M1, M2, M3, M4 |
| `attempt_number` | SMALLINT | NOT NULL | Monotonically increasing per user+module |
| `score` | SMALLINT | NOT NULL | 0–5 |
| `passed` | BOOLEAN | NOT NULL | `score >= 3` |
| `answers` | JSONB | NOT NULL | Array of `{question_id, selected_option, is_correct}` |
| `attempted_at` | TIMESTAMPTZ | NOT NULL | |

**Unique constraint on pass record:** At most one row per `(user_id, module_id)` where `passed = true` — enforced by application logic, not DB constraint (to allow multiple attempts).

---

## 7. Out of Scope (V1)

| Item | Rationale | Target Version |
|------|-----------|---------------|
| **Spaced repetition / review scheduling** | SRS algorithm and review queues deferred; V1 learning is sequential and linear only | V2 |
| Lesson authoring / CMS admin UI | Content managed via direct DB seeding or separate internal tool | V2 |
| Multi-language support | Vietnamese only in V1 | V2 |
| Offline lesson caching | Network required for all lesson content | V2 |
| Social/shared learning progress | No leaderboard by module or shared lesson state | V2 |
| Live or instructor-led sessions | Async self-paced only | V3 |
| Learning analytics dashboard (internal) | No product analytics UI for BA/PM; raw events available in data warehouse | V2 |
| Certificate of completion | No shareable certificate at end of Path | V2 |
| Adaptive difficulty | All users follow identical lesson content regardless of quiz performance | V2 |

---

## 8. Assumptions & Dependencies

| # | Assumption / Dependency | Impact if Wrong |
|---|------------------------|----------------|
| A-01 | VN market holiday calendar is available as a structured data feed or static table queryable by the backend | M4 trading-day prerequisite evaluation breaks; fallback: treat all weekdays as trading days |
| A-02 | FR-PT-01 (Paper Trading) virtual account initialization API supports auto-creation with 500,000,000 VND on demand and completes in < 3 seconds p95 | CTA modal user experience degraded; lesson flow interrupted |
| A-03 | FR-GAME-01 (XP system) supports idempotency keys of format `{user_id}:{lesson_id}` | Duplicate XP grants possible on retry |
| A-04 | FR-GAME-06 (Badge system) supports idempotent badge award with module completion as trigger | Duplicate badges or missing badges on retry |
| A-05 | FR-GAME-08 (Daily Missions) queries `module_progress.status` for M1 to determine visibility gate | Daily Missions gating logic must be implemented in coordination with this FRD |
| A-06 | AI Insights tab (Grow tab or Portfolio tab) is a distinct screen reachable via deep link from CTA modal | L3.5 and L4.2 CTAs depend on this navigation target |
| A-07 | Push notification service supports scheduled future delivery (T-24h, T-1h from a given timestamp) | Bonus cash expiry notifications may not fire at the correct time |
| A-08 | Community post composer supports pre-populated content and a "Skip" option | L4.5 CTA depends on this capability |
| A-09 | Paper trading order rejection messages are lesson-context-aware (i.e., L1.5 ceiling rejection message is different from a generic error) | Educational intent of rejection CTAs is lost |
| A-10 | `paper_trades_count` is a queryable aggregate on `virtual_trades` or `orders` table, filterable by `user_id` and `portfolio_type = "main"` | M3 unlock evaluation cannot be performed |

---

## 9. Open Questions

All open questions resolved as of 2026-05-27.

| # | Question | Owner | Decision | Status |
|---|----------|-------|----------|--------|
| OQ-01 | What is the exact Tier 2 XP threshold for community posting eligibility? | Product | **500 XP** — defined in BR-LEARN-22; authoritative here; FR-GAME-06 must align. | ✅ Resolved |
| OQ-02 | Welcome Modal: Lottie animation (~3s) or static imagery? | Design | **Lottie 3s** (`lottie_welcome_learning.json`). CTAs active during animation. Static PNG fallback on asset load failure. Defined in FR-LEARN-01 modal spec. | ✅ Resolved |
| OQ-03 | Fallback if CTA pre-fill stock is delisted vs. suspended — same treatment? | Product | **Confirmed: same treatment.** Both delisted and suspended stocks trigger silent substitution with next available blue-chip on same exchange (per IR-19 in DEV-QA spec). No user-visible difference. | ✅ Resolved |
| OQ-04 | M4 "5 distinct trading days": ATO order — placement date or fill date? | Engineering | **Placement date.** `trade_day = DATE(order.placed_at AT TIME ZONE 'Asia/Ho_Chi_Minh')`. Defined in BR-LEARN-23 and Trading Days Definition table in FR-LEARN-16. | ✅ Resolved |
| OQ-05 | "Market Scholar" badge (M4) — Common or Rare? | Product | **Rare** (`#60A5FA`, 3px border). M4 is the F0 capstone (20 lessons + 4 MKCs + 5 trading days). Updated in FR-LEARN-09, FR-LEARN-16, module-c-gamification-extended.md. | ✅ Resolved |
| OQ-06 | M3 bonus XP (+25): separate line item or rolled into total in completion modal? | Design | **Separate line items.** "+125 XP từ bài học" + "+25 XP 🎓 Thưởng hoàn thành!". Same pattern applied to M4. Defined in FR-LEARN-09 XP Display Rules table. | ✅ Resolved |
| OQ-07 | L3.3 bulk watchlist add — silent skip or confirmation toast on duplicates? | Design | **Toast confirmation.** "Đã thêm [N] cổ phiếu mới · [M] đã có sẵn" (2s auto-dismiss). If all 5 already in watchlist: "5 cổ phiếu đã có trong danh sách theo dõi". Updated in FR-LEARN-15 AC-03. | ✅ Resolved |

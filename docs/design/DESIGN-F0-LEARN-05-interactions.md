# F0 Learning Path — Interaction Rules & Edge Case Handling
**Version:** 1.0 | **Date:** 2026-05-28 | **Feature:** F0 Learning Path (Module F-LEARN)

> **Format:** `[Trigger] → [System Response]`
> **Reference:** Full motion specs in `DESIGN-F0-LEARN-03-ui-spec.md §5`
> **FRD:** `docs/business/frd/module-f0-learning.md`

---

## 1. Interaction Rules

### IR-01 — Welcome Modal: Primary CTA

```
Trigger:   User taps "Bắt đầu Module 1" on Welcome Modal
Response:  welcome_modal_shown = true (already set at modal render)
           Modal dismisses (fade out, 300ms)
           Navigate to L1.1 Card 1 (Concept card)
           Session progress record created for L1.1 (card_index = 0)
           [Grow tab is NOT visited as intermediate step]
```

### IR-02 — Welcome Modal: Secondary CTA

```
Trigger:   User taps "Khám phá trước" on Welcome Modal
Response:  welcome_modal_shown = true
           Modal dismisses (fade out, 300ms)
           User lands on Home tab (no navigation)
           Grow tab shows LearningPromptCard on next visit
```

### IR-03 — Welcome Modal: Tertiary Link

```
Trigger:   User taps "Tôi đã biết chứng khoán cơ bản" (text link)
Response:  Navigate to Placement Quiz intro screen (slideUp, 400ms)
           welcome_modal_shown NOT set yet (set on quiz intro screen render)
```

### IR-04 — Card Advance (Swipe Left or Next Tap)

```
Trigger:   User swipes left on lesson card (threshold ≥30% card width)
           OR taps [Tiếp theo →] chevron button
Response:  Current card slides left (300ms ease-decelerate)
           Next card slides in from right (300ms ease-decelerate, parallel)
           Progress bar animates to new fill % (300ms ease-standard)
           Progress dot updates state (active dot moves to next position)
           card_index auto-saved server-side (debounced 500ms after animation)
```

### IR-05 — Card Back (Swipe Right or Back Tap)

```
Trigger:   User swipes right on lesson card (threshold ≥30% card width)
           OR taps [← Trước] chevron button
Response:  Current card slides right (300ms ease-decelerate)
           Previous card slides in from left (300ms ease-decelerate, parallel)
           Progress bar + dots update to reflect previous position
           [No card_index decrement — auto-save only moves forward]
```

### IR-06 — Swipe Right on Card 1 (First Card Boundary)

```
Trigger:   User swipes right on Card 1 (Concept) — no previous card exists
Response:  Card bounces right 8px → returns to original position (200ms ease-spring)
           Haptic feedback: iOS light impact / Android tick
           No navigation; card remains at position 1
```

### IR-07 — Quiz: Correct Answer Selected

```
Trigger:   User taps a quiz option that is the correct answer
Response:  Option fills quiz-correct-bg (150ms ease-standard)
           Positive border 1.5px appears on option
           Lucide check-circle icon fades in at option right (150ms)
           All other options simultaneously switch to disabled state (opacity-40)
           "Tiếp theo →" button activates (opacity-40 → 1.0, 150ms)
           [No auto-advance — user must tap "Tiếp theo" explicitly]
```

### IR-08 — Quiz: Wrong Answer Selected (Attempts 1 and 2)

```
Trigger:   User taps a quiz option that is NOT the correct answer (attempt ≤2)
Response:  Option fills quiz-wrong-bg (150ms ease-standard)
           Negative border 1.5px appears on option
           Lucide x-circle icon fades in at option right (150ms)
           Shake animation on the selected option row (300ms, keyframe)
           "Thử lại nhé!" — show feedback message below options (caption-drop, negative)
           attempt_count incremented in session_progress.quiz_state
           After 300ms: wrong option returns to default state (options re-enabled for retry)
           [User can tap any option again immediately]
```

### IR-09 — Quiz: Wrong Answer Selected (Attempt 3 — Hint Trigger)

```
Trigger:   User taps a wrong answer for the 3rd consecutive time
Response:  Same wrong-answer feedback as IR-08 (quiz-wrong-bg, shake)
           After 300ms: HintCard slides in from right (300ms ease-decelerate)
           HintCard overlays QuizCard, displaying lesson-specific hint text
           hint_shown = true in session_progress.quiz_state
           [User MUST interact with hint card before retrying — "Hiểu rồi" required]
```

### IR-10 — Hint Card: Dismiss

```
Trigger:   User taps "Hiểu rồi, thử lại →" on HintCard
Response:  HintCard slides out to right (300ms ease-accelerate)
           QuizCard revealed beneath (no new animation needed)
           All options reset to default state
           User may now attempt the quiz again (no attempt limit after hint shown)
```

### IR-11 — CTA Card: "Try It Now" Primary Tap

```
Trigger:   User taps "Thử ngay trong danh mục ảo →" on Card 5 (CTA Card)
Response:  "Try It Now" bottom sheet slides up (400ms ease-decelerate)
           Sheet: ink-800 surface, radius-4xl top, 60% viewport height
           Contains task prompt + GlassmorphicSecurityInfo disclaimer
           Lesson completion NOT triggered yet (triggered on sheet action or dismiss)
```

### IR-12 — "Try It Now" Sheet: Navigate to Paper Trading

```
Trigger:   User taps "Đi đến danh mục ảo →" on Try It Now bottom sheet
Response:  Sheet dismisses (slideDown 300ms)
           Lesson completion triggered (XP +25 awarded, idempotent)
           Navigate to Portfolio tab (paper trading UI)
           XPToast appears (+25 XP, 300ms fadeUp, 2500ms auto-dismiss)
```

### IR-13 — "Try It Now" Sheet: Dismiss / Skip

```
Trigger:   User taps "Để sau" link on Try It Now bottom sheet
           OR swipes down on sheet handle
Response:  Sheet dismisses (slideDown 300ms)
           Lesson completion triggered immediately (XP +25 awarded, idempotent)
           User returns to Lesson Viewer at Card 5 momentarily
           Then auto-navigates back to Grow tab (300ms delay) with next lesson prompt
```

### IR-14 — Lesson Completion: Lesson < 5 in Module

```
Trigger:   Lesson N (N < 5) completes
Response:  XPToast appears (fadeUp 300ms, "+25 XP", 2500ms auto-dismiss)
           lesson_completions record created (idempotent)
           User returns to Grow tab
           Next lesson in module transitions to UNLOCKED state (visual pulse on card, 600ms)
```

### IR-15 — Lesson Completion: Lesson 5 (Final Lesson in Module)

```
Trigger:   Lesson 5 of a module completes
Response:  XPToast appears ("+25 XP", 2500ms auto-dismiss)
           Module completion banner slides up from bottom (2000ms after toast enters):
           "Bạn đã học xong [Module Name]! Làm bài kiểm tra →" (lime border, ink-800 bg)
           lesson_completions record created; module status remains IN_PROGRESS
           [Module does NOT move to COMPLETE until MKC is passed]
```

### IR-16 — Module Card Tap: LOCKED State

```
Trigger:   User taps a LOCKED ModuleCard on Learning Path Home
Response:  Tooltip fades in from card center (200ms ease-decelerate)
           Copy: "Hoàn thành [Module N] để mở khóa"
           Tooltip auto-hides after 2500ms (fade out 200ms)
           No navigation; no bottom sheet
```

### IR-17 — MKC: Submit (Nộp bài)

```
Trigger:   User taps "Nộp bài" on Question 5 of MKC
Response:  Button enters loading state (spinner replaces label, 150ms)
           Results sent to server (API call)
           Loading max: 3s before timeout error shown
           On result:
             [≥3/5 correct] → navigate to MKC Pass Results screen (slideUp)
             [<3/5 correct] → navigate to MKC Fail Results screen (slideUp)
                              + 60s cooldown begins immediately
```

### IR-18 — MKC Retry (After Cooldown)

```
Trigger:   User taps "Thử lại ngay →" on MKC Fail Results screen (cooldown elapsed)
Response:  Navigate back to MKC screen (fresh question set, same pool, randomized order)
           Progress bar resets to 0
           Cooldown timer resets (new 60s cooldown starts after THIS attempt's submission)
```

### IR-19 — Module Completion Reward: Badge Reveal

```
Trigger:   User arrives at Module Completion Reward screen (from MKC pass)
Response:  AmbientBackground activates (lime + plasma orbs, animate-pulse-glow)
           Confetti burst (300 particles, lime + plasma, 1500ms, one-shot)
           BadgeCard scales in (0 → 1.05 → 1.0, 300ms ease-spring)
           XP chips fade up in sequence: lesson XP (0ms delay), then bonus XP (150ms delay)
           [If level-up advance condition met] Level banner slides up (400ms ease-decelerate)
```

### IR-20 — Grow Tab: Sub-nav Pill Switch

```
Trigger:   User taps a sub-nav pill (e.g., "Khám phá", "Kỹ năng")
Response:  Content area cross-fades (300ms ease-standard)
           Active pill: lime-soft text + 2px lime underline
           Inactive pills: fog-muted text, no underline
           [Per ux-flows.md navigation rules]
```

### IR-21 — Placement Quiz: Back Navigation Blocked (IR-40)

```
Trigger:   Q1 of Placement Quiz renders on screen
Response:  System back gesture (iOS swipe-from-left, Android back button) DISABLED
           Back chevron in header: HIDDEN for entire quiz duration (Q1 through Q5)
           [User cannot return to Welcome Modal or intro screen during quiz]
           [This is enforced at navigation level, not card level]
```

### IR-22 — Placement Quiz: Submission

```
Trigger:   User taps "Nộp bài" on Placement Quiz Q5
Response:  Loading state on button (150ms)
           Score evaluated server-side
           [≥4/5 correct] → Placement Pass screen (slideUp)
                             M1 marked complete server-side (no badge/XP)
           [<4/5 correct] → Placement Fail screen (slideUp)
           [No retry option exists — one-shot quiz]
```

### IR-23 — M2 Bonus Cash Modal: View Portfolio CTA

```
Trigger:   User taps "Xem danh mục ảo →" on Bonus Cash Modal
Response:  Bottom sheet dismisses (slideDown 300ms)
           Navigate to Tab 4 (Portfolio) with bonus cash wallet visible
           Bonus cash ledger entry: ledger_source = "module_2_completion"
           TTL indicator shows "7 ngày còn lại"
```

### IR-24 — Daily Missions (Locked): Start Module 1 CTA

```
Trigger:   User taps "Bắt đầu Module 1 →" on Daily Missions locked unlock banner
Response:  Navigate to Learning Path Home (Grow Tab)
           LearningPromptCard or Module 1 "Bắt đầu" CTA is highlighted
           [User enters learning flow from here]
```

---

## 2. Edge Case UI Handling

### EC-01 — Network Unavailable on First Launch

```
Edge Case:      User opens app for the first time; network is unavailable
Detection:      Server flag check for welcome_modal_shown returns timeout/error
User sees:      Home tab loads normally; Welcome Modal is NOT shown
                No error message shown to user
System does:    Queues welcome_modal_shown flag verification for retry on reconnect
Recovery path:  On next app launch with network: flag confirmed false → Modal fires normally
UI indicator:   None (silent failure; do not show "offline" banner on first launch)
```

### EC-02 — Card Content Load Failure

```
Edge Case:      Lesson card body content or image fails to load (CMS/CDN error)
User sees:      Placeholder card with centered error:
                  - Lucide `image-off` icon (32px, fog-muted)
                  - "Không tải được nội dung" (body-md, fog-muted)
                  - "Thử lại?" KineticButton ghost
System does:    Retries content fetch 3× with 500ms back-off; shows placeholder after 3rd failure
Recovery path:  Tap "Thử lại?" → immediate retry → on success: card loads normally
                If retry fails: offer "Bỏ qua bài này tạm thời" option (skips card, no XP penalty)
```

### EC-03 — App Force-Kill Mid-Lesson (Before Card Save)

```
Edge Case:      User exits the app abruptly between card advance and save completion
User sees:      On relaunch: lesson resumes at last SUCCESSFULLY saved card_index
                Toast: "Tiếp tục từ vị trí bạn bỏ dở" (body-md, fog) — 2s auto-dismiss
System does:    Reads session_progress.card_index from server on lesson open
Recovery path:  User continues normally from last saved card
                [Card 4 attempt count is session-scoped; resets to 0 on relaunch]
```

### EC-04 — MKC Loading Timeout

```
Edge Case:      MKC submission response takes >3 seconds (API timeout)
User sees:      Button remains in loading state for 3s
                Then: error toast slides up from bottom:
                  "Không thể kết nối. Thử lại sau vài giây."
                  (body-md, negative, ink-800 bg, radius-xl, 3s auto-dismiss)
                  Retry button: "Thử lại" within the toast (ghost, small)
System does:    Request cancelled after 3s timeout; no partial score saved
Recovery path:  User taps "Thử lại" in toast → submission retried (no cooldown for network error)
                OR: User exits MKC; returns later; no cooldown penalty for network failure
```

### EC-05 — Module Unlock Mid-Session (Trade Count Met)

```
Edge Case:      User places ≥3 paper trades while the Learning Path Home is on-screen
                (Module 3 prerequisite met in real-time)
User sees:      Module 3 card transitions from LOCKED to UNLOCKED
                Transition: border pulses lime once (600ms ease-spring)
                "MODULE 3 MỞ KHÓA!" micro-toast (2.5s, lime, bottom of screen)
System does:    Module unlock evaluation triggered on trade event via WebSocket/push
Recovery path:  N/A — this is a positive unlock state; no error path
```

### EC-06 — Placement Quiz Force-Kill Before Submission

```
Edge Case:      User starts Placement Quiz but force-kills app before submitting all 5 answers
User sees:      On relaunch: Welcome Modal fires again (welcome_modal_shown = false still)
                No partial quiz score persisted
System does:    Placement Quiz state is NOT saved server-side until final submission
Recovery path:  User can retake the Placement Quiz via the tertiary CTA on Welcome Modal
                This is by design (one-shot quiz, but no server-side partial save)
```

### EC-07 — M2 Bonus Cash Expiry Warning

```
Edge Case:      24 hours remain before M2 bonus cash force-liquidation
User sees:      Push notification (if enabled): "Tiền thưởng ảo hết hạn trong 24 giờ"
                In Portfolio tab: expiry banner on bonus cash wallet entry (negative bg, ⚠ icon)
                "Còn 24 giờ" countdown chip on portfolio bonus cash row
System does:    Scheduled notification sent 24h before T+7 expiry
                Force-liquidation executes at T+7 00:00 VNST regardless of user action
Recovery path:  User prompted to use the funds before expiry
                After force-liquidation: bonus cash ledger entry shows "ĐÃ THANH LÝ" label (fog-muted)
                Portfolio shows 0 VND in bonus cash slot
```

---

*Owner: Product Design + Frontend Dev*
*FRD reference: `docs/business/frd/module-f0-learning.md`*
*QA test cases: `DESIGN-F0-LEARN-06-qa-cases.md`*

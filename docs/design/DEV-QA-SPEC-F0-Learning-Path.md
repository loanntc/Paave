# Dev/QA Handoff Specification — F0 Learning Path
## Paave Mobile (React Native, iOS + Android)

**Document version:** 1.0  
**Date:** 2026-05-27  
**Linked FRD:** FRD-F-LEARN-F0-Learning-Path v1.0  
**Design system:** Paave V2.0 "Kinetic Drop"  
**Author:** Dev/QA Spec Writer Agent  
**Status:** Ready for Engineering Review

---

## Design Token Reference

| Token | Value | Usage |
|-------|-------|-------|
| `canvas` | `#0E0E0E` | Screen background |
| `surface-01` | `#1A1A1A` | Card surface |
| `surface-02` | `#242424` | Modal surface, elevated cards |
| `surface-03` | `#2E2E2E` | Input fields, pressed states |
| `lime` | `#CAFD00` | Primary CTA, progress fill, correct answer highlight |
| `plasma` | `#D277FF` | Identity accent, badge pills, level badge |
| `error` | `#EF4444` | Wrong answer highlight, error states |
| `warning` | `#F59E0B` | Cooldown timer, expiry warning |
| `text-primary` | `#FFFFFF` | Headings |
| `text-secondary` | `#A0A0A0` | Supporting copy, metadata |
| `text-disabled` | `#4A4A4A` | Locked state labels |
| `border-subtle` | `#2E2E2E` | Card borders, dividers |
| `rarity-common` | `#9CA3AF` | Common badge border |
| `rarity-uncommon` | `#34D399` | Uncommon badge border |
| `rarity-rare` | `#60A5FA` | Rare badge border |
| `rarity-epic` | `#F59E0B` | Epic badge border |
| `font-display` | Space Grotesk | Headlines, card titles |
| `font-body` | Manrope | Body copy, labels, metadata |
| `radius-card` | 16px | All card corners |
| `radius-button` | 12px | All button corners |
| `radius-pill` | 999px | Badge pills, XP toasts |

---

# 3.1 Component Spec Sheet

---

## Component: LessonCardViewer (Container)

**Purpose:** Full-screen container that hosts the 5-card horizontal swipe stack for a single lesson.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  ← [Back chevron, 24px]     [L2.3 — Lesson title]   │  Header bar, height 56px
│                              [●●●○○] progress dots   │  top: 56px
├─────────────────────────────────────────────────────┤
│                                                     │
│              [Active Card Component]                │  flex: 1, horizontal padding 20px
│                                                     │
├─────────────────────────────────────────────────────┤
│  [← Prev chevron]                  [Next → chevron] │  Nav row, height 64px, bottom safe area
└─────────────────────────────────────────────────────┘
```

### Properties

| Property | Type | Notes |
|----------|------|-------|
| `lessonId` | string | e.g., `"L2.3"` |
| `initialCardIndex` | 0–4 | From `session_progress.card_index` |
| `isReviewMode` | boolean | Disables XP grant logic |
| `onLessonComplete` | callback | Fires when card 5 exits forward |

### Progress Indicator

- **Format:** 5 dots. Visited + current = filled `lime` circle (8px diameter). Unvisited = empty circle with `border-subtle` stroke.
- **Alternatively:** "2 / 5" text label in `text-secondary`, `Manrope 12 Medium`. Both indicators acceptable — design pick; must be consistent per screen.
- **Position:** Horizontally centered in header bar, 12px below module title.

### Swipe Gesture Spec

| Gesture | Threshold | Outcome |
|---------|-----------|---------|
| Swipe left | Velocity > 300 px/s OR drag > 40% screen width | Advance to next card |
| Swipe right | Velocity > 300 px/s OR drag > 40% screen width | Go to previous card |
| Swipe left on card 1 (edge) | Any | No navigation; spring-back animation; haptic: `impactLight` |
| Swipe right on card 5 (forward exit) | Any | Lesson completion triggered |

### Navigation Controls

- **Back chevron (header):** 44×44px tap target. Navigates back to Grow tab (module screen). Shows confirmation bottom sheet if lesson is in progress and card index < 4: "Rời bài học? Tiến trình của bạn đã được lưu." with "Rời đi" (Leave) and "Tiếp tục học" (Keep learning).
- **Prev/Next chevrons (footer):** Each 44×44px tap target. `chevron-left.svg` and `chevron-right.svg`, 24px icon, `text-primary` color. Prev is hidden (opacity 0) on card 1. Next is hidden on card 5 after CTA interaction (replaced by "Hoàn thành" button).

### State Machine

```
LOADING → ACTIVE → QUIZ_INCORRECT × 3 → HINT_CARD → QUIZ_ACTIVE
                ↓
          LESSON_COMPLETE
```

---

## Component: LessonCard — Concept

**Purpose:** Card 1 of 5. Delivers the core definition or explanation.

### Dimensions
- Width: screen width − 40px (20px horizontal padding each side)
- Min-height: 420px; max-height: screen height − 180px (header + footer)
- Background: `surface-01`; border-radius: `radius-card`
- Drop shadow: `0 4px 24px rgba(0,0,0,0.6)`

### Layout

```
┌───────────────────────────────────────────┐
│ [Card type pill] "Khái niệm"              │  Top-left, 12px from edges
│                                           │
│ [Hero illustration or icon — 120×120px]   │  Centered, top 24px
│                                           │
│ [Headline — Space Grotesk 24 Bold]        │  Left-aligned, top 16px after image
│ [Body text — Manrope 15 Regular]          │  Left-aligned, top 12px, max 6 lines
│ [Source attribution if any — 11px dim]   │  Bottom, text-secondary
└───────────────────────────────────────────┘
```

### Card Type Pill

| Card | Label (VI) | Background | Text Color |
|------|------------|------------|------------|
| Concept | Khái niệm | `#1E2A1E` | `#CAFD00` (lime) |
| Example | Ví dụ | `#1A1E2A` | `#7EA5FF` |
| Myth-Buster | Sự thật | `#2A1A1A` | `#FF8080` |
| Quiz | Kiểm tra | `#1E1A2A` | `#D277FF` (plasma) |
| CTA | Thử ngay | `#2A2A1A` | `#CAFD00` (lime) |

- Pill shape: `radius-pill`, padding `4px 10px`, `Manrope 11 SemiBold`

---

## Component: LessonCard — Example

Same layout as Concept card with the following differences:
- Card type pill: "Ví dụ" (blue tint, as above)
- Hero area may include a **data table or chart snapshot** (static image, max 240px height)
- VN market example label: small chip "Ví dụ VN thực tế" (`Manrope 11`, `#7EA5FF`) above headline

---

## Component: LessonCard — MythBuster

Same layout with:
- Card type pill: "Sự thật" (red tint)
- Two-section layout:

```
┌───────────────────────────────────────────┐
│ [Pill] Sự thật                            │
│                                           │
│ [❌ Misconception box — surface-02]        │  Border: 1px error/30% alpha
│  "Myth: ..."                              │  Manrope 14 Italic, text-secondary
│                                           │
│ [✓ Reality box — surface-02]              │  Border: 1px lime/30% alpha
│  "Thực tế: ..."                          │  Manrope 15 Regular, text-primary
└───────────────────────────────────────────┘
```

- Myth box background: `rgba(239,68,68,0.08)`
- Reality box background: `rgba(202,253,0,0.06)`

---

## Component: LessonCard — Quiz

**Purpose:** Card 4 of 5. Multiple-choice question with up to 4 options.

### Layout

```
┌───────────────────────────────────────────┐
│ [Pill] Kiểm tra                           │
│                                           │
│ [Question text — Space Grotesk 18 Medium] │  Max 3 lines
│                                           │
│ ┌─────────────────────────────────────┐   │
│ │  A  Option text                     │   │  QuizOption button ×4
│ └─────────────────────────────────────┘   │
│ ┌─────────────────────────────────────┐   │
│ │  B  Option text                     │   │
│ └─────────────────────────────────────┘   │
│ ┌─────────────────────────────────────┐   │
│ │  C  Option text                     │   │
│ └─────────────────────────────────────┘   │
│ ┌─────────────────────────────────────┐   │
│ │  D  Option text                     │   │
│ └─────────────────────────────────────┘   │
└───────────────────────────────────────────┘
```

- All 4 options disabled (no interaction) after any option is selected until animation completes (300ms) and user confirms intent to retry.
- "Thử lại" (Try again) button appears 500ms after wrong answer animation. `surface-02` background, `lime` text, `radius-button`.

---

## Component: LessonCard — CTA

**Purpose:** Card 5 of 5. Presents the lesson's practice action.

### Layout

```
┌───────────────────────────────────────────┐
│ [Pill] Thử ngay                           │
│                                           │
│ [Task icon — 80×80px, lime tinted]        │  Centered
│                                           │
│ [Task headline — Space Grotesk 20 Bold]   │  "Thực hành ngay!"
│ [Task description — Manrope 14 Regular]   │  1–2 lines, what the user will do
│                                           │
│ [Primary CTA button — full width]         │  lime bg, #0E0E0E text, 56px height
│ "Thử ngay →"                              │  Space Grotesk 16 Bold
│                                           │
│ [Skip text link]                          │  "Bỏ qua, tiếp tục →"
│ Manrope 13 Regular, text-secondary        │  Centered below button, 16px margin
└───────────────────────────────────────────┘
```

- Skip link always visible. Tapping it triggers lesson completion immediately.
- Primary button becomes `surface-03` (disabled appearance) while CTA modal is loading.

---

## Component: QuizOption Button (All States)

### Anatomy

```
┌─────────────────────────────────────────────────┐
│  [Option letter badge]  [Option text label]     │
│  24×24px circle                                 │
└─────────────────────────────────────────────────┘
```

- Button height: 56px min; expands with text overflow
- Border-radius: `radius-button` (12px)
- Horizontal padding: 16px; vertical padding: 14px
- Left-aligns option letter badge with 8px gap to text

### States

| State | Background | Border | Letter Badge | Text Color | Notes |
|-------|------------|--------|--------------|------------|-------|
| Default | `surface-02` | 1px `border-subtle` | `surface-03` bg, `text-secondary` | `text-primary` | Before any selection |
| Hover/Press | `surface-03` | 1px `lime/40%` | — | `text-primary` | 80ms transition |
| Selected-Pending | `surface-02` | 2px `lime` | `lime` bg, `#0E0E0E` | `text-primary` | Briefly before answer reveal |
| Correct | `rgba(202,253,0,0.12)` | 2px `lime` | `lime` bg + `✓` icon | `lime` | + scale 1.02 spring |
| Wrong | `rgba(239,68,68,0.12)` | 2px `error` | `error` bg + `✗` icon | `error` | + shake animation (3 cycles, 4px amplitude, 80ms period) |
| Correct-Reveal (others) | `surface-01` | 1px `border-subtle` | Dim | `text-disabled` | All non-selected options dimmed on correct answer |
| Disabled | `surface-01` | 1px `border-subtle/50%` | Dim | `text-disabled` | After answer submitted, while feedback animates |

### Animations

- **Correct answer:** Scale spring `1.0 → 1.04 → 1.0`, duration 350ms, easing `spring(mass:1, stiffness:200, damping:20)`. Haptic: `notificationSuccess`.
- **Wrong answer:** Horizontal shake: translate X `[0, -4, 4, -4, 4, 0]px`, duration 480ms. Haptic: `notificationError`.

---

## Component: ModuleCard (All 4 States)

### Dimensions
- Width: screen width − 32px (16px horizontal margin)
- Height: 120px
- Background: `surface-01`; border-radius: `radius-card`
- Margin-bottom: 12px between cards

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [Module icon 48×48px]  [Module title — Space Grotesk 16B]  │
│                         [Lesson count — Manrope 13 Reg]     │
│                         [Progress bar or status badge]      │
│                                        [Action button →]    │
└──────────────────────────────────────────────────────────────┘
```

### State Variants

**LOCKED**
- Overlay: `rgba(14,14,14,0.6)` covering entire card
- Module icon: grayscale filter (`filter: grayscale(1)`)
- Padlock icon: `#4A4A4A`, 20px, overlaid center-right of icon
- Title: `text-disabled`
- Action area: replaced by tooltip chip "Hoàn thành [module name] để mở khóa" (`Manrope 11`, `text-disabled`), shown on tap (bottom sheet tooltip, not persistent)
- Entire card tap target active; tapping shows tooltip bottom sheet

**UNLOCKED (not started)**
- Full color; no overlay
- Module icon: full color
- Subtitle: "[N] bài học · [total XP] XP"
- Progress bar: absent (0%)
- Action button: "Bắt đầu" — `lime` background, `#0E0E0E` text, `Manrope 13 Bold`, `radius-button`, height 32px, right-aligned

**IN_PROGRESS**
- Full color
- Progress bar: height 4px, `lime` fill, `surface-03` track, border-radius 2px. Width calculated from `(lessons_completed / 5) * 100%`. Positioned 8px above action button.
- Subtitle: "[N]/5 bài học · [XP earned so far] / [total XP] XP"
- Action button: "Tiếp tục" — same spec as "Bắt đầu"

**COMPLETE**
- Full color
- Checkmark badge: `lime` circle 20px with `✓` white icon, top-right of module icon
- Progress bar: full-width `lime` fill
- Subtitle: "Hoàn thành · [total XP] XP"
- Action button: "Ôn lại" — `surface-02` background, `text-secondary` text, same size

---

## Component: MKCQuestionScreen

> Note: MKC (Module Knowledge Check) is specified in the business rules as a 5-question quiz after completing all lessons in a module. This component covers the MKC quiz flow screen.

### Layout (full-screen)

```
┌─────────────────────────────────────────────────────┐
│ ← back      Module [N] Knowledge Check    [2/5]    │  Header, 56px
│                                                     │
│ [Progress bar — full width, 4px, lime fill]         │
│                                                     │
│ [Question text — Space Grotesk 20 Bold]             │  24px padding, max 4 lines
│                                                     │
│ [QuizOption × 4]                                    │  20px horizontal padding
│                                                     │
│ [Confirm / Next button — full width, 56px]          │  Bottom, 20px padding
│ Disabled until option selected                      │
│                                                     │
│ [Cooldown banner — conditional]                     │  See below
└─────────────────────────────────────────────────────┘
```

### Cooldown Banner (MKC retry within 60s)

```
┌─────────────────────────────────────────────────────────────┐
│  ⏱ Thử lại sau  [0:47]   [============         ] 60s bar  │
└─────────────────────────────────────────────────────────────┘
```

- Background: `rgba(245,158,11,0.15)` (warning tint)
- Border: 1px `#F59E0B`; border-radius: `radius-button`
- Timer: `Space Grotesk 16 Bold`, `#F59E0B`. Counts down from 60 to 0.
- Progress bar: `warning` fill, `surface-03` track, 4px height.
- Submit button: disabled state (`surface-03` bg, `text-disabled`) during cooldown. Re-enables at 0.
- Cooldown banner appears at top of question area (below header), not blocking options.

### Pass / Fail State

| Result | Score | Visual |
|--------|-------|--------|
| Pass | ≥3/5 correct | Full-screen celebration: confetti (lottie), `plasma` burst, "+15 XP" ring animation. Auto-dismiss after 3s or tap. |
| Fail | ≤2/5 correct | Result card: "Bạn trả lời đúng [N]/5 câu. Thử lại sau 60 giây." `error` tint. Cooldown timer starts immediately. |

---

## Component: LearningLevelBadge Pill

**Placement:** Bottom-right corner of avatar on Profile screen and Community feed posts. 2px overlap onto avatar edge.

### Dimensions
- Pill: min-width 56px, height 20px, `radius-pill`
- Background: `plasma` (`#D277FF`) at 100% opacity
- Text: `Manrope 10 SemiBold`, `#0E0E0E` (dark on plasma)
- Padding: `2px 8px`

### 6 Learning Levels

| Level # | Label | XP Threshold |
|---------|-------|-------------|
| 1 | Tân binh | 0 XP |
| 2 | Đang khám phá | 125 XP |
| 3 | Hiểu thị trường | 250 XP |
| 4 | Biết giao dịch | 400 XP |
| 5 | Tư duy danh mục | 575 XP |
| 6 | Trader có kỷ luật | 800 XP |

### Level-Up Animation (triggered on XP crossing threshold)

1. Badge pill scales from `1.0 → 1.3 → 1.0` (spring, 400ms)
2. Plasma glow ring radiates outward (opacity `0.8 → 0`, radius `0 → 32px`, 600ms)
3. Label text cross-fades to new level name (200ms)
4. Haptic: `notificationSuccess`
5. XP Toast (+15 XP variant) fires simultaneously

---

## Component: XPToast

**Purpose:** Ephemeral overlay announcing XP gain.

### Variants

| Variant | Label | Trigger |
|---------|-------|---------|
| Lesson complete | "+25 XP" | `lesson_completions` record created |
| Level up | "+15 XP Lên cấp!" | Learning Level threshold crossed |
| Module bonus (M3) | "+25 XP Bonus Module!" | M3 `module_completion` event |
| Module bonus (M4) | "+75 XP Bonus Module!" | M4 `module_completion` event |

### Visual Spec

```
┌─────────────────────────┐
│ ⭐ +25 XP               │  Pill, floats at y = 25% from top
└─────────────────────────┘
```

- Background: `rgba(202,253,0,0.15)` with 1px `lime` border
- Icon: ⭐ (16px) or custom XP star SVG, `lime` tint
- Text: `Space Grotesk 16 Bold`, `lime`
- Pill: `radius-pill`, padding `8px 16px`, height 36px
- Entry animation: slide in from top (translateY: -20px → 0, opacity 0→1), 250ms ease-out
- Dwell: 2000ms
- Exit animation: fade out + translateY 0 → -12px, 300ms ease-in
- Horizontal position: centered
- Vertical position: 25% from top of screen (does not overlap header)
- Does NOT block user interaction (pointer-events: none)

---

## Component: ModuleCompletionModal

**Purpose:** Full-screen celebratory modal shown upon completing all 5 lessons of a module.

### Layout

```
┌────────────────────────────────────────────────────┐
│                  [Confetti lottie]                 │  Full bleed, behind content
│                                                    │
│         [Module badge SVG — 120×120px]             │  Animated entry: scale 0→1.1→1.0
│         [Badge name — Space Grotesk 24 Bold]       │
│         [Rarity pill]                              │
│                                                    │
│         [XP summary line]                          │  e.g., "+125 XP kiếm được"
│         [Bonus cash line — M2 only]                │  "50,000,000 VND tiền thưởng!"
│                                                    │
│  [Primary CTA — full width, lime]                  │  "Tiếp tục" (→ Grow tab or M[n+1])
│  [Secondary link]                                  │  "Xem huy hiệu của tôi" (→ Profile)
└────────────────────────────────────────────────────┘
```

- Background: `canvas` with 80% opacity backdrop blur behind lottie
- Modal backdrop: not dismissible by tapping outside (user must tap CTA or back)
- Badge entry animation: scale `0 → 1.1 → 1.0`, spring 500ms, 300ms delay after lottie starts
- XP summary: `Space Grotesk 20 Bold`, `lime`
- Bonus cash line (M2 only): `Space Grotesk 16 Medium`, `#CAFD00` with money-bag emoji icon (design pick)
- Confetti: Lottie JSON, looped for 3s then stops. Particles use `lime`, `plasma`, `white`.

### Module-Specific Content

| Module | Badge SVG ID | Rarity Pill Color | Bonus Line |
|--------|-------------|-------------------|------------|
| M1 | `badge_market_foundations` | `rarity-common` | — |
| M2 | `badge_first_trader` | `rarity-common` | "50,000,000 VND tiền thưởng · còn 7 ngày" |
| M3 | `badge_portfolio_thinker` | `rarity-uncommon` | — |
| M4 | `badge_market_scholar` | `rarity-rare` | — |

---

# 3.2 Interaction Rules

All rules follow the format: **Trigger → System Response**

---

## Card Swipe

| # | Trigger | System Response |
|---|---------|-----------------|
| IR-01 | User swipes left on card 1–3 (not quiz, not CTA) | Advance card index + 1. Save `session_progress.card_index` to server (fire-and-forget, queued retry). Animate next card sliding in from right (translateX: screen_width → 0, 280ms ease-out). Update progress dots. |
| IR-02 | User swipes left on card 4 (Quiz) only if `quiz_state.answered_correctly = true` | Advance to card 5 (CTA). Same animation as IR-01. |
| IR-03 | User swipes left on card 4 (Quiz) while `answered_correctly = false` | Reject swipe. Spring-back animation (translateX: -60px → 0, 200ms spring). Haptic: `impactLight`. No navigation. |
| IR-04 | User swipes left on card 5 (CTA) or taps skip link | Trigger lesson completion. Fire `lesson_completed` event. Show XP toast (+25 XP). Navigate back to Grow tab with slide-down transition (500ms). Update module progress bar on Grow tab (animate width change). |
| IR-05 | User swipes right on any card except card 1 | Go to previous card. Animate card sliding out from left (translateX: 0 → screen_width, 280ms), previous card sliding in from left. Update progress dots. No server call on backward navigation. |
| IR-06 | User swipes right on card 1 | Spring-back animation. Haptic: `impactLight`. No navigation. Display subtle "Đây là thẻ đầu tiên" tooltip (auto-dismiss 1.5s). |
| IR-07 | User taps Next chevron | Equivalent to swipe left per IR-01 through IR-04. |
| IR-08 | User taps Prev chevron | Equivalent to swipe right per IR-05. |

---

## Quiz Option Tap

| # | Trigger | System Response |
|---|---------|-----------------|
| IR-09 | User taps an option while no option selected yet | Highlight selected option with `lime` border (Selected-Pending state). All other options dim to `text-disabled`. "Xác nhận" confirm button appears at bottom (replaces Next chevron). |
| IR-10 | User taps "Xác nhận" on correct option | Mark option as Correct state. Show ✓ checkmark in letter badge. Scale spring animation + `notificationSuccess` haptic. All other options fade to Correct-Reveal state. After 600ms: "Tuyệt vời! Vuốt để tiếp tục →" prompt appears. `quiz_state.answered_correctly = true` written. Allow swipe left advance. |
| IR-11 | User taps "Xác nhận" on wrong option (attempt 1 or 2) | Mark option as Wrong state. Shake animation + `notificationError` haptic. Increment `quiz_state.attempt_count`. After 600ms: "Thử lại" button visible. All options reset to Default state (options re-enabled). |
| IR-12 | User taps "Xác nhận" on wrong option (attempt 3, consecutive) | Wrong animation as IR-11. After animation: Hint card slides in from right over quiz card (translateX: screen_width → 0, 300ms). `quiz_state.hint_shown = true` written. `quiz_state.attempt_count` incremented. |
| IR-13 | Hint card is visible; user swipes left or taps "Hiểu rồi" | Hint card slides out right (translateX: 0 → screen_width, 250ms). Quiz card revealed again. All options reset to Default. Attempt count continues from 3 (next wrong is attempt 4). |
| IR-14 | User taps different option before confirming | Deselect previous option; select new option. No confirm yet. |

---

## CTA Button Tap

| # | Trigger | System Response |
|---|---------|-----------------|
| IR-15 | User taps "Thử ngay" — no virtual portfolio exists | Show loading spinner on CTA button (replace text with spinner, 24px). Silent call to virtual account init API. On success (< 3s): push CTA modal over lesson stack. On success (3–10s): spinner persists; modal opens when ready. On failure (> 10s or API error): show error bottom sheet "Không thể khởi tạo tài khoản ảo. Thử lại?" with "Thử lại" and "Bỏ qua" (skip, completes lesson). |
| IR-16 | User taps "Thử ngay" — no pending orders, portfolio exists | Immediately push CTA task modal. Navigation stack: Lesson → CTA Modal. |
| IR-17 | User taps "Thử ngay" — ≥1 pending order exists | Show pending order confirmation bottom sheet: title "Bạn đang có lệnh chờ khớp", body "Tiếp tục đến bài luyện tập?", actions "Tiếp tục" (push CTA modal) / "Quay lại" (dismiss sheet, stay on card 5). Pending orders NOT modified either way. |
| IR-18 | CTA modal is open; user taps native Android back OR taps back chevron in modal header | Pop CTA modal from stack. Return to card 5 (CTA card). Lesson is NOT completed. `session_progress.cta_interacted = true` already written. |
| IR-19 | Pre-filled stock in CTA modal is suspended or delisted | On modal open: system detects `stock.status ≠ ACTIVE`. Silently substitute next available blue-chip on same exchange (logged server-side). Modal opens with substitute stock, no user-visible error. |

---

## Module Card Tap

| # | Trigger | System Response |
|---|---------|-----------------|
| IR-20 | User taps LOCKED module card | Show tooltip bottom sheet: "Hoàn thành [prerequisite_module_name] để mở khóa" (for M2, M3 primary) or "[N] lệnh nữa để mở khóa" (for M3 secondary trade count). Auto-dismiss 3s. |
| IR-21 | User taps UNLOCKED module card (not started) | Navigate to first lesson of module (L[n].1) at card 0. Create `session_progress` record if none exists. |
| IR-22 | User taps IN_PROGRESS module card | Navigate to lesson at last saved `card_index`. If mid-lesson, open lesson viewer at saved card. If between lessons (lesson N complete, N+1 not started), open first card of lesson N+1. |
| IR-23 | User taps COMPLETE module card | Navigate to module lesson list screen. Each lesson has "Ôn lại" (Review) button. Opening a completed lesson loads it in review mode (no XP re-award, all cards freely navigable). |
| IR-24 | Module transitions from LOCKED → UNLOCKED (triggered by event, user on Grow tab) | Animate card: border flashes `plasma` (2 pulses, 300ms each). Pill changes from LOCKED → UNLOCKED with crossfade 400ms. XP Toast does NOT fire on unlock. In-app notification banner at top of screen: "Module [N] đã mở khóa!" |

---

## MKC Submit

| # | Trigger | System Response |
|---|---------|-----------------|
| IR-25 | User submits MKC; score ≥ 3/5 (pass) | Show pass result screen. "+15 XP Lên cấp!" XP toast fires if score crosses a Learning Level threshold. Confetti lottie 3s. "Tiếp tục" CTA: navigate to Grow tab. `module_progress` record updated with MKC pass. Learning Level badge on profile updated. |
| IR-26 | User submits MKC; score ≤ 2/5 (fail) | Show fail result screen. Display score "Bạn trả lời đúng [N]/5 câu". 60-second cooldown timer starts immediately. "Thử lại" button disabled until timer expires. No XP for failed MKC. |
| IR-27 | User taps "Thử lại" for MKC within 60-second cooldown | "Thử lại" button is in disabled state with cooldown progress bar. Tapping shows no response (button is disabled). Timer must reach 0. |
| IR-28 | Cooldown timer reaches 0 | "Thử lại" button re-enables (`lime` style). Cooldown banner dismisses. Previous answers are cleared. New question set may be shuffled (same 5 questions, randomized order). |
| IR-29 | User taps "Thử lại" after cooldown expires | Load fresh MKC screen (all questions, no pre-selected answers). Increment `mkc_attempt_count` in analytics. No limit on MKC retries. |

---

## Level-Up Transition

| # | Trigger | System Response |
|---|---------|-----------------|
| IR-30 | XP grant causes `total_xp` to cross a Learning Level threshold | 1) XP toast "+15 XP Lên cấp!" displayed (center screen, 3s). 2) LearningLevelBadge pill animates (scale + glow pulse). 3) Level-up full-screen moment shown if it's a milestone level (levels 3, 6): confetti + new level name in Space Grotesk 32 Bold, `plasma` color, 2s duration. 4) New level label persists on profile badge immediately. |
| IR-31 | User is on a screen other than Profile when level-up occurs | XP toast still fires on current screen. Level-up moment deferred to next Profile screen open OR shown as banner on current screen for levels 3/6. |

---

## Back Navigation from CTA Modal

| # | Trigger | System Response |
|---|---------|-----------------|
| IR-32 | User presses Android system back from CTA modal | Pop CTA modal only. Reveal card 5 (CTA card). Lesson not completed. |
| IR-33 | User presses iOS swipe-from-edge from CTA modal | Same as IR-32. |
| IR-34 | User taps back chevron inside CTA modal | Same as IR-32. This chevron must ALWAYS be present in CTA modal header. |
| IR-35 | Developer guard: Navigation stack must prevent popping past lesson card 5 when CTA modal dismissed | Assert: `navigation.getState().routes[last]` is the lesson card viewer, not Grow tab. If misconfigured, fallback to Grow tab but log error to Sentry. |

---

## App Backgrounded Mid-Lesson

| # | Trigger | System Response |
|---|---------|-----------------|
| IR-36 | App sent to background while user is on card 1–4 | `session_progress.card_index` is saved at current card on background event (`AppState: 'background'`). In-memory state preserved for foreground return. |
| IR-37 | App returns to foreground within 30 minutes of background | Resume at exact card where user was. No loading screen. Quiz `attempt_count` in-memory state preserved. |
| IR-38 | App returns to foreground after > 30 minutes OR after OS kills the process | Re-fetch `session_progress` from server. Open lesson viewer at `card_index` from server. If server has card_index = 2 (card 3 completed), show card 3 — do not advance to card 4 unless card 3 was actually completed before kill. |
| IR-39 | App killed during card save network call (between card 3 and 4) | On relaunch: server `card_index` = 2 (card 3 completed, 0-indexed). Viewer opens at card 3 (index 2). Card 4 is not marked complete. User must re-complete card 4. |

---

## Placement Quiz — Back Navigation Lock

| # | Trigger | System Response |
|---|---------|----------------|
| IR-40 | Placement Quiz screen is active and Q1 has been rendered (quiz started) | **Android system back gesture AND iOS edge-swipe gesture are intercepted and suppressed.** The back chevron is removed from the quiz screen header once Q1 renders. No navigation backwards is possible once the quiz has started. If the user attempts to exit via multi-task / app kill + reopen, the quiz is still marked as attempted (`placement_quiz_attempted = true`); one-attempt-only rule is enforced regardless of how the session ended. |

> **Rationale (OQ-C resolved):** Once the Placement Quiz starts, the user has seen question content. Allowing back navigation would let experienced users selectively re-answer to game the system. The one-shot constraint (BR-LEARN-21) only has integrity if exit mid-quiz is treated as an attempt expended.

---

## Welcome Modal Animation

**Decision (OQ-D / OQ-02 resolved):** Welcome Modal uses a **3-second Lottie animation** before the CTA content becomes interactive.

| Property | Spec |
|----------|------|
| Animation asset | `lottie_welcome_learning.json` (rocket/chart-ticker theme, designed for `canvas` dark background) |
| Duration | 3.0 seconds, plays once on modal open, then holds final frame |
| Size | 240×240px, centered horizontally, top 25% of modal |
| Fallback | If Lottie asset fails to load: static illustration PNG `img_welcome_learning_static.png` (same 240×240px slot); no animation; modal CTAs active immediately |
| CTA availability | "Bắt đầu Module 1" button is **enabled immediately** (not gated on animation completion); user can tap during animation |
| Skip | User tapping CTA during animation dismisses animation immediately and navigates as normal |

---

# 3.3 Edge Case UI Handling

---

## EC-01: Network Drop While Saving Card Progress

| Step | Behavior |
|------|----------|
| Detection | Network request for `session_progress` upsert returns network error or times out (> 8s) |
| Immediate UI | No error shown. User continues swiping normally. Progress held in local in-memory queue. |
| Retry | Client retries every 15 seconds on any available network connection. Queue persists until next successful server ACK. |
| Max offline time | Up to 5 minutes of unsaved cards are held in-memory. After 5 minutes with no server ACK, show subtle banner: "Tiến trình đang chờ đồng bộ" (`warning` color, 12px text, top of lesson viewer). |
| On reconnect | Flush queue in order. XP toast fires as normal after server confirms completion. |
| Authoritative state | Last server-ACKed `card_index` is always the resume point. In-memory progress ahead of last ACK is non-authoritative per BR-LEARN-15. |

---

## EC-02: App Killed Between Card 3 and Card 4 Before Save Completes

| Step | Behavior |
|------|----------|
| Scenario | User completes card 3 (Myth-Buster). Save request is in-flight. OS kills app before server ACK received. |
| On relaunch | App boots. `session_progress` fetch returns `card_index = 2` (last server-confirmed: card 2, 0-indexed). |
| Viewer opens | Card 3 (index 2) is displayed. NOT card 4. User sees the Myth-Buster card again. This is correct and expected per BR-LEARN-15. |
| No user error | No error message shown. User simply re-swipes through card 3 and progresses normally. |
| XP integrity | No XP impact; XP is only awarded on lesson completion (card 5 exit). |

---

## EC-03: Pre-filled Stock for CTA is Suspended or Delisted

| Step | Behavior |
|------|----------|
| Detection | On CTA modal open: system calls `GET /stocks/{ticker}/status`. Response `status ≠ ACTIVE`. |
| Substitution logic | Server selects next eligible stock: same exchange → same sector → largest market cap → `ACTIVE` status. |
| Substitution is silent | CTA modal opens with substitute stock. No alert to user. |
| Logging | `cta_stock_substitution` event logged: `{user_id, lesson_id, original_ticker, substituted_ticker, reason}`. |
| Full delisting (all sector stocks unavailable) | Extremely unlikely edge case. CTA modal opens without pre-fill; user sees empty order form with placeholder "Chọn cổ phiếu" (Select a stock). Lesson still completable via skip. |

---

## EC-04: Virtual Portfolio Not Initialized When "Try It Now" Tapped

| Step | Behavior |
|------|----------|
| Detection | `GET /virtual-portfolio/{user_id}` returns 404 or `status: NOT_INITIALIZED`. |
| Loading state | CTA button text replaced with activity spinner (24px, `lime` color). Button background stays `lime`. |
| Init call | `POST /virtual-portfolio/initialize` fired with `{user_id, balance: 500000000}`. |
| Success (< 3s) | Spinner dismisses. CTA modal pushes. |
| Success (3–10s) | Spinner persists. User sees no additional message. CTA modal pushes when API responds. |
| Failure (> 10s OR error) | Error bottom sheet: "Không thể khởi tạo tài khoản ảo. Thử lại?" with "Thử lại" (retry init) and "Bỏ qua" (skip CTA, complete lesson). Both options must be clearly visible. |
| Retry cap | 3 automatic retries in background before surfacing error to user. |

---

## EC-05: Placement Quiz Submitted with Network Timeout

> Note: Initial Placement Quiz (IPQ) is referenced in the business context (pass 4/5 → skip M1). This EC covers the submission failure path.

| Step | Behavior |
|------|----------|
| Scenario | User submits placement quiz answers. Network times out before server ACK. |
| Immediate UI | Spinner on submit button persists up to 10s. |
| Timeout reached | Show error: "Không thể gửi kết quả. Kiểm tra kết nối và thử lại." with "Thử lại" button. |
| Answers preserved | User's selected answers are held in local state. "Thử lại" re-submits same answers without re-showing quiz. |
| Idempotency | Submit endpoint requires `idempotency_key = {user_id}:{quiz_session_id}`. Double-submit on retry is safe. |
| If server received first attempt | Server returns existing result. Client displays that result. No double-evaluation. |

---

## EC-06: MKC Retry Attempted Within 60-Second Cooldown

| Step | Behavior |
|------|----------|
| Scenario | User fails MKC. Cooldown starts. User taps "Thử lại" before 60s elapses. |
| Enforcement — client | "Thử lại" button: `disabled` prop = true. Background `surface-03`. No visual feedback on tap. |
| Enforcement — server | `POST /mkc/attempt` returns `HTTP 429` with `retry_after` seconds if cooldown active. |
| If client bypassed (e.g., modified app) | Server rejects with 429. Client receives 429 and shows: "Vui lòng đợi [N] giây trước khi thử lại." toast. |
| Countdown display | MM:SS format. `Space Grotesk 20 Bold`, `warning` color. Counts in real-time using `setInterval(1000)`. |
| Timer accuracy | Server `retry_after` is authoritative. Client shows `retry_after` value on MKC fail response; does not rely on local timer as source of truth. On app background + foreground: re-fetch `retry_after` from server to correct drift. |

---

## EC-07: User Completes L1.5 While Offline (Bonus Cash Creation Queued)

> Note: This EC applies to L2.5 (the actual lesson that triggers Module 2 bonus cash). L1.5 completion triggers M2 unlock. The edge case below covers M2 bonus cash specifically (L2.5 offline completion).

| Step | Behavior |
|------|----------|
| Scenario | User swipes past CTA card of L2.5 while device has no network. |
| Local state | Lesson completion event queued locally. XP toast "+25 XP" shown from local state. |
| On reconnect | Client flushes completion event queue. Server processes `lesson_completed` for L2.5. `module_completion` for M2 fires server-side. `bonus_cash_ledger` record created. |
| User experience delay | Module Completion Modal (ModuleCompletionModal) is shown when server ACK is received, not immediately on swipe. If user has navigated away by then, modal is shown as full-screen overlay on next Grow tab visit (flag: `module_completion_modal_pending`). |
| Bonus cash TTL | `awarded_at` = server timestamp when ledger record is created (NOT the time of offline swipe). 7-day TTL starts from server creation time. |
| Idempotency | Event queue item has idempotency key `{user_id}:L2.5`. If reconnect causes double-send, server deduplicates. |

---

# 3.4 QA Test Cases

---

## Flow 1: First-Time User → Welcome Modal → Placement Quiz Pass → M2 Start

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| F1-01 | Welcome Modal fires on first launch | 1. New account created. 2. Open app for the first time. | Welcome Modal displays full-screen before any Home tab content is interactive. `welcome_modal_shown = false` on server before render. |
| F1-02 | Welcome Modal flag written on render (not CTA tap) | 1. New account. 2. App reaches Home tab → modal renders. 3. Force-kill app before tapping any button. 4. Relaunch app. | Welcome Modal does NOT appear on second launch. `welcome_modal_shown = true` on server. |
| F1-03 | Placement quiz entry from Welcome Modal | 1. Welcome Modal visible. 2. If placement quiz option present: tap CTA. | Placement quiz (5 questions) loads full-screen. |
| F1-04 | Placement quiz pass (4/5 correct) | 1. On placement quiz. 2. Answer 4 out of 5 questions correctly. 3. Submit. | Result screen: "Bạn đã qua bài kiểm tra! Bắt đầu từ Module 2." M1 status set to COMPLETE in Grow tab. M2 status = UNLOCKED. M2 card shows "Bắt đầu" button. |
| F1-05 | M2 start after placement skip | 1. After placement pass result screen. 2. Tap "Tiếp tục đến Module 2". | L2.1 lesson viewer opens at card 1. Module path shows M1 as COMPLETE, M2 as IN_PROGRESS. |
| F1-06 | XP state after placement skip | 1. Complete placement quiz (4/5 pass). 2. Check XP balance. | XP balance = 125 XP (M1 skipped lessons credited as equivalent) OR 0 XP (design decision; confirm with product — flag as open question if ambiguous). |
| F1-07 | Welcome Modal not shown after placement quiz completes | 1. Complete placement quiz. 2. Navigate away and back. 3. Close and reopen app. | Welcome Modal never shown again on any subsequent launch. |
| F1-08 | Placement quiz pass on reinstall (same account) | 1. User already passed placement quiz (M1 skipped). 2. Uninstall + reinstall app. 3. Log in. | Grow tab shows M1 = COMPLETE, M2 = UNLOCKED or IN_PROGRESS (server-side state preserved). Welcome Modal not shown. |

---

## Flow 2: First-Time User → Welcome Modal → Placement Quiz Fail → M1 Start

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| F2-01 | Placement quiz fail (≤3/5 correct) | 1. On placement quiz. 2. Answer ≤3 questions correctly. 3. Submit. | Result screen: "Bắt đầu từ Module 1." M1 status = UNLOCKED. M2 remains LOCKED. |
| F2-02 | Correct module state after fail | 1. Placement quiz fails. 2. Navigate to Grow tab. | M1 card shows UNLOCKED state with "Bắt đầu" button. M2 card shows LOCKED state with padlock icon. |
| F2-03 | M1 start post-fail | 1. Tap "Bắt đầu Module 1" from result screen or Grow tab. | L1.1 lesson viewer opens at card 1 (Concept). Progress indicator shows "1/5". |
| F2-04 | Placement quiz no retry option | 1. Placement quiz fails. 2. Look for "Thử lại" button on result screen. | No "Thử lại" option visible. Placement quiz is one-shot per user per BR-LEARN spec (one-shot). |
| F2-05 | Welcome Modal secondary CTA ("Explore first") → then placement quiz | 1. Welcome Modal. 2. Tap "Khám phá trước". 3. Navigate to Grow tab. 4. Tap learning prompt card → placement quiz entry. | Placement quiz loads. Same pass/fail rules apply. |
| F2-06 | Fail result screen navigation | 1. Placement quiz fails. 2. Tap "Bắt đầu Module 1" CTA. | Navigates directly to L1.1, card 1. Grow tab NOT shown as intermediate step. |
| F2-07 | Score display on fail | 1. Answer 2/5 correctly. 2. Submit. | Score shown: "Bạn trả lời đúng 2/5 câu". No shame messaging. Clear "start from M1" CTA. |
| F2-08 | `welcome_modal_shown` persists after quiz regardless of pass/fail | 1. Complete placement quiz (any result). 2. Force-kill. 3. Reopen. | Welcome Modal never shows again. |

---

## Flow 3: Full Lesson Completion (Card 1 → 5, Swipe Past CTA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| F3-01 | Card 1 renders correctly on lesson open | 1. Open L1.1 (fresh, no prior progress). | Card 1 (Concept) displayed. Card type pill "Khái niệm" visible. Progress indicator "1/5". |
| F3-02 | Swipe left progresses through cards 1–3 | 1. On card 1. 2. Swipe left 3 times. | Cards 2, 3 in sequence with correct card type pills. Progress updates to "2/5", "3/5". Each save request fires (verify via network log). |
| F3-03 | Card 4 (Quiz) blocks forward swipe if unanswered | 1. On card 3. 2. Swipe left to card 4. 3. Swipe left again without answering. | Swipe rejected. Spring-back animation. Haptic feedback. Progress stays at "4/5". |
| F3-04 | Quiz answered correctly — advance enabled | 1. On card 4. 2. Select correct answer. 3. Confirm. 4. Swipe left. | Correct feedback (green, ✓). Swipe left succeeds. Card 5 (CTA) displays. |
| F3-05 | CTA card shown with skip link | 1. On card 5. | "Thử ngay" primary button visible. "Bỏ qua, tiếp tục →" skip link visible below button. |
| F3-06 | Swipe past CTA (skip path) completes lesson | 1. On card 5. 2. Swipe left without tapping "Thử ngay". | XP toast "+25 XP" appears. Lesson completion event fires. Navigate to Grow tab. Module progress bar updates. |
| F3-07 | Skip link tap also completes lesson | 1. On card 5. 2. Tap "Bỏ qua, tiếp tục →". | Same result as F3-06. Lesson completes. XP awarded. |
| F3-08 | Server `lesson_completions` record created exactly once | 1. Complete a lesson (swipe past CTA). 2. Return to lesson in review mode. 3. Swipe past CTA again. | Verify via API: `lesson_completions` has exactly 1 row for `{user_id, lesson_id}`. No second XP grant. No second row. |
| F3-09 | Review mode — no XP on replay | 1. Lesson already completed. 2. Enter via "Ôn lại" button. 3. Navigate through all 5 cards. 4. Swipe past CTA. | No XP toast. No completion event. XP balance unchanged. |
| F3-10 | Progress indicator accuracy | 1. Open L1.1. 2. Advance through cards 1 → 5. | At each card: indicator shows "1/5" → "2/5" → "3/5" → "4/5" → "5/5". Previous cards show filled dots. Current card is highlighted. |

---

## Flow 4: Quiz Wrong × 3 → Hint Card → Correct Answer → Advance

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| F4-01 | First wrong answer — no hint yet | 1. On card 4. 2. Select wrong answer. 3. Confirm. | Wrong state animation (shake, red). "Thử lại" button appears. Hint NOT shown. `attempt_count = 1`. |
| F4-02 | Second wrong answer — no hint yet | 1. "Thử lại". 2. Select another wrong answer. 3. Confirm. | Same wrong animation. `attempt_count = 2`. Hint NOT shown. |
| F4-03 | Third wrong answer triggers hint card | 1. "Thử lại". 2. Select a wrong answer (3rd consecutive). 3. Confirm. | Wrong animation fires. Hint card slides in from right over quiz card. `quiz_state.hint_shown = true`. |
| F4-04 | Hint card displays lesson-specific text | 1. Hint card is visible. | Hint text matches `lessons.quiz_hint_text` for this lesson. Not a generic placeholder. |
| F4-05 | Hint card dismissal returns to quiz | 1. On hint card. 2. Swipe left OR tap "Hiểu rồi". | Hint card slides out. Quiz card appears. All answer options reset to Default state. |
| F4-06 | Correct answer after hint — full XP | 1. After hint dismissed. 2. Select correct answer. 3. Confirm. 4. Swipe to card 5. 5. Skip/swipe past CTA. | Lesson completes. "+25 XP" toast. XP balance += 25. No XP penalty for 3 wrong + hint. |
| F4-07 | Hint shown only once per session | 1. Complete steps to see hint (3 wrong). 2. Dismiss hint. 3. Answer wrong 3 more times. | Hint card does NOT appear again. `quiz_state.hint_shown = true` guard prevents re-show. |
| F4-08 | Hint fallback text if `quiz_hint_text` is null | 1. Lesson with null `quiz_hint_text` in DB. 2. Get 3 wrong answers. | Hint card shows: "Đọc lại thẻ Khái niệm và Ví dụ để tìm gợi ý." (generic fallback). No blank card. |
| F4-09 | Hint counter resets on app kill | 1. Get 2 wrong answers on quiz. 2. Force-kill app. 3. Reopen. 4. Navigate back to quiz. | `attempt_count` loaded from `session_progress.quiz_state`. If server saved `attempt_count = 2`, third wrong still triggers hint. If server did not save (network failure), counter resets to 0. |

---

## Flow 5: MKC Attempt — Fail → 60s Cooldown → Retry → Pass → Level Up

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| F5-01 | MKC screen accessible after all 5 lessons complete | 1. Complete all 5 lessons of M1. 2. Navigate to Grow tab M1 entry. | MKC option visible. "Làm bài kiểm tra Module" button present on M1 card or dedicated MKC entry point. |
| F5-02 | MKC fail — score < 3/5 | 1. On MKC. 2. Answer ≤2 questions correctly. 3. Submit. | Fail screen: "Bạn trả lời đúng [N]/5 câu." Cooldown timer starts at 60 seconds. "Thử lại" disabled. |
| F5-03 | "Thử lại" disabled during cooldown | 1. MKC failed (cooldown active). 2. Tap "Thử lại" button at 30s remaining. | No response. Button appearance: `surface-03` background, `text-disabled` text. Tap is inert. |
| F5-04 | Cooldown timer accuracy | 1. MKC fail. 2. Observe countdown. | Timer decrements 60 → 0 in real-time. Format: "0:59", "0:30", "0:00". |
| F5-05 | Cooldown enforced server-side | 1. MKC fail. 2. Use network tool to POST `/mkc/attempt` within cooldown. | Server returns `HTTP 429` with `retry_after` in response body. Client shows: "Vui lòng đợi [N] giây." |
| F5-06 | "Thử lại" re-enables after cooldown | 1. MKC fail. 2. Wait 60 seconds. | "Thử lại" button becomes active (`lime` style). Cooldown banner dismisses. Timer shows "0:00" then disappears. |
| F5-07 | MKC retry — pass (≥3/5) | 1. Retry MKC after cooldown. 2. Answer ≥3 questions correctly. | Pass screen: confetti lottie. "+15 XP Lên cấp!" XP toast. Learning Level badge on profile updates. |
| F5-08 | Level up reflects in profile | 1. MKC pass triggers level-up. 2. Navigate to Profile screen. | LearningLevelBadge pill shows new level label. Plasma background on pill. |
| F5-09 | No XP for failed MKC | 1. Fail MKC. 2. Check XP balance. | XP balance unchanged. No "+15 XP" toast on fail. |
| F5-10 | Unlimited MKC retries (no gate) | 1. Fail MKC 5 times. | No lockout. After each cooldown, "Thử lại" re-enables. User can retry indefinitely. |

---

## Flow 6: Module Unlock — M2 Complete + Trade Count ≥ 3 → M3 Instantly Unlocked

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| F6-01 | M3 locked if trade count < 3 even after M2 complete | 1. Complete M2. 2. Total paper trades = 2. 3. Check Grow tab. | M3 shows LOCKED. Tooltip: trade count prerequisite not met. |
| F6-02 | Trade count ≥ 3 before M2 complete (current-state check) | 1. Place 5 paper trades (M2 in progress). 2. Complete L2.5 (M2 final lesson). | M3 unlocks immediately on M2 completion. Current-state check finds trade count already ≥ 3. |
| F6-03 | Trade count reaches 3 AFTER M2 complete | 1. Complete M2 with 1 trade. 2. Place 2nd paper trade. 3. Place 3rd paper trade. | On 3rd trade: `paper_trade_placed` event fires. M3 unlock evaluation runs. M3 unlocks. Push notification: "Module 3 đã mở khóa!" |
| F6-04 | M3 card visual update in Grow tab | 1. M3 just unlocked. 2. User is on Grow tab (active). | M3 card animates: border pulses `plasma` ×2, transitions from LOCKED to UNLOCKED state. Padlock icon disappears. "Bắt đầu" button appears. |
| F6-05 | Idempotency — no double-unlock | 1. M3 already UNLOCKED. 2. User places 4th trade triggering another evaluation. | No change. M3 remains UNLOCKED. No duplicate notification. No animation re-fires. |
| F6-06 | M3 tooltip while locked (insufficient trades) | 1. M2 complete. 2. Trade count = 2. 3. Tap M3 locked card. | Tooltip: "Đặt ít nhất 3 lệnh để mở khóa Module 3." (shows remaining count if possible: "Cần 1 lệnh nữa.") |
| F6-07 | M3 tooltip while locked (M2 not complete) | 1. M2 in progress. 2. Tap M3 locked card. | Tooltip: "Hoàn thành Module 2 để mở khóa." Trade count not mentioned (primary prerequisite not met). |
| F6-08 | Trade count for M3 uses `portfolio_type = "main"` only | 1. Place trades in sub-portfolio (if applicable). 2. Check M3 unlock status. | Sub-portfolio trades do NOT count toward M3 prerequisite. Only main portfolio paper trades count. |

---

## Flow 7: Bonus Cash — M2 Completion → 50M VND Credit → T-24h Notification → T+7 Expiry

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| F7-01 | Bonus cash created on M2 completion | 1. Complete L2.5 (M2 final lesson). 2. Check `bonus_cash_ledger` (or virtual portfolio UI). | `bonus_cash_ledger` record: `amount = 50000000`, `status = ACTIVE`, `expires_at = awarded_at + 7 days`. |
| F7-02 | Bonus cash shown as separate line item | 1. M2 complete. 2. Open virtual portfolio screen. | Bonus cash displayed as distinct line: "Tiền thưởng học tập: 50,000,000 VND – còn 7 ngày". NOT merged with main 500M VND balance. |
| F7-03 | Main balance unaffected by bonus cash | 1. M2 completion fires. 2. Check main cash balance. | If user had 480,000,000 VND main balance, it remains 480,000,000 VND. Bonus cash is additive display only. |
| F7-04 | T-24h notification | 1. M2 complete. 2. Advance system clock to T+6 days. | Push notification delivered: title "Tiền thưởng sắp hết hạn", body as per spec. `notification_t24h_sent = true` in ledger. |
| F7-05 | T-1h notification | 1. Advance to T+7 days − 1 hour. | Push notification: title "Còn 1 giờ!", body as per spec. `notification_t1h_sent = true` in ledger. |
| F7-06 | T+7 expiry — force liquidation of positions | 1. User has 2 open positions funded by bonus cash. 2. T+7 job runs. | Both positions force-liquidated at last market price. Realized P&L added to main portfolio P&L history. Uninvested bonus balance removed. Ledger `status = EXPIRED`. |
| F7-07 | T+7 expiry — no positions | 1. User never traded bonus cash. 2. T+7 job runs. | No liquidations. Uninvested 50M balance removed. Ledger `status = EXPIRED`. Main balance unchanged. |
| F7-08 | Bonus cash not shown after expiry | 1. T+7 expiry complete. 2. Open virtual portfolio. | Bonus cash line item no longer visible. Main portfolio unaffected. In-app notification: "Tiền thưởng học tập đã hết hạn. P&L đã được lưu vào danh mục của bạn." |
| F7-09 | Idempotency — no double bonus cash | 1. M2 completion event fires twice (network retry). | Only one `ACTIVE` bonus_cash_ledger record exists. Second event finds existing record and exits. No duplicate 50M credit. |
| F7-10 | Bonus cash trades earn standard XP | 1. Place paper trade funded by bonus cash. 2. Trade fills. | Trade XP awarded per FR-GAME-01. `portfolio_type = "main"` on trade record. Bonus cash `ledger_source` does not reduce XP. |

---

## Flow 8: Resume Lesson — App Killed at Card 3 → Reopen → Resume at Card 3

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| F8-01 | Progress saved through card 2 | 1. Open L2.3. 2. Swipe through card 1 and card 2. 3. Verify save request sent before advancing to card 3. | Network log shows `PATCH /session_progress` with `card_index = 1` after card 2 completion (0-indexed). |
| F8-02 | Progress saved at card 3 | 1. Advance to card 3 (Myth-Buster). 2. Observe network. | `PATCH /session_progress` fires with `card_index = 2`. Server responds 200. |
| F8-03 | App killed after card 3 save ACK | 1. Swipe to complete card 3. 2. Confirm save ACK received (200 response). 3. Force-kill app via OS. | App terminates. `session_progress.card_index = 2` on server. |
| F8-04 | Reopen app — resume at card 3 | 1. Reopen app. 2. Navigate to L2.3. | Lesson viewer opens at card 3 (index 2, Myth-Buster card). NOT card 1. |
| F8-05 | Progress dots reflect history | 1. Resume at card 3. | Progress dots: cards 1 and 2 show as visited (filled). Card 3 shows as current. |
| F8-06 | Kill between card 3 and 4 (save in-flight) | 1. Swipe to complete card 3. 2. Kill app BEFORE save ACK is received (immediately after swipe). 3. Reopen app. | Lesson opens at card 3 (NOT card 4). Server `card_index = 1` (last confirmed). User must re-complete card 3. This is correct per BR-LEARN-15. |
| F8-07 | Kill on card 3 mid-read (no swipe yet) | 1. Open lesson at card 3. 2. Kill app without swiping. | Reopen: lesson opens at card 3 (same state). No regression. |
| F8-08 | Quiz state preserved after kill at card 4 (2 wrong answers) | 1. Get to card 4. 2. Answer wrong 2 times (`attempt_count = 2` saved). 3. Kill app. 4. Reopen. | Quiz card shown. `quiz_state.attempt_count = 2` loaded from server. Next wrong answer (3rd) triggers hint correctly. |
| F8-09 | Multi-device resume | 1. User advances to card 3 on Device A. 2. Open same lesson on Device B immediately. | Device B fetches server `session_progress`. Opens at card 3 (last-write-wins). No conflict error shown. |
| F8-10 | Completed lesson not resumable (review mode) | 1. Lesson has `lesson_completions` record. 2. Tap lesson from Grow tab. | Lesson opens in review mode at card 1 (not card_index). "Ôn lại" label in header. No resume logic. All 5 cards freely navigable. |

---

## Supplementary Test Cases

### Navigation Stack Integrity

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| S-01 | Back from CTA modal → lands on card 5 (not Grow tab) | 1. On CTA card. 2. Tap "Thử ngay". 3. CTA modal opens. 4. Tap back/close. | Returns to card 5 of lesson. Grow tab is NOT shown. Navigation stack: `[Grow, Lesson(card 5)]`. |
| S-02 | Back from lesson viewer → Grow tab | 1. In lesson. 2. Tap back chevron in header. | Returns to Grow tab (module screen). If lesson was in-progress (card < 4), confirmation sheet: "Tiến trình đã được lưu." |
| S-03 | Deep link to lesson mid-session | 1. Push notification for lesson resume. 2. Tap notification. | App deep-links to lesson viewer at last saved card. Back navigation from deep-linked lesson → Grow tab. |

### XP Idempotency

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| S-04 | Double lesson completion event (retry) | 1. Lesson completion event sent. 2. Network error → client retries same event. | Server deduplicates via `xp_grant_idempotency_key = {user_id}:{lesson_id}`. XP += 25 exactly once. |
| S-05 | Module completion bonus fired twice | 1. M3 completes. 2. Retry causes second `module_completion` event. | `module_progress.module_bonus_xp_granted = true` guard prevents second +25 XP. |

### Daily Missions Gate

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| S-06 | Missions locked before M1 complete | 1. New user. 2. Open Home tab. | "Nhiệm vụ hôm nay" widget shows locked state with 2 skeleton rows and padlock. "Bắt đầu học" CTA present. |
| S-07 | Missions unlock immediately after M1 complete | 1. Complete L1.5. 2. Return to Home tab. | Daily Missions widget shows live missions. Locked state gone. No app restart required. |

---

# Appendix A: API Contracts (Summary for QA Reference)

| Endpoint | Method | Use | Key Parameters |
|----------|--------|-----|----------------|
| `/session_progress` | PATCH | Save card progress | `user_id`, `lesson_id`, `card_index`, `quiz_state` |
| `/lesson_completions` | POST | Complete lesson | `user_id`, `lesson_id`, `session_id`, `idempotency_key` |
| `/module_progress/{module_id}` | GET | Fetch module state | `user_id` |
| `/mkc/attempt` | POST | Submit MKC | `user_id`, `module_id`, `answers[]`, `attempt_session_id` |
| `/mkc/cooldown` | GET | Check cooldown status | `user_id`, `module_id` → `{cooldown_active, retry_after}` |
| `/virtual-portfolio/initialize` | POST | Init virtual account | `user_id` |
| `/virtual-portfolio/{user_id}` | GET | Check portfolio exists | — |
| `/stocks/{ticker}/status` | GET | Check stock active status | — |
| `/bonus_cash_ledger` | GET | Get active bonus cash | `user_id` |
| `/xp/balance` | GET | Current XP balance | `user_id` |
| `/learning_level` | GET | Current level + threshold | `user_id` |

---

# Appendix B: Open Questions Requiring Resolution Before QA Sign-off

| # | Question | Impact on Testing |
|---|----------|-------------------|
| OQ-01 | Tier 2 XP threshold for community posting (deferred to FR-GAME-06) | Cannot write F-M4 completion test that verifies community unlock without this value |
| OQ-05 | "Market Scholar" badge rarity — Common or Uncommon? (FRD says Common, GAME-06 catalogue confirms Common as `#9CA3AF`) | Badge border color in F4.5 test case depends on final rarity |
| OQ-06 | M3 bonus XP (+25) — shown as separate line or rolled into total in completion modal? | Completion modal visual assertion needs clarification |
| OQ-07 | L3.3 bulk watchlist add — silent dedup or "N already in list" confirmation? | Test case for L3.3 CTA requires known expected behavior |
| IPQ-XP | XP awarded when placement quiz passes and M1 is skipped — is it 125 XP, 0 XP, or defined elsewhere? | F1-06 test assertion is ambiguous without this value |

---

*End of Dev/QA Handoff Specification — F0 Learning Path v1.0*

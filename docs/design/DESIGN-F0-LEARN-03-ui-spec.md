# F0 Learning Path — UI Specification
**Version:** 1.0 | **Date:** 2026-05-28 | **Feature:** F0 Learning Path (Module F-LEARN)

> **Design system base:** `docs/design/design-system.md` (V2.0 "Kinetic Drop")
> **Component registry:** `docs/design/components.md`
> **Extended tokens** specific to this feature are in Section 1.2 below (not in design-system.md yet).

---

## 1. Design Token Reference

### 1.1 Inherited from `design-system.md` (use exactly as defined — do not re-specify)

| Token | Value | Usage in this feature |
|-------|-------|----------------------|
| `ink-900` | `#0E0E0E` | All screen backgrounds |
| `ink-800` | `#131313` | Card surfaces, bottom sheets, module cards |
| `ink-700` | `#1A1A1A` | Raised card state, quiz options (default) |
| `ink-600` | `#262626` | Input background, avatar/icon tile bg |
| `ink-400` | `#484847` | Placeholder, disabled elements |
| `lime` | `#CAFD00` | Primary CTAs, XP values, progress fills, correct answer indicator |
| `lime-soft` | `#F3FFCA` | Display headings, key terms, card headlines |
| `lime-ink` | `#516700` | Text on lime-filled buttons |
| `lime-glow` | `rgba(202,253,0,0.20)` | Primary CTA glow, XP toast glow |
| `lime-drop` | `linear-gradient(135deg, #F3FFCA 0%, #CAFD00 100%)` | Primary KineticButton |
| `plasma` | `#D277FF` | Hint card accent, learning level badge, Placement Quiz identity |
| `plasma-deep` | `#7D01B1` | Security info icon tile (Bonus Cash modal) |
| `plasma-glow` | `rgba(210,119,255,0.20)` | Level-up banner glow, plasma CTA glow |
| `fog` | `#ADAAAA` | Body copy, secondary labels, quiz options text |
| `fog-muted` | `#7A7777` | Locked module labels, disabled states, timestamps |
| `positive` | `#10B981` | Correct answer border + fill, myth-busted "truth" section |
| `negative` | `#EF4444` | Wrong answer border + fill, cooldown timer, fail state copy |
| `edge` | `rgba(72,72,71,0.20)` | Card borders, default states |
| `edge-strong` | `rgba(72,72,71,0.40)` | Selected option border, focus rings |
| `shadow-glow-lime` | `0 8px 30px rgba(202,253,0,0.20)` | Primary CTA button glow |
| `shadow-glow-plasma` | `0 8px 30px rgba(210,119,255,0.25)` | Hint card CTA glow |
| `radius-sm` | 8px | Inline chips, tags |
| `radius-md` | 12px | Badge pills, icon tiles |
| `radius-lg` | 16px | Quiz options, small cards |
| `radius-xl` | 24px | Content cards, quick-action tiles |
| `radius-2xl` | 32px | Module cards, MKC question cards |
| `radius-4xl` | 40px | Bottom sheets (top corners), Welcome Modal panel |
| `radius-full` | 9999px | Progress dots, XP pills, rarity tags |
| `space-3` | 12px | Component internal gap, hint card content gap |
| `space-4` | 16px | Standard card padding, option rows gap |
| `space-5` | 20px | CTA vertical padding, section dividers |
| `space-6` | 24px | Screen horizontal margin, card internal padding |
| `space-8` | 32px | Outer card padding, section gap |
| `space-10` | 40px | Hero vertical padding |
| `display-md` | 36px/700/Space Grotesk | Score heroes, bonus cash amount |
| `display-sm` | 24px/700/Space Grotesk | Card headlines, XP toast amount |
| `title-md` | 18px/400/Space Grotesk | Screen titles, reward headlines |
| `body-lg` | 18px/400/Manrope | Question text, concept body |
| `body-md` | 14px/400/Manrope | Secondary labels, hint copy, module body |
| `caption-drop` | 14px/400/uppercase/Space Grotesk | Button labels, secondary actions |
| `caption-pulse` | 12px/400/uppercase/Space Grotesk | Card type tags, rarity labels, module eyebrows |

---

### 1.2 Feature-Specific Tokens (add to Figma library under **Learning / Tokens**)

| Token | Value | Usage |
|-------|-------|-------|
| `rarity-common` | `#9CA3AF` | M1/M2 badge borders |
| `rarity-uncommon` | `#34D399` | M3 badge border |
| `rarity-rare` | `#60A5FA` | M4 badge border + glow source |
| `rarity-epic` | `#F59E0B` | Reserved — V2 only |
| `xp-pill-bg` | `rgba(202, 253, 0, 0.12)` | XP chip background |
| `hint-surface` | `rgba(210, 119, 255, 0.08)` | Hint card fill |
| `hint-border` | `rgba(210, 119, 255, 0.25)` | Hint card border |
| `quiz-correct-bg` | `rgba(16, 185, 129, 0.12)` | Correct answer option fill |
| `quiz-wrong-bg` | `rgba(239, 68, 68, 0.12)` | Wrong answer option fill |
| `progress-track` | `rgba(72, 72, 71, 0.30)` | Lesson + MKC progress bar track |
| `progress-fill` | `lime (#CAFD00)` | Progress bar fill |
| `locked-surface` | `ink-800 + opacity-40` | Locked module card overlay |
| `badge-surface` | `ink-700 (#1A1A1A)` | Badge container |
| `cooldown-bg` | `rgba(239, 68, 68, 0.08)` | MKC retry cooldown banner |
| `module-tag-bg` | `rgba(202, 253, 0, 0.08)` | Module card eyebrow tag bg |
| `myth-wrong-bg` | `rgba(239, 68, 68, 0.08)` | Myth statement surface |
| `myth-truth-bg` | `rgba(16, 185, 129, 0.08)` | Truth statement surface |

---

## 2. Component Inventory per Screen

> Before adding any new component, check `docs/design/components.md`.
> Existing reusable components are listed first (REUSE), followed by new F0 Learning components (NEW).

### Existing Components Being Reused

| Component | Variant Used | Screens |
|-----------|-------------|---------|
| `KineticButton` | `lime` | Welcome Modal, Lesson CTA, MKC, Reward, Bonus Cash (all primary actions) |
| `KineticButton` | `ghost` | Welcome Modal (secondary), Lesson CTA (skip), Grow Tab (sub-nav actions) |
| `KineticButton` | `plasma` | Hint Card CTA ("Hiểu rồi, thử lại") |
| `AmbientBackground` | default | Welcome Modal, Placement Quiz Results, Module Reward Screen |
| `GlassmorphicSecurityInfo` | default | Bonus Cash Modal (paper trading safety notice) |
| `ChangePill` | `positive` | Example Card (VN stock market data snapshot) |
| `PaaveWordmark` | `sm` | Learning Path Home (Grow Tab) header |

---

### New Components Required (defined in `DESIGN-F0-LEARN-04-component-spec.md`)

| Component | Screens Used |
|-----------|-------------|
| `LearningPromptCard` | Learning Path Home (conditional) |
| `ModuleCard` | Learning Path Home (×4) |
| `LessonProgressBar` | All Lesson Viewer screens |
| `ProgressDots` | All Lesson Viewer screens |
| `ContentCard` (variants: concept, example, myth-buster, cta) | Lesson Viewer Cards 1–3, 5 |
| `QuizCard` | Lesson Viewer Card 4, MKC |
| `QuizOption` | Lesson Viewer Card 4, MKC, Placement Quiz |
| `HintCard` | Lesson Viewer Card 4 (after 3 wrong) |
| `XPToast` | Lesson completion (floating toast) |
| `BadgeCard` | Module Reward Screen, Grow Tab / My Badges |
| `BadgeRewardModal` | Module Reward Screen |
| `MKCQuestionCard` | MKC Screen |
| `PlacementQuizCard` | Placement Quiz Screen |
| `BonusCashModal` | Module 2 reward → bottom sheet |
| `MKCCooldownBanner` | MKC Fail Results Screen |

---

## 3. State Matrices

### 3.1 QuizOption — State Matrix

| State | Background | Border | Label Color | Right Icon | Animation |
|-------|-----------|--------|-------------|-----------|-----------|
| `default` | `ink-700` | none | `fog` | none | — |
| `hover` | `ink-600` | `edge` 1px | `fog` | none | 150ms ease-standard |
| `selected` (pre-submit) | `ink-600` | `edge-strong` 1.5px | `fog` | circle check (fog-muted) | 150ms |
| `correct` | `quiz-correct-bg` | `positive` 1.5px | `positive` | ✓ Lucide `check-circle` | fadeIn 150ms |
| `wrong` | `quiz-wrong-bg` | `negative` 1.5px | `negative` | ✕ Lucide `x-circle` | shake 300ms |
| `disabled` | `ink-700` | none | `fog-muted` | none | opacity 40% |
| `review` | `ink-700` | none | `fog-muted` | none | non-interactive |

> `correct` and `wrong` states: all OTHER options switch to `disabled` simultaneously

---

### 3.2 ModuleCard — State Matrix

| State | Surface | Border | Title Color | CTA | Progress Bar | Padlock |
|-------|---------|--------|-------------|-----|-------------|---------|
| `LOCKED` | `ink-800 + locked-surface` | `edge` 1px | `fog-muted` | hidden | hidden | shown (24px, fog-muted) |
| `UNLOCKED` | `ink-800` | `edge` 1px | `lime-soft` | "Bắt đầu" (lime) | not shown (0%) | hidden |
| `IN_PROGRESS` | `ink-800` | `lime` 1px left-accent | `lime-soft` | "Tiếp tục" (lime) | shown (N%) | hidden |
| `COMPLETE` | `ink-800` | `positive` 1px | `lime-soft` | "Ôn lại" (ghost) | 100% + ✓ icon | hidden |

---

### 3.3 KineticButton — Usage in Feature

> Full state matrix in `docs/design/components.md`. Notes below are feature-specific usage rules.

| Usage | Variant | Note |
|-------|---------|------|
| Primary lesson/quiz CTAs | `lime` | One per viewport maximum |
| Hint Card CTA ("Hiểu rồi") | `plasma` | Use plasma here — identity/hint context |
| Skip / cancel actions | `ghost` | "Bỏ qua", "Để sau", "Quay về Grow" |
| DISABLED state | `lime` with `opacity-40` | MKC "Thử lại" during cooldown; quiz "Tiếp theo" before correct answer |

---

### 3.4 LessonProgressBar — State Matrix

| State | Track Color | Fill Color | Dot Indicator | Notes |
|-------|------------|-----------|---------------|-------|
| `active` | `progress-track` | `lime` | filled=lime, current=pulse, future=ink-600 | Animated fill on advance |
| `complete` | `progress-track` | `lime` (100%) | all lime | No animation |
| `review` | `progress-track` | `positive` (100%) | all positive | Read-only mode visual |

---

### 3.5 MKCCooldownBanner — State Matrix

| State | Background | Text | Button State |
|-------|-----------|------|-------------|
| `counting` | `cooldown-bg` | Countdown timer (negative, display-sm) | DISABLED (opacity-40) |
| `ready` | `xp-pill-bg` | "Thử lại ngay →" | ENABLED (lime) |

Transition: Banner background animates from cooldown-bg → xp-pill-bg over 500ms when timer hits 0.

---

### 3.6 BadgeCard — State Matrix

| Rarity | Border Color | Border Width | Glow | Symbol | Background |
|--------|-------------|-------------|------|--------|-----------|
| `Common` | `rarity-common` (`#9CA3AF`) | 1px | none | — | `badge-surface` |
| `Uncommon` | `rarity-uncommon` (`#34D399`) | 2px | `rgba(52,211,153,0.15)` | ✦ | `badge-surface` |
| `Rare` | `rarity-rare` (`#60A5FA`) | 3px | `rgba(96,165,250,0.20)` | ★ | `badge-surface` |
| `Epic` | `rarity-epic` (`#F59E0B`) | 3px | `rgba(245,158,11,0.25)` | ⚡ | `badge-surface` |

Hover/press state: scale 1→1.03 (150ms spring)

---

## 4. Platform & Responsive Rules

```
Mobile canvas:       390×852px (Figma baseline — iPhone 14 Pro)
Also test at:        360×780 (Galaxy A55), 430×932 (iPhone 15 Plus)
Horizontal margin:   24px (space-6) — both sides, all screens
Scroll bottom pad:   112px (space-28) to clear bottom nav
Safe area top:       44px handled via safe-area-inset-top
Safe area bottom:    Handled via safe-area-inset-bottom on all sticky footers
Card max-width:      342px (390 - 48)
Bottom sheet height: 60% minimum / max 90% viewport; handle = 4×36px, ink-600
```

### Touch Targets (from `design-system.md §4.2`)
```
Minimum:           44×44px
Quiz options:      min-height 56px × full-width (well above minimum)
KineticButton:     68px height (primary), 48px (small variant)
Progress dot tap:  min 32×32px tap zone (centered on 10px dot)
Card swipe:        Entire card surface is swipe target (no dead zones)
Back/next chevrons: 44×44px
Exit button:        44×44px
```

### Gesture Rules
```
Swipe left:    Advance to next card (threshold 30% card width)
Swipe right:   Go to previous card (threshold 30% card width)
Tap chevron:   Equivalent to swipe (keyboard fallback)
Long press:    No action defined for lesson viewer cards
Scroll:        Vertical scroll within card if content overflows 60% viewport height
Pinch:         Not applicable (no zoom in lesson viewer)
```

---

## 5. Micro-Interaction Specifications

### 5.1 Lesson Card Transitions

| Trigger | Animation | Duration | Easing | Notes |
|---------|-----------|----------|--------|-------|
| Swipe left / Next tap | Card slides left; next card slides in from right | 300ms | `ease-decelerate` | Parallax offset: next card starts at +20% x-translate |
| Swipe right / Back tap | Card slides right; prev card slides in from left | 300ms | `ease-decelerate` | Same parallax |
| First card, swipe right | Card bounces right 8px → returns | 200ms | `ease-spring` | + haptic (iOS light, Android tick) |
| Card 4 → Hint Card | Hint card slides in from right | 300ms | `ease-decelerate` | Hint card overlaps quiz card |
| Hint Card dismiss | Hint card slides out to right | 300ms | `ease-accelerate` | Quiz card revealed beneath |

### 5.2 Quiz Feedback

| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Tap correct option | Option fills quiz-correct-bg | 150ms | `ease-standard` |
| Tap wrong option | Option fills quiz-wrong-bg → shake | 150ms + 300ms | `ease-standard` + shake |
| Shake (wrong answer) | TranslateX: 0→8px→-8px→4px→-4px→0 | 300ms | linear (keyframe) |
| Correct answer → "Next" enabled | Button fades from opacity-40 to 1.0 | 150ms | `ease-standard` |

### 5.3 Completion Animations

| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| XP Toast appears | fadeUp (Y: 16px→0, opacity 0→1) | 300ms | `ease-decelerate` |
| XP Toast auto-dismiss | fadeDown (Y: 0→-8px, opacity 1→0) | 200ms | `ease-accelerate` |
| Badge reveal on Reward Screen | scale: 0→1.05→1.0 | 300ms | `ease-spring` |
| Confetti burst | 300 particles, lime + plasma | 1500ms | physics |
| Module card → COMPLETE | checkmark icon fades in, progress fills 100% | 500ms | `ease-standard` |
| Level-up banner | slideUp (Y: 40px→0, opacity 0→1) | 400ms | `ease-decelerate` |
| Module card unlock (LOCKED→UNLOCKED) | border pulses lime once (0→lime→0) | 600ms | `ease-spring` |

### 5.4 Progress Indicators

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Card advance → progress bar fill | Width animates to new % | 300ms ease-standard |
| Progress dot state change | Color fades ink-600 → fog-muted → lime | 200ms |
| Active dot | lime + scale 1.2× | — (persistent while on card) |
| MKC countdown timer | Seconds tick: digit changes 150ms | `countdown` (1000ms) |

### 5.5 Module Card Interactions

| Trigger | Animation | Duration |
|---------|-----------|----------|
| Press module card | scale: 1→0.98 (whole card) | 150ms ease-out |
| Module locked (tap) | Tooltip fades in from card center | 200ms ease-decelerate |
| Tooltip auto-hide | fade out | 200ms ease-accelerate, after 2500ms |

---

## 6. Accessibility Notes

> Full rules in `docs/design/design-system.md §11`. Feature-specific additions:

```
Quiz options:    aria-role="radio", aria-checked state reflects selected/correct/wrong
Progress dots:   aria-label="Thẻ [N] / 5"; active dot aria-current="step"
Quiz attempt:    Live region announcement on correct: "Đúng rồi! Vuốt để tiếp tục"
                 Live region announcement on wrong:   "Chưa đúng. Thử lại nhé!"
Hint card:       aria-live="polite" for hint text when hint card appears
Module locked:   aria-disabled="true" on locked ModuleCard; aria-label includes prerequisite
XP Toast:        aria-live="assertive" — "+25 XP, bài học hoàn thành"
MKC countdown:   aria-live="polite", updates every second
Confetti:        aria-hidden="true" — decorative only
Lottie animation: aria-label="Hình ảnh chào mừng" on fallback img; Lottie aria-hidden
```

---

*Owner: Visual Design | Tokens source: `docs/design/design-system.md` + this file §1.2*
*Component details in: `DESIGN-F0-LEARN-04-component-spec.md`*

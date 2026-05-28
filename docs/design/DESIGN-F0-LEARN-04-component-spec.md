# F0 Learning Path — Component Specifications
**Version:** 1.0 | **Date:** 2026-05-28 | **Feature:** F0 Learning Path (Module F-LEARN)

> **Rule:** Follow `docs/design/design-system.md §13` (Component Reuse Workflow).
> All tokens reference `docs/design/design-system.md` and `DESIGN-F0-LEARN-03-ui-spec.md §1.2`.
> **After Figma sign-off:** Add each new component to `docs/design/components.md`.

---

## Existing Components — Reuse Notes

The following components from `docs/design/components.md` are used WITHOUT modification.
Do NOT duplicate or create local copies.

| Component | Variant | Usage in F0 Learning Path |
|-----------|---------|--------------------------|
| `KineticButton` | `lime` | All primary CTAs (one per viewport) |
| `KineticButton` | `ghost` | Skip / cancel / secondary actions |
| `KineticButton` | `plasma` | Hint Card "Hiểu rồi" only |
| `AmbientBackground` | default | Welcome Modal, Placement Results, Reward Screen |
| `GlassmorphicSecurityInfo` | default | Bonus Cash Modal paper trading disclaimer |
| `ChangePill` | `positive` | Example Card stock data row |
| `PaaveWordmark` | `sm` | Learning Path Home top-nav |

---

## New Components

> For each new component: add to `docs/design/components.md` as part of the design handoff.
> Template matches `components.md` format (Figma frame, Used on, Variants, Props, States, Tokens used, Notes).

---

### LearningPromptCard

- **Figma frame:** `F0-Learning / LearningPromptCard`
- **Used on:** Learning Path Home (Grow Tab) — conditional, shown when welcome modal was dismissed
- **Variants:** (none — single layout)
- **Props:** `lessonId: string`, `lessonTitle: string`, `lessonNumber: string`
- **States:** default | pressed (`scale-[0.98]`)
- **Size:** 342px width × 72px height
- **Padding:** 16px horizontal, 16px vertical
- **Layout:** Horizontal flex, gap `space-3`
  - Left: Lesson icon tile (40×40px, ink-700, radius-md, Lucide icon lime-soft)
  - Center: "Tiếp tục học hôm nay" (`caption-pulse`, fog-muted) + lesson title (`body-md`, lime-soft)
  - Right: "Bắt đầu →" (`caption-drop`, lime) + `chevron-right` icon (16px, lime)
- **Surface:** `ink-800`, `radius-xl` (24px), `edge` border 1px
- **Tokens used:** `ink-800`, `ink-700`, `radius-xl`, `edge`, `lime-soft`, `fog`, `fog-muted`, `lime`, `body-md`, `caption-pulse`, `caption-drop`, `space-3`
- **Notes:** Visible only when `welcome_modal_shown = true` AND no active lesson session in progress at another entry point. Hidden once user starts a lesson.

---

### ModuleCard

- **Figma frame:** `F0-Learning / ModuleCard`
- **Used on:** Learning Path Home (Grow Tab) — ×4 instances (M1–M4)
- **Variants:**
  - `locked` — greyed, padlock icon, prerequisite copy, no CTA
  - `unlocked` — full color, "Bắt đầu" CTA
  - `in-progress` — lime left-accent border, progress bar, "Tiếp tục" CTA
  - `complete` — positive border, 100% progress bar + checkmark, "Ôn lại" ghost CTA
- **Props:** `moduleNumber: 1|2|3|4`, `title: string`, `lessonCount: number`, `completedCount: number`, `xpReward: number`, `state: 'locked'|'unlocked'|'in-progress'|'complete'`, `nextLessonTitle?: string`, `prerequisiteText?: string`
- **States:** default | pressed (`scale-[0.98]`) | locked (non-interactive)
- **Size:** 342px width × variable height (min 140px)
- **Padding:** 20px all sides
- **Surface:** `ink-800`, `radius-2xl` (32px)
- **Border:**
  - `locked`: `edge` 1px
  - `unlocked`: `edge` 1px
  - `in-progress`: `lime` 1.5px left-accent only (left-border only via box-shadow or border-left)
  - `complete`: `positive` 1px
- **Layout (unlocked / in-progress / complete):**
  - Row 1: "MODULE N" eyebrow tag (`caption-pulse`, lime, `module-tag-bg` chip) + state badge (right)
  - Row 2: Module title (`display-sm` 24px, lime-soft)
  - Row 3: Lesson count ("N/5 bài học" or "5/5 ✓", `body-md`, fog)
  - Row 4: Progress bar (4px height, `progress-track`, `progress-fill`, `radius-full`) — in-progress/complete only
  - Row 5: XP badge (`+NNN XP` chip, `xp-pill-bg`, `lime`) + CTA button (right-aligned)
- **Layout (locked):**
  - Title + prerequisite text + padlock icon (fog-muted, center-right)
  - Overlay: `locked-surface` (opacity-40) on entire surface
- **Tokens used:** `ink-800`, `radius-2xl`, `lime-soft`, `lime`, `fog`, `fog-muted`, `positive`, `edge`, `display-sm`, `body-md`, `caption-pulse`, `xp-pill-bg`, `progress-track`, `progress-fill`, `module-tag-bg`, `locked-surface`
- **Notes:**
  - Only ONE KineticButton `lime` can be visible per viewport — if multiple modules are in-progress/unlocked, only the topmost shows the lime button; others use ghost.
  - Locked card tap: shows tooltip (see `DESIGN-F0-LEARN-05-interactions.md` IR-08).

---

### LessonProgressBar

- **Figma frame:** `F0-Learning / LessonProgressBar`
- **Used on:** All Lesson Viewer screens (Cards 1–5), MKC screen, Placement Quiz screen
- **Variants:**
  - `lesson` — dots + percentage bar (for 5-card lessons)
  - `quiz` — progress bar only + "Câu N/5" label (for MKC and Placement Quiz)
- **Props:** `current: number`, `total: number`, `variant: 'lesson'|'quiz'`
- **States:** default | complete
- **Size:** full-width × 32px total height (8px bar + 16px dots row with gap)
- **Bar:** 8px height, `progress-track` fill → `progress-fill` animated, `radius-full`
- **Dots (lesson variant):** 5 dots, 10px diameter, gap 8px, centered
  - visited: `fog-muted`
  - active: `lime`, scale 1.2×
  - future: `ink-600`
- **Label (quiz variant):** "Câu N/5" — `caption-pulse`, fog, right-aligned
- **Tokens used:** `progress-track`, `progress-fill`, `lime`, `fog-muted`, `ink-600`, `caption-pulse`, `radius-full`
- **Notes:** Animate bar width on each card advance (300ms `ease-standard`). Do not animate on lesson resume (set to saved position instantly).

---

### ContentCard

- **Figma frame:** `F0-Learning / ContentCard`
- **Used on:** Lesson Viewer — Cards 1 (Concept), 2 (Example), 3 (Myth-Buster), 5 (CTA)
- **Variants:**
  - `concept` — neutral lime-soft headline, visual zone, key term highlight
  - `example` — positive (#10B981) tag, market data row (uses `ChangePill`)
  - `myth-buster` — two-tone: myth surface (myth-wrong-bg) + truth surface (myth-truth-bg)
  - `cta` — lime tag, task prompt, XP preview chip, two CTAs
- **Props:** `variant: 'concept'|'example'|'myth-buster'|'cta'`, `tag: string`, `headline: string`, `body: string`, `visualAsset?: ImageSource`, `keyTerm?: { term: string, definition: string }` (concept only), `marketData?: StockDataRow` (example only), `mythText?: string`, `truthText?: string` (myth-buster only), `taskCopy?: string` (cta only)
- **States:** default (no interactive states — scroll only)
- **Size:** 342px width × variable height
- **Surface:** `ink-800`, `radius-xl` (24px), `edge` border 1px
- **Padding:** 20px all sides
- **Tag (top):** `caption-pulse` label + color chip — concept: lime, example: positive, myth: plasma, cta: lime
- **Headline:** `display-sm` (24px, 700, Space Grotesk), `lime-soft`
- **Body:** `body-lg` (18px, 400, Manrope), `fog`, `line-height: 1.62`
- **Key term block (concept variant):** `ink-800`, `radius-lg`, `padding: 12px 16px`, left-border 3px `lime`
- **Market data row (example variant):** ticker + company + `ChangePill` — see `ChangePill` in `components.md`
- **Myth-buster surfaces:**
  - Myth: `myth-wrong-bg`, prefix "🚫 Sai lầm phổ biến:" (`negative`)
  - Truth: `myth-truth-bg`, prefix "✓ Sự thật:" (`positive`)
- **CTA variant specifics:** task icon (40px, Lucide, lime-soft), XP preview chip (`+25 XP`, `xp-pill-bg`, `lime`)
- **Tokens used:** `ink-800`, `radius-xl`, `edge`, `lime-soft`, `fog`, `positive`, `plasma`, `negative`, `xp-pill-bg`, `lime`, all content typography tokens
- **Notes:** Content is CMS-driven. Fallback for missing `visualAsset`: centered Lucide icon (48px, lime-soft) + topic label. Card is scrollable if body exceeds ~300px (rare case).

---

### QuizCard

- **Figma frame:** `F0-Learning / QuizCard`
- **Used on:** Lesson Viewer Card 4, Module Knowledge Check
- **Variants:**
  - `lesson` — unlimited retries; hint system active; immediate per-option reveal
  - `mkc` — no per-option reveal until submission; forward-only
- **Props:** `variant: 'lesson'|'mkc'`, `question: string`, `options: QuizOptionProps[]`, `selectedIndex?: number`, `correctIndex?: number` (revealed after correct/submit), `attemptCount?: number`
- **States:** unanswered | selected | answered-correct | answered-wrong | submitted (mkc only)
- **Size:** 342px width × variable height
- **Surface:** `ink-800`, `radius-xl`, `edge` border 1px, `padding: 20px`
- **Question text:** `body-lg` (18px, 500, Manrope), `lime-soft`
- **Options:** 4× `QuizOption` component, gap `space-3`
- **Attempt counter:** shown below options after 1st wrong — "Lần thử: N" — `caption-pulse`, `fog-muted`
- **Tokens used:** `ink-800`, `radius-xl`, `edge`, `lime-soft`, `fog-muted`, `body-lg`, `caption-pulse`, `space-3`
- **Notes:** In `lesson` variant, "Tiếp theo" button activates only after `answered-correct`. In `mkc` variant, "Tiếp theo" activates after any selection (no reveal until full submit).

---

### QuizOption

- **Figma frame:** `F0-Learning / QuizOption`
- **Used on:** `QuizCard` (all variants), `PlacementQuizCard`
- **Variants:** (none — managed via state props)
- **Props:** `label: 'A'|'B'|'C'|'D'`, `text: string`, `state: 'default'|'selected'|'correct'|'wrong'|'disabled'`
- **States:** default | selected | correct | wrong | disabled (full matrix in `DESIGN-F0-LEARN-03-ui-spec.md §3.1`)
- **Size:** 342px width × min 56px height (auto-expands for long text)
- **Padding:** 14px vertical, 16px horizontal
- **Layout:** horizontal flex
  - Left: label circle (24×24px, `radius-full`, `ink-600` bg, `caption-drop` text)
  - Center: option text (`body-md` 14px, Manrope)
  - Right: state icon (Lucide `check-circle` or `x-circle`, 20px) — shown in correct/wrong states only
- **Surface:** `ink-700`, `radius-lg` (16px)
- **Tokens used:** `ink-700`, `ink-600`, `radius-lg`, `radius-full`, `fog`, `fog-muted`, `positive`, `negative`, `quiz-correct-bg`, `quiz-wrong-bg`, `edge-strong`, `body-md`, `caption-drop`
- **Notes:** Minimum tap area covers full width × full height. Shake animation on `wrong` state is applied at the `QuizCard` level, not per `QuizOption`.

---

### HintCard

- **Figma frame:** `F0-Learning / HintCard`
- **Used on:** Lesson Viewer — overlays Card 4 (Quiz) after 3 consecutive wrong answers
- **Variants:** (none — single layout)
- **Props:** `hintText: string`
- **States:** default (entrance: slideInRight 300ms; exit: slideOutRight 300ms)
- **Size:** full card area (same dimensions as QuizCard)
- **Surface:** `hint-surface` (rgba(210,119,255,0.08)), `hint-border` 1px, `radius-xl` (24px), `padding: 24px`
- **Layout:**
  - Icon: Lucide `lightbulb`, 32px, `plasma`
  - Tag: "GỢI Ý" chip, `caption-pulse`, `plasma`, `plasma-glow` bg
  - Hint text: `body-lg` (18px, 400, Manrope), `lime-soft`
  - Divider: `edge` 1px horizontal line
  - Sub-copy: "Không có giới hạn thử lại." — `body-md` (14px), `fog`
  - CTA: KineticButton `plasma` variant, "Hiểu rồi, thử lại →", full-width
- **Tokens used:** `hint-surface`, `hint-border`, `plasma`, `plasma-glow`, `lime-soft`, `fog`, `edge`, `radius-xl`, `body-lg`, `body-md`, `caption-pulse`
- **Notes:** HintCard entrance/exit animations are page-level (controlled by LessonViewer parent, not the card itself). CTA tap triggers hint card exit animation before returning to QuizCard.

---

### XPToast

- **Figma frame:** `F0-Learning / XPToast`
- **Used on:** Lesson completion (floating overlay)
- **Variants:** (none — single layout, single XP amount)
- **Props:** `amount: number` (always 25 for lesson completion)
- **States:** enter (fadeUp 300ms) | visible (2500ms auto-dismiss) | exit (fadeOut 200ms)
- **Size:** 280px width × 80px height, centered-x, bottom 112px
- **Surface:** `ink-800`, `radius-xl` (24px), `shadow-glow-lime`
- **Padding:** 16px horizontal, 0 vertical (flexbox centered)
- **Layout:** horizontal flex, gap `space-3`
  - Left: Lucide `zap`, 20px, `lime`
  - Center: "+25 XP" (`display-sm` 24px, 700, Space Grotesk, `lime`) + "Bài học hoàn thành!" (`body-md`, `fog`)
  - Right: 2-particle confetti burst SVG (lime, 500ms, auto-hide after burst)
- **Tokens used:** `ink-800`, `radius-xl`, `shadow-glow-lime`, `lime`, `fog`, `display-sm`, `body-md`, `space-3`
- **Notes:** aria-live="assertive" for screen reader. If module completion is triggered immediately after, show XPToast first (300ms), then module completion banner appears after toast is mid-dismiss (2000ms after toast enter).

---

### BadgeCard

- **Figma frame:** `F0-Learning / BadgeCard`
- **Used on:** Module Completion Reward Screen, My Badges section (Grow Tab sub-nav 4)
- **Variants:**
  - `reward` — large 140×140px, animation on reveal, centered on screen
  - `gallery` — smaller 80×80px, static, used in My Badges grid
- **Props:** `badgeId: string`, `name: string`, `icon: ImageSource`, `rarity: 'common'|'uncommon'|'rare'|'epic'`, `variant: 'reward'|'gallery'`
- **States:** default | pressed (scale 1→1.03, 150ms spring) | locked (opacity-50, padlock overlay)
- **Size:**
  - `reward`: 140×140px container + badge name label below
  - `gallery`: 80×80px container + name label below
- **Surface:** `badge-surface` (`ink-700`), `radius-2xl` (32px for reward) / `radius-xl` (24px for gallery)
- **Border:** `rarity-[level]` color, width per rarity (Common 1px, Uncommon 2px, Rare 3px, Epic 3px)
- **Glow (Uncommon+):** box-shadow `0 0 20px rgba([rarity-rgb], 0.20)`
- **Icon:** Badge SVG centered, 72px (reward) / 40px (gallery)
- **Symbol:** Rarity symbol below icon — Common: none, Uncommon: ✦, Rare: ★, Epic: ⚡ — `caption-pulse`, rarity color
- **Name label:** `body-md` (14px, 600, Space Grotesk), `fog`, margin-top 8px, centered
- **Reveal animation (reward variant):** scale 0 → 1.05 → 1.0, 300ms `ease-spring`
- **Tokens used:** `badge-surface`, `rarity-common/uncommon/rare/epic`, `radius-2xl`, `body-md`, `fog`, `caption-pulse`
- **Notes:** Rarity glow RGB values: uncommon=52,211,153; rare=96,165,250; epic=245,158,11.

---

### MKCQuestionCard

- **Figma frame:** `F0-Learning / MKCQuestionCard`
- **Used on:** Module Knowledge Check (MKC) screen — identical to QuizCard `mkc` variant. Use QuizCard with `variant="mkc"` instead of a separate component. — This entry is retained as a Figma frame alias only.
- **Reference:** Use `QuizCard` with `variant="mkc"`.
- **Notes:** MKC renders the same question card as in-lesson quiz but without per-option reveal. No hint card in MKC. See `QuizCard` above.

---

### PlacementQuizCard

- **Figma frame:** `F0-Learning / PlacementQuizCard`
- **Used on:** Placement Quiz screen (Flow F)
- **Variants:** `intro` (welcome/instructions card), `question` (Q1–Q5 question card)
- **Props:** `variant: 'intro'|'question'`, `questionText?: string`, `options?: QuizOptionProps[]`, `questionNumber?: number`
- **States:** intro: default; question: unanswered | selected
- **Size:** 342px × variable, `ink-800`, `radius-2xl` (32px), padding 24px
- **Intro variant:**
  - Title: "Kiểm tra nhanh kiến thức của bạn" — `display-sm`, `lime-soft`
  - Body: "5 câu — không cần ôn tập, trả lời thành thật nhất" — `body-md`, `fog`
  - CTA: KineticButton `lime`, "Bắt đầu"
- **Question variant:**
  - Q text: `body-lg` (18px, 500, Manrope), `lime-soft`
  - 4× QuizOption rows (state: `default` / `selected` only — no correct/wrong reveal during quiz)
- **Tokens used:** `ink-800`, `radius-2xl`, `lime-soft`, `fog`, `body-lg`, `body-md`, `display-sm`, `space-3`
- **Notes:** Back navigation is blocked from Q1 onward (IR-40). Back chevron hidden in Lesson Viewer header when Placement Quiz is active. This is enforced at the navigation level, not the card level.

---

### BonusCashModal

- **Figma frame:** `F0-Learning / BonusCashModal`
- **Used on:** Module 2 Completion flow (FR-LEARN-10)
- **Variants:** (none — single layout, full-height bottom sheet)
- **Props:** `amountVND: number` (50000000), `expiryDays: number` (7)
- **States:** enter (slideUp 400ms) | visible | exit (slideDown 300ms)
- **Size:** Full-width, max-height 90% viewport, `ink-800`, `radius-4xl` top-corners
- **Handle:** 4×36px bar, `ink-600`, `radius-full`, 12px from top, centered
- **Sections (top to bottom):**
  1. Amount Hero: Lucide `wallet` 56px (`lime`) + "50,000,000 ₫" (`display-md`, `lime`, tabular) + "Tiền thưởng ảo" chip
  2. Detail rows: 3 rows with icons (📅, ⚠, 🔒) + body text (`body-md`, `fog`)
  3. `GlassmorphicSecurityInfo` component (reused) — "Danh mục ảo 100% an toàn"
  4. CTAs: "Xem danh mục ảo →" (KineticButton lime) + "Tiếp tục học Module 3" (ghost)
- **Tokens used:** `ink-800`, `radius-4xl`, `ink-600`, `radius-full`, `lime`, `display-md`, `body-md`, `fog`, `negative`, `fog-muted`
- **Notes:** GlassmorphicSecurityInfo used unmodified (see `components.md`). Amount uses Space Grotesk tabular `"tnum" 1` (VND formatting: `50.000.000 ₫`).

---

### MKCCooldownBanner

- **Figma frame:** `F0-Learning / MKCCooldownBanner`
- **Used on:** MKC Results — Fail screen (FR-LEARN-18)
- **Variants:** `counting` | `ready`
- **Props:** `secondsRemaining: number`
- **States:**
  - `counting`: `cooldown-bg` surface, negative countdown timer, disabled KineticButton
  - `ready`: `xp-pill-bg` surface, "Thử lại ngay →" enabled KineticButton
- **Size:** 342px width × 88px height
- **Surface:** `radius-xl` (24px)
- **Layout:**
  - `counting`: "Bạn có thể thử lại sau" (`body-md`, `fog`) + countdown (`display-sm`, `negative`, tabular) + disabled button
  - `ready`: "Sẵn sàng rồi!" (`body-md`, `lime-soft`) + "Thử lại ngay →" (KineticButton lime, enabled)
- **Transition:** surface transitions from `cooldown-bg` → `xp-pill-bg` over 500ms when timer hits 0
- **Tokens used:** `cooldown-bg`, `xp-pill-bg`, `negative`, `lime-soft`, `fog`, `display-sm`, `body-md`, `radius-xl`
- **Notes:** Live countdown updated every second via timer. Timer display format: "00:47" (MM:SS). aria-live="polite" for screen reader accessibility.

---

## Component Checklist — Before Submitting to Figma

```
[ ] All new components have Figma frames with correct names (PascalCase)
[ ] All new components added to docs/design/components.md before screen spec submission
[ ] No design token values are hardcoded — all reference named tokens
[ ] Extended variants of KineticButton (if any) updated in components.md
[ ] State matrices verified against DESIGN-F0-LEARN-03-ui-spec.md §3
[ ] Touch targets: all interactive elements ≥ 44×44px
[ ] All copy is specified (labels, error messages, empty states, placeholders)
[ ] GlassmorphicSecurityInfo used unmodified in Bonus Cash Modal
[ ] One KineticButton `lime` per viewport maximum (enforced per screen)
```

---

*Owner: Visual Design + Frontend Dev | Review: UX Design + BA*
*After Figma approval: update `docs/design/components.md` with all entries above*

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
| UX Flows (Design Detail) | `docs/design/DESIGN-F0-LEARN-01-ux-flows.md` |
| Screen Wireframes | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| UI Specification | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |
| Interaction Rules | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| QA Test Cases | `docs/design/DESIGN-F0-LEARN-06-qa-cases.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |
| Component Registry | `docs/design/components.md` |

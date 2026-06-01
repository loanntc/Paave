# F0 Learning Path — Component Specifications
**Version:** 2.0 | **Date:** 2026-05-29 | **Feature:** F0 Learning Path (Module F-LEARN)
**Architecture:** Frontend-only · AsyncStorage · No rewards

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
| `AmbientBackground` | default | Welcome Modal, Placement Results, MKC Pass, Learning Complete |
| `ChangePill` | `positive` | Example Card stock data row |
| `PaaveWordmark` | `sm` | Learning Path Home top-nav |

---

## New Components

> For each new component: add to `docs/design/components.md` as part of the design handoff.
> Template matches `components.md` format (Figma frame, Used on, Variants, Props, States, Tokens used, Notes).

---

### LearningPromptCard

- **Figma frame:** `F0-Learning / LearningPromptCard`
- **Used on:** Learning Path Home (Grow Tab) — conditional, shown when welcome modal was dismissed via "Khám phá trước"
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
- **Notes:** Visible only when `f0_welcome_modal_shown = true` AND `f0_module_1_state = UNLOCKED` (not started). Hidden once M1 reaches IN_PROGRESS or higher.

---

### ModuleCard

- **Figma frame:** `F0-Learning / ModuleCard`
- **Used on:** Learning Path Home (Grow Tab) — ×4 instances (M1–M4)
- **Variants:**
  - `locked` — greyed, padlock icon, prerequisite copy, no CTA
  - `unlocked` — full color, "Bắt đầu →" CTA
  - `in-progress` — lime left-accent border, progress bar, "Tiếp tục →" CTA
  - `lessons-complete` — all lessons done, 100% lesson bar, "Làm bài kiểm tra →" lime CTA
  - `complete` — positive border, checkmark, "Ôn lại →" ghost CTA
- **Props:** `moduleNumber: 1|2|3|4`, `title: string`, `lessonCount: number`, `completedCount: number`, `state: 'locked'|'unlocked'|'in-progress'|'lessons-complete'|'complete'`, `nextLessonTitle?: string`, `prerequisiteText?: string`
- **States:** default | pressed (`scale-[0.98]`) | locked (non-interactive)
- **Size:** 342px width × variable height (min 120px)
- **Padding:** 20px all sides
- **Surface:** `ink-800`, `radius-2xl` (32px)
- **Border:**
  - `locked`: `edge` 1px
  - `unlocked`: `edge` 1px
  - `in-progress`: `lime` 1.5px left-accent only
  - `lessons-complete`: `lime` 1.5px left-accent + lime glow
  - `complete`: `positive` 1px
- **Layout (unlocked / in-progress / lessons-complete / complete):**
  - Row 1: "MODULE N" eyebrow tag (`caption-pulse`, lime, `module-tag-bg` chip) + state badge (right)
  - Row 2: Module title (`display-sm` 24px, lime-soft)
  - Row 3: Lesson count ("N/5 bài học" or "5/5 bài ✓", `body-md`, fog)
  - Row 4: Progress bar (4px height, `progress-track`, `progress-fill`, `radius-full`) — in-progress/lessons-complete/complete only
  - Row 5: CTA button (right-aligned)
    - `unlocked`: KineticButton lime "Bắt đầu →"
    - `in-progress`: KineticButton lime "Tiếp tục →"
    - `lessons-complete`: KineticButton lime "Làm bài kiểm tra →"
    - `complete`: KineticButton ghost "Ôn lại →"
- **Layout (locked):**
  - Title + prerequisite text + padlock icon (fog-muted, center-right)
  - Overlay: `locked-surface` (opacity-40) on entire surface
- **Tokens used:** `ink-800`, `radius-2xl`, `lime-soft`, `lime`, `fog`, `fog-muted`, `positive`, `edge`, `display-sm`, `body-md`, `caption-pulse`, `progress-track`, `progress-fill`, `module-tag-bg`, `locked-surface`
- **Notes:**
  - Only ONE KineticButton `lime` can be visible per viewport — if multiple modules show lime CTAs, only the topmost uses lime; others use ghost.
  - Locked card tap: shows tooltip (see `DESIGN-F0-LEARN-05-interactions.md` IR-16).
  - State data is read from AsyncStorage (`f0_module_{n}_state`) — no API call.

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
- **Notes:** Animate bar width on each card advance (300ms `ease-standard`). Do not animate on lesson resume (set to saved position instantly, no transition).

---

### ContentCard

- **Figma frame:** `F0-Learning / ContentCard`
- **Used on:** Lesson Viewer — Cards 1 (Concept), 2 (Example), 3 (Myth-Buster), 5 (CTA)
- **Variants:**
  - `concept` — neutral lime-soft headline, visual zone, key term highlight
  - `example` — positive (#10B981) tag, market data row (uses `ChangePill`)
  - `myth-buster` — two-tone: myth surface (myth-wrong-bg) + truth surface (myth-truth-bg)
  - `cta` — lime tag, lesson CTA prompts, two action buttons
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
- **CTA variant specifics:**
  - Task icon (40px, Lucide, lime-soft)
  - Task copy (`body-lg`, fog): specific in-app action the user can take (e.g., "Tìm FPT trong ô tìm kiếm Paave")
  - Primary CTA: KineticButton lime "Thực hành ngay →" (deep-links to relevant app section)
  - Secondary CTA: KineticButton ghost "Tiếp tục →" (advance without in-app action)
- **Tokens used:** `ink-800`, `radius-xl`, `edge`, `lime-soft`, `fog`, `positive`, `plasma`, `negative`, `lime`, all content typography tokens
- **Notes:** Content is hardcoded in app bundle. Fallback for missing `visualAsset`: centered Lucide icon (48px, lime-soft) + topic label. Card is scrollable if body exceeds ~300px (rare case).

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
- **Notes:** In `lesson` variant, "Tiếp theo" button activates only after `answered-correct`. In `mkc` variant, "Tiếp theo" activates after any selection (no reveal until full submit). All evaluation is local (correct answer hardcoded in app bundle).

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

### MKCQuestionCard

- **Figma frame:** `F0-Learning / MKCQuestionCard`
- **Used on:** Module Knowledge Check (MKC) screen — alias for QuizCard `mkc` variant.
- **Reference:** Use `QuizCard` with `variant="mkc"`.
- **Notes:** MKC renders the same question card as in-lesson quiz but without per-option reveal. No hint card in MKC. All scoring is local (hardcoded answers in bundle).

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
- **Notes:** Back navigation is blocked from Q1 onward (IR-21). Back chevron hidden when Placement Quiz is active. Enforced at navigation level, not card level. One-shot: `f0_placement_quiz_completed` flag written to AsyncStorage on submit.

---

### MKCCooldownBanner

- **Figma frame:** `F0-Learning / MKCCooldownBanner`
- **Used on:** MKC Results — Fail screen (FR-LEARN-07)
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
- **Notes:**
  - Timer is CLIENT-SIDE only. `f0_mkc_{n}_cooldown_start` (Unix ms timestamp) is stored in AsyncStorage. `secondsRemaining = Math.max(0, (cooldown_start + 60000 - Date.now()) / 1000)`.
  - On app relaunch mid-cooldown: timer resumes from correct remaining time (not resets to 60s).
  - Live countdown updated every second via setInterval. Timer display format: "00:47" (MM:SS).
  - aria-live="polite" for screen reader accessibility.

---

### LearningCompleteCard

- **Figma frame:** `F0-Learning / LearningCompleteCard`
- **Used on:** Learning Complete screen (Flow G) — shown after M4 MKC pass
- **Variants:** (none — single layout, full-screen)
- **Props:** `moduleCount: number` (4), `lessonCount: number` (20), `onCTA: () => void`
- **States:** default | cta-loading (brief loading state on CTA tap while age check runs)
- **Size:** Full-screen surface, centered content zone
- **Surface:** Full-screen `AmbientBackground` (lime orbs dominant, mixed plasma)
- **Padding:** 48px top safe area, 24px horizontal, 32px bottom
- **Layout (centered column):**
  - Celebration icon: 64px graduation emoji or Lucide `award` lime, margin-bottom 24px
  - Headline: "Chúc mừng! 🎓" — `display-md` (32px, 700, Space Grotesk), `lime`
  - Sub-headline: "Bạn đã hoàn thành toàn bộ chương trình học!" — `display-sm` (24px), `lime-soft`
  - Stats row: "4 modules · 20 bài học · Sẵn sàng đầu tư" — `body-md`, `fog`, margin-top 8px
  - Spacer: flex-1
  - Body copy: "Bạn đã trang bị đủ kiến thức nền tảng. Đã đến lúc bắt đầu hành trình đầu tư thực sự." — `body-lg`, `fog`, margin-bottom 32px
  - CTA: KineticButton lime, full-width, "Bắt đầu đầu tư →"
- **Tokens used:** `lime`, `lime-soft`, `fog`, `display-md`, `display-sm`, `body-lg`, `body-md`
- **Notes:** AmbientBackground is at the page level, not inside this card. CTA tap triggers client-side DOB age check from local profile store — no loading state expected (synchronous). The brief `cta-loading` state handles the rare case where DOB read is slow.

---

### AgeGateBottomSheet

- **Figma frame:** `F0-Learning / AgeGateBottomSheet`
- **Used on:** Learning Complete screen (Flow G) — shown if user age < 18
- **Variants:**
  - `with-date` — shows specific date when user turns 18
  - `no-date` — generic message (when DOB is missing or invalid)
- **Props:** `turnsEighteenDate?: string` (formatted date, e.g., "15/03/2027"), `onViewMarket: () => void`, `onGoHome: () => void`
- **States:** enter (slideUp 400ms ease-decelerate) | visible | exit (slideDown 300ms)
- **Size:** Full-width, 60% viewport height, `ink-800`, `radius-4xl` top-corners (32px)
- **Handle:** 4×36px bar, `ink-600`, `radius-full`, 12px from top, centered
- **Layout (top to bottom):**
  1. Handle bar
  2. Icon: Lucide `clock` or `calendar`, 40px, `fog-muted`, centered, margin-top 24px
  3. Headline: "Bạn chưa đủ tuổi giao dịch" — `display-sm` (24px), `lime-soft`, centered
  4. Body (`body-lg`, `fog`, margin 16px 0):
     - "Theo quy định, bạn cần đủ 18 tuổi để đặt lệnh chứng khoán thật."
     - If `with-date`: "Bạn có thể bắt đầu giao dịch từ [date]" (`body-lg`, lime-soft, bold)
     - If `no-date`: "Cập nhật ngày sinh trong Hồ sơ để mở tính năng giao dịch."
  5. Divider: `edge` 1px, margin 16px 0
  6. Secondary copy: "Trong thời gian chờ, bạn có thể theo dõi thị trường và đọc tin tức tại đây." — `body-md`, `fog-muted`
  7. CTAs (gap `space-3`):
     - Primary: KineticButton lime full-width "Xem thị trường →" → dismiss + navigate Market tab
     - Secondary: KineticButton ghost full-width "Về trang chủ" → dismiss only
- **Tokens used:** `ink-800`, `radius-4xl`, `ink-600`, `radius-full`, `lime-soft`, `fog`, `fog-muted`, `edge`, `display-sm`, `body-lg`, `body-md`, `space-3`
- **Notes:**
  - Shown ONLY when age check fails (< 18). Never shown if age ≥ 18.
  - `f0_age_gate_shown = true` written to AsyncStorage before sheet renders.
  - Sheet is dismissible by swipe-down (sheet returns to Home tab without Market navigation).
  - If DOB is missing: use `no-date` variant; add "Hồ sơ →" text link next to secondary copy.

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
[ ] One KineticButton `lime` per viewport maximum (enforced per screen)
[ ] ModuleCard `lessons-complete` variant tested with MKC entry CTA
[ ] AgeGateBottomSheet: both variants (with-date / no-date) designed
[ ] LearningCompleteCard: AmbientBackground at page level, not inside card
[ ] MKCCooldownBanner: timer resume logic verified (not resetting to 60s on relaunch)
```

---

*Owner: Visual Design + Frontend Dev | Review: UX Design + BA*
*After Figma approval: update `docs/design/components.md` with all entries above*
*V2 changes: removed XPToast, BadgeCard, BonusCashModal; added LearningCompleteCard, AgeGateBottomSheet; added ModuleCard `lessons-complete` variant; removed XP prop from ModuleCard; updated ContentCard cta variant*

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| F0 Learning Path V2 (authoritative) | `docs/business/f0-learning/00-index.md` |
| Functional Requirements | `docs/business/f0-learning/01-requirements.md` |
| Learning Content | `docs/business/f0-learning/02-content.md` |
| Completion + Trading Flow | `docs/business/f0-learning/04-completion-trading.md` |

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
| Local Data Model | `docs/business/f0-learning/03-data-model.md` |

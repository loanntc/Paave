# F0 Learning Path — Screen Wireframes
**Version:** 1.0 | **Date:** 2026-05-28 | **Feature:** F0 Learning Path (Module F-LEARN)

> **Canvas:** 390×852px (iPhone 14 Pro baseline — matches `docs/design/screen-specs.md`)
> **Horizontal margin:** 24px (space-6) both sides → content width = 342px
> **Tokens:** All values reference `docs/design/design-system.md` and `DESIGN-F0-LEARN-00-alignment.md`
> **Components:** All new components defined in `DESIGN-F0-LEARN-04-component-spec.md`

---

## Screen 1 — Welcome Modal (FR-LEARN-01)

```
Screen:     Welcome Modal
User goal:  Understand what the learning path offers; decide how to start
Trigger:    First app launch after registration (welcome_modal_shown = false)
──────────────────────────────────────────────────────────────────────────

OVERLAY:    Full-screen modal over Home tab
            Background: ink-900 (#0E0E0E) with 0.92 opacity backdrop-blur
            AmbientBackground active (lime orb top-left, plasma orb bottom-right)

──────────────────────────────────────────────────────────────────────────
ZONE 1 — Animation / Hero (top 40% of screen)
  Lottie:   lottie_welcome_learning.json (rocket/chart-ticker theme)
            Size: 280×240px, centered-x, top: 72px (post safe-area)
            Plays 3s → holds final frame
            Fallback: img_welcome_learning_static.png (same dimensions)
            [CTAs are ACTIVE during animation — not gated on completion]

ZONE 2 — Headline + Body (middle 25% of screen)
  Headline: "Học chứng khoán, không cần kinh nghiệm"
            Font: display-md (36px, 700, Space Grotesk), lime-soft
            Tracking: -1.8px | Line-height: 1.25
            Margin-top: 24px from animation bottom

  Body:     2–3 sentences, max 60 words — explains paper trading concept
            Font: body-lg (18px, 400, Manrope), fog (#ADAAAA)
            Margin-top: 12px

  Preview:  Lesson thumbnail + "L1.1 — Cổ phiếu là gì?" label
            Thumbnail: 56×56px, radius-lg (16px), ink-800 surface
            Label: body-md (14px), fog
            Layout: horizontal flex, gap space-3, margin-top 16px

ZONE 3 — CTA Stack (bottom 25% of screen)
  [PRIMARY]   "Bắt đầu Module 1"
              KineticButton variant=lime, full-width (342px), height 68px
              Margin-bottom: 12px

  [SECONDARY] "Khám phá trước"
              KineticButton variant=ghost, full-width, height 68px
              Margin-bottom: 16px

  [TERTIARY]  "Tôi đã biết chứng khoán cơ bản →"
              Text link, body-md (14px), plasma (#D277FF), underline-on-press
              Centered-x

──────────────────────────────────────────────────────────────────────────
Notes:
  - No close/dismiss button (X); only explicit CTA options close modal
  - welcome_modal_shown flag written server-side at modal render, not on tap
  - Bottom safe-area padding applied (space-5 + safe-area-inset-bottom)
```

---

## Screen 2 — Placement Quiz (FR-LEARN-19)

```
Screen:     Placement Quiz — Question View
User goal:  Answer 5 questions to discover if they can skip Module 1
Trigger:    Tap "Tôi đã biết chứng khoán cơ bản" on Welcome Modal
──────────────────────────────────────────────────────────────────────────

HEADER (56px + safe-area-top)
  Left:     [← Back] — VISIBLE on intro screen; HIDDEN on Q1–Q5 (IR-40)
  Center:   "Kiểm tra đầu vào" — title-md (18px, 400, Space Grotesk), lime-soft
  Right:    —

ZONE 1 — Progress Bar (8px height, below header)
  Track:    progress-track (rgba(72,72,71,0.30)), full-width, radius-full
  Fill:     progress-fill (lime #CAFD00), animated width on advance
  Label:    "Câu 1/5" — caption-pulse (12px, uppercase, fog), top-right

ZONE 2 — Intro Card (shown before Q1; replaces question card)
  Surface:  ink-800, radius-2xl (32px), margin-x: 24px, padding: 24px
  Headline: "Kiểm tra nhanh kiến thức của bạn"
            display-sm (24px, 700), lime-soft
  Body:     "5 câu — không cần ôn tập, trả lời thành thật nhất"
            body-md (14px, Manrope), fog
  CTA:      "Bắt đầu" — KineticButton variant=lime, margin-top: 24px

ZONE 3 — Question Card (Q1–Q5; replaces intro card)
  Surface:  ink-800, radius-2xl (32px), margin-x: 24px, padding: 24px
  Q text:   body-lg (18px, 500, Manrope), lime-soft, line-height 1.62
  Margin-bottom: 20px before options

  Options:  4 PlacementQuizOption rows (A/B/C/D)
            Each: full-width, min-height 56px, radius-lg (16px)
            Surface: ink-700, padding: 14px 16px
            Label: body-md (14px, Manrope), fog
            Selected state: edge-strong border (rgba(72,72,71,0.40)) + fog-muted bg

  [Note: No answer reveal until after "Nộp bài" submission on Q5]

ZONE 4 — Action (pinned to bottom)
  [PRIMARY] "Tiếp theo" (Q1–Q4) / "Nộp bài" (Q5)
            KineticButton variant=lime, full-width
            DISABLED until option selected
            On Q5 tap → loading state → result evaluation

──────────────────────────────────────────────────────────────────────────
Notes:
  - Back navigation system-gesture DISABLED on Q1 render (IR-40)
  - Back chevron hidden for entire quiz duration (Q1–Q5)
  - No time limit per question; no timer displayed
```

---

## Screen 3 — Placement Quiz Results: Pass (FR-LEARN-19)

```
Screen:     Placement Quiz — Pass (4/5 or 5/5 correct)
User goal:  Confirm they can skip M1; navigate to Module 2
──────────────────────────────────────────────────────────────────────────

CANVAS:     Full-screen, ink-900, AmbientBackground active (lime orbs)

ZONE 1 — Score Hero (centered, top 45%)
  Icon:     Trophy/Star Lottie or static SVG, 96×96px, lime-soft
  Score:    "4/5" — display-md (36px, 700, Space Grotesk), lime (#CAFD00)
  Tag:      "ĐẠT" — caption-pulse, lime, xp-pill-bg chip, radius-full

ZONE 2 — Copy
  Headline: "Bạn đã nắm vững kiến thức cơ bản!"
            title-md (18px), lime-soft
  Body:     "Module 1 sẽ được bỏ qua. Bạn sẽ bắt đầu từ Module 2."
            body-md (14px, Manrope), fog

ZONE 3 — CTA
  [PRIMARY] "Bắt đầu Module 2 →"
            KineticButton variant=lime, full-width
  Note:     M1 marked complete server-side; no badge/XP for placement skip

──────────────────────────────────────────────────────────────────────────
```

---

## Screen 4 — Placement Quiz Results: Fail (FR-LEARN-19)

```
Screen:     Placement Quiz — Fail (<4/5 correct)
User goal:  Accept starting from M1; feel encouraged not discouraged
──────────────────────────────────────────────────────────────────────────

CANVAS:     Full-screen, ink-900, AmbientBackground (plasma orbs, softer)

ZONE 1 — Score Hero
  Icon:     Sprout/growth SVG, 80×80px, plasma (#D277FF)
  Score:    "2/5" — display-md (36px, 700, Space Grotesk), fog
  Tag:      "HÃY CỐ LÊN" — caption-pulse, fog, ink-800 chip

ZONE 2 — Copy
  Headline: "Hãy bắt đầu từ đầu — bạn sẽ tiến bộ nhanh thôi!"
            title-md (18px), lime-soft
  Body:     "Module 1 sẽ xây nền tảng vững chắc cho hành trình của bạn."
            body-md (14px, Manrope), fog

ZONE 3 — CTA
  [PRIMARY] "Bắt đầu Module 1 →"
            KineticButton variant=lime, full-width

  [Note: No retry option. This quiz is one-shot per account.]
──────────────────────────────────────────────────────────────────────────
```

---

## Screen 5 — Learning Path Home / Grow Tab (FR-LEARN-02)

```
Screen:     Learning Path Home
User goal:  See module progress; tap to continue or start a lesson
Trigger:    Tab 2 (Grow) → Sub-nav pill 1
──────────────────────────────────────────────────────────────────────────

HEADER (56px + safe-area-top, ink-900)
  Left:     PaaveWordmark (sm, 16px)
  Center:   Sub-nav pills: [Học tập ●] [Khám phá] [Kỹ năng] [Huy hiệu] [BXH]
            Active: lime-soft text + 2px lime underline
  Right:    XP Pill: "250 XP" — xp-pill-bg chip, lime text, caption-drop (14px)

──────────────────────────────────────────────────────────────────────────
ZONE 0 — Learning Prompt Card (conditional: shown if welcome modal dismissed)
  Surface:  ink-800, radius-xl (24px), padding: 16px, margin: 16px 24px 0
  Content:  Lesson icon (40px) + "Tiếp tục học hôm nay" headline
            + "L1.1 — Cổ phiếu là gì?" subtitle (fog)
  Right:    "Bắt đầu →" — caption-drop, lime, chevron-right icon

ZONE 1 — Module List (scrollable, gap: space-4)
  Margin: 16px 24px

  ┌─────────────────────────────────────────────────────────────────────┐
  │ ModuleCard — M1 (UNLOCKED / IN_PROGRESS / COMPLETE)                 │
  │                                                                     │
  │ Top-left: "MODULE 1" — caption-pulse, lime, module-tag-bg chip      │
  │ Top-right: [state badge] "ĐÃ MỞ" / "ĐANG HỌC" / "HOÀN THÀNH ✓"    │
  │                                                                     │
  │ Title: "Thị trường chứng khoán VN"                                  │
  │        display-sm (24px, 700), lime-soft                            │
  │                                                                     │
  │ Progress: "3/5 bài học" — body-md, fog                              │
  │ Progress bar: 60% fill (lime), height 4px, radius-full              │
  │                                                                     │
  │ XP badge: "+125 XP" chip, xp-pill-bg, lime, right-aligned          │
  │                                                                     │
  │ CTA: [Tiếp tục →] KineticButton lime sm variant                     │
  └─────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │ ModuleCard — M2 (LOCKED state)                                      │
  │                                                                     │
  │ Surface: ink-800 + locked-surface overlay (opacity-40)              │
  │ Padlock icon: 24px, fog-muted, center-right                         │
  │ Title + info: fog-muted text (not lime-soft)                        │
  │ Prerequisite: "Hoàn thành Module 1 để mở khóa"                      │
  │               body-md (14px), fog-muted                             │
  │                                                                     │
  │ [Tap entire card] → tooltip: same prerequisite copy, 2.5s auto-hide │
  └─────────────────────────────────────────────────────────────────────┘

  (M3, M4: same locked pattern with module-specific prerequisite copy)

ZONE 2 — Daily Missions teaser (locked until M1 complete)
  Surface:  ink-800, radius-xl, opacity-50, padlock overlay
  Copy:     "Nhiệm vụ hàng ngày — mở khoá sau khi hoàn thành Module 1"
            body-md (14px), fog-muted

──────────────────────────────────────────────────────────────────────────
BOTTOM NAV: 64px + safe-area-inset-bottom
Notes:
  - Skeleton loader (3 card shapes) shown while module_progress fetches
  - "Path Complete" state: lime confetti burst animation, all cards = checkmark
```

---

## Screen 6 — Lesson Viewer: Concept Card (FR-LEARN-03)

```
Screen:     Lesson Viewer — Card 1 of 5 (Concept)
User goal:  Read the core concept for this lesson
──────────────────────────────────────────────────────────────────────────

HEADER (56px + safe-area-top, ink-900)
  Left:     [← Back] (Lucide arrow-left, 24px, fog) — returns to module lesson list
  Center:   "L1.1 — Cổ phiếu là gì?" — title-md (18px), fog
  Right:    [✕ Exit] (Lucide x, 24px, fog) — exits lesson, saves progress

PROGRESS BAR (below header, 8px height)
  Track:    progress-track, full-width
  Fill:     20% (1/5) in lime, animated
  Dots:     5 dots below bar: ● ○ ○ ○ ○ (filled = visited)
            Active dot: lime, inactive: ink-600, visited: fog-muted

──────────────────────────────────────────────────────────────────────────
CONTENT AREA (scrollable if content overflows)

ZONE 1 — Card Type Tag (full-width, centered)
  Pill:     "KHÁI NIỆM" — caption-pulse (12px, uppercase), lime, xp-pill-bg chip
            Margin-top: 24px

ZONE 2 — Visual / Icon Zone
  Container: 342×200px, ink-800, radius-xl (24px), centered
  Content:   Lesson illustration / diagram (CMS-provided image or SVG)
             Fallback: centered icon (Lucide, 48px, lime-soft) + topic label

ZONE 3 — Content
  Headline: Lesson concept title
            display-sm (24px, 700, Space Grotesk), lime-soft
            Margin-top: 20px

  Body:     Concept explanation (max 120 words)
            body-lg (18px, 400, Manrope), fog (#ADAAAA)
            Line-height: 1.62
            Margin-top: 12px

ZONE 4 — Key Term Highlight (optional, lesson-specific)
  Surface:  ink-800, radius-lg (16px), padding: 12px 16px
  Term:     body-md (14px, 600, Space Grotesk), lime-soft
  Def:      body-md (14px, 400, Manrope), fog
  Left-border: 3px solid lime

──────────────────────────────────────────────────────────────────────────
NAVIGATION BAR (pinned bottom, 64px, ink-900)
  Left:     [← Trước] ghost button (disabled on Card 1 with opacity-40)
  Center:   "1 / 5" — body-md, fog
  Right:    [Tiếp theo →] KineticButton variant=lime, width 140px, height 48px

  [Swipe left to advance / swipe right to go back are also available]

Notes:
  - Content loaded from CMS (lesson content API)
  - On content load error: "Không tải được nội dung. Thử lại?" + retry button
  - card_index auto-saved on each advance (debounced 500ms after swipe completes)
```

---

## Screen 7 — Lesson Viewer: Example Card (FR-LEARN-03)

```
Screen:     Lesson Viewer — Card 2 of 5 (Example)
──────────────────────────────────────────────────────────────────────────
[Same header + progress bar as Card 1]
Progress dots: ● ● ○ ○ ○

ZONE 1 — Tag: "VÍ DỤ THỰC TẾ" — caption-pulse, positive (#10B981), green chip bg

ZONE 2 — Market Data Snapshot (real VN company reference)
  Surface:  ink-800, radius-xl, padding: 16px
  Ticker:   "VNM" — display-sm, lime-soft
  Company:  "Vinamilk JSC" — body-md, fog
  Price row: ChangePill component (positive variant, e.g. "+2.3%")

ZONE 3 — Example Narrative
  Body:     2–3 short paragraphs, Manrope body-lg, fog
  Bold key terms inline: Space Grotesk 600, lime-soft

Navigation: same as Card 1 (← Trước | 2/5 | Tiếp theo →)
```

---

## Screen 8 — Lesson Viewer: Myth-Buster Card (FR-LEARN-03)

```
Screen:     Lesson Viewer — Card 3 of 5 (Myth-Buster)
──────────────────────────────────────────────────────────────────────────
[Same header + progress bar]
Progress dots: ● ● ● ○ ○

ZONE 1 — Tag: "PHÁ VỠ MÊ TÍN" — caption-pulse, plasma (#D277FF), hint-border chip

ZONE 2 — Myth Statement
  Surface:  ink-800, radius-xl, padding: 16px
  Prefix:   🚫 icon + "Sai lầm phổ biến:" caption-pulse, negative
  Myth:     body-lg (18px, 500, Manrope), fog, italic-style quote marks

ZONE 3 — Reality
  Surface:  quiz-correct-bg, radius-xl, padding: 16px
  Prefix:   ✓ icon + "Sự thật:" caption-pulse, positive
  Truth:    body-lg (18px, 400, Manrope), lime-soft

Navigation: same (← Trước | 3/5 | Tiếp theo →)
```

---

## Screen 9 — Lesson Viewer: Quiz Card (Default) (FR-LEARN-04)

```
Screen:     Lesson Viewer — Card 4 of 5 (Quiz — Default/Unanswered)
User goal:  Answer the multiple-choice question
──────────────────────────────────────────────────────────────────────────
[Same header + progress bar]
Progress dots: ● ● ● ● ○

ZONE 1 — Tag: "CÂU HỎI" — caption-pulse, fog, ink-800 chip

ZONE 2 — Question
  Surface:  ink-800, radius-xl, padding: 20px
  Q text:   body-lg (18px, 500, Manrope), lime-soft, line-height 1.62

ZONE 3 — Answer Options (4 QuizOption rows, gap: space-3)
  Each option:
    Surface:  ink-700, radius-lg (16px), min-height 56px, padding: 14px 16px
    Label:    "A / B / C / D" — caption-drop, fog-muted (left, 24×24 circle)
    Text:     body-md (14px, Manrope), fog

  States (per option — see state matrix in DESIGN-F0-LEARN-03-ui-spec.md):
    default:   ink-700 bg, no border
    selected:  edge-strong border, ink-600 bg (pre-submit highlight only)
    correct:   quiz-correct-bg, positive border 1.5px, checkmark icon right
    wrong:     quiz-wrong-bg, negative border 1.5px, ✕ icon right + shake animation
    disabled:  opacity-40 (non-selected options after reveal)

ZONE 4 — Action (pinned bottom)
  [BEFORE correct answer]  "Tiếp theo →" DISABLED (opacity-40)
  [AFTER correct answer]   "Tiếp theo →" ENABLED (lime KineticButton)
  Attempt counter:         "Lần thử: 2" — caption-pulse, fog, only shown after 1st wrong

Navigation: [← Trước | 4/5 | (Tiếp theo disabled until correct)]
```

---

## Screen 10 — Lesson Viewer: Quiz Card (Hint State) (FR-LEARN-04)

```
Screen:     Lesson Viewer — Hint Card (slides in from right after 3rd wrong answer)
User goal:  Read the hint; retry the quiz
──────────────────────────────────────────────────────────────────────────
[Same header; progress dots: ● ● ● ● ○]

HINT CARD (slides from right, overlays quiz card, full content area)
  Surface:  hint-surface (rgba(210,119,255,0.08))
            hint-border (rgba(210,119,255,0.25)) 1px
            radius-xl (24px), padding: 24px

  Icon:     Lucide `lightbulb` 32px, plasma (#D277FF)
  Tag:      "GỢI Ý" — caption-pulse, plasma, plasma-glow chip

  Hint text: lesson-specific hint from `lessons.quiz_hint_text`
             body-lg (18px, 400, Manrope), lime-soft

  Divider line: edge, 1px

  Context:  "Hãy đọc lại bài học nếu cần — không có giới hạn thử lại."
            body-md (14px), fog

ZONE — Action (pinned bottom)
  [PRIMARY] "Hiểu rồi, thử lại →"
            KineticButton variant=plasma (secondary), full-width
            → Hint Card slides out → Quiz Card returns for re-attempt

Notes:
  - Hint card entrance: slideInRight 300ms ease-decelerate
  - Hint card exit (on "Hiểu rồi" tap): slideOutRight 300ms ease-accelerate
  - KineticButton variant=plasma used here (not lime) — plasma = identity/alert context
```

---

## Screen 11 — Lesson Viewer: CTA Card ("Try It Now") (FR-LEARN-05)

```
Screen:     Lesson Viewer — Card 5 of 5 (CTA)
User goal:  Choose to try the lesson's paper trade action OR skip
──────────────────────────────────────────────────────────────────────────
[Same header; progress dots: ● ● ● ● ●]

ZONE 1 — Tag: "THỬ NGAY" — caption-pulse, lime, xp-pill-bg chip

ZONE 2 — Task Prompt Card
  Surface:  ink-800, radius-xl, padding: 20px
  Icon:     Lesson-specific Lucide icon (e.g., trending-up), 40px, lime-soft
  Task:     Lesson-specific action prompt — display-sm (24px, 700), lime-soft
  Context:  Short explanation (max 30 words) — body-md, fog

ZONE 3 — XP Preview
  Surface:  ink-800, radius-lg, padding: 12px 16px
  Content:  "Hoàn thành bài học này để nhận +25 XP"
            body-md (14px), fog
            XP amount: lime, Space Grotesk 600

ZONE 4 — Actions (pinned bottom, stacked)
  [PRIMARY]   "Thử ngay trong danh mục ảo →"
              KineticButton variant=lime, full-width
              → Opens "Try It Now" Bottom Sheet

  [SECONDARY] "Bỏ qua, xem bài tiếp theo →"
              KineticButton variant=ghost, full-width
              → Triggers lesson completion (XP awarded)

──────────────────────────────────────────────────────────────────────────
TRY IT NOW BOTTOM SHEET (modal overlay from Card 5 primary tap):
  Surface:  ink-800, radius-4xl top-corners, height ~60% viewport
  Handle:   4×36px bar, ink-600, radius-full, centered at 12px from top

  Header:   Task title, display-sm (24px, 700), lime-soft
  Body:     Detailed instruction copy, body-md, fog
  Warning:  "Đây là danh mục ảo. Bạn không dùng tiền thật."
            body-md, fog-muted, Lucide `shield-check` icon

  [PRIMARY]   "Đi đến danh mục ảo →" KineticButton lime
  [SECONDARY] "Để sau" — text link, fog, centered
              → dismisses sheet; lesson completion triggered
```

---

## Screen 12 — Lesson Completion Toast (FR-LEARN-06)

```
Screen:     XP Toast (overlay, auto-dismiss)
Trigger:    Lesson completion event fires (after Card 5 action or dismiss)
──────────────────────────────────────────────────────────────────────────

TOAST (slides up from bottom, 80px height, ink-800 surface, radius-xl)
  Position: bottom 112px (above bottom nav), centered-x, width 280px
  Padding:  16px horizontal

  Left:     ⚡ Lucide `zap` icon, 20px, lime
  Center:   "+25 XP" — display-sm (24px, 700, Space Grotesk), lime
            "Bài học hoàn thành!" — body-md (14px), fog
  Right:    Confetti burst micro-animation (2 lime particles, 500ms)

  Animation: fadeUp (opacity 0→1, Y 16px→0), 300ms ease-decelerate
  Auto-dismiss: 2500ms after appear → fadeOut 200ms ease-accelerate

Notes:
  - If this was the 5th lesson of a module, show Module KCB prompt after toast:
    Banner slides up below toast: "Bạn đã học xong Module 1! Làm bài kiểm tra →"
    (lime border, ink-800 bg, caption-drop text)
```

---

## Screen 13 — Module Knowledge Check (MKC) (FR-LEARN-18)

```
Screen:     Module Knowledge Check — Question View
User goal:  Pass 5-question quiz to unlock module completion reward
Trigger:    Tap "Làm bài kiểm tra" on module completion banner
──────────────────────────────────────────────────────────────────────────

HEADER (56px + safe-area-top, ink-900)
  Left:     [✕ Exit] — exits MKC, returns to Grow tab (progress lost)
  Center:   "Kiểm tra Module 1" — title-md, lime-soft
  Right:    "Câu 2/5" — body-md, fog

PROGRESS BAR (below header, 8px, lime fill, animated on advance)

ZONE 1 — Question Card
  Surface:  ink-800, radius-2xl, margin-x 24px, padding 24px
  Q text:   body-lg (18px, 500, Manrope), lime-soft

ZONE 2 — Options (same QuizOption component as Lesson Quiz)
  4 options, A/B/C/D
  DIFFERENCE from lesson quiz: NO correct/wrong reveal per question
  All options remain in default or selected state until "Nộp bài" on Q5

ZONE 3 — Action (pinned bottom)
  "Tiếp theo →" (Q1–Q4) / "Nộp bài" (Q5)
  KineticButton lime, DISABLED until selection made

Notes:
  - Forward-only navigation (no back between questions)
  - No time limit per question
  - Correct/wrong answers revealed only on Results Screen
```

---

## Screen 14 — MKC Results: Pass (FR-LEARN-18)

```
Screen:     MKC Results — Pass (≥3/5 correct)
User goal:  Claim module completion reward
──────────────────────────────────────────────────────────────────────────

CANVAS: Full-screen, ink-900, AmbientBackground active (lime orbs pulsing)

ZONE 1 — Score (hero, centered)
  Icon:     Lottie burst animation or ★ SVG, 80×80px, lime
  Score:    "4/5" — display-md (36px, 700), lime (#CAFD00)
  Tag:      "ĐẠT" — caption-pulse, lime, xp-pill-bg chip

ZONE 2 — Module name + message
  Headline: "Bạn đã hoàn thành [Module Name]!" — title-md, lime-soft
  Body:     "Điểm của bạn: [N]/5 câu đúng" — body-md, fog

ZONE 3 — Reward Preview (badge thumbnail + XP)
  Badge preview: 64×64px rounded square, badge icon, rarity border color
  Badge name: body-md, fog
  XP earned: "+[N] XP" xp-pill-bg chip
  Layout:     horizontal flex, centered, gap space-3

ZONE 4 — CTA
  [PRIMARY] "Nhận phần thưởng 🎉" — KineticButton lime, full-width
            → navigates to Module Completion Reward Screen (Screen 16)
```

---

## Screen 15 — MKC Results: Fail / Cooldown (FR-LEARN-18)

```
Screen:     MKC Results — Fail (<3/5 correct)
User goal:  Review weak areas; wait for cooldown; retry
──────────────────────────────────────────────────────────────────────────

HEADER: "← Kết quả kiểm tra" — back returns to Grow tab

ZONE 1 — Score (hero)
  Icon:     Lucide `book-open`, 80px, fog
  Score:    "[N]/5" — display-md, negative (#EF4444)
  Tag:      "CHƯA ĐẠT" — caption-pulse, negative, cooldown-bg chip

ZONE 2 — Copy
  Headline: "Chưa đủ điểm. Cần ≥ 3/5 câu đúng." — title-md, fog
  Body:     "Ôn lại các bài học rồi thử lại nhé!" — body-md, fog

ZONE 3 — Review Links (incorrect questions)
  Per incorrect question: "Q[N]: [Question summary]" link row
  Tap → returns to corresponding lesson card in review mode
  Chevron-right icon (fog-muted), ink-800 surface rows, radius-lg

ZONE 4 — Retry CTA with Cooldown
  [INACTIVE] "Thử lại sau [countdown]" — KineticButton lime, DISABLED, opacity-40
  Countdown: "00:47" live countdown — display-sm (24px, Space Grotesk), negative
  Banner:    cooldown-bg (rgba(239,68,68,0.08)), body-md text:
             "Bạn có thể thử lại sau khi đếm ngược kết thúc"

  [ACTIVE — after 60s] "Thử lại ngay →" — KineticButton lime, ENABLED
                        → reloads MKC with fresh question set
```

---

## Screen 16 — Module Completion Reward Screen (FR-LEARN-09)

```
Screen:     Module Completion Reward
User goal:  Celebrate completing a module; see the badge and XP earned
──────────────────────────────────────────────────────────────────────────

CANVAS: Full-screen, ink-900, AmbientBackground active
        Confetti burst on screen entry (300 particles, lime + plasma, 1.5s, one-shot)

ZONE 1 — Badge Reveal (centered, top 40%)
  Animation: Badge scales from 0→1.05→1.0 (300ms spring ease)

  BadgeCard:
    Container: 140×140px, ink-800 surface, radius-2xl
    Border:    [rarity color] width [rarity border width] (e.g., rare = #60A5FA 3px)
    Icon:      Module badge SVG, 72×72px, centered
    Symbol:    Rarity symbol (Common: —, Uncommon: ✦, Rare: ★) below icon
    Name:      Badge name — body-md (14px, 600, Space Grotesk), fog, below container

  Rarity label: "HIẾM" / "PHỔ BIẾN" / "ĐẶC BIỆT" — caption-pulse, rarity-color chip

ZONE 2 — XP Reward
  Line 1:    Lesson XP: "+125 XP (5 bài học)"
             xp-pill-bg chip, lime text
  Line 2:    Module bonus (if any): "+75 XP (Module hoàn thành)"
             xp-pill-bg chip, lime text, separate chip
  [M3/M4 show TWO separate XP chips, one per line]

ZONE 3 — Level Up Banner (conditional — shown if advance condition met)
  Surface:  plasma-glow bg, plasma border 1px, radius-xl, padding: 12px 16px
  Icon:     Lucide `arrow-up`, plasma
  Text:     "Level Up: [New Level Name]" — title-md, plasma
  Subtext:  "Bạn đã đạt [level label]!" — body-md, fog

ZONE 4 — CTAs
  [PRIMARY]   Module-specific action:
              M1: "Bắt đầu Module 2 →"
              M2: "Xem tiền thưởng →" (→ Bonus Cash Modal)
              M3: "Tiếp tục Module 4 →"
              M4: "Chia sẻ thành tích →"
              All: KineticButton lime, full-width

  [SECONDARY] "Quay về Grow" — ghost button, margin-top 12px
```

---

## Screen 17 — Module 2 Bonus Cash Modal (FR-LEARN-10)

```
Screen:     Bonus Cash Modal (M2 completion reward)
Trigger:    Module 2 Reward Screen → "Xem tiền thưởng →" tap
──────────────────────────────────────────────────────────────────────────

BOTTOM SHEET (full-height, ink-800, radius-4xl top, handle bar 4×36px)

ZONE 1 — Hero Amount
  Icon:     Lucide `wallet` or cash SVG, 56px, lime
  Amount:   "50,000,000 ₫" — display-md (36px, 700, Space Grotesk, tabular), lime
  Label:    "Tiền thưởng ảo" — body-md, fog, uppercase caption-pulse chip

ZONE 2 — Details
  Row 1:    📅 "Hết hạn sau 7 ngày" — body-md, fog
  Row 2:    ⚠ "Tự động thanh lý toàn bộ tại T+7" — body-md, negative
  Row 3:    🔒 "Không thể rút ra tài khoản thật" — body-md, fog-muted

ZONE 3 — Security Info Card (GlassmorphicSecurityInfo component)
  Icon:     shield-check (plasma-deep tile)
  Title:    "Danh mục ảo 100% an toàn"
  Body:     "Tiền thưởng chỉ dùng trong danh mục ảo Paave. Không rủi ro thật."

ZONE 4 — CTAs (stacked)
  [PRIMARY]   "Xem danh mục ảo →" KineticButton lime → navigates to Portfolio tab
  [SECONDARY] "Tiếp tục học Module 3" ghost → returns to Grow tab
```

---

## Screen 18 — Daily Missions: Locked State (FR-LEARN-12)

```
Screen:     Daily Missions — Locked (accessible from Grow tab or Home)
User goal:  See what Daily Missions will offer; be motivated to complete M1
──────────────────────────────────────────────────────────────────────────

HEADER: Standard with "Nhiệm vụ hàng ngày" title, padlock icon right

MAIN CONTENT (greyed, non-interactive, opacity-50)
  [Blurred mission cards] — 3 mission card placeholders, ink-800 + blur overlay
  Each shows: padlock icon, "???" mission title, "?? XP" reward (fog-muted)

ZONE — Unlock Banner (prominent, not locked)
  Surface:  ink-800, radius-xl, border 1px lime (edge-strong), padding: 20px
  Icon:     Lucide `lock-open`, 32px, lime
  Headline: "Mở khóa Nhiệm vụ hàng ngày"
            title-md (18px), lime-soft
  Body:     "Hoàn thành Module 1 để nhận nhiệm vụ mỗi ngày và tích lũy XP!"
            body-md (14px, Manrope), fog
  CTA:      "Bắt đầu Module 1 →" KineticButton lime, full-width

Notes:
  - Tab badge shows lock icon until M1 complete
  - After M1 complete: missions unlock, this screen replaced by active mission list
```

---

*Owner: UX Design | All 18 screens mapped | Component specs in `DESIGN-F0-LEARN-04-component-spec.md`*
*UI specifications in `DESIGN-F0-LEARN-03-ui-spec.md`*

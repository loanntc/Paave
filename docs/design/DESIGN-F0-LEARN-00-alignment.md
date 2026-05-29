# F0 Learning Path — Design Alignment Summary
**Version:** 2.0 | **Date:** 2026-05-29 | **Feature:** F0 Learning Path (Module F-LEARN)
**Architecture:** Frontend-only · AsyncStorage · No rewards

> ⚠ **V2 BREAKING CHANGES:** XP system, badge system, and bonus cash are REMOVED. No backend API.
> All learning progress is stored in AsyncStorage (resets on reinstall).
> Post-learning: age ≥18 → Trade tab; age <18 → Home tab + age gate.
> See `docs/business/f0-learning/` for all revised requirements.

---

## ⚠ Read Before Designing

| File | Path | Read When |
|------|------|-----------|
| Design System | `docs/design/design-system.md` | Always — tokens, typography, spacing, motion |
| Component Registry | `docs/design/components.md` | Always — reuse existing before creating new |
| Screen Specs | `docs/design/screen-specs.md` | V1 layout patterns and precedents |
| UX Flows | `docs/design/ux-flows.md` | Navigation architecture, Tab 2 sub-nav |
| F0 Learning V2 (authoritative) | `docs/business/f0-learning/00-index.md` | All revised requirements |
| Requirements V2 | `docs/business/f0-learning/01-requirements.md` | FR, BR, edge cases |
| Learning Content | `docs/business/f0-learning/02-content.md` | All lesson + quiz content |
| Data Model | `docs/business/f0-learning/03-data-model.md` | AsyncStorage schema |
| Dev/QA Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` | Engineering handoff reference |

**Figma:** [Paave — V2.0 Design](https://www.figma.com/design/DIn25HJLZL42U6TAnqoh6n)
**File key:** `TJyxulK0P8ne65hCdURmcE`

---

## Alignment Summary

```
Project:          Paave — Vietnamese Mobile Investing App (iOS + Android, React Native)
Feature:          F0 Learning Path
Module ID:        F-LEARN
Business Goal:    Guide F0 users (age 16–27) through 4 progressive learning modules
                  to build foundational VN stock market knowledge before they begin
                  real trading. V1 is fully frontend-only with local progress storage.
Primary User:     F0 Trader — age 16–27, Gen Z, Vietnamese, zero prior investing experience
Secondary Actor:  Local device (AsyncStorage; no server-side processing in V1)

Success Metrics:
  - 70% of new users complete M1 within 7 days of first launch
  - 40% complete the full 4-module path within 30 days
  - ≥ 50% of learning-complete users navigate to Trade tab (age 18+)

Core Flow (Happy Path):
  1. User completes registration → account status = ACTIVE
  2. First app launch → Welcome Modal fires (one-time, flag in AsyncStorage)
     a. "Bắt đầu Module 1" → navigate directly to L1.1 Card 1
     b. "Khám phá trước" → Home tab; Grow tab shows LearningPromptCard
     c. "Tôi đã biết chứng khoán cơ bản" → Placement Quiz (FR-LEARN-08)
  3. Grow tab: 4 ModuleCards, sequential unlock (AsyncStorage-driven)
  4. Tap module → 5 lessons; tap lesson → 5 card-stack (swipe left to advance)
     Card order (fixed): Concept → Example → Myth-Buster → Quiz → CTA
  5. Lesson complete (Card 5 viewed + Card 4 quiz passed) → next lesson unlocks
  6. All 5 lessons complete → Module Knowledge Check (5 Qs, ≥3/5 to pass)
  7. MKC passed → Module COMPLETE → simple "Module N Hoàn Thành!" screen
  8. All 4 modules complete → Learning Complete screen → age check
     Age ≥ 18: navigate to Trade tab
     Age < 18: navigate to Home tab + AgeGateBottomSheet

Key Business Rules (designer-critical):
  - Only ONE KineticButton `lime` variant visible per viewport at any time
  - Module unlock is CURRENT-STATE: derived from AsyncStorage on Grow tab mount
  - Lesson progress saved per card swipe (500ms debounce); NO XP, NO rewards
  - Placement Quiz: back BLOCKED on Q1; one-shot (AsyncStorage flag)
  - MKC retry cooldown: 60s client-side timer (AsyncStorage timestamp)
  - Post-learning age gate: ≥18 → Trade tab; <18 → Home + bottom sheet; missing DOB → same as <18
  - f0_age_gate_shown written only for Case B/C (bottom sheet shown); NOT written for Case A (≥18 path)

V1 Scope (IN):
  - Welcome Modal (one-time, post-registration; 3 CTAs including Placement Quiz entry)
  - Learning Path home screen (Grow Tab > Sub-nav pill 1)
  - 4 modules × 5 lessons × 5 cards = 100 content cards
  - Card-stack viewer (swipe + chevron fallback)
  - In-lesson quiz (unlimited retries) + hint card (after 3 consecutive wrong)
  - "Try it now" CTA card (paper trading deep-link prompt)
  - Module Knowledge Check (5 Qs, ≥3/5 pass, 60s retry cooldown)
  - Initial Placement Quiz (5 Qs, ≥4/5 pass → skip M1; one-shot, no retry)
  - LearningPromptCard (Grow tab — shown when user chose "Khám phá trước")
  - Learning Complete screen (after all 4 modules COMPLETE)
  - Post-learning age gate: AgeGateBottomSheet for under-18 users; Trade tab for ≥18
  - All progress stored in AsyncStorage (resets on reinstall)

V2 Deferred (OUT):
  - XP system, badge system, bonus cash (removed — no API support in V1)
  - Learning Level System (removed — event-based levels require backend)
  - Daily Missions visibility gate (deferred — requires backend)
  - Spaced repetition / review scheduling
  - Lesson authoring / CMS admin interface
  - Multi-language support beyond Vietnamese
  - Offline lesson caching
  - Social learning (shared progress, leaderboard by module)
  - Social sharing / achievement CTA on Learning Complete screen
  - Push notification when under-18 user turns 18
  - Instructor-led or live session formats
  - Learning analytics dashboard for internal teams

Design System:
  Base:           Paave V2.0 "Kinetic Drop"
  Canvas:         ink-900 (#0E0E0E) — OLED-native dark canvas
  Primary CTA:    lime (#CAFD00) — growth actions, progress fills
  Accent/Identity: plasma (#D277FF) — hint cards, placement quiz fail, age gate, M4 pass screen mixed orbs
  Error:          negative (#EF4444) — wrong quiz answers, cooldown warnings
  Success:        positive (#10B981) — correct answers, completion states
  Display font:   Space Grotesk (headings, labels, numerics)
  Body font:      Manrope (body copy, descriptions)
  Layout canvas:  390×852px (iPhone 14 Pro baseline)
  H-margin:       24px (space-6) both sides
```

---

## Module Structure Reference

| Module | Vietnamese Title | Lessons | MKC Pass | Unlocks | Pass AmbientBg |
|--------|-----------------|---------|----------|---------|----------------|
| M1 | Cổ phiếu cơ bản | L1.1–L1.5 | ≥3/5 | M2 | lime |
| M2 | Phân tích cơ bản | L2.1–L2.5 | ≥3/5 | M3 | lime |
| M3 | Chiến lược đầu tư | L3.1–L3.5 | ≥3/5 | M4 | lime |
| M4 | Quản lý rủi ro | L4.1–L4.5 | ≥3/5 | Learning Complete | lime + plasma (mixed) |

> **No XP, no badges, no bonus cash in V1.** All rewards are removed. See `docs/business/f0-learning/00-index.md` for rationale.

---

## Learning-Specific Design Tokens

These tokens are NOT in `design-system.md` — they are defined for this feature only.
Add to the Figma library under **Learning / Tokens** before designing screens.

> ⚠ Rarity tokens (`rarity-*`), XP tokens (`xp-pill-*`), and `badge-surface` are **removed in V2** — no badges, no XP in this version.

| Token | Value | Usage |
|-------|-------|-------|
| `hint-surface` | `rgba(210, 119, 255, 0.08)` | Hint card background overlay |
| `hint-border` | `rgba(210, 119, 255, 0.25)` | Hint card border |
| `quiz-correct-bg` | `rgba(16, 185, 129, 0.12)` | Correct answer option highlight |
| `quiz-correct-border` | `positive` (`#10B981`) | Correct answer border |
| `quiz-wrong-bg` | `rgba(239, 68, 68, 0.12)` | Wrong answer option highlight |
| `quiz-wrong-border` | `negative` (`#EF4444`) | Wrong answer border |
| `progress-track` | `rgba(72, 72, 71, 0.30)` | Lesson progress bar track |
| `progress-fill` | `lime` (`#CAFD00`) | Lesson progress bar fill |
| `card-surface` | `ink-800` (`#131313`) | Lesson card background |
| `card-surface-raised` | `ink-700` (`#1A1A1A`) | Raised/hover card state |
| `locked-surface` | `ink-800` + `opacity-40` | Locked module card overlay |
| `cooldown-bg` | `rgba(239, 68, 68, 0.08)` | MKC retry cooldown banner |
| `module-tag-bg` | `rgba(202, 253, 0, 0.08)` | Module card tag/eyebrow bg |

---

## Screen Count Summary

| File | Screens |
|------|---------|
| `DESIGN-F0-LEARN-02-wireframes.md` | 17 screens |

| # | Screen Name | FR Reference |
|---|-------------|-------------|
| 1 | Welcome Modal | FR-LEARN-01 |
| 2 | Placement Quiz — Intro | FR-LEARN-08 |
| 3 | Placement Quiz — Q1–Q5 | FR-LEARN-08 |
| 4 | Placement Quiz — Pass (Skip M1) | FR-LEARN-08 |
| 5 | Placement Quiz — Fail (Start M1) | FR-LEARN-08 |
| 6 | Learning Path Home (Grow Tab) | FR-LEARN-02 |
| 7 | Lesson Viewer — Concept Card | FR-LEARN-03 |
| 8 | Lesson Viewer — Example Card | FR-LEARN-03 |
| 9 | Lesson Viewer — Myth-Buster Card | FR-LEARN-03 |
| 10 | Lesson Viewer — Quiz Card (Default) | FR-LEARN-04 |
| 11 | Lesson Viewer — Quiz Card (Hint State) | FR-LEARN-04 |
| 12 | Lesson Viewer — CTA Card | FR-LEARN-05 |
| 13 | Module Knowledge Check (MKC) — Q1–Q5 | FR-LEARN-07 |
| 14 | MKC Results — Pass | FR-LEARN-07 |
| 15 | MKC Results — Fail / Cooldown | FR-LEARN-07 |
| 16 | Learning Complete Screen | FR-LEARN-09 |
| 17 | Age Gate Bottom Sheet (under-18 / no DOB) | FR-LEARN-10 |

---

*Owner: Product Design | Reviewed by: PO + BA | Requirements: `docs/business/f0-learning/01-requirements.md` (V2 authoritative)*

---

## Related Documents

**Business Layer**
| Document | Path |
|----------|------|
| FRD: F0 Learning Path | `docs/business/frd/module-f0-learning.md` |
| UX Flows: F0 Learning Path | `docs/business/frd/module-f0-learning-ux-flows.md` |
| Gamification FRD | `docs/business/frd/module-c-gamification-extended.md` |

**Design Layer**
| Document | Path |
|----------|------|
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

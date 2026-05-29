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
  - Lesson progress saved per card swipe (500ms debounce); no XP — NO rewards
  - Placement Quiz: back BLOCKED on Q1; one-shot (AsyncStorage flag)
  - MKC retry cooldown: 60s client-side timer (AsyncStorage timestamp)
  - Post-learning age gate: ≥18 → Trade tab; <18 → Home + bottom sheet; missing DOB → same as <18
  - Bonus cash (M2): separate wallet ledger, 7-day TTL, force-liquidation at T+7
  - Learning Level: event-based (6 levels); no visible XP bar or threshold counter

V1 Scope (IN):
  - Welcome Modal (one-time, post-registration)
  - Learning Path home screen (Grow Tab > Sub-nav pill 1)
  - 4 modules × 5 lessons × 5 cards = 100 content cards
  - Card-stack viewer (swipe + chevron fallback)
  - In-lesson quiz (unlimited retries) + hint card (after 3 consecutive wrong)
  - "Try it now" CTA modal (paper trading prompt)
  - Lesson XP (+25 per lesson completion, idempotent)
  - Module completion rewards (badge + XP bonus + next module unlock)
  - Module 2 bonus cash (50,000,000 VND, 7-day TTL + force-liquidation)
  - Module Knowledge Check (5 Qs, ≥3/5 pass, 60s retry cooldown)
  - Initial Placement Quiz (5 Qs, 4/5 pass → skip M1; one-shot, no retry)
  - Daily Missions visibility gate (locked until M1 complete)
  - Learning Level System (6 levels, event-based advancement)

V2 Deferred (OUT):
  - Spaced repetition / review scheduling
  - Lesson authoring / CMS admin interface
  - Multi-language support beyond Vietnamese
  - Offline lesson caching
  - Social learning (shared progress, leaderboard by module)
  - Instructor-led or live session formats
  - Learning analytics dashboard for internal teams

Design System:
  Base:           Paave V2.0 "Kinetic Drop"
  Canvas:         ink-900 (#0E0E0E) — OLED-native dark canvas
  Primary CTA:    lime (#CAFD00) — growth actions, progress fills
  Identity/Level: plasma (#D277FF) — learning level, badge identity
  Error:          negative (#EF4444) — wrong quiz answers, cooldown warnings
  Success:        positive (#10B981) — correct answers, completion states
  Display font:   Space Grotesk (headings, labels, numerics)
  Body font:      Manrope (body copy, descriptions)
  Layout canvas:  390×852px (iPhone 14 Pro baseline)
  H-margin:       24px (space-6) both sides
```

---

## Module Structure Reference

| Module | Title | XP (lessons) | Module Bonus XP | Total XP | Badge | Rarity | Rarity Color |
|--------|-------|-------------|-----------------|----------|-------|--------|--------------|
| M1 | The VN Stock Market | 125 | 0 | 125 | Market Foundations | Common | `#9CA3AF` |
| M2 | Your First Trade | 125 | 0 | 125 | First Trader | Common | `#9CA3AF` |
| M3 | Thinking in Portfolios | 125 | 25 | 150 | Portfolio Thinker | Uncommon | `#34D399` |
| M4 | Trader Psychology | 125 | 75 | 200 | Market Scholar | **Rare** | `#60A5FA` |

**M2 special reward:** 50,000,000 VND bonus virtual cash (separate ledger, 7-day TTL)
**M4 unlock:** Community posting permission (Tier 2 status)

---

## Rarity Color Scale (Authoritative)

| Rarity | Token | Value | Border Width | Symbol | Notes |
|--------|-------|-------|-------------|--------|-------|
| Common | `rarity-common` | `#9CA3AF` | 1px solid | — | M1, M2 badges |
| Uncommon | `rarity-uncommon` | `#34D399` | 2px solid | ✦ | M3 badge |
| Rare | `rarity-rare` | `#60A5FA` | 3px solid | ★ | M4 badge (Market Scholar) |
| Epic | `rarity-epic` | `#F59E0B` | 3px solid + glow | ⚡ | Future use only |

---

## Learning-Specific Design Tokens

These tokens are NOT in `design-system.md` — they are defined for this feature only.
Add to the Figma library under **Learning / Tokens** before designing screens.

| Token | Value | Usage |
|-------|-------|-------|
| `rarity-common` | `#9CA3AF` | M1/M2 badge border |
| `rarity-uncommon` | `#34D399` | M3 badge border |
| `rarity-rare` | `#60A5FA` | M4 badge border + glow source |
| `rarity-epic` | `#F59E0B` | Reserved — V2 |
| `xp-pill-bg` | `rgba(202, 253, 0, 0.12)` | XP indicator chip background |
| `xp-pill-text` | `lime` (`#CAFD00`) | XP indicator chip text |
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
| `badge-surface` | `ink-700` (`#1A1A1A`) | Badge card background |
| `cooldown-bg` | `rgba(239, 68, 68, 0.08)` | MKC retry cooldown banner |
| `module-tag-bg` | `rgba(202, 253, 0, 0.08)` | Module card tag/eyebrow bg |

---

## Screen Count Summary

| File | Screens |
|------|---------|
| `DESIGN-F0-LEARN-02-wireframes.md` | 18 screens |

| # | Screen Name | FR Reference |
|---|-------------|-------------|
| 1 | Welcome Modal | FR-LEARN-01 |
| 2 | Placement Quiz | FR-LEARN-19 |
| 3 | Placement Quiz — Pass (Skip M1) | FR-LEARN-19 |
| 4 | Placement Quiz — Fail (Start M1) | FR-LEARN-19 |
| 5 | Learning Path Home (Grow Tab) | FR-LEARN-02 |
| 6 | Lesson Viewer — Concept Card | FR-LEARN-03 |
| 7 | Lesson Viewer — Example Card | FR-LEARN-03 |
| 8 | Lesson Viewer — Myth-Buster Card | FR-LEARN-03 |
| 9 | Lesson Viewer — Quiz Card (Default) | FR-LEARN-04 |
| 10 | Lesson Viewer — Quiz Card (Hint State) | FR-LEARN-04 |
| 11 | Lesson Viewer — CTA Card ("Try It Now") | FR-LEARN-05 |
| 12 | Lesson Completion Toast | FR-LEARN-06 |
| 13 | Module Knowledge Check (MKC) | FR-LEARN-18 |
| 14 | MKC Results — Pass | FR-LEARN-18 |
| 15 | MKC Results — Fail / Cooldown | FR-LEARN-18 |
| 16 | Module Completion Reward Screen | FR-LEARN-09 |
| 17 | Module 2 Bonus Cash Modal | FR-LEARN-10 |
| 18 | Daily Missions — Locked State | FR-LEARN-12 |

---

*Owner: Product Design | Reviewed by: PO + BA | FRD linked: `docs/business/frd/module-f0-learning.md`*

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

# F0 Learning Path — Document Index
**Version:** 2.0 | **Date:** 2026-05-29 | **Architecture:** Frontend-only, AsyncStorage
**Status:** Supersedes `docs/business/frd/module-f0-learning.md` for implementation

---

## Why this folder exists

The F0 Learning Path (V2) is a **fully frontend-only** feature. There is no backend API support for learning. All progress is stored in React Native AsyncStorage and resets on app reinstall. Rewards (XP, badges, bonus cash) are **not implemented** in this version.

This folder contains the authoritative reference for:
- Business and functional requirements
- Full learning content (all 4 modules)
- Local storage data model
- Post-learning completion flow (age gate + trading unlock)
- Detailed flow analysis per user journey (Flows A–G)

---

## Reading order

| Order | File | Purpose | Audience |
|-------|------|---------|----------|
| 1 | `01-requirements.md` | Business + functional requirements, business rules, edge cases | PO · BA · Dev |
| 2 | `02-content.md` | Full lesson content, quiz questions, pass conditions for all 4 modules | Content · Dev · QA |
| 3 | `03-data-model.md` | AsyncStorage schema, state machine, TypeScript types | Dev |
| 4 | `04-user-flow.md` | Master user flow overview — all phases connected end-to-end | PO · BA · Design · Dev · QA |
| 5 | `flow-a-welcome-modal.md` | First launch modal: 3 CTAs, flag written at render | Dev · QA |
| 6 | `flow-b-grow-tab.md` | Learning Path Home: ModuleCard states, LearningPromptCard | Dev · QA |
| 7 | `flow-c-lesson-experience.md` | Card-stack viewer: swipe nav, quiz, hint card, completion | Dev · QA |
| 8 | `flow-d-module-completion.md` | After Lesson 5: MKC banner, module state transition | Dev · QA |
| 9 | `flow-e-mkc.md` | Module Knowledge Check: local scoring, 60s cooldown | Dev · QA |
| 10 | `flow-f-placement-quiz.md` | Pre-M1 assessment: one-shot, local scoring, M1 skip | Dev · QA |
| 11 | `flow-g-learning-complete.md` | All modules done: age check, Trade or Home routing | Dev · QA |

---

## Architecture summary

```
User action
    │
    ▼
React Native App (local)
    │
    ├── AsyncStorage ──── All learning state (progress, quiz flags, cooldowns)
    │                      Resets on reinstall. No sync.
    │
    ├── App Bundle ──── All lesson content + quiz questions (hardcoded)
    │                   Content updates require app store update.
    │
    └── Local Profile ── User DOB (for age check at learning completion)
```

**No network calls are made for any learning feature in V1.**

---

## Key business decisions

| Decision | Value | Rationale |
|----------|-------|-----------|
| Backend support | None (V1) | Simplify delivery; add server sync in V2 when API is ready |
| Rewards (XP/badges/cash) | Removed | Not appropriate without API support; avoids misleading UI |
| Progress on reinstall | Resets completely | Consistent with full local-only approach; V2 can add sync |
| Module unlock | Sequential (M1 → M2 → M3 → M4) | Ensures learning foundation before advanced topics |
| Post-learning age gate | ≥18 → Trade tab; <18 → Home tab | Legal requirement (Vietnam securities law requires 18+) |
| Missing DOB handling | Treat as under-18 | Safe default; never accidentally grant trade access |
| MKC cooldown | 60s client-side timer (AsyncStorage timestamp) | Paces retries without server enforcement |
| Placement quiz one-shot | AsyncStorage flag `f0_placement_quiz_completed` | Prevent gaming via repeated attempts; resets only on reinstall |
| Content delivery | Hardcoded in app bundle | Offline-first; no CMS dependency in V1 |

---

## Module structure

| Module | Title | Lessons | MKC Pass | Unlocks |
|--------|-------|---------|----------|---------|
| M1 | Cổ phiếu cơ bản | L1.1–L1.5 | ≥3/5 | M2 |
| M2 | Phân tích cơ bản | L2.1–L2.5 | ≥3/5 | M3 |
| M3 | Chiến lược đầu tư | L3.1–L3.5 | ≥3/5 | M4 |
| M4 | Quản lý rủi ro | L4.1–L4.5 | ≥3/5 | Learning Complete |

**Total:** 20 lessons · 100 cards · 20 MKC questions · 5 Placement Quiz questions

---

## Completion criteria

```
Lesson COMPLETE
  = Cards 1–5 all viewed
  AND Card 4 (Quiz) answered correctly

Module LESSONS_COMPLETE
  = All 5 lessons in module are COMPLETE

Module COMPLETE
  = LESSONS_COMPLETE
  AND MKC score ≥ 3/5

Learning Path COMPLETE
  = M1 + M2 + M3 + M4 all COMPLETE

Post-learning routing
  = If age ≥ 18 → Trade tab
  = If age < 18 → Home tab + AgeGateBottomSheet
```

---

## Design system reference

| Token | Value | Usage |
|-------|-------|-------|
| `ink-900` | #0E0E0E | All screen backgrounds |
| `lime` | #CAFD00 | Primary CTA, progress, success |
| `plasma` | #D277FF | Identity, HintCard, placement quiz fail, age gate |
| `negative` | #EF4444 | MKC fail score, error states |
| `positive` | #10B981 | Quiz correct answer |

Design specs: `docs/design/DESIGN-F0-LEARN-00-alignment.md` through `DESIGN-F0-LEARN-06-qa-cases.md`

---

## Related documents

**Business Layer (old — for reference only, superseded by this folder)**
| Document | Path |
|----------|------|
| Original FRD (V1, backend) | `docs/business/frd/module-f0-learning.md` |
| Original UX Flows (V1) | `docs/business/frd/module-f0-learning-ux-flows.md` |
| Original Flow Analysis A–F (V1) | `docs/business/frd/module-f0-flow-*.md` |

**Design Layer (updated for V2)**
| Document | Path |
|----------|------|
| Design Alignment + Tokens | `docs/design/DESIGN-F0-LEARN-00-alignment.md` |
| UX Flows (Design) | `docs/design/DESIGN-F0-LEARN-01-ux-flows.md` |
| Screen Wireframes | `docs/design/DESIGN-F0-LEARN-02-wireframes.md` |
| UI Specification | `docs/design/DESIGN-F0-LEARN-03-ui-spec.md` |
| Component Specs | `docs/design/DESIGN-F0-LEARN-04-component-spec.md` |
| Interaction Rules | `docs/design/DESIGN-F0-LEARN-05-interactions.md` |
| QA Test Cases | `docs/design/DESIGN-F0-LEARN-06-qa-cases.md` |

**Engineering Layer**
| Document | Path |
|----------|------|
| Dev/QA Handoff Spec | `docs/design/DEV-QA-SPEC-F0-Learning-Path.md` |

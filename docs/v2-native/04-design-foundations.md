# Paave v2.0 Native — Design Foundations

> Owner: Product Designer · Status: DRAFT for review · Date: 2026-07-06
> Source of truth: docs/design/design-system.md (V2.0 "Kinetic Drop") — this doc adapts it to native; it does not fork it.

---

## 0. Design Source Reconciliation (do this FIRST — pending doc updates)

Two design documents exist at different versions:
- `docs/design/screen-specs.md` **v1.0** — 2,830 lines, all V1 screens fully specified on an
  iPhone 14 Pro canvas (393×852) with exact values — but using the **V1 navy/blue palette**
  (`bg-card #1F2937`, `border-focus #3B82F6`)
- `docs/design/design-system.md` **v2.0 "Kinetic Drop"** — the current token source
  (ink/lime/plasma) with a Figma link

**Designer's first task (M0):** re-skin the screen-specs on Kinetic Drop tokens — layout,
spacing, and flows carry over as-is (the canvas is already iPhone-native); only the palette,
type, and motion layers change. The product owner will update the documents; this prep
establishes the structure so updated specs drop into place per milestone.

## 1. Token Migration (design system → code)

All Kinetic Drop tokens (ink scale, lime, plasma, fog, semantic, edge) move to
`packages/tokens` as platform-neutral JSON, generated into:
- **Swift constants + asset catalog colors** (iOS app — `DesignSystem` SwiftPM module)
- the existing Tailwind config (web prototype) — so the two never drift

```
RULES
- Zero raw hex/pt in any SwiftUI view — DesignSystem tokens only (token rule applies)
- Space Grotesk (display/numerals, tabular-nums via monospacedDigit) + Manrope (body) as
  embedded fonts registered in Info.plist; Dynamic Type mapping defined per text style
- positive/negative P&L colors NEVER communicate by color alone — always paired with sign/arrow
  (colorblind-safe rule)
- Dark-first: ink-900 canvas is the default and only v2.0 theme; light theme is out of scope
  (app declares dark appearance; no automatic light-mode inversion)
```

## 2. Native Pattern Adaptations (web spec → SwiftUI)

| Web/spec pattern | iOS-native pattern (v2.0) |
|---|---|
| Bottom nav bar component | SwiftUI TabView with Kinetic styling; haptic (UIImpactFeedbackGenerator) on tab switch |
| Page transitions | NavigationStack push/pop; matchedGeometryEffect for stock card → detail |
| Hover states | Pressed states (scale + glow per Kinetic motion); no hover anywhere |
| Toast/banner | Bottom-safe-area-aware banner; critical errors as native alerts/sheets |
| OTP input (web) | Native OTP field with `.oneTimeCode` textContentType (SMS autofill) |
| Glow orbs (CSS blur) | Pre-rendered gradient assets or SwiftUI Canvas — runtime blur budgeted per screen |
| px values in screen-specs | Read as pt 1:1 (spec canvas is @3x logical points already) |

**Motion language:** Kinetic Drop pulse/glow via SwiftUI animations (spring-based, interruptible);
every animation respects Reduce Motion; motion never blocks input.

**HIG compliance:** navigation, gestures, and sheets follow Apple Human Interface Guidelines —
Kinetic Drop styles surfaces, never fights platform behavior (App Review risk R-03).

## 3. Screen Inventory (from FRD — designer's build order)

Priority follows the roadmap milestones. Every screen ships with ALL states
(default / loading skeleton / empty+CTA / error+recovery / success / offline-stale) — per the
product-designer Screen Completeness Checklist. Counts below are FRD-derived estimates; the
mobile-delta pass may split/merge.

| Milestone | Screens (est.) | Key flows |
|-----------|----------------|-----------|
| M1 | ~14 | Splash, method picker, email signup (3), OAuth handshakes + DOB prompt, age-gate outcomes (2), prefs, goal, consent, language |
| M2 | ~12 | Stock detail (chart/stats/feed tabs), order ticket (market/limit), order confirm + receipt, portfolio (list/position detail/history), markets (VN board, reference boards) |
| M3 | ~10 | Home, discover feed + filters, notification center + primers, challenges, tier/XP surfaces |
| M4 | ~10 | AI insight card + query sheet, trader profile, per-ticker feed, account + linked providers, legal library |

## 4. Fintech Trust Surfaces (design-critical, from product-designer skill)

- **Order ticket**: virtual-funds framing always visible ("Paper trading — virtual money") —
  the paper/real distinction is a permanent surface, not a one-time disclaimer
- **Price staleness**: every price shows freshness state; delayed/reference data labeled
  ("Reference · 15m delayed") exactly per FRD market rules
- **Order confirmation**: explicit confirm step with comprehension copy; no swipe-to-trade
  shortcuts in v2.0
- **Age-gate & minors**: LEARN_MODE surfaces visually distinct; no dark-pattern pressure to
  graduate to FULL_ACCESS
- **Gamification**: rewards visibly tied to learning actions (challenges, streaks of usage —
  not trade count); the responsible-engagement checklist gates every M3 design review

## 5. Accessibility Baseline (mobile)

- Contrast per Kinetic tokens verified on device (lime-ink on lime CTA is the AA-checked pair)
- Touch targets ≥ 44pt; dynamic type support to XL without layout breakage on money surfaces
- Screen reader labels on every price, delta, and chart summary ("VNM, up 2.3%, 68,500 dong")
- Charts expose a text alternative (summary + table view)

## 6. Designer Deliverables per Milestone

1. Mobile-delta review of the module's FRD sections (with BA) → flow maps
2. Figma screens (all states) built from the token library — Figma file is the handoff source;
   Dev Mode + component names matched to `ui/` component names 1:1
3. Usability pass on the milestone's primary flow (≥5 users, VN Gen-Z panel) before FE build ends
4. Build QA against device builds before milestone exit gate

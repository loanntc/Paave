# Paave v2.0 Native — Design Foundations

> Owner: Product Designer · Status: DRAFT for review · Date: 2026-07-06
> Source of truth: docs/design/design-system.md (V2.0 "Kinetic Drop") — this doc adapts it to native; it does not fork it.

---

## 1. Token Migration (web → native)

All Kinetic Drop tokens (ink scale, lime, plasma, fog, semantic, edge) move to
`packages/tokens` as platform-neutral JSON, generated into:
- native theme objects (RN) — colors, spacing, radii, type scale
- the existing Tailwind config (web prototype) — so the two never drift

```
RULES
- Zero raw hex/px in any mobile component — tokens only (FE skill token rule applies)
- Space Grotesk (display/numerals, tabular-nums) + Manrope (body) shipped as embedded fonts;
  system-font fallback defined for load failure
- positive/negative P&L colors NEVER communicate by color alone — always paired with sign/arrow
  (colorblind-safe rule)
- Dark-first: ink-900 canvas is the default and only v2.0 theme; light theme is out of scope
```

## 2. Native Pattern Adaptations

| Web pattern (v1 prototype) | Native pattern (v2.0) |
|---|---|
| Bottom nav bar component | Native tab bar (expo-router tabs) with Kinetic styling; haptic on tab switch |
| Page transitions | Platform-native stack transitions; shared-element for stock card → detail |
| Hover states | Pressed states (scale + glow per Kinetic motion); no hover anywhere |
| Toast/banner | Snackbar bottom-safe-area aware; critical errors as dialogs |
| OTP input (web) | Native OTP with SMS autofill (iOS one-time-code / Android SMS Retriever) |
| Glow orbs (CSS blur) | Pre-rendered/Skia gradients — no runtime blur on mid-tier Android (perf budget) |

**Motion language:** Kinetic Drop pulse/glow implemented in Reanimated; every animation has a
reduced-motion variant; motion never blocks input (interruptible).

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

# Paave — Project Context

## What this is

Paave is a **paper-trading and social investing app for Vietnamese Gen Z**. Users learn investing
by simulating trades on HOSE/HNX (VN, primary, real-time) with virtual money, earn XP/tiers through
learning-oriented gamification, follow traders with visible track records, and can eventually
graduate to real trading via licensed brokerage partners. Paave itself is unlicensed and never
handles real funds. KR and Global market data are reference-only in V1.

- **Primary persona:** Vietnam Gen Z, mobile-first, mid-tier Android + recent iPhones
- **Languages:** VN (default), EN, KR
- **Compliance context:** age gate is mandatory (LEARN_MODE vs FULL_ACCESS); investing/AI/paper-trading
  disclaimers required; no dark patterns (SEC/ESMA-style scrutiny applies to investing apps)

## Current state (v1 → v2.0)

- `app/`, `components/`, `lib/` — the **v1 Next.js web prototype** (React — frozen; no new feature work)
- **v2.0 is a native iOS app (Swift/SwiftUI), iOS first** — the active initiative. No React Native.
  Android is a post-GA native-Kotlin decision. Kickoff package: `docs/v2-native/` (brief, ADR,
  architecture, roadmap, design foundations, test strategy)
- Planned monorepo shape: `apps/ios`, `apps/web`, `packages/{contracts,tokens,types}` — see
  `docs/v2-native/02-mobile-architecture.md`. API contracts are OpenAPI-first (Swift + TS clients generated)

## Source-of-truth documents

| Topic | Location |
|-------|----------|
| Business requirements | `docs/business/BRD.md` (+ addendum) |
| Functional spec (16 modules, v2.x) | `docs/business/frd/index.md` → module files |
| Paper-trading engine rules | `docs/business/SRD-order-engine-v2.3.md` |
| Design system "Kinetic Drop" V2.0 | `docs/design/design-system.md` (tokens, type, motion) |
| Screen specs | `docs/design/screen-specs.md` |
| v2.0 native initiative | `docs/v2-native/00..05` |

## Tech stack

**Web prototype (frozen):** Next.js (App Router), TypeScript strict, Tailwind, Supabase SSR
(`@supabase/ssr`), Lucide icons, `clsx` + `tailwind-merge`.

**iOS v2.0 (active):** Swift 5.10+ / SwiftUI, iOS 16+, MVVM + Swift Concurrency, SwiftPM feature
modules, Swift Charts, supabase-swift, `Decimal` for all money (never `Double`), String Catalogs
(VN/EN/KR), Keychain, Swift Testing + XCUITest, fastlane → TestFlight.
Full ADR: `docs/v2-native/01-tech-stack-decision.md`.

## Hard rules (apply to ALL code)

- **Money is never a float.** Amounts cross the wire as strings/integer minor units; decimal-safe
  math lives in `packages/core`. Space Grotesk tabular-nums for every displayed currency value.
- **Design tokens only** — zero raw hex/px in components. Tokens: `docs/design/design-system.md`
  (moving to `packages/tokens`).
- **TypeScript strict, no `any`**; no inline style objects; boolean props named `isX/hasX/canX`.
- **Every screen ships all states**: default, loading, empty, error, success, disabled — plus
  stale-data states on financial surfaces (staleness is always visible, never silent).
- **All CI checks pass before a PR is created** (lint, type-check, test, build).
- **Price/quote data always carries source + timestamp**; reference-market data is labeled Reference.
- **Age gate is server-enforced**; RLS on every table; no PII/secrets in logs.
- **Responsible engagement:** gamification rewards learning, never trade frequency; no urgency
  nudges toward trades. If a pattern boosts engagement by degrading decision quality, it's rejected.

## Commands

**Web prototype (repo root):**
```bash
npm run dev        # local dev
npm run lint       # must be clean before PR
npx tsc --noEmit   # type-check
npm run build      # must succeed before PR
```

**iOS app (`apps/ios/` — needs a Mac with Xcode 16+):**
```bash
brew install xcodegen swiftlint          # one-time
cd apps/ios && xcodegen generate         # creates Paave.xcodeproj (git-ignored)
swiftlint --strict                       # lint incl. custom money/token rules
swift test --package-path Packages/PaaveCore   # money-layer tests
node ../../packages/tokens/generate.mjs  # regen tokens after editing packages/tokens/tokens.json
```

**Design tokens:** `packages/tokens/tokens.json` is the source of truth → generator emits
Swift constants (`apps/ios/.../Generated/`, committed). CI fails if they drift out of sync.

**API contracts:** `packages/contracts/openapi.yaml` is contract-first source of truth —
money values are strings, every error uses the registry envelope.

## Agent team

`skills/` contains a 9-role delivery team + orchestrator — invoke via slash commands:

- `/team-workflow` — 8-stage orchestrator (requirement → analyse → review⇄update → document →
  develop → code review⇄fix → test⇄fix bugs → complete); defines every handoff and loop
- Roles: `/project-manager` (PM/PO, risk-first, RAID), `/business-analyst` (value + full case
  coverage), `/product-designer` (end-to-end design, fintech trust, dark-pattern ban),
  `/frontend-developer`, `/backend-developer`, `/qa`, `/code-reviewer`
- Consulted specialists: `/sba-data-analyst` (data dictionaries, error registries, API contracts),
  `/trading-system-architect` (order engine, market data, VN-market compliance)

Domain glossary quick reference: **LEARN_MODE/FULL_ACCESS** (age-gate access levels),
**paper trading** (virtual-money simulation — the core product), **Tier/XP** (gamification levels),
**Reference market** (KR/Global data, delayed, no SLA), **Kinetic Drop** (V2.0 design language:
ink-black + lime + plasma).

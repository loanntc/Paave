# Paave v2.0 Native — Scope & Roadmap

> Owners: PM (roadmap) + BA (scope mapping) · Status: DRAFT for review · Date: 2026-07-06
> Source of truth for WHAT: FRD v2.2–2.4. This doc phases it; it does not re-specify it.

---

## Scope Principle

The FRD is approved — v2.0 native scope = FRD scope, phased. The BA runs a **mobile-delta pass**
per module at each milestone start: screens/flows that changed shape moving from web-spec to
native (navigation patterns, permissions, offline states) get FRD evolution-log updates, never
silent reinterpretation.

## Milestones

### M0 — Foundations & Spikes (2 weeks)

```
GOAL: kill the two biggest unknowns; stand up the build skeleton
- Spike R-01: VN market data vendor matrix (cost, latency, licensing, sandbox) → recommendation
- Spike R-02: Zalo OAuth end-to-end on device build → go/no-go for M1 scope
- Monorepo restructure (apps/mobile, packages/tokens|types|core)
- Expo app scaffold + CI (lint, type-check, test, build) + EAS pipeline + Sentry
- Token export pipeline: design-system.md tokens → packages/tokens → native theme
- SBA: data dictionary + error registry started for engine entities (orders, positions, balances)
EXIT GATE: data-vendor recommendation accepted; CI green on scaffold; tokens render in a
           sample screen; store accounts + signing working (internal build on both platforms)
```

### M1 — Auth, Onboarding & Gates (4 weeks)

```
SCOPE (FRD): FR-01..FR-08.2 (onboarding incl. industrial prefs + investment goal),
             FR-04.1/05.x multi-method signup (email, Google, Apple, Zalo*),
             Module A Age Gate (FR-AGE-01..04), Module G language (VN/EN/KR),
             Module H consent + disclaimer acceptance records
             (*Zalo contingent on M0 spike — fallback per R-02)
TEAM FLOW: BA mobile-delta pass → Designer flows+screens (all states) → FE build →
           review → QA suite from FRD acceptance criteria
EXIT GATE: new user completes signup→age-gate→personalization→home on both platforms;
           all 4 auth methods (or approved fallback set) pass QA incl. account-linking FR-05.5;
           i18n switching live; crash-free ≥ 99.5% in internal beta
```

### M2 — Paper Trading Core (6 weeks) — THE PILLAR

```
SCOPE (FRD): Module B engine (FR-PT-01..06) server-side per SRD-order-engine-v2.3,
             Stock Detail (FR-23..29) with real-time chart,
             Portfolio (FR-30..35) with P&L,
             Markets VN primary (FR-36..41; KR/Global reference-only surfaces)
CONSULTS: Trading Architect reviews engine design + every money-path PR;
          SBA delivers dictionary/registry/enums BEFORE build starts
EXIT GATE: user finds a stock → places market + limit paper orders → sees fills, positions,
           P&L — decimal-exact, reconciled nightly, audited per transition;
           chart 60fps on device matrix; stale-data states verified;
           engine test matrix (state machine, precision, concurrency, idempotency) 100% pass
```

### M3 — Engagement Layer (4 weeks)

```
SCOPE (FRD): Home (FR-09..14), Discover with preference-weighted ranking (FR-15..22),
             Notifications incl. price alerts + primer pattern (FR-42..47),
             Gamification: XP, tiers, weekly challenges (FR-GAME-01..05)
NOTE: Designer's responsible-engagement rules apply hardest here — challenge/XP mechanics
      reward learning behavior, never trade frequency (dark-pattern ban)
EXIT GATE: retention loop demo: notification → open → home → discover → trade;
           push opt-in ≥ 40% in beta cohort; gamification passes the responsible-engagement review
```

### M4 — Intelligence & Social (4 weeks)

```
SCOPE (FRD): AI Insights P0: post-trade insight cards + NL stock queries (FR-AI-01..03),
             Social Trading P1: follow traders, per-ticker feeds, trade receipts (FR-SOC-01..05),
             Account incl. Linked Providers panel (FR-48..53), Legal surfaces complete (Module H)
NOTE: AI surfaces follow the education-vs-advice boundary (designer + legal review);
      AI answers carry disclaimers + confidence framing per product-designer skill
EXIT GATE: AI card renders for every closed trade with correct data; social feed RLS-verified
           (no data leakage between users); full FRD traceability matrix green for GA scope
```

### GA — Hardening & Launch (2 weeks)

```
- Full regression + device matrix + accessibility audit (WCAG AA equivalent for mobile)
- Performance budget verification against 02-mobile-architecture.md table
- Store submission package: screenshots, age rating, finance-app disclosures, privacy labels
  (pre-review checklist per R-03)
- Beta cohort (TestFlight/Play internal → closed beta) with success-metric dashboards live
EXIT GATE: PM Definition of Done (project level) + stakeholder sign-off; store approval
```

## Post-GA (committed direction, not GA scope)

- Module I Brokerage Partner Integration (V1.x path per FRD)
- AI Insights P1 (weekly health check, nudges), leaderboard v2, deferred social surfaces

## Timeline Summary

```
M0 ██ (2w)
M1 ████ (4w)
M2 ██████ (6w)          total ≈ 22 weeks to GA
M3 ████ (4w)            (parallelization inside milestones per team-workflow;
M4 ████ (4w)             timeline assumes current team, no scope adds)
GA ██ (2w)
```

**Scope-change rule:** any addition displaces something — PM's Scope Change Protocol applies;
the FRD evolution log records every accepted change.

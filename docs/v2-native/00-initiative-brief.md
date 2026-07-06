# Paave v2.0 Native App — Initiative Brief

> Owner: Project Manager · Status: KICKOFF · Date: 2026-07-06
> Inputs: BRD v2.2, FRD v2.2–2.4 (16 modules), Design System V2.0 "Kinetic Drop", Next.js web prototype (v1)

---

## Problem Statement

Paave v1 is a Next.js web prototype. The product defined by the FRD — a paper-trading and social
investing app for Vietnamese Gen Z — is a **mobile-native product**: real-time price streaming,
push-notification nudges, OAuth-native signup (Google/Apple/Zalo), haptic trade confirmation, and
daily-habit surfaces all demand a native app. Gen Z VN users live on mobile; a web prototype cannot
deliver the retention loops (notifications, widgets, streaks) the FRD's gamification and
paper-trading engine depend on.

## Initiative in One Sentence

Build the Paave v2.0 native mobile app (iOS + Android) implementing the approved FRD v2.x scope,
using the V2.0 "Kinetic Drop" design system, with the existing Supabase backend evolved to serve it.

## Success Criteria (measurable)

| Goal | Metric | Target at v2.0 GA + 90 days |
|------|--------|------------------------------|
| Activation | Signup → first paper trade | ≥ 45% within 24h |
| Habit | D7 retention | ≥ 35% |
| Core engagement | Paper trades per weekly-active user | ≥ 3/week |
| Quality | Crash-free sessions | ≥ 99.7% |
| Performance | Cold start → interactive home | ≤ 1.8s on iPhone 12 |
| Store | App Store rating | ≥ 4.5 |

## Constraints

- **Regulatory:** Paave is unlicensed and handles no real funds — paper trading only; real trading
  via licensed brokerage partners (FRD Module I). Age gate is mandatory (Module A). All investing
  disclaimers per Module H.
- **Market:** VN-first (HOSE/HNX real-time); KR/Global reference-only, no SLA.
- **Team:** Existing team skills are TypeScript/React — tech stack decision must account for this
  (see `01-tech-stack-decision.md`).
- **Design:** V2.0 Kinetic Drop system is production-ready and must be the single source of visual truth.
- **Languages:** VN default, EN + KR supported (Module G).

## Explicitly Out of Scope for v2.0 GA

- Real-money trading inside Paave (partner handoff only, Module I is V1.x phased)
- KR-localized marketing/community; additional OAuth providers (Facebook/Kakao/Line/Naver)
- Copy trading, public portfolio sharing, Morning Call AI briefing (deferred V2+ per FRD)
- Web app feature parity — the web prototype freezes; mobile is the product

---

## RAID Log (initial)

### Risks

| ID | Risk | L | I | Score | Owner | Mitigation |
|----|------|---|---|-------|-------|------------|
| R-01 | VN real-time market data feed (HOSE/HNX) — licensing, cost, and latency unknown | H | H | 9 | PM + Trading Architect | Spike in M0: source options (SSI FastConnect, DNSE, TCBS APIs, vendor feeds), cost sheet, sandbox access before M1 commit |
| R-02 | Zalo OAuth — less-documented provider, App review friction | M | H | 6 | BE | M0 spike: end-to-end Zalo OAuth on device builds; fallback plan = launch VN with email+Google+Apple, fast-follow Zalo |
| R-03 | Apple App Store review: finance app + simulated trading + minors | M | H | 6 | PM | Pre-review checklist: age gate prominent, paper-trading disclaimers, no real-money implication in store copy; legal review of screenshots |
| R-04 | Team is TypeScript/React-first; **Swift/SwiftUI is a new competency** (per ADR-001 rev 2) | H | M | 6 | iOS Lead | ios-developer skill added to agent team; M1 biased toward simpler screens during ramp; SwiftUI pairing with FE dev for design-system fidelity; external Swift review for M2 engine UI |
| R-05 | Real-time chart performance under live tick streams | L | M | 3 | iOS | Performance budget from day 1 (see architecture doc); Swift Charts first, custom renderer only if measured need; Instruments profiling per milestone |
| R-08 | **iOS-first defers mid-tier Android users — a large share of the VN Gen-Z primary persona** | H | M | 6 | PM + Owner | Accepted trade-off (owner decision); Android go/no-go clock starts at GA; web prototype remains reachable for Android users in the interim; measure Android demand signals (waitlist) from launch |
| R-06 | Paper-trading engine correctness (fills, P&L) erodes trust if wrong | L | H | 6 | Trading Architect | Engine rules from SRD-order-engine-v2.3; decimal-exact money tests; QA reconciliation suite |
| R-07 | Push notification opt-in rates gate the retention model | M | M | 4 | Designer + PM | Pre-permission primer screens; contextual ask after first trade, not at launch |

### Assumptions (to validate in M0)

| ID | Assumption | Validated? | If wrong |
|----|-----------|-----------|----------|
| A-01 | A licensed VN market-data source is obtainable at startup-viable cost | No | Delayed-data MVP (15-min) for paper trading; real-time becomes V2.1 |
| A-02 | Supabase (auth, Postgres, realtime) scales to v2.0 targets | No | Introduce dedicated API layer earlier (already planned at M2) |
| A-03 | Existing FRD screens map 1:1 to mobile without major re-spec | Partial | BA runs mobile-delta pass per module in each milestone |

### Dependencies

| ID | Dependency | From → To | Needed by |
|----|-----------|-----------|-----------|
| D-01 | Market data source contract + sandbox | PM → all | End of M0 |
| D-02 | Apple/Google/Zalo developer accounts + certs | PM → FE/BE | M1 start |
| D-03 | Design tokens exported to native format | Designer → FE | M1 start |
| D-04 | Data dictionary + error registry for engine entities | SBA → BE/QA | M2 start |

---

## Milestone Overview (detail in 03-scope-and-roadmap.md)

```
M0  Foundations & Spikes      (2 wk)  — data-feed spike, Zalo spike, repo scaffold, CI, tokens
M1  Auth & Onboarding         (4 wk)  — FR-01..08.2, Age Gate module, language system
M2  Paper Trading Core        (6 wk)  — Module B engine + Stock Detail + Portfolio + Markets(VN)
M3  Engagement Layer          (4 wk)  — Home, Discover, Notifications, Gamification
M4  Intelligence & Social     (4 wk)  — AI Insights P0, Social Trading P1, Account, Legal
GA  Hardening & Launch        (2 wk)  — perf, accessibility, store submission, beta cohort
```

## Decision Log

| # | Decision | Status |
|---|----------|--------|
| 1 | Tech stack: **Swift/SwiftUI native iOS first; web stays React; no React Native** (ADR-001 rev 2) | **DECIDED — product owner, 2026-07-06** |
| 2 | Android: native Kotlin, go/no-go decision post-GA (market-coverage clock per R-08) | DECIDED (direction) |
| 3 | Web prototype freezes at v1; no parallel feature work | PROPOSED |
| 4 | Monorepo: iOS app joins this repo under `apps/ios` (see architecture) | PROPOSED |
| 5 | Design source: screen-specs v1.0 re-skinned on Kinetic Drop v2.0 tokens; owner updates docs, structure prepared now | IN PROGRESS |

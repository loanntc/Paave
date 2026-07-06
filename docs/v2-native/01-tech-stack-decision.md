# ADR-001 — Native App Tech Stack: React Native + Expo

> Owner: FE Lead + Trading System Architect · Status: PROPOSED (recommended) · Date: 2026-07-06

## Decision

Build Paave v2.0 as a **React Native app using Expo (managed workflow + EAS)**, TypeScript strict,
targeting iOS 16+ and Android 8+ (API 26).

## Context

- The product spec (FRD v2.x) requires: real-time price streaming, interactive charts, push
  notifications, OAuth (Google/Apple/Zalo), VN/EN/KR i18n, offline-tolerant portfolio views, and
  store distribution to a Gen-Z VN audience (predominantly mid-tier Android + recent iPhones).
- The team's entire frontend capability is TypeScript + React (per team skills and existing
  Next.js codebase). The design system is token-based and maps cleanly to a React Native theme.
- Speed to market matters more than per-platform fidelity for v2.0.

## Options Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **React Native + Expo (chosen)** | Team skills transfer 1:1 (TS/React); one codebase for iOS+Android; Expo EAS handles builds/signing/OTA updates; mature fintech precedent (Coinbase, Shopify, partial Robinhood); shared types with backend; Skia charting available | JS-bridge perf ceilings (mitigated by New Architecture/Fabric + Reanimated + Skia); some native modules need config plugins | **RECOMMENDED** |
| Flutter | Excellent chart/animation perf; single codebase | Discards 100% of team's React/TS skill base; Dart hiring pool in VN smaller; design-token pipeline redone | Rejected — team-fit cost too high |
| Native Swift + Kotlin | Maximum fidelity and performance | Two codebases, two skill sets the team lacks; ~2x cost and timeline | Rejected for v2.0 — revisit only if RN hits a measured perf wall |
| PWA / web wrapper | Cheapest | Push/perf/store-presence limitations kill the retention model; fails the FRD's mobile-native requirements | Rejected |

## Core Stack (locked once ADR is accepted)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React Native (New Architecture) + **Expo SDK** (managed + EAS Build/Submit/Update) | OTA updates for non-native fixes |
| Language | TypeScript strict — no `any` (per frontend-developer skill) | Shared types package with backend |
| Navigation | **Expo Router** (file-based) | Mirrors Next.js App Router mental model the team knows |
| Server state | **TanStack Query** | Caching, retry, offline-tolerant reads |
| Client state | Zustand (minimal) | Only for genuinely client-local state |
| Real-time | WebSocket client → market-data gateway; Supabase Realtime for social/portfolio events | See architecture doc |
| Charts | **react-native-skia** based charting (victory-native-xl) | 60fps target on mid-tier Android; canvas-level control |
| Animation/haptics | Reanimated 3 + expo-haptics | Kinetic Drop motion language |
| Styling/tokens | Token-first theme (see design foundations); NativeWind acceptable if team prefers Tailwind ergonomics | Tokens are the contract, not the styling lib |
| Auth | Supabase Auth + expo-auth-session (Google/Apple); Zalo via native SDK config plugin | Apple Sign-In mandatory on iOS when social login exists |
| Push | Expo Notifications → FCM/APNs | Pre-permission primer pattern |
| i18n | i18next + ICU messages; VN default, EN/KR | Module G; locale-appropriate financial terms |
| Storage | expo-secure-store (tokens), MMKV (cache) | No secrets in AsyncStorage |
| Testing | Jest + React Native Testing Library (unit/comp); **Maestro** (E2E flows); device cloud for matrix | Per QA strategy doc |
| Observability | Sentry (crashes + performance), analytics per Data spec | Crash-free ≥ 99.7% target |
| CI/CD | GitHub Actions: lint, type-check, test, build; EAS Build per PR-merged; TestFlight/Internal track per milestone | CI gate per team skills — no PR without green |

## Money & Data Correctness (non-negotiable, from backend/trading skills)

- All money/quantity values cross the wire as **strings or integer minor units**; parsed to
  decimal-safe utilities on device — **no JS float arithmetic on money** anywhere in the app.
- Prices carry source + timestamp; staleness is rendered visibly (per design foundations).

## Consequences

- Existing `components/ui` web components are NOT ported directly — patterns and tokens are
  reused, implementations are rebuilt native (see design foundations).
- The repo becomes a monorepo (see architecture doc) so mobile, web prototype, and shared
  packages (types, tokens, business logic) live together.
- One engineer owns the store/EAS pipeline from M0 to de-risk the team's native-tooling gap (R-04).

## Reversal Cost

Two-way door for the first two milestones (auth/onboarding screens are portable patterns);
becomes one-way after M2 when the trading engine UI and chart stack are deep. Decision review
checkpoint: end of M1.

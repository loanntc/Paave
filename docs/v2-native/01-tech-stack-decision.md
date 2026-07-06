# ADR-001 — Native App Tech Stack: Swift/SwiftUI, iOS First

> Owner: FE Lead + Trading System Architect · Status: ACCEPTED (per product owner direction) · Date: 2026-07-06 (rev 2)
> Supersedes: rev 1 (React Native + Expo proposal — rejected by product owner)

## Decision

1. Build Paave v2.0 as a **native iOS app in Swift + SwiftUI**, iOS first.
2. The **web app stays React** (existing Next.js codebase) — no React Native anywhere.
3. Android is a **post-GA decision**: native Kotlin when iOS validates the product (tracked as a
   deferred one-way-door decision — no code shared with iOS by design, so nothing blocks it).

## Context

- Product owner direction: iOS-first native quality; the existing design
  (`docs/design/screen-specs.md`) is already specified on an iPhone 14 Pro canvas (393×852)
  with exact layout values — it maps 1:1 to a native iOS build.
- The FRD requires real-time streaming, charts, push, OAuth (Apple/Google/Zalo), VN/EN/KR i18n.
- iOS gets the strongest native support for the trust-critical surfaces: Sign in with Apple,
  Keychain, App Attest, SMS OTP autofill, HIG-native confirmation patterns.

## Core Stack (locked)

| Layer | Choice | Notes |
|-------|--------|-------|
| Language | **Swift 5.10+**, strict concurrency | Swift 6 mode adopted when tooling stabilizes |
| UI | **SwiftUI** (UIKit interop where needed: charts, complex gestures) | Deployment target **iOS 16** |
| Architecture | **MVVM + Swift Concurrency (async/await, AsyncSequence)** | Feature-modular via Swift Package Manager; TCA rejected for team learning-curve cost |
| Navigation | NavigationStack + router per feature module | Deep links for notifications |
| Networking | URLSession + async/await; **URLSessionWebSocketTask** for market data | Typed client generated from OpenAPI (see contracts below) |
| Backend | Existing Supabase (auth/Postgres/realtime) via **supabase-swift**; trading engine API per architecture doc | Server-authoritative engine unchanged |
| Money | **Foundation `Decimal`** everywhere; amounts cross the wire as strings | No `Double` on money — enforced by lint rule + review checklist |
| Charts | Swift Charts for v2.0 line/area; custom Canvas/Metal renderer only if candlestick perf demands it (measured first) | 60fps ProMotion-aware |
| Auth | Sign in with Apple (native), GoogleSignIn SDK, Zalo iOS SDK, email/password via Supabase | Apple Sign-In is mandatory on iOS given social login exists |
| Push | APNs via UNUserNotificationCenter; pre-permission primer pattern | Rich notifications for price alerts |
| i18n | **String Catalogs** (VN default, EN, KR); ICU plurals; locale-aware currency/number formatting | Module G |
| Storage | Keychain (tokens), SwiftData/CoreData for offline cache | No secrets in UserDefaults |
| Design tokens | `packages/tokens` JSON → generated Swift constants + asset catalog (see design foundations) | Zero raw hex/pt in views |
| Testing | **Swift Testing** (unit), XCTest where needed, **XCUITest** (E2E flows), snapshot tests for screen states | Per test strategy doc |
| Observability | Sentry (crash + performance) or Crashlytics — pick in M0 spike; OSLog structured logging | Crash-free ≥ 99.7% target |
| CI/CD | GitHub Actions (lint via SwiftLint/SwiftFormat, build, test) + **fastlane → TestFlight**; Xcode Cloud evaluated in M0 | CI gate before PR per team rules |

## Shared Contracts (how web/React, iOS/Swift, and backend stay in sync)

Swift cannot consume TypeScript types. The contract layer becomes language-neutral:

```
packages/contracts/           # OpenAPI 3.1 spec — THE source of truth for the API
  ├── openapi.yaml            # authored/reviewed by SBA + BE (contract-first, unchanged rule)
  ├── → generates TS client   # for web (apps/web) and any Node tooling
  └── → generates Swift client# via swift-openapi-generator into the iOS app
packages/tokens/              # design tokens JSON → Tailwind config (web) + Swift constants (iOS)
```

Enum values, error codes (registry), and field semantics live in the OpenAPI spec + SBA data
dictionary — never duplicated by hand in either client.

## Consequences

- **Team capability gap (now the top delivery risk):** the team is TypeScript/React; Swift/SwiftUI
  is a new competency. Mitigations: add an iOS developer capability to the agent team
  (`ios-developer` skill), bias M1 toward simpler screens while ramping, pair iOS work with the
  existing FE developer for design-system fidelity. RAID R-04 rewritten accordingly.
- Business logic is NOT shared with the web app — engine and rules stay server-side (already the
  architecture), so the duplication surface is thin UI logic only.
- Android timeline decouples: no compromise on iOS to keep parity with a framework.
- The existing `screen-specs.md` px canvas converts to pt (1:1 at @3x design scale) — the specs
  are directly buildable.

## Reversal Cost

One-way door for the iOS codebase once M2 (trading core) is built in SwiftUI. The React-web and
server-side-engine decisions are unaffected either way. Review checkpoint: end of M1 (as before).

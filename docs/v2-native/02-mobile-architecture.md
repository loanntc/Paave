# Paave v2.0 — Mobile & System Architecture (iOS-first)

> Owners: Backend Developer + Trading System Architect + iOS Lead · Status: DRAFT for review · Date: 2026-07-06 (rev 2)
> Depends on: ADR-001 rev 2 (Swift/SwiftUI, iOS first; web stays React)

---

## 1. Repository Layout (monorepo)

```
Paave/
├── apps/
│   ├── ios/                       # Xcode project — Paave iOS (v2.0, THE product)
│   │   ├── Paave/                 # app target: entry, root navigation, DI
│   │   └── Packages/              # local SwiftPM modules:
│   │       ├── DesignSystem/      #   tokens (generated), typography, components
│   │       ├── PaaveCore/         #   Decimal money utils, formatters, validation
│   │       ├── PaaveAPI/          #   generated OpenAPI client + WS client
│   │       ├── FeatureOnboarding/ #   one module per feature slice (see map)
│   │       ├── FeatureTrading/
│   │       └── ...
│   └── web/                       # existing Next.js prototype (React — frozen at v1)
├── packages/
│   ├── contracts/                 # OpenAPI 3.1 spec — source of truth for the API
│   │                              #   → generates Swift client (swift-openapi-generator)
│   │                              #   → generates TS client (web/tooling)
│   ├── tokens/                    # design tokens JSON → Swift constants + Tailwind config
│   └── types/                     # TS-only types for web/tooling (derived from contracts)
├── supabase/                      # migrations, RLS policies, edge functions
├── docs/                          # BRD/FRD/SRD + this package
└── skills/                        # agent team
```

**Module dependency rule (mirrors the FE layering rule, in Swift):**
`DesignSystem → PaaveCore → PaaveAPI → Feature* → App target` — feature modules never import
each other; shared logic is promoted down. Enforced by SPM target dependencies (the compiler is
the lint rule).

## 2. Feature Map (FRD module → SwiftPM feature module)

| FRD Module | Module | Milestone |
|------------|--------|-----------|
| FR-01..08.2 Onboarding + signup | `FeatureOnboarding`, `FeatureAuth` | M1 |
| Module A Age Gate | `FeatureAgeGate` | M1 |
| Module G Language | String Catalogs + `PaaveCore` locale utils | M1 |
| Module B Paper Trading Engine (client) | `FeatureTrading` | M2 |
| FR-23..29 Stock Detail | `FeatureStockDetail` | M2 |
| FR-30..35 Portfolio | `FeaturePortfolio` | M2 |
| FR-36..41 Markets | `FeatureMarkets` | M2 |
| FR-09..14 Home | `FeatureHome` | M3 |
| FR-15..22 Discover | `FeatureDiscover` | M3 |
| FR-42..47 Notifications | `FeatureNotifications` | M3 |
| Module C Gamification | `FeatureGamification` | M3 |
| Module D AI Insights P0 | `FeatureAIInsights` | M4 |
| Module F Social Trading P1 | `FeatureSocial` | M4 |
| FR-48..53 Account | `FeatureAccount` | M4 |
| Module H Legal | `FeatureLegal` (+ inline surfaces) | M4 (copy from M1) |
| Module I Brokerage (V1.x) | `FeatureBrokerageHandoff` | post-GA |

## 3. System Topology

```
┌────────────── iOS APP (Swift/SwiftUI) ─────────────┐
│ Feature modules → ViewModels (async/await)          │
│   → PaaveAPI (generated REST client)                │
│   → WS client (URLSessionWebSocketTask, market data)│
│   → supabase-swift (auth, realtime social events)   │
└───────┬───────────────┬────────────────┬────────────┘
        │ HTTPS REST    │ WSS            │ Supabase proto
┌───────▼───────┐ ┌─────▼──────────┐ ┌───▼──────────────┐
│ API layer     │ │ Market Data    │ │ Supabase          │
│ (Supabase Edge│ │ Gateway        │ │  - Auth (4 methods)│
│  Functions →  │ │  - feed adapter│ │  - Postgres + RLS │
│  service as   │ │    (HOSE/HNX   │ │  - Realtime (social│
│  it grows)    │ │    vendor TBD  │ │    feed, XP events)│
│  - trading    │ │    per R-01)   │ │  - Storage (avatars)│
│    engine API │ │  - throttle/   │ └───────────────────┘
│  - AI insights│ │    fanout      │
│  - social API │ │  - staleness   │
└───────┬───────┘ │    stamping    │
        │         └────────────────┘
┌───────▼─────────────────────────────┐
│ Postgres (Supabase)                 │
│  orders / executions / positions /  │
│  balances (ledger) / users / social │
│  — decimal types, append-only where │
│    money moves                      │
└─────────────────────────────────────┘
```

The web React app (frozen v1) talks to the same API/contracts — nothing server-side is iOS-specific.

## 4. Paper Trading Engine (Module B — the spine)

Unchanged by the client-stack decision (server-authoritative by design):

- **All order validation, fills, and P&L computed server-side** per SRD-order-engine-v2.3 —
  the iOS app renders engine state, never computes it.
- **Order state machine** with audited transitions (who/when/price source + timestamps).
- **Ledger discipline**: virtual cash as append-only entries; positions derived + reconciled
  nightly; `DECIMAL` end-to-end; amounts serialized as strings.
- **Idempotency**: order submits carry an idempotency key — double-tap returns the original
  order (client generates the key per ticket, not per tap).
- **Price integrity**: fills record quote source + exchange/receive timestamps; stale-quote
  threshold blocks fills with a registered error code.

**iOS-side money rule:** `Decimal` only (parsing the wire strings); `Double` on any money or
quantity value is a review blocker. Formatting via `Decimal.FormatStyle.Currency` with VND rules.

## 5. Real-Time Market Data Path

- Gateway normalizes the VN feed (vendor per R-01), stamps staleness, fans out over WSS.
- iOS subscribes per visible ticker (subscription set follows navigation focus / `scenePhase`);
  UI updates batched via AsyncSequence throttling (~4 Hz list surfaces; chart at feed rate).
- App lifecycle: WS torn down on background, resumed + re-synced on foreground — positions and
  quotes re-fetched before the socket resumes to avoid gap-blindness.
- Degraded mode: reconnect with backoff; UI flips to "delayed" badge (staleness always visible).
  KR/Global reference data polled REST, labeled Reference.

## 6. Security & Compliance Baseline (iOS)

- Tokens in **Keychain** (`kSecAttrAccessibleWhenUnlockedThisDeviceOnly`); session refresh via
  supabase-swift; no PII in logs (OSLog privacy annotations enforced).
- **App Attest / DeviceCheck** evaluated in M0 for engine-API request integrity.
- RLS on every table (unchanged); age gate server-enforced — LEARN_MODE/FULL_ACCESS is a
  server-side claim the engine checks, never a client flag.
- Disclaimers (Module H) rendered from versioned server content with acceptance records.
- ATS strict (TLS 1.2+, no exceptions); certificate pinning decision at M2 (one-way-door review).
- Privacy manifest (`PrivacyInfo.xcprivacy`) + App Store privacy labels maintained from M0 —
  finance-app review scrutiny (R-03) makes this a first-class artifact.

## 7. Performance Budgets

| Surface | Budget |
|---------|--------|
| Cold start → interactive Home | ≤ 1.8s on iPhone 12 (oldest broadly-used target device) |
| Chart pan/zoom | 60fps sustained (120 on ProMotion), zero visible hitches per interaction |
| List scroll (Discover/Markets) | No dropped frames with live ticks at 4 Hz |
| Order submit → confirmed state | ≤ 1.5s p95 (engine round-trip) |
| App size | ≤ 60 MB initial download without written justification |
| Memory | No unbounded growth from tick streams (verified per milestone with Instruments) |

## 8. Open Questions (blockers to resolve in M0)

1. **Market data vendor** (R-01) — unchanged, still the biggest unknown.
2. **Zalo iOS SDK** integration + App Review friction (R-02) — spike on a real device build.
3. Crash/observability vendor: Sentry vs Crashlytics — decide by SwiftUI-symbolication quality.
4. Xcode Cloud vs GitHub Actions + fastlane for build/TestFlight pipeline — decide by cost + queue time.
5. Design reconciliation: screen-specs v1.0 (V1 navy palette) vs design-system v2.0 Kinetic Drop
   tokens — Designer resolves before M1 build (see design foundations).

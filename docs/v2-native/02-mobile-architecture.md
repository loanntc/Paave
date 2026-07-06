# Paave v2.0 — Mobile & System Architecture

> Owners: Backend Developer + Trading System Architect + FE Lead · Status: DRAFT for review · Date: 2026-07-06
> Depends on: ADR-001 (React Native + Expo)

---

## 1. Repository Layout (monorepo)

```
Paave/
├── apps/
│   ├── mobile/                  # Expo app (v2.0 — THE product)
│   │   ├── app/                 # expo-router routes (mirrors FRD navigation)
│   │   ├── features/            # feature slices (see layering below)
│   │   ├── components/          # composed, feature-agnostic components
│   │   ├── ui/                  # primitives (Button, Card, Chip...)
│   │   └── tokens/              # generated from packages/tokens
│   └── web/                     # existing Next.js prototype (frozen at v1)
├── packages/
│   ├── tokens/                  # design tokens — single source (JSON) → native + web outputs
│   ├── types/                   # shared TS types: API contracts, entities, enums
│   └── core/                    # pure business logic: money math (decimal), P&L calc,
│                                #   order validation — platform-free, 100% unit-tested
├── supabase/                    # migrations, RLS policies, edge functions
├── docs/                        # (existing) BRD/FRD/SRD + this package
└── skills/                      # (existing) agent team
```

**Layering rule inside `apps/mobile` (per frontend-developer skill):**
`tokens → ui → components → features → app routes` — imports point down only, enforced by
ESLint boundaries in CI.

## 2. Feature Map (FRD module → feature slice)

| FRD Module | Feature slice | Milestone |
|------------|--------------|-----------|
| FR-01..08.2 Onboarding + signup | `features/onboarding`, `features/auth` | M1 |
| Module A Age Gate | `features/age-gate` | M1 |
| Module G Language | `features/i18n` (+ app-wide) | M1 |
| Module B Paper Trading Engine | `features/trading` | M2 |
| FR-23..29 Stock Detail | `features/stock-detail` | M2 |
| FR-30..35 Portfolio | `features/portfolio` | M2 |
| FR-36..41 Markets (VN primary) | `features/markets` | M2 |
| FR-09..14 Home | `features/home` | M3 |
| FR-15..22 Discover | `features/discover` | M3 |
| FR-42..47 Notifications | `features/notifications` | M3 |
| Module C Gamification | `features/gamification` | M3 |
| Module D AI Insights P0 | `features/ai-insights` | M4 |
| Module F Social Trading P1 | `features/social` | M4 |
| FR-48..53 Account | `features/account` | M4 |
| Module H Legal | `features/legal` (+ inline surfaces) | M4 (copy from M1) |
| Module I Brokerage (V1.x) | `features/brokerage-handoff` | post-GA phase |

## 3. System Topology

```
┌─────────────── MOBILE APP (Expo RN) ───────────────┐
│ features → TanStack Query → API client (typed)     │
│          → WS client (market data)                 │
│          → Supabase client (auth, realtime social) │
└───────┬───────────────┬────────────────┬───────────┘
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
│    money moves (per BE skill)       │
└─────────────────────────────────────┘
```

## 4. Paper Trading Engine (Module B — the spine)

Per SRD-order-engine-v2.3 + trading-system-architect skill:

- **Server-authoritative**: all order validation, fills, and P&L computed server-side (edge
  function/service) — the app renders engine state, never computes it. No client-side fill logic.
- **Order state machine**: NEW → VALIDATED → FILLED/REJECTED (paper fills against last price with
  configurable slippage rule from SRD); every transition audited (who/when/price source + timestamp).
- **Ledger discipline**: virtual cash balance as append-only entries; positions derived and
  reconciled nightly against the entry log; `DECIMAL` end-to-end, amounts serialized as strings.
- **Idempotency**: client order submits carry an idempotency key; duplicate taps return the
  original order — no double fills from double-tap (a known mobile failure mode).
- **Price integrity**: every fill records the quote's source + exchange timestamp + receive
  timestamp; stale-quote threshold (from SRD) blocks fills with a registered error code.

## 5. Real-Time Market Data Path

- Gateway subscribes to the VN feed (vendor per R-01 spike), normalizes to internal tick schema
  (SBA data dictionary owns it), stamps staleness, and fans out over WSS.
- App subscribes per visible ticker only (subscription set follows navigation focus); batches UI
  updates at ~4 Hz for list surfaces, chart surface up to feed rate with Skia rendering.
- Degraded mode: on WS loss → exponential reconnect, UI flips to "delayed" badge (staleness is
  always visible — trust rule); reference markets (KR/Global) are polled REST, labeled Reference.

## 6. Security & Compliance Baseline

- Tokens in secure-store (Keychain/Keystore); session refresh per Supabase; no PII in logs.
- RLS on every table: users read their own orders/positions only; social surfaces expose
  explicitly-published fields only.
- Age gate server-enforced (not just UI): LEARN_MODE vs FULL_ACCESS is a server-side claim
  checked by the engine (Module A rules).
- All disclaimers (Module H) rendered from versioned server content with acceptance records
  (who accepted which version, when) — audit-ready.
- Certificate pinning evaluated at M2 (finance-app baseline); jailbreak/root detection decision
  logged as a one-way/two-way review.

## 7. Performance Budgets (CI-enforced where possible)

| Surface | Budget |
|---------|--------|
| Cold start → interactive Home | ≤ 2.5s mid-tier Android (Pixel 6a-class) |
| Chart pan/zoom | 60fps sustained, 1 dropped-frame budget per interaction |
| List scroll (Discover/Markets) | 60fps with virtualization; JS thread < 70% |
| Order submit → confirmed state | ≤ 1.5s p95 (engine round-trip) |
| OTA bundle size delta per release | ≤ +2 MB without written justification |

## 8. Open Questions (blockers to resolve in M0)

1. **Market data vendor** (R-01) — the single biggest unknown; spike owns a recommendation matrix.
2. Zalo OAuth on Expo — config plugin vs bare workflow escape hatch (R-02 spike).
3. Supabase Edge Functions vs dedicated Node service for the engine at M2 scale — decision by
   load-test result, not preference (A-02).

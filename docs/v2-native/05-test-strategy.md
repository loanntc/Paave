# Paave v2.0 Native — Test Strategy

> Owner: QA · Status: DRAFT for review · Date: 2026-07-06
> Inputs: FRD acceptance criteria, SRD-order-engine-v2.3, QA-test-cases v1.x (web — reused where behavior is unchanged)

---

## 1. Test Pyramid (mobile)

```
        Maestro E2E            ~15 critical journeys (signup→trade→portfolio, per milestone)
      ─────────────────
     Integration / API         engine API contract tests (every documented response),
                               Supabase RLS tests (cross-user access MUST fail)
    ─────────────────────
   Component (RN Testing Lib)  every screen: all states render; interactions fire correct events
  ───────────────────────────
 Unit (Jest)                   packages/core = 100% coverage target (money math, P&L,
                               order validation) — this layer is the trust foundation
```

## 2. What's Different from Web (mobile-specific coverage)

| Area | Test coverage |
|------|---------------|
| Permissions | Push/notification primer flows: grant, deny, deny-then-settings-grant |
| App lifecycle | Background/foreground mid-order-submit; kill during onboarding; state restoration |
| Network | Airplane mode on every money surface: stale badges shown, no phantom orders (idempotency verified) |
| OAuth | Each provider on real devices; account-linking FR-05.5 matrix (email↔Google↔Apple↔Zalo) |
| Deep links | Notification → correct screen with auth state respected |
| OTA updates | Update-mid-session behavior; rollback path |
| Devices | Matrix: iPhone SE/15, Pixel 6a-class mid-tier Android (primary persona device), small-screen 320pt equivalent |
| Locales | VN default + EN + KR: layout breakage, financial terminology, number/currency formats |

## 3. Paper Trading Engine Suite (from trading-architect test matrix)

- State machine: every legal + illegal transition asserted
- Money precision: decimal-exact assertions; float-error trap values; VND formatting
- Concurrency: double-tap submit (idempotency), parallel orders draining virtual balance —
  never negative
- Staleness: fills blocked on stale quotes with the exact registry error code
- Reconciliation: nightly position/ledger reconciliation job — injected mismatch is detected
- Audit: any order's story reconstructable from audit records alone

## 4. Milestone Gate Criteria (adds to team-workflow Stage 7 gates)

| Milestone | QA exit bar |
|-----------|-------------|
| M1 | Auth matrix 100% pass on device; age-gate server-enforcement verified (API bypass attempt fails); consent records audit-checked |
| M2 | Engine suite 100%; chart perf on device matrix; offline/stale coverage green |
| M3 | Notification matrix; gamification anti-dark-pattern checklist verified with Designer |
| M4 | RLS/social privacy suite (cross-user leakage = release blocker); AI disclaimer presence automated check |
| GA | Full regression + accessibility audit + performance budgets verified + store pre-review checklist |

## 5. Tooling & Process

- Jest + RN Testing Library in CI on every PR (per developer pre-PR gates)
- Maestro flows run on EAS builds nightly + before each milestone exit
- Crash triage: Sentry issues ≥ [High] filed as bugs within 24h with device/session context
- Test data: seeded Supabase test project; engine scenarios scripted (BE provides seeds per
  collaboration protocol)
- QA writes test cases from FRD acceptance criteria at each milestone START (Stage 2 of
  team-workflow) — gaps go back to BA as clarification requests before build

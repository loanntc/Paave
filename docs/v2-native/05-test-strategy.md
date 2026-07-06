# Paave v2.0 Native — Test Strategy

> Owner: QA · Status: DRAFT for review · Date: 2026-07-06
> Inputs: FRD acceptance criteria, SRD-order-engine-v2.3, QA-test-cases v1.x (web — reused where behavior is unchanged)

---

## 1. Test Pyramid (mobile)

```
        XCUITest E2E           ~15 critical journeys (signup→trade→portfolio, per milestone)
      ─────────────────
     Integration / API         engine API contract tests against the OpenAPI spec (every
                               documented response), Supabase RLS tests (cross-user MUST fail)
    ─────────────────────
   View/snapshot tests         every screen: all states render (snapshot per state incl.
                               VN/EN/KR + Dynamic Type XL); ViewModel interaction tests
  ───────────────────────────
 Unit (Swift Testing)          PaaveCore = 100% coverage target (Decimal money math, P&L,
                               formatters, validation) — this layer is the trust foundation
```

## 2. What's Different from Web (mobile-specific coverage)

| Area | Test coverage |
|------|---------------|
| Permissions | Push/notification primer flows: grant, deny, deny-then-settings-grant |
| App lifecycle | Background/foreground mid-order-submit; kill during onboarding; state restoration |
| Network | Airplane mode on every money surface: stale badges shown, no phantom orders (idempotency verified) |
| OAuth | Each provider on real devices; account-linking FR-05.5 matrix (email↔Google↔Apple↔Zalo) |
| Deep links | Notification → correct screen with auth state respected |
| Devices | Matrix: iPhone SE (small screen + slowest chip), iPhone 12 (oldest broad target), current iPhone; iOS 16/17/18 |
| Dynamic Type | Money surfaces verified at XL text size — no truncated amounts, ever |
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

- Swift Testing + snapshot tests in CI (macOS runners) on every PR (per developer pre-PR gates)
- XCUITest journeys run on simulator in CI nightly + on TestFlight builds before milestone exits
- Crash triage: crash-reporter issues ≥ [High] filed as bugs within 24h with device/session context
- Test data: seeded Supabase test project; engine scenarios scripted (BE provides seeds per
  collaboration protocol)
- QA writes test cases from FRD acceptance criteria at each milestone START (Stage 2 of
  team-workflow) — gaps go back to BA as clarification requests before build

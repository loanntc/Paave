# Review: Vibe-Trading Features — Task Tracking
Date: 2026-05-29 | Spec: `docs/business/vibe-trading-feature-analysis.md`

---

## P1 — Must Have (foundation tasks, blocks everything else)

| # | Task | Owner | Est | Status | Blocks |
|---|------|-------|-----|--------|--------|
| P1-01 | Extract fee/tax constants to `lib/constants/trading.ts` (BROKER_FEE_RATE, VSD_SELL_TAX_RATE, BOARD_LOT_HOSE) | BE | 1h | Todo | F1, F2, F3 |
| P1-02 | Build `lib/trading-calendar.ts`: `addTradingDays()`, `isT2SellAllowed()`, VN holiday list 2026–2027 | BE | 4h | Todo | F2, F3 |
| P1-03 | Build `lib/journal/roundtrip-calculator.ts`: FIFO cost basis stack, per-roundtrip PnL + holding_days, multi-lot sell support | BE | 8h | Todo | F1, F2 |
| P1-04 | Build VN broker CSV parsers: SSI, TCBS, VPS, VNDirect, Mirae Asset VN + generic auto-detect | BE | 12h | Todo | F1, F2 |
| P1-05 | Add `POST /api/journal/upload` endpoint: file validation, CSV parse, roundtrip calculation, store in `journal_roundtrips` | BE | 6h | Todo | F1, F2 |
| P1-06 | Add disposition_effect flag to `get-trade-analytics.ts`: compare avg_hold_winners vs avg_hold_losers | BE | 3h | Todo | F1 |
| P1-07 | Add chasing flag: detect buys within 3% of N-day high | BE | 3h | Todo | F1 |
| P1-08 | Create Supabase migration: `journal_uploads`, `journal_roundtrips` tables with RLS policies | BE (human review required) | 4h | Todo | F1, F2 |

---

## P1 — Feature 1: Trade Journal Analyzer

| # | Task | Owner | Est | Status |
|---|------|-------|-----|--------|
| F1-01 | `app/(app)/journal/page.tsx` — entry page with upload/results routing | FE | 3h | Todo |
| F1-02 | `journal-upload.tsx` — CSV dropzone, broker format selector, upload progress, error states | FE | 5h | Todo |
| F1-03 | `behavioral-scores.tsx` — score cards: win_rate, avg_hold, overtrading, discipline, fee_awareness | FE | 4h | Todo |
| F1-04 | `archetype-card.tsx` — archetype badge + plain-language explanation (VN + EN) | FE | 2h | Todo |
| F1-05 | `roundtrip-table.tsx` — paginated table: symbol, dates, hold days, PnL%, net PnL VND | FE | 4h | Todo |
| F1-06 | `disposition-effect-card.tsx`, `fomo-card.tsx`, `overtrading-card.tsx` — bias detail cards with evidence | FE | 5h | Todo |
| F1-07 | Empty state: < 5 roundtrips guided message | FE | 1h | Todo |
| F1-08 | Add "Journal" navigation entry point (under Portfolio tab as sub-tab) | FE | 2h | Todo |
| F1-09 | Unit tests: roundtrip-calculator (FIFO pairing, partial sell, same-symbol multi-lot) | BE | 4h | Todo |
| F1-10 | Unit tests: broker CSV parsers (each format, malformed input, missing columns) | BE | 4h | Todo |

**F1 Total estimate: ~50h**

---

## P1 — Feature 2: Shadow Account (after F1 complete)

| # | Task | Owner | Est | Status |
|---|------|-------|-----|--------|
| F2-01 | Supabase migration: `shadow_profiles`, `shadow_rules` tables | BE (human review) | 3h | Todo |
| F2-02 | `lib/shadow-account/extractor.ts` — mine 3-5 if-then rules from profitable roundtrips | BE | 12h | Todo |
| F2-03 | `lib/shadow-account/backtester.ts` — simulate rules against `symbol_day_bars` with T+2 + daily limits | BE | 12h | Todo |
| F2-04 | `lib/shadow-account/attribution.ts` — compute delta-PnL breakdown (5 buckets) | BE | 8h | Todo |
| F2-05 | `lib/shadow-account/renderer.ts` — HTML report (8 sections) | BE | 6h | Todo |
| F2-06 | API routes: `/api/shadow/extract`, `/api/shadow/backtest`, `/api/shadow/report`, `/api/shadow/signals` | BE | 6h | Todo |
| F2-07 | `app/(app)/shadow/page.tsx` + `shadow-setup.tsx` — requires F1 journal guard | FE | 3h | Todo |
| F2-08 | `shadow-profile.tsx` — rules in plain language | FE | 4h | Todo |
| F2-09 | `equity-curve.tsx` — shadow line vs. real line chart (Recharts) | FE | 5h | Todo |
| F2-10 | `attribution-chart.tsx` — waterfall: 5 delta-PnL buckets | FE | 5h | Todo |
| F2-11 | `counterfactual-list.tsx` + `signals-today.tsx` with disclaimer | FE | 4h | Todo |
| F2-12 | Age gate: 18+ only (FULL_ACCESS) — locked state for LEARN_MODE | FE | 2h | Todo |
| F2-13 | Unit tests: extractor, backtester, attribution | BE | 8h | Todo |

**F2 Total estimate: ~78h**

---

## P1 — Feature 3: Backtesting Engine

| # | Task | Owner | Est | Status |
|---|------|-------|-----|--------|
| F3-01 | Supabase migration: `backtest_runs` table | BE (human review) | 2h | Todo |
| F3-02 | `lib/backtest/engine.ts` — daily simulation loop (uses `symbol_day_bars`, T+2 guard, daily limits) | BE | 16h | Todo |
| F3-03 | `lib/backtest/metrics.ts` — Sharpe, max_drawdown, win_rate, profit_factor, equity_curve | BE | 6h | Todo |
| F3-04 | `lib/backtest/benchmark.ts` — VN-Index / VN30 comparison | BE | 4h | Todo |
| F3-05 | `lib/backtest/validation/monte-carlo.ts` | BE | 6h | Todo |
| F3-06 | `lib/backtest/validation/bootstrap.ts` | BE | 4h | Todo |
| F3-07 | `lib/backtest/validation/walk-forward.ts` | BE | 6h | Todo |
| F3-08 | `POST /api/backtest/run` + `POST /api/backtest/validate` | BE | 4h | Todo |
| F3-09 | `app/(app)/backtest/` — strategy builder form + results view | FE | 8h | Todo |
| F3-10 | `equity-curve.tsx` (shared with F2), `validation-panel.tsx`, `run-card.tsx` | FE | 6h | Todo |
| F3-11 | VND input component + board lot warning toast | FE | 2h | Todo |
| F3-12 | LEARN_MODE: read-only results, no save button | FE | 2h | Todo |
| F3-13 | Unit tests: engine (T+2 enforcement, daily limit clipping, FIFO cost, metrics) | BE | 8h | Todo |

**F3 Total estimate: ~74h**

---

## P2 — Feature 4: AI Research Workflow (improvements to existing)

| # | Task | Owner | Est | Status |
|---|------|-------|-----|--------|
| F4-01 | `lib/ai/agent.ts` — add `report_mode` flag; emit `[PLAN]` event before tools | BE | 4h | Todo |
| F4-02 | Add `data_as_of` + `source` + `confidence` fields to tool return types | BE | 3h | Todo |
| F4-03 | Supabase migration: `research_sessions` table for artifact persistence | BE (human review) | 2h | Todo |
| F4-04 | `POST /api/research/save` — persist session artifacts | BE | 3h | Todo |
| F4-05 | `components/research/research-report.tsx` — structured section renderer | FE | 5h | Todo |
| F4-06 | `evidence-tag.tsx` + `data-gap-badge.tsx` | FE | 2h | Todo |
| F4-07 | `research-disclaimer.tsx` — standardized disclaimer component (VN + EN) | FE | 1h | Todo |
| F4-08 | `artifact-history.tsx` — "Recent analyses" list | FE | 3h | Todo |

**F4 Total estimate: ~23h**

---

## P2 — Feature 7: Risk Analysis Suite

| # | Task | Owner | Est | Status |
|---|------|-------|-----|--------|
| F7-01 | `lib/risk/drawdown.ts` — top-5 drawdowns, frequency buckets, current distance from peak | BE | 6h | Todo |
| F7-02 | `lib/risk/tail-risk.ts` — VaR 95/99/99.9% (parametric + historical), CVaR | BE | 8h | Todo |
| F7-03 | `lib/risk/stress-test.ts` — VN 2008 crash, COVID March 2020, TPDN crisis 2022 scenarios | BE | 5h | Todo |
| F7-04 | `lib/risk/regime.ts` — bull/bear/sideways classification, historical analogs | BE | 6h | Todo |
| F7-05 | `GET /api/risk/[ticker]` + `POST /api/risk/portfolio` | BE | 4h | Todo |
| F7-06 | `risk-panel.tsx` in stock detail — drawdown chart, VaR cards, stress scenarios, regime badge | FE | 8h | Todo |
| F7-07 | `portfolio-risk-tab.tsx` — aggregate VaR, correlation matrix heatmap | FE | 6h | Todo |
| F7-08 | Unit tests: drawdown calc, VaR (parametric vs. historical), stress scenarios | BE | 6h | Todo |

**F7 Total estimate: ~49h**

---

## P2 — Feature 5: Investment Committee (after F4 stable)

| # | Task | Owner | Est | Status |
|---|------|-------|-----|--------|
| F5-01 | Design multi-agent prompt structure (bull/bear/risk/PM roles) for Paave VN context | BE | 4h | Todo |
| F5-02 | `lib/ai/committee/` — orchestrate 4 agents via parallel Claude API calls | BE | 12h | Todo |
| F5-03 | `POST /api/committee/[ticker]` | BE | 3h | Todo |
| F5-04 | `app/(app)/stock/[ticker]/committee-view.tsx` — bull/bear/risk/recommendation sections | FE | 8h | Todo |
| F5-05 | Age gate: FULL_ACCESS only; LEARN_MODE sees simplified 1-analyst summary | FE | 2h | Todo |
| F5-06 | LLM cost tracking per committee run (log to analytics) | BE | 2h | Todo |

**F5 Total estimate: ~31h**

---

## P2 — Shared Components

| # | Task | Owner | Est | Status |
|---|------|-------|-----|--------|
| SC-01 | Extract `VndInput` to shared component | FE | 2h | Todo |
| SC-02 | Build `PaginatedTable` generic component | FE | 4h | Todo |
| SC-03 | Build `MetricCard` generic component (label + value + delta) | FE | 2h | Todo |

---

## P3 — Can Defer

| # | Task | Owner | Est | Status |
|---|------|-------|-----|--------|
| P3-01 | Journal hash dedup — skip recompute on same SHA-1 upload | BE | 3h | Todo |
| P3-02 | Research session tagging + recall UI (FR-RW-08) | BE + FE | 6h | Todo |
| P3-03 | Feature 6: Quant Strategy Desk — full build | BE + FE | ~80h | Todo |

---

## Effort Summary

| Phase | Feature | BE | FE | Total |
|-------|---------|----|----|-------|
| Foundation | P1-01 to P1-08 | 41h | — | 41h |
| Sprint 1 | F1 Trade Journal | 8h | 26h | 34h (+ 9h tests) |
| Sprint 2 | F2 Shadow Account | 52h | 23h | 75h (+ 8h tests) |
| Sprint 3 | F3 Backtesting | 46h | 18h | 64h (+ 8h tests) |
| Sprint 4 | F4 Research Workflow | 10h | 11h | 21h (+ 2h tests) |
| Sprint 5 | F7 Risk Analysis | 31h | 14h | 45h (+ 6h tests) |
| Sprint 6 | F5 Investment Committee | 21h | 10h | 31h |
| Shared components | SC-01 to SC-03 | — | 8h | 8h |
| **Total** | | **209h** | **110h** | **~319h** |

> Estimates assume one developer per lane (BE and FE). Parallelizable after foundation (P1-01 to P1-08) is complete.
> F6 (Quant Strategy Desk) not estimated — defer to roadmap review after F3 ships.

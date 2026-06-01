# Review: Vibe-Trading Feature Analysis — Overview
Date: 2026-05-29 | Spec: `docs/business/vibe-trading-feature-analysis.md` | Branch: `docs/f0-learning-v2`

---

## Summary

The spec defines **7 features** extracted from Vibe-Trading v0.1.8 for potential implementation in Paave.
Review compared every FR and shared-infrastructure item against the current Paave codebase (585 TypeScript files, Next.js 16 + Supabase).

| Feature | Spec FRs | Implemented | Partial | Missing | Status |
|---------|----------|-------------|---------|---------|--------|
| F1 — Trade Journal Analyzer | 8 | 3 | 2 | 3 | ⚠️ Partial |
| F2 — Shadow Account | 9 | 0 | 0 | 9 | ❌ Not started |
| F3 — Backtesting Engine | 12 | 0 | 0 | 12 | ❌ Not started |
| F4 — AI Research Workflow | 8 | 2 | 4 | 2 | ⚠️ Partial |
| F5 — Investment Committee | 8 | 0 | 0 | 8 | ❌ Not started |
| F6 — Quant Strategy Desk | 9 | 0 | 0 | 9 | ❌ Not started |
| F7 — Risk Analysis Suite | 10 | 0 | 0 | 10 | ❌ Not started |
| **Shared Infrastructure** | **7** | **2** | **2** | **3** | ⚠️ Partial |

**Total: 5 FRs fully covered, 8 partial, 56 missing across 64 spec items.**

---

## Gap Table

| Feature | Spec FR | Code | Gap | Priority |
|---------|---------|------|-----|----------|
| F1 Trade Journal | FR-TJ-01 CSV upload | ❌ | No broker CSV upload endpoint — analytics only read internal DB (paper trades) | P1 |
| F1 Trade Journal | FR-TJ-02 Parse trade rows | ❌ | No CSV parser for SSI/TCBS/VPS/VNDirect/Mirae formats | P1 |
| F1 Trade Journal | FR-TJ-03 Roundtrip calc | ⚠️ | FIFO pairing exists in `get-trade-analytics.ts` but no `realized_pnl` per roundtrip, no holding_days per pair | P1 |
| F1 Trade Journal | FR-TJ-04 Metrics | ✅ | win_rate, avg_hold_days, fee_burn_pct, trades_per_week — all present | — |
| F1 Trade Journal | FR-TJ-05 Bias detection | ⚠️ | overtrading + FOMO + loss_averse archetypes exist; **disposition_effect flag missing**, chasing flag missing, anchoring flag missing | P1 |
| F1 Trade Journal | FR-TJ-06 Min roundtrips | ❌ | No guard — returns `null` for win_rate silently when no sells | P2 |
| F1 Trade Journal | FR-TJ-07 Structured JSON | ✅ | Tool returns structured JSON | — |
| F1 Trade Journal | FR-TJ-08 Journal hash | ❌ | No dedup / journal_hash — re-runs always recompute | P2 |
| F2 Shadow Account | FR-SA-01…09 | ❌ | Entire feature absent | P1 |
| F3 Backtesting | FR-BT-01…12 | ❌ | Entire feature absent | P1 |
| F4 Research | FR-RW-01 Plan step | ⚠️ | Agent uses ReAct loop (implicit planning) but no explicit plan output to user | P2 |
| F4 Research | FR-RW-02 Grounding | ✅ | get_stock_bars, get_stock_fundamentals, get_stock_news, get_stock_quote all present | — |
| F4 Research | FR-RW-03 Execute tools | ⚠️ | Tools execute correctly; no multi-skill pipeline (no skill chaining or parallel execution) | P2 |
| F4 Research | FR-RW-04 Validate + metadata | ❌ | No evidence quality tagging; no data gap labeling | P2 |
| F4 Research | FR-RW-05 Structured report | ❌ | Agent returns text stream only; no structured markdown report with sections | P2 |
| F4 Research | FR-RW-06 Artifact storage | ❌ | No artifact persistence (stateless per-request) | P2 |
| F4 Research | FR-RW-07 Data gap marking | ⚠️ | System prompt instructs Claude not to fabricate; no enforced structured gap flag | P2 |
| F4 Research | FR-RW-08 Session tagging | ❌ | No session ID for research recall | P3 |
| F5 Investment Committee | FR-IC-01…08 | ❌ | Entire feature absent | P2 |
| F6 Quant Strategy Desk | FR-QD-01…09 | ❌ | Entire feature absent | P2 |
| F7 Risk Analysis | FR-RA-01…10 | ❌ | Entire feature absent | P2 |
| Shared — CSV Parser | — | ❌ | No broker CSV parsers for any VN format | P1 |
| Shared — OHLCV Loader | — | ✅ | `symbol_day_bars` Supabase table + `get_stock_bars` tool — fully functional | — |
| Shared — VN Calendar | — | ⚠️ | `market-status.ts` covers trading hours; **T+2 trading-day calculator missing**, holiday calendar missing | P1 |
| Shared — Cost Model | — | ✅ | `BROKER_FEE_RATE=0.0025`, `VSD_TAX_RATE=0.001` in `api/trade/route.ts` — correct | — |
| Shared — Report Renderer | — | ❌ | No HTML/PDF report generation | P2 |
| Shared — Artifact Store | — | ❌ | No Supabase table or storage bucket for analysis artifacts | P2 |
| Shared — Disclaimer | — | ⚠️ | Present in AI system prompt; no standardized disclaimer component for non-chat surfaces | P3 |

---

## Key Findings

### What's already built (save effort)
1. **Trade analytics engine** (`get-trade-analytics.ts`) — win rate, hold time, overtrading score, fee burn, archetype — covers ~60% of FR-TJ-04/05. Extend rather than rebuild.
2. **Daily OHLCV data** — `symbol_day_bars` table + `get_stock_bars` tool — solid foundation for backtesting and risk analysis. No data source work needed.
3. **Cost model** — Fee 0.25% + VSD sell tax 0.1% already implemented and correct in `api/trade/route.ts`. Extract to shared constant for reuse across backtesting and shadow account.
4. **AI agent ReAct loop** — `lib/ai/agent.ts` with 6 tools. Foundation for F4 (Research Workflow) and future F5 (Investment Committee). Extend tool set rather than rebuild agent.
5. **Paper trade DB schema** — `virtual_trades`, `virtual_holdings`, `virtual_sub_accounts` — used by F1, F2, F4.

### Critical gaps blocking highest-priority features
1. **VN broker CSV parser** (blocks F1 CSV upload, F2 Shadow Account) — no code exists.
2. **Roundtrip/closed-trade calculator** (blocks F1 complete metrics, F2 pattern extraction) — current pairing is too simple (no FIFO stack, no multi-lot tracking).
3. **T+2 trading-day calculator** (blocks F3 Backtesting, F2 Shadow Account) — `market-status.ts` only shows today's status, not a proper calendar with holiday awareness.
4. **Disposition effect detection** (blocks F1 complete bias analysis) — not in current archetype logic.

---

## Priority Summary

| Priority | Count | Items |
|----------|-------|-------|
| P0 Blocker | 0 | — (no release-blocking issues in existing features) |
| P1 Must-have | 8 | CSV parser, roundtrip calc, T+2 calendar, disposition effect, F2 Shadow Account core, F3 Backtesting core |
| P2 Should-have | 14 | Research pipeline improvements, artifact store, report renderer, F5/F6/F7 |
| P3 Can defer | 3 | Session tagging, disclaimer component, journal hash dedup |

# Review: Vibe-Trading Features — Backend Analysis
Date: 2026-05-29 | Spec: `docs/business/vibe-trading-feature-analysis.md`

---

## Existing BE Assets

| File | What it does | Reuse for |
|------|-------------|-----------|
| `app/api/trade/route.ts` | Paper trade POST — fee+tax calc, holdings upsert, balance update | Cost model constants → extract to `lib/constants/trading.ts` |
| `lib/ai/tools/get-trade-analytics.ts` | 90-day behavioral analytics: win_rate, hold time, archetype | F1 base — extend with disposition_effect, chasing, anchoring |
| `lib/ai/tools/get-stock-bars.ts` | Daily OHLCV from `symbol_day_bars` (up to 365 days) | F3 Backtesting data input, F7 Risk Analysis |
| `lib/ai/tools/get-stock-fundamentals.ts` | PE, PB, ROE, market cap per symbol | F4 Research Workflow, F6 Quant Desk screener |
| `lib/ai/tools/get-stock-news.ts` | Recent news headlines | F4 Research grounding |
| `lib/ai/agent.ts` | ReAct loop (max 5 iterations), streaming, tool orchestration | F4 Research Workflow, F5 Investment Committee |
| `lib/market-status.ts` | Market open/closed status | Extend → T+2 calculator |

---

## Feature 1 — Trade Journal Analyzer: BE Gaps

### FR-TJ-01 + FR-TJ-02 — CSV Upload & Parsing ❌ Missing

No endpoint exists for broker CSV upload. Required additions:

```
POST /api/journal/upload
  Accept: multipart/form-data (CSV file, max 5MB)
  Response: { journal_hash, roundtrips_count, status }

lib/journal/parsers/
  ssi-parser.ts       — SSI eStatement columns: Ngày GD, Mã CK, Loại GD, KL, Giá, Giá trị, Phí, Thuế
  tcbs-parser.ts      — TCBS columns: Date, Symbol, Type, Volume, Price, Value, Fee, Tax
  vps-parser.ts       — VPS contract note format
  vndirect-parser.ts  — VNDirect history format
  mirae-parser.ts     — Mirae Asset VN format
  generic-parser.ts   — Fallback: auto-detect from headers
```

Business rule: VND sell tax = 0.1% gross sell (Circular 111/2013) — already in `api/trade/route.ts` as `VSD_TAX_RATE`. Extract to shared constant.

### FR-TJ-03 — Roundtrip Calculator ⚠️ Incomplete

`get-trade-analytics.ts` pairs buys and sells simply (index-matched). Missing:
- FIFO cost basis tracking (multiple buy lots)
- Per-roundtrip `realized_pnl` and `holding_days`
- Handling partial sells (sell 50 of 100 held)

Required: `lib/journal/roundtrip-calculator.ts` — FIFO stack per symbol.

### FR-TJ-05 — Behavioral Bias Flags ⚠️ Partial

| Bias | Exists | Location | Gap |
|------|--------|----------|-----|
| Overtrading | ✅ | `overtradingScore` | None |
| FOMO / Chasing | ⚠️ | `archetypeKey: "fomo"` (avg_hold < 2d) | Needs proper chasing detection: buy within N% of recent high |
| Loss aversion | ⚠️ | `archetypeKey: "loss_averse"` | Needs disposition effect: compares hold time winners vs. losers |
| Disposition effect | ❌ | Missing | Flag when user sells winners faster than losers (avg_hold_winners < avg_hold_losers) |
| Anchoring | ❌ | Missing | Flag when user has sells clustered near round prices (nearest 1,000 VND) |

### FR-TJ-06 — Minimum Roundtrips Guard ❌

Current: Returns `null` win_rate silently when no sells.
Required: Return `{ error: "E-TJ-001", message: "Cần ít nhất 5 giao dịch đóng để phân tích", found: N }` with HTTP 422.

---

## Feature 2 — Shadow Account: BE Gaps ❌ Full build needed

No existing code. Required new modules:

```
lib/shadow-account/
  models.ts           — ShadowProfile, ShadowRule, ShadowBacktestResult, AttributionBreakdown types
  extractor.ts        — Extract 3-5 if-then rules from profitable roundtrips
  backtester.ts       — Simulate shadow rules against historical bars (uses symbol_day_bars)
  attribution.ts      — Compute delta-PnL: missed_signals, noise_trades, early_exit, late_exit, overtrading
  renderer.ts         — HTML report with 8 sections

app/api/shadow/
  extract/route.ts    — POST: takes journal_hash, returns ShadowProfile
  backtest/route.ts   — POST: takes shadow_id, runs backtest, returns ShadowBacktestResult
  report/route.ts     — POST: takes shadow_id, returns HTML/PDF blob
  signals/route.ts    — GET: today's matching signals for user's watchlist
```

**T+2 constraint is mandatory in `backtester.ts`** — simulated sells cannot occur within 2 trading days of a simulated buy. Requires T+2 calculator (see Shared Infrastructure).

---

## Feature 3 — Backtesting Engine: BE Gaps ❌ Full build needed

```
lib/backtest/
  engine.ts           — Core simulation loop (iterate dates, apply rules, fill at OHLCV)
  t2-guard.ts         — Enforce T+2 (reuse from shadow account)
  daily-limit.ts      — Cap fills at ±7% HoSE / ±10% HNX / ±15% UPCoM
  cost-model.ts       — Fee + VSD tax (extract from api/trade/route.ts)
  metrics.ts          — Sharpe, max_drawdown, win_rate, profit_factor, equity_curve
  benchmark.ts        — Compare vs VN-Index / VN30 (load from symbol_day_bars)
  validation/
    monte-carlo.ts    — Shuffle N=1000 trade order, p-value for Sharpe + max_dd
    bootstrap.ts      — Resample M=1000 returns, CI lower/upper, prob_positive
    walk-forward.ts   — In/out-of-sample windows

app/api/backtest/
  run/route.ts        — POST: strategy config → metrics + equity_curve
  validate/route.ts   — POST: backtest_id → Monte Carlo / Bootstrap / Walk-Forward results
```

**Data source is ready** — `symbol_day_bars` table already contains daily OHLCV for HoSE/HNX symbols. No new data pipeline needed.

---

## Feature 4 — AI Research Workflow: BE Gaps ⚠️ Partial

Existing agent covers basic tool use. Missing:

| Gap | Location | Required change |
|-----|----------|----------------|
| Structured report output | `lib/ai/agent.ts` | Add `report_mode: boolean` flag; when true, stream structured markdown sections instead of free text |
| Artifact persistence | None | New `research_sessions` table + `app/api/research/save/route.ts` |
| Evidence tagging | `lib/ai/tools/types.ts` | Add `data_as_of`, `source`, `confidence` to tool return type |
| Plan step visible | `lib/ai/agent.ts` | Stream `[PLANNING]` event before first tool call |

---

## Feature 7 — Risk Analysis Suite: BE Gaps ❌

Can be built on top of existing `symbol_day_bars` data:

```
lib/risk/
  drawdown.ts         — Top-5 historical drawdowns, frequency buckets, current distance from peak
  tail-risk.ts        — VaR 95/99/99.9% (parametric + historical simulation), CVaR
  stress-test.ts      — Scenario library: VN 2008 crash, COVID March 2020, TPDN crisis 2022
  regime.ts           — Bull/bear/sideways classification, historical analogs

app/api/risk/
  [ticker]/route.ts   — GET: full risk analysis for one symbol
  portfolio/route.ts  — POST: portfolio-level aggregation
```

---

## Shared Infrastructure Gaps

### T+2 Trading-Day Calculator ⚠️ Missing

`lib/market-status.ts` only returns today's open/closed status. Need:

```typescript
// lib/trading-calendar.ts
export function addTradingDays(date: Date, n: number): Date  // add N trading days (skip weekends + VN holidays)
export function isT2SellAllowed(buyDate: Date, sellDate: Date): boolean
export const VN_HOLIDAYS_2026: string[]  // ISO date strings
```

### Cost Model Constants — Extract ✅ Already correct, just not shared

Move from `api/trade/route.ts` to `lib/constants/trading.ts`:
```typescript
export const BROKER_FEE_RATE = 0.0025;   // 0.25%
export const VSD_SELL_TAX_RATE = 0.001;  // 0.1% sell side only
export const BOARD_LOT_HOSE = 100;       // shares
```

### New Supabase Tables Required

| Table | Purpose | Needed by |
|-------|---------|-----------|
| `journal_uploads` | Track CSV uploads with hash, user_id, broker_format, roundtrip_count | F1, F2 |
| `journal_roundtrips` | Computed roundtrips (per upload): symbol, buy_date, sell_date, qty, cost, proceeds, pnl | F1, F2 |
| `shadow_profiles` | Extracted shadow strategies per user | F2 |
| `shadow_rules` | Individual rules per profile | F2 |
| `backtest_runs` | Backtest metadata + result JSON | F3 |
| `research_sessions` | AI research session artifacts | F4 |
| `risk_snapshots` | Cached VaR/drawdown per symbol (TTL 1 day) | F7 |

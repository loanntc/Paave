# Vibe-Trading Feature Analysis — Paave Reuse Candidate

Version: 1.0 | Date: 2026-05-29 | Author: BA (parsed from Vibe-Trading v0.1.8)

> **Purpose:** Extracted and structured business requirements, functional requirements, and VN market adaptation notes from Vibe-Trading source files (wiki docs, 85+ test files, 29 swarm presets). Each section covers one reusable feature area and its applicability to Paave (Vietnam Gen Z paper-trading, HoSE/HNX, Next.js + Supabase).

---

## Traceability

| Source | What was parsed |
|--------|----------------|
| `wiki/docs/content.js` | Research pipeline, backtesting engines, Shadow Account workflow, swarm overview |
| `agent/tests/test_shadow_account.py` | Full behavioral contracts for Shadow Account data models and tool outputs |
| `agent/tests/test_shadow_scanner.py` | Signal scanning behavior (price features, momentum, volume) |
| `agent/tests/test_validation.py` | Monte Carlo, Bootstrap, Walk-Forward validation contracts |
| `agent/src/swarm/presets/investment_committee.yaml` | 4-agent bull/bear/risk/PM DAG with full system prompts |
| `agent/src/swarm/presets/quant_strategy_desk.yaml` | 4-agent screener/factor/backtest/risk DAG |
| `agent/src/swarm/presets/risk_committee.yaml` | 3-agent drawdown/tail-risk/regime DAG |
| `agent/SKILL.md` | Top-level capability inventory (22 MCP tools, 75 skills, 29 swarm presets) |

---

## Feature 1 — Trade Journal Analyzer

### Business Objective
Enable Paave users to upload their broker statement CSV and receive an AI-powered behavioral diagnosis of their trading patterns — identifying profitable habits and destructive biases — so they can improve their real trading discipline before risking real money.

### Key Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR-TJ-01** | System accepts CSV files from VN broker statement formats: SSI eStatement, VPS contract note, TCBS transaction history, VNDirect history, Mirae Asset VN history |
| **FR-TJ-02** | System parses each row into a trade record with fields: `trade_time`, `symbol`, `side` (buy/sell), `quantity`, `price`, `amount`, `fee`, `tax` |
| **FR-TJ-03** | System pairs buy and sell legs into roundtrips, computing: `holding_days`, `realized_pnl`, `pnl_pct`, `net_pnl` (after fee + 0.1% sell tax) |
| **FR-TJ-04** | System calculates behavioral metrics: `win_rate` (profitable roundtrips / total), `avg_holding_days`, `profit_factor` (gross profit / gross loss), `max_consecutive_losses` |
| **FR-TJ-05** | System detects behavioral biases with binary flag + evidence: `disposition_effect` (selling winners too early, holding losers), `overtrading` (trade frequency vs. expected), `chasing` (buying after large price moves), `anchoring` (holding at round-price levels) |
| **FR-TJ-06** | System rejects uploads with fewer than a configurable minimum roundtrips (default: 5) and returns a user-readable error explaining the minimum required |
| **FR-TJ-07** | System returns a structured analysis object (JSON) that includes: metadata, per-symbol breakdown, behavioral flags, summary paragraph |
| **FR-TJ-08** | System stores the journal hash (SHA-1 of file content) to detect and skip duplicate uploads without re-processing |

### Business Rules

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-TJ-01 | Minimum 5 roundtrips required for analysis | Return error E-TJ-001 with count found |
| BR-TJ-02 | VN sell tax = 0.1% of gross sell amount (Circular 111/2013/TT-BTC) — always applied to sell legs | Wrong net_pnl; reprocess required |
| BR-TJ-03 | T+2 constraint: buy and sell on the same date for the same symbol is not a valid roundtrip | Skip / flag as data anomaly |
| BR-TJ-04 | Duplicate upload (same journal_hash) returns cached result — no re-processing | N/A (silent cache hit) |
| BR-TJ-05 | File size max 5 MB; max 5,000 trade rows per upload | Return error E-TJ-002 |

### VN Market Adaptation Notes

- **Data source change (critical):** Vibe-Trading parsers are hardcoded for Tonghuashun (同花顺) / Dongfangcaifu (东方财富) / Futu column schemas. All four VN broker formats need new parsers. Column mapping reference:
  - SSI eStatement: `Ngày GD`, `Mã CK`, `Loại GD` (MUA/BÁN), `KL`, `Giá`, `Giá trị`, `Phí`, `Thuế`
  - TCBS: `Date`, `Symbol`, `Type`, `Volume`, `Price`, `Value`, `Fee`, `Tax`
- **Fee calibration:** VN broker fee range = 0.15–0.35% (vs. 0.025% for A-share discount brokers). Update fee constants.
- **Tax:** VN sell tax = 0.1% gross (flat). No stamp duty on buys. No capital gains tax (replaced by the 0.1% transaction tax).
- **T+2:** Same-day buy+sell on the same symbol is physically impossible at HoSE (matcher blocks it). Flag any such rows as data errors rather than roundtrips.

### Reusability Score: **High**

Core behavioral analysis logic (disposition effect detection, win rate, holding period profiling) is entirely market-agnostic. Only the CSV parser layer needs VN-specific work (~3–4 parser classes, one per broker format).

---

## Feature 2 — Shadow Account (Pattern Extraction + Counterfactual Backtest)

### Business Objective
Turn a user's past trade history into a set of explicit if-then trading rules, then backtest those rules on historical data to show what would have happened if the user had followed their own best patterns consistently — revealing missed gains, noise trades, and early exits as named PnL attribution buckets.

### Key Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR-SA-01** | System requires Trade Journal analysis (FR-TJ) as prerequisite; extracts 3–5 if-then rules from profitable roundtrips |
| **FR-SA-02** | Each rule has: `rule_id` (format: "R1"…"R5"), `human_text` (plain English description ≤ 200 chars), `entry_condition` (dict of signal keys), `exit_condition`, `holding_days_range` (min, max tuple), `support_count` (roundtrips matching this rule), `coverage_rate` (fraction of profitable trades covered) |
| **FR-SA-03** | System creates a `ShadowProfile` containing: `shadow_id` (prefix "shadow_"), `journal_hash` (40-char SHA-1), `source_market`, `profitable_roundtrips`, `total_roundtrips`, `date_range` (ISO strings), `typical_holding_days` (mean, median), `profile_text` (plain-English summary), `rules` (list), `preferred_markets` |
| **FR-SA-04** | System backtests the extracted rules against historical price data for the same symbols and date range, computing: `shadow_total_pnl`, `real_total_pnl`, `delta_pnl` (shadow minus real) |
| **FR-SA-05** | System computes PnL attribution breakdown: `missed_signals_pnl` (signals fired but user did not trade), `noise_trades_pnl` (trades where no rule fired), `early_exit_pnl` (user exited before rule exit), `late_exit_pnl` (user held past rule exit), `overtrading_pnl` (repeated entries in same symbol within holding window), `counterfactual_trades` (list of specific trades that would have changed the outcome) |
| **FR-SA-06** | System renders an HTML/PDF report with ≥ 8 named sections including "Shadow Account Summary", "Delta Attribution", and "Counterfactual Trades" |
| **FR-SA-07** | System scans today's watchlist for symbols whose price features match the extracted entry conditions and returns: `symbol`, `market`, `rule_id`, `reason` for each match |
| **FR-SA-08** | When no counterfactual trades exist, system renders "No material counterfactual trades found" — not an error |
| **FR-SA-09** | System generates a `SignalEngine` Python class with `generate()` method that encodes the extracted rules as executable code; the generated code must pass AST validation |

### Business Rules

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-SA-01 | Minimum profitable roundtrips threshold must be met before rule extraction (same as FR-TJ-06) | `ValueError` with count and threshold |
| BR-SA-02 | `human_text` in rules must be ASCII-only (no CJK characters) for i18n compatibility | Reject rule; log warning |
| BR-SA-03 | `shadow_id` must start with the literal prefix `"shadow_"` | System error; regenerate |
| BR-SA-04 | `journal_hash` must be exactly 40 characters (SHA-1 hex) | Validation error |
| BR-SA-05 | Signal scan is research-only output; it must not trigger any paper-trade order in Paave automatically | Architecture enforcement (no write path from scan output) |

### VN Market Adaptation Notes

- **Data source for backtest:** Replace A/HK/US/crypto price data with HoSE/HNX historical OHLCV from SSI or TCBS API. Symbols use VN format (e.g., `VCB`, `HPG`, `VHM`) — no exchange prefix needed for domestic market.
- **T+2 in backtest engine:** Shadow backtest must enforce T+2 — if a signal fires on day D, the earliest simulated buy executes on D+0 at close (or D+1 at open), but cannot be sold before D+2 at earliest. This prevents counterfactual trades that would be physically impossible.
- **Holding days range calibration:** VN retail typical holding = 1–30 days. Adjust default holding_days_range seed values (Vibe-Trading defaults to US/HK patterns of 3–90 days).
- **Signal scan scope:** Replace US/HK watchlist with user's VN watchlist symbols. Daily OHLCV from SSI or TCBS end-of-day API is sufficient (no minute data required for daily signal scan).
- **Report language:** Add Vietnamese report template in addition to English.

### Reusability Score: **High**

The entire Shadow Account pipeline (extract → backtest → attribution → report) is algorithmic and data-source-independent. The ShadowProfile, ShadowRule, and AttributionBreakdown data models are 100% reusable. Only the data fetcher and broker CSV parser need VN-specific implementation. The report renderer needs a Vietnamese template.

---

## Feature 3 — Backtesting Engine

### Business Objective
Let Paave users (18+ / FULL_ACCESS) define simple trading rules and run them against historical HoSE/HNX data to see how those rules would have performed — teaching them the difference between a good-feeling idea and a statistically sound strategy.

### Key Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR-BT-01** | System accepts a strategy config with: `market` (HoSE / HNX), `symbols` (list of stock codes), `date_range` (start, end ISO dates), `initial_capital` (VND integer), `buy_rule` (text description or code), `sell_rule`, `position_sizing` (equal weight / fixed amount / % of capital) |
| **FR-BT-02** | System returns core performance metrics: `annualized_return`, `sharpe_ratio`, `max_drawdown`, `win_rate`, `profit_factor`, `total_trades`, `equity_curve` (date → portfolio value) |
| **FR-BT-03** | System compares strategy performance against benchmark (VN-Index or VN30) and returns: `benchmark_return`, `alpha`, `beta`, `information_ratio` |
| **FR-BT-04** | System enforces T+2: simulated positions cannot be sold within 2 trading days of purchase. Any strategy rule attempting same-day or next-day sell is automatically delayed to the first valid sell date |
| **FR-BT-05** | System enforces HoSE daily limit: if a simulated buy/sell price exceeds ±7% from previous close, the order is filled at the limit price (not the rule price) |
| **FR-BT-06** | System includes transaction cost model: buy fee (configurable, default 0.25%), sell fee (configurable, default 0.25%), sell tax (fixed 0.1% gross sell) |
| **FR-BT-07** | System supports Monte Carlo validation: shuffle trade order N times (default 1,000), compute p-value for Sharpe ratio and max drawdown against shuffled distributions, return `p_value_sharpe`, `p_value_max_dd`, `n_simulations` |
| **FR-BT-08** | System supports Bootstrap Sharpe CI: resample returns with replacement M times (default 1,000), return `observed_sharpe`, `ci_lower` (2.5%), `ci_upper` (97.5%), `prob_positive` |
| **FR-BT-09** | System supports Walk-Forward analysis: split date range into N in-sample + out-of-sample windows, report per-window metrics and aggregate |
| **FR-BT-10** | System requires minimum 3 trades for Monte Carlo/Bootstrap; returns `{"error": "insufficient trades"}` if below threshold |
| **FR-BT-11** | Results are reproducible given the same random seed (for Monte Carlo and Bootstrap) |
| **FR-BT-12** | System produces a Run Card (metadata object) containing: strategy name, execution timestamp, data source, parameter hash, metrics summary — for audit trail |

### Business Rules

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-BT-01 | T+2 constraint is non-negotiable — no backtest result may show a buy and sell on the same or next trading day for the same symbol | Engine enforces; override not possible |
| BR-BT-02 | Daily limit ±7% (HoSE) / ±10% (HNX) / ±15% (UPCoM) applied to all simulated fills | Fill at limit price, not rule price |
| BR-BT-03 | Board lot = 100 shares (HoSE); quantities rounded down to nearest 100 | Silent floor to 100-share lot |
| BR-BT-04 | Backtest results presented with disclaimer: "Past performance does not guarantee future results. This is a simulation for educational purposes only." | UI enforcement |
| BR-BT-05 | Under 16 = blocked from backtesting. 16–17 (LEARN_MODE) = read-only results, no strategy saving. 18+ (FULL_ACCESS) = full feature | Age gate enforced at API layer |

### VN Market Adaptation Notes

- **Data source (critical):** Replace yfinance/Tushare/OKX with SSI Data API or TCBS API for HoSE/HNX historical OHLCV. FiinPro for fundamental data overlays.
- **Benchmark:** Replace S&P 500 / CSI 300 with VN-Index (`VNINDEX`) or VN30 (`VN30`) as the default benchmark.
- **Calendar:** Use HoSE/HNX trading calendar (excludes Vietnamese public holidays: Tết, Giỗ Tổ, 30/4, 1/5, 2/9, 1/1 plus bridge days). This affects T+2 calculation and date range filtering.
- **Board lot:** 100 shares minimum lot at HoSE — position sizing must respect this. At HNX and UPCoM, minimum lot = 1 share (but standard practice is 100).
- **Cost model calibration:** VN broker fees range 0.15–0.35% per leg (vs 0.025% US discount broker). Default cost model must be set higher than Vibe-Trading defaults.
- **No intraday:** No minute-data backtesting makes sense for Paave's use case (retail Gen Z paper trading). Daily OHLCV is sufficient for v1.

### Reusability Score: **High**

All backtest mathematics (Sharpe, drawdown, Monte Carlo, Bootstrap, Walk-Forward) are market-agnostic. The validation module (test_validation.py) is fully reusable. Only the data loader and market-specific constraint enforcement (T+2, daily limits, board lots, VN calendar) need new implementation.

---

## Feature 4 — AI Research Workflow (5-Step Pipeline)

### Business Objective
Provide users with a structured, reproducible research workflow that moves from a natural-language question ("Is HPG a good buy now?") through data grounding, analysis, validation, and a final readable report with inspectable evidence — teaching users how professional analysis is done.

### Key Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR-RW-01** | **Plan:** System routes a user research query to the relevant skill set (technical analysis, fundamental analysis, macro context, sector context) and declares a plan before executing |
| **FR-RW-02** | **Ground:** System fetches current market data (OHLCV, price, volume, 52-week range), recent news headlines, and relevant financial statements for the queried symbol before generating analysis |
| **FR-RW-03** | **Execute:** System runs the applicable analysis tools from the selected skills (e.g., technical-indicators, stock-valuation, macro-analysis) and stores intermediate outputs as named artifacts |
| **FR-RW-04** | **Validate:** System attaches evidence quality metadata to each artifact: data source, as-of date, confidence level, and any data gaps identified |
| **FR-RW-05** | **Deliver:** System compiles a research report (markdown / HTML) with: executive summary, supporting sections per analysis type, data sources cited, and a disclaimer |
| **FR-RW-06** | System preserves intermediate artifacts (raw data, analysis outputs) accessible for user inspection — not just the final summary |
| **FR-RW-07** | System clearly marks where data was unavailable or estimated and does not fabricate numbers |
| **FR-RW-08** | Research results are tagged with a session ID and timestamp for recall ("show me yesterday's HPG analysis") |

### Business Rules

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-RW-01 | All research output includes disclaimer: "This is AI-generated research for educational purposes. Not investment advice." | UI enforcement on every report |
| BR-RW-02 | System must not assert price targets or buy/sell recommendations without clearly labeling them as AI-generated estimates with uncertainty | Flag if no uncertainty label |
| BR-RW-03 | LEARN_MODE users (16–17) see research output but with simplified explanations and no advanced metrics (Sharpe, VaR) | Age gate on metric display |

### VN Market Adaptation Notes

- **Data sources:** Replace Tushare / AKShare with SSI Research API, TCBS data API, VietStock API, or FiinPro for VN stock data.
- **News sources:** CafeF, VnExpress Finance, HoSE/HNX official announcements, NDH.vn, Vietstock News — not Chinese financial media.
- **Report language:** Vietnamese output required (Paave primary language is Vietnamese with English support).
- **Sector classification:** Replace Shenwan (申万) with VN ICB sectors: Ngân hàng, Bất động sản, Thép/Vật liệu, Tiêu dùng, Năng lượng, Công nghệ, Y tế.

### Reusability Score: **High**

The 5-step pipeline (Plan → Ground → Execute → Validate → Deliver) is a pure workflow pattern with no market-specific logic. The artifact trail concept, evidence tagging, and report structure are directly applicable. Only the tool selection mapping (which skills to invoke for a VN stock query) and data source adapters need VN-specific work.

---

## Feature 5 — Investment Committee (Multi-Agent Stock Analysis)

### Business Objective
Offer advanced users a "committee review" of a stock — separate bull-case and bear-case analyses run in parallel by different AI specialists, synthesized by a risk officer, and concluded by a portfolio manager — demonstrating how institutional investment decisions are structured.

### Key Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR-IC-01** | **Bull Analyst:** System generates a bull case covering: (a) technical entry setup with support/resistance levels, (b) fundamental thesis with PE/PB vs. sector, (c) 3 key catalysts with estimated timeline |
| **FR-IC-02** | **Bear Analyst:** System generates a bear case covering: (a) risk factors (fundamental + macro), (b) technical warning signals (distribution patterns, trend breaks), (c) downside scenario with price impact estimate |
| **FR-IC-03** | Bull and bear analyses run in parallel (not sequentially) to ensure independence of views |
| **FR-IC-04** | **Risk Officer:** System synthesizes both views, identifies the 2–3 most critical risks, quantifies position-level risk (VaR estimate), and assesses whether risk/reward is favorable |
| **FR-IC-05** | **Portfolio Manager:** System produces a final recommendation: Buy / Hold / Avoid — with position sizing guidance (% of paper portfolio) and a stop-loss level, conditioned on the risk officer's assessment |
| **FR-IC-06** | Each analyst output is independently viewable (not just the final PM conclusion) |
| **FR-IC-07** | System returns the full committee debate as a structured object with sections: `bull_case`, `bear_case`, `risk_assessment`, `final_recommendation`, `consensus_confidence` (low/medium/high) |
| **FR-IC-08** | Recommendation is clearly labeled as AI-generated and educational; no buy/sell order is triggered |

### Business Rules

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-IC-01 | Feature only available to users with FULL_ACCESS (18+) | Age gate; LEARN_MODE users see simplified 1-analyst summary only |
| BR-IC-02 | The `final_recommendation` must always include a stop-loss level — never a buy without a risk level | System error if missing |
| BR-IC-03 | Position sizing guidance must not exceed 20% of paper portfolio per symbol | Capped at 20% in output |

### VN Market Adaptation Notes

- **Agent prompts need VN context:** Replace CSI 300 / Hang Seng / S&P 500 benchmarks with VN-Index, VN30. Replace sector references with VN ICB sectors.
- **Data sources in agent prompts:** SSI Research, VNDirect Research, BIDV Research PDFs (for fundamental context), VietStock for price data.
- **Stop-loss framing:** VN daily limit ±7% means a single-day gap-down can reach 7% immediately — stop-loss logic must account for this (limit orders may not fill at stop level on a limit-down day).
- **Social media signals:** VN retail sentiment is primarily on Facebook groups, Zalo groups, TikTok Finance — not Twitter/Reddit. Bull/bear analyst should note when a stock has heavy retail social discussion.
- **LLM requirement:** The multi-agent swarm requires an LLM provider (OpenAI-compatible API). For Paave this means a backend API call — not a client-side operation. The LLM cost per committee run is non-trivial (~$0.05–0.20 per full committee depending on model).

### Reusability Score: **Medium**

The DAG architecture (parallel analysts → risk → PM) and the output contract (bull_case, bear_case, risk_assessment, final_recommendation) are fully reusable. The agent system prompts are moderately reusable — need significant VN market context injection. The swarm orchestration requires an LLM provider (additional infrastructure cost).

---

## Feature 6 — Quant Strategy Desk

### Business Objective
Walk users through the full professional quant workflow: screen the HoSE/HNX universe for candidates → mine alpha factors → backtest the combined strategy → audit its risks — showing them how institutional quant funds actually build strategies.

### Key Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR-QD-01** | **Screener:** System filters VN stock universe by configurable criteria (PE < threshold, PB < threshold, ROE > threshold, revenue growth > threshold, market cap range) and returns a ranked candidate list with: code, company name, sector, key metrics per company |
| **FR-QD-02** | **Screener:** System reports a funnel: initial universe size → count after each filter step |
| **FR-QD-03** | **Factor Miner:** System tests ≥ 3 alpha factors, computing per factor: Mean IC (information coefficient), ICIR (IC / std(IC)), IC hit rate, factor return distribution |
| **FR-QD-04** | **Factor Miner:** System computes factor correlation matrix and eliminates highly correlated factors (|corr| > 0.7 threshold) |
| **FR-QD-05** | **Factor Miner:** System produces a combined factor score (equal-weight or optimized) for the screened universe |
| **FR-QD-06** | **Backtester:** System runs a full backtest of the combined screening + factor strategy (using FR-BT requirements) and returns all standard backtest metrics |
| **FR-QD-07** | **Risk Auditor:** System analyzes backtest for: top-5 historical drawdowns (magnitude + duration), annualized volatility + downside volatility, in-sample vs. out-of-sample performance gap, parameter sensitivity (test ±20% parameter shifts) |
| **FR-QD-08** | Each desk stage (screening, factor, backtest, risk) runs sequentially; factor and screener stages can run in parallel before backtest starts |
| **FR-QD-09** | System produces a combined final report covering all four stages |

### Business Rules

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-QD-01 | Minimum 10 candidates required after screening to proceed to factor stage | Error: insufficient universe for factor testing |
| BR-QD-02 | Minimum 3 factors must be tested before combination | Error if fewer factors submitted |
| BR-QD-03 | Feature restricted to FULL_ACCESS (18+) | Age gate |
| BR-QD-04 | All backtest results governed by FR-BT business rules (T+2, daily limits, etc.) | Inherited from backtesting module |

### VN Market Adaptation Notes

- **Universe data:** HoSE ~1,700 listed companies, HNX ~800 — total VN universe is smaller than A-share (5,000+). Screening funnel stats will look different (smaller initial size). Use FiinPro or SSI for fundamental screening data.
- **Factor data availability:** VN has thin analyst coverage (~100 stocks well-covered by SSI/VNDirect/BIDV). Earnings revision and consensus factors are unavailable for most VN stocks. Focus on price-based factors (momentum, mean reversion) and fundamental ratios (PE, PB, ROE) which are available via FiinPro.
- **Factor regime:** VN market is ~90% retail-driven — momentum and social sentiment factors tend to be stronger than value factors. The factor miner should prioritize momentum IC testing first.
- **Liquidity filter:** Add minimum average daily trading volume filter (e.g., > 100 million VND/day) before factor testing — many small VN stocks have near-zero liquidity and would produce misleading IC values.

### Reusability Score: **High** (methodology) / **Medium** (data layer)

The 4-stage DAG, factor math (IC/ICIR/hit rate), correlation matrix, and risk audit logic are fully reusable. The data sourcing layer needs complete replacement for VN.

---

## Feature 7 — Risk Analysis Suite

### Business Objective
Give users a comprehensive risk view of any stock or paper portfolio: historical drawdown characterization, tail risk (VaR/CVaR), and current market regime — translating quantitative risk concepts into plain language that Gen Z investors can act on.

### Key Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR-RA-01** | **Drawdown Analysis:** System identifies top 5 historical drawdown events for the target, each with: `magnitude` (%), `start_date`, `trough_date`, `end_date`, `duration_trading_days`, `recovery_days` |
| **FR-RA-02** | **Drawdown Analysis:** System reports frequency distribution of drawdowns by magnitude bucket (0–5%, 5–10%, 10–20%, >20%) |
| **FR-RA-03** | **Drawdown Analysis:** System computes current drawdown state: is the stock in a drawdown now? Distance from 52-week high? |
| **FR-RA-04** | **Tail Risk:** System computes VaR at 95%, 99%, and 99.9% confidence levels via both parametric (normal distribution) and historical simulation methods |
| **FR-RA-05** | **Tail Risk:** System computes CVaR (Conditional Value at Risk / Expected Shortfall) at 95% and 99% levels |
| **FR-RA-06** | **Tail Risk:** System runs ≥ 3 historical stress scenarios with simulated loss estimate (e.g., VN financial crisis 2008, real estate bond crisis 2022–23, COVID-19 March 2020) |
| **FR-RA-07** | **Regime Detection:** System classifies the current market regime: Bull / Bear / Sideways — with confidence level |
| **FR-RA-08** | **Regime Detection:** System identifies 2–3 historical periods most similar to current regime conditions and reports their subsequent outcomes |
| **FR-RA-09** | **Regime Detection:** System reports leading indicators of regime change and current readings (e.g., 200-day MA crossover state, VN30 put/call proxy, foreign net flow trend) |
| **FR-RA-10** | For portfolio-level risk, system aggregates individual stock risks into: `portfolio_var_95`, `portfolio_cvar_95`, `correlation_matrix`, `largest_drawdown_contributor` |

### Business Rules

| ID | Rule | Violation Behavior |
|----|------|--------------------|
| BR-RA-01 | VaR and CVaR are presented with explicit confidence levels and method labels (parametric vs. historical) — never as a bare number | UI enforcement |
| BR-RA-02 | Risk metrics always displayed with disclaimer: "Historical risk measures do not predict future losses" | UI enforcement |
| BR-RA-03 | All percentages displayed in VN convention: comma as decimal separator if any decimal shown, period as thousands separator (e.g., "Thua lỗ tối đa: 15,2%") | Formatting rule |
| BR-RA-04 | Stress scenarios must use VN market historical events, not US/China events | Content requirement |

### VN Market Adaptation Notes

- **Stress scenarios (replace Vibe-Trading defaults with VN equivalents):**
  - VN equity market crash 2008 (VN-Index fell from 1,170 → 235 points, –80% in 11 months)
  - COVID-19 March 2020 crash (VN-Index –35% peak-to-trough in 28 trading days)
  - Real estate / corporate bond crisis 2022 (Vạn Thịnh Phát, Tân Hoàng Minh, FLC — sector-specific, –60% for property stocks)
  - SBV rate tightening cycle 2022–2023 (liquidity squeeze, margin calls)
- **Regime indicators for VN:**
  - VN-Index vs. 200-day SMA
  - Foreign net buy/sell at HoSE (daily published data — key retail sentiment proxy)
  - HoSE margin lending balance (VSD monthly data)
  - VN PMI (monthly, published by S&P Global)
  - SBV repo rate trend
- **Portfolio aggregation:** Most VN retail portfolios are concentrated (3–10 stocks), often in same sector (all banks, all real estate). Correlation matrix will frequently show near-1.0 correlations — the system should warn users when portfolio is insufficiently diversified.

### Reusability Score: **High**

All VaR/CVaR/drawdown mathematics are universal. The regime detection framework is sound. Only the stress scenario content and regime indicators need VN-specific calibration.

---

## Priority Ranking for Paave Implementation

| Priority | Feature | Rationale |
|----------|---------|-----------|
| **1 — High** | Trade Journal Analyzer | Directly teachable, immediate user value, differentiates Paave from passive portfolio apps |
| **2 — High** | Shadow Account (Pattern Extraction) | "Mirror to yourself" — highly engaging for VN retail who trade actively but unprofitably |
| **3 — High** | Risk Analysis Suite | Core education feature; complements paper trading by making risk tangible |
| **4 — Medium** | Backtesting Engine | Requires T+2 + VN data integration; strong educational value but higher build cost |
| **5 — Medium** | AI Research Workflow | Can be implemented incrementally (start with 1-step, build to 5-step) |
| **6 — Low-Medium** | Quant Strategy Desk | Power-user feature; wait until backtesting v1 is stable |
| **7 — Low** | Investment Committee | Requires LLM infrastructure cost per run; better as a premium / v2 feature |

---

## Shared Infrastructure Requirements

All features above share these infrastructure components. Build once, reuse across all features:

| Component | Description | Where used |
|-----------|-------------|------------|
| **VN Broker CSV Parser** | Parsers for SSI, TCBS, VPS, VNDirect, Mirae Asset VN statement formats | TJ, Shadow Account |
| **HoSE/HNX OHLCV Loader** | Daily price data fetcher from SSI or TCBS API, with VN trading calendar | Backtesting, Risk, Shadow Account |
| **VN Market Calendar** | Trading day calendar with VN public holidays; T+2 calculator | Backtesting, Shadow Account, Risk |
| **Cost Model (VN)** | Fee: 0.15–0.35%, Sell tax: 0.1% gross — configurable per broker | Backtesting, Shadow Account, TJ |
| **Report Renderer** | HTML/PDF renderer for analysis reports; Vietnamese + English templates | TJ, Shadow Account, Research, Risk |
| **Artifact Store** | Supabase storage for intermediate analysis outputs, linked to user session | Research workflow, Shadow Account |
| **Research Disclaimer** | Standard disclaimer component in VN + EN, attached to all AI-generated content | All features |

---

*Parsed from: Vibe-Trading v0.1.8 (HKUDS/Vibe-Trading) | Adapted for: Paave — Vietnam HoSE/HNX paper-trading app*
*Analysis date: 2026-05-29*

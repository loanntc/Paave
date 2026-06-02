# AI Suggestions Feature Review — Skills Deep-Dive
**Date:** 2026-06-02
**Reviewer:** Code Reviewer Agent (Principal Engineer)
**Scope:** Mapping each Vibe-Trading skill to what the pipeline spec requires vs what `buildPrompt()` actually delivers.

---

## 1. Overall Diagnosis

The pipeline's `buildPrompt()` function (`run-pipeline.ts` lines 150–212) computes only two inline metrics from raw OHLCV data:
- SMA20 and SMA50 (simple average of `closes.slice(0,20/50)`)
- Volume ratio (today's volume vs 30-day average)

The spec (SRD-21 §1.3 Step 5) requires five skills to run as local computations before the LLM call: `technical-indicators`, `candlestick-patterns`, `volatility-mean-reversion`, `stock-valuation`, and `news-event-strategy`. None of these are loaded or executed as skill modules. The pipeline feeds the model raw price summary numbers that are a small fraction of the signal intelligence these skills would provide.

The result: the model receives `SMA20`, `SMA50`, `volume ratio`, `PE`, `PB`, and 5 news headlines. It does not receive RSI, MACD, Bollinger Band position, ADX, OBV, any candlestick pattern names, or volatility percentile. The BUY_OPPORTUNITY and SELL_CAUTION conditions in SRD-21 §10.2 reference RSI_14, SMA50 cross, and volume ratio — only the last two can be partially computed from what is passed.

---

## 2. Skill-by-Skill Gap Analysis

### 2.1 `technical-basic` (technical-indicators skill)

**Skill file:** `/Users/loannguyen/Paave/skills/technical-basic/SKILL.md`

**What the skill provides:**
- EMA(12)/EMA(26) cross — trend direction
- ADX(14) — trend strength threshold (≥ 25 = trending)
- Bollinger Bands(20,2) — %B position (0 = lower band, 1 = upper band)
- RSI(14) — Wilder EWM implementation, oversold/overbought thresholds (30/70)
- OBV — cumulative volume-price trend
- Volume ratio vs 20-day MA
- Composite 3-dimensional vote: Long/Short/Stand-aside

**What the spec needs from it (SRD-21 §1.3 Step 5, §10.2):**
- RSI_14 value (BUY: RSI < 30; SELL: RSI > 70)
- SMA50 cross confirmation
- Volume ratio (already partially computed but using different period than skill default)
- MACD crossover (implied by EMA cross from skill)

**What `buildPrompt()` provides:**
- SMA20, SMA50 as plain numbers (computed as simple averages, not EMAs — this is technically incorrect: RSI requires Wilder's EWM, not a simple rolling mean)
- Volume ratio vs 30d average (close to skill's vol_ma_period=20 but uses a different window)
- No RSI value
- No MACD or EMA crossover
- No Bollinger Band position (%B or number of standard deviations)
- No ADX value
- No OBV direction

**Gap severity:** Critical. The primary signal conditions in SRD-21 §10.2 (`RSI_14 < 30`, `RSI_14 > 70`, negative RSI divergence) cannot be evaluated by the model because the RSI value is never provided.

**Recommended fix:** Compute RSI(14) using Wilder's EWM from `closes` array before building the prompt. Add to prompt under "TECHNICAL INDICATORS":
```
RSI(14): [value]  →  [oversold / overbought / neutral]
MACD: EMA12=[x], EMA26=[y], signal=[z], histogram=[h]
Bollinger Band: upper=[x], middle=[y], lower=[z], %B=[p]  →  [above upper / near upper / mid / near lower / below lower]
ADX(14): [value]  →  [trending >25 / ranging]
Volume ratio (today vs 30d avg): [x]%
OBV trend: [rising / falling / flat] over last 5 sessions
```

---

### 2.2 `candlestick` (candlestick-patterns skill)

**Skill file:** `/Users/loannguyen/Paave/skills/candlestick/SKILL.md`

**What the skill provides:**
- 15 pattern detectors: Hammer, Inverted Hammer, Shooting Star, Doji, Spinning Top, Bullish/Bearish Engulfing, Bullish/Bearish Harami, Piercing Line, Dark Cloud Cover, Morning Star, Evening Star, Three White Soldiers, Three Black Crows
- Composite bullish/bearish score (+1 per bullish pattern, -1 per bearish)

**What the spec requires (SRD-21 §1.3 Step 5):** "candlestick-patterns → reversal/breakout patterns from 90d OHLCV"

**What `buildPrompt()` provides:** Nothing. No candlestick pattern names, no composite score, no reversal signal.

**Gap severity:** High. Candlestick reversals (e.g., Morning Star, Hammer near support) are one of the most visible technical signals for retail investors in Vietnam and would significantly improve the quality of BUY_OPPORTUNITY analysis text. The model is asked to identify breakout patterns but given no pattern data to work from.

**Recommended fix:** From the last 5 sessions of OHLCV data, detect the presence of any of the 15 patterns (this is a vectorized computation over at most 5 rows) and add to the prompt:
```
CANDLESTICK PATTERNS (last 3 sessions):
- Session -1: Morning Star (bullish reversal)
- Session 0: No pattern
Composite candlestick signal: BULLISH (+1)
```
If no pattern detected: "No significant candlestick pattern in last 5 sessions."

---

### 2.3 `volatility` (volatility-mean-reversion skill)

**Skill file:** `/Users/loannguyen/Paave/skills/volatility/SKILL.md`

**What the skill provides:**
- Historical Volatility (HV): annualized std of returns over `hv_window` days (default 20)
- Percentile rank of HV within lookback window (default 120 days)
- Signal: long (low-vol regime, <20th percentile), short (high-vol, >80th), stand-aside (middle)

**What the spec requires (SRD-21 §1.3 Step 5):** "volatility-mean-reversion → volatility percentile, mean reversion signal"

**What `buildPrompt()` provides:** Nothing. No volatility figure, no percentile.

**Gap severity:** Medium-high. Volatility context is directly useful for price target generation. A symbol in a low-volatility compression regime is statistically more likely to see expansion — relevant for `BUY_OPPORTUNITY` confidence. High volatility percentile (>80th) supports `SELL_CAUTION` for mean reversion. The model cannot infer this from raw OHLCV summary numbers.

**Recommended fix:** Compute from `closes` array:
```typescript
const returns = closes.slice(0, 90).map((c, i) => i === 0 ? 0 : (c - closes[i-1]) / closes[i-1]);
const hv20 = stdDev(returns.slice(0, 20)) * Math.sqrt(252) * 100; // annualized %
const hvPercentile = percentileRank(returns.slice(0, 120).map(...)); // rolling std percentile
```
Add to prompt:
```
VOLATILITY:
- Historical volatility (20d, annualized): [hv]%
- HV percentile (vs 120d history): [pct]th percentile  →  [low / medium / high regime]
- Mean reversion signal: [LONG / SHORT / STAND_ASIDE]
```

---

### 2.4 `valuation-model` (stock-valuation skill)

**Skill file:** `/Users/loannguyen/Paave/skills/valuation-model/SKILL.md`

**What the skill provides:**
- DCF / DDM / SOTP absolute valuation
- PE Band (historical percentile analysis: where does current PE sit vs 5-year history?)
- PB-ROE matrix quadrant (undervalued / overvalued)
- EV/EBITDA vs sector median
- Valuation-trap detection checklist (10 patterns)

**What the spec requires (SRD-21 §10.2, FRD-21 FR-AS-11):**
- BUY condition: `PE_ratio < sector_median_PE × 0.8 AND pct_change_5d > 0`
- `stock-valuation skill → PE vs sector, PB, ROE`

**What `buildPrompt()` provides:**
- `pe_ratio` (raw value)
- `pb_ratio` (raw value)
- `market_cap` (converted to tỷ VND)
- No `sector_median_PE` — the BUY condition in the spec requires comparing PE to sector median, but sector median is never fetched or computed

**Gap severity:** Medium. The raw PE is passed but without the sector median comparison, the model cannot reliably evaluate whether PE < sector_median × 0.8. The model will guess based on general knowledge of Vietnamese sector PE ranges, which is unreliable.

**The `symbol_statistic` table** is fetched (line 128–134) and has `pe_ratio`, `pb_ratio`, `eps`, `market_cap`, `week52_high`, `week52_low`, `avg_volume_30d`. It does not include `sector_median_pe`. A separate query against `symbols` (for sector) and a computed sector average would be required.

**Recommended fix:**
```typescript
// Additional query in fetchMarketData:
const sectorRes = await supabase
  .from('symbols')
  .select('sector')
  .eq('code', symbol)
  .single();

const sectorPeRes = await supabase.rpc('get_sector_median_pe', { sector: sectorRes.data?.sector });
```
Add to prompt:
```
FUNDAMENTALS:
- PE ratio: [x] vs sector median PE: [y]  →  [below sector / at sector / above sector]
- PB ratio: [x]
- ROE: [x]%  →  PB-ROE quadrant: [lower-right / upper-right / lower-left / upper-left]
- Valuation zone: [undervalued / fair / expensive] vs 5-year PE band
```

---

### 2.5 `behavioral-finance` (behavioral-finance skill)

**Skill file:** `/Users/loannguyen/Paave/skills/behavioral-finance/SKILL.md`

**What the skill provides:**
- Overreaction / underreaction momentum signals
- Disposition-effect signal (capital gain overhang approximated via 60-day VWAP)
- Composite sentiment indicators (turnover ratio, margin financing, limit-up/down counts)
- Contrarian signal conditions

**What the spec requires (SRD-21 §1.3 Step 3 news fetch):** The spec calls the data source `news-event-strategy` (not `behavioral-finance`) but the SELL_CAUTION condition "foreign net sell ≥ 3 consecutive sessions" (SRD-21 §10.2) is a sentiment indicator aligned with what this skill measures.

**What `buildPrompt()` provides:**
- 5 news headlines with title and published_at — no sentiment score column used (`sentiment_score` is fetched in line 136 but never inserted into the prompt)
- No foreign net buying/selling data
- No turnover ratio context
- No disposition-effect signal

**Gap severity:** Medium. The `sentiment_score` field from `insights_news` is fetched but silently dropped (line 164 only uses `title` and `published_at`). Including it costs zero additional DB I/O.

**Recommended fix (low cost):**
1. Include `sentiment_score` in the news context: "- VIC bán tháo (2026-05-30) [sentiment: -0.72 bearish]"
2. Fetch `foreign_net_buy_vol` from the quotes table if available. The `symbol_quotes_latest` already has `session` field — check if foreign flow columns exist.
3. For the SELL_CAUTION condition, add a 5-day rolling foreign net flow calculation from `symbol_day_bars` if that table has foreign flow columns.

---

### 2.6 `multi-factor` (multi-factor-ranking skill)

**Skill file:** `/Users/loannguyen/Paave/skills/multi-factor/SKILL.md`

**What the skill provides:**
- Cross-sectional Z-score ranking across momentum, reversal, volatility, volume_ratio factors
- Optional: PE, PB, ROE factors for fundamental weighting
- TopN portfolio selection from ranked universe

**What the spec requires:** Not explicitly required — the spec selects symbols by raw volume. But the pipeline could use multi-factor ranking as a secondary filter to identify which of the top-20 volume symbols are most interesting for signal generation, improving signal quality.

**Gap severity:** Low (P2). This is an enhancement opportunity, not a spec gap.

**Recommended enhancement:** After resolving the top-20 symbols by volume, compute a composite factor score for each and prioritize processing order. Symbols with extreme factor scores (top or bottom quartile on momentum + PE) are more likely to produce high-confidence directional signals. This would reduce the proportion of WATCH signals without changing the symbol universe.

---

### 2.7 `risk-analysis` (risk-analysis skill)

**Skill file:** `/Users/loannguyen/Paave/skills/risk-analysis/SKILL.md`

**What the skill provides:**
- VaR(95%) and CVaR from historical returns
- Max drawdown analysis
- Monte Carlo price path simulation
- Historical scenario stress tests

**What the spec requires:** Not explicitly required. But the spec requires the model to generate `price_target` values that are "derived from real HOSE quote data" and within the ceiling/floor range (BR-AS-09). VaR-based price target bounds would make targets more defensible.

**Gap severity:** Low (P2). This is an enhancement opportunity.

**Recommended enhancement:** Compute historical VaR(95%, 10d) from the 90-day OHLCV and add to the prompt as a constraint on price target generation:
```
RISK CONTEXT:
- Historical VaR (95%, 10-day): ±[x]%
- Max drawdown (90d): [x]%
- Suggested price target band: [floor_of_target] – [ceiling_of_target]
  (based on current price × (1 ± 2×VaR) and within exchange ceiling/floor)
```
This prevents hallucinated price targets that are theoretically plausible but statistically extreme.

---

### 2.8 `sentiment-analysis` (market-sentiment skill)

**Skill file:** `/Users/loannguyen/Paave/skills/sentiment-analysis/SKILL.md`

**What the skill provides:** Fear/greed index construction, A-share foreign flow signals (北向资金), social media sentiment quantification framework.

**Applicability to HOSE:** The skill is oriented toward China A-shares (沪深港通, 融资融券) and crypto markets. The data sources (margin financing balance, ETF net subscriptions, limit-up counts) are China-specific. The framework's structure is relevant to Vietnam — HOSE has foreign investor flow data (foreign net buy/sell) — but the exact indicators do not map directly.

**Recommended approach (P2):** Do not load this skill as-is. Instead, extract the concept (foreign flow as sentiment proxy) and implement a HOSE-specific version using `foreign_buy_vol` and `foreign_sell_vol` from market data tables. Include the 3-session consecutive foreign sell check that the SELL_CAUTION condition in SRD-21 §10.2 requires.

---

## 3. `buildPrompt()` Enrichment Recommendations (Priority Order)

| Priority | Signal to Add | Source | Impact |
|---|---|---|---|
| P0 | RSI(14) value and direction | Compute from `closes` using Wilder EWM | Enables primary BUY/SELL conditions from SRD-21 §10.2 |
| P0 | MACD histogram (EMA12-EMA26) | Compute from `closes` | Enables momentum crossover detection |
| P1 | Bollinger Band %B position | Compute from `closes` | Enables mean-reversion overbought/oversold context |
| P1 | Candlestick pattern names (last 3 sessions) | Detect from OHLCV bars | Improves analysis_text observational richness |
| P1 | Volatility percentile (HV vs 120d history) | Compute from `closes` | Enables volatility regime context for price target |
| P1 | `sentiment_score` from fetched news | Already in `newsRes.data` | Zero extra DB I/O; improves catalyst detection |
| P1 | Sector median PE comparison | Query `symbols` table | Enables PE-based BUY condition per SRD-21 §10.2 |
| P2 | ADX(14) for trend strength | Compute from OHLCV | Reduces false BUY signals in ranging markets |
| P2 | OBV direction (5-session trend) | Compute from OHLCV | Improves volume-price confirmation |
| P2 | Foreign net buy/sell (5 sessions) | Query if available in DB | Enables SELL_CAUTION condition for foreign outflow |
| P2 | VaR-based price target constraint | Compute from `closes` | Prevents statistically extreme price targets |

---

## 4. Prompt Structure vs Spec Prompt (SRD-21 §6.3)

The spec defines a system prompt / user prompt split (SRD-21 §6.3). The current implementation uses a single combined prompt with no `system` parameter in the Claude API call.

**Code (`callClaude`, line 223):**
```typescript
const response = await anthropic.messages.create({
  model,
  max_tokens: 300,
  messages: [{ role: "user", content: prompt }],
});
```

There is no `system:` parameter. The language rules, output schema definition, and prohibited phrase reminder are all in the user turn.

**Spec (SRD-21 §6.3):** Defines a system prompt with the guardrails and output schema, and a separate user prompt with the per-symbol data.

**Impact:** Minor quality degradation. System prompts are given higher weight than user-turn instructions by Claude. Moving the compliance rules (no imperative verbs, confidence cap, output schema) to the `system` parameter improves adherence. This is also consistent with how the existing `lib/ai/agent.ts` works (line 54: `system: systemPrompt`).

**Fix:** Split `buildPrompt()` into `buildSystemPrompt()` and `buildUserPrompt(symbol, data)`. Pass `system: buildSystemPrompt()` and `messages: [{ role: 'user', content: buildUserPrompt(symbol, data) }]` to `anthropic.messages.create`.

---

## 5. Two-Pass Model Architecture Gap

The spec (SRD-21 §6.1) defines a two-pass strategy:
1. Haiku screening pass: max_tokens = 150 (screening only)
2. Sonnet upgrade pass (if confidence_raw > 70): max_tokens = 300

**Code (`callClaude`, line 225):** `max_tokens: 300` for both Haiku and Sonnet calls.

The Haiku screening pass should be capped at 150 tokens to match the spec and reduce cost. The current implementation uses 300 tokens on the Haiku pass — 2× the spec limit — which both increases cost and potentially causes Haiku to write verbose analysis_text that the Sonnet pass then ignores.

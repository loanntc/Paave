# SRD-21: AI Suggestions — Daily Signal Generation Pipeline & API

**Version:** 1.0
**Date:** 2026-06-01
**Author:** Business Analysis Team
**Linked FRD:** FRD-21 (`frd/21-ai-suggestions.md`)
**Linked FRD (age gate):** FRD-09 (`frd/09-age-gate.md`)
**Linked FRD (disclaimers):** FRD-15 (`frd/15-legal-disclaimers.md`)
**Status:** Authoritative — V1 pipeline + display API

> **Scope of this document:** System-level specification for the daily AI Suggestions batch pipeline and the read API that serves pre-computed suggestions to the Home screen client. This document covers: pipeline system flow, skills integration, model selection logic, data model, validation rules, API contract, error handling, and cost monitoring. A backend developer must be able to implement the pipeline and API from this document without referencing external sources. A QA engineer must be able to write integration and load tests from the API contract and error handling sections alone.
>
> **Performance constraint:** Zero LLM calls occur per user page view. All LLM work is done in the nightly batch pipeline. The read API serves pre-computed rows from Supabase.

---

## Table of Contents

1. [Pipeline System Flow](#1-pipeline-system-flow)
2. [Data Model](#2-data-model)
3. [API Contract](#3-api-contract)
4. [Validation Logic Table](#4-validation-logic-table)
5. [Error Handling](#5-error-handling)
6. [Model Selection Logic](#6-model-selection-logic)
7. [Token Budget](#7-token-budget)
8. [Cost Monitoring](#8-cost-monitoring)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Related Documents](#10-related-documents)

---

## 1. Pipeline System Flow

### 1.1 Trigger

| Property | Value |
|----------|-------|
| Schedule | 18:45 ICT daily, Monday–Friday, excluding VN public holidays |
| Implementation | GitHub Actions cron job |
| Cron expression (UTC) | `45 11 * * 1-5` (11:45 UTC = 18:45 ICT; holiday skip is code-level check) |
| Holiday list source | `vn_market_holidays` table in Supabase; pipeline reads this at job start |
| Sequential processing | Symbols processed one at a time (not parallel) to respect external API rate limits |
| Estimated total duration | 2–3 minutes for 20 symbols |

**Holiday skip logic:**
At job start, pipeline reads `vn_market_holidays` for the current ICT date. If today is a holiday, the job exits with status `SKIPPED_HOLIDAY` and logs the reason. No Supabase writes occur.

### 1.2 Symbol Universe Selection

The pipeline determines the top 20 HOSE symbols by previous trading day's total volume before processing begins.

```
1. Call get_stock_bars for HOSE market aggregate (or dedicated volume endpoint)
2. Sort symbols by total_volume DESC for the previous trading day
3. Select top 20 symbols
4. Store selected symbols in pipeline run metadata: pipeline_runs.symbol_list (text[])
5. Proceed to per-symbol processing with this fixed list
```

**If the volume data call fails:** Pipeline aborts for all 20 symbols; previous day's suggestions remain published; alert sent to operations channel. Error written to `pipeline_runs` with `status = 'FAILED_VOLUME_FETCH'`.

### 1.3 Per-Symbol Processing (repeat for each of 20 symbols sequentially)

For each symbol `S` in the selected 20:

```
Step 1 — Fetch OHLCV data
  Call: get_stock_bars(symbol = S, period = '90d', interval = '1d')
  Purpose: RSI, MACD, Bollinger Bands, volume trend calculation by technical-indicators skill
  On failure: skip symbol S; log ERROR; continue to symbol S+1

Step 2 — Fetch fundamentals
  Call: get_stock_fundamentals(symbol = S)
  Purpose: PE, PB, ROE vs sector average for stock-valuation skill
  On failure: proceed without fundamentals; mark skills_used without 'stock-valuation'

Step 3 — Fetch news
  Call: get_stock_news(symbol = S, days = 7)
  Purpose: catalyst detection, sentiment scoring via news-event-strategy skill
  On failure: proceed without news; mark skills_used without 'news-event-strategy'

Step 4 — Fetch current quote
  Call: get_stock_quote(symbol = S)
  Purpose: current price, ceiling, floor, ref_price for price target context
  On failure: skip symbol S entirely (cannot generate signal without current price)

Step 5 — Run skills (local computation; no LLM)
  Skills always run if their data was fetched successfully:
    - technical-indicators → RSI, MACD, Bollinger Band position, volume_trend_pct
    - candlestick-patterns → reversal/breakout patterns from 90d OHLCV
    - volatility-mean-reversion → volatility percentile, mean reversion signal
  Skills run conditionally:
    - stock-valuation → only if Step 2 succeeded
    - news-event-strategy → only if Step 3 succeeded
  Record which skills contributed to skills_used[]

Step 6 — AI synthesis (LLM call)
  Apply model selection logic (§6)
  Build prompt from skills output (max 4,000 input tokens; §7)
  Call Claude API with structured output schema
  Receive: { signal_type, confidence_raw, analysis_text, price_target, target_pct }

Step 7 — Pre-write assertions (enforce guardrails)
  a. Assert signal_type IN ('BUY_OPPORTUNITY', 'WATCH', 'SELL_CAUTION')
     → Fail: log ERROR "invalid signal_type [value] for [symbol]"; skip symbol
  b. Assert confidence_raw <= 85
     → If > 85: cap to 85; log WARN "confidence_pct capped from [raw] to 85 for [symbol]"
  c. Assert len(analysis_text) <= 150
     → If > 150: trim to 150 chars; log WARN "analysis_text trimmed for [symbol]"
  d. Assert analysis_text does not contain prohibited phrases:
     ["chắc chắn", "đảm bảo lãi", "không rủi ro", "100%", "bảo đảm",
      "mua đi", "bán ngay", "nên đầu tư vào", "chắc chắn tăng"]
     → If phrase found: log ERROR "prohibited phrase in analysis_text for [symbol]: [phrase]"; skip symbol

Step 8 — Write to Supabase
  UPSERT into ai_suggestions ON CONFLICT (symbol_code, DATE(generated_at::date))
  Fields: all columns per §2 data model
  Set is_published = true
  Set valid_until = next trading day's 08:30 ICT
  Record generation_ms, input_tokens, output_tokens

Step 9 — Proceed to next symbol
```

### 1.4 Post-Run Operations

After all 20 symbols processed:

```
1. Write pipeline_runs record:
   { run_date, symbols_processed, symbols_succeeded, symbols_failed,
     total_input_tokens, total_output_tokens, total_generation_ms,
     estimated_cost_usd, status }

2. Cost check:
   If estimated_cost_usd > 2.00: send alert to operations Slack channel
   "AI Suggestions daily cost exceeded $2.00 threshold: $[cost]"
   (does not stop publication; alert only)

3. Expire previous day's suggestions:
   UPDATE ai_suggestions
   SET is_published = false
   WHERE generated_at::date < CURRENT_DATE
     AND is_published = true
   (Only today's newly written records remain published)
```

### 1.5 valid_until Calculation

`valid_until` is set to the next VN trading day's 08:30 ICT:

```
next_trading_day = next calendar day that is:
  - Monday–Friday
  - not in vn_market_holidays for that date

valid_until = next_trading_day at 08:30:00 ICT (UTC+7)
           = next_trading_day at 01:30:00 UTC (stored as timestamptz)
```

On the last trading day before a multi-day holiday: `valid_until` is set to the first trading day after the holiday break at 08:30 ICT. This ensures stale data is still shown (with correct timestamp) over long weekends.

---

## 2. Data Model

### 2.1 `ai_suggestions` Table

```sql
CREATE TABLE ai_suggestions (
  id                bigserial PRIMARY KEY,
  symbol_code       text NOT NULL REFERENCES symbols(code),
  signal_type       text NOT NULL
                    CHECK (signal_type IN ('BUY_OPPORTUNITY', 'WATCH', 'SELL_CAUTION')),
  confidence_pct    int NOT NULL
                    CHECK (confidence_pct >= 0 AND confidence_pct <= 85),
  analysis_text     text NOT NULL
                    CHECK (char_length(analysis_text) <= 150),
  price_current     numeric(20, 4),
  price_target      numeric(20, 4),          -- nullable; null if no target generated
  target_pct        numeric(10, 2),          -- nullable; e.g. 9.50 for "+9,5%"; may be negative
  skills_used       text[] NOT NULL,         -- audit: which skills contributed; e.g. ARRAY['technical-indicators','candlestick-patterns']
  model_used        text NOT NULL,           -- 'claude-haiku-4-5' or 'claude-sonnet-4-5'
  generated_at      timestamptz NOT NULL DEFAULT now(),
  valid_until       timestamptz NOT NULL,    -- next trading day 08:30 ICT
  is_published      boolean NOT NULL DEFAULT false,
  generation_ms     int,                     -- wall-clock ms for this symbol's full pipeline step
  input_tokens      int,                     -- LLM input tokens used
  output_tokens     int                      -- LLM output tokens used
);

-- Prevent duplicate published suggestions for the same symbol on the same calendar day
CREATE UNIQUE INDEX ai_suggestions_symbol_date_idx
  ON ai_suggestions (symbol_code, (generated_at::date))
  WHERE is_published = true;

-- Index for the read API query
CREATE INDEX ai_suggestions_published_valid_idx
  ON ai_suggestions (is_published, valid_until DESC, confidence_pct DESC);
```

**Column definitions:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `bigserial` | NOT NULL | Auto-increment primary key |
| `symbol_code` | `text` | NOT NULL | HOSE ticker; FK to `symbols.code` |
| `signal_type` | `text` | NOT NULL | Constrained to 3 values; see §1.1 of FRD-21 |
| `confidence_pct` | `int` | NOT NULL | 0–85 inclusive; DB CHECK enforces upper bound |
| `analysis_text` | `text` | NOT NULL | ≤ 150 chars; observational language only |
| `price_current` | `numeric(20,4)` | NULL | Price at time of pipeline run (from get_stock_quote) |
| `price_target` | `numeric(20,4)` | NULL | AI-estimated price target; null if pipeline did not generate one |
| `target_pct` | `numeric(10,2)` | NULL | e.g. 9.50 = "+9,5%"; may be negative for downside targets |
| `skills_used` | `text[]` | NOT NULL | Names of skills that provided input; e.g. `['technical-indicators', 'stock-valuation']` |
| `model_used` | `text` | NOT NULL | `'claude-haiku-4-5'` or `'claude-sonnet-4-5'` |
| `generated_at` | `timestamptz` | NOT NULL | UTC timestamp when the pipeline wrote this row |
| `valid_until` | `timestamptz` | NOT NULL | UTC timestamp; row is considered stale after this |
| `is_published` | `boolean` | NOT NULL | Kill switch; false = hidden from all users immediately |
| `generation_ms` | `int` | NULL | Wall-clock milliseconds for this symbol's total pipeline processing |
| `input_tokens` | `int` | NULL | LLM input tokens for this symbol |
| `output_tokens` | `int` | NULL | LLM output tokens for this symbol |

### 2.2 `pipeline_runs` Table

```sql
CREATE TABLE pipeline_runs (
  id                    bigserial PRIMARY KEY,
  run_date              date NOT NULL,
  triggered_at          timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz,
  status                text NOT NULL
                        CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED_VOLUME_FETCH',
                                          'SKIPPED_HOLIDAY', 'PARTIAL')),
  symbol_list           text[],              -- 20 symbols selected for this run
  symbols_processed     int DEFAULT 0,
  symbols_succeeded     int DEFAULT 0,
  symbols_failed        int DEFAULT 0,
  total_input_tokens    int DEFAULT 0,
  total_output_tokens   int DEFAULT 0,
  total_generation_ms   int DEFAULT 0,
  estimated_cost_usd    numeric(10,6),
  error_details         jsonb                -- array of per-symbol errors
);
```

### 2.3 `vn_market_holidays` Table (referenced, not created here)

| Column | Type | Description |
|--------|------|-------------|
| `holiday_date` | `date` PK | Calendar date of VN market holiday |
| `name` | `text` | Holiday name (informational) |

Pipeline reads this at job start to determine whether to run.

---

## 3. API Contract

### 3.1 `GET /api/ai/suggestions`

Returns the current published AI suggestions for the Home screen. No authentication tier differentiation occurs at the API level — the client receives the full payload and applies tier-based display rules (see FRD-21 FR-AS-04, FR-AS-05).

**Authentication:** Required. JWT Bearer token in `Authorization` header. Returns HTTP 401 if absent or invalid.

**Query parameters:** None.

**Caching:** Response is cached in Supabase Edge Cache / CDN for 5 minutes. Individual user requests hitting the cache within 5 minutes of the last pipeline write receive the same response. Cache is invalidated when a new row is written to `ai_suggestions` with `is_published = true`.

**Selection query (executed by the API layer):**

```sql
SELECT
  symbol_code,
  signal_type,
  confidence_pct,
  analysis_text,
  price_current,
  price_target,
  target_pct,
  skills_used,
  generated_at,
  valid_until
FROM ai_suggestions
WHERE is_published = true
ORDER BY confidence_pct DESC, generated_at DESC
LIMIT 20;
```

The API returns up to 20 records. The client renders only the top 3 by confidence_pct (enforced client-side per FRD-21 BR-AS-08). Returning up to 20 allows the client to handle the case where fewer than 3 of the top-confidence cards pass client-side validation.

**Success Response — HTTP 200:**

```json
{
  "suggestions": [
    {
      "symbol_code": "FPT",
      "signal_type": "BUY_OPPORTUNITY",
      "confidence_pct": 78,
      "analysis_text": "FPT đang trong vùng quá bán theo RSI 14, với hỗ trợ mạnh tại 140.000đ. Volume tăng 23% phiên sáng.",
      "price_current": 142500.0000,
      "price_target": 156000.0000,
      "target_pct": 9.50,
      "skills_used": ["technical-indicators", "candlestick-patterns", "stock-valuation"],
      "generated_at": "2026-06-01T11:45:00.000Z",
      "valid_until": "2026-06-02T01:30:00.000Z"
    },
    {
      "symbol_code": "VIC",
      "signal_type": "SELL_CAUTION",
      "confidence_pct": 71,
      "analysis_text": "Phân kỳ âm RSI · khối ngoại bán ròng 5 phiên liên tiếp.",
      "price_current": 41200.0000,
      "price_target": null,
      "target_pct": null,
      "skills_used": ["technical-indicators", "news-event-strategy"],
      "generated_at": "2026-06-01T11:45:00.000Z",
      "valid_until": "2026-06-02T01:30:00.000Z"
    },
    {
      "symbol_code": "VNM",
      "signal_type": "WATCH",
      "confidence_pct": 65,
      "analysis_text": "Vượt MA50 phiên thứ 2 với breakout volume. Cần xác nhận thêm phiên.",
      "price_current": 140500.0000,
      "price_target": 148000.0000,
      "target_pct": 5.33,
      "skills_used": ["technical-indicators", "candlestick-patterns"],
      "generated_at": "2026-06-01T11:45:00.000Z",
      "valid_until": "2026-06-02T01:30:00.000Z"
    }
  ],
  "generated_at": "2026-06-01T11:45:00.000Z",
  "valid_until": "2026-06-02T01:30:00.000Z",
  "total_published": 18
}
```

**Response field definitions:**

| Field | Type | Description |
|-------|------|-------------|
| `suggestions` | `array` | Ordered by `confidence_pct DESC`; up to 20 items |
| `suggestions[].symbol_code` | `string` | HOSE ticker |
| `suggestions[].signal_type` | `string` | One of `BUY_OPPORTUNITY`, `WATCH`, `SELL_CAUTION` |
| `suggestions[].confidence_pct` | `integer` | 0–85 inclusive |
| `suggestions[].analysis_text` | `string` | ≤ 150 characters |
| `suggestions[].price_current` | `number` or `null` | VND; 4 decimal places in DB; integer display on client |
| `suggestions[].price_target` | `number` or `null` | VND; null if no target generated |
| `suggestions[].target_pct` | `number` or `null` | Percentage; e.g. 9.50; null if no target |
| `suggestions[].skills_used` | `string[]` | Skill names that contributed |
| `suggestions[].generated_at` | `string (ISO 8601)` | UTC timestamp of pipeline write |
| `suggestions[].valid_until` | `string (ISO 8601)` | UTC timestamp; after this, data is stale |
| `generated_at` | `string (ISO 8601)` | Same as the most recent `generated_at` in the response |
| `valid_until` | `string (ISO 8601)` | Same as the earliest `valid_until` in the response |
| `total_published` | `integer` | Total count of published suggestions returned before client limit |

**Empty Response — HTTP 200 (no suggestions available):**

```json
{
  "suggestions": [],
  "generated_at": null,
  "valid_until": null,
  "total_published": 0
}
```

The API returns HTTP 200 with an empty array; it does not return HTTP 404 or HTTP 503 when there are simply no suggestions. HTTP 5xx is reserved for infrastructure failures.

**Unauthorized — HTTP 401:**

```json
{
  "code": "E-AUTH-001",
  "message": "Authentication required."
}
```

**Server Error — HTTP 500:**

```json
{
  "code": "E-SYS-002",
  "message": "An unexpected error occurred. Please try again."
}
```

### 3.2 `POST /api/admin/ai-suggestions/:id/unpublish` (Kill Switch)

Allows an admin to set `is_published = false` for a specific suggestion record without a code deploy.

**Authentication:** Required. JWT with `role = 'admin'`. Returns HTTP 403 if role is not admin.

**Path parameter:** `:id` — the `ai_suggestions.id` (bigserial integer).

**Request body:** None required.

**Success Response — HTTP 200:**

```json
{
  "id": 1234,
  "symbol_code": "FPT",
  "is_published": false,
  "unpublished_at": "2026-06-01T14:00:00.000Z",
  "unpublished_by": "admin_user_id_xyz"
}
```

**Not Found — HTTP 404:**

```json
{
  "code": "E-AS-001",
  "message": "Suggestion record not found."
}
```

**Forbidden — HTTP 403:**

```json
{
  "code": "E-AUTH-002",
  "message": "Admin role required."
}
```

**Effect:** The CDN/edge cache is invalidated immediately upon successful unpublish. The next client request receives a response without the unpublished symbol. Cache invalidation must complete within 60 seconds of the API call.

---

## 4. Validation Logic Table

All validation below applies to the pipeline's pre-write assertions (Step 7 in §1.3). The API read path does not re-validate; it trusts the DB constraints.

| Field | Rule | Error Code | Pipeline Action | Exact Log Message |
|-------|------|------------|-----------------|-------------------|
| `signal_type` | Must be one of `'BUY_OPPORTUNITY'`, `'WATCH'`, `'SELL_CAUTION'` | E-AS-PIPE-001 | Skip symbol; do not write | `"[symbol] SKIPPED: invalid signal_type '[value]' from model"` |
| `confidence_pct` (raw from model) | Must be 0–100 integer | E-AS-PIPE-002 | If > 85: cap to 85 and WARN; if < 0: skip symbol | `"[symbol] WARN: confidence_pct [raw] capped to 85"` or `"[symbol] SKIPPED: confidence_pct [raw] below 0"` |
| `analysis_text` | Must be non-null, non-empty string | E-AS-PIPE-003 | Skip symbol | `"[symbol] SKIPPED: analysis_text null or empty"` |
| `analysis_text` length | Must be ≤ 150 chars | E-AS-PIPE-004 | Trim to 150 chars; WARN | `"[symbol] WARN: analysis_text trimmed from [len] to 150 chars"` |
| `analysis_text` prohibited phrases | Must not contain: `"chắc chắn"`, `"đảm bảo lãi"`, `"không rủi ro"`, `"100%"`, `"bảo đảm"`, `"mua đi"`, `"bán ngay"`, `"nên đầu tư vào"`, `"chắc chắn tăng"` | E-AS-PIPE-005 | Skip symbol; do not write | `"[symbol] SKIPPED: prohibited phrase '[phrase]' in analysis_text"` |
| `price_target` | If present: must be numeric > 0 | E-AS-PIPE-006 | If ≤ 0: set to null; WARN | `"[symbol] WARN: price_target [value] invalid; set to null"` |
| `target_pct` | If `price_target` is null: must also be null | E-AS-PIPE-007 | Set `target_pct = null` if `price_target = null` | `"[symbol] WARN: target_pct set to null because price_target is null"` |
| `symbol_code` | Must exist in `symbols` table with `exchange = 'HOSE'` and `status = 'ACTIVE'` | E-AS-PIPE-008 | Skip symbol | `"[symbol] SKIPPED: symbol not found or inactive in symbols table"` |
| LLM output schema | Structured output must include required fields: `signal_type`, `confidence_raw`, `analysis_text` | E-AS-PIPE-009 | Skip symbol | `"[symbol] SKIPPED: LLM structured output missing required field '[field]'"` |
| Input token count | Must not exceed 4,000 tokens before API call | E-AS-PIPE-010 | Truncate least-critical context (news → fundamentals → OHLCV) to fit; WARN | `"[symbol] WARN: input truncated from [n] to 4000 tokens"` |

---

## 5. Error Handling

### 5.1 Pipeline Error Taxonomy

| Error Scenario | Pipeline Behaviour | Operations Alert |
|---------------|-------------------|-----------------|
| Holiday skip | Job exits cleanly; no writes; `pipeline_runs.status = 'SKIPPED_HOLIDAY'` | No alert (expected) |
| Volume fetch fails (Step 1 §1.2) | Job aborts; all 20 symbols skipped; previous day's `is_published = true` rows remain; `pipeline_runs.status = 'FAILED_VOLUME_FETCH'` | Yes — CRITICAL alert |
| Individual symbol: get_stock_quote fails (Step 4 §1.3) | Symbol skipped entirely; no write; continue to next symbol | No — logged at ERROR level; captured in `pipeline_runs.error_details` |
| Individual symbol: get_stock_bars fails (Step 1 §1.3) | Symbol skipped; continue | No — logged at ERROR level |
| Individual symbol: LLM call fails (network / API error) | Retry once after 10 seconds; if second attempt fails: skip symbol | No — logged at ERROR; if > 5 symbols fail: YES alert |
| Individual symbol: LLM returns invalid schema (E-AS-PIPE-009) | Skip symbol; continue | No — logged at ERROR |
| Individual symbol: prohibited phrase (E-AS-PIPE-005) | Skip symbol; continue; review queue entry created | Yes — WARNING alert to compliance channel |
| Supabase write fails for a symbol | Skip symbol; continue; do not retry write | No — logged at ERROR; if > 5 writes fail: YES alert |
| Daily cost threshold exceeded (> $2.00) | Job completes normally; alert sent | Yes — WARNING alert to operations channel |
| < 3 symbols succeed overall | `pipeline_runs.status = 'PARTIAL'`; alert sent | Yes — WARNING alert |
| 0 symbols succeed | `pipeline_runs.status = 'FAILED_ALL'`; alert sent | Yes — CRITICAL alert |

### 5.2 Staleness Handling (API Layer)

The read API does not apply staleness logic; it returns all `is_published = true` rows regardless of `valid_until`. Staleness interpretation is the client's responsibility per FRD-21 §3 and BR-AS-09.

The post-run operation in §1.4 sets `is_published = false` for previous days' data. This means in normal operation, only today's data has `is_published = true`. On weekends and holidays (when the pipeline does not run), yesterday's rows remain `is_published = true` and the client correctly shows them as stale using `valid_until`.

**Staleness enforcement at 72 hours (client-side):**
The client checks: `if (now() - generated_at > 72 * 3600 * 1000) → show empty state`. The API does not enforce this; it is a client display rule.

### 5.3 Kill Switch Behaviour

When an admin calls `POST /api/admin/ai-suggestions/:id/unpublish`:
1. `is_published` set to `false` in Supabase atomically
2. CDN cache invalidated within 60 seconds
3. Next client request returns the suggestion array without the unpublished record
4. If the unpublished record was within the top 3 by confidence_pct, the next eligible published record (4th highest confidence_pct) is returned instead
5. No pipeline re-run is triggered

### 5.4 API Error Codes

| Code | HTTP Status | Trigger | User-Facing Message (if applicable) |
|------|-------------|---------|--------------------------------------|
| E-AUTH-001 | 401 | Missing or invalid JWT | "Authentication required." |
| E-AUTH-002 | 403 | Non-admin calling admin endpoint | "Admin role required." |
| E-AS-001 | 404 | Unpublish: record ID not found | "Suggestion record not found." |
| E-SYS-002 | 500 | Unexpected DB error on read | "An unexpected error occurred. Please try again." |

---

## 6. Model Selection Logic

The pipeline uses a two-model strategy per symbol to balance cost and quality.

### 6.1 Decision Rule

```
For each symbol:

1. Run initial screening pass with claude-haiku-4-5:
   - Input: skills output (technical + fundamentals + news)
   - Output structured: { signal_type, confidence_raw, analysis_text_draft, price_target, target_pct }
   - Max output tokens: 150 (screening only)

2. Evaluate confidence_raw from Haiku:
   - IF confidence_raw > 70:
       Run final analysis pass with claude-sonnet-4-5:
       - Input: same skills output + Haiku's signal_type and confidence_raw as context hint
       - Output structured: { signal_type, confidence_pct, analysis_text, price_target, target_pct }
       - Max output tokens: 300
       - Record model_used = 'claude-sonnet-4-5'
   - ELSE (confidence_raw <= 70):
       Use Haiku's output directly
       - Record model_used = 'claude-haiku-4-5'
       - Upgrade analysis_text_draft to analysis_text (Haiku's full response used)
```

### 6.2 Rationale

| Decision | Reason |
|----------|--------|
| Haiku for all initial passes | Low cost per call; fast; adequate for signal classification |
| Sonnet upgrade threshold = 70 | Signals with confidence_raw > 70 are candidates for the "TIN CẬY" badge and price target; they warrant higher-quality prose analysis |
| Max 20 Sonnet calls per day | In the worst case (all 20 symbols score > 70): 20 Sonnet calls; acceptable within cost budget |
| Sequential processing | Prevents rate-limit exhaustion on the Claude API; 20 symbols × ~6–9 seconds per symbol = 2–3 minutes total |

### 6.3 Prompt Structure

**System prompt (both models):**

```
You are a technical analysis assistant for Paave, a Vietnam stock paper-trading app.
You analyze Vietnamese stock market data and produce structured observations.

Rules:
- Output language: Vietnamese only
- Signal type: ONLY one of [BUY_OPPORTUNITY, WATCH, SELL_CAUTION]
- confidence_pct: integer 0-85 (never exceed 85)
- analysis_text: maximum 150 characters; Vietnamese; observational language only
  (use "đang trong vùng", "phân kỳ âm", "vượt MA50" — never "chắc chắn", "đảm bảo", "mua đi", "bán ngay")
- price_target: numeric in VND or null; only provide if technical basis is clear
- target_pct: percentage relative to price_current; null if price_target is null

Output JSON schema:
{
  "signal_type": "BUY_OPPORTUNITY" | "WATCH" | "SELL_CAUTION",
  "confidence_pct": integer,
  "analysis_text": string (≤150 chars),
  "price_target": number | null,
  "target_pct": number | null
}
```

**User prompt (per symbol):**

```
Analyze [SYMBOL] ([EXCHANGE]) using the following data:

TECHNICAL INDICATORS:
[skills output from technical-indicators: RSI, MACD, BB, volume_trend_pct]

CANDLESTICK PATTERNS:
[skills output from candlestick-patterns: detected patterns]

VOLATILITY / MEAN REVERSION:
[skills output from volatility-mean-reversion: percentile, signal]

FUNDAMENTALS (if available):
[skills output from stock-valuation: PE vs sector, PB, ROE]

NEWS (last 7 days, if available):
[skills output from news-event-strategy: headlines, sentiment, catalysts]

CURRENT PRICE DATA:
price_current: [value] VND
ref_price: [value] VND
ceiling_price: [value] VND
floor_price: [value] VND

Generate the structured analysis output.
```

---

## 7. Token Budget

| Budget Item | Limit | Action on Breach |
|-------------|-------|-----------------|
| Input tokens per symbol (total, all calls) | 4,000 tokens | Truncate context: drop news items first, then reduce fundamentals to PE/PB only, then reduce OHLCV to 30d. Log WARN. |
| Output tokens per symbol (Haiku screening) | 150 tokens | Enforced via `max_tokens = 150` in API call |
| Output tokens per symbol (Sonnet final) | 300 tokens | Enforced via `max_tokens = 300` in API call |
| Total daily input tokens (20 symbols × 2 passes worst case) | ~160,000 tokens | No hard stop; alert if daily cost > $2.00 |
| Total daily output tokens (20 symbols × 2 passes worst case) | ~9,000 tokens | No hard stop; alert if daily cost > $2.00 |

**Context priority order (when truncation is needed):**

1. Drop oldest news items first (keep most recent 3)
2. Reduce fundamentals to PE and ROE only (drop PB, sector detail)
3. Reduce OHLCV from 90d to 30d
4. If still over limit: proceed with available context; log WARN

---

## 8. Cost Monitoring

### 8.1 Per-Symbol Cost Estimation

Cost is estimated using Claude API pricing at time of pipeline write:

```
estimated_cost_per_symbol = (input_tokens / 1,000,000) × input_price_per_m
                           + (output_tokens / 1,000,000) × output_price_per_m
```

Reference pricing (as of 2026-06-01; update if Anthropic pricing changes):

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|-----------------------|------------------------|
| claude-haiku-4-5 | $0.80 | $4.00 |
| claude-sonnet-4-5 | $3.00 | $15.00 |

Pipeline stores `estimated_cost_usd` per `pipeline_runs` record. This is an estimate; actual billing reconciles monthly against Anthropic invoices.

### 8.2 Cost Alert Thresholds

| Threshold | Alert Channel | Alert Message |
|-----------|--------------|---------------|
| Daily run cost > $2.00 | Operations Slack `#alerts-infra` | `"AI Suggestions daily cost exceeded $2.00: $[actual] on [date]. Review model selection or symbol count."` |
| Any single symbol cost > $0.20 | `#alerts-infra` WARN | `"High per-symbol cost: $[cost] for [symbol] on [date]."` |

### 8.3 Cost Dashboard Fields (for observability)

The `pipeline_runs` table supports a daily cost dashboard:

| Metric | Source |
|--------|--------|
| Total daily input tokens | `SUM(input_tokens)` from `ai_suggestions` where `run_date = today` |
| Total daily output tokens | `SUM(output_tokens)` |
| Estimated daily cost | `pipeline_runs.estimated_cost_usd` |
| Haiku vs Sonnet split | `COUNT(*) GROUP BY model_used` |
| Symbols skipped | `pipeline_runs.symbols_failed` |

---

## 9. Non-Functional Requirements

| Requirement | Specification | Measurement Method |
|-------------|-------------|-------------------|
| Zero LLM calls per user page view | The read API must serve from DB only; no LLM call triggered by `GET /api/ai/suggestions` | Code review: assert no LLM client initialisation in the API handler |
| Pipeline completion time (P95) | All 20 symbols processed within 5 minutes of 18:45 ICT | GitHub Actions run duration log; alert if > 5 minutes |
| API response time (P95) | `GET /api/ai/suggestions` responds within 200ms | APM: measure from request receipt to response body sent |
| API response time (P99) | < 500ms | Same |
| CDN cache hit rate | > 95% of user requests served from cache during Home screen peak hours (19:00–21:00 ICT) | CDN metrics |
| Kill switch propagation | `is_published = false` reflected in all client responses within 60 seconds | Integration test: unpublish → poll API every 5 seconds; assert symbol absent within 60s |
| Pipeline idempotency | Re-running the pipeline on the same date must not create duplicate `ai_suggestions` rows. `UPSERT ON CONFLICT (symbol_code, generated_at::date) WHERE is_published = true` enforces this. | Integration test: run pipeline twice on same date; assert row count unchanged |
| Prohibited phrase absence (production) | Zero published rows with prohibited phrases must reach the client | Daily automated scan: `SELECT * FROM ai_suggestions WHERE is_published = true AND (analysis_text ILIKE '%chắc chắn%' OR analysis_text ILIKE '%đảm bảo lãi%' OR ...)` must return 0 rows |
| confidence_pct constraint (production) | Zero published rows with `confidence_pct > 85` | DB CHECK constraint + daily assertion query |
| Log retention | Pipeline logs (per-symbol timing, token counts, errors) retained for 30 days | Configured in logging infrastructure |

---

## 10. Related Documents

| Document | Location | Relationship |
|----------|----------|-------------|
| FRD-21: AI Suggestions | `docs/business/frd/21-ai-suggestions.md` | Functional requirements that this SRD implements |
| FRD-09: Age Gate & Feature Tier | `docs/business/frd/09-age-gate.md` | LEARN_MODE / FULL_ACCESS definitions; tier check is client-side |
| FRD-12: AI Insights | `docs/business/frd/12-ai-insights.md` | Adjacent AI feature; post-trade explanation (per-event LLM call, not batch) |
| FRD-15: Legal Disclaimers | `docs/business/frd/15-legal-disclaimers.md` | Disclaimer text governance |
| FRD-02: Home Screen | `docs/business/frd/02-home-screen.md` | Host screen where the API response is consumed |
| BRD.md | `docs/business/frd/BRD.md` | Business objectives this feature serves |

---

*End of SRD-21: AI Suggestions — Daily Signal Generation Pipeline & API*
*Version 1.0 — 2026-06-01. Authoritative for V1 pipeline and read API.*

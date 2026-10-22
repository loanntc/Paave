# AI Suggestions Feature Review — Overview
**Date:** 2026-06-02
**Reviewer:** Code Reviewer Agent (Principal Engineer)
**Scope:** BRD-21 + FRD-21 + SRD-21 vs implementation (`run-pipeline.ts`, `20260601090000_ai_suggestions.sql`, `ai-suggestions.yml`) vs available Vibe-Trading skills

---

## Key Findings

1. **`GET /api/ai/suggestions` does not exist.** The read API specified in SRD-21 §3.1 has no implementation. The migration creates a DB function (`get_ai_suggestions_today()`) but there is no Next.js route file at `app/api/ai/suggestions/route.ts`. The feature cannot be consumed by any client.

2. **Both admin kill-switch endpoints are absent.** `POST /api/admin/ai-suggestions/:id/unpublish` and the `publish` reversal are P0 compliance requirements (FR-AS-13, BR-AS-10) with no implementation.

3. **Two required DB tables are missing from the migration.** `ai_suggestion_outcomes` (SRD-21 §12.1) and `ai_pipeline_config` (SRD-21 §13.1) are specified as "Migration 0010" but that migration file does not exist at all in the codebase.

4. **Cost estimation is incorrect.** `run-pipeline.ts` line 473 calculates cost using Haiku pricing for all tokens, even when Sonnet was used for upgraded symbols. The per-symbol cost can be underestimated by up to 4×.

5. **Holiday skip logic is missing from the pipeline.** SRD-21 §1.1 requires reading `vn_market_holidays` at job start and exiting with `SKIPPED_HOLIDAY`. The pipeline has no such check; it will run on VN public holidays.

6. **Signal diversity rules are not enforced.** FRD-21 FR-AS-11 requires (a) at least 1 SELL_CAUTION in every 7 days' top-3, and (b) ≥ 2 different sectors in the top-3. Neither rule is implemented in the pipeline.

7. **Skills are invoked by name-string only; actual skill computation is not performed.** `skills_used` is hardcoded to `["technical-indicators", "stock-valuation", "news-event-strategy"]` regardless of which data was actually available. The pipeline does not load or execute any skill module — it inlines only SMA/volume ratio, omitting RSI, MACD, Bollinger Bands, ADX, OBV, and candlestick patterns that the skills provide.

8. **The `pipeline_runs` / `ai_suggestion_runs` table schema mismatch.** The migration creates `ai_suggestion_runs` (no FK to pipeline run per symbol), but the pipeline code writes to `ai_suggestion_runs` using fields `symbols_attempted`, `symbols_published`, `symbols_skipped`. The SRD-21 §2.2 spec defines `pipeline_runs` with `symbol_list text[]`, `symbols_processed`, `symbols_succeeded`, `symbols_failed`. The column names differ: `symbols_succeeded` (SRD) vs `symbols_published` (code); `symbols_failed` (SRD) vs `symbols_skipped` (code); `symbol_list` (SRD) is not written at all.

9. **No Slack/ops alerting implemented.** SRD-21 §5.1 and §8.2 require Slack alerts to `#alerts-infra` for CRITICAL failures and cost overruns. The pipeline only logs to console and a local JSON file.

10. **`valid_until` calculation is naïve.** `run-pipeline.ts` line 370–372 sets `valid_until` to "next calendar day 01:30 UTC" without consulting `vn_market_holidays`, so on Fridays it will set an expiry of Saturday 08:30 ICT instead of Monday 08:30 ICT, causing weekend stale display to fail.

---

## Summary Table — All Gaps

| Feature / Requirement | Spec Ref | In Code | In Migration | Skills Leveraged | Gap | Priority |
|---|---|---|---|---|---|---|
| `GET /api/ai/suggestions` route | SRD-21 §3.1 | No | Helper fn only | N/A | Route file missing entirely | P0 |
| Admin kill-switch endpoints (unpublish / publish) | SRD-21 §3.2, FR-AS-13 | No | N/A | N/A | Both endpoints missing | P0 |
| Holiday skip logic in pipeline | SRD-21 §1.1 | No | N/A | N/A | Pipeline runs on holidays | P0 |
| `ai_suggestion_outcomes` table | SRD-21 §12.1 | No | No | N/A | Migration 0010 not created | P0 |
| `ai_pipeline_config` table | SRD-21 §13.1 | No | No | N/A | Migration 0010 not created | P0 |
| Signal accuracy evaluation job | SRD-21 §12.2 | No | N/A | N/A | GH Actions job missing | P0 |
| Admin read access to `ai_suggestion_runs` | SRD-21 §11 | No | Svc-role only | N/A | No admin RLS policy | P1 |
| `valid_until` correct holiday-aware calculation | SRD-21 §1.5 | Partial | N/A | N/A | Naïve +1 day, no holiday lookup | P0 |
| Cost estimation (Sonnet-aware) | SRD-21 §8.1 | Partial | N/A | N/A | Uses Haiku prices for all tokens | P1 |
| `symbols_succeeded` / `symbols_failed` field names | SRD-21 §2.2 | Mismatched | Mismatched | N/A | Code writes `symbols_published`/`symbols_skipped`; spec defines `symbols_succeeded`/`symbols_failed` | P1 |
| `symbol_list text[]` field in run log | SRD-21 §2.2 | Not written | Not in schema | N/A | Field omitted | P1 |
| `status` field in run log (RUNNING/COMPLETED/etc.) | SRD-21 §2.2 | Not written | Not in schema | N/A | `status` CHECK constraint missing | P1 |
| SELL_CAUTION at least once per 7-day window | FRD-21 FR-AS-11 | No | N/A | N/A | Not implemented | P1 |
| Sector diversity rule (≥ 2 sectors in top-3) | FRD-21 FR-AS-11, BR-AS-11 | No | N/A | N/A | Not implemented | P1 |
| `confidence_raw < 55 → force WATCH` rule | FRD-21 FR-AS-11 | No | N/A | N/A | Not enforced; only Sonnet threshold applied | P1 |
| Slack ops alerts (CRITICAL / WARNING) | SRD-21 §5.1, §8.2 | No | N/A | N/A | Only console log + JSON artifact | P1 |
| Per-symbol cost logging to `ai_suggestions` | SRD-21 §8.1 | Partial | Columns exist | N/A | `input_tokens`/`output_tokens` written per symbol, but estimated cost per symbol not | P2 |
| `ai_suggestion_filter_log.run_date` FK check | SRD-21 §11 | N/A | No FK | N/A | `run_date` is a bare date, no FK to `ai_suggestion_runs` | P2 |
| **RSI(14) actual computation** | SRD-21 §1.3 Step 5, §10.2 | No — SMA only | N/A | technical-basic: ✗ not loaded | Largest signal-quality gap | P0 |
| **MACD computation** | SRD-21 §1.3 Step 5 | No | N/A | technical-basic: ✗ not loaded | Missing from prompt | P1 |
| **Bollinger Band position** | SRD-21 §1.3 Step 5 | No | N/A | technical-basic: ✗ not loaded | Missing from prompt | P1 |
| **ADX / trend strength** | SRD-21 §1.3 Step 5 | No | N/A | technical-basic: ✗ not loaded | Missing from prompt | P2 |
| **OBV / volume-price trend** | SRD-21 §1.3 Step 5 | No | N/A | technical-basic: ✗ not loaded | Missing from prompt | P2 |
| **Candlestick pattern detection** | SRD-21 §1.3 Step 5 | No | N/A | candlestick: ✗ not loaded | 15 patterns not passed to model | P1 |
| **Volatility percentile / mean reversion** | SRD-21 §1.3 Step 5 | No | N/A | volatility: ✗ not loaded | HV percentile not in prompt | P1 |
| **PE vs sector median comparison** | SRD-21 §10.2 (BUY condition) | Partial — raw PE only | N/A | valuation-model: partial | Sector median not computed; BR-AS-09 condition unchecked | P1 |
| **behavioral-finance / sentiment skill** | SRD-21 §1.3 Step 3 (news catalyst) | No | N/A | behavioral-finance: ✗ not used | Foreign net-sell indicator missing | P1 |
| **multi-factor ranking for symbol scoring** | Not in spec; skill available | No | N/A | multi-factor: ✗ not used | Opportunity to strengthen confidence scoring | P2 |
| **risk-analysis skill for price target range** | Not in spec; skill available | No | N/A | risk-analysis: ✗ not used | VaR-based price target bounds not used | P2 |
| `total_published` field in API response | SRD-21 §3.1 | No | N/A | N/A | No route exists yet | P0 (blocked by route) |
| RLS policy for admin to read `ai_suggestion_runs` | SRD-21 §11 | No | Only svc_role | N/A | Ops team cannot run monitoring queries from dashboard | P1 |
| `get_ai_suggestions_today()` excludes `skills_used` | SRD-21 §3.1 | Partial | Yes — fn missing `skills_used` | N/A | `skills_used` missing from helper fn SELECT | P1 |

**Gap totals:**
- P0 (blocks feature going live): **8**
- P1 (should fix this sprint): **16**
- P2 (enhancement / deferrable): **7**

---

## Verdict by Category

| Category | Verdict |
|---|---|
| Read API | BLOCKED — no route file exists |
| Admin kill-switch API | BLOCKED — no route file exists |
| Pipeline core logic | PARTIAL — runs and writes suggestions, but with critical gaps (holiday skip, valid_until, cost estimation, skill depth) |
| Database schema | PARTIAL — `ai_suggestions`, `ai_suggestion_runs`, `ai_suggestion_filter_log` created; `ai_suggestion_outcomes` and `ai_pipeline_config` missing |
| Skills integration | WEAK — only raw SMA/volume passed to model; RSI, MACD, Bollinger Bands, candlestick, volatility, valuation, and sentiment signals absent |
| Compliance guardrails | ADEQUATE for phrase filtering, confidence cap, and signal type enum; MISSING for SELL_CAUTION diversity and sector diversity rules |
| Monitoring / alerting | MISSING — no Slack integration; only console output |

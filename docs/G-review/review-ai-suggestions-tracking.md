# AI Suggestions Feature Review — Prioritized Task Tracking
**Date:** 2026-06-02
**Reviewer:** Code Reviewer Agent (Principal Engineer)
**Source documents:** review-ai-suggestions-overview.md, review-ai-suggestions-be.md, review-ai-suggestions-skills.md

---

## Legend

- **P0** — Must be fixed before the feature goes live. Blocks launch or constitutes a compliance/data-integrity failure.
- **P1** — Should be fixed this sprint. Spec violation, correctness bug, or significant quality gap.
- **P2** — Enhancement opportunity. Spec-compliant but improvable; can defer to V1.x.

---

## P0 Tasks — Feature Cannot Go Live Without These

| # | Task | Detail | Owner | Est | Status |
|---|---|---|---|---|---|
| P0-01 | Create `GET /api/ai/suggestions` route | New file `app/api/ai/suggestions/route.ts`. Bearer JWT auth (HTTP 401 if absent). Query `get_ai_suggestions_today()` or direct SQL per SRD-21 §3.1. Return exact JSON shape including top-level `generated_at`, `valid_until`, `total_published`. Add 5-minute `Cache-Control` header. See BE review §1.1 | Backend | 0.5d | TODO |
| P0-02 | Create admin kill-switch endpoints | New files `app/api/admin/ai-suggestions/[id]/unpublish/route.ts` and `.../publish/route.ts`. Admin JWT check (HTTP 403 if not admin). UPDATE `is_published` in Supabase. Cache invalidation. See BE review §1.2 and SRD-21 §3.2 | Backend | 0.5d | TODO |
| P0-03 | Add holiday skip logic to pipeline | Read `vn_market_holidays` at startup. Exit with `SKIPPED_HOLIDAY` status if today is a holiday. Write run log entry. See BE review §2.1 and SRD-21 §1.1 | Backend | 0.25d | TODO |
| P0-04 | Fix `valid_until` to use next VN trading day | Walk forward from tomorrow using `vn_market_holidays` table to find the next Mon–Fri non-holiday. Set `valid_until` to that date at 08:30 ICT. See BE review §2.2 and SRD-21 §1.5 | Backend | 0.25d | TODO |
| P0-05 | Create migration 0010: `ai_suggestion_outcomes` table | SQL as specified in SRD-21 §12.1. Include both indexes. Enable RLS with service_role write access. See BE review §3.1 | Backend | 0.25d | TODO |
| P0-06 | Create migration 0010: `ai_pipeline_config` table with seed data | SQL as specified in SRD-21 §13.1. Insert seed rows for `suggestion_prompt_template`, `max_symbols_per_run`, `sonnet_upgrade_threshold`, `confidence_cap`, `prohibited_phrases`. See BE review §3.2 | Backend | 0.25d | TODO |
| P0-07 | Compute RSI(14) in `buildPrompt()` and pass to model | Implement Wilder EWM RSI from `closes` array. Add `RSI(14): [value] → [oversold/overbought/neutral]` to TECHNICAL INDICATORS section of prompt. This enables the primary BUY/SELL conditions. See Skills review §2.1 | Backend | 0.5d | TODO |
| P0-08 | Compute MACD in `buildPrompt()` and pass to model | EMA12/EMA26 from closes. Add MACD line, signal line, histogram to prompt. See Skills review §2.1 | Backend | 0.25d | TODO |
| P0-09 | Fix unique constraint: partial index instead of table constraint | Drop `constraint uq_ai_sugg_symbol_date` and create partial unique index `WHERE is_published = true` as specified in SRD-21 §2.1. Without this, pipeline re-runs on the same date fail for symbols that had a failed (is_published=false) write. See BE review §3.6 | Backend | 0.25d | TODO |
| P0-10 | Add `skills_used` to `get_ai_suggestions_today()` function | Migration fix or CREATE OR REPLACE: add `s.skills_used` to the SELECT list. Required by SRD-21 §3.1 API response schema. See BE review §3.4 | Backend | 0.1d | TODO |

---

## P1 Tasks — Fix This Sprint

| # | Task | Detail | Owner | Est | Status |
|---|---|---|---|---|---|
| P1-01 | Create accuracy evaluation GitHub Actions job | New job in `ai-suggestions.yml` (or separate workflow). Runs daily at 09:00 ICT. Fetches suggestions from T-10 and T-30, computes `actual_return_pct`, writes to `ai_suggestion_outcomes`. See BE review §4.1 and SRD-21 §12.2 | Backend | 1d | TODO |
| P1-02 | Fix cost estimation to use per-model pricing | Track Haiku and Sonnet token counts separately during pipeline loop. Compute final cost using correct per-model rates. See BE review §2.3. Current formula (line 471–474) underestimates Sonnet cost by up to 4× | Backend | 0.25d | TODO |
| P1-03 | Reconcile prohibited phrase list with spec | Add `"mua đi"` and `"nên đầu tư vào"` to `PROHIBITED_PHRASES` array (currently absent, violating BRD-21 BR-AS-05). See BE review §2.5 | Backend | 0.1d | TODO |
| P1-04 | Implement SELL_CAUTION 7-day diversity rule | After pipeline loop, check `ai_suggestions` for the past 7 days. If no SELL_CAUTION published, override the lowest-confidence BUY_OPPORTUNITY to SELL_CAUTION. See BE review §2.6 and FRD-21 FR-AS-11 | Backend | 0.5d | TODO |
| P1-05 | Implement sector diversity rule for top-3 | Post-pipeline: query `symbols.sector` for today's written suggestions. If top-3 by confidence share a sector, replace the 3rd with the next eligible symbol from a different sector. See BE review §2.6 and FRD-21 BR-AS-11 | Backend | 0.5d | TODO |
| P1-06 | Add Slack webhook alerting | Implement `sendSlackAlert(message, level)` using `SLACK_WEBHOOK_URL` env var. Call on: volume fetch failure, < 3 symbols published, cost > $2.00 threshold, and prohibited phrase detection. See BE review §2.7 and SRD-21 §5.1/§8.2 | Backend | 0.5d | TODO |
| P1-07 | Build `skills_used` dynamically from available data | Replace hardcoded `["technical-indicators", "stock-valuation", "news-event-strategy"]` with a list built from which data fetches succeeded. Exclude `stock-valuation` if `fundamentals` is null; exclude `news-event-strategy` if `news` is empty array. See BE review §2.4 | Backend | 0.25d | TODO |
| P1-08 | Add Bollinger Band %B to `buildPrompt()` | Compute upper/middle/lower band from closes using 20-period std dev. Add %B position (0=lower band, 1=upper band) to prompt. See Skills review §2.1 | Backend | 0.25d | TODO |
| P1-09 | Add candlestick pattern detection to `buildPrompt()` | Detect last 3–5 session patterns from OHLCV bars (at minimum: Hammer, Shooting Star, Engulfing, Doji). Add detected pattern names and composite score to prompt. See Skills review §2.2 | Backend | 0.5d | TODO |
| P1-10 | Add volatility percentile to `buildPrompt()` | Compute HV(20d) and its percentile rank in 90-day window. Add `Historical volatility (20d): [x]%, percentile: [y]th` to prompt. See Skills review §2.3 | Backend | 0.25d | TODO |
| P1-11 | Include `sentiment_score` in news context | `insights_news.sentiment_score` is already fetched (line 136) but dropped from the prompt (line 164). Add to each news bullet: `[sentiment: x]`. Zero extra DB cost. See Skills review §2.5 | Backend | 0.1d | TODO |
| P1-12 | Add sector median PE comparison | Fetch sector for the symbol from `symbols` table. Compute or look up median PE for that sector. Add to prompt: `PE [x] vs sector median [y] → [below/at/above]`. Enables BR-AS spec BUY condition. See Skills review §2.4 | Backend | 0.5d | TODO |
| P1-13 | Fix `ai_suggestion_runs` schema to match SRD-21 §2.2 | Migration: add `status text CHECK (...)` column, `symbol_list text[]` column, `error_details jsonb` column. Rename `symbols_published → symbols_succeeded`, `symbols_skipped → symbols_failed` to align with spec. Update pipeline code accordingly. See BE review §3.3 | Backend | 0.5d | TODO |
| P1-14 | Add `confidence_raw < 55 → force WATCH` rule to pipeline | In `applyGuardrails`, after parsing `confidence_raw`: if `signal_type` is BUY_OPPORTUNITY or SELL_CAUTION and `confidence_raw < 55`, override to WATCH. See FRD-21 FR-AS-11 AC-AS-11-06 | Backend | 0.1d | TODO |
| P1-15 | Add admin RLS policy to `ai_suggestion_runs` | New policy: `admin` role (or custom admin claim) can SELECT from `ai_suggestion_runs` and `ai_suggestion_filter_log`. Required for ops monitoring queries without service_role. See BE review §3.5 | Backend | 0.1d | TODO |
| P1-16 | Split `buildPrompt()` into system + user prompt | Move compliance rules, output schema, prohibited phrase reminder to a `system:` parameter. Keep per-symbol data in the `messages[0]` user turn. Matches SRD-21 §6.3 and existing `agent.ts` pattern. See Skills review §4 | Backend | 0.25d | TODO |
| P1-17 | Fix Haiku screening pass `max_tokens` to 150 | `callClaude()` currently uses `max_tokens: 300` for both models. SRD-21 §6.1 specifies max_tokens=150 for Haiku screening. See Skills review §5 | Backend | 0.1d | TODO |

---

## P2 Tasks — Enhancement / Can Defer

| # | Task | Detail | Owner | Est | Status |
|---|---|---|---|---|---|
| P2-01 | Add ADX(14) trend strength to prompt | Compute full ADX chain (+DM/-DM → TR → +DI/-DI → DX → ADX). Add to prompt: `ADX(14): [x] → [trending >25 / ranging]`. Prevents false BUY signals in ranging markets. See Skills review §2.1 | Backend | 0.5d | TODO |
| P2-02 | Add OBV direction to prompt | Compute OBV as `Σ(volume × sign(close_diff))`. Track 5-session trend direction. Add to prompt. See Skills review §2.1 | Backend | 0.25d | TODO |
| P2-03 | Add foreign net buy/sell flow (if available in DB) | Query `symbol_day_bars` or a dedicated table for `foreign_buy_vol`, `foreign_sell_vol`. Compute 5-session consecutive net sell indicator. Enables SELL_CAUTION condition from SRD-21 §10.2. See Skills review §2.5 | Backend | 0.5d | TODO |
| P2-04 | Add VaR-based price target constraint to prompt | Compute historical VaR(95%, 10d) from `closes`. Add suggested target range to prompt to constrain model's `price_target` generation. See Skills review §2.7 | Backend | 0.5d | TODO |
| P2-05 | Add `pipeline_config` read at startup | After migration 0010 lands: read `ai_pipeline_config` at pipeline start. Use DB values for `sonnet_upgrade_threshold`, `confidence_cap`, `prohibited_phrases` if present; fall back to hardcoded values. Log `config_source`. See SRD-21 §13.2 | Backend | 0.5d | TODO |
| P2-06 | Add multi-factor ranking as symbol prioritization | After resolving top-20 by volume, compute composite momentum/PE/volatility score per symbol. Process highest-scoring symbols first to maximize signal quality per run. See Skills review §2.6 | Backend | 1d | TODO |
| P2-07 | Add `ai_suggestion_filter_log.run_date` FK to `ai_suggestion_runs` | Migration: add `REFERENCES ai_suggestion_runs(run_date)` to tighten referential integrity for filter log queries. See BE review §3 | Backend | 0.1d | TODO |

---

## Summary Counts

| Priority | Count | Estimated Total |
|---|---|---|
| P0 (blocks launch) | 10 | ~3.6d |
| P1 (this sprint) | 17 | ~6.1d |
| P2 (enhancement) | 7 | ~3.35d |
| **Total** | **34** | **~13d** |

---

## Recommended Launch Sequence

1. **Week 1:** P0-01 through P0-10 (API routes + migration fixes + RSI/MACD in prompt) — unblocks the full feature flow
2. **Week 2:** P1-01 through P1-08 (accuracy job + cost fix + phrase list + diversity rules + Slack + Bollinger/candlestick)
3. **Week 2-3:** P1-09 through P1-17 (remaining prompt enrichment + schema alignment)
4. **Post-launch:** P2-01 through P2-07 as backlog items

**Hard gate:** P0 tasks must all be complete before any QA sign-off or production deployment. The compliance test cases in FRD-21 §6 (AC-SET-01, AC-SET-02) cannot pass without the `GET /api/ai/suggestions` route (P0-01) and the LEARN_MODE rendering logic that depends on it.

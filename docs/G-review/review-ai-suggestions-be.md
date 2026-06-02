# AI Suggestions Feature Review — Backend Deep-Dive
**Date:** 2026-06-02
**Reviewer:** Code Reviewer Agent (Principal Engineer)
**Files reviewed:**
- `/Users/loannguyen/Paave/scripts/ai-suggestions/run-pipeline.ts`
- `/Users/loannguyen/Paave/supabase/migrations/20260601090000_ai_suggestions.sql`
- `/Users/loannguyen/Paave/.github/workflows/ai-suggestions.yml`
- `/Users/loannguyen/Paave/app/api/ai/chat/route.ts` (pattern reference)
- `/Users/loannguyen/Paave/lib/ai/agent.ts` (pattern reference)

---

## 1. Missing API Endpoints

### 1.1 `GET /api/ai/suggestions` — Does Not Exist

**Spec:** SRD-21 §3.1
**Code:** No file at `app/api/ai/suggestions/route.ts` (confirmed by directory scan — only `app/api/ai/chat/route.ts` exists)

This is the entire read surface of the feature. The migration creates a DB helper function (`get_ai_suggestions_today()`) but no Next.js route consumes it. The Home screen client has nothing to call.

The function in the migration also omits `skills_used` from its SELECT, which is required in the API response per SRD-21 §3.1 response schema.

**What must be built:**
- `app/api/ai/suggestions/route.ts` — GET handler with JWT auth (401 on missing/invalid), query `get_ai_suggestions_today()` or the direct SQL from SRD-21 §3.1, return response matching the exact JSON shape in SRD-21 §3.1 including `generated_at`, `valid_until`, and `total_published` top-level fields, 5-minute CDN cache header.

Pattern reference: `app/api/ai/chat/route.ts` for Supabase cookie client auth. `lib/ai/agent.ts` is not relevant here (no LLM calls in the read API — zero per spec).

### 1.2 `POST /api/admin/ai-suggestions/:id/unpublish` — Does Not Exist

**Spec:** SRD-21 §3.2, FRD-21 FR-AS-13
**Code:** No `app/api/admin/` directory at all.

This is a P0 compliance requirement. The kill switch is the primary incident response tool (BR-AS-10). Without it, a problematic signal cannot be removed from production without a code deploy, violating the 60-second propagation SLA.

**What must be built:**
- `app/api/admin/ai-suggestions/[id]/unpublish/route.ts` — POST handler, require JWT with `role = 'admin'` (HTTP 403 if not), UPDATE `is_published = false` where `id = :id`, invalidate CDN cache, return `{ id, symbol_code, is_published: false, unpublished_at, unpublished_by }` or HTTP 404 if record not found.
- `app/api/admin/ai-suggestions/[id]/publish/route.ts` — reversal endpoint per FR-AS-13.

---

## 2. Pipeline Gaps vs SRD-21

### 2.1 Holiday Skip Logic Missing

**Spec:** SRD-21 §1.1 — "At job start, pipeline reads `vn_market_holidays` for the current ICT date. If today is a holiday, the job exits with status `SKIPPED_HOLIDAY`."
**Code:** `run-pipeline.ts` lines 353–530 — no holiday check anywhere.

**Impact:** The pipeline runs on VN public holidays (Tết, National Day, etc.), producing signals against no trading activity for that day. Signals will have `generated_at` on a holiday date, confusing clients and ops.

**Fix required:**
```typescript
// After line 376 (after resolveSymbols() but at pipeline start)
const { data: holidayRow } = await supabase
  .from('vn_market_holidays')
  .select('holiday_date')
  .eq('holiday_date', today)
  .single();

if (holidayRow) {
  console.log(`[pipeline] Today (${today}) is a VN market holiday. Exiting with SKIPPED_HOLIDAY.`);
  await supabase.from('ai_suggestion_runs').upsert({
    run_date: today, status: 'SKIPPED_HOLIDAY',
    symbols_attempted: 0, symbols_published: 0, symbols_skipped: 0,
    finished_at: new Date().toISOString(),
  }, { onConflict: 'run_date' });
  process.exit(0);
}
```

### 2.2 `valid_until` Calculation Is Naïve

**Spec:** SRD-21 §1.5 — "`valid_until` is set to the next VN trading day's 08:30 ICT ... next calendar day that is Monday–Friday AND not in `vn_market_holidays`."
**Code:** `run-pipeline.ts` lines 369–372:

```typescript
const validUntil = new Date();
validUntil.setUTCDate(validUntil.getUTCDate() + 1);
validUntil.setUTCHours(1, 30, 0, 0);
```

This always adds exactly one calendar day. On Friday, `valid_until` becomes Saturday 08:30 ICT. The API correctly returns the Friday suggestion with `valid_until` in the past by Saturday morning, so the client switches to S-AS-02 (stale) immediately — correct — but the client needs to keep showing stale until Monday. Per SRD-21 §1.5, `valid_until` for a Friday pipeline run should be set to the following Monday 08:30 ICT (or later if Monday is a holiday), not Saturday.

The current calculation causes the client to see `valid_until < now()` on Saturday morning after only ~14 hours, which is technically correct for staleness checking, but the 72-hour window (FR-AS-08) is counted from `generated_at`, not `valid_until`, so the stale display will still work. The behavioral impact is minor but the spec contract is violated.

**Fix required:** After Step 1 of the pipeline, query `vn_market_holidays` to walk forward from tomorrow until a non-holiday weekday is found.

### 2.3 Cost Estimation Underestimates Sonnet Upgrades

**Spec:** SRD-21 §8.1 — per-symbol cost = `(input_tokens / 1M) × input_price_per_m + (output_tokens / 1M) × output_price_per_m` using the model actually used.
**Code:** `run-pipeline.ts` lines 471–474:

```typescript
stats.estimated_cost_usd =
  (stats.total_input_tokens / 1_000_000) * PRICING[HAIKU_MODEL].input +
  (stats.total_output_tokens / 1_000_000) * PRICING[HAIKU_MODEL].output;
```

All tokens are priced at Haiku rates even when Sonnet was used. Haiku: $0.80/$4.00 per 1M. Sonnet: $3.00/$15.00. For a symbol where both Haiku and Sonnet ran, the true input cost is 3.75× higher than estimated. In the worst case (all 20 symbols trigger Sonnet), the cost alert at `$2.00` will not fire when it should.

**Code comment on line 471** even acknowledges this: `// Rough cost estimate (assumes all on Haiku; Sonnet upgrades add ~3x for upgraded symbols)` — this is a known gap that should be flagged, not silently underestimated.

**Fix required:** Track tokens and model separately per symbol, compute cost per model:
```typescript
// Store per-symbol model in a map during processing
// Then sum correctly:
stats.estimated_cost_usd = 
  (haikuInputTokens / 1_000_000) * PRICING[HAIKU_MODEL].input +
  (haikuOutputTokens / 1_000_000) * PRICING[HAIKU_MODEL].output +
  (sonnetInputTokens / 1_000_000) * PRICING[SONNET_MODEL].input +
  (sonnetOutputTokens / 1_000_000) * PRICING[SONNET_MODEL].output;
```

### 2.4 `skills_used` Is Hardcoded, Not Conditional

**Spec:** SRD-21 §1.3 Step 5 — "Record which skills contributed to `skills_used[]`."
**Code:** `run-pipeline.ts` line 440:

```typescript
skills_used: ["technical-indicators", "stock-valuation", "news-event-strategy"],
```

This is hardcoded regardless of whether fundamentals or news data was actually available. If `fundamentalsRes.error` is set (Step 2 failed), `stock-valuation` should not appear in `skills_used`. Same for `news-event-strategy` when `newsRes.data` is empty.

Additionally, the spec lists `candlestick-patterns` and `volatility-mean-reversion` as always-run skills (SRD-21 §1.3 Step 5), but these are not listed here. This is because the pipeline does not compute these — see the Skills section for that deeper gap.

**Fix required:** Build `skills_used` dynamically based on which data was non-null before writing.

### 2.5 Prohibited Phrase List Differs from Spec

**Spec:** SRD-21 §4 (and FRD-21 §9 validation table) — prohibited phrases: `"chắc chắn"`, `"đảm bảo lãi"`, `"không rủi ro"`, `"100%"`, `"bảo đảm"`, `"mua đi"`, `"bán ngay"`, `"nên đầu tư vào"`, `"chắc chắn tăng"`.

**Code:** `run-pipeline.ts` lines 34–37:

```typescript
const PROHIBITED_PHRASES = [
  "chắc chắn", "đảm bảo lãi", "không rủi ro", "100%",
  "bảo đảm", "mua ngay", "bán ngay", "nên mua", "nên bán",
];
```

Divergences:
- `"mua đi"` (spec) → replaced with `"mua ngay"` (code) — `"mua đi"` is not filtered
- `"nên đầu tư vào"` (spec) → replaced with `"nên mua"` / `"nên bán"` (code) — `"nên đầu tư vào"` is not filtered
- `"chắc chắn tăng"` (spec) → not in code list (though `"chắc chắn"` substring would catch it — acceptable)
- `"nên mua"` and `"nên bán"` added in code — not in spec but valid additions

The omission of `"mua đi"` and `"nên đầu tư vào"` means these exact BRD-21 BR-AS-05 prohibited phrases can slip through the filter.

**Fix required:** Reconcile the list against BRD-21 BR-AS-05 / SRD-21 §4 exactly. Maintain the spec list as the source of truth; keep additional entries as supplemental.

### 2.6 Signal Diversity Rules Not Implemented

**Spec:** FRD-21 FR-AS-11 — two rules:
1. "At least 1 of every 7 days' top-3 cards must include a SELL_CAUTION."
2. "Across the 3 displayed cards, at least 2 different sectors must be represented."

**Code:** Neither rule appears anywhere in `run-pipeline.ts`. The pipeline writes all passing symbols with no cross-symbol coordination.

**Impact:** The pipeline can produce 7 consecutive days of BUY_OPPORTUNITY + WATCH only (recency bias in bull markets). And all 3 top-confidence symbols on any given day may share the same sector (e.g., Banking dominates HOSE top-20 by volume).

**Fix required:** Post-processing step after all 20 symbols are written, before the pipeline exits: check the `ai_suggestions` table for the past 7 days. If no SELL_CAUTION has been published in that window, override the lowest-confidence BUY_OPPORTUNITY of today's batch to SELL_CAUTION. For sector diversity, query `symbols.sector` for each suggestion written today and ensure the top-3 by confidence spans ≥ 2 sectors.

### 2.7 No Slack / Ops Alerting

**Spec:** SRD-21 §5.1 (CRITICAL alert on volume fetch failure, 0 symbols success), §8.2 (WARNING alert when cost > $2.00 or per-symbol cost > $0.20).
**Code:** `run-pipeline.ts` lines 487–490 — only a `console.error` log for cost overrun. No Slack webhooks anywhere.

The GitHub Actions artifact gives post-hoc visibility, but the ops team has no real-time signal for failures. A FAILED_VOLUME_FETCH scenario (SRD-21 §5.1) will produce no alert at all.

**Fix required:** Add a `sendSlackAlert(channel, message, level)` utility using `SLACK_WEBHOOK_URL` from secrets. Call it in three places: (1) volume fetch failure before `process.exit(1)`, (2) when `symbols_published < 3` in post-run, (3) when `estimated_cost_usd > COST_ALERT_USD`.

---

## 3. Database Schema Gaps

### 3.1 `ai_suggestion_outcomes` Table Missing

**Spec:** SRD-21 §12.1 — Migration 0010 must create this table.
**Migration:** `20260601090000_ai_suggestions.sql` — table not present. No migration 0010 file exists.
**Impact:** Signal accuracy tracking (FR-AS-12) is completely blocked. The monitoring queries in SRD-21 §11.3 will fail.

### 3.2 `ai_pipeline_config` Table Missing

**Spec:** SRD-21 §13.1 — Migration 0010 must create this table with seed data.
**Migration:** Not present.
**Impact:** No-deploy prompt updates (SRD-21 §10.3 Phase 2) are impossible. The pipeline falls back to hardcoded prompts only, requiring a code deploy for any prompt change.

### 3.3 `pipeline_runs` vs `ai_suggestion_runs` Column Mismatch

**Spec:** SRD-21 §2.2 defines `pipeline_runs` with columns: `symbols_processed`, `symbols_succeeded`, `symbols_failed`, `symbol_list text[]`, `status text CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED_VOLUME_FETCH', 'SKIPPED_HOLIDAY', 'PARTIAL'))`, `error_details jsonb`.

**Migration (line 66–79):** Creates `ai_suggestion_runs` with columns: `symbols_attempted`, `symbols_published`, `symbols_skipped`, `error_message text`, no `status`, no `symbol_list`, no `error_details`.

**Code (lines 499–510):** Writes `symbols_attempted`, `symbols_published`, `symbols_skipped`, `error_message` — matches the migration but not the spec.

The monitoring query in SRD-21 §11.1 references `symbols_published`, `symbols_skipped`, `duration_seconds`, `error_message` — these exist in the migration, so the monitoring queries will work. However `status` (used in §5.1 error taxonomy) and `symbol_list` (for debugging which symbols were selected) are absent.

### 3.4 `get_ai_suggestions_today()` Omits `skills_used` Column

**Migration lines 127–158:** The function SELECT does not include `skills_used`. The SRD-21 §3.1 response schema requires `suggestions[].skills_used` in the API response. Any route built on this function must add it.

### 3.5 RLS Policy Blocks Admin Monitoring Queries

**Migration lines 113–119:** `ai_suggestion_runs` and `ai_suggestion_filter_log` are restricted to `service_role` only. SRD-21 §11 specifies these queries run "in Supabase SQL Editor" (implying admin dashboard access). An `admin` role policy is needed for operational review without needing service_role credentials.

### 3.6 Unique Constraint Expression Syntax

**Spec:** SRD-21 §2.1 — `CREATE UNIQUE INDEX ai_suggestions_symbol_date_idx ON ai_suggestions (symbol_code, (generated_at::date)) WHERE is_published = true`.

**Migration (line 51):** `CONSTRAINT uq_ai_sugg_symbol_date UNIQUE (symbol_code, (generated_at::date))` — this is a table constraint, not a partial index. The `WHERE is_published = true` partial filter is absent.

**Impact:** The constraint blocks writing a new (re-run) suggestion for the same symbol on the same date even when `is_published = false`, making idempotent pipeline re-runs fail if a previous write for that day was skipped (and thus `is_published = false` but the row exists). The spec's partial index handles this correctly; the migration's UNIQUE constraint does not.

---

## 4. Workflow / CI Gaps

### 4.1 Accuracy Evaluation Job Missing

**Spec:** SRD-21 §12.2 — "A separate GitHub Actions job runs daily (09:00 ICT)."
**Workflow:** `ai-suggestions.yml` has only the generation job. No `evaluate-accuracy` job exists.

### 4.2 No `status` Check Before Proceeding

The workflow `generate` job does not use `continue-on-error: false` at the step level. If the pipeline script exits with code 1 (which it does when any errors occurred — line 524), the workflow marks the run as failed, but there is no step that notifies ops or prevents the run log artifact from being uploaded. This is fine as-is, but worth noting that the "Upload run log artifact" step uses `if: always()` — which is correct behavior.

### 4.3 No Environment Protection Rule

The workflow runs in `environment: production` (line 36) but there are no branch protection rules configured in the workflow itself (e.g., requiring a reviewer to approve manual triggers). A developer could trigger `workflow_dispatch` with `dry_run: false` and `symbol_override: "FPT"` directly on any branch, potentially writing suggestions from a non-main-branch pipeline version.

---

## 5. Pattern Alignment with Existing Code

The existing `app/api/ai/chat/route.ts` uses `createCookieClient()` for auth (cookie-based session). The spec for `GET /api/ai/suggestions` uses "JWT Bearer token in `Authorization` header" (SRD-21 §3.1). This is a deliberate difference since the suggestions API is cached at CDN level — cookie-based auth cannot be cached. The new route should follow the Bearer JWT pattern, not the cookie pattern. The `lib/ai/agent.ts` pattern (tool loop, streaming) is not applicable to the suggestions endpoint which is a simple DB read.

/**
 * Paave AI Suggestions Pipeline
 * Spec: FRD-21 · SRD-21
 *
 * Runs after HOSE close (18:45 ICT). Generates AI suggestions for
 * top-20 HOSE symbols by yesterday's volume. Stores in Supabase.
 * Users read from cache — zero LLM cost per Home screen view.
 *
 * Usage:
 *   npx tsx scripts/ai-suggestions/run-pipeline.ts
 *   DRY_RUN=true npx tsx scripts/ai-suggestions/run-pipeline.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DRY_RUN = process.env.DRY_RUN === "true";
const SYMBOL_OVERRIDE = process.env.SYMBOL_OVERRIDE?.trim() || "";
const MAX_SYMBOLS = parseInt(process.env.MAX_SYMBOLS || "20", 10);
const COST_ALERT_USD = parseFloat(process.env.COST_ALERT_THRESHOLD_USD || "2.00");

// Model selection (SRD-21 §2.3)
const HAIKU_MODEL = "claude-haiku-4-5";
const SONNET_MODEL = "claude-sonnet-4-5";
const SONNET_THRESHOLD = 70; // upgrade to Sonnet when confidence_raw > 70

// Guardrails (FRD-21 BR-AS-01..05)
const CONFIDENCE_CAP = 85;
const MAX_ANALYSIS_CHARS = 150;
const PROHIBITED_PHRASES = [
  "chắc chắn", "đảm bảo lãi", "không rủi ro", "100%",
  "bảo đảm", "mua ngay", "bán ngay", "nên mua", "nên bán",
];
const VALID_SIGNAL_TYPES = ["BUY_OPPORTUNITY", "WATCH", "SELL_CAUTION"] as const;
type SignalType = typeof VALID_SIGNAL_TYPES[number];

// Anthropic pricing (USD per 1M tokens) for cost estimation
const PRICING = {
  [HAIKU_MODEL]:  { input: 0.80,  output: 4.00  },
  [SONNET_MODEL]: { input: 3.00,  output: 15.00 },
} as const;

// ---------------------------------------------------------------------------
// Supabase + Anthropic clients
// ---------------------------------------------------------------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SuggestionResult {
  symbol_code: string;
  signal_type: SignalType;
  confidence_pct: number;
  analysis_text: string;
  price_current: number | null;
  price_target: number | null;
  target_pct: number | null;
  skills_used: string[];
  model_used: string;
  generation_ms: number;
  input_tokens: number;
  output_tokens: number;
}

interface RunStats {
  symbols_attempted: number;
  symbols_published: number;
  symbols_skipped: number;
  total_input_tokens: number;
  total_output_tokens: number;
  estimated_cost_usd: number;
  duration_seconds: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Step 1 — Resolve symbol list (top-20 HOSE by yesterday's volume)
// ---------------------------------------------------------------------------
async function resolveSymbols(): Promise<string[]> {
  if (SYMBOL_OVERRIDE) {
    const symbols = SYMBOL_OVERRIDE.split(/\s+/).filter(Boolean);
    console.log(`[pipeline] Symbol override: ${symbols.join(", ")}`);
    return symbols.slice(0, MAX_SYMBOLS);
  }

  const { data, error } = await supabase
    .from("symbol_day_bars")
    .select("symbol_code, volume")
    .eq("trade_date", new Date(Date.now() - 86_400_000).toISOString().split("T")[0])
    .order("volume", { ascending: false })
    .limit(MAX_SYMBOLS);

  if (error) throw new Error(`Failed to fetch top symbols: ${error.message}`);

  const symbols = (data ?? []).map((r: { symbol_code: string }) => r.symbol_code);
  console.log(`[pipeline] Top ${symbols.length} HOSE symbols by volume: ${symbols.join(", ")}`);
  return symbols;
}

// ---------------------------------------------------------------------------
// Step 2 — Fetch market data for a symbol
// ---------------------------------------------------------------------------
async function fetchMarketData(symbol: string) {
  const [barsRes, quoteRes, fundamentalsRes, newsRes] = await Promise.all([
    supabase
      .from("symbol_day_bars")
      .select("trade_date, open, high, low, close, volume")
      .eq("symbol_code", symbol)
      .order("trade_date", { ascending: false })
      .limit(90),
    supabase
      .from("symbol_quotes_latest")
      .select("last_price, ref_price, ceiling_price, floor_price, pct_change, session")
      .eq("symbol_code", symbol)
      .single(),
    supabase
      .from("symbol_statistic")
      .select("pe_ratio, pb_ratio, eps, market_cap, week52_high, week52_low, avg_volume_30d")
      .eq("symbol_code", symbol)
      .single(),
    supabase
      .from("insights_news")
      .select("title, published_at, sentiment_score")
      .contains("symbols", [symbol])
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  return {
    bars: barsRes.data ?? [],
    quote: quoteRes.data,
    fundamentals: fundamentalsRes.data,
    news: newsRes.data ?? [],
  };
}

// ---------------------------------------------------------------------------
// Step 3 — Build prompt (using available Vibe-Trading skills as context)
// ---------------------------------------------------------------------------
function buildPrompt(symbol: string, data: Awaited<ReturnType<typeof fetchMarketData>>): string {
  const { bars, quote, fundamentals, news } = data;

  // Compute basic technical context (mirrors technical-indicators skill)
  const closes = bars.map((b: { close: number }) => Number(b.close));
  const latest = closes[0] ?? 0;
  const sma20 = closes.slice(0, 20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length);
  const sma50 = closes.slice(0, 50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length);
  const volumes = bars.map((b: { volume: number }) => Number(b.volume));
  const avgVol30 = volumes.slice(0, 30).reduce((a, b) => a + b, 0) / Math.min(30, volumes.length);
  const todayVol = volumes[0] ?? 0;
  const volRatio = avgVol30 > 0 ? ((todayVol / avgVol30) * 100).toFixed(0) : "N/A";

  const newsContext = news.length > 0
    ? news.map((n: { title: string; published_at: string }) =>
        `- ${n.title} (${n.published_at?.split("T")[0]})`
      ).join("\n")
    : "No recent news.";

  return `You are a Vietnamese stock market analyst for Paave, a paper-trading education app.
Analyze ${symbol} and generate a structured signal. This is for educational purposes only — NOT investment advice.

## Market Data for ${symbol}

### Price Context
- Current: ${quote?.last_price ?? "N/A"} VND
- Reference (TC): ${quote?.ref_price ?? "N/A"} VND
- Ceiling (Trần): ${quote?.ceiling_price ?? "N/A"} VND
- Floor (Sàn): ${quote?.floor_price ?? "N/A"} VND
- Daily change: ${quote?.pct_change ?? "N/A"}%
- Session: ${quote?.session ?? "CLOSED"}

### Technical (last 90 days OHLCV)
- SMA20: ${sma20.toFixed(0)} VND (price is ${latest > sma20 ? "ABOVE" : "BELOW"})
- SMA50: ${sma50.toFixed(0)} VND (price is ${latest > sma50 ? "ABOVE" : "BELOW"})
- Today volume vs 30d avg: ${volRatio}%
- 52-week high: ${fundamentals?.week52_high ?? "N/A"}, low: ${fundamentals?.week52_low ?? "N/A"}

### Fundamentals
- PE ratio: ${fundamentals?.pe_ratio ?? "N/A"}
- PB ratio: ${fundamentals?.pb_ratio ?? "N/A"}
- Market cap: ${fundamentals?.market_cap ? (Number(fundamentals.market_cap) / 1e9).toFixed(1) + " tỷ VND" : "N/A"}

### Recent News (last 5)
${newsContext}

## Output (JSON only, no markdown, no explanation)

{
  "signal_type": "BUY_OPPORTUNITY" | "WATCH" | "SELL_CAUTION",
  "confidence_raw": <integer 0-100, your honest estimate BEFORE any cap>,
  "analysis_text": "<max 120 chars, Vietnamese, observational language only, no imperative verbs>",
  "price_target": <number or null>,
  "target_pct": <number or null, e.g. 9.5 for +9.5%, -5.2 for downside>,
  "skills_used": ["technical-indicators", "stock-valuation", "news-event-strategy"]
}

Rules:
1. analysis_text MUST be observational: "đang trong vùng", "vượt MA50", "phân kỳ âm RSI" — NOT "mua đi", "bán ngay"
2. If no strong signal: use WATCH with low confidence (40-55)
3. price_target only if confidence_raw > 65 and BUY_OPPORTUNITY or SELL_CAUTION
4. Output ONLY valid JSON`;
}

// ---------------------------------------------------------------------------
// Step 4 — Call Claude and parse response
// ---------------------------------------------------------------------------
async function callClaude(
  prompt: string,
  useHaiku: boolean,
): Promise<{ raw: string; inputTokens: number; outputTokens: number; model: string }> {
  const model = useHaiku ? HAIKU_MODEL : SONNET_MODEL;

  const response = await anthropic.messages.create({
    model,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as Anthropic.TextBlock).text)
    .join("");

  return {
    raw: text,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    model,
  };
}

// ---------------------------------------------------------------------------
// Step 5 — Content filter + guardrails (FRD-21 BR-AS-01..05)
// ---------------------------------------------------------------------------
function applyGuardrails(
  raw: string,
  symbol: string,
  filterLog: Array<{ symbol_code: string; filter_type: string; matched_text: string; raw_output: string; action_taken: string }>,
): { result: Omit<SuggestionResult, "symbol_code" | "skills_used" | "model_used" | "generation_ms" | "input_tokens" | "output_tokens"> | null; skipped: boolean } {
  let parsed: {
    signal_type: string;
    confidence_raw: number;
    analysis_text: string;
    price_target: number | null;
    target_pct: number | null;
    skills_used?: string[];
  };

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? raw);
  } catch {
    filterLog.push({
      symbol_code: symbol,
      filter_type: "PARSE_ERROR",
      matched_text: raw.slice(0, 200),
      raw_output: raw,
      action_taken: "REJECTED",
    });
    return { result: null, skipped: true };
  }

  // Validate signal type
  if (!VALID_SIGNAL_TYPES.includes(parsed.signal_type as SignalType)) {
    filterLog.push({
      symbol_code: symbol,
      filter_type: "UNKNOWN_SIGNAL",
      matched_text: parsed.signal_type,
      raw_output: raw,
      action_taken: "REJECTED",
    });
    return { result: null, skipped: true };
  }

  // Cap confidence
  let confidence = Math.round(parsed.confidence_raw ?? 50);
  if (confidence > CONFIDENCE_CAP) {
    filterLog.push({
      symbol_code: symbol,
      filter_type: "CONFIDENCE_OVERFLOW",
      matched_text: String(confidence),
      raw_output: raw,
      action_taken: "CAPPED",
    });
    confidence = CONFIDENCE_CAP;
  }

  // Check prohibited phrases
  const analysisLower = (parsed.analysis_text ?? "").toLowerCase();
  const hit = PROHIBITED_PHRASES.find((p) => analysisLower.includes(p));
  if (hit) {
    filterLog.push({
      symbol_code: symbol,
      filter_type: "PROHIBITED_PHRASE",
      matched_text: hit,
      raw_output: raw,
      action_taken: "REJECTED",
    });
    return { result: null, skipped: true };
  }

  // Truncate analysis_text if over limit
  const analysisText = (parsed.analysis_text ?? "").slice(0, MAX_ANALYSIS_CHARS);

  return {
    result: {
      signal_type: parsed.signal_type as SignalType,
      confidence_pct: confidence,
      analysis_text: analysisText,
      price_current: null, // filled below from quote
      price_target: parsed.price_target ?? null,
      target_pct: parsed.target_pct ?? null,
    },
    skipped: false,
  };
}

// ---------------------------------------------------------------------------
// Step 6 — Upsert to Supabase
// ---------------------------------------------------------------------------
async function upsertSuggestion(suggestion: SuggestionResult, validUntil: Date): Promise<void> {
  if (DRY_RUN) {
    console.log(`[dry-run] Would upsert ${suggestion.symbol_code}:`, suggestion);
    return;
  }

  const { error } = await supabase.from("ai_suggestions").upsert(
    {
      ...suggestion,
      valid_until: validUntil.toISOString(),
      is_published: true,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "symbol_code,generated_at::date" },
  );

  if (error) throw new Error(`Upsert failed for ${suggestion.symbol_code}: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------
async function main() {
  const pipelineStart = Date.now();
  const today = new Date().toISOString().split("T")[0];
  const stats: RunStats = {
    symbols_attempted: 0,
    symbols_published: 0,
    symbols_skipped: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    estimated_cost_usd: 0,
    duration_seconds: 0,
    errors: [],
  };
  const filterLog: Parameters<typeof applyGuardrails>[2] = [];

  // Next trading day 08:30 ICT = 01:30 UTC
  const validUntil = new Date();
  validUntil.setUTCDate(validUntil.getUTCDate() + 1);
  validUntil.setUTCHours(1, 30, 0, 0);

  console.log(`[pipeline] Starting AI Suggestions pipeline | ${today} | dry_run=${DRY_RUN}`);

  let symbols: string[];
  try {
    symbols = await resolveSymbols();
  } catch (err) {
    console.error("[pipeline] FATAL: Could not resolve symbols:", err);
    process.exit(1);
  }

  for (const symbol of symbols) {
    const symbolStart = Date.now();
    stats.symbols_attempted++;
    console.log(`\n[${symbol}] Processing (${stats.symbols_attempted}/${symbols.length})...`);

    try {
      // Fetch data
      const data = await fetchMarketData(symbol);

      // Build prompt
      const prompt = buildPrompt(symbol, data);

      // First pass: Haiku
      const haiku = await callClaude(prompt, true);
      stats.total_input_tokens += haiku.inputTokens;
      stats.total_output_tokens += haiku.outputTokens;

      // Parse confidence_raw to decide if Sonnet upgrade needed
      let finalRaw = haiku.raw;
      let finalModel = haiku.model;
      let extraInputTokens = 0;
      let extraOutputTokens = 0;

      try {
        const parsed = JSON.parse(haiku.raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
        if ((parsed.confidence_raw ?? 0) > SONNET_THRESHOLD) {
          console.log(`[${symbol}] Confidence ${parsed.confidence_raw} > ${SONNET_THRESHOLD} → upgrading to Sonnet`);
          const sonnet = await callClaude(prompt, false);
          finalRaw = sonnet.raw;
          finalModel = sonnet.model;
          extraInputTokens = sonnet.inputTokens;
          extraOutputTokens = sonnet.outputTokens;
          stats.total_input_tokens += extraInputTokens;
          stats.total_output_tokens += extraOutputTokens;
        }
      } catch {
        // If parsing fails, guardrails will catch it below
      }

      // Apply guardrails
      const { result, skipped } = applyGuardrails(finalRaw, symbol, filterLog);

      if (skipped || !result) {
        console.log(`[${symbol}] ⚠ Skipped by content filter`);
        stats.symbols_skipped++;
        continue;
      }

      // Build final suggestion object
      const suggestion: SuggestionResult = {
        symbol_code: symbol,
        signal_type: result.signal_type,
        confidence_pct: result.confidence_pct,
        analysis_text: result.analysis_text,
        price_current: data.quote?.last_price ?? null,
        price_target: result.price_target,
        target_pct: result.target_pct,
        skills_used: ["technical-indicators", "stock-valuation", "news-event-strategy"],
        model_used: finalModel,
        generation_ms: Date.now() - symbolStart,
        input_tokens: haiku.inputTokens + extraInputTokens,
        output_tokens: haiku.outputTokens + extraOutputTokens,
      };

      // Upsert
      await upsertSuggestion(suggestion, validUntil);

      stats.symbols_published++;
      console.log(
        `[${symbol}] ✓ ${result.signal_type} ${result.confidence_pct}% | ` +
        `"${result.analysis_text.slice(0, 50)}..." | ${finalModel}`,
      );

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${symbol}] ✗ Error:`, msg);
      stats.errors.push(`${symbol}: ${msg}`);
    }

    // Small delay between symbols to respect API rate limits
    await new Promise((r) => setTimeout(r, 1_500));
  }

  // ---------------------------------------------------------------------------
  // Compute cost + save run log
  // ---------------------------------------------------------------------------
  stats.duration_seconds = Math.round((Date.now() - pipelineStart) / 1000);

  // Rough cost estimate (assumes all on Haiku; Sonnet upgrades add ~3x for upgraded symbols)
  stats.estimated_cost_usd =
    (stats.total_input_tokens / 1_000_000) * PRICING[HAIKU_MODEL].input +
    (stats.total_output_tokens / 1_000_000) * PRICING[HAIKU_MODEL].output;

  console.log(`\n[pipeline] ═══════════════════════════════════`);
  console.log(`[pipeline] Run complete | ${today}`);
  console.log(`[pipeline] Attempted: ${stats.symbols_attempted} | Published: ${stats.symbols_published} | Skipped: ${stats.symbols_skipped}`);
  console.log(`[pipeline] Tokens: ${stats.total_input_tokens} in / ${stats.total_output_tokens} out`);
  console.log(`[pipeline] Estimated cost: $${stats.estimated_cost_usd.toFixed(4)}`);
  console.log(`[pipeline] Duration: ${stats.duration_seconds}s`);
  if (stats.errors.length > 0) {
    console.error(`[pipeline] Errors (${stats.errors.length}):`, stats.errors);
  }

  // Cost alert
  if (stats.estimated_cost_usd > COST_ALERT_USD) {
    console.error(
      `[pipeline] ⚠ COST ALERT: $${stats.estimated_cost_usd.toFixed(4)} exceeds threshold $${COST_ALERT_USD}`,
    );
  }

  // Save run log to file (uploaded as GitHub Actions artifact)
  const runLog = { date: today, ...stats, filter_log: filterLog };
  writeFileSync(`/tmp/ai-suggestions-run-${today}.json`, JSON.stringify(runLog, null, 2));

  // Persist run stats to Supabase (not blocking)
  if (!DRY_RUN) {
    await supabase.from("ai_suggestion_runs").upsert({
      run_date: today,
      symbols_attempted: stats.symbols_attempted,
      symbols_published: stats.symbols_published,
      symbols_skipped: stats.symbols_skipped,
      total_input_tokens: stats.total_input_tokens,
      total_output_tokens: stats.total_output_tokens,
      estimated_cost_usd: stats.estimated_cost_usd,
      duration_seconds: stats.duration_seconds,
      error_message: stats.errors.length > 0 ? stats.errors.join("; ") : null,
      finished_at: new Date().toISOString(),
    }, { onConflict: "run_date" }).then(({ error }) => {
      if (error) console.error("[pipeline] Failed to save run log:", error.message);
    });

    // Log content filter hits
    if (filterLog.length > 0) {
      await supabase.from("ai_suggestion_filter_log").insert(
        filterLog.map((l) => ({ ...l, run_date: today })),
      ).then(({ error }) => {
        if (error) console.error("[pipeline] Failed to save filter log:", error.message);
      });
    }
  }

  process.exit(stats.errors.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[pipeline] Unhandled error:", err);
  process.exit(1);
});

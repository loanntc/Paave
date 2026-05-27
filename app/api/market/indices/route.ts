import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface MarketIndex {
  exchange: "HOSE" | "HNX" | "UPCOM";
  /** Display name, e.g. "VN-INDEX" */
  name: string;
  /** Latest closing / last price for the index */
  close: number | null;
  /** Percentage change vs. reference (positive = up) */
  change_pct: number | null;
}

// ---------------------------------------------------------------------------
// GET /api/market/indices
//
// Returns the three Vietnam market index snapshots (HOSE, HNX, UPCOM).
// Data source: symbol_quotes_latest for symbols where symbol_type = 'INDEX'
//              and exchange IN ('HOSE','HNX','UPCOM').
//
// Public endpoint — no auth required (market data is public).
// Uses service role to bypass RLS on the read-only market cache tables.
// ---------------------------------------------------------------------------

/** Display names per exchange */
const INDEX_NAMES: Record<"HOSE" | "HNX" | "UPCOM", string> = {
  HOSE:  "VN-INDEX",
  HNX:   "HNX-INDEX",
  UPCOM: "UPCOM-INDEX",
};

const VN_EXCHANGES = ["HOSE", "HNX", "UPCOM"] as const;

export async function GET() {
  try {
    const db = createServiceClient();

    // Step 1 — find all INDEX symbols on VN exchanges
    const { data: indexSymbols, error: symErr } = await db
      .from("symbols")
      .select("code, exchange")
      .eq("symbol_type", "INDEX")
      .in("exchange", VN_EXCHANGES as unknown as string[]);

    if (symErr) throw symErr;
    if (!indexSymbols || indexSymbols.length === 0) {
      return NextResponse.json({ indices: [] });
    }

    const codes = indexSymbols.map((s) => s.code);

    // Step 2 — fetch latest quotes for those codes
    const { data: quotes, error: qErr } = await db
      .from("symbol_quotes_latest")
      .select("symbol_code, last_price, pct_change")
      .in("symbol_code", codes);

    if (qErr) throw qErr;

    // Map symbol_code → quote
    const quoteMap = new Map(
      (quotes ?? []).map((q) => [
        q.symbol_code,
        {
          close: q.last_price != null ? Number(q.last_price) : null,
          change_pct: q.pct_change != null ? Number(q.pct_change) : null,
        },
      ]),
    );

    // One entry per exchange — first matching symbol wins
    const seen = new Set<string>();
    const byExchange = new Map<"HOSE" | "HNX" | "UPCOM", { close: number | null; change_pct: number | null }>();

    for (const sym of indexSymbols) {
      const exch = sym.exchange as "HOSE" | "HNX" | "UPCOM";
      if (seen.has(exch)) continue;
      seen.add(exch);
      byExchange.set(exch, quoteMap.get(sym.code) ?? { close: null, change_pct: null });
    }

    const indices: MarketIndex[] = VN_EXCHANGES.map((exch) => ({
      exchange: exch,
      name: INDEX_NAMES[exch],
      close: byExchange.get(exch)?.close ?? null,
      change_pct: byExchange.get(exch)?.change_pct ?? null,
    }));

    return NextResponse.json({ indices });
  } catch {
    // Silently return empty list — UI falls back to skeleton / stale
    return NextResponse.json({ indices: [] });
  }
}

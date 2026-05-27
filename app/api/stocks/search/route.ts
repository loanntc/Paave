import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 30;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface StockResult {
  code: string;
  name: string;
  short_name: string | null;
  exchange: string | null;
  sector: string | null;
  last_price: number | null;
  pct_change: number | null;
  total_volume: number | null;
}

// ---------------------------------------------------------------------------
// GET /api/stocks/search
//
// Public market-data endpoint — no auth required (symbols are public).
//
// Query params:
//   q      — search term (ticker code or company name prefix)
//             When absent/empty: uses 'sort' to determine default view
//   sort   — "volume" (default) | "gainers"
//             "volume"  → top stocks by total trading volume
//             "gainers" → top positive movers by pct_change (VN stocks)
//   limit  — max results (1–30, default 20)
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").trim();
  const sort = searchParams.get("sort") === "gainers" ? "gainers" : "volume";
  const rawLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  const limit = Math.min(Math.max(1, Number.isFinite(rawLimit) ? rawLimit : DEFAULT_LIMIT), MAX_LIMIT);

  const db = createServiceClient();

  // ── Default view: top stocks (by volume or by gains) ─────────────────────
  if (q.length === 0) {
    let quotesQuery = db
      .from("symbol_quotes_latest")
      .select("symbol_code, last_price, pct_change, total_volume");

    if (sort === "gainers") {
      // Top positive movers — filter out non-positive and sort descending
      quotesQuery = quotesQuery.gt("pct_change", 0).order("pct_change", { ascending: false });
    } else {
      quotesQuery = quotesQuery.order("total_volume", { ascending: false });
    }

    const [quotesRes, symbolsRes] = await Promise.all([
      quotesQuery.limit(limit),
      db.from("symbols").select("code, name, short_name, exchange, sector"),
    ]);

    const symbolMap = new Map(
      (symbolsRes.data ?? []).map((s) => [s.code, s]),
    );

    const results: StockResult[] = (quotesRes.data ?? []).map((q) => {
      const sym = symbolMap.get(q.symbol_code);
      return {
        code: q.symbol_code,
        name: sym?.name ?? q.symbol_code,
        short_name: sym?.short_name ?? null,
        exchange: sym?.exchange ?? null,
        sector: sym?.sector ?? null,
        last_price: q.last_price != null ? Number(q.last_price) : null,
        pct_change: q.pct_change != null ? Number(q.pct_change) : null,
        total_volume: q.total_volume != null ? Number(q.total_volume) : null,
      };
    });

    return NextResponse.json({ results, query: "", sort });
  }

  // ── Search: match code prefix first, then name ────────────────────────────
  const upper = q.toUpperCase();

  // First pass: find matching symbols
  const { data: matched } = await db
    .from("symbols")
    .select("code, name, short_name, exchange, sector")
    .or(`code.ilike.${upper}%,name.ilike.%${q}%`)
    .limit(limit);

  if (!matched || matched.length === 0) {
    return NextResponse.json({ results: [], query: q });
  }

  // Second pass: fetch quotes for the matching codes
  const codes = matched.map((s) => s.code);
  const { data: quotes } = await db
    .from("symbol_quotes_latest")
    .select("symbol_code, last_price, pct_change, total_volume")
    .in("symbol_code", codes);

  const quoteMap = new Map(
    (quotes ?? []).map((q) => [q.symbol_code, q]),
  );

  // Sort: exact code match first, then alphabetical
  const sorted = [...matched].sort((a, b) => {
    const aExact = a.code === upper ? 0 : 1;
    const bExact = b.code === upper ? 0 : 1;
    return aExact - bExact || a.code.localeCompare(b.code);
  });

  const results: StockResult[] = sorted.map((sym) => {
    const quote = quoteMap.get(sym.code);
    return {
      code: sym.code,
      name: sym.name,
      short_name: sym.short_name ?? null,
      exchange: sym.exchange ?? null,
      sector: sym.sector ?? null,
      last_price: quote?.last_price != null ? Number(quote.last_price) : null,
      pct_change: quote?.pct_change != null ? Number(quote.pct_change) : null,
      total_volume: quote?.total_volume != null ? Number(quote.total_volume) : null,
    };
  });

  return NextResponse.json({ results, query: q });
}

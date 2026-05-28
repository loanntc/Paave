"use client";

// Data-fetching hook for StockDetailView.
// Runs one primary fetch (quote + symbol + bars + auth) and a secondary sector fetch.

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Exported types (consumed by view + component files)
// ---------------------------------------------------------------------------
export interface QuoteData {
  symbol_code: string;
  last_price: number | null;
  ref_price: number | null;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  pct_change: number | null;
  total_volume: number | null;
  session: string | null;
  ceiling_price: number | null;
  floor_price: number | null;
}

export interface SymbolData {
  code: string;
  name: string;
  short_name: string | null;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
}

export interface HoldingData {
  quantity: number;
  avg_cost: number;
  realized_pl: number;
}

export interface SimilarStock {
  code: string;
  name: string;
  lastPrice: number | null;
  pctChange: number | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useStockDetailData(ticker: string) {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [symbol, setSymbol] = useState<SymbolData | null>(null);
  const [holding, setHolding] = useState<HoldingData | null>(null);
  const [closePrices, setClosePrices] = useState<number[]>([]);
  const [similar, setSimilar] = useState<SimilarStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getBrowserClient();

    async function fetchData() {
      // Auth + market data + historical bars — all in parallel
      const [quoteRes, symbolRes, sessionRes, barsRes] = await Promise.all([
        db
          .from("symbol_quotes_latest")
          .select(
            "symbol_code, last_price, ref_price, open_price, high_price, low_price, pct_change, total_volume, session, ceiling_price, floor_price",
          )
          .eq("symbol_code", ticker)
          .single(),
        db
          .from("symbols")
          .select("code, name, short_name, exchange, sector, industry")
          .eq("code", ticker)
          .single(),
        db.auth.getSession(),
        db
          .from("symbol_day_bars")
          .select("close")
          .eq("symbol_code", ticker)
          .order("trade_date", { ascending: false })
          .limit(30),
      ]);

      setQuote(quoteRes.data ?? null);
      setSymbol(symbolRes.data ?? null);

      // Reverse to chronological order (oldest → newest) for chart rendering
      if (barsRes.data?.length) {
        setClosePrices(
          [...barsRes.data]
            .reverse()
            .map((b) => Number(b.close))
            .filter((v) => v > 0),
        );
      }

      // Fetch user's position for this ticker if logged in
      const uid = sessionRes.data.session?.user?.id;
      if (uid) {
        const { data: acct } = await db
          .from("virtual_sub_accounts")
          .select("id")
          .eq("user_id", uid)
          .eq("status", "ACTIVE")
          .limit(1)
          .single();

        if (acct) {
          const { data: h } = await db
            .from("virtual_holdings")
            .select("quantity, avg_cost, realized_pl")
            .eq("sub_account_id", acct.id)
            .eq("symbol_code", ticker)
            .gt("quantity", 0)
            .single();

          if (h) {
            setHolding({
              quantity: Number(h.quantity),
              avg_cost: Number(h.avg_cost),
              realized_pl: Number(h.realized_pl),
            });
          }
        }
      }

      // Similar stocks — secondary fetch (non-blocking, best-effort).
      // Runs after primary data is set so the page renders immediately.
      const sector = symbolRes.data?.sector;
      if (sector) {
        const { data: sectorSymbols } = await db
          .from("symbols")
          .select("code, short_name, name")
          .eq("sector", sector)
          .neq("code", ticker)
          .limit(12);

        if (sectorSymbols?.length) {
          const codes = sectorSymbols.map((s) => s.code);
          const { data: sectorQuotes } = await db
            .from("symbol_quotes_latest")
            .select("symbol_code, last_price, pct_change, total_volume")
            .in("symbol_code", codes)
            .order("total_volume", { ascending: false })
            .limit(6);

          const quoteMap = new Map(
            (sectorQuotes ?? []).map((q) => [q.symbol_code, q]),
          );
          setSimilar(
            sectorSymbols
              .filter((s) => quoteMap.has(s.code))
              .slice(0, 6)
              .map((s) => ({
                code: s.code,
                name: s.short_name ?? s.name,
                lastPrice:
                  quoteMap.get(s.code)?.last_price != null
                    ? Number(quoteMap.get(s.code)!.last_price)
                    : null,
                pctChange:
                  quoteMap.get(s.code)?.pct_change != null
                    ? Number(quoteMap.get(s.code)!.pct_change)
                    : null,
              })),
          );
        }
      }

      setIsLoading(false);
    }

    fetchData();
  }, [ticker]);

  return { quote, symbol, holding, closePrices, similar, isLoading };
}

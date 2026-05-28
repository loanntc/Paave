"use client";

// Data-fetching hook for HomeView.
// Owns all Supabase calls and public API fetches so the view layer stays pure.

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import type { MarketIndex } from "@/app/api/market/indices/route";
import type { StockResult } from "@/app/api/stocks/search/route";
import { useWatchlist } from "@/lib/use-watchlist";
import type { PortfolioSummary } from "./home-portfolio-section";

export function useHomeData() {
  const [displayName, setDisplayName] = useState<string>("bạn");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [trending, setTrending] = useState<StockResult[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const { hydrated: watchlistHydrated, watchlist } = useWatchlist();
  const [watchlistStocks, setWatchlistStocks] = useState<StockResult[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // ── Auth + portfolio ────────────────────────────────────────────────────────
  useEffect(() => {
    const db = getBrowserClient();

    async function fetchPortfolio() {
      const {
        data: { session },
      } = await db.auth.getSession();

      if (!session?.user) {
        setPortfolioLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const uid = session.user.id;

      // Derive a friendly display name from user metadata or email
      const meta = session.user.user_metadata ?? {};
      const name: string =
        (meta.full_name as string | undefined)?.split(" ").at(-1) ??
        (meta.name as string | undefined)?.split(" ").at(-1) ??
        session.user.email?.split("@")[0] ??
        "bạn";
      setDisplayName(name);

      // Two-step fetch: active sub-account → holdings
      const { data: acct } = await db
        .from("virtual_sub_accounts")
        .select("id, cash_balance, starting_balance")
        .eq("user_id", uid)
        .eq("status", "ACTIVE")
        .limit(1)
        .single();

      if (!acct) {
        setPortfolioLoading(false);
        return;
      }

      const { data: holdings } = await db
        .from("virtual_holdings")
        .select("symbol_code, quantity, avg_cost")
        .eq("sub_account_id", acct.id)
        .gt("quantity", 0);

      // Batch-fetch live prices for all holdings to show mark-to-market equity
      const codes = (holdings ?? []).map((h) => h.symbol_code).filter(Boolean);
      const priceMap = new Map<string, number>();
      if (codes.length > 0) {
        const { data: quotes } = await db
          .from("symbol_quotes_latest")
          .select("symbol_code, last_price")
          .in("symbol_code", codes);
        for (const q of quotes ?? []) {
          if (q.last_price != null) priceMap.set(q.symbol_code, Number(q.last_price));
        }
      }

      const holdingsValue = (holdings ?? []).reduce(
        (s, h) =>
          s + (priceMap.get(h.symbol_code) ?? Number(h.avg_cost)) * Number(h.quantity),
        0,
      );
      const cashBalance = Number(acct.cash_balance);
      const startingBalance = Number(acct.starting_balance);
      const totalEquity = cashBalance + holdingsValue;
      const totalPL = totalEquity - startingBalance;
      const totalPLPct = (totalPL / startingBalance) * 100;

      setPortfolio({
        totalEquity,
        totalPL,
        totalPLPct,
        cashBalance,
        holdingsValue,
        positionCount: (holdings ?? []).length,
      });
      setPortfolioLoading(false);
    }

    fetchPortfolio();
  }, []);

  // ── VN market indices (public, no auth) ─────────────────────────────────────
  useEffect(() => {
    async function fetchIndices() {
      try {
        const res = await fetch("/api/market/indices");
        const data: { indices: MarketIndex[] } = await res.json();
        if (data.indices.length > 0) setIndices(data.indices);
      } catch {
        // Keep empty — MarketSnapshot falls back to skeleton
      } finally {
        setIndicesLoading(false);
      }
    }
    fetchIndices();
  }, []);

  // ── Top gainers (public, no auth) ───────────────────────────────────────────
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/stocks/search?sort=gainers&limit=8");
        const data: { results: StockResult[] } = await res.json();
        setTrending(data.results);
      } catch {
        // Keep empty — TrendingRow shows static fallback
      } finally {
        setTrendingLoading(false);
      }
    }
    fetchTrending();
  }, []);

  // ── Watchlist live prices (depends on localStorage hydration) ───────────────
  useEffect(() => {
    if (!watchlistHydrated || watchlist.length === 0) {
      setWatchlistStocks([]);
      return;
    }

    setWatchlistLoading(true);
    const db = getBrowserClient();

    async function fetchWatchlistPrices() {
      const [quotesRes, symbolsRes] = await Promise.all([
        db
          .from("symbol_quotes_latest")
          .select("symbol_code, last_price, pct_change, total_volume")
          .in("symbol_code", watchlist),
        db
          .from("symbols")
          .select("code, short_name, name, exchange, sector")
          .in("code", watchlist),
      ]);

      const symbolMap = new Map<
        string,
        { short_name: string | null; name: string; exchange: string | null; sector: string | null }
      >();
      for (const s of symbolsRes.data ?? []) {
        symbolMap.set(s.code, {
          short_name: s.short_name,
          name: s.name,
          exchange: s.exchange,
          sector: s.sector,
        });
      }

      const quoteMap = new Map<
        string,
        { last_price: number | null; pct_change: number | null; total_volume: number | null }
      >();
      for (const q of quotesRes.data ?? []) {
        quoteMap.set(q.symbol_code, {
          last_price: q.last_price != null ? Number(q.last_price) : null,
          pct_change: q.pct_change != null ? Number(q.pct_change) : null,
          total_volume: q.total_volume != null ? Number(q.total_volume) : null,
        });
      }

      // Preserve the user's saved watchlist order
      const ordered = watchlist.flatMap((code) => {
        const sym = symbolMap.get(code);
        const quote = quoteMap.get(code);
        if (!sym && !quote) return [];
        return [
          {
            code,
            name: sym?.name ?? code,
            short_name: sym?.short_name ?? null,
            exchange: sym?.exchange ?? null,
            sector: sym?.sector ?? null,
            last_price: quote?.last_price ?? null,
            pct_change: quote?.pct_change ?? null,
            total_volume: quote?.total_volume ?? null,
          } satisfies StockResult,
        ];
      });

      setWatchlistStocks(ordered);
      setWatchlistLoading(false);
    }

    fetchWatchlistPrices();
  // watchlist array ref only changes when items are added/removed (useWatchlist uses useState)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlistHydrated, watchlist]);

  return {
    displayName,
    isAuthenticated,
    portfolio,
    portfolioLoading,
    indices,
    indicesLoading,
    trending,
    trendingLoading,
    watchlist,
    watchlistHydrated,
    watchlistStocks,
    watchlistLoading,
  };
}

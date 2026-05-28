// usePortfolioData — data-fetching hook for the Portfolio tab.
// Fetches account, holdings, live quotes, and trade history in a single waterfall.
// Also computes derived equity values and behavior metrics so the view stays lean.

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Shared data types — exported so components and the view can reference them
// ---------------------------------------------------------------------------

export interface AccountData {
  cash_balance: number;
  starting_balance: number;
}

export interface HoldingData {
  symbol_code: string;
  quantity: number;
  avg_cost: number;
  realized_pl: number;
}

export interface TradeRow {
  id: string;
  symbol_code: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  fees: number;
  executed_at: string;
}

export interface BehaviorScores {
  /** Higher = more overtrading — axis is inverted in the radar component */
  overtrading: number;
  /** Higher = more diversified across stocks */
  diversification: number;
  /** Higher = better win rate; neutral 50 when no data */
  discipline: number;
  /** Higher = lower fee burn (100 = no fees, 0 = >1% burn) */
  fee_awareness: number;
  /** Placeholder — avg hold days not tracked per-trade in current schema */
  patience: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePortfolioData() {
  const [userId, setUserId] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [holdings, setHoldings] = useState<HoldingData[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [quotes, setQuotes] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getBrowserClient();

    async function fetchData() {
      const {
        data: { session },
      } = await db.auth.getSession();

      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      // Single account query — include id so we don't need a second round-trip
      const accountRes = await db
        .from("virtual_sub_accounts")
        .select("id, cash_balance, starting_balance")
        .eq("user_id", uid)
        .eq("status", "ACTIVE")
        .limit(1)
        .single();

      if (!accountRes.data) {
        setIsLoading(false);
        return;
      }

      setAccount({
        cash_balance: Number(accountRes.data.cash_balance),
        starting_balance: Number(accountRes.data.starting_balance),
      });

      // Parallel: holdings + trades (both use the sub_account id we already have)
      const subAccountId = accountRes.data.id;
      const [holdingsRes, tradesRes] = await Promise.all([
        db
          .from("virtual_holdings")
          .select("symbol_code, quantity, avg_cost, realized_pl")
          .eq("sub_account_id", subAccountId)
          .gt("quantity", 0)
          .order("symbol_code"),
        db
          .from("virtual_trades")
          .select("id, symbol_code, side, quantity, price, fees, executed_at")
          .eq("sub_account_id", subAccountId)
          .order("executed_at", { ascending: false })
          .limit(50),
      ]);

      const holdingsList: HoldingData[] = (holdingsRes.data ?? []).map((h) => ({
        symbol_code: h.symbol_code,
        quantity: Number(h.quantity),
        avg_cost: Number(h.avg_cost),
        realized_pl: Number(h.realized_pl),
      }));

      setHoldings(holdingsList);

      setTrades(
        (tradesRes.data ?? []).map((t) => ({
          id: t.id,
          symbol_code: t.symbol_code,
          side: t.side as "BUY" | "SELL",
          quantity: Number(t.quantity),
          price: Number(t.price),
          fees: Number(t.fees),
          executed_at: t.executed_at,
        })),
      );

      // Batch-fetch live quotes for all held symbols — one query, no N+1
      if (holdingsList.length > 0) {
        const codes = holdingsList.map((h) => h.symbol_code);
        const quotesRes = await db
          .from("symbol_quotes_latest")
          .select("symbol_code, last_price")
          .in("symbol_code", codes);

        const priceMap = new Map<string, number>();
        for (const q of quotesRes.data ?? []) {
          if (q.last_price != null) priceMap.set(q.symbol_code, Number(q.last_price));
        }
        setQuotes(priceMap);
      }

      setIsLoading(false);
    }

    fetchData();
  }, []);

  // ── Derived equity values ────────────────────────────────────────────────
  // Use live price where available; fall back to avg_cost (cost basis) otherwise
  const holdingsValue = holdings.reduce(
    (s, h) => s + (quotes.get(h.symbol_code) ?? h.avg_cost) * h.quantity,
    0,
  );
  const totalEquity = account ? account.cash_balance + holdingsValue : holdingsValue;
  const totalPL = account ? totalEquity - account.starting_balance : 0;
  const totalPLPct = account ? (totalPL / account.starting_balance) * 100 : 0;
  const isUp = totalPL >= 0;

  // ── Behavior metrics ─────────────────────────────────────────────────────
  // These are approximations: trades is capped at 50, and win-rate only counts
  // active holdings with partial exits. Real depth analysis is done by the AI card.

  // tradesPerWeek — frequency proxy from the span between oldest and newest trade
  const tradesPerWeek = (() => {
    if (trades.length === 0) return 0;
    if (trades.length === 1) return 0.23; // ~1/month
    const newestMs = new Date(trades[0].executed_at).getTime();
    const oldestMs = new Date(trades[trades.length - 1].executed_at).getTime();
    const spanDays = Math.max(1, (newestMs - oldestMs) / (1_000 * 60 * 60 * 24));
    return (trades.length / spanDays) * 7;
  })();

  // winRatePct — holdings with at least one partial exit that was profitable
  const winRatePct = (() => {
    const traded = holdings.filter((h) => h.realized_pl !== 0);
    if (traded.length === 0) return null;
    return (traded.filter((h) => h.realized_pl > 0).length / traded.length) * 100;
  })();

  // feeBurnPct — total fees as % of starting balance
  const feeBurnPct = account
    ? (trades.reduce((s, t) => s + t.fees, 0) / account.starting_balance) * 100
    : 0;

  const behaviorScores: BehaviorScores = {
    overtrading: Math.min(100, tradesPerWeek * 20),
    diversification: Math.min(100, holdings.length * 20),
    discipline: winRatePct ?? 50,
    fee_awareness: Math.max(0, 100 - feeBurnPct * 100),
    patience: 50,
  };

  return {
    userId,
    account,
    holdings,
    trades,
    quotes,
    isLoading,
    holdingsValue,
    totalEquity,
    totalPL,
    totalPLPct,
    isUp,
    tradesPerWeek,
    winRatePct,
    feeBurnPct,
    behaviorScores,
  };
}

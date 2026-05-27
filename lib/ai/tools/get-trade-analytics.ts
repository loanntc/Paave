import type { ToolDefinition } from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** How many days of history to analyse */
const ANALYSIS_DAYS = 90;

/** Hard cap so large accounts don't blow the context window */
const MAX_TRADES = 200;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Group an array of items by a key function */
function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

/** Clamp a value to [0, 100] and round to the nearest integer */
function score(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)));
}

// ---------------------------------------------------------------------------
// Tool definition
// ---------------------------------------------------------------------------
export const getTradeAnalyticsTool: ToolDefinition = {
  spec: {
    name: "get_trade_analytics",
    description:
      "Compute behavioural trading analytics for the authenticated user from their last 90 days of paper-trade history. " +
      "Returns metrics: trade frequency, win rate, average hold time, fee burn, diversification score, " +
      "and a rule-based behavioural archetype (e.g. FOMO Trader, Disciplined Investor). " +
      "Always call this before giving personalised behavioural feedback or improvement advice.",
    input_schema: {
      type: "object" as const,
      properties: {
        user_id: {
          type: "string",
          description: "The authenticated user's UUID",
        },
      },
      required: ["user_id"],
    },
  },

  async execute({ user_id }, { serviceClient, userId }) {
    // ── Security ─────────────────────────────────────────────────────────────
    const requestedId = String(user_id);
    if (!userId || requestedId !== userId) {
      return { error: "Cannot access another user's analytics" };
    }

    // ── Fetch sub-account ─────────────────────────────────────────────────────
    const { data: account } = await serviceClient
      .from("virtual_sub_accounts")
      .select("id, cash_balance, starting_balance")
      .eq("user_id", requestedId)
      .eq("status", "ACTIVE")
      .limit(1)
      .single();

    if (!account) {
      return { error: "No active paper trading account", user_id: requestedId };
    }

    const cutoff = new Date(
      Date.now() - ANALYSIS_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    // ── Parallel fetches ─────────────────────────────────────────────────────
    const [tradesRes, holdingsRes] = await Promise.all([
      serviceClient
        .from("virtual_trades")
        .select("symbol_code, side, quantity, price, fees, executed_at")
        .eq("sub_account_id", account.id)
        .gte("executed_at", cutoff)
        .order("executed_at", { ascending: true })
        .limit(MAX_TRADES),

      serviceClient
        .from("virtual_holdings")
        .select("symbol_code, quantity, avg_cost, realized_pl")
        .eq("sub_account_id", account.id),
    ]);

    const trades = tradesRes.data ?? [];
    const holdings = holdingsRes.data ?? [];

    // ── Basic counts ─────────────────────────────────────────────────────────
    const totalTrades = trades.length;
    const totalFees = trades.reduce((s, t) => s + Number(t.fees), 0);
    const uniqueSymbols = new Set(trades.map((t) => t.symbol_code)).size;
    const weeksInPeriod = ANALYSIS_DAYS / 7;
    const tradesPerWeek = totalTrades / weeksInPeriod;

    // ── Win rate from realized P&L on closed positions ───────────────────────
    // A "closed position" = a symbol where we've taken at least one SELL trade
    const sellSymbols = new Set(
      trades.filter((t) => t.side === "SELL").map((t) => t.symbol_code),
    );
    const closedHoldings = holdings.filter((h) =>
      sellSymbols.has(h.symbol_code),
    );
    const winRate =
      closedHoldings.length > 0
        ? closedHoldings.filter((h) => Number(h.realized_pl) > 0).length /
          closedHoldings.length
        : null;

    // ── Average hold time (BUY→SELL pairs per symbol) ────────────────────────
    const holdDays: number[] = [];
    const bySymbol = groupBy(trades, (t) => t.symbol_code);

    for (const [, symbolTrades] of bySymbol) {
      const buys = symbolTrades.filter((t) => t.side === "BUY");
      const sells = symbolTrades.filter((t) => t.side === "SELL");
      const pairs = Math.min(buys.length, sells.length);
      for (let i = 0; i < pairs; i++) {
        const buyMs = new Date(buys[i].executed_at).getTime();
        const sellMs = new Date(sells[i].executed_at).getTime();
        if (sellMs > buyMs) {
          holdDays.push((sellMs - buyMs) / 86_400_000);
        }
      }
    }
    const avgHoldDays =
      holdDays.length > 0
        ? holdDays.reduce((a, b) => a + b, 0) / holdDays.length
        : null;

    // ── Portfolio totals ──────────────────────────────────────────────────────
    const holdingsValue = holdings.reduce(
      (s, h) => s + Number(h.avg_cost) * Number(h.quantity),
      0,
    );
    const totalEquity = Number(account.cash_balance) + holdingsValue;
    const totalPL = totalEquity - Number(account.starting_balance);
    const plPct = (totalPL / Number(account.starting_balance)) * 100;

    // Fee burn = total fees paid as % of starting balance
    const feeBurnPct = (totalFees / Number(account.starting_balance)) * 100;

    // ── Behavioural dimension scores (0–100) ─────────────────────────────────
    //
    // Overtrading: 5+ trades/week = 100; 0 = 0
    const overtradingScore = score((tradesPerWeek / 5) * 100);

    // Diversification: 10+ unique symbols = 100; 0 = 0
    const diversificationScore = score((uniqueSymbols / 10) * 100);

    // Discipline: based on win rate (if available) otherwise 50
    const disciplineScore = winRate !== null ? score(winRate * 100) : 50;

    // Fee awareness: 0% fee burn = 100; ≥2% fee burn = 0
    const feeAwarenessScore = score(100 - feeBurnPct * 50);

    // Patience: avg hold ≥14d = 100; 0d = 0 (capped)
    const patienceScore =
      avgHoldDays !== null ? score((avgHoldDays / 14) * 100) : 50;

    // ── Archetype classification ──────────────────────────────────────────────
    let archetype: string;
    let archetypeKey: string;

    if (overtradingScore >= 70) {
      archetype = "Hyperactive Trader";
      archetypeKey = "overtrader";
    } else if (feeAwarenessScore < 40) {
      archetype = "Fee-Unaware Trader";
      archetypeKey = "fee_unaware";
    } else if (avgHoldDays !== null && avgHoldDays < 2) {
      archetype = "FOMO Momentum Trader";
      archetypeKey = "fomo";
    } else if (patienceScore < 30 && winRate !== null && winRate < 0.4) {
      archetype = "Loss-Averse Cutter";
      archetypeKey = "loss_averse";
    } else if (disciplineScore >= 65 && patienceScore >= 50) {
      archetype = "Disciplined Investor";
      archetypeKey = "disciplined";
    } else if (diversificationScore < 30) {
      archetype = "Concentrated Bettor";
      archetypeKey = "concentrated";
    } else {
      archetype = "Developing Investor";
      archetypeKey = "developing";
    }

    return {
      period_days: ANALYSIS_DAYS,
      total_trades: totalTrades,
      trades_per_week: Math.round(tradesPerWeek * 10) / 10,
      unique_symbols_traded: uniqueSymbols,
      current_open_positions: holdings.filter((h) => Number(h.quantity) > 0).length,
      win_rate_pct: winRate !== null ? Math.round(winRate * 1000) / 10 : null,
      avg_hold_days: avgHoldDays !== null ? Math.round(avgHoldDays * 10) / 10 : null,
      total_fees_vnd: Math.round(totalFees),
      fee_burn_rate_pct: Math.round(feeBurnPct * 100) / 100,
      total_pl_vnd: Math.round(totalPL),
      total_pl_pct: Math.round(plPct * 100) / 100,
      portfolio_value_vnd: Math.round(totalEquity),
      behavioral_scores: {
        overtrading: overtradingScore,
        diversification: diversificationScore,
        discipline: disciplineScore,
        fee_awareness: feeAwarenessScore,
        patience: patienceScore,
      },
      archetype,
      archetype_key: archetypeKey,
    };
  },
};

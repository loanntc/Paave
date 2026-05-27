import type { ToolDefinition } from "./types";

const MAX_RECENT_TRADES = 20;

export const getUserPortfolioTool: ToolDefinition = {
  spec: {
    name: "get_user_portfolio",
    description:
      "Get the authenticated user's paper trading portfolio: cash balance, current holdings, and recent trades. Use this to analyse their trading behaviour, explain their P&L, or give context-aware insights.",
    input_schema: {
      type: "object",
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
    // Security: only allow querying the authenticated user's own data
    const requestedId = String(user_id);
    if (userId && requestedId !== userId) {
      return { error: "Cannot access another user's portfolio" };
    }

    const [accountRes, holdingsRes, tradesRes] = await Promise.all([
      serviceClient
        .from("virtual_sub_accounts")
        .select(
          "id, label, currency, starting_balance, cash_balance, status, created_at",
        )
        .eq("user_id", requestedId)
        .eq("status", "ACTIVE")
        .limit(1)
        .single(),

      serviceClient
        .from("virtual_holdings")
        .select("symbol_code, quantity, avg_cost, realized_pl, updated_at")
        .eq("sub_account_id",
          // Sub-query pattern: we need the sub_account_id — fetched below after account
          // For now query by user_id via a join workaround
          // This will be refined once we have the account id
          requestedId, // placeholder — overridden below
        )
        .gt("quantity", 0),

      serviceClient
        .from("virtual_trades")
        .select(
          "id, symbol_code, side, quantity, price, fees, tax, executed_at",
        )
        .eq("sub_account_id", requestedId) // placeholder — overridden below
        .order("executed_at", { ascending: false })
        .limit(MAX_RECENT_TRADES),
    ]);

    if (accountRes.error || !accountRes.data) {
      return { error: "No active paper trading account found", user_id: requestedId };
    }

    const account = accountRes.data;
    const subAccountId = account.id;

    // Now fetch holdings and trades with the real sub_account_id
    const [holdingsReal, tradesReal] = await Promise.all([
      serviceClient
        .from("virtual_holdings")
        .select("symbol_code, quantity, avg_cost, realized_pl, updated_at")
        .eq("sub_account_id", subAccountId)
        .gt("quantity", 0),

      serviceClient
        .from("virtual_trades")
        .select(
          "symbol_code, side, quantity, price, fees, executed_at",
        )
        .eq("sub_account_id", subAccountId)
        .order("executed_at", { ascending: false })
        .limit(MAX_RECENT_TRADES),
    ]);

    const holdings = holdingsReal.data ?? [];
    const trades = tradesReal.data ?? [];

    const totalCost = holdings.reduce(
      (sum, h) => sum + Number(h.avg_cost) * Number(h.quantity),
      0,
    );

    return {
      account: {
        id: subAccountId,
        currency: account.currency,
        starting_balance: account.starting_balance,
        cash_balance: account.cash_balance,
        holdings_cost_basis: totalCost,
        total_invested: Number(account.starting_balance) - Number(account.cash_balance),
      },
      holdings: holdings.map((h) => ({
        ticker: h.symbol_code,
        quantity: h.quantity,
        avg_cost: h.avg_cost,
        realized_pl: h.realized_pl,
      })),
      recent_trades: trades.map((t) => ({
        ticker: t.symbol_code,
        side: t.side,
        quantity: t.quantity,
        price: t.price,
        fees: t.fees,
        executed_at: t.executed_at,
      })),
    };
  },
};

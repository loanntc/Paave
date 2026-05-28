import { NextRequest, NextResponse } from "next/server";
import { createCookieClient, createServiceClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** Broker commission rate — applied to both BUY and SELL gross value */
const BROKER_FEE_RATE = 0.0025; // 0.25%

/**
 * VSD (Vietnam Securities Depository) tax on SELL side only.
 * Source: Circular 37/2016/TT-BTC — 0.1% of matched sell value.
 */
const VSD_TAX_RATE = 0.001; // 0.1%

/** Max single-order quantity guard (paper trading safety limit) */
const MAX_ORDER_QUANTITY = 1_000_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TradeInput {
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validateInput(body: unknown): { data: TradeInput } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;

  const ticker =
    typeof b.ticker === "string" ? b.ticker.trim().toUpperCase() : null;
  if (!ticker || !/^[A-Z0-9]{1,10}$/.test(ticker)) {
    return { error: "Invalid ticker symbol" };
  }

  if (b.side !== "BUY" && b.side !== "SELL") {
    return { error: "side must be BUY or SELL" };
  }

  const quantity = Number(b.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_ORDER_QUANTITY) {
    return { error: `quantity must be a positive integer ≤ ${MAX_ORDER_QUANTITY}` };
  }

  const price = Number(b.price);
  if (!isFinite(price) || price <= 0) {
    return { error: "price must be a positive number" };
  }

  return { data: { ticker, side: b.side, quantity, price } };
}

// ---------------------------------------------------------------------------
// POST /api/trade
// ---------------------------------------------------------------------------
/**
 * Execute a paper-trade (instant fill). No real money involved.
 *
 * Auth:     Session cookie → user.id verified server-side.
 * Security: userId sourced from session, never from request body.
 *           Service role client used only for data writes (bypasses RLS).
 *           Balance checks happen before any write.
 */
export async function POST(req: NextRequest) {
  // ── 1. Authenticate ───────────────────────────────────────────────────────
  const cookieClient = await createCookieClient();
  const {
    data: { user },
    error: authError,
  } = await cookieClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse & validate body ─────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateInput(rawBody);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { ticker, side, quantity, price } = validated.data;

  // ── 3. Fetch sub-account ─────────────────────────────────────────────────
  const service = createServiceClient();

  const { data: account, error: accountError } = await service
    .from("virtual_sub_accounts")
    .select("id, cash_balance")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .limit(1)
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { error: "No active paper trading account found" },
      { status: 404 },
    );
  }

  const subAccountId = account.id as string;
  const cashBalance = Number(account.cash_balance);

  // ── 4. Calculate fees and totals ─────────────────────────────────────────
  const grossValue = quantity * price;
  const fees = Math.round(grossValue * BROKER_FEE_RATE);
  const tax = side === "SELL" ? Math.round(grossValue * VSD_TAX_RATE) : 0;

  // ── 5. Pre-flight checks ─────────────────────────────────────────────────
  if (side === "BUY") {
    const totalCost = grossValue + fees;
    if (cashBalance < totalCost) {
      return NextResponse.json(
        {
          error: "Insufficient cash balance",
          required: totalCost,
          available: cashBalance,
        },
        { status: 422 },
      );
    }
  } else {
    const { data: holding } = await service
      .from("virtual_holdings")
      .select("quantity, avg_cost")
      .eq("sub_account_id", subAccountId)
      .eq("symbol_code", ticker)
      .maybeSingle();

    const heldQty = holding ? Number(holding.quantity) : 0;
    if (heldQty < quantity) {
      return NextResponse.json(
        {
          error: "Insufficient holdings",
          required: quantity,
          available: heldQty,
        },
        { status: 422 },
      );
    }
  }

  // ── 6. Create order (instant-fill paper trade) ───────────────────────────
  const { data: order, error: orderError } = await service
    .from("virtual_orders")
    .insert({
      sub_account_id: subAccountId,
      symbol_code: ticker,
      side,
      order_type: "LO",
      price,
      quantity,
      filled_quantity: quantity,
      avg_fill_price: price,
      status: "FILLED",
      matched_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Failed to create order", detail: orderError?.message },
      { status: 500 },
    );
  }

  // ── 7. Create trade record ───────────────────────────────────────────────
  const { data: trade, error: tradeError } = await service
    .from("virtual_trades")
    .insert({
      order_id: order.id,
      sub_account_id: subAccountId,
      symbol_code: ticker,
      side,
      quantity,
      price,
      fees,
      tax,
    })
    .select("id, executed_at")
    .single();

  if (tradeError || !trade) {
    // Best-effort rollback of the order
    await service.from("virtual_orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "Failed to record trade", detail: tradeError?.message },
      { status: 500 },
    );
  }

  // ── 8. Upsert holdings ───────────────────────────────────────────────────
  const { data: existingHolding } = await service
    .from("virtual_holdings")
    .select("quantity, avg_cost, realized_pl")
    .eq("sub_account_id", subAccountId)
    .eq("symbol_code", ticker)
    .maybeSingle();

  const prevQty = existingHolding ? Number(existingHolding.quantity) : 0;
  const prevAvg = existingHolding ? Number(existingHolding.avg_cost) : price;
  const prevPL = existingHolding ? Number(existingHolding.realized_pl) : 0;

  let newQty: number;
  let newAvg: number;
  let newPL: number;

  if (side === "BUY") {
    newQty = prevQty + quantity;
    newAvg = newQty > 0
      ? (prevQty * prevAvg + quantity * price) / newQty
      : price;
    newPL = prevPL;
  } else {
    newQty = prevQty - quantity;
    newAvg = prevAvg;
    newPL = prevPL + (price - prevAvg) * quantity;
  }

  await service.from("virtual_holdings").upsert(
    {
      sub_account_id: subAccountId,
      symbol_code: ticker,
      quantity: Math.max(0, newQty),
      avg_cost: newAvg,
      realized_pl: newPL,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "sub_account_id,symbol_code" },
  );

  // ── 9. Update cash balance ────────────────────────────────────────────────
  const cashDelta =
    side === "BUY"
      ? -(grossValue + fees)
      : grossValue - fees - tax;

  await service
    .from("virtual_sub_accounts")
    .update({ cash_balance: cashBalance + cashDelta })
    .eq("id", subAccountId);

  // ── 10. Return fill confirmation ──────────────────────────────────────────
  return NextResponse.json({
    trade: {
      id: trade.id,
      ticker,
      side,
      quantity,
      price,
      fees,
      tax,
      grossValue,
      netCash: cashDelta,
      executed_at: trade.executed_at,
    },
  });
}

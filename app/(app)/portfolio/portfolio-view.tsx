"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { BehaviorAnalysisCard } from "@/components/paave/behavior-analysis-card";
import { formatVND, pctLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Supabase browser client
// ---------------------------------------------------------------------------
function getBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AccountData {
  cash_balance: number;
  starting_balance: number;
}

interface HoldingRow {
  symbol_code: string;
  quantity: number;
  avg_cost: number;
  realized_pl: number;
}

interface TradeRow {
  id: string;
  symbol_code: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  fees: number;
  executed_at: string;
}

// ---------------------------------------------------------------------------
// Portfolio View
// ---------------------------------------------------------------------------
export function PortfolioView() {
  const [userId, setUserId] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [holdings, setHoldings] = useState<HoldingRow[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"holdings" | "behavior" | "history">("holdings");

  useEffect(() => {
    const db = getBrowserClient();

    async function fetchData() {
      // Get current session
      const {
        data: { session },
      } = await db.auth.getSession();

      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      // Fetch sub-account + holdings in parallel
      const [accountRes, holdingsRes] = await Promise.all([
        db
          .from("virtual_sub_accounts")
          .select("cash_balance, starting_balance")
          .eq("user_id", uid)
          .eq("status", "ACTIVE")
          .limit(1)
          .single(),

        db
          .from("virtual_holdings")
          .select("symbol_code, quantity, avg_cost, realized_pl")
          .eq(
            "sub_account_id",
            // We'll refetch with the real sub_account_id below once we have it
            uid, // placeholder — overridden in second pass
          )
          .gt("quantity", 0),
      ]);

      if (accountRes.data) {
        setAccount({
          cash_balance: Number(accountRes.data.cash_balance),
          starting_balance: Number(accountRes.data.starting_balance),
        });
      }

      // Now fetch holdings with real sub_account_id if we got the account
      if (accountRes.data) {
        const { data: accountWithId } = await db
          .from("virtual_sub_accounts")
          .select("id")
          .eq("user_id", uid)
          .eq("status", "ACTIVE")
          .limit(1)
          .single();

        if (accountWithId) {
          const [holdingsRes2, tradesRes] = await Promise.all([
            db
              .from("virtual_holdings")
              .select("symbol_code, quantity, avg_cost, realized_pl")
              .eq("sub_account_id", accountWithId.id)
              .gt("quantity", 0)
              .order("symbol_code"),

            db
              .from("virtual_trades")
              .select("id, symbol_code, side, quantity, price, fees, executed_at")
              .eq("sub_account_id", accountWithId.id)
              .order("executed_at", { ascending: false })
              .limit(50),
          ]);

          setHoldings(
            (holdingsRes2.data ?? []).map((h) => ({
              symbol_code: h.symbol_code,
              quantity: Number(h.quantity),
              avg_cost: Number(h.avg_cost),
              realized_pl: Number(h.realized_pl),
            })),
          );

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
        }
      }

      // Use holdingsRes as fallback if account fetch failed
      if (!accountRes.data && holdingsRes.data) {
        setHoldings(
          holdingsRes.data.map((h) => ({
            symbol_code: h.symbol_code,
            quantity: Number(h.quantity),
            avg_cost: Number(h.avg_cost),
            realized_pl: Number(h.realized_pl),
          })),
        );
      }

      setIsLoading(false);
    }

    fetchData();
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const holdingsValue = holdings.reduce(
    (s, h) => s + h.avg_cost * h.quantity,
    0,
  );
  const totalEquity = account
    ? account.cash_balance + holdingsValue
    : holdingsValue;
  const totalPL = account ? totalEquity - account.starting_balance : 0;
  const totalPLPct = account
    ? (totalPL / account.starting_balance) * 100
    : 0;
  const isUp = totalPL >= 0;

  return (
    <main className="min-h-screen bg-ink-violet-base text-text-neo-primary pb-24">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-ink-violet-base/90 backdrop-blur border-b border-border-neo-subtle">
        <Link
          href="/home"
          aria-label="Go back"
          className="grid size-9 place-items-center rounded-full border border-border-neo bg-ink-violet-surface text-text-neo-secondary hover:text-text-neo-primary transition-colors"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
        </Link>
        <span className="font-display text-[18px] font-bold tracking-[-0.3px]">
          Danh mục
        </span>
      </header>

      <div className="px-4 pt-5 space-y-4 max-w-[640px] mx-auto">

        {/* ── Equity hero ──────────────────────────────────────────────── */}
        {isLoading ? (
          <EquitySkeleton />
        ) : account ? (
          <section aria-label="Portfolio value" className="space-y-1">
            <p className="text-[12px] uppercase tracking-[0.5px] text-text-neo-tertiary">
              Tổng tài sản
            </p>
            <p className="font-display text-[38px] font-bold tabular-nums tracking-[-1px] leading-none">
              {formatVND(totalEquity)}
            </p>
            <div
              className={cn(
                "flex items-center gap-2 text-[14px] font-display tabular-nums",
                isUp ? "text-positive" : "text-negative",
              )}
            >
              {isUp ? (
                <TrendingUp className="size-4" strokeWidth={2} />
              ) : (
                <TrendingDown className="size-4" strokeWidth={2} />
              )}
              <span>{formatVND(Math.abs(totalPL))}</span>
              <span className="text-[12px] opacity-80">
                ({pctLabel(totalPLPct)})
              </span>
            </div>

            {/* Cash vs Invested bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-text-neo-tertiary">
                <span>Tiền mặt {formatVND(account.cash_balance)}</span>
                <span>Đầu tư {formatVND(holdingsValue)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-ink-violet-raised overflow-hidden">
                <div
                  className="h-full rounded-full bg-lime-signal-400 transition-all duration-500"
                  style={{
                    width:
                      totalEquity > 0
                        ? `${(account.cash_balance / totalEquity) * 100}%`
                        : "100%",
                  }}
                />
              </div>
            </div>
          </section>
        ) : (
          <p className="text-[13px] text-text-neo-tertiary">
            Đăng nhập để xem danh mục của bạn.
          </p>
        )}

        {/* ── Tab switcher ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-ink-violet-surface border border-border-neo p-1">
          {(["holdings", "history", "behavior"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-xl py-2 text-[12px] font-bold uppercase tracking-[0.5px] transition-colors",
                activeTab === tab
                  ? "bg-ink-violet-raised text-text-neo-primary"
                  : "text-text-neo-tertiary hover:text-text-neo-secondary",
              )}
            >
              {tab === "holdings" ? "Vị thế" : tab === "history" ? "Lịch sử" : "Hành vi"}
            </button>
          ))}
        </div>

        {/* ── Holdings tab ──────────────────────────────────────────────── */}
        {activeTab === "holdings" && (
          <>
            {isLoading ? (
              <HoldingsSkeleton />
            ) : holdings.length === 0 ? (
              <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-8 text-center">
                <p className="text-[14px] text-text-neo-secondary mb-1">
                  Chưa có vị thế nào
                </p>
                <p className="text-[12px] text-text-neo-tertiary">
                  Đặt lệnh giả lập từ trang chi tiết cổ phiếu để bắt đầu.
                </p>
              </div>
            ) : (
              <section
                aria-label="Holdings"
                className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden"
              >
                <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
                  Vị thế đang nắm ({holdings.length})
                </h2>
                <div className="divide-y divide-border-neo-subtle">
                  {holdings.map((h) => (
                    <HoldingRow key={h.symbol_code} holding={h} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── History tab ──────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <>
            {isLoading ? (
              <HistorySkeleton />
            ) : trades.length === 0 ? (
              <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-8 text-center">
                <p className="text-[14px] text-text-neo-secondary mb-1">
                  Chưa có lệnh nào
                </p>
                <p className="text-[12px] text-text-neo-tertiary">
                  Đặt lệnh giả lập đầu tiên từ trang chi tiết cổ phiếu.
                </p>
              </div>
            ) : (
              <section
                aria-label="Trade history"
                className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden"
              >
                <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
                  50 lệnh gần nhất
                </h2>
                <div className="divide-y divide-border-neo-subtle">
                  {trades.map((t) => (
                    <TradeHistoryRow key={t.id} trade={t} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Behavior tab ─────────────────────────────────────────────── */}
        {activeTab === "behavior" && userId && (
          <BehaviorAnalysisCard userId={userId} />
        )}

        {activeTab === "behavior" && !userId && !isLoading && (
          <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-8 text-center">
            <p className="text-[13px] text-text-neo-tertiary">
              Đăng nhập để xem phân tích hành vi giao dịch.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Holding row
// ---------------------------------------------------------------------------
function HoldingRow({ holding }: { holding: HoldingRow }) {
  const bookValue = holding.avg_cost * holding.quantity;
  const realizedIsUp = holding.realized_pl >= 0;

  return (
    <Link
      href={`/stock/${holding.symbol_code}`}
      className="flex items-center justify-between px-4 py-3 hover:bg-ink-violet-raised transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="font-display text-[14px] font-bold text-text-neo-primary">
          {holding.symbol_code}
        </p>
        <p className="text-[11px] text-text-neo-tertiary">
          {holding.quantity.toLocaleString()} CP · TB {formatVND(holding.avg_cost)}
        </p>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="font-display text-[14px] tabular-nums text-text-neo-primary">
          {formatVND(bookValue)}
        </p>
        {holding.realized_pl !== 0 && (
          <p
            className={cn(
              "text-[11px] tabular-nums",
              realizedIsUp ? "text-positive" : "text-negative",
            )}
          >
            {realizedIsUp ? "+" : ""}
            {formatVND(holding.realized_pl)} lãi TH
          </p>
        )}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Skeletons
// ---------------------------------------------------------------------------
function EquitySkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3 w-20 rounded bg-ink-violet-surface" />
      <div className="h-10 w-56 rounded-lg bg-ink-violet-surface" />
      <div className="h-5 w-36 rounded-lg bg-ink-violet-surface" />
    </div>
  );
}

function HoldingsSkeleton() {
  return (
    <div className="rounded-2xl bg-ink-violet-surface border border-border-neo p-4 space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-3 w-16 rounded bg-ink-violet-raised" />
            <div className="h-2.5 w-24 rounded bg-ink-violet-raised" />
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-3 w-20 rounded bg-ink-violet-raised" />
            <div className="h-2.5 w-14 rounded bg-ink-violet-raised" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="rounded-2xl bg-ink-violet-surface border border-border-neo p-4 space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-7 w-14 rounded-lg bg-ink-violet-raised shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-12 rounded bg-ink-violet-raised" />
            <div className="h-2.5 w-28 rounded bg-ink-violet-raised" />
          </div>
          <div className="space-y-1.5 text-right shrink-0">
            <div className="h-3 w-20 rounded bg-ink-violet-raised" />
            <div className="h-2.5 w-16 rounded bg-ink-violet-raised" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trade history row
// ---------------------------------------------------------------------------
function TradeHistoryRow({ trade }: { trade: TradeRow }) {
  const isBuy = trade.side === "BUY";
  const gross = trade.price * trade.quantity;

  // e.g. "27/05 · 14:32"
  const date = new Date(trade.executed_at);
  const dateLabel = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")} · ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return (
    <Link
      href={`/stock/${trade.symbol_code}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-ink-violet-raised transition-colors"
    >
      {/* Side badge */}
      <span
        className={cn(
          "shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.4px]",
          isBuy
            ? "bg-positive/10 text-positive border border-positive/20"
            : "bg-negative/10 text-negative border border-negative/20",
        )}
      >
        {isBuy ? (
          <ArrowDownLeft className="size-3" strokeWidth={2.5} />
        ) : (
          <ArrowUpRight className="size-3" strokeWidth={2.5} />
        )}
        {isBuy ? "Mua" : "Bán"}
      </span>

      {/* Symbol + meta */}
      <div className="min-w-0 flex-1">
        <p className="font-display text-[14px] font-bold text-text-neo-primary">
          {trade.symbol_code}
        </p>
        <p className="text-[11px] text-text-neo-tertiary">
          {trade.quantity.toLocaleString()} CP · {dateLabel}
        </p>
      </div>

      {/* Value */}
      <div className="text-right shrink-0">
        <p className="font-display text-[14px] tabular-nums text-text-neo-primary">
          {formatVND(gross)}
        </p>
        <p className="text-[11px] tabular-nums text-text-neo-tertiary">
          Phí {formatVND(trade.fees)}
        </p>
      </div>
    </Link>
  );
}

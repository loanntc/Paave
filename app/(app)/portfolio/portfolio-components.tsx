// Portfolio sub-components — HoldingRow, TradeHistoryRow, and loading skeletons.
// All pure display; no hooks or client state.

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { HoldingData, TradeRow } from "./use-portfolio-data";
import { formatVND, formatICTDatetime } from "@/lib/format";
import { cn } from "@/lib/utils";

// Re-export types so consumers can import everything from one place
export type { HoldingData, TradeRow };

// ---------------------------------------------------------------------------
// HoldingRow — one row per active stock position
// ---------------------------------------------------------------------------
export function HoldingRow({
  holding,
  lastPrice,
}: {
  holding: HoldingData;
  lastPrice?: number;
}) {
  const currentPrice = lastPrice ?? holding.avg_cost;
  const currentValue = currentPrice * holding.quantity;
  // Unrealized P&L shown only when we have a live price
  const unrealizedPL =
    lastPrice != null ? (lastPrice - holding.avg_cost) * holding.quantity : null;
  const unrealizedPct =
    lastPrice != null && holding.avg_cost > 0
      ? ((lastPrice - holding.avg_cost) / holding.avg_cost) * 100
      : null;
  const isUp = (unrealizedPL ?? 0) >= 0;

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
          {formatVND(currentValue)}
        </p>
        {unrealizedPL !== null ? (
          <p
            className={cn(
              "text-[11px] tabular-nums",
              isUp ? "text-positive" : "text-negative",
            )}
          >
            {isUp ? "+" : ""}
            {formatVND(unrealizedPL)}
            {unrealizedPct !== null && (
              <span className="opacity-70">
                {" "}({unrealizedPct >= 0 ? "+" : ""}{unrealizedPct.toFixed(1)}%)
              </span>
            )}
          </p>
        ) : holding.realized_pl !== 0 ? (
          <p
            className={cn(
              "text-[11px] tabular-nums",
              holding.realized_pl >= 0 ? "text-positive" : "text-negative",
            )}
          >
            {holding.realized_pl >= 0 ? "+" : ""}
            {formatVND(holding.realized_pl)} TH
          </p>
        ) : null}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// TradeHistoryRow — one row per trade execution
// ---------------------------------------------------------------------------
export function TradeHistoryRow({ trade }: { trade: TradeRow }) {
  const isBuy = trade.side === "BUY";
  const gross = trade.price * trade.quantity;

  // e.g. "27/05 · 14:32" — formatted in ICT (Asia/Ho_Chi_Minh) so the time
  // is correct regardless of the device's local timezone.
  const dateLabel = formatICTDatetime(trade.executed_at);

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

// ---------------------------------------------------------------------------
// Skeletons — loading state placeholders
// ---------------------------------------------------------------------------
export function EquitySkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-3 w-20 rounded bg-ink-violet-surface" />
      <div className="h-10 w-56 rounded-lg bg-ink-violet-surface" />
      <div className="h-5 w-36 rounded-lg bg-ink-violet-surface" />
    </div>
  );
}

export function HoldingsSkeleton() {
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

export function HistorySkeleton() {
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

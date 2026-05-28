// Display sub-components for StockDetailView.
// All pure display — no data fetching, no routing side effects.

import type { ReactNode } from "react";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { QuoteData, HoldingData, SimilarStock } from "./use-stock-detail-data";

// Re-export types consumed by the view file so it only needs one import origin.
export type { QuoteData, HoldingData, SimilarStock };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a volume number to K/M shorthand (e.g. 1_500_000 → "1.5M"). */
export function formatVolume(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

// ---------------------------------------------------------------------------
// ActionButton
// ---------------------------------------------------------------------------
export function ActionButton({
  icon,
  label,
  primary = false,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  primary?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2 text-[11px] font-bold uppercase tracking-[0.5px] transition-all active:scale-[0.97]",
        primary
          ? "bg-lime-signal-400 text-ink-violet-base"
          : active
            ? "bg-lime-signal-400/15 border border-lime-signal-400/40 text-lime-signal-400"
            : "bg-ink-violet-surface border border-border-neo text-text-neo-secondary hover:text-text-neo-primary",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PositionCard — current user holding with unrealized P&L
// ---------------------------------------------------------------------------
export function PositionCard({
  holding,
  lastPrice,
}: {
  holding: HoldingData;
  lastPrice: number | null;
}) {
  const unrealizedPL =
    lastPrice != null
      ? (lastPrice - holding.avg_cost) * holding.quantity
      : null;
  const unrealizedPct =
    lastPrice != null && holding.avg_cost > 0
      ? ((lastPrice - holding.avg_cost) / holding.avg_cost) * 100
      : null;
  const isUp = (unrealizedPL ?? 0) >= 0;

  return (
    <section
      aria-label="Vị thế của bạn"
      className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-neo-tertiary mb-1">
            Vị thế của bạn
          </p>
          <p className="font-display text-[14px] font-bold text-text-neo-primary">
            {holding.quantity.toLocaleString()} CP
          </p>
          <p className="text-[12px] text-text-neo-tertiary">
            Giá TB {formatVND(holding.avg_cost)}
          </p>
        </div>

        {unrealizedPL != null && (
          <div className="text-right">
            <div
              className={cn(
                "inline-flex items-center gap-1 text-[13px] font-display tabular-nums font-bold",
                isUp ? "text-positive" : "text-negative",
              )}
            >
              {isUp ? (
                <TrendingUp className="size-3.5" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="size-3.5" strokeWidth={2.5} />
              )}
              {isUp ? "+" : ""}
              {formatVND(Math.abs(unrealizedPL))}
            </div>
            {unrealizedPct != null && (
              <p className={cn("text-[11px] tabular-nums", isUp ? "text-positive" : "text-negative")}>
                {isUp ? "+" : ""}
                {unrealizedPct.toFixed(2)}% chưa TH
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-border-neo-subtle">
        <Link
          href="/portfolio"
          className="text-[11px] text-text-neo-tertiary hover:text-text-neo-secondary transition-colors"
        >
          Xem danh mục →
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// KeyStats — key trading statistics grid
// ---------------------------------------------------------------------------
type StatTone = "positive" | "negative" | "neutral" | undefined;

export function KeyStats({ quote }: { quote: QuoteData }) {
  const stats: { label: string; value: string; wide?: boolean; tone?: StatTone }[] = [
    { label: "Giá mở cửa", value: formatVND(quote.open_price) },
    { label: "Cao nhất", value: formatVND(quote.high_price), tone: "positive" },
    { label: "Thấp nhất", value: formatVND(quote.low_price), tone: "negative" },
    // Reference price = prior-day close, used to compute price limits
    { label: "Tham chiếu", value: formatVND(quote.ref_price), tone: "neutral" },
    // Exchange-imposed limits: ±7% HOSE, ±10% HNX, ±15% UPCoM
    { label: "Trần", value: formatVND(quote.ceiling_price), tone: "positive" },
    { label: "Sàn", value: formatVND(quote.floor_price), tone: "negative" },
    { label: "KL giao dịch", value: formatVolume(quote.total_volume), wide: true },
  ];

  return (
    <section aria-label="Key stats" className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden">
      <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
        Thống kê
      </h2>
      <div className="grid grid-cols-3 divide-x divide-y divide-border-neo-subtle">
        {stats.map(({ label, value, wide, tone }) => (
          <div
            key={label}
            className={cn("px-4 py-3", wide && "col-span-3 border-t border-border-neo-subtle")}
          >
            <div className="text-[10px] uppercase tracking-[0.5px] text-text-neo-tertiary mb-0.5">
              {label}
            </div>
            <div
              className={cn(
                "font-display text-[14px] tabular-nums",
                tone === "positive" ? "text-positive"
                : tone === "negative" ? "text-negative"
                : tone === "neutral" ? "text-text-neo-secondary"
                : "text-text-neo-primary",
              )}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function KeyStatsSkeleton() {
  return (
    <div className="rounded-2xl bg-ink-violet-surface border border-border-neo p-4 animate-pulse">
      <div className="h-3 w-16 rounded bg-ink-violet-raised mb-4" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2 w-12 rounded bg-ink-violet-raised" />
            <div className="h-4 w-20 rounded bg-ink-violet-raised" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SimilarStocksSection — same-sector stocks sorted by volume
// ---------------------------------------------------------------------------
export function SimilarStocksSection({
  sector,
  stocks,
}: {
  sector: string;
  stocks: SimilarStock[];
}) {
  return (
    <section aria-label={`Cổ phiếu cùng ngành ${sector}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary mb-2">
        Cùng ngành · {sector}
      </p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {stocks.map((s) => {
          const isUp = (s.pctChange ?? 0) >= 0;
          return (
            <Link
              key={s.code}
              href={`/stock/${s.code}`}
              className="shrink-0 rounded-2xl bg-ink-violet-surface border border-border-neo px-3 py-2.5 min-w-[110px] hover:bg-ink-violet-raised transition-colors active:scale-[0.98]"
            >
              <p className="font-display text-[13px] font-bold text-text-neo-primary">{s.code}</p>
              <p className="text-[10px] text-text-neo-tertiary truncate mt-0.5 max-w-[90px]">
                {s.name}
              </p>
              {s.lastPrice != null && (
                <>
                  <p className="font-display text-[12px] tabular-nums text-text-neo-primary mt-1.5">
                    {formatVND(s.lastPrice)}
                  </p>
                  {s.pctChange != null && (
                    <p className={cn("text-[10px] tabular-nums font-medium", isUp ? "text-positive" : "text-negative")}>
                      {isUp ? "+" : ""}
                      {s.pctChange.toFixed(2)}%
                    </p>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

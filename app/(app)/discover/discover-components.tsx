// Sub-components for DiscoverView.
// All components here are rendered within discover-view.tsx's "use client" boundary
// and do not need their own "use client" directive.

import Link from "next/link";
import {
  Bell,
  BookmarkCheck,
  BookmarkPlus,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import type { StockResult } from "@/app/api/stocks/search/route";
import type { PriceAlert } from "@/lib/use-price-alerts";
import { useWatchlist } from "@/lib/use-watchlist";
import { formatVND, pctLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Shared type — exported so discover-view.tsx can import it
// ---------------------------------------------------------------------------
export interface WatchlistQuote {
  price: number;
  pctChange: number | null;
}

// ---------------------------------------------------------------------------
// StockResultRow — one row in the search / ranking results list
// ---------------------------------------------------------------------------
export function StockResultRow({ stock }: { stock: StockResult }) {
  const hasPrice = stock.last_price != null;
  const isUp = (stock.pct_change ?? 0) >= 0;
  const { isWatched, toggleWatchlist } = useWatchlist();
  const watched = isWatched(stock.code);

  return (
    // Wrapper div so the bookmark button is a sibling of the Link, not a child
    <div className="flex items-center hover:bg-ink-violet-raised transition-colors">
      <Link
        href={`/stock/${stock.code}`}
        className="flex items-center flex-1 min-w-0 px-4 py-3 gap-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-[14px] font-bold text-text-neo-primary">
              {stock.code}
            </span>
            {stock.exchange && (
              <span className="text-[10px] font-bold uppercase tracking-[0.3px] text-text-neo-tertiary border border-border-neo rounded px-1 py-px">
                {stock.exchange}
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-neo-tertiary truncate mt-0.5">
            {stock.short_name ?? stock.name}
          </p>
        </div>

        {hasPrice && (
          <div className="text-right shrink-0">
            <p className="font-display text-[14px] tabular-nums text-text-neo-primary">
              {formatVND(stock.last_price!)}
            </p>
            <p
              className={cn(
                "flex items-center justify-end gap-0.5 text-[11px] tabular-nums",
                isUp ? "text-positive" : "text-negative",
              )}
            >
              {isUp ? (
                <TrendingUp className="size-3" strokeWidth={2} />
              ) : (
                <TrendingDown className="size-3" strokeWidth={2} />
              )}
              {pctLabel(stock.pct_change ?? 0)}
            </p>
          </div>
        )}
      </Link>

      <button
        onClick={() => toggleWatchlist(stock.code)}
        aria-label={watched ? `Bỏ theo dõi ${stock.code}` : `Theo dõi ${stock.code}`}
        className={cn(
          "shrink-0 grid size-10 place-items-center mr-2 rounded-xl transition-colors",
          watched
            ? "text-lime-signal-400 hover:text-lime-signal-400/70"
            : "text-text-neo-tertiary hover:text-text-neo-secondary",
        )}
      >
        {watched
          ? <BookmarkCheck className="size-4" strokeWidth={2} />
          : <BookmarkPlus className="size-4" strokeWidth={2} />
        }
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TriggeredAlertRow — single row for an alert whose condition is currently met
// ---------------------------------------------------------------------------
export function TriggeredAlertRow({
  alert,
  onDismiss,
}: {
  alert: PriceAlert;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Bell className="size-4 text-lime-signal-400 shrink-0" strokeWidth={2} />
      <Link href={`/stock/${alert.ticker}`} className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-text-neo-primary">
          {alert.ticker}
          <span className="font-normal text-lime-signal-400 ml-1.5">
            {alert.condition === "above" ? "≥" : "≤"} {formatVND(alert.target)}
          </span>
        </p>
        <p className="text-[11px] text-lime-signal-400/70">
          {alert.condition === "above" ? "Đã vượt lên trên" : "Đã giảm xuống dưới"} mức mục tiêu
        </p>
      </Link>
      <button
        onClick={onDismiss}
        aria-label={`Xoá thông báo ${alert.ticker}`}
        className="shrink-0 grid size-7 place-items-center rounded-full text-text-neo-tertiary hover:text-text-neo-primary hover:bg-ink-violet-raised transition-colors"
      >
        <X className="size-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WatchlistChip — a removable ticker card with live price
// ---------------------------------------------------------------------------
export function WatchlistChip({
  ticker,
  quote,
  onRemove,
}: {
  ticker: string;
  quote: WatchlistQuote | null;
  onRemove: () => void;
}) {
  const isUp = (quote?.pctChange ?? 0) >= 0;
  return (
    <div className="flex items-stretch rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden">
      <Link
        href={`/stock/${ticker}`}
        className="flex flex-col justify-center px-3 py-2 min-w-0 hover:bg-ink-violet-raised transition-colors"
      >
        <span className="font-display text-[13px] font-bold text-text-neo-primary">
          {ticker}
        </span>
        {quote ? (
          <span
            className={cn(
              "text-[11px] tabular-nums font-medium",
              quote.pctChange != null
                ? isUp
                  ? "text-positive"
                  : "text-negative"
                : "text-text-neo-tertiary",
            )}
          >
            {formatVND(quote.price)}
            {quote.pctChange != null && (
              <> · {isUp ? "+" : ""}{pctLabel(quote.pctChange)}</>
            )}
          </span>
        ) : (
          <span className="text-[11px] text-text-neo-tertiary animate-pulse">…</span>
        )}
      </Link>
      <button
        onClick={onRemove}
        aria-label={`Xóa ${ticker} khỏi danh sách theo dõi`}
        className="flex items-center px-2 text-text-neo-tertiary hover:text-text-neo-primary hover:bg-ink-violet-raised border-l border-border-neo-subtle transition-colors"
      >
        <X className="size-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SectorFilterRow — horizontal scrolling sector chip bar
// ---------------------------------------------------------------------------
export function SectorFilterRow({
  sectors,
  selected,
  onSelect,
  onClear,
}: {
  sectors: string[];
  selected: string | null;
  onSelect: (sector: string) => void;
  onClear: () => void;
}) {
  return (
    <section aria-label="Lọc theo ngành">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {/* "Tất cả" chip always first — clearing the sector filter is always visible */}
        <button
          onClick={onClear}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border whitespace-nowrap",
            selected === null
              ? "bg-lime-signal-400/10 border-lime-signal-400/40 text-lime-signal-400"
              : "bg-ink-violet-surface border-border-neo text-text-neo-tertiary hover:text-text-neo-secondary",
          )}
        >
          Tất cả
        </button>
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border whitespace-nowrap",
              selected === s
                ? "bg-violet-deep-300/15 border-violet-deep-300/50 text-violet-deep-200"
                : "bg-ink-violet-surface border-border-neo text-text-neo-tertiary hover:text-text-neo-secondary hover:border-border-neo",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Empty + skeleton states
// ---------------------------------------------------------------------------
export function EmptyState({
  query,
  sector,
}: {
  query: string;
  sector: string | null;
}) {
  return (
    <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-10 text-center">
      <p className="text-[14px] text-text-neo-secondary mb-1">
        {query.length > 0
          ? `Không tìm thấy kết quả cho "${query}"`
          : sector
            ? `Chưa có dữ liệu cho ngành "${sector}"`
            : "Không có dữ liệu thị trường"}
      </p>
      {query.length > 0 && (
        <p className="text-[12px] text-text-neo-tertiary">
          Thử tìm bằng mã cổ phiếu (VIC, FPT, VNM…)
        </p>
      )}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="rounded-2xl bg-ink-violet-surface border border-border-neo p-4 space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-12 rounded bg-ink-violet-raised" />
              <div className="h-3 w-10 rounded bg-ink-violet-raised" />
            </div>
            <div className="h-2.5 w-32 rounded bg-ink-violet-raised" />
          </div>
          <div className="space-y-1.5 text-right shrink-0 ml-4">
            <div className="h-3.5 w-24 rounded bg-ink-violet-raised" />
            <div className="h-2.5 w-14 rounded bg-ink-violet-raised" />
          </div>
        </div>
      ))}
    </div>
  );
}

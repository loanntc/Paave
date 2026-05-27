"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookmarkCheck, Search, TrendingDown, TrendingUp, X } from "lucide-react";
import type { StockResult } from "@/app/api/stocks/search/route";
import { formatVND, pctLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/use-watchlist";

// ---------------------------------------------------------------------------
// DiscoverView
// ---------------------------------------------------------------------------
export function DiscoverView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState("Khối lượng cao nhất");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { hydrated, watchlist, removeFromWatchlist } = useWatchlist();

  // Fetch on mount (default = top by volume) and on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const delay = query.length > 0 ? 300 : 0;

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `/api/stocks/search${query ? `?q=${encodeURIComponent(query)}` : ""}`;
        const res = await fetch(url);
        const data: { results: StockResult[]; query: string } = await res.json();
        setResults(data.results);
        setSection(
          data.query.length > 0 ? `Kết quả cho "${data.query}"` : "Khối lượng cao nhất",
        );
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <main className="min-h-screen bg-ink-violet-base text-text-neo-primary pb-24">

      {/* ── Sticky header + search ──────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-ink-violet-base/95 backdrop-blur border-b border-border-neo-subtle px-4 pt-3 pb-3 space-y-3">
        <span className="font-display text-[18px] font-bold tracking-[-0.3px]">
          Khám phá
        </span>

        {/* Search input */}
        <div className="relative flex items-center">
          <Search
            className="absolute left-3 size-4 text-text-neo-tertiary pointer-events-none"
            strokeWidth={2}
          />
          <input
            type="search"
            placeholder="Tìm mã hoặc tên cổ phiếu…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              "w-full rounded-xl bg-ink-violet-surface border border-border-neo",
              "pl-9 pr-9 py-2.5 text-[14px] text-text-neo-primary placeholder:text-text-neo-tertiary",
              "focus:outline-none focus:border-lime-signal-400/60",
              "transition-colors",
            )}
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery("")}
              aria-label="Xóa tìm kiếm"
              className="absolute right-3 grid size-5 place-items-center rounded-full bg-ink-violet-raised text-text-neo-tertiary hover:text-text-neo-primary transition-colors"
            >
              <X className="size-3" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </header>

      {/* ── Results ────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 max-w-[640px] mx-auto space-y-4">

        {/* Watchlist quick-access — only shown when not searching */}
        {!query && hydrated && watchlist.length > 0 && (
          <section aria-label="Danh sách theo dõi">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary mb-2 flex items-center gap-1.5">
              <BookmarkCheck className="size-3" strokeWidth={2.5} />
              Đang theo dõi
            </h2>
            <div className="flex flex-wrap gap-2">
              {watchlist.map((ticker) => (
                <WatchlistChip
                  key={ticker}
                  ticker={ticker}
                  onRemove={() => removeFromWatchlist(ticker)}
                />
              ))}
            </div>
          </section>
        )}

        {isLoading ? (
          <SearchSkeleton />
        ) : results.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <section
            aria-label={section}
            className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden"
          >
            <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
              {section} ({results.length})
            </h2>
            <div className="divide-y divide-border-neo-subtle">
              {results.map((stock) => (
                <StockResultRow key={stock.code} stock={stock} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// StockResultRow
// ---------------------------------------------------------------------------
function StockResultRow({ stock }: { stock: StockResult }) {
  const hasPrice = stock.last_price != null;
  const isUp = (stock.pct_change ?? 0) >= 0;

  return (
    <Link
      href={`/stock/${stock.code}`}
      className="flex items-center justify-between px-4 py-3 hover:bg-ink-violet-raised transition-colors"
    >
      {/* Left: code + name */}
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

      {/* Right: price + pct */}
      {hasPrice && (
        <div className="text-right shrink-0 ml-4">
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
  );
}

// ---------------------------------------------------------------------------
// WatchlistChip — a removable ticker pill
// ---------------------------------------------------------------------------
function WatchlistChip({ ticker, onRemove }: { ticker: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1 pl-3 pr-1.5 py-1.5 rounded-full bg-ink-violet-surface border border-border-neo group">
      <Link
        href={`/stock/${ticker}`}
        className="font-display text-[13px] font-bold text-text-neo-primary hover:text-lime-signal-400 transition-colors"
      >
        {ticker}
      </Link>
      <button
        onClick={onRemove}
        aria-label={`Xóa ${ticker} khỏi danh sách theo dõi`}
        className="grid size-4 place-items-center rounded-full text-text-neo-tertiary hover:text-text-neo-primary hover:bg-ink-violet-raised transition-colors"
      >
        <X className="size-2.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty + skeleton states
// ---------------------------------------------------------------------------
function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-10 text-center">
      <p className="text-[14px] text-text-neo-secondary mb-1">
        {query.length > 0
          ? `Không tìm thấy kết quả cho "${query}"`
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

function SearchSkeleton() {
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

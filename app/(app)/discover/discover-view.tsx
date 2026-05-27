"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, BookmarkCheck, BookmarkPlus, Flame, Search, TrendingDown, TrendingUp, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { StockResult } from "@/app/api/stocks/search/route";
import type { PriceAlert } from "@/lib/use-price-alerts";
import { usePriceAlerts } from "@/lib/use-price-alerts";
import { formatVND, pctLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/use-watchlist";

function getBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

interface WatchlistQuote {
  price: number;
  pctChange: number | null;
}

// ---------------------------------------------------------------------------
// DiscoverView
// ---------------------------------------------------------------------------
type SortMode = "volume" | "gainers" | "losers";

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "volume", label: "Khối lượng" },
  { mode: "gainers", label: "Tăng mạnh" },
  { mode: "losers", label: "Giảm mạnh" },
];

const SORT_SECTION_LABELS: Record<SortMode, string> = {
  volume: "Khối lượng cao nhất",
  gainers: "Tăng mạnh nhất hôm nay",
  losers: "Giảm mạnh nhất hôm nay",
};

export function DiscoverView() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("volume");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [results, setResults] = useState<StockResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState("Khối lượng cao nhất");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { hydrated, watchlist, removeFromWatchlist } = useWatchlist();
  const { hydrated: alertsHydrated, alerts, removeAlert } = usePriceAlerts();
  const [watchlistQuotes, setWatchlistQuotes] = useState<Map<string, WatchlistQuote>>(new Map());
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);

  // Batch-fetch live prices for both watchlist and alert tickers in one query.
  // Derives triggered alerts from the result so we don't need a second fetch.
  useEffect(() => {
    if (!hydrated || !alertsHydrated) return;

    const allTickers = Array.from(
      new Set([...watchlist, ...alerts.map((a) => a.ticker)]),
    );

    if (allTickers.length === 0) {
      setWatchlistQuotes(new Map());
      setTriggeredAlerts([]);
      return;
    }

    const db = getBrowserClient();
    db
      .from("symbol_quotes_latest")
      .select("symbol_code, last_price, pct_change")
      .in("symbol_code", allTickers)
      .then(({ data }) => {
        // Build price map for watchlist chips
        const map = new Map<string, WatchlistQuote>();
        const priceMap = new Map<string, number>();
        for (const q of data ?? []) {
          if (q.last_price != null) {
            const price = Number(q.last_price);
            priceMap.set(q.symbol_code, price);
            if (watchlist.includes(q.symbol_code)) {
              map.set(q.symbol_code, {
                price,
                pctChange: q.pct_change != null ? Number(q.pct_change) : null,
              });
            }
          }
        }
        setWatchlistQuotes(map);

        // Derive which alerts are currently triggered
        const triggered = alerts.filter((a) => {
          const price = priceMap.get(a.ticker);
          if (price == null) return false;
          return a.condition === "above" ? price >= a.target : price <= a.target;
        });
        setTriggeredAlerts(triggered);
      });
  // Re-fetch when watchlist, alert ids, or hydration state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, alertsHydrated, watchlist.join(","), alerts.map((a) => a.id).join(",")]);

  // Fetch distinct sector names on mount (one-time, sectors rarely change)
  useEffect(() => {
    fetch("/api/stocks/sectors")
      .then((r) => r.json())
      .then((d: { sectors: string[] }) => setSectors(d.sectors))
      .catch(() => {/* Keep empty — sector chips just won't show */});
  }, []);

  // Fetch on mount, on query change, on sort change, or on sector change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const delay = query.length > 0 ? 300 : 0;

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        let url: string;
        if (query) {
          url = `/api/stocks/search?q=${encodeURIComponent(query)}`;
        } else {
          url = `/api/stocks/search?sort=${sort}`;
          if (selectedSector) {
            url += `&sector=${encodeURIComponent(selectedSector)}`;
          }
        }
        const res = await fetch(url);
        const data: { results: StockResult[]; query: string } = await res.json();
        setResults(data.results);
        setSection(
          data.query.length > 0
            ? `Kết quả cho "${data.query}"`
            : selectedSector
              ? `Ngành: ${selectedSector}`
              : SORT_SECTION_LABELS[sort],
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
  }, [query, sort, selectedSector]);

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

        {/* Sort filter chips — hidden while searching */}
        {!query && (
          <div className="flex gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => setSort(opt.mode)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors border",
                  sort === opt.mode
                    ? opt.mode === "gainers"
                      ? "bg-positive/10 border-positive/40 text-positive"
                      : opt.mode === "losers"
                        ? "bg-negative/10 border-negative/40 text-negative"
                        : "bg-lime-signal-400/10 border-lime-signal-400/40 text-lime-signal-400"
                    : "bg-ink-violet-surface border-border-neo text-text-neo-tertiary hover:text-text-neo-secondary",
                )}
              >
                {opt.mode === "gainers" && <TrendingUp className="size-3" strokeWidth={2.5} />}
                {opt.mode === "losers" && <TrendingDown className="size-3" strokeWidth={2.5} />}
                {opt.mode === "volume" && <Flame className="size-3" strokeWidth={2.5} />}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── Results ────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 max-w-[640px] mx-auto space-y-4">

        {/* Triggered alerts — shown when not searching and at least one alert is active */}
        {!query && alertsHydrated && triggeredAlerts.length > 0 && (
          <section aria-label="Thông báo giá đã kích hoạt">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.8px] text-lime-signal-400 mb-2 flex items-center gap-1.5">
              <Bell className="size-3" strokeWidth={2.5} />
              Thông báo giá đã kích hoạt ({triggeredAlerts.length})
            </h2>
            <div className="rounded-2xl bg-lime-signal-400/5 border border-lime-signal-400/25 overflow-hidden divide-y divide-lime-signal-400/10">
              {triggeredAlerts.map((alert) => (
                <TriggeredAlertRow
                  key={alert.id}
                  alert={alert}
                  onDismiss={() => removeAlert(alert.id)}
                />
              ))}
            </div>
          </section>
        )}

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
                  quote={watchlistQuotes.get(ticker) ?? null}
                  onRemove={() => removeFromWatchlist(ticker)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sector filter chips — shown only when not searching */}
        {!query && sectors.length > 0 && (
          <SectorFilterRow
            sectors={sectors}
            selected={selectedSector}
            onSelect={(s) => setSelectedSector(s === selectedSector ? null : s)}
          />
        )}

        {isLoading ? (
          <SearchSkeleton />
        ) : results.length === 0 ? (
          <EmptyState query={query} sector={selectedSector} />
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
  const { isWatched, toggleWatchlist } = useWatchlist();
  const watched = isWatched(stock.code);

  return (
    // Wrapper div so the bookmark button is a sibling of the Link, not a child
    <div className="flex items-center hover:bg-ink-violet-raised transition-colors">
      <Link
        href={`/stock/${stock.code}`}
        className="flex items-center flex-1 min-w-0 px-4 py-3 gap-4"
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

        {/* Middle: price + pct */}
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

      {/* Watchlist toggle — sibling of Link to avoid invalid nested-anchor HTML */}
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
function TriggeredAlertRow({
  alert,
  onDismiss,
}: {
  alert: PriceAlert;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Bell className="size-4 text-lime-signal-400 shrink-0" strokeWidth={2} />
      <Link
        href={`/stock/${alert.ticker}`}
        className="flex-1 min-w-0"
      >
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
function WatchlistChip({
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
function SectorFilterRow({
  sectors,
  selected,
  onSelect,
}: {
  sectors: string[];
  selected: string | null;
  onSelect: (sector: string) => void;
}) {
  return (
    <section aria-label="Lọc theo ngành">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
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
function EmptyState({ query, sector }: { query: string; sector: string | null }) {
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

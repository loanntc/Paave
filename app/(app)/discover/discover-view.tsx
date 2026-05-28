"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BookmarkCheck, Flame, Search, TrendingDown, TrendingUp, X } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/client";
import type { StockResult } from "@/app/api/stocks/search/route";
import type { PriceAlert } from "@/lib/use-price-alerts";
import { usePriceAlerts } from "@/lib/use-price-alerts";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/use-watchlist";
import {
  EmptyState,
  SearchSkeleton,
  SectorFilterRow,
  StockResultRow,
  TriggeredAlertRow,
  WatchlistChip,
  type WatchlistQuote,
} from "./discover-components";

// ---------------------------------------------------------------------------
// DiscoverView — stock search, watchlist, alerts, sector filter
// ---------------------------------------------------------------------------

type SortMode = "volume" | "gainers" | "losers";

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "volume", label: "Khối lượng" },
  { mode: "gainers", label: "Tăng mạnh" },
  { mode: "losers", label: "Giảm mạnh" },
];

const SORT_SECTION_LABELS: Record<SortMode, string> = {
  volume:  "Khối lượng cao nhất",
  gainers: "Tăng mạnh nhất hôm nay",
  losers:  "Giảm mạnh nhất hôm nay",
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

  // Fetch distinct sector names on mount (one-time — sectors rarely change)
  useEffect(() => {
    fetch("/api/stocks/sectors")
      .then((r) => r.json())
      .then((d: { sectors: string[] }) => setSectors(d.sectors))
      .catch(() => {/* Keep empty — sector chips just won't show */});
  }, []);

  // Fetch results on mount, query change, sort change, or sector change
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

      {/* Sticky header + search */}
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

      {/* Results */}
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

        {/* Watchlist quick-access — shown only when not searching */}
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
            onClear={() => setSelectedSector(null)}
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

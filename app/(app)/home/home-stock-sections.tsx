// TrendingRow and WatchlistSection — horizontal-scroll stock cards for the Home tab.
// Both consume StockResult[] as props. ChangePill is imported from home-market-section
// to avoid duplicating that shared display primitive.

import Link from "next/link";
import { Bookmark, Flame } from "lucide-react";
import type { StockResult } from "@/app/api/stocks/search/route";
import { formatVND } from "@/lib/format";
import { ChangePill } from "./home-market-section";

// ---------------------------------------------------------------------------
// TrendingRow — top gainers carousel
// ---------------------------------------------------------------------------
export function TrendingRow({
  stocks,
  isLoading,
}: {
  stocks: StockResult[];
  isLoading: boolean;
}) {
  return (
    <section aria-label="Trending" className="space-y-4">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-plasma" strokeWidth={2.5} />
          <h2 className="font-display text-[14px] uppercase tracking-drop text-lime-soft">
            Top tăng hôm nay
          </h2>
        </div>
        <Link
          href="/discover"
          className="font-display text-[11px] uppercase tracking-pulse text-plasma"
        >
          Khám phá →
        </Link>
      </header>

      {isLoading ? (
        <ul className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="min-w-[220px] shrink-0">
              <div className="rounded-3xl border border-edge bg-ink-800/60 p-5 space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-2.5 w-16 rounded bg-ink-700" />
                  <div className="h-2.5 w-8 rounded bg-ink-700" />
                </div>
                <div className="h-5 w-12 rounded bg-ink-700 mt-4" />
                <div className="h-3 w-28 rounded bg-ink-700" />
                <div className="flex justify-between mt-4">
                  <div className="h-5 w-20 rounded bg-ink-700" />
                  <div className="h-5 w-14 rounded-full bg-ink-700" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : stocks.length === 0 ? (
        <p className="text-[13px] text-fog px-1">Chưa có dữ liệu thị trường.</p>
      ) : (
        <ul className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6 snap-x snap-mandatory">
          {stocks.map((s) => (
            <li key={s.code} className="snap-start min-w-[220px] shrink-0">
              <Link
                href={`/stock/${s.code}`}
                className="block rounded-3xl border border-edge bg-ink-800/60 p-5 backdrop-blur transition-colors hover:border-plasma/40 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] uppercase tracking-pulse text-fog">
                    {s.sector ?? s.exchange ?? "VN"}
                  </span>
                  <span className="font-display text-[10px] uppercase tracking-pulse text-fog">
                    {s.exchange ?? "—"}
                  </span>
                </div>
                <p className="mt-4 font-display text-[18px] text-lime-soft">{s.code}</p>
                <p className="font-body text-[12px] text-fog truncate">
                  {s.short_name ?? s.name}
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <p className="font-display text-[18px] tabular-nums text-lime-soft">
                    {s.last_price != null ? formatVND(s.last_price) : "—"}
                  </p>
                  {s.pct_change != null && <ChangePill value={s.pct_change} />}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// WatchlistSection — user-saved tickers with live prices
// ---------------------------------------------------------------------------
export function WatchlistSection({
  stocks,
  isLoading,
}: {
  stocks: StockResult[];
  isLoading: boolean;
}) {
  return (
    <section aria-label="Danh sách theo dõi" className="space-y-4">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Bookmark className="size-4 text-plasma" strokeWidth={2.5} />
          <h2 className="font-display text-[14px] uppercase tracking-drop text-lime-soft">
            Theo dõi
          </h2>
        </div>
        <Link
          href="/discover"
          className="font-display text-[11px] uppercase tracking-pulse text-plasma"
        >
          Khám phá →
        </Link>
      </header>

      {isLoading ? (
        <ul className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6">
          {[1, 2, 3].map((i) => (
            <li key={i} className="min-w-[160px] shrink-0">
              <div className="rounded-2xl border border-edge bg-ink-800/60 p-4 space-y-2 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-2 w-8 rounded bg-ink-700" />
                  <div className="h-4 w-10 rounded-full bg-ink-700" />
                </div>
                <div className="h-5 w-12 rounded bg-ink-700 mt-1" />
                <div className="h-2 w-20 rounded bg-ink-700" />
                <div className="h-5 w-16 rounded bg-ink-700 mt-2" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6 snap-x snap-mandatory">
          {stocks.map((s) => (
            <li key={s.code} className="snap-start min-w-[160px] shrink-0">
              <Link
                href={`/stock/${s.code}`}
                className="block rounded-2xl border border-edge bg-ink-800/60 p-4 backdrop-blur transition-colors hover:border-plasma/40 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-[10px] uppercase tracking-pulse text-fog">
                    {s.exchange ?? "VN"}
                  </span>
                  {s.pct_change != null && <ChangePill value={s.pct_change} />}
                </div>
                <p className="font-display text-[18px] text-lime-soft">{s.code}</p>
                <p className="font-body text-[11px] text-fog truncate mt-0.5">
                  {s.short_name ?? s.name}
                </p>
                <p className="mt-3 font-display text-[16px] tabular-nums text-lime-soft">
                  {s.last_price != null ? formatVND(s.last_price) : "—"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

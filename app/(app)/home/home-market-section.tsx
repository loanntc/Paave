// Market snapshot section for the Home tab.
// MarketStatusPill uses a 60-second interval to keep the session label current.

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MarketIndex } from "@/app/api/market/indices/route";
import { getVNMarketStatus } from "@/lib/market-status";
import { cn } from "@/lib/utils";

/**
 * Format a numeric index value using Vietnamese number convention:
 * period thousand-separator, comma decimal.
 * e.g.  1284.56  →  "1.284,56"
 */
function formatIndexValue(value: number): string {
  const [integer, decimal] = value.toFixed(2).split(".");
  const thousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${thousands},${decimal}`;
}

/**
 * Shows the current VN market session phase with a countdown during
 * pre-open and lunch phases so users know exactly when trading resumes.
 * Re-evaluates every 60 seconds so the badge stays accurate across transitions.
 */
function MarketStatusPill() {
  const [marketStatus, setMarketStatus] = useState(() => getVNMarketStatus());

  useEffect(() => {
    const id = setInterval(() => setMarketStatus(getVNMarketStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { status, label, isTrading, minutesUntilNext } = marketStatus;

  const countdown = minutesUntilNext != null
    ? `${Math.floor(minutesUntilNext / 60)}:${String(minutesUntilNext % 60).padStart(2, "0")}`
    : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[10px] uppercase tracking-pulse",
        status === "open"
          ? "bg-positive/15 text-positive"
          : status === "pre_open"
            ? "bg-plasma/15 text-plasma"
            : status === "atc"
              ? "bg-lime/15 text-lime-soft"
              : "bg-ink-600/60 text-fog",
      )}
    >
      {isTrading && (
        <span aria-hidden className="size-1.5 rounded-full bg-positive animate-pulse shrink-0" />
      )}
      {label}
      {countdown && (
        <span className="tabular-nums opacity-80">· {countdown}</span>
      )}
    </span>
  );
}

// ChangePill is exported because TrendingRow and WatchlistSection also use it.
export function ChangePill({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-display text-[10px] tabular-nums",
        up ? "bg-positive/15 text-positive" : "bg-negative/15 text-negative",
      )}
    >
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

export function MarketSnapshot({
  indices,
  isLoading,
}: {
  indices: MarketIndex[];
  isLoading: boolean;
}) {
  return (
    <section aria-label="Thị trường Việt Nam" className="rounded-3xl bg-ink-800 p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-[14px] uppercase tracking-drop text-lime-soft">
            Thị trường VN
          </h2>
          <MarketStatusPill />
        </div>
        <Link
          href="/discover"
          className="font-display text-[11px] uppercase tracking-pulse text-plasma"
        >
          Tất cả →
        </Link>
      </header>

      {isLoading ? (
        <ul className="mt-4 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <li key={i} className="rounded-2xl bg-ink-600/60 px-4 py-4 animate-pulse space-y-2">
              <div className="flex justify-between">
                <div className="h-2.5 w-12 rounded bg-ink-500" />
                <div className="h-2.5 w-10 rounded-full bg-ink-500" />
              </div>
              <div className="h-2.5 w-16 rounded bg-ink-500 mt-2" />
              <div className="h-5 w-20 rounded bg-ink-500 mt-1" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 grid grid-cols-3 gap-3">
          {indices.map((idx) => (
            <li key={idx.exchange} className="rounded-2xl bg-ink-600/60 px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] uppercase tracking-pulse text-fog">
                  {idx.exchange}
                </span>
                {idx.change_pct != null && <ChangePill value={idx.change_pct} />}
              </div>
              <p className="mt-2 font-body text-[12px] text-fog">{idx.name}</p>
              <p className="mt-1 font-display text-[18px] tabular-nums text-lime-soft">
                {idx.close != null ? formatIndexValue(idx.close) : "—"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

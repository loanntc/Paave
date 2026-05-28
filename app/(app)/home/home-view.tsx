"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  Bookmark,
  BookOpen,
  Compass,
  Flame,
  MessageSquare,
  TrendingDown,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/client";
import type { MarketIndex } from "@/app/api/market/indices/route";
import type { StockResult } from "@/app/api/stocks/search/route";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { useChatSheet } from "@/lib/ai/chat-context";
import { useLearningProgress } from "@/lib/learning/use-learning-progress";
import { usePriceAlerts } from "@/lib/use-price-alerts";
import { useWatchlist } from "@/lib/use-watchlist";
import { MODULES } from "@/lib/learning/content";
import { getVNMarketStatus } from "@/lib/market-status";
import { formatVND, pctLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Portfolio summary type (live data for the hero card)
// ---------------------------------------------------------------------------
interface PortfolioSummary {
  totalEquity: number;
  totalPL: number;
  totalPLPct: number;
  cashBalance: number;
  holdingsValue: number;
  positionCount: number;
}

// ---------------------------------------------------------------------------
// HomeView
// ---------------------------------------------------------------------------
export function HomeView() {
  const [displayName, setDisplayName] = useState<string>("bạn");
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [trending, setTrending] = useState<StockResult[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const { hydrated: alertsHydrated, alerts } = usePriceAlerts();

  // Watchlist — hydrated from localStorage; prices fetched once known
  const { hydrated: watchlistHydrated, watchlist } = useWatchlist();
  const [watchlistStocks, setWatchlistStocks] = useState<StockResult[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    const db = getBrowserClient();

    async function fetchHomeData() {
      const {
        data: { session },
      } = await db.auth.getSession();

      if (!session?.user) {
        setPortfolioLoading(false);
        return;
      }

      const uid = session.user.id;

      // Derive a friendly display name from user metadata or email
      const meta = session.user.user_metadata ?? {};
      const name: string =
        (meta.full_name as string | undefined)?.split(" ").at(-1) ??
        (meta.name as string | undefined)?.split(" ").at(-1) ??
        session.user.email?.split("@")[0] ??
        "bạn";
      setDisplayName(name);

      // Two-step fetch: sub-account → holdings
      const { data: acct } = await db
        .from("virtual_sub_accounts")
        .select("id, cash_balance, starting_balance")
        .eq("user_id", uid)
        .eq("status", "ACTIVE")
        .limit(1)
        .single();

      if (!acct) {
        setPortfolioLoading(false);
        return;
      }

      const { data: holdings } = await db
        .from("virtual_holdings")
        .select("symbol_code, quantity, avg_cost")
        .eq("sub_account_id", acct.id)
        .gt("quantity", 0);

      // Batch-fetch live prices for all holdings to show mark-to-market equity
      const codes = (holdings ?? []).map((h) => h.symbol_code).filter(Boolean);
      let priceMap = new Map<string, number>();
      if (codes.length > 0) {
        const { data: quotes } = await db
          .from("symbol_quotes_latest")
          .select("symbol_code, last_price")
          .in("symbol_code", codes);
        for (const q of quotes ?? []) {
          if (q.last_price != null) priceMap.set(q.symbol_code, Number(q.last_price));
        }
      }

      const holdingsValue = (holdings ?? []).reduce(
        (s, h) =>
          s + (priceMap.get(h.symbol_code) ?? Number(h.avg_cost)) * Number(h.quantity),
        0,
      );
      const cashBalance = Number(acct.cash_balance);
      const startingBalance = Number(acct.starting_balance);
      const totalEquity = cashBalance + holdingsValue;
      const totalPL = totalEquity - startingBalance;
      const totalPLPct = (totalPL / startingBalance) * 100;

      setPortfolio({
        totalEquity,
        totalPL,
        totalPLPct,
        cashBalance,
        holdingsValue,
        positionCount: (holdings ?? []).length,
      });
      setPortfolioLoading(false);
    }

    fetchHomeData();
  }, []);

  // Fetch VN market indices (HOSE/HNX/UPCOM) — public data, no auth required
  useEffect(() => {
    async function fetchIndices() {
      try {
        const res = await fetch("/api/market/indices");
        const data: { indices: MarketIndex[] } = await res.json();
        if (data.indices.length > 0) setIndices(data.indices);
      } catch {
        // Keep empty — MarketSnapshot falls back to skeleton
      } finally {
        setIndicesLoading(false);
      }
    }
    fetchIndices();
  }, []);

  // Fetch top gainers independently (public data, no auth required)
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/stocks/search?sort=gainers&limit=8");
        const data: { results: StockResult[] } = await res.json();
        setTrending(data.results);
      } catch {
        // Keep empty — TrendingRow will show static fallback
      } finally {
        setTrendingLoading(false);
      }
    }
    fetchTrending();
  }, []);

  // Fetch live prices for watchlisted tickers once localStorage has hydrated
  useEffect(() => {
    if (!watchlistHydrated || watchlist.length === 0) {
      setWatchlistStocks([]);
      return;
    }

    setWatchlistLoading(true);
    const db = getBrowserClient();

    async function fetchWatchlistPrices() {
      const [quotesRes, symbolsRes] = await Promise.all([
        db
          .from("symbol_quotes_latest")
          .select("symbol_code, last_price, pct_change, total_volume")
          .in("symbol_code", watchlist),
        db
          .from("symbols")
          .select("code, short_name, name, exchange, sector")
          .in("code", watchlist),
      ]);

      const symbolMap = new Map<string, { short_name: string | null; name: string; exchange: string | null; sector: string | null }>();
      for (const s of symbolsRes.data ?? []) {
        symbolMap.set(s.code, { short_name: s.short_name, name: s.name, exchange: s.exchange, sector: s.sector });
      }

      const quoteMap = new Map<string, { last_price: number | null; pct_change: number | null; total_volume: number | null }>();
      for (const q of quotesRes.data ?? []) {
        quoteMap.set(q.symbol_code, {
          last_price: q.last_price != null ? Number(q.last_price) : null,
          pct_change: q.pct_change != null ? Number(q.pct_change) : null,
          total_volume: q.total_volume != null ? Number(q.total_volume) : null,
        });
      }

      // Preserve watchlist order (newest-saved first)
      const ordered = watchlist.flatMap((code) => {
        const sym = symbolMap.get(code);
        const quote = quoteMap.get(code);
        if (!sym && !quote) return [];
        return [{
          code,
          name: sym?.name ?? code,
          short_name: sym?.short_name ?? null,
          exchange: sym?.exchange ?? null,
          sector: sym?.sector ?? null,
          last_price: quote?.last_price ?? null,
          pct_change: quote?.pct_change ?? null,
          total_volume: quote?.total_volume ?? null,
        } satisfies StockResult];
      });

      setWatchlistStocks(ordered);
      setWatchlistLoading(false);
    }

    fetchWatchlistPrices();
  // watchlist array ref only changes when items are added/removed (useWatchlist uses useState)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlistHydrated, watchlist]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900 pb-28">
      <AmbientBackground />

      <HomeHeader
        name={displayName}
        alertCount={alertsHydrated ? alerts.length : 0}
      />

      <section className="relative z-10 mx-auto flex w-full max-w-[896px] flex-col gap-5 px-6">
        <PortfolioHero
          name={displayName}
          data={portfolio}
          isLoading={portfolioLoading}
        />
        <QuickActions />
        <MarketSnapshot indices={indices} isLoading={indicesLoading} />
        {watchlistHydrated && watchlist.length > 0 && (
          <WatchlistSection stocks={watchlistStocks} isLoading={watchlistLoading} />
        )}
        <TrendingRow stocks={trending} isLoading={trendingLoading} />
        <LearningProgressCard />
      </section>

    </main>
  );
}

function HomeHeader({ name, alertCount }: { name: string; alertCount: number }) {
  const router = useRouter();
  return (
    <header className="relative z-20 flex w-full items-center justify-between px-6 pt-4 pb-6">
      <div className="flex items-center gap-3">
        <PaaveWordmark size="sm" />
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label={alertCount > 0 ? `${alertCount} thông báo giá đang bật` : "Thông báo"}
          onClick={() => router.push("/discover")}
          className="relative grid size-10 place-items-center rounded-full border border-edge bg-ink-800/60 text-lime-soft backdrop-blur transition-colors hover:bg-ink-700"
        >
          <Bell className="size-4" strokeWidth={2} />
          {alertCount > 0 && (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-plasma text-[9px] font-bold text-plasma-ink">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </button>
        <div
          aria-label={`Greeting for ${name}`}
          className="grid size-10 place-items-center rounded-full bg-plasma font-display text-[14px] uppercase text-plasma-ink"
        >
          {name.charAt(0)}
        </div>
      </div>
    </header>
  );
}

function PortfolioHero({
  name,
  data,
  isLoading,
}: {
  name: string;
  data: PortfolioSummary | null;
  isLoading: boolean;
}) {
  const isUp = data ? data.totalPL >= 0 : true;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[32px] bg-ink-800 px-7 pb-7 pt-8 space-y-3 animate-pulse">
        <div className="h-3 w-40 rounded bg-ink-700" />
        <div className="h-12 w-56 rounded-xl bg-ink-700" />
        <div className="h-7 w-44 rounded-full bg-ink-700" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-ink-600/60 p-3 space-y-1.5">
              <div className="h-2.5 w-12 rounded bg-ink-700" />
              <div className="h-4 w-16 rounded bg-ink-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/portfolio"
      aria-label="Xem danh mục đầu tư"
      className="group relative block overflow-hidden rounded-[32px] bg-ink-800 px-7 pb-7 pt-8 transition-opacity hover:opacity-90 active:scale-[0.99]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-lime/10 blur-3xl"
      />

      <p className="font-display text-[12px] uppercase tracking-pulse text-fog">
        Danh mục của {name}
      </p>

      {data ? (
        <>
          <p className="mt-2 font-display text-[40px] font-bold leading-[1.05] tracking-display tabular-nums text-lime-soft">
            {formatVND(data.totalEquity)}
          </p>

          <div
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1",
              isUp ? "bg-positive/15" : "bg-negative/15",
            )}
          >
            {isUp ? (
              <ArrowUpRight
                className="size-3.5 text-positive"
                strokeWidth={2.5}
                aria-hidden
              />
            ) : (
              <TrendingDown
                className="size-3.5 text-negative"
                strokeWidth={2.5}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "font-display text-[13px] tabular-nums",
                isUp ? "text-positive" : "text-negative",
              )}
            >
              {isUp ? "+" : ""}
              {formatVND(data.totalPL)} · {pctLabel(data.totalPLPct)}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            <MiniStat label="Đầu tư" value={formatVND(data.holdingsValue)} />
            <MiniStat
              label="Lãi/lỗ"
              value={`${isUp ? "+" : ""}${formatVND(data.totalPL)}`}
              tone={isUp ? "positive" : "negative"}
            />
            <MiniStat label="Vị thế" value={String(data.positionCount)} />
          </dl>
        </>
      ) : (
        <p className="mt-4 font-display text-[15px] text-fog">
          Đăng nhập để xem danh mục.
        </p>
      )}
    </Link>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const toneCls =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : "text-lime-soft";
  return (
    <div className="rounded-2xl bg-ink-600/60 px-4 py-3">
      <dt className="font-display text-[11px] uppercase tracking-pulse text-fog">
        {label}
      </dt>
      <dd className={cn("mt-1 font-display text-[16px] tabular-nums", toneCls)}>
        {value}
      </dd>
    </div>
  );
}

function QuickActions() {
  const { open: openChat } = useChatSheet();
  const router = useRouter();

  const actions = [
    { label: "Khám phá", icon: Compass, tone: "lime" as const, onClick: () => router.push("/discover") },
    { label: "Học tập", icon: BookOpen, tone: "lime" as const, onClick: () => router.push("/grow") },
    { label: "Hỏi AI", icon: MessageSquare, tone: "plasma" as const, onClick: () => openChat({ language: "vi" }) },
    { label: "Danh mục", icon: Wallet, tone: "plasma" as const, onClick: () => router.push("/portfolio") },
  ];

  return (
    <section aria-label="Quick actions" className="grid grid-cols-4 gap-3">
      {actions.map(({ label, icon: Icon, tone, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-edge bg-ink-800/60 px-3 py-4 backdrop-blur transition-all hover:bg-ink-700 active:scale-[0.98]"
        >
          <span
            className={cn(
              "grid size-10 place-items-center rounded-xl",
              tone === "lime"
                ? "bg-lime-drop text-lime-ink"
                : "bg-plasma-drop text-white",
            )}
          >
            <Icon className="size-4" strokeWidth={2.25} />
          </span>
          <span className="font-display text-[11px] uppercase tracking-pulse text-lime-soft">
            {label}
          </span>
        </button>
      ))}
    </section>
  );
}


/**
 * Format a numeric index value (index points, not VND currency) using
 * Vietnamese number convention: period thousand-separator, comma decimal.
 * e.g.  1284.56  →  "1.284,56"
 *       228.45   →  "228,45"
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

  // Format minutes as "X:YY" (e.g. 8 → "0:08", 90 → "1:30")
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
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-positive animate-pulse shrink-0"
        />
      )}
      {label}
      {countdown && (
        <span className="tabular-nums opacity-80">· {countdown}</span>
      )}
    </span>
  );
}

function MarketSnapshot({
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
            <li
              key={idx.exchange}
              className="rounded-2xl bg-ink-600/60 px-4 py-4"
            >
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

function ChangePill({ value }: { value: number }) {
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

function TrendingRow({
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
        // Loading skeleton — 4 cards
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
        <p className="text-[13px] text-fog px-1">
          Chưa có dữ liệu thị trường.
        </p>
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
                <p className="mt-4 font-display text-[18px] text-lime-soft">
                  {s.code}
                </p>
                <p className="font-body text-[12px] text-fog truncate">
                  {s.short_name ?? s.name}
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <p className="font-display text-[18px] tabular-nums text-lime-soft">
                    {s.last_price != null ? formatVND(s.last_price) : "—"}
                  </p>
                  {s.pct_change != null && (
                    <ChangePill value={s.pct_change} />
                  )}
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
// WatchlistSection — stocks the user is tracking, with live prices
// ---------------------------------------------------------------------------
function WatchlistSection({
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

// ---------------------------------------------------------------------------
// LearningProgressCard — connects Home tab to the F0 Learning Path (Grow tab)
// Shows contextual messaging based on the user's learning progress state.
// ---------------------------------------------------------------------------
function LearningProgressCard() {
  const { hydrated, progress, getModuleStatus } = useLearningProgress();

  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = Object.values(progress.lessons).filter((l) => l.completed).length;
  const pct = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const allDone = completedLessons === totalLessons && totalLessons > 0;

  // Find the first incomplete lesson across all unlocked modules
  let resumeHref = "/grow";
  for (const module of MODULES) {
    const status = getModuleStatus(module.id);
    if (status === "IN_PROGRESS" || status === "UNLOCKED") {
      const next = module.lessons.find((l) => !progress.lessons[l.id]?.completed);
      if (next) {
        resumeHref = `/grow/lesson/${next.id}`;
        break;
      }
    }
  }

  const hasStarted = completedLessons > 0 || Object.keys(progress.lessons).length > 0;

  if (!hydrated) {
    return (
      <section
        aria-label="Tiến độ học tập"
        className="rounded-3xl border border-edge bg-ink-800 p-6 animate-pulse"
      >
        <div className="h-3 w-24 rounded bg-ink-700" />
        <div className="mt-2 h-5 w-48 rounded bg-ink-700" />
        <div className="mt-4 h-2 w-full rounded-full bg-ink-700" />
        <div className="mt-4 h-9 w-36 rounded-xl bg-ink-700" />
      </section>
    );
  }

  return (
    <Link
      href={hasStarted ? resumeHref : "/grow"}
      aria-label="Đến trang học tập"
      className="group relative block overflow-hidden rounded-3xl border border-edge bg-gradient-to-br from-ink-800 to-ink-900 p-6 transition-opacity hover:opacity-90 active:scale-[0.99]"
    >
      {/* Glow blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-lime/10 blur-3xl"
      />

      <div className="relative flex items-start gap-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-lime-drop text-lime-ink shrink-0">
          {allDone ? (
            <Trophy className="size-5" strokeWidth={2} />
          ) : (
            <BookOpen className="size-5" strokeWidth={2} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display text-[11px] uppercase tracking-pulse text-plasma">
            {allDone
              ? "Hoàn thành · F0 Master"
              : hasStarted
                ? `Tiến độ · ${completedLessons}/${totalLessons} bài học`
                : "Lộ trình F0 · Bắt đầu ngay"}
          </p>

          <h3 className="mt-1 font-display text-[18px] uppercase tracking-[-0.45px] text-lime-soft leading-tight">
            {allDone
              ? "Bạn đã chinh phục toàn bộ!"
              : hasStarted
                ? "Tiếp tục học tập"
                : "Hiểu chứng khoán từ đầu"}
          </h3>

          <p className="mt-2 font-body text-[13px] leading-[1.55] text-fog">
            {allDone
              ? `${progress.totalLearningXP} XP kiếm được · Giao dịch giả lập đang chờ bạn.`
              : hasStarted
                ? `${progress.totalLearningXP} XP · ${100 - pct}% còn lại để hoàn thành lộ trình F0.`
                : "4 module · 20 bài học · Không cần kinh nghiệm. Học trong ~60 phút."}
          </p>

          {/* Progress bar */}
          {hasStarted && !allDone && (
            <div className="mt-4 space-y-1.5">
              <div className="h-1.5 rounded-full bg-ink-600 overflow-hidden">
                <div
                  className="h-full rounded-full bg-lime transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-fog">
                <Zap className="size-3 text-lime shrink-0" />
                <span>{progress.totalLearningXP} XP kiếm được</span>
              </div>
            </div>
          )}

          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime-drop px-5 py-2 font-display text-[12px] uppercase tracking-drop text-lime-ink shadow-glow-lime">
            {allDone ? "Ôn tập" : hasStarted ? "Tiếp tục" : "Bắt đầu học"}
            <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </Link>
  );
}

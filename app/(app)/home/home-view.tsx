"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  Compass,
  Flame,
  LineChart,
  MessageSquare,
  TrendingDown,
  Trophy,
  Wallet,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { StockResult } from "@/app/api/stocks/search/route";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { useChatSheet } from "@/lib/ai/chat-context";
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
  const [trending, setTrending] = useState<StockResult[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

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
        .select("quantity, avg_cost")
        .eq("sub_account_id", acct.id)
        .gt("quantity", 0);

      const holdingsValue = (holdings ?? []).reduce(
        (s, h) => s + Number(h.avg_cost) * Number(h.quantity),
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900 pb-28">
      <AmbientBackground />

      <HomeHeader name={displayName} />

      <section className="relative z-10 mx-auto flex w-full max-w-[896px] flex-col gap-5 px-6">
        <PortfolioHero
          name={displayName}
          data={portfolio}
          isLoading={portfolioLoading}
        />
        <QuickActions />
        <MarketSnapshot />
        <TrendingRow stocks={trending} isLoading={trendingLoading} />
        <WeeklyChallenge />
      </section>

    </main>
  );
}

function HomeHeader({ name }: { name: string; }) {
  return (
    <header className="relative z-20 flex w-full items-center justify-between px-6 pt-4 pb-6">
      <div className="flex items-center gap-3">
        <PaaveWordmark size="sm" />
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-full border border-edge bg-ink-800/60 text-lime-soft backdrop-blur transition-colors hover:bg-ink-700"
        >
          <Bell className="size-4" strokeWidth={2} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-plasma" />
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

  const actions = [
    { label: "Discover", icon: Compass, tone: "lime" as const, onClick: undefined as (() => void) | undefined },
    { label: "Markets", icon: LineChart, tone: "plasma" as const, onClick: undefined },
    { label: "Ask AI", icon: MessageSquare, tone: "lime" as const, onClick: () => openChat({ language: "vi" }) },
    { label: "Wallet", icon: Wallet, tone: "plasma" as const, onClick: undefined },
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


function MarketSnapshot() {
  const markets: Array<{
    code: "VN" | "KR" | "US";
    name: string;
    value: string;
    changePct: number;
  }> = [
    { code: "VN", name: "VN-INDEX", value: "1.284,56", changePct: 0.62 },
    { code: "KR", name: "KOSPI", value: "2,712.14", changePct: -0.34 },
    { code: "US", name: "S&P 500", value: "5,248.49", changePct: 0.18 },
  ];
  return (
    <section aria-label="Market snapshot" className="rounded-3xl bg-ink-800 p-6">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-[14px] uppercase tracking-drop text-lime-soft">
          Market Pulse
        </h2>
        <Link
          href="/discover"
          className="font-display text-[11px] uppercase tracking-pulse text-plasma"
        >
          Tất cả →
        </Link>
      </header>
      <ul className="mt-4 grid grid-cols-3 gap-3">
        {markets.map((m) => (
          <li
            key={m.code}
            className="rounded-2xl bg-ink-600/60 px-4 py-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[11px] uppercase tracking-pulse text-fog">
                {m.code}
              </span>
              <ChangePill value={m.changePct} />
            </div>
            <p className="mt-2 font-body text-[12px] text-fog">{m.name}</p>
            <p className="mt-1 font-display text-[18px] tabular-nums text-lime-soft">
              {m.value}
            </p>
          </li>
        ))}
      </ul>
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

function WeeklyChallenge() {
  return (
    <section
      aria-label="Weekly challenge"
      className="relative overflow-hidden rounded-3xl border border-edge bg-gradient-to-br from-ink-800 to-ink-900 p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-plasma/20 blur-3xl"
      />
      <div className="relative flex items-start gap-4">
        <div className="grid size-12 place-items-center rounded-2xl bg-plasma-drop text-white">
          <Trophy className="size-5" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="font-display text-[11px] uppercase tracking-pulse text-plasma">
            Weekly Challenge · 3 days left
          </p>
          <h3 className="mt-1 font-display text-[18px] uppercase tracking-[-0.45px] text-lime-soft">
            Build a 3-stock VN portfolio
          </h3>
          <p className="mt-2 font-body text-[13px] leading-[1.55] text-fog">
            Allocate ₫10.000.000 across three Vietnam tickers. Share it with
            your crew — the top return takes the drop.
          </p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime-drop px-5 py-2 font-display text-[12px] uppercase tracking-drop text-lime-ink shadow-glow-lime">
            Accept Challenge
            <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

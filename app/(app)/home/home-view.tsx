"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  Compass,
  Flame,
  LineChart,
  MessageSquare,
  Trophy,
  Wallet,
} from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveWordmark } from "@/components/brand/paave-wordmark";
import { useChatSheet } from "@/lib/ai/chat-context";
import { cn } from "@/lib/utils";

export function HomeView() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900 pb-28">
      <AmbientBackground />

      <HomeHeader name="Alex" />

      <section className="relative z-10 mx-auto flex w-full max-w-[896px] flex-col gap-5 px-6">
        <PortfolioHero />
        <QuickActions />
        <MarketSnapshot />
        <TrendingRow />
        <WeeklyChallenge />
      </section>

    </main>
  );
}

function HomeHeader({ name }: { name: string }) {
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

function PortfolioHero() {
  return (
    <section
      aria-label="Portfolio"
      className="relative overflow-hidden rounded-[32px] bg-ink-800 px-7 pb-7 pt-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-lime/10 blur-3xl"
      />
      <p className="font-display text-[12px] uppercase tracking-pulse text-fog">
        Yo, Alex — your pulse
      </p>
      <p className="mt-2 font-display text-[44px] font-bold leading-[1.05] tracking-display tabular-nums text-lime-soft">
        $12,480.<span className="text-lime-soft/70">52</span>
      </p>

      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-positive/15 px-3 py-1">
        <ArrowUpRight
          className="size-3.5 text-positive"
          strokeWidth={2.5}
          aria-hidden
        />
        <span className="font-display text-[13px] tabular-nums text-positive">
          +$312.40 · +2.56% today
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        <MiniStat label="Invested" value="$10,000" />
        <MiniStat label="P&L" value="+$2,480" tone="positive" />
        <MiniStat label="Positions" value="7" />
      </dl>
    </section>
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

type Ticker = {
  symbol: string;
  name: string;
  market: "VN" | "KR" | "US";
  price: string;
  changePct: number;
  tag: string;
};

const trending: Ticker[] = [
  {
    symbol: "VIC",
    name: "Vingroup",
    market: "VN",
    price: "₫45.200",
    changePct: 3.24,
    tag: "Hometown Hero",
  },
  {
    symbol: "005930",
    name: "Samsung Electronics",
    market: "KR",
    price: "₩73,400",
    changePct: 1.12,
    tag: "Chipwave",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA",
    market: "US",
    price: "$962.14",
    changePct: -0.82,
    tag: "AI Beast",
  },
  {
    symbol: "VNM",
    name: "Vinamilk",
    market: "VN",
    price: "₫66.900",
    changePct: 0.45,
    tag: "Steady Mode",
  },
];

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
          href="#"
          className="font-display text-[11px] uppercase tracking-pulse text-plasma"
        >
          All markets →
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

function TrendingRow() {
  return (
    <section aria-label="Trending" className="space-y-4">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-plasma" strokeWidth={2.5} />
          <h2 className="font-display text-[14px] uppercase tracking-drop text-lime-soft">
            Trending with your crew
          </h2>
        </div>
        <Link
          href="#"
          className="font-display text-[11px] uppercase tracking-pulse text-plasma"
        >
          Discover →
        </Link>
      </header>
      <ul className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6 snap-x snap-mandatory">
        {trending.map((t) => (
          <li key={t.symbol} className="snap-start min-w-[220px]">
            <Link
              href={`/stock/${t.symbol}`}
              className="block rounded-3xl border border-edge bg-ink-800/60 p-5 backdrop-blur transition-colors hover:border-plasma/40 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] uppercase tracking-pulse text-plasma">
                  {t.tag}
                </span>
                <span className="font-display text-[10px] uppercase tracking-pulse text-fog">
                  {t.market}
                </span>
              </div>
              <p className="mt-4 font-display text-[18px] text-lime-soft">
                {t.symbol}
              </p>
              <p className="font-body text-[12px] text-fog truncate">{t.name}</p>
              <div className="mt-4 flex items-end justify-between">
                <p className="font-display text-[18px] tabular-nums text-lime-soft">
                  {t.price}
                </p>
                <ChangePill value={t.changePct} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
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

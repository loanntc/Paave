"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BookmarkPlus, TrendingDown, TrendingUp } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { StockAICard } from "@/components/paave/stock-ai-card";
import { PaperTradeSheet } from "@/components/paave/paper-trade-sheet";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Supabase browser client — anon key, session from cookie
// ---------------------------------------------------------------------------
function getBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface QuoteData {
  symbol_code: string;
  last_price: number | null;
  ref_price: number | null;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  pct_change: number | null;
  total_volume: number | null;
  session: string | null;
  ceiling_price: number | null;
  floor_price: number | null;
}

interface SymbolData {
  code: string;
  name: string;
  short_name: string | null;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
}

interface HoldingData {
  quantity: number;
  avg_cost: number;
  realized_pl: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatVolume(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------
interface StockDetailViewProps {
  ticker: string;
}

export function StockDetailView({ ticker }: StockDetailViewProps) {
  const router = useRouter();
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [symbol, setSymbol] = useState<SymbolData | null>(null);
  const [holding, setHolding] = useState<HoldingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tradeSheetOpen, setTradeSheetOpen] = useState(false);

  useEffect(() => {
    const db = getBrowserClient();

    async function fetchData() {
      // Auth + market data in parallel
      const [quoteRes, symbolRes, sessionRes] = await Promise.all([
        db
          .from("symbol_quotes_latest")
          .select(
            "symbol_code, last_price, ref_price, open_price, high_price, low_price, pct_change, total_volume, session, ceiling_price, floor_price",
          )
          .eq("symbol_code", ticker)
          .single(),
        db
          .from("symbols")
          .select("code, name, short_name, exchange, sector, industry")
          .eq("code", ticker)
          .single(),
        db.auth.getSession(),
      ]);

      setQuote(quoteRes.data ?? null);
      setSymbol(symbolRes.data ?? null);

      // Fetch user's position for this ticker if logged in
      const uid = sessionRes.data.session?.user?.id;
      if (uid) {
        const { data: acct } = await db
          .from("virtual_sub_accounts")
          .select("id")
          .eq("user_id", uid)
          .eq("status", "ACTIVE")
          .limit(1)
          .single();

        if (acct) {
          const { data: h } = await db
            .from("virtual_holdings")
            .select("quantity, avg_cost, realized_pl")
            .eq("sub_account_id", acct.id)
            .eq("symbol_code", ticker)
            .gt("quantity", 0)
            .single();

          if (h) {
            setHolding({
              quantity: Number(h.quantity),
              avg_cost: Number(h.avg_cost),
              realized_pl: Number(h.realized_pl),
            });
          }
        }
      }

      setIsLoading(false);
    }

    fetchData();
  }, [ticker]);

  const change = quote?.last_price != null && quote?.ref_price != null
    ? quote.last_price - quote.ref_price
    : null;
  const isUp = (change ?? 0) >= 0;
  const pctChange = quote?.pct_change ?? null;

  return (
    <main className="min-h-screen bg-ink-violet-base text-text-neo-primary pb-24">

      {/* ── Top navigation ───────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-ink-violet-base/90 backdrop-blur border-b border-border-neo-subtle">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="grid size-9 place-items-center rounded-full border border-border-neo bg-ink-violet-surface text-text-neo-secondary hover:text-text-neo-primary transition-colors"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-[18px] font-bold text-text-neo-primary tracking-[-0.3px]">
              {ticker}
            </span>
            {symbol?.exchange && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.5px] bg-violet-deep-800/60 text-violet-deep-200">
                {symbol.exchange}
              </span>
            )}
          </div>
          {symbol?.name && (
            <p className="text-[12px] text-text-neo-secondary truncate leading-snug">
              {symbol.name}
            </p>
          )}
        </div>
        {/* Session badge */}
        {quote?.session && (
          <span
            className={cn(
              "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.5px]",
              quote.session === "CONT"
                ? "bg-lime-signal-400/15 text-lime-signal-400"
                : "bg-violet-deep-800/60 text-text-neo-tertiary",
            )}
          >
            {quote.session === "CONT" ? "Live" : quote.session}
          </span>
        )}
      </header>

      <div className="px-4 pt-5 space-y-4 max-w-[640px] mx-auto">

        {/* ── Price hero ───────────────────────────────────────── */}
        {isLoading ? (
          <PriceHeroSkeleton />
        ) : (
          <section aria-label="Price">
            <div className="font-display text-[42px] font-bold tabular-nums tracking-[-1px] leading-none">
              {formatVND(quote?.last_price ?? null)}
            </div>
            <div className={cn(
              "flex items-center gap-2 mt-2 text-[14px] font-display tabular-nums",
              isUp ? "text-positive" : "text-negative",
            )}>
              <span>{isUp ? "▲" : "▼"}</span>
              <span>
                {change !== null ? formatVND(Math.abs(change)) : "—"}
              </span>
              <span>
                {pctChange !== null
                  ? `(${isUp ? "+" : ""}${pctChange.toFixed(2)}%)`
                  : ""}
              </span>
              <span className="text-text-neo-tertiary text-[12px]">hôm nay</span>
            </div>
          </section>
        )}

        {/* ── Open position (shown only when user holds this stock) ── */}
        {holding && (
          <PositionCard
            holding={holding}
            lastPrice={quote?.last_price ?? null}
          />
        )}

        {/* ── Action buttons (FR-23 section 4) ─────────────────── */}
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Actions">
          <ActionButton icon={<BookmarkPlus className="size-4" strokeWidth={2} />} label="Watchlist" />
          <ActionButton icon={<Bell className="size-4" strokeWidth={2} />} label="Alert" />
          <ActionButton
            icon={<TrendingUp className="size-4" strokeWidth={2} />}
            label="Paper Trade"
            primary
            onClick={() => setTradeSheetOpen(true)}
          />
        </div>

        {/* ── Key stats (FR-25) ─────────────────────────────────── */}
        {isLoading ? (
          <KeyStatsSkeleton />
        ) : quote ? (
          <KeyStats quote={quote} />
        ) : null}

        {/* ── AI Analysis card (FR-AI-01, FR-AI-02) ────────────── */}
        <StockAICard ticker={ticker} language="vi" />

      </div>

      {/* ── Paper trade sheet (FR-23) ───────────────────────────── */}
      <PaperTradeSheet
        isOpen={tradeSheetOpen}
        onClose={() => setTradeSheetOpen(false)}
        ticker={ticker}
        currentPrice={quote?.last_price ?? null}
        stockName={symbol?.name ?? null}
      />
    </main>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ActionButton({
  icon,
  label,
  primary = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2 text-[11px] font-bold uppercase tracking-[0.5px] transition-all active:scale-[0.97]",
        primary
          ? "bg-lime-signal-400 text-ink-violet-base"
          : "bg-ink-violet-surface border border-border-neo text-text-neo-secondary hover:text-text-neo-primary",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Position card
// ---------------------------------------------------------------------------
function PositionCard({
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
              <p
                className={cn(
                  "text-[11px] tabular-nums",
                  isUp ? "text-positive" : "text-negative",
                )}
              >
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

function KeyStats({ quote }: { quote: QuoteData }) {
  const stats = [
    { label: "Giá mở cửa", value: formatVND(quote.open_price) },
    { label: "Cao nhất", value: formatVND(quote.high_price) },
    { label: "Thấp nhất", value: formatVND(quote.low_price) },
    { label: "Tham chiếu", value: formatVND(quote.ref_price) },
    { label: "Trần", value: formatVND(quote.ceiling_price) },
    { label: "Sàn", value: formatVND(quote.floor_price) },
    { label: "KL giao dịch", value: formatVolume(quote.total_volume), wide: true },
  ];

  return (
    <section aria-label="Key stats" className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden">
      <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
        Thống kê
      </h2>
      <div className="grid grid-cols-3 divide-x divide-y divide-border-neo-subtle">
        {stats.map(({ label, value, wide }) => (
          <div
            key={label}
            className={cn(
              "px-4 py-3",
              wide && "col-span-3 border-t border-border-neo-subtle",
            )}
          >
            <div className="text-[10px] uppercase tracking-[0.5px] text-text-neo-tertiary mb-0.5">
              {label}
            </div>
            <div className="font-display text-[14px] tabular-nums text-text-neo-primary">
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PriceHeroSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-ink-violet-surface" />
      <div className="h-5 w-32 rounded-lg bg-ink-violet-surface" />
    </div>
  );
}

function KeyStatsSkeleton() {
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

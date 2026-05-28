"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BookmarkCheck, BookmarkPlus, TrendingUp } from "lucide-react";
import { useWatchlist } from "@/lib/use-watchlist";
import { usePriceAlerts } from "@/lib/use-price-alerts";
import { StockAICard } from "@/components/paave/stock-ai-card";
import { PaperTradeSheet } from "@/components/paave/paper-trade-sheet";
import { PriceAlertSheet } from "@/components/paave/price-alert-sheet";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useStockDetailData } from "./use-stock-detail-data";
import {
  ActionButton,
  KeyStats,
  KeyStatsSkeleton,
  PositionCard,
  SimilarStocksSection,
} from "./stock-detail-components";
import {
  ChartSkeleton,
  PriceChart,
  PriceHeroSkeleton,
  PriceRangeBar,
} from "./stock-price-chart";

interface StockDetailViewProps {
  ticker: string;
}

export function StockDetailView({ ticker }: StockDetailViewProps) {
  const router = useRouter();
  const { quote, symbol, holding, closePrices, similar, isLoading } =
    useStockDetailData(ticker);

  const [tradeSheetOpen, setTradeSheetOpen] = useState(false);
  const [alertSheetOpen, setAlertSheetOpen] = useState(false);
  const { isWatched, toggleWatchlist } = useWatchlist();
  const {
    hydrated: alertsHydrated,
    getAlertsForTicker,
    checkTriggered,
    removeAlert,
  } = usePriceAlerts();

  const change =
    quote?.last_price != null && quote?.ref_price != null
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

        {/* ── Price hero ─────────────────────────────────────── */}
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
              <span>{change !== null ? formatVND(Math.abs(change)) : "—"}</span>
              <span>
                {pctChange !== null ? `(${isUp ? "+" : ""}${pctChange.toFixed(2)}%)` : ""}
              </span>
              <span className="text-text-neo-tertiary text-[12px]">hôm nay</span>
            </div>
          </section>
        )}

        {/* ── Company info chips (sector / industry) ─────────── */}
        {!isLoading && symbol && (symbol.sector || symbol.industry) && (
          <div className="flex items-center gap-1.5 flex-wrap" aria-label="Thông tin ngành">
            {symbol.industry && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-ink-violet-surface border border-border-neo text-text-neo-tertiary leading-none">
                {symbol.industry}
              </span>
            )}
            {symbol.sector && symbol.sector !== symbol.industry && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-ink-violet-surface border border-border-neo text-text-neo-tertiary leading-none">
                {symbol.sector}
              </span>
            )}
          </div>
        )}

        {/* ── Daily price range bar ─────────────────────────── */}
        {!isLoading &&
          quote?.floor_price != null &&
          quote.ref_price != null &&
          quote.ceiling_price != null &&
          quote.last_price != null && (
            <PriceRangeBar
              floor={quote.floor_price}
              refPrice={quote.ref_price}
              ceiling={quote.ceiling_price}
              current={quote.last_price}
            />
          )}

        {/* ── Price chart (30-day close prices) ──────────────── */}
        {isLoading ? (
          <ChartSkeleton />
        ) : closePrices.length >= 2 ? (
          <section
            aria-label="Biểu đồ 30 ngày"
            className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden"
          >
            <p className="px-4 pt-3 pb-0 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
              30 ngày gần nhất
            </p>
            <PriceChart prices={closePrices} />
          </section>
        ) : null}

        {/* ── Open position ─────────────────────────────────── */}
        {holding && (
          <PositionCard holding={holding} lastPrice={quote?.last_price ?? null} />
        )}

        {/* ── Triggered alert banner ────────────────────────── */}
        {alertsHydrated &&
          quote?.last_price != null &&
          (() => {
            const triggered = checkTriggered(ticker, quote.last_price!);
            if (!triggered) return null;
            return (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-lime-signal-400/10 border border-lime-signal-400/40">
                <Bell className="size-4 text-lime-signal-400 shrink-0" />
                <p className="text-[13px] text-lime-signal-400 font-medium flex-1">
                  Thông báo đã kích hoạt — {ticker}{" "}
                  {triggered.condition === "above" ? "vượt lên" : "giảm xuống"}{" "}
                  {formatVND(triggered.target)}
                </p>
                <button
                  onClick={() => removeAlert(triggered.id)}
                  aria-label="Xoá thông báo"
                  className="text-[11px] text-lime-signal-400/70 hover:text-lime-signal-400 transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-lime-signal-400/10"
                >
                  Xoá
                </button>
                <button
                  onClick={() => setAlertSheetOpen(true)}
                  className="text-[11px] text-lime-signal-400/70 hover:text-lime-signal-400 transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-lime-signal-400/10"
                >
                  Quản lý
                </button>
              </div>
            );
          })()}

        {/* ── Action buttons ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Actions">
          <ActionButton
            icon={
              isWatched(ticker)
                ? <BookmarkCheck className="size-4" strokeWidth={2} />
                : <BookmarkPlus className="size-4" strokeWidth={2} />
            }
            label={isWatched(ticker) ? "Đã lưu" : "Watchlist"}
            active={isWatched(ticker)}
            onClick={() => toggleWatchlist(ticker)}
          />
          <ActionButton
            icon={<Bell className="size-4" strokeWidth={2} />}
            label="Thông báo"
            active={alertsHydrated && getAlertsForTicker(ticker).length > 0}
            onClick={() => setAlertSheetOpen(true)}
          />
          <ActionButton
            icon={<TrendingUp className="size-4" strokeWidth={2} />}
            label="Paper Trade"
            primary
            onClick={() => setTradeSheetOpen(true)}
          />
        </div>

        {/* ── Key stats ─────────────────────────────────────── */}
        {isLoading ? <KeyStatsSkeleton /> : quote ? <KeyStats quote={quote} /> : null}

        {/* ── Similar stocks (same sector) ─────────────────── */}
        {similar.length > 0 && symbol?.sector && (
          <SimilarStocksSection sector={symbol.sector} stocks={similar} />
        )}

        {/* ── AI Analysis card ──────────────────────────────── */}
        <StockAICard ticker={ticker} language="vi" />

      </div>

      {/* ── Paper trade sheet ─────────────────────────────────── */}
      <PaperTradeSheet
        isOpen={tradeSheetOpen}
        onClose={() => setTradeSheetOpen(false)}
        ticker={ticker}
        currentPrice={quote?.last_price ?? null}
        stockName={symbol?.name ?? null}
      />

      {/* ── Price alert sheet ─────────────────────────────────── */}
      <PriceAlertSheet
        isOpen={alertSheetOpen}
        onClose={() => setAlertSheetOpen(false)}
        ticker={ticker}
        currentPrice={quote?.last_price ?? null}
      />
    </main>
  );
}

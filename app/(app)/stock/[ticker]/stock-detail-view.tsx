"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, BookmarkCheck, BookmarkPlus, TrendingDown, TrendingUp } from "lucide-react";
import { useWatchlist } from "@/lib/use-watchlist";
import { usePriceAlerts } from "@/lib/use-price-alerts";
import { getBrowserClient } from "@/lib/supabase/client";
import { StockAICard } from "@/components/paave/stock-ai-card";
import { PaperTradeSheet } from "@/components/paave/paper-trade-sheet";
import { PriceAlertSheet } from "@/components/paave/price-alert-sheet";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

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

interface SimilarStock {
  code: string;
  name: string;
  lastPrice: number | null;
  pctChange: number | null;
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
  const [closePrices, setClosePrices] = useState<number[]>([]);
  const [similar, setSimilar] = useState<SimilarStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tradeSheetOpen, setTradeSheetOpen] = useState(false);
  const [alertSheetOpen, setAlertSheetOpen] = useState(false);
  const { isWatched, toggleWatchlist } = useWatchlist();
  const { hydrated: alertsHydrated, getAlertsForTicker, checkTriggered, removeAlert } = usePriceAlerts();

  useEffect(() => {
    const db = getBrowserClient();

    async function fetchData() {
      // Auth + market data + historical bars in parallel
      const [quoteRes, symbolRes, sessionRes, barsRes] = await Promise.all([
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
        db
          .from("symbol_day_bars")
          .select("close")
          .eq("symbol_code", ticker)
          .order("trade_date", { ascending: false })
          .limit(30),
      ]);

      setQuote(quoteRes.data ?? null);
      setSymbol(symbolRes.data ?? null);

      // Reverse to chronological order (oldest → newest) for chart rendering
      if (barsRes.data?.length) {
        setClosePrices(
          [...barsRes.data]
            .reverse()
            .map((b) => Number(b.close))
            .filter((v) => v > 0),
        );
      }

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

      // Similar stocks — secondary fetch (non-blocking, best-effort)
      // Runs after the primary data is set so the page renders immediately.
      const sector = symbolRes.data?.sector;
      if (sector) {
        const { data: sectorSymbols } = await db
          .from("symbols")
          .select("code, short_name, name")
          .eq("sector", sector)
          .neq("code", ticker)
          .limit(12);

        if (sectorSymbols?.length) {
          const codes = sectorSymbols.map((s) => s.code);
          const { data: sectorQuotes } = await db
            .from("symbol_quotes_latest")
            .select("symbol_code, last_price, pct_change, total_volume")
            .in("symbol_code", codes)
            .order("total_volume", { ascending: false })
            .limit(6);

          const quoteMap = new Map(
            (sectorQuotes ?? []).map((q) => [q.symbol_code, q]),
          );
          setSimilar(
            sectorSymbols
              .filter((s) => quoteMap.has(s.code))
              .slice(0, 6)
              .map((s) => ({
                code: s.code,
                name: s.short_name ?? s.name,
                lastPrice:
                  quoteMap.get(s.code)?.last_price != null
                    ? Number(quoteMap.get(s.code)!.last_price)
                    : null,
                pctChange:
                  quoteMap.get(s.code)?.pct_change != null
                    ? Number(quoteMap.get(s.code)!.pct_change)
                    : null,
              })),
          );
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

        {/* ── Company info chips (sector / industry) ──────────── */}
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

        {/* ── Daily price range bar (floor / ref / ceiling) ────── */}
        {!isLoading && quote?.floor_price != null && quote.ref_price != null && quote.ceiling_price != null && quote.last_price != null && (
          <PriceRangeBar
            floor={quote.floor_price}
            refPrice={quote.ref_price}
            ceiling={quote.ceiling_price}
            current={quote.last_price}
          />
        )}

        {/* ── Price chart (30-day close prices) ─────────────────── */}
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

        {/* ── Open position (shown only when user holds this stock) ── */}
        {holding && (
          <PositionCard
            holding={holding}
            lastPrice={quote?.last_price ?? null}
          />
        )}

        {/* ── Triggered alert banner ───────────────────────────── */}
        {alertsHydrated && quote?.last_price != null &&
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
                {/* Quick-dismiss removes the alert without opening the full sheet */}
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
          })()
        }

        {/* ── Action buttons (FR-23 section 4) ─────────────────── */}
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

        {/* ── Key stats (FR-25) ─────────────────────────────────── */}
        {isLoading ? (
          <KeyStatsSkeleton />
        ) : quote ? (
          <KeyStats quote={quote} />
        ) : null}

        {/* ── Similar stocks (same sector) ─────────────────────── */}
        {similar.length > 0 && symbol?.sector && (
          <SimilarStocksSection
            sector={symbol.sector}
            stocks={similar}
          />
        )}

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

      {/* ── Price alert sheet ───────────────────────────────────── */}
      <PriceAlertSheet
        isOpen={alertSheetOpen}
        onClose={() => setAlertSheetOpen(false)}
        ticker={ticker}
        currentPrice={quote?.last_price ?? null}
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
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2 text-[11px] font-bold uppercase tracking-[0.5px] transition-all active:scale-[0.97]",
        primary
          ? "bg-lime-signal-400 text-ink-violet-base"
          : active
            ? "bg-lime-signal-400/15 border border-lime-signal-400/40 text-lime-signal-400"
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

// Color tone for a stat entry — helps F0 users interpret limit prices at a glance
type StatTone = "positive" | "negative" | "neutral" | undefined;

function KeyStats({ quote }: { quote: QuoteData }) {
  const stats: { label: string; value: string; wide?: boolean; tone?: StatTone }[] = [
    { label: "Giá mở cửa", value: formatVND(quote.open_price) },
    // Intraday high/low — colored relative to session direction
    { label: "Cao nhất", value: formatVND(quote.high_price), tone: "positive" },
    { label: "Thấp nhất", value: formatVND(quote.low_price), tone: "negative" },
    // Reference price — the prior-day close used to compute price limits
    { label: "Tham chiếu", value: formatVND(quote.ref_price), tone: "neutral" },
    // Exchange-imposed price limits (±7% HOSE, ±10% HNX, ±15% UPCoM)
    { label: "Trần", value: formatVND(quote.ceiling_price), tone: "positive" },
    { label: "Sàn", value: formatVND(quote.floor_price), tone: "negative" },
    { label: "KL giao dịch", value: formatVolume(quote.total_volume), wide: true },
  ];

  return (
    <section aria-label="Key stats" className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden">
      <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
        Thống kê
      </h2>
      <div className="grid grid-cols-3 divide-x divide-y divide-border-neo-subtle">
        {stats.map(({ label, value, wide, tone }) => (
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
            <div
              className={cn(
                "font-display text-[14px] tabular-nums",
                tone === "positive"
                  ? "text-positive"
                  : tone === "negative"
                    ? "text-negative"
                    : tone === "neutral"
                      ? "text-text-neo-secondary"
                      : "text-text-neo-primary",
              )}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Price range bar — shows floor / ref / ceiling for the session with the
// current price marked as a draggable thumb. Helps F0 users understand
// how Vietnam's exchange price limits work.
// ---------------------------------------------------------------------------
function PriceRangeBar({
  floor,
  refPrice,
  ceiling,
  current,
}: {
  floor: number;
  refPrice: number;
  ceiling: number;
  current: number;
}) {
  const range = ceiling - floor;
  if (range <= 0) return null;

  // Convert a price to a percentage position (clamped to [0, 100])
  const toPercent = (p: number) =>
    Math.max(0, Math.min(100, ((p - floor) / range) * 100));

  const refPct = toPercent(refPrice);
  const currentPct = toPercent(current);
  const isUp = current >= refPrice;

  return (
    <section
      aria-label="Biên độ giá hôm nay"
      className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-4"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary mb-4">
        Biên độ giá hôm nay
      </p>

      {/* Track */}
      <div className="relative h-1.5 rounded-full bg-ink-violet-raised mx-2 mb-5">
        {/* Negative zone: floor → ref */}
        <div
          className="absolute inset-y-0 left-0 rounded-l-full bg-negative/25"
          style={{ width: `${refPct}%` }}
        />
        {/* Positive zone: ref → ceiling */}
        <div
          className="absolute inset-y-0 rounded-r-full bg-positive/25"
          style={{ left: `${refPct}%`, right: 0 }}
        />

        {/* Reference price tick — thicker so it's readable */}
        <div
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-text-neo-tertiary/50 rounded-full"
          style={{ left: `${refPct}%` }}
        />

        {/* Current price thumb */}
        <div
          role="img"
          aria-label={`Giá hiện tại ${formatVND(current)}`}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4 rounded-full border-[2.5px] border-ink-violet-surface shadow",
            isUp ? "bg-positive" : "bg-negative",
          )}
          style={{ left: `${currentPct}%` }}
        />
      </div>

      {/* Price labels */}
      <div className="flex justify-between text-[10px] tabular-nums">
        <div>
          <p className="font-bold text-negative">Sàn</p>
          <p className="text-text-neo-tertiary mt-0.5">{formatVND(floor)}</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-text-neo-secondary">TC</p>
          <p className="text-text-neo-tertiary mt-0.5">{formatVND(refPrice)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-positive">Trần</p>
          <p className="text-text-neo-tertiary mt-0.5">{formatVND(ceiling)}</p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Price chart — inline SVG area chart (no external deps)
// ---------------------------------------------------------------------------
function PriceChart({ prices }: { prices: number[] }) {
  if (prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const isUp = prices[prices.length - 1] >= prices[0];

  const W = 340;
  const H = 80;
  const PAD = 4;

  const toX = (i: number) => PAD + (i / (prices.length - 1)) * (W - 2 * PAD);
  const toY = (p: number) => PAD + (1 - (p - min) / range) * (H - 2 * PAD);

  const pts = prices.map((p, i) => `${toX(i).toFixed(2)},${toY(p).toFixed(2)}`).join(" ");
  const area = `${pts} ${toX(prices.length - 1).toFixed(2)},${H} ${toX(0).toFixed(2)},${H}`;

  const stroke = isUp ? "#B5E82F" : "#FF5B7A";
  const fillColor = isUp ? "rgba(181,232,47,0.12)" : "rgba(255,91,122,0.12)";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      aria-label="Biểu đồ giá 30 ngày gần nhất"
      role="img"
    >
      <polygon points={area} fill={fillColor} />
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
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

function ChartSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden animate-pulse"
    >
      {/* Label row */}
      <div className="px-4 pt-3 pb-2">
        <div className="h-2.5 w-28 rounded bg-ink-violet-raised" />
      </div>
      {/* Chart area placeholder — matches the 80px SVG height */}
      <div className="h-20 mx-4 mb-3 rounded-lg bg-ink-violet-raised" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Similar stocks — same sector, sorted by volume (liquidity proxy)
// ---------------------------------------------------------------------------
function SimilarStocksSection({
  sector,
  stocks,
}: {
  sector: string;
  stocks: SimilarStock[];
}) {
  return (
    <section aria-label={`Cổ phiếu cùng ngành ${sector}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary mb-2">
        Cùng ngành · {sector}
      </p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {stocks.map((s) => {
          const isUp = (s.pctChange ?? 0) >= 0;
          return (
            <Link
              key={s.code}
              href={`/stock/${s.code}`}
              className="shrink-0 rounded-2xl bg-ink-violet-surface border border-border-neo px-3 py-2.5 min-w-[110px] hover:bg-ink-violet-raised transition-colors active:scale-[0.98]"
            >
              <p className="font-display text-[13px] font-bold text-text-neo-primary">
                {s.code}
              </p>
              <p className="text-[10px] text-text-neo-tertiary truncate mt-0.5 max-w-[90px]">
                {s.name}
              </p>
              {s.lastPrice != null && (
                <>
                  <p className="font-display text-[12px] tabular-nums text-text-neo-primary mt-1.5">
                    {formatVND(s.lastPrice)}
                  </p>
                  {s.pctChange != null && (
                    <p
                      className={cn(
                        "text-[10px] tabular-nums font-medium",
                        isUp ? "text-positive" : "text-negative",
                      )}
                    >
                      {isUp ? "+" : ""}
                      {s.pctChange.toFixed(2)}%
                    </p>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </section>
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

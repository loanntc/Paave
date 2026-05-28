// Price visualization components for StockDetailView.
// Pure display — no data fetching, no routing, no external chart libraries.

import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// PriceRangeBar — floor / reference / ceiling with current price thumb.
// Helps F0 users understand how Vietnam's exchange price limits work.
// ---------------------------------------------------------------------------
export function PriceRangeBar({
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

  // Convert a price to a clamped percentage position along the track
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

        {/* Reference price tick */}
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
// PriceChart — inline SVG area chart (30-day close prices, no external deps)
// ---------------------------------------------------------------------------
export function PriceChart({ prices }: { prices: number[] }) {
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

// ---------------------------------------------------------------------------
// Skeleton loaders
// ---------------------------------------------------------------------------
export function PriceHeroSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-ink-violet-surface" />
      <div className="h-5 w-32 rounded-lg bg-ink-violet-surface" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden animate-pulse"
    >
      <div className="px-4 pt-3 pb-2">
        <div className="h-2.5 w-28 rounded bg-ink-violet-raised" />
      </div>
      {/* Matches the 80px SVG height */}
      <div className="h-20 mx-4 mb-3 rounded-lg bg-ink-violet-raised" />
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";
import { DeltaBadge } from "@/components/ui/delta-badge";
import { Chip } from "@/components/ui/chip";

export interface StockCardProps {
  symbol: string;
  name: string;
  exchange: string;
  price: string;
  delta: string;
  up?: boolean;
  hook?: string;
  watchers: string;
  logoBackground?: string;
  trending?: string;
  sentiment?: "Bull" | "Bear" | "Neutral";
  className?: string;
}

export function StockCard({
  symbol,
  name,
  exchange,
  price,
  delta,
  up = true,
  hook,
  watchers,
  logoBackground = "var(--gradient-lime)",
  trending,
  sentiment,
  className,
}: StockCardProps) {
  const sentimentVariant =
    sentiment === "Bull" ? "positive" : sentiment === "Bear" ? "negative" : "neutral";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-4 rounded-md-neo",
        "bg-ink-violet-raised border border-border-neo min-w-0",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 shrink-0 rounded-full grid place-items-center font-bold text-[13px] text-white"
            style={{ background: logoBackground }}
          >
            {symbol.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[15px] tracking-[-0.2px]">{symbol}</div>
            <div className="text-[12px] text-text-neo-secondary leading-snug truncate">
              {name} · {exchange}
            </div>
          </div>
        </div>
        <Sparkline up={up} />
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2.5">
        <span className="text-[20px] font-bold tabular tracking-[-0.3px]">{price}</span>
        <DeltaBadge direction={up ? "positive" : "negative"} value={delta} />
      </div>

      {/* Hook */}
      {hook && (
        <p className="text-[13px] text-text-neo-secondary leading-relaxed text-wrap-pretty">
          {hook}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-[11px] text-text-neo-tertiary pt-3 border-t border-border-neo-subtle">
        <span className="flex items-center gap-1">👁 {watchers} watching</span>
        <div className="flex gap-1.5">
          {trending && (
            <Chip variant="warning" className="h-[22px] text-[10px] px-2">🔥 {trending}</Chip>
          )}
          {sentiment && (
            <Chip variant={sentimentVariant} className="h-[22px] text-[10px] px-2">
              {sentiment}
            </Chip>
          )}
        </div>
      </div>
    </div>
  );
}

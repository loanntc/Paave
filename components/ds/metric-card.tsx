import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MetricVariant = "default" | "hero";
export type MetricDelta = "positive" | "negative" | "neutral";

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  delta?: { value: string; tone?: MetricDelta };
  caption?: ReactNode;
  variant?: MetricVariant;
  className?: string;
}

const deltaTone: Record<MetricDelta, string> = {
  positive: "text-lime-signal-400",
  negative: "text-negative",
  neutral:  "text-text-neo-tertiary",
};

export function MetricCard({ label, value, delta, caption, variant = "default", className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 p-5 rounded-lg-neo border",
        variant === "hero"
          ? "bg-gradient-hero border-[rgba(181,232,47,0.3)] overflow-hidden"
          : "bg-ink-violet-raised border-border-neo",
        className,
      )}
    >
      {variant === "hero" && (
        <span
          aria-hidden
          className="absolute top-0 right-0 w-40 h-40 bg-gradient-accent-glow pointer-events-none"
        />
      )}
      <span className="text-[11px] uppercase tracking-[0.8px] font-bold text-text-neo-tertiary">
        {label}
      </span>
      <span className="text-[30px] font-extrabold tabular leading-none tracking-[-0.6px] text-text-neo-primary">
        {value}
      </span>
      {(delta || caption) && (
        <div className="flex items-center gap-2 text-xs">
          {delta && (
            <span className={cn("font-bold tabular", deltaTone[delta.tone ?? "neutral"])}>
              {delta.value}
            </span>
          )}
          {caption && <span className="text-text-neo-tertiary">{caption}</span>}
        </div>
      )}
    </div>
  );
}

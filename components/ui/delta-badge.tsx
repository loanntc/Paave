import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type DeltaDirection = "positive" | "negative" | "neutral";

export interface DeltaBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  direction?: DeltaDirection;
  value: string;
}

const directionStyles: Record<DeltaDirection, string> = {
  positive: "bg-[rgba(181,232,47,0.15)] text-lime-signal-400",
  negative: "bg-[rgba(255,91,122,0.16)] text-negative",
  neutral:  "bg-[rgba(110,107,143,0.12)] text-ink-violet-muted",
};

const arrows: Record<DeltaDirection, string> = {
  positive: "▲",
  negative: "▼",
  neutral:  "—",
};

export function DeltaBadge({ direction = "neutral", value, className, ...props }: DeltaBadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-sm-neo",
        "text-[13px] font-semibold tabular tracking-[-0.1px]",
        directionStyles[direction],
        className,
      )}
    >
      <span>{arrows[direction]}</span>
      <span>{value}</span>
    </span>
  );
}

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ChipVariant = "default" | "active" | "positive" | "negative" | "neutral" | "warning";

const variantStyles: Record<ChipVariant, string> = {
  default:  "bg-ink-violet-raised border border-border-neo text-text-neo-secondary",
  active:   "bg-[rgba(181,232,47,0.16)] border-transparent text-lime-signal-400",
  positive: "bg-[rgba(181,232,47,0.15)] border-transparent text-lime-signal-400",
  negative: "bg-[rgba(255,91,122,0.16)] border-transparent text-negative",
  neutral:  "bg-[rgba(110,107,143,0.15)] border-transparent text-ink-violet-muted",
  warning:  "bg-[rgba(255,138,91,0.16)] border-transparent text-peach-streak-400",
};

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
}

export function Chip({ className, variant = "default", children, ...props }: ChipProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-2 min-h-[32px] whitespace-nowrap",
        "px-3 rounded-full text-[12px] font-semibold tracking-[0.2px]",
        "transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

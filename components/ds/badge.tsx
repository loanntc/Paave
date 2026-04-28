import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DotBadgeTone = "live" | "delayed" | "closed" | "preopen" | "offline";

const dotTone: Record<DotBadgeTone, string> = {
  live:     "text-lime-signal-400",
  delayed:  "text-peach-streak-400",
  closed:   "text-negative",
  preopen:  "text-violet-deep-400",
  offline:  "text-text-neo-tertiary",
};

export function DotBadge({ tone, children, className }: { tone: DotBadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "bg-ink-violet-raised border border-border-neo",
        "text-[11px] font-bold tracking-[0.3px]",
        dotTone[tone],
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export type SolidBadgeTone = "pro" | "beta" | "hot" | "risky";

const solidTone: Record<SolidBadgeTone, string> = {
  pro:   "bg-lime-signal-400 text-ink-violet-base",
  beta:  "bg-violet-deep-600 text-white",
  hot:   "bg-peach-streak-400 text-ink-violet-base",
  risky: "bg-[rgba(255,91,122,0.16)] text-negative",
};

export function SolidBadge({ tone, children, className }: { tone: SolidBadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md",
        "text-[11px] font-bold tracking-[0.3px]",
        solidTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function NewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded uppercase",
        "bg-lime-signal-400 text-ink-violet-base",
        "text-[10px] font-extrabold tracking-[0.5px]",
        className,
      )}
    >
      NEW
    </span>
  );
}

export interface CountBadgeProps {
  count: number;
  max?: number;
  className?: string;
  style?: CSSProperties;
}

export function CountBadge({ count, max = 99, className, style }: CountBadgeProps) {
  const display = count > max ? `${max}+` : String(count);
  return (
    <span
      style={style}
      className={cn(
        "inline-grid place-items-center min-w-[18px] h-[18px] px-1.5",
        "rounded-full bg-negative text-white",
        "text-[10px] font-bold leading-none",
        className,
      )}
    >
      {display}
    </span>
  );
}

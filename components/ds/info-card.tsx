import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InfoTone = "lime" | "violet" | "peach" | "negative";

const toneStyle: Record<InfoTone, { border: string; bg: string; fg: string }> = {
  lime:     { border: "border-l-lime-signal-400",   bg: "bg-[rgba(181,232,47,0.16)]",  fg: "text-lime-signal-400" },
  violet:   { border: "border-l-violet-deep-400",   bg: "bg-[rgba(127,119,221,0.18)]", fg: "text-violet-deep-400" },
  peach:    { border: "border-l-peach-streak-400",  bg: "bg-[rgba(255,138,91,0.16)]",  fg: "text-peach-streak-400" },
  negative: { border: "border-l-negative",          bg: "bg-[rgba(255,91,122,0.16)]",  fg: "text-negative" },
};

export interface InfoCardProps {
  tone?: InfoTone;
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  className?: string;
}

export function InfoCard({ tone = "lime", icon, title, description, className }: InfoCardProps) {
  const t = toneStyle[tone];
  return (
    <div
      className={cn(
        "flex gap-3.5 p-4 rounded-md-neo bg-ink-violet-raised border border-border-neo border-l-[3px]",
        t.border,
        className,
      )}
    >
      {icon && (
        <span className={cn("shrink-0 grid place-items-center w-10 h-10 rounded-md-neo", t.bg, t.fg)}>
          {icon}
        </span>
      )}
      <span className="block">
        <span className="block text-sm font-bold mb-1">{title}</span>
        {description && (
          <span className="block text-[13px] text-text-neo-secondary leading-relaxed">{description}</span>
        )}
      </span>
    </div>
  );
}

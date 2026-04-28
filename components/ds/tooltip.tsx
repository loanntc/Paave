import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  rich?: boolean;
  title?: string;
  className?: string;
}

export function Tooltip({ children, content, rich, title, className }: TooltipProps) {
  return (
    <span className={cn("relative inline-flex group", className)}>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5",
          "z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          "transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
          rich
            ? "max-w-[260px] px-3.5 py-2.5 rounded-sm-neo bg-ink-violet-raised border border-border-neo shadow-card-raised"
            : "whitespace-nowrap px-2.5 py-1.5 rounded-md bg-ink-violet-base border border-border-neo shadow-card-raised text-lime-signal-400 text-xs font-medium",
        )}
      >
        {rich ? (
          <span className="block">
            {title && (
              <span className="block text-xs font-bold text-lime-signal-400 mb-1">{title}</span>
            )}
            <span className="block text-xs text-text-neo-secondary leading-snug">{content}</span>
          </span>
        ) : (
          content
        )}
        <span
          aria-hidden
          className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-ink-violet-base"
        />
      </span>
      {children}
    </span>
  );
}

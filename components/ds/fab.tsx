import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FabTone = "lime" | "violet";

const toneStyles: Record<FabTone, string> = {
  lime:   "bg-lime-signal-400 text-ink-violet-base shadow-[0_8px_24px_rgba(181,232,47,0.45),0_4px_8px_rgba(0,0,0,0.3)]",
  violet: "bg-violet-deep-600 text-white shadow-glow-violet",
};

export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: FabTone;
  extended?: boolean;
  icon?: ReactNode;
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(
  ({ tone = "lime", extended, icon, children, className, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      {...rest}
      className={cn(
        "rounded-full active:scale-95",
        "transition-transform duration-[var(--duration-fast)] ease-[var(--ease-spring)]",
        extended
          ? "inline-flex items-center gap-2 h-14 px-5 text-sm font-bold"
          : "inline-grid place-items-center w-14 h-14",
        toneStyles[tone],
        className,
      )}
    >
      {icon}
      {extended && children}
    </button>
  ),
);
Fab.displayName = "Fab";

"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "lime" | "violet" | "ghost";

const variants: Record<Variant, string> = {
  lime: "bg-gradient-lime text-ink-violet-base shadow-glow-accent hover:brightness-105 active:scale-[0.98]",
  violet:
    "bg-gradient-violet text-white shadow-glow-violet hover:brightness-105 active:scale-[0.98]",
  ghost:
    "bg-ink-violet-raised text-text-neo-primary border border-border-neo hover:bg-ink-violet-hover active:scale-[0.98]",
};

export interface KineticButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** @deprecated use variant="violet" */
  plasma?: boolean;
  fullWidth?: boolean;
}

export const KineticButton = forwardRef<HTMLButtonElement, KineticButtonProps>(
  (
    { className, variant = "lime", fullWidth = true, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        {...props}
        className={cn(
          "relative flex items-center justify-center gap-3",
          "rounded-lg px-12 py-5 font-pretendard text-[18px] font-semibold uppercase tracking-wide",
          "transition-[transform,filter,box-shadow] duration-150 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          fullWidth && "w-full",
          variants[variant],
          className,
        )}
      >
        {children}
      </button>
    );
  },
);
KineticButton.displayName = "KineticButton";

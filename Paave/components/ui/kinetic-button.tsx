"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "lime" | "plasma" | "ghost";

const variants: Record<Variant, string> = {
  lime: "bg-lime-drop text-lime-ink shadow-glow-lime hover:brightness-105 active:scale-[0.98]",
  plasma:
    "bg-plasma-drop text-white shadow-glow-plasma hover:brightness-105 active:scale-[0.98]",
  ghost:
    "bg-ink-600 text-lime-soft border border-edge hover:bg-ink-500 active:scale-[0.98]",
};

export interface KineticButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
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
          "rounded-lg px-12 py-5 font-display text-[18px] uppercase",
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

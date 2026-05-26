"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "disabled";
export type ButtonSize = "default" | "sm" | "xs";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-lime-signal-400 text-ink-violet-base shadow-glow-accent hover:bg-lime-signal-600 hover:text-white",
  secondary:
    "bg-violet-deep-600 text-white hover:brightness-110",
  tertiary:
    "bg-[rgba(181,232,47,0.16)] text-lime-signal-400 border border-[rgba(181,232,47,0.3)] hover:bg-[rgba(181,232,47,0.22)]",
  ghost:
    "bg-transparent text-text-neo-primary border border-border-neo hover:bg-ink-violet-raised",
  destructive:
    "bg-negative text-white shadow-[0_0_16px_rgba(255,91,122,0.35)] hover:brightness-110",
  disabled:
    "bg-ink-violet-raised text-text-neo-tertiary border border-border-neo cursor-not-allowed opacity-60",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-[52px] px-5 text-[15px] rounded-md-neo",
  sm:      "h-[40px] px-4 text-[13px] rounded-md-neo",
  xs:      "h-[32px] px-3 text-[12px] rounded-sm-neo",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", fullWidth, disabled, children, ...props }, ref) => {
    const resolvedVariant = disabled ? "disabled" : variant;
    return (
      <button
        ref={ref}
        disabled={disabled || variant === "disabled"}
        {...props}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "font-semibold leading-none tracking-[-0.1px] whitespace-nowrap",
          "transition-[transform,background,box-shadow]",
          "duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
          "active:scale-[0.97]",
          sizeStyles[size],
          variantStyles[resolvedVariant],
          fullWidth && "w-full",
          className,
        )}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

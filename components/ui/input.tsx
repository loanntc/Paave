"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hasError, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const invalid = hasError || !!error;

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-[13px] font-medium",
              invalid ? "text-negative" : "text-text-neo-secondary",
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={cn(
            "w-full h-[56px] px-4 rounded-md-neo",
            "bg-ink-violet-raised border text-text-neo-primary text-[16px]",
            "placeholder:text-text-neo-tertiary outline-none",
            "transition-[border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "focus:border-border-neo-focus focus:border-2 focus:px-[15px]",
            invalid
              ? "border-border-neo-error bg-[rgba(255,91,122,0.05)]"
              : "border-border-neo",
            className,
          )}
        />
        {error && (
          <p className="text-[12px] text-negative leading-snug">{error}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

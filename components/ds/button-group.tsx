"use client";

import { cn } from "@/lib/utils";

export interface ButtonGroupOption<T extends string> {
  value: T;
  label: string;
  tone?: "default" | "negative";
}

export interface ButtonGroupProps<T extends string> {
  options: readonly ButtonGroupOption<T>[];
  value: T;
  onChange?: (next: T) => void;
  className?: string;
}

export function ButtonGroup<T extends string>({ options, value, onChange, className }: ButtonGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center gap-0.5 p-1 rounded-md-neo",
        "bg-ink-violet-raised border border-border-neo",
        className,
      )}
    >
      {options.map((opt) => {
        const isOn = value === opt.value;
        const isNeg = isOn && opt.tone === "negative";
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isOn}
            onClick={() => onChange?.(opt.value)}
            className={cn(
              "px-4 py-2 rounded-sm-neo text-[13px] font-semibold",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
              !isOn && "text-text-neo-secondary hover:text-text-neo-primary",
              isOn && !isNeg && "bg-ink-violet-surface text-lime-signal-400 shadow-[inset_0_0_0_1px_rgba(181,232,47,0.4)]",
              isNeg && "bg-ink-violet-surface text-negative shadow-[inset_0_0_0_1px_rgba(255,91,122,0.4)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

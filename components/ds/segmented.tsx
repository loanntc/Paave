"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange?: (next: T) => void;
  className?: string;
}

export function Segmented<T extends string>({ options, value, onChange, className }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-full",
        "bg-ink-violet-surface border border-border-neo-subtle",
        className,
      )}
    >
      {options.map((opt) => {
        const isOn = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isOn}
            onClick={() => onChange?.(opt.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
              isOn
                ? "bg-lime-signal-400 text-ink-violet-base shadow-[0_0_16px_rgba(181,232,47,0.35)]"
                : "text-text-neo-tertiary hover:text-text-neo-primary",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

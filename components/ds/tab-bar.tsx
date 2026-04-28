"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
  icon?: ReactNode;
}

export interface TabBarProps<T extends string> {
  items: readonly TabItem<T>[];
  value: T;
  onChange?: (next: T) => void;
  className?: string;
}

export function TabBar<T extends string>({ items, value, onChange, className }: TabBarProps<T>) {
  return (
    <div role="tablist" className={cn("flex gap-6 px-1 border-b border-border-neo", className)}>
      {items.map((tab) => {
        const isOn = value === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isOn}
            type="button"
            onClick={() => onChange?.(tab.value)}
            className={cn(
              "relative py-3.5 text-sm font-semibold tracking-tight",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
              isOn ? "text-lime-signal-400" : "text-text-neo-tertiary hover:text-text-neo-primary",
            )}
          >
            {tab.icon && <span className="mr-1 inline-block align-[-2px]">{tab.icon}</span>}
            {tab.label}
            {tab.count != null && (
              <span
                className={cn(
                  "ml-1.5 inline-block px-1.5 py-px rounded-full text-[10px] font-bold",
                  isOn
                    ? "bg-[rgba(181,232,47,0.18)] text-lime-signal-400"
                    : "bg-ink-violet-raised text-text-neo-secondary",
                )}
              >
                {tab.count}
              </span>
            )}
            {isOn && (
              <span
                aria-hidden
                className="absolute left-0 right-0 -bottom-px h-0.5 rounded-sm bg-lime-signal-400"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

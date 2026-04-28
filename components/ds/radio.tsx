"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface RadioProps<T extends string> {
  name: string;
  value: T;
  selected: T;
  onChange?: (next: T) => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Radio<T extends string>({
  name,
  value,
  selected,
  onChange,
  disabled,
  children,
  className,
}: RadioProps<T>) {
  const isOn = selected === value;
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2.5 text-sm select-none",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isOn}
        disabled={disabled}
        onChange={() => onChange?.(value)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "shrink-0 grid place-items-center w-5 h-5 rounded-full",
          "bg-ink-violet-raised transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
          isOn
            ? "border-[5px] border-lime-signal-400"
            : "border-[1.5px] border-border-neo",
        )}
      />
      {children}
    </label>
  );
}

export interface RadioCardProps<T extends string> {
  name: string;
  value: T;
  selected: T;
  onChange?: (next: T) => void;
  title: string;
  description?: ReactNode;
  className?: string;
}

export function RadioCard<T extends string>({
  name,
  value,
  selected,
  onChange,
  title,
  description,
  className,
}: RadioCardProps<T>) {
  const isOn = selected === value;
  return (
    <label
      className={cn(
        "flex gap-3 p-4 rounded-md-neo cursor-pointer border-[1.5px]",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        isOn
          ? "border-lime-signal-400 bg-[rgba(181,232,47,0.05)]"
          : "border-border-neo bg-ink-violet-raised hover:border-border-neo-focus/40",
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={isOn}
        onChange={() => onChange?.(value)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 shrink-0 grid place-items-center w-5 h-5 rounded-full bg-ink-violet-surface",
          isOn ? "border-[5px] border-lime-signal-400" : "border-[1.5px] border-border-neo",
        )}
      />
      <span className="flex-1">
        <span className="block font-bold text-sm">{title}</span>
        {description && (
          <span className="block text-xs text-text-neo-secondary leading-relaxed mt-1">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

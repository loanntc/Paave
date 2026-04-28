"use client";

import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({ checked, onChange, disabled, label, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        "relative inline-flex w-[46px] h-[26px] rounded-full border transition-colors",
        "duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        checked
          ? "bg-lime-signal-400 border-lime-signal-400"
          : "bg-ink-violet-raised border-border-neo",
        disabled && "opacity-40 cursor-not-allowed",
        !disabled && "cursor-pointer",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-[2px] w-5 h-5 rounded-full",
          "transition-[left,background] duration-[var(--duration-standard)] ease-[var(--ease-spring)]",
          "shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
          checked ? "left-[22px] bg-ink-violet-base" : "left-[2px] bg-white",
        )}
      />
    </button>
  );
}

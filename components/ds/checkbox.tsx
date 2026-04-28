"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export type CheckboxState = boolean | "indeterminate";

export interface CheckboxProps {
  checked: CheckboxState;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Checkbox({ checked, onChange, disabled, children, className }: CheckboxProps) {
  const isOn = checked === true;
  const isIndeterminate = checked === "indeterminate";

  return (
    <label
      className={cn(
        "inline-flex items-start gap-2.5 text-sm select-none",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        className,
      )}
    >
      <span
        role="checkbox"
        aria-checked={isIndeterminate ? "mixed" : isOn}
        aria-disabled={disabled || undefined}
        onClick={() => !disabled && onChange?.(!isOn)}
        className={cn(
          "shrink-0 grid place-items-center w-5 h-5 rounded-md border-[1.5px]",
          "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
          isOn || isIndeterminate
            ? "bg-lime-signal-400 border-lime-signal-400"
            : "bg-ink-violet-raised border-border-neo",
        )}
      >
        {isOn && <Icon name="check" size={12} strokeWidth={3} className="text-ink-violet-base" />}
        {isIndeterminate && <span aria-hidden className="block w-2.5 h-0.5 bg-ink-violet-base rounded-sm" />}
      </span>
      {children && <span className="leading-snug">{children}</span>}
    </label>
  );
}

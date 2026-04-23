"use client";

import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useRef,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

/** 6-digit OTP grid rendered as 2 rows × 3 columns. */
export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
  autoFocus,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setAt = (idx: number, char: string) => {
    const chars = value.padEnd(length, " ").split("");
    chars[idx] = char || " ";
    const next = chars.join("").trimEnd();
    onChange(next.slice(0, length));
  };

  const handleChange = (idx: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setAt(idx, "");
      return;
    }
    if (raw.length > 1) {
      const spread = raw.slice(0, length - idx).split("");
      const chars = value.padEnd(length, " ").split("");
      spread.forEach((c, i) => (chars[idx + i] = c));
      onChange(chars.join("").trimEnd().slice(0, length));
      const focusTarget = Math.min(idx + spread.length, length - 1);
      refs.current[focusTarget]?.focus();
      return;
    }
    setAt(idx, raw);
    if (idx < length - 1) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown =
    (idx: number) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !value[idx] && idx > 0) {
        refs.current[idx - 1]?.focus();
      }
      if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
      if (e.key === "ArrowRight" && idx < length - 1)
        refs.current[idx + 1]?.focus();
    };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    onChange(pasted.slice(0, length));
    const target = Math.min(pasted.length, length - 1);
    refs.current[target]?.focus();
  };

  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-3 w-full">
      {Array.from({ length }).map((_, idx) => {
        const char = value[idx] ?? "";
        const isFilled = Boolean(char);
        return (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={idx === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            aria-label={`Digit ${idx + 1} of ${length}`}
            value={char}
            onChange={handleChange(idx)}
            onKeyDown={handleKeyDown(idx)}
            onPaste={handlePaste}
            className={cn(
              "h-20 w-full rounded-lg bg-ink-violet-raised text-center",
              "font-pretendard text-[30px] leading-none tabular-nums",
              "border border-border-neo outline-none transition-all duration-150",
              "focus:border-border-neo-focus focus:border-2 focus:bg-ink-violet-hover",
              isFilled ? "text-text-neo-primary" : "text-text-neo-tertiary",
              "caret-lime-signal-400",
              "disabled:opacity-50",
            )}
          />
        );
      })}
    </div>
  );
}

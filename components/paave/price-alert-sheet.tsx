"use client";

// ---------------------------------------------------------------------------
// PriceAlertSheet — bottom sheet for setting and managing in-app price alerts
// Uses usePriceAlerts hook (localStorage-backed, no backend required)
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePriceAlerts, type PriceAlert } from "@/lib/use-price-alerts";
import { formatVND } from "@/lib/format";

interface PriceAlertSheetProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  currentPrice: number | null;
}

export function PriceAlertSheet({
  isOpen,
  onClose,
  ticker,
  currentPrice,
}: PriceAlertSheetProps) {
  const { hydrated, getAlertsForTicker, setAlert, removeAlert } = usePriceAlerts();
  const [condition, setCondition] = useState<"above" | "below">("above");
  // Seed target with current price on open; fall back to 0
  const [targetInput, setTargetInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const existing = hydrated ? getAlertsForTicker(ticker) : [];

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen) {
      setCondition("above");
      setTargetInput(currentPrice != null ? String(Math.round(currentPrice)) : "");
    }
  }, [isOpen, currentPrice]);

  // Auto-focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const targetNum = parseFloat(targetInput.replace(/\./g, "").replace(",", "."));
  const isValid = !isNaN(targetNum) && targetNum > 0;

  function handleSetAlert() {
    if (!isValid) return;
    setAlert(ticker, condition, targetNum);
    onClose();
  }

  function handleRawInput(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow digits and common separators — store raw; parse on submit
    setTargetInput(e.target.value.replace(/[^0-9]/g, ""));
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink-violet-base/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Đặt thông báo giá"
        className="fixed bottom-0 left-0 right-0 z-50 max-w-[640px] mx-auto rounded-t-3xl bg-ink-violet-surface border-t border-border-neo pb-safe"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-ink-violet-raised" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-neo-subtle">
          <div>
            <p className="font-display text-[16px] font-bold text-text-neo-primary">
              Thông báo giá
            </p>
            <p className="text-[12px] text-text-neo-tertiary">
              {ticker}
              {currentPrice != null && ` · Hiện tại ${formatVND(currentPrice)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="grid size-8 place-items-center rounded-full bg-ink-violet-raised text-text-neo-tertiary hover:text-text-neo-primary transition-colors"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Condition toggle */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-neo-tertiary mb-2">
              Điều kiện
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["above", "below"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className={cn(
                    "flex items-center justify-center gap-2 h-11 rounded-xl border text-[13px] font-bold transition-all",
                    condition === c
                      ? c === "above"
                        ? "bg-positive/10 border-positive/40 text-positive"
                        : "bg-negative/10 border-negative/40 text-negative"
                      : "bg-ink-violet-raised border-border-neo text-text-neo-tertiary hover:text-text-neo-secondary",
                  )}
                >
                  {c === "above" ? (
                    <ChevronUp className="size-4" strokeWidth={2.5} />
                  ) : (
                    <ChevronDown className="size-4" strokeWidth={2.5} />
                  )}
                  {c === "above" ? "Vượt lên" : "Giảm xuống"}
                </button>
              ))}
            </div>
          </div>

          {/* Target price input */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-neo-tertiary mb-2">
              Mức giá mục tiêu (₫)
            </p>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={targetInput}
                onChange={handleRawInput}
                placeholder="Nhập mức giá…"
                className={cn(
                  "w-full h-12 rounded-xl border bg-ink-violet-raised px-4 pr-12",
                  "font-display text-[18px] tabular-nums text-text-neo-primary",
                  "placeholder:text-text-neo-tertiary placeholder:text-[14px] placeholder:font-sans",
                  "outline-none transition-colors",
                  isValid || targetInput === ""
                    ? "border-border-neo focus:border-lime-signal-400/60"
                    : "border-negative/40",
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-text-neo-tertiary">
                ₫
              </span>
            </div>
            {isValid && (
              <p className="mt-1.5 text-[11px] text-text-neo-tertiary">
                Thông báo khi {ticker}{" "}
                {condition === "above" ? "vượt lên" : "giảm xuống"}{" "}
                <span className="text-text-neo-secondary font-medium">
                  {formatVND(targetNum)}
                </span>
              </p>
            )}
          </div>

          {/* Set button */}
          <button
            onClick={handleSetAlert}
            disabled={!isValid}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-12 rounded-2xl font-display text-[15px] font-bold transition-all active:scale-[0.98]",
              isValid
                ? "bg-lime-signal-400 text-ink-violet-base hover:opacity-90"
                : "bg-ink-violet-raised text-text-neo-tertiary cursor-not-allowed",
            )}
          >
            <Bell className="size-4" strokeWidth={2} />
            Đặt thông báo
          </button>

          {/* Existing alerts for this ticker */}
          {existing.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-text-neo-tertiary mb-2">
                Thông báo đang bật ({existing.length})
              </p>
              <div className="space-y-2">
                {existing.map((alert) => (
                  <ExistingAlertRow
                    key={alert.id}
                    alert={alert}
                    onRemove={() => removeAlert(alert.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Safe area padding */}
        <div className="h-6" />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ExistingAlertRow
// ---------------------------------------------------------------------------
function ExistingAlertRow({
  alert,
  onRemove,
}: {
  alert: PriceAlert;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-ink-violet-raised border border-border-neo">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-8 place-items-center rounded-full",
            alert.condition === "above"
              ? "bg-positive/10 text-positive"
              : "bg-negative/10 text-negative",
          )}
        >
          {alert.condition === "above" ? (
            <ChevronUp className="size-4" strokeWidth={2.5} />
          ) : (
            <ChevronDown className="size-4" strokeWidth={2.5} />
          )}
        </span>
        <div>
          <p className="text-[13px] font-medium text-text-neo-primary">
            {alert.condition === "above" ? "Vượt lên" : "Giảm xuống"}{" "}
            <span className="font-display font-bold tabular-nums">
              {formatVND(alert.target)}
            </span>
          </p>
          <p className="text-[11px] text-text-neo-tertiary">
            {alert.ticker}
          </p>
        </div>
      </div>
      <button
        onClick={onRemove}
        aria-label="Xóa thông báo"
        className="grid size-8 place-items-center rounded-full text-text-neo-tertiary hover:text-negative hover:bg-negative/10 transition-colors"
      >
        <BellOff className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

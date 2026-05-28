"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EntryPhase,
  ConfirmedPhase,
  type Side,
  type Phase,
  type FilledTrade,
} from "./paper-trade-phases";

// ---------------------------------------------------------------------------
// Constants — Vietnamese securities transaction costs
// ---------------------------------------------------------------------------
const BROKER_FEE_RATE = 0.0025; // 0.25% broker commission
const VSD_TAX_RATE = 0.001;     // 0.1% on SELL — Circular 37/2016/TT-BTC

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function calcFees(side: Side, grossValue: number): { fees: number; tax: number } {
  const fees = Math.round(grossValue * BROKER_FEE_RATE);
  const tax = side === "SELL" ? Math.round(grossValue * VSD_TAX_RATE) : 0;
  return { fees, tax };
}

// ---------------------------------------------------------------------------
// PaperTradeSheet — bottom-sheet wrapper with phase management
// ---------------------------------------------------------------------------
interface PaperTradeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  /** Current last price from the stock detail — used as default limit price */
  currentPrice: number | null;
  stockName: string | null;
}

export function PaperTradeSheet({
  isOpen,
  onClose,
  ticker,
  currentPrice,
  stockName,
}: PaperTradeSheetProps) {
  const [side, setSide] = useState<Side>("BUY");
  const [quantity, setQuantity] = useState(100);
  const [phase, setPhase] = useState<Phase>("entry");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filledTrade, setFilledTrade] = useState<FilledTrade | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset all state when the sheet closes
  useEffect(() => {
    if (!isOpen) {
      setPhase("entry");
      setQuantity(100);
      setSide("BUY");
      setErrorMsg(null);
      setFilledTrade(null);
    }
  }, [isOpen]);

  // Focus quantity input once the entry panel animates in
  useEffect(() => {
    if (isOpen && phase === "entry") {
      const timer = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(timer);
    }
  }, [isOpen, phase]);

  const price = currentPrice ?? 0;
  const grossValue = quantity * price;
  const { fees, tax } = calcFees(side, grossValue);
  const totalCost = side === "BUY" ? grossValue + fees : grossValue - fees - tax;

  const handleQtyDelta = useCallback((delta: number) => {
    setQuantity((q) => Math.max(100, q + delta));
  }, []);

  const handleQtyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
    if (!isNaN(v) && v >= 0) setQuantity(v);
  };

  const handleConfirm = useCallback(async () => {
    if (!price || quantity <= 0 || phase === "submitting") return;

    setPhase("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, side, quantity, price }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Lệnh thất bại, vui lòng thử lại.");
        setPhase("error");
        return;
      }

      setFilledTrade({
        ticker,
        side,
        quantity: data.trade.quantity,
        price: data.trade.price,
        fees: data.trade.fees,
        tax: data.trade.tax ?? 0,
        grossValue: data.trade.grossValue,
      });
      setPhase("confirmed");
    } catch {
      setErrorMsg("Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.");
      setPhase("error");
    }
  }, [price, quantity, phase, ticker, side]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Paper trade ${ticker}`}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[640px] flex flex-col",
          "rounded-t-[28px] border-t border-x border-border-neo bg-ink-violet-base",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Drag handle */}
        <div className="flex shrink-0 justify-center pb-1 pt-3" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-border-neo-subtle" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border-neo-subtle px-4 pb-3 pt-1">
          <div>
            <p className="font-display text-[16px] font-bold text-text-neo-primary">
              {phase === "confirmed" ? "Lệnh đã khớp" : "Đặt lệnh giả lập"}
            </p>
            <p className="text-[12px] text-text-neo-tertiary">
              {ticker} · {stockName ?? ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full border border-border-neo bg-ink-violet-surface text-text-neo-tertiary transition-colors hover:text-text-neo-primary"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body — switches between entry form and confirmation */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {phase === "confirmed" && filledTrade ? (
            <ConfirmedPhase trade={filledTrade} />
          ) : (
            <EntryPhase
              ticker={ticker}
              side={side}
              setSide={setSide}
              quantity={quantity}
              price={price}
              grossValue={grossValue}
              fees={fees}
              tax={tax}
              totalCost={totalCost}
              phase={phase}
              errorMsg={errorMsg}
              inputRef={inputRef}
              onQtyDelta={handleQtyDelta}
              onQtyInput={handleQtyInput}
              onConfirm={handleConfirm}
            />
          )}
        </div>
      </div>
    </>
  );
}

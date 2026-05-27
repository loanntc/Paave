"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TradeAICard, type FilledTrade } from "@/components/paave/trade-ai-card";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BROKER_FEE_RATE = 0.0025; // 0.25%
const VSD_TAX_RATE = 0.001; // 0.1% on SELL — Circular 37/2016/TT-BTC

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Side = "BUY" | "SELL";
type Phase = "entry" | "submitting" | "confirmed" | "error";

interface PaperTradeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  /** Current last price from the stock detail — used as default limit price */
  currentPrice: number | null;
  stockName: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatVND(value: number): string {
  return (
    Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫"
  );
}

function calcFees(side: Side, grossValue: number): { fees: number; tax: number } {
  const fees = Math.round(grossValue * BROKER_FEE_RATE);
  const tax = side === "SELL" ? Math.round(grossValue * VSD_TAX_RATE) : 0;
  return { fees, tax };
}

// ---------------------------------------------------------------------------
// PaperTradeSheet
// ---------------------------------------------------------------------------
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

  // Reset when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setPhase("entry");
      setQuantity(100);
      setSide("BUY");
      setErrorMsg(null);
      setFilledTrade(null);
    }
  }, [isOpen]);

  // Focus quantity input when entry phase opens
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

  const handleQtyDelta = useCallback(
    (delta: number) => {
      setQuantity((q) => Math.max(100, q + delta));
    },
    [],
  );

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
            <p className="text-[12px] text-text-neo-tertiary">{ticker} · {stockName ?? ""}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full border border-border-neo bg-ink-violet-surface text-text-neo-tertiary transition-colors hover:text-text-neo-primary"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
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

// ---------------------------------------------------------------------------
// Entry phase
// ---------------------------------------------------------------------------
function EntryPhase({
  ticker,
  side,
  setSide,
  quantity,
  price,
  grossValue,
  fees,
  tax,
  totalCost,
  phase,
  errorMsg,
  inputRef,
  onQtyDelta,
  onQtyInput,
  onConfirm,
}: {
  ticker: string;
  side: Side;
  setSide: (s: Side) => void;
  quantity: number;
  price: number;
  grossValue: number;
  fees: number;
  tax: number;
  totalCost: number;
  phase: Phase;
  errorMsg: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onQtyDelta: (delta: number) => void;
  onQtyInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
}) {
  const isSubmitting = phase === "submitting";
  const canConfirm = price > 0 && quantity > 0 && !isSubmitting;

  return (
    <div className="px-4 pb-8 pt-4 space-y-5">
      {/* BUY / SELL toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-ink-violet-surface border border-border-neo p-1">
        {(["BUY", "SELL"] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              "rounded-xl py-2.5 text-[13px] font-bold uppercase tracking-[0.5px] transition-all",
              side === s
                ? s === "BUY"
                  ? "bg-positive/20 text-positive"
                  : "bg-negative/20 text-negative"
                : "text-text-neo-tertiary hover:text-text-neo-secondary",
            )}
          >
            {s === "BUY" ? "Mua" : "Bán"}
          </button>
        ))}
      </div>

      {/* Price (read-only — market price for paper trade MVP) */}
      <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.5px] text-text-neo-tertiary mb-0.5">
          Giá thị trường
        </p>
        <p className="font-display text-[20px] tabular-nums font-bold text-text-neo-primary">
          {price > 0 ? formatVND(price) : "—"}
        </p>
        <p className="text-[10px] text-text-neo-tertiary mt-0.5">
          Lệnh giả lập khớp ngay theo giá hiện tại
        </p>
      </div>

      {/* Quantity picker */}
      <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.5px] text-text-neo-tertiary mb-2">
          Số lượng (CP)
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQtyDelta(-100)}
            aria-label="Decrease quantity by 100"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border-neo bg-ink-violet-raised text-text-neo-secondary transition-colors hover:text-text-neo-primary active:scale-[0.95]"
          >
            <Minus className="size-4" strokeWidth={2.5} />
          </button>

          <input
            ref={inputRef}
            type="number"
            value={quantity}
            onChange={onQtyInput}
            min={100}
            step={100}
            inputMode="numeric"
            aria-label="Quantity"
            className="flex-1 bg-transparent text-center font-display text-[22px] tabular-nums font-bold text-text-neo-primary outline-none"
          />

          <button
            onClick={() => onQtyDelta(100)}
            aria-label="Increase quantity by 100"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border-neo bg-ink-violet-raised text-text-neo-secondary transition-colors hover:text-text-neo-primary active:scale-[0.95]"
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Fee summary */}
      <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-3 space-y-2">
        <SummaryRow label="Giá trị giao dịch" value={formatVND(grossValue)} />
        <SummaryRow label="Phí môi giới (0.25%)" value={formatVND(fees)} muted />
        {side === "SELL" && (
          <SummaryRow label="Thuế VSD (0.1%)" value={formatVND(tax)} muted />
        )}
        <div className="border-t border-border-neo-subtle pt-2">
          <SummaryRow
            label={side === "BUY" ? "Tổng chi" : "Thực nhận"}
            value={formatVND(totalCost)}
            bold
          />
        </div>
      </div>

      {/* Error */}
      {phase === "error" && errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-negative/10 border border-negative/30 px-3 py-2.5">
          <AlertCircle className="size-4 shrink-0 text-negative" strokeWidth={2} />
          <p className="text-[13px] text-negative">{errorMsg}</p>
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        disabled={!canConfirm}
        className={cn(
          "w-full rounded-2xl py-4 font-display text-[14px] font-bold uppercase tracking-[0.5px] transition-all active:scale-[0.98]",
          canConfirm
            ? side === "BUY"
              ? "bg-positive text-white"
              : "bg-negative text-white"
            : "bg-ink-violet-raised text-text-neo-tertiary",
          isSubmitting && "opacity-60",
        )}
      >
        {isSubmitting
          ? "Đang xử lý..."
          : side === "BUY"
          ? `Xác nhận MUA ${ticker}`
          : `Xác nhận BÁN ${ticker}`}
      </button>

      <p className="text-center text-[10px] text-text-neo-tertiary">
        Giao dịch giả lập · không liên quan tiền thật
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmed phase
// ---------------------------------------------------------------------------
function ConfirmedPhase({ trade }: { trade: FilledTrade }) {
  const sideLabel = trade.side === "BUY" ? "MUA" : "BÁN";
  const sideColor = trade.side === "BUY" ? "text-positive" : "text-negative";

  return (
    <div className="px-4 pb-8 pt-4 space-y-5">
      {/* Success banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-positive/30 bg-positive/10 px-4 py-3">
        <CheckCircle2 className="size-5 shrink-0 text-positive" strokeWidth={2} />
        <div>
          <p className="font-display text-[14px] font-bold text-positive">Lệnh đã khớp!</p>
          <p className="text-[12px] text-text-neo-secondary">
            <span className={cn("font-bold", sideColor)}>{sideLabel}</span>
            {" "}{trade.quantity.toLocaleString()} CP {trade.ticker}{" "}
            @ {formatVND(trade.price)}
          </p>
        </div>
      </div>

      {/* Trade details */}
      <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-3 space-y-2">
        <SummaryRow label="Giá trị giao dịch" value={formatVND(trade.grossValue)} />
        <SummaryRow label="Phí môi giới" value={formatVND(trade.fees)} muted />
        <SummaryRow
          label={trade.side === "BUY" ? "Tổng chi" : "Thực nhận"}
          value={formatVND(
            trade.side === "BUY"
              ? trade.grossValue + trade.fees
              : trade.grossValue - trade.fees,
          )}
          bold
        />
      </div>

      {/* AI Explanation — auto-fires on mount */}
      <TradeAICard trade={trade} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------
function SummaryRow({
  label,
  value,
  muted = false,
  bold = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "text-[12px]",
          muted ? "text-text-neo-tertiary" : "text-text-neo-secondary",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-display tabular-nums",
          bold ? "text-[15px] font-bold text-text-neo-primary" : "text-[13px] text-text-neo-secondary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

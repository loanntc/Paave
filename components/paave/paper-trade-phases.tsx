// EntryPhase and ConfirmedPhase — the two body states of PaperTradeSheet.
// Pure display; all calculated values (fees, tax, etc.) are passed as props.

import type { ChangeEvent, RefObject } from "react";
import { X as _X, CheckCircle2, AlertCircle, Minus, Plus } from "lucide-react";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TradeAICard, type FilledTrade } from "@/components/paave/trade-ai-card";

// Exported so PaperTradeSheet can share the same nominal types
export type Side = "BUY" | "SELL";
export type Phase = "entry" | "submitting" | "confirmed" | "error";
export type { FilledTrade };

// ---------------------------------------------------------------------------
// SummaryRow — shared between both phases
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
      <span className={cn("text-[12px]", muted ? "text-text-neo-tertiary" : "text-text-neo-secondary")}>
        {label}
      </span>
      <span
        className={cn(
          "font-display tabular-nums",
          bold
            ? "text-[15px] font-bold text-text-neo-primary"
            : "text-[13px] text-text-neo-secondary",
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EntryPhase — order entry form
// ---------------------------------------------------------------------------
interface EntryPhaseProps {
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
  inputRef: RefObject<HTMLInputElement | null>;
  onQtyDelta: (delta: number) => void;
  onQtyInput: (e: ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
}

export function EntryPhase({
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
}: EntryPhaseProps) {
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

      {/* Price — read-only (market price for paper trade MVP) */}
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

      {/* Confirm CTA */}
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
// ConfirmedPhase — success state with AI trade explanation
// ---------------------------------------------------------------------------
export function ConfirmedPhase({ trade }: { trade: FilledTrade }) {
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
        {trade.side === "SELL" && trade.tax > 0 && (
          <SummaryRow label="Thuế VSD (0.1%)" value={formatVND(trade.tax)} muted />
        )}
        <SummaryRow
          label={trade.side === "BUY" ? "Tổng chi" : "Thực nhận"}
          value={formatVND(
            trade.side === "BUY"
              ? trade.grossValue + trade.fees
              : trade.grossValue - trade.fees - trade.tax,
          )}
          bold
        />
      </div>

      {/* AI Explanation — auto-fires on mount */}
      <TradeAICard trade={trade} />
    </div>
  );
}

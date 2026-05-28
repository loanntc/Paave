"use client";

import { useEffect, useRef } from "react";
import { AICard } from "@/components/paave/ai-card";
import { useAIChat } from "@/lib/ai/use-ai-chat";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface FilledTrade {
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  fees: number;
  /** VSD tax charged on SELL side (0.1% per Circular 37/2016/TT-BTC). Zero for BUY. */
  tax: number;
  grossValue: number;
}

interface TradeAICardProps {
  trade: FilledTrade;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
/**
 * TradeAICard — auto-fires a post-trade analysis prompt on mount.
 * Appears inside the paper trade sheet after a fill is confirmed.
 * Implements the FR-AI-01 "post-trade explanation" trigger.
 */
export function TradeAICard({ trade, className }: TradeAICardProps) {
  const { messages, isLoading, error, sendMessage } = useAIChat({
    ticker: trade.ticker,
    language: "vi",
  });
  const triggered = useRef(false);

  // Auto-fire once on mount
  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const sideLabel = trade.side === "BUY" ? "MUA" : "BÁN";
    const prompt =
      `Tôi vừa thực hiện lệnh GIẢ LẬP: ${sideLabel} ${trade.quantity} cổ phiếu ` +
      `${trade.ticker} ở giá ${formatVND(trade.price)}/cp ` +
      `(tổng giá trị ${formatVND(trade.grossValue)}). ` +
      `Phân tích ngắn gọn 3 điểm: ` +
      `(1) Vùng giá vào này có hợp lý về kỹ thuật không? ` +
      `(2) Rủi ro chính cần theo dõi? ` +
      `(3) Nên đặt mục tiêu chốt lời / cắt lỗ ở đâu?`;

    sendMessage(prompt);
  }, [trade, sendMessage]);

  const assistantMsg = messages.find((m) => m.role === "assistant");
  const content = assistantMsg?.content ?? "";
  const isStreaming = assistantMsg?.isStreaming ?? false;

  // Loading skeleton
  if (isLoading && !content) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg-neo p-4",
          "bg-ink-violet-raised border border-border-neo animate-pulse",
          className,
        )}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, #B5E82F, #7F77DD, #FF8A5B)" }}
        />
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-lime-signal-400/40" />
          <div className="h-3 w-32 rounded bg-violet-deep-800/60" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-violet-deep-800/60" />
          <div className="h-3 w-4/5 rounded bg-violet-deep-800/60" />
          <div className="h-3 w-3/5 rounded bg-violet-deep-800/60" />
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <AICard title="Phân tích AI" className={className}>
        <p className="text-[13px] text-text-neo-tertiary">
          Phân tích tạm thời không khả dụng. Vui lòng thử lại sau.
        </p>
      </AICard>
    );
  }

  if (!content) return null;

  return (
    <AICard title={`Phân tích lệnh · ${trade.ticker}`} className={className}>
      <p className="text-[13px] leading-[1.7] text-text-neo-primary whitespace-pre-wrap">
        {content}
        {isStreaming && (
          <span className="inline-block w-[2px] h-[14px] bg-lime-signal-400 ml-0.5 animate-pulse align-middle" />
        )}
      </p>
    </AICard>
  );
}

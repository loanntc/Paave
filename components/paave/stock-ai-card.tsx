"use client";

import { useEffect, useRef, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { AICard } from "@/components/paave/ai-card";
import { useAIChat } from "@/lib/ai/use-ai-chat";
import { cn } from "@/lib/utils";

interface StockAICardProps {
  ticker: string;
  language?: "vi" | "ko" | "en";
  className?: string;
}

/**
 * StockAICard — auto-triggers AI analysis for a ticker on mount.
 * Implements FR-AI-01 contextual AI card: What happened / Why / What to watch.
 */
export function StockAICard({ ticker, language = "vi", className }: StockAICardProps) {
  const { messages, isLoading, error, sendMessage } = useAIChat({
    ticker,
    language,
  });
  const triggered = useRef(false);
  const [rating, setRating] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    const prompt =
      language === "vi"
        ? `Phân tích nhanh cổ phiếu ${ticker}. Trình bày 3 phần: (1) Diễn biến giá gần đây, (2) Nguyên nhân chính, (3) Điều cần theo dõi tiếp theo. Trả lời ngắn gọn, dễ hiểu cho nhà đầu tư trẻ.`
        : language === "ko"
          ? `${ticker} 주식을 분석해주세요. 3가지로 설명: (1) 최근 주가 동향, (2) 주요 원인, (3) 앞으로 주목할 점. 젊은 투자자에게 쉽게 설명해주세요.`
          : `Analyze ${ticker} stock. Cover 3 points: (1) Recent price action, (2) Key reasons, (3) What to watch next. Keep it concise for a young investor.`;

    sendMessage(prompt);
  }, [ticker, language, sendMessage]);

  const assistantMessage = messages.find((m) => m.role === "assistant");
  const content = assistantMessage?.content ?? "";
  const isStreaming = assistantMessage?.isStreaming ?? false;

  // Loading skeleton
  if (isLoading && !content) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg-neo p-4",
          "bg-ink-violet-raised border border-border-neo",
          className,
        )}
      >
        {/* tri-colour top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, #B5E82F, #7F77DD, #FF8A5B)" }}
        />
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-lime-signal-400/40 animate-pulse" />
          <div className="h-3 w-24 rounded bg-violet-deep-800/60 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-violet-deep-800/60 animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-violet-deep-800/60 animate-pulse" />
          <div className="h-3 w-3/5 rounded bg-violet-deep-800/60 animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state (per FRD: "Analysis temporarily unavailable.")
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
    <AICard title={`Phân tích AI · ${ticker}`} className={className}>
      {/* Streaming content */}
      <p className="text-[13px] leading-[1.7] text-text-neo-primary whitespace-pre-wrap">
        {content}
        {isStreaming && (
          <span className="inline-block w-[2px] h-[14px] bg-lime-signal-400 ml-0.5 animate-pulse align-middle" />
        )}
      </p>

      {/* Rating buttons — shown once streaming is done (FR-AI-01) */}
      {!isStreaming && (
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border-neo-subtle">
          <span className="text-[11px] text-text-neo-tertiary uppercase tracking-[0.5px]">
            Hữu ích không?
          </span>
          <button
            onClick={() => setRating("up")}
            aria-label="Hữu ích"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] transition-colors",
              rating === "up"
                ? "bg-lime-signal-400/20 text-lime-signal-400"
                : "bg-violet-deep-800/40 text-text-neo-tertiary hover:text-text-neo-secondary",
            )}
          >
            <ThumbsUp className="size-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={() => setRating("down")}
            aria-label="Không hữu ích"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] transition-colors",
              rating === "down"
                ? "bg-peach-streak-400/20 text-peach-streak-400"
                : "bg-violet-deep-800/40 text-text-neo-tertiary hover:text-text-neo-secondary",
            )}
          >
            <ThumbsDown className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      )}
    </AICard>
  );
}

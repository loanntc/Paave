"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatSheet } from "@/lib/ai/chat-context";
import { useAIChat, type AIMessage } from "@/lib/ai/use-ai-chat";

// ---------------------------------------------------------------------------
// Main sheet
// ---------------------------------------------------------------------------
export function AIChatSheet() {
  const { isOpen, context, close } = useChatSheet();
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat(context);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevTickerRef = useRef(context.ticker);

  // Clear history when the sheet is opened for a different ticker
  useEffect(() => {
    if (context.ticker !== prevTickerRef.current) {
      clearMessages();
      prevTickerRef.current = context.ticker;
    }
  }, [context.ticker, clearMessages]);

  // Focus input after slide-in animation completes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(timer);
    }
    setInput("");
  }, [isOpen]);

  // Scroll to latest message
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    sendMessage(trimmed);
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* ── Sheet panel ────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI Chat"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-[640px] flex-col",
          "rounded-t-[28px] border-t border-x border-border-neo bg-ink-violet-base",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full",
        )}
        style={{ height: "82dvh" }}
      >
        {/* Drag handle */}
        <div className="flex shrink-0 justify-center pb-1 pt-3" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-border-neo-subtle" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border-neo-subtle px-4 pb-3 pt-1">
          <div className="flex items-center gap-2">
            <span
              className="relative inline-grid h-5 w-5 shrink-0 place-items-center rounded-[4px]"
              style={{ background: "linear-gradient(135deg, #B5E82F, #7F77DD)" }}
              aria-hidden="true"
            >
              <span className="text-[11px] text-white">✦</span>
            </span>
            <span className="font-display text-[14px] font-bold text-text-neo-primary">
              {context.ticker ? `AI · ${context.ticker}` : "AI Assistant"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                aria-label="New chat"
                title="New chat"
                className="grid h-8 w-8 place-items-center rounded-full text-text-neo-tertiary transition-colors hover:text-text-neo-secondary"
              >
                <Plus className="size-4" strokeWidth={2} />
              </button>
            )}
            <button
              onClick={close}
              aria-label="Close"
              className="grid size-8 place-items-center rounded-full border border-border-neo bg-ink-violet-surface text-text-neo-tertiary transition-colors hover:text-text-neo-primary"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain">
          {messages.length === 0 && (
            <EmptyState ticker={context.ticker} onSuggest={sendMessage} />
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-border-neo-subtle bg-ink-violet-base px-4 pb-8 pt-3">
          <div className="flex items-end gap-2 rounded-2xl border border-border-neo bg-ink-violet-surface px-3 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={
                context.ticker
                  ? `Hỏi thêm về ${context.ticker}...`
                  : "Hỏi về thị trường, cổ phiếu, danh mục..."
              }
              className="flex-1 resize-none bg-transparent text-[14px] leading-[1.5] text-text-neo-primary outline-none placeholder:text-text-neo-tertiary"
              style={{ minHeight: "22px", maxHeight: "120px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send"
              className={cn(
                "mb-0.5 grid size-8 shrink-0 place-items-center rounded-xl transition-all active:scale-[0.95]",
                input.trim() && !isLoading
                  ? "bg-lime-signal-400 text-ink-violet-base"
                  : "bg-violet-deep-800/50 text-text-neo-tertiary",
              )}
            >
              <Send className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-text-neo-tertiary">
            Chỉ dành cho học tập · không phải tư vấn đầu tư
          </p>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Empty state with suggested prompts
// ---------------------------------------------------------------------------
function EmptyState({
  ticker,
  onSuggest,
}: {
  ticker?: string;
  onSuggest: (prompt: string) => void;
}) {
  const suggestions = ticker
    ? [
        `Phân tích kỹ thuật ${ticker} hôm nay?`,
        `Lý do giá ${ticker} biến động gần đây?`,
        `Tin tức quan trọng nào ảnh hưởng tới ${ticker}?`,
      ]
    : [
        "Thị trường VN hôm nay ra sao?",
        "Cổ phiếu nào đang được chú ý nhất?",
        "VN-Index tuần này có xu hướng gì?",
      ];

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <div
        className="inline-grid h-14 w-14 place-items-center rounded-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(181,232,47,0.15), rgba(127,119,221,0.15))",
        }}
      >
        <span className="text-2xl">✦</span>
      </div>

      <div>
        <p className="font-display text-[15px] font-bold text-text-neo-primary">
          {ticker ? `Hỏi AI về ${ticker}` : "Hỏi AI về thị trường"}
        </p>
        <p className="mt-1 text-[13px] text-text-neo-secondary">
          Đặt câu hỏi hoặc chọn gợi ý bên dưới
        </p>
      </div>

      <div className="flex w-full max-w-[320px] flex-col gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="rounded-xl border border-border-neo bg-ink-violet-surface px-4 py-2.5 text-left text-[13px] text-text-neo-secondary transition-colors hover:border-lime-signal-400/40 hover:text-text-neo-primary active:scale-[0.98]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------
function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-violet-deep-800 px-4 py-2.5">
          <p className="text-[14px] leading-[1.6] text-text-neo-primary whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      {/* AI avatar */}
      <div
        className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[5px]"
        style={{ background: "linear-gradient(135deg, #B5E82F, #7F77DD)" }}
        aria-hidden="true"
      >
        <span className="text-[10px] text-white">✦</span>
      </div>

      <div className="min-w-0 flex-1">
        {message.content ? (
          <p className="text-[14px] leading-[1.7] text-text-neo-primary whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="ml-0.5 inline-block h-[14px] w-[2px] animate-pulse align-middle bg-lime-signal-400" />
            )}
          </p>
        ) : message.isStreaming ? (
          /* Typing dots while waiting for first token */
          <div className="flex items-center gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-text-neo-tertiary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

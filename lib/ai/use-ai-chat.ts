"use client";

import { useState, useCallback, useRef } from "react";
import type { SupportedLanguage } from "./system-prompt";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export interface AIChatContext {
  /** Stock ticker the chat is anchored to, e.g. "VIC" */
  ticker?: string;
  /** Authenticated user's UUID — enables portfolio queries */
  userId?: string;
  /** Language for AI responses */
  language?: SupportedLanguage;
}

/**
 * useAIChat — React hook for streaming AI chat.
 *
 * Mirrors Vibe-Trading's SSE session model, adapted for Next.js App Router.
 * Connects to POST /api/ai/chat and reads the SSE stream.
 *
 * Usage:
 *   const { messages, isLoading, error, sendMessage, clearMessages } =
 *     useAIChat({ ticker: "VIC", language: "vi" });
 */
export function useAIChat(context?: AIChatContext) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Cancel any in-flight request
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      const userMsgId = crypto.randomUUID();
      const assistantMsgId = crypto.randomUUID();

      setError(null);
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content },
        { id: assistantMsgId, role: "assistant", content: "", isStreaming: true },
      ]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abort.signal,
          body: JSON.stringify({
            message: content,
            ticker: context?.ticker,
            userId: context?.userId,
            language: context?.language ?? "vi",
          }),
        });

        if (!response.ok) {
          throw new Error(`Request failed: HTTP ${response.status}`);
        }

        const body = response.body;
        if (!body) throw new Error("Empty response body");

        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE lines end with \n\n — process complete events
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            let event: Record<string, unknown>;
            try {
              event = JSON.parse(line.slice(6));
            } catch {
              continue;
            }

            if (event.type === "text" && typeof event.content === "string") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + event.content }
                    : m,
                ),
              );
            }

            if (event.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
                ),
              );
            }

            if (event.type === "error") {
              throw new Error(
                typeof event.message === "string"
                  ? event.message
                  : "AI service error",
              );
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        const errorMsg =
          err instanceof Error ? err.message : "Analysis temporarily unavailable.";
        setError(errorMsg);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: "Phân tích tạm thời không khả dụng. Vui lòng thử lại.", isStreaming: false }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [context, isLoading],
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}

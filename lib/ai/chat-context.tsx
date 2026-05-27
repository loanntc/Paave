"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AIChatContext } from "./use-ai-chat";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatSheetState {
  isOpen: boolean;
  context: AIChatContext;
  /** Open the sheet, optionally pre-seeded with a stock/portfolio context. */
  open: (ctx?: AIChatContext) => void;
  close: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ChatSheetContext = createContext<ChatSheetState | null>(null);

// ---------------------------------------------------------------------------
// Provider — place once at the (app) layout level
// ---------------------------------------------------------------------------
export function ChatSheetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<AIChatContext>({ language: "vi" });

  const open = useCallback((ctx?: AIChatContext) => {
    if (ctx) setContext({ language: "vi", ...ctx });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ChatSheetContext.Provider value={{ isOpen, context, open, close }}>
      {children}
    </ChatSheetContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useChatSheet(): ChatSheetState {
  const ctx = useContext(ChatSheetContext);
  if (!ctx) {
    throw new Error("useChatSheet must be used inside <ChatSheetProvider>");
  }
  return ctx;
}

import { ChatSheetProvider } from "@/lib/ai/chat-context";
import { AIChatSheet } from "@/components/paave/ai-chat-sheet";
import { AppBottomNav } from "@/components/paave/app-bottom-nav";

/**
 * Layout for all authenticated app pages.
 *
 * Mounts:
 *  - ChatSheetProvider  → useAIChat / useChatSheet available on every page
 *  - AIChatSheet        → global slide-up AI conversation panel
 *  - AppBottomNav       → fixed bottom navigation (Home · Portfolio · …)
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatSheetProvider>
      {children}
      <AIChatSheet />
      <AppBottomNav />
    </ChatSheetProvider>
  );
}

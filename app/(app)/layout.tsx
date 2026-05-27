import { ChatSheetProvider } from "@/lib/ai/chat-context";
import { AIChatSheet } from "@/components/paave/ai-chat-sheet";

/**
 * Layout for all authenticated app pages.
 *
 * Mounts the global ChatSheetProvider + AIChatSheet once so every page
 * under (app)/ can call useChatSheet() to open the AI conversation panel.
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
    </ChatSheetProvider>
  );
}

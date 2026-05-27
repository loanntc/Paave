import { NextRequest } from "next/server";
import { runAgent } from "@/lib/ai/agent";
import type { AgentContext, SupportedLanguage } from "@/lib/ai/system-prompt";
import { createCookieClient } from "@/lib/supabase/server";

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["vi", "ko", "en"];

function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

/**
 * POST /api/ai/chat
 *
 * Requires an authenticated session (cookie-based). Returns 401 otherwise.
 *
 * Body:
 *   message   string   — the user's question (required)
 *   ticker    string?  — stock context, e.g. "VIC"
 *   language  string?  — "vi" | "ko" | "en" (default: "vi")
 *
 * Returns:
 *   text/event-stream with SSE events:
 *     { type: "text",  content: "..." }  — text chunk
 *     { type: "done"               }     — stream complete
 *     { type: "error", message: "..." }  — error
 */
export async function POST(req: NextRequest) {
  const supabase = await createCookieClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return new Response(
      JSON.stringify({ error: "message is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const language: SupportedLanguage = isSupportedLanguage(body.language)
    ? body.language
    : "vi";

  const ctx: AgentContext = {
    language,
    ticker: typeof body.ticker === "string" ? body.ticker.toUpperCase() : undefined,
    userId: user.id, // verified from session — body.userId is intentionally ignored
  };

  const encoder = new TextEncoder();

  function sseEvent(payload: Record<string, unknown>): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await runAgent(message, ctx, (text) => {
          controller.enqueue(sseEvent({ type: "text", content: text }));
        });
        controller.enqueue(sseEvent({ type: "done" }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        controller.enqueue(sseEvent({ type: "error", message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",        // disable Nginx buffering
      Connection: "keep-alive",
    },
  });
}

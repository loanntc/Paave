import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { TOOL_SPECS, executeTool } from "@/lib/ai/tools";
import { buildSystemPrompt, type AgentContext } from "@/lib/ai/system-prompt";
import type { ToolContext } from "@/lib/ai/tools/types";

// Using Sonnet for financial reasoning + multi-step tool use (per performance.md §1).
// Benchmarked suitable for summarisation, explanation, and moderate reasoning.
const AI_MODEL = "claude-sonnet-4-5";

// Safety cap: prevents infinite loops if the model keeps requesting tools
const MAX_TOOL_ITERATIONS = 5;

// Token budget: keeps responses focused and within cost cap
const MAX_TOKENS = 1024;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Run the Paave AI agent loop.
 *
 * Pattern mirrors Vibe-Trading's ReAct loop:
 *   1. Send user message + tool definitions to Claude
 *   2. If Claude calls tools → execute in parallel → feed results back
 *   3. Repeat until stop_reason is "end_turn" (no more tool calls)
 *   4. Stream the final text response to the caller via onDelta
 *
 * @param userMessage  - The user's raw input string
 * @param ctx          - Agent context: language, optional ticker, optional userId
 * @param onDelta      - Callback invoked with each text chunk as it arrives
 */
export async function runAgent(
  userMessage: string,
  ctx: AgentContext,
  onDelta: (text: string) => void,
): Promise<void> {
  const systemPrompt = buildSystemPrompt(ctx);
  const toolCtx: ToolContext = {
    serviceClient: createServiceClient(),
    userId: ctx.userId,
  };

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  // --- Tool calling loop (non-streaming, fast — tool calls resolve in <500ms) ---
  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: TOOL_SPECS,
      messages,
    });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    if (response.stop_reason !== "tool_use" || toolUseBlocks.length === 0) {
      // No more tool calls — this is the final response, stream the text
      for (const block of response.content) {
        if (block.type === "text") {
          onDelta(block.text);
        }
      }
      return;
    }

    // There are tool calls — add the assistant turn to history
    messages.push({ role: "assistant", content: response.content });

    // Execute all tool calls in parallel (read-only tools are safe to parallelise)
    const toolResults = await Promise.all(
      toolUseBlocks.map(async (toolUse) => {
        const result = await executeTool(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          toolCtx,
        );
        return {
          type: "tool_result" as const,
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        };
      }),
    );

    // Feed tool results back as a user turn (Anthropic API convention)
    messages.push({ role: "user", content: toolResults });
  }

  // Reached MAX_TOOL_ITERATIONS without a final answer — ask for a wrap-up
  messages.push({
    role: "user",
    content: "Please summarise your findings so far.",
  });

  const finalResponse = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    tools: [],
    messages,
  });

  for (const block of finalResponse.content) {
    if (block.type === "text") {
      onDelta(block.text);
    }
  }
}

import type Anthropic from "@anthropic-ai/sdk";
import type { ToolContext, ToolDefinition } from "./types";

import { getStockQuoteTool } from "./get-stock-quote";
import { getStockBarsTool } from "./get-stock-bars";
import { getStockNewsTool } from "./get-stock-news";
import { getStockFundamentalsTool } from "./get-stock-fundamentals";
import { getUserPortfolioTool } from "./get-user-portfolio";
import { getTradeAnalyticsTool } from "./get-trade-analytics";

// ---------------------------------------------------------------------------
// Registry — add new tools here
// ---------------------------------------------------------------------------
const TOOL_REGISTRY: ToolDefinition[] = [
  getStockQuoteTool,
  getStockBarsTool,
  getStockNewsTool,
  getStockFundamentalsTool,
  getUserPortfolioTool,
  getTradeAnalyticsTool,
];

const toolMap = new Map<string, ToolDefinition>(
  TOOL_REGISTRY.map((t) => [t.spec.name, t]),
);

/** Anthropic-format tool specs to pass to messages.create() */
export const TOOL_SPECS: Anthropic.Tool[] = TOOL_REGISTRY.map((t) => t.spec);

/**
 * Execute a tool by name.
 * Returns a JSON-serialisable result or an error object.
 */
export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext,
): Promise<unknown> {
  const tool = toolMap.get(name);
  if (!tool) {
    return { error: `Unknown tool: ${name}` };
  }
  try {
    return await tool.execute(input, ctx);
  } catch (err) {
    return {
      error: `Tool ${name} failed`,
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

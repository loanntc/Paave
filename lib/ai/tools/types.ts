import type { SupabaseClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";

export interface ToolContext {
  /** Service-role Supabase client — for public market data (bypasses RLS) */
  serviceClient: SupabaseClient;
  /** Authenticated user ID, if the request is from a signed-in user */
  userId?: string;
}

export interface ToolDefinition {
  /** Anthropic tool spec — sent directly to the Claude API */
  spec: Anthropic.Tool;
  /** Execute the tool and return a JSON-serialisable result */
  execute: (
    input: Record<string, unknown>,
    ctx: ToolContext,
  ) => Promise<unknown>;
}

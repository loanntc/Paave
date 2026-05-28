import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Browser-side Supabase client — anon key, session managed by the SDK.
//
// Rules:
//  ✅ Use in "use client" components and React hooks.
//  ❌ Never use in API routes, middleware, or Server Components
//     — those must use lib/supabase/server.ts instead (cookie-based session).
//
// The singleton pattern here avoids creating a new client on every render,
// which would waste WebSocket connections and auth refresh cycles.
// ---------------------------------------------------------------------------
let _client: SupabaseClient | null = null;

/**
 * Returns the shared browser-side Supabase client.
 * Creates it on first call; subsequent calls return the same instance.
 *
 * @example
 *   const db = getBrowserClient();
 *   const { data } = await db.from("symbol_quotes_latest").select(...);
 */
export function getBrowserClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return _client;
}

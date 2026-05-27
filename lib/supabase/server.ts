import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

/**
 * Service-role Supabase client — bypasses RLS.
 * Use ONLY in server-side API routes (never in client components).
 * Safe for market data reads. Never expose to the browser.
 */
export function createServiceClient() {
  return createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );
}

/**
 * Anon Supabase client — respects RLS.
 * Pass the user's access token to scope queries to that user's own rows.
 */
export function createAnonClient(accessToken?: string) {
  const client = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false } },
  );
  if (accessToken) {
    // Fire-and-forget — setSession is async but the client stores it synchronously
    client.auth.setSession({ access_token: accessToken, refresh_token: "" });
  }
  return client;
}

/**
 * Cookie-based Supabase client for Route Handlers and Server Components.
 * Reads the session from the request cookies — use this to verify auth server-side.
 * Call `supabase.auth.getUser()` after creation to get the authenticated user.
 */
export async function createCookieClient() {
  const cookieStore = await cookies();
  return createServerClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Ignored when called from a read-only context (e.g. Server Component)
          }
        },
      },
    },
  );
}

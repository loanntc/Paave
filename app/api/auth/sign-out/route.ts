import { NextResponse } from "next/server";
import { createCookieClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/sign-out
 *
 * Signs the user out server-side (clears the Supabase session cookie) and
 * redirects to the sign-in page. Always returns 303 regardless of whether
 * the user was actually signed in — this makes the handler idempotent.
 */
export async function POST() {
  const supabase = await createCookieClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL("/sign-in", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    { status: 303 },
  );
}

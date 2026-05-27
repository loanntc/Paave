import { NextResponse } from "next/server";
import { createCookieClient } from "@/lib/supabase/server";
import { AGE_GATE_COOKIE } from "@/lib/age-gate";

/**
 * POST /api/auth/sign-out
 *
 * Signs the user out server-side (clears the Supabase session cookie) and
 * redirects to the sign-in page. Always returns 303 regardless of whether
 * the user was actually signed in — this makes the handler idempotent.
 *
 * Security: also clears paave_age_gate so the next user on this browser
 * cannot inherit a previous user's verified age status.
 */
export async function POST() {
  const supabase = await createCookieClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(
    new URL("/sign-in", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    { status: 303 },
  );

  // Clear the age-gate cookie so the next sign-in starts fresh
  response.cookies.delete(AGE_GATE_COOKIE);

  return response;
}

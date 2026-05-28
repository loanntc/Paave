import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AGE_GATE_COOKIE } from "@/lib/age-gate";

// ---------------------------------------------------------------------------
// Paave middleware — authentication + age gate enforcement
//
// Two concerns handled here:
//   1. Supabase session refresh (required for SSR auth to work correctly).
//   2. Age gate: routes under PROTECTED_PREFIXES require a valid paave_age_gate
//      cookie set by /api/auth/age-verify during onboarding.
//
// Access mode contract (BRD hard constraint):
//   FULL_ACCESS  — 18+ users, all features
//   LEARN_MODE   — 16–17 year olds, paper trading only (social features hidden)
//   BLOCKED      — under-16 users, no access to the app
// ---------------------------------------------------------------------------

/** App routes that require auth + age verification. */
const PROTECTED_PREFIXES = [
  "/home",
  "/grow",
  "/portfolio",
  "/discover",
  "/profile",
  "/stock",
];

/**
 * Auth-only routes — authenticated + age-verified users should be redirected
 * to /home rather than seeing these screens again.
 */
const AUTH_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/welcome",
  "/splash",
];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a pass-through response that Supabase can mutate (cookie refresh)
  let response = NextResponse.next({ request });

  // ── Supabase session refresh ─────────────────────────────────────────────
  // This is required so the session token stays valid across RSC/API calls.
  // See: https://supabase.com/docs/guides/auth/server-side/nextjs
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options ?? {}),
          );
        },
      },
    },
  );

  // getUser() is safe to call here — it validates against Supabase Auth
  // and triggers session token refresh if the access token has expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ageGate = request.cookies.get(AGE_GATE_COOKIE)?.value;

  // ── Age gate cookie re-hydration ─────────────────────────────────────────
  // When a returning user is authenticated but the cookie has expired (e.g.
  // after a browser restart for a long-lived session), attempt to restore it
  // from the access_mode stored in user_metadata during the original age-verify
  // flow. This avoids funnelling returning users back through /onboarding/age.
  if (!ageGate && user) {
    const storedMode = user.user_metadata?.access_mode as string | undefined;
    if (storedMode === "FULL_ACCESS" || storedMode === "LEARN_MODE" || storedMode === "BLOCKED") {
      ageGate = storedMode;
      const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
      response.cookies.set(AGE_GATE_COOKIE, storedMode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: ONE_YEAR_SECONDS,
      });
    }
  }

  const isAgeVerified = ageGate === "FULL_ACCESS" || ageGate === "LEARN_MODE";

  // ── Protected app routes ─────────────────────────────────────────────────
  if (startsWithAny(pathname, PROTECTED_PREFIXES)) {
    // 1. Must be signed in
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // 2. Must have completed age verification during onboarding
    if (!ageGate) {
      // Pass the intended destination so age-view can send the user straight
      // back here instead of starting the full first-time onboarding flow.
      const url = new URL("/onboarding/age", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // 3. Under-16 users are blocked from all app routes
    if (ageGate === "BLOCKED") {
      const url = new URL("/onboarding/age", request.url);
      url.searchParams.set("blocked", "true");
      return NextResponse.redirect(url);
    }
  }

  // ── Auth-only routes ─────────────────────────────────────────────────────
  // Redirect users who are already signed in and age-verified away from
  // sign-in / splash screens (avoids infinite loops through onboarding).
  if (startsWithAny(pathname, AUTH_PREFIXES) && user && isAgeVerified) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all paths EXCEPT:
     * - _next/static    (Next.js static assets)
     * - _next/image     (Next.js image optimization)
     * - favicon.ico
     * - Image files (svg, png, jpg, jpeg, gif, webp)
     *
     * The API routes (/api/*) are intentionally included so the middleware
     * can refresh the Supabase session token on every server request.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

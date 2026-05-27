import { NextResponse } from "next/server";
import { calculateAge, getAccessMode, AGE_GATE_COOKIE } from "@/lib/age-gate";
import { createCookieClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// POST /api/auth/age-verify
//
// Verifies the user's date of birth, determines the access mode, and sets
// the httpOnly `paave_age_gate` cookie that middleware enforces on every
// protected route.
//
// Security notes:
// - Caller must be authenticated (Supabase session cookie required).
// - The age-gate cookie is httpOnly so it cannot be forged from client JS.
// - The age computation runs server-side to prevent client-side bypass.
//
// TODO: When the DB migration for user profiles is approved and run, persist
//       DOB to the `profiles` table here so the cookie can be re-hydrated
//       server-side on every new session (instead of expiring with the session).
// ---------------------------------------------------------------------------

interface AgeVerifyBody {
  dd: string;
  mm: string;
  yyyy: string;
}

function isAgeVerifyBody(v: unknown): v is AgeVerifyBody {
  return (
    typeof v === "object" &&
    v !== null &&
    "dd" in v &&
    "mm" in v &&
    "yyyy" in v &&
    typeof (v as Record<string, unknown>).dd === "string" &&
    typeof (v as Record<string, unknown>).mm === "string" &&
    typeof (v as Record<string, unknown>).yyyy === "string"
  );
}

export async function POST(request: Request) {
  // Authenticate the caller — user must be signed in
  const supabase = await createCookieClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isAgeVerifyBody(body)) {
    return NextResponse.json(
      { error: "Request body must include string fields: dd, mm, yyyy" },
      { status: 400 },
    );
  }

  const { dd, mm, yyyy } = body;

  // Server-side age calculation — authoritative, not bypassable from the client
  const age = calculateAge(dd, mm, yyyy);
  if (age === null) {
    return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
  }

  const accessMode = getAccessMode(age);

  // Set the httpOnly age-gate cookie
  const responseBody = { accessMode, age };
  const response = NextResponse.json(responseBody);

  response.cookies.set(AGE_GATE_COOKIE, accessMode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    // Session-scoped: expires when the browser closes.
    // Once the DOB is persisted to the DB, this should become a permanent cookie
    // set from the session-refresh path so it survives across devices.
  });

  return response;
}

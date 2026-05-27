import { NextResponse } from "next/server";
import { calculateAge, getAccessMode, AGE_GATE_COOKIE } from "@/lib/age-gate";
import { createCookieClient, createServiceClient } from "@/lib/supabase/server";

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

  // Persist DOB + access mode to user_metadata so the cookie can be re-hydrated
  // server-side on every new session (middleware reads this if the cookie is absent).
  // Uses the service client so the update doesn't require a round-trip back to the
  // browser — the user's session was already verified above.
  try {
    const admin = createServiceClient();
    const dob = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { dob, access_mode: accessMode },
    });
  } catch {
    // Best-effort: the cookie is still set below. The failure only affects
    // whether the gate can be re-hydrated on future sessions.
  }

  // Set the httpOnly age-gate cookie
  const responseBody = { accessMode, age };
  const response = NextResponse.json(responseBody);

  // Set as a long-lived cookie so it survives browser restarts.
  // The server-side middleware will re-set this from user_metadata if it expires
  // and the user returns while still authenticated.
  const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
  response.cookies.set(AGE_GATE_COOKIE, accessMode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  return response;
}

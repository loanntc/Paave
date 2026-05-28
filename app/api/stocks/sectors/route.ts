import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// GET /api/stocks/sectors
//
// Returns the distinct non-null sector values from the symbols table,
// sorted alphabetically. Used to populate the sector filter chips on the
// Discover page.
//
// Public endpoint — no auth required (sector names are public).
// Cached for 1 hour (sectors change very rarely).
// ---------------------------------------------------------------------------

export const revalidate = 3600; // ISR: re-validate at most once per hour

export async function GET() {
  const db = createServiceClient();

  // Fetch sector column for all symbols. The VN market has ~1700 listed
  // symbols, so this is a small payload (one short string per row).
  const { data, error } = await db
    .from("symbols")
    .select("sector")
    .not("sector", "is", null)
    .limit(2000);

  if (error) {
    return NextResponse.json({ sectors: [] }, { status: 200 });
  }

  // Deduplicate and sort client-side
  const sectors = [
    ...new Set(
      (data ?? [])
        .map((r) => (r.sector as string | null)?.trim())
        .filter((s): s is string => Boolean(s)),
    ),
  ].sort((a, b) => a.localeCompare(b, "vi"));

  return NextResponse.json(
    { sectors },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

// ---------------------------------------------------------------------------
// Age Gate — hard constraint from BRD + CLAUDE.md:
//   Under 16 = BLOCKED, 16–17 = LEARN_MODE (paper trading only), 18+ = FULL_ACCESS
//
// These are pure functions with no side-effects so they are safe to import in
// both server (middleware, API routes) and client (age-view.tsx) contexts.
// ---------------------------------------------------------------------------

/** Minimum age required to use Paave. Users below this age are blocked entirely. */
export const MINIMUM_AGE = 16;

/**
 * Users at this age or below (but at or above MINIMUM_AGE) are in LEARN_MODE:
 * paper trading only, no social/community/leaderboard features.
 */
export const LEARN_MODE_MAX_AGE = 17;

/**
 * Name of the httpOnly cookie set by /api/auth/age-verify and read by middleware.
 * Never write to this cookie from client-side JS — always via the API route.
 */
export const AGE_GATE_COOKIE = "paave_age_gate" as const;

export type AccessMode = "FULL_ACCESS" | "LEARN_MODE" | "BLOCKED";

/**
 * Calculate a user's exact age from DD / MM / YYYY string inputs.
 *
 * Returns `null` when:
 * - Any field is not a valid number
 * - The year is not exactly 4 digits
 * - Month is outside 1–12
 * - Day is outside 1–31 (or impossible for the given month/year, e.g. Feb 30)
 * - Year is in the future (birthdate cannot be in the future)
 *
 * The calculation accounts for whether the user's birthday has already passed
 * this calendar year, so the result is the user's age today.
 */
export function calculateAge(dd: string, mm: string, yyyy: string): number | null {
  if (yyyy.length !== 4) return null;

  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const today = new Date();
  if (year > today.getFullYear()) return null;

  // Construct and validate the date — catches impossible dates like Feb 30
  const dob = new Date(year, month - 1, day);
  if (dob.getMonth() !== month - 1 || dob.getDate() !== day) return null;

  let age = today.getFullYear() - dob.getFullYear();

  // Subtract 1 if the birthday hasn't occurred yet this year
  const birthdayPassedThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!birthdayPassedThisYear) age -= 1;

  return age;
}

/**
 * Determine the Paave access mode for a user of the given age.
 * The age parameter must come from a trusted source (calculateAge or the DB).
 */
export function getAccessMode(age: number): AccessMode {
  if (age < MINIMUM_AGE) return "BLOCKED";
  if (age <= LEARN_MODE_MAX_AGE) return "LEARN_MODE";
  return "FULL_ACCESS";
}

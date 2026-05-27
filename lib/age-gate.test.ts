// ---------------------------------------------------------------------------
// Tests for age-gate utilities (T-1: business logic tests are mandatory)
// Covers: calculateAge edge cases, getAccessMode boundaries, constant values
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateAge,
  getAccessMode,
  MINIMUM_AGE,
  LEARN_MODE_MAX_AGE,
} from "./age-gate";

// Fix "today" to 2026-05-27 for deterministic age calculations
const FIXED_TODAY = new Date("2026-05-27T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// calculateAge
// ---------------------------------------------------------------------------

describe("calculateAge", () => {
  // ── Invalid / incomplete inputs ──────────────────────────────────────────

  it("returns null when year is fewer than 4 digits", () => {
    expect(calculateAge("01", "01", "200")).toBeNull();
    expect(calculateAge("01", "01", "20")).toBeNull();
    expect(calculateAge("01", "01", "")).toBeNull();
  });

  it("returns null when year is more than 4 digits", () => {
    expect(calculateAge("01", "01", "20001")).toBeNull();
  });

  it("returns null when month is out of range", () => {
    expect(calculateAge("01", "00", "2000")).toBeNull();
    expect(calculateAge("01", "13", "2000")).toBeNull();
  });

  it("returns null when day is out of range", () => {
    expect(calculateAge("00", "01", "2000")).toBeNull();
    expect(calculateAge("32", "01", "2000")).toBeNull();
  });

  it("returns null for impossible calendar dates (Feb 30)", () => {
    expect(calculateAge("30", "02", "2000")).toBeNull();
  });

  it("returns null for impossible calendar dates (Feb 29 on non-leap year)", () => {
    expect(calculateAge("29", "02", "2001")).toBeNull();
  });

  it("accepts Feb 29 on a leap year", () => {
    // 2000-02-29 is valid; age in 2026 would be 26
    expect(calculateAge("29", "02", "2000")).toBe(26);
  });

  it("returns null when year is in the future", () => {
    expect(calculateAge("01", "01", "2030")).toBeNull();
  });

  it("returns null when non-numeric characters appear", () => {
    expect(calculateAge("ab", "01", "2000")).toBeNull();
    expect(calculateAge("01", "ab", "2000")).toBeNull();
    expect(calculateAge("01", "01", "abcd")).toBeNull();
  });

  // ── Correct age calculation ──────────────────────────────────────────────

  it("calculates age correctly when birthday has already passed this year", () => {
    // Born 2008-01-15 — birthday (Jan 15) is before today (May 27)
    expect(calculateAge("15", "01", "2008")).toBe(18);
  });

  it("calculates age correctly when birthday has not yet passed this year", () => {
    // Born 2008-06-01 — birthday (Jun 1) is after today (May 27)
    expect(calculateAge("01", "06", "2008")).toBe(17);
  });

  it("calculates age correctly on the exact birthday", () => {
    // Born 2008-05-27 — today is their 18th birthday
    expect(calculateAge("27", "05", "2008")).toBe(18);
  });

  it("returns 15 for someone born in late 2010", () => {
    // Born 2010-12-01 — not yet 16 in May 2026
    expect(calculateAge("01", "12", "2010")).toBe(15);
  });

  it("returns 16 for someone born in early 2010", () => {
    // Born 2010-01-01 — turned 16 in January 2026
    expect(calculateAge("01", "01", "2010")).toBe(16);
  });

  it("returns 17 for someone born in late 2008", () => {
    // Born 2008-06-01 — hasn't turned 18 yet
    expect(calculateAge("01", "06", "2008")).toBe(17);
  });

  it("returns 0 for someone born this year before today", () => {
    // Born 2026-01-01 — infant, age 0
    expect(calculateAge("01", "01", "2026")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getAccessMode
// ---------------------------------------------------------------------------

describe("getAccessMode", () => {
  it("returns BLOCKED for ages below the minimum (0 through 15)", () => {
    for (let age = 0; age < MINIMUM_AGE; age++) {
      expect(getAccessMode(age), `age ${age}`).toBe("BLOCKED");
    }
  });

  it("returns LEARN_MODE for age exactly equal to MINIMUM_AGE (16)", () => {
    expect(getAccessMode(MINIMUM_AGE)).toBe("LEARN_MODE");
  });

  it("returns LEARN_MODE for age exactly equal to LEARN_MODE_MAX_AGE (17)", () => {
    expect(getAccessMode(LEARN_MODE_MAX_AGE)).toBe("LEARN_MODE");
  });

  it("returns FULL_ACCESS for age one above LEARN_MODE_MAX_AGE (18)", () => {
    expect(getAccessMode(LEARN_MODE_MAX_AGE + 1)).toBe("FULL_ACCESS");
  });

  it("returns FULL_ACCESS for all ages from 18 upward", () => {
    [18, 25, 30, 50, 100].forEach((age) => {
      expect(getAccessMode(age), `age ${age}`).toBe("FULL_ACCESS");
    });
  });

  it("reflects the published MINIMUM_AGE and LEARN_MODE_MAX_AGE constants", () => {
    // Boundary confirmation — these must stay in sync with the constants
    expect(getAccessMode(MINIMUM_AGE - 1)).toBe("BLOCKED");
    expect(getAccessMode(MINIMUM_AGE)).toBe("LEARN_MODE");
    expect(getAccessMode(LEARN_MODE_MAX_AGE)).toBe("LEARN_MODE");
    expect(getAccessMode(LEARN_MODE_MAX_AGE + 1)).toBe("FULL_ACCESS");
  });
});

// ---------------------------------------------------------------------------
// Constant sanity checks
// ---------------------------------------------------------------------------

describe("age gate constants", () => {
  it("MINIMUM_AGE is 16", () => {
    expect(MINIMUM_AGE).toBe(16);
  });

  it("LEARN_MODE_MAX_AGE is 17", () => {
    expect(LEARN_MODE_MAX_AGE).toBe(17);
  });

  it("LEARN_MODE_MAX_AGE is exactly one year above MINIMUM_AGE", () => {
    expect(LEARN_MODE_MAX_AGE).toBe(MINIMUM_AGE + 1);
  });
});

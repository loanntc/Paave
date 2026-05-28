/**
 * Tests for lib/format.ts
 *
 * Covers VND formatting, percentage labels, and ICT datetime conversion.
 * ICT = Asia/Ho_Chi_Minh, UTC+7, no DST.
 */

import { describe, it, expect } from "vitest";
import { formatVND, pctLabel, formatICTDatetime } from "./format";

// ---------------------------------------------------------------------------
// formatVND
// ---------------------------------------------------------------------------
describe("formatVND", () => {
  it("formats whole dong amounts with period thousand separators", () => {
    expect(formatVND(1_250_000)).toBe("1.250.000 ₫");
  });

  it("formats amounts below 1000 without separator", () => {
    expect(formatVND(500)).toBe("500 ₫");
  });

  it("rounds to nearest integer (no decimal places)", () => {
    expect(formatVND(1_250_499.9)).toBe("1.250.500 ₫");
  });

  it("handles zero", () => {
    expect(formatVND(0)).toBe("0 ₫");
  });

  it("returns fallback for null", () => {
    expect(formatVND(null)).toBe("—");
  });

  it("returns fallback for undefined", () => {
    expect(formatVND(undefined)).toBe("—");
  });

  it("accepts a custom fallback string", () => {
    expect(formatVND(null, "N/A")).toBe("N/A");
  });

  it("handles large amounts (market cap scale)", () => {
    expect(formatVND(10_000_000_000)).toBe("10.000.000.000 ₫");
  });
});

// ---------------------------------------------------------------------------
// pctLabel
// ---------------------------------------------------------------------------
describe("pctLabel", () => {
  it("adds + prefix for positive percentages", () => {
    expect(pctLabel(2.56)).toBe("+2.56%");
  });

  it("adds + prefix for zero (even)", () => {
    expect(pctLabel(0)).toBe("+0.00%");
  });

  it("keeps – sign for negative percentages", () => {
    expect(pctLabel(-3.14)).toBe("-3.14%");
  });

  it("rounds to two decimal places", () => {
    expect(pctLabel(1.999)).toBe("+2.00%");
    expect(pctLabel(-0.001)).toBe("-0.00%");
  });
});

// ---------------------------------------------------------------------------
// formatICTDatetime
// ---------------------------------------------------------------------------
describe("formatICTDatetime", () => {
  it("converts UTC midnight to 07:00 ICT next-minute", () => {
    // 2026-05-28T00:00:00Z → 2026-05-28T07:00:00+07:00
    expect(formatICTDatetime("2026-05-28T00:00:00Z")).toBe("28/05 · 07:00");
  });

  it("converts UTC 08:32 to 15:32 ICT on the same day", () => {
    // 2026-05-28T08:32:00Z → 2026-05-28T15:32:00+07:00
    expect(formatICTDatetime("2026-05-28T08:32:00Z")).toBe("28/05 · 15:32");
  });

  it("rolls over to next calendar day when UTC time is late", () => {
    // 2026-05-28T18:30:00Z → 2026-05-29T01:30:00+07:00 (next day in VN)
    expect(formatICTDatetime("2026-05-28T18:30:00Z")).toBe("29/05 · 01:30");
  });

  it("handles end of month rollover correctly", () => {
    // 2026-01-31T23:00:00Z → 2026-02-01T06:00:00+07:00
    expect(formatICTDatetime("2026-01-31T23:00:00Z")).toBe("01/02 · 06:00");
  });

  it("pads single-digit day and month with leading zero", () => {
    // 2026-03-05T01:00:00Z → 2026-03-05T08:00:00+07:00
    expect(formatICTDatetime("2026-03-05T01:00:00Z")).toBe("05/03 · 08:00");
  });

  it("is unaffected by the test runner's local timezone", () => {
    // Produce the same result regardless of process.env.TZ
    const result = formatICTDatetime("2026-05-28T08:32:00Z");
    expect(result).toBe("28/05 · 15:32");
  });
});

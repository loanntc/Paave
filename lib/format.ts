/**
 * Number formatting utilities for Paave.
 *
 * VND rule: period separator, no decimal places, dong symbol after space.
 * Example: 1_250_000 → "1.250.000 ₫"
 *
 * Source: Vietnamese banking standards — Circular 19/2018.
 */

/**
 * Format a number as VND currency.
 * Accepts null/undefined and returns `fallback` (default "—") for those cases.
 * @param value     Amount in đồng (will be rounded to the nearest integer).
 * @param fallback  String to return when value is null/undefined.
 */
export function formatVND(
  value: number | null | undefined,
  fallback = "—",
): string {
  if (value == null) return fallback;
  return (
    Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫"
  );
}

/**
 * Format a P&L percentage with leading sign.
 * @param pct  Percentage value (e.g. 2.56 for +2.56%)
 */
export function pctLabel(pct: number): string {
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

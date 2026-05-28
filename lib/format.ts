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

// ICT datetime formatter — reused across views so timezone is applied consistently.
// Vietnam Standard Time is UTC+7, no DST.
const ICT_PARTS_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Format an ISO 8601 timestamp as "DD/MM · HH:mm" in Vietnam's ICT timezone.
 * All trade and event timestamps in Paave are stored as UTC; this converts
 * them for display without relying on the device's local clock offset.
 *
 * @example formatICTDatetime("2026-05-28T08:32:00Z") → "28/05 · 15:32"
 */
export function formatICTDatetime(isoString: string): string {
  const parts = ICT_PARTS_FMT.formatToParts(new Date(isoString));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "??";
  return `${get("day")}/${get("month")} · ${get("hour")}:${get("minute")}`;
}

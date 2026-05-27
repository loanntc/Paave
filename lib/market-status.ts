/**
 * VN stock market session status.
 *
 * HOSE / HNX / UPCOM share the same trading schedule (ICT = Asia/Ho_Chi_Minh, UTC+7):
 *
 *   08:45 – 09:00   Pre-open / ATO order entry
 *   09:00 – 11:30   Morning session (continuous matching)
 *   11:30 – 13:00   Lunch break
 *   13:00 – 14:30   Afternoon session (continuous matching)
 *   14:30 – 15:00   ATC (closing auction)
 *   15:00 – 15:15   After-hours / PTC
 *   Sat, Sun         Weekend closed
 *
 * Source: SSC Circular 120/2020/TT-BTC (trading hours), effective 2020.
 */

export type MarketStatus =
  | "pre_open"    // ATO order entry phase
  | "open"        // Continuous matching (morning or afternoon)
  | "lunch"       // Midday break
  | "atc"         // ATC / closing auction
  | "after_hours" // Post-close / PTC
  | "closed";     // Market closed (before 08:45, after 15:15, or weekend)

export interface VNMarketStatusResult {
  status: MarketStatus;
  /** Short Vietnamese label shown in the UI */
  label: string;
  /** True only during continuous trading (morning and afternoon sessions) */
  isTrading: boolean;
}

/**
 * Determine the current VN market session.
 *
 * @param now  Optional override for the current time (defaults to `new Date()`).
 *             Useful for unit tests.
 * @returns    A `VNMarketStatusResult` describing the active market phase.
 */
export function getVNMarketStatus(now: Date = new Date()): VNMarketStatusResult {
  // Resolve the current date/time in ICT (UTC+7) using Intl
  const ictFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = ictFormatter.formatToParts(now);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const weekday = get("weekday"); // "Mon", "Tue", …, "Sat", "Sun"
  const hour = parseInt(get("hour"), 10);
  // Intl may return "24" for midnight in some runtimes — normalise
  const normalisedHour = hour === 24 ? 0 : hour;
  const minute = parseInt(get("minute"), 10);
  const totalMinutes = normalisedHour * 60 + minute;

  // Weekend: fully closed
  if (weekday === "Sat" || weekday === "Sun") {
    return { status: "closed", label: "Nghỉ cuối tuần", isTrading: false };
  }

  // Pre-open: 08:45 – 09:00
  if (totalMinutes >= 8 * 60 + 45 && totalMinutes < 9 * 60) {
    return { status: "pre_open", label: "Tiền phiên", isTrading: false };
  }

  // Morning continuous session: 09:00 – 11:30
  if (totalMinutes >= 9 * 60 && totalMinutes < 11 * 60 + 30) {
    return { status: "open", label: "Phiên sáng", isTrading: true };
  }

  // Lunch break: 11:30 – 13:00
  if (totalMinutes >= 11 * 60 + 30 && totalMinutes < 13 * 60) {
    return { status: "lunch", label: "Nghỉ trưa", isTrading: false };
  }

  // Afternoon continuous session: 13:00 – 14:30
  if (totalMinutes >= 13 * 60 && totalMinutes < 14 * 60 + 30) {
    return { status: "open", label: "Phiên chiều", isTrading: true };
  }

  // ATC / closing auction: 14:30 – 15:00
  if (totalMinutes >= 14 * 60 + 30 && totalMinutes < 15 * 60) {
    return { status: "atc", label: "ATC", isTrading: false };
  }

  // After-hours / PTC: 15:00 – 15:15
  if (totalMinutes >= 15 * 60 && totalMinutes < 15 * 60 + 15) {
    return { status: "after_hours", label: "Sau giờ", isTrading: false };
  }

  // All other times (before 08:45 or after 15:15)
  return { status: "closed", label: "Đóng cửa", isTrading: false };
}

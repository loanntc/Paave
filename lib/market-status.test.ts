import { describe, it, expect } from "vitest";
import { getVNMarketStatus } from "./market-status";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a Date object representing a specific ICT (UTC+7) wall-clock time.
 * We pass the ICT time as a UTC offset to avoid relying on the test runner's
 * local timezone.
 */
function ict(weekdayOffset: number, hh: number, mm: number): Date {
  // weekdayOffset: 0 = Monday 2025-01-06, 1 = Tue, …, 5 = Sat, 6 = Sun
  // ICT is UTC+7, so ICT hh:mm corresponds to UTC (hh-7):mm
  const mondayUtcMs = Date.UTC(2025, 0, 6, 0, 0, 0); // Mon 2025-01-06 00:00 UTC
  const dayMs = weekdayOffset * 24 * 60 * 60 * 1000;
  const ictOffsetMs = 7 * 60 * 60 * 1000; // ICT = UTC+7
  const timeMs = (hh * 60 + mm) * 60 * 1000;
  return new Date(mondayUtcMs + dayMs + timeMs - ictOffsetMs);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getVNMarketStatus", () => {
  // ── Weekend ────────────────────────────────────────────────────────────────
  it("returns closed with weekend label on Saturday", () => {
    const sat = ict(5, 10, 0); // Saturday 10:00 ICT
    const result = getVNMarketStatus(sat);
    expect(result.status).toBe("closed");
    expect(result.label).toBe("Nghỉ cuối tuần");
    expect(result.isTrading).toBe(false);
  });

  it("returns closed with weekend label on Sunday", () => {
    const sun = ict(6, 14, 0); // Sunday 14:00 ICT
    const result = getVNMarketStatus(sun);
    expect(result.status).toBe("closed");
    expect(result.isTrading).toBe(false);
  });

  // ── Pre-market weekday ─────────────────────────────────────────────────────
  it("returns closed before pre-open on a weekday (07:00)", () => {
    const result = getVNMarketStatus(ict(0, 7, 0));
    expect(result.status).toBe("closed");
    expect(result.label).toBe("Đóng cửa");
  });

  it("returns closed at exactly 08:44 (one minute before pre-open)", () => {
    const result = getVNMarketStatus(ict(0, 8, 44));
    expect(result.status).toBe("closed");
  });

  // ── Pre-open phase ─────────────────────────────────────────────────────────
  it("returns pre_open at 08:45 (start of pre-open)", () => {
    const result = getVNMarketStatus(ict(0, 8, 45));
    expect(result.status).toBe("pre_open");
    expect(result.label).toBe("Tiền phiên");
    expect(result.isTrading).toBe(false);
  });

  it("returns pre_open at 08:59 (last minute of pre-open)", () => {
    const result = getVNMarketStatus(ict(0, 8, 59));
    expect(result.status).toBe("pre_open");
  });

  // ── Morning session ────────────────────────────────────────────────────────
  it("returns open (morning) at 09:00 (market open)", () => {
    const result = getVNMarketStatus(ict(0, 9, 0));
    expect(result.status).toBe("open");
    expect(result.label).toBe("Phiên sáng");
    expect(result.isTrading).toBe(true);
  });

  it("returns open (morning) at 10:30", () => {
    const result = getVNMarketStatus(ict(0, 10, 30));
    expect(result.status).toBe("open");
    expect(result.isTrading).toBe(true);
  });

  it("returns open (morning) at 11:29 (last minute before lunch)", () => {
    const result = getVNMarketStatus(ict(0, 11, 29));
    expect(result.status).toBe("open");
    expect(result.isTrading).toBe(true);
  });

  // ── Lunch break ────────────────────────────────────────────────────────────
  it("returns lunch at 11:30 (start of break)", () => {
    const result = getVNMarketStatus(ict(0, 11, 30));
    expect(result.status).toBe("lunch");
    expect(result.label).toBe("Nghỉ trưa");
    expect(result.isTrading).toBe(false);
  });

  it("returns lunch at 12:00", () => {
    const result = getVNMarketStatus(ict(0, 12, 0));
    expect(result.status).toBe("lunch");
  });

  it("returns lunch at 12:59 (last minute before afternoon session)", () => {
    const result = getVNMarketStatus(ict(0, 12, 59));
    expect(result.status).toBe("lunch");
  });

  // ── Afternoon session ──────────────────────────────────────────────────────
  it("returns open (afternoon) at 13:00 (afternoon open)", () => {
    const result = getVNMarketStatus(ict(0, 13, 0));
    expect(result.status).toBe("open");
    expect(result.label).toBe("Phiên chiều");
    expect(result.isTrading).toBe(true);
  });

  it("returns open (afternoon) at 14:00", () => {
    const result = getVNMarketStatus(ict(0, 14, 0));
    expect(result.status).toBe("open");
    expect(result.isTrading).toBe(true);
  });

  it("returns open (afternoon) at 14:29 (last minute before ATC)", () => {
    const result = getVNMarketStatus(ict(0, 14, 29));
    expect(result.status).toBe("open");
    expect(result.isTrading).toBe(true);
  });

  // ── ATC / closing auction ──────────────────────────────────────────────────
  it("returns atc at 14:30 (ATC start)", () => {
    const result = getVNMarketStatus(ict(0, 14, 30));
    expect(result.status).toBe("atc");
    expect(result.label).toBe("ATC");
    expect(result.isTrading).toBe(false);
  });

  it("returns atc at 14:59 (last minute of ATC)", () => {
    const result = getVNMarketStatus(ict(0, 14, 59));
    expect(result.status).toBe("atc");
  });

  // ── After-hours ────────────────────────────────────────────────────────────
  it("returns after_hours at 15:00 (PTC start)", () => {
    const result = getVNMarketStatus(ict(0, 15, 0));
    expect(result.status).toBe("after_hours");
    expect(result.label).toBe("Sau giờ");
    expect(result.isTrading).toBe(false);
  });

  it("returns after_hours at 15:14 (last minute of PTC)", () => {
    const result = getVNMarketStatus(ict(0, 15, 14));
    expect(result.status).toBe("after_hours");
  });

  // ── Closed after PTC ──────────────────────────────────────────────────────
  it("returns closed at 15:15 (market fully closed)", () => {
    const result = getVNMarketStatus(ict(0, 15, 15));
    expect(result.status).toBe("closed");
    expect(result.label).toBe("Đóng cửa");
  });

  it("returns closed at 20:00 (evening)", () => {
    const result = getVNMarketStatus(ict(0, 20, 0));
    expect(result.status).toBe("closed");
  });

  // ── All weekdays work ──────────────────────────────────────────────────────
  it("returns open on Tuesday at 10:00", () => {
    const result = getVNMarketStatus(ict(1, 10, 0)); // Tuesday
    expect(result.status).toBe("open");
    expect(result.isTrading).toBe(true);
  });

  it("returns open on Friday at 13:30", () => {
    const result = getVNMarketStatus(ict(4, 13, 30)); // Friday
    expect(result.status).toBe("open");
    expect(result.isTrading).toBe(true);
  });

  // ── isTrading contract ─────────────────────────────────────────────────────
  it("isTrading is false for all non-trading statuses", () => {
    const nonTradingTimes = [
      ict(0, 7, 0),   // closed (before open)
      ict(0, 8, 50),  // pre_open
      ict(0, 12, 0),  // lunch
      ict(0, 14, 40), // atc
      ict(0, 15, 5),  // after_hours
      ict(0, 19, 0),  // closed (evening)
      ict(5, 10, 0),  // Saturday
    ];
    for (const t of nonTradingTimes) {
      expect(getVNMarketStatus(t).isTrading).toBe(false);
    }
  });

  it("isTrading is true during morning and afternoon sessions only", () => {
    const tradingTimes = [
      ict(0, 9, 0),   // morning open
      ict(0, 10, 0),  // mid-morning
      ict(0, 11, 29), // last minute morning
      ict(0, 13, 0),  // afternoon open
      ict(0, 14, 0),  // mid-afternoon
      ict(0, 14, 29), // last minute afternoon
    ];
    for (const t of tradingTimes) {
      expect(getVNMarketStatus(t).isTrading).toBe(true);
    }
  });
});

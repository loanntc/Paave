import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  checkRateLimit,
  _resetStoreForTests,
  AI_RATE_LIMIT,
  AI_RATE_WINDOW_MS,
} from "./rate-limiter";

// ---------------------------------------------------------------------------
// checkRateLimit — sliding window rate limiter
// ---------------------------------------------------------------------------

describe("checkRateLimit", () => {
  beforeEach(() => {
    _resetStoreForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Allow path ─────────────────────────────────────────────────────────────

  it("allows the first request for a new user", () => {
    const result = checkRateLimit("user-1");
    expect(result.allowed).toBe(true);
  });

  it("returns remaining count decremented by one after first request", () => {
    const result = checkRateLimit("user-1");
    expect(result.remaining).toBe(AI_RATE_LIMIT - 1);
  });

  it("returns resetAt approximately one window from now on first request", () => {
    const before = Date.now();
    const result = checkRateLimit("user-1");
    const after = Date.now();
    expect(result.resetAt).toBeGreaterThanOrEqual(before + AI_RATE_WINDOW_MS);
    expect(result.resetAt).toBeLessThanOrEqual(after + AI_RATE_WINDOW_MS);
  });

  it("allows requests up to the limit without blocking", () => {
    for (let i = 0; i < AI_RATE_LIMIT; i++) {
      const result = checkRateLimit("user-burst");
      expect(result.allowed).toBe(true);
    }
  });

  it("decrements remaining correctly across multiple requests", () => {
    checkRateLimit("user-dec");
    checkRateLimit("user-dec");
    const third = checkRateLimit("user-dec");
    expect(third.remaining).toBe(AI_RATE_LIMIT - 3);
  });

  // ── Deny path ──────────────────────────────────────────────────────────────

  it("denies the (limit + 1)th request within the window", () => {
    for (let i = 0; i < AI_RATE_LIMIT; i++) {
      checkRateLimit("user-over");
    }
    const over = checkRateLimit("user-over");
    expect(over.allowed).toBe(false);
  });

  it("returns remaining = 0 when denied", () => {
    for (let i = 0; i < AI_RATE_LIMIT; i++) {
      checkRateLimit("user-deny");
    }
    const result = checkRateLimit("user-deny");
    expect(result.remaining).toBe(0);
  });

  it("returns a positive resetAt in the future when denied", () => {
    for (let i = 0; i < AI_RATE_LIMIT; i++) {
      checkRateLimit("user-reset");
    }
    const result = checkRateLimit("user-reset");
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it("does not record a timestamp when the request is denied", () => {
    for (let i = 0; i < AI_RATE_LIMIT; i++) {
      checkRateLimit("user-no-record");
    }
    // First over-limit call is denied — remaining should still be 0, not negative
    const denied = checkRateLimit("user-no-record");
    expect(denied.remaining).toBe(0);
    // Calling again should still return remaining = 0 (not go below)
    const denied2 = checkRateLimit("user-no-record");
    expect(denied2.remaining).toBe(0);
  });

  // ── Sliding window expiry ──────────────────────────────────────────────────

  it("allows requests again after the window expires", () => {
    for (let i = 0; i < AI_RATE_LIMIT; i++) {
      checkRateLimit("user-expire");
    }
    // Advance time past the full window
    vi.advanceTimersByTime(AI_RATE_WINDOW_MS + 1);

    const result = checkRateLimit("user-expire");
    expect(result.allowed).toBe(true);
  });

  it("counts only requests within the current window after partial expiry", () => {
    // Fill half the limit
    for (let i = 0; i < AI_RATE_LIMIT / 2; i++) {
      checkRateLimit("user-partial");
    }

    // Advance so those first requests fall outside the window
    vi.advanceTimersByTime(AI_RATE_WINDOW_MS + 1);

    // Fill another half — these are new window entries
    for (let i = 0; i < AI_RATE_LIMIT / 2; i++) {
      checkRateLimit("user-partial");
    }

    // There should still be room (old entries expired)
    const result = checkRateLimit("user-partial");
    expect(result.allowed).toBe(true);
  });

  // ── User isolation ─────────────────────────────────────────────────────────

  it("maintains separate counters for different users", () => {
    for (let i = 0; i < AI_RATE_LIMIT; i++) {
      checkRateLimit("user-a");
    }
    // user-b should be unaffected
    const result = checkRateLimit("user-b");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(AI_RATE_LIMIT - 1);
  });

  // ── Edge: exactly at limit ─────────────────────────────────────────────────

  it("allows exactly AI_RATE_LIMIT requests and denies the next one", () => {
    const results: boolean[] = [];
    for (let i = 0; i < AI_RATE_LIMIT + 1; i++) {
      results.push(checkRateLimit("user-exact").allowed);
    }
    expect(results.slice(0, AI_RATE_LIMIT).every(Boolean)).toBe(true);
    expect(results[AI_RATE_LIMIT]).toBe(false);
  });
});

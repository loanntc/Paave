// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter for AI chat.
//
// LIMITATIONS (document per coding-style.md §7):
//   - Resets on process restart / cold starts — serverless deployments will not
//     coordinate across parallel function instances.
//   - This is sufficient for MVP to catch single-user burst abuse within a warm
//     function instance and act as a cost guardrail during development.
//   - For production at scale, replace with Upstash Redis (@upstash/ratelimit).
//     See performance.md §5 for caching strategy guidance.
// ---------------------------------------------------------------------------

/** Maximum AI queries a single user may make within WINDOW_MS. */
export const AI_RATE_LIMIT = 20;

/** Sliding window duration in milliseconds. */
export const AI_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface WindowEntry {
  /** Timestamps (ms) of accepted requests within the current window. */
  timestamps: number[];
}

// Module-level — survives across requests within the same warm instance.
const store = new Map<string, WindowEntry>();

export interface RateLimitResult {
  /** Whether the request is permitted. */
  allowed: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /**
   * Unix timestamp (ms) when the oldest recorded request exits the window.
   * Null when no prior requests have been recorded.
   */
  resetAt: number | null;
}

/**
 * Check and record an AI chat request for a given user.
 *
 * Pure sliding-window algorithm:
 *  - Evicts timestamps older than WINDOW_MS on every call (O(n) where n ≤ limit).
 *  - Denies the request when the count after eviction meets the limit.
 *  - Records the timestamp on allow; does not modify state on deny.
 */
export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();
  const cutoff = now - AI_RATE_WINDOW_MS;

  let entry = store.get(userId);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(userId, entry);
  }

  // Slide the window — drop timestamps that have expired.
  entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

  if (entry.timestamps.length >= AI_RATE_LIMIT) {
    // Oldest timestamp determines when the window re-opens.
    const oldest = entry.timestamps[0]!;
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldest + AI_RATE_WINDOW_MS,
    };
  }

  // Allow — record this request timestamp.
  entry.timestamps.push(now);
  const remaining = AI_RATE_LIMIT - entry.timestamps.length;
  const resetAt = entry.timestamps[0]! + AI_RATE_WINDOW_MS;

  return { allowed: true, remaining, resetAt };
}

/**
 * Clears all entries from the store.
 * Exposed for testing only — do not call in production paths.
 * @internal
 */
export function _resetStoreForTests(): void {
  store.clear();
}

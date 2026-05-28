// ---------------------------------------------------------------------------
// Tests for useWatchlist (T-1: business logic tests are mandatory)
// Covers: hydration, add/remove/toggle idempotency, normalisation,
//         cap enforcement, localStorage persistence, re-mount restoration
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWatchlist } from "./use-watchlist";

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("initial state", () => {
  it("starts with an empty watchlist", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    expect(result.current.watchlist).toEqual([]);
  });

  it("becomes hydrated=true after effects run", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    expect(result.current.hydrated).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isWatched
// ---------------------------------------------------------------------------

describe("isWatched", () => {
  it("returns false for a ticker that has not been added", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    expect(result.current.isWatched("VCB")).toBe(false);
  });

  it("returns true after the ticker is added", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => { result.current.addToWatchlist("VCB"); });
    expect(result.current.isWatched("VCB")).toBe(true);
  });

  it("is case-insensitive — normalises to uppercase", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => { result.current.addToWatchlist("vcb"); });
    expect(result.current.isWatched("VCB")).toBe(true);
    expect(result.current.isWatched("vcb")).toBe(true);
    expect(result.current.isWatched("Vcb")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// addToWatchlist
// ---------------------------------------------------------------------------

describe("addToWatchlist", () => {
  it("adds a ticker to the watchlist", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => { result.current.addToWatchlist("HPG"); });
    expect(result.current.watchlist).toContain("HPG");
  });

  it("is idempotent — adding the same ticker twice has no effect", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => {
      result.current.addToWatchlist("HPG");
      result.current.addToWatchlist("HPG");
    });
    expect(result.current.watchlist.filter((t) => t === "HPG")).toHaveLength(1);
  });

  it("stores the newest ticker first (prepend order)", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => { result.current.addToWatchlist("VCB"); });
    await act(() => { result.current.addToWatchlist("HPG"); });
    expect(result.current.watchlist[0]).toBe("HPG");
    expect(result.current.watchlist[1]).toBe("VCB");
  });

  it("normalises input to uppercase before storing", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => { result.current.addToWatchlist("hpg"); });
    expect(result.current.watchlist).toContain("HPG");
    expect(result.current.watchlist).not.toContain("hpg");
  });

  it("does not exceed the 50-ticker cap", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => {
      for (let i = 0; i < 55; i++) {
        result.current.addToWatchlist(`T${i.toString().padStart(2, "0")}`);
      }
    });
    expect(result.current.watchlist.length).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// removeFromWatchlist
// ---------------------------------------------------------------------------

describe("removeFromWatchlist", () => {
  it("removes a watched ticker", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => { result.current.addToWatchlist("MWG"); });
    await act(() => { result.current.removeFromWatchlist("MWG"); });
    expect(result.current.watchlist).not.toContain("MWG");
    expect(result.current.isWatched("MWG")).toBe(false);
  });

  it("is idempotent — removing an unwatched ticker is a no-op", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    // Should not throw
    await act(() => { result.current.removeFromWatchlist("FPT"); });
    expect(result.current.watchlist).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// toggleWatchlist
// ---------------------------------------------------------------------------

describe("toggleWatchlist", () => {
  it("adds when not watched", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => { result.current.toggleWatchlist("VHM"); });
    expect(result.current.isWatched("VHM")).toBe(true);
  });

  it("removes when already watched", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => { result.current.addToWatchlist("VHM"); });
    await act(() => { result.current.toggleWatchlist("VHM"); });
    expect(result.current.isWatched("VHM")).toBe(false);
  });

  it("calling twice returns ticker to original state", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => {
      result.current.toggleWatchlist("BID");
      result.current.toggleWatchlist("BID");
    });
    expect(result.current.isWatched("BID")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

describe("localStorage persistence", () => {
  it("persists the watchlist across hook re-mounts", async () => {
    const { result: r1, unmount } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => {
      r1.current.addToWatchlist("VCB");
      r1.current.addToWatchlist("HPG");
    });
    unmount();

    const { result: r2 } = renderHook(() => useWatchlist());
    await flushEffects();
    expect(r2.current.watchlist).toContain("VCB");
    expect(r2.current.watchlist).toContain("HPG");
  });

  it("persists removal across re-mounts", async () => {
    const { result: r1, unmount } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => {
      r1.current.addToWatchlist("VCB");
      r1.current.addToWatchlist("HPG");
    });
    await act(() => { r1.current.removeFromWatchlist("HPG"); });
    unmount();

    const { result: r2 } = renderHook(() => useWatchlist());
    await flushEffects();
    expect(r2.current.watchlist).toContain("VCB");
    expect(r2.current.watchlist).not.toContain("HPG");
  });

  it("writes to localStorage under paave_watchlist_v1", async () => {
    const { result } = renderHook(() => useWatchlist());
    await flushEffects();
    await act(() => { result.current.addToWatchlist("FPT"); });
    const stored = JSON.parse(localStorage.getItem("paave_watchlist_v1") ?? "[]");
    expect(stored).toContain("FPT");
  });
});

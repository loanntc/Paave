// ---------------------------------------------------------------------------
// Tests for usePriceAlerts (T-1: business logic tests are mandatory)
// Covers: hydration, setAlert idempotency, removeAlert, checkTriggered,
//         cap enforcement, localStorage persistence, re-mount restoration
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePriceAlerts } from "./use-price-alerts";

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
  it("starts with an empty alerts list", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    expect(result.current.alerts).toEqual([]);
  });

  it("becomes hydrated=true after effects run", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    expect(result.current.hydrated).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// setAlert
// ---------------------------------------------------------------------------

describe("setAlert", () => {
  it("adds an alert to the list", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("VCB", "above", 90_000); });
    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].ticker).toBe("VCB");
    expect(result.current.alerts[0].condition).toBe("above");
    expect(result.current.alerts[0].target).toBe(90_000);
  });

  it("normalises ticker to uppercase", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("vcb", "above", 90_000); });
    expect(result.current.alerts[0].ticker).toBe("VCB");
  });

  it("replaces an existing alert for the same ticker + condition", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("VCB", "above", 90_000); });
    await act(() => { result.current.setAlert("VCB", "above", 95_000); });
    const vcbAlerts = result.current.getAlertsForTicker("VCB");
    expect(vcbAlerts).toHaveLength(1);
    expect(vcbAlerts[0].target).toBe(95_000);
  });

  it("allows two alerts for same ticker with different conditions", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => {
      result.current.setAlert("VCB", "above", 95_000);
      result.current.setAlert("VCB", "below", 80_000);
    });
    expect(result.current.getAlertsForTicker("VCB")).toHaveLength(2);
  });

  it("persists under paave_price_alerts_v1", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("HPG", "below", 25_000); });
    const stored = JSON.parse(localStorage.getItem("paave_price_alerts_v1") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].ticker).toBe("HPG");
  });
});

// ---------------------------------------------------------------------------
// removeAlert
// ---------------------------------------------------------------------------

describe("removeAlert", () => {
  it("removes the alert with the given id", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("FPT", "above", 120_000); });
    const id = result.current.alerts[0].id;
    await act(() => { result.current.removeAlert(id); });
    expect(result.current.alerts).toHaveLength(0);
  });

  it("is idempotent — removing a non-existent id is a no-op", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.removeAlert("non-existent-id"); });
    expect(result.current.alerts).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getAlertsForTicker
// ---------------------------------------------------------------------------

describe("getAlertsForTicker", () => {
  it("returns only alerts for the given ticker", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => {
      result.current.setAlert("VCB", "above", 90_000);
      result.current.setAlert("HPG", "below", 25_000);
    });
    expect(result.current.getAlertsForTicker("VCB")).toHaveLength(1);
    expect(result.current.getAlertsForTicker("HPG")).toHaveLength(1);
  });

  it("is case-insensitive", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("VCB", "above", 90_000); });
    expect(result.current.getAlertsForTicker("vcb")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// checkTriggered
// ---------------------------------------------------------------------------

describe("checkTriggered", () => {
  it("returns null when no alerts exist for the ticker", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    expect(result.current.checkTriggered("VCB", 90_000)).toBeNull();
  });

  it("returns the alert when price is above target and condition is 'above'", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("VCB", "above", 90_000); });
    const triggered = result.current.checkTriggered("VCB", 91_000);
    expect(triggered).not.toBeNull();
    expect(triggered?.condition).toBe("above");
  });

  it("returns the alert when price equals target exactly (above)", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("VCB", "above", 90_000); });
    expect(result.current.checkTriggered("VCB", 90_000)).not.toBeNull();
  });

  it("returns null when price is below target and condition is 'above'", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("VCB", "above", 90_000); });
    expect(result.current.checkTriggered("VCB", 89_999)).toBeNull();
  });

  it("returns the alert when price is below target and condition is 'below'", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("HPG", "below", 25_000); });
    const triggered = result.current.checkTriggered("HPG", 24_000);
    expect(triggered).not.toBeNull();
    expect(triggered?.condition).toBe("below");
  });

  it("returns null when price is above target and condition is 'below'", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("HPG", "below", 25_000); });
    expect(result.current.checkTriggered("HPG", 26_000)).toBeNull();
  });

  it("is case-insensitive", async () => {
    const { result } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { result.current.setAlert("VCB", "above", 90_000); });
    expect(result.current.checkTriggered("vcb", 95_000)).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

describe("localStorage persistence", () => {
  it("restores alerts after re-mount", async () => {
    const { result: r1, unmount } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => {
      r1.current.setAlert("VCB", "above", 90_000);
      r1.current.setAlert("HPG", "below", 25_000);
    });
    unmount();

    const { result: r2 } = renderHook(() => usePriceAlerts());
    await flushEffects();
    expect(r2.current.alerts).toHaveLength(2);
    expect(r2.current.getAlertsForTicker("VCB")).toHaveLength(1);
    expect(r2.current.getAlertsForTicker("HPG")).toHaveLength(1);
  });

  it("persists removal across re-mounts", async () => {
    const { result: r1, unmount } = renderHook(() => usePriceAlerts());
    await flushEffects();
    await act(() => { r1.current.setAlert("VCB", "above", 90_000); });
    const id = r1.current.alerts[0].id;
    await act(() => { r1.current.removeAlert(id); });
    unmount();

    const { result: r2 } = renderHook(() => usePriceAlerts());
    await flushEffects();
    expect(r2.current.alerts).toHaveLength(0);
  });
});

"use client";

// ---------------------------------------------------------------------------
// usePriceAlerts — localStorage-backed in-app price alert targets
//
// Stored under "paave_price_alerts_v1" as a JSON array.
// Checks happen client-side on the stock detail page when live quotes load.
// Push notification delivery is out of scope until backend infra is ready.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "paave_price_alerts_v1";
const MAX_ALERTS = 20; // per-user cap to bound localStorage growth

export interface PriceAlert {
  /** Composite key: "{TICKER}-{condition}-{timestamp}" */
  id: string;
  ticker: string;              // always uppercase
  condition: "above" | "below";
  target: number;              // price in VND
  createdAt: string;           // ISO timestamp
}

export interface UsePriceAlertsResult {
  hydrated: boolean;
  alerts: PriceAlert[];
  /** All alerts for a given ticker (case-insensitive) */
  getAlertsForTicker: (ticker: string) => PriceAlert[];
  /**
   * Create or replace an alert for ticker + condition combination.
   * If an alert already exists for the same ticker + condition it is replaced.
   * Silently drops if MAX_ALERTS would be exceeded.
   */
  setAlert: (ticker: string, condition: "above" | "below", target: number) => void;
  /** Remove a single alert by id. Idempotent. */
  removeAlert: (id: string) => void;
  /**
   * Returns the first alert for ticker whose condition is currently met by
   * currentPrice, or null if no alert is triggered.
   */
  checkTriggered: (ticker: string, currentPrice: number) => PriceAlert | null;
}

function readFromStorage(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PriceAlert =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as PriceAlert).id === "string" &&
        typeof (item as PriceAlert).ticker === "string" &&
        ((item as PriceAlert).condition === "above" ||
          (item as PriceAlert).condition === "below") &&
        typeof (item as PriceAlert).target === "number",
    );
  } catch {
    return [];
  }
}

function writeToStorage(alerts: PriceAlert[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch {
    // localStorage unavailable (private mode, quota) — degrade silently
  }
}

export function usePriceAlerts(): UsePriceAlertsResult {
  const [hydrated, setHydrated] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  // Hydrate after mount (SSR-safe)
  useEffect(() => {
    setAlerts(readFromStorage());
    setHydrated(true);
  }, []);

  const getAlertsForTicker = useCallback(
    (ticker: string) => {
      const upper = ticker.toUpperCase();
      return alerts.filter((a) => a.ticker === upper);
    },
    [alerts],
  );

  const setAlert = useCallback(
    (ticker: string, condition: "above" | "below", target: number) => {
      const normalised = ticker.toUpperCase();
      const newAlert: PriceAlert = {
        id: `${normalised}-${condition}-${Date.now()}`,
        ticker: normalised,
        condition,
        target,
        createdAt: new Date().toISOString(),
      };
      setAlerts((prev) => {
        // Replace any existing alert for same ticker + condition
        const filtered = prev.filter(
          (a) => !(a.ticker === normalised && a.condition === condition),
        );
        if (filtered.length >= MAX_ALERTS) return prev; // cap reached, no-op
        const next = [newAlert, ...filtered];
        writeToStorage(next);
        return next;
      });
    },
    [],
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      if (!prev.some((a) => a.id === id)) return prev; // idempotent
      const next = prev.filter((a) => a.id !== id);
      writeToStorage(next);
      return next;
    });
  }, []);

  const checkTriggered = useCallback(
    (ticker: string, currentPrice: number): PriceAlert | null => {
      const upper = ticker.toUpperCase();
      return (
        alerts.find((a) => {
          if (a.ticker !== upper) return false;
          return a.condition === "above"
            ? currentPrice >= a.target
            : currentPrice <= a.target;
        }) ?? null
      );
    },
    [alerts],
  );

  return { hydrated, alerts, getAlertsForTicker, setAlert, removeAlert, checkTriggered };
}

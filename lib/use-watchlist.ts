"use client";

// ---------------------------------------------------------------------------
// useWatchlist — localStorage-backed watchlist of stock symbols
//
// Stored under "paave_watchlist_v1" as a JSON array of ticker strings.
// Designed to be upgraded to Supabase persistence once the DB migration
// for the watchlist table is approved (rule A-1 blocks that for now).
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "paave_watchlist_v1";
const MAX_WATCHLIST_SIZE = 50; // reasonable cap for localStorage-backed list

export interface UseWatchlistResult {
  /** Whether the hook has loaded state from localStorage. */
  hydrated: boolean;
  /** Ordered list of ticker codes (strings) the user is watching. */
  watchlist: string[];
  /** True if the given ticker is currently in the watchlist. */
  isWatched: (ticker: string) => boolean;
  /**
   * Add a ticker to the watchlist.
   * Idempotent — calling with an already-watched ticker is a no-op.
   * Capped at MAX_WATCHLIST_SIZE; silently drops if full.
   */
  addToWatchlist: (ticker: string) => void;
  /**
   * Remove a ticker from the watchlist.
   * Idempotent — calling with an unwatched ticker is a no-op.
   */
  removeFromWatchlist: (ticker: string) => void;
  /**
   * Toggle the watched state of a ticker.
   * Adds if not watched; removes if watched.
   * Returns the new watched state.
   */
  toggleWatchlist: (ticker: string) => boolean;
}

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeToStorage(tickers: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
  } catch {
    // localStorage may be unavailable (private mode quota, etc.) — degrade silently
  }
}

export function useWatchlist(): UseWatchlistResult {
  const [hydrated, setHydrated] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setWatchlist(readFromStorage());
    setHydrated(true);
  }, []);

  const isWatched = useCallback(
    (ticker: string) => watchlist.includes(ticker.toUpperCase()),
    [watchlist],
  );

  const addToWatchlist = useCallback((ticker: string) => {
    const normalised = ticker.toUpperCase();
    setWatchlist((prev) => {
      if (prev.includes(normalised)) return prev;
      if (prev.length >= MAX_WATCHLIST_SIZE) return prev;
      const next = [normalised, ...prev]; // newest first
      writeToStorage(next);
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((ticker: string) => {
    const normalised = ticker.toUpperCase();
    setWatchlist((prev) => {
      if (!prev.includes(normalised)) return prev;
      const next = prev.filter((t) => t !== normalised);
      writeToStorage(next);
      return next;
    });
  }, []);

  const toggleWatchlist = useCallback(
    (ticker: string): boolean => {
      const normalised = ticker.toUpperCase();
      let nextWatched = false;
      setWatchlist((prev) => {
        if (prev.includes(normalised)) {
          const next = prev.filter((t) => t !== normalised);
          writeToStorage(next);
          nextWatched = false;
          return next;
        }
        if (prev.length >= MAX_WATCHLIST_SIZE) {
          nextWatched = false;
          return prev;
        }
        const next = [normalised, ...prev];
        writeToStorage(next);
        nextWatched = true;
        return next;
      });
      return nextWatched;
    },
    [],
  );

  return { hydrated, watchlist, isWatched, addToWatchlist, removeFromWatchlist, toggleWatchlist };
}

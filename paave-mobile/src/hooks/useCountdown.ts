/**
 * useCountdown — countdown timer hook for OTP screens.
 *
 * Returns:
 *   remaining — seconds left
 *   formatted — "M:SS" display string
 *   isExpired — true when timer reaches 0
 *   reset     — restart the countdown
 */
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownOptions {
  /** Total countdown duration in seconds (default: 600 = 10 min) */
  seconds?: number;
  /** Auto-start on mount (default: true) */
  autoStart?: boolean;
  /** Callback when timer reaches 0 */
  onExpire?: () => void;
}

interface UseCountdownReturn {
  remaining: number;
  formatted: string;
  isExpired: boolean;
  reset: (newSeconds?: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function useCountdown(
  options: UseCountdownOptions = {},
): UseCountdownReturn {
  const {
    seconds: initialSeconds = 600,
    autoStart = true,
    onExpire,
  } = options;

  const [remaining, setRemaining] = useState(
    autoStart ? initialSeconds : 0,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (secs: number) => {
      clearTimer();
      setRemaining(secs);

      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            onExpireRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer],
  );

  // Auto-start on mount
  useEffect(() => {
    if (autoStart) {
      startTimer(initialSeconds);
    }
    return clearTimer;
  }, [autoStart, initialSeconds, startTimer, clearTimer]);

  const reset = useCallback(
    (newSeconds?: number) => {
      startTimer(newSeconds ?? initialSeconds);
    },
    [initialSeconds, startTimer],
  );

  return {
    remaining,
    formatted: formatTime(remaining),
    isExpired: remaining <= 0,
    reset,
  };
}

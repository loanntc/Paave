/**
 * useBiometric — hook for biometric capability and authentication.
 *
 * Returns:
 *   available    — hardware present and enrolled
 *   type         — 'face' | 'fingerprint' | 'iris' | 'none'
 *   authenticate — trigger OS biometric prompt
 */
import { useCallback, useEffect, useState } from 'react';
import {
  checkBiometricCapability,
  authenticateWithBiometric,
  type BiometricType,
} from '../services/biometric';

interface UseBiometricReturn {
  /** Biometric hardware is available AND enrolled */
  available: boolean;
  /** Detected biometric type */
  type: BiometricType;
  /** Whether capability check has completed */
  isReady: boolean;
  /** Prompt for biometric authentication. Returns true on success. */
  authenticate: (promptMessage?: string) => Promise<boolean>;
}

export function useBiometric(): UseBiometricReturn {
  const [available, setAvailable] = useState(false);
  const [type, setType] = useState<BiometricType>('none');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const capability = await checkBiometricCapability();
      if (!cancelled) {
        setAvailable(capability.available && capability.enrolled);
        setType(capability.type);
        setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const authenticate = useCallback(
    async (promptMessage?: string): Promise<boolean> => {
      if (!available) return false;
      return authenticateWithBiometric(promptMessage);
    },
    [available],
  );

  return { available, type, isReady, authenticate };
}

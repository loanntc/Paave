/**
 * useAuth — convenience hook combining auth store with navigation helpers.
 */
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore, type AuthTokenPair } from '../store/auth';
import { revokeToken } from '../api/endpoints/auth';
import type { UserProfile } from '../api/endpoints/user';

export function useAuth() {
  const router = useRouter();
  const {
    tokens,
    user,
    isAuthenticated,
    biometricEnabled,
    isHydrating,
    setTokens,
    setUser,
    setBiometricEnabled,
    logout: storeLogout,
  } = useAuthStore();

  /**
   * Full sign-in: persist tokens + update state.
   */
  const signIn = useCallback(
    async (tokenPair: AuthTokenPair, profile?: UserProfile) => {
      await setTokens(tokenPair);
      if (profile) setUser(profile);
    },
    [setTokens, setUser],
  );

  /**
   * Full sign-out: revoke refresh token on server, clear local state,
   * then navigate to login screen.
   */
  const signOut = useCallback(async () => {
    try {
      if (tokens?.refreshToken) {
        await revokeToken({ refreshToken: tokens.refreshToken });
      }
    } catch {
      // Best-effort server revocation; proceed with local cleanup
    }
    await storeLogout();
    router.replace('/');
  }, [tokens, storeLogout, router]);

  return {
    tokens,
    user,
    isAuthenticated,
    biometricEnabled,
    isHydrating,
    signIn,
    signOut,
    setUser,
    setBiometricEnabled,
  } as const;
}

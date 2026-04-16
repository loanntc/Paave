/**
 * Auth store — Zustand
 *
 * Holds JWT tokens, current user profile, and auth flags.
 * Hydrated from secure storage on app launch.
 */
import { create } from 'zustand';
import { SecureStorage } from '../services/secure-storage';
import type { UserProfile } from '../api/endpoints/user';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  /** JWT tokens (null when logged out) */
  tokens: AuthTokenPair | null;
  /** Current user profile */
  user: UserProfile | null;
  /** Derived convenience flag */
  isAuthenticated: boolean;
  /** Whether biometric login is enabled on this device */
  biometricEnabled: boolean;
  /** True while hydrate() is running */
  isHydrating: boolean;

  // Actions
  setTokens: (tokens: AuthTokenPair) => Promise<void>;
  setUser: (user: UserProfile) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  logout: () => Promise<void>;
  /** Read persisted tokens from secure storage into state */
  hydrate: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>((set, get) => ({
  tokens: null,
  user: null,
  isAuthenticated: false,
  biometricEnabled: false,
  isHydrating: false,

  setTokens: async (tokens) => {
    await SecureStorage.setAccessToken(tokens.accessToken);
    await SecureStorage.setRefreshToken(tokens.refreshToken);
    set({ tokens, isAuthenticated: true });
  },

  setUser: (user) => {
    set({ user });
  },

  setBiometricEnabled: (enabled) => {
    set({ biometricEnabled: enabled });
  },

  logout: async () => {
    await SecureStorage.clearTokens();
    set({
      tokens: null,
      user: null,
      isAuthenticated: false,
      biometricEnabled: false,
    });
  },

  hydrate: async () => {
    if (get().isHydrating) return;
    set({ isHydrating: true });

    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStorage.getAccessToken(),
        SecureStorage.getRefreshToken(),
      ]);

      if (accessToken && refreshToken) {
        set({
          tokens: { accessToken, refreshToken },
          isAuthenticated: true,
        });
      }
    } finally {
      set({ isHydrating: false });
    }
  },
}));

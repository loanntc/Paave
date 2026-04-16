/**
 * Secure storage wrapper — expo-secure-store
 *
 * All sensitive data (tokens, biometric keys) go through this service
 * so storage keys are centralised and access is type-safe.
 */
import * as ExpoSecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'paave_access_token',
  REFRESH_TOKEN: 'paave_refresh_token',
  BIOMETRIC_PUBLIC_KEY: 'paave_biometric_pub',
  DEVICE_ID: 'paave_device_id',
  BIOMETRIC_USERNAME: 'paave_biometric_user',
} as const;

async function getItem(key: string): Promise<string | null> {
  try {
    return await ExpoSecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  await ExpoSecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  try {
    await ExpoSecureStore.deleteItemAsync(key);
  } catch {
    // Ignore if key does not exist
  }
}

export const SecureStorage = {
  // ---- Access Token ----
  getAccessToken: () => getItem(KEYS.ACCESS_TOKEN),
  setAccessToken: (token: string) => setItem(KEYS.ACCESS_TOKEN, token),
  deleteAccessToken: () => deleteItem(KEYS.ACCESS_TOKEN),

  // ---- Refresh Token ----
  getRefreshToken: () => getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => setItem(KEYS.REFRESH_TOKEN, token),
  deleteRefreshToken: () => deleteItem(KEYS.REFRESH_TOKEN),

  // ---- Clear all auth tokens ----
  clearTokens: async () => {
    await Promise.all([
      deleteItem(KEYS.ACCESS_TOKEN),
      deleteItem(KEYS.REFRESH_TOKEN),
    ]);
  },

  // ---- Biometric credentials ----
  getBiometricPublicKey: () => getItem(KEYS.BIOMETRIC_PUBLIC_KEY),
  setBiometricPublicKey: (key: string) =>
    setItem(KEYS.BIOMETRIC_PUBLIC_KEY, key),
  deleteBiometricPublicKey: () => deleteItem(KEYS.BIOMETRIC_PUBLIC_KEY),

  getBiometricUsername: () => getItem(KEYS.BIOMETRIC_USERNAME),
  setBiometricUsername: (username: string) =>
    setItem(KEYS.BIOMETRIC_USERNAME, username),
  deleteBiometricUsername: () => deleteItem(KEYS.BIOMETRIC_USERNAME),

  // ---- Device ID ----
  getDeviceId: () => getItem(KEYS.DEVICE_ID),
  setDeviceId: (id: string) => setItem(KEYS.DEVICE_ID, id),

  // ---- Generic helpers ----
  get: getItem,
  set: setItem,
  delete: deleteItem,
} as const;

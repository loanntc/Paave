/**
 * Device ID service
 *
 * Generates and persists a unique device identifier in secure storage.
 * Used for: biometric registration, session management, analytics.
 */
import { SecureStorage } from './secure-storage';

/**
 * Generate a v4-like UUID using Math.random (no crypto dependency needed
 * at the app layer — this is a device fingerprint, not a security token).
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    },
  );
}

/**
 * Get the persisted device ID. Generates and stores one if it does
 * not exist yet (first launch).
 */
export async function getDeviceId(): Promise<string> {
  let id = await SecureStorage.getDeviceId();

  if (!id) {
    id = generateUUID();
    await SecureStorage.setDeviceId(id);
  }

  return id;
}

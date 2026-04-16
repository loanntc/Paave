/**
 * Biometric service — expo-local-authentication wrapper
 *
 * Provides capability checks and authentication prompts
 * for Face ID (iOS) and Fingerprint (Android).
 */
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export type BiometricType = 'face' | 'fingerprint' | 'iris' | 'none';

export interface BiometricCapability {
  /** Whether any biometric hardware is available */
  available: boolean;
  /** Whether biometrics are enrolled on the device */
  enrolled: boolean;
  /** Detected biometric type */
  type: BiometricType;
  /** Security level */
  level: LocalAuthentication.SecurityLevel;
}

/**
 * Map expo-local-authentication types to our simplified enum.
 */
function mapBiometricType(
  types: LocalAuthentication.AuthenticationType[],
): BiometricType {
  if (
    types.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    )
  ) {
    return 'face';
  }
  if (
    types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
  ) {
    return 'fingerprint';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'iris';
  }
  return 'none';
}

/**
 * Check device biometric capability and enrollment status.
 */
export async function checkBiometricCapability(): Promise<BiometricCapability> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes =
    await LocalAuthentication.supportedAuthenticationTypesAsync();
  const level = await LocalAuthentication.getEnrolledLevelAsync();

  return {
    available: hasHardware,
    enrolled: isEnrolled,
    type: mapBiometricType(supportedTypes),
    level,
  };
}

/**
 * Prompt the user for biometric authentication.
 * Returns true if authentication succeeded.
 */
export async function authenticateWithBiometric(
  promptMessage?: string,
): Promise<boolean> {
  const defaultPrompt =
    Platform.OS === 'ios'
      ? 'Xac nhan bang Face ID'
      : 'Xac nhan bang van tay';

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: promptMessage ?? defaultPrompt,
    cancelLabel: 'Huy',
    disableDeviceFallback: false,
    fallbackLabel: 'Nhap mat khau',
  });

  return result.success;
}

/**
 * Human-readable label for the biometric type (Vietnamese).
 */
export function biometricLabel(type: BiometricType): string {
  switch (type) {
    case 'face':
      return 'Face ID';
    case 'fingerprint':
      return Platform.OS === 'ios' ? 'Touch ID' : 'Van tay';
    case 'iris':
      return 'Iris';
    case 'none':
    default:
      return '';
  }
}

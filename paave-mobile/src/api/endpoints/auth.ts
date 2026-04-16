/**
 * Auth API endpoints — 15 typed functions
 * Source: paave_api_spec.md — Authentication section (26 endpoints, mobile-relevant subset)
 */
import { apiClient, unwrap, type ApiEnvelope } from '../client';

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface OtpResponse {
  otpId: string;
  expiresIn?: number;
}

export interface TwoFactorInitResponse {
  otpId: string;
  partialToken: string;
}

export interface StepUpTokenResponse {
  stepUpToken: string;
  expiresAt: string;
}

export interface BiometricStatusResponse {
  registered: boolean;
  publicKey?: string;
  deviceId?: string;
}

export interface PasswordResetVerifyResponse {
  resetToken: string;
}

export type SocialProvider = 'GOOGLE' | 'FACEBOOK' | 'APPLE';
export type OtpIdType = 'PHONE' | 'EMAIL';
export type OtpTxType = 'REGISTER' | 'RESET_PASSWORD' | 'UPDATE_PROFILE';
export type StepUpAction =
  | 'WITHDRAW'
  | 'TRANSFER_CASH'
  | 'TRANSFER_STOCK'
  | 'CHANGE_BANK_ACCOUNT'
  | 'CHANGE_PASSWORD'
  | 'CHANGE_MFA'
  | 'EXPORT_DATA'
  | 'CHANGE_CLIENT_SECRET';

// ---------------------------------------------------------------------------
// 1. Login — password
// ---------------------------------------------------------------------------

export async function loginWithPassword(params: {
  username: string;
  password: string;
  deviceId?: string;
}): Promise<AuthTokens> {
  const res = await apiClient.post<ApiEnvelope<AuthTokens>>(
    '/auth/login/password',
    {
      username: params.username,
      password: params.password,
      device_id: params.deviceId,
    },
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 2. Login — social
// ---------------------------------------------------------------------------

export async function loginWithSocial(params: {
  socialToken: string;
  socialType: SocialProvider;
  deviceId?: string;
}): Promise<AuthTokens> {
  const res = await apiClient.post<ApiEnvelope<AuthTokens>>(
    '/auth/login/social',
    {
      socialToken: params.socialToken,
      socialType: params.socialType,
      device_id: params.deviceId,
    },
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 3. Login — biometric
// ---------------------------------------------------------------------------

export async function loginWithBiometric(params: {
  username: string;
  signature: string;
  deviceId: string;
  timestamp: number;
  nonce?: string;
  platform?: string;
  osVersion?: string;
  appVersion?: string;
}): Promise<AuthTokens> {
  const res = await apiClient.post<ApiEnvelope<AuthTokens>>(
    '/auth/login/biometric',
    params,
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 4. Login — 2FA initiate
// ---------------------------------------------------------------------------

export async function login2FA(params: {
  username: string;
  password: string;
  deviceId?: string;
}): Promise<TwoFactorInitResponse> {
  const res = await apiClient.post<ApiEnvelope<TwoFactorInitResponse>>(
    '/auth/login/2fa',
    {
      username: params.username,
      password: params.password,
      device_id: params.deviceId,
    },
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 5. Login — 2FA verify OTP
// ---------------------------------------------------------------------------

export async function verify2FAOTP(params: {
  partialToken: string;
  otpId: string;
  otpValue: string;
  deviceId?: string;
  platform?: string;
  osVersion?: string;
  appVersion?: string;
}): Promise<AuthTokens> {
  const res = await apiClient.post<ApiEnvelope<AuthTokens>>(
    '/auth/login/2fa/verify-otp',
    {
      partial_token: params.partialToken,
      otpId: params.otpId,
      otpValue: params.otpValue,
      deviceId: params.deviceId,
      platform: params.platform,
      osVersion: params.osVersion,
      appVersion: params.appVersion,
    },
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 6. Send OTP
// ---------------------------------------------------------------------------

export async function sendOTP(params: {
  id: string;
  idType: OtpIdType;
  txType: OtpTxType;
}): Promise<OtpResponse> {
  const res = await apiClient.post<ApiEnvelope<OtpResponse>>(
    '/auth/otp',
    params,
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 7. Verify OTP
// ---------------------------------------------------------------------------

export async function verifyOTP(params: {
  otpId: string;
  otpValue: string;
}): Promise<void> {
  await apiClient.post('/auth/otp/verify', params);
}

// ---------------------------------------------------------------------------
// 8. Refresh token
// ---------------------------------------------------------------------------

export async function refreshToken(params: {
  refreshToken: string;
}): Promise<AuthTokens> {
  const res = await apiClient.post<ApiEnvelope<AuthTokens>>(
    '/auth/token/refresh',
    {
      grantType: 'refresh_token',
      refreshToken: params.refreshToken,
    },
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 9. Revoke token (logout)
// ---------------------------------------------------------------------------

export async function revokeToken(params: {
  refreshToken: string;
}): Promise<void> {
  await apiClient.post('/auth/token/revoke', {
    refreshToken: params.refreshToken,
  });
}

// ---------------------------------------------------------------------------
// 10. Password reset — request
// ---------------------------------------------------------------------------

export async function requestPasswordReset(params: {
  username: string;
}): Promise<OtpResponse> {
  const res = await apiClient.post<ApiEnvelope<OtpResponse>>(
    '/auth/password/reset/request',
    params,
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 11. Password reset — verify OTP
// ---------------------------------------------------------------------------

export async function verifyPasswordResetOTP(params: {
  otpId: string;
  otpValue: string;
}): Promise<PasswordResetVerifyResponse> {
  const res = await apiClient.post<
    ApiEnvelope<PasswordResetVerifyResponse>
  >('/auth/password/reset/verify-otp', params);
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 12. Password reset — complete
// ---------------------------------------------------------------------------

export async function completePasswordReset(params: {
  resetToken: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.post('/auth/password/reset/complete', params);
}

// ---------------------------------------------------------------------------
// 13. Biometric — register
// ---------------------------------------------------------------------------

export async function registerBiometric(params: {
  password: string;
  publicKey: string;
  deviceId: string;
}): Promise<OtpResponse> {
  const res = await apiClient.post<ApiEnvelope<OtpResponse>>(
    '/auth/biometric/register',
    params,
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 14. Biometric — status
// ---------------------------------------------------------------------------

export async function getBiometricStatus(
  deviceId?: string,
): Promise<BiometricStatusResponse> {
  const res = await apiClient.get<ApiEnvelope<BiometricStatusResponse>>(
    '/auth/biometric/status',
    { params: deviceId ? { deviceId } : undefined },
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// 15. Step-up token (for sensitive actions)
// ---------------------------------------------------------------------------

export async function requestStepUp(params: {
  actionType: StepUpAction;
  method: 'password' | 'biometric';
  password?: string;
  biometricSignature?: string;
  deviceId?: string;
}): Promise<StepUpTokenResponse> {
  const res = await apiClient.post<ApiEnvelope<StepUpTokenResponse>>(
    '/auth/stepup',
    params,
  );
  return unwrap(res);
}

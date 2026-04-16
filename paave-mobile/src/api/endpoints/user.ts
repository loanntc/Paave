/**
 * User API endpoints
 * Source: paave_api_spec.md — Users section
 */
import { apiClient, unwrap, type ApiEnvelope } from '../client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  email: string;
  fullname: string;
  username?: string;
  nationality?: string;
  dob?: string;
  bio?: string;
  avatarUrl?: string;
  biometricEnabled?: boolean;
  twoFactorEnabled?: boolean;
  tier?: number;
  xp?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterUserParams {
  registeredUsername: string;
  email: string;
  password: string;
  fullname: string;
  otpKey: string;
  deviceId?: string;
}

export interface RegisterUserResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface AvailabilityCheckParams {
  type: 'EMAIL' | 'USERNAME';
  value: string;
}

export interface AvailabilityCheckResponse {
  available: boolean;
}

// ---------------------------------------------------------------------------
// registerUser — POST /users
// ---------------------------------------------------------------------------

export async function registerUser(
  params: RegisterUserParams,
): Promise<RegisterUserResponse> {
  const res = await apiClient.post<ApiEnvelope<RegisterUserResponse>>(
    '/users',
    params,
  );
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// getMe — GET /users/me
// ---------------------------------------------------------------------------

export async function getMe(): Promise<UserProfile> {
  const res = await apiClient.get<ApiEnvelope<UserProfile>>('/users/me');
  return unwrap(res);
}

// ---------------------------------------------------------------------------
// checkAvailability — POST /users/availability-checks
// ---------------------------------------------------------------------------

export async function checkAvailability(
  params: AvailabilityCheckParams,
): Promise<AvailabilityCheckResponse> {
  const res = await apiClient.post<ApiEnvelope<AvailabilityCheckResponse>>(
    '/users/availability-checks',
    params,
  );
  return unwrap(res);
}

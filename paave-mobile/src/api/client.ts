/**
 * Axios API client — single configured instance for the entire app.
 */
import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL, API_VERSION, APP_VERSION } from '../config/env';
import { setupAuthInterceptors } from './interceptors/auth';
import { setupErrorInterceptor } from './interceptors/error';
import { SecureStorage } from '../services/secure-storage';

// ---------------------------------------------------------------------------
// Create instance
// ---------------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Version': APP_VERSION,
    'X-Platform': Platform.OS,
  },
});

// ---------------------------------------------------------------------------
// Token refresh function (injected into auth interceptor)
// ---------------------------------------------------------------------------

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Use a raw axios call (not the intercepted client) to avoid loops
    const response = await axios.post(
      `${API_BASE_URL}${API_VERSION}/auth/token/refresh`,
      {
        grantType: 'refresh_token',
        refreshToken,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      },
    );

    const newAccessToken: string | undefined =
      response.data?.data?.accessToken ?? response.data?.data?.access_token;

    if (newAccessToken) {
      await SecureStorage.setAccessToken(newAccessToken);
      return newAccessToken;
    }

    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Attach interceptors
// ---------------------------------------------------------------------------

setupErrorInterceptor(apiClient);
setupAuthInterceptors(apiClient, refreshAccessToken);

// ---------------------------------------------------------------------------
// Helper to unwrap the standard { success, data, error, meta } envelope
// ---------------------------------------------------------------------------

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: null | { code: string; message: string; details?: unknown };
  meta?: { request_id: string; timestamp: string; version: string };
}

/**
 * Unwrap the server envelope and return only the `data` field.
 * All error cases are already handled by the error interceptor.
 */
export function unwrap<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.data;
}

export { apiClient };

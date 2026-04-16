/**
 * Auth interceptors — attach Bearer token on requests,
 * handle 401 with transparent token refresh + replay.
 *
 * Uses a singleton refresh promise to prevent race conditions
 * when multiple requests fail with 401 simultaneously.
 */
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { SecureStorage } from '../../services/secure-storage';

/** Extend Axios config to track retry */
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/** Queue of requests waiting for the refresh to complete */
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

/**
 * Attach auth interceptors to an Axios instance.
 * `refreshTokenFn` is injected to avoid circular imports with the client module.
 */
export function setupAuthInterceptors(
  client: AxiosInstance,
  refreshTokenFn: () => Promise<string | null>,
) {
  // ---------- REQUEST ----------
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await SecureStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // ---------- RESPONSE (401 handling) ----------
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableConfig | undefined;

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry
      ) {
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          originalRequest._retry = true;
          return client(originalRequest);
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        refreshPromise = refreshTokenFn();
        const newToken = await refreshPromise;

        if (newToken) {
          await SecureStorage.setAccessToken(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          return client(originalRequest);
        }

        // Refresh failed — no valid token returned
        processQueue(new Error('Token refresh failed'), null);
        return Promise.reject(error);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear stored tokens on refresh failure
        await SecureStorage.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    },
  );
}

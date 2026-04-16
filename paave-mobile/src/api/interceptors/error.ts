/**
 * Error interceptor — normalise API errors into a consistent shape.
 */
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ApiErrorDetail {
  /** Machine-readable error code (e.g. "VALIDATION_ERROR") */
  code: string;
  /** Human-readable message (may be Vietnamese) */
  message: string;
  /** Optional field-level or contextual details */
  details?: Record<string, unknown>;
  /** HTTP status code */
  status: number;
  /** Server request ID for support/debugging */
  requestId?: string;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;
  requestId?: string;

  constructor(info: ApiErrorDetail) {
    super(info.message);
    this.name = 'ApiError';
    this.code = info.code;
    this.status = info.status;
    this.details = info.details;
    this.requestId = info.requestId;
  }
}

// ---------------------------------------------------------------------------
// Interceptor setup
// ---------------------------------------------------------------------------

interface ServerErrorBody {
  success: false;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    request_id?: string;
  };
}

function isServerError(data: unknown): data is ServerErrorBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as Record<string, unknown>).success === false
  );
}

export function setupErrorInterceptor(client: AxiosInstance) {
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ServerErrorBody>) => {
      const status = error.response?.status ?? 0;
      const data = error.response?.data;

      // Network / timeout errors
      if (!error.response) {
        return Promise.reject(
          new ApiError({
            code: 'NETWORK_ERROR',
            message: 'Khong the ket noi. Vui long kiem tra mang.',
            status: 0,
          }),
        );
      }

      // Server returned structured error
      if (isServerError(data)) {
        return Promise.reject(
          new ApiError({
            code: data.error?.code ?? `HTTP_${status}`,
            message:
              data.error?.message ?? `Loi khong xac dinh (${status})`,
            details: data.error?.details,
            status,
            requestId: data.meta?.request_id,
          }),
        );
      }

      // Fallback for unexpected shapes
      return Promise.reject(
        new ApiError({
          code: `HTTP_${status}`,
          message: error.message || `Loi HTTP ${status}`,
          status,
        }),
      );
    },
  );
}

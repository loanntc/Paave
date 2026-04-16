/**
 * Environment configuration
 * Values loaded from Expo environment variables (EXPO_PUBLIC_ prefix)
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://api.paave.app';

export const API_VERSION = '/api/v1';

export const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';

export const ENV = (process.env.EXPO_PUBLIC_ENV || 'production') as
  | 'development'
  | 'staging'
  | 'production';

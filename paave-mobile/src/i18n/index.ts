/**
 * i18n — simple dot-path lookup helper.
 *
 * Usage:
 *   t('registration.ctaCreateAccount') => "Tao tai khoan"
 *   t('common.next')                   => "Tiep tuc"
 */
import vi, { type Translations } from './vi';

// ---------------------------------------------------------------------------
// Current locale (expandable to multi-language later)
// ---------------------------------------------------------------------------

let currentStrings: Translations = vi;

/**
 * Set the active translation object (for future locale switching).
 */
export function setLocale(strings: Translations): void {
  currentStrings = strings;
}

/**
 * Look up a translation string by dot-separated key path.
 *
 * @example t('registration.emailLabel') // => "Email"
 * @example t('common.next')             // => "Tiep tuc"
 *
 * Returns the key itself if the path is not found (makes missing
 * translations visible in the UI during development).
 */
export function t(path: string): string {
  const parts = path.split('.');
  let current: unknown = currentStrings;

  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return path;
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current === 'string') {
    return current;
  }

  return path;
}

/**
 * Lookup with interpolation support.
 *
 * @example ti('emailVerification.errorWrongCode', { remaining: 3 })
 */
export function ti(
  path: string,
  params: Record<string, string | number>,
): string {
  let result = t(path);
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

export { vi };
export type { Translations };

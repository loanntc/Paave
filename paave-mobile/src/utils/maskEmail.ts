/**
 * Email masking utility
 *
 * Pattern from Screen 21 (FR-48):
 *   "lo***@gmail.com"
 *
 * Shows first 2 characters of the local part, replaces the rest with ***,
 * keeps the full domain.
 */

/**
 * Mask an email address for display.
 *
 * @example maskEmail("loan@gmail.com")     => "lo***@gmail.com"
 * @example maskEmail("a@example.com")      => "a***@example.com"
 * @example maskEmail("abcdef@paave.app")   => "ab***@paave.app"
 */
export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex < 0) return email;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);

  // Show up to 2 characters of the local part
  const visible = local.slice(0, Math.min(2, local.length));

  return `${visible}***${domain}`;
}

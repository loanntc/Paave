/**
 * Formatting utilities
 *
 * Currency and date formatting following Vietnamese locale conventions
 * from design-system.md Section 10.2.
 */

// ---------------------------------------------------------------------------
// Currency (VND)
// ---------------------------------------------------------------------------

/**
 * Format a number as Vietnamese Dong.
 *
 * VN locale rules:
 *   - Thousand separator: `.`
 *   - No decimal places (VND has no minor unit)
 *   - Currency symbol suffix: `d` (abbreviation)
 *
 * @example formatCurrency(4250000) => "4.250.000"
 * @example formatCurrency(4250000, { symbol: true }) => "4.250.000d"
 * @example formatCurrency(-125000, { sign: true }) => "-125.000"
 */
export function formatCurrency(
  value: number,
  options?: { symbol?: boolean; sign?: boolean },
): string {
  const { symbol = false, sign = false } = options ?? {};

  const absValue = Math.abs(value);
  const formatted = absValue
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  let result = '';

  if (sign && value > 0) {
    result = `+${formatted}`;
  } else if (value < 0) {
    result = `-${formatted}`;
  } else {
    result = formatted;
  }

  if (symbol) {
    result += 'd';
  }

  return result;
}

/**
 * Format a number with the full VND prefix.
 *
 * @example formatCurrencyFull(4250000) => "₫4.250.000"
 */
export function formatCurrencyFull(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return value < 0 ? `-₫${formatted}` : `₫${formatted}`;
}

// ---------------------------------------------------------------------------
// Percentage
// ---------------------------------------------------------------------------

/**
 * Format a number as a percentage with Vietnamese decimal comma.
 *
 * @example formatPercent(3.02) => "+3,02%"
 * @example formatPercent(-1.5) => "-1,50%"
 * @example formatPercent(0)    => "0,00%"
 */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value > 0 ? '+' : '';
  const formatted = value.toFixed(decimals).replace('.', ',');
  return `${sign}${formatted}%`;
}

// ---------------------------------------------------------------------------
// Date
// ---------------------------------------------------------------------------

/**
 * Format a date as DD/MM/YYYY (Vietnamese locale convention).
 *
 * @example formatDate(new Date(2026, 3, 16)) => "16/04/2026"
 * @example formatDate("2026-04-16") => "16/04/2026"
 */
export function formatDate(input: Date | string): string {
  const date = typeof input === 'string' ? new Date(input) : input;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format a date as relative time in Vietnamese.
 *
 * @example formatRelativeTime(fiveMinutesAgo) => "5 phut truoc"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vua xong';
  if (diffMin < 60) return `${diffMin} phut truoc`;
  if (diffHour < 24) return `${diffHour} gio truoc`;
  if (diffDay < 7) return `${diffDay} ngay truoc`;

  return formatDate(d);
}

/**
 * Paave Design System — Spacing & Layout
 * Source: design-system.md Section 4
 * 8px base grid
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
} as const;

export const Layout = {
  /** Horizontal screen padding (space-4) */
  screenPadding: 16,
  /** Gap between cards (space-3) */
  cardGap: 12,
  /** Gap between sections (space-6) */
  sectionGap: 24,
  /** Minimum supported screen width */
  minWidth: 375,
  /** Content max width (mobile-only) */
  contentMaxWidth: 375,
  /** Bottom nav bar height */
  bottomNavHeight: 64,
  /** Bottom nav clearance (with safe area) */
  bottomNavClearance: 80,
  /** Minimum touch target (Apple HIG / Material) */
  minTouchTarget: 44,
  /** Preferred primary button height */
  buttonHeight: 52,
  /** Chip / tag height */
  chipHeight: 32,
} as const;

export type SpacingTokens = typeof Spacing;

/**
 * Paave Design System — Border Radius
 * Source: design-system.md Section 5
 */

export const BorderRadius = {
  /** Chips, tags, small inputs */
  sm: 8,
  /** Cards (standard) */
  md: 12,
  /** Large cards, bottom sheets */
  lg: 16,
  /** Hero cards, modals */
  xl: 24,
  /** Pills, avatar circles, toggles */
  full: 9999,
} as const;

export type BorderRadiusTokens = typeof BorderRadius;

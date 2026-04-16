/**
 * Paave Design System — Shadows (Platform-compatible)
 * Source: design-system.md Section 6
 *
 * React Native uses a different shadow API on iOS vs Android:
 *   iOS  — shadowColor / shadowOffset / shadowOpacity / shadowRadius
 *   Android — elevation
 * We export both for each token so consumers can spread directly.
 */
import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

function shadow(
  color: string,
  offsetX: number,
  offsetY: number,
  opacity: number,
  radius: number,
  elevation: number,
): ShadowStyle {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: offsetX, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: offsetX, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation,
    },
  }) as ShadowStyle;
}

export const Shadows = {
  /** Standard card elevation */
  card: shadow('#000000', 0, 1, 0.4, 3, 2),

  /** Floating cards, selected state */
  cardRaised: shadow('#000000', 0, 4, 0.5, 12, 6),

  /** Bottom sheets */
  sheet: shadow('#000000', 0, -8, 0.6, 32, 12),

  /** Accent button glow */
  glowAccent: shadow('#3B82F6', 0, 0, 0.3, 20, 4),

  /** Positive P&L hero highlight */
  glowPositive: shadow('#10B981', 0, 0, 0.25, 16, 3),

  /** No shadow (reset) */
  none: shadow('transparent', 0, 0, 0, 0, 0),
} as const;

export type ShadowTokens = typeof Shadows;

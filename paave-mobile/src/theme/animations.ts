/**
 * Paave Design System — Animation Specifications
 * Source: design-system.md Section 8
 *
 * Easing curves expressed as [x1, y1, x2, y2] for use with
 * react-native-reanimated's Easing.bezier().
 */
import { Easing } from 'react-native-reanimated';

// ---------------------------------------------------------------------------
// Easing curves (Section 8.1)
// ---------------------------------------------------------------------------

export const EasingCurves = {
  /** Most transitions */
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  /** Elements entering screen */
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  /** Elements leaving screen */
  accelerate: Easing.bezier(0.4, 0.0, 1.0, 1),
  /** Bouncy interactions (tab switch, card press) */
  spring: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** Abrupt transitions */
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
} as const;

/** Raw cubic-bezier tuples for consumers that cannot use Easing directly */
export const EasingValues = {
  standard: [0.4, 0.0, 0.2, 1] as const,
  decelerate: [0.0, 0.0, 0.2, 1] as const,
  accelerate: [0.4, 0.0, 1.0, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  sharp: [0.4, 0.0, 0.6, 1] as const,
} as const;

// ---------------------------------------------------------------------------
// Duration scale (Section 8.2) — milliseconds
// ---------------------------------------------------------------------------

export const Duration = {
  /** Button press feedback */
  instant: 80,
  /** Chip toggle, checkbox */
  fast: 150,
  /** Card transitions, page enters */
  standard: 250,
  /** Bottom sheet open/close */
  slow: 350,
  /** Chart draw-in, number roll-up */
  deliberate: 500,
  /** Onboarding transitions */
  extended: 800,
} as const;

// ---------------------------------------------------------------------------
// Pre-composed animation configs for common patterns
// ---------------------------------------------------------------------------

export const AnimationPresets = {
  /** Splash logo entrance */
  logoAppear: {
    duration: 600,
    easing: EasingCurves.decelerate,
    translateY: { from: 20, to: 0 },
    opacity: { from: 0, to: 1 },
  },

  /** Card press down */
  cardPressIn: {
    duration: Duration.instant,
    easing: EasingCurves.sharp,
    scale: { from: 1, to: 0.97 },
  },

  /** Card press release */
  cardPressOut: {
    duration: Duration.fast,
    easing: EasingCurves.spring,
    scale: { from: 0.97, to: 1 },
  },

  /** Bottom sheet open */
  sheetOpen: {
    duration: Duration.slow,
    easing: EasingCurves.decelerate,
    translateY: { from: '100%', to: 0 },
  },

  /** Bottom sheet close */
  sheetClose: {
    duration: 300,
    easing: EasingCurves.accelerate,
    translateY: { from: 0, to: '100%' },
  },

  /** Toast enter */
  toastEnter: {
    duration: 300,
    easing: EasingCurves.decelerate,
    translateY: { from: -100, to: 0 },
    opacity: { from: 0, to: 1 },
  },

  /** Toast exit */
  toastExit: {
    duration: Duration.standard,
    easing: EasingCurves.accelerate,
    translateY: { from: 0, to: -100 },
    opacity: { from: 1, to: 0 },
  },

  /** Toast auto-dismiss delay */
  toastAutoDismiss: 3000,

  /** Number roll-up (financial data) */
  numberRollUp: {
    duration: Duration.deliberate,
    easing: EasingCurves.decelerate,
  },

  /** Skeleton shimmer loop */
  skeletonShimmer: {
    duration: 1500,
    loop: true,
  },

  /** Content reveal after skeleton */
  contentReveal: {
    duration: 200,
    easing: EasingCurves.standard,
    stagger: 50,
  },

  /** Screen transition (tab switch) */
  screenTransition: {
    duration: Duration.standard,
    easing: EasingCurves.decelerate,
    translateY: { from: 8, to: 0 },
    opacity: { from: 0, to: 1 },
  },

  /** Price flash (up/down) */
  priceFlash: {
    flashDuration: 300,
    returnDuration: 600,
    easing: EasingCurves.standard,
  },

  /** Success checkmark */
  successCheck: {
    duration: 300,
    easing: EasingCurves.spring,
    scale: { from: 0, to: 1 },
  },

  /** Error shake */
  errorShake: {
    duration: 200,
    sequence: [0, -8, 8, -6, 6, -3, 3, 0],
  },
} as const;

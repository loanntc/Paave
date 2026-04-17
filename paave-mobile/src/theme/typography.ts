/**
 * Paave Design System — Typography
 * Font: Manrope (matches Figma v2 reference design)
 * Weights: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)
 */

export const Fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
} as const;

export const Typography = {
  // Display — ExtraBold for impact (headlines ≥ 20px)
  displayXl: {
    fontSize: 40,
    fontFamily: Fonts.extraBold,
    lineHeight: 44,
    letterSpacing: -0.9,
  },
  displayLg: {
    fontSize: 32,
    fontFamily: Fonts.extraBold,
    lineHeight: 40,
    letterSpacing: -0.9,
  },
  displayMd: {
    fontSize: 24,
    fontFamily: Fonts.extraBold,
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  // Titles
  titleLg: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    lineHeight: 28,
    letterSpacing: -1,
  },
  titleMd: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    lineHeight: 28,
  },
  titleSm: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    lineHeight: 24,
  },
  // Body
  bodyLg: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
  },
  bodyMd: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  bodySm: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  // Caption / Label
  caption: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  captionBold: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  // ALL CAPS field labels — matches reference: 10px Bold, 1px tracking
  label: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    lineHeight: 15,
    letterSpacing: 1,
  },
  labelMd: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    lineHeight: 20,
  },
  // Wordmark / brand
  wordmark: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    lineHeight: 28,
    letterSpacing: -1,
  },
  // Step badge — cyan uppercase
  stepBadge: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    lineHeight: 15,
    letterSpacing: 2,
  },
} as const;

export type TypographyTokens = typeof Typography;
export type TypographyVariant = keyof typeof Typography;

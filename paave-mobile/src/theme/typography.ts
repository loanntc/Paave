/**
 * Paave Design System — Typography
 * Source: design-system.md Section 3
 * Font: IBM Plex Sans (loaded via @expo-google-fonts/ibm-plex-sans)
 */

export const Fonts = {
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semiBold: 'IBMPlexSans_600SemiBold',
  bold: 'IBMPlexSans_700Bold',
} as const;

export const Typography = {
  displayXl: {
    fontSize: 40,
    fontFamily: Fonts.bold,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  displayLg: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    lineHeight: 37,
    letterSpacing: -0.3,
  },
  displayMd: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    lineHeight: 29,
    letterSpacing: -0.2,
  },
  titleLg: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  titleMd: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    lineHeight: 24,
  },
  titleSm: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    lineHeight: 22,
  },
  bodyLg: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
  },
  bodyMd: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 21,
  },
  bodySm: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    lineHeight: 17,
    letterSpacing: 0.2,
  },
  captionBold: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    lineHeight: 17,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  labelMd: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    lineHeight: 20,
  },
} as const;

export type TypographyTokens = typeof Typography;
export type TypographyVariant = keyof typeof Typography;

/**
 * Paave Design System — Color Tokens
 * Updated to match Figma v2 reference (energetic navy + periwinkle palette)
 */

export const Colors = {
  bg: {
    primary: '#0B1326',    // deep navy (was #0D1117)
    secondary: '#0F1829',
    card: '#222A3D',       // blue-tinted dark (was #1F2937)
    cardDeep: '#131B2E',   // deeper card (T&C sections, social bg)
    cardHover: '#2D3449',
    overlay: 'rgba(0,0,0,0.60)',
    skeleton: '#222A3D',
    skeletonShine: '#2D3449',
  },

  accent: {
    // Periwinkle family — matches reference gradient
    primary: '#ADC6FF',            // periwinkle (text/icon accent)
    primaryDeep: '#4D8EFF',        // deep blue (gradient end)
    primaryHover: '#4D8EFF',
    primarySubtle: 'rgba(173,198,255,0.10)',
    // Gradient for CTA buttons — 168° from light to deep
    ctaGradientStart: '#ADC6FF',
    ctaGradientEnd: '#4D8EFF',
    ctaText: '#002E6A',            // dark navy text on gradient button
    // Cyan accent for step badges, timers
    cyan: '#4CD7F6',
    cyanSubtle: 'rgba(76,215,246,0.10)',
  },

  semantic: {
    positive: '#10B981',
    positiveSubtle: 'rgba(16,185,129,0.15)',
    negative: '#EF4444',
    negativeSubtle: 'rgba(239,68,68,0.15)',
    neutral: '#C2C6D6',
    warning: '#F59E0B',
    warningSubtle: 'rgba(245,158,11,0.15)',
  },

  text: {
    primary: '#DAE2FD',    // blue-tinted white (was #F9FAFB)
    secondary: '#C2C6D6',  // muted blue-grey (was #9CA3AF)
    tertiary: '#424754',   // label/hint (was #6B7280)
    inverse: '#002E6A',    // dark navy — on gradient buttons
    accent: '#ADC6FF',     // periwinkle links
    accentCyan: '#4CD7F6', // cyan step badges
    positive: '#10B981',
    negative: '#EF4444',
  },

  border: {
    default: '#2D3449',    // (was #374151)
    subtle: '#222A3D',
    focus: '#ADC6FF',      // periwinkle focus ring
    error: '#EF4444',
  },

  banner: {
    virtualBg: 'rgba(245,158,11,0.15)',
    virtualBorder: '#F59E0B',
    virtualText: '#F59E0B',
  },

  tier: {
    t1: '#10B981',
    t2: '#ADC6FF',
    t3: '#4CD7F6',
    t4: '#F59E0B',
    t5: '#8B5CF6',
    t6: '#EF4444',
  },

  sentiment: {
    bull: '#10B981',
    bear: '#EF4444',
    neutral: '#C2C6D6',
    bullBg: 'rgba(16,185,129,0.15)',
    bearBg: 'rgba(239,68,68,0.15)',
    neutralBg: 'rgba(194,198,214,0.15)',
  },

  xp: {
    barFill: '#ADC6FF',
    barTrack: '#222A3D',
  },

  streak: {
    active: '#F59E0B',
    frozen: '#4CD7F6',
  },

  chat: {
    userBg: '#ADC6FF',
    userText: '#002E6A',
    aiBg: '#222A3D',
    aiText: '#DAE2FD',
    disclaimerBg: 'rgba(66,71,84,0.1)',
    sourceText: '#C2C6D6',
  },
} as const;

export type ColorTokens = typeof Colors;

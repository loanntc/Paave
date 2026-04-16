/**
 * Paave Design System — Color Tokens
 * Source: design-system.md Section 2
 * Dark-mode-first palette
 */

export const Colors = {
  bg: {
    primary: '#0D1117',
    secondary: '#161B22',
    card: '#1F2937',
    cardHover: '#263244',
    overlay: 'rgba(0,0,0,0.60)',
    skeleton: '#1F2937',
    skeletonShine: '#2D3748',
  },

  accent: {
    primary: '#3B82F6',
    primaryHover: '#2563EB',
    primarySubtle: 'rgba(59,130,246,0.15)',
    secondary: '#06B6D4',
    secondarySubtle: 'rgba(6,182,212,0.15)',
  },

  semantic: {
    positive: '#10B981',
    positiveSubtle: 'rgba(16,185,129,0.15)',
    negative: '#EF4444',
    negativeSubtle: 'rgba(239,68,68,0.15)',
    neutral: '#9CA3AF',
    warning: '#F59E0B',
    warningSubtle: 'rgba(245,158,11,0.15)',
  },

  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
    inverse: '#0D1117',
    accent: '#3B82F6',
    positive: '#10B981',
    negative: '#EF4444',
  },

  border: {
    default: '#374151',
    subtle: '#1F2937',
    focus: '#3B82F6',
    error: '#EF4444',
  },

  banner: {
    virtualBg: 'rgba(245,158,11,0.15)',
    virtualBorder: '#F59E0B',
    virtualText: '#F59E0B',
  },

  tier: {
    t1: '#10B981',
    t2: '#3B82F6',
    t3: '#06B6D4',
    t4: '#F59E0B',
    t5: '#8B5CF6',
    t6: '#EF4444',
  },

  sentiment: {
    bull: '#10B981',
    bear: '#EF4444',
    neutral: '#9CA3AF',
    bullBg: 'rgba(16,185,129,0.15)',
    bearBg: 'rgba(239,68,68,0.15)',
    neutralBg: 'rgba(156,163,175,0.15)',
  },

  /** Gamification extras */
  xp: {
    barFill: '#3B82F6',
    barTrack: '#1F2937',
  },

  streak: {
    active: '#F59E0B',
    frozen: '#06B6D4',
  },

  chat: {
    userBg: '#3B82F6',
    userText: '#FFFFFF',
    aiBg: '#1F2937',
    aiText: '#F9FAFB',
    disclaimerBg: 'rgba(107,114,128,0.1)',
    sourceText: '#9CA3AF',
  },
} as const;

export type ColorTokens = typeof Colors;

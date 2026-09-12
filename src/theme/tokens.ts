/**
 * Ham tasarım tokenları.
 * Uygulamadaki TEK renk/ölçü kaynağı burasıdır.
 * Bileşenlerde asla sabit renk kodu (#xxxxxx) veya sabit piksel boşluğu yazılmaz.
 */

/** İndigo / Cam Göbeği paleti. */
export const palette = {
  indigo100: '#E0E7FF',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',

  cyan400: '#22D3EE',
  cyan500: '#06B6D4',
  cyan600: '#0891B2',

  emerald500: '#10B981',
  amber500: '#F59E0B',
  rose500: '#F43F5E',

  white: '#FFFFFF',
  black: '#000000',
} as const;

/** Açık tema nötr renkleri. */
export const lightNeutrals = {
  bg: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F7',
  border: '#E2E5EF',
  track: '#E5E7EF',
  text: '#111827',
  textMuted: '#6B7280',
} as const;

/** Koyu tema nötr renkleri. */
export const darkNeutrals = {
  bg: '#0B0D17',
  surface: '#171A2B',
  surfaceAlt: '#1F2338',
  border: '#2A2F48',
  track: '#2A2F48',
  text: '#E6E8F2',
  textMuted: '#9AA0B4',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 44, lineHeight: 52, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  subtitle: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  metric: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
} as const;

export type TypographyVariant = keyof typeof typography;

export const opacity = {
  pressed: 0.6,
  disabled: 0.4,
} as const;

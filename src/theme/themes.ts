import { darkNeutrals, lightNeutrals, opacity, palette, radius, spacing, typography } from './tokens';

export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  track: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
};

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  opacity: typeof opacity;
};

const shared = { spacing, radius, typography, opacity };

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    ...lightNeutrals,
    primary: palette.indigo600,
    primarySoft: palette.indigo100,
    onPrimary: palette.white,
    accent: palette.cyan600,
    success: palette.emerald500,
    warning: palette.amber500,
    danger: palette.rose500,
  },
  ...shared,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    ...darkNeutrals,
    primary: palette.indigo400,
    primarySoft: '#252A45',
    onPrimary: '#0B0D17',
    accent: palette.cyan400,
    success: palette.emerald500,
    warning: palette.amber500,
    danger: palette.rose500,
  },
  ...shared,
};

export function getTheme(mode: ThemeMode): Theme {
  return mode === 'dark' ? darkTheme : lightTheme;
}

import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import type { TypographyVariant } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { ThemeColors } from '@/theme/themes';

type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: keyof ThemeColors;
  align?: TextStyle['textAlign'];
};

/**
 * Tüm metinler bu bileşenden geçer: tipografi ve renk yalnızca tema
 * tokenlarından gelir, bileşenlerde sabit renk/punto yazılmaz.
 */
export function AppText({
  variant = 'body',
  color = 'text',
  align = 'auto',
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  return (
    <RNText
      {...rest}
      style={[theme.typography[variant], { color: theme.colors[color], textAlign: align }, style]}
    />
  );
}

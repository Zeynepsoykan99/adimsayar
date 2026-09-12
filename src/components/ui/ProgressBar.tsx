import { View } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import type { ThemeColors } from '@/theme/themes';

type ProgressBarProps = {
  /** 0–1 aralığında ilerleme. */
  ratio: number;
  color?: keyof ThemeColors;
  height?: number;
  accessibilityLabel?: string;
};

export function ProgressBar({
  ratio,
  color = 'primary',
  height = 10,
  accessibilityLabel,
}: ProgressBarProps) {
  const theme = useTheme();
  const safeRatio = Math.max(0, Math.min(1, ratio));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(safeRatio * 100) }}
      style={{
        height,
        flexDirection: 'row',
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.track,
        overflow: 'hidden',
      }}
    >
      {/* Flex oranı kullanılır: yüzde genişlik yerine RTL'de de doğru yönden dolar. */}
      <View
        style={{
          flex: safeRatio,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors[color],
        }}
      />
      <View style={{ flex: 1 - safeRatio }} />
    </View>
  );
}

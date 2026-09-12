import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '@/theme/useTheme';

type MetricTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit: string;
};

/** Adım bölümündeki yardımcı metrik kutusu (kalori, mesafe, aktif süre). */
export function MetricTile({ icon, label, value, unit }: MetricTileProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        gap: theme.spacing.xxs,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceAlt,
      }}
    >
      <Ionicons name={icon} size={16} color={theme.colors.accent} />
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing.xxs }}>
        <AppText variant="metric">{value}</AppText>
        <AppText variant="caption" color="textMuted">
          {unit}
        </AppText>
      </View>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

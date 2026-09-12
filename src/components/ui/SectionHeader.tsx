import { View } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '@/theme/useTheme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xxs }}>
      <AppText variant="subtitle">{title}</AppText>
      {subtitle ? (
        <AppText variant="caption" color="textMuted">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

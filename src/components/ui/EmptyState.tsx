import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '@/theme/useTheme';

type EmptyStateProps = {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** Kişisel bilgiler eksikken kalori ve su bölümlerinde gösterilir. */
export function EmptyState({ title, body, icon = 'information-circle-outline' }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        gap: theme.spacing.xs,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceAlt,
        alignItems: 'center',
      }}
    >
      <Ionicons name={icon} size={28} color={theme.colors.textMuted} />
      <AppText variant="bodyStrong" align="center">
        {title}
      </AppText>
      <AppText variant="caption" color="textMuted" align="center">
        {body}
      </AppText>
    </View>
  );
}

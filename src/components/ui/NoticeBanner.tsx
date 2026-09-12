import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { useTheme } from '@/theme/useTheme';

type NoticeTone = 'info' | 'warning';

type NoticeBannerProps = {
  title?: string;
  body: string;
  tone?: NoticeTone;
  onDismiss?: () => void;
  dismissLabel?: string;
};

/** Bilgi/uyarı şeridi: yeniden başlatma uyarısı, hedef kırpma bilgisi vb. */
export function NoticeBanner({
  title,
  body,
  tone = 'info',
  onDismiss,
  dismissLabel,
}: NoticeBannerProps) {
  const theme = useTheme();
  const accent = tone === 'warning' ? theme.colors.warning : theme.colors.accent;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surfaceAlt,
        borderStartWidth: 3,
        borderStartColor: accent,
      }}
    >
      <Ionicons
        name={tone === 'warning' ? 'alert-circle-outline' : 'information-circle-outline'}
        size={18}
        color={accent}
      />
      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        {title ? <AppText variant="label">{title}</AppText> : null}
        <AppText variant="caption" color="textMuted">
          {body}
        </AppText>
      </View>
      {onDismiss && dismissLabel ? (
        <IconButton name="close" onPress={onDismiss} accessibilityLabel={dismissLabel} size={18} />
      ) : null}
    </View>
  );
}

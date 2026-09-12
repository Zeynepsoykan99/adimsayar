import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { AppText } from './AppText';
import { useTheme } from '@/theme/useTheme';

type AvatarProps = {
  /** Kullanıcı adı; boşsa genel bir ikon gösterilir. */
  name: string;
  size?: number;
};

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return '';
  return trimmed.charAt(0).toLocaleUpperCase();
}

/** Baş harf avatarı. Fotoğraf yükleme Faz 1 kapsamında değildir. */
export function Avatar({ name, size = 40 }: AvatarProps) {
  const theme = useTheme();
  const initial = initialOf(name);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {initial.length > 0 ? (
        <AppText variant="bodyStrong" color="primary">
          {initial}
        </AppText>
      ) : (
        <Ionicons name="person-outline" size={size * 0.5} color={theme.colors.primary} />
      )}
    </View>
  );
}

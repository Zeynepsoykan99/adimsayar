import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/useTheme';

type ScreenProps = {
  children: ReactNode;
  /** Üst çentik boşluğu uygulansın mı (kendi başlığı olan ekranlarda kapatılır). */
  withTopInset?: boolean;
};

export function Screen({ children, withTopInset = true }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        paddingTop: withTopInset ? insets.top : 0,
      }}
    >
      {children}
    </View>
  );
}

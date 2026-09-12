import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useTheme } from '@/theme/useTheme';

export default function NotFoundScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.lg,
          padding: theme.spacing.lg,
        }}
      >
        <AppText variant="subtitle" align="center">
          {t('notFound.title')}
        </AppText>
        <Button label={t('notFound.action')} onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

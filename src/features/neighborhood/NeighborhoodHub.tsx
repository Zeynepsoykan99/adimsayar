import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/theme/useTheme';
import { isolateLtr } from '@/utils/bidi';

/**
 * Mahalle giriş noktası. Faz 3a: yalnızca oturum durumu.
 * Mahalle oluşturma/katılma 3b'de eklenecek; giriş o akışların içinden istenecek.
 */
export function NeighborhoodHub() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const start = useAuthStore((state) => state.start);

  useEffect(() => {
    start();
  }, [start]);

  if (status !== 'ready') {
    return <ActivityIndicator color={theme.colors.primary} />;
  }

  if (!user) {
    return (
      <Card>
        <SectionHeader title={t('neighborhood.title')} />
        <AppText variant="body" color="textMuted">
          {t('neighborhood.signInIntro')}
        </AppText>
        <Button
          label={t('neighborhood.signInButton')}
          onPress={() => router.push('/neighborhood/sign-in')}
        />
      </Card>
    );
  }

  return (
    <Card>
      <SectionHeader title={t('neighborhood.title')} />
      <AppText variant="body">
        {t('neighborhood.signedInAs', { email: isolateLtr(user.email ?? user.uid) })}
      </AppText>
    </Card>
  );
}

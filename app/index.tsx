import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { Screen } from '@/components/ui/Screen';
import { CaloriesSection } from '@/features/calories/CaloriesSection';
import { PersonalInfoSection } from '@/features/personal/PersonalInfoSection';
import { StepsSection } from '@/features/steps/StepsSection';
import { WaterSection } from '@/features/water/WaterSection';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/theme/useTheme';

/** Tek kaydırılabilir ana ekran: Adım → Kişisel bilgiler → Kalori → Su. */
export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const displayName = useSettingsStore((state) => state.displayName);
  const restartRequired = useSettingsStore((state) => state.restartRequired);
  const dismissRestartNotice = useSettingsStore((state) => state.dismissRestartNotice);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xxl,
          gap: theme.spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
          }}
        >
          <AppText variant="title">
            {displayName.trim().length > 0
              ? t('home.greeting', { name: displayName })
              : t('home.greetingGeneric')}
          </AppText>

          <Pressable
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel={t('home.openProfile')}
            style={({ pressed }) => ({ opacity: pressed ? theme.opacity.pressed : 1 })}
          >
            <Avatar name={displayName} />
          </Pressable>
        </View>

        {restartRequired ? (
          <NoticeBanner
            tone="warning"
            title={t('common.restartTitle')}
            body={t('common.restartBody')}
            onDismiss={dismissRestartNotice}
            dismissLabel={t('common.ok')}
          />
        ) : null}

        <StepsSection />
        <PersonalInfoSection />
        <CaloriesSection />
        <WaterSection />
      </ScrollView>
    </Screen>
  );
}

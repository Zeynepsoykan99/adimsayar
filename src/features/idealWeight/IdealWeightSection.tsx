import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { calculateIdealWeightRange, hasIdealWeightProfile } from '@/domain/idealWeight';
import { useProfileStore } from '@/store/useProfileStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/theme/useTheme';
import { formatNumber } from '@/utils/format';

/**
 * Yalnızca aralığı gösterir. Mevcut kiloyla karşılaştırma bilerek yoktur.
 * Değer store'da tutulmaz, her render'da profilden türetilir.
 */
export function IdealWeightSection() {
  const { t } = useTranslation();
  const theme = useTheme();

  const profile = useProfileStore((state) => state.profile);
  const locale = useSettingsStore((state) => state.resolvedLanguage);

  // Yalnızca yaş ve boy gerekir; kilo ve cinsiyet eksik olsa da aralık gösterilir.
  if (!hasIdealWeightProfile(profile)) {
    return (
      <Card>
        <SectionHeader title={t('idealWeight.title')} />
        <EmptyState
          title={t('idealWeight.emptyTitle')}
          body={t('idealWeight.emptyBody')}
          icon="body-outline"
        />
      </Card>
    );
  }

  const range = calculateIdealWeightRange(profile.age, profile.heightCm);

  return (
    <Card>
      <SectionHeader title={t('idealWeight.title')} />

      <View style={{ gap: theme.spacing.xxs }}>
        <AppText variant="title">
          {t('idealWeight.range', {
            min: formatNumber(range.minKg, locale, 1),
            max: formatNumber(range.maxKg, locale, 1),
          })}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {t('idealWeight.basis')}
        </AppText>
      </View>
    </Card>
  );
}

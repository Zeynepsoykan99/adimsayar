import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { isProfileComplete } from '@/domain/calories';
import { calculateWaterGoal, mlToGlasses, QUICK_ADD_ML, remainingWaterMl } from '@/domain/water';
import { useProfileStore } from '@/store/useProfileStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWaterStore } from '@/store/useWaterStore';
import { useTheme } from '@/theme/useTheme';
import { formatNumber, progressRatio } from '@/utils/format';

export function WaterSection() {
  const { t } = useTranslation();
  const theme = useTheme();

  const profile = useProfileStore((state) => state.profile);
  const totalMl = useWaterStore((state) => state.totalMl);
  const entries = useWaterStore((state) => state.entries);
  const addWater = useWaterStore((state) => state.add);
  const undoLast = useWaterStore((state) => state.undoLast);
  const waterGoalOverride = useSettingsStore((state) => state.waterGoalOverride);
  const locale = useSettingsStore((state) => state.resolvedLanguage);

  // Hedef, kişisel bilgilerin tamamı girilmeden hesaplanamaz (BMR gerektirir).
  if (!isProfileComplete(profile)) {
    return (
      <Card>
        <SectionHeader title={t('water.title')} />
        <EmptyState title={t('water.emptyTitle')} body={t('water.emptyBody')} icon="water-outline" />
      </Card>
    );
  }

  const auto = calculateWaterGoal(profile);
  const goalMl = waterGoalOverride ?? auto.goalMl;
  const showClampNotice = waterGoalOverride === null && auto.clamped;
  const remaining = remainingWaterMl(goalMl, totalMl);

  return (
    <Card>
      <SectionHeader title={t('water.title')} />

      <View style={{ gap: theme.spacing.xxs }}>
        <AppText variant="title">
          {formatNumber(totalMl, locale) + ' ' + t('water.ml')}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {t('water.glasses', { glasses: formatNumber(mlToGlasses(totalMl), locale, 1) })}
        </AppText>
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        <ProgressBar
          ratio={progressRatio(totalMl, goalMl)}
          color="accent"
          accessibilityLabel={t('water.goal')}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="caption" color="textMuted">
            {t('water.goal') + ': ' + formatNumber(goalMl, locale) + ' ' + t('water.ml')}
          </AppText>
          <AppText variant="caption" color="textMuted">
            {t('water.remaining') + ': ' + formatNumber(remaining, locale) + ' ' + t('water.ml')}
          </AppText>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {QUICK_ADD_ML.map((amount) => (
          <Button
            key={amount}
            label={t('water.quickAdd', { amount: formatNumber(amount, locale) })}
            variant="secondary"
            onPress={() => void addWater(amount)}
          />
        ))}
        <Button
          label={t('common.undo')}
          variant="ghost"
          disabled={entries.length === 0}
          onPress={() => void undoLast()}
        />
      </View>

      {showClampNotice ? <NoticeBanner tone="warning" body={t('water.clamped')} /> : null}

      <AppText variant="caption" color="textMuted">
        {t('water.note')}
      </AppText>
    </Card>
  );
}

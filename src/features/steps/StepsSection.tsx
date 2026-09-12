import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { MetricTile } from '@/components/ui/MetricTile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  stepGoalForActivity,
  stepsToBurnedCalories,
  stepsToDistanceKm,
} from '@/domain/steps';
import { useProfileStore } from '@/store/useProfileStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useStepsStore } from '@/store/useStepsStore';
import { useTheme } from '@/theme/useTheme';
import { formatNumber, progressPercent, progressRatio } from '@/utils/format';

/** Ana ekranın en üst bölümü: günlük adım sayısı ve yardımcı metrikler. */
export function StepsSection() {
  const { t } = useTranslation();
  const theme = useTheme();

  const steps = useStepsStore((state) => state.steps);
  const activeMinutes = useStepsStore((state) => state.activeMinutes);
  const profile = useProfileStore((state) => state.profile);
  const stepGoalOverride = useSettingsStore((state) => state.stepGoalOverride);
  const locale = useSettingsStore((state) => state.resolvedLanguage);

  const goal = stepGoalOverride ?? stepGoalForActivity(profile.activityLevel);
  const burnedKcal = stepsToBurnedCalories(steps, profile.weightKg);
  const distanceKm = stepsToDistanceKm(steps, profile.heightCm);

  return (
    <Card>
      <AppText variant="label" color="textMuted">
        {t('steps.title')}
      </AppText>

      <View style={{ gap: theme.spacing.xxs }}>
        <AppText variant="display">{formatNumber(steps, locale)}</AppText>
        <AppText variant="body" color="textMuted">
          {t('steps.unit')}
        </AppText>
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        <ProgressBar
          ratio={progressRatio(steps, goal)}
          accessibilityLabel={t('steps.goal', { goal: formatNumber(goal, locale) })}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="caption" color="textMuted">
            {t('steps.goal', { goal: formatNumber(goal, locale) })}
          </AppText>
          <AppText variant="caption" color="primary">
            {t('steps.percent', { percent: progressPercent(steps, goal) })}
          </AppText>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <MetricTile
          icon="flame-outline"
          label={t('steps.burned')}
          value={formatNumber(burnedKcal, locale)}
          unit={t('steps.kcal')}
        />
        <MetricTile
          icon="map-outline"
          label={t('steps.distance')}
          value={formatNumber(distanceKm, locale, 1)}
          unit={t('steps.km')}
        />
        <MetricTile
          icon="time-outline"
          label={t('steps.activeTime')}
          value={formatNumber(activeMinutes, locale)}
          unit={t('steps.min')}
        />
      </View>
    </Card>
  );
}

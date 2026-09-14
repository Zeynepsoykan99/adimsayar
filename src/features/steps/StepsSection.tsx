import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { MetricTile } from '@/components/ui/MetricTile';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { stepGoalForActivity, stepsToBurnedCalories, stepsToDistanceKm } from '@/domain/steps';
import { useProfileStore } from '@/store/useProfileStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useStepsStore } from '@/store/useStepsStore';
import { useTheme } from '@/theme/useTheme';
import { formatNumber, progressPercent, progressRatio } from '@/utils/format';

/** Ana ekranın en üst bölümü: günlük adım sayısı, izin durumları ve metrikler. */
export function StepsSection() {
  const { t } = useTranslation();
  const theme = useTheme();

  const steps = useStepsStore((state) => state.steps);
  const activeMinutes = useStepsStore((state) => state.activeMinutes);
  const date = useStepsStore((state) => state.date);
  const access = useStepsStore((state) => state.access);
  const requesting = useStepsStore((state) => state.requesting);
  const watch = useStepsStore((state) => state.watch);
  const refreshAccess = useStepsStore((state) => state.refreshAccess);
  const requestAccess = useStepsStore((state) => state.requestAccess);
  const openSettings = useStepsStore((state) => state.openSettings);

  const profile = useProfileStore((state) => state.profile);
  const stepGoalOverride = useSettingsStore((state) => state.stepGoalOverride);
  const locale = useSettingsStore((state) => state.resolvedLanguage);

  /**
   * Canlı akış YALNIZCA bu bölüm ekranda görünürken açılır. Profil ekranına
   * geçildiğinde odak kaybolur ve abonelik kapanır; Health Connect yoklaması
   * da böylece durur. Ön plan/arka plan yönetimi aboneliğin kendi içindedir.
   */
  useFocusEffect(
    useCallback(() => {
      // Ekrana her dönüşte izin durumu tazelenir: kullanıcı ayarlardan
      // izni değiştirmiş olabilir.
      void refreshAccess();

      if (access !== 'granted' || !date) return;
      return watch(date);
    }, [access, date, watch, refreshAccess]),
  );

  const goal = stepGoalOverride ?? stepGoalForActivity(profile.activityLevel);
  const burnedKcal = stepsToBurnedCalories(steps, profile.weightKg);
  const distanceKm = stepsToDistanceKm(steps, profile.heightCm);

  if (access === 'checking') {
    return (
      <Card>
        <AppText variant="label" color="textMuted">
          {t('steps.title')}
        </AppText>
        <View style={{ alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.lg }}>
          <ActivityIndicator color={theme.colors.primary} />
          <AppText variant="caption" color="textMuted">
            {t('steps.accessChecking')}
          </AppText>
        </View>
      </Card>
    );
  }

  if (access === 'unsupported') {
    return (
      <Card>
        <AppText variant="label" color="textMuted">
          {t('steps.title')}
        </AppText>
        <EmptyState
          icon="phone-portrait-outline"
          title={t('steps.unsupportedTitle')}
          body={t('steps.unsupportedBody')}
        />
      </Card>
    );
  }

  if (access === 'providerUpdateRequired') {
    return (
      <Card>
        <AppText variant="label" color="textMuted">
          {t('steps.title')}
        </AppText>
        <EmptyState
          icon="cloud-download-outline"
          title={t('steps.providerTitle')}
          body={t('steps.providerBody')}
        />
        <Button label={t('steps.providerAction')} onPress={() => void openSettings()} />
      </Card>
    );
  }

  if (access === 'denied') {
    return (
      <Card>
        <AppText variant="label" color="textMuted">
          {t('steps.title')}
        </AppText>
        <EmptyState
          icon="lock-closed-outline"
          title={t('steps.deniedTitle')}
          body={t('steps.deniedBody')}
        />
        <Button
          label={t('steps.deniedAction')}
          disabled={requesting}
          onPress={() => void requestAccess()}
        />
        <Button
          label={t('steps.openSettings')}
          variant="ghost"
          onPress={() => void openSettings()}
        />
      </Card>
    );
  }

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

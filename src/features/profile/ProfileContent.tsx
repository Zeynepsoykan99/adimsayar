import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { NumberField } from '@/components/ui/NumberField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { stepGoalForActivity } from '@/domain/steps';
import { calculateWaterGoal, hasWaterProfile } from '@/domain/water';
import { isWithinLimits, LIMITS, parseIntegerInput } from '@/domain/validation';
import { SUPPORTED_LANGUAGES, type LanguagePreference } from '@/i18n/languages';
import { useProfileStore } from '@/store/useProfileStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/theme/useTheme';
import { formatNumber } from '@/utils/format';

/** Profil ekranının içeriği: ad, dil, hedefler ve tema bilgisi. */
export function ProfileContent() {
  const { t } = useTranslation();
  const theme = useTheme();

  const displayName = useSettingsStore((state) => state.displayName);
  const setDisplayName = useSettingsStore((state) => state.setDisplayName);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const locale = useSettingsStore((state) => state.resolvedLanguage);
  const stepGoalOverride = useSettingsStore((state) => state.stepGoalOverride);
  const setStepGoalOverride = useSettingsStore((state) => state.setStepGoalOverride);
  const waterGoalOverride = useSettingsStore((state) => state.waterGoalOverride);
  const setWaterGoalOverride = useSettingsStore((state) => state.setWaterGoalOverride);
  const restartRequired = useSettingsStore((state) => state.restartRequired);
  const dismissRestartNotice = useSettingsStore((state) => state.dismissRestartNotice);
  const profile = useProfileStore((state) => state.profile);

  const [stepGoalError, setStepGoalError] = useState<string | null>(null);
  const [waterGoalError, setWaterGoalError] = useState<string | null>(null);

  const autoStepGoal = stepGoalForActivity(profile.activityLevel);
  const autoWaterGoal = hasWaterProfile(profile) ? calculateWaterGoal(profile).goalMl : null;

  const languageOptions: { value: LanguagePreference; label: string }[] = [
    { value: 'system', label: t('profile.languageSystem') },
    ...SUPPORTED_LANGUAGES.map((code) => ({
      value: code as LanguagePreference,
      label: t('languages.' + code),
    })),
  ];

  const commitStepGoal = (raw: string) => {
    const parsed = parseIntegerInput(raw);
    if (parsed === null) {
      setStepGoalError(null);
      void setStepGoalOverride(null);
      return;
    }
    if (!isWithinLimits('stepGoal', parsed)) {
      setStepGoalError(
        t('profile.stepGoalError', { min: LIMITS.stepGoal.min, max: LIMITS.stepGoal.max }),
      );
      return;
    }
    setStepGoalError(null);
    void setStepGoalOverride(parsed);
  };

  const commitWaterGoal = (raw: string) => {
    const parsed = parseIntegerInput(raw);
    if (parsed === null) {
      setWaterGoalError(null);
      void setWaterGoalOverride(null);
      return;
    }
    if (!isWithinLimits('waterGoalMl', parsed)) {
      setWaterGoalError(
        t('profile.waterGoalError', {
          min: LIMITS.waterGoalMl.min,
          max: LIMITS.waterGoalMl.max,
        }),
      );
      return;
    }
    setWaterGoalError(null);
    void setWaterGoalOverride(parsed);
  };

  return (
    <View style={{ gap: theme.spacing.lg }}>
      {restartRequired ? (
        <NoticeBanner
          tone="warning"
          title={t('common.restartTitle')}
          body={t('common.restartBody')}
          onDismiss={dismissRestartNotice}
          dismissLabel={t('common.ok')}
        />
      ) : null}

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Avatar name={displayName} size={56} />
          <View style={{ flex: 1 }}>
            <TextField
              label={t('profile.nameLabel')}
              placeholder={t('profile.namePlaceholder')}
              value={displayName}
              onCommit={(value) => void setDisplayName(value)}
            />
          </View>
        </View>
      </Card>

      <Card>
        <SectionHeader title={t('profile.languageTitle')} />
        <SegmentedControl<LanguagePreference>
          options={languageOptions}
          value={language}
          onChange={(value) => void setLanguage(value)}
        />
      </Card>

      <Card>
        <SectionHeader title={t('profile.goalsTitle')} />

        <NumberField
          label={t('profile.stepGoal')}
          value={stepGoalOverride}
          placeholder={formatNumber(autoStepGoal, locale)}
          error={stepGoalError}
          onCommit={commitStepGoal}
        />
        <AppText variant="caption" color="textMuted">
          {t('profile.stepGoalAuto')}
        </AppText>
        {stepGoalOverride !== null ? (
          <Button
            label={t('profile.useAuto')}
            variant="ghost"
            onPress={() => {
              setStepGoalError(null);
              void setStepGoalOverride(null);
            }}
          />
        ) : null}

        <NumberField
          label={t('profile.waterGoal')}
          value={waterGoalOverride}
          placeholder={autoWaterGoal === null ? undefined : formatNumber(autoWaterGoal, locale)}
          error={waterGoalError}
          onCommit={commitWaterGoal}
        />
        <AppText variant="caption" color="textMuted">
          {t('profile.waterGoalAuto')}
        </AppText>
        {waterGoalOverride !== null ? (
          <Button
            label={t('profile.useAuto')}
            variant="ghost"
            onPress={() => {
              setWaterGoalError(null);
              void setWaterGoalOverride(null);
            }}
          />
        ) : null}
      </Card>

      <Card>
        <SectionHeader title={t('profile.themeTitle')} />
        <AppText variant="body" color="textMuted">
          {t('profile.themeSystem')}
        </AppText>
        <AppText variant="bodyStrong">
          {theme.mode === 'dark' ? t('profile.themeDark') : t('profile.themeLight')}
        </AppText>
      </Card>
    </View>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { NumberField } from '@/components/ui/NumberField';
import { NoticeBanner } from '@/components/ui/NoticeBanner';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { calculateTdee, isEstimatedResult, isProfileComplete, remainingCalories } from '@/domain/calories';
import { isWithinLimits, LIMITS, parseIntegerInput } from '@/domain/validation';
import { sumEntries, useCaloriesStore } from '@/store/useCaloriesStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/theme/useTheme';
import { formatNumber } from '@/utils/format';

/** Etiket + değer satırı. */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <AppText variant="body" color="textMuted">
        {label}
      </AppText>
      <AppText variant="metric">{value}</AppText>
    </View>
  );
}

export function CaloriesSection() {
  const { t } = useTranslation();
  const theme = useTheme();

  const profile = useProfileStore((state) => state.profile);
  const entries = useCaloriesStore((state) => state.entries);
  const addEntry = useCaloriesStore((state) => state.add);
  const removeEntry = useCaloriesStore((state) => state.remove);
  const clearDay = useCaloriesStore((state) => state.clearDay);
  const locale = useSettingsStore((state) => state.resolvedLanguage);

  const [draft, setDraft] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!isProfileComplete(profile)) {
    return (
      <Card>
        <SectionHeader title={t('calories.title')} />
        <EmptyState title={t('calories.emptyTitle')} body={t('calories.emptyBody')} />
      </Card>
    );
  }

  const tdee = calculateTdee(profile);
  const consumed = sumEntries(entries);
  const remaining = remainingCalories(tdee, consumed);

  const submit = () => {
    const parsed = parseIntegerInput(draft);
    if (parsed === null || !isWithinLimits('manualKcal', parsed)) {
      setError(
        t('calories.rangeError', {
          min: LIMITS.manualKcal.min,
          max: LIMITS.manualKcal.max,
        }),
      );
      return;
    }

    setError(null);
    setDraft('');
    setInputKey((key) => key + 1);
    void addEntry(parsed);
  };

  return (
    <Card>
      <SectionHeader title={t('calories.title')} />

      <View style={{ gap: theme.spacing.sm }}>
        <SummaryRow
          label={t('calories.need')}
          value={formatNumber(tdee, locale) + ' ' + t('calories.kcal')}
        />
        <SummaryRow
          label={t('calories.consumed')}
          value={formatNumber(consumed, locale) + ' ' + t('calories.kcal')}
        />
        <SummaryRow
          label={remaining >= 0 ? t('calories.remaining') : t('calories.over')}
          value={formatNumber(Math.abs(remaining), locale) + ' ' + t('calories.kcal')}
        />
      </View>

      {isEstimatedResult(profile) ? (
        <AppText variant="caption" color="warning">
          {t('common.estimated')}
        </AppText>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <NumberField
            key={inputKey}
            label={t('calories.addLabel')}
            placeholder={t('calories.addPlaceholder')}
            unit={t('calories.kcal')}
            value={null}
            error={error}
            onChangeRaw={setDraft}
            onCommit={() => undefined}
          />
        </View>
        <Button label={t('common.add')} onPress={submit} />
      </View>

      {entries.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="label" color="textMuted">
            {t('calories.entriesTitle')}
          </AppText>
          {entries.map((entry) => (
            <View
              key={entry.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <AppText variant="body">
                {formatNumber(entry.kcal, locale) + ' ' + t('calories.kcal')}
              </AppText>
              <IconButton
                name="trash-outline"
                color="danger"
                accessibilityLabel={t('calories.removeEntry')}
                onPress={() => void removeEntry(entry.id)}
              />
            </View>
          ))}
          <Button label={t('calories.clearDay')} variant="ghost" onPress={() => void clearDay()} />
        </View>
      ) : null}

      <NoticeBanner body={t('calories.burnedNote')} />
    </Card>
  );
}

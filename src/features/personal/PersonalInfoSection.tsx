import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { NumberField } from '@/components/ui/NumberField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ACTIVITY_LEVELS } from '@/domain/calories';
import { isWithinLimits, LIMITS, parseIntegerInput, type LimitKey } from '@/domain/validation';
import type { ActivityLevel, Gender } from '@/services/types';
import { useProfileStore } from '@/store/useProfileStore';
import { useTheme } from '@/theme/useTheme';

type NumericField = 'age' | 'heightCm' | 'weightKg';

const LIMIT_KEYS: Record<NumericField, LimitKey> = {
  age: 'age',
  heightCm: 'heightCm',
  weightKg: 'weightKg',
};

const GENDERS: Gender[] = ['male', 'female', 'unspecified'];

const GENDER_LABEL_KEYS: Record<Gender, string> = {
  male: 'personal.genderMale',
  female: 'personal.genderFemale',
  unspecified: 'personal.genderUnspecified',
};

const ACTIVITY_LABEL_KEYS: Record<ActivityLevel, string> = {
  sedentary: 'personal.activitySedentary',
  light: 'personal.activityLight',
  moderate: 'personal.activityModerate',
  active: 'personal.activityActive',
  veryActive: 'personal.activityVeryActive',
};

/**
 * Kişisel bilgiler. Değerler alandan çıkıldığında otomatik kaydedilir;
 * sınır dışı bir değer kaydedilmez, alanın altında hata mesajı gösterilir.
 */
export function PersonalInfoSection() {
  const { t } = useTranslation();
  const theme = useTheme();

  const profile = useProfileStore((state) => state.profile);
  const setField = useProfileStore((state) => state.setField);

  const [errors, setErrors] = useState<Partial<Record<NumericField, string | null>>>({});

  const commitNumber = (field: NumericField, raw: string) => {
    const parsed = parseIntegerInput(raw);

    if (parsed === null) {
      setErrors((current) => ({ ...current, [field]: null }));
      void setField(field, undefined);
      return;
    }

    const limitKey = LIMIT_KEYS[field];
    if (!isWithinLimits(limitKey, parsed)) {
      const { min, max } = LIMITS[limitKey];
      setErrors((current) => ({
        ...current,
        [field]: t('personal.rangeError', { min, max }),
      }));
      return;
    }

    setErrors((current) => ({ ...current, [field]: null }));
    void setField(field, parsed);
  };

  return (
    <Card>
      <SectionHeader title={t('personal.title')} subtitle={t('personal.subtitle')} />

      <View style={{ gap: theme.spacing.md }}>
        <NumberField
          label={t('personal.age')}
          unit={t('personal.ageUnit')}
          value={profile.age ?? null}
          error={errors.age}
          onCommit={(raw) => commitNumber('age', raw)}
        />
        <NumberField
          label={t('personal.height')}
          unit={t('personal.heightUnit')}
          value={profile.heightCm ?? null}
          error={errors.heightCm}
          onCommit={(raw) => commitNumber('heightCm', raw)}
        />
        <NumberField
          label={t('personal.weight')}
          unit={t('personal.weightUnit')}
          value={profile.weightKg ?? null}
          error={errors.weightKg}
          onCommit={(raw) => commitNumber('weightKg', raw)}
        />

        <SegmentedControl<Gender>
          label={t('personal.gender')}
          options={GENDERS.map((gender) => ({
            value: gender,
            label: t(GENDER_LABEL_KEYS[gender]),
          }))}
          value={profile.gender}
          onChange={(gender) => void setField('gender', gender)}
        />

        <SegmentedControl<ActivityLevel>
          label={t('personal.activity')}
          options={ACTIVITY_LEVELS.map((level) => ({
            value: level,
            label: t(ACTIVITY_LABEL_KEYS[level]),
          }))}
          value={profile.activityLevel}
          onChange={(level) => void setField('activityLevel', level)}
        />
      </View>

      <AppText variant="caption" color="textMuted">
        {t('personal.savedHint')}
      </AppText>
    </Card>
  );
}

import type { ActivityLevel, CompleteProfile, UserProfile } from '@/services/types';

/** Aktivite seviyesi → TDEE çarpanı. */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'veryActive',
];

/** Profilin hesap yapmaya yetecek kadar dolu olup olmadığını söyler. */
export function isProfileComplete(profile: UserProfile | null): profile is CompleteProfile {
  if (!profile) return false;
  return (
    typeof profile.age === 'number' &&
    typeof profile.heightCm === 'number' &&
    typeof profile.weightKg === 'number' &&
    profile.gender !== undefined &&
    profile.activityLevel !== undefined
  );
}

/**
 * Mifflin-St Jeor bazal metabolizma hızı (kcal/gün).
 *
 * Erkek : 10*kg + 6.25*cm - 5*yaş + 5
 * Kadın : 10*kg + 6.25*cm - 5*yaş - 161
 * Belirtilmemiş: iki formülün ortalaması (sabit fark -78).
 *
 * Bu fonksiyon uygulamadaki TEK BMR kaynağıdır:
 * kalori bölümü bunun üzerine aktivite çarpanı uygular (TDEE),
 * su bölümü ise çıplak BMR'ı kullanır (çarpan UYGULAMAZ).
 */
export function calculateBmr(profile: CompleteProfile): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  switch (profile.gender) {
    case 'male':
      return base + 5;
    case 'female':
      return base - 161;
    case 'unspecified':
    default:
      return base - 78;
  }
}

/** Günlük kalori ihtiyacı (TDEE) = BMR × aktivite çarpanı. */
export function calculateTdee(profile: CompleteProfile): number {
  return calculateBmr(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel];
}

/** Cinsiyet "belirtmek istemiyorum" ise sonuç tahminidir; arayüzde not gösterilir. */
export function isEstimatedResult(profile: CompleteProfile): boolean {
  return profile.gender === 'unspecified';
}

/** Kalan kalori: hedef eksi elle girilen tüketim. Negatif olabilir (aşım). */
export function remainingCalories(tdee: number, consumedKcal: number): number {
  return tdee - consumedKcal;
}

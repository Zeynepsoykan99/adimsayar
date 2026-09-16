import type { UserProfile } from '@/services/types';

/** Sağlıklı BMI aralığının alt sınırı (tüm yaşlar). */
export const IDEAL_BMI_MIN = 18.5;

/** 13–64 yaş için sağlıklı BMI üst sınırı. */
export const IDEAL_BMI_MAX_ADULT = 24.9;

/** 65 yaş ve üzeri için üst sınır — geriatrik beslenme kılavuzlarına göre yükseltilmiştir. */
export const IDEAL_BMI_MAX_OLDER = 27.0;

/** Bu yaştan itibaren yükseltilmiş üst sınır kullanılır. */
export const OLDER_ADULT_MIN_AGE = 65;

export type IdealWeightRange = {
  minKg: number;
  maxKg: number;
};

/** İdeal kilo aralığı hesaplanabilecek kadar bilgi var mı? Yalnızca yaş ve boy gerekir. */
export function hasIdealWeightProfile(
  profile: UserProfile | null,
): profile is UserProfile & { age: number; heightCm: number } {
  if (!profile) return false;
  return typeof profile.age === 'number' && typeof profile.heightCm === 'number';
}

/** Yaşa göre BMI üst sınırı: 13–64 → 24.9 · 65+ → 27.0 */
export function idealBmiMax(ageYears: number): number {
  return ageYears >= OLDER_ADULT_MIN_AGE ? IDEAL_BMI_MAX_OLDER : IDEAL_BMI_MAX_ADULT;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * BMI tabanlı ideal kilo aralığı (kg).
 *
 * boy_m    = boy_cm / 100
 * min_kilo = 18.5 × boy_m²
 * max_kilo = üst_BMI × boy_m²   (üst_BMI = idealBmiMax(yaş))
 * → en yakın 0.1 kg'a yuvarlanır.
 *
 * Yalnızca yaş ve boy gerekir; kilo ve cinsiyet kullanılmaz. Ek bir kırpma
 * yapılmaz — boy zaten LIMITS.heightCm (100–250 cm) ile sınırlıdır.
 * Kalori ve su hesaplarından bağımsızdır.
 */
export function calculateIdealWeightRange(ageYears: number, heightCm: number): IdealWeightRange {
  const heightM = heightCm / 100;
  const heightSquared = heightM * heightM;
  return {
    minKg: roundToTenth(IDEAL_BMI_MIN * heightSquared),
    maxKg: roundToTenth(idealBmiMax(ageYears) * heightSquared),
  };
}

import { LIMITS } from './validation';
import type { Gender, UserProfile } from '@/services/types';
import { clamp } from '@/utils/format';

/** 1 bardak = 200 ml. */
export const GLASS_ML = 200;

/** Hızlı ekleme butonları. */
export const QUICK_ADD_ML = [200, 330, 500] as const;

/**
 * Su hedefi hesabı için gereken alanlar.
 * Aktivite seviyesi GEREKMEZ — kalori bölümünden farklı olarak su hedefi
 * yaş, boy, kilo ve cinsiyetin dördüyle hesaplanır.
 */
export type WaterProfile = {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
};

export type WaterGoal = {
  goalMl: number;
  /** Ham hesap 500–6.000 ml aralığının dışında kaldıysa true. */
  clamped: boolean;
};

/** Su hedefi hesaplanabilecek kadar bilgi var mı? */
export function hasWaterProfile(
  profile: UserProfile | null,
): profile is UserProfile & WaterProfile {
  if (!profile) return false;
  return (
    typeof profile.age === 'number' &&
    typeof profile.heightCm === 'number' &&
    typeof profile.weightKg === 'number' &&
    profile.gender !== undefined
  );
}

/** Mosteller vücut yüzey alanı (m²) = √(boy_cm × kilo_kg / 3600). */
export function calculateBsa(heightCm: number, weightKg: number): number {
  return Math.sqrt((heightCm * weightKg) / 3600);
}

/** Yaş çarpanı: 13–30 → 1.05 · 31–55 → 1.00 · 56–65 → 0.90 · 66+ → 0.85 */
export function ageFactor(age: number): number {
  if (age <= 30) return 1.05;
  if (age <= 55) return 1.0;
  if (age <= 65) return 0.9;
  return 0.85;
}

/** Cinsiyet çarpanı: erkek 1.00 · kadın 0.90 · belirtilmemiş 0.95 (ikisinin ortalaması). */
export function genderFactor(gender: Gender): number {
  switch (gender) {
    case 'male':
      return 1.0;
    case 'female':
      return 0.9;
    case 'unspecified':
    default:
      return 0.95;
  }
}

/**
 * Günlük su hedefi (ml).
 *
 * 1) BSA (Mosteller)  = √(boy_cm × kilo_kg / 3600)
 * 2) taban_ml         = BSA × 1500
 * 3) yaş çarpanı      = ageFactor(yaş)
 * 4) cinsiyet çarpanı = genderFactor(cinsiyet)
 * → en yakın 50 ml'ye yuvarlanır, 500–6.000 ml aralığına kırpılır.
 *
 * Kalori bölümündeki BMR/TDEE mantığıyla hiçbir bağı yoktur; bu fonksiyon
 * calculateBmr'ı ÇAĞIRMAZ.
 */
export function calculateWaterGoal(profile: WaterProfile): WaterGoal {
  const bsa = calculateBsa(profile.heightCm, profile.weightKg);
  const raw = bsa * 1500 * ageFactor(profile.age) * genderFactor(profile.gender);
  const rounded = Math.round(raw / 50) * 50;
  const goalMl = clamp(rounded, LIMITS.waterGoalMl.min, LIMITS.waterGoalMl.max);
  return { goalMl, clamped: goalMl !== rounded };
}

export function mlToGlasses(ml: number): number {
  return Math.round((ml / GLASS_ML) * 10) / 10;
}

/** Kalan su (ml). Hedef aşıldıysa 0. */
export function remainingWaterMl(goalMl: number, totalMl: number): number {
  return Math.max(0, goalMl - totalMl);
}

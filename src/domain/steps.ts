import type { ActivityLevel } from '@/services/types';

/** Aktivite seviyesine göre otomatik günlük adım hedefi (6.000–12.000). */
export const STEP_GOAL_BY_ACTIVITY: Record<ActivityLevel, number> = {
  sedentary: 6000,
  light: 7500,
  moderate: 9000,
  active: 10500,
  veryActive: 12000,
};

/** Profil eksikken gösterilecek hedef. */
export const DEFAULT_STEP_GOAL = STEP_GOAL_BY_ACTIVITY.moderate;

export function stepGoalForActivity(level: ActivityLevel | undefined): number {
  return level ? STEP_GOAL_BY_ACTIVITY[level] : DEFAULT_STEP_GOAL;
}

/** Adım boyu ≈ boy × 0.415 (metre). */
export function strideLengthMeters(heightCm: number): number {
  return (heightCm * 0.415) / 100;
}

/** Atılan adımdan kat edilen mesafe (km). */
export function stepsToDistanceKm(steps: number, heightCm: number | undefined): number {
  const stride = strideLengthMeters(heightCm ?? 170);
  return (steps * stride) / 1000;
}

/**
 * Yürüyüşle yakılan kaloriyi tahmin eder (kcal).
 *
 * !!! ÖNEMLİ — SONRAKİ FAZLARDA DA GEÇERLİ !!!
 * Bu değer YALNIZCA BİLGİLENDİRME amaçlıdır ve kalori bütçesine EKLENMEZ.
 * Kalori bölümündeki günlük hedef Mifflin-St Jeor TDEE'dir; TDEE zaten
 * aktivite çarpanını (ACTIVITY_MULTIPLIERS) içerir. Yürüyüşle yakılan
 * kaloriyi ayrıca hedefe eklemek aynı hareketi İKİ KEZ saymak olur.
 * Bu yüzden hiçbir yerde remainingCalories()/TDEE hesabına katılmamalıdır.
 */
export function stepsToBurnedCalories(steps: number, weightKg: number | undefined): number {
  const weight = weightKg ?? 70;
  // ~0.04 kcal / (adım × 70kg) referansıyla kiloya göre ölçeklenir.
  return steps * 0.04 * (weight / 70);
}

/** Ortalama yürüyüş temposu: dakikada ~110 adım. */
export const STEPS_PER_ACTIVE_MINUTE = 110;

export function stepsToActiveMinutes(steps: number): number {
  return Math.round(steps / STEPS_PER_ACTIVE_MINUTE);
}

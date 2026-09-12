import { calculateBmr } from './calories';
import { LIMITS } from './validation';
import type { CompleteProfile } from '@/services/types';
import { clamp } from '@/utils/format';

/** 1 bardak = 200 ml. */
export const GLASS_ML = 200;

/** Hızlı ekleme butonları. */
export const QUICK_ADD_ML = [200, 330, 500] as const;

export type WaterGoal = {
  goalMl: number;
  /** Ham hesap 500–6.000 ml aralığının dışında kaldıysa true. */
  clamped: boolean;
};

/**
 * Günlük su hedefi = Mifflin-St Jeor BMR (kcal) × 1 ml, en yakın 50 ml'ye yuvarlanır.
 * Aktivite çarpanı UYGULANMAZ — kalori tarafındaki TDEE'den farklı olarak burada
 * çıplak BMR kullanılır. BMR hesabı domain/calories.ts içindeki tek kaynaktan gelir.
 */
export function calculateWaterGoal(profile: CompleteProfile): WaterGoal {
  const raw = calculateBmr(profile);
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

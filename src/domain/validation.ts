/**
 * Faz 1 doğrulama sınırları. Tek kaynak burasıdır; ekranlar ve store'lar
 * kendi sınırlarını tanımlamaz.
 */
export const LIMITS = {
  age: { min: 13, max: 120 },
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 30, max: 300 },
  manualKcal: { min: 0, max: 5000 },
  stepGoal: { min: 1000, max: 50000 },
  waterGoalMl: { min: 500, max: 6000 },
} as const;

export type LimitKey = keyof typeof LIMITS;

/** Değer geçerli aralıkta mı? Sayı değilse (NaN) geçersiz sayılır. */
export function isWithinLimits(key: LimitKey, value: number): boolean {
  if (!Number.isFinite(value)) return false;
  const { min, max } = LIMITS[key];
  return value >= min && value <= max;
}

/** Metin girdisini tam sayıya çevirir; boş/geçersizse null döner. */
export function parseIntegerInput(raw: string): number | null {
  const normalized = raw.replace(/[^0-9]/g, '');
  if (normalized.length === 0) return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

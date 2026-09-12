/**
 * Sayı biçimlendirme. Aktif dile göre binlik ayracı kullanır.
 * Intl desteklenmeyen bir ortamda sessizce sade sayıya döner.
 */
export function formatNumber(value: number, locale: string, fractionDigits = 0): string {
  const rounded = fractionDigits === 0 ? Math.round(value) : value;
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(rounded);
  } catch {
    return rounded.toFixed(fractionDigits);
  }
}

/** 0–1 aralığına kırpılmış ilerleme oranı. */
export function progressRatio(current: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  return Math.max(0, Math.min(1, current / goal));
}

/** Yüzde değeri (tam sayı, 0–999 arası mantıklı aralıkta). */
export function progressPercent(current: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  return Math.round((current / goal) * 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

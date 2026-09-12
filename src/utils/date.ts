/** 'YYYY-MM-DD' biçiminde, cihazın yerel saat dilimine göre gün anahtarı. */
export type DateKey = string;

function pad(value: number): string {
  return value < 10 ? '0' + value : String(value);
}

/** Verilen tarihi yerel saat dilimine göre gün anahtarına çevirir. */
export function toDateKey(date: Date): DateKey {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

/** Bugünün gün anahtarı. Gün, cihazın saat diliminde gece 00:00'da değişir. */
export function todayKey(): DateKey {
  return toDateKey(new Date());
}

/** Bir sonraki yerel gece yarısına kalan milisaniye. */
export function msUntilNextLocalMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return next.getTime() - now.getTime();
}

/** Gün başından itibaren geçen dakika (mock adım simülasyonu için). */
export function minutesSinceLocalMidnight(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

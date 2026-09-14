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

/**
 * Gün anahtarının yerel saat dilimindeki başlangıcı ve bitişi (ISO 8601).
 * Platform sağlık API'leri zaman aralığını bu biçimde ister.
 */
export function dayBoundsIso(date: DateKey): { startTime: string; endTime: string } {
  const [year, month, day] = date.split('-').map((part) => Number.parseInt(part, 10));
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
  return { startTime: start.toISOString(), endTime: end.toISOString() };
}

/** Gün anahtarının yerel başlangıç/bitiş Date nesneleri. */
export function dayBounds(date: DateKey): { start: Date; end: Date } {
  const [year, month, day] = date.split('-').map((part) => Number.parseInt(part, 10));
  return {
    start: new Date(year, month - 1, day, 0, 0, 0, 0),
    end: new Date(year, month - 1, day + 1, 0, 0, 0, 0),
  };
}

/** Gün başından itibaren geçen dakika (mock adım simülasyonu için). */
export function minutesSinceLocalMidnight(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

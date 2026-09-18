/**
 * U+2066 LEFT-TO-RIGHT ISOLATE ve U+2069 POP DIRECTIONAL ISOLATE.
 * Kaynakta görünmez karakter bulunmasın diye kod noktasından üretilir.
 */
const LRI = String.fromCodePoint(0x2066);
const PDI = String.fromCodePoint(0x2069);

/**
 * Soldan sağa yazılan bir değeri (telefon numarası gibi) çevresindeki metnin
 * yönünden yalıtır. Arapça (RTL) cümle içinde "+90 532 …" gibi değerlerin
 * işaretleri ve sırası karışmasın diye LRI … PDI ile sarılır.
 */
export function isolateLtr(value: string): string {
  return LRI + value + PDI;
}

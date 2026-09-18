/**
 * E-posta + şifre ile giriş için istemci tarafı kontroller.
 *
 * Bunlar yalnızca kullanıcıya erken geri bildirim içindir; asıl kural Firebase
 * Authentication'dadır. Şifre alt sınırı Firebase'in varsayılanıdır (6 karakter),
 * projede değiştirilmez.
 */

/** Firebase Authentication'ın varsayılan asgari şifre uzunluğu. */
export const PASSWORD_MIN_LENGTH = 6;

/** "ad@alan.uzantı" biçiminde, boşluk içermeyen bir adres mi? */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Baştaki/sondaki boşlukları atar; biçim geçersizse null döner. */
export function normalizeEmail(raw: string): string | null {
  const trimmed = raw.trim();
  return EMAIL_PATTERN.test(trimmed) ? trimmed : null;
}

/** Şifre Firebase'in asgari uzunluğunu karşılıyor mu? */
export function isStrongEnoughPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH;
}

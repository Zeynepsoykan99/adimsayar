/**
 * Telefonla giriş için numara ve kod doğrulama.
 *
 * SMS bölge politikası yalnızca Türkiye'ye açık olduğu için (Faz 3 kararı)
 * yalnızca Türkiye cep telefonu numaraları kabul edilir: 5 ile başlayan 10 hane.
 */

/** SMS doğrulama kodunun hane sayısı. */
export const VERIFICATION_CODE_LENGTH = 6;

/**
 * Kullanıcı girdisini E.164 biçimine çevirir: "+905XXXXXXXXX".
 * "5XX XXX XX XX", "05XX…", "905XX…" ve "+905XX…" yazımlarını kabul eder.
 * Geçerli bir Türkiye cep telefonu değilse null döner.
 */
export function normalizeTurkishMobile(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('90')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);

  if (!/^5\d{9}$/.test(digits)) return null;
  return '+90' + digits;
}

/** "+905321234567" → "+90 532 123 45 67". E.164 değilse girdiyi olduğu gibi döner. */
export function formatTurkishMobile(e164: string): string {
  const match = /^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(e164);
  if (!match) return e164;
  return '+90 ' + match.slice(1).join(' ');
}

/** Girdi, boşluklar atıldıktan sonra tam 6 haneli bir kod mu? */
export function isVerificationCode(raw: string): boolean {
  return new RegExp('^[0-9]{' + VERIFICATION_CODE_LENGTH + '}$').test(raw.replace(/\s/g, ''));
}

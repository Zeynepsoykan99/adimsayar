/** Uygulamanın desteklediği diller. Saf sabitler — her katmandan güvenle import edilir. */
export const SUPPORTED_LANGUAGES = ['tr', 'en', 'ar', 'ru', 'fr'] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Cihaz dili desteklenmiyorsa bu dile düşülür. */
export const FALLBACK_LANGUAGE: AppLanguage = 'en';

/** Sağdan sola yazılan diller. */
export const RTL_LANGUAGES: AppLanguage[] = ['ar'];

/** 'system' = cihaz dilini takip et. */
export type LanguagePreference = 'system' | AppLanguage;

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function isRtlLanguage(language: AppLanguage): boolean {
  return RTL_LANGUAGES.includes(language);
}

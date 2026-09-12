/* eslint-disable import/no-named-as-default-member -- i18next varsayilan ornegi bilerek kullaniliyor */
import 'intl-pluralrules';

import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  FALLBACK_LANGUAGE,
  isAppLanguage,
  SUPPORTED_LANGUAGES,
  type AppLanguage,
  type LanguagePreference,
} from './languages';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  ar: { translation: ar },
  ru: { translation: ru },
  fr: { translation: fr },
} as const;

/** Cihaz dili; desteklenmiyorsa fallback (İngilizce). */
export function getDeviceLanguage(): AppLanguage {
  for (const locale of getLocales()) {
    if (isAppLanguage(locale.languageCode)) return locale.languageCode;
  }
  return FALLBACK_LANGUAGE;
}

/** 'system' tercihini gerçek dile çözer. */
export function resolveLanguage(preference: LanguagePreference): AppLanguage {
  return preference === 'system' ? getDeviceLanguage() : preference;
}

export async function initI18n(language: AppLanguage): Promise<void> {
  if (i18n.isInitialized) {
    if (i18n.language !== language) await i18n.changeLanguage(language);
    return;
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export async function changeLanguage(language: AppLanguage): Promise<void> {
  await i18n.changeLanguage(language);
}

export { i18n };

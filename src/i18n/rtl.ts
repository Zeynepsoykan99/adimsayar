import { I18nManager, Platform } from 'react-native';

import { isRtlLanguage, type AppLanguage } from './languages';

/**
 * Web önizlemesi (react-native-web): I18nManager orada işlevsizdir — isRTL tanımsız,
 * forceRTL hiçbir şey yapmaz. Yön, sayfanın <html dir> özniteliğiyle belirlenir ve
 * yeniden başlatma gerektirmeden hemen uygulanır.
 */
function applyWebDirection(language: AppLanguage, rtl: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
}

/**
 * Aktif dile göre yazı yönünü ayarlar.
 *
 * React Native'de yön değişimi ancak uygulama yeniden başlatıldığında tam olarak
 * uygulanır. Bu fonksiyon yönü değiştirdiyse true döner; arayüz bu durumda
 * kullanıcıya "uygulamayı yeniden başlat" uyarısı gösterir. Web'de yön anında
 * uygulandığı için hiçbir zaman yeniden başlatma istenmez.
 */
export function applyTextDirection(language: AppLanguage): boolean {
  const shouldBeRtl = isRtlLanguage(language);

  if (Platform.OS === 'web') {
    applyWebDirection(language, shouldBeRtl);
    return false;
  }

  if (I18nManager.isRTL === shouldBeRtl) return false;

  I18nManager.allowRTL(shouldBeRtl);
  I18nManager.forceRTL(shouldBeRtl);
  return true;
}

export function isCurrentlyRtl(): boolean {
  if (Platform.OS === 'web') {
    return typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  }
  return I18nManager.isRTL;
}

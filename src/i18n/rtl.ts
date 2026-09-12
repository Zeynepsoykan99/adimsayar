import { I18nManager } from 'react-native';

import { isRtlLanguage, type AppLanguage } from './languages';

/**
 * Aktif dile göre yazı yönünü ayarlar.
 *
 * React Native'de yön değişimi ancak uygulama yeniden başlatıldığında tam olarak
 * uygulanır. Bu fonksiyon yönü değiştirdiyse true döner; arayüz bu durumda
 * kullanıcıya "uygulamayı yeniden başlat" uyarısı gösterir.
 */
export function applyTextDirection(language: AppLanguage): boolean {
  const shouldBeRtl = isRtlLanguage(language);
  if (I18nManager.isRTL === shouldBeRtl) return false;

  I18nManager.allowRTL(shouldBeRtl);
  I18nManager.forceRTL(shouldBeRtl);
  return true;
}

export function isCurrentlyRtl(): boolean {
  return I18nManager.isRTL;
}

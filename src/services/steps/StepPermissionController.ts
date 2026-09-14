/**
 * Adım verisine erişim durumu.
 *
 * checking                → durum henüz sorgulanıyor
 * unsupported             → cihaz/platform adım verisi sağlayamıyor
 * providerUpdateRequired  → sağlayıcı (Health Connect) kurulu değil veya güncellenmeli
 * denied                  → kullanıcı izni vermedi ya da geri aldı
 * granted                 → veri okunabilir
 */
export type StepAccessStatus =
  | 'checking'
  | 'unsupported'
  | 'providerUpdateRequired'
  | 'denied'
  | 'granted';

/**
 * Adım verisi izinlerini yöneten arayüz.
 *
 * StepRepository'den BİLEREK ayrı tutulmuştur: StepRepository arayüzü Faz 1'den
 * beri değişmeden kalsın diye izin yönetimi bu ikinci arayüze taşındı. İkisi de
 * services/index.ts factory'sinden birlikte verilir; ekranlar ve store'lar
 * hiçbir platform API'sini doğrudan görmez.
 */
export interface StepPermissionController {
  /** Mevcut durumu sorgular; kullanıcıya hiçbir şey göstermez. */
  checkStatus(): Promise<StepAccessStatus>;
  /** Sistem izin akışını başlatır ve sonuçtaki durumu döner. */
  request(): Promise<StepAccessStatus>;
  /**
   * Duruma göre doğru yere yönlendirir:
   * providerUpdateRequired → sağlayıcının mağaza sayfası,
   * denied → sağlayıcının izin/ayar ekranı.
   */
  openSettings(status: StepAccessStatus): Promise<void>;
}

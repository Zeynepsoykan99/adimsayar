import type { Unsubscribe } from '@/services/types';

/** Oturum açmış kullanıcı. Telefon numarası yalnızca kullanıcının kendisine gösterilir. */
export type AuthUser = {
  uid: string;
  phoneNumber: string | null;
};

/** Arayüzün ayırt ettiği giriş hataları; her biri ayrı bir çeviri anahtarına karşılık gelir. */
export type PhoneAuthErrorCode =
  'invalidPhone' | 'invalidCode' | 'codeExpired' | 'tooManyRequests' | 'network' | 'unknown';

export class PhoneAuthError extends Error {
  readonly code: PhoneAuthErrorCode;

  constructor(code: PhoneAuthErrorCode, cause?: unknown) {
    super(code, { cause });
    this.name = 'PhoneAuthError';
    this.code = code;
  }
}

/** Kod gönderildikten sonraki adım. Başarılı doğrulamada kullanıcı onAuthStateChanged ile gelir. */
export interface PhoneVerification {
  confirm(code: string): Promise<void>;
}

/**
 * Telefonla giriş.
 *
 * Giriş YALNIZCA mahalle akışında istenir; uygulamanın geri kalanı hesapsız çalışır.
 * Bu yüzden servis uygulama açılışında değil, mahalle ekranı ilk açıldığında
 * oluşturulur (services/index.ts → getSocialServices).
 */
export interface AuthService {
  /** Mevcut durumu hemen, sonra her değişikliği bildirir. */
  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe;
  /** SMS kodunu gönderir. Numara E.164 biçiminde olmalı (+905XXXXXXXXX). */
  startPhoneSignIn(phoneE164: string): Promise<PhoneVerification>;
}

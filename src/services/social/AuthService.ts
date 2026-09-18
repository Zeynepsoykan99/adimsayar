import type { Unsubscribe } from '@/services/types';

/** Oturum açmış kullanıcı. E-posta adresi yalnızca kullanıcının kendisine gösterilir. */
export type AuthUser = {
  uid: string;
  email: string | null;
};

/** Arayüzün ayırt ettiği giriş hataları; her biri ayrı bir çeviri anahtarına karşılık gelir. */
export type AuthErrorCode =
  | 'invalidEmail'
  | 'weakPassword'
  /** Yanlış şifre veya kayıtlı olmayan e-posta — ikisi bilerek ayırt edilmez. */
  | 'wrongCredentials'
  | 'emailInUse'
  | 'tooManyRequests'
  | 'network'
  | 'unknown';

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, cause?: unknown) {
    super(code, { cause });
    this.name = 'AuthError';
    this.code = code;
  }
}

/**
 * E-posta + şifre ile giriş.
 *
 * Giriş YALNIZCA mahalle akışında istenir; uygulamanın geri kalanı hesapsız çalışır.
 * Bu yüzden servis uygulama açılışında değil, mahalle ekranı ilk açıldığında
 * oluşturulur (services/index.ts → getSocialServices).
 *
 * E-posta doğrulaması zorunlu değildir: hesap oluşturulur oluşturulmaz oturum açılır.
 * Başarılı giriş/kayıtta kullanıcı onAuthStateChanged ile gelir.
 */
export interface AuthService {
  /** Mevcut durumu hemen, sonra her değişikliği bildirir. */
  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe;
  signUp(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  /**
   * Şifre sıfırlama e-postası gönderir. Hesabın var olup olmadığını açığa vurmaz:
   * kayıtlı olmayan bir adres için de hata vermeden tamamlanır.
   * languageCode, e-postanın hangi dilde gönderileceğini belirler (ör. "tr").
   */
  sendPasswordReset(email: string, languageCode: string): Promise<void>;
}

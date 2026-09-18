import {
  PhoneAuthError,
  type AuthService,
  type AuthUser,
  type PhoneVerification,
} from './AuthService';
import { normalizeTurkishMobile } from '@/domain/phone';
import { readJson, writeJson } from '@/services/storage';
import type { Unsubscribe } from '@/services/types';

/** Mock kaynakta kabul edilen tek doğrulama kodu (NOTES.md § 8). */
export const MOCK_VERIFICATION_CODE = '123456';

const USER_KEY = 'auth:user';

/** Gerçek ağ gecikmesini taklit eder; arayüzdeki yükleme durumu görülebilsin diye. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Firebase'e bağlanmadan telefonla giriş simülasyonu. SMS gönderilmez.
 * Oturum AsyncStorage'da tutulur; gerçek Firebase gibi uygulama yeniden açıldığında sürer.
 */
export class MockAuthService implements AuthService {
  private user: AuthUser | null = null;
  private loaded: Promise<void> | null = null;
  private readonly listeners = new Set<(user: AuthUser | null) => void>();

  private load(): Promise<void> {
    if (!this.loaded) {
      this.loaded = readJson<AuthUser | null>(USER_KEY, null).then((stored) => {
        this.user = stored;
      });
    }
    return this.loaded;
  }

  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe {
    this.listeners.add(listener);
    void this.load().then(() => {
      if (this.listeners.has(listener)) listener(this.user);
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  async startPhoneSignIn(phoneE164: string): Promise<PhoneVerification> {
    await delay(400);
    if (normalizeTurkishMobile(phoneE164) !== phoneE164) throw new PhoneAuthError('invalidPhone');

    return {
      confirm: async (code: string) => {
        await delay(400);
        if (code.trim() !== MOCK_VERIFICATION_CODE) throw new PhoneAuthError('invalidCode');
        await this.setUser({ uid: 'mock-' + phoneE164.slice(1), phoneNumber: phoneE164 });
      },
    };
  }

  private async setUser(user: AuthUser | null): Promise<void> {
    await this.load();
    this.user = user;
    await writeJson(USER_KEY, user);
    this.listeners.forEach((listener) => listener(user));
  }
}

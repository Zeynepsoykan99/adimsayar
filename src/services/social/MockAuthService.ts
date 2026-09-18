import { AuthError, type AuthService, type AuthUser } from './AuthService';
import { isStrongEnoughPassword, normalizeEmail } from '@/domain/credentials';
import { createId, readJson, writeJson } from '@/services/storage';
import type { Unsubscribe } from '@/services/types';

const USER_KEY = 'auth:user';
const ACCOUNTS_KEY = 'auth:accounts';

/**
 * Mock hesaplar. Şifre düz metin saklanır — bu YALNIZCA cihazdaki geliştirme
 * simülasyonudur, gerçek kullanıcı verisi hiçbir zaman buraya yazılmaz.
 */
type MockAccounts = Record<string, { uid: string; email: string; password: string }>;

/** Gerçek ağ gecikmesini taklit eder; arayüzdeki yükleme durumu görülebilsin diye. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Firebase gibi büyük/küçük harf farkını yok sayar. */
function accountKey(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Firebase'e bağlanmadan e-posta + şifre simülasyonu. Hesaplar ve oturum
 * AsyncStorage'da tutulur; gerçek Firebase gibi uygulama yeniden açıldığında sürer.
 * Hata davranışı Firebase'in e-posta numaralandırma korumasını taklit eder:
 * yanlış şifre ile kayıtlı olmayan e-posta aynı hatayı verir.
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

  async signUp(email: string, password: string): Promise<void> {
    await delay(400);
    const normalized = normalizeEmail(email);
    if (!normalized) throw new AuthError('invalidEmail');
    if (!isStrongEnoughPassword(password)) throw new AuthError('weakPassword');

    const accounts = await readJson<MockAccounts>(ACCOUNTS_KEY, {});
    const key = accountKey(normalized);
    if (accounts[key]) throw new AuthError('emailInUse');

    const uid = 'mock-' + createId();
    await writeJson(ACCOUNTS_KEY, { ...accounts, [key]: { uid, email: normalized, password } });
    await this.setUser({ uid, email: normalized });
  }

  async signIn(email: string, password: string): Promise<void> {
    await delay(400);
    const normalized = normalizeEmail(email);
    if (!normalized) throw new AuthError('invalidEmail');

    const accounts = await readJson<MockAccounts>(ACCOUNTS_KEY, {});
    const account = accounts[accountKey(normalized)];
    if (!account || account.password !== password) throw new AuthError('wrongCredentials');

    // Firebase gibi, girişte yazılan değil hesabın kayıtlı e-postası döner.
    await this.setUser({ uid: account.uid, email: account.email });
  }

  async sendPasswordReset(email: string): Promise<void> {
    await delay(400);
    if (!normalizeEmail(email)) throw new AuthError('invalidEmail');
    // Mock'ta e-posta gönderilmez; hesabın varlığı da açığa vurulmaz.
  }

  private async setUser(user: AuthUser | null): Promise<void> {
    await this.load();
    this.user = user;
    await writeJson(USER_KEY, user);
    this.listeners.forEach((listener) => listener(user));
  }
}

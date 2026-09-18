import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setLanguageCode,
  signInWithEmailAndPassword,
  type User,
} from '@react-native-firebase/auth';

import { AuthError, type AuthErrorCode, type AuthService, type AuthUser } from './AuthService';
import type { Unsubscribe } from '@/services/types';

/**
 * Firebase hata kodlarını arayüzün tanıdığı kodlara çevirir.
 * RNFB kodları "auth/wrong-password" biçimindedir; sondaki kısım eşlenir.
 *
 * Yeni projelerde e-posta numaralandırma koruması varsayılan olarak açıktır: yanlış
 * şifre ve kayıtlı olmayan e-posta tek bir "invalid-credential" koduyla gelir.
 * Koruma kapalıysa gelen ayrı kodlar da aynı mesaja eşlenir.
 */
const ERROR_CODES: Record<string, AuthErrorCode> = {
  'invalid-email': 'invalidEmail',
  'missing-email': 'invalidEmail',
  'weak-password': 'weakPassword',
  'missing-password': 'weakPassword',
  'invalid-credential': 'wrongCredentials',
  'invalid-login-credentials': 'wrongCredentials',
  'wrong-password': 'wrongCredentials',
  'user-not-found': 'wrongCredentials',
  'email-already-in-use': 'emailInUse',
  'too-many-requests': 'tooManyRequests',
  'network-request-failed': 'network',
};

/** "auth/wrong-password" → "wrong-password"; kod yoksa boş metin. */
function firebaseCode(error: unknown): string {
  const raw =
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  return raw.replace(/^auth\//, '');
}

function isUserNotFound(error: unknown): boolean {
  return firebaseCode(error) === 'user-not-found';
}

function toAuthError(error: unknown): AuthError {
  return new AuthError(ERROR_CODES[firebaseCode(error)] ?? 'unknown', error);
}

async function run(action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
  } catch (error) {
    throw toAuthError(error);
  }
}

function toAuthUser(user: User | null): AuthUser | null {
  return user ? { uid: user.uid, email: user.email } : null;
}

/** Firebase Authentication ile e-posta + şifre girişi (native SDK). */
export class FirebaseAuthService implements AuthService {
  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe {
    return onAuthStateChanged(getAuth(), (user) => listener(toAuthUser(user)));
  }

  signUp(email: string, password: string): Promise<void> {
    return run(() => createUserWithEmailAndPassword(getAuth(), email.trim(), password));
  }

  signIn(email: string, password: string): Promise<void> {
    return run(() => signInWithEmailAndPassword(getAuth(), email.trim(), password));
  }

  sendPasswordReset(email: string, languageCode: string): Promise<void> {
    return run(async () => {
      // Sıfırlama e-postası uygulamanın o anki dilinde gönderilsin.
      await setLanguageCode(getAuth(), languageCode);
      try {
        await sendPasswordResetEmail(getAuth(), email.trim());
      } catch (error) {
        // Numaralandırma koruması kapalıysa (ve emülatörde) kayıtlı olmayan adres
        // "user-not-found" döner. Hesabın varlığını açığa vurmamak için başarı sayılır.
        if (isUserNotFound(error)) return;
        throw error;
      }
    });
  }
}

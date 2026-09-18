import {
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  type User,
} from '@react-native-firebase/auth';

import {
  PhoneAuthError,
  type AuthService,
  type AuthUser,
  type PhoneAuthErrorCode,
  type PhoneVerification,
} from './AuthService';
import type { Unsubscribe } from '@/services/types';

/**
 * Firebase hata kodlarını arayüzün tanıdığı kodlara çevirir.
 * RNFB kodları "auth/invalid-verification-code" biçimindedir; sondaki kısım eşlenir.
 */
const ERROR_CODES: Record<string, PhoneAuthErrorCode> = {
  'invalid-phone-number': 'invalidPhone',
  'missing-phone-number': 'invalidPhone',
  'invalid-verification-code': 'invalidCode',
  'missing-verification-code': 'invalidCode',
  'session-expired': 'codeExpired',
  'code-expired': 'codeExpired',
  'too-many-requests': 'tooManyRequests',
  'quota-exceeded': 'tooManyRequests',
  'network-request-failed': 'network',
};

function toPhoneAuthError(error: unknown): PhoneAuthError {
  const raw =
    typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  const key = raw.replace(/^auth\//, '');
  return new PhoneAuthError(ERROR_CODES[key] ?? 'unknown', error);
}

function toAuthUser(user: User | null): AuthUser | null {
  return user ? { uid: user.uid, phoneNumber: user.phoneNumber } : null;
}

/**
 * Firebase Authentication ile telefonla giriş (native SDK).
 * Android'de cihaz Play Integrity ile, gerekirse reCAPTCHA ile doğrulanır. Android bazen
 * SMS'i kendiliğinden okuyup girişi tamamlar; o durumda kullanıcı onAuthStateChanged ile
 * gelir ve kod ekranı kendiliğinden kapanır.
 */
export class FirebaseAuthService implements AuthService {
  onAuthStateChanged(listener: (user: AuthUser | null) => void): Unsubscribe {
    return onAuthStateChanged(getAuth(), (user) => listener(toAuthUser(user)));
  }

  async startPhoneSignIn(phoneE164: string): Promise<PhoneVerification> {
    try {
      const confirmation = await signInWithPhoneNumber(getAuth(), phoneE164);
      return {
        confirm: async (code: string) => {
          try {
            await confirmation.confirm(code.trim());
          } catch (error) {
            throw toPhoneAuthError(error);
          }
        },
      };
    } catch (error) {
      throw toPhoneAuthError(error);
    }
  }
}

import { getApp } from '@react-native-firebase/app';
import {
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from '@react-native-firebase/app-check';
import { connectAuthEmulator, getAuth } from '@react-native-firebase/auth';

/** Firebase Auth emülatörünün portu (firebase.json → emulators.auth.port ile aynı). */
export const AUTH_EMULATOR_PORT = 9099;

export type FirebaseTarget = 'emulator' | 'firebase';

let configured = false;

/**
 * Firebase'i hedefe göre bir kez yapılandırır.
 *
 * emulator → Auth emülatörüne bağlanır. Emülatör App Check istemez, gerçek e-posta gönderilmez.
 *            Fiziksel cihazda `adb reverse tcp:9099 tcp:9099` ile localhost kullanılır;
 *            başka bir makine için EXPO_PUBLIC_FIREBASE_EMULATOR_HOST verilir.
 * firebase → App Check açılır. Geliştirme derlemelerinde debug sağlayıcı, yayında
 *            Play Integrity / App Attest kullanılır. Debug token Firebase konsoluna kayıtlı
 *            olmalı (EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN, .env.local — git'e girmez).
 */
export function configureFirebase(target: FirebaseTarget): void {
  if (configured) return;
  configured = true;

  if (target === 'emulator') {
    const host = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';
    connectAuthEmulator(getAuth(), 'http://' + host + ':' + AUTH_EMULATOR_PORT);
    return;
  }

  const debugToken = __DEV__
    ? process.env.EXPO_PUBLIC_APPCHECK_DEBUG_TOKEN || undefined
    : undefined;
  const provider = new ReactNativeFirebaseAppCheckProvider();
  provider.configure({
    android: { provider: __DEV__ ? 'debug' : 'playIntegrity', debugToken },
    apple: { provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback', debugToken },
  });
  initializeAppCheck(getApp(), { provider, isTokenAutoRefreshEnabled: true });
}

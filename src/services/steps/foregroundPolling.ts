import { AppState, type AppStateStatus } from 'react-native';

import type { Unsubscribe } from '@/services/types';

/** Yoklama aralığı. Pil tüketimini düşük tutmak için 30 saniye. */
export const POLL_INTERVAL_MS = 30000;

/**
 * Yalnızca uygulama ön plandayken çalışan yoklama döngüsü.
 *
 * - Abone olunduğunda hemen bir okuma yapar.
 * - Uygulama arka plana geçtiğinde zamanlayıcıyı tamamen durdurur.
 * - Arka plandan öne geldiğinde beklemeden anında bir okuma yapar, sonra
 *   döngüyü yeniden başlatır.
 * - Abonelik bittiğinde hem zamanlayıcıyı hem AppState dinleyicisini temizler.
 *
 * "Yalnızca adım bölümü görünürken" kısıtı çağıran tarafta sağlanır:
 * StepsSection bu aboneliği useFocusEffect içinde açar, ekrandan çıkılınca kapatır.
 */
export function startForegroundPolling(read: () => void | Promise<void>): Unsubscribe {
  let timer: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  const stopTimer = () => {
    if (timer === null) return;
    clearInterval(timer);
    timer = null;
  };

  const startTimer = () => {
    if (stopped || timer !== null) return;
    timer = setInterval(() => {
      void read();
    }, POLL_INTERVAL_MS);
  };

  const runNow = () => {
    if (stopped) return;
    void read();
  };

  const handleAppStateChange = (status: AppStateStatus) => {
    if (stopped) return;
    if (status === 'active') {
      runNow();
      startTimer();
    } else {
      stopTimer();
    }
  };

  // İlk okuma beklemeden yapılır.
  runNow();
  if (AppState.currentState === 'active') startTimer();

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    stopped = true;
    stopTimer();
    subscription.remove();
  };
}

import type { DailySteps, DateKey, Unsubscribe } from '@/services/types';

/**
 * Adım verisi kaynağı.
 * Faz 1: MockStepRepository (simülasyon).
 * Sonraki faz: HealthConnectStepRepository (Android) / HealthKitStepRepository (iOS).
 * Ekranlar yalnızca bu arayüzü tanır.
 */
export interface StepRepository {
  /** Belirtilen günün adım verisi. */
  getDailySteps(date: DateKey): Promise<DailySteps>;
  /** Tarih aralığı — Faz 1'de ekranda kullanılmıyor, arayüz ileriye hazır. */
  getRange(from: DateKey, to: DateKey): Promise<DailySteps[]>;
  /** Canlı güncelleme. Gerçek kaynakta sensör aboneliğine karşılık gelir. */
  subscribe(date: DateKey, listener: (steps: DailySteps) => void): Unsubscribe;
}

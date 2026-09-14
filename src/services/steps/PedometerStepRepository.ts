import { Pedometer } from 'expo-sensors';
import { Linking } from 'react-native';

import type { StepRepository } from './StepRepository';
import type { StepAccessStatus, StepPermissionController } from './StepPermissionController';
import { stepsToActiveMinutes } from '@/domain/steps';
import type { DailySteps, DateKey, Unsubscribe } from '@/services/types';
import { dayBounds, todayKey } from '@/utils/date';

/**
 * iOS adım verisi kaynağı: Core Motion (CMPedometer), expo-sensors üzerinden.
 *
 * TODO (sonraki faz): HealthKit entegrasyonu eklenecek. Core Motion yalnızca
 * telefonun kendi sensörünü okur; Apple Watch'tan veya başka uygulamalardan
 * gelen adımları görmez ve yalnızca son 7 günlük veriyi saklar. HealthKit
 * eklendiğinde günün toplamı oradan, canlı akış yine Core Motion'dan gelmeli.
 * Bu faz Windows üzerinde geliştirildiği için iOS tarafı DERLENMEDİ ve
 * TEST EDİLMEDİ.
 */
export class PedometerPermissionController implements StepPermissionController {
  async checkStatus(): Promise<StepAccessStatus> {
    try {
      const available = await Pedometer.isAvailableAsync();
      if (!available) return 'unsupported';

      const permission = await Pedometer.getPermissionsAsync();
      return permission.granted ? 'granted' : 'denied';
    } catch {
      return 'unsupported';
    }
  }

  async request(): Promise<StepAccessStatus> {
    const current = await this.checkStatus();
    if (current !== 'denied') return current;

    try {
      const permission = await Pedometer.requestPermissionsAsync();
      return permission.granted ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }

  async openSettings(): Promise<void> {
    // Core Motion izni reddedildikten sonra yalnızca sistem ayarlarından açılabilir.
    await Linking.openSettings();
  }
}

export class PedometerStepRepository implements StepRepository {
  async getDailySteps(date: DateKey): Promise<DailySteps> {
    const { start, end } = dayBounds(date);

    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      const steps = result.steps ?? 0;
      return { date, steps, activeMinutes: stepsToActiveMinutes(steps) };
    } catch {
      return { date, steps: 0, activeMinutes: 0 };
    }
  }

  async getRange(from: DateKey, to: DateKey): Promise<DailySteps[]> {
    const days = await Promise.all([this.getDailySteps(from), this.getDailySteps(to)]);
    return days.filter((day, index, all) => all.findIndex((d) => d.date === day.date) === index);
  }

  /**
   * Core Motion gerçek bir canlı akış verir: watchStepCount abonelik anından
   * itibaren atılan adımları bildirir. Gün toplamı ayrıca okunur ve canlı artış
   * bunun üzerine eklenir. Geçmiş bir gün izleniyorsa canlı akış anlamsız
   * olduğundan yalnızca tek okuma yapılır.
   */
  subscribe(date: DateKey, listener: (steps: DailySteps) => void): Unsubscribe {
    let baseSteps = 0;
    let liveSteps = 0;
    let cancelled = false;

    const emit = () => {
      if (cancelled) return;
      const steps = baseSteps + liveSteps;
      listener({ date, steps, activeMinutes: stepsToActiveMinutes(steps) });
    };

    void this.getDailySteps(date).then((daily) => {
      if (cancelled) return;
      baseSteps = daily.steps;
      emit();
    });

    if (date !== todayKey()) {
      return () => {
        cancelled = true;
      };
    }

    const subscription = Pedometer.watchStepCount((result) => {
      liveSteps = result.steps ?? 0;
      emit();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }
}

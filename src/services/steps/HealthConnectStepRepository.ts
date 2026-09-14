import {
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  requestPermission,
  SdkAvailabilityStatus,
  type Permission,
} from 'react-native-health-connect';
import { Linking } from 'react-native';

import { startForegroundPolling } from './foregroundPolling';
import type { StepRepository } from './StepRepository';
import type { StepAccessStatus, StepPermissionController } from './StepPermissionController';
import { stepsToActiveMinutes } from '@/domain/steps';
import type { DailySteps, DateKey, Unsubscribe } from '@/services/types';
import { dayBoundsIso } from '@/utils/date';

/**
 * Veri minimizasyonu: yalnızca adım okuma izni istenir.
 * Arka plan okuma (READ_HEALTH_DATA_IN_BACKGROUND) veya başka bir veri tipi
 * İSTENMEZ — Google Play'in Health Connect politikası bunu şart koşuyor.
 */
const STEP_PERMISSIONS: Permission[] = [{ accessType: 'read', recordType: 'Steps' }];

const HEALTH_CONNECT_PACKAGE = 'com.google.android.apps.healthdata';
const PLAY_STORE_APP_URL = 'market://details?id=' + HEALTH_CONNECT_PACKAGE;
const PLAY_STORE_WEB_URL =
  'https://play.google.com/store/apps/details?id=' + HEALTH_CONNECT_PACKAGE;

/**
 * getGrantedPermissions/requestPermission daha geniş bir birleşim tipi döner
 * (egzersiz rotası, arka plan erişimi vb. dâhil). Bizi yalnızca adım okuma
 * izni ilgilendirdiği için yapısal kontrol yeterli.
 */
type GrantedPermissionLike = { accessType?: string; recordType?: string };

function hasStepPermission(permissions: readonly GrantedPermissionLike[]): boolean {
  return permissions.some(
    (permission) => permission.recordType === 'Steps' && permission.accessType === 'read',
  );
}

/** Health Connect izin durumu denetleyicisi (Android). */
export class HealthConnectPermissionController implements StepPermissionController {
  async checkStatus(): Promise<StepAccessStatus> {
    try {
      const sdkStatus = await getSdkStatus();

      if (sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE) return 'unsupported';
      if (sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
        return 'providerUpdateRequired';
      }

      const initialized = await initialize();
      if (!initialized) return 'unsupported';

      const granted = await getGrantedPermissions();
      return hasStepPermission(granted) ? 'granted' : 'denied';
    } catch {
      return 'unsupported';
    }
  }

  async request(): Promise<StepAccessStatus> {
    const current = await this.checkStatus();
    if (current !== 'denied') return current;

    try {
      const granted = await requestPermission(STEP_PERMISSIONS);
      return hasStepPermission(granted) ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }

  async openSettings(status: StepAccessStatus): Promise<void> {
    if (status === 'providerUpdateRequired') {
      try {
        await Linking.openURL(PLAY_STORE_APP_URL);
      } catch {
        await Linking.openURL(PLAY_STORE_WEB_URL);
      }
      return;
    }

    openHealthConnectSettings();
  }
}

/**
 * Android adım verisi kaynağı: Health Connect.
 *
 * Health Connect'te push aboneliği yoktur; canlı güncelleme, yalnızca uygulama
 * ön plandayken çalışan 30 saniyelik bir yoklama döngüsüyle sağlanır
 * (bkz. foregroundPolling.ts).
 */
export class HealthConnectStepRepository implements StepRepository {
  async getDailySteps(date: DateKey): Promise<DailySteps> {
    const { startTime, endTime } = dayBoundsIso(date);

    try {
      const result = await aggregateRecord({
        recordType: 'Steps',
        timeRangeFilter: { operator: 'between', startTime, endTime },
      });
      const steps = result.COUNT_TOTAL ?? 0;
      return { date, steps, activeMinutes: stepsToActiveMinutes(steps) };
    } catch {
      return { date, steps: 0, activeMinutes: 0 };
    }
  }

  async getRange(from: DateKey, to: DateKey): Promise<DailySteps[]> {
    const days = await Promise.all([this.getDailySteps(from), this.getDailySteps(to)]);
    return days.filter((day, index, all) => all.findIndex((d) => d.date === day.date) === index);
  }

  subscribe(date: DateKey, listener: (steps: DailySteps) => void): Unsubscribe {
    return startForegroundPolling(async () => {
      listener(await this.getDailySteps(date));
    });
  }
}

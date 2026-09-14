import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

import type { CalorieRepository } from './calories/CalorieRepository';
import { MockCalorieRepository } from './calories/MockCalorieRepository';
import type { ProfileRepository } from './profile/ProfileRepository';
import { MockProfileRepository } from './profile/MockProfileRepository';
import { MockStepPermissionController } from './steps/MockStepPermissionController';
import { MockStepRepository } from './steps/MockStepRepository';
import {
  PedometerPermissionController,
  PedometerStepRepository,
} from './steps/PedometerStepRepository';
import type { StepPermissionController } from './steps/StepPermissionController';
import type { StepRepository } from './steps/StepRepository';
import type { WaterRepository } from './water/WaterRepository';
import { MockWaterRepository } from './water/MockWaterRepository';

/**
 * Repository factory — uygulamanın veri kaynağını seçtiği TEK yer.
 *
 * Adım verisi (Faz 2):
 *   Android → Health Connect
 *   iOS     → Core Motion (expo-sensors Pedometer). HealthKit sonraki faza ertelendi.
 *   diğer   → mock
 *
 * Kalori, su ve profil Faz 1'deki gibi mock + AsyncStorage olarak kalır.
 * Sonraki fazlarda Firestore'a geçiş yine yalnızca bu dosyadan yapılacak.
 * Ekranlar ve store'lar ne Mock* sınıflarını ne de platform API'lerini görür.
 */
export type Repositories = {
  steps: StepRepository;
  stepPermissions: StepPermissionController;
  profile: ProfileRepository;
  calories: CalorieRepository;
  water: WaterRepository;
};

/**
 * Geliştirme sırasında gerçek kaynağı atlayıp simülasyona dönmek için:
 * .env veya kabukta EXPO_PUBLIC_STEP_SOURCE=mock
 *
 * Expo Go'da native modüller bulunmadığı için orada da mock kaynak kullanılır.
 */
function isMockStepSource(): boolean {
  if (process.env.EXPO_PUBLIC_STEP_SOURCE === 'mock') return true;
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function createMockStepSource(): Pick<Repositories, 'steps' | 'stepPermissions'> {
  return {
    steps: new MockStepRepository(),
    stepPermissions: new MockStepPermissionController(),
  };
}

function createStepSource(): Pick<Repositories, 'steps' | 'stepPermissions'> {
  if (isMockStepSource()) return createMockStepSource();

  if (Platform.OS === 'android') {
    /*
     * TEMBEL (LAZY) IMPORT — bilerek statik import kullanılmıyor.
     * react-native-health-connect, modül yüklendiği anda
     * TurboModuleRegistry.getEnforcing('HealthConnect') çağırır ve native modül
     * kayıtlı değilse (Expo Go) import sırasında çöker. Bu yüzden modül yalnızca
     * gerçekten Android'de ve mock kapalıyken yüklenir.
     */
    const healthConnect =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./steps/HealthConnectStepRepository') as typeof import('./steps/HealthConnectStepRepository');

    return {
      steps: new healthConnect.HealthConnectStepRepository(),
      stepPermissions: new healthConnect.HealthConnectPermissionController(),
    };
  }

  if (Platform.OS === 'ios') {
    return {
      steps: new PedometerStepRepository(),
      stepPermissions: new PedometerPermissionController(),
    };
  }

  return createMockStepSource();
}

let instance: Repositories | null = null;

export function getRepositories(): Repositories {
  if (!instance) {
    instance = {
      ...createStepSource(),
      profile: new MockProfileRepository(),
      calories: new MockCalorieRepository(),
      water: new MockWaterRepository(),
    };
  }
  return instance;
}

export type {
  StepRepository,
  StepPermissionController,
  ProfileRepository,
  CalorieRepository,
  WaterRepository,
};

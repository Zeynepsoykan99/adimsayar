import { Platform } from 'react-native';

import type { CalorieRepository } from './calories/CalorieRepository';
import { MockCalorieRepository } from './calories/MockCalorieRepository';
import type { ProfileRepository } from './profile/ProfileRepository';
import { MockProfileRepository } from './profile/MockProfileRepository';
import {
  HealthConnectPermissionController,
  HealthConnectStepRepository,
} from './steps/HealthConnectStepRepository';
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
 */
function isMockStepSource(): boolean {
  return process.env.EXPO_PUBLIC_STEP_SOURCE === 'mock';
}

function createStepSource(): Pick<Repositories, 'steps' | 'stepPermissions'> {
  if (isMockStepSource()) {
    return {
      steps: new MockStepRepository(),
      stepPermissions: new MockStepPermissionController(),
    };
  }

  if (Platform.OS === 'android') {
    return {
      steps: new HealthConnectStepRepository(),
      stepPermissions: new HealthConnectPermissionController(),
    };
  }

  if (Platform.OS === 'ios') {
    return {
      steps: new PedometerStepRepository(),
      stepPermissions: new PedometerPermissionController(),
    };
  }

  return {
    steps: new MockStepRepository(),
    stepPermissions: new MockStepPermissionController(),
  };
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

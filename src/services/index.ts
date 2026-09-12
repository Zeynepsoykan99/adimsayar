import { MockCalorieRepository } from './calories/MockCalorieRepository';
import type { CalorieRepository } from './calories/CalorieRepository';
import { MockProfileRepository } from './profile/MockProfileRepository';
import type { ProfileRepository } from './profile/ProfileRepository';
import { MockStepRepository } from './steps/MockStepRepository';
import type { StepRepository } from './steps/StepRepository';
import { MockWaterRepository } from './water/MockWaterRepository';
import type { WaterRepository } from './water/WaterRepository';

/**
 * Repository factory — uygulamanın veri kaynağını seçtiği TEK yer.
 *
 * Faz 1'de hepsi mock. Sonraki fazlarda yalnızca bu dosyadaki satırlar değişir:
 *   steps   -> HealthConnectStepRepository (Android) / HealthKitStepRepository (iOS)
 *   profile -> FirestoreProfileRepository
 *   calorie -> FirestoreCalorieRepository
 *   water   -> FirestoreWaterRepository
 * Ekranlar ve store'lar Mock* sınıflarını hiçbir zaman import etmez.
 */
export type Repositories = {
  steps: StepRepository;
  profile: ProfileRepository;
  calories: CalorieRepository;
  water: WaterRepository;
};

let instance: Repositories | null = null;

export function getRepositories(): Repositories {
  if (!instance) {
    instance = {
      steps: new MockStepRepository(),
      profile: new MockProfileRepository(),
      calories: new MockCalorieRepository(),
      water: new MockWaterRepository(),
    };
  }
  return instance;
}

export type { StepRepository, ProfileRepository, CalorieRepository, WaterRepository };

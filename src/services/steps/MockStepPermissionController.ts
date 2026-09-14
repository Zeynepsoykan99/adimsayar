import type { StepAccessStatus, StepPermissionController } from './StepPermissionController';

/**
 * Mock kaynağın izin denetleyicisi: her zaman izin verilmiş sayılır.
 * Geliştirme sırasında (EXPO_PUBLIC_STEP_SOURCE=mock) izin akışını atlamak için.
 */
export class MockStepPermissionController implements StepPermissionController {
  async checkStatus(): Promise<StepAccessStatus> {
    return 'granted';
  }

  async request(): Promise<StepAccessStatus> {
    return 'granted';
  }

  async openSettings(): Promise<void> {
    // Mock kaynakta açılacak bir ayar ekranı yok.
  }
}

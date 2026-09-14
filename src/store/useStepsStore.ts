import { create } from 'zustand';

import { getRepositories } from '@/services';
import type { StepAccessStatus } from '@/services/steps/StepPermissionController';
import type { DateKey, Unsubscribe } from '@/services/types';

type StepsState = {
  ready: boolean;
  date: DateKey | null;
  steps: number;
  activeMinutes: number;
  /** Adım verisine erişim durumu — izin akışının UI'ı buna bakar. */
  access: StepAccessStatus;
  requesting: boolean;
  load: (date: DateKey) => Promise<void>;
  /** Canlı adım akışına abone olur; temizleme fonksiyonu döner. */
  watch: (date: DateKey) => Unsubscribe;
  refreshAccess: () => Promise<StepAccessStatus>;
  requestAccess: () => Promise<void>;
  openSettings: () => Promise<void>;
};

export const useStepsStore = create<StepsState>((set, get) => ({
  ready: false,
  date: null,
  steps: 0,
  activeMinutes: 0,
  access: 'checking',
  requesting: false,

  load: async (date) => {
    // Gün anahtarı her durumda güncellenir; izin yoksa sayaç sıfır gösterilir.
    set({ date });

    const access = get().access === 'checking' ? await get().refreshAccess() : get().access;
    if (access !== 'granted') {
      set({ ready: true, steps: 0, activeMinutes: 0 });
      return;
    }

    const daily = await getRepositories().steps.getDailySteps(date);
    set({ ready: true, date: daily.date, steps: daily.steps, activeMinutes: daily.activeMinutes });
  },

  watch: (date) =>
    getRepositories().steps.subscribe(date, (daily) => {
      set({ ready: true, date: daily.date, steps: daily.steps, activeMinutes: daily.activeMinutes });
    }),

  refreshAccess: async () => {
    const access = await getRepositories().stepPermissions.checkStatus();
    set({ access });
    return access;
  },

  requestAccess: async () => {
    set({ requesting: true });
    try {
      const access = await getRepositories().stepPermissions.request();
      set({ access });
      const { date } = get();
      if (access === 'granted' && date) {
        const daily = await getRepositories().steps.getDailySteps(date);
        set({ steps: daily.steps, activeMinutes: daily.activeMinutes });
      }
    } finally {
      set({ requesting: false });
    }
  },

  openSettings: async () => {
    await getRepositories().stepPermissions.openSettings(get().access);
  },
}));

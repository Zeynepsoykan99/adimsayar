import { create } from 'zustand';

import { getRepositories } from '@/services';
import type { DateKey, Unsubscribe } from '@/services/types';

type StepsState = {
  ready: boolean;
  date: DateKey | null;
  steps: number;
  activeMinutes: number;
  load: (date: DateKey) => Promise<void>;
  /** Canlı adım akışına abone olur; temizleme fonksiyonu döner. */
  watch: (date: DateKey) => Unsubscribe;
};

export const useStepsStore = create<StepsState>((set) => ({
  ready: false,
  date: null,
  steps: 0,
  activeMinutes: 0,

  load: async (date) => {
    const daily = await getRepositories().steps.getDailySteps(date);
    set({ ready: true, date: daily.date, steps: daily.steps, activeMinutes: daily.activeMinutes });
  },

  watch: (date) =>
    getRepositories().steps.subscribe(date, (daily) => {
      set({ ready: true, date: daily.date, steps: daily.steps, activeMinutes: daily.activeMinutes });
    }),
}));

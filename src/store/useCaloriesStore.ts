import { create } from 'zustand';

import { getRepositories } from '@/services';
import type { CalorieEntry, DateKey } from '@/services/types';

type CaloriesState = {
  ready: boolean;
  date: DateKey | null;
  entries: CalorieEntry[];
  load: (date: DateKey) => Promise<void>;
  add: (kcal: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearDay: () => Promise<void>;
};

export const useCaloriesStore = create<CaloriesState>((set, get) => ({
  ready: false,
  date: null,
  entries: [],

  load: async (date) => {
    const entries = await getRepositories().calories.getDay(date);
    set({ ready: true, date, entries });
  },

  add: async (kcal) => {
    const { date } = get();
    if (!date) return;
    const entries = await getRepositories().calories.add(date, kcal);
    set({ entries });
  },

  remove: async (id) => {
    const { date } = get();
    if (!date) return;
    const entries = await getRepositories().calories.remove(date, id);
    set({ entries });
  },

  clearDay: async () => {
    const { date } = get();
    if (!date) return;
    const entries = await getRepositories().calories.clearDay(date);
    set({ entries });
  },
}));

/** Günün toplam tüketilen kalorisi. */
export function sumEntries(entries: CalorieEntry[]): number {
  return entries.reduce((total, entry) => total + entry.kcal, 0);
}

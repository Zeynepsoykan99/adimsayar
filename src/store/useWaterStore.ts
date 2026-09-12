import { create } from 'zustand';

import { getRepositories } from '@/services';
import type { DateKey, WaterEntry } from '@/services/types';

type WaterState = {
  ready: boolean;
  date: DateKey | null;
  totalMl: number;
  entries: WaterEntry[];
  load: (date: DateKey) => Promise<void>;
  add: (amountMl: number) => Promise<void>;
  undoLast: () => Promise<void>;
  clearDay: () => Promise<void>;
};

export const useWaterStore = create<WaterState>((set, get) => ({
  ready: false,
  date: null,
  totalMl: 0,
  entries: [],

  load: async (date) => {
    const day = await getRepositories().water.getDay(date);
    set({ ready: true, date: day.date, totalMl: day.totalMl, entries: day.entries });
  },

  add: async (amountMl) => {
    const { date } = get();
    if (!date) return;
    const day = await getRepositories().water.add(date, amountMl);
    set({ totalMl: day.totalMl, entries: day.entries });
  },

  undoLast: async () => {
    const { date } = get();
    if (!date) return;
    const day = await getRepositories().water.removeLast(date);
    set({ totalMl: day.totalMl, entries: day.entries });
  },

  clearDay: async () => {
    const { date } = get();
    if (!date) return;
    const day = await getRepositories().water.clearDay(date);
    set({ totalMl: day.totalMl, entries: day.entries });
  },
}));

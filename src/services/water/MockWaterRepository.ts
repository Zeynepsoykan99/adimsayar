import type { WaterRepository } from './WaterRepository';
import { createId, readJson, removeKey, writeJson } from '@/services/storage';
import type { DateKey, WaterDay, WaterEntry } from '@/services/types';

function storageKey(date: DateKey): string {
  return 'water:' + date;
}

function toDay(date: DateKey, entries: WaterEntry[]): WaterDay {
  return {
    date,
    entries,
    totalMl: entries.reduce((total, entry) => total + entry.amountMl, 0),
  };
}

export class MockWaterRepository implements WaterRepository {
  async getDay(date: DateKey): Promise<WaterDay> {
    const entries = await readJson<WaterEntry[]>(storageKey(date), []);
    return toDay(date, entries);
  }

  async add(date: DateKey, amountMl: number): Promise<WaterDay> {
    const { entries } = await this.getDay(date);
    const next = [...entries, { id: createId(), date, amountMl, createdAt: Date.now() }];
    await writeJson(storageKey(date), next);
    return toDay(date, next);
  }

  async removeLast(date: DateKey): Promise<WaterDay> {
    const { entries } = await this.getDay(date);
    const next = entries.slice(0, -1);
    await writeJson(storageKey(date), next);
    return toDay(date, next);
  }

  async clearDay(date: DateKey): Promise<WaterDay> {
    await removeKey(storageKey(date));
    return toDay(date, []);
  }
}

import type { CalorieRepository } from './CalorieRepository';
import { createId, readJson, removeKey, writeJson } from '@/services/storage';
import type { CalorieEntry, DateKey } from '@/services/types';

function storageKey(date: DateKey): string {
  return 'calories:' + date;
}

export class MockCalorieRepository implements CalorieRepository {
  async getDay(date: DateKey): Promise<CalorieEntry[]> {
    return readJson<CalorieEntry[]>(storageKey(date), []);
  }

  async add(date: DateKey, kcal: number): Promise<CalorieEntry[]> {
    const entries = await this.getDay(date);
    const next = [...entries, { id: createId(), date, kcal, createdAt: Date.now() }];
    await writeJson(storageKey(date), next);
    return next;
  }

  async remove(date: DateKey, id: string): Promise<CalorieEntry[]> {
    const entries = await this.getDay(date);
    const next = entries.filter((entry) => entry.id !== id);
    await writeJson(storageKey(date), next);
    return next;
  }

  async clearDay(date: DateKey): Promise<CalorieEntry[]> {
    await removeKey(storageKey(date));
    return [];
  }
}

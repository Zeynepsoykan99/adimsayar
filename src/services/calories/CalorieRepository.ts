import type { CalorieEntry, DateKey } from '@/services/types';

/**
 * Elle girilen kalori tüketimi.
 * Faz 1: MockCalorieRepository (AsyncStorage). Besin veritabanı kapsam dışı.
 */
export interface CalorieRepository {
  getDay(date: DateKey): Promise<CalorieEntry[]>;
  add(date: DateKey, kcal: number): Promise<CalorieEntry[]>;
  remove(date: DateKey, id: string): Promise<CalorieEntry[]>;
  /** Günü tamamen sıfırlar. */
  clearDay(date: DateKey): Promise<CalorieEntry[]>;
}

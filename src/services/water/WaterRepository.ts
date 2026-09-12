import type { DateKey, WaterDay } from '@/services/types';

/**
 * Günlük su tüketimi.
 * Faz 1: MockWaterRepository (AsyncStorage).
 */
export interface WaterRepository {
  getDay(date: DateKey): Promise<WaterDay>;
  add(date: DateKey, amountMl: number): Promise<WaterDay>;
  /** Son eklenen kaydı geri alır. */
  removeLast(date: DateKey): Promise<WaterDay>;
  clearDay(date: DateKey): Promise<WaterDay>;
}

import type { StepRepository } from './StepRepository';
import { readJson, writeJson } from '@/services/storage';
import type { DailySteps, DateKey, Unsubscribe } from '@/services/types';
import { minutesSinceLocalMidnight, todayKey } from '@/utils/date';
import { stepsToActiveMinutes } from '@/domain/steps';

type StoredDay = {
  date: DateKey;
  steps: number;
  updatedAt: number;
};

/** Canlı simülasyon hızı: her 3 saniyede 4–14 adım. */
const TICK_MS = 3000;
const MIN_STEPS_PER_TICK = 4;
const MAX_STEPS_PER_TICK = 14;

/** Uygulama kapalıyken geçen süre için gerçekçi telafi: dakikada ~5 adım. */
const STEPS_PER_IDLE_MINUTE = 5;
const MAX_IDLE_CATCHUP_MINUTES = 240;
const DAILY_STEP_CAP = 25000;

function storageKey(date: DateKey): string {
  return 'steps:' + date;
}

function toDailySteps(day: StoredDay): DailySteps {
  return {
    date: day.date,
    steps: day.steps,
    activeMinutes: stepsToActiveMinutes(day.steps),
  };
}

function randomStepsPerTick(): number {
  return MIN_STEPS_PER_TICK + Math.floor(Math.random() * (MAX_STEPS_PER_TICK - MIN_STEPS_PER_TICK + 1));
}

/**
 * Mock adım kaynağı: gün içinde canlı artan simülasyon.
 * Veriler gün anahtarıyla saklanır; ertesi gün açıldığında sayaç sıfırdan başlar.
 */
export class MockStepRepository implements StepRepository {
  private cache = new Map<DateKey, StoredDay>();
  private listeners = new Map<DateKey, Set<(steps: DailySteps) => void>>();
  private timer: ReturnType<typeof setInterval> | null = null;

  async getDailySteps(date: DateKey): Promise<DailySteps> {
    const day = await this.loadDay(date);
    return toDailySteps(day);
  }

  async getRange(from: DateKey, to: DateKey): Promise<DailySteps[]> {
    const days: DailySteps[] = [];
    for (const key of [from, to]) {
      days.push(await this.getDailySteps(key));
    }
    return days.filter((day, index, all) => all.findIndex((d) => d.date === day.date) === index);
  }

  subscribe(date: DateKey, listener: (steps: DailySteps) => void): Unsubscribe {
    const set = this.listeners.get(date) ?? new Set();
    set.add(listener);
    this.listeners.set(date, set);
    this.startTimer();

    return () => {
      const current = this.listeners.get(date);
      if (!current) return;
      current.delete(listener);
      if (current.size === 0) this.listeners.delete(date);
      if (this.listeners.size === 0) this.stopTimer();
    };
  }

  private async loadDay(date: DateKey): Promise<StoredDay> {
    const cached = this.cache.get(date);
    if (cached) return this.applyIdleCatchUp(cached);

    const stored = await readJson<StoredDay | null>(storageKey(date), null);
    const day = stored ?? this.seedDay(date);
    const caughtUp = this.applyIdleCatchUp(day);
    this.cache.set(date, caughtUp);
    await writeJson(storageKey(date), caughtUp);
    return caughtUp;
  }

  /** Yeni gün: gün başından o ana kadar geçen süreye göre gerçekçi başlangıç. */
  private seedDay(date: DateKey): StoredDay {
    const isToday = date === todayKey();
    const minutes = isToday ? minutesSinceLocalMidnight() : 0;
    const jitter = 0.85 + Math.random() * 0.3;
    const steps = isToday ? Math.round(minutes * STEPS_PER_IDLE_MINUTE * jitter) : 0;
    return { date, steps: Math.min(steps, DAILY_STEP_CAP), updatedAt: Date.now() };
  }

  /** Uygulama kapalıyken geçen süreyi makul bir artışla telafi eder. */
  private applyIdleCatchUp(day: StoredDay): StoredDay {
    if (day.date !== todayKey()) return day;
    const idleMinutes = Math.min(
      MAX_IDLE_CATCHUP_MINUTES,
      Math.floor((Date.now() - day.updatedAt) / 60000),
    );
    if (idleMinutes <= 0) return day;
    const steps = Math.min(DAILY_STEP_CAP, day.steps + idleMinutes * STEPS_PER_IDLE_MINUTE);
    return { ...day, steps, updatedAt: Date.now() };
  }

  private startTimer(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, TICK_MS);
  }

  private stopTimer(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  private async tick(): Promise<void> {
    const today = todayKey();
    for (const [date, listeners] of this.listeners) {
      if (date !== today) continue;
      const day = await this.loadDay(date);
      const next: StoredDay = {
        ...day,
        steps: Math.min(DAILY_STEP_CAP, day.steps + randomStepsPerTick()),
        updatedAt: Date.now(),
      };
      this.cache.set(date, next);
      await writeJson(storageKey(date), next);
      const payload = toDailySteps(next);
      listeners.forEach((listener) => listener(payload));
    }
  }
}

import type { LanguagePreference } from '@/i18n/languages';
import type { DateKey } from '@/utils/date';

export type { DateKey };

export type Gender = 'male' | 'female' | 'unspecified';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

/** Kullanıcı bilgileri kısmen doldurulmuş olabilir. */
export type UserProfile = {
  age?: number;
  heightCm?: number;
  weightKg?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
};

/** Tüm alanları dolu profil — kalori ve su hesapları yalnızca bununla yapılır. */
export type CompleteProfile = {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  activityLevel: ActivityLevel;
};

/** Profil ekranındaki tercihler. Hedef alanları null ise otomatik hesap kullanılır. */
export type UserPreferences = {
  displayName: string;
  language: LanguagePreference;
  stepGoalOverride: number | null;
  waterGoalOverride: number | null;
};

export type DailySteps = {
  date: DateKey;
  steps: number;
  activeMinutes: number;
};

export type CalorieEntry = {
  id: string;
  date: DateKey;
  kcal: number;
  createdAt: number;
};

export type WaterEntry = {
  id: string;
  date: DateKey;
  amountMl: number;
  createdAt: number;
};

export type WaterDay = {
  date: DateKey;
  totalMl: number;
  entries: WaterEntry[];
};

export type Unsubscribe = () => void;

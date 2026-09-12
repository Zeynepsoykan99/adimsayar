import { create } from 'zustand';

import { changeLanguage, initI18n, resolveLanguage } from '@/i18n';
import type { AppLanguage, LanguagePreference } from '@/i18n/languages';
import { applyTextDirection, isCurrentlyRtl } from '@/i18n/rtl';
import { getRepositories } from '@/services';
import { DEFAULT_PREFERENCES } from '@/services/profile/ProfileRepository';
import type { UserPreferences } from '@/services/types';

type SettingsState = {
  ready: boolean;
  displayName: string;
  language: LanguagePreference;
  resolvedLanguage: AppLanguage;
  isRtl: boolean;
  /** Yazı yönü değişti; tam uygulanması için yeniden başlatma gerekiyor. */
  restartRequired: boolean;
  stepGoalOverride: number | null;
  waterGoalOverride: number | null;
  load: () => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
  setLanguage: (preference: LanguagePreference) => Promise<void>;
  setStepGoalOverride: (value: number | null) => Promise<void>;
  setWaterGoalOverride: (value: number | null) => Promise<void>;
  dismissRestartNotice: () => void;
};

async function persist(patch: Partial<UserPreferences>, state: SettingsState): Promise<void> {
  const next: UserPreferences = {
    displayName: state.displayName,
    language: state.language,
    stepGoalOverride: state.stepGoalOverride,
    waterGoalOverride: state.waterGoalOverride,
    ...patch,
  };
  await getRepositories().profile.savePreferences(next);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ready: false,
  displayName: DEFAULT_PREFERENCES.displayName,
  language: DEFAULT_PREFERENCES.language,
  resolvedLanguage: 'en',
  isRtl: false,
  restartRequired: false,
  stepGoalOverride: null,
  waterGoalOverride: null,

  load: async () => {
    const preferences = await getRepositories().profile.getPreferences();
    const resolved = resolveLanguage(preferences.language);
    await initI18n(resolved);
    const directionChanged = applyTextDirection(resolved);

    set({
      ready: true,
      displayName: preferences.displayName,
      language: preferences.language,
      resolvedLanguage: resolved,
      isRtl: isCurrentlyRtl(),
      restartRequired: directionChanged,
      stepGoalOverride: preferences.stepGoalOverride,
      waterGoalOverride: preferences.waterGoalOverride,
    });
  },

  setDisplayName: async (name) => {
    set({ displayName: name });
    await persist({ displayName: name }, get());
  },

  setLanguage: async (preference) => {
    const resolved = resolveLanguage(preference);
    await changeLanguage(resolved);
    const directionChanged = applyTextDirection(resolved);
    set((state) => ({
      language: preference,
      resolvedLanguage: resolved,
      isRtl: isCurrentlyRtl(),
      restartRequired: state.restartRequired || directionChanged,
    }));
    await persist({ language: preference }, get());
  },

  setStepGoalOverride: async (value) => {
    set({ stepGoalOverride: value });
    await persist({ stepGoalOverride: value }, get());
  },

  setWaterGoalOverride: async (value) => {
    set({ waterGoalOverride: value });
    await persist({ waterGoalOverride: value }, get());
  },

  dismissRestartNotice: () => set({ restartRequired: false }),
}));

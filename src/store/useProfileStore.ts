import { create } from 'zustand';

import { getRepositories } from '@/services';
import type { UserProfile } from '@/services/types';

type ProfileState = {
  ready: boolean;
  profile: UserProfile;
  load: () => Promise<void>;
  /** Tek alanı günceller ve anında kaydeder (ayrı Kaydet butonu yok). */
  setField: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => Promise<void>;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  ready: false,
  profile: {},

  load: async () => {
    const stored = await getRepositories().profile.getProfile();
    set({ ready: true, profile: stored ?? {} });
  },

  setField: async (key, value) => {
    const next = { ...get().profile, [key]: value };
    set({ profile: next });
    await getRepositories().profile.saveProfile(next);
  },
}));

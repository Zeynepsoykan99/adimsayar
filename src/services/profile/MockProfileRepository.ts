import { DEFAULT_PREFERENCES, type ProfileRepository } from './ProfileRepository';
import { readJson, writeJson } from '@/services/storage';
import type { UserPreferences, UserProfile } from '@/services/types';

const PROFILE_KEY = 'profile';
const PREFERENCES_KEY = 'preferences';

export class MockProfileRepository implements ProfileRepository {
  async getProfile(): Promise<UserProfile | null> {
    return readJson<UserProfile | null>(PROFILE_KEY, null);
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    await writeJson(PROFILE_KEY, profile);
    return profile;
  }

  async getPreferences(): Promise<UserPreferences> {
    const stored = await readJson<Partial<UserPreferences>>(PREFERENCES_KEY, {});
    return { ...DEFAULT_PREFERENCES, ...stored };
  }

  async savePreferences(preferences: UserPreferences): Promise<UserPreferences> {
    await writeJson(PREFERENCES_KEY, preferences);
    return preferences;
  }
}

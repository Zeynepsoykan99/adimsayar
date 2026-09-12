import type { UserPreferences, UserProfile } from '@/services/types';

/**
 * Kişisel bilgiler ve kullanıcı tercihleri.
 * Faz 1: MockProfileRepository (AsyncStorage).
 * Sonraki faz: FirestoreProfileRepository — arayüz aynı kalır.
 */
export interface ProfileRepository {
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<UserProfile>;
  getPreferences(): Promise<UserPreferences>;
  savePreferences(preferences: UserPreferences): Promise<UserPreferences>;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: '',
  language: 'system',
  stepGoalOverride: null,
  waterGoalOverride: null,
};

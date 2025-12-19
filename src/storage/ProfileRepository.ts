import type { UserProfile } from '../domain';
import { isUserProfile, migrateUserProfile } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem, removeStorageItem, serializeDate, deserializeDate } from './storageUtils';

/**
 * ProfileRepository handles storage and retrieval of user profile data.
 * 
 * Uses localStorage to persist profile information locally.
 */
export class ProfileRepository {
  private readonly storageKey = STORAGE_KEYS.PROFILE;

  /**
   * Retrieves the user profile from storage.
   * B3.2.1 - Automatically migrates legacy profiles (with gender) to new format (with sex).
   * @returns The user profile, or null if no profile exists
   */
  async getProfile(): Promise<UserProfile | null> {
    const stored = getStorageItem<unknown>(this.storageKey);
    
    if (stored === null) {
      return null;
    }

    // Validate the stored data
    if (!isUserProfile(stored)) {
      console.error('Invalid profile data in storage');
      return null;
    }

    // Convert date strings back to Date objects
    let profile: UserProfile = {
      ...stored,
      dateCreated: stored.dateCreated 
        ? (typeof stored.dateCreated === 'string' 
          ? deserializeDate(stored.dateCreated) 
          : stored.dateCreated)
        : undefined,
      lastUpdated: stored.lastUpdated 
        ? (typeof stored.lastUpdated === 'string' 
          ? deserializeDate(stored.lastUpdated) 
          : stored.lastUpdated)
        : undefined,
    };

    // B3.2.1 - Migrate legacy profile to new format
    profile = migrateUserProfile(profile);
    
    // If migration occurred, save the migrated profile back to storage
    if (!stored.sex && profile.sex) {
      await this.saveProfile(profile);
    }

    return profile;
  }

  /**
   * Saves the user profile to storage.
   * Automatically sets lastUpdated timestamp.
   * 
   * B3.1.2 - INTERNAL STORAGE RULE: Bodyweight is stored in kilograms (kg).
   * If the user input was in pounds, it must be converted to kg BEFORE calling this method.
   * Existing stored data (already in kg) remains valid and unchanged.
   * 
   * @param profile - The user profile to save (bodyweight must be in kg)
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    const now = new Date();
    
    const profileToSave: UserProfile = {
      ...profile,
      dateCreated: profile.dateCreated 
        ? serializeDate(profile.dateCreated) 
        : serializeDate(now),
      lastUpdated: serializeDate(now),
    };

    setStorageItem(this.storageKey, profileToSave);
  }

  /**
   * Removes the user profile from storage.
   */
  async deleteProfile(): Promise<void> {
    removeStorageItem(this.storageKey);
  }
}

// Export a singleton instance
export const profileRepository = new ProfileRepository();


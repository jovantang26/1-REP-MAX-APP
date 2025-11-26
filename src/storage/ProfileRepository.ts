import type { UserProfile } from '../domain';
import { isUserProfile } from '../domain';
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
    const profile: UserProfile = {
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

    return profile;
  }

  /**
   * Saves the user profile to storage.
   * Automatically sets lastUpdated timestamp.
   * @param profile - The user profile to save
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


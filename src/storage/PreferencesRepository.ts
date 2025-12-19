import type { UnitSystem } from '../domain';
import { isUnitSystem } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from './storageUtils';

/**
 * B3.1.1 - PreferencesRepository
 * 
 * Handles storage and retrieval of user preferences (e.g., unit system).
 * 
 * Uses localStorage to persist preferences locally.
 */
export class PreferencesRepository {
  private readonly storageKey = STORAGE_KEYS.PREFERENCES;

  /**
   * Retrieves the unit system preference from storage.
   * @returns The unit system preference, or "kg" (default) if none exists
   */
  async getUnitSystem(): Promise<UnitSystem> {
    const stored = getStorageItem<unknown>(this.storageKey);
    
    if (stored === null || typeof stored !== 'object') {
      return 'kg'; // Default to kg
    }

    const preferences = stored as Record<string, unknown>;
    const unitSystem = preferences.unitSystem;

    // Validate the stored unit system
    if (isUnitSystem(unitSystem)) {
      return unitSystem;
    }

    // Invalid or missing unit system, return default
    return 'kg';
  }

  /**
   * Saves the unit system preference to storage.
   * @param unitSystem - The unit system to save
   */
  async saveUnitSystem(unitSystem: UnitSystem): Promise<void> {
    const stored = getStorageItem<Record<string, unknown>>(this.storageKey) || {};
    
    const preferences = {
      ...stored,
      unitSystem,
    };

    setStorageItem(this.storageKey, preferences);
  }
}

// Export a singleton instance
export const preferencesRepository = new PreferencesRepository();


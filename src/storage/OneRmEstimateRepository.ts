import type { OneRmEstimate } from '../domain';
import { isOneRmEstimate } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem, serializeDate, deserializeDate } from './storageUtils';

/**
 * OneRmEstimateRepository handles storage and retrieval of 1RM estimates.
 * 
 * Uses localStorage to persist 1RM estimate data locally.
 */
export class OneRmEstimateRepository {
  private readonly storageKey = STORAGE_KEYS.ONE_RM_ESTIMATES;

  /**
   * Retrieves all 1RM estimates from storage.
   * @returns Array of 1RM estimates, sorted by date (newest first), or empty array if none exist
   */
  async getEstimates(): Promise<OneRmEstimate[]> {
    const stored = getStorageItem<unknown[]>(this.storageKey);
    
    if (stored === null || !Array.isArray(stored)) {
      return [];
    }

    // Validate and deserialize each estimate
    const estimates: OneRmEstimate[] = [];
    for (const item of stored) {
      if (isOneRmEstimate(item)) {
        estimates.push({
          ...item,
          date: typeof item.date === 'string' 
            ? deserializeDate(item.date) 
            : item.date,
        });
      } else {
        console.warn('Invalid 1RM estimate data found in storage, skipping:', item);
      }
    }

    // Sort by date (newest first)
    estimates.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : deserializeDate(a.date);
      const dateB = b.date instanceof Date ? b.date : deserializeDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return estimates;
  }

  /**
   * Retrieves 1RM estimates within a date range.
   * @param from - Start date (inclusive)
   * @param to - End date (inclusive)
   * @returns Array of 1RM estimates within the date range
   */
  async getEstimatesInRange(from: Date, to: Date): Promise<OneRmEstimate[]> {
    const allEstimates = await this.getEstimates();
    
    return allEstimates.filter((estimate) => {
      const estimateDate = estimate.date instanceof Date 
        ? estimate.date 
        : deserializeDate(estimate.date);
      
      return estimateDate >= from && estimateDate <= to;
    });
  }

  /**
   * Saves a 1RM estimate to storage.
   * @param estimate - The 1RM estimate to save
   */
  async saveEstimate(estimate: OneRmEstimate): Promise<void> {
    const allEstimates = await this.getEstimates();
    
    // Check if estimate with this ID already exists
    const existingIndex = allEstimates.findIndex((e) => e.id === estimate.id);
    
    const estimateToSave: OneRmEstimate = {
      ...estimate,
      date: serializeDate(estimate.date),
    };

    if (existingIndex >= 0) {
      // Update existing estimate
      allEstimates[existingIndex] = estimateToSave;
    } else {
      // Add new estimate
      allEstimates.push(estimateToSave);
    }

    setStorageItem(this.storageKey, allEstimates);
  }

  /**
   * Saves multiple 1RM estimates in bulk.
   * @param estimates - Array of 1RM estimates to save
   */
  async saveEstimates(estimates: OneRmEstimate[]): Promise<void> {
    const allEstimates = await this.getEstimates();
    const estimateMap = new Map<string, OneRmEstimate>();
    
    // Add existing estimates to map
    for (const estimate of allEstimates) {
      estimateMap.set(estimate.id, estimate);
    }
    
    // Add or update new estimates
    for (const estimate of estimates) {
      estimateMap.set(estimate.id, {
        ...estimate,
        date: serializeDate(estimate.date),
      });
    }
    
    setStorageItem(this.storageKey, Array.from(estimateMap.values()));
  }

  /**
   * Removes a 1RM estimate by ID.
   * @param id - The ID of the estimate to remove
   */
  async removeEstimate(id: string): Promise<void> {
    const allEstimates = await this.getEstimates();
    const filtered = allEstimates.filter((estimate) => estimate.id !== id);
    setStorageItem(this.storageKey, filtered);
  }

  /**
   * Gets the most recent 1RM estimate.
   * @returns The most recent 1RM estimate, or null if none exist
   */
  async getLatestEstimate(): Promise<OneRmEstimate | null> {
    const allEstimates = await this.getEstimates();
    return allEstimates.length > 0 ? allEstimates[0] : null;
  }

  /**
   * Clears all 1RM estimates from storage.
   */
  async clearEstimates(): Promise<void> {
    setStorageItem(this.storageKey, []);
  }
}

// Export a singleton instance
export const oneRmEstimateRepository = new OneRmEstimateRepository();


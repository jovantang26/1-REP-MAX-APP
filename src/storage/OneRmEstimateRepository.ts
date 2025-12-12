import type { OneRmEstimate, LiftType } from '../domain';
import { isOneRmEstimate } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem, serializeDate, deserializeDate } from './storageUtils';

/**
 * OneRmEstimateRepository handles storage and retrieval of 1RM estimates.
 * 
 * STORAGE SCHEMA (B2.2.2):
 * - Uses shared collection (ONE_RM_ESTIMATES) for ALL lift types
 * - Do NOT create per-lift storage keys
 * - All writes must include liftType field
 * - Filtering by liftType happens in logic, NOT in storage
 * 
 * PER-LIFT INDEPENDENCE RULE: All methods that retrieve estimates should filter
 * by liftType to ensure per-lift independence. Use getEstimatesByLiftType()
 * to get estimates for a specific lift.
 * 
 * GUARDRAILS:
 * - No assumptions of bench-only logic
 * - Every write must include liftType
 * - Filtering always happens via liftType in application logic
 * 
 * Uses localStorage to persist 1RM estimate data locally.
 */
export class OneRmEstimateRepository {
  private readonly storageKey = STORAGE_KEYS.ONE_RM_ESTIMATES;

  /**
   * Retrieves all 1RM estimates from storage.
   * 
   * WARNING: This returns estimates for ALL lift types. For per-lift independence,
   * use getEstimatesByLiftType() instead.
   * 
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
   * 
   * WARNING: This returns the most recent estimate across ALL lift types.
   * For per-lift independence, use getLatestEstimateByLiftType() instead.
   * 
   * @returns The most recent 1RM estimate, or null if none exist
   */
  async getLatestEstimate(): Promise<OneRmEstimate | null> {
    const allEstimates = await this.getEstimates();
    return allEstimates.length > 0 ? allEstimates[0] : null;
  }

  /**
   * Retrieves 1RM estimates for a specific liftType.
   * 
   * GUARDRAIL: This method ensures per-lift independence by filtering
   * by liftType. Use this method when you need estimates for a specific lift.
   * 
   * @param liftType - The lift type to filter by (required for independence)
   * @returns Array of 1RM estimates for the specified liftType, sorted by date (newest first)
   */
  async getEstimatesByLiftType(liftType: LiftType): Promise<OneRmEstimate[]> {
    const allEstimates = await this.getEstimates();
    const filtered = allEstimates.filter((estimate) => estimate.liftType === liftType);
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : deserializeDate(a.date);
      const dateB = b.date instanceof Date ? b.date : deserializeDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    return filtered;
  }

  /**
   * Gets the most recent 1RM estimate for a specific liftType.
   * 
   * GUARDRAIL: This method ensures per-lift independence by filtering
   * by liftType. Use this method when you need the most recent estimate
   * for a specific lift.
   * 
   * @param liftType - The lift type to filter by (required for independence)
   * @returns The most recent 1RM estimate for the specified liftType, or null if none exist
   */
  async getLatestEstimateByLiftType(liftType: LiftType): Promise<OneRmEstimate | null> {
    const estimatesByLift = await this.getEstimatesByLiftType(liftType);
    return estimatesByLift.length > 0 ? estimatesByLift[0] : null;
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


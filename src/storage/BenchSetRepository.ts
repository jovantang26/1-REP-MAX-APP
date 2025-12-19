import type { BenchSet, LiftType } from '../domain';
import { isBenchSet } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem, serializeDate, deserializeDate } from './storageUtils';

/**
 * BenchSetRepository handles storage and retrieval of lift sets.
 * 
 * STORAGE SCHEMA (B2.2.2):
 * - Uses shared collection (TRAINING_SETS) for ALL lift types
 * - Do NOT create per-lift storage keys
 * - All writes must include liftType field
 * - Filtering by liftType happens in logic, NOT in storage
 * 
 * PER-LIFT INDEPENDENCE RULE: All methods that retrieve sets should filter
 * by liftType to ensure per-lift independence. Use getBenchSetsByLiftType()
 * to get sets for a specific lift.
 * 
 * GUARDRAILS:
 * - No assumptions of bench-only logic
 * - Every write must include liftType
 * - Filtering always happens via liftType in application logic
 * 
 * Uses localStorage to persist training set data locally.
 */
export class BenchSetRepository {
  // Use new shared collection key, fallback to legacy key for migration
  private readonly storageKey = STORAGE_KEYS.TRAINING_SETS;
  private readonly legacyStorageKey = STORAGE_KEYS.BENCH_SETS;

  /**
   * Retrieves all bench sets from storage.
   * 
   * STORAGE SCHEMA (B2.2.2): This reads from the shared TRAINING_SETS collection
   * which contains sets for ALL lift types. Filtering by liftType happens in
   * application logic, not in storage.
   * 
   * WARNING: This returns sets for ALL lift types. For per-lift independence,
   * use getBenchSetsByLiftType() instead.
   * 
   * @returns Array of bench sets, or empty array if none exist
   */
  async getBenchSets(): Promise<BenchSet[]> {
    // Check new storage key first, fallback to legacy key for migration
    const stored = getStorageItem<unknown[]>(this.storageKey) || 
                   getStorageItem<unknown[]>(this.legacyStorageKey);
    
    if (stored === null || !Array.isArray(stored)) {
      return [];
    }

    // Validate and deserialize each set
    const sets: BenchSet[] = [];
    for (const item of stored) {
      if (isBenchSet(item)) {
        sets.push({
          ...item,
          performedAt: typeof item.performedAt === 'string' 
            ? deserializeDate(item.performedAt) 
            : (typeof (item as any).timestamp === 'string' 
              ? deserializeDate((item as any).timestamp) 
              : item.performedAt || (item as any).timestamp),
        });
      } else {
        console.warn('Invalid bench set data found in storage, skipping:', item);
      }
    }

    return sets;
  }

  /**
   * Retrieves bench sets within a date range.
   * 
   * WARNING: This returns sets for ALL lift types. For per-lift independence,
   * use getBenchSetsByLiftTypeAndRange() instead.
   * 
   * @param from - Start date (inclusive)
   * @param to - End date (inclusive)
   * @returns Array of bench sets within the date range
   */
  async getBenchSetsInRange(from: Date, to: Date): Promise<BenchSet[]> {
    const allSets = await this.getBenchSets();
    
    return allSets.filter((set) => {
      const performedAt = set.performedAt instanceof Date 
        ? set.performedAt 
        : deserializeDate(set.performedAt);
      
      return performedAt >= from && performedAt <= to;
    });
  }

  /**
   * Retrieves bench sets for a specific liftType.
   * 
   * GUARDRAIL: This method ensures per-lift independence by filtering
   * by liftType. Use this method when you need sets for a specific lift.
   * 
   * @param liftType - The lift type to filter by (required for independence)
   * @returns Array of bench sets for the specified liftType
   */
  async getBenchSetsByLiftType(liftType: LiftType): Promise<BenchSet[]> {
    const allSets = await this.getBenchSets();
    return allSets.filter((set) => set.liftType === liftType);
  }

  /**
   * Retrieves bench sets for a specific liftType within a date range.
   * 
   * GUARDRAIL: This method ensures per-lift independence by filtering
   * both by liftType and date range. Use this method when you need
   * sets for a specific lift within a date range.
   * 
   * @param liftType - The lift type to filter by (required for independence)
   * @param from - Start date (inclusive)
   * @param to - End date (inclusive)
   * @returns Array of bench sets for the specified liftType within the date range
   */
  async getBenchSetsByLiftTypeAndRange(
    liftType: LiftType,
    from: Date,
    to: Date
  ): Promise<BenchSet[]> {
    const setsByLift = await this.getBenchSetsByLiftType(liftType);
    
    return setsByLift.filter((set) => {
      const performedAt = set.performedAt instanceof Date 
        ? set.performedAt 
        : deserializeDate(set.performedAt);
      
      return performedAt >= from && performedAt <= to;
    });
  }

  /**
   * Adds a new bench set to storage.
   * 
   * B3.1.2 - INTERNAL STORAGE RULE: All weights are stored in kilograms (kg).
   * If the user input was in pounds, it must be converted to kg BEFORE calling this method.
   * Existing stored data (already in kg) remains valid and unchanged.
   * 
   * @param set - The bench set to add (weight must be in kg)
   */
  async addBenchSet(set: BenchSet): Promise<void> {
    const allSets = await this.getBenchSets();
    
    // Check if set with this ID already exists
    const existingIndex = allSets.findIndex((s) => s.id === set.id);
    
    if (existingIndex >= 0) {
      // Update existing set
      allSets[existingIndex] = {
        ...set,
        performedAt: serializeDate(set.performedAt),
      };
    } else {
      // Add new set
      allSets.push({
        ...set,
        performedAt: serializeDate(set.performedAt),
      });
    }

    setStorageItem(this.storageKey, allSets);
  }

  /**
   * Removes a bench set by ID.
   * @param id - The ID of the set to remove
   */
  async removeBenchSet(id: string): Promise<void> {
    const allSets = await this.getBenchSets();
    const filtered = allSets.filter((set) => set.id !== id);
    setStorageItem(this.storageKey, filtered);
  }

  /**
   * Clears all bench sets from storage.
   */
  async clearBenchSets(): Promise<void> {
    setStorageItem(this.storageKey, []);
  }
}

// Export a singleton instance
export const benchSetRepository = new BenchSetRepository();


import type { BenchSet } from '../domain';
import { isBenchSet } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem, serializeDate, deserializeDate } from './storageUtils';

/**
 * BenchSetRepository handles storage and retrieval of bench press sets.
 * 
 * Uses localStorage to persist bench set data locally.
 */
export class BenchSetRepository {
  private readonly storageKey = STORAGE_KEYS.BENCH_SETS;

  /**
   * Retrieves all bench sets from storage.
   * @returns Array of bench sets, or empty array if none exist
   */
  async getBenchSets(): Promise<BenchSet[]> {
    const stored = getStorageItem<unknown[]>(this.storageKey);
    
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
            : item.performedAt,
        });
      } else {
        console.warn('Invalid bench set data found in storage, skipping:', item);
      }
    }

    return sets;
  }

  /**
   * Retrieves bench sets within a date range.
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
   * Adds a new bench set to storage.
   * @param set - The bench set to add
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


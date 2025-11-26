import type { TestedOneRm } from '../domain';
import { isTestedOneRm } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem, serializeDate, deserializeDate } from './storageUtils';

/**
 * TestedOneRmRepository handles storage and retrieval of tested 1RM records.
 * 
 * Uses localStorage to persist tested 1RM data locally.
 */
export class TestedOneRmRepository {
  private readonly storageKey = STORAGE_KEYS.TESTED_ONE_RMS;

  /**
   * Retrieves all tested 1RM records from storage.
   * @returns Array of tested 1RMs, sorted by date (newest first), or empty array if none exist
   */
  async getTestedOneRms(): Promise<TestedOneRm[]> {
    const stored = getStorageItem<unknown[]>(this.storageKey);
    
    if (stored === null || !Array.isArray(stored)) {
      return [];
    }

    // Validate and deserialize each record
    const records: TestedOneRm[] = [];
    for (const item of stored) {
      if (isTestedOneRm(item)) {
        records.push({
          ...item,
          testedAt: typeof item.testedAt === 'string' 
            ? deserializeDate(item.testedAt) 
            : item.testedAt,
        });
      } else {
        console.warn('Invalid tested 1RM data found in storage, skipping:', item);
      }
    }

    // Sort by date (newest first)
    records.sort((a, b) => {
      const dateA = a.testedAt instanceof Date ? a.testedAt : deserializeDate(a.testedAt);
      const dateB = b.testedAt instanceof Date ? b.testedAt : deserializeDate(b.testedAt);
      return dateB.getTime() - dateA.getTime();
    });

    return records;
  }

  /**
   * Retrieves tested 1RMs within a date range.
   * @param from - Start date (inclusive)
   * @param to - End date (inclusive)
   * @returns Array of tested 1RMs within the date range
   */
  async getTestedOneRmsInRange(from: Date, to: Date): Promise<TestedOneRm[]> {
    const allRecords = await this.getTestedOneRms();
    
    return allRecords.filter((record) => {
      const testedAt = record.testedAt instanceof Date 
        ? record.testedAt 
        : deserializeDate(record.testedAt);
      
      return testedAt >= from && testedAt <= to;
    });
  }

  /**
   * Adds a new tested 1RM record to storage.
   * @param record - The tested 1RM record to add
   */
  async addTestedOneRm(record: TestedOneRm): Promise<void> {
    const allRecords = await this.getTestedOneRms();
    
    // Check if record with this ID already exists
    const existingIndex = allRecords.findIndex((r) => r.id === record.id);
    
    if (existingIndex >= 0) {
      // Update existing record
      allRecords[existingIndex] = {
        ...record,
        testedAt: serializeDate(record.testedAt),
      };
    } else {
      // Add new record
      allRecords.push({
        ...record,
        testedAt: serializeDate(record.testedAt),
      });
    }

    setStorageItem(this.storageKey, allRecords);
  }

  /**
   * Removes a tested 1RM record by ID.
   * @param id - The ID of the record to remove
   */
  async removeTestedOneRm(id: string): Promise<void> {
    const allRecords = await this.getTestedOneRms();
    const filtered = allRecords.filter((record) => record.id !== id);
    setStorageItem(this.storageKey, filtered);
  }

  /**
   * Gets the most recent tested 1RM.
   * @returns The most recent tested 1RM, or null if none exist
   */
  async getLatestTestedOneRm(): Promise<TestedOneRm | null> {
    const allRecords = await this.getTestedOneRms();
    return allRecords.length > 0 ? allRecords[0] : null;
  }

  /**
   * Clears all tested 1RM records from storage.
   */
  async clearTestedOneRms(): Promise<void> {
    setStorageItem(this.storageKey, []);
  }
}

// Export a singleton instance
export const testedOneRmRepository = new TestedOneRmRepository();


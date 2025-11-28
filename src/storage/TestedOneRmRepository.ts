import type { TestedOneRm, LiftType } from '../domain';
import { isTestedOneRm } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem, serializeDate, deserializeDate } from './storageUtils';

/**
 * TestedOneRmRepository handles storage and retrieval of tested 1RM records.
 * 
 * STORAGE SCHEMA (B2.2.2):
 * - Uses shared collection (TESTED_ONE_RMS) for ALL lift types
 * - Do NOT create per-lift storage keys
 * - All writes must include liftType field
 * - Filtering by liftType happens in logic, NOT in storage
 * 
 * PER-LIFT INDEPENDENCE RULE: All methods that retrieve tested 1RMs should filter
 * by liftType to ensure per-lift independence. Use getTestedOneRmsByLiftType()
 * to get tested 1RMs for a specific lift.
 * 
 * GUARDRAILS:
 * - No assumptions of bench-only logic
 * - Every write must include liftType
 * - Filtering always happens via liftType in application logic
 * 
 * Uses localStorage to persist tested 1RM data locally.
 */
export class TestedOneRmRepository {
  private readonly storageKey = STORAGE_KEYS.TESTED_ONE_RMS;

  /**
   * Retrieves all tested 1RM records from storage.
   * 
   * WARNING: This returns tested 1RMs for ALL lift types. For per-lift independence,
   * use getTestedOneRmsByLiftType() instead.
   * 
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
          timestamp: typeof item.timestamp === 'string' 
            ? deserializeDate(item.timestamp) 
            : (typeof (item as any).testedAt === 'string' 
              ? deserializeDate((item as any).testedAt) 
              : (item as any).testedAt || item.timestamp),
        });
      } else {
        console.warn('Invalid tested 1RM data found in storage, skipping:', item);
      }
    }

    // Sort by date (newest first)
    records.sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : deserializeDate(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : deserializeDate(b.timestamp);
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
      const timestamp = record.timestamp instanceof Date 
        ? record.timestamp 
        : deserializeDate(record.timestamp);
      
      return timestamp >= from && timestamp <= to;
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
        timestamp: serializeDate(record.timestamp),
      };
    } else {
      // Add new record
      allRecords.push({
        ...record,
        timestamp: serializeDate(record.timestamp),
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
   * 
   * WARNING: This returns the most recent tested 1RM across ALL lift types.
   * For per-lift independence, use getLatestTestedOneRmByLiftType() instead.
   * 
   * @returns The most recent tested 1RM, or null if none exist
   */
  async getLatestTestedOneRm(): Promise<TestedOneRm | null> {
    const allRecords = await this.getTestedOneRms();
    return allRecords.length > 0 ? allRecords[0] : null;
  }

  /**
   * Retrieves tested 1RMs for a specific liftType.
   * 
   * GUARDRAIL: This method ensures per-lift independence by filtering
   * by liftType. Use this method when you need tested 1RMs for a specific lift.
   * 
   * @param liftType - The lift type to filter by (required for independence)
   * @returns Array of tested 1RMs for the specified liftType, sorted by date (newest first)
   */
  async getTestedOneRmsByLiftType(liftType: LiftType): Promise<TestedOneRm[]> {
    const allRecords = await this.getTestedOneRms();
    const filtered = allRecords.filter((record) => record.liftType === liftType);
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.timestamp instanceof Date ? a.timestamp : deserializeDate(a.timestamp);
      const dateB = b.timestamp instanceof Date ? b.timestamp : deserializeDate(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
    
    return filtered;
  }

  /**
   * Gets the most recent tested 1RM for a specific liftType.
   * 
   * GUARDRAIL: This method ensures per-lift independence by filtering
   * by liftType. Use this method when you need the most recent tested 1RM
   * for a specific lift.
   * 
   * @param liftType - The lift type to filter by (required for independence)
   * @returns The most recent tested 1RM for the specified liftType, or null if none exist
   */
  async getLatestTestedOneRmByLiftType(liftType: LiftType): Promise<TestedOneRm | null> {
    const recordsByLift = await this.getTestedOneRmsByLiftType(liftType);
    return recordsByLift.length > 0 ? recordsByLift[0] : null;
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


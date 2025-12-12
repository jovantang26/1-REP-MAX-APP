/**
 * B2.6.1 - Data Migration Steps
 * 
 * Migration utilities to convert Beta 1 bench-only data into multi-lift-compliant data.
 * 
 * MIGRATION RULES:
 * 1. On startup, check if any TrainingSet or TestedOneRM entries are missing liftType
 * 2. If missing, assign liftType = "bench" (all old data was bench-only)
 * 3. Apply this to all TrainingSets and all TestedOneRMs
 * 4. Save updated data back to storage
 * 5. Mark migration as complete (boolean flag in storage)
 * 
 * SAFETY & IDEMPOTENCE:
 * - Migration is idempotent - safe to run multiple times
 * - Only migrates data that's missing liftType
 * - Never overwrites existing liftType values
 * - Migration flag prevents unnecessary re-runs
 */

import type { BenchSet, TestedOneRm } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from './storageUtils';
import { benchSetRepository } from './BenchSetRepository';
import { testedOneRmRepository } from './TestedOneRmRepository';

/**
 * Migration result summary
 */
export interface MigrationResult {
  trainingSetsMigrated: number;
  testedOneRmsMigrated: number;
  migrationComplete: boolean;
}

/**
 * Checks if migration has already been completed.
 * @returns true if migration flag is set, false otherwise
 */
export function isMigrationComplete(): boolean {
  const flag = getStorageItem<boolean>(STORAGE_KEYS.MIGRATION_COMPLETE);
  return flag === true;
}

/**
 * Migrates training sets from Beta 1 format (no liftType) to Beta 2 format (with liftType).
 * 
 * B2.2.3 MIGRATION: Assigns liftType = "bench" to all sets missing liftType.
 * 
 * @returns Number of sets migrated
 */
export async function migrateTrainingSets(): Promise<number> {
  const allSets = await benchSetRepository.getBenchSets();
  let migratedCount = 0;
  const updatedSets: BenchSet[] = [];

  for (const set of allSets) {
    // Check if liftType is missing (old Beta 1 data)
    if (!set.liftType || (set.liftType !== 'bench' && set.liftType !== 'squat' && set.liftType !== 'deadlift')) {
      // Assign default liftType as "bench" for all old data
      const migratedSet: BenchSet = {
        ...set,
        liftType: 'bench',
      };
      updatedSets.push(migratedSet);
      migratedCount++;
    } else {
      // Keep existing sets as-is
      updatedSets.push(set);
    }
  }

  // Save updated sets back to storage
  if (migratedCount > 0) {
    // Use the repository's internal method to save, or save directly
    const storageKey = STORAGE_KEYS.TRAINING_SETS;
    setStorageItem(storageKey, updatedSets);
    
    // Also clear legacy key if it exists
    const legacyKey = STORAGE_KEYS.BENCH_SETS;
    const legacyData = getStorageItem<unknown[]>(legacyKey);
    if (legacyData && legacyData.length > 0) {
      // Migrate legacy data to new key
      setStorageItem(storageKey, updatedSets);
      // Optionally remove legacy key after migration
      // localStorage.removeItem(legacyKey);
    }
  }

  return migratedCount;
}

/**
 * Migrates tested 1RMs from Beta 1 format (no liftType) to Beta 2 format (with liftType).
 * 
 * B2.2.3 MIGRATION: Assigns liftType = "bench" to all tested 1RMs missing liftType.
 * 
 * @returns Number of tested 1RMs migrated
 */
export async function migrateTestedOneRms(): Promise<number> {
  const allTested = await testedOneRmRepository.getTestedOneRms();
  let migratedCount = 0;
  const updatedTested: TestedOneRm[] = [];

  for (const tested of allTested) {
    // Check if liftType is missing (old Beta 1 data)
    if (!tested.liftType || (tested.liftType !== 'bench' && tested.liftType !== 'squat' && tested.liftType !== 'deadlift')) {
      // Assign default liftType as "bench" for all old data
      const migratedTested: TestedOneRm = {
        ...tested,
        liftType: 'bench',
      };
      updatedTested.push(migratedTested);
      migratedCount++;
    } else {
      // Keep existing tested 1RMs as-is
      updatedTested.push(tested);
    }
  }

  // Save updated tested 1RMs back to storage
  if (migratedCount > 0) {
    const storageKey = STORAGE_KEYS.TESTED_ONE_RMS;
    setStorageItem(storageKey, updatedTested);
  }

  return migratedCount;
}

/**
 * Runs the complete migration process.
 * 
 * B2.6.1 MIGRATION: Converts Beta 1 bench-only data to Beta 2 multi-lift format.
 * 
 * This function:
 * 1. Checks if migration is already complete (idempotent)
 * 2. Migrates all training sets missing liftType
 * 3. Migrates all tested 1RMs missing liftType
 * 4. Marks migration as complete
 * 
 * @returns Migration result with counts and completion status
 */
export function runMigration(): MigrationResult {
  // Check if migration already completed
  if (isMigrationComplete()) {
    return {
      trainingSetsMigrated: 0,
      testedOneRmsMigrated: 0,
      migrationComplete: true,
    };
  }

  let trainingSetsMigrated = 0;
  let testedOneRmsMigrated = 0;

  try {
    // Migrate training sets (synchronous for simplicity, but uses async repository methods)
    // Note: In a real async context, this should be awaited, but App.tsx calls it synchronously
    // We'll use a synchronous approach by directly accessing storage
    
    // Migrate training sets
    const allSets = getStorageItem<unknown[]>(STORAGE_KEYS.TRAINING_SETS) || 
                    getStorageItem<unknown[]>(STORAGE_KEYS.BENCH_SETS);
    
    if (allSets && Array.isArray(allSets)) {
      const updatedSets: any[] = [];
      for (const set of allSets) {
        if (set && typeof set === 'object') {
          const setObj = set as any;
          if (!setObj.liftType || (setObj.liftType !== 'bench' && setObj.liftType !== 'squat' && setObj.liftType !== 'deadlift')) {
            updatedSets.push({
              ...setObj,
              liftType: 'bench',
            });
            trainingSetsMigrated++;
          } else {
            updatedSets.push(setObj);
          }
        }
      }
      if (trainingSetsMigrated > 0) {
        setStorageItem(STORAGE_KEYS.TRAINING_SETS, updatedSets);
      }
    }

    // Migrate tested 1RMs
    const allTested = getStorageItem<unknown[]>(STORAGE_KEYS.TESTED_ONE_RMS);
    
    if (allTested && Array.isArray(allTested)) {
      const updatedTested: any[] = [];
      for (const tested of allTested) {
        if (tested && typeof tested === 'object') {
          const testedObj = tested as any;
          if (!testedObj.liftType || (testedObj.liftType !== 'bench' && testedObj.liftType !== 'squat' && testedObj.liftType !== 'deadlift')) {
            updatedTested.push({
              ...testedObj,
              liftType: 'bench',
            });
            testedOneRmsMigrated++;
          } else {
            updatedTested.push(testedObj);
          }
        }
      }
      if (testedOneRmsMigrated > 0) {
        setStorageItem(STORAGE_KEYS.TESTED_ONE_RMS, updatedTested);
      }
    }

    // Mark migration as complete
    setStorageItem(STORAGE_KEYS.MIGRATION_COMPLETE, true);

    return {
      trainingSetsMigrated,
      testedOneRmsMigrated,
      migrationComplete: true,
    };
  } catch (error) {
    console.error('Migration error:', error);
    // Don't mark as complete if there was an error
    return {
      trainingSetsMigrated,
      testedOneRmsMigrated,
      migrationComplete: false,
    };
  }
}


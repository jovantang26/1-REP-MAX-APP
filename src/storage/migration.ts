/**
 * Data migration utilities for upgrading from bench-only to multi-lift format.
 * 
 * B2.2.3 MIGRATION PLAN:
 * 
 * This module handles migration of existing data from the old bench-only format
 * to the new multi-lift format. The migration:
 * 
 * 1. Detects if liftType is missing from TrainingSets or TestedOneRms
 * 2. Assigns liftType = "bench" to all legacy data
 * 3. Converts performedAt → timestamp for TrainingSets
 * 4. Converts testedAt → timestamp for TestedOneRms
 * 5. Persists updated entries
 * 6. Marks migration as completed
 * 
 * This migration runs once on app startup and is idempotent (safe to run multiple times).
 */

import type { TrainingSet, TestedOneRm } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from './storageUtils';

/**
 * Checks if migration has already been completed.
 */
export function isMigrationComplete(): boolean {
  const flag = getStorageItem<boolean>(STORAGE_KEYS.MIGRATION_COMPLETE);
  return flag === true;
}

/**
 * Marks migration as completed.
 */
function markMigrationComplete(): void {
  setStorageItem(STORAGE_KEYS.MIGRATION_COMPLETE, true);
}

/**
 * Migrates a single TrainingSet from old format to new format.
 * 
 * Handles:
 * - Missing liftType → assigns "bench"
 * - performedAt → timestamp
 * - Legacy field names
 */
function migrateTrainingSet(item: any): TrainingSet | null {
  // If already in new format, return as-is
  if (item.liftType && item.timestamp) {
    return item as TrainingSet;
  }

  // Migrate from old format
  const migrated: TrainingSet = {
    id: item.id,
    liftType: item.liftType || 'bench', // Assign "bench" if missing
    timestamp: item.timestamp || item.performedAt, // Map performedAt → timestamp
    weight: item.weight,
    reps: item.reps,
    rir: item.rir || 0, // Default RIR to 0 if missing
  };

  // Validate migrated set
  if (!migrated.id || !migrated.liftType || !migrated.timestamp || !migrated.weight || !migrated.reps) {
    console.warn('Invalid training set after migration, skipping:', item);
    return null;
  }

  return migrated;
}

/**
 * Migrates a single TestedOneRm from old format to new format.
 * 
 * Handles:
 * - Missing liftType → assigns "bench"
 * - testedAt → timestamp
 * - Legacy field names
 */
function migrateTestedOneRm(item: any): TestedOneRm | null {
  // If already in new format, return as-is
  if (item.liftType && item.timestamp) {
    return item as TestedOneRm;
  }

  // Migrate from old format
  const migrated: TestedOneRm = {
    id: item.id,
    liftType: item.liftType || 'bench', // Assign "bench" if missing
    timestamp: item.timestamp || item.testedAt, // Map testedAt → timestamp
    weight: item.weight,
  };

  // Validate migrated record
  if (!migrated.id || !migrated.liftType || !migrated.timestamp || !migrated.weight) {
    console.warn('Invalid tested 1RM after migration, skipping:', item);
    return null;
  }

  return migrated;
}

/**
 * Migrates all TrainingSets from old format to new format.
 * 
 * This function:
 * 1. Loads all sets from storage (checks both old and new keys)
 * 2. Migrates each set that needs migration
 * 3. Saves migrated sets back to storage
 * 4. Returns count of migrated sets
 */
export function migrateTrainingSets(): number {
  // Check both old and new storage keys for backward compatibility
  const oldKeyData = getStorageItem<unknown[]>(STORAGE_KEYS.BENCH_SETS);
  const newKeyData = getStorageItem<unknown[]>(STORAGE_KEYS.TRAINING_SETS);
  
  // Combine data from both keys (prefer new key if both exist)
  const allData = newKeyData || oldKeyData || [];
  
  if (!Array.isArray(allData) || allData.length === 0) {
    return 0; // No data to migrate
  }

  let migratedCount = 0;
  const migratedSets: TrainingSet[] = [];

  for (const item of allData) {
    const migrated = migrateTrainingSet(item);
    if (migrated) {
      migratedSets.push(migrated);
      // Count as migrated if it had missing liftType or old field names
      const itemAny = item as any;
      if (!itemAny.liftType || !itemAny.timestamp) {
        migratedCount++;
      }
    }
  }

  // Save migrated sets to new storage key
  if (migratedSets.length > 0) {
    setStorageItem(STORAGE_KEYS.TRAINING_SETS, migratedSets);
    
    // Optionally remove old key after successful migration
    // (Keep it for now for extra safety)
  }

  return migratedCount;
}

/**
 * Migrates all TestedOneRms from old format to new format.
 * 
 * This function:
 * 1. Loads all tested 1RMs from storage
 * 2. Migrates each record that needs migration
 * 3. Saves migrated records back to storage
 * 4. Returns count of migrated records
 */
export function migrateTestedOneRms(): number {
  const data = getStorageItem<unknown[]>(STORAGE_KEYS.TESTED_ONE_RMS);
  
  if (!Array.isArray(data) || data.length === 0) {
    return 0; // No data to migrate
  }

  let migratedCount = 0;
  const migratedRecords: TestedOneRm[] = [];

  for (const item of data) {
    const migrated = migrateTestedOneRm(item);
    if (migrated) {
      migratedRecords.push(migrated);
      // Count as migrated if it had missing liftType or old field names
      const itemAny = item as any;
      if (!itemAny.liftType || !itemAny.timestamp) {
        migratedCount++;
      }
    }
  }

  // Save migrated records back to storage
  if (migratedRecords.length > 0) {
    setStorageItem(STORAGE_KEYS.TESTED_ONE_RMS, migratedRecords);
  }

  return migratedCount;
}

/**
 * Runs the complete migration process.
 * 
 * This function:
 * 1. Checks if migration has already been completed
 * 2. Migrates TrainingSets
 * 3. Migrates TestedOneRms
 * 4. Marks migration as complete
 * 
 * This is idempotent - safe to call multiple times.
 * 
 * @returns Object with migration results
 */
export function runMigration(): {
  completed: boolean;
  trainingSetsMigrated: number;
  testedOneRmsMigrated: number;
} {
  // Skip if already migrated
  if (isMigrationComplete()) {
    return {
      completed: true,
      trainingSetsMigrated: 0,
      testedOneRmsMigrated: 0,
    };
  }

  console.log('Starting data migration from bench-only to multi-lift format...');

  // Migrate TrainingSets
  const trainingSetsMigrated = migrateTrainingSets();
  console.log(`Migrated ${trainingSetsMigrated} training sets`);

  // Migrate TestedOneRms
  const testedOneRmsMigrated = migrateTestedOneRms();
  console.log(`Migrated ${testedOneRmsMigrated} tested 1RMs`);

  // Mark migration as complete
  markMigrationComplete();
  console.log('Migration completed successfully');

  return {
    completed: true,
    trainingSetsMigrated,
    testedOneRmsMigrated,
  };
}


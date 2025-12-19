/**
 * Storage repository exports for the 1RM Prediction app.
 * 
 * This module exports all repository classes and singleton instances
 * for accessing local storage.
 * 
 * STORAGE SCHEMA STRATEGY (B2.2.2):
 * - One shared collection for all sets → TRAINING_SETS (all lift types)
 * - One shared collection for all tested 1RMs → TESTED_ONE_RMS (all lift types)
 * - One shared collection for all estimates → ONE_RM_ESTIMATES (all lift types)
 * - Filtering by liftType happens in logic, NOT in storage
 * 
 * GUARDRAILS:
 * - Do NOT create per-lift storage keys
 * - All writes must include liftType field
 * - No assumptions of bench-only logic
 */

// Storage utilities
export {
  STORAGE_KEYS,
  serializeDate,
  deserializeDate,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from './storageUtils';

// ProfileRepository
export { ProfileRepository, profileRepository } from './ProfileRepository';

// PreferencesRepository
export { PreferencesRepository, preferencesRepository } from './PreferencesRepository';

// BenchSetRepository
export { BenchSetRepository, benchSetRepository } from './BenchSetRepository';

// TestedOneRmRepository
export { TestedOneRmRepository, testedOneRmRepository } from './TestedOneRmRepository';

// OneRmEstimateRepository
export { OneRmEstimateRepository, oneRmEstimateRepository } from './OneRmEstimateRepository';

// Migration utilities
export {
  runMigration,
  isMigrationComplete,
  migrateTrainingSets,
  migrateTestedOneRms,
} from './migration';

// B2.6.2 - Debug helpers (dev mode only)
export {
  logStorageState,
  logLiftCounts,
  clearAllStorage,
} from './debugHelpers';


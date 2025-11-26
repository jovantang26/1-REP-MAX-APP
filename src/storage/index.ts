/**
 * Storage repository exports for the 1RM Prediction app.
 * 
 * This module exports all repository classes and singleton instances
 * for accessing local storage.
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

// BenchSetRepository
export { BenchSetRepository, benchSetRepository } from './BenchSetRepository';

// TestedOneRmRepository
export { TestedOneRmRepository, testedOneRmRepository } from './TestedOneRmRepository';

// OneRmEstimateRepository
export { OneRmEstimateRepository, oneRmEstimateRepository } from './OneRmEstimateRepository';


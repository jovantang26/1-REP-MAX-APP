/**
 * Domain model exports for the 1RM Prediction app.
 * 
 * This module exports all core domain types, interfaces, and utility functions
 * that represent the business logic and entities of the application.
 * 
 * The domain model is kept pure (no I/O, no UI dependencies) to ensure
 * it can be used across different layers of the application.
 */

// UserProfile
export type { UserProfile } from './UserProfile';
export { createUserProfile, isUserProfile } from './UserProfile';

// BenchSet
export type { BenchSet } from './BenchSet';
export { createBenchSet, isBenchSet } from './BenchSet';

// TestedOneRm
export type { TestedOneRm } from './TestedOneRm';
export { createTestedOneRm, isTestedOneRm } from './TestedOneRm';

// OneRmEstimate
export type { OneRmEstimate, UncertaintyRange } from './OneRmEstimate';
export {
  createOneRmEstimate,
  createUncertaintyRange,
  isOneRmEstimate,
} from './OneRmEstimate';

// StrengthCategory
export type { StrengthCategory, StrengthCategoryType } from './StrengthCategory';
export {
  createStrengthCategory,
  calculateOneRmRatio,
  determineStrengthCategory,
  getStrengthCategory,
  isStrengthCategory,
} from './StrengthCategory';


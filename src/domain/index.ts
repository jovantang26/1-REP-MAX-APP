/**
 * Domain model exports for the 1RM Prediction app.
 * 
 * This module exports all core domain types, interfaces, and utility functions
 * that represent the business logic and entities of the application.
 * 
 * The domain model is kept pure (no I/O, no UI dependencies) to ensure
 * it can be used across different layers of the application.
 * 
 * FUTURE-PROOFING PRINCIPLE: All domain models are lift-agnostic and include
 * liftType. All APIs, repositories, and estimation logic must accept and filter
 * by liftType to ensure per-lift independence.
 * 
 * IMPORTANT: TrainingSet replaces BenchSet everywhere. BenchSet is maintained
 * as a legacy alias for backward compatibility during migration. No logic may
 * assume Bench is the default lift - liftType is MANDATORY everywhere.
 */

// LiftType
export type { LiftType } from './LiftType';
export { LIFT_DISPLAY_NAMES, getLiftDisplayName, isLiftType } from './LiftType';

// UserProfile
export type { UserProfile } from './UserProfile';
export { createUserProfile, isUserProfile } from './UserProfile';

// TrainingSet (replaces BenchSet)
export type { TrainingSet } from './TrainingSet';
export { createTrainingSet, isTrainingSet } from './TrainingSet';

// Legacy BenchSet (deprecated - use TrainingSet, but maintained for backward compatibility)
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

// BaselineEstimate (per-lift baseline estimate)
export type { BaselineEstimate, BaselineUncertaintyRange } from './BaselineEstimate';
export {
  createBaselineEstimate,
  isBaselineEstimate,
} from './BaselineEstimate';

// UserCalibration (per-lift calibration multipliers)
export type { UserCalibration } from './UserCalibration';
export {
  createUserCalibration,
  createUserCalibrationWithValues,
  getCalibrationForLift,
  isUserCalibration,
} from './UserCalibration';

// StrengthCategory
export type { StrengthCategory, StrengthCategoryType } from './StrengthCategory';
export {
  createStrengthCategory,
  calculateOneRmRatio,
  determineStrengthCategory,
  getStrengthCategory,
  isStrengthCategory,
} from './StrengthCategory';


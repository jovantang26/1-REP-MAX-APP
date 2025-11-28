/**
 * B2.4.1 - Per-Lift Estimation API
 * 
 * This module provides the core API surface for multi-lift estimation.
 * All functions are designed to work with a specific liftType, ensuring
 * per-lift independence.
 */

import type { TrainingSet, TestedOneRm, UserCalibration, LiftType, BaselineEstimate, UserProfile } from '../domain';
import { estimateBaselineOneRm, type EstimateBaselineOneRmParams } from './estimateBaselineOneRm';
import { estimate1RmFromSet } from './repTo1Rm';
import { applyCalibrationWithUserCalibration } from './personalization';

/**
 * B2.4.1 - Core Estimation Function
 * 
 * Estimates baseline 1RM for a specific lift type.
 * 
 * This is the primary API for multi-lift estimation. It:
 * - Filters sets and tests by liftType (ensures per-lift independence)
 * - Uses last 90 days of sets
 * - Applies per-lift calibration
 * - Returns a BaselineEstimate with liftType included
 * 
 * GUARDRAIL: No cross-lift mixing allowed. All sets and tests must be
 * for the same liftType. This function filters internally to ensure
 * per-lift independence.
 * 
 * @param liftType - Type of lift to estimate (bench, squat, or deadlift) - REQUIRED
 * @param sets - All training sets (will be filtered by liftType)
 * @param tests - All tested 1RMs (will be filtered by liftType)
 * @param calibration - UserCalibration object with per-lift multipliers
 * @param profile - User profile (optional, for future use)
 * @param referenceDate - Reference date for calculations (default: now)
 * @returns BaselineEstimate for the specified liftType
 */
export function estimateBaselineForLift(
  liftType: LiftType,
  sets: TrainingSet[],
  tests: TestedOneRm[],
  calibration: UserCalibration,
  profile?: UserProfile,
  referenceDate: Date = new Date()
): BaselineEstimate {
  // Filter sets and tests by liftType (B2.4.2 - strict separation)
  const filteredSets = sets.filter((set) => set.liftType === liftType);
  const filteredTests = tests.filter((test) => test.liftType === liftType);

  // Use existing estimation logic
  const params: EstimateBaselineOneRmParams = {
    liftType,
    benchSets: filteredSets as any, // Type compatibility
    testedOneRms: filteredTests,
    profile: profile || { age: 25, gender: 'male', bodyweight: 70 }, // Default if not provided
    referenceDate,
  };

  const result = estimateBaselineOneRm(params);

  // Apply per-lift calibration (B2.4.3)
  const calibrated1Rm = applyCalibrationWithUserCalibration(
    result.baselineOneRm,
    liftType,
    calibration
  );

  // Return as BaselineEstimate with liftType
  return {
    liftType,
    baseline1Rm: calibrated1Rm,
    uncertaintyRange: result.uncertaintyRange,
    confidence: result.confidenceLevel,
  };
}

/**
 * B2.4.1 - Per-Set 1RM Estimator
 * 
 * Estimates 1RM from a single training set.
 * 
 * This function uses the Epley formula modified for RIR (Reps in Reserve).
 * The formula is lift-agnostic and works for all lift types.
 * 
 * Formula: 1RM = weight × (1 + (reps + rir) / 30)
 * 
 * @param set - The training set to convert
 * @param liftType - Type of lift (for validation, must match set.liftType)
 * @returns Estimated 1RM in kilograms
 * @throws Error if liftType doesn't match set.liftType
 */
export function estimateOneRMFromSet(
  set: TrainingSet,
  liftType: LiftType
): number {
  // GUARDRAIL: Ensure set is for the correct liftType
  if (set.liftType !== liftType) {
    throw new Error(`Set liftType (${set.liftType}) does not match requested liftType (${liftType})`);
  }

  // Use existing estimation logic (lift-agnostic)
  return estimate1RmFromSet(set);
}


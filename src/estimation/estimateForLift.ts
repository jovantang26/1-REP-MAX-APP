/**
 * B2.4.1 - API Design for Per-Lift Estimation
 * 
 * Pure API surface for multi-lift estimation.
 * 
 * This module provides the core estimation functions required for
 * multi-lift functionality, ensuring per-lift independence.
 */

import type { BenchSet, TestedOneRm, LiftType, BaselineEstimate } from '../domain';
import { estimateBaselineOneRm, type BaselineOneRmEstimate } from './estimateBaselineOneRm';
import { createBaselineEstimate } from '../domain';
import { estimate1RmFromSet } from './repTo1Rm';

/**
 * B2.4.1 - Core Estimation Function
 * 
 * Estimates baseline 1RM for a specific lift type.
 * 
 * PER-LIFT INDEPENDENCE: All sets and tested 1RMs are filtered by liftType
 * to ensure per-lift independence. Each liftType has its own baseline 1RM.
 * 
 * @param liftType - Type of lift to estimate (bench, squat, or deadlift) - REQUIRED
 * @param sets - Array of training sets (will be filtered by liftType)
 * @param tests - Array of tested 1RMs (will be filtered by liftType)
 * @param profile - User profile for personalization
 * @returns BaselineEstimate for the specified liftType
 */
export function estimateBaselineForLift(
  liftType: LiftType,
  sets: BenchSet[],
  tests: TestedOneRm[],
  profile: { bodyweight: number; gender: string; age: number }
): BaselineEstimate {
  // Filter sets and tests by liftType to ensure per-lift independence
  const setsForLift = sets.filter((set) => set.liftType === liftType);
  const testsForLift = tests.filter((test) => test.liftType === liftType);

  // Use the existing estimation function (which filters internally as well)
  const result: BaselineOneRmEstimate = estimateBaselineOneRm({
    liftType,
    benchSets: setsForLift,
    testedOneRms: testsForLift,
    profile: {
      bodyweight: profile.bodyweight,
      gender: profile.gender,
      age: profile.age,
    },
  });

  // Convert to BaselineEstimate format
  return createBaselineEstimate(
    liftType,
    result.baselineOneRm,
    result.uncertaintyRange,
    result.confidenceLevel
  );
}

/**
 * B2.4.1 - Per-Set 1RM Estimator
 * 
 * Converts a single training set to an estimated 1RM.
 * 
 * Formula can reuse Epley/RIR logic from Beta 1.
 * 
 * @param set - The training set to convert
 * @param liftType - Type of lift (for validation, should match set.liftType)
 * @returns Estimated 1RM in kilograms
 */
export function estimateOneRMFromSet(
  set: BenchSet,
  liftType: LiftType
): number {
  // Validate that set's liftType matches the provided liftType
  if (set.liftType !== liftType) {
    throw new Error(`Set liftType (${set.liftType}) does not match provided liftType (${liftType})`);
  }

  // Use the existing estimation function
  return estimate1RmFromSet(set);
}


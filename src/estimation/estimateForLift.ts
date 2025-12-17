/**
 * B2.4.1 - API Design for Per-Lift Estimation
 * 
 * Pure API surface for multi-lift estimation.
 * 
 * This module provides the core estimation functions required for
 * multi-lift functionality, ensuring per-lift independence.
 */

import type {
  TrainingSet,
  TestedOneRm,
  LiftType,
  BaselineEstimate,
  UserCalibration,
  UserProfile,
  BenchSet,
} from '../domain';
import { estimateBaselineOneRm, type BaselineOneRmEstimate } from './estimateBaselineOneRm';
import { createBaselineEstimate } from '../domain';
import { estimate1RmFromSet } from './repTo1Rm';
import { applyCalibrationWithUserCalibration } from './personalization';

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
 * @param calibration - Per-lift calibration multipliers
 * @param profile - User profile for personalization
 * @param referenceDate - Reference date for estimation
 * @returns BaselineEstimate for the specified liftType
 */
export function estimateBaselineForLift(
  liftType: LiftType,
  sets: TrainingSet[],
  tests: TestedOneRm[],
  calibration: UserCalibration,
  profile: UserProfile,
  referenceDate: Date
): BaselineEstimate {
  // Filter sets and tests by liftType to ensure per-lift independence
  const setsForLift = sets.filter((set) => set.liftType === liftType);
  const testsForLift = tests.filter((test) => test.liftType === liftType);

  // Adapt TrainingSet → BenchSet shape for the underlying estimation logic.
  // TrainingSet uses `timestamp`, whereas legacy BenchSet uses `performedAt`.
  const benchLikeSets: BenchSet[] = setsForLift.map((set) => ({
    id: set.id,
    liftType: set.liftType,
    performedAt: set.timestamp,
    weight: set.weight,
    reps: set.reps,
    rir: set.rir,
  }));

  // Use the existing estimation function (which enforces per-lift independence
  // and time-window rules internally).
  const result: BaselineOneRmEstimate = estimateBaselineOneRm({
    liftType,
    benchSets: benchLikeSets,
    testedOneRms: testsForLift,
    profile,
    referenceDate,
  });

  // Apply per-lift calibration multiplier (B2.4.3) on top of the baseline.
  let calibratedBaseline =
    result.baselineOneRm > 0
      ? applyCalibrationWithUserCalibration(result.baselineOneRm, liftType, calibration)
      : 0;

  // Keep uncertainty range consistent with the calibrated baseline by scaling
  // the range by the same factor. This preserves the relative uncertainty
  // while ensuring baseline1Rm stays within [low, high].
  let calibratedRange = result.uncertaintyRange;

  if (result.baselineOneRm > 0 && calibratedBaseline > 0 && calibratedBaseline !== result.baselineOneRm) {
    const factor = calibratedBaseline / result.baselineOneRm;
    calibratedRange = {
      low: result.uncertaintyRange.low * factor,
      high: result.uncertaintyRange.high * factor,
    };
  } else if (calibratedBaseline === 0) {
    calibratedRange = { low: 0, high: 0 };
  }

  // Convert to BaselineEstimate format
  return createBaselineEstimate(
    liftType,
    calibratedBaseline,
    calibratedRange,
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
  set: TrainingSet | BenchSet,
  liftType: LiftType
): number {
  // Validate that set's liftType matches the provided liftType
  if (set.liftType !== liftType) {
    throw new Error(`Set liftType (${set.liftType}) does not match requested liftType (${liftType})`);
  }

  // Use the existing estimation function (works with the BenchSet shape)
  return estimate1RmFromSet(set as BenchSet);
}


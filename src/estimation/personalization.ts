import type { TestedOneRm, LiftType, UserCalibration, TrainingSet } from '../domain';
import { getCalibrationForLift } from '../domain';

/**
 * B2.4.3 - Derive Calibration for a Specific Lift
 * 
 * Calculates a calibration multiplier based on tested 1RMs for a specific lift.
 * 
 * This function:
 * - Uses ONLY sets and tests for the selected liftType
 * - Uses the most recent tested 1RM for that lift
 * - Adjusts predicted 1RM slightly upward/downward
 * - Must not affect other lifts
 * 
 * Before the first tested 1RM: returns 1.0 (no calibration).
 * After the first tested 1RM: calculates a factor that adjusts estimates
 * toward the user's actual tested values.
 * 
 * The calibration factor is calculated as:
 *   factor = (mostRecentTested1Rm / averageEstimated1Rm) * 0.1 + 0.9
 * 
 * This creates a factor between 0.9 and 1.1 that slightly adjusts estimates
 * toward the user's tested values, with a maximum adjustment of ±10%.
 * 
 * GUARDRAIL: All sets and tests must be for the same liftType. This function
 * does NOT filter by liftType - callers must ensure per-lift independence
 * by filtering before calling.
 * 
 * @param liftType - Type of lift to derive calibration for (bench, squat, or deadlift)
 * @param sets - Training sets (should already be filtered by liftType)
 * @param tests - Tested 1RMs (should already be filtered by liftType)
 * @returns Calibration multiplier (typically between 0.9 and 1.1)
 */
export function deriveCalibration(
  liftType: LiftType,
  sets: TrainingSet[],
  tests: TestedOneRm[]
): number {
  // Find most recent tested 1RM for this lift
  let mostRecentTested1Rm: TestedOneRm | null = null;
  let mostRecentDate: Date | null = null;

  for (const test of tests) {
    if (test.liftType !== liftType) {
      continue; // Skip if not for this lift (shouldn't happen if pre-filtered)
    }
    
    const timestamp = test.timestamp instanceof Date 
      ? test.timestamp 
      : new Date(test.timestamp);
    
    if (!mostRecentDate || timestamp > mostRecentDate) {
      mostRecentTested1Rm = test;
      mostRecentDate = timestamp;
    }
  }

  // If no tested 1RM exists, return 1.0 (no calibration)
  if (mostRecentTested1Rm === null) {
    return 1.0;
  }

  // Calculate average estimated 1RM from sets
  // Simple average for now (could use weighted average)
  let totalEstimated = 0;
  let count = 0;

  for (const set of sets) {
    if (set.liftType !== liftType) {
      continue; // Skip if not for this lift (shouldn't happen if pre-filtered)
    }
    
    // Estimate 1RM from set (Epley formula with RIR)
    const effectiveReps = set.reps + set.rir;
    const estimated1Rm = set.weight * (1 + effectiveReps / 30);
    totalEstimated += estimated1Rm;
    count++;
  }

  if (count === 0 || totalEstimated === 0) {
    return 1.0; // No sets to compare against
  }

  const averageEstimated1Rm = totalEstimated / count;

  // Calculate ratio and apply gentle adjustment
  const ratio = mostRecentTested1Rm.weight / averageEstimated1Rm;
  
  // Apply a gentle calibration (max ±10% adjustment)
  // Formula: (ratio * 0.1) + 0.9
  const factor = (ratio * 0.1) + 0.9;
  
  // Clamp to reasonable bounds (0.85 to 1.15)
  return Math.max(0.85, Math.min(1.15, factor));
}

/**
 * B2.4.3 - Apply Calibration Using UserCalibration
 * 
 * Applies per-lift calibration from UserCalibration object.
 * 
 * Each lift uses its own multiplier (bench/squat/deadlift).
 * This ensures that calibration for one lift does not affect others.
 * 
 * @param estimate - The estimated 1RM
 * @param liftType - Type of lift (bench, squat, or deadlift)
 * @param calibration - UserCalibration object with per-lift multipliers
 * @returns Calibrated 1RM estimate
 */
export function applyCalibrationWithUserCalibration(
  estimate: number,
  liftType: LiftType,
  calibration: UserCalibration
): number {
  const calibrationFactor = getCalibrationForLift(calibration, liftType);
  return estimate * calibrationFactor;
}

/**
 * Legacy function for backward compatibility.
 * Applies a calibration factor directly.
 * 
 * @deprecated Use applyCalibrationWithUserCalibration for per-lift calibration
 * @param estimated1Rm - The estimated 1RM
 * @param calibrationFactor - The calibration factor
 * @returns Calibrated 1RM estimate
 */
export function applyCalibration(
  estimated1Rm: number,
  calibrationFactor: number
): number {
  return estimated1Rm * calibrationFactor;
}

/**
 * Legacy function for backward compatibility.
 * @deprecated Use applyCalibration(estimate, liftType, calibration) instead
 */
export function calculateCalibrationFactor(
  mostRecentTested1Rm: TestedOneRm | null,
  averageEstimated1Rm: number
): number {
  // Before first tested 1RM: no calibration
  if (mostRecentTested1Rm === null || averageEstimated1Rm <= 0) {
    return 1.0;
  }
  
  // Calculate ratio and apply gentle adjustment
  const ratio = mostRecentTested1Rm.weight / averageEstimated1Rm;
  const factor = (ratio * 0.1) + 0.9;
  
  // Clamp to reasonable bounds (0.85 to 1.15)
  return Math.max(0.85, Math.min(1.15, factor));
}


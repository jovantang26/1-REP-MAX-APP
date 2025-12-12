import type { LiftType } from './LiftType';

/**
 * B2.2.1 - UserCalibration (per-lift calibration multipliers)
 * 
 * Represents per-lift calibration factors that adjust estimates toward
 * the user's actual tested values.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own calibration multiplier.
 * Bench calibration does not affect squat or deadlift estimates, and vice versa.
 * 
 * Calibration factors:
 * - Default: 1.0 (no adjustment)
 * - > 1.0: Estimates are adjusted upward
 * - < 1.0: Estimates are adjusted downward
 * - Typical range: 0.85 to 1.15 (±15% adjustment)
 */

/**
 * UserCalibration stores calibration multipliers for each lift type.
 * 
 * B2.2.1: All default values are 1.0 (no calibration).
 * Calibration is derived from tested 1RMs and applied per-lift.
 */
export interface UserCalibration {
  /** Calibration multiplier for bench press (default: 1.0) */
  bench: number;
  
  /** Calibration multiplier for squat (default: 1.0) */
  squat: number;
  
  /** Calibration multiplier for deadlift (default: 1.0) */
  deadlift: number;
}

/**
 * Creates a new UserCalibration with default values (1.0 for all lifts).
 * 
 * B2.2.1: All default values are 1.0, meaning no calibration adjustment.
 * 
 * @returns A UserCalibration object with all values set to 1.0
 */
export function createUserCalibration(): UserCalibration {
  return {
    bench: 1.0,
    squat: 1.0,
    deadlift: 1.0,
  };
}

/**
 * Creates a UserCalibration with specific values.
 * 
 * @param bench - Calibration multiplier for bench (must be positive)
 * @param squat - Calibration multiplier for squat (must be positive)
 * @param deadlift - Calibration multiplier for deadlift (must be positive)
 * @returns A UserCalibration object with the specified values
 * @throws Error if any value is invalid
 */
export function createUserCalibrationWithValues(
  bench: number,
  squat: number,
  deadlift: number
): UserCalibration {
  if (bench <= 0 || squat <= 0 || deadlift <= 0) {
    throw new Error('All calibration values must be positive numbers');
  }
  
  return {
    bench,
    squat,
    deadlift,
  };
}

/**
 * Gets the calibration multiplier for a specific lift type.
 * 
 * PER-LIFT INDEPENDENCE: Each lift has its own calibration factor.
 * 
 * @param calibration - The UserCalibration object
 * @param liftType - The lift type to get calibration for
 * @returns The calibration multiplier for the specified lift
 */
export function getCalibrationForLift(
  calibration: UserCalibration,
  liftType: LiftType
): number {
  return calibration[liftType];
}

/**
 * Type guard to check if an object is a valid UserCalibration
 */
export function isUserCalibration(obj: unknown): obj is UserCalibration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const cal = obj as Record<string, unknown>;
  
  return (
    typeof cal.bench === 'number' &&
    cal.bench > 0 &&
    typeof cal.squat === 'number' &&
    cal.squat > 0 &&
    typeof cal.deadlift === 'number' &&
    cal.deadlift > 0
  );
}


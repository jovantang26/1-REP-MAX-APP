import type { LiftType } from './LiftType';

/**
 * UserCalibration defines per-lift calibration multipliers.
 * 
 * Calibration factors adjust estimated 1RMs based on tested 1RMs to account
 * for individual differences in how the estimation formula performs for each
 * user and each lift type.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own calibration factor.
 * This ensures that if a user's bench press estimates are consistently off,
 * it doesn't affect their squat or deadlift estimates.
 * 
 * Default values are 1.0 (no calibration). Values > 1.0 increase estimates,
 * values < 1.0 decrease estimates.
 * 
 * Example:
 * - bench: 1.05 means bench estimates are multiplied by 1.05 (5% increase)
 * - squat: 0.98 means squat estimates are multiplied by 0.98 (2% decrease)
 * - deadlift: 1.0 means deadlift estimates are not adjusted
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
 * @returns A UserCalibration object with all multipliers set to 1.0
 */
export function createUserCalibration(): UserCalibration {
  return {
    bench: 1.0,
    squat: 1.0,
    deadlift: 1.0,
  };
}

/**
 * Creates a UserCalibration with custom values.
 * 
 * @param bench - Calibration multiplier for bench press (default: 1.0)
 * @param squat - Calibration multiplier for squat (default: 1.0)
 * @param deadlift - Calibration multiplier for deadlift (default: 1.0)
 * @returns A UserCalibration object
 * @throws Error if any value is invalid (not a number, NaN, or <= 0)
 */
export function createUserCalibrationWithValues(
  bench: number = 1.0,
  squat: number = 1.0,
  deadlift: number = 1.0
): UserCalibration {
  if (typeof bench !== 'number' || isNaN(bench) || !isFinite(bench) || bench <= 0) {
    throw new Error('Bench calibration must be a positive number');
  }
  
  if (typeof squat !== 'number' || isNaN(squat) || !isFinite(squat) || squat <= 0) {
    throw new Error('Squat calibration must be a positive number');
  }
  
  if (typeof deadlift !== 'number' || isNaN(deadlift) || !isFinite(deadlift) || deadlift <= 0) {
    throw new Error('Deadlift calibration must be a positive number');
  }
  
  return {
    bench,
    squat,
    deadlift,
  };
}

/**
 * Gets the calibration factor for a specific lift type.
 * 
 * @param calibration - The UserCalibration object
 * @param liftType - The lift type to get the calibration for
 * @returns The calibration multiplier for the specified lift type
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


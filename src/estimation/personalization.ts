import type { TestedOneRm } from '../domain';

/**
 * Calculates a calibration factor based on tested 1RMs.
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
 * @param mostRecentTested1Rm - The most recent tested 1RM, or null
 * @param averageEstimated1Rm - The average estimated 1RM from bench sets
 * @returns Calibration factor (typically between 0.9 and 1.1)
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
  
  // Apply a gentle calibration (max ±10% adjustment)
  // Formula: (ratio * 0.1) + 0.9
  // This means if ratio is 1.0 (perfect match), factor is 1.0
  // If ratio is 1.1 (tested is 10% higher), factor is 1.01 (1% adjustment)
  // If ratio is 0.9 (tested is 10% lower), factor is 0.99 (1% adjustment)
  const factor = (ratio * 0.1) + 0.9;
  
  // Clamp to reasonable bounds (0.85 to 1.15)
  return Math.max(0.85, Math.min(1.15, factor));
}

/**
 * Applies calibration factor to an estimated 1RM.
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


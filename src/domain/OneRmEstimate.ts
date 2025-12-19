import type { LiftType } from './LiftType';

/**
 * OneRmEstimate represents a calculated estimate of the user's 1RM.
 * 
 * IMPORTANT: This model is lift-agnostic. The liftType field determines
 * which lift this estimate belongs to. All visualization and history logic
 * must filter by liftType to ensure per-lift independence.
 * 
 * This is distinct from:
 * - True 1RM (TestedOneRm): An actual tested maximum
 * - Baseline 1RM: A reference value used for initial calculations
 * 
 * Estimates are derived from submaximal sets using formulas that account
 * for weight, reps, and RIR (reps in reserve).
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own:
 * - Estimate history (filtered by liftType)
 * - Baseline 1RM (calculated only from sets of that liftType)
 * - Uncertainty range (calculated independently per liftType)
 * - Confidence level (calculated independently per liftType)
 */

export interface UncertaintyRange {
  /** Lower bound of the estimate in kilograms */
  low: number;
  
  /** Upper bound of the estimate in kilograms */
  high: number;
}

export interface OneRmEstimate {
  /** Unique identifier for this estimate */
  id: string;
  
  /** Type of lift this estimate is for (bench, squat, or deadlift) */
  liftType: LiftType;
  
  /** Date when this estimate was calculated (ISO string or Date) */
  date: Date | string;
  
  /** Estimated 1RM in kilograms */
  estimated1Rm: number;
  
  /** Uncertainty range: the estimate is likely between low and high */
  uncertaintyRange: UncertaintyRange;
  
  /** Confidence level: 0-1 (0% to 100%) indicating how confident the estimate is */
  confidenceLevel: number;
}

/**
 * Creates a new OneRmEstimate with validation.
 * 
 * GUARDRAIL: liftType is required and must be a valid LiftType.
 * This ensures all estimates are properly categorized and can be filtered
 * independently by lift type.
 * 
 * @param id - Unique identifier for the estimate
 * @param liftType - Type of lift this estimate is for (bench, squat, or deadlift)
 * @param date - Date when the estimate was calculated
 * @param estimated1Rm - Estimated 1RM in kilograms (must be positive)
 * @param uncertaintyRange - Range of uncertainty (low and high must be positive, low <= estimated1Rm <= high)
 * @param confidenceLevel - Confidence level between 0 and 1 (0% to 100%)
 * @returns A validated OneRmEstimate object
 * @throws Error if validation fails
 */
export function createOneRmEstimate(
  id: string,
  liftType: LiftType,
  date: Date | string,
  estimated1Rm: number,
  uncertaintyRange: UncertaintyRange,
  confidenceLevel: number
): OneRmEstimate {
  if (!id || id.trim().length === 0) {
    throw new Error('Estimate ID must be provided');
  }
  
  if (!liftType || (liftType !== 'bench' && liftType !== 'squat' && liftType !== 'deadlift' && liftType !== 'powerclean')) {
    throw new Error('liftType must be "bench", "squat", "deadlift", or "powerclean"');
  }
  
  if (!date) {
    throw new Error('Date must be provided');
  }
  
  if (estimated1Rm <= 0) {
    throw new Error('Estimated 1RM must be a positive number');
  }
  
  if (uncertaintyRange.low <= 0 || uncertaintyRange.high <= 0) {
    throw new Error('Uncertainty range bounds must be positive numbers');
  }
  
  if (uncertaintyRange.low > uncertaintyRange.high) {
    throw new Error('Uncertainty range low must be less than or equal to high');
  }
  
  if (uncertaintyRange.low > estimated1Rm || estimated1Rm > uncertaintyRange.high) {
    throw new Error('Estimated 1RM must be within the uncertainty range');
  }
  
  if (confidenceLevel < 0 || confidenceLevel > 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }
  
  return {
    id: id.trim(),
    liftType,
    date,
    estimated1Rm,
    uncertaintyRange,
    confidenceLevel,
  };
}

/**
 * Creates an uncertainty range from a center value and a ± deviation.
 * @param center - Center value (typically the estimated 1RM)
 * @param deviation - Deviation in kilograms (e.g., ±5kg)
 * @returns An UncertaintyRange object
 */
export function createUncertaintyRange(
  center: number,
  deviation: number
): UncertaintyRange {
  if (deviation < 0) {
    throw new Error('Deviation must be non-negative');
  }
  
  return {
    low: Math.max(0, center - deviation),
    high: center + deviation,
  };
}

/**
 * Type guard to check if an object is a valid OneRmEstimate
 * 
 * GUARDRAIL: Validates that liftType is present and valid.
 */
export function isOneRmEstimate(obj: unknown): obj is OneRmEstimate {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const estimate = obj as Record<string, unknown>;
  
  if (
    typeof estimate.id !== 'string' ||
    estimate.id.length === 0 ||
    typeof estimate.liftType !== 'string' ||
    (estimate.liftType !== 'bench' && estimate.liftType !== 'squat' && estimate.liftType !== 'deadlift') ||
    !(estimate.date instanceof Date || typeof estimate.date === 'string') ||
    typeof estimate.estimated1Rm !== 'number' ||
    estimate.estimated1Rm <= 0 ||
    typeof estimate.confidenceLevel !== 'number' ||
    estimate.confidenceLevel < 0 ||
    estimate.confidenceLevel > 1
  ) {
    return false;
  }
  
  const range = estimate.uncertaintyRange;
  if (
    typeof range !== 'object' ||
    range === null ||
    typeof (range as Record<string, unknown>).low !== 'number' ||
    typeof (range as Record<string, unknown>).high !== 'number'
  ) {
    return false;
  }
  
  const uncertaintyRange = range as UncertaintyRange;
  return (
    uncertaintyRange.low > 0 &&
    uncertaintyRange.high > 0 &&
    uncertaintyRange.low <= uncertaintyRange.high
  );
}


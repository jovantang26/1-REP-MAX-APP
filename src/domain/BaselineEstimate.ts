import type { LiftType } from './LiftType';

/**
 * Uncertainty range for baseline estimates
 */
export interface UncertaintyRange {
  /** Lower bound of the estimate in kilograms */
  low: number;
  
  /** Upper bound of the estimate in kilograms */
  high: number;
}

/**
 * BaselineEstimate represents a calculated baseline 1RM estimate for a specific lift.
 * 
 * IMPORTANT: This type is lift-specific. The liftType field is MANDATORY and determines
 * which lift this estimate belongs to. All visualization and history logic must filter
 * by liftType to ensure per-lift independence.
 * 
 * This is distinct from:
 * - True 1RM (TestedOneRm): An actual tested maximum
 * - Estimated 1RM: A calculated estimate from submaximal sets
 * 
 * Baseline estimates are derived from submaximal sets using formulas that account
 * for weight, reps, and RIR (reps in reserve), then calibrated using tested 1RMs.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own:
 * - Baseline 1RM (calculated only from sets of that liftType)
 * - Uncertainty range (calculated independently per liftType)
 * - Confidence level (calculated independently per liftType)
 * 
 * No logic may assume Bench is the default lift. liftType must always be specified.
 */
export interface BaselineEstimate {
  /** Type of lift this estimate is for (bench, squat, or deadlift) - MANDATORY */
  liftType: LiftType;
  
  /** The baseline 1RM estimate in kilograms */
  baseline1Rm: number;
  
  /** Uncertainty range: the estimate is likely between low and high */
  uncertaintyRange: UncertaintyRange;
  
  /** Confidence level: 0-1 (0% to 100%) indicating how confident the estimate is */
  confidence: number;
}

/**
 * Creates a new BaselineEstimate with validation.
 * 
 * GUARDRAIL: liftType is required and must be a valid LiftType.
 * This ensures all estimates are properly categorized and can be filtered
 * independently by lift type. No default liftType is assumed.
 * 
 * @param liftType - Type of lift this estimate is for (bench, squat, or deadlift) - MANDATORY
 * @param baseline1Rm - Baseline 1RM in kilograms (must be positive)
 * @param uncertaintyRange - Range of uncertainty (low and high must be positive, low <= baseline1Rm <= high)
 * @param confidence - Confidence level between 0 and 1 (0% to 100%)
 * @returns A validated BaselineEstimate object
 * @throws Error if validation fails
 */
export function createBaselineEstimate(
  liftType: LiftType,
  baseline1Rm: number,
  uncertaintyRange: UncertaintyRange,
  confidence: number
): BaselineEstimate {
  if (!liftType || (liftType !== 'bench' && liftType !== 'squat' && liftType !== 'deadlift')) {
    throw new Error('liftType must be "bench", "squat", or "deadlift"');
  }
  
  if (baseline1Rm <= 0) {
    throw new Error('Baseline 1RM must be a positive number');
  }
  
  if (uncertaintyRange.low <= 0 || uncertaintyRange.high <= 0) {
    throw new Error('Uncertainty range bounds must be positive numbers');
  }
  
  if (uncertaintyRange.low > uncertaintyRange.high) {
    throw new Error('Uncertainty range low must be less than or equal to high');
  }
  
  if (uncertaintyRange.low > baseline1Rm || baseline1Rm > uncertaintyRange.high) {
    throw new Error('Baseline 1RM must be within the uncertainty range');
  }
  
  if (confidence < 0 || confidence > 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }
  
  return {
    liftType,
    baseline1Rm,
    uncertaintyRange,
    confidence,
  };
}

/**
 * Type guard to check if an object is a valid BaselineEstimate
 * 
 * GUARDRAIL: Validates that liftType is present and valid.
 */
export function isBaselineEstimate(obj: unknown): obj is BaselineEstimate {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const estimate = obj as Record<string, unknown>;
  
  if (
    typeof estimate.liftType !== 'string' ||
    (estimate.liftType !== 'bench' && estimate.liftType !== 'squat' && estimate.liftType !== 'deadlift') ||
    typeof estimate.baseline1Rm !== 'number' ||
    estimate.baseline1Rm <= 0 ||
    typeof estimate.confidence !== 'number' ||
    estimate.confidence < 0 ||
    estimate.confidence > 1
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


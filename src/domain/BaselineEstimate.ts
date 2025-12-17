import type { LiftType } from './LiftType';

/**
 * B2.2.1 - BaselineEstimate (per-lift baseline estimate)
 * 
 * Represents a per-lift baseline 1RM estimate with uncertainty and confidence.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own:
 * - Baseline 1RM (calculated only from sets of that liftType)
 * - Uncertainty range (calculated independently per liftType)
 * - Confidence level (calculated independently per liftType)
 * 
 * This is distinct from:
 * - OneRmEstimate: A historical estimate stored over time
 * - TestedOneRm: An actual tested maximum
 */

/**
 * Uncertainty range for baseline estimates.
 */
export interface BaselineUncertaintyRange {
  /** Lower bound of the estimate in kilograms */
  low: number;
  
  /** Upper bound of the estimate in kilograms */
  high: number;
}

/**
 * BaselineEstimate represents a per-lift baseline 1RM estimate.
 * 
 * B2.2.1: This model is lift-agnostic. The liftType field determines
 * which lift this estimate belongs to. All visualization and history logic
 * must filter by liftType to ensure per-lift independence.
 */
export interface BaselineEstimate {
  /** Type of lift this estimate is for (bench, squat, or deadlift) - MANDATORY */
  liftType: LiftType;
  
  /** The baseline 1RM estimate in kilograms */
  baseline1Rm: number;
  
  /** Uncertainty range: the estimate is likely between low and high */
  uncertaintyRange: BaselineUncertaintyRange;
  
  /** Confidence level: 0-1 (0% to 100%) indicating how confident the estimate is */
  confidence: number;
  
  /** Date when this baseline was calculated (ISO string or Date) */
  date: Date | string;
}

/**
 * Creates a new BaselineEstimate with validation.
 * 
 * GUARDRAIL: liftType is required and must be a valid LiftType.
 * This ensures all baseline estimates are properly categorized and can be filtered
 * independently by lift type.
 * 
 * @param liftType - Type of lift this estimate is for (bench, squat, or deadlift)
 * @param baseline1Rm - Baseline 1RM in kilograms (must be non-negative; 0 means "no estimate yet")
 * @param uncertaintyRange - Range of uncertainty (bounds must be non-negative)
 * @param confidence - Confidence level between 0 and 1 (0% to 100%)
 * @param date - Date when the baseline was calculated
 * @returns A validated BaselineEstimate object
 * @throws Error if validation fails
 */
export function createBaselineEstimate(
  liftType: LiftType,
  baseline1Rm: number,
  uncertaintyRange: BaselineUncertaintyRange,
  confidence: number,
  date: Date | string = new Date()
): BaselineEstimate {
  if (!liftType || (liftType !== 'bench' && liftType !== 'squat' && liftType !== 'deadlift')) {
    throw new Error('liftType must be "bench", "squat", or "deadlift"');
  }
  
  if (baseline1Rm < 0) {
    throw new Error('Baseline 1RM must be a non-negative number');
  }
  
  if (uncertaintyRange.low < 0 || uncertaintyRange.high < 0) {
    throw new Error('Uncertainty range bounds must be non-negative numbers');
  }
  
  if (uncertaintyRange.low > uncertaintyRange.high) {
    throw new Error('Uncertainty range low must be less than or equal to high');
  }
  
  if (baseline1Rm === 0) {
    // Special "no estimate" case: we expect a degenerate 0–0 range
    if (uncertaintyRange.low !== 0 || uncertaintyRange.high !== 0) {
      throw new Error('When baseline 1RM is 0, uncertainty range must be 0–0');
    }
  } else {
    // Normal case: baseline must sit within a strictly positive range
    if (uncertaintyRange.low <= 0 || uncertaintyRange.high <= 0) {
      throw new Error('Uncertainty range bounds must be positive numbers when baseline 1RM is > 0');
    }
    if (uncertaintyRange.low > baseline1Rm || baseline1Rm > uncertaintyRange.high) {
      throw new Error('Baseline 1RM must be within the uncertainty range');
    }
  }
  
  if (confidence < 0 || confidence > 1) {
    throw new Error('Confidence level must be between 0 and 1');
  }
  
  if (!date) {
    throw new Error('Date must be provided');
  }
  
  return {
    liftType,
    baseline1Rm,
    uncertaintyRange,
    confidence,
    date,
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
    estimate.baseline1Rm < 0 ||
    typeof estimate.confidence !== 'number' ||
    estimate.confidence < 0 ||
    estimate.confidence > 1 ||
    !(estimate.date instanceof Date || typeof estimate.date === 'string')
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
  
  const uncertaintyRange = range as BaselineUncertaintyRange;

  if (
    uncertaintyRange.low < 0 ||
    uncertaintyRange.high < 0 ||
    uncertaintyRange.low > uncertaintyRange.high
  ) {
    return false;
  }

  const baseline1Rm = estimate.baseline1Rm as number;

  // "No estimate" case: 0 baseline with 0–0 range
  if (baseline1Rm === 0) {
    return uncertaintyRange.low === 0 && uncertaintyRange.high === 0;
  }

  // Normal case: positive baseline must sit inside a positive range
  return (
    uncertaintyRange.low > 0 &&
    uncertaintyRange.high > 0 &&
    uncertaintyRange.low <= baseline1Rm &&
    baseline1Rm <= uncertaintyRange.high
  );
}


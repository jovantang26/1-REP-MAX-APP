import type { BenchSet } from '../domain';

/**
 * Converts a training set (weight, reps, RIR) to an estimated 1RM.
 * 
 * B2.4.1 - Per-Set 1RM Estimator (alias: estimateOneRMFromSet)
 * 
 * GUARDRAIL (B2.2.4): This function is lift-agnostic. The Epley formula
 * works for all lift types (bench, squat, deadlift). No bench-only logic.
 * 
 * Uses the Epley formula modified to account for RIR (Reps in Reserve):
 * 
 * Formula: 1RM = weight × (1 + (reps + rir) / 30)
 * 
 * This is based on the Epley formula: 1RM = weight × (1 + reps / 30)
 * but adjusted to account for RIR by adding RIR to the rep count.
 * 
 * Example:
 * - 100kg × 5 reps with RIR 0 → 1RM ≈ 120kg
 * - 100kg × 5 reps with RIR 2 → 1RM ≈ 123.3kg (accounting for 2 more reps in reserve)
 * 
 * @param set - The training set to convert (works for any lift type)
 * @returns Estimated 1RM in kilograms
 */
export function estimate1RmFromSet(set: BenchSet): number {
  const effectiveReps = set.reps + set.rir;
  return set.weight * (1 + effectiveReps / 30);
}

/**
 * B2.4.1 - Alias for estimate1RmFromSet to match API specification.
 * 
 * @param set - The training set to convert
 * @returns Estimated 1RM in kilograms
 */
export function estimateOneRMFromSet(set: BenchSet): number {
  return estimate1RmFromSet(set);
}

/**
 * Converts multiple training sets to estimated 1RMs.
 * 
 * GUARDRAIL (B2.2.4): This function is lift-agnostic. Works for all lift types.
 * No bench-only assumptions.
 * 
 * @param sets - Array of training sets (any lift type)
 * @returns Array of estimated 1RMs
 */
export function estimate1RmFromSets(sets: BenchSet[]): number[] {
  return sets.map(estimate1RmFromSet);
}


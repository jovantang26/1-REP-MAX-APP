import type { BenchSet } from '../domain';

/**
 * Converts a bench set (weight, reps, RIR) to an estimated 1RM.
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
 * @param set - The bench set to convert
 * @returns Estimated 1RM in kilograms
 */
export function estimate1RmFromSet(set: BenchSet): number {
  const effectiveReps = set.reps + set.rir;
  return set.weight * (1 + effectiveReps / 30);
}

/**
 * Converts multiple bench sets to estimated 1RMs.
 * @param sets - Array of bench sets
 * @returns Array of estimated 1RMs
 */
export function estimate1RmFromSets(sets: BenchSet[]): number[] {
  return sets.map(estimate1RmFromSet);
}


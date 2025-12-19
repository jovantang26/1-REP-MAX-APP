import type { LiftType } from './LiftType';

/**
 * BenchSet represents a single set of a lift performed by the user.
 * 
 * IMPORTANT: This model is lift-agnostic. The liftType field determines
 * which lift this set belongs to. All estimation and storage logic must
 * filter by liftType to ensure per-lift independence.
 * 
 * RIR (Reps in Reserve) is a subjective measure of how many more reps the user
 * could have performed at the given weight. For example:
 * - RIR 0: Maximum effort, could not perform another rep
 * - RIR 1: Could have performed 1 more rep
 * - RIR 2: Could have performed 2 more reps
 * 
 * This is used to estimate the user's true 1RM from submaximal sets.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own:
 * - Baseline 1RM (calculated only from sets of that liftType)
 * - Calibration factor (calculated only from tested 1RMs of that liftType)
 * - History trend (filtered by liftType)
 * - Strength category (calculated independently per liftType)
 */

export interface BenchSet {
  /** Unique identifier for this set */
  id: string;
  
  /** Type of lift performed (bench, squat, or deadlift) */
  liftType: LiftType;
  
  /** Date and time when the set was performed (ISO string or Date) */
  performedAt: Date | string;
  
  /** Weight lifted in kilograms */
  weight: number;
  
  /** Number of repetitions performed */
  reps: number;
  
  /** Reps in Reserve (RIR) - how many more reps could have been performed */
  rir: number;
}

/**
 * Creates a new BenchSet with validation.
 * 
 * GUARDRAIL: liftType is required and must be a valid LiftType.
 * This ensures all sets are properly categorized and can be filtered
 * independently by lift type.
 * 
 * @param id - Unique identifier for the set
 * @param liftType - Type of lift (bench, squat, or deadlift)
 * @param performedAt - Date and time when the set was performed
 * @param weight - Weight lifted in kilograms (must be positive)
 * @param reps - Number of repetitions (must be positive)
 * @param rir - Reps in Reserve (must be non-negative integer)
 * @returns A validated BenchSet object
 * @throws Error if validation fails
 */
export function createBenchSet(
  id: string,
  liftType: LiftType,
  performedAt: Date | string,
  weight: number,
  reps: number,
  rir: number
): BenchSet {
  if (!id || id.trim().length === 0) {
    throw new Error('Set ID must be provided');
  }
  
  if (!liftType || (liftType !== 'bench' && liftType !== 'squat' && liftType !== 'deadlift' && liftType !== 'powerclean')) {
    throw new Error('liftType must be "bench", "squat", "deadlift", or "powerclean"');
  }
  
  if (!performedAt) {
    throw new Error('PerformedAt date must be provided');
  }
  
  if (typeof weight !== 'number' || isNaN(weight) || !isFinite(weight) || weight <= 0) {
    throw new Error('Weight must be a positive number');
  }
  
  if (!Number.isInteger(reps) || reps <= 0) {
    throw new Error('Reps must be a positive integer');
  }
  
  if (!Number.isInteger(rir) || rir < 0) {
    throw new Error('RIR must be a non-negative integer');
  }
  
  return {
    id: id.trim(),
    liftType,
    performedAt,
    weight,
    reps,
    rir,
  };
}

/**
 * Type guard to check if an object is a valid BenchSet
 * 
 * GUARDRAIL: Validates that liftType is present and valid.
 */
export function isBenchSet(obj: unknown): obj is BenchSet {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const set = obj as Record<string, unknown>;
  
  return (
    typeof set.id === 'string' &&
    set.id.length > 0 &&
    typeof set.liftType === 'string' &&
    (set.liftType === 'bench' || set.liftType === 'squat' || set.liftType === 'deadlift') &&
    (set.performedAt instanceof Date || typeof set.performedAt === 'string') &&
    typeof set.weight === 'number' &&
    set.weight > 0 &&
    typeof set.reps === 'number' &&
    Number.isInteger(set.reps) &&
    set.reps > 0 &&
    typeof set.rir === 'number' &&
    Number.isInteger(set.rir) &&
    set.rir >= 0
  );
}


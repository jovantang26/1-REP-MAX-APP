import type { LiftType } from './LiftType';

/**
 * TrainingSet represents a single set of any lift performed by the user.
 * 
 * IMPORTANT: TrainingSet replaces BenchSet everywhere. This rename reflects
 * that the system now supports multiple lifts (bench, squat, deadlift), not
 * just bench press. No logic may assume Bench is the default lift.
 * 
 * The liftType field is MANDATORY and determines which lift this set belongs to.
 * All estimation and storage logic must filter by liftType to ensure per-lift
 * independence. Each liftType has its own:
 * - Baseline 1RM (calculated only from sets of that liftType)
 * - Calibration factor (calculated only from tested 1RMs of that liftType)
 * - History trend (filtered by liftType)
 * - Strength category (calculated independently per liftType)
 * 
 * RIR (Reps in Reserve) is a subjective measure of how many more reps the user
 * could have performed at the given weight. Valid range is 0-5.
 * - RIR 0: Maximum effort, could not perform another rep
 * - RIR 1: Could have performed 1 more rep
 * - RIR 2: Could have performed 2 more reps
 * - RIR 3-5: Higher reserve capacity
 * 
 * This is used to estimate the user's true 1RM from submaximal sets.
 * 
 * @see LiftType for supported lift types
 */

export interface TrainingSet {
  /** Unique identifier for this set */
  id: string;
  
  /** Type of lift performed (bench, squat, or deadlift) - MANDATORY */
  liftType: LiftType;
  
  /** Timestamp when the set was performed (ISO string or Date) */
  timestamp: Date | string;
  
  /** Weight lifted in kilograms */
  weight: number;
  
  /** Number of repetitions performed */
  reps: number;
  
  /** Reps in Reserve (RIR) - how many more reps could have been performed (0-5) */
  rir: number;
}

/**
 * Creates a new TrainingSet with validation.
 * 
 * GUARDRAIL: liftType is required and must be a valid LiftType.
 * This ensures all sets are properly categorized and can be filtered
 * independently by lift type. No default liftType is assumed.
 * 
 * @param id - Unique identifier for the set
 * @param liftType - Type of lift (bench, squat, or deadlift) - MANDATORY
 * @param timestamp - Timestamp when the set was performed
 * @param weight - Weight lifted in kilograms (must be positive)
 * @param reps - Number of repetitions (must be positive)
 * @param rir - Reps in Reserve (must be 0-5)
 * @returns A validated TrainingSet object
 * @throws Error if validation fails
 */
export function createTrainingSet(
  id: string,
  liftType: LiftType,
  timestamp: Date | string,
  weight: number,
  reps: number,
  rir: number
): TrainingSet {
  if (!id || id.trim().length === 0) {
    throw new Error('Set ID must be provided');
  }
  
  if (!liftType || (liftType !== 'bench' && liftType !== 'squat' && liftType !== 'deadlift')) {
    throw new Error('liftType must be "bench", "squat", or "deadlift"');
  }
  
  if (!timestamp) {
    throw new Error('Timestamp must be provided');
  }
  
  if (typeof weight !== 'number' || isNaN(weight) || !isFinite(weight) || weight <= 0) {
    throw new Error('Weight must be a positive number');
  }
  
  if (!Number.isInteger(reps) || reps <= 0) {
    throw new Error('Reps must be a positive integer');
  }
  
  if (!Number.isInteger(rir) || rir < 0 || rir > 5) {
    throw new Error('RIR must be an integer between 0 and 5');
  }
  
  return {
    id: id.trim(),
    liftType,
    timestamp,
    weight,
    reps,
    rir,
  };
}

/**
 * Type guard to check if an object is a valid TrainingSet
 * 
 * GUARDRAIL: Validates that liftType is present and valid.
 */
export function isTrainingSet(obj: unknown): obj is TrainingSet {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const set = obj as Record<string, unknown>;
  
  return (
    typeof set.id === 'string' &&
    set.id.length > 0 &&
    typeof set.liftType === 'string' &&
    (set.liftType === 'bench' || set.liftType === 'squat' || set.liftType === 'deadlift') &&
    (set.timestamp instanceof Date || typeof set.timestamp === 'string') &&
    typeof set.weight === 'number' &&
    set.weight > 0 &&
    typeof set.reps === 'number' &&
    Number.isInteger(set.reps) &&
    set.reps > 0 &&
    typeof set.rir === 'number' &&
    Number.isInteger(set.rir) &&
    set.rir >= 0 &&
    set.rir <= 5
  );
}

/**
 * Legacy alias for backward compatibility during migration.
 * @deprecated Use TrainingSet and createTrainingSet instead
 */
export type BenchSet = TrainingSet;

/**
 * Legacy function for backward compatibility during migration.
 * Maps `performedAt` parameter to `timestamp` field.
 * @deprecated Use createTrainingSet instead
 */
export function createBenchSet(
  id: string,
  liftType: LiftType,
  performedAt: Date | string,
  weight: number,
  reps: number,
  rir: number
): TrainingSet {
  // Map performedAt to timestamp for backward compatibility
  return createTrainingSet(id, liftType, performedAt, weight, reps, rir);
}

/**
 * Legacy type guard for backward compatibility during migration.
 * @deprecated Use isTrainingSet instead
 */
export function isBenchSet(obj: unknown): obj is TrainingSet {
  return isTrainingSet(obj);
}


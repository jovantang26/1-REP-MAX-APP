/**
 * BenchSet represents a single set of bench press performed by the user.
 * 
 * RIR (Reps in Reserve) is a subjective measure of how many more reps the user
 * could have performed at the given weight. For example:
 * - RIR 0: Maximum effort, could not perform another rep
 * - RIR 1: Could have performed 1 more rep
 * - RIR 2: Could have performed 2 more reps
 * 
 * This is used to estimate the user's true 1RM from submaximal sets.
 */

export interface BenchSet {
  /** Unique identifier for this set */
  id: string;
  
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
 * @param id - Unique identifier for the set
 * @param performedAt - Date and time when the set was performed
 * @param weight - Weight lifted in kilograms (must be positive)
 * @param reps - Number of repetitions (must be positive)
 * @param rir - Reps in Reserve (must be non-negative integer)
 * @returns A validated BenchSet object
 * @throws Error if validation fails
 */
export function createBenchSet(
  id: string,
  performedAt: Date | string,
  weight: number,
  reps: number,
  rir: number
): BenchSet {
  if (!id || id.trim().length === 0) {
    throw new Error('Set ID must be provided');
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
    performedAt,
    weight,
    reps,
    rir,
  };
}

/**
 * Type guard to check if an object is a valid BenchSet
 */
export function isBenchSet(obj: unknown): obj is BenchSet {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const set = obj as Record<string, unknown>;
  
  return (
    typeof set.id === 'string' &&
    set.id.length > 0 &&
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


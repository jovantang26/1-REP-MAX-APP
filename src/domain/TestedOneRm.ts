import type { LiftType } from './LiftType';

/**
 * TestedOneRm represents a true 1RM attempt that was actually tested.
 * 
 * IMPORTANT: This model is lift-agnostic. The liftType field determines
 * which lift this tested 1RM belongs to. All estimation and calibration
 * logic must filter by liftType to ensure per-lift independence.
 * 
 * This is distinct from:
 * - Baseline 1RM: A reference 1RM used for initial calculations
 * - Estimated 1RM: A calculated estimate from submaximal sets
 * 
 * True 1RM means the user actually attempted and successfully completed
 * a single repetition at maximum weight.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own:
 * - Tested 1RM history (filtered by liftType)
 * - Calibration factor (calculated only from tested 1RMs of that liftType)
 * - Hard reset logic (applied only to sets and estimates of that liftType)
 */

export interface TestedOneRm {
  /** Unique identifier for this tested 1RM */
  id: string;
  
  /** Type of lift tested (bench, squat, or deadlift) */
  liftType: LiftType;
  
  /** Date and time when the 1RM was tested (ISO string or Date) */
  testedAt: Date | string;
  
  /** Weight successfully lifted for 1 rep in kilograms */
  weight: number;
}

/**
 * Creates a new TestedOneRm with validation.
 * 
 * GUARDRAIL: liftType is required and must be a valid LiftType.
 * This ensures all tested 1RMs are properly categorized and can be filtered
 * independently by lift type.
 * 
 * @param id - Unique identifier for the tested 1RM
 * @param liftType - Type of lift tested (bench, squat, or deadlift)
 * @param testedAt - Date and time when the 1RM was tested
 * @param weight - Weight successfully lifted in kilograms (must be positive)
 * @returns A validated TestedOneRm object
 * @throws Error if validation fails
 */
export function createTestedOneRm(
  id: string,
  liftType: LiftType,
  testedAt: Date | string,
  weight: number
): TestedOneRm {
  if (!id || id.trim().length === 0) {
    throw new Error('Tested 1RM ID must be provided');
  }
  
  if (!liftType || (liftType !== 'bench' && liftType !== 'squat' && liftType !== 'deadlift')) {
    throw new Error('liftType must be "bench", "squat", or "deadlift"');
  }
  
  if (!testedAt) {
    throw new Error('TestedAt date must be provided');
  }
  
  if (typeof weight !== 'number' || isNaN(weight) || !isFinite(weight) || weight <= 0) {
    throw new Error('Weight must be a positive number');
  }
  
  return {
    id: id.trim(),
    liftType,
    testedAt,
    weight,
  };
}

/**
 * Type guard to check if an object is a valid TestedOneRm
 * 
 * GUARDRAIL: Validates that liftType is present and valid.
 */
export function isTestedOneRm(obj: unknown): obj is TestedOneRm {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const tested = obj as Record<string, unknown>;
  
  return (
    typeof tested.id === 'string' &&
    tested.id.length > 0 &&
    typeof tested.liftType === 'string' &&
    (tested.liftType === 'bench' || tested.liftType === 'squat' || tested.liftType === 'deadlift') &&
    (tested.testedAt instanceof Date || typeof tested.testedAt === 'string') &&
    typeof tested.weight === 'number' &&
    tested.weight > 0
  );
}


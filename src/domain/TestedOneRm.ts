/**
 * TestedOneRm represents a true 1RM attempt that was actually tested.
 * 
 * This is distinct from:
 * - Baseline 1RM: A reference 1RM used for initial calculations
 * - Estimated 1RM: A calculated estimate from submaximal sets
 * 
 * True 1RM means the user actually attempted and successfully completed
 * a single repetition at maximum weight.
 */

export interface TestedOneRm {
  /** Unique identifier for this tested 1RM */
  id: string;
  
  /** Date and time when the 1RM was tested (ISO string or Date) */
  testedAt: Date | string;
  
  /** Weight successfully lifted for 1 rep in kilograms */
  weight: number;
}

/**
 * Creates a new TestedOneRm with validation.
 * @param id - Unique identifier for the tested 1RM
 * @param testedAt - Date and time when the 1RM was tested
 * @param weight - Weight successfully lifted in kilograms (must be positive)
 * @returns A validated TestedOneRm object
 * @throws Error if validation fails
 */
export function createTestedOneRm(
  id: string,
  testedAt: Date | string,
  weight: number
): TestedOneRm {
  if (!id || id.trim().length === 0) {
    throw new Error('Tested 1RM ID must be provided');
  }
  
  if (!testedAt) {
    throw new Error('TestedAt date must be provided');
  }
  
  if (weight <= 0) {
    throw new Error('Weight must be a positive number');
  }
  
  return {
    id: id.trim(),
    testedAt,
    weight,
  };
}

/**
 * Type guard to check if an object is a valid TestedOneRm
 */
export function isTestedOneRm(obj: unknown): obj is TestedOneRm {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const tested = obj as Record<string, unknown>;
  
  return (
    typeof tested.id === 'string' &&
    tested.id.length > 0 &&
    (tested.testedAt instanceof Date || typeof tested.testedAt === 'string') &&
    typeof tested.weight === 'number' &&
    tested.weight > 0
  );
}


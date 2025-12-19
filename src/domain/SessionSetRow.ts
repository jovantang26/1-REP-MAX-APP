/**
 * B3.3.1 - Session Set Row Model
 * 
 * Represents a single set row in session mode.
 * This is a temporary in-memory structure before conversion to BenchSet.
 */

export interface SessionSetRow {
  /** Unique ID for this row (for React key) */
  id: string;
  
  /** Weight input value (in user's selected unit, as string) */
  weight: string;
  
  /** Reps input value (as string) */
  reps: string;
  
  /** RIR input value (as string) */
  rir: string;
  
  /** Whether this row has validation errors */
  hasError?: boolean;
  
  /** Error message if validation fails */
  errorMessage?: string;
}

/**
 * Creates a new empty SessionSetRow.
 */
export function createEmptySessionSetRow(): SessionSetRow {
  return {
    id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    weight: '',
    reps: '',
    rir: '0',
  };
}

/**
 * Validates a SessionSetRow and returns error message if invalid.
 * @param row - The row to validate
 * @param unitSystem - The current unit system (for weight validation)
 * @returns Error message if invalid, undefined if valid
 */
export function validateSessionSetRow(row: SessionSetRow, unitSystem: 'kg' | 'lbs'): string | undefined {
  if (!row.weight || row.weight.trim() === '') {
    return 'Weight is required';
  }
  
  const weightNum = parseFloat(row.weight.trim());
  if (isNaN(weightNum) || weightNum <= 0) {
    return 'Weight must be a positive number';
  }
  
  if (!row.reps || row.reps.trim() === '') {
    return 'Reps is required';
  }
  
  const repsNum = parseInt(row.reps.trim(), 10);
  if (isNaN(repsNum) || repsNum <= 0) {
    return 'Reps must be a positive integer';
  }
  
  const rirNum = parseInt(row.rir.trim(), 10);
  if (isNaN(rirNum) || rirNum < 0) {
    return 'RIR must be a non-negative integer';
  }
  
  return undefined;
}


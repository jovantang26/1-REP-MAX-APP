import type { LiftType } from './LiftType';

/**
 * B3.5.1 - Tested PR Anchor Model
 * 
 * Represents a tested personal record (PR) anchor for a specific lift.
 * PR anchors are the best tested 1RM values that are never overwritten by estimates.
 * They serve as truth markers in the history and provide trust in the system.
 */

export interface TestedPrAnchor {
  /** Type of lift this PR anchor is for */
  liftType: LiftType;
  
  /** Best tested 1RM in kilograms (never overwritten by estimates) */
  bestTested1Rm: number;
  
  /** Date when this PR was achieved (ISO string or Date) */
  dateAchieved: Date | string;
  
  /** Optional: ID of the TestedOneRm record that represents this PR */
  testedOneRmId?: string;
}

/**
 * Creates a new TestedPrAnchor with validation.
 * 
 * @param liftType - Type of lift
 * @param bestTested1Rm - Best tested 1RM in kilograms (must be positive)
 * @param dateAchieved - Date when PR was achieved
 * @param testedOneRmId - Optional ID of the TestedOneRm record
 * @returns A validated TestedPrAnchor object
 * @throws Error if validation fails
 */
export function createTestedPrAnchor(
  liftType: LiftType,
  bestTested1Rm: number,
  dateAchieved: Date | string,
  testedOneRmId?: string
): TestedPrAnchor {
  if (!liftType || (liftType !== 'bench' && liftType !== 'squat' && liftType !== 'deadlift' && liftType !== 'powerclean')) {
    throw new Error('liftType must be "bench", "squat", "deadlift", or "powerclean"');
  }
  
  if (bestTested1Rm <= 0) {
    throw new Error('Best tested 1RM must be a positive number');
  }
  
  return {
    liftType,
    bestTested1Rm,
    dateAchieved,
    testedOneRmId,
  };
}

/**
 * Type guard to check if an object is a valid TestedPrAnchor.
 */
export function isTestedPrAnchor(obj: unknown): obj is TestedPrAnchor {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const anchor = obj as Record<string, unknown>;
  
  return (
    (anchor.liftType === 'bench' || anchor.liftType === 'squat' || anchor.liftType === 'deadlift' || anchor.liftType === 'powerclean') &&
    typeof anchor.bestTested1Rm === 'number' &&
    anchor.bestTested1Rm > 0 &&
    (typeof anchor.dateAchieved === 'string' || anchor.dateAchieved instanceof Date)
  );
}


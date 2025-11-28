import type { BenchSet, TestedOneRm, LiftType } from '../domain';

/**
 * Filters bench sets to only include those within the last N days.
 * 
 * PER-LIFT INDEPENDENCE RULE: This function does NOT filter by liftType.
 * Callers must filter by liftType BEFORE calling this function to ensure
 * per-lift independence. See filterSetsByLiftTypeAndDateRange for a
 * combined filter.
 * 
 * @param sets - Array of bench sets (should already be filtered by liftType)
 * @param days - Number of days to look back (default: 90)
 * @param referenceDate - Reference date (default: now)
 * @returns Filtered array of bench sets
 */
export function filterSetsByDateRange(
  sets: BenchSet[],
  days: number = 90,
  referenceDate: Date = new Date()
): BenchSet[] {
  const cutoffDate = new Date(referenceDate);
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return sets.filter((set) => {
    const performedAt = set.performedAt instanceof Date 
      ? set.performedAt 
      : new Date(set.performedAt);
    
    return performedAt >= cutoffDate;
  });
}

/**
 * Filters bench sets by liftType AND date range.
 * 
 * GUARDRAIL: This function ensures per-lift independence by filtering
 * both by liftType and date range. Use this when you need both filters.
 * 
 * @param sets - Array of bench sets
 * @param liftType - The lift type to filter by (required for independence)
 * @param days - Number of days to look back (default: 90)
 * @param referenceDate - Reference date (default: now)
 * @returns Filtered array of bench sets for the specified liftType
 */
export function filterSetsByLiftTypeAndDateRange(
  sets: BenchSet[],
  liftType: LiftType,
  days: number = 90,
  referenceDate: Date = new Date()
): BenchSet[] {
  // First filter by liftType to ensure per-lift independence
  const filteredByLift = sets.filter((set) => set.liftType === liftType);
  
  // Then filter by date range
  return filterSetsByDateRange(filteredByLift, days, referenceDate);
}

/**
 * Filters tested 1RMs to only include those within the last N days.
 * 
 * PER-LIFT INDEPENDENCE RULE: This function does NOT filter by liftType.
 * Callers must filter by liftType BEFORE calling this function to ensure
 * per-lift independence. See filterTestedOneRmsByLiftTypeAndDateRange for a
 * combined filter.
 * 
 * @param testedOneRms - Array of tested 1RMs (should already be filtered by liftType)
 * @param days - Number of days to look back (default: 90)
 * @param referenceDate - Reference date (default: now)
 * @returns Filtered array of tested 1RMs
 */
export function filterTestedOneRmsByDateRange(
  testedOneRms: TestedOneRm[],
  days: number = 90,
  referenceDate: Date = new Date()
): TestedOneRm[] {
  const cutoffDate = new Date(referenceDate);
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return testedOneRms.filter((record) => {
    const testedAt = record.testedAt instanceof Date 
      ? record.testedAt 
      : new Date(record.testedAt);
    
    return testedAt >= cutoffDate;
  });
}

/**
 * Filters tested 1RMs by liftType AND date range.
 * 
 * GUARDRAIL: This function ensures per-lift independence by filtering
 * both by liftType and date range. Use this when you need both filters.
 * 
 * @param testedOneRms - Array of tested 1RMs
 * @param liftType - The lift type to filter by (required for independence)
 * @param days - Number of days to look back (default: 90)
 * @param referenceDate - Reference date (default: now)
 * @returns Filtered array of tested 1RMs for the specified liftType
 */
export function filterTestedOneRmsByLiftTypeAndDateRange(
  testedOneRms: TestedOneRm[],
  liftType: LiftType,
  days: number = 90,
  referenceDate: Date = new Date()
): TestedOneRm[] {
  // First filter by liftType to ensure per-lift independence
  const filteredByLift = testedOneRms.filter((record) => record.liftType === liftType);
  
  // Then filter by date range
  return filterTestedOneRmsByDateRange(filteredByLift, days, referenceDate);
}

/**
 * Gets the most recent tested 1RM.
 * 
 * PER-LIFT INDEPENDENCE RULE: This function does NOT filter by liftType.
 * Callers must filter by liftType BEFORE calling this function to ensure
 * per-lift independence. See getMostRecentTestedOneRmByLiftType for a
 * version that filters by liftType.
 * 
 * @param testedOneRms - Array of tested 1RMs (should already be filtered by liftType)
 * @returns The most recent tested 1RM, or null if none exist
 */
export function getMostRecentTestedOneRm(
  testedOneRms: TestedOneRm[]
): TestedOneRm | null {
  if (testedOneRms.length === 0) {
    return null;
  }
  
  // Find the most recent by date
  let mostRecent = testedOneRms[0];
  let mostRecentDate = mostRecent.testedAt instanceof Date 
    ? mostRecent.testedAt 
    : new Date(mostRecent.testedAt);
  
  for (const record of testedOneRms) {
    const testedAt = record.testedAt instanceof Date 
      ? record.testedAt 
      : new Date(record.testedAt);
    
    if (testedAt > mostRecentDate) {
      mostRecent = record;
      mostRecentDate = testedAt;
    }
  }
  
  return mostRecent;
}

/**
 * Gets the most recent tested 1RM for a specific liftType.
 * 
 * GUARDRAIL: This function ensures per-lift independence by filtering
 * by liftType before finding the most recent. Use this when you need
 * the most recent tested 1RM for a specific lift.
 * 
 * @param testedOneRms - Array of tested 1RMs
 * @param liftType - The lift type to filter by (required for independence)
 * @returns The most recent tested 1RM for the specified liftType, or null if none exist
 */
export function getMostRecentTestedOneRmByLiftType(
  testedOneRms: TestedOneRm[],
  liftType: LiftType
): TestedOneRm | null {
  // First filter by liftType to ensure per-lift independence
  const filteredByLift = testedOneRms.filter((record) => record.liftType === liftType);
  
  // Then get the most recent
  return getMostRecentTestedOneRm(filteredByLift);
}


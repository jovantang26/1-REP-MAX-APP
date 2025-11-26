import type { BenchSet, TestedOneRm } from '../domain';

/**
 * Filters bench sets to only include those within the last N days.
 * @param sets - Array of bench sets
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
 * Filters tested 1RMs to only include those within the last N days.
 * @param testedOneRms - Array of tested 1RMs
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
 * Gets the most recent tested 1RM.
 * @param testedOneRms - Array of tested 1RMs (should be sorted newest first)
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


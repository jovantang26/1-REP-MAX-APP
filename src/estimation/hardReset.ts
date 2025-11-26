import type { TestedOneRm } from '../domain';

/**
 * Performs a "hard reset" around the most recent tested 1RM.
 * 
 * If a tested 1RM exists, this function pulls the estimate toward that value.
 * The reset strength depends on how recent the tested 1RM is:
 * - Within last 30 days: 70% weight to tested, 30% to estimate
 * - Within last 60 days: 50% weight to tested, 50% to estimate
 * - Within last 90 days: 30% weight to tested, 70% to estimate
 * - Older: no reset (returns estimate unchanged)
 * 
 * @param estimated1Rm - The estimated 1RM from bench sets
 * @param mostRecentTested1Rm - The most recent tested 1RM, or null
 * @param referenceDate - Reference date for recency calculation
 * @returns Adjusted 1RM estimate
 */
export function applyHardReset(
  estimated1Rm: number,
  mostRecentTested1Rm: TestedOneRm | null,
  referenceDate: Date = new Date()
): number {
  if (mostRecentTested1Rm === null) {
    return estimated1Rm;
  }
  
  const testedAt = mostRecentTested1Rm.testedAt instanceof Date 
    ? mostRecentTested1Rm.testedAt 
    : new Date(mostRecentTested1Rm.testedAt);
  
  const daysAgo = (referenceDate.getTime() - testedAt.getTime()) / (1000 * 60 * 60 * 24);
  
  let testedWeight: number;
  
  if (daysAgo <= 30) {
    testedWeight = 0.7; // Strong reset for very recent tests
  } else if (daysAgo <= 60) {
    testedWeight = 0.5; // Moderate reset
  } else if (daysAgo <= 90) {
    testedWeight = 0.3; // Weak reset
  } else {
    return estimated1Rm; // No reset for older tests
  }
  
  const estimateWeight = 1.0 - testedWeight;
  
  return (mostRecentTested1Rm.weight * testedWeight) + (estimated1Rm * estimateWeight);
}


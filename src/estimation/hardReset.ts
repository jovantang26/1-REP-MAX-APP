import type { TestedOneRm } from '../domain';

/**
 * Performs a "hard reset" around the most recent tested 1RM.
 * 
 * If a tested 1RM exists, this function pulls the estimate toward that value.
 * However, it will NOT pull the estimate DOWN if the estimate is significantly
 * higher than the tested value (indicating the user has improved).
 * 
 * The reset strength depends on how recent the tested 1RM is:
 * - Within last 30 days: 70% weight to tested, 30% to estimate
 * - Within last 60 days: 50% weight to tested, 50% to estimate
 * - Within last 90 days: 30% weight to tested, 70% to estimate
 * - Older: no reset (returns estimate unchanged)
 * 
 * Smart behavior:
 * - If estimate is LOWER than tested: pull it UP (user might be underestimating)
 * - If estimate is HIGHER than tested by >10%: don't pull DOWN (user has improved)
 * - If estimate is slightly higher (within 10%): gentle pull toward tested
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
  
  // If tested 1RM is older than 90 days, don't apply reset
  if (daysAgo > 90) {
    return estimated1Rm;
  }
  
  // Calculate improvement percentage
  const improvementRatio = estimated1Rm / mostRecentTested1Rm.weight;
  
  // If estimate is significantly higher (>10% improvement), don't pull it down
  // This means the user has clearly improved beyond their last tested 1RM
  if (improvementRatio > 1.1) {
    // Only apply a very gentle adjustment (max 5% pull) if tested is very recent
    if (daysAgo <= 30) {
      // Very recent test, but user has improved - only slight adjustment
      return (mostRecentTested1Rm.weight * 0.05) + (estimated1Rm * 0.95);
    }
    // Older test, user has improved - trust the estimate
    return estimated1Rm;
  }
  
  // If estimate is lower than tested, pull it up (user might be underestimating)
  if (estimated1Rm < mostRecentTested1Rm.weight) {
    let testedWeight: number;
    if (daysAgo <= 30) {
      testedWeight = 0.7; // Strong pull up for very recent tests
    } else if (daysAgo <= 60) {
      testedWeight = 0.5; // Moderate pull up
    } else {
      testedWeight = 0.3; // Weak pull up
    }
    const estimateWeight = 1.0 - testedWeight;
    return (mostRecentTested1Rm.weight * testedWeight) + (estimated1Rm * estimateWeight);
  }
  
  // Estimate is slightly higher (within 10%), apply normal reset
  let testedWeight: number;
  if (daysAgo <= 30) {
    testedWeight = 0.3; // Reduced from 0.7 - don't pull down as aggressively
  } else if (daysAgo <= 60) {
    testedWeight = 0.2; // Reduced from 0.5
  } else {
    testedWeight = 0.1; // Reduced from 0.3
  }
  
  const estimateWeight = 1.0 - testedWeight;
  return (mostRecentTested1Rm.weight * testedWeight) + (estimated1Rm * estimateWeight);
}


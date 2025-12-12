import type { BenchSet } from '../domain';

/**
 * Calculates a recency weight for a bench set.
 * 
 * B2.4.2 - Time Window Rules:
 * - Sets within the last 60 days get full weight (1.0) - weighted more heavily
 * - Sets between 60-90 days get reduced weight (0.5)
 * - Sets outside 90 days are ignored (filtered out before this function)
 * 
 * Time window rules are identical for all lifts (bench, squat, deadlift).
 * 
 * @param set - The bench set (should already be filtered by liftType)
 * @param referenceDate - Reference date (default: now)
 * @returns Weight factor (0.0 to 1.0)
 */
export function calculateRecencyWeight(
  set: BenchSet,
  referenceDate: Date = new Date()
): number {
  const performedAt = set.performedAt instanceof Date 
    ? set.performedAt 
    : new Date(set.performedAt);
  
  const daysAgo = (referenceDate.getTime() - performedAt.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysAgo <= 60) {
    return 1.0; // Full weight for last 60 days
  } else if (daysAgo <= 90) {
    return 0.5; // Reduced weight for 60-90 days
  } else {
    return 0.0; // No weight for older sets
  }
}

/**
 * Calculates weighted average of 1RM estimates from bench sets.
 * 
 * @param sets - Array of bench sets
 * @param oneRmEstimates - Array of 1RM estimates (one per set)
 * @param referenceDate - Reference date for recency calculation
 * @returns Weighted average 1RM estimate
 */
export function calculateWeightedAverage(
  sets: BenchSet[],
  oneRmEstimates: number[],
  referenceDate: Date = new Date()
): number {
  if (sets.length === 0 || oneRmEstimates.length === 0) {
    return 0;
  }
  
  if (sets.length !== oneRmEstimates.length) {
    throw new Error('Sets and estimates arrays must have the same length');
  }
  
  let totalWeightedSum = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < sets.length; i++) {
    const recencyWeight = calculateRecencyWeight(sets[i], referenceDate);
    totalWeightedSum += oneRmEstimates[i] * recencyWeight;
    totalWeight += recencyWeight;
  }
  
  if (totalWeight === 0) {
    return 0;
  }
  
  return totalWeightedSum / totalWeight;
}


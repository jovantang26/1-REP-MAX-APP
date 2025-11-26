import type { UncertaintyRange } from '../domain';
import { createUncertaintyRange } from '../domain';

/**
 * Calculates uncertainty range based on data spread and volume.
 * 
 * Uncertainty is calculated as:
 * - Base uncertainty: ±5% of the estimate
 * - Additional uncertainty based on standard deviation of estimates
 * - Reduced uncertainty if there are many recent sets
 * 
 * @param baseline1Rm - The baseline 1RM estimate
 * @param oneRmEstimates - Array of individual 1RM estimates from sets
 * @param recentSetCount - Number of sets in the last 60 days
 * @returns Uncertainty range
 */
export function calculateUncertaintyRange(
  baseline1Rm: number,
  oneRmEstimates: number[],
  recentSetCount: number
): UncertaintyRange {
  // Base uncertainty: ±5% of estimate
  let baseDeviation = baseline1Rm * 0.05;
  
  // Calculate standard deviation if we have multiple estimates
  if (oneRmEstimates.length > 1) {
    const mean = oneRmEstimates.reduce((sum, val) => sum + val, 0) / oneRmEstimates.length;
    const variance = oneRmEstimates.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / oneRmEstimates.length;
    const stdDev = Math.sqrt(variance);
    
    // Add 50% of standard deviation to uncertainty
    baseDeviation += stdDev * 0.5;
  }
  
  // Reduce uncertainty if we have many recent sets (more data = more confidence)
  const volumeReduction = Math.min(0.3, recentSetCount * 0.02); // Max 30% reduction
  const finalDeviation = baseDeviation * (1 - volumeReduction);
  
  // Minimum uncertainty: ±2.5kg
  const minDeviation = 2.5;
  const deviation = Math.max(minDeviation, finalDeviation);
  
  return createUncertaintyRange(baseline1Rm, deviation);
}

/**
 * Calculates confidence level based on data recency and volume.
 * 
 * Confidence factors:
 * - Base confidence: 0.5 (50%)
 * - Recent sets (last 60 days): +0.1 per set (max +0.3 for 3+ sets)
 * - Older sets (60-90 days): +0.05 per set (max +0.15)
 * - Tested 1RM exists: +0.2
 * - Tested 1RM within last 30 days: +0.1
 * 
 * @param recentSetCount - Number of sets in the last 60 days
 * @param olderSetCount - Number of sets between 60-90 days
 * @param hasTested1Rm - Whether a tested 1RM exists
 * @param tested1RmDaysAgo - Days since most recent tested 1RM (null if none)
 * @returns Confidence level (0.0 to 1.0)
 */
export function calculateConfidenceLevel(
  recentSetCount: number,
  olderSetCount: number,
  hasTested1Rm: boolean,
  tested1RmDaysAgo: number | null
): number {
  let confidence = 0.5; // Base confidence
  
  // Recent sets boost confidence
  confidence += Math.min(0.3, recentSetCount * 0.1);
  
  // Older sets provide some confidence
  confidence += Math.min(0.15, olderSetCount * 0.05);
  
  // Tested 1RM significantly boosts confidence
  if (hasTested1Rm) {
    confidence += 0.2;
    
    // Very recent tested 1RM provides additional confidence
    if (tested1RmDaysAgo !== null && tested1RmDaysAgo <= 30) {
      confidence += 0.1;
    }
  }
  
  // Clamp to [0.0, 1.0]
  return Math.max(0.0, Math.min(1.0, confidence));
}


import type { UncertaintyRange } from '../domain';
import { createUncertaintyRange } from '../domain';

/**
 * B2.4.4 - Calculates uncertainty range for a specific lift.
 * 
 * Uncertainty Rules:
 * - Use spread of per-set estimates (standard deviation)
 * - If < 3 recent sets → high uncertainty
 * - If > 10 sets with consistent values → low uncertainty
 * 
 * GUARDRAIL: This function is lift-agnostic but MUST be calculated
 * only for the selected lift. The estimates array should contain
 * estimates for a single liftType only. No cross-lift mixing.
 * 
 * Uncertainty is calculated as:
 * - Base uncertainty: ±5% of the estimate
 * - Additional uncertainty based on standard deviation of estimates
 * - Reduced uncertainty if there are many recent sets
 * 
 * @param baseline1Rm - The baseline 1RM estimate (for a specific lift)
 * @param oneRmEstimates - Array of individual 1RM estimates from sets (same lift, MUST be filtered by liftType)
 * @param recentSetCount - Number of sets in the last 60 days (same lift)
 * @returns Uncertainty range
 */
export function calculateUncertaintyRange(
  baseline1Rm: number,
  oneRmEstimates: number[],
  recentSetCount: number
): UncertaintyRange {
  // Base uncertainty: ±5% of estimate
  let baseDeviation = baseline1Rm * 0.05;
  
  // B2.4.4 - Uncertainty Rules:
  // If < 3 recent sets → high uncertainty (no reduction)
  // If > 10 sets with consistent values → low uncertainty (maximum reduction)
  
  // Calculate standard deviation if we have multiple estimates
  if (oneRmEstimates.length > 1) {
    const mean = oneRmEstimates.reduce((sum, val) => sum + val, 0) / oneRmEstimates.length;
    const variance = oneRmEstimates.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / oneRmEstimates.length;
    const stdDev = Math.sqrt(variance);
    
    // Add 50% of standard deviation to uncertainty
    // Higher spread = higher uncertainty
    baseDeviation += stdDev * 0.5;
  }
  
  // B2.4.4 - Reduce uncertainty if we have many recent sets (more data = more confidence)
  // Volume reduction scales with recentSetCount:
  // - < 3 sets: minimal reduction (high uncertainty)
  // - 3-10 sets: moderate reduction
  // - > 10 sets: maximum reduction (low uncertainty)
  const volumeReduction = Math.min(0.3, recentSetCount * 0.02); // Max 30% reduction
  const finalDeviation = baseDeviation * (1 - volumeReduction);
  
  // Minimum uncertainty: ±2.5kg
  const minDeviation = 2.5;
  const deviation = Math.max(minDeviation, finalDeviation);
  
  return createUncertaintyRange(baseline1Rm, deviation);
}

/**
 * B2.4.4 - Calculates confidence level for a specific lift.
 * 
 * Confidence Rules:
 * - Few sets or long gaps = LOW confidence
 * - Many recent sets = HIGH confidence
 * - MUST be calculated only for the selected lift
 * 
 * GUARDRAIL: This function is lift-agnostic but MUST be calculated
 * only for the selected lift. All parameters should be for a single
 * liftType. No cross-lift mixing allowed.
 * 
 * Confidence factors:
 * - Base confidence: 0.5 (50%)
 * - Recent sets (last 60 days): +0.1 per set (max +0.3 for 3+ sets)
 * - Older sets (60-90 days): +0.05 per set (max +0.15)
 * - Tested 1RM exists: +0.2
 * - Tested 1RM within last 30 days: +0.1
 * 
 * @param recentSetCount - Number of sets in the last 60 days (for a specific lift, MUST be filtered by liftType)
 * @param olderSetCount - Number of sets between 60-90 days (for a specific lift, MUST be filtered by liftType)
 * @param hasTested1Rm - Whether a tested 1RM exists (for a specific lift, MUST be filtered by liftType)
 * @param tested1RmDaysAgo - Days since most recent tested 1RM (null if none, for a specific lift)
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


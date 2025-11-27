import type { BenchSet, TestedOneRm, UserProfile, UncertaintyRange } from '../domain';
import { estimate1RmFromSet, estimate1RmFromSets } from './repTo1Rm';
import { filterSetsByDateRange, getMostRecentTestedOneRm } from './dateFiltering';
import { calculateWeightedAverage } from './weighting';
import { calculateCalibrationFactor, applyCalibration } from './personalization';
import { applyHardReset } from './hardReset';
import { calculateUncertaintyRange, calculateConfidenceLevel } from './uncertainty';

/**
 * Parameters for estimating baseline 1RM
 */
export interface EstimateBaselineOneRmParams {
  /** Bench sets to use for estimation */
  benchSets: BenchSet[];
  /** Tested 1RMs for calibration and hard reset */
  testedOneRms: TestedOneRm[];
  /** User profile for personalization */
  profile: UserProfile;
  /** Reference date for calculations (default: now) */
  referenceDate?: Date;
}

/**
 * Result of baseline 1RM estimation
 */
export interface BaselineOneRmEstimate {
  /** The baseline 1RM estimate in kilograms */
  baselineOneRm: number;
  /** Uncertainty range */
  uncertaintyRange: UncertaintyRange;
  /** Confidence level (0.0 to 1.0) */
  confidenceLevel: number;
}

/**
 * Estimates baseline 1RM from bench sets, tested 1RMs, and user profile.
 * 
 * Algorithm:
 * 1. Filter bench sets to last 90 days
 * 2. Convert each set to 1RM estimate using Epley-style formula with RIR
 * 3. Calculate weighted average (more recent sets weighted higher)
 * 4. Apply calibration factor if tested 1RMs exist
 * 5. Apply hard reset toward most recent tested 1RM if available
 * 6. Calculate uncertainty range and confidence level
 * 
 * @param params - Estimation parameters
 * @returns Baseline 1RM estimate with uncertainty and confidence
 */
export function estimateBaselineOneRm(
  params: EstimateBaselineOneRmParams
): BaselineOneRmEstimate {
  const { benchSets, testedOneRms, profile, referenceDate = new Date() } = params;
  
  // Step 1: Filter sets to last 90 days
  const recentSets = filterSetsByDateRange(benchSets, 90, referenceDate);
  
  // If no sets available, return default estimate
  if (recentSets.length === 0) {
    return {
      baselineOneRm: 0,
      uncertaintyRange: { low: 0, high: 0 },
      confidenceLevel: 0.0,
    };
  }
  
  // Step 2: Get most recent tested 1RM first
  const mostRecentTested1Rm = getMostRecentTestedOneRm(testedOneRms);
  
  // Step 3: Convert each set to 1RM estimate
  const oneRmEstimates = estimate1RmFromSets(recentSets);
  
  // Step 4: Calculate weighted average (recency weighting)
  let baselineOneRm = calculateWeightedAverage(recentSets, oneRmEstimates, referenceDate);
  
  // Step 5: If we have a tested 1RM that's recent, use it as the primary baseline
  // Only update it if workout data shows clear improvement (>10% higher)
  if (mostRecentTested1Rm !== null) {
    const testedAt = mostRecentTested1Rm.testedAt instanceof Date 
      ? mostRecentTested1Rm.testedAt 
      : new Date(mostRecentTested1Rm.testedAt);
    const daysAgo = (referenceDate.getTime() - testedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // If tested 1RM is within 90 days, use it as the true baseline
    if (daysAgo <= 90) {
      const improvementRatio = baselineOneRm / mostRecentTested1Rm.weight;
      
      // If estimate shows >10% improvement, use the estimate (user has improved)
      if (improvementRatio > 1.1) {
        // User has clearly improved - use the estimate but keep it close to tested if very recent
        if (daysAgo <= 30) {
          // Very recent test, but user improved - blend slightly toward tested
          baselineOneRm = (mostRecentTested1Rm.weight * 0.1) + (baselineOneRm * 0.9);
        }
        // Otherwise, trust the estimate (user has improved)
      } else {
        // No clear improvement - use tested 1RM as the true baseline
        baselineOneRm = mostRecentTested1Rm.weight;
      }
    } else {
      // Tested 1RM is old (>90 days), apply calibration and reset as before
      const calibrationFactor = calculateCalibrationFactor(mostRecentTested1Rm, baselineOneRm);
      baselineOneRm = applyCalibration(baselineOneRm, calibrationFactor);
      baselineOneRm = applyHardReset(baselineOneRm, mostRecentTested1Rm, referenceDate);
    }
  }
  // If no tested 1RM exists, baselineOneRm stays as the estimate from workouts
  
  // Step 7: Calculate uncertainty range
  const recentSetCount = filterSetsByDateRange(recentSets, 60, referenceDate).length;
  const olderSetCount = recentSets.length - recentSetCount;
  const uncertaintyRange = calculateUncertaintyRange(
    baselineOneRm,
    oneRmEstimates,
    recentSetCount
  );
  
  // Step 8: Calculate confidence level
  const tested1RmDaysAgo = mostRecentTested1Rm
    ? (referenceDate.getTime() - (mostRecentTested1Rm.testedAt instanceof Date 
        ? mostRecentTested1Rm.testedAt 
        : new Date(mostRecentTested1Rm.testedAt)).getTime()) / (1000 * 60 * 60 * 24)
    : null;
  
  const confidenceLevel = calculateConfidenceLevel(
    recentSetCount,
    olderSetCount,
    mostRecentTested1Rm !== null,
    tested1RmDaysAgo
  );
  
  return {
    baselineOneRm,
    uncertaintyRange,
    confidenceLevel,
  };
}


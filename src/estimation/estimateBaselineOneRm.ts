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
  
  // Step 2: Convert each set to 1RM estimate
  const oneRmEstimates = estimate1RmFromSets(recentSets);
  
  // Step 3: Calculate weighted average (recency weighting)
  let baselineOneRm = calculateWeightedAverage(recentSets, oneRmEstimates, referenceDate);
  
  // Step 4: Get most recent tested 1RM for calibration and hard reset
  const mostRecentTested1Rm = getMostRecentTestedOneRm(testedOneRms);
  
  // Step 5: Apply calibration factor
  const calibrationFactor = calculateCalibrationFactor(mostRecentTested1Rm, baselineOneRm);
  baselineOneRm = applyCalibration(baselineOneRm, calibrationFactor);
  
  // Step 6: Apply hard reset toward tested 1RM
  baselineOneRm = applyHardReset(baselineOneRm, mostRecentTested1Rm, referenceDate);
  
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


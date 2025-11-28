import type { BenchSet, TestedOneRm, UserProfile, UncertaintyRange, LiftType } from '../domain';
import { estimate1RmFromSet, estimate1RmFromSets } from './repTo1Rm';
import { filterSetsByLiftTypeAndDateRange, filterSetsByDateRange, getMostRecentTestedOneRmByLiftType } from './dateFiltering';
import { calculateWeightedAverage } from './weighting';
import { calculateCalibrationFactor, applyCalibration } from './personalization';
import { applyHardReset } from './hardReset';
import { calculateUncertaintyRange, calculateConfidenceLevel } from './uncertainty';

/**
 * Parameters for estimating baseline 1RM
 * 
 * PER-LIFT INDEPENDENCE RULE: liftType is REQUIRED. All sets and tested 1RMs
 * will be filtered by liftType to ensure per-lift independence. Each liftType
 * has its own baseline 1RM, calibration factor, and history trend.
 * 
 * GUARDRAIL (B2.2.4):
 * - No assumptions of bench-only logic
 * - liftType must always be specified (no default)
 * - All filtering happens via liftType in application logic
 */
export interface EstimateBaselineOneRmParams {
  /** Type of lift to estimate (bench, squat, or deadlift) - REQUIRED for independence */
  liftType: LiftType;
  /** Bench sets to use for estimation (will be filtered by liftType) */
  benchSets: BenchSet[];
  /** Tested 1RMs for calibration and hard reset (will be filtered by liftType) */
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
 * PER-LIFT INDEPENDENCE RULE: This function filters all sets and tested 1RMs
 * by liftType to ensure per-lift independence. Each liftType has its own:
 * - Baseline 1RM (calculated only from sets of that liftType)
 * - Calibration factor (calculated only from tested 1RMs of that liftType)
 * - History trend (filtered by liftType)
 * - Strength category (calculated independently per liftType)
 * 
 * Algorithm:
 * 1. Filter bench sets by liftType AND to last 90 days (GUARDRAIL: ensures independence)
 * 2. Convert each set to 1RM estimate using Epley-style formula with RIR
 * 3. Calculate weighted average (more recent sets weighted higher)
 * 4. Apply calibration factor if tested 1RMs exist (filtered by liftType)
 * 5. Apply hard reset toward most recent tested 1RM if available (filtered by liftType)
 * 6. Calculate uncertainty range and confidence level
 * 
 * @param params - Estimation parameters (liftType is REQUIRED)
 * @returns Baseline 1RM estimate with uncertainty and confidence
 */
export function estimateBaselineOneRm(
  params: EstimateBaselineOneRmParams
): BaselineOneRmEstimate {
  const { liftType, benchSets, testedOneRms, profile, referenceDate = new Date() } = params;
  
  // GUARDRAIL: Step 1 - Filter sets by liftType AND date range to ensure per-lift independence
  const recentSets = filterSetsByLiftTypeAndDateRange(benchSets, liftType, 90, referenceDate);
  
  // If no sets available, return default estimate
  if (recentSets.length === 0) {
    return {
      baselineOneRm: 0,
      uncertaintyRange: { low: 0, high: 0 },
      confidenceLevel: 0.0,
    };
  }
  
  // GUARDRAIL: Step 2 - Get most recent tested 1RM filtered by liftType to ensure per-lift independence
  const mostRecentTested1Rm = getMostRecentTestedOneRmByLiftType(testedOneRms, liftType);
  
  // Step 3: Convert each set to 1RM estimate
  const oneRmEstimates = estimate1RmFromSets(recentSets);
  
  // Step 4: Calculate weighted average (recency weighting)
  let baselineOneRm = calculateWeightedAverage(recentSets, oneRmEstimates, referenceDate);
  
  // Step 5: If we have a tested 1RM that's recent, use it as the primary baseline
  // Only update it if workout data shows clear improvement (>10% higher)
  if (mostRecentTested1Rm !== null) {
    const timestamp = mostRecentTested1Rm.timestamp instanceof Date 
      ? mostRecentTested1Rm.timestamp 
      : new Date(mostRecentTested1Rm.timestamp);
    const daysAgo = (referenceDate.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
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
  
  // Step 7: Calculate uncertainty range (recentSets already filtered by liftType)
  const recentSetCount = filterSetsByDateRange(recentSets, 60, referenceDate).length;
  const olderSetCount = recentSets.length - recentSetCount;
  const uncertaintyRange = calculateUncertaintyRange(
    baselineOneRm,
    oneRmEstimates,
    recentSetCount
  );
  
  // Step 8: Calculate confidence level
  const tested1RmDaysAgo = mostRecentTested1Rm
    ? (referenceDate.getTime() - (mostRecentTested1Rm.timestamp instanceof Date 
        ? mostRecentTested1Rm.timestamp 
        : new Date(mostRecentTested1Rm.timestamp)).getTime()) / (1000 * 60 * 60 * 24)
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


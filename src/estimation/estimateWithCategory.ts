import type { BenchSet, TestedOneRm, UserProfile, StrengthCategory, LiftType } from '../domain';
import { getProfileSex } from '../domain';
import { estimateBaselineOneRm, type BaselineOneRmEstimate } from './estimateBaselineOneRm';
import { getStrengthCategoryForGender } from './strengthCategory';

/**
 * High-level estimation result including baseline 1RM and strength category.
 * 
 * This is the main result type that Dashboard and History screens should use.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each result is specific to a single liftType.
 * Visualizations must filter by liftType to show per-lift results.
 */
export interface EstimationResult {
  /** Type of lift this estimate is for */
  liftType: LiftType;
  /** Baseline 1RM estimate */
  baselineOneRm: number;
  /** Uncertainty range */
  uncertaintyRange: { low: number; high: number };
  /** Confidence level (0.0 to 1.0) */
  confidenceLevel: number;
  /** Strength category based on 1RM/bodyweight ratio and gender */
  strengthCategory: StrengthCategory;
}

/**
 * Estimates baseline 1RM and determines strength category.
 * 
 * PER-LIFT INDEPENDENCE RULE: liftType is REQUIRED. All sets and tested 1RMs
 * will be filtered by liftType to ensure per-lift independence. Each liftType
 * has its own baseline 1RM, calibration factor, history trend, and strength category.
 * 
 * This is the high-level function that Dashboard and History screens should call.
 * It combines baseline estimation with strength category determination.
 * 
 * FUTURE-PROOFING PRINCIPLE: This function accepts liftType as a parameter.
 * All new APIs must accept liftType to support multi-lift functionality.
 * 
 * @param liftType - Type of lift to estimate (bench, squat, or deadlift) - REQUIRED
 * @param benchSets - Array of bench sets (will be filtered by liftType)
 * @param testedOneRms - Array of tested 1RMs (will be filtered by liftType)
 * @param profile - User profile (must include bodyweight and gender)
 * @param referenceDate - Optional reference date (default: now)
 * @returns Complete estimation result with strength category
 */
export function estimateOneRmWithCategory(
  liftType: LiftType,
  benchSets: BenchSet[],
  testedOneRms: TestedOneRm[],
  profile: UserProfile,
  referenceDate?: Date
): EstimationResult {
  // Estimate baseline 1RM (filters by liftType internally)
  const estimate: BaselineOneRmEstimate = estimateBaselineOneRm({
    liftType,
    benchSets,
    testedOneRms,
    profile,
    referenceDate,
  });
  
  // Determine strength category
  // If baseline 1RM is 0, try to use the most recent tested 1RM for category calculation
  // GUARDRAIL: Filter tested 1RMs by liftType to ensure per-lift independence
  let oneRmForCategory = estimate.baselineOneRm;
  if (oneRmForCategory <= 0) {
    const filteredByLift = testedOneRms.filter((record) => record.liftType === liftType);
    if (filteredByLift.length > 0) {
      // Sort by date and get the most recent for this liftType
      const sorted = [...filteredByLift].sort((a, b) => {
        const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      });
      oneRmForCategory = sorted[0].weight;
    }
  }
  
  // Only calculate strength category if we have a valid 1RM
  // GUARDRAIL: Pass liftType to ensure lift-specific thresholds are used
  // B3.2.1 - Use getProfileSex helper for backward compatibility
  const sexValue = getProfileSex(profile);
  const strengthCategory = oneRmForCategory > 0
    ? getStrengthCategoryForGender(
        liftType,
        oneRmForCategory,
        profile.bodyweight,
        sexValue
      )
    : {
        category: 'novice' as const,
        ratio: 0,
        minRatio: 0,
        maxRatio: 0,
      };
  
  return {
    liftType,
    baselineOneRm: estimate.baselineOneRm,
    uncertaintyRange: estimate.uncertaintyRange,
    confidenceLevel: estimate.confidenceLevel,
    strengthCategory,
  };
}


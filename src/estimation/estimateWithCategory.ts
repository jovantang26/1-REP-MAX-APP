import type { BenchSet, TestedOneRm, UserProfile, StrengthCategory } from '../domain';
import { estimateBaselineOneRm, type BaselineOneRmEstimate } from './estimateBaselineOneRm';
import { getStrengthCategoryForGender } from './strengthCategory';

/**
 * High-level estimation result including baseline 1RM and strength category.
 * 
 * This is the main result type that Dashboard and History screens should use.
 */
export interface EstimationResult {
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
 * This is the high-level function that Dashboard and History screens should call.
 * It combines baseline estimation with strength category determination.
 * 
 * @param benchSets - Array of bench sets
 * @param testedOneRms - Array of tested 1RMs
 * @param profile - User profile (must include bodyweight and gender)
 * @param referenceDate - Optional reference date (default: now)
 * @returns Complete estimation result with strength category
 */
export function estimateOneRmWithCategory(
  benchSets: BenchSet[],
  testedOneRms: TestedOneRm[],
  profile: UserProfile,
  referenceDate?: Date
): EstimationResult {
  // Estimate baseline 1RM
  const estimate: BaselineOneRmEstimate = estimateBaselineOneRm({
    benchSets,
    testedOneRms,
    profile,
    referenceDate,
  });
  
  // Determine strength category
  const strengthCategory = getStrengthCategoryForGender(
    estimate.baselineOneRm,
    profile.bodyweight,
    profile.gender
  );
  
  return {
    baselineOneRm: estimate.baselineOneRm,
    uncertaintyRange: estimate.uncertaintyRange,
    confidenceLevel: estimate.confidenceLevel,
    strengthCategory,
  };
}


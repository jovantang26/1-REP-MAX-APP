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
  // If baseline 1RM is 0, try to use the most recent tested 1RM for category calculation
  let oneRmForCategory = estimate.baselineOneRm;
  if (oneRmForCategory <= 0 && testedOneRms.length > 0) {
    // Sort by date and get the most recent
    const sorted = [...testedOneRms].sort((a, b) => {
      const dateA = a.testedAt instanceof Date ? a.testedAt : new Date(a.testedAt);
      const dateB = b.testedAt instanceof Date ? b.testedAt : new Date(b.testedAt);
      return dateB.getTime() - dateA.getTime();
    });
    oneRmForCategory = sorted[0].weight;
  }
  
  // Only calculate strength category if we have a valid 1RM
  const strengthCategory = oneRmForCategory > 0
    ? getStrengthCategoryForGender(
        oneRmForCategory,
        profile.bodyweight,
        profile.gender
      )
    : {
        category: 'novice' as const,
        ratio: 0,
        minRatio: 0,
        maxRatio: 0,
      };
  
  return {
    baselineOneRm: estimate.baselineOneRm,
    uncertaintyRange: estimate.uncertaintyRange,
    confidenceLevel: estimate.confidenceLevel,
    strengthCategory,
  };
}


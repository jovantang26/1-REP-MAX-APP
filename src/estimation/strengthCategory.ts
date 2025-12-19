import type { StrengthCategory, StrengthCategoryType, LiftType } from '../domain';
import { createStrengthCategory, calculateOneRmRatio } from '../domain';

/**
 * B2.5.1 - Per-Lift Ratio Rules
 * 
 * RULES FOR STRENGTH RATIO COMPUTATION:
 * 
 * 1. Ratio Calculation:
 *    - Formula: ratio = oneRM / bodyweight
 *    - Computed separately per liftType (bench, squat, deadlift)
 *    - Each lift has its own independent ratio calculation
 * 
 * 2. Per-Lift Independence:
 *    - Bench ratio is calculated only from bench 1RM
 *    - Squat ratio is calculated only from squat 1RM
 *    - Deadlift ratio is calculated only from deadlift 1RM
 *    - No cross-lift mixing allowed
 * 
 * 3. Threshold Structure:
 *    - Same threshold structure for all lifts (novice, intermediate, advanced, elite)
 *    - Different threshold values per lift (bench < squat < deadlift)
 *    - Gender-specific thresholds allowed (male vs female)
 * 
 * 4. Category Determination:
 *    - Compare computed ratio against lift-specific and gender-specific thresholds
 *    - Return category name (string): "novice", "intermediate", "advanced", or "elite"
 *    - No bench-only assumptions - all lifts use the same logic
 * 
 * FUTURE EXTENSIONS (B2.5.4):
 * - May evolve in Beta 3 with dynamic thresholds based on training experience
 * - May add age-based adjustments
 * - May add sport-specific categories
 */

/**
 * B2.5.1 - Strength Category Threshold Table
 * 
 * Lift-specific and gender-specific strength category thresholds.
 * 
 * Thresholds are based on 1RM to bodyweight ratios and vary significantly by lift:
 * 
 * Bench Press (typically lowest ratios):
 * - Male: Novice < 1.0x, Intermediate 1.0-1.5x, Advanced 1.5-2.0x, Elite >= 2.0x
 * - Female: Novice < 0.7x, Intermediate 0.7-1.0x, Advanced 1.0-1.3x, Elite >= 1.3x
 * 
 * Squat (moderate ratios):
 * - Male: Novice < 1.5x, Intermediate 1.5-2.0x, Advanced 2.0-2.5x, Elite >= 2.5x
 * - Female: Novice < 1.0x, Intermediate 1.0-1.5x, Advanced 1.5-2.0x, Elite >= 2.0x
 * 
 * Deadlift (highest ratios):
 * - Male: Novice < 2.0x, Intermediate 2.0-2.5x, Advanced 2.5-3.0x, Elite >= 3.0x
 * - Female: Novice < 1.5x, Intermediate 1.5-2.0x, Advanced 2.0-2.5x, Elite >= 2.5x
 * 
 * Other/Unspecified: Uses default thresholds (male) for the lift
 */
const STRENGTH_THRESHOLDS: Record<LiftType, Record<string, {
  novice: number;
  intermediate: number;
  advanced: number;
  elite: number;
}>> = {
  bench: {
    male: {
      novice: 1.0,
      intermediate: 1.5,
      advanced: 2.0,
      elite: Infinity,
    },
    female: {
      novice: 0.7,
      intermediate: 1.0,
      advanced: 1.3,
      elite: Infinity,
    },
    default: {
      novice: 1.0,
      intermediate: 1.5,
      advanced: 2.0,
      elite: Infinity,
    },
  },
  squat: {
    male: {
      novice: 1.5,
      intermediate: 2.0,
      advanced: 2.5,
      elite: Infinity,
    },
    female: {
      novice: 1.0,
      intermediate: 1.5,
      advanced: 2.0,
      elite: Infinity,
    },
    default: {
      novice: 1.5,
      intermediate: 2.0,
      advanced: 2.5,
      elite: Infinity,
    },
  },
  deadlift: {
    male: {
      novice: 2.0,
      intermediate: 2.5,
      advanced: 3.0,
      elite: Infinity,
    },
    female: {
      novice: 1.5,
      intermediate: 2.0,
      advanced: 2.5,
      elite: Infinity,
    },
    default: {
      novice: 2.0,
      intermediate: 2.5,
      advanced: 3.0,
      elite: Infinity,
    },
  },
  powerclean: {
    male: {
      novice: 1.2,
      intermediate: 1.5,
      advanced: 1.8,
      elite: Infinity,
    },
    female: {
      novice: 0.9,
      intermediate: 1.2,
      advanced: 1.5,
      elite: Infinity,
    },
    default: {
      novice: 1.2,
      intermediate: 1.5,
      advanced: 1.8,
      elite: Infinity,
    },
  },
};

/**
 * Determines strength category based on 1RM, bodyweight, gender, and lift type.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own strength category thresholds.
 * This ensures accurate categorization for bench, squat, and deadlift which have
 * very different strength standards.
 * 
 * B3.2.2 - Behavior for sex = "other":
 * - Uses default thresholds (same as male thresholds) for all lifts
 * - This ensures consistent behavior across all lifts when sex is "other"
 * - All lifts (bench, squat, deadlift) use the same pathway for "other"
 * 
 * @param liftType - Type of lift (bench, squat, or deadlift) - REQUIRED
 * @param oneRm - The 1RM in kilograms
 * @param bodyweight - The bodyweight in kilograms
 * @param gender - The user's sex/gender (used to select thresholds)
 * @returns Strength category
 */
export function determineStrengthCategoryForGender(
  liftType: LiftType,
  oneRm: number,
  bodyweight: number,
  gender: string
): StrengthCategoryType {
  const ratio = calculateOneRmRatio(oneRm, bodyweight);
  
  // Get lift-specific thresholds
  const liftThresholds = STRENGTH_THRESHOLDS[liftType];
  
  // B3.2.2 - Normalize gender string for lookup
  // For "other" or unrecognized values, falls back to default (male) thresholds
  // This ensures consistent behavior across all lifts
  const genderLower = gender.toLowerCase().trim();
  const thresholds = liftThresholds[genderLower] || liftThresholds.default;
  
  if (ratio < thresholds.novice) {
    return 'novice';
  } else if (ratio < thresholds.intermediate) {
    return 'intermediate';
  } else if (ratio < thresholds.advanced) {
    return 'advanced';
  } else {
    return 'elite';
  }
}

/**
 * Gets a strength category object for a given 1RM, bodyweight, gender, and lift type.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own strength category thresholds.
 * This ensures accurate categorization for bench, squat, and deadlift which have
 * very different strength standards.
 * 
 * B3.2.2 - Behavior for sex = "other":
 * - Uses default thresholds (same as male thresholds) for all lifts
 * - This ensures consistent behavior across all lifts when sex is "other"
 * - All lifts (bench, squat, deadlift) use the same pathway for "other"
 * 
 * @param liftType - Type of lift (bench, squat, or deadlift) - REQUIRED
 * @param oneRm - The 1RM in kilograms
 * @param bodyweight - The bodyweight in kilograms
 * @param gender - The user's sex/gender
 * @returns A StrengthCategory object with thresholds
 */
export function getStrengthCategoryForGender(
  liftType: LiftType,
  oneRm: number,
  bodyweight: number,
  gender: string
): StrengthCategory {
  const ratio = calculateOneRmRatio(oneRm, bodyweight);
  const category = determineStrengthCategoryForGender(liftType, oneRm, bodyweight, gender);
  
  // Get lift-specific thresholds
  const liftThresholds = STRENGTH_THRESHOLDS[liftType];
  
  // B3.2.2 - Get thresholds for the gender
  // For "other" or unrecognized values, falls back to default (male) thresholds
  const genderLower = gender.toLowerCase().trim();
  const thresholds = liftThresholds[genderLower] || liftThresholds.default;
  
  // Determine min/max ratios based on category
  let minRatio: number | undefined;
  let maxRatio: number | undefined;
  
  if (category === 'novice') {
    maxRatio = thresholds.novice;
  } else if (category === 'intermediate') {
    minRatio = thresholds.novice;
    maxRatio = thresholds.intermediate;
  } else if (category === 'advanced') {
    minRatio = thresholds.intermediate;
    maxRatio = thresholds.advanced;
  } else {
    // elite
    minRatio = thresholds.advanced;
  }
  
  return createStrengthCategory(category, ratio, minRatio, maxRatio);
}

/**
 * B2.5.2 - Universal Function Interface for Categories
 * B3.2.2 - Updated to support "other" sex option.
 * 
 * Creates a universal function for categorizing all lifts.
 * 
 * This function:
 * - Computes ratio internally (oneRM / bodyweight)
 * - Compares against threshold table (lift-specific and gender-specific)
 * - Returns category name as string
 * - No bench-only assumptions
 * 
 * B3.2.2 - Behavior for sex = "other":
 * - Uses default thresholds (same as male thresholds) for all lifts
 * - This ensures consistent behavior across all lifts when sex is "other"
 * - Users can still get accurate strength categories based on their performance
 * 
 * @param liftType - Type of lift (bench, squat, or deadlift) - REQUIRED
 * @param gender - User's sex/gender ("male", "female", or "other")
 * @param oneRm - The 1RM in kilograms
 * @param bodyweight - The bodyweight in kilograms
 * @returns Category label as string ("novice", "intermediate", "advanced", or "elite")
 */
export function getStrengthCategory(
  liftType: LiftType,
  gender: "male" | "female" | "other",
  oneRm: number,
  bodyweight: number
): string {
  // Compute ratio internally
  const ratio = calculateOneRmRatio(oneRm, bodyweight);
  
  // Get lift-specific thresholds
  const liftThresholds = STRENGTH_THRESHOLDS[liftType];
  
  // B3.2.2 - Get gender-specific thresholds (normalize gender string)
  // For "other", falls back to default (male) thresholds
  const genderLower = gender.toLowerCase().trim();
  const thresholds = liftThresholds[genderLower] || liftThresholds.default;
  
  // Compare against threshold table
  if (ratio < thresholds.novice) {
    return 'novice';
  } else if (ratio < thresholds.intermediate) {
    return 'intermediate';
  } else if (ratio < thresholds.advanced) {
    return 'advanced';
  } else {
    return 'elite';
  }
}

/**
 * B2.5.4 - Future Extensions Note
 * 
 * FUTURE CATEGORY-RELATED IDEAS (NOT IMPLEMENTED IN BETA 2):
 * 
 * 1. Overall Strength Score:
 *    - Combine all 3 lifts (bench + squat + deadlift) into a single score
 *    - Weighted average based on relative difficulty of each lift
 *    - Could display as "Total Strength: 2.1× BW" or similar
 * 
 * 2. Wilks / DOTS Scoring:
 *    - Powerlifting coefficient formulas (Wilks, DOTS, IPF Points)
 *    - Allows comparison across different bodyweights
 *    - Could show "Wilks Score: 350" alongside category
 * 
 * 3. Dynamic Thresholds Based on Training Experience:
 *    - Adjust thresholds based on years of training
 *    - Novice lifter with 2 years experience vs true beginner
 *    - Could use training history data to personalize thresholds
 * 
 * 4. Age-Based Adjustments:
 *    - Different thresholds for different age groups
 *    - Master's categories (40+, 50+, 60+)
 *    - Youth categories (under 18)
 * 
 * 5. Sport-Specific Categories:
 *    - Powerlifting-specific thresholds
 *    - Bodybuilding-specific thresholds
 *    - General fitness thresholds
 * 
 * 6. Progressive Category Display:
 *    - Show progress toward next category (e.g., "Intermediate (0.3× from Advanced)")
 *    - Visual progress bars
 *    - Milestone tracking
 * 
 * These ideas are documented for future consideration but not implemented in Beta 2.
 */


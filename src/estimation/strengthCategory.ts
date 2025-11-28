import type { StrengthCategory, StrengthCategoryType, LiftType } from '../domain';
import { createStrengthCategory, calculateOneRmRatio } from '../domain';

/**
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
 * Other/Unspecified: Uses male thresholds as default
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
};

/**
 * Determines strength category based on 1RM, bodyweight, gender, and lift type.
 * 
 * PER-LIFT INDEPENDENCE RULE: Each liftType has its own strength category thresholds.
 * This ensures accurate categorization for bench, squat, and deadlift which have
 * very different strength standards.
 * 
 * @param liftType - Type of lift (bench, squat, or deadlift) - REQUIRED
 * @param oneRm - The 1RM in kilograms
 * @param bodyweight - The bodyweight in kilograms
 * @param gender - The user's gender (used to select thresholds)
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
  
  // Normalize gender string for lookup
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
 * @param liftType - Type of lift (bench, squat, or deadlift) - REQUIRED
 * @param oneRm - The 1RM in kilograms
 * @param bodyweight - The bodyweight in kilograms
 * @param gender - The user's gender
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
  
  // Get thresholds for the gender
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


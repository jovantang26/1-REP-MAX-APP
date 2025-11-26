import type { StrengthCategory, StrengthCategoryType } from '../domain';
import { createStrengthCategory, calculateOneRmRatio } from '../domain';

/**
 * Gender-specific strength category thresholds for bench press.
 * 
 * Thresholds are based on 1RM to bodyweight ratios:
 * 
 * Male thresholds:
 * - Novice: < 1.0x bodyweight
 * - Intermediate: 1.0x - 1.5x bodyweight
 * - Advanced: 1.5x - 2.0x bodyweight
 * - Elite: >= 2.0x bodyweight
 * 
 * Female thresholds (typically lower):
 * - Novice: < 0.7x bodyweight
 * - Intermediate: 0.7x - 1.0x bodyweight
 * - Advanced: 1.0x - 1.3x bodyweight
 * - Elite: >= 1.3x bodyweight
 * 
 * Other/Unspecified: Uses male thresholds as default
 */
const STRENGTH_THRESHOLDS: Record<string, {
  novice: number;
  intermediate: number;
  advanced: number;
  elite: number;
}> = {
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
};

/**
 * Determines strength category based on 1RM, bodyweight, and gender.
 * 
 * @param oneRm - The 1RM in kilograms
 * @param bodyweight - The bodyweight in kilograms
 * @param gender - The user's gender (used to select thresholds)
 * @returns Strength category
 */
export function determineStrengthCategoryForGender(
  oneRm: number,
  bodyweight: number,
  gender: string
): StrengthCategoryType {
  const ratio = calculateOneRmRatio(oneRm, bodyweight);
  
  // Normalize gender string for lookup
  const genderLower = gender.toLowerCase().trim();
  const thresholds = STRENGTH_THRESHOLDS[genderLower] || STRENGTH_THRESHOLDS.default;
  
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
 * Gets a strength category object for a given 1RM, bodyweight, and gender.
 * 
 * @param oneRm - The 1RM in kilograms
 * @param bodyweight - The bodyweight in kilograms
 * @param gender - The user's gender
 * @returns A StrengthCategory object with thresholds
 */
export function getStrengthCategoryForGender(
  oneRm: number,
  bodyweight: number,
  gender: string
): StrengthCategory {
  const ratio = calculateOneRmRatio(oneRm, bodyweight);
  const category = determineStrengthCategoryForGender(oneRm, bodyweight, gender);
  
  // Get thresholds for the gender
  const genderLower = gender.toLowerCase().trim();
  const thresholds = STRENGTH_THRESHOLDS[genderLower] || STRENGTH_THRESHOLDS.default;
  
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


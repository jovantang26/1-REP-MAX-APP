/**
 * StrengthCategory represents the user's strength level based on their 1RM
 * relative to their bodyweight.
 * 
 * Categories are typically defined by the ratio of 1RM to bodyweight:
 * - Novice: Lower ratios
 * - Intermediate: Moderate ratios
 * - Advanced: Higher ratios
 * - Elite: Very high ratios
 * 
 * The exact thresholds may vary by gender and other factors.
 */

export type StrengthCategoryType = 'novice' | 'intermediate' | 'advanced' | 'elite';

export interface StrengthCategory {
  /** The category type */
  category: StrengthCategoryType;
  
  /** The 1RM to bodyweight ratio that defines this category */
  ratio: number;
  
  /** Optional: Minimum ratio for this category */
  minRatio?: number;
  
  /** Optional: Maximum ratio for this category */
  maxRatio?: number;
}

/**
 * Creates a new StrengthCategory.
 * @param category - The category type
 * @param ratio - The 1RM to bodyweight ratio
 * @param minRatio - Optional minimum ratio
 * @param maxRatio - Optional maximum ratio
 * @returns A StrengthCategory object
 */
export function createStrengthCategory(
  category: StrengthCategoryType,
  ratio: number,
  minRatio?: number,
  maxRatio?: number
): StrengthCategory {
  if (ratio <= 0) {
    throw new Error('Ratio must be a positive number');
  }
  
  if (minRatio !== undefined && minRatio < 0) {
    throw new Error('MinRatio must be non-negative');
  }
  
  if (maxRatio !== undefined && maxRatio < 0) {
    throw new Error('MaxRatio must be non-negative');
  }
  
  if (minRatio !== undefined && maxRatio !== undefined && minRatio > maxRatio) {
    throw new Error('MinRatio must be less than or equal to maxRatio');
  }
  
  return {
    category,
    ratio,
    minRatio,
    maxRatio,
  };
}

/**
 * Calculates the 1RM to bodyweight ratio.
 * @param oneRm - The 1RM in kilograms
 * @param bodyweight - The bodyweight in kilograms
 * @returns The ratio (1RM / bodyweight)
 */
export function calculateOneRmRatio(oneRm: number, bodyweight: number): number {
  if (typeof bodyweight !== 'number' || isNaN(bodyweight) || !isFinite(bodyweight) || bodyweight <= 0) {
    throw new Error('Bodyweight must be a positive number');
  }
  
  if (typeof oneRm !== 'number' || isNaN(oneRm) || !isFinite(oneRm) || oneRm <= 0) {
    throw new Error('1RM must be a positive number');
  }
  
  return oneRm / bodyweight;
}

/**
 * Determines the strength category based on 1RM to bodyweight ratio.
 * Uses common thresholds (these can be adjusted based on specific requirements):
 * - Novice: < 1.0x bodyweight
 * - Intermediate: 1.0x - 1.5x bodyweight
 * - Advanced: 1.5x - 2.0x bodyweight
 * - Elite: >= 2.0x bodyweight
 * 
 * @param ratio - The 1RM to bodyweight ratio
 * @returns The corresponding strength category
 */
export function determineStrengthCategory(ratio: number): StrengthCategoryType {
  if (ratio < 1.0) {
    return 'novice';
  } else if (ratio < 1.5) {
    return 'intermediate';
  } else if (ratio < 2.0) {
    return 'advanced';
  } else {
    return 'elite';
  }
}

/**
 * Gets a strength category object for a given 1RM and bodyweight.
 * @param oneRm - The 1RM in kilograms
 * @param bodyweight - The bodyweight in kilograms
 * @returns A StrengthCategory object
 */
export function getStrengthCategory(oneRm: number, bodyweight: number): StrengthCategory {
  const ratio = calculateOneRmRatio(oneRm, bodyweight);
  const category = determineStrengthCategory(ratio);
  
  // Define thresholds for each category
  const thresholds: Record<StrengthCategoryType, { min?: number; max?: number }> = {
    novice: { max: 1.0 },
    intermediate: { min: 1.0, max: 1.5 },
    advanced: { min: 1.5, max: 2.0 },
    elite: { min: 2.0 },
  };
  
  const threshold = thresholds[category];
  
  return createStrengthCategory(
    category,
    ratio,
    threshold.min,
    threshold.max
  );
}

/**
 * Type guard to check if an object is a valid StrengthCategory
 */
export function isStrengthCategory(obj: unknown): obj is StrengthCategory {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const cat = obj as Record<string, unknown>;
  
  const validCategories: StrengthCategoryType[] = ['novice', 'intermediate', 'advanced', 'elite'];
  
  return (
    typeof cat.category === 'string' &&
    validCategories.includes(cat.category as StrengthCategoryType) &&
    typeof cat.ratio === 'number' &&
    cat.ratio > 0 &&
    (cat.minRatio === undefined || typeof cat.minRatio === 'number') &&
    (cat.maxRatio === undefined || typeof cat.maxRatio === 'number')
  );
}


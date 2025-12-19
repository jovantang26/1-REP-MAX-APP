/**
 * B3.1.2 - Unit Conversion Utilities
 * 
 * Conversion helpers for weight units (kg ↔ lbs).
 * 
 * IMPORTANT RULES:
 * - All internal storage and calculations remain in kilograms (kg)
 * - All persistence writes must convert user input lbs → kg
 * - Existing stored data (already in kg) remains valid
 * - Rounding: Use 2 decimal places for precision (0.01 kg = ~0.02 lbs)
 * 
 * Conversion formula:
 * - lbs to kg: kg = lbs / 2.20462262185
 * - kg to lbs: lbs = kg * 2.20462262185
 */

/**
 * Conversion factor: 1 pound = 2.20462262185 kilograms (inverse)
 */
const LBS_TO_KG_FACTOR = 1 / 2.20462262185;
const KG_TO_LBS_FACTOR = 2.20462262185;

/**
 * B3.1.2 - Converts pounds to kilograms.
 * 
 * Rounds to 2 decimal places for precision.
 * 
 * @param lbs - Weight in pounds
 * @returns Weight in kilograms (rounded to 2 decimal places)
 * @throws Error if lbs is not a positive number
 */
export function lbsToKg(lbs: number): number {
  if (typeof lbs !== 'number' || isNaN(lbs) || !isFinite(lbs) || lbs <= 0) {
    throw new Error('lbs must be a positive number');
  }

  const kg = lbs * LBS_TO_KG_FACTOR;
  // Round to 2 decimal places
  return Math.round(kg * 100) / 100;
}

/**
 * B3.1.2 - Converts kilograms to pounds.
 * 
 * Rounds to 2 decimal places for precision.
 * 
 * @param kg - Weight in kilograms
 * @returns Weight in pounds (rounded to 2 decimal places)
 * @throws Error if kg is not a positive number
 */
export function kgToLbs(kg: number): number {
  if (typeof kg !== 'number' || isNaN(kg) || !isFinite(kg) || kg <= 0) {
    throw new Error('kg must be a positive number');
  }

  const lbs = kg * KG_TO_LBS_FACTOR;
  // Round to 2 decimal places
  return Math.round(lbs * 100) / 100;
}


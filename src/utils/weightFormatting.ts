import type { UnitSystem } from '../domain';
import { kgToLbs, lbsToKg } from './unitConversion';

/**
 * B3.1.3 - Weight Formatting Utilities
 * 
 * Formatting and parsing layer for weight display and input.
 * 
 * IMPORTANT: All internal logic and storage remains in kg.
 * These functions only handle display/input conversion based on user's unit preference.
 */

/**
 * B3.1.3 - Formats a weight value for display based on unit system.
 * 
 * Converts kg to the selected unit system and formats for display.
 * 
 * @param kg - Weight in kilograms (internal storage value)
 * @param unitSystem - The unit system to display in ("kg" or "lbs")
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted weight string (e.g., "100.0 kg" or "220.5 lbs")
 */
export function formatWeight(kg: number, unitSystem: UnitSystem, decimals: number = 1): string {
  if (typeof kg !== 'number' || isNaN(kg) || !isFinite(kg) || kg <= 0) {
    return '0.0';
  }

  if (unitSystem === 'kg') {
    return kg.toFixed(decimals);
  } else {
    // Convert to lbs
    const lbs = kgToLbs(kg);
    return lbs.toFixed(decimals);
  }
}

/**
 * B3.1.3 - Formats a weight value as a number (no unit label) for display.
 * 
 * Converts kg to the selected unit system and returns as number.
 * Useful for input fields that need numeric values.
 * 
 * @param kg - Weight in kilograms (internal storage value)
 * @param unitSystem - The unit system to display in ("kg" or "lbs")
 * @returns Weight value in the selected unit system
 */
export function formatWeightAsNumber(kg: number, unitSystem: UnitSystem): number {
  if (typeof kg !== 'number' || isNaN(kg) || !isFinite(kg) || kg <= 0) {
    return 0;
  }

  if (unitSystem === 'kg') {
    return kg;
  } else {
    return kgToLbs(kg);
  }
}

/**
 * B3.1.3 - Parses user input weight and converts to kg for storage.
 * 
 * Takes the user's input value (in their selected unit system) and converts
 * it to kg for internal storage and calculations.
 * 
 * @param displayValue - The weight value entered by the user (in their selected unit)
 * @param unitSystem - The unit system the user entered the value in ("kg" or "lbs")
 * @returns Weight in kilograms (for storage and calculations)
 * @throws Error if displayValue is invalid
 */
export function parseWeightInput(displayValue: number | string, unitSystem: UnitSystem): number {
  // Convert to number if string
  const numValue = typeof displayValue === 'string' ? parseFloat(displayValue) : displayValue;

  if (isNaN(numValue) || !isFinite(numValue) || numValue <= 0) {
    throw new Error('Weight must be a positive number');
  }

  if (unitSystem === 'kg') {
    // Already in kg, return as-is
    return numValue;
  } else {
    // Convert lbs to kg
    return lbsToKg(numValue);
  }
}

/**
 * B3.1.3 - Gets the unit label for display.
 * 
 * @param unitSystem - The unit system
 * @returns Unit label string ("kg" or "lbs")
 */
export function getUnitLabel(unitSystem: UnitSystem): string {
  return unitSystem;
}


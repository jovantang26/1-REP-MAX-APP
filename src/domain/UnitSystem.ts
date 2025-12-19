/**
 * B3.1.1 - Unit System
 * 
 * Defines the unit system preference for weight display.
 * 
 * IMPORTANT: All internal storage and calculations remain in kilograms (kg).
 * Unit system is only used for display and user input parsing.
 */

export type UnitSystem = "kg" | "lbs";

/**
 * Type guard to check if a value is a valid UnitSystem
 */
export function isUnitSystem(value: unknown): value is UnitSystem {
  return value === "kg" || value === "lbs";
}


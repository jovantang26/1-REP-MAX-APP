/**
 * B2.1.1 - Supported Lifts & Naming
 * 
 * Defines supported lifts and naming conventions for the multi-lift app.
 * 
 * FUTURE EXPANDABILITY: This can be extended to include:
 * - Overhead Press
 * - Front Squat
 * - Sumo Deadlift
 * - Other variations
 */

/**
 * Supported lift types in the application.
 * 
 * B2.1.1: Currently supports bench, squat, and deadlift.
 * B3.5.1: Added powerclean to supported lifts.
 * Future lifts can be added here without breaking existing code.
 */
export type LiftType = "bench" | "squat" | "deadlift" | "powerclean";

/**
 * B2.1.1 - UI Display Names
 * B3.5.1 - Added Power Clean display name.
 * 
 * Maps lift types to their user-friendly display names.
 * 
 * Display names:
 * - bench → "Bench Press"
 * - squat → "Back Squat"
 * - deadlift → "Deadlift (Conventional)"
 * - powerclean → "Power Clean"
 */
export const LIFT_DISPLAY_NAMES: Record<LiftType, string> = {
  bench: "Bench Press",
  squat: "Back Squat",
  deadlift: "Deadlift (Conventional)",
  powerclean: "Power Clean",
};

/**
 * Gets the display name for a lift type.
 * @param liftType - The lift type
 * @returns The display name for the lift
 */
export function getLiftDisplayName(liftType: LiftType): string {
  return LIFT_DISPLAY_NAMES[liftType];
}

/**
 * Type guard to check if a value is a valid LiftType.
 * B3.5.1 - Updated to include powerclean.
 * @param value - Value to check
 * @returns true if value is a valid LiftType
 */
export function isLiftType(value: unknown): value is LiftType {
  return (
    typeof value === 'string' &&
    (value === 'bench' || value === 'squat' || value === 'deadlift' || value === 'powerclean')
  );
}


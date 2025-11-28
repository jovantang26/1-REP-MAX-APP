/**
 * LiftType represents the supported types of lifts in the application.
 * 
 * Each lift type is treated independently:
 * - Each has its own baseline 1RM
 * - Each has its own calibration factor
 * - Each has its own history trend
 * - Each has its own strength category
 * 
 * IMPORTANT: All estimation, storage, and visualization logic must filter
 * by liftType to prevent cross-lift contamination.
 * 
 * Future expandability: This type can be extended to include:
 * - "overhead_press" (Overhead Press)
 * - "barbell_row" (Barbell Row)
 * - "front_squat" (Front Squat)
 * - "sumo_deadlift" (Sumo Deadlift)
 * - And other variations as needed
 */
export type LiftType = "bench" | "squat" | "deadlift";

/**
 * Display names for each lift type, used in the UI.
 * 
 * These are the user-friendly names shown to users throughout the application.
 */
export const LIFT_DISPLAY_NAMES: Record<LiftType, string> = {
  bench: "Bench Press",
  squat: "Back Squat",
  deadlift: "Deadlift (Conventional)",
} as const;

/**
 * Gets the display name for a given lift type.
 * @param liftType - The lift type
 * @returns The user-friendly display name
 */
export function getLiftDisplayName(liftType: LiftType): string {
  return LIFT_DISPLAY_NAMES[liftType];
}

/**
 * Type guard to check if a string is a valid LiftType
 */
export function isLiftType(value: unknown): value is LiftType {
  return typeof value === 'string' && (value === 'bench' || value === 'squat' || value === 'deadlift');
}


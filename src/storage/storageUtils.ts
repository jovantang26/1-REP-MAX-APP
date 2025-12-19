/**
 * Storage utilities for localStorage operations
 * 
 * Provides helper functions for serialization/deserialization
 * and date handling for local storage.
 * 
 * STORAGE SCHEMA STRATEGY (B2.2.2):
 * - One shared collection for all sets → TRAINING_SETS (all lift types)
 * - One shared collection for all tested 1RMs → TESTED_ONE_RMS (all lift types)
 * - Filtering by liftType happens in logic, NOT in storage
 * 
 * GUARDRAILS:
 * - Do NOT create per-lift storage keys (e.g., no "bench_sets", "squat_sets", etc.)
 * - All writes must include liftType field
 * - All reads must filter by liftType in application logic
 */

/**
 * Storage keys used throughout the application.
 * 
 * IMPORTANT: These are shared collections for ALL lift types.
 * Do not create per-lift storage keys. Filtering by liftType
 * happens in application logic, not in storage structure.
 */
export const STORAGE_KEYS = {
  PROFILE: '1rm_app_profile',
  /** Shared collection for all training sets (bench, squat, deadlift) */
  TRAINING_SETS: '1rm_app_training_sets',
  /** Legacy key for backward compatibility - maps to TRAINING_SETS */
  BENCH_SETS: '1rm_app_bench_sets',
  /** Shared collection for all tested 1RMs (bench, squat, deadlift) */
  TESTED_ONE_RMS: '1rm_app_tested_one_rms',
  /** B3.5.1 - Shared collection for all tested PR anchors (best tested 1RM per lift) */
  TESTED_PR_ANCHORS: '1rm_app_tested_pr_anchors',
  /** Shared collection for all 1RM estimates (bench, squat, deadlift) */
  ONE_RM_ESTIMATES: '1rm_app_one_rm_estimates',
  /** Migration flag to track if data migration has been completed */
  MIGRATION_COMPLETE: '1rm_app_migration_complete',
  /** User preferences (unit system, etc.) */
  PREFERENCES: '1rm_app_preferences',
} as const;

/**
 * Converts a Date object to an ISO string for storage
 */
export function serializeDate(date: Date | string): string {
  if (date instanceof Date) {
    return date.toISOString();
  }
  return date;
}

/**
 * Converts an ISO string back to a Date object
 */
export function deserializeDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Safely gets an item from localStorage
 * Returns null if the item doesn't exist or parsing fails
 */
export function getStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Safely sets an item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    throw error;
  }
}

/**
 * Removes an item from localStorage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}


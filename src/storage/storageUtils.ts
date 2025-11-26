/**
 * Storage utilities for localStorage operations
 * 
 * Provides helper functions for serialization/deserialization
 * and date handling for local storage.
 */

/**
 * Storage keys used throughout the application
 */
export const STORAGE_KEYS = {
  PROFILE: '1rm_app_profile',
  BENCH_SETS: '1rm_app_bench_sets',
  TESTED_ONE_RMS: '1rm_app_tested_one_rms',
  ONE_RM_ESTIMATES: '1rm_app_one_rm_estimates',
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


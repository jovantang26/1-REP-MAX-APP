/**
 * B2.6.2 - Debug Helpers Spec
 * 
 * Dev-only helpers to inspect and reset multi-lift data.
 * 
 * IMPORTANT: These helpers must NEVER run in production builds.
 * Add them behind a dev flag or separate debug screen.
 * 
 * Required debug helpers:
 * - logStorageState() - Logs total sets + breakdown per lift
 * - clearAllStorage() - Wipes app storage during development
 * - logLiftCounts(liftType) - Optional: logs per-lift counts
 */

import type { LiftType } from '../domain';
import { STORAGE_KEYS, getStorageItem } from './storageUtils';
import { benchSetRepository } from './BenchSetRepository';
import { testedOneRmRepository } from './TestedOneRmRepository';

/**
 * Checks if we're in development mode.
 * In production, debug helpers should be disabled.
 */
function isDevMode(): boolean {
  // Check for common dev indicators
  return (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     process.env.NODE_ENV === 'development')
  );
}

/**
 * B2.6.2 - Logs total sets + breakdown per lift.
 * 
 * Logs:
 * - Total number of training sets
 * - Breakdown by liftType (bench, squat, deadlift)
 * - Total number of tested 1RMs
 * - Breakdown of tested 1RMs by liftType
 * 
 * DEV MODE ONLY: This function only works in development.
 */
export function logStorageState(): void {
  if (!isDevMode()) {
    console.warn('logStorageState() is only available in development mode');
    return;
  }

  console.group('📊 Storage State (Debug)');
  
  // Log training sets
  const allSets = getStorageItem<unknown[]>(STORAGE_KEYS.TRAINING_SETS) ||
                  getStorageItem<unknown[]>(STORAGE_KEYS.BENCH_SETS) ||
                  [];
  
  // B3.5.1 - Include powerclean in counts
  const setsByLift: Record<LiftType, number> = {
    bench: 0,
    squat: 0,
    deadlift: 0,
    powerclean: 0,
  };
  
  let setsWithoutLiftType = 0;
  
  if (Array.isArray(allSets)) {
    for (const set of allSets) {
      if (set && typeof set === 'object') {
        const setObj = set as any;
        const liftType = setObj.liftType;
        if (liftType === 'bench' || liftType === 'squat' || liftType === 'deadlift' || liftType === 'powerclean') {
          setsByLift[liftType as LiftType]++;
        } else {
          setsWithoutLiftType++;
        }
      }
    }
  }
  
  console.log('Training Sets:');
  console.log(`  Total: ${Array.isArray(allSets) ? allSets.length : 0}`);
  console.log(`  Bench: ${setsByLift.bench}`);
  console.log(`  Squat: ${setsByLift.squat}`);
  console.log(`  Deadlift: ${setsByLift.deadlift}`);
  console.log(`  Power Clean: ${setsByLift.powerclean}`);
  if (setsWithoutLiftType > 0) {
    console.warn(`  ⚠️  Missing liftType: ${setsWithoutLiftType} (needs migration)`);
  }
  
  // Log tested 1RMs
  const allTested = getStorageItem<unknown[]>(STORAGE_KEYS.TESTED_ONE_RMS) || [];
  
  // B3.5.1 - Include powerclean in counts
  const testedByLift: Record<LiftType, number> = {
    bench: 0,
    squat: 0,
    deadlift: 0,
    powerclean: 0,
  };
  
  let testedWithoutLiftType = 0;
  
  if (Array.isArray(allTested)) {
    for (const tested of allTested) {
      if (tested && typeof tested === 'object') {
        const testedObj = tested as any;
        const liftType = testedObj.liftType;
        if (liftType === 'bench' || liftType === 'squat' || liftType === 'deadlift' || liftType === 'powerclean') {
          testedByLift[liftType as LiftType]++;
        } else {
          testedWithoutLiftType++;
        }
      }
    }
  }
  
  console.log('Tested 1RMs:');
  console.log(`  Total: ${Array.isArray(allTested) ? allTested.length : 0}`);
  console.log(`  Bench: ${testedByLift.bench}`);
  console.log(`  Squat: ${testedByLift.squat}`);
  console.log(`  Deadlift: ${testedByLift.deadlift}`);
  console.log(`  Power Clean: ${testedByLift.powerclean}`);
  if (testedWithoutLiftType > 0) {
    console.warn(`  ⚠️  Missing liftType: ${testedWithoutLiftType} (needs migration)`);
  }
  
  // Log profile
  const profile = getStorageItem(STORAGE_KEYS.PROFILE);
  console.log('Profile:', profile ? '✅ Exists' : '❌ Missing');
  
  // Log migration status
  const migrationComplete = getStorageItem<boolean>(STORAGE_KEYS.MIGRATION_COMPLETE);
  console.log('Migration Status:', migrationComplete ? '✅ Complete' : '❌ Not completed');
  
  console.groupEnd();
}

/**
 * B2.6.2 - Logs per-lift counts for a specific liftType.
 * 
 * @param liftType - The lift type to count (bench, squat, or deadlift)
 * 
 * DEV MODE ONLY: This function only works in development.
 */
export function logLiftCounts(liftType: LiftType): void {
  if (!isDevMode()) {
    console.warn('logLiftCounts() is only available in development mode');
    return;
  }

  console.group(`📊 ${liftType.toUpperCase()} Counts (Debug)`);
  
  // Count sets for this lift
  const allSets = getStorageItem<unknown[]>(STORAGE_KEYS.TRAINING_SETS) ||
                  getStorageItem<unknown[]>(STORAGE_KEYS.BENCH_SETS) ||
                  [];
  
  let setCount = 0;
  if (Array.isArray(allSets)) {
    for (const set of allSets) {
      if (set && typeof set === 'object') {
        const setObj = set as any;
        if (setObj.liftType === liftType) {
          setCount++;
        }
      }
    }
  }
  
  console.log(`Training Sets: ${setCount}`);
  
  // Count tested 1RMs for this lift
  const allTested = getStorageItem<unknown[]>(STORAGE_KEYS.TESTED_ONE_RMS) || [];
  
  let testedCount = 0;
  if (Array.isArray(allTested)) {
    for (const tested of allTested) {
      if (tested && typeof tested === 'object') {
        const testedObj = tested as any;
        if (testedObj.liftType === liftType) {
          testedCount++;
        }
      }
    }
  }
  
  console.log(`Tested 1RMs: ${testedCount}`);
  
  console.groupEnd();
}

/**
 * B2.6.2 - Wipes all app storage during development.
 * 
 * WARNING: This will delete ALL user data including:
 * - All training sets
 * - All tested 1RMs
 * - All 1RM estimates
 * - User profile
 * - Migration flags
 * 
 * DEV MODE ONLY: This function only works in development.
 * 
 * @param confirm - Must be true to actually clear storage (safety check)
 */
export function clearAllStorage(confirm: boolean = false): void {
  if (!isDevMode()) {
    console.warn('clearAllStorage() is only available in development mode');
    return;
  }

  if (!confirm) {
    console.warn('⚠️  clearAllStorage() requires confirm=true to prevent accidental data loss');
    console.warn('   Usage: clearAllStorage(true)');
    return;
  }

  console.group('🗑️  Clearing All Storage (Debug)');
  
  try {
    // Clear all storage keys
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      console.log(`  Cleared: ${key}`);
    });
    
    console.log('✅ All storage cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
  }
  
  console.groupEnd();
}


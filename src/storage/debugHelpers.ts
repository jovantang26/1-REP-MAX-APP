/**
 * B2.6.2 - Debug Helpers for Development
 * 
 * Provides simple dev-only helpers to inspect and reset multi-lift data.
 * 
 * IMPORTANT: These helpers must NEVER run in production builds.
 * They are only available in development mode.
 * 
 * Usage:
 * - Import in dev-only code paths
 * - Use behind development flags
 * - Access via browser console in dev mode
 */

import type { LiftType } from '../domain';
import { STORAGE_KEYS, getStorageItem, removeStorageItem } from './storageUtils';
import { benchSetRepository } from './BenchSetRepository';
import { testedOneRmRepository } from './TestedOneRmRepository';

/**
 * Checks if we're in development mode.
 * 
 * In production builds, this should return false.
 */
function isDevelopmentMode(): boolean {
  // Check for development indicators
  try {
    return (
      process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && window.location.hostname === 'localhost')
    );
  } catch {
    return false;
  }
}

/**
 * B2.6.2 - Logs total sets + breakdown per lift.
 * 
 * This function:
 * - Logs total number of training sets
 * - Breaks down sets by liftType (bench, squat, deadlift)
 * - Logs total number of tested 1RMs
 * - Breaks down tested 1RMs by liftType
 * 
 * DEV ONLY: Never runs in production.
 */
export function logStorageState(): void {
  if (!isDevelopmentMode()) {
    console.warn('logStorageState() is only available in development mode');
    return;
  }

  console.group('📊 Storage State (Dev Only)');
  
  try {
    // Get all training sets
    const allSets = getStorageItem<any[]>(STORAGE_KEYS.TRAINING_SETS) || 
                    getStorageItem<any[]>(STORAGE_KEYS.BENCH_SETS) || [];
    
    // Count by liftType
    const setsByLift: Record<LiftType, number> = {
      bench: 0,
      squat: 0,
      deadlift: 0,
    };
    
    let setsWithoutLiftType = 0;
    
    for (const set of allSets) {
      if (set.liftType) {
        const liftType = set.liftType as LiftType;
        if (liftType === 'bench' || liftType === 'squat' || liftType === 'deadlift') {
          setsByLift[liftType]++;
        } else {
          setsWithoutLiftType++;
        }
      } else {
        setsWithoutLiftType++;
      }
    }
    
    console.log('Training Sets:');
    console.log(`  Total: ${allSets.length}`);
    console.log(`  Bench: ${setsByLift.bench}`);
    console.log(`  Squat: ${setsByLift.squat}`);
    console.log(`  Deadlift: ${setsByLift.deadlift}`);
    if (setsWithoutLiftType > 0) {
      console.warn(`  ⚠️ Sets without valid liftType: ${setsWithoutLiftType}`);
    }
    
    // Get all tested 1RMs
    const allTested = getStorageItem<any[]>(STORAGE_KEYS.TESTED_ONE_RMS) || [];
    
    // Count by liftType
    const testedByLift: Record<LiftType, number> = {
      bench: 0,
      squat: 0,
      deadlift: 0,
    };
    
    let testedWithoutLiftType = 0;
    
    for (const tested of allTested) {
      if (tested.liftType) {
        const liftType = tested.liftType as LiftType;
        if (liftType === 'bench' || liftType === 'squat' || liftType === 'deadlift') {
          testedByLift[liftType]++;
        } else {
          testedWithoutLiftType++;
        }
      } else {
        testedWithoutLiftType++;
      }
    }
    
    console.log('Tested 1RMs:');
    console.log(`  Total: ${allTested.length}`);
    console.log(`  Bench: ${testedByLift.bench}`);
    console.log(`  Squat: ${testedByLift.squat}`);
    console.log(`  Deadlift: ${testedByLift.deadlift}`);
    if (testedWithoutLiftType > 0) {
      console.warn(`  ⚠️ Tested 1RMs without valid liftType: ${testedWithoutLiftType}`);
    }
    
    // Check migration status
    const migrationComplete = getStorageItem<boolean>(STORAGE_KEYS.MIGRATION_COMPLETE);
    console.log('Migration Status:');
    console.log(`  Complete: ${migrationComplete === true ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('Error reading storage state:', error);
  }
  
  console.groupEnd();
}

/**
 * B2.6.2 - Logs per-lift counts for a specific liftType.
 * 
 * This function:
 * - Logs count of training sets for the specified lift
 * - Logs count of tested 1RMs for the specified lift
 * - Shows sample data (first few entries)
 * 
 * DEV ONLY: Never runs in production.
 * 
 * @param liftType - The lift type to inspect
 */
export function logLiftCounts(liftType: LiftType): void {
  if (!isDevelopmentMode()) {
    console.warn('logLiftCounts() is only available in development mode');
    return;
  }

  console.group(`📊 ${liftType.toUpperCase()} Lift Counts (Dev Only)`);
  
  try {
    // Get all training sets
    const allSets = getStorageItem<any[]>(STORAGE_KEYS.TRAINING_SETS) || 
                    getStorageItem<any[]>(STORAGE_KEYS.BENCH_SETS) || [];
    
    const setsForLift = allSets.filter((set) => set.liftType === liftType);
    
    console.log(`Training Sets: ${setsForLift.length}`);
    if (setsForLift.length > 0) {
      console.log('Sample sets (first 3):');
      setsForLift.slice(0, 3).forEach((set, idx) => {
        console.log(`  ${idx + 1}. ${set.weight}kg × ${set.reps} reps (RIR: ${set.rir}) - ${set.timestamp || set.performedAt}`);
      });
    }
    
    // Get all tested 1RMs
    const allTested = getStorageItem<any[]>(STORAGE_KEYS.TESTED_ONE_RMS) || [];
    
    const testedForLift = allTested.filter((tested) => tested.liftType === liftType);
    
    console.log(`Tested 1RMs: ${testedForLift.length}`);
    if (testedForLift.length > 0) {
      console.log('All tested 1RMs:');
      testedForLift.forEach((tested, idx) => {
        console.log(`  ${idx + 1}. ${tested.weight}kg - ${tested.timestamp || tested.testedAt}`);
      });
    }
    
  } catch (error) {
    console.error(`Error reading ${liftType} counts:`, error);
  }
  
  console.groupEnd();
}

/**
 * B2.6.2 - Wipes all app storage during development.
 * 
 * WARNING: This function deletes ALL app data including:
 * - Training sets
 * - Tested 1RMs
 * - 1RM estimates
 * - User profile
 * - Migration flags
 * 
 * Use with extreme caution. Only available in development mode.
 * 
 * DEV ONLY: Never runs in production.
 */
export function clearAllStorage(): void {
  if (!isDevelopmentMode()) {
    console.warn('clearAllStorage() is only available in development mode');
    return;
  }

  const confirmed = window.confirm(
    '⚠️ WARNING: This will delete ALL app data!\n\n' +
    'This includes:\n' +
    '- All training sets\n' +
    '- All tested 1RMs\n' +
    '- All estimates\n' +
    '- User profile\n' +
    '- Migration flags\n\n' +
    'Are you sure you want to continue?'
  );

  if (!confirmed) {
    console.log('Storage clear cancelled');
    return;
  }

  try {
    // Remove all storage keys
    removeStorageItem(STORAGE_KEYS.TRAINING_SETS);
    removeStorageItem(STORAGE_KEYS.BENCH_SETS);
    removeStorageItem(STORAGE_KEYS.TESTED_ONE_RMS);
    removeStorageItem(STORAGE_KEYS.ONE_RM_ESTIMATES);
    removeStorageItem(STORAGE_KEYS.PROFILE);
    removeStorageItem(STORAGE_KEYS.MIGRATION_COMPLETE);
    
    console.log('✅ All storage cleared');
    console.log('Please refresh the page to see changes');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

/**
 * Exposes debug helpers to window object in development mode only.
 * 
 * This allows calling debug functions from browser console:
 * - window.debugHelpers.logStorageState()
 * - window.debugHelpers.logLiftCounts('bench')
 * - window.debugHelpers.clearAllStorage()
 */
if (isDevelopmentMode() && typeof window !== 'undefined') {
  (window as any).debugHelpers = {
    logStorageState,
    logLiftCounts,
    clearAllStorage,
  };
  
  console.log('🔧 Debug helpers available at window.debugHelpers');
  console.log('  - logStorageState()');
  console.log('  - logLiftCounts(liftType)');
  console.log('  - clearAllStorage()');
}


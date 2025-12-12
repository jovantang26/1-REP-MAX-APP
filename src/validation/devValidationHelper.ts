/**
 * Developer helper for running validation on stored data.
 * 
 * This is a simple utility that can be called from the browser console
 * or used in a dev-only screen to validate estimation accuracy.
 * 
 * Usage in browser console:
 *   import { runValidationFromStorage } from './validation/devValidationHelper';
 *   runValidationFromStorage();
 */

import type { ValidationPair } from './validationUtils';
import { 
  computeValidationMetrics, 
  printValidationMetrics,
  exportValidationPairsToConsole,
  exportValidationPairsToJson,
} from './validationUtils';
import { estimateOneRmWithCategory } from '../estimation';
import { 
  profileRepository, 
  benchSetRepository, 
  testedOneRmRepository 
} from '../storage';

/**
 * Runs validation by comparing tested 1RMs with estimates computed
 * from bench sets available at the time of each test.
 * 
 * This function:
 * 1. Loads all tested 1RMs
 * 2. For each tested 1RM, computes what the estimate would have been
 *    using only bench sets that existed before that test
 * 3. Compares the estimate vs actual and computes metrics
 * 
 * @returns Array of validation pairs and metrics
 */
export async function runValidationFromStorage(): Promise<{
  pairs: ValidationPair[];
  metrics: ReturnType<typeof computeValidationMetrics>;
}> {
  console.log('Starting validation from storage...\n');

  // Load all data
  const [profile, allBenchSets, allTestedOneRms] = await Promise.all([
    profileRepository.getProfile(),
    benchSetRepository.getBenchSets(),
    testedOneRmRepository.getTestedOneRms(),
  ]);

  if (!profile) {
    console.error('No profile found. Please complete onboarding first.');
    return { pairs: [], metrics: computeValidationMetrics([]) };
  }

  if (allTestedOneRms.length === 0) {
    console.warn('No tested 1RMs found. Log some tested 1RMs to validate estimates.');
    return { pairs: [], metrics: computeValidationMetrics([]) };
  }

  // Sort tested 1RMs by date
  const sortedTested = [...allTestedOneRms].sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
    return dateA.getTime() - dateB.getTime();
  });

  const pairs: ValidationPair[] = [];

  // For each tested 1RM, compute what the estimate would have been
  for (const tested of sortedTested) {
    const testDate = tested.timestamp instanceof Date 
      ? tested.timestamp 
      : new Date(tested.timestamp);

    // GUARDRAIL: Filter by liftType to ensure per-lift independence
    const liftType = tested.liftType;
    
    // Get only bench sets that existed before this test AND match the liftType
    const setsBeforeTest = allBenchSets.filter(set => {
      const setDate = set.performedAt instanceof Date 
        ? set.performedAt 
        : new Date(set.performedAt);
      return setDate.getTime() < testDate.getTime() && set.liftType === liftType;
    });

    // Get only tested 1RMs that existed before this test (for calibration) AND match the liftType
    const testedBeforeTest = sortedTested.filter(t => {
      const tDate = t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp);
      return tDate.getTime() < testDate.getTime() && t.liftType === liftType;
    });

    // Compute estimate using data available at that time (filtered by liftType)
    const estimate = estimateOneRmWithCategory(
      liftType,
      setsBeforeTest,
      testedBeforeTest,
      profile,
      testDate
    );

    pairs.push({
      tested1Rm: tested.weight,
      estimated1Rm: estimate.baselineOneRm,
      testDate,
      notes: `Based on ${setsBeforeTest.length} sets and ${testedBeforeTest.length} previous tests`,
    });
  }

  // Compute metrics
  const metrics = computeValidationMetrics(pairs);

  // Print results
  printValidationMetrics(metrics);
  
  console.log('\n=== Individual Validation Pairs ===\n');
  pairs.forEach((pair, index) => {
    const error = Math.abs(pair.tested1Rm - pair.estimated1Rm);
    const percentError = (error / pair.tested1Rm) * 100;
    console.log(`${index + 1}. Tested: ${pair.tested1Rm.toFixed(1)} kg | Estimated: ${pair.estimated1Rm.toFixed(1)} kg | Error: ${error.toFixed(2)} kg (${percentError.toFixed(1)}%)`);
    if (pair.notes) {
      console.log(`   ${pair.notes}`);
    }
  });

  return { pairs, metrics };
}

/**
 * Exports validation data from storage to console as JSON.
 */
export async function exportValidationToConsole(): Promise<void> {
  const { pairs } = await runValidationFromStorage();
  exportValidationPairsToConsole(pairs);
}

/**
 * Exports validation data from storage to JSON string.
 */
export async function exportValidationToJson(): Promise<string> {
  const { pairs } = await runValidationFromStorage();
  return exportValidationPairsToJson(pairs);
}

/**
 * Validates a custom set of pairs (for manual testing).
 * 
 * @param pairs - Array of validation pairs to analyze
 */
export function validateCustomPairs(pairs: ValidationPair[]): void {
  const metrics = computeValidationMetrics(pairs);
  printValidationMetrics(metrics);
  exportValidationPairsToConsole(pairs);
}


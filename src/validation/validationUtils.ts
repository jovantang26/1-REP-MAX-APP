/**
 * Validation utilities for comparing estimated vs actual 1RMs.
 * 
 * Developer-only tools for tracking estimation accuracy during testing.
 */

/**
 * A pair of tested (actual) and estimated 1RM values for validation.
 */
export interface ValidationPair {
  /** The actual tested 1RM in kilograms */
  tested1Rm: number;
  /** The estimated 1RM in kilograms */
  estimated1Rm: number;
  /** Optional date when the test was performed */
  testDate?: Date;
  /** Optional notes about this validation point */
  notes?: string;
}

/**
 * Validation metrics computed from validation pairs.
 */
export interface ValidationMetrics {
  /** Average absolute error in kilograms */
  averageAbsoluteError: number;
  /** Average percentage error */
  averagePercentageError: number;
  /** Root mean square error in kilograms */
  rootMeanSquareError: number;
  /** Number of pairs within ±5% accuracy */
  within5Percent: number;
  /** Number of pairs within ±X kg accuracy (configurable) */
  withinXKg: number;
  /** Total number of validation pairs */
  totalPairs: number;
  /** Percentage of pairs within ±5% accuracy */
  accuracy5Percent: number;
  /** Percentage of pairs within ±X kg accuracy */
  accuracyXKg: number;
}

/**
 * Computes validation metrics from an array of validation pairs.
 * 
 * @param pairs - Array of tested vs estimated 1RM pairs
 * @param accuracyWindowKg - Optional accuracy window in kilograms (default: 5kg)
 * @returns Validation metrics
 */
export function computeValidationMetrics(
  pairs: ValidationPair[],
  accuracyWindowKg: number = 5
): ValidationMetrics {
  if (pairs.length === 0) {
    return {
      averageAbsoluteError: 0,
      averagePercentageError: 0,
      rootMeanSquareError: 0,
      within5Percent: 0,
      withinXKg: 0,
      totalPairs: 0,
      accuracy5Percent: 0,
      accuracyXKg: 0,
    };
  }

  let sumAbsoluteError = 0;
  let sumPercentageError = 0;
  let sumSquaredError = 0;
  let within5PercentCount = 0;
  let withinXKgCount = 0;

  for (const pair of pairs) {
    const error = Math.abs(pair.tested1Rm - pair.estimated1Rm);
    const percentageError = (error / pair.tested1Rm) * 100;

    sumAbsoluteError += error;
    sumPercentageError += percentageError;
    sumSquaredError += error * error;

    // Check if within ±5%
    if (percentageError <= 5) {
      within5PercentCount++;
    }

    // Check if within ±X kg
    if (error <= accuracyWindowKg) {
      withinXKgCount++;
    }
  }

  const totalPairs = pairs.length;
  const averageAbsoluteError = sumAbsoluteError / totalPairs;
  const averagePercentageError = sumPercentageError / totalPairs;
  const rootMeanSquareError = Math.sqrt(sumSquaredError / totalPairs);
  const accuracy5Percent = (within5PercentCount / totalPairs) * 100;
  const accuracyXKg = (withinXKgCount / totalPairs) * 100;

  return {
    averageAbsoluteError,
    averagePercentageError,
    rootMeanSquareError,
    within5Percent: within5PercentCount,
    withinXKg: withinXKgCount,
    totalPairs,
    accuracy5Percent,
    accuracyXKg,
  };
}

/**
 * Prints validation metrics to the console in a readable format.
 * 
 * @param metrics - Validation metrics to print
 * @param accuracyWindowKg - The accuracy window used (for display)
 */
export function printValidationMetrics(
  metrics: ValidationMetrics,
  accuracyWindowKg: number = 5
): void {
  console.log('\n=== 1RM Estimation Validation Metrics ===\n');
  console.log(`Total Validation Pairs: ${metrics.totalPairs}\n`);
  
  console.log('Error Metrics:');
  console.log(`  Average Absolute Error: ${metrics.averageAbsoluteError.toFixed(2)} kg`);
  console.log(`  Average Percentage Error: ${metrics.averagePercentageError.toFixed(2)}%`);
  console.log(`  Root Mean Square Error: ${metrics.rootMeanSquareError.toFixed(2)} kg\n`);
  
  console.log('Accuracy Windows:');
  console.log(`  Within ±5%: ${metrics.within5Percent}/${metrics.totalPairs} (${metrics.accuracy5Percent.toFixed(1)}%)`);
  console.log(`  Within ±${accuracyWindowKg} kg: ${metrics.withinXKg}/${metrics.totalPairs} (${metrics.accuracyXKg.toFixed(1)}%)\n`);
}

/**
 * Exports validation pairs to JSON format.
 * 
 * @param pairs - Array of validation pairs to export
 * @returns JSON string
 */
export function exportValidationPairsToJson(pairs: ValidationPair[]): string {
  const exportData = pairs.map(pair => ({
    tested1Rm: pair.tested1Rm,
    estimated1Rm: pair.estimated1Rm,
    testDate: pair.testDate?.toISOString() || null,
    notes: pair.notes || null,
  }));
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Exports validation pairs to console in a readable format.
 * 
 * @param pairs - Array of validation pairs to export
 */
export function exportValidationPairsToConsole(pairs: ValidationPair[]): void {
  console.log('\n=== Validation Pairs Export ===\n');
  console.log(exportValidationPairsToJson(pairs));
  console.log('\n');
}

/**
 * Validates a single pair and returns detailed error information.
 * 
 * @param pair - Validation pair to analyze
 * @returns Detailed error information
 */
export function analyzeValidationPair(pair: ValidationPair): {
  absoluteError: number;
  percentageError: number;
  within5Percent: boolean;
  withinXKg: boolean;
  overestimate: boolean;
} {
  const absoluteError = Math.abs(pair.tested1Rm - pair.estimated1Rm);
  const percentageError = (absoluteError / pair.tested1Rm) * 100;
  const within5Percent = percentageError <= 5;
  const withinXKg = absoluteError <= 5; // Default 5kg window
  const overestimate = pair.estimated1Rm > pair.tested1Rm;

  return {
    absoluteError,
    percentageError,
    within5Percent,
    withinXKg,
    overestimate,
  };
}


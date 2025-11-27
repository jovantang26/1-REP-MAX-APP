/**
 * Validation module exports for 1RM estimation accuracy tracking.
 * 
 * Developer-only tools for comparing estimated vs actual 1RMs.
 */

export type {
  ValidationPair,
  ValidationMetrics,
} from './validationUtils';

export {
  computeValidationMetrics,
  printValidationMetrics,
  exportValidationPairsToJson,
  exportValidationPairsToConsole,
  analyzeValidationPair,
} from './validationUtils';

// Dev helpers for running validation from storage
export {
  runValidationFromStorage,
  exportValidationToConsole,
  exportValidationToJson,
  validateCustomPairs,
} from './devValidationHelper';

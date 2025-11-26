/**
 * Estimation module exports for the 1RM Prediction app.
 * 
 * This module provides functions for estimating baseline 1RM,
 * calculating uncertainty, confidence, and strength categories.
 */

// Main estimation function
export {
  estimateBaselineOneRm,
  type EstimateBaselineOneRmParams,
  type BaselineOneRmEstimate,
} from './estimateBaselineOneRm';

// Rep/RIR to 1RM conversion
export {
  estimate1RmFromSet,
  estimate1RmFromSets,
} from './repTo1Rm';

// Date filtering
export {
  filterSetsByDateRange,
  filterTestedOneRmsByDateRange,
  getMostRecentTestedOneRm,
} from './dateFiltering';

// Weighting
export {
  calculateRecencyWeight,
  calculateWeightedAverage,
} from './weighting';

// Personalization
export {
  calculateCalibrationFactor,
  applyCalibration,
} from './personalization';

// Hard reset
export {
  applyHardReset,
} from './hardReset';

// Uncertainty and confidence
export {
  calculateUncertaintyRange,
  calculateConfidenceLevel,
} from './uncertainty';

// Strength category
export {
  determineStrengthCategoryForGender,
  getStrengthCategoryForGender,
} from './strengthCategory';

// High-level estimation with category
export {
  estimateOneRmWithCategory,
  type EstimationResult,
} from './estimateWithCategory';


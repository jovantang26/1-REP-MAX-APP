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
  estimateOneRMFromSet, // B2.4.1 - API alias
} from './repTo1Rm';

// B2.4.1 - Per-lift estimation API
export {
  estimateBaselineForLift,
  estimateOneRMFromSet as estimateOneRMFromSetAPI,
} from './estimateForLift';

// Date filtering
export {
  filterSetsByDateRange,
  filterSetsByLiftTypeAndDateRange,
  filterTestedOneRmsByDateRange,
  filterTestedOneRmsByLiftTypeAndDateRange,
  getMostRecentTestedOneRm,
  getMostRecentTestedOneRmByLiftType,
} from './dateFiltering';

// Weighting
export {
  calculateRecencyWeight,
  calculateWeightedAverage,
} from './weighting';

// Personalization / Calibration
export {
  calculateCalibrationFactor, // Legacy
  applyCalibration, // Legacy - applies factor directly
  applyCalibrationWithUserCalibration, // B2.4.3 - Per-lift calibration with UserCalibration
  deriveCalibration, // B2.4.3 - Per-lift calibration derivation
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
  getStrengthCategory, // B2.5.2 - Universal function interface
} from './strengthCategory';

// High-level estimation with category
export {
  estimateOneRmWithCategory,
  type EstimationResult,
} from './estimateWithCategory';


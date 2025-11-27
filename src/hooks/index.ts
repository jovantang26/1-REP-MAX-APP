/**
 * Hooks exports for the 1RM Prediction app.
 * 
 * This module exports all React hooks that encapsulate data flow
 * between the UI and storage/estimation modules.
 */

export { useUserProfile } from './useUserProfile';
export { useBenchLoggingSession } from './useBenchLoggingSession';
export { useCurrentBaselineOneRm } from './useCurrentBaselineOneRm';
export { useOneRmHistory } from './useOneRmHistory';
export type { HistoryDataPoint, HistoryStats } from './useOneRmHistory';


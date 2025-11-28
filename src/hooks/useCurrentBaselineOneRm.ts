import { useState, useEffect, useCallback } from 'react';
import type { EstimationResult } from '../estimation';
import type { LiftType } from '../domain';
import { estimateOneRmWithCategory } from '../estimation';
import { profileRepository, benchSetRepository, testedOneRmRepository } from '../storage';

/**
 * Hook for getting the current baseline 1RM estimate.
 * 
 * PER-LIFT INDEPENDENCE RULE: liftType is REQUIRED. All sets and tested 1RMs
 * are filtered by liftType to ensure per-lift independence. Each liftType has
 * its own baseline 1RM, calibration factor, history trend, and strength category.
 * 
 * FUTURE-PROOFING PRINCIPLE: This hook accepts liftType as a parameter.
 * All new hooks must accept liftType to support multi-lift functionality.
 * 
 * Reads profile, bench sets, and tested 1RMs from storage,
 * then calls the estimation module to compute the current estimate.
 * 
 * @param liftType - Type of lift to estimate (bench, squat, or deadlift) - REQUIRED
 * @returns Object with estimate result, loading state, and refresh function
 */
export function useCurrentBaselineOneRm(liftType: LiftType) {
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all necessary data
      const [profile, benchSets, testedOneRms] = await Promise.all([
        profileRepository.getProfile(),
        benchSetRepository.getBenchSets(),
        testedOneRmRepository.getTestedOneRms(),
      ]);

      // If no profile, cannot estimate
      if (!profile) {
        setResult(null);
        setLoading(false);
        return;
      }

      // GUARDRAIL: Filter sets and tested 1RMs by liftType to ensure per-lift independence
      const benchSetsByLift = benchSets.filter((set) => set.liftType === liftType);
      const testedOneRmsByLift = testedOneRms.filter((record) => record.liftType === liftType);

      // Compute estimate (filters by liftType internally as well)
      const estimate = estimateOneRmWithCategory(
        liftType,
        benchSetsByLift,
        testedOneRmsByLift,
        profile
      );

      setResult(estimate);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to compute baseline 1RM');
      setError(error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount and when dependencies change (including liftType)
  useEffect(() => {
    refresh();
  }, [refresh, liftType]);

  return {
    result,
    loading,
    error,
    refresh,
  };
}


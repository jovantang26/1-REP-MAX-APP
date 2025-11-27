import { useState, useEffect, useCallback } from 'react';
import type { EstimationResult } from '../estimation';
import { estimateOneRmWithCategory } from '../estimation';
import { profileRepository, benchSetRepository, testedOneRmRepository } from '../storage';

/**
 * Hook for getting the current baseline 1RM estimate.
 * 
 * Reads profile, bench sets, and tested 1RMs from storage,
 * then calls the estimation module to compute the current estimate.
 * 
 * @returns Object with estimate result, loading state, and refresh function
 */
export function useCurrentBaselineOneRm() {
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

      // Compute estimate
      const estimate = estimateOneRmWithCategory(
        benchSets,
        testedOneRms,
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

  // Load on mount and when dependencies change
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    result,
    loading,
    error,
    refresh,
  };
}


import { useState, useEffect, useCallback } from 'react';
import type { UnitSystem } from '../domain';
import { preferencesRepository } from '../storage';

/**
 * B3.1.1 - Hook for managing unit system preference.
 * 
 * Provides:
 * - Unit system loading
 * - Unit system saving/updating
 * - Loading state
 * 
 * This is the single source of truth for reading/updating units.
 * 
 * @returns Object with unitSystem, loading state, and save function
 */
export function useUnitSystem() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('kg');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load unit system on mount
  useEffect(() => {
    let cancelled = false;

    async function loadUnitSystem() {
      try {
        setLoading(true);
        setError(null);
        const loadedUnitSystem = await preferencesRepository.getUnitSystem();
        
        if (!cancelled) {
          setUnitSystem(loadedUnitSystem);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load unit system'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUnitSystem();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save unit system function
  const saveUnitSystem = useCallback(async (newUnitSystem: UnitSystem) => {
    try {
      setError(null);
      await preferencesRepository.saveUnitSystem(newUnitSystem);
      setUnitSystem(newUnitSystem);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save unit system');
      setError(error);
      return false;
    }
  }, []);

  return {
    unitSystem,
    loading,
    error,
    saveUnitSystem,
  };
}


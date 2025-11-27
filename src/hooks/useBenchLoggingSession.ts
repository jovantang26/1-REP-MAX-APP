import { useState, useCallback } from 'react';
import type { BenchSet } from '../domain';
import { createBenchSet } from '../domain';
import { benchSetRepository } from '../storage';

/**
 * Hook for managing bench logging sessions.
 * 
 * Provides:
 * - Session state (current sets being logged)
 * - Add set to session
 * - Save session to storage
 * - Clear session
 * 
 * @returns Object with session state and control functions
 */
export function useBenchLoggingSession() {
  const [sessionSets, setSessionSets] = useState<BenchSet[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Adds a set to the current session (in memory only, not persisted yet).
   */
  const addSetToSession = useCallback((
    weight: number,
    reps: number,
    rir: number,
    performedAt: Date = new Date()
  ) => {
    try {
      const setId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newSet = createBenchSet(setId, performedAt, weight, reps, rir);
      
      setSessionSets((prev) => [...prev, newSet]);
      setError(null);
      return newSet;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add set to session');
      setError(error);
      throw error;
    }
  }, []);

  /**
   * Removes a set from the current session by ID.
   */
  const removeSetFromSession = useCallback((setId: string) => {
    setSessionSets((prev) => prev.filter((set) => set.id !== setId));
  }, []);

  /**
   * Saves all sets in the current session to storage.
   * This persists the sets and clears the session.
   */
  const saveSession = useCallback(async () => {
    if (sessionSets.length === 0) {
      return true; // Nothing to save
    }

    try {
      setSaving(true);
      setError(null);

      // Save each set to storage
      for (const set of sessionSets) {
        await benchSetRepository.addBenchSet(set);
      }

      // Clear session after successful save
      setSessionSets([]);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save session');
      setError(error);
      return false;
    } finally {
      setSaving(false);
    }
  }, [sessionSets]);

  /**
   * Clears the current session without saving.
   */
  const clearSession = useCallback(() => {
    setSessionSets([]);
    setError(null);
  }, []);

  return {
    sessionSets,
    saving,
    error,
    addSetToSession,
    removeSetFromSession,
    saveSession,
    clearSession,
  };
}


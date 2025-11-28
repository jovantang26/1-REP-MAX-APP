import { useState, useCallback } from 'react';
import type { BenchSet, LiftType } from '../domain';
import { createBenchSet } from '../domain';
import { benchSetRepository } from '../storage';

/**
 * Hook for managing lift logging sessions.
 * 
 * PER-LIFT INDEPENDENCE RULE: liftType is REQUIRED. All sets created through
 * this hook are tagged with the specified liftType to ensure per-lift independence.
 * 
 * FUTURE-PROOFING PRINCIPLE: This hook accepts liftType as a parameter.
 * All new hooks must accept liftType to support multi-lift functionality.
 * 
 * Provides:
 * - Session state (current sets being logged)
 * - Add set to session (with liftType)
 * - Save session to storage
 * - Clear session
 * 
 * @param liftType - Type of lift being logged (bench, squat, or deadlift) - REQUIRED
 * @returns Object with session state and control functions
 */
export function useBenchLoggingSession(liftType: LiftType) {
  const [sessionSets, setSessionSets] = useState<BenchSet[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Adds a set to the current session (in memory only, not persisted yet).
   * 
   * GUARDRAIL: The set is automatically tagged with the liftType from the hook
   * to ensure per-lift independence.
   */
  const addSetToSession = useCallback((
    weight: number,
    reps: number,
    rir: number,
    timestamp: Date = new Date()
  ) => {
    try {
      const setId = `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // GUARDRAIL: liftType is required and ensures per-lift independence
      const newSet = createBenchSet(setId, liftType, timestamp, weight, reps, rir);
      
      setSessionSets((prev) => [...prev, newSet]);
      setError(null);
      return newSet;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add set to session');
      setError(error);
      throw error;
    }
  }, [liftType]);

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


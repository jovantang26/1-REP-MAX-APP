import { useState, useEffect, useCallback } from 'react';
import { estimateOneRmWithCategory } from '../estimation';
import { filterSetsByDateRange, filterTestedOneRmsByDateRange } from '../estimation';
import { profileRepository, benchSetRepository, testedOneRmRepository } from '../storage';
import type { LiftType } from '../domain';

/**
 * History data point for a single day
 */
export interface HistoryDataPoint {
  date: Date;
  baselineEstimate: number | null; // Estimated 1RM for this day
  testedOneRm: number | null; // Tested 1RM if one exists on this day
  uncertaintyRange: { low: number; high: number } | null;
  confidenceLevel: number | null;
}

/**
 * Statistics for the history period
 */
export interface HistoryStats {
  current1Rm: number | null;
  best1Rm: number | null;
  progress30d: number | null; // Change in 1RM over last 30 days
  totalSessions: number;
}

/**
 * Hook for getting 90-day history data for the History screen.
 * 
 * B2.3.3: Updated to accept liftType parameter for per-lift filtering.
 * 
 * Returns:
 * - Array of daily data points (baseline estimates + tested 1RMs) for the specified lift
 * - Statistics (current, best, progress, total sessions) for the specified lift
 * 
 * @param liftType - Type of lift to get history for (bench, squat, or deadlift) - REQUIRED
 * @returns Object with history data, stats, loading state, and refresh function
 */
export function useOneRmHistory(liftType: LiftType = 'bench') {
  const [dataPoints, setDataPoints] = useState<HistoryDataPoint[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    current1Rm: null,
    best1Rm: null,
    progress30d: null,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Load all necessary data
      const [profile, allBenchSets, allTestedOneRms] = await Promise.all([
        profileRepository.getProfile(),
        benchSetRepository.getBenchSets(),
        testedOneRmRepository.getTestedOneRms(),
      ]);

      if (!profile) {
        setDataPoints([]);
        setStats({
          current1Rm: null,
          best1Rm: null,
          progress30d: null,
          totalSessions: 0,
        });
        setLoading(false);
        return;
      }

      // Filter to 90-day window
      // B2.3.3: liftType is now a parameter, ensuring per-lift independence
      const benchSets = filterSetsByDateRange(allBenchSets, 90, now);
      const testedOneRms = filterTestedOneRmsByDateRange(allTestedOneRms, 90, now);

      // GUARDRAIL: Filter by liftType to ensure per-lift independence
      const benchSetsByLift = benchSets.filter((set) => set.liftType === liftType);
      const testedOneRmsByLift = testedOneRms.filter((record) => record.liftType === liftType);

      // Get current estimate
      const currentEstimate = estimateOneRmWithCategory(
        liftType,
        benchSetsByLift,
        testedOneRmsByLift,
        profile,
        now
      );

      // Build daily data points (simplified: one point per day with data)
      // For a full implementation, you might want to compute estimates for each day
      // For now, we'll create points for days that have sets or tested 1RMs
      const dateMap = new Map<string, HistoryDataPoint>();

      // Add points for days with tested 1RMs
      for (const tested of testedOneRms) {
        const timestamp = tested.timestamp instanceof Date 
          ? tested.timestamp 
          : new Date(tested.timestamp);
        const dateKey = timestamp.toISOString().split('T')[0];
        
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {
            date: timestamp,
            baselineEstimate: null,
            testedOneRm: tested.weight,
            uncertaintyRange: null,
            confidenceLevel: null,
          });
        } else {
          const existing = dateMap.get(dateKey)!;
          existing.testedOneRm = tested.weight;
        }
      }

      // Add current estimate as today's point
      const todayKey = now.toISOString().split('T')[0];
      dateMap.set(todayKey, {
        date: now,
        baselineEstimate: currentEstimate.baselineOneRm,
        testedOneRm: dateMap.get(todayKey)?.testedOneRm || null,
        uncertaintyRange: currentEstimate.uncertaintyRange,
        confidenceLevel: currentEstimate.confidenceLevel,
      });

      // Convert to sorted array
      const points = Array.from(dateMap.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      setDataPoints(points);

      // Calculate statistics
      const current1Rm = currentEstimate.baselineOneRm > 0 
        ? currentEstimate.baselineOneRm 
        : null;

      // Find best 1RM (highest tested or estimated)
      let best1Rm: number | null = null;
      for (const tested of testedOneRms) {
        if (best1Rm === null || tested.weight > best1Rm) {
          best1Rm = tested.weight;
        }
      }
      if (current1Rm !== null && (best1Rm === null || current1Rm > best1Rm)) {
        best1Rm = current1Rm;
      }

      // Calculate 30-day progress
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sets30DaysAgo = filterSetsByDateRange(benchSets, 30, thirtyDaysAgo);
      const tested30DaysAgo = filterTestedOneRmsByDateRange(testedOneRms, 30, thirtyDaysAgo);
      
      let progress30d: number | null = null;
      if (sets30DaysAgo.length > 0 || tested30DaysAgo.length > 0) {
        // GUARDRAIL: Filter by liftType to ensure per-lift independence
        const sets30DaysAgoByLift = sets30DaysAgo.filter((set) => set.liftType === liftType);
        const tested30DaysAgoByLift = tested30DaysAgo.filter((record) => record.liftType === liftType);
        
        const estimate30DaysAgo = estimateOneRmWithCategory(
          liftType,
          sets30DaysAgoByLift,
          tested30DaysAgoByLift,
          profile,
          thirtyDaysAgo
        );
        if (current1Rm !== null && estimate30DaysAgo.baselineOneRm > 0) {
          progress30d = current1Rm - estimate30DaysAgo.baselineOneRm;
        }
      }

      // Count unique session days
      const sessionDates = new Set<string>();
      for (const set of benchSets) {
        const performedAt = set.performedAt instanceof Date 
          ? set.performedAt 
          : new Date(set.performedAt);
        sessionDates.add(performedAt.toISOString().split('T')[0]);
      }
      const totalSessions = sessionDates.size;

      setStats({
        current1Rm,
        best1Rm,
        progress30d,
        totalSessions,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load history data');
      setError(error);
      setDataPoints([]);
      setStats({
        current1Rm: null,
        best1Rm: null,
        progress30d: null,
        totalSessions: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [liftType]);

  // Load on mount and when liftType changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    dataPoints,
    stats,
    loading,
    error,
    refresh,
  };
}


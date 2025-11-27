/**
 * Unit tests for baseline 1RM estimation
 * 
 * Tests edge cases: no data, few sets, presence of tested 1RM, different genders/bodyweights
 */

import { createBenchSet } from '../../domain';
import { createTestedOneRm } from '../../domain';
import { createUserProfile } from '../../domain';
import { estimateBaselineOneRm } from '../estimateBaselineOneRm';
import { estimateOneRmWithCategory } from '../estimateWithCategory';

describe('estimateBaselineOneRm', () => {
  const baseDate = new Date('2024-01-15');
  
  const mockProfile = createUserProfile(25, 'male', 80);
  const mockFemaleProfile = createUserProfile(25, 'female', 65);

  describe('edge cases', () => {
    it('should return zero estimate when no bench sets provided', () => {
      const result = estimateBaselineOneRm({
        benchSets: [],
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(result.baselineOneRm).toBe(0);
      expect(result.confidenceLevel).toBe(0.0);
      expect(result.uncertaintyRange.low).toBe(0);
      expect(result.uncertaintyRange.high).toBe(0);
    });

    it('should handle single bench set', () => {
      const set = createBenchSet(
        '1',
        new Date('2024-01-10'),
        100,
        5,
        0
      );

      const result = estimateBaselineOneRm({
        benchSets: [set],
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(result.baselineOneRm).toBeGreaterThan(0);
      expect(result.confidenceLevel).toBeGreaterThan(0);
    });

    it('should filter out sets older than 90 days', () => {
      const oldSet = createBenchSet(
        '1',
        new Date('2023-10-01'), // More than 90 days ago
        100,
        5,
        0
      );
      const recentSet = createBenchSet(
        '2',
        new Date('2024-01-10'), // Within 90 days
        100,
        5,
        0
      );

      const result = estimateBaselineOneRm({
        benchSets: [oldSet, recentSet],
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      // Should only use the recent set
      expect(result.baselineOneRm).toBeGreaterThan(0);
    });

    it('should weight recent sets (last 60 days) more heavily', () => {
      const veryRecentSet = createBenchSet(
        '1',
        new Date('2024-01-12'), // 3 days ago
        120,
        5,
        0
      );
      const olderSet = createBenchSet(
        '2',
        new Date('2023-12-01'), // 45 days ago (still in 60-day window)
        100,
        5,
        0
      );
      const oldSet = createBenchSet(
        '3',
        new Date('2023-11-20'), // 56 days ago (in 60-90 day window)
        90,
        5,
        0
      );

      const result = estimateBaselineOneRm({
        benchSets: [veryRecentSet, olderSet, oldSet],
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      // Recent sets should dominate the estimate
      expect(result.baselineOneRm).toBeGreaterThan(100);
    });
  });

  describe('tested 1RM integration', () => {
    it('should apply hard reset when tested 1RM exists', () => {
      const set = createBenchSet(
        '1',
        new Date('2024-01-10'),
        100,
        5,
        0
      );
      const tested1Rm = createTestedOneRm(
        'test1',
        new Date('2024-01-12'),
        130
      );

      const result = estimateBaselineOneRm({
        benchSets: [set],
        testedOneRms: [tested1Rm],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      // Estimate should be pulled toward tested 1RM
      expect(result.baselineOneRm).toBeGreaterThan(100);
    });

    it('should apply stronger reset for very recent tested 1RM', () => {
      const set = createBenchSet(
        '1',
        new Date('2024-01-10'),
        100,
        5,
        0
      );
      const veryRecentTested = createTestedOneRm(
        'test1',
        new Date('2024-01-14'), // 1 day ago
        130
      );
      const olderTested = createTestedOneRm(
        'test2',
        new Date('2023-12-01'), // 45 days ago
        125
      );

      const resultRecent = estimateBaselineOneRm({
        benchSets: [set],
        testedOneRms: [veryRecentTested],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      const resultOlder = estimateBaselineOneRm({
        benchSets: [set],
        testedOneRms: [olderTested],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      // Very recent tested 1RM should have stronger influence
      expect(resultRecent.baselineOneRm).toBeGreaterThan(resultOlder.baselineOneRm);
    });
  });

  describe('personalization', () => {
    it('should use calibration factor when tested 1RM exists', () => {
      const sets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
        createBenchSet('2', new Date('2024-01-12'), 105, 5, 0),
      ];
      const tested1Rm = createTestedOneRm('test1', new Date('2024-01-08'), 120);

      const result = estimateBaselineOneRm({
        benchSets: sets,
        testedOneRms: [tested1Rm],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(result.baselineOneRm).toBeGreaterThan(0);
    });

    it('should work without tested 1RM (no calibration)', () => {
      const sets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
        createBenchSet('2', new Date('2024-01-12'), 105, 5, 0),
      ];

      const result = estimateBaselineOneRm({
        benchSets: sets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(result.baselineOneRm).toBeGreaterThan(0);
    });
  });

  describe('confidence and uncertainty', () => {
    it('should have higher confidence with more recent sets', () => {
      const fewSets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
      ];
      const manySets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
        createBenchSet('2', new Date('2024-01-12'), 105, 5, 0),
        createBenchSet('3', new Date('2024-01-14'), 110, 5, 0),
      ];

      const resultFew = estimateBaselineOneRm({
        benchSets: fewSets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      const resultMany = estimateBaselineOneRm({
        benchSets: manySets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(resultMany.confidenceLevel).toBeGreaterThan(resultFew.confidenceLevel);
    });

    it('should have higher confidence when tested 1RM exists', () => {
      const sets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
      ];
      const tested1Rm = createTestedOneRm('test1', new Date('2024-01-08'), 120);

      const resultNoTested = estimateBaselineOneRm({
        benchSets: sets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      const resultWithTested = estimateBaselineOneRm({
        benchSets: sets,
        testedOneRms: [tested1Rm],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(resultWithTested.confidenceLevel).toBeGreaterThan(resultNoTested.confidenceLevel);
    });
  });
});

describe('estimateOneRmWithCategory', () => {
  const baseDate = new Date('2024-01-15');
  
  it('should return strength category for male user', () => {
    const profile = createUserProfile(25, 'male', 80);
    const sets = [
      createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
    ];

    const result = estimateOneRmWithCategory(sets, [], profile, baseDate);

    expect(result.strengthCategory).toBeDefined();
    expect(result.strengthCategory.category).toMatch(/novice|intermediate|advanced|elite/);
    expect(result.strengthCategory.ratio).toBeGreaterThan(0);
  });

  it('should return strength category for female user with different thresholds', () => {
    const profile = createUserProfile(25, 'female', 65);
    const sets = [
      createBenchSet('1', new Date('2024-01-10'), 50, 5, 0),
    ];

    const result = estimateOneRmWithCategory(sets, [], profile, baseDate);

    expect(result.strengthCategory).toBeDefined();
    expect(result.strengthCategory.category).toMatch(/novice|intermediate|advanced|elite/);
  });

  it('should handle different bodyweights correctly', () => {
    const lightProfile = createUserProfile(25, 'male', 70);
    const heavyProfile = createUserProfile(25, 'male', 100);
    const sets = [
      createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
    ];

    const resultLight = estimateOneRmWithCategory(sets, [], lightProfile, baseDate);
    const resultHeavy = estimateOneRmWithCategory(sets, [], heavyProfile, baseDate);

    // Same 1RM but different bodyweights should give different ratios
    expect(resultLight.strengthCategory.ratio).toBeGreaterThan(resultHeavy.strengthCategory.ratio);
  });
});

describe('estimate directionality', () => {
  const baseDate = new Date('2024-01-15');
  const mockProfile = createUserProfile(25, 'male', 80);

  describe('weight progression', () => {
    it('should increase estimate when sets get heavier', () => {
      const lighterSets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
      ];
      const heavierSets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
        createBenchSet('2', new Date('2024-01-12'), 110, 5, 0), // Heavier weight
      ];

      const resultLighter = estimateBaselineOneRm({
        benchSets: lighterSets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      const resultHeavier = estimateBaselineOneRm({
        benchSets: heavierSets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(resultHeavier.baselineOneRm).toBeGreaterThan(resultLighter.baselineOneRm);
    });

    it('should increase estimate when same weight is lifted for more reps', () => {
      const fewerReps = [
        createBenchSet('1', new Date('2024-01-10'), 100, 3, 0),
      ];
      const moreReps = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0), // More reps
      ];

      const resultFewer = estimateBaselineOneRm({
        benchSets: fewerReps,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      const resultMore = estimateBaselineOneRm({
        benchSets: moreReps,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(resultMore.baselineOneRm).toBeGreaterThan(resultFewer.baselineOneRm);
    });
  });

  describe('RIR (Reps in Reserve) impact', () => {
    it('should increase estimate when RIR increases (more reserve capacity)', () => {
      // Higher RIR means more reps in reserve, which indicates higher 1RM capacity
      // Formula: 1RM = weight × (1 + (reps + rir) / 30)
      // So 5 reps with 3 RIR = effective 8 reps → higher 1RM
      // And 5 reps with 0 RIR = effective 5 reps → lower 1RM
      const lowerRir = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0), // 0 RIR (to failure) = 5 effective reps
      ];
      const higherRir = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 3), // 3 RIR = 8 effective reps
      ];

      const resultLowerRir = estimateBaselineOneRm({
        benchSets: lowerRir,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      const resultHigherRir = estimateBaselineOneRm({
        benchSets: higherRir,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      // Higher RIR (more reserve) should give higher estimate
      expect(resultHigherRir.baselineOneRm).toBeGreaterThan(resultLowerRir.baselineOneRm);
    });
  });

  describe('tested 1RM impact', () => {
    it('should move estimate toward new tested 1RM when recorded', () => {
      const sets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
      ];

      // Estimate without tested 1RM
      const resultNoTested = estimateBaselineOneRm({
        benchSets: sets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      // Estimate with tested 1RM higher than current estimate
      const tested1Rm = createTestedOneRm('test1', new Date('2024-01-14'), 130);
      const resultWithTested = estimateBaselineOneRm({
        benchSets: sets,
        testedOneRms: [tested1Rm],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      // Estimate should move toward tested 1RM
      expect(resultWithTested.baselineOneRm).toBeGreaterThan(resultNoTested.baselineOneRm);
    });

    it('should move estimate toward lower tested 1RM when recorded', () => {
      const sets = [
        createBenchSet('1', new Date('2024-01-10'), 120, 5, 0), // Higher weight
      ];

      // Estimate without tested 1RM
      const resultNoTested = estimateBaselineOneRm({
        benchSets: sets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      // Estimate with tested 1RM lower than current estimate
      const tested1Rm = createTestedOneRm('test1', new Date('2024-01-14'), 100);
      const resultWithTested = estimateBaselineOneRm({
        benchSets: sets,
        testedOneRms: [tested1Rm],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      // Estimate should move toward tested 1RM (downward)
      expect(resultWithTested.baselineOneRm).toBeLessThan(resultNoTested.baselineOneRm);
    });
  });

  describe('few sets scenarios', () => {
    it('should handle 2-3 sets correctly', () => {
      const fewSets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
        createBenchSet('2', new Date('2024-01-12'), 105, 5, 0),
      ];

      const result = estimateBaselineOneRm({
        benchSets: fewSets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(result.baselineOneRm).toBeGreaterThan(0);
      expect(result.confidenceLevel).toBeGreaterThan(0);
      expect(result.confidenceLevel).toBeLessThan(1); // Lower confidence with few sets
    });

    it('should have higher confidence with tested 1RM even with few sets', () => {
      const fewSets = [
        createBenchSet('1', new Date('2024-01-10'), 100, 5, 0),
      ];
      const tested1Rm = createTestedOneRm('test1', new Date('2024-01-12'), 120);

      const resultNoTested = estimateBaselineOneRm({
        benchSets: fewSets,
        testedOneRms: [],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      const resultWithTested = estimateBaselineOneRm({
        benchSets: fewSets,
        testedOneRms: [tested1Rm],
        profile: mockProfile,
        referenceDate: baseDate,
      });

      expect(resultWithTested.confidenceLevel).toBeGreaterThan(resultNoTested.confidenceLevel);
    });
  });
});


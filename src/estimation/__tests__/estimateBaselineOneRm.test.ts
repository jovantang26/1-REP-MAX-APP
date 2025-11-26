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


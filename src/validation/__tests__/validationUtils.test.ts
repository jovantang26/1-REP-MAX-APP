/**
 * Unit tests for validation utilities
 */

import {
  computeValidationMetrics,
  analyzeValidationPair,
  exportValidationPairsToJson,
} from '../validationUtils';
import type { ValidationPair } from '../validationUtils';

describe('validationUtils', () => {
  describe('computeValidationMetrics', () => {
    it('should return zero metrics for empty array', () => {
      const metrics = computeValidationMetrics([]);
      
      expect(metrics.totalPairs).toBe(0);
      expect(metrics.averageAbsoluteError).toBe(0);
      expect(metrics.averagePercentageError).toBe(0);
      expect(metrics.rootMeanSquareError).toBe(0);
    });

    it('should compute correct metrics for validation pairs', () => {
      const pairs: ValidationPair[] = [
        { tested1Rm: 100, estimated1Rm: 105 }, // 5kg error, 5%
        { tested1Rm: 120, estimated1Rm: 115 }, // 5kg error, 4.17%
        { tested1Rm: 110, estimated1Rm: 110 }, // 0kg error, 0%
      ];

      const metrics = computeValidationMetrics(pairs);

      expect(metrics.totalPairs).toBe(3);
      expect(metrics.averageAbsoluteError).toBeCloseTo(3.33, 2); // (5 + 5 + 0) / 3
      expect(metrics.averagePercentageError).toBeCloseTo(3.06, 2); // (5 + 4.17 + 0) / 3
      expect(metrics.within5Percent).toBe(3); // All within 5%
      expect(metrics.withinXKg).toBe(3); // All within 5kg
    });

    it('should correctly identify pairs within accuracy windows', () => {
      const pairs: ValidationPair[] = [
        { tested1Rm: 100, estimated1Rm: 104 }, // 4kg, 4% - within both
        { tested1Rm: 100, estimated1Rm: 110 }, // 10kg, 10% - outside both
        { tested1Rm: 100, estimated1Rm: 103 }, // 3kg, 3% - within both
      ];

      const metrics = computeValidationMetrics(pairs, 5);

      expect(metrics.within5Percent).toBe(2); // First and third
      expect(metrics.withinXKg).toBe(2); // First and third (within 5kg)
      expect(metrics.accuracy5Percent).toBeCloseTo(66.67, 1);
      expect(metrics.accuracyXKg).toBeCloseTo(66.67, 1);
    });

    it('should use custom accuracy window', () => {
      const pairs: ValidationPair[] = [
        { tested1Rm: 100, estimated1Rm: 103 }, // 3kg - within 3kg
        { tested1Rm: 100, estimated1Rm: 105 }, // 5kg - outside 3kg
      ];

      const metrics = computeValidationMetrics(pairs, 3);

      expect(metrics.withinXKg).toBe(1); // Only first within 3kg
      expect(metrics.accuracyXKg).toBe(50);
    });
  });

  describe('analyzeValidationPair', () => {
    it('should correctly analyze a validation pair', () => {
      const pair: ValidationPair = {
        tested1Rm: 100,
        estimated1Rm: 105,
      };

      const analysis = analyzeValidationPair(pair);

      expect(analysis.absoluteError).toBe(5);
      expect(analysis.percentageError).toBe(5);
      expect(analysis.within5Percent).toBe(true);
      expect(analysis.withinXKg).toBe(true); // 5kg is within default 5kg window
      expect(analysis.overestimate).toBe(true);
    });

    it('should detect underestimate', () => {
      const pair: ValidationPair = {
        tested1Rm: 100,
        estimated1Rm: 95,
      };

      const analysis = analyzeValidationPair(pair);

      expect(analysis.overestimate).toBe(false);
      expect(analysis.absoluteError).toBe(5);
    });
  });

  describe('exportValidationPairsToJson', () => {
    it('should export pairs to valid JSON', () => {
      const pairs: ValidationPair[] = [
        { tested1Rm: 100, estimated1Rm: 105 },
        { tested1Rm: 120, estimated1Rm: 115, testDate: new Date('2024-01-15'), notes: 'Test note' },
      ];

      const json = exportValidationPairsToJson(pairs);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].tested1Rm).toBe(100);
      expect(parsed[0].estimated1Rm).toBe(105);
      expect(parsed[1].testDate).toBe('2024-01-15T00:00:00.000Z');
      expect(parsed[1].notes).toBe('Test note');
    });
  });
});


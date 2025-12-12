/**
 * Unit tests for B2.5 - Strength Categories & Display Per Lift
 * 
 * Tests:
 * - getStrengthCategory universal function (B2.5.2)
 * - Per-lift ratio rules (B2.5.1)
 * - Gender-specific thresholds
 * - All lift types (bench, squat, deadlift)
 */

import { getStrengthCategory } from '../strengthCategory';

describe('B2.5.2 - getStrengthCategory', () => {
  describe('per-lift independence', () => {
    it('should return different categories for bench, squat, and deadlift with same ratio', () => {
      const oneRm = 100;
      const bodyweight = 80;
      const ratio = oneRm / bodyweight; // 1.25x

      // Bench: 1.25x is Intermediate (1.0-1.5)
      const benchCategory = getStrengthCategory('bench', 'male', oneRm, bodyweight);
      expect(benchCategory).toBe('intermediate');

      // Squat: 1.25x is Novice (< 1.5)
      const squatCategory = getStrengthCategory('squat', 'male', oneRm, bodyweight);
      expect(squatCategory).toBe('novice');

      // Deadlift: 1.25x is Novice (< 2.0)
      const deadliftCategory = getStrengthCategory('deadlift', 'male', oneRm, bodyweight);
      expect(deadliftCategory).toBe('novice');
    });

    it('should use lift-specific thresholds correctly', () => {
      const bodyweight = 80;

      // Bench: 120kg = 1.5x (at Advanced threshold, so Advanced)
      const benchAdvanced = getStrengthCategory('bench', 'male', 120, bodyweight);
      expect(benchAdvanced).toBe('advanced');

      // Squat: 120kg = 1.5x (at Intermediate threshold, so Intermediate)
      const squatIntermediate = getStrengthCategory('squat', 'male', 120, bodyweight);
      expect(squatIntermediate).toBe('intermediate');

      // Deadlift: 120kg = 1.5x (Novice threshold, below 2.0 intermediate)
      const deadliftNovice = getStrengthCategory('deadlift', 'male', 120, bodyweight);
      expect(deadliftNovice).toBe('novice');
    });
  });

  describe('gender-specific thresholds', () => {
    it('should use different thresholds for male vs female (bench)', () => {
      const oneRm = 70; // 0.875x for 80kg bodyweight
      const bodyweight = 80;

      // Male: 0.875x is Novice (< 1.0)
      const maleCategory = getStrengthCategory('bench', 'male', oneRm, bodyweight);
      expect(maleCategory).toBe('novice');

      // Female: 0.875x is Intermediate (0.7-1.0)
      const femaleCategory = getStrengthCategory('bench', 'female', oneRm, bodyweight);
      expect(femaleCategory).toBe('intermediate');
    });

    it('should use different thresholds for male vs female (squat)', () => {
      const oneRm = 100; // 1.25x for 80kg bodyweight
      const bodyweight = 80;

      // Male: 1.25x is Novice (< 1.5)
      const maleCategory = getStrengthCategory('squat', 'male', oneRm, bodyweight);
      expect(maleCategory).toBe('novice');

      // Female: 1.25x is Intermediate (1.0-1.5)
      const femaleCategory = getStrengthCategory('squat', 'female', oneRm, bodyweight);
      expect(femaleCategory).toBe('intermediate');
    });

    it('should use different thresholds for male vs female (deadlift)', () => {
      const oneRm = 150; // 1.875x for 80kg bodyweight
      const bodyweight = 80;

      // Male: 1.875x is Novice (< 2.0)
      const maleCategory = getStrengthCategory('deadlift', 'male', oneRm, bodyweight);
      expect(maleCategory).toBe('novice');

      // Female: 1.875x is Intermediate (1.5-2.0, but < 2.0 so Intermediate)
      const femaleCategory = getStrengthCategory('deadlift', 'female', oneRm, bodyweight);
      expect(femaleCategory).toBe('intermediate');
    });
  });

  describe('category boundaries', () => {
    const bodyweight = 80;

    describe('bench - male', () => {
      it('should return novice for ratio < 1.0', () => {
        const category = getStrengthCategory('bench', 'male', 79, bodyweight); // 0.9875x
        expect(category).toBe('novice');
      });

      it('should return intermediate for ratio 1.0-1.5', () => {
        const category1 = getStrengthCategory('bench', 'male', 80, bodyweight); // 1.0x
        const category2 = getStrengthCategory('bench', 'male', 100, bodyweight); // 1.25x
        const category3 = getStrengthCategory('bench', 'male', 119, bodyweight); // 1.4875x
        expect(category1).toBe('intermediate');
        expect(category2).toBe('intermediate');
        expect(category3).toBe('intermediate');
      });

      it('should return advanced for ratio 1.5-2.0', () => {
        const category1 = getStrengthCategory('bench', 'male', 120, bodyweight); // 1.5x
        const category2 = getStrengthCategory('bench', 'male', 150, bodyweight); // 1.875x
        const category3 = getStrengthCategory('bench', 'male', 159, bodyweight); // 1.9875x
        expect(category1).toBe('advanced');
        expect(category2).toBe('advanced');
        expect(category3).toBe('advanced');
      });

      it('should return elite for ratio >= 2.0', () => {
        const category = getStrengthCategory('bench', 'male', 160, bodyweight); // 2.0x
        expect(category).toBe('elite');
      });
    });

    describe('squat - male', () => {
      it('should return novice for ratio < 1.5', () => {
        const category = getStrengthCategory('squat', 'male', 119, bodyweight); // 1.4875x
        expect(category).toBe('novice');
      });

      it('should return intermediate for ratio 1.5-2.0', () => {
        const category = getStrengthCategory('squat', 'male', 150, bodyweight); // 1.875x
        expect(category).toBe('intermediate');
      });

      it('should return advanced for ratio 2.0-2.5 (exclusive of 2.5)', () => {
        const category = getStrengthCategory('squat', 'male', 199, bodyweight); // 2.4875x
        expect(category).toBe('advanced');
      });

      it('should return elite for ratio >= 2.5', () => {
        const category = getStrengthCategory('squat', 'male', 201, bodyweight); // 2.5125x
        expect(category).toBe('elite');
      });
    });

    describe('deadlift - male', () => {
      it('should return novice for ratio < 2.0', () => {
        const category = getStrengthCategory('deadlift', 'male', 159, bodyweight); // 1.9875x
        expect(category).toBe('novice');
      });

      it('should return intermediate for ratio 2.0-2.5 (exclusive of 2.5)', () => {
        const category = getStrengthCategory('deadlift', 'male', 199, bodyweight); // 2.4875x
        expect(category).toBe('intermediate');
      });

      it('should return advanced for ratio 2.5-3.0 (exclusive of 3.0)', () => {
        const category = getStrengthCategory('deadlift', 'male', 239, bodyweight); // 2.9875x
        expect(category).toBe('advanced');
      });

      it('should return elite for ratio >= 3.0', () => {
        const category = getStrengthCategory('deadlift', 'male', 241, bodyweight); // 3.0125x
        expect(category).toBe('elite');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very low ratios', () => {
      const category = getStrengthCategory('bench', 'male', 10, 80); // 0.125x
      expect(category).toBe('novice');
    });

    it('should handle very high ratios', () => {
      const category = getStrengthCategory('deadlift', 'male', 400, 80); // 5.0x
      expect(category).toBe('elite');
    });

    it('should handle boundary values correctly', () => {
      const bodyweight = 100;

      // Bench male: exactly at thresholds
      expect(getStrengthCategory('bench', 'male', 100, bodyweight)).toBe('intermediate'); // 1.0x
      expect(getStrengthCategory('bench', 'male', 150, bodyweight)).toBe('advanced'); // 1.5x
      expect(getStrengthCategory('bench', 'male', 200, bodyweight)).toBe('elite'); // 2.0x
    });
  });

  describe('B2.5.1 - ratio calculation', () => {
    it('should compute ratio as oneRM / bodyweight', () => {
      // This is tested implicitly through category boundaries
      // But we can verify the calculation is correct by checking expected categories
      const bodyweight = 80;

      // 100kg / 80kg = 1.25x (bench intermediate for male)
      const category = getStrengthCategory('bench', 'male', 100, bodyweight);
      expect(category).toBe('intermediate'); // Confirms ratio is 1.25x (between 1.0 and 1.5)
    });

    it('should handle different bodyweights correctly', () => {
      const oneRm = 100;

      // 100kg / 50kg = 2.0x (bench elite for male)
      const category1 = getStrengthCategory('bench', 'male', oneRm, 50);
      expect(category1).toBe('elite');

      // 100kg / 100kg = 1.0x (bench intermediate for male)
      const category2 = getStrengthCategory('bench', 'male', oneRm, 100);
      expect(category2).toBe('intermediate');
    });
  });
});


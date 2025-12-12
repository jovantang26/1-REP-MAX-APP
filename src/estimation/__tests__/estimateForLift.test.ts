/**
 * Unit tests for B2.4 - Per-Lift Estimation API
 * 
 * Tests:
 * - estimateBaselineForLift with different lift types
 * - deriveCalibration per-lift
 * - applyCalibrationWithUserCalibration per-lift
 * - Cross-lift contamination prevention
 * - Multi-lift scenarios
 */

import { createTrainingSet, createTestedOneRm, createUserProfile, createUserCalibration, type LiftType } from '../../domain';
import { estimateBaselineForLift, estimateOneRMFromSet } from '../estimateForLift';
import { deriveCalibration, applyCalibrationWithUserCalibration } from '../personalization';

describe('B2.4.1 - estimateBaselineForLift', () => {
  const baseDate = new Date('2024-01-15');
  const mockProfile = createUserProfile(25, 'male', 80);
  const defaultCalibration = createUserCalibration();

  describe('per-lift independence', () => {
    it('should estimate bench independently from squat and deadlift', () => {
      const benchSet = createTrainingSet(
        'bench1',
        'bench',
        new Date('2024-01-10'),
        100,
        5,
        0
      );
      
      const squatSet = createTrainingSet(
        'squat1',
        'squat',
        new Date('2024-01-10'),
        150,
        5,
        0
      );
      
      const deadliftSet = createTrainingSet(
        'deadlift1',
        'deadlift',
        new Date('2024-01-10'),
        200,
        5,
        0
      );

      // Estimate for bench - should only use bench set
      const benchResult = estimateBaselineForLift(
        'bench',
        [benchSet, squatSet, deadliftSet], // All sets mixed
        [],
        defaultCalibration,
        mockProfile,
        baseDate
      );

      // Estimate for squat - should only use squat set
      const squatResult = estimateBaselineForLift(
        'squat',
        [benchSet, squatSet, deadliftSet], // All sets mixed
        [],
        defaultCalibration,
        mockProfile,
        baseDate
      );

      // Estimate for deadlift - should only use deadlift set
      const deadliftResult = estimateBaselineForLift(
        'deadlift',
        [benchSet, squatSet, deadliftSet], // All sets mixed
        [],
        defaultCalibration,
        mockProfile,
        baseDate
      );

      // Verify liftType is correct
      expect(benchResult.liftType).toBe('bench');
      expect(squatResult.liftType).toBe('squat');
      expect(deadliftResult.liftType).toBe('deadlift');

      // Verify estimates are different (proving independence)
      expect(benchResult.baseline1Rm).toBeGreaterThan(0);
      expect(squatResult.baseline1Rm).toBeGreaterThan(benchResult.baseline1Rm);
      expect(deadliftResult.baseline1Rm).toBeGreaterThan(squatResult.baseline1Rm);
    });

    it('should filter tested 1RMs by liftType', () => {
      const benchTested = createTestedOneRm('test1', 'bench', new Date('2024-01-10'), 120);
      const squatTested = createTestedOneRm('test2', 'squat', new Date('2024-01-10'), 180);
      const deadliftTested = createTestedOneRm('test3', 'deadlift', new Date('2024-01-10'), 220);

      const benchSet = createTrainingSet('bench1', 'bench', new Date('2024-01-10'), 100, 5, 0);

      // Estimate bench - should only use bench tested 1RM
      const benchResult = estimateBaselineForLift(
        'bench',
        [benchSet],
        [benchTested, squatTested, deadliftTested], // All tested 1RMs mixed
        defaultCalibration,
        mockProfile,
        baseDate
      );

      // The estimate should be influenced by bench tested 1RM (120kg)
      // but not by squat (180kg) or deadlift (220kg)
      expect(benchResult.baseline1Rm).toBeGreaterThan(0);
      expect(benchResult.baseline1Rm).toBeLessThan(150); // Should be closer to 120 than 180 or 220
    });
  });

  describe('calibration application', () => {
    it('should apply per-lift calibration correctly', () => {
      const benchSet = createTrainingSet('bench1', 'bench', new Date('2024-01-10'), 100, 5, 0);
      const squatSet = createTrainingSet('squat1', 'squat', new Date('2024-01-10'), 150, 5, 0);

      // Create calibration with different multipliers
      const calibration = createUserCalibration();
      calibration.bench = 1.1; // 10% increase for bench
      calibration.squat = 0.95; // 5% decrease for squat
      calibration.deadlift = 1.0; // No change for deadlift

      const benchResult = estimateBaselineForLift(
        'bench',
        [benchSet],
        [],
        calibration,
        mockProfile,
        baseDate
      );

      const squatResult = estimateBaselineForLift(
        'squat',
        [squatSet],
        [],
        calibration,
        mockProfile,
        baseDate
      );

      // Get uncalibrated estimates for comparison
      const benchUncalibrated = estimateBaselineForLift(
        'bench',
        [benchSet],
        [],
        defaultCalibration, // 1.0 for all
        mockProfile,
        baseDate
      );

      const squatUncalibrated = estimateBaselineForLift(
        'squat',
        [squatSet],
        [],
        defaultCalibration, // 1.0 for all
        mockProfile,
        baseDate
      );

      // Bench should be 10% higher
      expect(benchResult.baseline1Rm).toBeCloseTo(benchUncalibrated.baseline1Rm * 1.1, 1);

      // Squat should be 5% lower
      expect(squatResult.baseline1Rm).toBeCloseTo(squatUncalibrated.baseline1Rm * 0.95, 1);
    });
  });

  describe('edge cases', () => {
    it('should return zero estimate when no sets for liftType', () => {
      const benchSet = createTrainingSet('bench1', 'bench', new Date('2024-01-10'), 100, 5, 0);
      
      // Try to estimate squat but only have bench sets
      const result = estimateBaselineForLift(
        'squat',
        [benchSet], // Only bench set
        [],
        defaultCalibration,
        mockProfile,
        baseDate
      );

      expect(result.liftType).toBe('squat');
      expect(result.baseline1Rm).toBe(0);
      expect(result.confidence).toBe(0.0);
    });
  });
});

describe('B2.4.1 - estimateOneRMFromSet', () => {
  it('should estimate 1RM from a training set', () => {
    const set = createTrainingSet('set1', 'bench', new Date('2024-01-10'), 100, 5, 0);
    
    const estimate = estimateOneRMFromSet(set, 'bench');
    
    // Epley formula: 100 * (1 + (5 + 0) / 30) = 100 * 1.1667 ≈ 116.67
    expect(estimate).toBeCloseTo(116.67, 1);
  });

  it('should throw error if liftType does not match set', () => {
    const set = createTrainingSet('set1', 'bench', new Date('2024-01-10'), 100, 5, 0);
    
    expect(() => {
      estimateOneRMFromSet(set, 'squat');
    }).toThrow('Set liftType (bench) does not match requested liftType (squat)');
  });

  it('should work for all lift types', () => {
    const benchSet = createTrainingSet('bench1', 'bench', new Date('2024-01-10'), 100, 5, 0);
    const squatSet = createTrainingSet('squat1', 'squat', new Date('2024-01-10'), 150, 5, 0);
    const deadliftSet = createTrainingSet('deadlift1', 'deadlift', new Date('2024-01-10'), 200, 5, 0);

    const benchEstimate = estimateOneRMFromSet(benchSet, 'bench');
    const squatEstimate = estimateOneRMFromSet(squatSet, 'squat');
    const deadliftEstimate = estimateOneRMFromSet(deadliftSet, 'deadlift');

    expect(benchEstimate).toBeGreaterThan(0);
    expect(squatEstimate).toBeGreaterThan(benchEstimate);
    expect(deadliftEstimate).toBeGreaterThan(squatEstimate);
  });
});

describe('B2.4.3 - deriveCalibration', () => {
  it('should derive calibration for bench independently', () => {
    const benchSets = [
      createTrainingSet('bench1', 'bench', new Date('2024-01-10'), 100, 5, 0),
      createTrainingSet('bench2', 'bench', new Date('2024-01-12'), 105, 5, 0),
    ];
    
    const benchTested = createTestedOneRm('test1', 'bench', new Date('2024-01-13'), 120);
    
    const squatSets = [
      createTrainingSet('squat1', 'squat', new Date('2024-01-10'), 150, 5, 0),
    ];
    
    const squatTested = createTestedOneRm('test2', 'squat', new Date('2024-01-13'), 200);

    // Derive calibration for bench - should only use bench data
    const benchCalibration = deriveCalibration(
      'bench',
      [...benchSets, ...squatSets], // Mixed sets
      [benchTested, squatTested] // Mixed tested 1RMs
    );

    // Derive calibration for squat - should only use squat data
    const squatCalibration = deriveCalibration(
      'squat',
      [...benchSets, ...squatSets], // Mixed sets
      [benchTested, squatTested] // Mixed tested 1RMs
    );

    // Both should return valid calibration factors
    expect(benchCalibration).toBeGreaterThan(0.85);
    expect(benchCalibration).toBeLessThan(1.15);
    expect(squatCalibration).toBeGreaterThan(0.85);
    expect(squatCalibration).toBeLessThan(1.15);

    // They should be different (proving independence)
    expect(benchCalibration).not.toBe(squatCalibration);
  });

  it('should return 1.0 when no tested 1RM exists', () => {
    const benchSets = [
      createTrainingSet('bench1', 'bench', new Date('2024-01-10'), 100, 5, 0),
    ];

    const calibration = deriveCalibration('bench', benchSets, []);

    expect(calibration).toBe(1.0);
  });

  it('should return 1.0 when no sets exist', () => {
    const benchTested = createTestedOneRm('test1', 'bench', new Date('2024-01-13'), 120);

    const calibration = deriveCalibration('bench', [], [benchTested]);

    expect(calibration).toBe(1.0);
  });
});

describe('B2.4.3 - applyCalibrationWithUserCalibration', () => {
  it('should apply per-lift calibration correctly', () => {
    const calibration = createUserCalibration();
    calibration.bench = 1.1;
    calibration.squat = 0.95;
    calibration.deadlift = 1.05;

    const benchEstimate = 100;
    const squatEstimate = 150;
    const deadliftEstimate = 200;

    const benchCalibrated = applyCalibrationWithUserCalibration(benchEstimate, 'bench', calibration);
    const squatCalibrated = applyCalibrationWithUserCalibration(squatEstimate, 'squat', calibration);
    const deadliftCalibrated = applyCalibrationWithUserCalibration(deadliftEstimate, 'deadlift', calibration);

    // Bench: 100 * 1.1 = 110
    expect(benchCalibrated).toBeCloseTo(110, 5);

    // Squat: 150 * 0.95 = 142.5
    expect(squatCalibrated).toBeCloseTo(142.5, 5);

    // Deadlift: 200 * 1.05 = 210
    expect(deadliftCalibrated).toBeCloseTo(210, 5);
  });

  it('should not affect other lifts when applying calibration', () => {
    const calibration = createUserCalibration();
    calibration.bench = 1.2; // 20% increase for bench
    calibration.squat = 1.0; // No change for squat

    const benchEstimate = 100;
    const squatEstimate = 100;

    const benchCalibrated = applyCalibrationWithUserCalibration(benchEstimate, 'bench', calibration);
    const squatCalibrated = applyCalibrationWithUserCalibration(squatEstimate, 'squat', calibration);

    // Bench should be increased
    expect(benchCalibrated).toBe(120);

    // Squat should be unchanged
    expect(squatCalibrated).toBe(100);
  });
});

describe('B2.4 - Cross-Lift Contamination Prevention', () => {
  const baseDate = new Date('2024-01-15');
  const mockProfile = createUserProfile(25, 'male', 80);

  it('should prevent bench sets from affecting squat estimates', () => {
    const benchSets = [
      createTrainingSet('bench1', 'bench', new Date('2024-01-10'), 50, 5, 0), // Low weight
      createTrainingSet('bench2', 'bench', new Date('2024-01-12'), 50, 5, 0),
    ];

    const squatSets = [
      createTrainingSet('squat1', 'squat', new Date('2024-01-10'), 150, 5, 0), // High weight
      createTrainingSet('squat2', 'squat', new Date('2024-01-12'), 150, 5, 0),
    ];

    // Estimate squat with mixed sets
    const squatResult = estimateBaselineForLift(
      'squat',
      [...benchSets, ...squatSets], // Mixed
      [],
      createUserCalibration(),
      mockProfile,
      baseDate
    );

    // Estimate squat with only squat sets
    const squatResultOnly = estimateBaselineForLift(
      'squat',
      squatSets, // Only squat
      [],
      createUserCalibration(),
      mockProfile,
      baseDate
    );

    // Results should be identical (proving bench sets were filtered out)
    expect(squatResult.baseline1Rm).toBeCloseTo(squatResultOnly.baseline1Rm, 1);
  });

  it('should prevent tested 1RMs from different lifts from affecting each other', () => {
    const benchSet = createTrainingSet('bench1', 'bench', new Date('2024-01-10'), 100, 5, 0);
    const squatSet = createTrainingSet('squat1', 'squat', new Date('2024-01-10'), 150, 5, 0);

    const benchTested = createTestedOneRm('test1', 'bench', new Date('2024-01-13'), 120);
    const squatTested = createTestedOneRm('test2', 'squat', new Date('2024-01-13'), 180);

    // Estimate bench with mixed tested 1RMs
    const benchResult = estimateBaselineForLift(
      'bench',
      [benchSet],
      [benchTested, squatTested], // Mixed
      createUserCalibration(),
      mockProfile,
      baseDate
    );

    // Estimate bench with only bench tested 1RM
    const benchResultOnly = estimateBaselineForLift(
      'bench',
      [benchSet],
      [benchTested], // Only bench
      createUserCalibration(),
      mockProfile,
      baseDate
    );

    // Results should be identical (proving squat tested 1RM was filtered out)
    expect(benchResult.baseline1Rm).toBeCloseTo(benchResultOnly.baseline1Rm, 1);
  });
});


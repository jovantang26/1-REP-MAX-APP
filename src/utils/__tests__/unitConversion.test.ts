/**
 * Unit tests for unit conversion utilities (B3.1.2)
 * 
 * Tests:
 * - lbsToKg conversion accuracy
 * - kgToLbs conversion accuracy
 * - Rounding behavior (2 decimal places)
 * - Error handling for invalid inputs
 * - Round-trip conversion accuracy
 */

import { lbsToKg, kgToLbs } from '../unitConversion';

describe('B3.1.2 - lbsToKg', () => {
  it('should convert pounds to kilograms correctly', () => {
    // 100 lbs = ~45.36 kg
    const result = lbsToKg(100);
    expect(result).toBeCloseTo(45.36, 1);
  });

  it('should round to 2 decimal places', () => {
    const result = lbsToKg(1);
    // 1 lb = 0.453592... kg, rounded to 0.45
    expect(result).toBe(0.45);
    
    // Check that result has at most 2 decimal places
    const decimalPlaces = (result.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  it('should handle common weight values', () => {
    expect(lbsToKg(135)).toBeCloseTo(61.23, 1); // Common bench weight
    expect(lbsToKg(225)).toBeCloseTo(102.06, 1); // Common bench weight
    expect(lbsToKg(315)).toBeCloseTo(142.88, 1); // Common squat weight
  });

  it('should throw error for invalid inputs', () => {
    expect(() => lbsToKg(-1)).toThrow('lbs must be a positive number');
    expect(() => lbsToKg(0)).toThrow('lbs must be a positive number');
    expect(() => lbsToKg(NaN)).toThrow('lbs must be a positive number');
    expect(() => lbsToKg(Infinity)).toThrow('lbs must be a positive number');
  });
});

describe('B3.1.2 - kgToLbs', () => {
  it('should convert kilograms to pounds correctly', () => {
    // 100 kg = ~220.46 lbs
    const result = kgToLbs(100);
    expect(result).toBeCloseTo(220.46, 1);
  });

  it('should round to 2 decimal places', () => {
    const result = kgToLbs(1);
    // 1 kg = 2.204622... lbs, rounded to 2.20
    expect(result).toBe(2.20);
    
    // Check that result has at most 2 decimal places
    const decimalPlaces = (result.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  it('should handle common weight values', () => {
    expect(kgToLbs(60)).toBeCloseTo(132.28, 1);
    expect(kgToLbs(100)).toBeCloseTo(220.46, 1);
    expect(kgToLbs(150)).toBeCloseTo(330.69, 1);
  });

  it('should throw error for invalid inputs', () => {
    expect(() => kgToLbs(-1)).toThrow('kg must be a positive number');
    expect(() => kgToLbs(0)).toThrow('kg must be a positive number');
    expect(() => kgToLbs(NaN)).toThrow('kg must be a positive number');
    expect(() => kgToLbs(Infinity)).toThrow('kg must be a positive number');
  });
});

describe('B3.1.2 - Round-trip conversion', () => {
  it('should maintain accuracy in round-trip conversions', () => {
    const originalLbs = 225;
    const kg = lbsToKg(originalLbs);
    const backToLbs = kgToLbs(kg);
    
    // Round-trip should be very close (within rounding error)
    expect(backToLbs).toBeCloseTo(originalLbs, 0);
  });

  it('should maintain accuracy for kg → lbs → kg', () => {
    const originalKg = 100;
    const lbs = kgToLbs(originalKg);
    const backToKg = lbsToKg(lbs);
    
    // Round-trip should be very close (within rounding error)
    expect(backToKg).toBeCloseTo(originalKg, 1);
  });
});


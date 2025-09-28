import { describe, it, expect } from 'vitest';
import { toCents, toMajor, isValidCents, toCentsSafe, toMajorSafe } from './money.js';

describe('toCents', () => {
  it('converts numbers to cents', () => {
    expect(toCents(1)).toBe(100);
    expect(toCents(1.23)).toBe(123);
    expect(toCents(0.01)).toBe(1);
    expect(toCents(0.005)).toBe(1); // rounds up
    expect(toCents(0.004)).toBe(0); // rounds down
  });

  it('converts strings to cents', () => {
    expect(toCents('1')).toBe(100);
    expect(toCents('1.23')).toBe(123);
    expect(toCents('$1.23')).toBe(123);
    expect(toCents('$1,234.56')).toBe(123456);
    expect(toCents('  $1,234.56  ')).toBe(123456);
  });

  it('handles edge cases', () => {
    expect(toCents(0)).toBe(0);
    expect(toCents('0')).toBe(0);
    expect(toCents('$0.00')).toBe(0);
  });

  it('throws on invalid input', () => {
    expect(() => toCents('invalid')).toThrow('Invalid money string');
    expect(() => toCents(NaN)).toThrow('Invalid money value');
    expect(() => toCents(Infinity)).toThrow('Invalid money value');
  });
});

describe('toMajor', () => {
  it('converts cents to formatted currency', () => {
    expect(toMajor(100)).toBe('$1.00');
    expect(toMajor(123)).toBe('$1.23');
    expect(toMajor(123456)).toBe('$1,234.56');
    expect(toMajor(0)).toBe('$0.00');
  });

  it('handles different locales and currencies', () => {
    expect(toMajor(123456, 'en-US', 'USD')).toBe('$1,234.56');
    expect(toMajor(123456, 'en-GB', 'GBP')).toBe('£1,234.56');
    // Note: Locale formatting can vary by system, so we test that it contains the expected elements
    const germanFormat = toMajor(123456, 'de-DE', 'EUR');
    expect(germanFormat).toContain('1.234,56');
    expect(germanFormat).toContain('€');
  });

  it('throws on invalid input', () => {
    expect(() => toMajor(NaN)).toThrow('Invalid cents value');
    expect(() => toMajor('invalid' as any)).toThrow('Invalid cents value');
  });
});

describe('isValidCents', () => {
  it('validates cents correctly', () => {
    expect(isValidCents(100)).toBe(true);
    expect(isValidCents(0)).toBe(true);
    expect(isValidCents(123456)).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidCents(-1)).toBe(false);
    expect(isValidCents(1.5)).toBe(false);
    expect(isValidCents(NaN)).toBe(false);
    expect(isValidCents('100')).toBe(false);
    expect(isValidCents(null)).toBe(false);
    expect(isValidCents(undefined)).toBe(false);
  });
});

describe('toCentsSafe', () => {
  it('converts valid values', () => {
    expect(toCentsSafe(1.23)).toBe(123);
    expect(toCentsSafe('$1.23')).toBe(123);
  });

  it('returns fallback for invalid values', () => {
    expect(toCentsSafe('invalid')).toBe(0);
    expect(toCentsSafe('invalid', 999)).toBe(999);
    expect(toCentsSafe(NaN)).toBe(0);
  });
});

describe('toMajorSafe', () => {
  it('converts valid values', () => {
    expect(toMajorSafe(123)).toBe('$1.23');
    expect(toMajorSafe(0)).toBe('$0.00');
  });

  it('returns fallback for invalid values', () => {
    expect(toMajorSafe(NaN)).toBe('$0.00');
    expect(toMajorSafe(NaN, 'N/A')).toBe('N/A');
  });
});

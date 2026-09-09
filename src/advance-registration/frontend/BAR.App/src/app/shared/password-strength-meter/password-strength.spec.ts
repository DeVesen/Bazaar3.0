import { describe, it, expect } from 'vitest';
import { computePasswordStrength } from './password-strength';

describe('computePasswordStrength', () => {
  it('returns weak for short or single-type passwords', () => {
    expect(computePasswordStrength('abc')).toBe('weak');
    expect(computePasswordStrength('abcdefgh')).toBe('weak'); // nur Kleinbuchstaben
  });

  it('returns medium for 8+ chars with 2 character types', () => {
    expect(computePasswordStrength('abcdefg1')).toBe('medium');
  });

  it('returns strong for 10+ chars, all 4 types, at least 2 special chars', () => {
    expect(computePasswordStrength('Abcdefg1!!')).toBe('strong');
  });

  it('returns medium (not strong) with only 1 special char even if long enough', () => {
    expect(computePasswordStrength('Abcdefg1!')).toBe('medium');
  });
});

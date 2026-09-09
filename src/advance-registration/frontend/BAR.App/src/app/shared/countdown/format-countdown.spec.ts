import { describe, it, expect } from 'vitest';
import { computeRemainingTime, formatDateLabel, formatDaysLabel, pad2 } from './format-countdown';

describe('computeRemainingTime', () => {
  it('breaks down the remaining time into days/hours/minutes/seconds', () => {
    const now = new Date('2026-09-05T00:00:00Z');
    const target = new Date('2026-09-08T14:32:07Z'); // 3 Tage, 14:32:07

    expect(computeRemainingTime(target, now)).toEqual({ days: 3, hours: 14, minutes: 32, seconds: 7 });
  });

  it('clamps to zero when targetDate is in the past (no negative values)', () => {
    const now = new Date('2026-09-09T12:00:00Z');
    const target = new Date('2026-09-01T00:00:00Z');

    expect(computeRemainingTime(target, now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('clamps to zero when targetDate equals now', () => {
    const now = new Date('2026-09-09T12:00:00Z');

    expect(computeRemainingTime(now, now)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe('pad2', () => {
  it('zero-pads single-digit values', () => {
    expect(pad2(0)).toBe('00');
    expect(pad2(7)).toBe('07');
  });

  it('leaves two-digit values unchanged', () => {
    expect(pad2(14)).toBe('14');
    expect(pad2(59)).toBe('59');
  });
});

describe('formatDaysLabel', () => {
  it('uses singular "Tag" for exactly 1 day', () => {
    expect(formatDaysLabel(1)).toBe('1 Tag');
  });

  it('uses plural "Tage" for 0 and for values other than 1', () => {
    expect(formatDaysLabel(0)).toBe('0 Tage');
    expect(formatDaysLabel(3)).toBe('3 Tage');
    expect(formatDaysLabel(21)).toBe('21 Tage');
  });

  it('renders days without a leading zero', () => {
    expect(formatDaysLabel(3)).not.toMatch(/^0/);
  });
});

describe('formatDateLabel', () => {
  it('formats the date as German "EEEE, dd.MM.yyyy"', () => {
    // 2026-09-05 ist ein Samstag
    const date = new Date('2026-09-05T10:00:00Z');

    expect(formatDateLabel(date)).toBe('Samstag, 05.09.2026');
  });
});

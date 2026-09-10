import { describe, it, expect } from 'vitest';
import de from '../../public/i18n/de.json';
import en from '../../public/i18n/en.json';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null ? collectKeys(value as Record<string, unknown>, path) : [path];
  });
}

describe('i18n key parity', () => {
  it('de.json and en.json declare exactly the same keys', () => {
    expect(collectKeys(en).sort()).toEqual(collectKeys(de).sort());
  });
});

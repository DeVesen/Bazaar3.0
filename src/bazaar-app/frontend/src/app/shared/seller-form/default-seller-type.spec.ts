import { pickDefaultSellerType } from './default-seller-type';

describe('pickDefaultSellerType', () => {
  const types = [
    { id: 'A', sellerCount: 2 },
    { id: 'B', sellerCount: 5 },
    { id: 'C', sellerCount: 5 },
  ];

  it('returns null when there are no types', () => {
    expect(pickDefaultSellerType([], 'A')).toBeNull();
  });

  it('returns the configured type when it exists', () => {
    expect(pickDefaultSellerType(types, 'A')?.id).toBe('A');
  });

  it('falls back to the most assigned type when nothing is configured', () => {
    expect(pickDefaultSellerType(types, null)?.id).toBe('B');
  });

  it('falls back to the most assigned type when the configured type no longer exists', () => {
    expect(pickDefaultSellerType(types, 'GONE')?.id).toBe('B');
  });
});

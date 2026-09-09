import { TokenStore } from './token-store';

describe('TokenStore', () => {
  beforeEach(() => localStorage.clear());

  it('stores and retrieves the access token', () => {
    const store = new TokenStore();
    store.setToken('abc');
    expect(store.getToken()).toBe('abc');
  });

  it('stores and retrieves the refresh token', () => {
    const store = new TokenStore();
    store.setRefreshToken('refresh-abc');
    expect(store.getRefreshToken()).toBe('refresh-abc');
  });

  it('stores and retrieves the active role', () => {
    const store = new TokenStore();
    store.setActiveRole('admin');
    expect(store.getActiveRole()).toBe('admin');
  });

  it('returns null for unset values', () => {
    const store = new TokenStore();
    expect(store.getToken()).toBeNull();
  });

  it('clear() removes all three keys', () => {
    const store = new TokenStore();
    store.setToken('abc');
    store.setRefreshToken('def');
    store.setActiveRole('admin');
    store.clear();
    expect(store.getToken()).toBeNull();
    expect(store.getRefreshToken()).toBeNull();
    expect(store.getActiveRole()).toBeNull();
  });
});

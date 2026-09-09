import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStore } from './token-store';

function fakeToken(payload: unknown): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('AuthService', () => {
  let navigateByUrl: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    navigateByUrl = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigateByUrl } }]
    });
  });

  it('has no current user when no token is stored', () => {
    const service = TestBed.inject(AuthService);
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('decodes a stored non-expired token as the current user on construction', () => {
    const store = TestBed.inject(TokenStore);
    store.setToken(fakeToken({ sub: 'user-1', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 }));
    const service = TestBed.inject(AuthService);
    expect(service.currentUser()).toEqual(expect.objectContaining({ sub: 'user-1', role: 'admin' }));
    expect(service.isLoggedIn()).toBe(true);
  });

  it('treats an expired token as logged out', () => {
    const store = TestBed.inject(TokenStore);
    store.setToken(fakeToken({ sub: 'user-1', role: 'admin', exp: Math.floor(Date.now() / 1000) - 3600 }));
    const service = TestBed.inject(AuthService);
    expect(service.isLoggedIn()).toBe(false);
  });

  it('login() stores both tokens and sets currentUser', () => {
    const service = TestBed.inject(AuthService);
    const token = fakeToken({ sub: 'user-2', role: 'seller', exp: Math.floor(Date.now() / 1000) + 3600 });
    service.login(token, 'refresh-token-value');
    expect(service.currentUser()?.sub).toBe('user-2');
    expect(TestBed.inject(TokenStore).getRefreshToken()).toBe('refresh-token-value');
  });

  it('logout() clears storage and currentUser', () => {
    const service = TestBed.inject(AuthService);
    service.login(fakeToken({ sub: 'user-2', role: 'seller', exp: Math.floor(Date.now() / 1000) + 3600 }), 'r');
    service.logout();
    expect(service.currentUser()).toBeNull();
    expect(TestBed.inject(TokenStore).getToken()).toBeNull();
  });

  it('logout() navigates to /login', () => {
    const service = TestBed.inject(AuthService);
    service.logout();
    expect(navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('logout() runs every registered reset hook', () => {
    const service = TestBed.inject(AuthService);
    const reset = vi.fn();
    service.registerLogoutReset(reset);
    service.logout();
    expect(reset).toHaveBeenCalledTimes(1);
  });
});

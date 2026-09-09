import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RoleService } from './role.service';
import { TokenStore } from './token-store';
import { AuthService } from './auth.service';

function fakeToken(payload: unknown): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('RoleService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigateByUrl: vi.fn().mockResolvedValue(true) } }]
    });
  });

  it('defaults activeRole to the JWT role when no toggle was ever set', () => {
    TestBed.inject(TokenStore).setToken(
      fakeToken({ sub: 'u', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })
    );
    TestBed.inject(AuthService);
    const roleService = TestBed.inject(RoleService);
    expect(roleService.activeRole()).toBe('admin');
  });

  it('restores a previously toggled role from TokenStore', () => {
    TestBed.inject(TokenStore).setActiveRole('seller');
    const roleService = TestBed.inject(RoleService);
    expect(roleService.activeRole()).toBe('seller');
  });

  it('setRole updates the signal and persists to TokenStore', () => {
    const roleService = TestBed.inject(RoleService);
    roleService.setRole('seller');
    expect(roleService.activeRole()).toBe('seller');
    expect(TestBed.inject(TokenStore).getActiveRole()).toBe('seller');
  });

  it('resets activeRole to the default when AuthService logs out', () => {
    TestBed.inject(TokenStore).setActiveRole('admin');
    const roleService = TestBed.inject(RoleService);
    expect(roleService.activeRole()).toBe('admin');

    TestBed.inject(AuthService).logout();

    expect(roleService.activeRole()).toBe('seller');
    expect(TestBed.inject(TokenStore).getActiveRole()).toBeNull();
  });
});

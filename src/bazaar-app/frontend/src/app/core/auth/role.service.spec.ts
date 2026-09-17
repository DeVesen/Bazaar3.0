import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { RoleService } from './role.service';

describe('RoleService', () => {
  it('isAdmin is true when AuthService reports the admin role', () => {
    const authService = { role: () => 'admin' } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const roleService = TestBed.inject(RoleService);
    expect(roleService.isAdmin()).toBe(true);
  });

  it('isAdmin is false when AuthService reports the cashier role', () => {
    const authService = { role: () => 'cashier' } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const roleService = TestBed.inject(RoleService);
    expect(roleService.isAdmin()).toBe(false);
  });

  it('isAdmin is false when no user is logged in', () => {
    const authService = { role: () => null } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const roleService = TestBed.inject(RoleService);
    expect(roleService.isAdmin()).toBe(false);
  });
});

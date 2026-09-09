import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

describe('adminGuard', () => {
  it('allows navigation for an admin', () => {
    const authService = { currentUser: () => ({ role: 'admin' }) } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = {} as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => adminGuard(route, state));
    expect(result).toBe(true);
  });

  it('redirects a non-admin to /home', () => {
    const authService = { currentUser: () => ({ role: 'seller' }) } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const router = TestBed.inject(Router);
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = {} as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => adminGuard(route, state));
    expect(router.serializeUrl(result as UrlTree)).toBe('/home');
  });
});

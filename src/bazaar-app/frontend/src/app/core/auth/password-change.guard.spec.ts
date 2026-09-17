import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { passwordChangeGuard } from './password-change.guard';
import { AuthService } from './auth.service';

describe('passwordChangeGuard', () => {
  it('redirects to /change-password when mustChangePassword is true and target is not /change-password', () => {
    const authService = { mustChangePassword: () => true } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const router = TestBed.inject(Router);
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = { url: '/intake' } as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => passwordChangeGuard(route, state));
    const tree = router.serializeUrl(result as UrlTree);
    expect(tree).toBe('/change-password');
  });

  it('allows navigation when mustChangePassword is true and target already is /change-password', () => {
    const authService = { mustChangePassword: () => true } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = { url: '/change-password' } as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => passwordChangeGuard(route, state));
    expect(result).toBe(true);
  });

  it('allows navigation regardless of target url when mustChangePassword is false', () => {
    const authService = { mustChangePassword: () => false } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = { url: '/settings' } as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => passwordChangeGuard(route, state));
    expect(result).toBe(true);
  });
});

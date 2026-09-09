import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  it('allows navigation when logged in', () => {
    const authService = { isLoggedIn: () => true } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = { url: '/profile' } as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBe(true);
  });

  it('redirects to /login with returnUrl when not logged in', () => {
    const authService = { isLoggedIn: () => false } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const router = TestBed.inject(Router);
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = { url: '/profile' } as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard(route, state));
    const tree = router.serializeUrl(result as UrlTree);
    expect(tree).toBe('/login?returnUrl=%2Fprofile');
  });
});

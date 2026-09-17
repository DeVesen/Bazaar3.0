import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { guestGuard } from './guest.guard';
import { AuthService } from './auth.service';

describe('guestGuard', () => {
  it('allows navigation when not logged in', () => {
    const authService = { isLoggedIn: () => false } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = {} as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => guestGuard(route, state));
    expect(result).toBe(true);
  });

  it('redirects to /intake when already logged in', () => {
    const authService = { isLoggedIn: () => true } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const router = TestBed.inject(Router);
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = {} as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => guestGuard(route, state));
    const tree = router.serializeUrl(result as UrlTree);
    expect(tree).toBe('/intake');
  });
});

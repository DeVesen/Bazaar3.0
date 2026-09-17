import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

describe('adminGuard', () => {
  it('allows navigation for admin role', () => {
    const authService = { role: () => 'admin' } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = {} as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => adminGuard(route, state));
    expect(result).toBe(true);
  });

  it('redirects to /intake for non-admin role', () => {
    const authService = { role: () => 'cashier' } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const router = TestBed.inject(Router);
    const route = {} as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
    const state = {} as Partial<RouterStateSnapshot> as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => adminGuard(route, state));
    const tree = router.serializeUrl(result as UrlTree);
    expect(tree).toBe('/intake');
  });
});

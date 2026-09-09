import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  it('allows navigation when logged in', () => {
    const authService = { isLoggedIn: () => true } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/profile' } as any)
    );
    expect(result).toBe(true);
  });

  it('redirects to /login with returnUrl when not logged in', () => {
    const authService = { isLoggedIn: () => false } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/profile' } as any)
    );
    const tree = router.serializeUrl(result as any);
    expect(tree).toBe('/login?returnUrl=%2Fprofile');
  });
});

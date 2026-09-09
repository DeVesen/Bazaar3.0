import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

describe('adminGuard', () => {
  it('allows navigation for an admin', () => {
    const authService = { currentUser: () => ({ role: 'admin' }) } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects a non-admin to /home', () => {
    const authService = { currentUser: () => ({ role: 'seller' }) } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(router.serializeUrl(result as any)).toBe('/home');
  });
});

import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { BootstrapStatusService } from './core/bootstrap/bootstrap-status.service';

describe('app.routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: { isLoggedIn: () => false, currentUser: () => null } },
        // /login is guarded by noAdminGuard, which calls BootstrapStatusService (HTTP) —
        // stub it like AuthService above so these routing tests stay HTTP-free.
        { provide: BootstrapStatusService, useValue: { hasAdmin: () => of(true) } }
      ]
    });
  });

  it('redirects / to /home which then redirects to /login (not logged in)', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigateByUrl('/');
    expect(location.path()).toContain('/login');
  });

  it('sends an unknown route through the guard to /login (not logged in)', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigateByUrl('/does-not-exist');
    expect(location.path()).toContain('/login');
  });

  it('keeps /embed/countdown outside the guarded shell', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigateByUrl('/embed/countdown');
    expect(location.path()).toBe('/embed/countdown');
  });
});

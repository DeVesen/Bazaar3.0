import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';

describe('app.routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: { isLoggedIn: () => false, currentUser: () => null } }
      ]
    });
  });

  it('redirects / to /home which then redirects to /login (not logged in)', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigateByUrl('/');
    expect(location.path()).toContain('/login');
  });

  it('redirects an unknown route to the not-found page content', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/does-not-exist');
    expect(router.url).toBe('/does-not-exist');
  });

  it('keeps /embed/countdown outside the guarded shell', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigateByUrl('/embed/countdown');
    expect(location.path()).toBe('/embed/countdown');
  });
});

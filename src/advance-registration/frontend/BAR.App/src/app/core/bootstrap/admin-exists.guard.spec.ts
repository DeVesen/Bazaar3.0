import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, convertToParamMap } from '@angular/router';
import { Observable, of, firstValueFrom } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { BootstrapStatusService } from './bootstrap-status.service';
import { adminExistsGuard } from './admin-exists.guard';

describe('adminExistsGuard', () => {
  const route = { paramMap: convertToParamMap({}) } as Partial<ActivatedRouteSnapshot> as ActivatedRouteSnapshot;
  const state = { url: '/bootstrap-admin' } as Partial<RouterStateSnapshot> as RouterStateSnapshot;

  function setUp(hasAdmin: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: BootstrapStatusService, useValue: { hasAdmin: () => of(hasAdmin) } },
        { provide: Router, useValue: { createUrlTree: vi.fn().mockReturnValue('url-tree') } }
      ]
    });
  }

  it('allows navigation when no admin exists yet', async () => {
    setUp(false);
    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() => adminExistsGuard(route, state) as Observable<boolean | UrlTree>)
    );
    expect(result).toBe(true);
  });

  it('redirects to /login once an admin already exists (F2: locked permanently)', async () => {
    setUp(true);
    const router = TestBed.inject(Router);
    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() => adminExistsGuard(route, state) as Observable<boolean | UrlTree>)
    );
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe('url-tree');
  });
});

import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';
import { noAdminGuard } from './no-admin.guard';

describe('noAdminGuard', () => {
  const route: any = { paramMap: convertToParamMap({}) };
  const state: any = { url: '/login' };

  function setUp(hasAdmin: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: BootstrapStatusService, useValue: { hasAdmin: () => of(hasAdmin) } },
        { provide: Router, useValue: { createUrlTree: vi.fn().mockReturnValue('url-tree') } }
      ]
    });
  }

  it('allows navigation when an admin already exists', async () => {
    setUp(true);
    const result = await firstValueFrom(TestBed.runInInjectionContext(() => noAdminGuard(route, state) as any));
    expect(result).toBe(true);
  });

  it('redirects to /bootstrap-admin when no admin exists yet', async () => {
    setUp(false);
    const router = TestBed.inject(Router);
    const result = await firstValueFrom(TestBed.runInInjectionContext(() => noAdminGuard(route, state) as any));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/bootstrap-admin']);
    expect(result).toBe('url-tree');
  });
});

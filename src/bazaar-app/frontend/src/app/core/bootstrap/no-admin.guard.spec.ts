import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { noAdminGuard } from './no-admin.guard';
import { BootstrapStatusService } from './bootstrap-status.service';

describe('noAdminGuard', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  function setup(status: { hasAdmin: boolean } | 'error'): Observable<boolean | UrlTree> {
    const bootstrapStatus = {
      getStatus: () => (status === 'error' ? throwError(() => new Error('down')) : of(status)),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: BootstrapStatusService, useValue: bootstrapStatus }],
    });
    return TestBed.runInInjectionContext(() => noAdminGuard({} as never, {} as never)) as Observable<boolean | UrlTree>;
  }

  it('allows navigation when an admin already exists', async () => {
    const result = await firstValueFrom(setup({ hasAdmin: true }));
    expect(result).toBe(true);
  });

  it('redirects to /setup when no admin exists yet', async () => {
    const result = await firstValueFrom(setup({ hasAdmin: false }));
    const router = TestBed.inject(Router);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/setup');
  });

  it('fails open (allows navigation) when the status check errors', async () => {
    const result = await firstValueFrom(setup('error'));
    expect(result).toBe(true);
  });
});

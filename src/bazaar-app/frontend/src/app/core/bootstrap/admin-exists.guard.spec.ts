import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, firstValueFrom, throwError, Observable } from 'rxjs';
import { adminExistsGuard } from './admin-exists.guard';
import { BootstrapStatusService } from './bootstrap-status.service';

describe('adminExistsGuard', () => {
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
    return TestBed.runInInjectionContext(() => adminExistsGuard({} as never, {} as never)) as Observable<boolean | UrlTree>;
  }

  it('redirects to /login when an admin already exists', async () => {
    const result = await firstValueFrom(setup({ hasAdmin: true }));
    const router = TestBed.inject(Router);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('allows navigation to /setup when no admin exists yet', async () => {
    const result = await firstValueFrom(setup({ hasAdmin: false }));
    expect(result).toBe(true);
  });

  it('fails open (allows navigation) when the status check errors', async () => {
    const result = await firstValueFrom(setup('error'));
    expect(result).toBe(true);
  });
});

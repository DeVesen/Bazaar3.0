import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true (stub behavior)', () => {
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as never, { url: '/' } as never),
    );
    expect(result).toBe(true);
  });
});

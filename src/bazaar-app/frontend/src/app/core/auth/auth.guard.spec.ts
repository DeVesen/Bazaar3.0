import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should return true (stub behavior)', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/' } as never),
    );
    expect(result).toBe(true);
  });
});

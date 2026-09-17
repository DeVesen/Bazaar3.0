import { TestBed } from '@angular/core/testing';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should return true (stub behavior)', () => {
    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as never, { url: '/' } as never),
    );
    expect(result).toBe(true);
  });
});

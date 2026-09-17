import { TestBed } from '@angular/core/testing';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should return true (stub behavior)', () => {
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as never, { url: '/login' } as never),
    );
    expect(result).toBe(true);
  });
});

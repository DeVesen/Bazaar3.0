import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shell } from './shell';

function mockMatchMedia(matches: boolean): {
  listeners: ((event: MediaQueryListEvent) => void)[];
  mql: MediaQueryList;
} {
  const listeners: ((event: MediaQueryListEvent) => void)[] = [];
  const mql = {
    matches,
    media: '(max-width: 768px)',
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.push(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    },
  } as unknown as MediaQueryList;
  return { listeners, mql };
}

describe('Shell', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('instantiates without errors', () => {
    const { mql } = mockMatchMedia(false);
    window.matchMedia = () => mql;

    const fixture = TestBed.createComponent(Shell);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('sets isMobile true and closes the sidebar on a mobile-width viewport', () => {
    const { mql } = mockMatchMedia(true);
    window.matchMedia = () => mql;

    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();

    expect(fixture.componentInstance.isMobile()).toBe(true);
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('sets isMobile false and keeps the sidebar open on a desktop-width viewport', () => {
    const { mql } = mockMatchMedia(false);
    window.matchMedia = () => mql;

    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();

    expect(fixture.componentInstance.isMobile()).toBe(false);
    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('reacts to a matchMedia change event by toggling isMobile and open', () => {
    const { mql, listeners } = mockMatchMedia(false);
    window.matchMedia = () => mql;

    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    expect(fixture.componentInstance.isMobile()).toBe(false);

    listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));

    expect(fixture.componentInstance.isMobile()).toBe(true);
    expect(fixture.componentInstance.open()).toBe(false);
  });
});

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadMoreSentinel } from './load-more-sentinel';

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();

  constructor(private readonly callback: IntersectionObserverCallback) {
    IntersectionObserverMock.instances.push(this);
  }

  fire(isIntersecting: boolean): void {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

@Component({
  selector: 'app-sentinel-host',
  imports: [LoadMoreSentinel],
  template: `<div [appLoadMoreSentinel]="count()" (reached)="reached = reached + 1"></div>`,
})
class SentinelHost {
  readonly count = signal(0);
  reached = 0;
}

describe('LoadMoreSentinel', () => {
  beforeEach(() => {
    IntersectionObserverMock.instances = [];
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function create() {
    await TestBed.configureTestingModule({ imports: [SentinelHost] }).compileComponents();
    const fixture = TestBed.createComponent(SentinelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('emits reached when the sentinel becomes visible', async () => {
    const fixture = await create();

    IntersectionObserverMock.instances[0].fire(true);

    expect(fixture.componentInstance.reached).toBe(1);
  });

  it('does not emit while the sentinel is out of view', async () => {
    const fixture = await create();

    IntersectionObserverMock.instances[0].fire(false);

    expect(fixture.componentInstance.reached).toBe(0);
  });

  it('re-observes when the trigger input changes (list still too short to scroll)', async () => {
    const fixture = await create();
    const observer = IntersectionObserverMock.instances[0];
    const before = observer.observe.mock.calls.length;

    fixture.componentInstance.count.set(60);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(observer.unobserve).toHaveBeenCalled();
    expect(observer.observe.mock.calls.length).toBe(before + 1);
  });

  it('disconnects on destroy', async () => {
    const fixture = await create();
    const observer = IntersectionObserverMock.instances[0];

    fixture.destroy();

    expect(observer.disconnect).toHaveBeenCalled();
  });
});

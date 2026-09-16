import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { MasterDataFilterToolbar } from './master-data-filter-toolbar';

function mockMatchMedia(matches: boolean) {
  const listeners: ((event: MediaQueryListEvent) => void)[] = [];
  const mql = {
    matches,
    addEventListener: (_: 'change', listener: (event: MediaQueryListEvent) => void) => listeners.push(listener),
    removeEventListener: () => undefined
  } as unknown as MediaQueryList;
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    setMatches: (value: boolean) => listeners.forEach((listener) => listener({ matches: value } as MediaQueryListEvent))
  };
}

function create(showOriginalFilter = false, mobile = false, canAdd = false) {
  const media = mockMatchMedia(mobile);
  TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  const fixture = TestBed.createComponent(MasterDataFilterToolbar);
  fixture.componentRef.setInput('showOriginalFilter', showOriginalFilter);
  fixture.componentRef.setInput('canAdd', canAdd);
  fixture.detectChanges();
  return { fixture, media };
}

describe('MasterDataFilterToolbar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not emit while typing in the free-text field (debounce not yet elapsed)', () => {
    const { fixture } = create();
    const emitted: unknown[] = [];
    fixture.componentInstance.filterChange.subscribe((v: unknown) => emitted.push(v));

    fixture.componentInstance.searchTextModel = 'jack';

    expect(emitted.length).toBe(0);
  });

  it('emits the search value 300ms after typing stops', () => {
    const { fixture } = create();
    const emitted: unknown[] = [];
    fixture.componentInstance.filterChange.subscribe((v: unknown) => emitted.push(v));

    fixture.componentInstance.searchTextModel = 'jack';
    vi.advanceTimersByTime(300);

    expect(emitted).toEqual([{ search: 'jack', original: undefined }]);
  });

  it('does not render the original/new select when showOriginalFilter is false', () => {
    const { fixture } = create(false);
    expect(fixture.debugElement.query(By.css('p-select'))).toBeNull();
  });

  it('renders the original/new select when showOriginalFilter is true', () => {
    const { fixture } = create(true);
    expect(fixture.debugElement.query(By.css('p-select'))).not.toBeNull();
  });

  it('selecting an original/new option emits immediately, without debounce', () => {
    const { fixture } = create(true);
    const emitted: unknown[] = [];
    fixture.componentInstance.filterChange.subscribe((v: unknown) => emitted.push(v));

    fixture.componentInstance.originalValueModel = true;

    expect(emitted).toEqual([{ search: undefined, original: true }]);
  });

  it('shows the filter fields inline and no filter button on a desktop-width viewport (>= 768px)', () => {
    const { fixture } = create(true, false);

    expect(fixture.debugElement.query(By.css('[data-testid="filter-button"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('p-select'))).not.toBeNull();
  });

  it('collapses the filter fields into a filter button on a mobile-width viewport (< 768px)', () => {
    const { fixture } = create(true, true);

    expect(fixture.debugElement.query(By.css('[data-testid="filter-button"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('p-select'))).toBeNull();
  });

  it('opens a popover dropdown with the same filter fields when the filter button is clicked', () => {
    const { fixture } = create(true, true);

    fixture.debugElement.query(By.css('[data-testid="filter-button"]')).nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.filterPopover().overlayVisible()).toBe(true);
    expect(fixture.debugElement.query(By.css('[data-testid="filter-popover"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('p-select'))).not.toBeNull();
  });

  it('closes the popover after a filter is triggered from within it on mobile', () => {
    const { fixture } = create(true, true);
    fixture.debugElement.query(By.css('[data-testid="filter-button"]')).nativeElement.click();
    fixture.detectChanges();

    fixture.componentInstance.originalValueModel = true;

    expect(fixture.componentInstance.filterPopover().overlayVisible()).toBe(false);
  });

  it('does not render a popover when the viewport is desktop-width', () => {
    const { fixture } = create(true, false);

    expect(fixture.debugElement.query(By.css('[data-testid="filter-popover"]'))).toBeNull();
  });

  it('does not render the add button when canAdd is false', () => {
    const { fixture } = create(false, false, false);
    expect(fixture.debugElement.query(By.css('[data-testid="add-button"]'))).toBeNull();
  });

  it('renders the add button next to the fields when canAdd is true, on desktop', () => {
    const { fixture } = create(false, false, true);
    expect(fixture.debugElement.query(By.css('[data-testid="add-button"]'))).not.toBeNull();
  });

  it('renders the add button next to the filter button when canAdd is true, on mobile', () => {
    const { fixture } = create(false, true, true);
    expect(fixture.debugElement.query(By.css('[data-testid="add-button"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="filter-button"]'))).not.toBeNull();
  });

  it('emits create when the add button is clicked', () => {
    const { fixture } = create(false, false, true);
    const emitted: unknown[] = [];
    fixture.componentInstance.create.subscribe(() => emitted.push(undefined));

    fixture.debugElement.query(By.css('[data-testid="add-button"]')).nativeElement.click();

    expect(emitted.length).toBe(1);
  });
});

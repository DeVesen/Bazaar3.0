import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NumberBlocksPage } from './NumberBlocksPage';

describe('NumberBlocksPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    vi.stubGlobal('AudioContext', class {
      createOscillator() {
        return {
          type: '',
          frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn()
        };
      }
      destination = {}
      currentTime = 0
    });

    await TestBed.configureTestingModule({
      imports: [NumberBlocksPage],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads blocks on init and renders them', () => {
    const fixture = TestBed.createComponent(NumberBlocksPage);
    fixture.detectChanges();

    const req = httpMock.expectOne('/api/blocks/mine');
    req.flush([{ id: 'b1', sellerId: 's1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3, assignedAt: '2026-08-14T10:00:00+02:00' }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('101');
    expect(fixture.nativeElement.textContent).toContain('10 Nummern · 3 vergeben');
  });

  it('renders the empty state when there are no blocks', () => {
    const fixture = TestBed.createComponent(NumberBlocksPage);
    fixture.detectChanges();

    httpMock.expectOne('/api/blocks/mine').flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Noch keine Nummernblöcke zugewiesen');
  });

  it('shows a load error when the blocks request fails', () => {
    const fixture = TestBed.createComponent(NumberBlocksPage);
    fixture.detectChanges();

    httpMock.expectOne('/api/blocks/mine').flush('Server-Fehler', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.loadError()).toBe('Nummernblöcke konnten nicht geladen werden');
    expect(fixture.nativeElement.textContent).toContain('Nummernblöcke konnten nicht geladen werden');
  });
});

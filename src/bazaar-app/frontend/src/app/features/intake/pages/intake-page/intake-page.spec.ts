import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { IntakePage } from './intake-page';
// eslint-disable-next-line boundaries/dependencies -- see intake-page.ts's own justification
import { SellersApi, SellerSearchResult } from '../../../sellers/data/sellers-api';
import { SellerSearch, SellerSummary } from '../../../../shared/components/seller-search/seller-search';

/**
 * `IntakePage` renders `SellerSearch`, which renders `InputGroup`, which renders
 * `BarcodeScanner` — mocked the same way `seller-search.spec.ts`/`input-group.spec.ts` do so no
 * test here touches real device camera APIs (unavailable in jsdom).
 */
vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(function (this: { decodeFromVideoDevice: () => void }) {
    this.decodeFromVideoDevice = vi.fn();
  }),
}));

function searchResult(overrides: Partial<SellerSearchResult> = {}): SellerSearchResult {
  return {
    id: 'SEL00001',
    firstName: 'Anna',
    lastName: 'Meier',
    city: 'Karlsruhe',
    sellerType: 'Privat',
    settledAt: null,
    ...overrides,
  };
}

describe('IntakePage', () => {
  let search: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    });

    search = vi.fn().mockReturnValue(of([searchResult()]));

    await TestBed.configureTestingModule({
      imports: [IntakePage],
      providers: [{ provide: SellersApi, useValue: { search } }],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(IntakePage);
    fixture.detectChanges();
    return fixture;
  }

  it('loads all sellers on init via SellersApi.search(\'\')', () => {
    create();
    expect(search).toHaveBeenCalledWith('');
  });

  it('maps the search results onto SellerSummary and renders seller-search in the search state', () => {
    const fixture = create();

    expect(fixture.componentInstance.state()).toBe('search');
    const sellerSearch = fixture.debugElement.query(By.directive(SellerSearch));
    expect(sellerSearch).toBeTruthy();
    expect(sellerSearch.componentInstance.sellers()).toEqual([
      { id: 'SEL00001', firstName: 'Anna', lastName: 'Meier', zip: '', city: 'Karlsruhe', settledAt: null },
    ]);
  });

  it('switches to the wizard state with the resolved seller id when sellerSelected fires', () => {
    const fixture = create();
    const seller: SellerSummary = {
      id: 'SEL00001',
      firstName: 'Anna',
      lastName: 'Meier',
      zip: '',
      city: 'Karlsruhe',
      settledAt: null,
    };

    fixture.debugElement.query(By.directive(SellerSearch)).componentInstance.sellerSelected.emit(seller);
    fixture.detectChanges();

    expect(fixture.componentInstance.state()).toBe('wizard');
    expect(fixture.componentInstance.resolvedSellerId()).toBe('SEL00001');
  });

  it('switches to the wizard state (placeholder branch) carrying the search text when createRequested fires', () => {
    const fixture = create();

    fixture.debugElement.query(By.directive(SellerSearch)).componentInstance.createRequested.emit('Neu Person');
    fixture.detectChanges();

    expect(fixture.componentInstance.state()).toBe('wizard');
    expect(fixture.componentInstance.pendingSearchText()).toBe('Neu Person');
    expect(fixture.componentInstance.resolvedSellerId()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Neu Person');
  });

  it('re-fetches sellers when returning to the search state after the wizard closes', () => {
    const fixture = create();
    fixture.debugElement.query(By.directive(SellerSearch)).componentInstance.createRequested.emit('x');
    fixture.detectChanges();
    search.mockClear();

    fixture.componentInstance.onWizardClosed();
    fixture.detectChanges();

    expect(search).toHaveBeenCalledWith('');
    expect(fixture.componentInstance.state()).toBe('search');
  });
});

import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SellerDetailModal } from './seller-detail-modal';
import { SellersStore } from '../../sellers-store';
import { ArticleSummary, SellerCard } from '../../data/sellers-api';

function buildCard(overrides: Partial<SellerCard> = {}): SellerCard {
  return {
    id: 'a3f9c2d1',
    firstName: 'Maria',
    lastName: 'Muster',
    postalCode: '76133',
    city: 'Karlsruhe',
    sellerType: 'Standard',
    status: 'open',
    articleCount: 12,
    releasedCount: 8,
    soldCount: 5,
    returnedCount: 1,
    acceptedValue: 100.5,
    openValue: 20.25,
    revenue: 80.25,
    settledAt: null,
    ...overrides,
  };
}

function buildArticle(overrides: Partial<ArticleSummary> = {}): ArticleSummary {
  return {
    id: 'article-1',
    number: 42,
    name: 'Kinderjacke',
    brand: null,
    category: null,
    size: null,
    color: null,
    price: 12.5,
    status: 'released',
    soldManually: false,
    ...overrides,
  };
}

describe('SellerDetailModal', () => {
  let getArticlesSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getArticlesSpy = vi.fn().mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SellerDetailModal],
      providers: [{ provide: SellersStore, useValue: { getArticles: getArticlesSpy } }],
    }).compileComponents();
  });

  it('renders name, type badge, status badge and the seller id as plain text plus a QR code', async () => {
    const fixture = TestBed.createComponent(SellerDetailModal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('seller', buildCard());
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent ?? '';

    expect(text).toContain('Maria Muster');
    expect(text).toContain('Standard');
    expect(text).toContain('Offen');
    expect(text).toContain('Verkäufernummer: a3f9c2d1');
    expect(compiled.querySelector('app-qr-code svg')).not.toBeNull();
  });

  it('shows the empty-state text when the article list is empty', async () => {
    const fixture = TestBed.createComponent(SellerDetailModal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('seller', buildCard());
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Noch keine Artikel erfasst.',
    );
  });

  it('renders article rows when the list is non-empty', async () => {
    getArticlesSpy.mockReturnValue(of([buildArticle(), buildArticle({ id: 'article-2', number: 43, name: 'Hose', price: 8 })]));

    const fixture = TestBed.createComponent(SellerDetailModal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('seller', buildCard());
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Noch keine Artikel erfasst.');
    expect(compiled.querySelectorAll('tbody tr').length).toBe(2);
    expect(compiled.textContent).toContain('Kinderjacke');
    expect(compiled.textContent).toContain('Hose');
    expect(compiled.textContent).toContain('Freigegeben');
  });

  it('articleTable_serverDeliversAscendingNumbers_rendersRowsInThatOrder', async () => {
    // Arrange
    getArticlesSpy.mockReturnValue(
      of([
        buildArticle({ id: 'article-3', number: 3 }),
        buildArticle({ id: 'article-12', number: 12 }),
        buildArticle({ id: 'article-101', number: 101 }),
      ]),
    );
    const fixture = TestBed.createComponent(SellerDetailModal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('seller', buildCard());

    // Act
    await fixture.whenStable();

    // Assert
    const numberCells = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr td:first-child')).map(
      (cell) => cell.textContent?.trim(),
    );
    expect(numberCells).toEqual(['3', '12', '101']);
  });

  it('calls SellersStore.getArticles(seller.id) when the modal opens for a seller', async () => {
    const fixture = TestBed.createComponent(SellerDetailModal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('seller', buildCard({ id: 'seller-42' }));
    await fixture.whenStable();

    expect(getArticlesSpy).toHaveBeenCalledWith('seller-42');
  });

  it('does not fetch articles while not visible', async () => {
    const fixture = TestBed.createComponent(SellerDetailModal);
    fixture.componentRef.setInput('visible', false);
    fixture.componentRef.setInput('seller', buildCard());
    await fixture.whenStable();

    expect(getArticlesSpy).not.toHaveBeenCalled();
  });

  it('emits visibleChange when the dialog reports a visibility change', async () => {
    const fixture = TestBed.createComponent(SellerDetailModal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('seller', buildCard());
    const component = fixture.componentInstance;
    const visibleChangeSpy = vi.fn();
    component.visibleChange.subscribe(visibleChangeSpy);
    await fixture.whenStable();

    component.onVisibleChange(false);

    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });
});

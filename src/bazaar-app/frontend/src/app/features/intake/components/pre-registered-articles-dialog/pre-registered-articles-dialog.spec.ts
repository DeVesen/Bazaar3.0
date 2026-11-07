import { TestBed } from '@angular/core/testing';
import { PreRegisteredArticle, PreRegisteredArticlesDialog } from './pre-registered-articles-dialog';

const ARTICLES: PreRegisteredArticle[] = [
  { id: 'A1', number: 1, name: 'Sommerkleid', category: 'Kleider', brand: 'Vertbaudet', size: '110', color: 'Rot', price: 8 },
  { id: 'A2', number: 2, name: 'Bagger', category: 'Spielzeug', brand: 'Lego', size: null, color: null, price: 15.5 },
];

describe('PreRegisteredArticlesDialog', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
      }),
    });
  });

  async function setup(articles: PreRegisteredArticle[] = ARTICLES) {
    await TestBed.configureTestingModule({ imports: [PreRegisteredArticlesDialog] }).compileComponents();
    const fixture = TestBed.createComponent(PreRegisteredArticlesDialog);
    fixture.componentRef.setInput('articles', articles);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function rows() {
    return Array.from(document.body.querySelectorAll<HTMLTableRowElement>('.pre-registered-articles-dialog__row'));
  }

  afterEach(() => {
    document.body.querySelectorAll('.p-dialog-mask').forEach((mask) => mask.remove());
  });

  it('shows number, name, category, brand, size, color and price per article', async () => {
    await setup();

    const headers = Array.from(document.body.querySelectorAll('.pre-registered-articles-dialog th')).map((th) =>
      th.textContent?.trim(),
    );
    expect(headers).toEqual(['Nr.', 'Bezeichnung', 'Kategorie', 'Marke', 'Größe', 'Farbe', 'Preis']);
    expect(rows()).toHaveLength(2);
    const cells = Array.from(rows()[0].querySelectorAll('td')).map((td) => td.textContent?.trim());
    expect(cells.slice(0, 6)).toEqual(['1', 'Sommerkleid', 'Kleider', 'Vertbaudet', '110', 'Rot']);
    expect(cells[6]).toMatch(/8[.,]00/);
  });

  it('shows an empty message without articles', async () => {
    await setup([]);

    expect(document.body.querySelector('.pre-registered-articles-dialog__empty')?.textContent).toContain(
      'Keine Artikel aus der Voranmeldung vorhanden.',
    );
  });

  it('clicking a row closes the dialog and emits the article only after hiding', async () => {
    const fixture = await setup();
    const visibleChanges: boolean[] = [];
    const selected: PreRegisteredArticle[] = [];
    fixture.componentInstance.visibleChange.subscribe((value) => visibleChanges.push(value));
    fixture.componentInstance.articleSelected.subscribe((article) => selected.push(article));

    rows()[1].click();
    fixture.detectChanges();

    expect(visibleChanges).toEqual([false]);
    expect(selected).toEqual([]);

    fixture.componentInstance.onHide();

    expect(selected).toEqual([ARTICLES[1]]);
  });

  it('closing without a selection emits nothing', async () => {
    const fixture = await setup();
    const selected: PreRegisteredArticle[] = [];
    fixture.componentInstance.articleSelected.subscribe((article) => selected.push(article));

    fixture.componentInstance.onHide();

    expect(selected).toEqual([]);
  });
});

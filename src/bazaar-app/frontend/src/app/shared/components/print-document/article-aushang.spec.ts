import { TestBed } from '@angular/core/testing';
import { ArticleAushang } from './article-aushang';
import { AushangArticle, AushangFreitexts, AushangModel, buildArticleAushangModel } from './article-aushang.model';
import { PRINT_LAYOUT, aushangListHeightMm, listCapacityRows } from './print-document.layout';

const noTexts: AushangFreitexts = { text1: '', text2: '', text3: '', text4: '' };
const printedAt = new Date(2026, 9, 31, 9, 30);

function article(index: number, overrides: Partial<AushangArticle> = {}): AushangArticle {
  return {
    name: `Artikel ${String(index).padStart(3, '0')}`,
    brand: 'Nike',
    category: 'Jacken',
    size: '104',
    color: 'Rot',
    price: 12.5,
    ...overrides,
  };
}

function model(options: { articles?: AushangArticle[]; freitexts?: Partial<AushangFreitexts> } = {}): AushangModel {
  return buildArticleAushangModel({
    articles: options.articles ?? [article(1)],
    freitexts: { ...noTexts, ...options.freitexts },
    printedAt,
  });
}

function text(element: Element | null | undefined): string {
  return (element?.textContent ?? '').trim();
}

describe('ArticleAushang', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ArticleAushang] }).compileComponents();
  });

  async function render(documentModel: AushangModel) {
    const fixture = TestBed.createComponent(ArticleAushang);
    fixture.componentRef.setInput('model', documentModel);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  function pages(el: HTMLElement): HTMLElement[] {
    return Array.from(el.querySelectorAll<HTMLElement>('.print-page'));
  }

  it('template_columns_areBezeichnungMarkeFarbeGroesseAndPriceWithoutNumber', async () => {
    // Arrange & Act
    const { el } = await render(model());

    // Assert
    const headings = Array.from(el.querySelectorAll('thead th')).map((th) => text(th));
    expect(headings).toEqual(['Bezeichnung', 'Marke', 'Farbe', 'Größe', 'Preis']);
  });

  it('template_articleRow_showsTheFiveFieldsInColumnOrder', async () => {
    // Arrange & Act
    const { el } = await render(model());

    // Assert
    const cells = Array.from(el.querySelectorAll('tbody tr:not(.print-doc__group-row) td')).map((td) =>
      text(td).replaceAll(String.fromCharCode(160), ' '),
    );
    expect(cells).toEqual(['Artikel 001', 'Nike', 'Rot', '104', '12,50 €']);
  });

  it('template_articleWithoutSizeAndColor_rendersEmptyCells', async () => {
    // Arrange & Act
    const { el } = await render(model({ articles: [article(1, { size: null, color: null })] }));

    // Assert
    const cells = Array.from(el.querySelectorAll('tbody tr:not(.print-doc__group-row) td')).map((td) => text(td));
    expect(cells.slice(2, 4)).toEqual(['', '']);
  });

  it('template_priceColumn_isRightAligned', async () => {
    // Arrange & Act
    const { el } = await render(model());

    // Assert
    expect(el.querySelector('thead th:last-child')?.classList).toContain('print-doc__cell--price');
    expect(el.querySelector('tbody td:last-child')?.classList).toContain('print-doc__cell--price');
  });

  it('template_noSellerBlockTilesQrCodeOrSums', async () => {
    // Arrange & Act
    const { el } = await render(model());

    // Assert
    expect(el.querySelector('.print-doc__seller')).toBeNull();
    expect(el.querySelector('.print-doc__tile')).toBeNull();
    expect(el.querySelector('app-qr-code')).toBeNull();
    expect(el.querySelector('.print-doc__freitext3')).toBeNull();
    expect(text(el)).not.toMatch(/Summe|Anzahl|Gesamt/);
  });

  it('template_categories_getOneHeadingRowEachWithoutCount', async () => {
    // Arrange & Act
    const { el } = await render(
      model({ articles: [article(1, { category: 'Jacken' }), article(2, { category: 'Hosen' }), article(3)] }),
    );

    // Assert
    const headings = Array.from(el.querySelectorAll('.print-doc__group-row th')).map((th) => text(th));
    expect(headings).toEqual(['Hosen', 'Jacken']);
  });

  it('template_header_putsDateRightAlignedInRightThird', async () => {
    // Arrange & Act
    const { el } = await render(model());

    // Assert
    const head = el.querySelector('.print-doc__head') as HTMLElement;
    expect(Array.from(head.children).map((child) => child.className)).toEqual([
      'print-doc__text print-doc__text--left',
      'print-doc__text print-doc__text--center',
      'print-doc__meta',
    ]);
    expect(text(head.querySelector('.print-doc__meta'))).toBe('31.10.2026, 09:30');
  });

  it('template_footer_putsPageNumberRightAlignedInRightThird', async () => {
    // Arrange & Act
    const { el } = await render(model());

    // Assert
    const foot = el.querySelector('.print-doc__foot') as HTMLElement;
    expect(Array.from(foot.children).map((child) => child.className)).toEqual([
      'print-doc__text print-doc__text--left',
      'print-doc__text print-doc__text--center',
      'print-doc__page-no',
    ]);
    expect(text(foot.querySelector('.print-doc__page-no'))).toBe('Seite 1 von 1');
  });

  it('template_fourFreitexts_landInTheirThirdsOfHeaderAndFooter', async () => {
    // Arrange & Act
    const { el } = await render(
      model({ freitexts: { text1: 'Kopf links', text2: 'Kopf Mitte', text3: 'Fuß links', text4: 'Fuß Mitte' } }),
    );

    // Assert
    expect(text(el.querySelector('.print-doc__head .print-doc__text--left'))).toBe('Kopf links');
    expect(text(el.querySelector('.print-doc__head .print-doc__text--center'))).toBe('Kopf Mitte');
    expect(text(el.querySelector('.print-doc__foot .print-doc__text--left'))).toBe('Fuß links');
    expect(text(el.querySelector('.print-doc__foot .print-doc__text--center'))).toBe('Fuß Mitte');
  });

  it('template_emptyFreitexts_keepTheirCellsInHeaderAndFooter', async () => {
    // Arrange & Act
    const { el } = await render(model());

    // Assert
    expect(el.querySelectorAll('.print-doc__head > *').length).toBe(3);
    expect(el.querySelectorAll('.print-doc__foot > *').length).toBe(3);
    expect(text(el.querySelector('.print-doc__head .print-doc__text--left'))).toBe('');
  });

  it('template_markdownFreitext_rendersFormattedElements', async () => {
    // Arrange
    const markdown = '# Titel\n\n**fett** und *kursiv*\n\n- eins\n- zwei\n\n| A | B |\n|---|---|\n| 1 | 2 |';

    // Act
    const { el } = await render(model({ freitexts: { text1: markdown } }));

    // Assert
    const left = el.querySelector('.print-doc__head .print-doc__text--left') as HTMLElement;
    expect(left.querySelector('h1')).not.toBeNull();
    expect(left.querySelector('strong')?.textContent).toBe('fett');
    expect(left.querySelector('em')?.textContent).toBe('kursiv');
    expect(left.querySelectorAll('li').length).toBe(2);
    expect(left.querySelector('table')).not.toBeNull();
    expect(left.textContent).not.toContain('**');
  });

  it('template_linkImageAndHtmlInFreitext_areNotRenderedAsElements', async () => {
    // Arrange
    const markdown = '[Link](https://example.org) ![Bild](https://example.org/x.png) <b>roh</b><script>x()</script>';

    // Act
    const { el } = await render(model({ freitexts: { text3: markdown } }));

    // Assert
    const left = el.querySelector('.print-doc__foot .print-doc__text--left') as HTMLElement;
    expect(left.querySelector('a')).toBeNull();
    expect(left.querySelector('img')).toBeNull();
    expect(left.querySelector('b')).toBeNull();
    expect(left.querySelector('script')).toBeNull();
    expect(left.textContent).toContain('Link');
  });

  it('template_pageSize_isA4PortraitFromLayout', async () => {
    // Arrange & Act
    const { el } = await render(model());

    // Assert
    const page = pages(el)[0];
    expect(page.style.width).toBe(`${PRINT_LAYOUT.pageWidthMm}mm`);
    expect(page.style.height).toBe(`${PRINT_LAYOUT.pageHeightMm}mm`);
  });

  describe('many articles', () => {
    const many = Array.from({ length: 200 }, (_, index) => article(index + 1, { category: `Kategorie ${(index % 7) + 1}` }));

    it('pages_twoHundredArticles_spanSeveralPagesEachWithHeaderFooterAndTableHead', async () => {
      // Arrange & Act
      const { el } = await render(model({ articles: many }));

      // Assert
      const all = pages(el);
      expect(all.length).toBeGreaterThan(1);
      for (const [index, page] of all.entries()) {
        expect(page.querySelector('.print-doc__head')).not.toBeNull();
        expect(page.querySelector('.print-doc__foot')).not.toBeNull();
        expect(page.querySelector('thead')).not.toBeNull();
        expect(text(page.querySelector('.print-doc__meta'))).toBe('31.10.2026, 09:30');
        expect(text(page.querySelector('.print-doc__page-no'))).toBe(`Seite ${index + 1} von ${all.length}`);
      }
    });

    it('pages_headingWouldFallOnLastRowOfPage_movesToNextPage', async () => {
      // Arrange: Kategorie A füllt Seite 1 bis auf genau eine Zeile (Überschrift + capacity-2 Artikel),
      // die Überschrift von B würde sonst allein auf dem letzten Platz stehen.
      const capacity = listCapacityRows(aushangListHeightMm());
      const articles = [
        ...Array.from({ length: capacity - 2 }, (_, index) => article(index + 1, { category: 'A' })),
        article(900, { category: 'B' }),
        article(901, { category: 'B' }),
      ];

      // Act
      const { el } = await render(model({ articles }));

      // Assert
      const [first, second] = pages(el);
      const firstRows = Array.from(first.querySelectorAll('tbody tr'));
      expect(firstRows.length).toBe(capacity - 1);
      expect(firstRows[firstRows.length - 1].classList).not.toContain('print-doc__group-row');
      const secondRows = Array.from(second.querySelectorAll('tbody tr'));
      expect(secondRows[0].classList).toContain('print-doc__group-row');
      expect(text(secondRows[0])).toBe('B');
    });

    it('pages_headingFitsWithAtLeastOneArticle_staysOnTheSamePage', async () => {
      // Arrange: Überschrift von B plus ein Artikel passen noch auf Seite 1.
      const capacity = listCapacityRows(aushangListHeightMm());
      const articles = [
        ...Array.from({ length: capacity - 3 }, (_, index) => article(index + 1, { category: 'A' })),
        article(900, { category: 'B' }),
        article(901, { category: 'B' }),
      ];

      // Act
      const { el } = await render(model({ articles }));

      // Assert
      const first = pages(el)[0];
      expect(Array.from(first.querySelectorAll('.print-doc__group-row th')).map((th) => text(th))).toEqual(['A', 'B']);
    });

    it('pages_twoHundredArticles_holdEveryArticleExactlyOnceWithinCapacity', async () => {
      // Arrange & Act
      const { fixture, el } = await render(model({ articles: many }));

      // Assert
      const capacity = listCapacityRows(aushangListHeightMm());
      const articleRows = el.querySelectorAll('tbody tr:not(.print-doc__group-row)');
      expect(articleRows.length).toBe(200);
      for (const page of fixture.componentInstance.pages()) {
        expect(page.length).toBeLessThanOrEqual(capacity);
      }
    });
  });
});

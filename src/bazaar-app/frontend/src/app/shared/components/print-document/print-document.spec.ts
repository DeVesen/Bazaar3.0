import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { QrCode } from '../qr-code/qr-code';
import { PrintDocument } from './print-document';
import { PRINT_LAYOUT, firstPageListHeightMm, restPageListHeightMm } from './print-document.layout';
import {
  PrintArticle,
  PrintDocumentModel,
  PrintFreitexts,
  PrintSeller,
  buildAbgabeBelegModel,
} from './print-document.model';

const seller: PrintSeller = {
  id: 'a3f9c2d1',
  firstName: 'Anna',
  lastName: 'Meier',
  address: 'Musterstraße 5',
  postalCode: '76133',
  city: 'Karlsruhe',
};
const noTexts: PrintFreitexts = { text1: '', text2: '', text3: '', text4: '', text5: '' };
const printedAt = new Date(2026, 9, 14, 9, 30);

function article(number: number): PrintArticle {
  return {
    number,
    name: `Artikel ${number}`,
    category: 'Jacken',
    brand: 'Nike',
    size: 'M',
    color: 'Rot',
    price: 12.5,
    status: 'selling',
  };
}

function model(options: { articles?: PrintArticle[]; freitexts?: Partial<PrintFreitexts> } = {}): PrintDocumentModel {
  return buildAbgabeBelegModel({
    seller,
    articles: options.articles ?? [article(1)],
    freitexts: { ...noTexts, ...options.freitexts },
    feePerItem: 0.5,
    commissionRate: 20,
    printedAt,
  });
}

function text(element: Element | null | undefined): string {
  return (element?.textContent ?? '').trim();
}

describe('PrintDocument', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PrintDocument] }).compileComponents();
  });

  async function render(documentModel: PrintDocumentModel) {
    const fixture = TestBed.createComponent(PrintDocument);
    fixture.componentRef.setInput('model', documentModel);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('template_firstPage_showsBlocksInSpecifiedOrder', async () => {
    // Arrange & Act
    const { el } = await render(model({ freitexts: { text3: 'Hinweis' } }));
    const page = el.querySelector('.print-page') as HTMLElement;

    // Assert
    const order = Array.from(page.children).map((child) => child.classList[0]);
    expect(order).toEqual([
      'print-doc__head',
      'print-doc__seller',
      'print-doc__tiles',
      'print-doc__tiles',
      'print-doc__freitext3',
      'print-doc__list',
      'print-doc__foot',
    ]);
    expect(page.children[2].classList.contains('print-doc__tiles--a')).toBe(true);
    expect(page.children[3].classList.contains('print-doc__tiles--b')).toBe(true);
  });

  it('template_headerTexts_alignsLeftCenterAndPrintTimeRight', async () => {
    // Arrange & Act
    const { el } = await render(model({ freitexts: { text1: 'A', text2: 'B' } }));
    const head = el.querySelector('.print-doc__head') as HTMLElement;

    // Assert
    expect(text(head.querySelector('.print-doc__text--left'))).toBe('A');
    expect(text(head.querySelector('.print-doc__text--center'))).toBe('B');
    expect(text(head.querySelector('.print-doc__meta'))).toBe('14.10.2026, 09:30');
  });

  it('template_footerTexts_alignsLeftCenterAndPageNumberRight', async () => {
    // Arrange & Act
    const { el } = await render(model({ freitexts: { text4: 'Fuß links', text5: 'Fuß Mitte' } }));
    const foot = el.querySelector('.print-doc__foot') as HTMLElement;

    // Assert
    expect(text(foot.querySelector('.print-doc__text--left'))).toBe('Fuß links');
    expect(text(foot.querySelector('.print-doc__text--center'))).toBe('Fuß Mitte');
    expect(text(foot.querySelector('.print-doc__page-no'))).toBe('Seite 1 von 1');
  });

  it('template_sellerBlock_showsNameStreetAndCityLineWithoutContactData', async () => {
    // Arrange & Act
    const { el } = await render(model());
    const lines = Array.from(el.querySelectorAll('.print-doc__address p')).map((line) => text(line));

    // Assert
    expect(lines).toEqual(['Anna Meier', 'Musterstraße 5', '76133 Karlsruhe']);
  });

  it('template_sellerId_isQrValueCaptionAndTileTextOnPageOne', async () => {
    // Arrange & Act
    const { fixture, el } = await render(model());
    const qr = fixture.debugElement.query(By.directive(QrCode)).componentInstance as QrCode;
    const occurrences = (el.textContent ?? '').split('a3f9c2d1').length - 1;

    // Assert
    expect(qr.value()).toBe('a3f9c2d1');
    expect(text(el.querySelector('.qr-code__caption'))).toBe('a3f9c2d1');
    expect(occurrences).toBe(2);
  });

  it('template_tileRows_rowAIsLowerAndRowBHigherThanBefore', async () => {
    // Arrange & Act
    const { el } = await render(model());
    const rowA = el.querySelector('.print-doc__tiles--a') as HTMLElement;
    const rowB = el.querySelector('.print-doc__tiles--b') as HTMLElement;

    // Assert
    expect(parseFloat(rowA.style.height)).toBeCloseTo(13.4, 5);
    expect(parseFloat(rowB.style.height)).toBeCloseTo(13.3, 5);
    expect(rowA.style.height).toContain('mm');
  });

  it('template_tiles_showTitleAboveValue', async () => {
    // Arrange & Act
    const { el } = await render(model());
    const first = el.querySelector('.print-doc__tiles--a .print-doc__tile') as HTMLElement;

    // Assert
    expect(text(first.querySelector('.print-doc__tile-title'))).toBe('Verkäufer-ID');
    expect(text(first.querySelector('.print-doc__tile-value'))).toBe('a3f9c2d1');
  });

  it('template_freitext3WithMarkdown_rendersFormattedElements', async () => {
    // Arrange
    const markdown = ['# Titel', '', '**fett** und *kursiv*', '', '- Punkt', '', '| A | B |', '|---|---|', '| 1 | 2 |'].join('\n');

    // Act
    const { el } = await render(model({ freitexts: { text3: markdown } }));
    const block = el.querySelector('.print-doc__freitext3') as HTMLElement;

    // Assert
    expect(block.querySelector('h1')).not.toBeNull();
    expect(block.querySelector('strong')?.textContent).toBe('fett');
    expect(block.querySelector('em')?.textContent).toBe('kursiv');
    expect(block.querySelector('li')).not.toBeNull();
    expect(block.querySelector('table')).not.toBeNull();
    expect(block.textContent).not.toContain('**');
  });

  it('template_freitext3WithLinkImageAndHtml_rendersNoneOfThem', async () => {
    // Arrange
    const markdown = 'Ein [Link](https://example.org) ![Bild](https://example.org/a.png) <b>HTML</b>';

    // Act
    const { el } = await render(model({ freitexts: { text3: markdown } }));
    const block = el.querySelector('.print-doc__freitext3') as HTMLElement;

    // Assert
    expect(block.querySelector('a')).toBeNull();
    expect(block.querySelector('img')).toBeNull();
    expect(block.querySelector('b')).toBeNull();
    expect(block.textContent).toContain('<b>');
  });

  it('template_emptyFreitext3_omitsBlockAndListFollowsTileRowB', async () => {
    // Arrange & Act
    const { el } = await render(model());
    const rowB = el.querySelector('.print-doc__tiles--b') as HTMLElement;

    // Assert
    expect(el.querySelector('.print-doc__freitext3')).toBeNull();
    expect(rowB.nextElementSibling?.classList.contains('print-doc__list')).toBe(true);
  });

  it('template_emptyHeaderAndFooterTexts_keepTheirCells', async () => {
    // Arrange & Act
    const { el } = await render(model());

    // Assert
    expect(el.querySelector('.print-doc__head .print-doc__text--left')).not.toBeNull();
    expect(el.querySelector('.print-doc__foot .print-doc__text--left')).not.toBeNull();
    expect(text(el.querySelector('.print-doc__head .print-doc__text--left'))).toBe('');
  });

  it('template_eightyArticles_splitsIntoPagesEachWithHeadFootTableHeadAndPageNumber', async () => {
    // Arrange
    const articles = Array.from({ length: 80 }, (_, index) => article(index + 1));

    // Act
    const { el } = await render(model({ articles }));
    const pages = Array.from(el.querySelectorAll('.print-page'));

    // Assert
    expect(pages.length).toBeGreaterThan(1);
    pages.forEach((page, index) => {
      expect(page.querySelector('.print-doc__head')).not.toBeNull();
      expect(page.querySelector('.print-doc__foot')).not.toBeNull();
      expect(page.querySelector('thead')).not.toBeNull();
      expect(text(page.querySelector('.print-doc__page-no'))).toBe(`Seite ${index + 1} von ${pages.length}`);
    });
  });

  it('template_secondPage_showsContinuationRowInsteadOfFirstPageBlocks', async () => {
    // Arrange
    const articles = Array.from({ length: 80 }, (_, index) => article(index + 1));

    // Act
    const { el } = await render(model({ articles }));
    const secondPage = el.querySelectorAll('.print-page')[1] as HTMLElement;

    // Assert
    expect(text(secondPage.querySelector('.print-doc__continuation'))).toContain('a3f9c2d1');
    expect(text(secondPage.querySelector('.print-doc__continuation'))).toContain('Musterstraße 5');
    expect(secondPage.querySelector('.print-doc__tiles')).toBeNull();
    expect(secondPage.querySelector('app-qr-code')).toBeNull();
    expect(secondPage.querySelector('.print-doc__freitext3')).toBeNull();
    expect(secondPage.querySelector('.print-doc__seller')).toBeNull();
  });

  it('template_articles_showsSevenColumnsAsTableWithoutTilePerArticle', async () => {
    // Arrange & Act
    const { el } = await render(model());
    const headings = Array.from(el.querySelectorAll('.print-doc__table thead th')).map((cell) => text(cell));
    const cells = Array.from(el.querySelectorAll('.print-doc__table tbody tr:not(.print-doc__group-row) td')).map((cell) => text(cell));

    // Assert
    expect(headings).toEqual(['Artikelnummer', 'Bezeichnung', 'Kategorie', 'Marke', 'Größe', 'Farbe', 'Preis']);
    expect(cells.slice(0, 6)).toEqual(['1', 'Artikel 1', 'Jacken', 'Nike', 'M', 'Rot']);
    expect(el.querySelectorAll('.print-doc__tiles .print-doc__tile').length).toBe(4);
  });

  it('template_fewArticles_listAreaReachesDownToFooter', async () => {
    // Arrange & Act
    const { el } = await render(model());
    const page = el.querySelector('.print-page') as HTMLElement;
    const list = page.querySelector('.print-doc__list') as HTMLElement;
    const fixedBlocksMm =
      PRINT_LAYOUT.headerMm +
      PRINT_LAYOUT.sellerBlockMm +
      PRINT_LAYOUT.tileRowAMm +
      PRINT_LAYOUT.tileRowBMm +
      PRINT_LAYOUT.footerMm;

    // Assert
    expect(list.nextElementSibling?.classList.contains('print-doc__foot')).toBe(true);
    expect(parseFloat(list.style.height)).toBeCloseTo(firstPageListHeightMm(0), 5);
    expect(fixedBlocksMm + parseFloat(list.style.height)).toBeCloseTo(
      PRINT_LAYOUT.pageHeightMm - 2 * PRINT_LAYOUT.paddingMm,
      5,
    );
  });

  it('template_eightyArticles_listAreaEndsDirectlyAboveFooterOnEveryPage', async () => {
    // Arrange
    const articles = Array.from({ length: 80 }, (_, index) => article(index + 1));

    // Act
    const { el } = await render(model({ articles }));
    const pages = Array.from(el.querySelectorAll('.print-page'));

    // Assert
    expect(pages.length).toBeGreaterThan(1);
    pages.forEach((page, index) => {
      const list = page.querySelector('.print-doc__list') as HTMLElement;
      const expectedMm = index === 0 ? firstPageListHeightMm(0) : restPageListHeightMm();
      expect(list.nextElementSibling?.classList.contains('print-doc__foot')).toBe(true);
      expect(page.lastElementChild?.classList.contains('print-doc__foot')).toBe(true);
      expect(parseFloat(list.style.height)).toBeCloseTo(expectedMm, 5);
    });
  });

  it('applyMeasurement_noLayoutEngine_keepsThePaginationStable', async () => {
    // Arrange
    const { fixture, el } = await render(model({ freitexts: { text3: 'Hinweis' } }));
    const pagesBefore = el.querySelectorAll('.print-page').length;

    // Act
    fixture.componentInstance.applyMeasurement();
    await fixture.whenStable();

    // Assert
    expect(el.querySelectorAll('.print-page').length).toBe(pagesBefore);
  });

  it('applyMeasurement_freitext3HigherThanPage_capsHeightAndKeepsArticlesOnPageOne', async () => {
    // Arrange
    const { fixture, el } = await render(model({ freitexts: { text3: 'Sehr lang' } }));
    const block = el.querySelector('.print-doc__freitext3') as HTMLElement;
    vi.spyOn(block, 'getBoundingClientRect').mockReturnValue({ height: 5000 } as DOMRect);

    // Act
    fixture.componentInstance.applyMeasurement();
    await fixture.whenStable();

    // Assert
    const list = el.querySelector('.print-page .print-doc__list') as HTMLElement;
    expect(parseFloat(list.style.height)).toBe(firstPageListHeightMm(PRINT_LAYOUT.maxFreitext3Mm));
    expect(fixture.componentInstance.pages()[0].some((row) => row.kind === 'article')).toBe(true);
    expect(block.style.maxHeight).toBe(`${PRINT_LAYOUT.maxFreitext3Mm}mm`);
  });
});

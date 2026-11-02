import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelSheetsDocument, LabelSheetsPrintModel } from './label-sheets-document';
import { AVERY_16_GEOMETRY } from './label-geometry';
import { placeLabels } from './label-slots';

function model(startNumber: number, count: number, startPosition: number): LabelSheetsPrintModel {
  return {
    geometry: AVERY_16_GEOMETRY,
    sheets: placeLabels(startNumber, count, startPosition, 16),
    content: { logo: null, sellerSymbol: null, currencySymbol: '€' },
  };
}

async function render(printModel: LabelSheetsPrintModel): Promise<ComponentFixture<LabelSheetsDocument>> {
  const fixture = TestBed.createComponent(LabelSheetsDocument);
  fixture.componentRef.setInput('model', printModel);
  await fixture.whenStable();
  return fixture;
}

function numberIn(sheet: Element, slot: number): string | undefined {
  return sheet.querySelector(`[data-slot="${slot}"] .label-card__number`)?.textContent?.trim();
}

describe('LabelSheetsDocument', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LabelSheetsDocument] }).compileComponents();
  });

  it('render_count12FromPosition7_rendersTwoSheetsWithNumbersInPlace', async () => {
    // Arrange & Act
    const fixture = await render(model(1000, 12, 7));

    // Assert
    const sheets = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('app-label-sheet'));
    expect(sheets).toHaveLength(2);
    expect(numberIn(sheets[0], 7)).toBe('1000');
    expect(numberIn(sheets[0], 16)).toBe('1009');
    expect(numberIn(sheets[1], 1)).toBe('1010');
    expect(numberIn(sheets[1], 2)).toBe('1011');
    expect(sheets[0].querySelector('[data-slot="6"] app-label-card')).toBeNull();
  });

  it('render_startPosition7Count4_putsNumbersInRows4And5', async () => {
    // Arrange & Act
    const fixture = await render(model(1000, 4, 7));

    // Assert
    const sheet = (fixture.nativeElement as HTMLElement).querySelector('app-label-sheet') as Element;
    expect([7, 8, 9, 10].map((slot) => numberIn(sheet, slot))).toEqual(['1000', '1001', '1002', '1003']);
  });

  it('render_always_printsNoFoldLine', async () => {
    // Arrange & Act
    const fixture = await render(model(1000, 4, 1));

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelector('.label-card__fold')).toBeNull();
  });

  it('sheetWidth_avery16_isSheetWidthInMm', async () => {
    // Arrange & Act
    const fixture = await render(model(1000, 4, 1));

    // Assert
    expect(fixture.componentInstance.sheetWidth()).toBe('210mm');
  });
});

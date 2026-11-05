import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelSheet } from './label-sheet';
import { By } from '@angular/platform-browser';
import { AVERY_16_GEOMETRY } from './label-geometry';
import { LabelCard } from './label-card';
import { DEFAULT_LABEL_ELEMENT_SIZES } from './label-layout';
import { LabelSlot, startPositionPreview } from './label-slots';

async function render(slots: LabelSlot[], inputs: Record<string, unknown> = {}): Promise<ComponentFixture<LabelSheet>> {
  const fixture = TestBed.createComponent(LabelSheet);
  fixture.componentRef.setInput('geometry', AVERY_16_GEOMETRY);
  fixture.componentRef.setInput('slots', slots);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  await fixture.whenStable();
  return fixture;
}

function slotElements(fixture: ComponentFixture<LabelSheet>): HTMLElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.label-sheet__slot'));
}

describe('LabelSheet', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LabelSheet] }).compileComponents();
  });

  it('render_avery16_rendersSixteenSlotsRowWise', async () => {
    // Arrange & Act
    const fixture = await render(startPositionPreview(1, 16));

    // Assert
    const slots = slotElements(fixture);
    expect(slots).toHaveLength(16);
    expect(Number.parseFloat(slots[1].style.left)).toBeCloseTo(50);
    expect(Number.parseFloat(slots[1].style.top)).toBeCloseTo((8.5 / 297) * 100);
    expect(Number.parseFloat(slots[2].style.left)).toBeCloseTo(0);
    expect(Number.parseFloat(slots[2].style.top)).toBeCloseTo((43.5 / 297) * 100);
    expect(slots[6].getAttribute('data-slot')).toBe('7');
  });

  it('render_startPosition7WithOutline_greysSlotsOneToSix', async () => {
    // Arrange & Act
    const fixture = await render(startPositionPreview(7, 16), { outlineSlots: true });

    // Assert
    const skipped = slotElements(fixture).filter((slot) => slot.classList.contains('label-sheet__slot--skipped'));
    expect(skipped.map((slot) => slot.getAttribute('data-slot'))).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('render_startPosition7WithoutOutline_leavesSlotsOneToSixUnmarked', async () => {
    // Arrange & Act
    const fixture = await render(startPositionPreview(7, 16), { outlineSlots: false });

    // Assert
    const skipped = slotElements(fixture).filter((slot) => slot.classList.contains('label-sheet__slot--skipped'));
    expect(skipped).toHaveLength(0);
  });

  it('sheetStyle_previewWidth_scalesWithContainerAndKeepsSheetAspectRatio', async () => {
    // Arrange & Act
    const fixture = await render(startPositionPreview(1, 16), { maxHeight: '70vh' });

    // Assert
    expect(fixture.componentInstance.sheetStyle()).toEqual({
      width: '100%',
      'aspect-ratio': '210 / 297',
      'max-width': 'calc(70vh * 210 / 297)',
    });
  });

  it('sheetStyle_printWidthInMm_usesExactSheetWidth', async () => {
    // Arrange & Act
    const fixture = await render(startPositionPreview(1, 16), { width: '210mm' });

    // Assert
    expect(fixture.componentInstance.sheetStyle()).toEqual({ width: '210mm', 'aspect-ratio': '210 / 297' });
  });

  it('render_labelSlot_rendersLabelCardWithNumberAndContent', async () => {
    // Arrange
    const slots: LabelSlot[] = [{ kind: 'label', number: 1000 }, ...startPositionPreview(1, 15)];

    // Act
    const fixture = await render(slots, { content: { logo: null, sellerSymbol: null, currencySymbol: '$', sizes: DEFAULT_LABEL_ELEMENT_SIZES } });

    // Assert
    const first = slotElements(fixture)[0];
    expect(first.querySelector('.label-card__number')?.textContent?.trim()).toBe('1000');
    expect(first.querySelector('.label-card__currency')?.textContent?.trim()).toBe('$');
    expect(slotElements(fixture)[1].querySelector('app-label-card')).toBeNull();
  });

  it('render_contentWithSizes_passesSizesToLabelCard', async () => {
    // Arrange
    const sizes = { qrCode: 18, sellerSymbol: 7, numberHeight: 9, currencyHeight: 10 };

    // Act
    const fixture = await render([{ kind: 'label', number: 1000 }], { content: { logo: null, sellerSymbol: null, currencySymbol: '€', sizes } });

    // Assert
    const card = fixture.debugElement.query(By.directive(LabelCard)).componentInstance as LabelCard;
    expect(card.sizes()).toEqual(sizes);
  });

  it('render_offsetWithoutApplyOffset_previewIsNotShifted', async () => {
    // Arrange & Act
    const fixture = await render(startPositionPreview(1, 16));
    fixture.componentRef.setInput('geometry', { ...AVERY_16_GEOMETRY, offsetX: 2, offsetY: 2 });
    await fixture.whenStable();

    // Assert
    const first = slotElements(fixture)[0];
    expect(Number.parseFloat(first.style.left)).toBeCloseTo(0);
    expect(Number.parseFloat(first.style.top)).toBeCloseTo((8.5 / 297) * 100);
  });

  it('render_offsetWithApplyOffset_shiftsSlots', async () => {
    // Arrange & Act
    const fixture = await render(startPositionPreview(1, 16), { applyOffset: true });
    fixture.componentRef.setInput('geometry', { ...AVERY_16_GEOMETRY, offsetX: 2, offsetY: -2 });
    await fixture.whenStable();

    // Assert
    const first = slotElements(fixture)[0];
    expect(Number.parseFloat(first.style.left)).toBeCloseTo((2 / 210) * 100);
    expect(Number.parseFloat(first.style.top)).toBeCloseTo((6.5 / 297) * 100);
  });

  it('render_withApplyOffset_clipsSheetAtItsEdge', async () => {
    // Arrange & Act
    const fixture = await render(startPositionPreview(1, 16), { applyOffset: true });

    // Assert
    const sheet = (fixture.nativeElement as HTMLElement).querySelector('.label-sheet') as HTMLElement;
    expect(sheet.classList).toContain('label-sheet--clipped');
  });

  it('render_withoutApplyOffset_doesNotClipSheet', async () => {
    // Arrange & Act
    const fixture = await render(startPositionPreview(1, 16));

    // Assert
    const sheet = (fixture.nativeElement as HTMLElement).querySelector('.label-sheet') as HTMLElement;
    expect(sheet.classList).not.toContain('label-sheet--clipped');
  });
});

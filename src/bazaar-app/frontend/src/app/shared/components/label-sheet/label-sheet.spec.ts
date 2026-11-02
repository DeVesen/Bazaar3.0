import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelSheet } from './label-sheet';
import { AVERY_16_GEOMETRY } from './label-geometry';
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
    const fixture = await render(slots, { content: { logo: null, sellerSymbol: null, currencySymbol: '$' } });

    // Assert
    const first = slotElements(fixture)[0];
    expect(first.querySelector('.label-card__number')?.textContent?.trim()).toBe('1000');
    expect(first.querySelector('.label-card__currency')?.textContent?.trim()).toBe('$');
    expect(slotElements(fixture)[1].querySelector('app-label-card')).toBeNull();
  });
});

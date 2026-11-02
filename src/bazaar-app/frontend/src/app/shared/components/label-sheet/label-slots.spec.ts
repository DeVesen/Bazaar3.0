import { LabelSlot, placeLabels, startPositionPreview } from './label-slots';

function numbersOf(slots: LabelSlot[]): (number | null)[] {
  return slots.map((slot) => (slot.kind === 'label' ? slot.number : null));
}

describe('label-slots', () => {
  it('placeLabels_avery16Start1000Count4Position7_fillsRow4And5LeftToRight', () => {
    // Arrange & Act
    const sheets = placeLabels(1000, 4, 7, 16);

    // Assert
    expect(sheets).toHaveLength(1);
    expect(sheets[0].slice(0, 6).every((slot) => slot.kind === 'skipped')).toBe(true);
    expect(numbersOf(sheets[0]).slice(6, 10)).toEqual([1000, 1001, 1002, 1003]);
    expect(sheets[0].slice(10).every((slot) => slot.kind === 'empty')).toBe(true);
  });

  it('placeLabels_emptyStartPositionMeansOne_fillsRows1And2', () => {
    // Arrange & Act
    const sheets = placeLabels(1000, 4, 1, 16);

    // Assert
    expect(numbersOf(sheets[0]).slice(0, 4)).toEqual([1000, 1001, 1002, 1003]);
  });

  it('placeLabels_count12FromPosition7_continuesOnSecondSheetAtSlot1', () => {
    // Arrange & Act
    const sheets = placeLabels(1000, 12, 7, 16);

    // Assert
    expect(sheets).toHaveLength(2);
    expect(numbersOf(sheets[0]).slice(6)).toEqual([1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009]);
    expect(numbersOf(sheets[1]).slice(0, 2)).toEqual([1010, 1011]);
    expect(sheets[1].slice(2).every((slot) => slot.kind === 'empty')).toBe(true);
  });

  it('placeLabels_exactlyOneFullSheet_returnsOneSheet', () => {
    // Arrange & Act
    const sheets = placeLabels(1, 16, 1, 16);

    // Assert
    expect(sheets).toHaveLength(1);
    expect(numbersOf(sheets[0])[15]).toBe(16);
  });

  it('startPositionPreview_position7_greysFirstSixSlots', () => {
    // Arrange & Act
    const slots = startPositionPreview(7, 16);

    // Assert
    expect(slots.filter((slot) => slot.kind === 'skipped')).toHaveLength(6);
    expect(slots[6].kind).toBe('empty');
    expect(slots).toHaveLength(16);
  });
});

import { AVERY_16_GEOMETRY, fitsSheetHeight, fitsSheetWidth, labelsPerSheet, slotRects } from './label-geometry';

describe('label-geometry', () => {
  it('labelsPerSheet_avery16_returns16', () => {
    // Arrange
    const geometry = AVERY_16_GEOMETRY;

    // Act
    const perSheet = labelsPerSheet(geometry);

    // Assert
    expect(perSheet).toBe(16);
  });

  it('fitsSheetWidth_threeColumnsOf105OnA4_returnsFalse', () => {
    // Arrange
    const geometry = { ...AVERY_16_GEOMETRY, columns: 3 };

    // Act
    const fits = fitsSheetWidth(geometry);

    // Assert
    expect(fits).toBe(false);
  });

  it('fitsSheetHeight_marginTop8_9Sum297_4_returnsTrue', () => {
    // Arrange
    const geometry = { ...AVERY_16_GEOMETRY, marginTop: 8.9 };

    // Act
    const fits = fitsSheetHeight(geometry);

    // Assert
    expect(fits).toBe(true);
  });

  it('fitsSheetHeight_marginTop9_1Sum297_6_returnsFalse', () => {
    // Arrange
    const geometry = { ...AVERY_16_GEOMETRY, marginTop: 9.1 };

    // Act
    const fits = fitsSheetHeight(geometry);

    // Assert
    expect(fits).toBe(false);
  });

  it('fitsSheetHeight_sumExactly0_5Over_returnsTrue', () => {
    // Arrange
    const geometry = { ...AVERY_16_GEOMETRY, marginTop: 9 };

    // Act
    const fits = fitsSheetHeight(geometry);

    // Assert
    expect(fits).toBe(true);
  });

  it('slotRects_avery16_placesSlotsRowWiseFromTopLeft', () => {
    // Arrange
    const geometry = AVERY_16_GEOMETRY;

    // Act
    const rects = slotRects(geometry);

    // Assert
    expect(rects).toHaveLength(16);
    expect(rects[0]).toEqual({ left: 0, top: 8.5, width: 105, height: 35 });
    expect(rects[1]).toEqual({ left: 105, top: 8.5, width: 105, height: 35 });
    expect(rects[2]).toEqual({ left: 0, top: 43.5, width: 105, height: 35 });
  });

  it('slotRects_gapsAndMargins_addGapBetweenNeighbours', () => {
    // Arrange
    const geometry = { ...AVERY_16_GEOMETRY, labelWidth: 100, marginLeft: 3, gapHorizontal: 4 };

    // Act
    const rects = slotRects(geometry);

    // Assert
    expect(rects[1].left).toBe(107);
  });
});

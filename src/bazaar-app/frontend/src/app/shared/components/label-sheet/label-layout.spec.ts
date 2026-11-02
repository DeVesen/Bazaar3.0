import { LabelBox, LabelLayout, labelLayout, labelScale } from './label-layout';

function boxes(layout: LabelLayout): LabelBox[] {
  return [layout.qr, layout.logo, layout.sellerSymbolTopRight, layout.sellerSymbolBottomLeft];
}

describe('label-layout', () => {
  it('labelScale_base105x35_returns1', () => {
    // Arrange & Act
    const scale = labelScale(105, 35);

    // Assert
    expect(scale).toBe(1);
  });

  it('labelScale_105x17_5_takesSmallerRatio0_5', () => {
    // Arrange & Act
    const scale = labelScale(105, 17.5);

    // Assert
    expect(scale).toBe(0.5);
  });

  it('labelLayout_halfSize52_5x17_5_everyElementIsHalfAsLarge', () => {
    // Arrange
    const full = labelLayout(105, 35);

    // Act
    const half = labelLayout(52.5, 17.5);

    // Assert
    expect(half.qr.size).toBeCloseTo(full.qr.size / 2);
    expect(half.qr.x).toBeCloseTo(full.qr.x / 2);
    expect(half.qr.y).toBeCloseTo(full.qr.y / 2);
    expect(half.logo.size).toBeCloseTo(full.logo.size / 2);
    expect(half.logo.x).toBeCloseTo(full.logo.x / 2);
    expect(half.sellerSymbolTopRight.size).toBeCloseTo(full.sellerSymbolTopRight.size / 2);
    expect(half.sellerSymbolTopRight.x).toBeCloseTo(full.sellerSymbolTopRight.x / 2);
    expect(half.sellerSymbolBottomLeft.y).toBeCloseTo(full.sellerSymbolBottomLeft.y / 2);
    expect(half.numberText.fontSize).toBeCloseTo(full.numberText.fontSize / 2);
    expect(half.numberText.y).toBeCloseTo(full.numberText.y / 2);
    expect(half.priceLine.x1).toBeCloseTo(full.priceLine.x1 / 2);
    expect(half.priceLine.x2).toBeCloseTo(full.priceLine.x2 / 2);
    expect(half.currency.fontSize).toBeCloseTo(full.currency.fontSize / 2);
    expect(half.foldX).toBeCloseTo(full.foldX / 2);
  });

  it('labelLayout_105x17_5_elementsHalfSizeAndInsideLabel', () => {
    // Arrange
    const full = labelLayout(105, 35);

    // Act
    const flat = labelLayout(105, 17.5);

    // Assert
    expect(flat.qr.size).toBeCloseTo(full.qr.size / 2);
    expect(flat.logo.size).toBeCloseTo(full.logo.size / 2);
    expect(flat.numberText.fontSize).toBeCloseTo(full.numberText.fontSize / 2);
    for (const box of boxes(flat)) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.size).toBeLessThanOrEqual(105);
      expect(box.y + box.size).toBeLessThanOrEqual(17.5);
    }
    expect(flat.numberText.y + flat.numberText.fontSize).toBeLessThanOrEqual(17.5);
    expect(flat.priceLine.x2).toBeLessThanOrEqual(105);
    expect(flat.priceLine.y).toBeLessThanOrEqual(17.5);
    expect(flat.currency.x + flat.currency.fontSize).toBeLessThanOrEqual(105);
    expect(flat.currency.y + flat.currency.fontSize).toBeLessThanOrEqual(17.5);
  });

  it('labelLayout_base_placesQrLeftLogoBesideAndPriceRight', () => {
    // Arrange & Act
    const layout = labelLayout(105, 35);

    // Assert
    expect(layout.logo.x).toBeGreaterThan(layout.qr.x + layout.qr.size);
    expect(layout.logo.x + layout.logo.size).toBeLessThan(layout.foldX);
    expect(layout.numberText.y).toBeGreaterThan(layout.qr.y + layout.qr.size);
    expect(layout.priceLine.x1).toBeGreaterThan(layout.foldX);
    expect(layout.currency.x).toBeGreaterThan(layout.priceLine.x2);
    expect(layout.sellerSymbolTopRight.x).toBeGreaterThan(layout.foldX);
    expect(layout.numberText.x).toBeGreaterThan(layout.sellerSymbolBottomLeft.x + layout.sellerSymbolBottomLeft.size);
    expect(layout.numberText.x).toBeLessThan(layout.foldX);
    expect(layout.sellerSymbolBottomLeft.y + layout.sellerSymbolBottomLeft.size).toBeLessThanOrEqual(35);
  });

  it('labelLayout_base_alignsNumberPriceLineAndCurrencyWithBottomLeftSymbol', () => {
    // Arrange & Act
    const layout = labelLayout(105, 35);

    // Assert
    const symbolBottom = layout.sellerSymbolBottomLeft.y + layout.sellerSymbolBottomLeft.size;
    expect(layout.numberText.y + layout.numberText.fontSize).toBeCloseTo(symbolBottom);
    expect(layout.currency.y + layout.currency.fontSize).toBeCloseTo(symbolBottom);
    expect(layout.priceLine.y + 0.3).toBeCloseTo(symbolBottom);
    expect(layout.foldX).toBe(52.5);
  });
});

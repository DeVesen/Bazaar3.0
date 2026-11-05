import { DEFAULT_LABEL_ELEMENT_SIZES, LabelElementSizes, labelLayout, labelScale } from './label-layout';

function sizes(overrides: Partial<LabelElementSizes>): LabelElementSizes {
  return { ...DEFAULT_LABEL_ELEMENT_SIZES, ...overrides };
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

  it('DEFAULT_LABEL_ELEMENT_SIZES_always_matchesFormerConstants', () => {
    // Arrange & Act
    const defaults = DEFAULT_LABEL_ELEMENT_SIZES;

    // Assert
    expect(defaults).toEqual({ qrCode: 21.5, sellerSymbol: 5, numberHeight: 10.5, currencyHeight: 12 });
  });

  it('labelLayout_base105x35WithDefaults_keepsQrNumberAndBottomLeftSymbolAsBefore', () => {
    // Arrange & Act
    const layout = labelLayout(105, 35, DEFAULT_LABEL_ELEMENT_SIZES);

    // Assert
    expect(layout.qr.size).toBe(21.5);
    expect(layout.numberText.fontSize).toBe(10.5);
    expect(layout.numberText.y).toBeCloseTo(23);
    expect(layout.sellerSymbolBottomLeft).toEqual({ x: 1.5, y: 28.5, size: 5 });
    expect(layout.foldX).toBe(52.5);
  });

  // A1
  it.each([
    [105, 35],
    [70, 37],
  ])('labelLayout_%sx%s_placesQrAt1_5mmFromLeftAndTopWithGivenSize', (width, height) => {
    // Arrange & Act
    const layout = labelLayout(width, height, sizes({ qrCode: 18 }));

    // Assert
    expect(layout.qr).toEqual({ x: 1.5, y: 1.5, size: 18 });
  });

  it('labelLayout_largerQrCode_changesOnlyQrSize', () => {
    // Arrange
    const small = labelLayout(105, 35, sizes({ qrCode: 15 }));

    // Act
    const large = labelLayout(105, 35, sizes({ qrCode: 25 }));

    // Assert
    expect(large.qr).toEqual({ ...small.qr, size: 25 });
  });

  // A2
  it('labelLayout_base105x35WithDefaults_logoAreaBetweenQrFoldTopAndNumber', () => {
    // Arrange & Act
    const layout = labelLayout(105, 35, DEFAULT_LABEL_ELEMENT_SIZES);

    // Assert
    expect(layout.logo.x).toBeCloseTo(24.5);
    expect(layout.logo.y).toBeCloseTo(1.5);
    expect(layout.logo.width).toBeCloseTo(26.5);
    expect(layout.logo.height).toBeCloseTo(20);
  });

  it('labelLayout_largerQrCode_shiftsLogoRightAndNarrowsIt', () => {
    // Arrange
    const base = labelLayout(105, 35, DEFAULT_LABEL_ELEMENT_SIZES);

    // Act
    const layout = labelLayout(105, 35, sizes({ qrCode: 25.5 }));

    // Assert
    expect(layout.logo.x).toBeCloseTo(base.logo.x + 4);
    expect(layout.logo.width).toBeCloseTo(base.logo.width - 4);
    expect(layout.logo.height).toBeCloseTo(base.logo.height);
  });

  it('labelLayout_largerNumberHeight_lowersLogoHeight', () => {
    // Arrange
    const base = labelLayout(105, 35, DEFAULT_LABEL_ELEMENT_SIZES);

    // Act
    const layout = labelLayout(105, 35, sizes({ numberHeight: 13.5 }));

    // Assert
    expect(layout.logo.height).toBeCloseTo(base.logo.height - 3);
    expect(layout.logo.width).toBeCloseTo(base.logo.width);
  });

  it('labelLayout_qrCodeBeyondFold_logoWidthIs0', () => {
    // Arrange & Act
    const layout = labelLayout(105, 35, sizes({ qrCode: 60 }));

    // Assert
    expect(layout.logo.width).toBe(0);
  });

  it('labelLayout_numberHigherThanLabel_logoHeightIs0', () => {
    // Arrange & Act
    const layout = labelLayout(105, 35, sizes({ numberHeight: 40 }));

    // Assert
    expect(layout.logo.height).toBe(0);
  });

  // A3
  it('labelLayout_largerSellerSymbol_topRightKeepsRightEdgeAndTopBottomLeftKeepsLeftEdgeAndBottom', () => {
    // Arrange
    const small = labelLayout(105, 35, sizes({ sellerSymbol: 5 }));

    // Act
    const large = labelLayout(105, 35, sizes({ sellerSymbol: 8 }));

    // Assert
    expect(large.sellerSymbolTopRight.size).toBe(8);
    expect(large.sellerSymbolBottomLeft.size).toBe(8);
    expect(large.sellerSymbolTopRight.x + large.sellerSymbolTopRight.size).toBeCloseTo(103.5);
    expect(large.sellerSymbolTopRight.y).toBeCloseTo(small.sellerSymbolTopRight.y);
    expect(large.sellerSymbolBottomLeft.x).toBeCloseTo(small.sellerSymbolBottomLeft.x);
    expect(large.sellerSymbolBottomLeft.y + large.sellerSymbolBottomLeft.size).toBeCloseTo(33.5);
  });

  // A4
  it('labelLayout_largerNumberHeight_fontFollowsHeightCenterAndBottomStay', () => {
    // Arrange
    const base = labelLayout(105, 35, DEFAULT_LABEL_ELEMENT_SIZES);

    // Act
    const layout = labelLayout(105, 35, sizes({ numberHeight: 14 }));

    // Assert
    expect(layout.numberText.fontSize).toBe(14);
    expect(layout.numberText.x).toBeCloseTo(base.numberText.x);
    expect(layout.numberText.y + layout.numberText.fontSize).toBeCloseTo(base.numberText.y + base.numberText.fontSize);
  });

  // A5
  it('labelLayout_base105x35_priceRowFromWidthMinus48ToRightMarginWithCurrencyHeight', () => {
    // Arrange & Act
    const layout = labelLayout(105, 35, sizes({ currencyHeight: 9 }));

    // Assert
    expect(layout.priceRow.x).toBeCloseTo(57);
    expect(layout.priceRow.x + layout.priceRow.width).toBeCloseTo(103.5);
    expect(layout.priceRow.y + layout.priceRow.height).toBeCloseTo(33.5);
    expect(layout.priceRow.height).toBe(9);
    expect(layout.priceRow.fontSize).toBe(9);
  });

  // E7: Größen absolut in mm, Anker skalieren mit k.
  it('labelLayout_70x37_sizesStayAbsoluteWhileAnchorsScale', () => {
    // Arrange
    const k = labelScale(70, 37);

    // Act
    const layout = labelLayout(70, 37, DEFAULT_LABEL_ELEMENT_SIZES);

    // Assert
    expect(layout.qr.size).toBe(21.5);
    expect(layout.sellerSymbolTopRight.size).toBe(5);
    expect(layout.sellerSymbolBottomLeft.size).toBe(5);
    expect(layout.numberText.fontSize).toBe(10.5);
    expect(layout.priceRow.fontSize).toBe(12);
    expect(layout.sellerSymbolTopRight.x).toBeCloseTo(70 - 1.5 * k - 5);
    expect(layout.sellerSymbolTopRight.y).toBeCloseTo(1.5 * k);
    expect(layout.sellerSymbolBottomLeft.x).toBeCloseTo(1.5 * k);
    expect(layout.numberText.y + layout.numberText.fontSize).toBeCloseTo(37 - 1.5 * k);
    expect(layout.priceRow.x).toBeCloseTo(70 - 48 * k);
    expect(layout.priceRow.x + layout.priceRow.width).toBeCloseTo(70 - 1.5 * k);
  });
});

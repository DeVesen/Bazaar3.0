import {
  PRINT_LAYOUT,
  firstPageListHeightMm,
  listCapacityRows,
  paginateRows,
  restPageListHeightMm,
} from './print-document.layout';

describe('PRINT_LAYOUT', () => {
  it('tileRowBMm_always_isHalfAsHighAsTileRowAMm', () => {
    // Arrange & Act & Assert
    expect(PRINT_LAYOUT.tileRowBMm).toBe(PRINT_LAYOUT.tileRowAMm / 2);
  });
});

describe('list heights', () => {
  it('firstPageListHeightMm_noFreitext3_isInnerHeightMinusFixedBlocks', () => {
    // Arrange & Act
    const height = firstPageListHeightMm(0);

    // Assert
    expect(height).toBe(178);
  });

  it('firstPageListHeightMm_freitext3Present_shrinksByItsHeight', () => {
    // Arrange & Act
    const height = firstPageListHeightMm(30);

    // Assert
    expect(height).toBe(148);
  });

  it('restPageListHeightMm_always_isInnerHeightMinusHeaderContinuationAndFooter', () => {
    // Arrange & Act
    const height = restPageListHeightMm();

    // Assert
    expect(height).toBe(236);
  });
});

describe('listCapacityRows', () => {
  it('listCapacityRows_firstPageWithoutFreitext3_fitsTwentyFourRows', () => {
    // Arrange & Act
    const rows = listCapacityRows(firstPageListHeightMm(0));

    // Assert
    expect(rows).toBe(24);
  });

  it('listCapacityRows_followingPage_fitsThirtyTwoRows', () => {
    // Arrange & Act
    const rows = listCapacityRows(restPageListHeightMm());

    // Assert
    expect(rows).toBe(32);
  });

  it('listCapacityRows_firstPageWithMaxFreitext3_keepsAtLeastOneRow', () => {
    // Arrange & Act
    const rows = listCapacityRows(firstPageListHeightMm(PRINT_LAYOUT.maxFreitext3Mm));

    // Assert
    expect(rows).toBeGreaterThanOrEqual(1);
  });

  it('listCapacityRows_heightSmallerThanTableHead_isZero', () => {
    // Arrange & Act
    const rows = listCapacityRows(5);

    // Assert
    expect(rows).toBe(0);
  });
});

describe('paginateRows', () => {
  it('paginateRows_noRows_yieldsOneEmptyPage', () => {
    // Arrange & Act
    const pages = paginateRows<number>([], 10, 20);

    // Assert
    expect(pages).toEqual([[]]);
  });

  it('paginateRows_moreRowsThanFirstCapacity_continuesOnRestPages', () => {
    // Arrange & Act
    const pages = paginateRows([1, 2, 3, 4, 5], 2, 2);

    // Assert
    expect(pages).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('paginateRows_firstCapacityZero_startsWithEmptyFirstPage', () => {
    // Arrange & Act
    const pages = paginateRows([1, 2, 3], 0, 2);

    // Assert
    expect(pages).toEqual([[], [1, 2], [3]]);
  });

  it('paginateRows_headingWouldEndAPage_movesHeadingToNextPage', () => {
    // Arrange
    const rows = ['H1', 'a', 'b', 'H2', 'c'];

    // Act
    const pages = paginateRows(rows, 4, 4, (row) => row.startsWith('H'));

    // Assert
    expect(pages).toEqual([['H1', 'a', 'b'], ['H2', 'c']]);
  });

  it('paginateRows_headingIsOnlyRowOfCapacityOnePage_terminatesAndKeepsIt', () => {
    // Arrange
    const rows = ['H1', 'a'];

    // Act
    const pages = paginateRows(rows, 1, 1, (row) => row.startsWith('H'));

    // Assert
    expect(pages).toEqual([['H1'], ['a']]);
  });

  it('paginateRows_eightyOneRowsWithDefaultCapacities_needsThreePages', () => {
    // Arrange
    const rows = Array.from({ length: 81 }, (_, index) => index);

    // Act
    const pages = paginateRows(rows, 24, 32);

    // Assert
    expect(pages.map((page) => page.length)).toEqual([24, 32, 25]);
  });
});

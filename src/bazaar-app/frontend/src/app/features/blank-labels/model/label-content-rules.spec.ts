import {
  INITIAL_CONTENT_TEXTS,
  LabelContentTexts,
  previewStartNumber,
  previewElementSizes,
  previewStartPosition,
  validateLabelContent,
} from './label-content-rules';
import { DEFAULT_LABEL_ELEMENT_SIZES } from '../../../shared/components/label-sheet/label-layout';

const SIZE_RANGE_MESSAGE = 'Zahl von 0,1 bis 100 mit höchstens 1 Nachkommastelle';

function texts(overrides: Partial<LabelContentTexts>): LabelContentTexts {
  return { ...INITIAL_CONTENT_TEXTS, startNumber: '1000', count: '4', ...overrides };
}

describe('label-content-rules', () => {
  it('INITIAL_CONTENT_TEXTS_firstOpen_euroAndDefaultSizesAndEverythingElseEmpty', () => {
    // Arrange & Act
    const initial = INITIAL_CONTENT_TEXTS;

    // Assert
    expect(initial).toEqual({
      startNumber: '',
      count: '',
      currencySymbol: '€',
      qrCodeSize: '21,5',
      sellerSymbolSize: '5',
      numberHeight: '10,5',
      currencyHeight: '12',
      startPosition: '',
    });
  });

  it('validateLabelContent_valid_returnsRunWithStartPosition1ForEmpty', () => {
    // Arrange & Act
    const validation = validateLabelContent(texts({}), 16, null);

    // Assert
    expect(validation.errors).toEqual({});
    expect(validation.run).toEqual({
      startNumber: 1000,
      count: 4,
      startPosition: 1,
      currencySymbol: '€',
      sizes: DEFAULT_LABEL_ELEMENT_SIZES,
    });
  });

  it('validateLabelContent_changedSizesWithCommaAndPoint_runContainsSizes', () => {
    // Arrange & Act
    const validation = validateLabelContent(
      texts({ qrCodeSize: '18', sellerSymbolSize: '6.5', numberHeight: '8,5', currencyHeight: '9' }),
      16,
      null,
    );

    // Assert
    expect(validation.run?.sizes).toEqual({ qrCode: 18, sellerSymbol: 6.5, numberHeight: 8.5, currencyHeight: 9 });
  });

  it.each(['qrCodeSize', 'sellerSymbolSize', 'numberHeight', 'currencyHeight'] as const)(
    'validateLabelContent_%sEmpty_requiredError',
    (field) => {
      // Arrange & Act
      const validation = validateLabelContent(texts({ [field]: '  ' }), 16, field);

      // Assert
      expect(validation.errors).toEqual({ [field]: 'Pflichtfeld' });
      expect(validation.run).toBeNull();
    },
  );

  it.each([
    ['qrCodeSize', '0'],
    ['sellerSymbolSize', '100,1'],
    ['numberHeight', '1,25'],
    ['currencyHeight', 'abc'],
    ['qrCodeSize', '-5'],
  ] as const)('validateLabelContent_%s=%s_sizeRangeError', (field, text) => {
    // Arrange & Act
    const validation = validateLabelContent(texts({ [field]: text }), 16, field);

    // Assert
    expect(validation.errors).toEqual({ [field]: SIZE_RANGE_MESSAGE });
    expect(validation.run).toBeNull();
  });

  it.each([
    ['qrCodeSize', '0,1', 0.1],
    ['sellerSymbolSize', '100', 100],
    ['numberHeight', '8,5', 8.5],
  ] as const)('validateLabelContent_%s=%s_isValid', (field, text, expected) => {
    // Arrange & Act
    const validation = validateLabelContent(texts({ [field]: text }), 16, field);

    // Assert
    expect(validation.errors).toEqual({});
    expect(validation.run).not.toBeNull();
    expect(Object.values(validation.run?.sizes ?? {})).toContain(expected);
  });

  it('validateLabelContent_emptyStartNumberAndCount_errorsAtBoth', () => {
    // Arrange & Act
    const validation = validateLabelContent(INITIAL_CONTENT_TEXTS, 16, null);

    // Assert
    expect(validation.errors.startNumber).toBe('Pflichtfeld');
    expect(validation.errors.count).toBe('Pflichtfeld');
    expect(validation.run).toBeNull();
  });

  it.each([
    ['startNumber', '0'],
    ['startNumber', '2147483647'],
    ['count', '0'],
    ['count', '5001'],
    ['currencySymbol', 'EURO'],
    ['currencySymbol', ''],
    ['startPosition', '0'],
    ['startPosition', '17'],
  ] as const)('validateLabelContent_%s=%s_errorAtThatField', (field, text) => {
    // Arrange & Act
    const validation = validateLabelContent(texts({ [field]: text }), 16, field);

    // Assert
    expect(validation.errors[field]).toBeDefined();
    expect(validation.run).toBeNull();
  });

  it('validateLabelContent_lastNumberBeyondMaxAfterEditingCount_errorAtCount', () => {
    // Arrange & Act
    const validation = validateLabelContent(texts({ startNumber: '2147483000', count: '1000' }), 16, 'count');

    // Assert
    expect(validation.errors).toEqual({ count: 'Letzte Nummer darf 2147483646 nicht überschreiten' });
  });

  it('validateLabelContent_lastNumberBeyondMaxAfterEditingStartNumber_errorAtStartNumber', () => {
    // Arrange & Act
    const validation = validateLabelContent(texts({ startNumber: '2147483000', count: '1000' }), 16, 'startNumber');

    // Assert
    expect(validation.errors).toEqual({ startNumber: 'Letzte Nummer darf 2147483646 nicht überschreiten' });
  });

  it('validateLabelContent_lastNumberExactlyMax_isValid', () => {
    // Arrange & Act
    const validation = validateLabelContent(texts({ startNumber: '2147483643', count: '4' }), 16, 'count');

    // Assert
    expect(validation.run).not.toBeNull();
  });

  it('validateLabelContent_noValidSheetFormat_checksStartPositionLowerBoundOnly', () => {
    // Arrange & Act
    const validation = validateLabelContent(texts({ startPosition: '40' }), null, 'startPosition');

    // Assert
    expect(validation.errors.startPosition).toBeUndefined();
  });

  it('previewStartNumber_validNumber_returnsIt', () => {
    // Arrange & Act
    const value = previewStartNumber('1000');

    // Assert
    expect(value).toBe(1000);
  });

  it('previewStartNumber_empty_returnsNull', () => {
    // Arrange & Act
    const value = previewStartNumber('');

    // Assert
    expect(value).toBeNull();
  });

  it('previewElementSizes_validTexts_returnsTheirSizes', () => {
    // Arrange & Act
    const sizes = previewElementSizes(texts({ qrCodeSize: '15', sellerSymbolSize: '7', numberHeight: '9,5', currencyHeight: '6' }));

    // Assert
    expect(sizes).toEqual({ qrCode: 15, sellerSymbol: 7, numberHeight: 9.5, currencyHeight: 6 });
  });

  it('previewElementSizes_invalidOrEmptyTexts_fallBackToDefaultsPerField', () => {
    // Arrange & Act
    const sizes = previewElementSizes(texts({ qrCodeSize: '', sellerSymbolSize: '0', numberHeight: 'abc', currencyHeight: '8' }));

    // Assert
    expect(sizes).toEqual({ ...DEFAULT_LABEL_ELEMENT_SIZES, currencyHeight: 8 });
  });

  it('previewStartPosition_outOfRange_fallsBackTo1', () => {
    // Arrange & Act
    const position = previewStartPosition('17', 16);

    // Assert
    expect(position).toBe(1);
  });

  it('previewStartPosition_seven_returns7', () => {
    // Arrange & Act
    const position = previewStartPosition('7', 16);

    // Assert
    expect(position).toBe(7);
  });
});

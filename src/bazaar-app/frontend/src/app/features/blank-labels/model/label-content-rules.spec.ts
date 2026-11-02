import {
  INITIAL_CONTENT_TEXTS,
  LabelContentTexts,
  previewStartNumber,
  previewStartPosition,
  validateLabelContent,
} from './label-content-rules';

function texts(overrides: Partial<LabelContentTexts>): LabelContentTexts {
  return { ...INITIAL_CONTENT_TEXTS, startNumber: '1000', count: '4', ...overrides };
}

describe('label-content-rules', () => {
  it('INITIAL_CONTENT_TEXTS_firstOpen_euroAndEverythingElseEmpty', () => {
    // Arrange & Act
    const initial = INITIAL_CONTENT_TEXTS;

    // Assert
    expect(initial).toEqual({ startNumber: '', count: '', currencySymbol: '€', startPosition: '' });
  });

  it('validateLabelContent_valid_returnsRunWithStartPosition1ForEmpty', () => {
    // Arrange & Act
    const validation = validateLabelContent(texts({}), 16, null);

    // Assert
    expect(validation.errors).toEqual({});
    expect(validation.run).toEqual({ startNumber: 1000, count: 4, startPosition: 1, currencySymbol: '€' });
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

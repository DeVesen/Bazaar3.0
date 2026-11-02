import { AVERY_16_GEOMETRY } from '../../../shared/components/label-sheet/label-geometry';
import {
  SHEET_FORMAT_MESSAGES,
  SheetFormatTexts,
  canSaveFormat,
  formatNameError,
  normalizeFormatName,
  textsFromGeometry,
  validateSheetFormat,
} from './sheet-format-rules';

function avery16Texts(overrides: Partial<SheetFormatTexts> = {}): SheetFormatTexts {
  return { ...textsFromGeometry(AVERY_16_GEOMETRY), ...overrides };
}

describe('sheet-format-rules', () => {
  it('textsFromGeometry_avery16_formatsAllTwelveFieldsGerman', () => {
    // Arrange & Act
    const texts = textsFromGeometry(AVERY_16_GEOMETRY);

    // Assert
    expect(texts).toEqual({
      sheetWidth: '210',
      sheetHeight: '297',
      labelWidth: '105',
      labelHeight: '35',
      marginTop: '8,5',
      marginRight: '0',
      marginBottom: '8,5',
      marginLeft: '0',
      gapHorizontal: '0',
      gapVertical: '0',
      columns: '2',
      rows: '8',
    });
  });

  it('validateSheetFormat_avery16_returnsGeometryWithoutErrors', () => {
    // Arrange & Act
    const validation = validateSheetFormat(avery16Texts(), null);

    // Assert
    expect(validation.errors).toEqual({});
    expect(validation.geometry).toEqual(AVERY_16_GEOMETRY);
  });

  it('validateSheetFormat_threeColumnsJustEdited_errorAtColumns', () => {
    // Arrange & Act
    const validation = validateSheetFormat(avery16Texts({ columns: '3' }), 'columns');

    // Assert
    expect(validation.errors).toEqual({ columns: SHEET_FORMAT_MESSAGES.widthOverflow });
    expect(validation.geometry).toBeNull();
  });

  it('validateSheetFormat_marginTop9_1JustEdited_errorAtMarginTop', () => {
    // Arrange & Act
    const validation = validateSheetFormat(avery16Texts({ marginTop: '9,1' }), 'marginTop');

    // Assert
    expect(validation.errors).toEqual({ marginTop: SHEET_FORMAT_MESSAGES.heightOverflow });
  });

  it('validateSheetFormat_marginTop8_9_noError', () => {
    // Arrange & Act
    const validation = validateSheetFormat(avery16Texts({ marginTop: '8,9' }), 'marginTop');

    // Assert
    expect(validation.errors).toEqual({});
    expect(validation.geometry?.marginTop).toBe(8.9);
  });

  it('validateSheetFormat_overflowWithoutEdit_errorAtRows', () => {
    // Arrange & Act
    const validation = validateSheetFormat(avery16Texts({ rows: '9' }), null);

    // Assert
    expect(validation.errors).toEqual({ rows: SHEET_FORMAT_MESSAGES.heightOverflow });
  });

  it('validateSheetFormat_overflowAfterEditingOtherAxis_errorAtColumns', () => {
    // Arrange & Act
    const validation = validateSheetFormat(avery16Texts({ columns: '3' }), 'marginTop');

    // Assert
    expect(validation.errors).toEqual({ columns: SHEET_FORMAT_MESSAGES.widthOverflow });
  });

  it.each([
    ['labelWidth', '0', SHEET_FORMAT_MESSAGES.positive],
    ['sheetHeight', '0', SHEET_FORMAT_MESSAGES.positive],
    ['marginLeft', '0,25', SHEET_FORMAT_MESSAGES.oneDecimal],
    ['marginTop', '-1', SHEET_FORMAT_MESSAGES.nonNegative],
    ['columns', '0', SHEET_FORMAT_MESSAGES.wholeNumber],
    ['rows', '2,5', SHEET_FORMAT_MESSAGES.wholeNumber],
    ['sheetWidth', 'abc', SHEET_FORMAT_MESSAGES.notANumber],
    ['labelHeight', '', SHEET_FORMAT_MESSAGES.required],
    ['sheetWidth', '10000,1', SHEET_FORMAT_MESSAGES.maxMeasure],
    ['marginLeft', '10001', SHEET_FORMAT_MESSAGES.maxMeasure],
    ['columns', '1001', SHEET_FORMAT_MESSAGES.maxCount],
    ['rows', '1001', SHEET_FORMAT_MESSAGES.maxCount],
  ] as const)('validateSheetFormat_%s=%s_errorAtThatFieldAndNoGeometry', (field, text, message) => {
    // Arrange & Act
    const validation = validateSheetFormat(avery16Texts({ [field]: text }), field);

    // Assert
    expect(validation.errors).toEqual({ [field]: message });
    expect(validation.geometry).toBeNull();
  });

  it('validateSheetFormat_measureExactlyBackendLimit_noFieldError', () => {
    // Arrange & Act
    const validation = validateSheetFormat(avery16Texts({ sheetWidth: '10000' }), 'sheetWidth');

    // Assert
    expect(validation.geometry?.sheetWidth).toBe(10000);
  });

  it('validateSheetFormat_zeroMarginsAndGaps_isValid', () => {
    // Arrange & Act
    const validation = validateSheetFormat(avery16Texts({ marginTop: '0', marginBottom: '0' }), 'marginBottom');

    // Assert
    expect(validation.geometry).not.toBeNull();
  });

  it('canSaveFormat_validFormatAndName_returnsTrue', () => {
    // Arrange
    const validation = validateSheetFormat(avery16Texts(), null);

    // Act
    const canSave = canSaveFormat(validation, 'Avery 12er');

    // Assert
    expect(canSave).toBe(true);
  });

  it.each(['', '   ', 'x'.repeat(51)])('canSaveFormat_name"%s"_returnsFalse', (name) => {
    // Arrange
    const validation = validateSheetFormat(avery16Texts(), null);

    // Act
    const canSave = canSaveFormat(validation, name);

    // Assert
    expect(canSave).toBe(false);
  });

  it('canSaveFormat_invalidMeasure_returnsFalse', () => {
    // Arrange
    const validation = validateSheetFormat(avery16Texts({ labelWidth: '' }), 'labelWidth');

    // Act
    const canSave = canSaveFormat(validation, 'Avery 12er');

    // Assert
    expect(canSave).toBe(false);
  });

  it('formatNameError_51Characters_returnsMaxLengthMessage', () => {
    // Arrange & Act
    const error = formatNameError('x'.repeat(51));

    // Assert
    expect(error).toBe('Höchstens 50 Zeichen');
  });

  it('normalizeFormatName_paddedName_trimsBothEnds', () => {
    // Arrange & Act
    const name = normalizeFormatName(' Avery 12er ');

    // Assert
    expect(name).toBe('Avery 12er');
  });
});

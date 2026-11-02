import { formatDecimal, parseDecimal } from './number-input';

describe('number-input', () => {
  it('parseDecimal_germanComma_returnsNumberWithOneDecimal', () => {
    // Arrange & Act
    const parsed = parseDecimal('8,5');

    // Assert
    expect(parsed).toEqual({ kind: 'number', value: 8.5, decimals: 1 });
  });

  it('parseDecimal_dotAndTwoDecimals_countsTwoDecimals', () => {
    // Arrange & Act
    const parsed = parseDecimal(' 0.25 ');

    // Assert
    expect(parsed).toEqual({ kind: 'number', value: 0.25, decimals: 2 });
  });

  it('parseDecimal_negativeInteger_returnsNegativeNumber', () => {
    // Arrange & Act
    const parsed = parseDecimal('-1');

    // Assert
    expect(parsed).toEqual({ kind: 'number', value: -1, decimals: 0 });
  });

  it('parseDecimal_blank_returnsEmpty', () => {
    // Arrange & Act
    const parsed = parseDecimal('   ');

    // Assert
    expect(parsed).toEqual({ kind: 'empty' });
  });

  it('parseDecimal_letters_returnsInvalid', () => {
    // Arrange & Act
    const parsed = parseDecimal('12a');

    // Assert
    expect(parsed).toEqual({ kind: 'invalid' });
  });

  it('formatDecimal_eightPointFive_usesGermanComma', () => {
    // Arrange & Act
    const text = formatDecimal(8.5);

    // Assert
    expect(text).toBe('8,5');
  });
});

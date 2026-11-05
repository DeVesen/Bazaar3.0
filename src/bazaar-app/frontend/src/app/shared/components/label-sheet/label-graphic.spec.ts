import { EMPTY_LABEL_CONTENT, LABEL_ICON_KEYS, LABEL_ICON_TITLES } from './label-graphic';
import { DEFAULT_LABEL_ELEMENT_SIZES } from './label-layout';

describe('label-graphic', () => {
  it('LABEL_ICON_KEYS_always_offersAtLeastOneIconWithTitle', () => {
    // Arrange & Act
    const titles = LABEL_ICON_KEYS.map((key) => LABEL_ICON_TITLES[key]);

    // Assert
    expect(LABEL_ICON_KEYS.length).toBeGreaterThanOrEqual(1);
    expect(titles.every((title) => title.length > 0)).toBe(true);
  });

  it('EMPTY_LABEL_CONTENT_always_hasEuroNoGraphicsAndDefaultSizes', () => {
    // Arrange & Act
    const content = EMPTY_LABEL_CONTENT;

    // Assert
    expect(content).toEqual({ logo: null, sellerSymbol: null, currencySymbol: '€', sizes: DEFAULT_LABEL_ELEMENT_SIZES });
  });
});

import { IMAGE_NAME_MAX_LENGTH, MAX_IMAGE_BYTES, imageFileError, imageNameOf, readFileAsDataUrl } from './image-file';

function fileOf(type: string, size: number): File {
  return new File([new Uint8Array(size)], 'bild', { type });
}

describe('image-file', () => {
  it('imageNameOf_fileNameWithExtension_returnsNameWithoutExtension', () => {
    // Arrange
    const file = new File(['x'], 'Mein Logo.final.png', { type: 'image/png' });

    // Act
    const name = imageNameOf(file);

    // Assert
    expect(name).toBe('Mein Logo.final');
  });

  it('imageNameOf_veryLongName_isTruncatedToMaxLength', () => {
    // Arrange
    const file = new File(['x'], `${'a'.repeat(80)}.png`, { type: 'image/png' });

    // Act
    const name = imageNameOf(file);

    // Assert
    expect(name).toHaveLength(IMAGE_NAME_MAX_LENGTH);
  });

  it('imageNameOf_onlyExtension_returnsFallbackName', () => {
    // Arrange
    const file = new File(['x'], '.png', { type: 'image/png' });

    // Act
    const name = imageNameOf(file);

    // Assert
    expect(name).toBe('Bild');
  });

  it.each(['image/png', 'image/jpeg', 'image/svg+xml'])('imageFileError_%sUpTo1Mb_returnsNull', (type) => {
    // Arrange
    const file = fileOf(type, MAX_IMAGE_BYTES);

    // Act
    const error = imageFileError(file);

    // Assert
    expect(error).toBeNull();
  });

  it('imageFileError_gif_returnsTypeError', () => {
    // Arrange
    const file = fileOf('image/gif', 10);

    // Act
    const error = imageFileError(file);

    // Assert
    expect(error).toBe('Nur PNG, JPEG oder SVG');
  });

  it('imageFileError_pngOver1Mb_returnsSizeError', () => {
    // Arrange
    const file = fileOf('image/png', MAX_IMAGE_BYTES + 1);

    // Act
    const error = imageFileError(file);

    // Assert
    expect(error).toBe('Bild ist größer als 1 MB');
  });

  it('readFileAsDataUrl_png_returnsBase64DataUrl', async () => {
    // Arrange
    const file = fileOf('image/png', 3);

    // Act
    const dataUrl = await readFileAsDataUrl(file);

    // Assert
    expect(dataUrl).toBe('data:image/png;base64,AAAA');
  });
});

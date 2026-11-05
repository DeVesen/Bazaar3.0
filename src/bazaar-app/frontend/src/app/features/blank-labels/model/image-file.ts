const ACCEPTED_IMAGE_TYPES: readonly string[] = ['image/png', 'image/jpeg', 'image/svg+xml'];

/** 1 MB = 1 048 576 Byte, gleiche Grenze wie `LabelGraphic.MaxImageBytes` im Backend. */
export const MAX_IMAGE_BYTES = 1_048_576;

/** Filter des Dateidialogs; geprüft wird trotzdem mit `imageFileError` (Drag & Drop umgeht ihn). */
export const IMAGE_FILE_ACCEPT = '.png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml';

export function imageFileError(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Nur PNG, JPEG oder SVG';
  if (file.size > MAX_IMAGE_BYTES) return 'Bild ist größer als 1 MB';
  return null;
}

/** Liest das Bild als Base64-Data-URL, so wie das Backend es speichert. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Datei konnte nicht gelesen werden'));
    reader.readAsDataURL(file);
  });
}

/** Höchstzahl der Bilder in der Bibliothek, gleicher Wert wie `LabelImage.MaxCount` im Backend. */
export const LIBRARY_MAX_IMAGES = 50;

/** Längster Bildname, gleicher Wert wie `LabelImage.NameMaxLength` im Backend. */
export const IMAGE_NAME_MAX_LENGTH = 50;

const FALLBACK_IMAGE_NAME = 'Bild';

/** Name in der Bibliothek: Dateiname ohne Endung, auf die Höchstlänge gekürzt. */
export function imageNameOf(file: File): string {
  const dot = file.name.lastIndexOf('.');
  const base = dot > 0 ? file.name.slice(0, dot) : dot === 0 ? '' : file.name;
  const name = base.trim().slice(0, IMAGE_NAME_MAX_LENGTH).trim();
  return name === '' ? FALLBACK_IMAGE_NAME : name;
}

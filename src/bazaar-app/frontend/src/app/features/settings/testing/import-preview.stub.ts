import { ImportPanel } from '../components/import-panel/import-panel';
import { ImportPreviewResult } from '../data/import-api';

/** Vorschau-Ergebnis für Specs des Imports; `overrides` ersetzt einzelne Felder. */
export function previewResultStub(overrides: Partial<ImportPreviewResult> = {}): ImportPreviewResult {
  return {
    sellerCount: 84,
    articleCount: 612,
    newSellers: 71,
    replacedSellers: 11,
    skippedSellers: [],
    unknownSellerTypes: [],
    newBrands: 23,
    newCategories: 5,
    ...overrides,
  };
}

/** A `new File(...)` stand-in for the file the (mocked) `p-fileupload`'s `onSelect` would emit —
 * `p-fileupload`'s real native file picker can't be driven in a jsdom unit test, so specs drive
 * `onFileSelect()` directly with a `FileSelectEvent`-shaped object rather than simulating a native
 * `<input type="file">` change event. */
export function selectEventFor(file: File): Parameters<ImportPanel['onFileSelect']>[0] {
  return { files: [file] } as unknown as Parameters<ImportPanel['onFileSelect']>[0];
}

/** Leere JSON-Datei als Import-Quelle für Specs. */
export function jsonFile(name = 'export-2026-08-17.json'): File {
  return new File(['{}'], name, { type: 'application/json' });
}

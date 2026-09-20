import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ImportPanel } from './import-panel';
import { ImportApi, ImportPreviewResult } from '../../data/import-api';
// Same sanctioned cross-feature import as import-panel.ts itself (see that file's comment).
// eslint-disable-next-line boundaries/dependencies
import { SellerTypesApi } from '../../../seller-types/data/seller-types-api';

const SELLER_TYPES = [
  { id: 'st-privat', name: 'Privat', commissionRate: 10, itemFee: 0.5, sellerCount: 10 },
];

function previewResultStub(overrides: Partial<ImportPreviewResult> = {}): ImportPreviewResult {
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
 * per task-6-brief.md, `p-fileupload`'s real native file picker can't be driven in a jsdom unit
 * test, so this codebase's first fileupload spec drives `onFileSelect()` directly with a
 * `FileSelectEvent`-shaped object rather than simulating a native `<input type="file">` change
 * event (no existing precedent for this found via `grep -rn "new File("` across the frontend). */
function selectEventFor(file: File) {
  return { files: [file] } as unknown as Parameters<ImportPanel['onFileSelect']>[0];
}

function jsonFile(name = 'export-2026-08-17.json'): File {
  return new File(['{}'], name, { type: 'application/json' });
}

describe('ImportPanel', () => {
  let preview: ReturnType<typeof vi.fn>;
  let run: ReturnType<typeof vi.fn>;
  let getAll: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    preview = vi.fn();
    run = vi.fn();
    getAll = vi.fn().mockReturnValue(of(SELLER_TYPES));
    messageServiceAdd = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ImportPanel],
      providers: [
        { provide: ImportApi, useValue: { preview, run } },
        { provide: SellerTypesApi, useValue: { getAll } },
        { provide: MessageService, useValue: { add: messageServiceAdd } },
      ],
    }).compileComponents();
  });

  function createPanel() {
    const fixture = TestBed.createComponent(ImportPanel);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('starts in the empty state with seller types loaded via SellerTypesApi.getAll', () => {
    const { component } = createPanel();

    expect(component.state()).toBe('empty');
    expect(getAll).toHaveBeenCalled();
    expect(component.sellerTypesOptions()).toEqual(SELLER_TYPES);
  });

  it('AC-1: selecting a file immediately previews it and moves to the preview state', () => {
    preview.mockReturnValue(of(previewResultStub()));
    const { component } = createPanel();
    const file = jsonFile();

    component.onFileSelect(selectEventFor(file));

    expect(preview).toHaveBeenCalledWith(file);
    expect(component.selectedFile()).toBe(file);
    expect(component.state()).toBe('preview');
    expect(component.previewResult()).toEqual(previewResultStub());
    expect(component.previewError()).toBeNull();
  });

  it('AC-4: confirm stays disabled until every unknown seller type is mapped', () => {
    preview.mockReturnValue(
      of(previewResultStub({ unknownSellerTypes: [{ name: 'Verein', affectedSellers: 3 }] })),
    );
    const { component } = createPanel();
    component.onFileSelect(selectEventFor(jsonFile()));

    expect(component.confirmDisabled()).toBe(true);

    component.onSellerTypeMappingChange('Verein', 'st-privat');

    expect(component.confirmDisabled()).toBe(false);
  });

  it('AC-6/AC-7: confirming runs the import, shows a progress state, and resets after success', () => {
    vi.useFakeTimers();
    preview.mockReturnValue(of(previewResultStub()));
    run.mockReturnValue(
      of({ importedSellers: 82, importedArticles: 598, skippedSellers: 2, importedBrands: 23, importedCategories: 5 }),
    );
    const { component } = createPanel();
    component.onFileSelect(selectEventFor(jsonFile()));

    component.onConfirm();

    expect(run).toHaveBeenCalledWith(
      component.selectedFile(),
      expect.objectContaining({ importBrands: true, importCategories: true, sellerTypeMapping: {} }),
    );
    expect(component.state()).toBe('done');
    expect(messageServiceAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', summary: '✓ Import erfolgreich' }),
    );

    vi.runAllTimers();

    expect(component.state()).toBe('empty');
    expect(component.selectedFile()).toBeNull();
    expect(component.previewResult()).toBeNull();
    vi.useRealTimers();
  });

  it('a failed run shows an error toast and returns to the preview state (not empty)', () => {
    preview.mockReturnValue(of(previewResultStub()));
    run.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const { component } = createPanel();
    component.onFileSelect(selectEventFor(jsonFile()));

    component.onConfirm();

    expect(component.state()).toBe('preview');
    expect(component.previewResult()).toEqual(previewResultStub());
    expect(messageServiceAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Import fehlgeschlagen' }),
    );
  });

  it('AC-8: a 400 import.invalid_format response shows an error message and leaves the file picker usable', () => {
    preview.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errorCode: 'import.invalid_format', detail: 'Datei entspricht nicht dem erwarteten Schema' },
          }),
      ),
    );
    const { component } = createPanel();

    component.onFileSelect(selectEventFor(jsonFile('broken.json')));

    expect(component.previewError()).toBe('Datei entspricht nicht dem erwarteten Schema.');
    expect(component.previewResult()).toBeNull();
    expect(component.state()).toBe('empty');

    // File picker usable again: a second selection still triggers a fresh preview call.
    preview.mockReturnValue(of(previewResultStub()));
    component.onFileSelect(selectEventFor(jsonFile('fixed.json')));

    expect(component.previewError()).toBeNull();
    expect(component.state()).toBe('preview');
  });

  it('a non-400 preview error shows the generic toast instead of previewError', () => {
    preview.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const { component } = createPanel();

    component.onFileSelect(selectEventFor(jsonFile()));

    expect(component.previewError()).toBeNull();
    expect(component.state()).toBe('empty');
    expect(messageServiceAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Vorschau konnte nicht geladen werden' }),
    );
  });

  it('AC-9: a valid but empty file shows the hint text (not an error) and keeps confirm disabled', () => {
    preview.mockReturnValue(of(previewResultStub({ sellerCount: 0 })));
    const { component } = createPanel();

    component.onFileSelect(selectEventFor(jsonFile()));

    expect(component.previewError()).toBeNull();
    expect(component.previewResult()?.sellerCount).toBe(0);
    expect(component.confirmDisabled()).toBe(true);
  });

  it('translates skipped-seller reasons for display', () => {
    const { component } = createPanel();

    expect(component.reasonText({ id: 'a', name: 'Anna Meier', reason: 'has_sold_articles', soldCount: 7 })).toBe(
      '7 verkaufte Artikel',
    );
    expect(component.reasonText({ id: 'b', name: 'Bea Schmidt', reason: 'settled' })).toBe('abgerechnet');
  });
});

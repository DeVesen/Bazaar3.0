import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ImportPanel } from './import-panel';
import { ImportApi } from '../../data/import-api';
import { jsonFile, previewResultStub, selectEventFor } from '../../testing/import-preview.stub';
// Same sanctioned cross-feature import as import-panel.ts itself (see that file's comment).
// eslint-disable-next-line boundaries/dependencies
import { SellerTypesApi } from '../../../seller-types/data/seller-types-api';

const SELLER_TYPES = [
  { id: 'st-privat', name: 'Privat', commissionRate: 10, itemFee: 0.5, sellerCount: 10 },
];

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

  it('fix round 1, Finding 1: the preview/confirm-button block is hidden during the "done" reset-delay window (no double-submit)', () => {
    vi.useFakeTimers();
    preview.mockReturnValue(of(previewResultStub()));
    run.mockReturnValue(
      of({ importedSellers: 82, importedArticles: 598, skippedSellers: 2, importedBrands: 23, importedCategories: 5 }),
    );
    const { component } = createPanel();
    component.onFileSelect(selectEventFor(jsonFile()));
    expect(component.showPreview()).toBe(true);

    component.onConfirm();

    // `state()` is 'done' (not 'running'), yet the panel must still hide the preview/button —
    // otherwise the same file could be re-submitted via a second `onConfirm()` call before the
    // delayed reset runs.
    expect(component.state()).toBe('done');
    expect(component.showPreview()).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(component.showPreview()).toBe(false);

    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('fix round 1, Finding 2: selecting a new file during the post-success reset-delay window is not later wiped by the stale timeout', () => {
    vi.useFakeTimers();
    preview.mockReturnValue(of(previewResultStub()));
    run.mockReturnValue(
      of({ importedSellers: 82, importedArticles: 598, skippedSellers: 2, importedBrands: 23, importedCategories: 5 }),
    );
    const { component } = createPanel();
    component.onFileSelect(selectEventFor(jsonFile('first.json')));
    component.onConfirm();
    expect(component.state()).toBe('done');

    // Within the reset-delay window, a new file is selected (only reachable once Finding 1 is
    // fixed and the admin can still interact with the picker — the picker itself is never
    // disabled by `state`).
    vi.advanceTimersByTime(500);
    const secondPreview = previewResultStub({ sellerCount: 12, articleCount: 40 });
    preview.mockReturnValue(of(secondPreview));
    const secondFile = jsonFile('second.json');
    component.onFileSelect(selectEventFor(secondFile));

    expect(component.selectedFile()).toBe(secondFile);
    expect(component.previewResult()).toEqual(secondPreview);
    expect(component.state()).toBe('preview');

    // The stale timeout from the FIRST import's success must not fire and wipe this new
    // selection back to `empty` once its original 2000ms delay elapses.
    vi.advanceTimersByTime(2000);

    expect(component.state()).toBe('preview');
    expect(component.selectedFile()).toBe(secondFile);
    expect(component.previewResult()).toEqual(secondPreview);

    vi.useRealTimers();
  });

  it('fix round 1, Finding 2: ngOnDestroy cancels a still-pending reset timeout', () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    preview.mockReturnValue(of(previewResultStub()));
    run.mockReturnValue(
      of({ importedSellers: 82, importedArticles: 598, skippedSellers: 2, importedBrands: 23, importedCategories: 5 }),
    );
    const { fixture, component } = createPanel();
    component.onFileSelect(selectEventFor(jsonFile()));
    component.onConfirm();
    expect(component.state()).toBe('done');
    clearTimeoutSpy.mockClear();

    fixture.destroy();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
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

  it('hasUnsavedChanges_previewOpen_isTrue', () => {
    // Arrange
    preview.mockReturnValue(of(previewResultStub()));
    const { component } = createPanel();

    // Act
    component.onFileSelect(selectEventFor(jsonFile()));

    // Assert
    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('hasUnsavedChanges_noFileSelected_isFalse', () => {
    // Arrange & Act
    const { component } = createPanel();

    // Assert
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('discardChanges_previewOpen_closesThePreview', () => {
    // Arrange
    preview.mockReturnValue(of(previewResultStub()));
    const { component } = createPanel();
    component.onFileSelect(selectEventFor(jsonFile()));

    // Act
    component.discardChanges();

    // Assert
    expect(component.state()).toBe('empty');
    expect(component.selectedFile()).toBeNull();
    expect(component.previewResult()).toBeNull();
    expect(component.showPreview()).toBe(false);
    expect(component.hasUnsavedChanges()).toBe(false);
  });
});

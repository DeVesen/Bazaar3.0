import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { BooleanInput } from '../../../../shared/components/boolean-input/boolean-input';
import { ImportApi, ImportOptions, ImportPreviewResult, SkippedSeller } from '../../data/import-api';
// Cross-feature import, read-only: `SellerTypesApi.getAll()` populates each unknown-seller-type
// `p-select`'s option list. Sanctioned explicitly by task-6-brief.md ("reuse this — do not
// create a duplicate API client for seller types"), same pattern already used by
// `verkaeufer-dialog.ts` (Round-14 Task 8) for the identical reuse.
// eslint-disable-next-line boundaries/dependencies
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';

const IMPORT_SUCCESS_RESET_DELAY_MS = 2000;

const SKIPPED_REASON_TEXT: Record<string, (seller: SkippedSeller) => string> = {
  has_sold_articles: (seller) => `${seller.soldCount ?? 0} verkaufte Artikel`,
  settled: () => 'abgerechnet',
};

/**
 * `import-panel` (docs/components/import-panel/component.md, Round-26 Task 6) — übernimmt die
 * JSON-Datei der Voranmelde-App. Vier Zustände (`empty` → `preview` → `running` → `done`), Ablauf
 * und Akzeptanzkriterien siehe die Komponenten-Doku; Wire-Contract siehe
 * `docs/requirements/bazaar-app/api/import.md`.
 *
 * `selectedFile` wird bewusst nicht sofort verworfen, sondern bis zum nächsten Dateiwechsel oder
 * bis der Zyklus abgeschlossen ist gehalten — der zweite Request (`POST /api/import`) braucht
 * dieselbe Datei erneut, siehe die Begründung in api/import.md ("Ein Zwischenspeicher bräuchte
 * Lebensdauer, Aufräumjob und eine Kennung").
 */
@Component({
  selector: 'app-import-panel',
  imports: [FormsModule, ButtonModule, FileUploadModule, ProgressBarModule, SelectModule, BooleanInput],
  templateUrl: './import-panel.html',
  styleUrl: './import-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportPanel implements OnDestroy {
  private readonly importApi = inject(ImportApi);
  private readonly sellerTypesApi = inject(SellerTypesApi);
  private readonly messageService = inject(MessageService);

  /** Handle of the delayed `resetToEmpty()` scheduled by a successful `onConfirm()` (fix round 1,
   * Finding 2). Plain field, not a signal — it's a housekeeping detail, not render state. Cleared
   * at the start of every `onFileSelect()` (a new selection during the reset-delay window must
   * win, not be silently wiped out later by the stale timeout) and in `ngOnDestroy` (no leaked
   * timer firing after the component is gone). */
  private pendingResetTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly state = signal<'empty' | 'preview' | 'running' | 'done'>('empty');
  readonly selectedFile = signal<File | null>(null);
  readonly previewResult = signal<ImportPreviewResult | null>(null);
  readonly previewError = signal<string | null>(null);
  readonly sellerTypeMapping = signal<Record<string, string>>({});
  readonly importBrands = signal(true);
  readonly importCategories = signal(true);
  readonly sellerTypesOptions = signal<SellerType[]>([]);

  readonly confirmDisabled = computed(() => {
    const result = this.previewResult();
    if (!result || result.sellerCount === 0) return true;
    const mapping = this.sellerTypeMapping();
    return result.unknownSellerTypes.some((type) => !mapping[type.name]);
  });

  /** Fix round 1, Finding 1: the preview block and confirm button must disappear once the import
   * has succeeded (`state() === 'done'`) — matching the component doc's "Vorschau verschwindet" —
   * so the same file can't be re-submitted with `POST /api/import` during the
   * `IMPORT_SUCCESS_RESET_DELAY_MS` window before `resetToEmpty()` runs. */
  readonly showPreview = computed(
    () => this.previewResult() !== null && !this.previewError() && this.state() !== 'done',
  );

  constructor() {
    this.sellerTypesApi.getAll().subscribe((sellerTypes) => this.sellerTypesOptions.set(sellerTypes));
  }

  ngOnDestroy(): void {
    this.clearPendingReset();
  }

  onFileSelect(event: FileSelectEvent): void {
    const file = event.files[0];
    if (!file) return;

    // Fix round 1, Finding 2: a new selection always wins over a still-pending reset from a
    // just-finished import — cancel it before touching any state, otherwise the stale timeout
    // would fire later and silently wipe this new selection/preview back to `empty`.
    this.clearPendingReset();

    this.selectedFile.set(file);
    this.previewError.set(null);
    this.previewResult.set(null);
    this.sellerTypeMapping.set({});

    this.importApi.preview(file).subscribe({
      next: (result) => {
        this.previewResult.set(result);
        this.state.set('preview');
      },
      error: (error: unknown) => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 400 &&
          (error.error as { errorCode?: string } | null)?.errorCode === 'import.invalid_format'
        ) {
          this.previewError.set('Datei entspricht nicht dem erwarteten Schema.');
          this.state.set('empty');
          return;
        }
        this.messageService.add({ severity: 'error', summary: 'Vorschau konnte nicht geladen werden' });
        this.state.set('empty');
      },
    });
  }

  onSellerTypeMappingChange(unknownName: string, sellerTypeId: string): void {
    this.sellerTypeMapping.update((mapping) => ({ ...mapping, [unknownName]: sellerTypeId }));
  }

  onImportBrandsChange(value: boolean): void {
    this.importBrands.set(value);
  }

  onImportCategoriesChange(value: boolean): void {
    this.importCategories.set(value);
  }

  reasonText(skippedSeller: SkippedSeller): string {
    return SKIPPED_REASON_TEXT[skippedSeller.reason]?.(skippedSeller) ?? skippedSeller.reason;
  }

  onConfirm(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.state.set('running');

    const options: ImportOptions = {
      sellerTypeMapping: this.sellerTypeMapping(),
      importBrands: this.importBrands(),
      importCategories: this.importCategories(),
    };

    this.importApi.run(file, options).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '✓ Import erfolgreich' });
        this.state.set('done');
        // Round-26 Task 6 judgment call: no project-wide toast-dismiss-then-reset convention
        // found (grepped for existing `setTimeout` reset patterns) — 2s is long enough for the
        // toast to register before the panel returns to `empty`, see IMPORT_SUCCESS_RESET_DELAY_MS.
        // Handle stored so a new file selection (or component teardown) can cancel it — see
        // `pendingResetTimeout`'s doc comment (fix round 1, Finding 2).
        this.clearPendingReset();
        this.pendingResetTimeout = setTimeout(() => {
          this.pendingResetTimeout = null;
          this.resetToEmpty();
        }, IMPORT_SUCCESS_RESET_DELAY_MS);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Import fehlgeschlagen' });
        // Stays on the preview (not reset to empty) so a transient failure doesn't force the
        // admin to re-upload — same file/mapping/checkboxes are still there for a retry.
        this.state.set('preview');
      },
    });
  }

  private clearPendingReset(): void {
    if (this.pendingResetTimeout === null) return;
    clearTimeout(this.pendingResetTimeout);
    this.pendingResetTimeout = null;
  }

  private resetToEmpty(): void {
    this.state.set('empty');
    this.selectedFile.set(null);
    this.previewResult.set(null);
    this.previewError.set(null);
    this.sellerTypeMapping.set({});
    this.importBrands.set(true);
    this.importCategories.set(true);
  }
}

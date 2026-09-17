import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import type { ImportRowError, ImportSummary } from '../articles-import-export-api.service';

export type ImportResultData =
  | { kind: 'success'; summary: ImportSummary }
  | { kind: 'rowErrors'; errors: ImportRowError[] }
  | { kind: 'generalError'; message: string };

@Component({
  selector: 'app-import-result-dialog',
  imports: [DialogModule, TableModule, ButtonModule, TranslatePipe],
  template: `
    <p-dialog [visible]="visible()" (visibleChange)="visibleChange.emit($event)" [modal]="true" [header]="'myArticles.import.dialogHeader' | translate">
      @if (result(); as r) {
        @switch (r.kind) {
          @case ('success') {
            <p data-testid="import-success">{{ 'myArticles.import.success' | translate: { created: r.summary.created, updated: r.summary.updated, deleted: r.summary.deleted } }}</p>
          }
          @case ('rowErrors') {
            <p-table [value]="r.errors" data-testid="import-error-table">
              <ng-template #header>
                <tr>
                  <th>{{ 'myArticles.import.rowColumn' | translate }}</th>
                  <th>{{ 'myArticles.import.errorColumn' | translate }}</th>
                </tr>
              </ng-template>
              <ng-template #body let-error>
                <tr>
                  <td>{{ error.row }}</td>
                  <td>{{ errorMessageKey(error.errorCode) ? (errorMessageKey(error.errorCode) | translate: { row: error.row }) : error.detail }}</td>
                </tr>
              </ng-template>
            </p-table>
          }
          @case ('generalError') {
            <p data-testid="import-general-error">{{ r.message }}</p>
          }
        }
      }
      <button pButton type="button" (click)="visibleChange.emit(false)">{{ 'common.ok' | translate }}</button>
    </p-dialog>
  `
})
export class ImportResultDialog {
  readonly visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();
  readonly result = input<ImportResultData | null>(null);

  private static readonly ERROR_CODE_TO_KEY: Record<string, string> = {
    'import.invalid_number': 'myArticles.import.errors.invalidNumber',
    'import.number_not_in_own_range': 'myArticles.import.errors.numberNotInOwnRange',
    'import.duplicate_number': 'myArticles.import.errors.duplicateNumber',
    'import.missing_field': 'myArticles.import.errors.missingField',
    'import.invalid_price': 'myArticles.import.errors.invalidPrice'
  };

  /**
   * Maps the backend's dot-separated snake_case errorCode (e.g.
   * "import.number_not_in_own_range") to the camelCase i18n key added under
   * myArticles.import.errors. Returns null for an unknown code so the
   * template can fall back to the raw (untranslated) detail instead of
   * breaking silently.
   */
  errorMessageKey(errorCode: string): string | null {
    return ImportResultDialog.ERROR_CODE_TO_KEY[errorCode] ?? null;
  }
}

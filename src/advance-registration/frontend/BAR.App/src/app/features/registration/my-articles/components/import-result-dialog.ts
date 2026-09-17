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
                  <td>{{ error.detail }}</td>
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
}

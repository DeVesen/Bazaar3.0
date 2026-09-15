import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import type { MasterDataItem } from '@shared/models/master-data-item';

@Component({
  selector: 'app-master-data-popup',
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, FluidModule, ToggleSwitchModule, TranslatePipe],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" [header]="dialogTitle">
      <p-fluid>
      <div class="field">
        <label for="masterData-name">{{ 'masterDataPopup.name' | translate }}</label>
        <input id="masterData-name" pInputText [(ngModel)]="nameModel" autofocus />
        @if (nameError()) {
          <small class="field-error">{{ nameError() }}</small>
        }
      </div>

      @if (mode() === 'edit') {
        <div class="field">
          <label for="masterData-original">{{ 'masterDataPopup.original' | translate }}</label>
          <p-toggleswitch id="masterData-original" [(ngModel)]="originalModel" />
        </div>
      }
      </p-fluid>

      <div class="dialog-footer">
        <button pButton type="button" [text]="true" severity="secondary" (click)="cancel()">{{ 'common.cancel' | translate }}</button>
        <button pButton type="button" [disabled]="!canSubmit()" (click)="submit()">{{ mode() === 'create' ? ('masterDataPopup.createLabel' | translate) : ('common.save' | translate) }}</button>
      </div>
    </p-dialog>
  `
})
export class MasterDataPopup {
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly visible = model<boolean>(false);
  readonly mode = input.required<'create' | 'edit'>();
  readonly entityLabel = input.required<string>();
  readonly item = input<MasterDataItem | null>(null);
  readonly saveFn = input.required<(name: string, original: boolean | undefined, id: string | undefined) => Observable<MasterDataItem>>();
  readonly saved = output<MasterDataItem>();

  readonly name = signal('');
  readonly original = signal(false);
  readonly nameError = signal<string | null>(null);

  get dialogTitle(): string {
    return this.mode() === 'create'
      ? this.translate.instant('masterDataPopup.createTitle', { entity: this.entityLabel() })
      : this.translate.instant('masterDataPopup.editTitle', { entity: this.entityLabel() });
  }

  get nameModel() { return this.name(); }
  set nameModel(v: string) { this.name.set(v); this.nameError.set(null); }

  get originalModel() { return this.original(); }
  set originalModel(v: boolean) { this.original.set(v); }

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }

  readonly canSubmit = computed(() => this.name().trim().length > 0);

  constructor() {
    effect(() => {
      if (this.visible()) {
        const current = this.item();
        this.name.set(current?.name ?? '');
        this.original.set(current?.original ?? false);
        this.nameError.set(null);
      }
    });
  }

  cancel(): void {
    this.visible.set(false);
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const isEdit = this.mode() === 'edit';
    this.saveFn()(this.name().trim(), isEdit ? this.original() : undefined, isEdit ? this.item()?.id : undefined).subscribe({
      next: (result) => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('masterDataPopup.saved', { entity: this.entityLabel() }) });
        this.saved.emit(result);
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.nameError.set(
          err.status === 409 ? (err.error?.detail ?? this.translate.instant('masterDataPopup.nameTaken')) : this.translate.instant('masterDataPopup.saveFailed')
        );
      }
    });
  }
}

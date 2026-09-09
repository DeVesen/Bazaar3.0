import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

@Component({
  selector: 'app-stammdaten-popup',
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, ToggleSwitchModule],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" [header]="mode() === 'create' ? 'Neue ' + entityLabel() : entityLabel() + ' bearbeiten'">
      <div class="field">
        <label for="stammdaten-name">Name</label>
        <input id="stammdaten-name" pInputText [(ngModel)]="nameModel" autofocus />
        @if (nameError()) {
          <small class="field-error">{{ nameError() }}</small>
        }
      </div>

      @if (mode() === 'edit') {
        <div class="field">
          <label for="stammdaten-original">Original</label>
          <p-toggleswitch id="stammdaten-original" [(ngModel)]="originalModel" />
        </div>
      }

      <div class="dialog-footer">
        <button pButton type="button" [text]="true" severity="secondary" (click)="cancel()">Abbrechen</button>
        <button pButton type="button" [disabled]="!canSubmit()" (click)="submit()">{{ mode() === 'create' ? 'Anlegen' : 'Speichern' }}</button>
      </div>
    </p-dialog>
  `
})
export class StammdatenPopup {
  private readonly messageService = inject(MessageService);

  readonly visible = model<boolean>(false);
  readonly mode = input.required<'create' | 'edit'>();
  readonly entityLabel = input.required<string>();
  readonly item = input<MasterDataItem | null>(null);
  readonly saveFn = input.required<(name: string, original: boolean | undefined, id: string | undefined) => Observable<MasterDataItem>>();
  readonly saved = output<MasterDataItem>();

  readonly name = signal('');
  readonly original = signal(false);
  readonly nameError = signal<string | null>(null);

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
        this.messageService.add({ severity: 'success', summary: `✓ ${this.entityLabel()} gespeichert` });
        this.saved.emit(result);
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.nameError.set(
          err.status === 409 ? (err.error?.detail ?? 'Name existiert bereits') : 'Speichern fehlgeschlagen'
        );
      }
    });
  }
}

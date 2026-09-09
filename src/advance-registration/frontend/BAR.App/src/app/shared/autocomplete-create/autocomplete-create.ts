import { Component, computed, model, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Observable } from 'rxjs';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

@Component({
  selector: 'app-autocomplete-create',
  imports: [AutoCompleteModule, DialogModule, ButtonModule, InputTextModule, FormsModule],
  template: `
    <p-autocomplete
      [(ngModel)]="valueModel"
      [suggestions]="suggestions()"
      optionLabel="name"
      [dropdown]="true"
      (completeMethod)="onFilter($event.query)"
      (onSelect)="onSelect($event)"
    />
    @if (isCreateMode()) {
      <button pButton type="button" [iconOnly]="true" severity="success" (click)="openCreateModal()"><i class="pi pi-plus"></i></button>
    }

    <p-dialog [(visible)]="createModalOpenModel" [modal]="true" [header]="'Neuer Eintrag: ' + value()">
      @if (createModalError()) {
        <p class="error">{{ createModalError() }}</p>
      }
      <button pButton type="button" [text]="true" (click)="cancelCreate()">Abbrechen</button>
      <button pButton type="button" (click)="confirmCreate()">Anlegen</button>
    </p-dialog>
  `
})
export class AutocompleteCreate {
  readonly items = input.required<MasterDataItem[]>();
  readonly createFn = input.required<(name: string) => Observable<MasterDataItem>>();
  readonly label = input<string>('');
  readonly value = model<string>('');
  readonly itemCreated = output<MasterDataItem>();

  readonly suggestions = signal<MasterDataItem[]>([]);
  readonly createModalOpen = signal(false);
  readonly createModalError = signal<string | null>(null);

  get valueModel() { return this.value(); }
  set valueModel(v: string) { this.value.set(v); }

  get createModalOpenModel() { return this.createModalOpen(); }
  set createModalOpenModel(v: boolean) { this.createModalOpen.set(v); }

  readonly isCreateMode = computed(() => {
    const current = this.value().trim();
    if (!current) return false;
    return !this.items().some((i) => i.name === current);
  });

  onFilter(query: string): void {
    const normalized = query.trim().toLowerCase();
    this.suggestions.set(
      normalized ? this.items().filter((i) => i.name.toLowerCase().includes(normalized)) : this.items()
    );
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    const item = event.value as MasterDataItem;
    this.value.set(item.name);
  }

  openCreateModal(): void {
    this.createModalError.set(null);
    this.createModalOpen.set(true);
  }

  cancelCreate(): void {
    this.createModalOpen.set(false);
  }

  confirmCreate(): void {
    this.createFn()(this.value().trim()).subscribe({
      next: (created) => {
        this.itemCreated.emit(created);
        this.value.set(created.name);
        this.createModalOpen.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.createModalError.set(
          err.status === 409 ? (err.error?.detail ?? 'Eintrag existiert bereits') : 'Anlegen fehlgeschlagen'
        );
      }
    });
  }
}

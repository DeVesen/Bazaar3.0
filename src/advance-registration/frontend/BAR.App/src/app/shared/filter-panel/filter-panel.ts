import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

export interface FilterPanelSearch {
  brand?: string;
  category?: string;
  search?: string;
}

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule, SelectModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule],
  template: `
    <div class="filter-panel">
      <p-select
        [options]="brands()" optionLabel="name" optionValue="name" placeholder="Marke"
        [(ngModel)]="brandValueModel" [showClear]="true" (onChange)="emit()"
      />
      <p-select
        [options]="categories()" optionLabel="name" optionValue="name" placeholder="Kategorie"
        [(ngModel)]="categoryValueModel" [showClear]="true" (onChange)="emit()"
      />
      <p-iconfield>
        <p-inputicon class="pi pi-search" />
        <input pInputText placeholder="Suche..." [(ngModel)]="searchTextModel" (keydown.enter)="emit()" />
      </p-iconfield>
      <button pButton type="button" label="Suchen" icon="pi pi-search" data-testid="search-button" (click)="emit()"></button>
    </div>
  `
})
export class FilterPanel {
  readonly brands = input.required<MasterDataItem[]>();
  readonly categories = input.required<MasterDataItem[]>();
  readonly search = output<FilterPanelSearch>();

  readonly brandValue = signal<string | null>(null);
  readonly categoryValue = signal<string | null>(null);
  readonly searchText = signal('');

  get brandValueModel() { return this.brandValue(); }
  set brandValueModel(v: string | null) { this.brandValue.set(v); }
  get categoryValueModel() { return this.categoryValue(); }
  set categoryValueModel(v: string | null) { this.categoryValue.set(v); }
  get searchTextModel() { return this.searchText(); }
  set searchTextModel(v: string) { this.searchText.set(v); }

  emit(): void {
    this.search.emit({
      brand: this.brandValue() ?? undefined,
      category: this.categoryValue() ?? undefined,
      search: this.searchText().trim() || undefined
    });
  }
}

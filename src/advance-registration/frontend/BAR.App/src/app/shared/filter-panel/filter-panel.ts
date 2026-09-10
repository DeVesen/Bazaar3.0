import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Subject, debounceTime, of, switchMap } from 'rxjs';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';
import { SellersApiService } from '../../features/sellers/sellers-api.service';

export interface FilterPanelSearch {
  brand?: string;
  category?: string;
  search?: string;
  sellerId?: string;
}

export interface SellerOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule, SelectModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, AutoCompleteModule],
  template: `
    <div class="filter-panel">
      @if (sellerAutocomplete()) {
        <p-autocomplete
          data-testid="seller-autocomplete"
          [(ngModel)]="sellerModelValue"
          [suggestions]="sellerSuggestions()"
          optionLabel="label"
          [minQueryLength]="2"
          placeholder="Verkäufer"
          [showClear]="true"
          (completeMethod)="onSellerFilter($event.query)"
          (onSelect)="onSellerSelect($event)"
          (onClear)="onSellerClear()"
        />
      }
      <p-select
        [options]="brands()" optionLabel="name" optionValue="name" placeholder="Marke"
        [(ngModel)]="brandValueModel" [showClear]="true"
      />
      <p-select
        [options]="categories()" optionLabel="name" optionValue="name" placeholder="Kategorie"
        [(ngModel)]="categoryValueModel" [showClear]="true"
      />
      <p-iconfield>
        <p-inputicon class="pi pi-search" />
        <input pInputText placeholder="Suche..." [(ngModel)]="searchTextModel" (keydown.enter)="emit()" />
      </p-iconfield>
      <p-button label="Suchen" icon="pi pi-search" data-testid="search-button" (onClick)="emit()" />
    </div>
  `
})
export class FilterPanel {
  private readonly sellersApi = inject(SellersApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly brands = input.required<MasterDataItem[]>();
  readonly categories = input.required<MasterDataItem[]>();
  readonly sellerAutocomplete = input<boolean>(false);
  readonly search = output<FilterPanelSearch>();

  readonly brandValue = signal<string | null>(null);
  readonly categoryValue = signal<string | null>(null);
  readonly searchText = signal('');
  readonly sellerId = signal<string | undefined>(undefined);
  readonly sellerModel = signal<SellerOption | null>(null);
  readonly sellerSuggestions = signal<SellerOption[]>([]);

  private readonly sellerQuery$ = new Subject<string>();

  constructor() {
    this.sellerQuery$
      .pipe(
        debounceTime(400),
        switchMap((query) => this.sellersApi.list({ search: query, page: 1, pageSize: 10 })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        this.sellerSuggestions.set(
          result.items.map((s) => ({ id: s.id, label: `${s.firstName} ${s.lastName} (#${s.startNumber ?? '–'})` }))
        );
      });
  }

  get brandValueModel() { return this.brandValue(); }
  set brandValueModel(v: string | null) { this.brandValue.set(v); }
  get categoryValueModel() { return this.categoryValue(); }
  set categoryValueModel(v: string | null) { this.categoryValue.set(v); }
  get searchTextModel() { return this.searchText(); }
  set searchTextModel(v: string) { this.searchText.set(v); }
  get sellerModelValue() { return this.sellerModel(); }
  set sellerModelValue(v: SellerOption | null) { this.sellerModel.set(v); }

  onSellerFilter(query: string): void {
    if (query.trim().length < 2) {
      this.sellerSuggestions.set([]);
      return;
    }
    this.sellerQuery$.next(query.trim());
  }

  onSellerSelect(event: AutoCompleteSelectEvent): void {
    const option = event.value as SellerOption;
    this.sellerId.set(option.id);
  }

  onSellerClear(): void {
    this.sellerId.set(undefined);
  }

  emit(): void {
    this.search.emit({
      brand: this.brandValue() ?? undefined,
      category: this.categoryValue() ?? undefined,
      search: this.searchText().trim() || undefined,
      sellerId: this.sellerId()
    });
  }
}

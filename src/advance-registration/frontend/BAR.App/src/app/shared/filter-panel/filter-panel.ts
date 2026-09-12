import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, Subject, catchError, debounceTime, of, switchMap } from 'rxjs';
import type { MasterDataItem } from '@shared/models/master-data-item';

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
  imports: [FormsModule, SelectModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, AutoCompleteModule, TranslatePipe],
  template: `
    <div class="filter-panel">
      @if (sellerAutocomplete()) {
        <p-autocomplete
          data-testid="seller-autocomplete"
          [(ngModel)]="sellerModelValue"
          [suggestions]="sellerSuggestions()"
          optionLabel="label"
          [minQueryLength]="2"
          [forceSelection]="true"
          placeholder="Verkäufer"
          [showClear]="true"
          (completeMethod)="onSellerFilter($event.query)"
          (onSelect)="onSellerSelect($event)"
          (onClear)="onSellerClear()"
        />
      }
      <p-select
        [options]="brands()" optionLabel="name" optionValue="name" [placeholder]="'filterPanel.brandPlaceholder' | translate"
        [(ngModel)]="brandValueModel" [showClear]="true"
      />
      <p-select
        [options]="categories()" optionLabel="name" optionValue="name" [placeholder]="'filterPanel.categoryPlaceholder' | translate"
        [(ngModel)]="categoryValueModel" [showClear]="true"
      />
      <p-iconfield>
        <p-inputicon class="pi pi-search" />
        <input pInputText [placeholder]="'filterPanel.searchPlaceholder' | translate" [(ngModel)]="searchTextModel" (keydown.enter)="emit()" />
      </p-iconfield>
      <p-button [label]="'filterPanel.searchButton' | translate" icon="pi pi-search" data-testid="search-button" (onClick)="emit()" />
    </div>
  `
})
export class FilterPanel {
  private readonly destroyRef = inject(DestroyRef);

  readonly brands = input.required<MasterDataItem[]>();
  readonly categories = input.required<MasterDataItem[]>();
  readonly sellerAutocomplete = input<boolean>(false);
  /**
   * Dumb component: the actual seller search is supplied by the caller -
   * which department stands behind "seller" is none of shared/'s business
   * (angular-modulith-bridge: shared/ never imports from features/). Required
   * only when sellerAutocomplete() is true.
   */
  readonly sellerSearchFn = input<(query: string) => Observable<SellerOption[]>>();
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
        switchMap((query) => {
          const searchFn = this.sellerSearchFn();
          return searchFn ? searchFn(query).pipe(catchError(() => of([]))) : of([]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((options) => this.sellerSuggestions.set(options));
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
    this.emit();
  }

  onSellerClear(): void {
    this.sellerId.set(undefined);
    this.emit();
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

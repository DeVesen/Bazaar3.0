import { Component, DestroyRef, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ToolbarModule } from 'primeng/toolbar';
import { Popover, PopoverModule } from 'primeng/popover';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, Subject, catchError, debounceTime, of, switchMap } from 'rxjs';
import type { MasterDataItem } from '@shared/models/master-data-item';
import type { SellerTypeOption } from '@shared/models/seller-type-option';

export interface FilterPanelSearch {
  brand?: string;
  category?: string;
  status?: string;
  sellerTypeId?: string;
  search?: string;
  sellerId?: string;
}

export interface SellerOption {
  id: string;
  label: string;
}

export interface StatusOption {
  label: string;
  value: string;
}

const MOBILE_BREAKPOINT = '(max-width: 767px)';

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule, SelectModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, FluidModule, AutoCompleteModule, ToolbarModule, PopoverModule, TranslatePipe, NgTemplateOutlet],
  styleUrl: './filter-panel.scss',
  template: `
    <ng-template #fields>
      <p-fluid>
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
      @if (brands()) {
        <p-select
          [options]="brands()" optionLabel="name" optionValue="name" [placeholder]="'filterPanel.brandPlaceholder' | translate"
          [(ngModel)]="brandValueModel" [showClear]="true" (onChange)="onFieldChange()" (onClear)="onFieldChange()"
        />
      }
      @if (categories()) {
        <p-select
          [options]="categories()" optionLabel="name" optionValue="name" [placeholder]="'filterPanel.categoryPlaceholder' | translate"
          [(ngModel)]="categoryValueModel" [showClear]="true" (onChange)="onFieldChange()" (onClear)="onFieldChange()"
        />
      }
      @if (statusOptions()) {
        <p-select
          data-testid="status-select"
          [options]="statusOptions()" optionLabel="label" optionValue="value" [placeholder]="'filterPanel.statusPlaceholder' | translate"
          [(ngModel)]="statusValueModel" [showClear]="true" (onChange)="onFieldChange()" (onClear)="onFieldChange()"
        />
      }
      @if (sellerTypeOptions()) {
        <p-select
          data-testid="seller-type-select"
          [options]="sellerTypeOptions()" optionLabel="name" optionValue="id" [placeholder]="'filterPanel.sellerTypePlaceholder' | translate"
          [(ngModel)]="sellerTypeValueModel" [showClear]="true" (onChange)="onFieldChange()" (onClear)="onFieldChange()"
        />
      }
      <p-iconfield>
        <p-inputicon class="pi pi-search" />
        <input pInputText [placeholder]="'filterPanel.searchPlaceholder' | translate" [(ngModel)]="searchTextModel" (keydown.enter)="emit()" (ngModelChange)="onSearchTextChange()" />
      </p-iconfield>
      @if (!liveFilter()) {
        <p-button [label]="'filterPanel.searchButton' | translate" icon="pi pi-search" data-testid="search-button" (onClick)="emit()" />
      }
      </p-fluid>
    </ng-template>

    <p-toolbar>
      <ng-template #start>
        @if (isMobile()) {
          <button
            pButton type="button" icon="pi pi-filter" data-testid="filter-button"
            (click)="filterPopover.toggle($event)"
          >{{ 'filterPanel.filterButton' | translate }}</button>
          <p-popover #filterPopover [appendTo]="'self'" data-testid="filter-popover">
            <div class="filter-panel-overlay">
              <ng-container *ngTemplateOutlet="fields" />
            </div>
          </p-popover>
        } @else {
          <ng-container *ngTemplateOutlet="fields" />
        }
      </ng-template>
      <ng-template #end>
        @if (canAdd()) {
          <button pButton type="button" data-testid="add-button" (click)="create.emit()">{{ createLabel() }}</button>
        }
      </ng-template>
    </p-toolbar>
  `
})
export class FilterPanel {
  private readonly destroyRef = inject(DestroyRef);

  readonly brands = input<MasterDataItem[]>();
  readonly categories = input<MasterDataItem[]>();
  readonly statusOptions = input<StatusOption[]>();
  readonly sellerTypeOptions = input<SellerTypeOption[]>();
  readonly sellerAutocomplete = input<boolean>(false);
  readonly canAdd = input<boolean>(false);
  readonly createLabel = input<string>('+ Neu');
  /**
   * When true, filters emit automatically (debounced for free text, immediately for
   * selects) instead of waiting for Enter/"Suchen" - used where no explicit search
   * action fits the surrounding page (e.g. an always-visible admin table).
   */
  readonly liveFilter = input<boolean>(false);
  /**
   * Dumb component: the actual seller search is supplied by the caller -
   * which department stands behind "seller" is none of shared/'s business
   * (angular-modulith-bridge: shared/ never imports from features/). Required
   * only when sellerAutocomplete() is true.
   */
  readonly sellerSearchFn = input<(query: string) => Observable<SellerOption[]>>();
  readonly search = output<FilterPanelSearch>();
  readonly create = output<void>();

  readonly brandValue = signal<string | null>(null);
  readonly categoryValue = signal<string | null>(null);
  readonly statusValue = signal<string | null>(null);
  readonly sellerTypeValue = signal<string | null>(null);
  readonly searchText = signal('');
  readonly sellerId = signal<string | undefined>(undefined);
  readonly sellerModel = signal<SellerOption | null>(null);
  readonly sellerSuggestions = signal<SellerOption[]>([]);

  readonly isMobile = signal(false);
  readonly filterPopover = viewChild.required<Popover>('filterPopover');

  private readonly sellerQuery$ = new Subject<string>();
  private readonly liveSearchTrigger$ = new Subject<void>();
  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;

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

    this.liveSearchTrigger$.pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.emit());

    if (typeof window.matchMedia === 'function') {
      this.mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
      this.isMobile.set(this.mediaQuery.matches);
      this.mediaQueryListener = (event) => this.isMobile.set(event.matches);
      this.mediaQuery.addEventListener('change', this.mediaQueryListener);
      this.destroyRef.onDestroy(() => {
        if (this.mediaQuery && this.mediaQueryListener) {
          this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
        }
      });
    }
  }

  get brandValueModel() { return this.brandValue(); }
  set brandValueModel(v: string | null) { this.brandValue.set(v); }
  get categoryValueModel() { return this.categoryValue(); }
  set categoryValueModel(v: string | null) { this.categoryValue.set(v); }
  get statusValueModel() { return this.statusValue(); }
  set statusValueModel(v: string | null) { this.statusValue.set(v); }
  get sellerTypeValueModel() { return this.sellerTypeValue(); }
  set sellerTypeValueModel(v: string | null) { this.sellerTypeValue.set(v); }
  get searchTextModel() { return this.searchText(); }
  set searchTextModel(v: string) { this.searchText.set(v); }
  get sellerModelValue() { return this.sellerModel(); }
  set sellerModelValue(v: SellerOption | null) { this.sellerModel.set(v); }

  onFieldChange(): void {
    if (this.liveFilter()) {
      this.emit();
    }
  }

  onSearchTextChange(): void {
    if (this.liveFilter()) {
      this.liveSearchTrigger$.next();
    }
  }

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
      status: this.statusValue() ?? undefined,
      sellerTypeId: this.sellerTypeValue() ?? undefined,
      search: this.searchText().trim() || undefined,
      sellerId: this.sellerId()
    });
    if (this.isMobile()) {
      this.filterPopover().hide();
    }
  }
}

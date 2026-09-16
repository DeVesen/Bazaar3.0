import { Component, DestroyRef, inject, input, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { ToolbarModule } from 'primeng/toolbar';
import { Popover, PopoverModule } from 'primeng/popover';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, debounceTime } from 'rxjs';

export interface MasterDataFilter {
  search?: string;
  original?: boolean;
}

const MOBILE_BREAKPOINT = '(max-width: 767px)';

@Component({
  selector: 'app-master-data-filter-toolbar',
  imports: [FormsModule, SelectModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, FluidModule, ToolbarModule, PopoverModule, TranslatePipe, NgTemplateOutlet],
  template: `
    <ng-template #fields>
      <p-fluid>
      @if (showOriginalFilter()) {
        <p-select
          [options]="originalOptions" optionLabel="label" optionValue="value"
          [placeholder]="'masterDataFilterToolbar.originalPlaceholder' | translate"
          [(ngModel)]="originalValueModel" [showClear]="true"
        >
          <ng-template #selectedItem let-option>{{ option.label | translate }}</ng-template>
          <ng-template #item let-option>{{ option.label | translate }}</ng-template>
        </p-select>
      }
      <p-iconfield>
        <p-inputicon class="pi pi-search" />
        <input pInputText [placeholder]="'masterDataFilterToolbar.searchPlaceholder' | translate" [(ngModel)]="searchTextModel" />
      </p-iconfield>
      </p-fluid>
    </ng-template>

    <p-toolbar>
      <ng-template #start>
        @if (isMobile()) {
          <button
            pButton type="button" data-testid="filter-button"
            (click)="filterPopover.toggle($event)"
          ><i class="pi pi-filter"></i>{{ 'masterDataFilterToolbar.filterButton' | translate }}</button>
          <p-popover #filterPopover [appendTo]="'self'" data-testid="filter-popover">
            <div class="master-data-filter-toolbar-overlay">
              <ng-container *ngTemplateOutlet="fields" />
            </div>
          </p-popover>
        } @else {
          <ng-container *ngTemplateOutlet="fields" />
        }
      </ng-template>
      <ng-template #end>
        @if (canAdd()) {
          <button pButton type="button" data-testid="add-button" (click)="create.emit()">+ Neu</button>
        }
      </ng-template>
    </p-toolbar>
  `,
  styleUrl: './master-data-filter-toolbar.scss'
})
export class MasterDataFilterToolbar {
  private readonly destroyRef = inject(DestroyRef);

  readonly showOriginalFilter = input<boolean>(false);
  readonly canAdd = input<boolean>(false);
  readonly filterChange = output<MasterDataFilter>();
  readonly create = output<void>();

  readonly originalOptions: { label: string; value: boolean | null }[] = [
    { label: 'masterDataFilterToolbar.originalOption', value: true },
    { label: 'masterDataFilterToolbar.newOption', value: false }
  ];

  readonly searchText = signal('');
  readonly originalValue = signal<boolean | null>(null);
  readonly isMobile = signal(false);
  readonly filterPopover = viewChild.required<Popover>('filterPopover');

  private readonly searchText$ = new Subject<string>();
  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;

  constructor() {
    this.searchText$.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.emit());

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

  get searchTextModel() { return this.searchText(); }
  set searchTextModel(v: string) {
    this.searchText.set(v);
    this.searchText$.next(v);
  }

  get originalValueModel() { return this.originalValue(); }
  set originalValueModel(v: boolean | null) {
    this.originalValue.set(v);
    this.emit();
  }

  private emit(): void {
    this.filterChange.emit({
      search: this.searchText().trim() || undefined,
      original: this.originalValue() ?? undefined
    });
    if (this.isMobile()) {
      this.filterPopover().hide();
    }
  }
}

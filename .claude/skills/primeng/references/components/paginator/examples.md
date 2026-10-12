# Angular Paginator Component — Beispiele

## Basic

Paginator is used as a controlled component with first , rows and onPageChange properties to manage the first index and number of records to display per page. Total number of records need to be with totalRecords property. Default template includes a dropdown to change the rows so rowsPerPageOptions is also necessary for the dropdown options.

```typescript
import { Component } from '@angular/core';
import { Paginator, PaginatorModule } from 'primeng/paginator';

@Component({
    template: `
        <div class="flex justify-center">
            <p-paginator (onPageChange)="onPageChange($event)" [first]="first" [rows]="rows" [totalRecords]="120" [rowsPerPageOptions]="[10, 20, 30]" />
        </div>
    `,
    standalone: true,
    imports: [PaginatorModule]
})
export class PaginatorBasicDemo {
    first: number = 0;

    rows: number = 10;

    onPageChange(event: PaginatorState) {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }
}
```

## Currentpagereport

Current page report item in the template displays information about the pagination state. Default value is ({{ '{' }}currentPage{{ '}' }} of {{ '{' }}totalPages{{ '}' }}) whereas available placeholders are the following; {{ '{' }}currentPage{{ '}' }} {{ '{' }}totalPages{{ '}' }} {{ '{' }}rows{{ '}' }} {{ '{' }}first{{ '}' }} {{ '{' }}last{{ '}' }} {{ '{' }}totalRecords{{ '}' }}

```typescript
import { Component } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';

@Component({
    template: `
        <div class="flex justify-center">
            <p-paginator
                (onPageChange)="onPageChange($event)"
                [first]="first"
                [rows]="rows"
                [totalRecords]="120"
                [showCurrentPageReport]="true"
                [showPageLinks]="false"
                [showJumpToPageDropdown]="false"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            />
        </div>
    `,
    standalone: true,
    imports: [PaginatorModule]
})
export class PaginatorCurrentPageReportDemo {
    first: number = 0;

    rows: number = 10;

    onPageChange(event: PaginatorState) {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }
}
```

## Images

Sample image gallery implementation using paginator.

```typescript
import { Component } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';

@Component({
    template: `
        <div class="flex flex-col gap-4 justify-center items-center">
            <p-paginator [first]="first" [rows]="1" [totalRecords]="12" (onPageChange)="onPageChange($event)" [showJumpToPageDropdown]="true" [showPageLinks]="false"></p-paginator>
            <img [src]="'https://primefaces.org/cdn/primeng/images/demo/nature/nature' + (first + 1) + '.jpg'" class="max-w-full rounded-xl" />
        </div>
    `,
    standalone: true,
    imports: [PaginatorModule]
})
export class PaginatorImagesDemo {
    first: number = 0;

    rows: number = 10;

    onPageChange(event: PaginatorState) {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }
}
```

## Template

Templating allows overriding the default content of the UI elements by defining callbacks using the element name.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-center gap-2">
                <div>
                    <button type="button" pButton iconOnly outlined><i class="pi pi-star"></i></button>
                </div>
                <div class="flex-1">
                    <p-paginator (onPageChange)="onPageChange1($event)" [first]="first1" [rows]="rows1" [totalRecords]="120" [rowsPerPageOptions]="[10, 20, 30]" [showFirstLastIcon]="false" />
                </div>
                <div class="justify-end">
                    <button type="button" pButton iconOnly><i class="pi pi-search"></i></button>
                </div>
            </div>
            <p-divider />
            <div class="flex flex-wrap items-center justify-end gap-2">
                <span class="mx-1 text-color">Items per page: </span>
                <p-select [options]="options" optionLabel="label" optionValue="value" [(ngModel)]="rows2" (ngModelChange)="first2 = 0" />
                <p-paginator
                    [first]="first2"
                    [rows]="rows2"
                    [totalRecords]="120"
                    (onPageChange)="onPageChange2($event)"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="{first} - {last} of {totalRecords}"
                    [showPageLinks]="false"
                    [showFirstLastIcon]="false"
                ></p-paginator>
            </div>
            <p-divider />
            <div class="flex flex-wrap items-center justify-start gap-2">
                <div class="flex flex-wrap justify-center items-center gap-4">
                    <span>Items per page: </span>
                    <p-slider [(ngModel)]="rows3" (ngModelChange)="first3 = 0" [style]="{ width: '10rem' }" [min]="10" [max]="120" [step]="30" />
                </div>
                <p-paginator
                    (onPageChange)="onPageChange3($event)"
                    [first]="first3"
                    [rows]="rows3"
                    [totalRecords]="totalRecords"
                    [showFirstLastIcon]="false"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="{first} - {last} of {totalRecords}"
                ></p-paginator>
            </div>
        </div>
    `,
    standalone: true,
    imports: [DividerModule, SelectModule, PaginatorModule, SliderModule, ButtonModule, FormsModule]
})
export class PaginatorTemplateDemo {
    first1: number = 0;

    rows1: number = 10;

    first2: number = 0;

    rows2: number = 10;

    first3: number = 0;

    rows3: number = 10;

    totalRecords: number = 120;

    options = [
        { label: 5, value: 5 },
        { label: 10, value: 10 },
        { label: 20, value: 20 },
        { label: 120, value: 120 }
    ];

    onPageChange1(event: PaginatorState) {
        this.first1 = event.first ?? 0;
        this.rows1 = event.rows ?? 10;
    }

    onPageChange2(event: PaginatorState) {
        this.first2 = event.first ?? 0;
        this.rows2 = event.rows ?? 10;
    }

    onPageChange3(event: PaginatorState) {
        this.first3 = event.first ?? 0;
        this.rows3 = event.rows ?? 10;
    }
}
```

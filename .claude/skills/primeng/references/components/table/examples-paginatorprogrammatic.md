# Angular Table Component — Paginatorprogrammatic

## Paginatorprogrammatic

Paginator can also be controlled via model using a binding to the first property where changes trigger a pagination.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { ChevronLeft } from '@primeicons/angular/chevron-left';
import { Refresh } from '@primeicons/angular/refresh';
import { ChevronRight } from '@primeicons/angular/chevron-right';

@Component({
    template: `
        <div class="mb-4 flex gap-1">
            <button type="button" pButton iconOnly (click)="prev()" [disabled]="isFirstPage()" variant="text"><svg data-p-icon="chevron-left" /></button>
            <button type="button" pButton iconOnly (click)="reset()" variant="text"><svg data-p-icon="refresh" /></button>
            <button type="button" pButton iconOnly (click)="next()" [disabled]="isLastPage()" variant="text"><svg data-p-icon="chevron-right" /></button>
        </div>
        <p-table
            [value]="products"
            [paginator]="true"
            [rows]="rows"
            [showCurrentPageReport]="true"
            [first]="first"
            [tableStyle]="{ 'min-width': '50rem' }"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            (onPage)="pageChange($event)"
            [rowsPerPageOptions]="[10, 25, 50]"
        >
            <ng-template #header>
                <tr>
                    <th style="width: 30%">Product</th>
                    <th style="width: 20%">Category</th>
                    <th style="width: 10%">Qty</th>
                    <th style="width: 10%">Price</th>
                    <th style="width: 20%">Status</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr>
                    <td>
                        <div class="flex items-center gap-3">
                            <img [src]="'https://primefaces.org/cdn/primevue/images/product/' + product.image" [alt]="product.name" class="w-10 rounded-md shadow" />
                            <div class="flex flex-col">
                                <span class="font-medium">{{ product.name }}</span>
                                <span class="text-xs text-surface-500 dark:text-surface-400">{{ product.code }}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <p-tag [value]="product.category" severity="secondary" />
                    </td>
                    <td>{{ product.quantity }}</td>
                    <td>
                        <span class="font-semibold">{{ '$' + product.price }}</span>
                    </td>
                    <td>
                        <p-tag [value]="getSeverityLabel(product.inventoryStatus)" [severity]="getSeverity(product.inventoryStatus)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, TagModule, ButtonModule, ChevronLeft, Refresh, ChevronRight],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablePaginatorProgrammaticDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    first: number = 0;

    rows: number = 10;

    ngOnInit() {
        this.productService.getProducts().then((data) => {
            this.products = data;
        });
    }

    next() {
        this.first = this.first + this.rows;
    }

    prev() {
        this.first = this.first - this.rows;
    }

    reset() {
        this.first = 0;
    }

    pageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
    }

    isLastPage(): boolean {
        return this.products ? this.first + this.rows >= this.products.length : true;
    }

    isFirstPage(): boolean {
        return this.products ? this.first === 0 : true;
    }

    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warn';
            case 'OUTOFSTOCK':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getSeverityLabel(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'In Stock';
            case 'LOWSTOCK':
                return 'Low Stock';
            case 'OUTOFSTOCK':
                return 'Out of Stock';
            default:
                return status;
        }
    }
}
```

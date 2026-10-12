# Angular Table Component — Loadingmask

## Loadingmask

Set the loading prop to display a mask layer over the table while data is being fetched.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { Refresh } from '@primeicons/angular/refresh';
import { Spinner } from '@primeicons/angular/spinner';

@Component({
    template: `
        <div class="mb-3 flex items-center justify-between gap-3">
            <span class="text-sm text-surface-500 dark:text-surface-400">Click refresh to simulate a network fetch.</span>
            <button type="button" pButton size="small" (click)="refresh()" [disabled]="loading">
                <svg data-p-icon="refresh" />
                Refresh
            </button>
        </div>
        <p-table [value]="products" [loading]="loading" [pt]="{ loadingIcon: { class: 'w-auto! h-auto!' } }" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #loadingicon>
                <div class="flex flex-col items-center gap-2">
                    <svg data-p-icon="spinner" [size]="40" class="animate-spin text-primary" />
                    <span class="text-sm text-surface-600 dark:text-surface-300">Loading products…</span>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr>
                    <td>
                        <div class="flex items-center gap-3">
                            <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" width="40" height="40" class="rounded-md shadow" />
                            <div class="flex flex-col">
                                <span class="font-medium">{{ product.name }}</span>
                                <span class="text-xs text-surface-500 dark:text-surface-400">{{ product.code }}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <p-tag [value]="product.category" severity="secondary" />
                    </td>
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
    imports: [TableModule, TagModule, ButtonModule, Refresh, Spinner],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableLoadingMaskDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    loading: boolean = false;

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.loading = true;
        this.cd.markForCheck();
        setTimeout(() => {
            this.productService.getProductsSmall().then((data) => {
                this.products = data.slice(0, 6);
                this.loading = false;
                this.cd.markForCheck();
            });
        }, 1500);
    }

    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warn';
            case 'OUTOFSTOCK':
                return 'danger';
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

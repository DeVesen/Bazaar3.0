# Angular Table Component — Loadingskeleton

## Loadingskeleton

Render placeholder rows filled with Skeleton elements while the request is in flight.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { Refresh } from '@primeicons/angular/refresh';

@Component({
    template: `
        <div class="mb-3 flex items-center justify-between gap-3">
            <span class="text-sm text-surface-500 dark:text-surface-400">Click refresh to simulate a network fetch.</span>
            <button type="button" pButton size="small" (click)="refresh()" [disabled]="loading">
                <svg data-p-icon="refresh" />
                Refresh
            </button>
        </div>
        <p-table [value]="rows" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th style="width: 40%">Product</th>
                    <th style="width: 20%">Category</th>
                    <th style="width: 15%">Price</th>
                    <th style="width: 25%">Status</th>
                </tr>
            </ng-template>
            <ng-template #body let-item>
                <tr>
                    @if (loading) {
                        <td>
                            <div class="flex items-center gap-3">
                                <p-skeleton width="40px" height="40px" borderRadius="6px" />
                                <div class="flex flex-col gap-1">
                                    <p-skeleton width="8rem" height="0.6rem" borderRadius="4px" />
                                    <p-skeleton width="5rem" height="0.55rem" borderRadius="4px" />
                                </div>
                            </div>
                        </td>
                        <td><p-skeleton width="5rem" height="1rem" borderRadius="16px" /></td>
                        <td><p-skeleton width="3rem" height="0.6rem" borderRadius="4px" /></td>
                        <td><p-skeleton width="6rem" height="1rem" borderRadius="16px" /></td>
                    } @else {
                        <td>
                            <div class="flex items-center gap-3">
                                <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + item.image" [alt]="item.name" width="40" height="40" class="rounded-md shadow" />
                                <div class="flex flex-col">
                                    <span class="font-medium">{{ item.name }}</span>
                                    <span class="text-xs text-surface-500 dark:text-surface-400">{{ item.code }}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <p-tag [value]="item.category" severity="secondary" />
                        </td>
                        <td>
                            <span class="font-semibold">{{ '$' + item.price }}</span>
                        </td>
                        <td>
                            <p-tag [value]="getSeverityLabel(item.inventoryStatus)" [severity]="getSeverity(item.inventoryStatus)" />
                        </td>
                    }
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [SkeletonModule, TableModule, TagModule, ButtonModule, Refresh],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableLoadingSkeletonDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    placeholders = Array.from({ length: 6 }, (_, i) => ({ id: i.toString() }));

    loading: boolean = false;

    ngOnInit() {
        this.refresh();
    }

    get rows(): any[] {
        return this.loading ? this.placeholders : this.products;
    }

    refresh() {
        this.loading = true;
        this.products = [];
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

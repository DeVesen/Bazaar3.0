# Angular Table Component — Keyboard

## Keyboard

Arrow Up/Down moves focus between rows, Space or Enter toggles the focused row, and Shift + Arrow extends a range. Paired with selectionMode multiple and metaKeySelection , the whole flow is keyboard-driven.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

@Component({
    template: `
        <div class="flex items-center justify-between gap-3 mb-3 p-3 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
            <span class="text-sm text-surface-500 dark:text-surface-400">
                <kbd class="px-1.5 py-0.5 text-xs rounded bg-surface-200 dark:bg-surface-700">&uarr;</kbd>&nbsp;<kbd class="px-1.5 py-0.5 text-xs rounded bg-surface-200 dark:bg-surface-700">&darr;</kbd> navigate,
                <kbd class="px-1.5 py-0.5 text-xs rounded bg-surface-200 dark:bg-surface-700">Space</kbd> /&nbsp;<kbd class="px-1.5 py-0.5 text-xs rounded bg-surface-200 dark:bg-surface-700">Enter</kbd> select,
                <kbd class="px-1.5 py-0.5 text-xs rounded bg-surface-200 dark:bg-surface-700">Shift + &uarr;&darr;</kbd> range
            </span>
            <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Selected</span>
                <p-badge [value]="selectedProducts.length.toString()" [severity]="selectedProducts.length ? 'info' : 'secondary'" />
            </div>
        </div>
        <p-table [value]="products" selectionMode="multiple" [(selection)]="selectedProducts" [metaKeySelection]="true" dataKey="id" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Status</th>
                </tr>
            </ng-template>
            <ng-template #body let-product let-rowIndex="rowIndex">
                <tr [pSelectableRow]="product" [pSelectableRowIndex]="rowIndex">
                    <td>
                        <div class="flex items-center gap-3">
                            <img [src]="'https://primefaces.org/cdn/primevue/images/product/' + product.image" [alt]="product.name" width="36" height="36" class="rounded-md shadow" />
                            <span class="font-medium">{{ product.name }}</span>
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
    imports: [BadgeModule, TableModule, TagModule],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableKeyboardDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    selectedProducts: Product[] = [];

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => {
            this.products = data.slice(0, 8);
        });
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

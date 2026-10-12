# Angular Table Component — Multipleselection

## Multipleselection

Multiple rows without a dedicated column. Pair with metaKeySelection so Ctrl/Cmd + Click toggles rows and Shift + Click selects a range; a plain click still replaces the selection.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { Trash } from '@primeicons/angular/trash';
import { ShoppingCart } from '@primeicons/angular/shopping-cart';

@Component({
    template: `
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3 p-3 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
            <div class="flex flex-wrap items-center gap-2">
                <span class="font-medium text-sm">Selected</span>
                <p-badge [value]="selectedProducts.length.toString()" [severity]="selectedProducts.length ? 'info' : 'secondary'" />
                @if (selectedProducts.length > 0) {
                    <span class="text-xs text-surface-500 dark:text-surface-400">
                        Total <span class="font-semibold text-surface-900 dark:text-surface-0">{{ '$' + totalValue }}</span>
                    </span>
                }
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button pButton severity="danger" size="small" variant="outlined" [disabled]="!selectedProducts.length">
                    <svg data-p-icon="trash" />
                    Delete
                </button>
                <button pButton size="small" [disabled]="!selectedProducts.length">
                    <svg data-p-icon="shopping-cart" />
                    Add to cart
                </button>
            </div>
        </div>
        <p class="mb-2 text-xs text-surface-500 dark:text-surface-400">Click to replace the selection. Ctrl/Cmd + Click to toggle a row, Shift + Click to select a range.</p>
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
    imports: [BadgeModule, TableModule, TagModule, ButtonModule, Trash, ShoppingCart],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableMultipleSelectionDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    selectedProducts: Product[] = [];

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => {
            this.products = data.slice(0, 8);
        });
    }

    get totalValue(): number {
        return this.selectedProducts.reduce((sum, p) => sum + p.price, 0);
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

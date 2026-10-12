# Angular Table Component — Rowexpansion

## Rowexpansion

Expand rows to show additional detail content. Use pRowToggler directive to toggle expansion with expand/collapse icons.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { ChevronDown } from '@primeicons/angular/chevron-down';
import { ChevronRight } from '@primeicons/angular/chevron-right';

@Component({
    template: `
        <p-table [value]="products" dataKey="id" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th style="width: 3rem"></th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                </tr>
            </ng-template>
            <ng-template #body let-product let-expanded="expanded">
                <tr>
                    <td>
                        <button type="button" pButton [pRowToggler]="product" variant="text" severity="secondary" iconOnly rounded>
                            @if (expanded) {
                                <svg data-p-icon="chevron-down" />
                            } @else {
                                <svg data-p-icon="chevron-right" />
                            }
                        </button>
                    </td>
                    <td>
                        <span class="font-medium">{{ product.name }}</span>
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
            <ng-template #expandedrow let-product>
                <tr>
                    <td colspan="5">
                        <div class="flex gap-4 p-4 bg-surface-50 dark:bg-surface-900">
                            <img [src]="'https://primefaces.org/cdn/primeng/imag …(lange Zeile gekürzt)
                            <div class="flex flex-col gap-2 flex-1">
                                <h4 class="m-0 text-base font-semibold">{{ product.name }}</h4>
                                <div class="text-xs text-surface-500 dark:text-surface-400">SKU: {{ product.code }}</div>
                                <div class="flex items-center gap-2">
                                    <p-rating [(ngModel)]="product.rating" [readonly]="true" class="gap-0!" />
                                    <span class="text-xs text-surface-500 dark:text-surface-400">({{ product.rating }}/5)</span>
                                </div>
                                <div class="flex items-center gap-6 text-sm">
                                    <div>
                                        <div class="text-xs text-surface-500 dark:text-surface-400">Category</div>
                                        <div class="font-medium">{{ product.category }}</div>
                                    </div>
                                    <div>
                                        <div class="text-xs text-surface-500 dark:text-surface-400">In stock</div>
                                        <div class="font-medium">{{ product.quantity }} units</div>
                                    </div>
                                    <div>
                                        <div class="text-xs text-surface-500 dark:text-surface-400">Price</div>
                                        <div class="font-semibold">{{ '$' + product.price }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [RatingModule, TableModule, TagModule, ButtonModule, FormsModule, ChevronDown, ChevronRight],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableRowExpansionDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => {
            this.products = data.slice(0, 6);
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

# Angular Table Component — Multiplecolumnssort

## Multiplecolumnssort

Hold Ctrl/Cmd and click multiple column headers to sort by several fields at once. Set sortMode to multiple to enable.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

@Component({
    template: `
        <p-table [value]="products" sortMode="multiple" removableSort [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th pSortableColumn="name">
                        <div class="flex items-center gap-2">
                            Product
                            <p-sort-icon field="name" />
                        </div>
                    </th>
                    <th pSortableColumn="category">
                        <div class="flex items-center gap-2">
                            Category
                            <p-sort-icon field="category" />
                        </div>
                    </th>
                    <th pSortableColumn="quantity">
                        <div class="flex items-center gap-2">
                            Quantity
                            <p-sort-icon field="quantity" />
                        </div>
                    </th>
                    <th pSortableColumn="price">
                        <div class="flex items-center gap-2">
                            Price
                            <p-sort-icon field="price" />
                        </div>
                    </th>
                    <th pSortableColumn="inventoryStatus">
                        <div class="flex items-center gap-2">
                            Status
                            <p-sort-icon field="inventoryStatus" />
                        </div>
                    </th>
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
    imports: [TableModule, TagModule],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableMultipleColumnsSortDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => {
            this.products = data.slice(0, 10);
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

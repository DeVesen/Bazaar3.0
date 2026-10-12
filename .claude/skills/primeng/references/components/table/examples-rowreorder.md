# Angular Table Component — Rowreorder

## Rowreorder

Drag and drop rows to reorder data.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { Bars } from '@primeicons/angular/bars';

@Component({
    template: `
        <p-table [value]="products" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th style="width: 3rem"></th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                </tr>
            </ng-template>
            <ng-template #body let-product let-index="rowIndex">
                <tr [pReorderableRow]="index">
                    <td>
                        <svg data-p-icon="bars" pReorderableRowHandle class="cursor-grab text-surface-400" />
                    </td>
                    <td>
                        <div class="flex items-center gap-3">
                            <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" width="36" height="36" class="rounded-md shadow" />
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
    imports: [TableModule, TagModule, Bars],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableRowReorderDemo implements OnInit {
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

# Angular Table Component — Reorder

## Reorder

Drag and drop column headers to reorder columns.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-table [value]="products" [columns]="cols" [reorderableColumns]="true" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col.field) {
                        <th pReorderableColumn>
                            {{ col.header }}
                        </th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-product let-columns="columns">
                <tr>
                    @for (col of columns; track col.field) {
                        <td>
                            @switch (col.field) {
                                @case ('name') {
                                    <div class="flex items-center gap-3">
                                        <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" width="36" height="36" class="rounded-md shadow" />
                                        <span class="font-medium">{{ product.name }}</span>
                                    </div>
                                }
                                @case ('category') {
                                    <p-tag [value]="product.category" severity="secondary" />
                                }
                                @case ('quantity') {
                                    {{ product.quantity }}
                                }
                                @case ('price') {
                                    <span class="font-semibold">{{ '$' + product.price }}</span>
                                }
                                @case ('inventoryStatus') {
                                    <p-tag [value]="getSeverityLabel(product.inventoryStatus)" [severity]="getSeverity(product.inventoryStatus)" />
                                }
                            }
                        </td>
                    }
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, TagModule],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableReorderDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    cols: Column[] = [
        { field: 'name', header: 'Product' },
        { field: 'category', header: 'Category' },
        { field: 'quantity', header: 'Quantity' },
        { field: 'price', header: 'Price' },
        { field: 'inventoryStatus', header: 'Status' }
    ];

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

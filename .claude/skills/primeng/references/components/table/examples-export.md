# Angular Table Component — Export

## Export

Export table data to CSV with customizable fields and headers.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { FileExport } from '@primeicons/angular/file-export';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

@Component({
    template: `
        <div class="flex items-center justify-between gap-3 mb-3">
            <span class="text-sm text-surface-500 dark:text-surface-400">Export visible rows to CSV with custom column headers.</span>
            <button type="button" pButton size="small" (click)="dt.exportCSV()"><svg data-p-icon="file-export" /> Export CSV</button>
        </div>
        <p-table #dt [columns]="cols" [value]="products" [exportHeader]="'customExportHeader'" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Status</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr>
                    <td>
                        <div class="flex items-center gap-3">
                            <img [src]="'https://primefaces.org/cdn/primevue/images/product/' + product.image" [alt]="product.name" width="36" height="36" class="rounded-md shadow" />
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
    imports: [TableModule, TagModule, ButtonModule, FileExport],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExportDemo implements OnInit {
    private productService = inject(ProductService);

    products!: Product[];

    cols!: Column[];

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => {
            this.products = data.slice(0, 8);
        });
        this.cols = [
            { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
            { field: 'name', header: 'Name' },
            { field: 'category', header: 'Category' },
            { field: 'price', header: 'Price' },
            { field: 'quantity', header: 'Quantity' },
            { field: 'inventoryStatus', header: 'Status' }
        ];
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

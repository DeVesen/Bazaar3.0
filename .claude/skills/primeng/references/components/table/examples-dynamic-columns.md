# Angular Table Component — Dynamic Columns

## Dynamic Columns

Columns can be defined dynamically using the &#64;for block.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-table [columns]="cols" [value]="products" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col) {
                        <th>
                            {{ col.header }}
                        </th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-rowData let-columns="columns">
                <tr>
                    @for (col of columns; track col) {
                        <td>
                            {{ rowData[col.field] }}
                        </td>
                    }
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableDynamicDemo implements OnInit {
    products!: Product[];

    cols!: Column[];

    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    ngOnInit() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
        });
        this.cols = [
            { field: 'code', header: 'Code' },
            { field: 'name', header: 'Name' },
            { field: 'category', header: 'Category' },
            { field: 'quantity', header: 'Quantity' }
        ];
    }
}
```

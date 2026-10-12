# Angular Table Component — Selectionevents

## Selectionevents

Table provides onRowSelect and onRowUnselect events to listen selection events.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ProductService } from '@/service/productservice';
import { MessageService } from 'primeng/api';
import { Product } from '@/domain/product';

@Component({
    template: `
        <p-table [value]="products" selectionMode="single" [(selection)]="select …(lange Zeile gekürzt)
            <ng-template #header>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr [pSelectableRow]="product">
                    <td>{{ product.code }}</td>
                    <td>{{ product.name }}</td>
                    <td>{{ product.category }}</td>
                    <td>{{ product.quantity }}</td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule],
    providers: [ProductService, MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableSelectionEventsDemo implements OnInit {
    products!: Product[];

    selectedProduct!: Product;

    private productService = inject(ProductService);

    private messageService = inject(MessageService);

    private cd = inject(ChangeDetectorRef);

    ngOnInit() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
        });
    }

    onRowSelect(event: any) {
        this.messageService.add({ severity: 'info', summary: 'Product Selected', detail: event.data.name });
    }

    onRowUnselect(event: any) {
        this.messageService.add({ severity: 'info', summary: 'Product Unselected', detail: event.data.name });
    }
}
```

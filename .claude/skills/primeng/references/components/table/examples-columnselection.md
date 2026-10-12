# Angular Table Component — Columnselection

## Columnselection

Row selection with an element inside a column is implemented with templating.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProductService } from '@/service/productservice';
import { MessageService } from 'primeng/api';
import { Product } from '@/domain/product';
import { Search } from '@primeicons/angular/search';

@Component({
    template: `
        <p-table [value]="products" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th style="width: 5rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr>
                    <td>{{ product.code }}</td>
                    <td>{{ product.name }}</td>
                    <td>{{ product.category }}</td>
                    <td>{{ product.quantity }}</td>
                    <td>
                        <button type="button" pButton iconOnly (click)="selectProduct(product)" severity="secondary" rounded><svg data-p-icon="search" /></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, ButtonModule, Search],
    providers: [ProductService, MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableColumnSelectionDemo implements OnInit {
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

    selectProduct(product: Product) {
        this.messageService.add({ severity: 'info', summary: 'Product Selected', detail: product.name });
    }
}
```

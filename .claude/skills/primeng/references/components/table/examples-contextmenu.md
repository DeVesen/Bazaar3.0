# Angular Table Component — Contextmenu

## Contextmenu

Table has exclusive integration with contextmenu component. In order to attach a menu to a table, add pContextMenuRow directive to the rows that can be selected with context menu, define a local template variable for the menu and bind it to the contextMenu property of the table. This enables displaying the menu whenever a row is right clicked. Optional pContextMenuRowIndex property is available to access the row index. A separate contextMenuSelection property is used to get a hold of the right clicked row. For dynamic columns, setting pContextMenuRowDisabled property as true disables context menu for that particular row.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ContextMenuModule } from 'primeng/contextmenu';
import { Table, TableModule } from 'primeng/table';
import { ProductService } from '@/service/productservice';
import { MenuItem, MessageService } from 'primeng/api';
import { Product } from '@/domain/product';

@Component({
    template: `
        <p-contextmenu #cm [model]="items" (onHide)="selectedProduct = null" />
        <p-table [value]="products" [(contextMenuSelection)]="selectedProduct" [contextMenu]="cm" dataKey="code" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr [pContextMenuRow]="product">
                    <td>{{ product.code }}</td>
                    <td>{{ product.name }}</td>
                    <td>{{ product.category }}</td>
                    <td>{{ '$' + product.price }}</td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [ContextMenuModule, TableModule],
    providers: [ProductService, MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableContextMenuDemo implements OnInit {
    products!: Product[];

    selectedProduct!: Product;

    items!: MenuItem[];

    private productService = inject(ProductService);

    private messageService = inject(MessageService);

    private cd = inject(ChangeDetectorRef);

    ngOnInit() {
        this.productService.getProductsMini().then((data) => {
            this.products = data;
        });
        this.items = [
            { label: 'View', icon: 'pi pi-fw pi-search', command: () => this.viewProduct(this.selectedProduct) },
            { label: 'Delete', icon: 'pi pi-fw pi-times', command: () => this.deleteProduct(this.selectedProduct) }
        ];
    }

    viewProduct(product: Product) {
        this.messageService.add({ severity: 'info', summary: 'Product Selected', detail: product.name });
    }

    deleteProduct(product: Product) {
        this.products = this.products.filter((p) => p.id !== product.id);
        this.messageService.add({ severity: 'error', summary: 'Product Deleted', detail: product.name });
        this.selectedProduct = null;
    }
}
```

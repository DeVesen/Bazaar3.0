# Angular Table Component — Celleditselection

## Celleditselection

Cell editing composes with row selection. Clicks inside an editable cell start editing, while the checkbox column drives selection independently.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';

@Component({
    template: `
        <div>
            <div class="flex items-center gap-2 mb-3">
                <span class="text-sm font-medium">Selected</span>
                <p-badge [value]="selectedProducts?.length || 0" [severity]="selectedProducts?.length ? 'info' : 'secondary'" />
            </div>
            <p-table [value]="products" [(selection)]="selectedProducts" dataKey="id" [tableStyle]="{ 'min-width': '50rem' }">
                <ng-template #header>
                    <tr>
                        <th style="width: 3rem">
                            <p-table-header-checkbox />
                        </th>
                        <th style="width: 4rem">Image</th>
                        <th style="width: 30%">Name</th>
                        <th style="width: 20%">Category</th>
                        <th style="width: 10%">Qty</th>
                        <th style="width: 15%">Price</th>
                        <th style="width: 20%">Status</th>
                    </tr>
                </ng-template>
                <ng-template #body let-product>
                    <tr>
                        <td>
                            <p-table-checkbox [value]="product" />
                        </td>
                        <td>
                            <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" width="40" height="40" class="rounded-md shadow" />
                        </td>
                        <td [pEditableColumn]="product.name" pEditableColumnField="name">
                            <p-cell-editor>
                                <ng-template #input>
                                    <input pInputText type="text" [(ngModel)]="product.name" fluid pSize="small" />
                                </ng-template>
                                <ng-template #output>
                                    <span class="font-medium">{{ product.name }}</span>
                                </ng-template>
                            </p-cell-editor>
                        </td>
                        <td [pEditableColumn]="product.category" pEditableColumnField="category">
                            <p-cell-editor>
                                <ng-template #input>
                                    <input pInputText type="text" [(ngModel)]="product.category" fluid pSize="small" />
                                </ng-template>
                                <ng-template #output>
                                    <p-tag [value]="product.category" severity="secondary" />
                                </ng-template>
                            </p-cell-editor>
                        </td>
                        <td [pEditableColumn]="product.quantity" pEditableColumnField="quantity">
                            <p-cell-editor>
                                <ng-template #input>
                                    <p-inputnumber [(ngModel)]="product.quantity" fluid size="small" />
                                </ng-template>
                                <ng-template #output>
                                    {{ product.quantity }}
                                </ng-template>
                            </p-cell-editor>
                        </td>
                        <td [pEditableColumn]="product.price" pEditableColumnField="price">
                            <p-cell-editor>
                                <ng-template #input>
                                    <p-inputnumber [(ngModel)]="product.price" mode="currency" currency="USD" locale="en-US" fluid size="small" />
                                </ng-template>
                                <ng-template #output>
                                    <span class="font-semibold">{{ '$' + product.price }}</span>
                                </ng-template>
                            </p-cell-editor>
                        </td>
                        <td [pEditableColumn]="product.inventoryStatus" pEditableColumnField="inventoryStatus">
                            <p-cell-editor>
                                <ng-template #input>
                                    <p-select [options]="statuses" [(ngModel)]="product.inventoryStatus" appendTo="body" optionLabel="label" optionValue="value" size="small" fluid />
                                </ng-template>
                                <ng-template #output>
                                    <p-tag [value]="getSeverityLabel(product.inventoryStatus)" [severity]="getSeverity(product.inventoryStatus)" />
                                </ng-template>
                            </p-cell-editor>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `,
    standalone: true,
    imports: [BadgeModule, SelectModule, InputNumberModule, TableModule, TagModule, InputTextModule, FormsModule],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellEditSelectionDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    selectedProducts: Product[] | null = null;

    statuses = [
        { label: 'In Stock', value: 'INSTOCK' },
        { label: 'Low Stock', value: 'LOWSTOCK' },
        { label: 'Out of Stock', value: 'OUTOFSTOCK' }
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

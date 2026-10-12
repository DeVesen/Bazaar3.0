# Angular Table Component — Rowedit

## Rowedit

Row-level editing with pEditableRow , pInitEditableRow , pSaveEditableRow and pCancelEditableRow directives. Use editMode="row" on the table with a dataKey to uniquely identify each row.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProductService } from '@/service/productservice';
import { Product } from '@/domain/product';
import { Pencil } from '@primeicons/angular/pencil';
import { Check } from '@primeicons/angular/check';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <p-table [value]="products" dataKey="id" editMode="row" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th style="width: 30%">Product</th>
                    <th style="width: 20%">Category</th>
                    <th style="width: 10%">Qty</th>
                    <th style="width: 15%">Price</th>
                    <th style="width: 25%">Status</th>
                    <th style="width: 9rem">Actions</th>
                </tr>
            </ng-template>
            <ng-template #body let-product let-editing="editing" let-ri="rowIndex">
                <tr [pEditableRow]="product">
                    <td>
                        <p-cell-editor>
                            <ng-template #input>
                                <input pInputText type="text" [(ngModel)]="product.name" fluid />
                            </ng-template>
                            <ng-template #output>
                                <div class="flex items-center gap-3">
                                    <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" width="40" height="40" class="rounded-md shadow" />
                                    <div class="flex flex-col">
                                        <span class="font-medium">{{ product.name }}</span>
                                        <span class="text-xs text-surface-500 dark:text-surface-400">{{ product.code }}</span>
                                    </div>
                                </div>
                            </ng-template>
                        </p-cell-editor>
                    </td>
                    <td>
                        <p-cell-editor>
                            <ng-template #input>
                                <input pInputText type="text" [(ngModel)]="product.category" fluid />
                            </ng-template>
                            <ng-template #output>
                                <p-tag [value]="product.category" severity="secondary" />
                            </ng-template>
                        </p-cell-editor>
                    </td>
                    <td>
                        <p-cell-editor>
                            <ng-template #input>
                                <p-inputnumber [(ngModel)]="product.quantity" fluid />
                            </ng-template>
                            <ng-template #output>
                                {{ product.quantity }}
                            </ng-template>
                        </p-cell-editor>
                    </td>
                    <td>
                        <p-cell-editor>
                            <ng-template #input>
                                <p-inputnumber [(ngModel)]="product.price" mode="currency" currency="USD" fluid />
                            </ng-template>
                            <ng-template #output>
                                <span class="font-semibold">{{ '$' + product.price }}</span>
                            </ng-template>
                        </p-cell-editor>
                    </td>
                    <td>
                        <p-cell-editor>
                            <ng-template #input>
                                <p-select [options]="statuses" [(ngModel)]="product.inventoryStatus" appendTo="body" optionLabel="label" optionValue="value" fluid />
                            </ng-template>
                            <ng-template #output>
                                <p-tag [value]="getSeverityLabel(product.inventoryStatus)" [severity]="getSeverity(product.inventoryStatus)" />
                            </ng-template>
                        </p-cell-editor>
                    </td>
                    <td>
                        <div class="flex gap-1">
                            @if (!editing) {
                                <button pButton type="button" pInitEditableRow (click)="onRowEditInit(product)" variant="text" severity="secondary" iconOnly>
                                    <svg data-p-icon="pencil" />
                                </button>
                            }
                            @if (editing) {
                                <button pButton type="button" pSaveEditableRow (click)="onRowEditSave(product)" variant="text" severity="success" iconOnly>
                                    <svg data-p-icon="check" />
                                </button>
                                <button pButton type="button" pCancelEditableRow (click)="onRowEditCancel(product, ri)" variant="text" severity="danger" iconOnly>
                                    <svg data-p-icon="times" />
                                </button>
                            }
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [SelectModule, InputNumberModule, TableModule, TagModule, ButtonModule, InputTextModule, FormsModule, Pencil, Check, Times],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableRowEditDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    products!: Product[];

    statuses = [
        { label: 'In Stock', value: 'INSTOCK' },
        { label: 'Low Stock', value: 'LOWSTOCK' },
        { label: 'Out of Stock', value: 'OUTOFSTOCK' }
    ];

    clonedProducts: { [s: string]: Product } = {};

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => {
            this.products = data.slice(0, 6);
        });
    }

    onRowEditInit(product: Product) {
        this.clonedProducts[product.id as string] = { ...product };
    }

    onRowEditSave(product: Product) {
        delete this.clonedProducts[product.id as string];
    }

    onRowEditCancel(product: Product, index: number) {
        this.products[index] = this.clonedProducts[product.id as string];
        delete this.clonedProducts[product.id as string];
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

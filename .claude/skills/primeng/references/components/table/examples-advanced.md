# Angular Table Component — Advanced

## Advanced

Sorting, per-column and global filtering, and cell editing composed in a single table.

```typescript
import { Component, OnInit, inject, viewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ProductService } from '@/service/productservice';
import { SortEvent } from 'primeng/api';
import { Product } from '@/domain/product';
import { Search } from '@primeicons/angular/search';
import { Database } from '@primeicons/angular/database';

@Component({
    template: `
        <div>
            <div class="mb-3 flex justify-end">
                <p-iconfield>
                    <p-inputicon>
                        <svg data-p-icon="search" />
                    </p-inputicon>
                    <input pInputText pSize="small" type="text" (input)="dt.filterGlobal($event.target.value, 'contains')" placeholder="Keyword search" />
                </p-iconfield>
            </div>
            <p-table #dt [value]="products" dataKey="id" (sortFunction)="customSort($event)" [customSort]="true" [globalFilterFields]="['name', 'category', 'code']" [tableStyle]="{ 'min-width': '60rem' }">
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="name" style="min-width: 14rem">
                            <div class="flex items-center gap-2">
                                Name
                                <p-sort-icon field="name" />
                            </div>
                        </th>
                        <th pSortableColumn="category" style="min-width: 12rem">
                            <div class="flex items-center gap-2">
                                Category
                                <p-sort-icon field="category" />
                            </div>
                        </th>
                        <th pSortableColumn="price" style="min-width: 10rem">
                            <div class="flex items-center gap-2">
                                Price
                                <p-sort-icon field="price" />
                            </div>
                        </th>
                        <th pSortableColumn="quantity" style="min-width: 8rem">
                            <div class="flex items-center gap-2">
                                Qty
                                <p-sort-icon field="quantity" />
                            </div>
                        </th>
                        <th pSortableColumn="inventoryStatus" style="min-width: 10rem">
                            <div class="flex items-center gap-2">
                                Status
                                <p-sort-icon field="inventoryStatus" />
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th>
                            <p-column-filter type="text" field="name" [showMenu]="false" filterOn="input">
                                <ng-template #filter let-value let-filter="filterCallback">
                                    <input pInputText pSize="small" type="text" [value]="value || ''" (input)="filter($event.target.value)" placeholder="Search" class="w-full" />
                                </ng-template>
                            </p-column-filter>
                        </th>
                        <th>
                            <p-column-filter type="text" field="category" [showMenu]="false" filterOn="input">
                                <ng-template #filter let-value let-filter="filterCallback">
                                    <input pInputText pSize="small" type="text" [value]="value || ''" (input)="filter($event.target.value)" placeholder="Search" class="w-full" />
                                </ng-template>
                            </p-column-filter>
                        </th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </ng-template>
                <ng-template #body let-product>
                    <tr>
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
                        <td>{{ product.quantity }}</td>
                        <td>
                            <p-tag [value]="getSeverityLabel(product.inventoryStatus)" [severity]="getSeverity(product.inventoryStatus)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="5">
                            <div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <div class="w-14 h-14 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                    <svg data-p-icon="database" class="text-xl text-surface-400 dark:text-surface-500" />
                                </div>
                                <div>
                                    <p class="m-0 font-semibold text-surface-900 dark:text-surface-0">No products found</p>
                                    <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">Try adjusting your search or filters.</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, InputNumberModule, TableModule, TagModule, InputTextModule, FormsModule, Search, Database],
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableAdvancedDemo implements OnInit {
    private productService = inject(ProductService);

    private cd = inject(ChangeDetectorRef);

    dt = viewChild<Table>('dt');

    products!: Product[];

    initialValue!: Product[];

    sortedField: string | null = null;

    isSorted: boolean | null = null;

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => {
            this.products = data.slice(0, 10);
            this.initialValue = [...this.products];
        });
    }

    customSort(event: SortEvent) {
        if (this.sortedField !== event.field) {
            this.sortedField = event.field ?? null;
            this.isSorted = true;
            this.sortTableData(event);
        } else if (this.isSorted) {
            this.isSorted = false;
            this.sortTableData(event);
        } else {
            this.sortedField = null;
            this.isSorted = null;
            this.products = [...this.initialValue];

            const table = this.dt()!;

            table.sortField = null;
            table.sortOrder = table.defaultSortOrder();
            table.tableService.onSort(null);
        }
    }

    sortTableData(event: SortEvent) {
        event.data!.sort((data1: any, data2: any) => {
            let value1 = data1[event.field!];
            let value2 = data2[event.field!];
            let result: number;

            if (value1 == null && value2 != null) result = -1;
            else if (value1 != null && value2 == null) result = 1;
            else if (value1 == null && value2 == null) result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
            else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

            return event.order! * result;
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

# Angular Table Component — Columngroupfiltersort

## Columngroupfiltersort

Sort and filter work on any leaf header cell in a grouped layout. Add pSortableColumn with a field to the leaf header columns and a filter row below them with the p-column-filter templates.

```typescript
import { Component, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SortEvent } from 'primeng/api';
import { Product } from '@/domain/product';
import { ArrowUp } from '@primeicons/angular/arrow-up';
import { ArrowDown } from '@primeicons/angular/arrow-down';

@Component({
    template: `
        <p-table #dt [value]="sales" (sortFunction)="customSort($event)" [customSort]="true" [showGridlines]="true" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th pSortableColumn="product" rowspan="2">
                        <div class="flex items-center gap-2">
                            Product
                            <p-sort-icon field="product" />
                        </div>
                    </th>
                    <th colspan="2">Sale Rate</th>
                    <th colspan="2">Profits</th>
                </tr>
                <tr>
                    <th pSortableColumn="lastYearSale">
                        <div class="flex items-center gap-2">
                            Last Year
                            <p-sort-icon field="lastYearSale" />
                        </div>
                    </th>
                    <th pSortableColumn="thisYearSale">
                        <div class="flex items-center gap-2">
                            This Year
                            <p-sort-icon field="thisYearSale" />
                        </div>
                    </th>
                    <th pSortableColumn="lastYearProfit">
                        <div class="flex items-center gap-2">
                            Last Year
                            <p-sort-icon field="lastYearProfit" />
                        </div>
                    </th>
                    <th pSortableColumn="thisYearProfit">
                        <div class="flex items-center gap-2">
                            This Year
                            <p-sort-icon field="thisYearProfit" />
                        </div>
                    </th>
                </tr>
                <tr>
                    <th>
                        <p-column-filter type="text" field="product" filterOn="input">
                            <ng-template #filter let-value let-filter="filterCallback">
                                <input pInputText pSize="small" type="text" [value]="value || ''" (input)="filter($event.target.value)" placeholder="Search" class="w-full" />
                            </ng-template>
                        </p-column-filter>
                    </th>
                    <th></th>
                    <th>
                        <p-column-filter type="numeric" field="thisYearSale" matchMode="gte">
                            <ng-template #filter let-value let-filter="filterCallback">
                                <input pInputText pSize="small" type="number" [value]="value ?? ''" (input)="filter($event.target.value === '' ? null : +$event.target.value)" placeholder="&ge;" class="w-full" />
                            </ng-template>
                        </p-column-filter>
                    </th>
                    <th></th>
                    <th></th>
                </tr>
            </ng-template>
            <ng-template #body let-sale>
                <tr>
                    <td>
                        <span class="font-medium">{{ sale.product }}</span>
                    </td>
                    <td>{{ sale.lastYearSale }}%</td>
                    <td>
                        <div class="inline-flex items-center gap-1">
                            <span>{{ sale.thisYearSale }}%</span>
                            @if (sale.thisYearSale >= sale.lastYearSale) {
                                <svg data-p-icon="arrow-up" [size]="12" class="text-green-500" />
                            } @else {
                                <svg data-p-icon="arrow-down" [size]="12" class="text-red-500" />
                            }
                        </div>
                    </td>
                    <td>{{ formatCurrency(sale.lastYearProfit) }}</td>
                    <td>
                        <p-tag [value]="formatCurrency(sale.thisYearProfit)" [severity]="sale.thisYearProfit >= sale.lastYearProfit ? 'success' : 'danger'" />
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, TagModule, InputTextModule, ArrowUp, ArrowDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableColumnGroupFilterSortDemo {
    dt = viewChild<Table>('dt');

    sales = [
        { product: 'Bamboo Watch', lastYearSale: 51, thisYearSale: 40, lastYearProfit: 54406, thisYearProfit: 43342 },
        { product: 'Black Watch', lastYearSale: 83, thisYearSale: 9, lastYearProfit: 423132, thisYearProfit: 312122 },
        { product: 'Blue Band', lastYearSale: 38, thisYearSale: 5, lastYearProfit: 12321, thisYearProfit: 8500 },
        { product: 'Blue T-Shirt', lastYearSale: 49, thisYearSale: 22, lastYearProfit: 745232, thisYearProfit: 650323 },
        { product: 'Bracelet', lastYearSale: 17, thisYearSale: 79, lastYearProfit: 643242, thisYearProfit: 500332 }
    ];

    initialValue = [...this.sales];

    sortedField: string | null = null;

    isSorted: boolean | null = null;

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
            this.sales = [...this.initialValue];

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

    formatCurrency(value: number): string {
        return value != null ? '$' + value.toLocaleString() : '';
    }
}
```

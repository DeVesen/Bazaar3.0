# Angular Table Component — Columngroup

## Columngroup

Multi-level headers with rowspan and colspan.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Product } from '@/domain/product';
import { ArrowUp } from '@primeicons/angular/arrow-up';
import { ArrowDown } from '@primeicons/angular/arrow-down';

@Component({
    template: `
        <p-table [value]="sales" [tableStyle]="{ 'min-width': '50rem' }" [showGridlines]="true">
            <ng-template #header>
                <tr>
                    <th rowspan="2">Product</th>
                    <th colspan="2">Sale Rate</th>
                    <th colspan="2">Profits</th>
                </tr>
                <tr>
                    <th>Last Year</th>
                    <th>This Year</th>
                    <th>Last Year</th>
                    <th>This Year</th>
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
            <ng-template #footer>
                <tr>
                    <td colspan="3" style="text-align: right"><span class="font-semibold">Totals</span></td>
                    <td>
                        <span class="font-semibold">{{ formatCurrency(lastYearTotal) }}</span>
                    </td>
                    <td>
                        <span class="font-semibold">{{ formatCurrency(thisYearTotal) }}</span>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, TagModule, ArrowUp, ArrowDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableColumnGroupDemo implements OnInit {
    sales!: any[];

    lastYearTotal!: number;

    thisYearTotal!: number;

    ngOnInit() {
        this.sales = [
            { product: 'Bamboo Watch', lastYearSale: 51, thisYearSale: 40, lastYearProfit: 54406, thisYearProfit: 43342 },
            { product: 'Black Watch', lastYearSale: 83, thisYearSale: 9, lastYearProfit: 423132, thisYearProfit: 312122 },
            { product: 'Blue Band', lastYearSale: 38, thisYearSale: 5, lastYearProfit: 12321, thisYearProfit: 8500 },
            { product: 'Blue T-Shirt', lastYearSale: 49, thisYearSale: 22, lastYearProfit: 745232, thisYearProfit: 650323 },
            { product: 'Bracelet', lastYearSale: 17, thisYearSale: 79, lastYearProfit: 643242, thisYearProfit: 500332 }
        ];
        this.lastYearTotal = this.sales.reduce((total, sale) => total + sale.lastYearProfit, 0);
        this.thisYearTotal = this.sales.reduce((total, sale) => total + sale.thisYearProfit, 0);
    }

    formatCurrency(value: number): string {
        return value != null ? '$' + value.toLocaleString() : '';
    }
}
```

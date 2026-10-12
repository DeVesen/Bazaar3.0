# Angular TreeTable Component — Column Group

## Column Group

Columns can be grouped at header and footer using rowspan and colspan properties.

```typescript
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { Product } from '@/domain/product';
import { ArrowUp } from '@primeicons/angular/arrow-up';
import { ArrowDown } from '@primeicons/angular/arrow-down';

@Component({
    template: `
        <p-treetable [value]="sales" showGridlines [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th rowspan="2">Product</th>
                    <th colspan="2" style="text-align: center">Sale Rate</th>
                    <th colspan="2" style="text-align: center">Profits</th>
                </tr>
                <tr>
                    <th>Last Year</th>
                    <th>This Year</th>
                    <th>Last Year</th>
                    <th>This Year</th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode let-rowData="rowData">
                <tr [ttRow]="rowNode">
                    <td>
                        <div class="flex items-center gap-2">
                            <p-treetable-toggler [rowNode]="rowNode" />
                            <span [class]="rowNode.node.children?.length ? 'font-medium' : ''">{{ rowData.product }}</span>
                        </div>
                    </td>
                    <td>{{ rowData.lastYearSale }}%</td>
                    <td>
                        <div class="inline-flex items-center gap-1">
                            <span>{{ rowData.thisYearSale }}%</span>
                            @if (rowData.thisYearSale >= rowData.lastYearSale) {
                                <svg data-p-icon="arrow-up" [size]="12" class="text-green-500" />
                            } @else {
                                <svg data-p-icon="arrow-down" [size]="12" class="text-red-500" />
                            }
                        </div>
                    </td>
                    <td>{{ '$' + rowData.lastYearProfit.toLocaleString() }}</td>
                    <td>
                        <p-tag [value]="'$' + rowData.thisYearProfit.toLocaleString()" [severity]="rowData.thisYearProfit >= rowData.lastYearProfit ? 'success' : 'danger'" />
                    </td>
                </tr>
            </ng-template>
            <ng-template #footer>
                <tr>
                    <td colspan="3" style="text-align: right">
                        <span class="font-semibold">Totals</span>
                    </td>
                    <td>
                        <span class="font-semibold">{{ '$' + lastYearTotal.toLocaleString() }}</span>
                    </td>
                    <td>
                        <span class="font-semibold">{{ '$' + thisYearTotal.toLocaleString() }}</span>
                    </td>
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [TagModule, TreeTableModule, ArrowUp, ArrowDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableColumnGroupDemo implements OnInit {
    sales!: TreeNode[];

    lastYearTotal: number = 0;

    thisYearTotal: number = 0;

    ngOnInit() {
        this.sales = [
            {
                key: 'europe',
                expanded: true,
                data: { product: 'Europe', lastYearSale: 60, thisYearSale: 45, lastYearProfit: 766_537, thisYearProfit: 659_964 },
                children: [
                    { key: 'e-1', data: { product: 'Bamboo Watch', lastYearSale: 51, thisYearSale: 40, lastYearProfit: 54_406, thisYearProfit: 43_342 } },
                    { key: 'e-2', data: { product: 'Black Watch', lastYearSale: 83, thisYearSale: 9, lastYearProfit: 423_132, thisYearProfit: 312_122 } },
                    { key: 'e-3', data: { product: 'Blue T-Shirt', lastYearSale: 49, thisYearSale: 22, lastYearProfit: 288_999, thisYearProfit: 304_500 } }
                ]
            },
            {
                key: 'americas',
                data: { product: 'Americas', lastYearSale: 28, thisYearSale: 42, lastYearProfit: 655_563, thisYearProfit: 508_832 },
                children: [
                    { key: 'a-1', data: { product: 'Blue Band', lastYearSale: 38, thisYearSale: 5, lastYearProfit: 12_321, thisYearProfit: 8_500 } },
                    { key: 'a-2', data: { product: 'Bracelet', lastYearSale: 17, thisYearSale: 79, lastYearProfit: 643_242, thisYearProfit: 500_332 } }
                ]
            }
        ];
        this.lastYearTotal = this.sales.reduce((sum, n) => sum + n.data.lastYearProfit, 0);
        this.thisYearTotal = this.sales.reduce((sum, n) => sum + n.data.thisYearProfit, 0);
    }
}
```

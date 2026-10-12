# Angular Table Component — Frozencolumnsmultiple

## Frozencolumnsmultiple

Multiple columns can be frozen on either side of the table. Enable the pFrozenColumn directive on each column to pin it during horizontal scroll and use alignFrozen to fix a column to the left (default) or the right edge.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CustomerService } from '@/service/customerservice';
import { Customer, Representative, Country } from '@/domain/customer';

@Component({
    template: `
        <p-table [value]="customers" [scrollable]="true" scrollHeight="400px">
            <ng-template #header>
                <tr>
                    <th style="min-width: 80px" pFrozenColumn>Id</th>
                    <th style="min-width: 200px" pFrozenColumn>Name</th>
                    <th style="min-width: 200px" pFrozenColumn>Country</th>
                    <th style="min-width: 220px">Company</th>
                    <th style="min-width: 200px">Representative</th>
                    <th style="min-width: 200px">Date</th>
                    <th style="min-width: 200px">Activity</th>
                    <th style="min-width: 200px">Status</th>
                    <th style="min-width: 180px" alignFrozen="right" pFrozenColumn>Balance</th>
                </tr>
            </ng-template>
            <ng-template #body let-customer>
                <tr>
                    <td pFrozenColumn>
                        <span class="text-xs text-surface-500 dark:text-surface-400 tabular-nums">#{{ customer.id }}</span>
                    </td>
                    <td pFrozenColumn>
                        <span class="font-semibold">{{ customer.name }}</span>
                    </td>
                    <td pFrozenColumn>
                        <div class="flex items-center gap-2">
                            <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + customer.country.code" style="width: 20px" />
                            <span>{{ customer.country.name }}</span>
                        </div>
                    </td>
                    <td>{{ customer.company }}</td>
                    <td>{{ customer.representative.name }}</td>
                    <td>{{ customer.date }}</td>
                    <td>{{ customer.activity }}%</td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                    <td alignFrozen="right" pFrozenColumn>
                        <span class="font-semibold">{{ formatCurrency(customer.balance) }}</span>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, TagModule],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFrozenColumnsMultipleDemo implements OnInit {
    private customerService = inject(CustomerService);

    private cd = inject(ChangeDetectorRef);

    customers!: Customer[];

    ngOnInit() {
        this.customerService.getCustomersMedium().then((data) => {
            this.customers = data;
        });
    }

    formatCurrency(value: number) {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    getSeverity(status: string) {
        switch (status) {
            case 'qualified':
                return 'success';
            case 'unqualified':
                return 'danger';
            case 'negotiation':
                return 'warn';
            case 'new':
                return 'info';
            case 'renewal':
                return 'secondary';
            case 'proposal':
                return 'info';
            default:
                return 'secondary';
        }
    }
}
```

# Angular Table Component — Horizontalscroll

## Horizontalscroll

When the combined column widths exceed the container, the table scrolls horizontally. Give each column a minWidth so the columns don't squeeze.

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
                    <th style="min-width: 6rem">Id</th>
                    <th style="min-width: 14rem">Name</th>
                    <th style="min-width: 14rem">Country</th>
                    <th style="min-width: 12rem">Date</th>
                    <th style="min-width: 10rem">Balance</th>
                    <th style="min-width: 14rem">Company</th>
                    <th style="min-width: 10rem">Status</th>
                    <th style="min-width: 8rem">Activity</th>
                    <th style="min-width: 14rem">Representative</th>
                </tr>
            </ng-template>
            <ng-template #body let-customer>
                <tr>
                    <td>{{ customer.id }}</td>
                    <td>
                        <span class="font-medium">{{ customer.name }}</span>
                    </td>
                    <td>{{ customer.country.name }}</td>
                    <td>{{ customer.date }}</td>
                    <td>
                        <span class="font-semibold">{{ '$' + customer.balance.toLocaleString() }}</span>
                    </td>
                    <td>{{ customer.company }}</td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                    <td>{{ customer.activity }}%</td>
                    <td>{{ customer.representative.name }}</td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, TagModule],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableHorizontalScrollDemo implements OnInit {
    private customerService = inject(CustomerService);

    private cd = inject(ChangeDetectorRef);

    customers!: Customer[];

    ngOnInit() {
        this.customerService.getCustomersMedium().then((data) => {
            this.customers = data;
        });
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

# Angular Table Component — Subheadergrouping

## Subheadergrouping

Rows are grouped with the groupRowsBy property. When rowGroupMode is set as subheader , a header and footer can be displayed for each group. The content of a group header is provided with groupheader and footer with groupfooter templates.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CustomerService } from '@/service/customerservice';
import { Customer, Country } from '@/domain/customer';

@Component({
    template: `
        <p-table [value]="customers" sortField="representative.name" sortMode="s …(lange Zeile gekürzt)
            <ng-template #header>
                <tr>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </ng-template>
            <ng-template #groupheader let-customer>
                <tr pRowGroupHeader>
                    <td colspan="5">
                        <div class="flex items-center gap-2">
                            <img [alt]="customer.representative.name" src="https://primefaces.org/cdn/primeng/images/demo/avatar/{{ customer.representative.image }}" width="32" style="vertical-align: middle" />
                            <span class="font-bold">{{ customer.representative.name }}</span>
                        </div>
                    </td>
                </tr>
            </ng-template>
            <ng-template #groupfooter let-customer>
                <tr>
                    <td colspan="5">
                        <div class="text-right font-bold pe-12">Total Customers: {{ calculateCustomerTotal(customer.representative.name) }}</div>
                    </td>
                </tr>
            </ng-template>
            <ng-template #body let-customer let-rowIndex="rowIndex">
                <tr>
                    <td>
                        {{ customer.name }}
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + customer.country.code" style="width: 20px" />
                            <span>{{ customer.country.name }}</span>
                        </div>
                    </td>
                    <td>
                        {{ customer.company }}
                    </td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                    <td>
                        {{ customer.date }}
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
export class TableSubHeaderGroupingDemo implements OnInit {
    private customerService = inject(CustomerService);

    private cd = inject(ChangeDetectorRef);

    customers!: Customer[];

    ngOnInit() {
        this.customerService.getCustomersMedium().then((data) => {
            this.customers = data;
        });
    }

    calculateCustomerTotal(name: string) {
        let total = 0;

        if (this.customers) {
            for (let customer of this.customers) {
                if (customer.representative?.name === name) {
                    total++;
                }
            }
        }

        return total;
    }

    getSeverity(status: string) {
        switch (status) {
            case 'unqualified':
                return 'danger';

            case 'qualified':
                return 'success';

            case 'new':
                return 'info';

            case 'negotiation':
                return 'warn';

            case 'renewal':
                return null;
        }
    }
}
```

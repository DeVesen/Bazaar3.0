# Angular Table Component — Stateful

## Stateful

Stateful table allows keeping the state such as page, sort and filtering either at local storage or session storage so that when the page is visited again, table would render the data using the last settings. Change the state of the table e.g paginate, navigate away and then return to this table again to test this feature, the setting is set as session with the stateStorage property so that Table retains the state until the browser is closed. Other alternative is local referring to localStorage for an extended lifetime.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerService } from '@/service/customerservice';
import { FilterMetadata } from 'primeng/api';
import { Customer, Representative, Country } from '@/domain/customer';
import { Search } from '@primeicons/angular/search';

@Component({
    template: `
        <p-table
            #dt1
            [value]="customers"
            [globalFilterFields]="['name', 'country.name', 'representative.name', 'status']"
            selectionMode="single"
            [(selection)]="selectedCustomers"
            dataKey="id"
            [tableStyle]="{ 'min-width': '50rem' }"
            [rows]="5"
            [paginator]="true"
            stateStorage="session"
            stateKey="statedemo-session"
        >
            <ng-template #caption>
                <p-iconfield iconPosition="left">
                    <p-inputicon>
                        <svg data-p-icon="search" />
                    </p-inputicon>
                    <input pInputText type="text" [value]="globalFilterValue(dt1)" (input)="dt1.filterGlobal($event.target.value, 'contains')" placeholder="Global Search" />
                </p-iconfield>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th pSortableColumn="name" style="width:25%">
                        <div class="flex items-center gap-2">
                            Name
                            <p-sort-icon field="name" />
                        </div>
                    </th>
                    <th pSortableColumn="country.name" style="width:25%">
                        <div class="flex items-center gap-2">
                            Country
                            <p-sort-icon field="country.name" />
                        </div>
                    </th>
                    <th pSortableColumn="representative.name" style="width:25%">
                        <div class="flex items-center gap-2">
                            Representative
                            <p-sort-icon field="representative.name" />
                        </div>
                    </th>
                    <th pSortableColumn="status" style="width:25%">
                        <div class="flex items-center gap-2">
                            Status
                            <p-sort-icon field="status" />
                        </div>
                    </th>
                </tr>
            </ng-template>
            <ng-template #body let-customer>
                <tr [pSelectableRow]="customer">
                    <td>
                        {{ customer.name }}
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + customer.country.code" style="width: 20px" />
                            <span class="ml-1 align-middle">{{ customer.country.name }}</span>
                        </div>
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <img [alt]="customer.representative.name" src="https://primefaces.org/cdn/primeng/images/demo/avatar/{{ customer.representative.image }}" width="32" style="vertical-align: middle" />
                            <span class="ml-1 align-middle">{{ customer.representative.name }}</span>
                        </div>
                    </td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template #emptymessage>
                <tr>
                    <td colspan="4">No customers found.</td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, TableModule, TagModule, InputTextModule, Search],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableStatefulDemo implements OnInit {
    customers!: Customer[];

    selectedCustomers!: Customer;

    private customerService = inject(CustomerService);

    private cd = inject(ChangeDetectorRef);

    ngOnInit() {
        this.customerService.getCustomersSmall().then((data) => {
            this.customers = data;
        });
    }

    globalFilterValue(table: Table): string {
        return (table.filters['global'] as FilterMetadata)?.value ?? '';
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

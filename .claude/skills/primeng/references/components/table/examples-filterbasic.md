# Angular Table Component — Filterbasic

## Filterbasic

Data filtering is enabled by defining the filters property referring to a DataTableFilterMeta instance. Each column to filter also requires filter to be enabled. Built-in filter element is a input field and using filterElement , it is possible to customize the filtering with your own UI. The optional global filtering searches the data against a single value that is bound to the global key of the filters object. The fields to search against is defined with the globalFilterFields .

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { Customer, Country } from '@/domain/customer';
import { Search } from '@primeicons/angular/search';

interface Customer {
    id: number;
    name: string;
    country: string;
    status: string;
    verified: boolean;
    balance: number;
}

@Component({
    template: `
        <div class="mb-3 flex justify-end">
            <p-iconfield iconPosition="left">
                <p-inputicon>
                    <svg data-p-icon="search" />
                </p-inputicon>
                <input pInputText pSize="small" type="text" (input)="dt.filterGlobal($event.target.value, 'contains')" placeholder="Keyword Search" />
            </p-iconfield>
        </div>
        <p-table #dt [value]="customers" dataKey="id" [globalFilterFields]="['name', 'country', 'status']" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th style="width: 25%">Name</th>
                    <th style="width: 20%">Country</th>
                    <th style="width: 20%">Status</th>
                    <th style="width: 20%">Balance</th>
                    <th style="width: 15%">Verified</th>
                </tr>
                <tr>
                    <th>
                        <p-column-filter type="text" field="name" [showMenu]="false" filterOn="input" [pt]="{ columnFilterFormElement: { class: 'p-fluid' } }">
                            <ng-template #filter let-value let-filter="filterCallback">
                                <input pInputText pSize="small" type="text" [value]="value || ''" (input)="filter($event.target.value)" placeholder="Search name..." />
                            </ng-template>
                        </p-column-filter>
                    </th>
                    <th>
                        <p-column-filter type="text" field="country" [showMenu]="false" filterOn="input" [pt]="{ columnFilterFormElement: { class: 'p-fluid' } }">
                            <ng-template #filter let-value let-filter="filterCallback">
                                <input pInputText pSize="small" type="text" [value]="value || ''" (input)="filter($event.target.value)" placeholder="Search country..." />
                            </ng-template>
                        </p-column-filter>
                    </th>
                    <th>
                        <p-column-filter field="status" matchMode="equals" [showMenu]="false">
                            <ng-template #filter let-value let-filter="filterCallback">
                                <p-select [ngModel]="value" [options]="statusOpt …(lange Zeile gekürzt)
                                </p-select>
                            </ng-template>
                        </p-column-filter>
                    </th>
                    <th></th>
                    <th></th>
                </tr>
            </ng-template>
            <ng-template #body let-customer>
                <tr>
                    <td>
                        <span class="font-medium">{{ customer.name }}</span>
                    </td>
                    <td>
                        {{ customer.country }}
                    </td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                    <td>
                        <span class="font-semibold">{{ '$' + customer.balance.toLocaleString() }}</span>
                    </td>
                    <td>
                        @if (customer.verified) {
                            <p-tag value="Verified" severity="success" />
                        } @else {
                            <p-tag value="—" severity="secondary" />
                        }
                    </td>
                </tr>
            </ng-template>
            <ng-template #emptymessage>
                <tr>
                    <td colspan="5">No customers found.</td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [SelectModule, IconFieldModule, InputIconModule, TableModule, TagModule, InputTextModule, FormsModule, Search],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilterBasicDemo {
    customers = customers;

    statusOptions = statusOptions;

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
                return 'secondary';
        }
    }
}
```

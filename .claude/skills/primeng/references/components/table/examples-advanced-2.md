# Angular Table Component — Advanced

## Advanced

display="menu" swaps the inline input for a trigger icon that opens a popover. Each field supports multiple constraints joined by an AND/OR operator, a match mode per constraint, and Apply/Clear actions.

```typescript
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerService } from '@/service/customerservice';
import { Customer, Representative, Country } from '@/domain/customer';
import { FilterSlash } from '@primeicons/angular/filter-slash';
import { Search } from '@primeicons/angular/search';

@Component({
    template: `
        <div class="mb-3 flex items-center justify-between gap-3">
            <button type="button" pButton variant="outlined" size="small" (click)="clear(dt1)">
                <svg data-p-icon="filter-slash" />
                Clear Filters
            </button>
            <p-iconfield iconPosition="left">
                <p-inputicon>
                    <svg data-p-icon="search" />
                </p-inputicon>
                <input pInputText type="text" [(ngModel)]="searchValue" (input)="dt1.filterGlobal($event.target.value, 'contains')" placeholder="Keyword Search" />
            </p-iconfield>
        </div>
        <p-table #dt1 [value]="customers()" dataKey="id" [rows]="10" [rowsPerPag …(lange Zeile gekürzt)
            <ng-template #header>
                <tr>
                    <th style="min-width: 14rem">
                        <div class="flex items-center justify-between gap-2">
                            Name
                            <p-column-filter type="text" field="name" display="menu" />
                        </div>
                    </th>
                    <th style="min-width: 12rem">
                        <div class="flex items-center justify-between gap-2">
                            Country
                            <p-column-filter type="text" field="country.name" display="menu" />
                        </div>
                    </th>
                    <th style="min-width: 14rem">
                        <div class="flex items-center justify-between gap-2">
                            Agent
                            <p-column-filter field="representative" matchMode="in" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false">
                                <ng-template #filter let-value let-filter="filterCallback">
                                    <p-multiselect [ngModel]="value" [options]=" …(lange Zeile gekürzt)
                                        <ng-template let-option #item>
                                            <div class="flex items-center gap-2">
                                                <img [alt]="option.name" src="https://primefaces.org/cdn/primeng/images/demo/avatar/{{ option.image }}" style="width: 32px" />
                                                <span>{{ option.name }}</span>
                                            </div>
                                        </ng-template>
                                    </p-multiselect>
                                </ng-template>
                            </p-column-filter>
                        </div>
                    </th>
                    <th style="min-width: 12rem">
                        <div class="flex items-center justify-between gap-2">
                            Date
                            <p-column-filter type="date" field="date" display="menu" />
                        </div>
                    </th>
                    <th style="min-width: 12rem">
                        <div class="flex items-center justify-between gap-2">
                            Balance
                            <p-column-filter type="numeric" field="balance" display="menu" currency="USD" />
                        </div>
                    </th>
                    <th style="min-width: 12rem">
                        <div class="flex items-center justify-between gap-2">
                            Status
                            <p-column-filter field="status" matchMode="equals" display="menu">
                                <ng-template #filter let-value let-filter="filterCallback">
                                    <p-select [ngModel]="value" [options]="statuses()" (onChange)="filter($event.value)" placeholder="Select One" class="w-full">
                                        <ng-template let-option #item>
                                            <p-tag [value]="option.value" [severity]="getSeverity(option.value)" />
                                        </ng-template>
                                    </p-select>
                                </ng-template>
                            </p-column-filter>
                        </div>
                    </th>
                    <th style="min-width: 14rem">
                        <div class="flex items-center justify-between gap-2">
                            Activity
                            <p-column-filter field="activity" matchMode="between" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false">
                                <ng-template #filter let-value let-filter="filterCallback">
                                    <p-slider [ngModel]="value" [range]="true" class="m-4" (onSlideEnd)="filter($event.values)" />
                                    <div class="flex items-center justify-between px-2">
                                        @if (!value) {
                                            <span>0%</span>
                                            <span>100%</span>
                                        } @else {
                                            <span>{{ value[0] }}%</span>
                                            <span>{{ value[1] }}%</span>
                                        }
                                    </div>
                                </ng-template>
                            </p-column-filter>
                        </div>
                    </th>
                    <th style="min-width: 10rem">
                        <div class="flex items-center justify-between gap-2">
                            Verified
                            <p-column-filter type="boolean" field="verified" display="menu" />
                        </div>
                    </th>
                </tr>
            </ng-template>
            <ng-template #body let-customer>
                <tr>
                    <td>
                        <span class="font-medium">{{ customer.name }}</span>
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + customer.country.code" style="width: 20px" />
                            <span>{{ customer.country.name }}</span>
                        </div>
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <img [alt]="customer.representative.name" src="https://primefaces.org/cdn/primeng/images/demo/avatar/{{ customer.representative.image }}" width="32" class="rounded-full" />
                            <span class="text-sm">{{ customer.representative.name }}</span>
                        </div>
                    </td>
                    <td>
                        {{ formatDate(customer.date) }}
                    </td>
                    <td>
                        <span class="font-semibold">{{ '$' + customer.balance.toLocaleString() }}</span>
                    </td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <div class="flex-1 h-1.5 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
                                <div class="h-full bg-primary-500 rounded-full" [style.width.%]="customer.activity"></div>
                            </div>
                            <span class="text-xs text-surface-500 dark:text-surface-400 tabular-nums">{{ customer.activity }}%</span>
                        </div>
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
                    <td colspan="8">No customers found.</td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [SelectModule, IconFieldModule, InputIconModule, MultiSelectModule, SliderModule, TableModule, TagModule, ButtonModule, InputTextModule, FormsModule, FilterSlash, Search],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilterAdvancedDemo implements OnInit {
    customerService = inject(CustomerService);

    customers = signal<Customer[]>([]);

    representatives = signal<Representative[]>([]);

    statuses = signal<any[]>([]);

    loading = signal(true);

    searchValue: string = '';

    ngOnInit() {
        this.customerService.getCustomersLarge().then((customers) => {
            customers.forEach((customer: Customer) => (customer.date = new Date(customer.date as string)));
            this.customers.set(customers);
            this.loading.set(false);
        });
        this.representatives.set([
            { name: 'Amy Elsner', image: 'amyelsner.png' },
            { name: 'Anna Fali', image: 'annafali.png' },
            { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
            { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
            { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
            { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
            { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
            { name: 'Onyama Limba', image: 'onyamalimba.png' },
            { name: 'Stephen Shaw', image: 'stephenshaw.png' },
            { name: 'Xuxue Feng', image: 'xuxuefeng.png' }
        ]);
        this.statuses.set([
            { label: 'Unqualified', value: 'unqualified' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'New', value: 'new' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Renewal', value: 'renewal' },
            { label: 'Proposal', value: 'proposal' }
        ]);
    }

    clear(table: Table) {
        table.clear();
        this.searchValue = '';
    }

    formatDate(date: Date) {
        if (!date) return '';

        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
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
                return 'secondary';
            case 'proposal':
                return 'info';
        }
    }
}
```

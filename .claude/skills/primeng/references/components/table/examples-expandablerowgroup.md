# Angular Table Component — Expandablerowgroup

## Expandablerowgroup

When expandableRowGroups is present in subheader based row grouping, groups can be expanded and collapsed. State of the expansions are controlled using the expandedRows and onRowToggle properties.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CustomerService } from '@/service/customerservice';
import { Customer, Country } from '@/domain/customer';
import { ChevronDown } from '@primeicons/angular/chevron-down';
import { ChevronRight } from '@primeicons/angular/chevron-right';

@Component({
    template: `
        <p-table [value]="customers" sortField="representative.name" sortMode="single" dataKey="representative.name" rowGroupMode="subheader" groupRowsBy="representative.name" [tableStyle]="{ 'min-width': '70rem' }">
            <ng-template #header>
                <tr>
                    <th style="width:20%">Name</th>
                    <th style="width:20%">Country</th>
                    <th style="width:20%">Company</th>
                    <th style="width:20%">Status</th>
                    <th style="width:20%">Date</th>
                </tr>
            </ng-template>
            <ng-template #groupheader let-customer let-rowIndex="rowIndex" let-expanded="expanded">
                <tr>
                    <td colspan="5">
                        <button type="button" pButton iconOnly pRipple [pRowToggler]="customer" text rounded plain class="align-middle">
                            @if (expanded) {
                                <svg data-p-icon="chevron-down" />
                            } @else {
                                <svg data-p-icon="chevron-right" />
                            }
                        </button>
                        <img [alt]="customer.representative.name" src="https://p …(lange Zeile gekürzt)
                        <span class="align-middle ml-2 font-bold leading-normal">{{ customer.representative.name }}</span>
                    </td>
                </tr>
            </ng-template>
            <ng-template #groupfooter let-customer>
                <tr class="p-rowgroup-footer">
                    <td colspan="4" style="text-align: right">Total Customers</td>
                    <td>{{ calculateCustomerTotal(customer.representative.name) }}</td>
                </tr>
            </ng-template>
            <ng-template #expandedrow let-customer>
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
    imports: [TableModule, TagModule, ButtonModule, RippleModule, ChevronDown, ChevronRight],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableExpandableRowGroupDemo implements OnInit {
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

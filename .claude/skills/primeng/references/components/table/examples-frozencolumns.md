# Angular Table Component — Frozencolumns

## Frozencolumns

Certain columns can be frozen by using the pFrozenColumn directive. In addition, alignFrozen is available to define whether the column should be fixed on the left or right.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CustomerService } from '@/service/customerservice';
import { Customer, Representative, Country } from '@/domain/customer';

@Component({
    template: `
        <div class="mb-3">
            <p-togglebutton [(ngModel)]="balanceFrozen" [onIcon]="'pi pi-lock-open'" offIcon="pi pi-lock" [onLabel]="'Balance'" offLabel="Balance" />
        </div>
        <p-table [value]="customers" [scrollable]="true" scrollHeight="400px">
            <ng-template #header>
                <tr>
                    <th style="min-width: 200px" pFrozenColumn>Name</th>
                    <th style="min-width: 100px">Id</th>
                    <th style="min-width: 200px">Company</th>
                    <th style="min-width: 200px">Country</th>
                    <!-- +5 gleichartige Zeilen -->
                </tr>
            </ng-template>
            <ng-template #body let-customer>
                <tr>
                    <td pFrozenColumn>
                        <span class="font-semibold">{{ customer.name }}</span>
                    </td>
                    <td>{{ customer.id }}</td>
                    <td>{{ customer.company }}</td>
                    <td>
                        <div class="flex items-center gap-2">
                            <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + customer.country.code" style="width: 20px" />
                            <span>{{ customer.country.name }}</span>
                        </div>
                    </td>
                    <td>{{ customer.date }}</td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                    <td>{{ customer.activity }}%</td>
                    <td>{{ customer.representative.name }}</td>
                    <td alignFrozen="right" pFrozenColumn [frozen]="balanceFrozen">
                        <span class="font-semibold">{{ '$' + customer.balance.toLocaleString() }}</span>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, TagModule, ToggleButtonModule, FormsModule],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFrozenColumnsDemo implements OnInit {
    private customerService = inject(CustomerService);

    private cd = inject(ChangeDetectorRef);

    balanceFrozen: boolean = false;

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

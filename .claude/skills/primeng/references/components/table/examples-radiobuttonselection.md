# Angular Table Component — Radiobuttonselection

## Radiobuttonselection

Radio-based single selection. Combine selectionMode with a radio button column using p-table-radio-button .

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CustomerService } from '@/service/customerservice';
import { Customer, Representative, Country } from '@/domain/customer';
import { UserPlus } from '@primeicons/angular/user-plus';

@Component({
    template: `
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3 p-3 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
            <div class="flex flex-wrap items-center gap-2 text-sm">
                <span class="font-medium">Invoice recipient:</span>
                @if (selectedCustomer) {
                    <span class="text-surface-900 dark:text-surface-0">
                        <strong>{{ selectedCustomer.name }}</strong> — {{ selectedCustomer.company }}
                    </span>
                } @else {
                    <span class="text-surface-500 dark:text-surface-400">Pick a customer to assign</span>
                }
            </div>
            <button pButton size="small" [disabled]="!selectedCustomer">
                <svg data-p-icon="user-plus" />
                Assign
            </button>
        </div>
        <p-table [value]="customers" [(selection)]="selectedCustomer" dataKey="id" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th style="width: 3rem"></th>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Representative</th>
                    <th>Status</th>
                    <th>Balance</th>
                </tr>
            </ng-template>
            <ng-template #body let-customer>
                <tr>
                    <td>
                        <p-table-radio-button [value]="customer" />
                    </td>
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
                            <p-avatar [image]="'https://primefaces.org/cdn/primevue/images/avatar/' + customer.representative.image" shape="circle" />
                            <span class="text-sm">{{ customer.representative.name }}</span>
                        </div>
                    </td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                    <td>
                        <span class="font-semibold">{{ '$' + customer.balance.toLocaleString() }}</span>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [AvatarModule, TableModule, TagModule, ButtonModule, UserPlus],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableRadioButtonSelectionDemo implements OnInit {
    private customerService = inject(CustomerService);

    private cd = inject(ChangeDetectorRef);

    customers!: Customer[];

    selectedCustomer!: Customer;

    ngOnInit() {
        this.customerService.getCustomersSmall().then((data) => {
            this.customers = data.slice(0, 8);
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

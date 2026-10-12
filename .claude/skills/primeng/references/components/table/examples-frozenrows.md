# Angular Table Component — Frozenrows

## Frozenrows

Frozen rows are used to fix certain rows while scrolling, this data is defined with the frozenValue property.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CustomerService } from '@/service/customerservice';
import { Customer, Representative, Country } from '@/domain/customer';
import { LockOpen } from '@primeicons/angular/lock-open';
import { Lock } from '@primeicons/angular/lock';

@Component({
    template: `
        <p-table [value]="unlockedCustomers" [frozenValue]="lockedCustomers" [scrollable]="true" scrollHeight="400px" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Representative</th>
                    <th>Status</th>
                    <th style="width: 4rem"></th>
                </tr>
            </ng-template>
            <ng-template #frozenbody let-customer let-index="rowIndex">
                <tr>
                    <td>
                        <span class="font-semibold">{{ customer.name }}</span>
                    </td>
                    <td>
                        <div class="flex items-center gap-2">
                            <img src="https://primefaces.org/cdn/primeng/images/demo/flag/flag_placeholder.png" [class]="'flag flag-' + customer.country.code" style="width: 20px" />
                            <span>{{ customer.country.name }}</span>
                        </div>
                    </td>
                    <td>{{ customer.representative.name }}</td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                    <td>
                        <button pButton type="button" (click)="toggleLock(customer, true, index)" variant="text" severity="secondary" iconOnly aria-label="Unlock row">
                            <svg data-p-icon="lock-open" />
                        </button>
                    </td>
                </tr>
            </ng-template>
            <ng-template #body let-customer let-index="rowIndex">
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
                    <td>{{ customer.representative.name }}</td>
                    <td>
                        <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                    </td>
                    <td>
                        <button pButton iconOnly type="button" [disabled]="lockedCustomers.length >= 2" (click)="toggleLock(customer, false, index)" variant="text" severity="secondary" iconOnly aria-label="Lock row">
                            <svg data-p-icon="lock" />
                        </button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule, TagModule, ButtonModule, LockOpen, Lock],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFrozenRowsDemo implements OnInit {
    private customerService = inject(CustomerService);

    private cd = inject(ChangeDetectorRef);

    unlockedCustomers!: Customer[];

    lockedCustomers!: Customer[];

    ngOnInit() {
        this.customerService.getCustomersMedium().then((data) => {
            this.lockedCustomers = [data[0]];
            this.unlockedCustomers = data.slice(1);
        });
    }

    toggleLock(data: Customer, frozen: boolean, index: number) {
        if (frozen) {
            this.lockedCustomers = this.lockedCustomers.filter((c, i) => i !== index);
            this.unlockedCustomers.push(data);
        } else {
            this.unlockedCustomers = this.unlockedCustomers.filter((c, i) => i !== index);
            this.lockedCustomers.push(data);
        }

        this.unlockedCustomers.sort((val1, val2) => (val1.id! < val2.id! ? -1 : 1));
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

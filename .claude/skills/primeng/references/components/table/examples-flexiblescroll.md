# Angular Table Component — Flexiblescroll

## Flexiblescroll

scrollHeight="flex" lets the viewport grow and shrink with its flex parent — handy inside resizable dialogs or split layouts.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CustomerService } from '@/service/customerservice';
import { Customer, Country } from '@/domain/customer';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" (click)="showDialog()" pButton>Show Flex Scroll</button>
        </div>
        <p-dialog header="Flex Scroll" [resizable]="false" [modal]="true" [maximizable]="true" appendTo="body" [(visible)]="dialogVisible" [style]="{ width: '75vw' }" [contentStyle]="{ height: '300px' }">
            <p-table [value]="customers" [scrollable]="true" scrollHeight="flex" [tableStyle]="{ 'min-width': '50rem' }">
                <ng-template #header>
                    <tr>
                        <th>Name</th>
                        <th>Country</th>
                        <th>Status</th>
                        <th>Balance</th>
                    </tr>
                </ng-template>
                <ng-template #body let-customer>
                    <tr>
                        <td>
                            <span class="font-medium">{{ customer.name }}</span>
                        </td>
                        <td>{{ customer.country.name }}</td>
                        <td>
                            <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                        </td>
                        <td>
                            <span class="font-semibold">{{ '$' + customer.balance.toLocaleString() }}</span>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </p-dialog>
    `,
    standalone: true,
    imports: [DialogModule, TableModule, TagModule, ButtonModule],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFlexibleScrollDemo implements OnInit {
    private customerService = inject(CustomerService);

    customers!: Customer[];

    dialogVisible: boolean = false;

    ngOnInit() {
        this.customerService.getCustomersMedium().then((data) => {
            this.customers = data;
        });
    }

    showDialog() {
        this.dialogVisible = true;
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

# Angular Table Component — Columnresizescrollablemode

## Columnresizescrollablemode

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CustomerService } from '@/service/customerservice';
import { Customer, Representative, Country } from '@/domain/customer';

@Component({
    template: `
        <p-table [value]="customers" showGridlines [scrollable]="true" scrollHeight="400px" [resizableColumns]="true" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th pResizableColumn>Name</th>
                    <th pResizableColumn>Country</th>
                    <th pResizableColumn>Company</th>
                    <th pResizableColumn>Representative</th>
                </tr>
            </ng-template>
            <ng-template #body let-customer>
                <tr>
                    <td>{{ customer.name }}</td>
                    <td>{{ customer.country.name }}</td>
                    <td>{{ customer.company }}</td>
                    <td>{{ customer.representative.name }}</td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableColumnResizeScrollableModeDemo implements OnInit {
    private customerService = inject(CustomerService);

    private cd = inject(ChangeDetectorRef);

    customers!: Customer[];

    ngOnInit() {
        this.customerService.getCustomersLarge().then((customers) => {
            this.customers = customers;
        });
    }
}
```

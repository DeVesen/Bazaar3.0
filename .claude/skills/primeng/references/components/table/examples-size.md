# Angular Table Component — Size

## Size

Use the size property with small or large to adjust cell padding. Omit for the default size.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CustomerService } from '@/service/customerservice';
import { Customer, Representative, Country } from '@/domain/customer';

@Component({
    template: `
        <div class="mb-4">
            <p-selectbutton [options]="sizes" [(ngModel)]="selectedSize" [multiple]="false" optionLabel="name" optionValue="value" />
        </div>
        <p-table [value]="customers" [tableStyle]="{ 'min-width': '50rem' }" [size]="selectedSize">
            <ng-template #header>
                <tr>
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
    imports: [AvatarModule, SelectButtonModule, TableModule, TagModule, FormsModule],
    providers: [CustomerService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableSizeDemo implements OnInit {
    private customerService = inject(CustomerService);

    private cd = inject(ChangeDetectorRef);

    customers!: Customer[];

    sizes = [
        { name: 'Small', value: 'small' },
        { name: 'Normal', value: undefined },
        { name: 'Large', value: 'large' }
    ];

    selectedSize: TableSize | undefined = undefined;

    ngOnInit() {
        this.customerService.getCustomersSmall().then((data) => {
            this.customers = data.slice(0, 6);
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

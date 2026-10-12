# FilterService - PrimeNG — Tableintegration

## Tableintegration

A custom equals filter that checks for exact case sensitive value is registered and defined as a match mode of a column filter.

```typescript
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CarService } from '@/service/carservice';
import { SelectItem, FilterService } from 'primeng/api';
import { Car } from '@/domain/car';
import { Product } from '@/domain/product';

@Component({
    template: `
        <p-table #dt [columns]="cols" [value]="cars" [paginator]="true" [rows]="10" [tableStyle]="{ 'min-width': '75rem' }">
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col.field) {
                        <th [style.width]="'25%'">{{ col.header }}</th>
                    }
                </tr>
                <tr>
                    @for (col of columns; track col.field) {
                        <th>
                            <p-column-filter type="text" [field]="col.field" [matchModeOptions]="matchModeOptions" [matchMode]="'custom-equals'" />
                        </th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-rowData let-columns="columns">
                <tr [pSelectableRow]="rowData">
                    @for (col of columns; track col.field) {
                        <td>{{ rowData[col.field] }}</td>
                    }
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule],
    providers: [CarService, FilterService]
})
export class FilterServiceTableIntegrationDemo implements OnInit {
    private carService = inject(CarService);

    private filterService = inject(FilterService);

    private cd = inject(ChangeDetectorRef);

    cars: Car[];

    cols: any[];

    matchModeOptions: SelectItem[];

    ngOnInit() {
        const customFilterName = 'custom-equals';
        this.filterService.register(customFilterName, (value, filter): boolean => {
            if (filter === undefined || filter === null || filter.trim() === '') {
                return true;
            }
            if (value === undefined || value === null) {
                return false;
            }
            return value.toString() === filter.toString();
        });
        this.cols = [
            { field: 'year', header: 'Year' },
            { field: 'brand', header: 'Brand' },
            { field: 'color', header: 'Color' },
            { field: 'vin', header: 'Vin' }
        ];
        this.matchModeOptions = [
            { label: 'Custom Equals', value: customFilterName },
            { label: 'Starts With', value: FilterMatchMode.STARTS_WITH },
            { label: 'Contains', value: FilterMatchMode.CONTAINS }
        ];
        this.carService.getCarsMedium().then((cars) => {
            this.cars = cars;
        });
    }
}
```

---

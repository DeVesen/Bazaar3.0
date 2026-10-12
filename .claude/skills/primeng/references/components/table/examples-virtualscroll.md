# Angular Table Component — Virtualscroll

## Virtualscroll

Virtual Scrolling is an efficient way to render large amount data. Usage is similar to regular scrolling with the addition of virtualScrollerOptions property to define a fixed itemSize . Internally, VirtualScroller component is utilized so refer to the API of VirtualScroller for more information about the available options. In this example, 10000 preloaded records are rendered by the Table.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { CarService } from '@/service/carservice';
import { Car } from '@/domain/car';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-table [columns]="cols" [value]="cars" [scrollable]="true" scrollHeight="400px" [virtualScroll]="true" [virtualScrollItemSize]="46">
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col) {
                        <th style="width: 20%;">
                            {{ col.header }}
                        </th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-rowData let-rowIndex="rowIndex" let-columns="columns">
                <tr style="height:46px">
                    @for (col of columns; track col) {
                        <td>
                            {{ rowData[col.field] }}
                        </td>
                    }
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [TableModule],
    providers: [CarService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableVirtualScrollDemo implements OnInit {
    cars!: Car[];

    virtualCars!: Car[];

    cols!: Column[];

    private carService = inject(CarService);

    ngOnInit() {
        this.cols = [
            { field: 'id', header: 'Id' },
            { field: 'vin', header: 'Vin' },
            { field: 'year', header: 'Year' },
            { field: 'brand', header: 'Brand' },
            { field: 'color', header: 'Color' }
        ];
        this.cars = Array.from({ length: 10000 }).map((_, i) => this.carService.generateCar(i + 1));
        this.virtualCars = Array.from({ length: 10000 });
    }
}
```

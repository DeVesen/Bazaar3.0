# Angular Table Component — Virtualscrolllazy

## Virtualscrolllazy

VirtualScroller is a performance-approach to handle huge data efficiently. Setting virtualScroll property as true and providing a virtualScrollItemSize in pixels would be enough to enable this functionality. It is also suggested to use the same virtualScrollItemSize value on the tr element inside the body template.

```typescript
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { CarService } from '@/service/carservice';
import { TableLazyLoadEvent } from 'primeng/api';
import { Car } from '@/domain/car';

interface Column {
    field: string;
    header: string;
}

@Component({
    template: `
        <p-table [columns]="cols" [value]="virtualCars" [scrollable]="true" scrollHeight="400px" [rows]="100" [virtualScroll]="true" [virtualScrollItemSize]="46" [lazy]="true" (onLazyLoad)="loadCarsLazy($event)">
            <ng-template #header let-columns>
                <tr>
                    @for (col of columns; track col) {
                        <th style="width: 20%;">
                            {{ col.header }}
                        </th>
                    }
                </tr>
            </ng-template>
            <ng-template #body let-rowData let-columns="columns">
                <tr style="height:46px">
                    @for (col of columns; track col) {
                        <td>
                            {{ rowData[col.field] }}
                        </td>
                    }
                </tr>
            </ng-template>
            <ng-template #loadingbody let-columns="columns">
                <tr style="height:46px">
                    @for (col of columns; track col; let even = $even) {
                        <td>
                            <p-skeleton [style]="{ width: even ? (col.field === 'year' ? '30%' : '40%') : '60%' }" />
                        </td>
                    }
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [SkeletonModule, TableModule],
    providers: [CarService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableVirtualScrollLazyDemo implements OnInit {
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

    loadCarsLazy(event: TableLazyLoadEvent) {
        //simulate remote connection with a timeout
        setTimeout(
            () => {
                //load data of required page
                let loadedCars = this.cars.slice(event.first, event.first + event.rows);

                //populate page of virtual cars
                Array.prototype.splice.apply(this.virtualCars, [...[event.first, event.rows], ...loadedCars]);

                //trigger change detection
                event.forceUpdate();
            },
            Math.random() * 1000 + 250
        );
    }
}
```

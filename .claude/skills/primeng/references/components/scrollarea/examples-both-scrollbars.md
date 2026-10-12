# Angular Scroll Area Component — Both Scrollbars

## Both Scrollbars

Both vertical and horizontal scrollbars are displayed when the content overflows in both directions.

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <p-scrollarea class="h-80 max-w-sm mx-auto w-full rounded-md overflow-hidden">
            <p-scrollarea-viewport class="p-0!">
                <p-scrollarea-content>
                    <table class="min-w-xl w-full text-sm border-collapse border-0">
                        <thead class="sticky top-0 z-10">
                            <tr class="bg-surface-100 dark:bg-surface-800 border-b border-surface">
                                @for (col of columns; track col.key) {
                                    <th class="border-b border-surface px-4 py-2 text-left text-sm whitespace-nowrap uppercase font-mono font-light">{{ col.label }}</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            @for (city of usCities; track $index) {
                                <tr class="last:border-0 border-b border-surface odd:bg-surface-50 dark:odd:bg-surface-900/40 hover:bg-primary/5">
                                    <td class="px-4 py-2 font-medium whitespace-nowrap">{{ city.city }}</td>
                                    <td class="px-4 py-2 text-surface-500">{{ city.state }}</td>
                                    <td class="px-4 py-2 tabular-nums">{{ city.population.toLocaleString() }}</td>
                                    <td class="px-4 py-2 tabular-nums">{{ city.area_km2.toLocaleString() }}</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </p-scrollarea-content>
            </p-scrollarea-viewport>
            <p-scrollarea-scrollbar orientation="vertical" class="m-0! bg-transparent!">
                <p-scrollarea-handle />
            </p-scrollarea-scrollbar>
            <p-scrollarea-scrollbar orientation="horizontal" class="m-0! bg-transparent!">
                <p-scrollarea-handle />
            </p-scrollarea-scrollbar>
            <p-scrollarea-corner />
        </p-scrollarea>
    `,
    standalone: true,
    imports: []
})
export class ScrollareaBothScrollbarsDemo {
    columns = [
        { key: 'city', label: 'City' },
        { key: 'state', label: 'State' },
        { key: 'population', label: 'Population' },
        { key: 'area_km2', label: 'Area (km²)' }
    ];

    usCities = [
        { city: 'New York', state: 'NY', population: 8419600, area_km2: 783.8 },
        { city: 'Los Angeles', state: 'CA', population: 3980400, area_km2: 1214.9 },
        { city: 'Chicago', state: 'IL', population: 2716000, area_km2: 589.6 },
        { city: 'Houston', state: 'TX', population: 2328000, area_km2: 1651.1 },
        { city: 'Phoenix', state: 'AZ', population: 1690000, area_km2: 1340.6 },
        { city: 'Philadelphia', state: 'PA', population: 1584200, area_km2: 369.6 },
        { city: 'San Antonio', state: 'TX', population: 1547200, area_km2: 1194.0 },
        { city: 'San Diego', state: 'CA', population: 1423800, area_km2: 964.5 },
        { city: 'Dallas', state: 'TX', population: 1341100, area_km2: 882.9 },
        { city: 'San Jose', state: 'CA', population: 1035300, area_km2: 469.7 },
        { city: 'Austin', state: 'TX', population: 1010000, area_km2: 704.0 },
        { city: 'Jacksonville', state: 'FL', population: 949600, area_km2: 2265.3 },
        { city: 'Fort Worth', state: 'TX', population: 918900, area_km2: 920.9 },
        { city: 'Columbus', state: 'OH', population: 905700, area_km2: 577.9 },
        { city: 'Charlotte', state: 'NC', population: 885700, area_km2: 771.0 },
        { city: 'San Francisco', state: 'CA', population: 873900, area_km2: 121.4 },
        { city: 'Indianapolis', state: 'IN', population: 876400, area_km2: 953.0 },
        { city: 'Seattle', state: 'WA', population: 737000, area_km2: 217.0 },
        { city: 'Denver', state: 'CO', population: 715500, area_km2: 401.3 },
        { city: 'Washington', state: 'DC', population: 689500, area_km2: 177.0 },
        { city: 'Boston', state: 'MA', population: 675600, area_km2: 232.1 },
        { city: 'El Paso', state: 'TX', population: 678800, area_km2: 663.7 },
        { city: 'Nashville', state: 'TN', population: 689400, area_km2: 1362.2 },
        { city: 'Detroit', state: 'MI', population: 639100, area_km2: 370.0 },
        { city: 'Oklahoma City', state: 'OK', population: 681100, area_km2: 1608.8 }
    ];
}
```

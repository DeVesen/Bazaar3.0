# Angular Select Component — Customgroup

## Customgroup

Customize group headers with custom rendering using the group template.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { SelectItemGroup } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="groupedCities" [(ngModel)]="selectedCity" place …(lange Zeile gekürzt)
                <ng-template let-group #group>
                    <div class="flex items-center gap-2">
                        <span>{{ countryFlags[group.value] }}</span>
                        <span>{{ group.label }}</span>
                    </div>
                </ng-template>
            </p-select>
        </div>
    `,
    standalone: true,
    imports: [SelectModule, FormsModule]
})
export class SelectCustomGroupDemo {
    groupedCities: SelectItemGroup[] = [
        {
            label: 'Germany',
            value: 'DE',
            items: [
                { label: 'Berlin', value: 'Berlin' },
                { label: 'Frankfurt', value: 'Frankfurt' },
                { label: 'Hamburg', value: 'Hamburg' },
                { label: 'Munich', value: 'Munich' }
            ]
        },
        {
            label: 'USA',
            value: 'US',
            items: [
                { label: 'Chicago', value: 'Chicago' },
                { label: 'Los Angeles', value: 'Los Angeles' },
                { label: 'New York', value: 'New York' },
                { label: 'San Francisco', value: 'San Francisco' }
            ]
        },
        {
            label: 'Japan',
            value: 'JP',
            items: [
                { label: 'Kyoto', value: 'Kyoto' },
                { label: 'Osaka', value: 'Osaka' },
                { label: 'Tokyo', value: 'Tokyo' },
                { label: 'Yokohama', value: 'Yokohama' }
            ]
        }
    ];

    countryFlags: Record<string, string> = {
        DE: '🇩🇪',
        US: '🇺🇸',
        JP: '🇯🇵'
    };

    selectedCity: string | undefined;
}
```

# Angular Listbox Component — Customgroup

## Customgroup

Use the group template to customize group headers with custom content like flags.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';
import { SelectItemGroup } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-listbox
                [options]="groupedCities"
                [group]="true"
                [(ngModel)]="selectedCity"
                optionLabel="label"
                optionValue="value"
                class="w-full md:w-56"
                scrollHeight="250px"
                [pt]="{ list: { class: 'p-0!' }, optionGroup: { class: 'border-b border-surface rounded-none' } }"
            >
                <ng-template let-group #group>
                    <div class="flex items-center gap-2">
                        <span>{{ countryFlags[group.value] }}</span>
                        <span>{{ group.label }}</span>
                    </div>
                </ng-template>
            </p-listbox>
        </div>
    `,
    standalone: true,
    imports: [ListboxModule, FormsModule]
})
export class ListboxCustomGroupDemo {
    groupedCities!: SelectItemGroup[];

    selectedCity!: string;

    countryFlags: Record<string, string> = {
        de: '🇩🇪',
        us: '🇺🇸',
        jp: '🇯🇵'
    };

    constructor() {
        this.groupedCities = [
            {
                label: 'Germany',
                value: 'de',
                items: [
                    { label: 'Berlin', value: 'Berlin' },
                    { label: 'Frankfurt', value: 'Frankfurt' },
                    { label: 'Hamburg', value: 'Hamburg' },
                    { label: 'Munich', value: 'Munich' }
                ]
            },
            {
                label: 'USA',
                value: 'us',
                items: [
                    { label: 'Chicago', value: 'Chicago' },
                    { label: 'Los Angeles', value: 'Los Angeles' },
                    { label: 'New York', value: 'New York' },
                    { label: 'San Francisco', value: 'San Francisco' }
                ]
            },
            {
                label: 'Japan',
                value: 'jp',
                items: [
                    { label: 'Kyoto', value: 'Kyoto' },
                    { label: 'Osaka', value: 'Osaka' },
                    { label: 'Tokyo', value: 'Tokyo' },
                    { label: 'Yokohama', value: 'Yokohama' }
                ]
            }
        ];
    }
}
```

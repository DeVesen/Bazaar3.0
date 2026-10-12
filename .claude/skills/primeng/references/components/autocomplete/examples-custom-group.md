# Angular AutoComplete Component — Custom-group

## Custom-group

Customize group headers with the group template.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { LabelModule } from 'primeng/label';
import { SelectItemGroup } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-autocomplete
                [(ngModel)]="selectedCity"
                [group]="true"
                [suggestions]="filteredGroups"
                (completeMethod)="search($event)"
                optionLabel="label"
                optionGroupLabel="label"
                optionGroupChildren="items"
                placeholder="Search a city..."
                inputStyleClass="w-full md:w-56"
                scrollHeight="18rem"
                [pt]="{ optionGroup: 'border-b border-surface' }"
            >
                <ng-template let-group #group>
                    <div class="flex items-center gap-2">
                        <span>{{ countryFlags[group.value] }}</span>
                        <span>{{ group.label }}</span>
                    </div>
                </ng-template>
            </p-autocomplete>
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, LabelModule, FormsModule]
})
export class AutoCompleteCustomGroupDemo {
    selectedCity: any;

    filteredGroups: SelectItemGroup[] = [];

    countryFlags: Record<string, string> = {
        de: '🇩🇪',
        us: '🇺🇸',
        jp: '🇯🇵'
    };

    groupedCities: SelectItemGroup[] = [
        {
            label: 'Germany',
            value: 'de',
            items: [
                { label: 'Berlin', value: 'Berlin' },
                { label: 'Frankfurt', value: 'Frankfurt' },
                { label: 'Hamburg', value: 'Hamburg' }
            ]
        },
        {
            label: 'USA',
            value: 'us',
            items: [
                { label: 'Chicago', value: 'Chicago' },
                { label: 'Los Angeles', value: 'Los Angeles' },
                { label: 'New York', value: 'New York' }
            ]
        },
        {
            label: 'Japan',
            value: 'jp',
            items: [
                { label: 'Kyoto', value: 'Kyoto' },
                { label: 'Osaka', value: 'Osaka' },
                { label: 'Tokyo', value: 'Tokyo' }
            ]
        }
    ];

    search(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();
        const filtered: SelectItemGroup[] = [];

        for (const group of this.groupedCities) {
            const filteredItems = query ? group.items.filter((item) => item.label.toLowerCase().includes(query)) : group.items;

            if (filteredItems.length) {
                filtered.push({ ...group, items: filteredItems });
            }
        }

        this.filteredGroups = filtered;
    }
}
```

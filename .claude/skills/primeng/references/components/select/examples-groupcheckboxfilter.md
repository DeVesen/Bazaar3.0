# Angular Select Component — Groupcheckboxfilter

## Groupcheckboxfilter

Combine grouped options, checkbox selection, and a filter to create a rich multi-select experience.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { SelectItemGroup } from 'primeng/api';
import { Tag } from '@primeicons/angular/tag';

@Component({
    template: `
        <div class="flex justify-center">
            <p-select
                [options]="labelGroups"
                [(ngModel)]="selected"
                [multiple]="true"
                [group]="true"
                [filter]="true"
                filterBy="label"
                filterPlaceholder="Search..."
                optionLabel="label"
                optionValue="value"
                placeholder="Select labels"
                class="w-full md:w-64 border-0! bg-transparent! shadow-none!"
                [pt]="{ dropdown: { class: 'hidden!' } }"
            >
                <ng-template #header>
                    <div class="flex items-center gap-1 px-3 pt-2">
                        <button pButton variant="text" size="small" (click)="selectAll()">Select All</button>
                        <button pButton variant="text" size="small" severity="secondary" (click)="selected = []">Clear</button>
                    </div>
                </ng-template>
                <ng-template #selectedItem>
                    <span class="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs rounded-full py-1 px-3">
                        <svg data-p-icon="tag" />
                        <span class="font-semibold">{{ getTriggerLabel() }}</span>
                    </span>
                </ng-template>
                <ng-template let-group #group>
                    <span class="text-xs font-semibold text-surface-500 uppercase tracking-wide">{{ group.label }}</span>
                </ng-template>
                <ng-template let-item #item>
                    <div class="flex items-center gap-2">
                        <p-checkbox [ngModel]="isItemSelected(item)" [binary]="true" [tabindex]="-1" [readonly]="true" />
                        <span class="truncate">{{ item.label }}</span>
                    </div>
                </ng-template>
            </p-select>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, SelectModule, ButtonModule, FormsModule, Tag]
})
export class SelectGroupCheckboxFilterDemo {
    labelGroups: SelectItemGroup[] = [
        {
            label: 'Critical',
            value: 'critical',
            items: [
                { label: 'Security', value: 'security' },
                { label: 'Performance', value: 'performance' }
            ]
        },
        {
            label: 'Optional',
            value: 'optional',
            items: [
                { label: 'Feature', value: 'feature' },
                { label: 'Other', value: 'other' }
            ]
        }
    ];

    selected: string[] = ['security'];

    get allItems() {
        return this.labelGroups.flatMap((g) => g.items);
    }

    getTriggerLabel(): string {
        if (this.selected.length === 0) return '';

        const first = this.allItems.find((i) => i.value === this.selected[0])?.label ?? this.selected[0];

        return this.selected.length > 1 ? `${first} +${this.selected.length - 1}` : first;
    }

    isItemSelected(item: { value: string }): boolean {
        return this.selected.includes(item.value);
    }

    selectAll() {
        this.selected = this.allItems.map((i) => i.value);
    }
}
```

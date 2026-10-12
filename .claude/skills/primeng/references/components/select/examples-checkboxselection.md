# Angular Select Component — Checkboxselection

## Checkboxselection

Multiple selection with checkboxes using multiple and custom #item and #header templates.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';

interface City {
    name: string;
    code: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="cities" [(ngModel)]="selectedCities" [multiple]="true" optionLabel="name" optionValue="code" [showClear]="true" placeholder="Select Cities" class="w-full md:w-56">
                <ng-template #header let-headerClass="class">
                    <div [class]="headerClass">
                        <p-checkbox [ngModel]="allSelected" [binary]="true" [indeterminate]="indeterminate" (ngModelChange)="onToggleAll($event)" label="Select All"/>
                    </div>
                </ng-template>
                <ng-template #selectedItem>
                    <span>{{ getLabel() }}</span>
                </ng-template>
                <ng-template let-city #item>
                    <div class="flex items-center gap-2">
                        <p-checkbox [ngModel]="isItemSelected(city)" [binary]="true" [tabindex]="-1" [readonly]="true" />
                        <span>{{ city.name }}</span>
                    </div>
                </ng-template>
            </p-select>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, SelectModule, FormsModule]
})
export class SelectCheckboxSelectionDemo {
    cities: City[] = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

    selectedCities: string[] = [];

    getLabel(): string {
        if (this.selectedCities.length === 0) return '';

        const first = this.cities.find((c) => c.code === this.selectedCities[0])?.name ?? this.selectedCities[0];

        return this.selectedCities.length > 1 ? `${first} (+${this.selectedCities.length - 1} more)` : first;
    }

    get allSelected(): boolean {
        return this.selectedCities.length === this.cities.length;
    }

    get indeterminate(): boolean {
        return this.selectedCities.length > 0 && !this.allSelected;
    }

    isItemSelected(city: City): boolean {
        return this.selectedCities.includes(city.code);
    }

    onToggleAll(checked: boolean) {
        this.selectedCities = checked ? this.cities.map((c) => c.code) : [];
    }
}
```

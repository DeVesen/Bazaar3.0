# Angular Select Component — Multiple

## Multiple

When multiple is enabled, multiple items can be selected. Use checkmark to display a check indicator and a custom #selectedItem template for the label.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

interface Topping {
    label: string;
    value: string;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-select [options]="toppings" [(ngModel)]="selected" [multiple]="true" [checkmark]="true" optionLabel="label" optionValue="value" [showClear]="true" placeholder="Select Toppings" class="w-full md:w-56">
                <ng-template #selectedItem>
                    <span>{{ getLabel() }}</span>
                </ng-template>
            </p-select>
        </div>
    `,
    standalone: true,
    imports: [SelectModule, FormsModule]
})
export class SelectMultipleDemo {
    toppings: Topping[] = [
        { label: 'Pepperoni', value: 'pepperoni' },
        { label: 'Mushrooms', value: 'mushrooms' },
        { label: 'Onions', value: 'onions' },
        { label: 'Black Olives', value: 'olives' },
        { label: 'Green Peppers', value: 'peppers' },
        { label: 'Mozzarella', value: 'mozzarella' },
        { label: 'Basil', value: 'basil' },
        { label: 'Tomatoes', value: 'tomatoes' }
    ];

    selected: string[] = [];

    getLabel(): string {
        if (this.selected.length === 0) return '';

        const first = this.toppings.find((t) => t.value === this.selected[0])?.label ?? this.selected[0];

        return this.selected.length > 1 ? `${first} (+${this.selected.length - 1} more)` : first;
    }
}
```

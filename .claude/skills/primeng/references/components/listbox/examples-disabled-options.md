# Angular Listbox Component — Disabled Options

## Disabled Options

Use optionDisabled to disable specific items by field name while keeping the listbox itself interactive.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';

interface City {
    name: string;
    code: string;
    disabled?: boolean;
}

@Component({
    template: `
        <div class="flex justify-center">
            <p-listbox [options]="cities" [(ngModel)]="selectedCity" optionLabel="name" optionDisabled="disabled" class="w-full md:w-56" />
        </div>
    `,
    standalone: true,
    imports: [ListboxModule, FormsModule]
})
export class ListboxOptionDisabledDemo implements OnInit {
    cities!: City[];

    selectedCity!: City;

    ngOnInit() {
        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN', disabled: true },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS', disabled: true }
        ];
    }
}
```

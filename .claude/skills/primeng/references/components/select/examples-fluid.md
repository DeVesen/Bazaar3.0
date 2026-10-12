# Angular Select Component — Fluid

## Fluid

The fluid prop makes the component take up the full width of its container when set to true.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

interface City {
    name: string;
    code: string;
}

@Component({
    template: `
        <p-select [options]="cities" [(ngModel)]="selectedCity" optionLabel="name" placeholder="Select a City" fluid />
    `,
    standalone: true,
    imports: [SelectModule, FormsModule]
})
export class SelectFluidDemo implements OnInit {
    cities: City[];

    selectedCity: City | undefined;

    ngOnInit() {
        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' }
        ];
    }
}
```

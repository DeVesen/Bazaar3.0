# Angular InputGroup Component — Select

## Select

A Select component can be used within an InputGroup alongside other add-ons and inputs.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MapMarker } from '@primeicons/angular/map-marker';

interface City {
    label: string;
    value: string;
}

@Component({
    template: `
        <div class="space-y-4 max-w-md mx-auto">
            <p-inputgroup>
                <p-inputgroup-addon>
                    <svg data-p-icon="map-marker" />
                </p-inputgroup-addon>
                <p-select [(ngModel)]="city1" [options]="cities" optionLabel="label" optionValue="value" placeholder="Select a City" class="flex-1" />
            </p-inputgroup>
            <p-inputgroup>
                <p-inputgroup-addon>www</p-inputgroup-addon>
                <input pInputText [(ngModel)]="website" placeholder="Website" class="border-r-0!" />
                <p-select [(ngModel)]="city2" [options]="cities" optionLabel="label" optionValue="value" placeholder="Select a City" class="flex-1" />
            </p-inputgroup>
        </div>
    `,
    standalone: true,
    imports: [SelectModule, InputGroupModule, InputGroupAddonModule, InputTextModule, FormsModule, MapMarker]
})
export class InputGroupSelectDemo {
    city1: string | undefined;

    city2: string | undefined;

    website: string | undefined;

    cities: City[] = [
        { label: 'New York', value: 'ny' },
        { label: 'Rome', value: 'rm' },
        { label: 'London', value: 'ldn' },
        { label: 'Istanbul', value: 'ist' },
        { label: 'Paris', value: 'prs' }
    ];
}
```

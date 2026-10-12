# Angular CascadeSelect Component — Invalid

## Invalid

The invalid state is applied using the ⁠invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <p-cascadeselect
                [(ngModel)]="selectedCity1"
                [invalid]="!selectedCity1"
                [options]="countries"
                optionLabel="cname"
                optionGroupLabel="name"
                [optionGroupChildren]="['states', 'cities']"
                class="w-full sm:w-56"
                placeholder="Select a City"
            />
            <p-cascadeselect
                [(ngModel)]="selectedCity2"
                [invalid]="!selectedCity2"
                [options]="countries"
                optionLabel="cname"
                optionGroupLabel="name"
                [optionGroupChildren]="['states', 'cities']"
                class="w-full sm:w-56"
                placeholder="Select a City"
                variant="filled"
            />
        </div>
    `,
    standalone: true,
    imports: [CascadeSelectModule, LabelModule, FormsModule]
})
export class CascadeSelectInvalidDemo implements OnInit {
    countries: any[] | undefined;

    selectedCity1: any;

    selectedCity2: any;

    ngOnInit() {
        this.countries = [
            {
                name: 'Australia',
                code: 'AU',
                states: [
                    {
                        name: 'New South Wales',
                        cities: [
                            { cname: 'Sydney', code: 'A-SY' },
                            { cname: 'Newcastle', code: 'A-NE' },
                            { cname: 'Wollongong', code: 'A-WO' }
                        ]
                    },
                    {
                        name: 'Queensland',
                        cities: [
                            { cname: 'Brisbane', code: 'A-BR' },
                            { cname: 'Townsville', code: 'A-TO' }
                        ]
                    }
                ]
            },
            {
                name: 'Canada',
                code: 'CA',
                states: [
                    {
                        name: 'Quebec',
                        cities: [
                            { cname: 'Montreal', code: 'C-MO' },
                            { cname: 'Quebec City', code: 'C-QU' }
                        ]
                    },
                    {
                        name: 'Ontario',
                        cities: [
                            { cname: 'Ottawa', code: 'C-OT' },
                            { cname: 'Toronto', code: 'C-TO' }
                        ]
                    }
                ]
            },
            {
                name: 'United States',
                code: 'US',
                states: [
                    {
                        name: 'California',
                        cities: [
                            { cname: 'Los Angeles', code: 'US-LA' },
                            { cname: 'San Diego', code: 'US-SD' },
                            { cname: 'San Francisco', code: 'US-SF' }
                        ]
                    },
                    {
                        name: 'Florida',
                        cities: [
                            { cname: 'Jacksonville', code: 'US-JA' },
                            { cname: 'Miami', code: 'US-MI' },
                            { cname: 'Tampa', code: 'US-TA' },
                            { cname: 'Orlando', code: 'US-OR' }
                        ]
                    },
                    {
                        name: 'Texas',
                        cities: [
                            { cname: 'Austin', code: 'US-AU' },
                            { cname: 'Dallas', code: 'US-DA' },
                            { cname: 'Houston', code: 'US-HO' }
                        ]
                    }
                ]
            }
        ];
    }
}
```

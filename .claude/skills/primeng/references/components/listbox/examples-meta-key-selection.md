# Angular Listbox Component — Meta Key Selection

## Meta Key Selection

Use metaKeySelection in multiple mode to require Ctrl / Cmd for additive selection.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';

interface City {
    name: string;
    code: string;
}

@Component({
    template: `
        <div class="space-y-3">
            <p class="text-sm text-muted-color text-center">Hold <kbd class="px- …(lange Zeile gekürzt)
            <div class="flex justify-center">
                <p-listbox [options]="cities" [(ngModel)]="selectedCities" optionLabel="name" [multiple]="true" [metaKeySelection]="true" class="w-full md:w-56" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [ListboxModule, FormsModule]
})
export class ListboxMetaKeySelectionDemo implements OnInit {
    cities!: City[];

    selectedCities!: City[];

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

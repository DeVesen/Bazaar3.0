# Angular Listbox Component — Dragdrop

## Dragdrop

Items can be reordered using drag and drop by enabling dragdrop property. Depends on &#64;angular/cdk package.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';

@Component({
    template: `
        <div class="flex justify-center">
            <p-listbox [options]="cities" [(ngModel)]="selectedCity" optionLabel="name" [dragdrop]="true" class="w-full md:w-56" />
        </div>
    `,
    standalone: true,
    imports: [ListboxModule, FormsModule]
})
export class ListboxDragDropDemo implements OnInit {
    cities!: any[];

    selectedCity!: any;

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

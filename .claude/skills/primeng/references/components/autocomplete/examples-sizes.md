# Angular AutoComplete Component — Sizes

## Sizes

AutoComplete provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <p-autocomplete [(ngModel)]="value1" [suggestions]="items" (completeMethod)="search($event)" size="small" placeholder="Small" scrollHeight="14rem" />
            <p-autocomplete [(ngModel)]="value2" [suggestions]="items" (completeMethod)="search($event)" placeholder="Normal" scrollHeight="14rem" />
            <p-autocomplete [(ngModel)]="value3" [suggestions]="items" (completeMethod)="search($event)" size="large" placeholder="Large" scrollHeight="14rem" />
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, FormsModule]
})
export class AutoCompleteSizesDemo {
    items: string[] = [];

    value1: any;

    value2: any;

    value3: any;

    search(event: AutoCompleteCompleteEvent) {
        this.items = [...Array(10).keys()].map((item) => event.query + '-' + item);
    }
}
```

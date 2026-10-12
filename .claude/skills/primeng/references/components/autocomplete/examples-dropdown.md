# Angular AutoComplete Component — Dropdown

## Dropdown

Enabling dropdown property displays a trigger button next to the input field. The dropdownMode property defines the behavior of the button, blank sends an empty query and current sends the current value of the input.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
    template: `
        <div class="flex justify-center">
            <p-autocomplete [(ngModel)]="value" [dropdown]="true" [suggestions]="items" (completeMethod)="search($event)" inputStyleClass="w-full md:w-56" scrollHeight="14rem" />
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, FormsModule]
})
export class AutoCompleteDropdownDemo {
    items: string[] | undefined;

    value: any;

    search(event: AutoCompleteCompleteEvent) {
        this.items = event.query ? [...Array(10).keys()].map((item) => event.query + '-' + item) : [...Array(10).keys()].map(String);
    }
}
```

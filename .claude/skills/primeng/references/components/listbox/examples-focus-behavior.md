# Angular Listbox Component — Focus Behavior

## Focus Behavior

Use autoOptionFocus to control initial focused option behavior, selectOnFocus to select options while navigating with focus, and focusOnHover to move focus with mouse hover when the component is focused.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';

interface City {
    name: string;
    code: string;
}

@Component({
    template: `
        <div class="space-y-4">
            <div class="flex flex-wrap gap-2 justify-center">
                <button pButton [severity]="autoOptionFocus ? 'primary' : 'secondary'" size="small" (click)="autoOptionFocus = !autoOptionFocus">autoOptionFocus: {{ autoOptionFocus }}</button>
                <button pButton [severity]="selectOnFocus ? 'primary' : 'secondary'" size="small" (click)="selectOnFocus = !selectOnFocus">selectOnFocus: {{ selectOnFocus }}</button>
                <button pButton [severity]="focusOnHover ? 'primary' : 'secondary'" size="small" (click)="focusOnHover = !focusOnHover">focusOnHover: {{ focusOnHover }}</button>
            </div>
            <div class="flex justify-center">
                <p-listbox [options]="cities" [(ngModel)]="selectedCity" optionL …(lange Zeile gekürzt)
            </div>
        </div>
    `,
    standalone: true,
    imports: [ListboxModule, ButtonModule, FormsModule]
})
export class ListboxFocusBehaviorDemo implements OnInit {
    cities!: City[];

    selectedCity!: string;

    autoOptionFocus: boolean = true;

    selectOnFocus: boolean = false;

    focusOnHover: boolean = true;

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

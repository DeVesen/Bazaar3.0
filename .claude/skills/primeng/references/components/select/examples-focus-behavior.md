# Angular Select Component — Focus Behavior

## Focus Behavior

Customize keyboard and mouse focus behavior with autoOptionFocus , selectOnFocus , and focusOnHover properties.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

interface City {
    name: string;
    code: string;
}

@Component({
    template: `
        <div class="space-y-4">
            <div class="flex flex-wrap gap-2 justify-center">
                <button pButton (click)="autoOptionFocus = !autoOptionFocus" [severity]="autoOptionFocus ? 'primary' : 'secondary'" size="small">autoOptionFocus: {{ autoOptionFocus }}</button>
                <button pButton (click)="selectOnFocus = !selectOnFocus" [severity]="selectOnFocus ? 'primary' : 'secondary'" size="small">selectOnFocus: {{ selectOnFocus }}</button>
                <button pButton (click)="focusOnHover = !focusOnHover" [severity]="focusOnHover ? 'primary' : 'secondary'" size="small">focusOnHover: {{ focusOnHover }}</button>
            </div>
            <div class="flex justify-center">
                <p-select
                    [options]="cities"
                    [(ngModel)]="selectedCity"
                    optionLabel="name"
                    optionValue="code"
                    [autoOptionFocus]="autoOptionFocus"
                    [selectOnFocus]="selectOnFocus"
                    [focusOnHover]="focusOnHover"
                    placeholder="Select a city"
                    class="w-full md:w-56"
                />
            </div>
        </div>
    `,
    standalone: true,
    imports: [SelectModule, ButtonModule, FormsModule]
})
export class SelectFocusBehaviorDemo {
    cities: City[] = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

    selectedCity: string | undefined;

    autoOptionFocus: boolean = true;

    selectOnFocus: boolean = false;

    focusOnHover: boolean = true;
}
```

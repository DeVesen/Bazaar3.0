# Angular AutoComplete Component — Focus-behavior

## Focus-behavior

Customize keyboard and mouse focus behavior with autoOptionFocus , selectOnFocus , and focusOnHover properties.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="space-y-4">
            <div class="flex flex-wrap gap-2 justify-center">
                <button pButton size="small" [severity]="autoOptionFocus ? 'primary' : 'secondary'" (click)="autoOptionFocus = !autoOptionFocus">autoOptionFocus: {{ autoOptionFocus }}</button>
                <button pButton size="small" [severity]="selectOnFocus ? 'primary' : 'secondary'" (click)="selectOnFocus = !selectOnFocus">selectOnFocus: {{ selectOnFocus }}</button>
                <button pButton size="small" [severity]="focusOnHover ? 'primary' : 'secondary'" (click)="focusOnHover = !focusOnHover">focusOnHover: {{ focusOnHover }}</button>
            </div>
            <div class="flex justify-center">
                <p-autocomplete
                    [(ngModel)]="value"
                    [suggestions]="items"
                    (completeMethod)="search($event)"
                    [autoOptionFocus]="autoOptionFocus"
                    [selectOnFocus]="selectOnFocus"
                    [focusOnHover]="focusOnHover"
                    placeholder="Search a city..."
                    inputStyleClass="w-full md:w-56"
                    scrollHeight="14rem"
                />
            </div>
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, ButtonModule, FormsModule]
})
export class AutoCompleteFocusBehaviorDemo {
    items: string[] = [];

    value: any;

    autoOptionFocus: boolean = true;

    selectOnFocus: boolean = false;

    focusOnHover: boolean = true;

    search(event: AutoCompleteCompleteEvent) {
        this.items = [...Array(10).keys()].map((item) => event.query + '-' + item);
    }
}
```

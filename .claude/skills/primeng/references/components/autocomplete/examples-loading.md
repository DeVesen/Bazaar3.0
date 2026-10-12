# Angular AutoComplete Component — Loading

## Loading

Compose a loading indicator alongside the autocomplete input using InputGroup .

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Spinner } from '@primeicons/angular/spinner';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="w-full md:w-56">
                <p-inputgroup>
                    <p-autocomplete [(ngModel)]="value" [suggestions]="items" (completeMethod)="search($event)" scrollHeight="14rem" />
                    <p-inputgroup-addon>
                        <svg data-p-icon="spinner" class="animate-spin" />
                    </p-inputgroup-addon>
                </p-inputgroup>
            </div>
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, InputGroupModule, InputGroupAddonModule, FormsModule, Spinner]
})
export class AutoCompleteLoadingDemo {
    items: string[] = [];

    value: any;

    search(event: AutoCompleteCompleteEvent) {
        this.items = [...Array(10).keys()].map((item) => event.query + '-' + item);
    }
}
```

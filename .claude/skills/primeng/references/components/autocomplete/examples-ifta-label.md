# Angular AutoComplete Component — Ifta-label

## Ifta-label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel>
                <p-autocomplete [(ngModel)]="value" [suggestions]="items" (completeMethod)="search($event)" inputId="ac" inputStyleClass="w-full md:w-56" scrollHeight="14rem" />
                <label for="ac">Identifier</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [AutoCompleteModule, IftaLabelModule, FormsModule]
})
export class AutoCompleteIftaLabelDemo {
    items: any[] | undefined;

    value: any;

    search(event: AutoCompleteCompleteEvent) {
        this.items = [...Array(10).keys()].map((item) => event.query + '-' + item);
    }
}
```

# Angular DatePicker Component — Multiple

## Multiple

In order to choose multiple dates, set selectionMode as multiple . In this mode, the value binding should be an array.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="dates" selectionMode="multiple" [readonlyInput]="true" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerMultipleDemo {
    dates: Date[] | undefined;
}
```

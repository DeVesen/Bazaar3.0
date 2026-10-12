# Angular DatePicker Component — Range

## Range

A range of dates can be selected by defining selectionMode as range , in this case the bound value would be an array with two values where first date is the start of the range and second date is the end.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="rangeDates" selectionMode="range" [readonlyInput]="true" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerRangeDemo {
    rangeDates: Date[] | undefined;
}
```

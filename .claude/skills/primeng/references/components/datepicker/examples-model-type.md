# Angular DatePicker Component — Model-type

## Model-type

The dataType property controls the data type of the value. When set to string it returns a string representation of the date, when set to date (default) it returns a Date object.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-wrap gap-4">
            <div class="flex-auto">
                <label pLabel for="datetype" class="text-sm font-bold block mb-2">Date Type Model</label>
                <p-datepicker inputId="datetype" [(ngModel)]="date1" fluid />
            </div>
            <div class="flex-auto">
                <label pLabel for="stringtype" class="text-sm font-bold block mb-2">String Type Model</label>
                <p-datepicker inputId="stringtype" [(ngModel)]="date2" dataType="string" fluid />
            </div>
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, LabelModule, FormsModule]
})
export class DatePickerModelTypeDemo {
    date1: Date | undefined;

    date2: string | undefined;
}
```

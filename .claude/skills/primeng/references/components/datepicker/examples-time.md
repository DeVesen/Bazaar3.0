# Angular DatePicker Component — Time

## Time

A time picker is displayed when showTime is enabled where 12/24 hour format is configured with hourFormat property. In case, only time needs to be selected, add timeOnly to hide the date section.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <p-fluid class="flex flex-wrap gap-4">
            <div class="flex-auto">
                <label pLabel for="calendar-12h" class="text-sm font-bold block mb-2"> 12h Format </label>
                <p-datepicker inputId="calendar-12h" [(ngModel)]="datetime12h" [showTime]="true" hourFormat="12" />
            </div>
            <div class="flex-auto">
                <label pLabel for="calendar-24h" class="text-sm font-bold block mb-2"> 24h Format </label>
                <p-datepicker inputId="calendar-24h" [(ngModel)]="datetime24h" [showTime]="true" hourFormat="24" />
            </div>
            <div class="flex-auto">
                <label pLabel for="calendar-timeonly" class="text-sm font-bold block mb-2"> Time Only </label>
                <p-datepicker inputId="calendar-timeonly" [(ngModel)]="time" [timeOnly]="true" />
            </div>
        </p-fluid>
    `,
    standalone: true,
    imports: [DatePickerModule, FluidModule, LabelModule, FormsModule]
})
export class DatePickerTimeDemo {
    datetime12h: Date | undefined;

    datetime24h: Date | undefined;

    time: Date | undefined;
}
```

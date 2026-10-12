# Angular DatePicker Component — Inline

## Inline

DatePicker is displayed as a popup by default, add inline property to display the calendar inline.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker class="max-w-full" [(ngModel)]="date" [inline]="true" [showWeek]="true" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerInlineDemo {
    date: Date | undefined;
}
```

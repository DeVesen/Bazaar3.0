# Angular DatePicker Component — Clear Icon

## Clear Icon

When showClear is enabled, a clear trigger is added to reset the DatePicker.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" [showClear]="true" inputStyleClass="w-56" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerClearIconDemo {
    date: Date | undefined;
}
```

# Angular DatePicker Component — Touchui

## Touchui

When touchUI is enabled, overlay is displayed as optimized for touch devices.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" [touchUI]="true" [readonlyInput]="true" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerTouchUiDemo {
    date: Date | undefined;
}
```

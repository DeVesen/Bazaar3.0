# Angular DatePicker Component — Fluid

## Fluid

The fluid prop makes the component take up the full width of its container when set to true.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <p-datepicker [(ngModel)]="date" fluid />
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerFluidDemo {
    date: Date | undefined;
}
```

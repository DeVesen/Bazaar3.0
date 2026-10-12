# Angular RadioButton Component — Disabled

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
    template: `
        <div class="flex justify-center gap-2">
            <p-radiobutton [(ngModel)]="value" [value]="1" [disabled]="true" />
            <p-radiobutton [(ngModel)]="value" [value]="2" [disabled]="true" />
        </div>
    `,
    standalone: true,
    imports: [RadioButtonModule, FormsModule]
})
export class RadioButtonDisabledDemo {
    value: number = 2;
}
```

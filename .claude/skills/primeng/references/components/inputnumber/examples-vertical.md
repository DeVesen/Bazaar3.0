# Angular InputNumber Component — Vertical

## Vertical

Buttons can also placed vertically by setting buttonLayout as vertical .

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputnumber [(ngModel)]="value1" [showButtons]="true" buttonLayout="vertical" spinnerMode="vertical" inputId="vertical" [inputStyle]="{ width: '3rem' }">
                <ng-template #incrementbuttonicon>
                    <span class="pi pi-plus"></span>
                </ng-template>
                <ng-template #decrementbuttonicon>
                    <span class="pi pi-minus"></span>
                </ng-template>
            </p-inputnumber>
        </div>
    `,
    standalone: true,
    imports: [InputNumberModule, FormsModule]
})
export class InputNumberVerticalDemo {
    value1: number = 50;
}
```

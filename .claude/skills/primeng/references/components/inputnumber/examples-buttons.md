# Angular InputNumber Component — Buttons

## Buttons

Spinner buttons are enabled using the showButtons property and layout is defined with the buttonLayout .

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { FluidModule } from 'primeng/fluid';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <p-fluid class="flex flex-wrap gap-4">
            <div class="flex-auto">
                <label pLabel class="font-bold! mb-2 block" for="stacked">Stacked</label>
                <p-inputnumber [(ngModel)]="value1" [showButtons]="true" inputId="stacked" mode="currency" currency="USD" />
            </div>
            <div class="flex-auto">
                <label pLabel class="font-bold! mb-2 block" for="minmax-buttons">Min-Max Boundaries</label>
                <p-inputnumber [(ngModel)]="value2" mode="decimal" [showButtons]="true" inputId="minmax-buttons" [min]="0" [max]="100" />
            </div>
            <div class="flex-auto">
                <label pLabel class="font-bold! mb-2 block" for="horizontal">Horizontal with Step</label>
                <p-inputnumber [(ngModel)]="value3" [showButtons]="true" buttonLayout="horizontal" inputId="horizontal" spinnerMode="horizontal" [step]="0.25" mode="currency" currency="EUR">
                    <ng-template #incrementbuttonicon>
                        <span class="pi pi-plus"></span>
                    </ng-template>
                    <ng-template #decrementbuttonicon>
                        <span class="pi pi-minus"></span>
                    </ng-template>
                </p-inputnumber>
            </div>
        </p-fluid>
    `,
    standalone: true,
    imports: [InputNumberModule, FluidModule, LabelModule, FormsModule]
})
export class InputNumberButtonsDemo {
    value1: number = 20;

    value2: number = 10.5;

    value3: number = 25;
}
```

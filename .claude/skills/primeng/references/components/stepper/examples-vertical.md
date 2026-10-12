# Angular Stepper Component — Vertical

## Vertical

Vertical layout requires StepItem as a wrapper of Step and StepPanel components.

```typescript
import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <p-stepper [value]="1">
            <p-step-item [value]="1">
                <p-step>Header I</p-step>
                <p-step-panel>
                    <ng-template #content let-activateCallback="activateCallback">
                        <div class="flex flex-col h-48">
                            <div class="border-2 border-dashed border-surface-20 …(lange Zeile gekürzt)
                        </div>
                        <div class="py-5">
                            <button type="button" pButton (click)="activateCallback(2)">Next</button>
                        </div>
                    </ng-template>
                </p-step-panel>
            </p-step-item>
            <p-step-item [value]="2">
                <p-step>Header II</p-step>
                <p-step-panel>
                    <ng-template #content let-activateCallback="activateCallback">
                        <div class="flex flex-col h-48">
                            <div class="border-2 border-dashed border-surface-20 …(lange Zeile gekürzt)
                        </div>
                        <div class="flex py-5 gap-2">
                            <button type="button" pButton severity="secondary" (click)="activateCallback(1)">Back</button>
                            <button type="button" pButton (click)="activateCallback(3)">Next</button>
                        </div>
                    </ng-template>
                </p-step-panel>
            </p-step-item>
            <p-step-item [value]="3">
                <p-step>Header III</p-step>
                <p-step-panel>
                    <ng-template #content let-activateCallback="activateCallback">
                        <div class="flex flex-col h-48">
                            <div class="border-2 border-dashed border-surface-20 …(lange Zeile gekürzt)
                        </div>
                        <div class="py-5">
                            <button type="button" pButton severity="secondary" (click)="activateCallback(2)">Back</button>
                        </div>
                    </ng-template>
                </p-step-panel>
            </p-step-item>
        </p-stepper>
    `,
    standalone: true,
    imports: [StepperModule, ButtonModule]
})
export class StepperVerticalDemo {}
```

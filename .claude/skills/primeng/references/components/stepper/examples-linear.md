# Angular Stepper Component — Linear

## Linear

When linear property is set to true, current step must be completed in order to move to the next step.

```typescript
import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <p-stepper [value]="1" class="basis-200 min-w-0" [linear]="true">
                <p-step-list>
                    <p-step [value]="1">Header I</p-step>
                    <p-step [value]="2">Header II</p-step>
                    <p-step [value]="3">Header III</p-step>
                </p-step-list>
                <p-step-panels>
                    <p-step-panel [value]="1">
                        <ng-template #content let-activateCallback="activateCallback">
                            <div class="flex flex-col h-48">
                                <div class="border-2 border-dashed border-surfac …(lange Zeile gekürzt)
                            </div>
                            <div class="flex pt-5 justify-end">
                                <button type="button" pButton (click)="activateCallback(2)">Next <i class="pi pi-arrow-right"></i></button>
                            </div>
                        </ng-template>
                    </p-step-panel>
                    <p-step-panel [value]="2">
                        <ng-template #content let-activateCallback="activateCallback">
                            <div class="flex flex-col h-48">
                                <div class="border-2 border-dashed border-surfac …(lange Zeile gekürzt)
                            </div>
                            <div class="flex pt-5 justify-between">
                                <button type="button" pButton severity="secondary" (click)="activateCallback(1)"><i class="pi pi-arrow-left"></i> Back</button>
                                <button type="button" pButton (click)="activateCallback(3)">Next <i class="pi pi-arrow-right"></i></button>
                            </div>
                        </ng-template>
                    </p-step-panel>
                    <p-step-panel [value]="3">
                        <ng-template #content let-activateCallback="activateCallback">
                            <div class="flex flex-col h-48">
                                <div class="border-2 border-dashed border-surfac …(lange Zeile gekürzt)
                            </div>
                            <div class="flex pt-5 justify-start">
                                <button type="button" pButton severity="secondary" (click)="activateCallback(2)"><i class="pi pi-arrow-left"></i> Back</button>
                            </div>
                        </ng-template>
                    </p-step-panel>
                </p-step-panels>
            </p-stepper>
        </div>
    `,
    standalone: true,
    imports: [StepperModule, ButtonModule]
})
export class StepperLinearDemo {}
```

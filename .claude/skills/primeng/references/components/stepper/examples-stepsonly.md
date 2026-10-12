# Angular Stepper Component — Stepsonly

## Stepsonly

Use Stepper with a StepList only for custom requirements where a progress indicator is needed.

```typescript
import { Component } from '@angular/core';
import { StepperModule } from 'primeng/stepper';

@Component({
    template: `
        <div class="flex justify-center">
            <p-stepper [value]="1" class="basis-200 min-w-0">
                <p-step-list>
                    <p-step [value]="1">Design</p-step>
                    <p-step [value]="2">Development</p-step>
                    <p-step [value]="3">QA</p-step>
                </p-step-list>
            </p-stepper>
        </div>
    `,
    standalone: true,
    imports: [StepperModule]
})
export class StepperStepsonlyDemo {}
```

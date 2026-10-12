# Angular Knob Component — Beispiele

## Basic

Knob is an input component and used with the standard ngModel directive.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    template: `
        <div class="flex justify-center">
            <p-knob [(ngModel)]="value" />
        </div>
    `,
    standalone: true,
    imports: [KnobModule, FormsModule]
})
export class KnobBasicDemo {
    value: number = 50;
}
```

## Color

Colors are customized with the textColor , rangeColor and valueColor properties.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    template: `
        <div class="flex justify-center">
            <p-knob [(ngModel)]="value" valueColor="PeachPuff" rangeColor="MediumTurquoise" />
        </div>
    `,
    standalone: true,
    imports: [KnobModule, FormsModule]
})
export class KnobColorDemo {
    value: number = 50;
}
```

## Disabled

When disabled is present, a visual hint is applied to indicate that the Knob cannot be interacted with.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    template: `
        <div class="flex justify-center">
            <p-knob [(ngModel)]="value" [disabled]="true" />
        </div>
    `,
    standalone: true,
    imports: [KnobModule, FormsModule]
})
export class KnobDisabledDemo {
    value: number = 75;
}
```

## Min/Max

Boundaries are configured with the min and max properties whose defaults are 0 and 100 respectively.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    template: `
        <div class="flex justify-center">
            <p-knob [(ngModel)]="value" [min]="-50" [max]="50" />
        </div>
    `,
    standalone: true,
    imports: [KnobModule, FormsModule]
})
export class KnobMinMaxDemo {
    value: number = 10;
}
```

## Reactive

Knob can be controlled with custom controls as well.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';
import { ButtonModule } from 'primeng/button';
import { Plus } from '@primeicons/angular/plus';
import { Minus } from '@primeicons/angular/minus';

@Component({
    template: `
        <div class="flex flex-col items-center gap-2">
            <p-knob [(ngModel)]="value" [size]="150" [readonly]="true" />
            <div class="flex gap-2">
                <button pButton [disabled]="value >= 100" (click)="value = value + 1" iconOnly><svg data-p-icon="plus"></svg></button>
                <button pButton [disabled]="value <= 0" (click)="value = value - 1" iconOnly><svg data-p-icon="minus"></svg></button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [KnobModule, ButtonModule, FormsModule, Plus, Minus]
})
export class KnobReactiveDemo {
    value: number = 0;
}
```

## Reactive Forms

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form [formGroup]="exampleForm" (ngSubmit)="onSubmit()" class="flex flex-col items-center gap-4">
                <div class="flex flex-col items-center gap-1">
                    <p-knob formControlName="value" [invalid]="isInvalid('value')" />
                    @if (isInvalid('value')) {
                        <p-message severity="error" size="small" variant="simple">{{ getErrorMessage('value') }}</p-message>
                    }
                </div>
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [KnobModule, MessageModule, ToastModule, ButtonModule, ReactiveFormsModule]
})
export class KnobReactiveFormsDemo {
    private fb = inject(FormBuilder);

    messageService = inject(MessageService);

    items: any[] | undefined;

    exampleForm: FormGroup | undefined;

    formSubmitted: boolean = false;

    constructor() {
        this.exampleForm = this.fb.group({
            value: [15, [Validators.min(25), Validators.max(75)]]
        });
    }

    onSubmit() {
        this.formSubmitted = true;

        if (this.exampleForm.valid) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form is submitted', life: 3000 });
        }
    }

    getControl(controlName: string): AbstractControl | null {
        return this.exampleForm?.get(controlName) ?? null;
    }

    getErrorMessage(controlName: string): string | null {
        const control = this.getControl(controlName);

        if (!control || !control.errors) return null;

        if (control.errors['min']) {
            return 'Value must be greater than 15.';
        }

        if (control.errors['max']) {
            return 'Must be less than 75.';
        }
    }

    isInvalid(controlName: string) {
        const control = this.getControl(controlName);

        return control?.invalid && (control.dirty || this.formSubmitted);
    }
}
```

## ReadOnly

When readonly present, value cannot be edited.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    template: `
        <div class="flex justify-center">
            <p-knob [(ngModel)]="value" [readonly]="true" />
        </div>
    `,
    standalone: true,
    imports: [KnobModule, FormsModule]
})
export class KnobReadonlyDemo {
    value: number = 50;
}
```

## Size

Diameter of the knob is defined in pixels using the size property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    template: `
        <div class="flex justify-center">
            <p-knob [(ngModel)]="value" [size]="200" />
        </div>
    `,
    standalone: true,
    imports: [KnobModule, FormsModule]
})
export class KnobSizeDemo {
    value: number = 60;
}
```

## Step

Size of each movement is defined with the step property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    template: `
        <div class="flex justify-center">
            <p-knob [(ngModel)]="value" [step]="10" />
        </div>
    `,
    standalone: true,
    imports: [KnobModule, FormsModule]
})
export class KnobStepDemo {
    value: number = 50;
}
```

## Stroke

The border size is specified with the strokeWidth property as a number in pixels.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    template: `
        <div class="flex justify-center">
            <p-knob [(ngModel)]="value" [strokeWidth]="5" />
        </div>
    `,
    standalone: true,
    imports: [KnobModule, FormsModule]
})
export class KnobStrokeDemo {
    value: number = 40;
}
```

## Template

Label is a string template that can be customized with the valueTemplate property having 60 as the placeholder .

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';

@Component({
    template: `
        <div class="flex justify-center">
            <p-knob [(ngModel)]="value" valueTemplate="{value}%" />
        </div>
    `,
    standalone: true,
    imports: [KnobModule, FormsModule]
})
export class KnobTemplateDemo {
    value: number = 60;
}
```

# Angular Knob Component — Formulare (Signal / Reactive / Template-driven)

## Signal-forms

```typescript
import { Component, inject, signal } from '@angular/core';
import { form, FormField, submit, validate } from '@angular/forms/signals';
import { KnobModule } from 'primeng/knob';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form novalidate (submit)="onSubmit($event)" class="flex flex-col gap-4 items-center">
                <div class="flex flex-col gap-1 items-center">
                    <p-knob [formField]="exampleForm.value" />
                    @if (exampleForm.value().touched() && exampleForm.value().invalid()) {
                        @for (error of exampleForm.value().errors(); track error.kind) {
                            <p-message severity="error" size="small" variant="simple">{{ error.message }}</p-message>
                        }
                    }
                </div>
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [KnobModule, MessageModule, ToastModule, ButtonModule, FormField]
})
export class KnobSignalFormsDemo {
    messageService = inject(MessageService);

    model = signal({ value: 15 });

    exampleForm = form(this.model, (path) => {
        validate(path.value, ({ value, state }) => {
            if (!state.touched()) return null;

            const v = value();

            if (v == null) return null;

            if (v < 25) return { kind: 'min', message: 'Value must be at least 25.' };

            if (v > 75) return { kind: 'max', message: 'Value must be at most 75.' };

            return null;
        });
    });

    onSubmit(event: Event) {
        event.preventDefault();
        submit(this.exampleForm, async () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form is submitted', life: 3000 });
        });
    }
}
```

## Templatedrivenforms

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KnobModule } from 'primeng/knob';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form #exampleForm="ngForm" (ngSubmit)="onSubmit(exampleForm)" class="flex flex-col items-center gap-4">
                <div class="flex flex-col items-center gap-1">
                    <p-knob #model="ngModel" [(ngModel)]="value" [invalid]="isInvalid(model)" name="knob" />
                    @if (isInvalid(model)) {
                        <p-message severity="error" size="small" variant="simple">{{ getErrorMessage(model) }}</p-message>
                    }
                </div>
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [KnobModule, MessageModule, ToastModule, ButtonModule, FormsModule]
})
export class KnobTemplateDrivenFormsDemo {
    messageService = inject(MessageService);

    value: number = 15;

    formSubmitted: boolean = false;

    onSubmit(form: NgForm) {
        this.formSubmitted = true;

        if (!this.isInvalid(form.controls['knob'])) {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Form is submitted',
                life: 3000
            });

            this.formSubmitted = false;
        }
    }

    getErrorMessage(control: any): string | null {
        const value = control?.value;

        return value < 25 ? 'Value must be greater than 25.' : value > 75 ? 'Must be less than 75.' : null;
    }

    isInvalid(control: any): boolean {
        if (!control) return false;

        const value = control.value;

        const hasError = value < 25 || value > 75;

        return hasError && (this.formSubmitted || control.dirty);
    }
}
```

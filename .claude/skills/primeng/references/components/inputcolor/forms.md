# Angular InputColor Component — Formulare (Signal / Reactive / Template-driven)

## Reactiveforms

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { InputColorModule } from 'primeng/inputcolor';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form [formGroup]="exampleForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
                <div class="flex flex-col items-center gap-2">
                    <p-inputcolor formControlName="color" class="w-80 space-y-3">
                        <p-inputcolor-area>
                            <p-inputcolor-area-background />
                            <p-inputcolor-area-handle />
                        </p-inputcolor-area>
                        <div class="flex items-center gap-2">
                            <div class="flex-1 space-y-1 mr-1">
                                <p-inputcolor-slider>
                                    <p-inputcolor-transparency-grid />
                                    <p-inputcolor-slider-track />
                                    <p-inputcolor-slider-handle />
                                </p-inputcolor-slider>
                            </div>
                            <p-inputcolor-swatch class="shrink-0">
                                <p-inputcolor-transparency-grid />
                                <p-inputcolor-swatch-background />
                            </p-inputcolor-swatch>
                        </div>
                        <input pInputColorInput [fluid]="true" channel="hex" />
                    </p-inputcolor>
                    @if (isInvalid('color')) {
                        <p-message severity="error" size="small" variant="simple">Color is required.</p-message>
                    }
                </div>
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, ToastModule, InputColorModule, ButtonModule, ReactiveFormsModule]
})
export class InputColorReactiveFormsDemo {
    private fb = inject(FormBuilder);

    messageService = inject(MessageService);

    exampleForm: FormGroup;

    formSubmitted: boolean = false;

    constructor() {
        this.exampleForm = this.fb.group({
            color: ['', Validators.required]
        });
    }

    onSubmit() {
        this.formSubmitted = true;

        if (this.exampleForm.valid) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form is submitted', life: 3000 });
        }
    }

    isInvalid(controlName: string) {
        const control = this.exampleForm.get(controlName);

        return control?.invalid && this.formSubmitted;
    }
}
```

## Signal-forms

```typescript
import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { InputColorModule } from 'primeng/inputcolor';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form novalidate (submit)="onSubmit($event)" class="flex flex-col gap-4">
                <div class="flex flex-col items-center gap-2">
                    <p-inputcolor [formField]="exampleForm.color" class="w-80 space-y-3">
                        <p-inputcolor-area>
                            <p-inputcolor-area-background />
                            <p-inputcolor-area-handle />
                        </p-inputcolor-area>
                        <div class="flex items-center gap-2">
                            <div class="flex-1 space-y-1 mr-1">
                                <p-inputcolor-slider>
                                    <p-inputcolor-transparency-grid />
                                    <p-inputcolor-slider-track />
                                    <p-inputcolor-slider-handle />
                                </p-inputcolor-slider>
                            </div>
                            <p-inputcolor-swatch class="shrink-0">
                                <p-inputcolor-transparency-grid />
                                <p-inputcolor-swatch-background />
                            </p-inputcolor-swatch>
                        </div>
                        <input pInputColorInput [fluid]="true" channel="hex" />
                    </p-inputcolor>
                    @if (exampleForm.color().touched() && exampleForm.color().invalid()) {
                        @for (error of exampleForm.color().errors(); track error.kind) {
                            <p-message severity="error" size="small" variant="simple">{{ error.message }}</p-message>
                        }
                    }
                </div>
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, ToastModule, InputColorModule, ButtonModule, FormField]
})
export class InputColorSignalFormsDemo {
    messageService = inject(MessageService);

    model = signal({ color: '' });

    exampleForm = form(this.model, (path) => {
        required(path.color, { when: ({ state }) => state.touched(), message: 'Color is required.' });
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
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { InputColorModule } from 'primeng/inputcolor';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form #exampleForm="ngForm" (ngSubmit)="onSubmit(exampleForm)" class="flex flex-col gap-4">
                <div class="flex flex-col items-center gap-2">
                    <p-inputcolor name="color" [(ngModel)]="color" #colorModel="ngModel" required class="w-80 space-y-3">
                        <p-inputcolor-area>
                            <p-inputcolor-area-background />
                            <p-inputcolor-area-handle />
                        </p-inputcolor-area>
                        <div class="flex items-center gap-2">
                            <div class="flex-1 space-y-1 mr-1">
                                <p-inputcolor-slider>
                                    <p-inputcolor-transparency-grid />
                                    <p-inputcolor-slider-track />
                                    <p-inputcolor-slider-handle />
                                </p-inputcolor-slider>
                            </div>
                            <p-inputcolor-swatch class="shrink-0">
                                <p-inputcolor-transparency-grid />
                                <p-inputcolor-swatch-background />
                            </p-inputcolor-swatch>
                        </div>
                        <input pInputColorInput [fluid]="true" channel="hex" />
                    </p-inputcolor>
                    @if (colorModel.invalid && (colorModel.touched || exampleForm.submitted)) {
                        <p-message severity="error" size="small" variant="simple">Color is required.</p-message>
                    }
                </div>
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, ToastModule, InputColorModule, ButtonModule, FormsModule]
})
export class InputColorTemplateDrivenFormsDemo {
    messageService = inject(MessageService);

    color: string | undefined;

    onSubmit(form: any) {
        if (form.valid) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form is submitted', life: 3000 });
        }
    }
}
```

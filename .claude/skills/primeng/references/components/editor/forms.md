# Angular Editor Component — Formulare (Signal / Reactive / Template-driven)

## Reactiveforms

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <form [formGroup]="exampleForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <p-editor formControlName="text" [invalid]="isInvalid('text')" [style]="{ height: '320px' }" />
                @if (isInvalid('text')) {
                    <p-message severity="error" size="small" variant="simple">Content is required.</p-message>
                }
            </div>
            <button pButton severity="secondary" type="submit">Submit</button>
        </form>
    `,
    standalone: true,
    imports: [EditorModule, MessageModule, ToastModule, ButtonModule, ReactiveFormsModule]
})
export class EditorReactiveFormsDemo {
    private fb = inject(FormBuilder);

    messageService = inject(MessageService);

    items: any[] | undefined;

    exampleForm: FormGroup | undefined;

    formSubmitted: boolean = false;

    constructor() {
        this.exampleForm = this.fb.group({
            text: ['', Validators.required]
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

        return control?.invalid && (control.touched || this.formSubmitted);
    }
}
```

## Signal-forms

```typescript
import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { EditorModule } from 'primeng/editor';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <form novalidate (submit)="onSubmit($event)" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <p-editor [formField]="exampleForm.text" [style]="{ height: '320px' }" />
                @if (exampleForm.text().touched() && exampleForm.text().invalid()) {
                    @for (error of exampleForm.text().errors(); track error.kind) {
                        <p-message severity="error" size="small" variant="simple">{{ error.message }}</p-message>
                    }
                }
            </div>
            <button pButton severity="secondary" type="submit">Submit</button>
        </form>
    `,
    standalone: true,
    imports: [EditorModule, MessageModule, ToastModule, ButtonModule, FormField]
})
export class EditorSignalFormsDemo {
    messageService = inject(MessageService);

    model = signal({ text: '' });

    exampleForm = form(this.model, (path) => {
        required(path.text, { when: ({ state }) => state.touched(), message: 'Content is required.' });
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
import { EditorModule } from 'primeng/editor';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <form #exampleForm="ngForm" (ngSubmit)="onSubmit(exampleForm)" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <p-editor #content="ngModel" [(ngModel)]="text" [invalid]="content.invalid && (content.touched || exampleForm.submitted)" name="content" [style]="{ height: '320px' }" required />
                @if (content.invalid && (content.touched || exampleForm.submitted)) {
                    <p-message severity="error" size="small" variant="simple">Content is required.</p-message>
                }
            </div>
            <button pButton severity="secondary" type="submit">Submit</button>
        </form>
    `,
    standalone: true,
    imports: [EditorModule, MessageModule, ToastModule, ButtonModule, FormsModule]
})
export class EditorTemplateDrivenFormsDemo {
    messageService = inject(MessageService);

    text: string | undefined;

    onSubmit(form: any) {
        if (form.valid) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form Submitted', life: 3000 });
        }
    }
}
```

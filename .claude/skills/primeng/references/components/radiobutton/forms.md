# Angular RadioButton Component — Formulare (Signal / Reactive / Template-driven)

## Reactiveforms

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { LabelModule } from 'primeng/label';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form [formGroup]="exampleForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
                <div class="flex flex-wrap gap-4">
                    @for (category of categories; track category.key) {
                        <div class="flex items-center gap-2">
                            <p-radiobutton formControlName="selectedCategory" name="selectedCategory" [inputId]="'rf_' + category.key" [value]="category" [invalid]="isInvalid('selectedCategory')" />
                            <label pLabel [for]="'rf_' + category.key" class="text-sm"> {{ category.name }} </label>
                        </div>
                    }
                </div>
                @if (isInvalid('selectedCategory')) {
                    <p-message severity="error" size="small" variant="simple"> At least one ingredient must be selected. </p-message>
                }
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, RadioButtonModule, ToastModule, ButtonModule, LabelModule, ReactiveFormsModule],
    providers: [MessageService]
})
export class RadioButtonReactiveFormsDemo {
    private fb = inject(FormBuilder);

    messageService = inject(MessageService);

    formSubmitted: boolean = false;

    exampleForm: FormGroup;

    categories: any[] = [
        { name: 'Cheese', key: 'C' },
        { name: 'Mushroom', key: 'M' },
        { name: 'Pepper', key: 'P' },
        { name: 'Onion', key: 'O' }
    ];

    constructor() {
        this.exampleForm = this.fb.group({
            selectedCategory: ['', Validators.required]
        });
    }

    isInvalid(controlName: string) {
        const control = this.exampleForm.get(controlName);

        return control?.invalid && this.formSubmitted;
    }

    onSubmit() {
        this.formSubmitted = true;

        if (this.exampleForm.valid) {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Form is submitted',
                life: 3000
            });
        }
    }
}
```

## Signal-forms

```typescript
import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { LabelModule } from 'primeng/label';
import { MessageService } from 'primeng/api';

interface Category {
    name: string;
    key: string;
}

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form novalidate (submit)="onSubmit($event)" class="flex flex-col gap-4">
                <div class="flex flex-wrap gap-4">
                    @for (category of categories; track category.key) {
                        <div class="flex items-center gap-2">
                            <p-radiobutton [formField]="exampleForm.selectedCategory" name="selectedCategory" [inputId]="'sf_' + category.key" [value]="category" />
                            <label pLabel [for]="'sf_' + category.key" class="text-sm">{{ category.name }}</label>
                        </div>
                    }
                </div>
                @if (exampleForm.selectedCategory().touched() && exampleForm.selectedCategory().invalid()) {
                    @for (error of exampleForm.selectedCategory().errors(); track error.kind) {
                        <p-message severity="error" size="small" variant="simple">{{ error.message }}</p-message>
                    }
                }
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, RadioButtonModule, ToastModule, ButtonModule, LabelModule, FormField],
    providers: [MessageService]
})
export class RadioButtonSignalFormsDemo {
    messageService = inject(MessageService);

    categories: Category[] = [
        { name: 'Cheese', key: 'C' },
        { name: 'Mushroom', key: 'M' },
        { name: 'Pepper', key: 'P' },
        { name: 'Onion', key: 'O' }
    ];

    model = signal<{ selectedCategory: Category | null }>({ selectedCategory: null });

    exampleForm = form(this.model, (path) => {
        required(path.selectedCategory, { when: ({ state }) => state.touched(), message: 'Please select a category.' });
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
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { LabelModule } from 'primeng/label';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form #exampleForm="ngForm" (ngSubmit)="onSubmit(exampleForm)" class="flex flex-col gap-4">
                <div class="flex flex-wrap gap-4">
                    @for (category of categories; track category.name) {
                        <div class="flex items-center gap-2">
                            <p-radiobutton [(ngModel)]="ingredient" [inputId]="'td_' + category.key" [value]="category" [invalid]="isInvalid(exampleForm)" name="ingredient" />
                            <label pLabel [for]="'td_' + category.key" class="text-sm"> {{ category.name }} </label>
                        </div>
                    }
                </div>
                @if (isInvalid(exampleForm)) {
                    <p-message severity="error" size="small" variant="simple"> At least one ingredient must be selected. </p-message>
                }
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, RadioButtonModule, ToastModule, ButtonModule, LabelModule, FormsModule],
    providers: [MessageService]
})
export class RadioButtonTemplateDrivenFormsDemo {
    messageService = inject(MessageService);

    formSubmitted: boolean = false;

    ingredient!: any;

    categories: any[] = [
        { name: 'Cheese', key: 'C' },
        { name: 'Mushroom', key: 'M' },
        { name: 'Pepper', key: 'P' },
        { name: 'Onion', key: 'O' }
    ];

    isInvalid(form: NgForm) {
        return !this.ingredient && form.submitted;
    }

    onSubmit(form: NgForm) {
        if (!this.isInvalid(form)) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form Submitted', life: 3000 });
        }
    }
}
```

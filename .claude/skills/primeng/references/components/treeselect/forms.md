# Angular TreeSelect Component — Formulare (Signal / Reactive / Template-driven)

## Reactiveforms

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form [formGroup]="exampleForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4 w-full md:w-80">
                <div class="flex flex-col gap-1">
                    <p-treeselect class="md:w-80 w-full" formControlName="selectedNodes" [options]="nodes" placeholder="Select Item" [invalid]="isInvalid('selectedNodes')" />
                    @if (isInvalid('selectedNodes')) {
                        <p-message severity="error" size="small" variant="simple">Selection is required.</p-message>
                    }
                </div>
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, ToastModule, TreeSelectModule, ButtonModule, ReactiveFormsModule],
    providers: [NodeService]
})
export class TreeSelectReactiveFormsDemo {
    private fb = inject(FormBuilder);

    private nodeService = inject(NodeService);

    messageService = inject(MessageService);

    nodes!: any[];

    exampleForm: FormGroup | undefined;

    formSubmitted: boolean = false;

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
        this.exampleForm = this.fb.group({
            selectedNodes: ['', Validators.required]
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
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { TreeNode, MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form novalidate (submit)="onSubmit($event)" class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <p-treeselect class="md:w-80 w-full" [formField]="exampleForm.selectedNodes" [options]="nodes" placeholder="Select Item" />
                    @if (exampleForm.selectedNodes().dirty() && exampleForm.selectedNodes().invalid()) {
                        @for (error of exampleForm.selectedNodes().errors(); track error.kind) {
                            <p-message severity="error" size="small" variant="simple">{{ error.message }}</p-message>
                        }
                    }
                </div>
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, ToastModule, TreeSelectModule, ButtonModule, FormField],
    providers: [NodeService]
})
export class TreeSelectSignalFormsDemo {
    messageService = inject(MessageService);

    nodeService = inject(NodeService);

    nodes: TreeNode[] = [];

    model = signal<{ selectedNodes: TreeNode | null }>({ selectedNodes: null });

    exampleForm = form(this.model, (path) => {
        required(path.selectedNodes, { when: ({ state }) => state.dirty(), message: 'Item is required.' });
    });

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }

    onSubmit(event: Event) {
        event.preventDefault();
        this.exampleForm.selectedNodes().markAsDirty();
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
import { TreeSelectModule } from 'primeng/treeselect';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { MessageService } from 'primeng/api';

@Component({
    template: `
        <p-toast />
        <div class="flex justify-center">
            <form #exampleForm="ngForm" (ngSubmit)="onSubmit(exampleForm)" class="flex flex-col gap-4 w-full md:w-80">
                <div class="flex flex-col gap-1">
                    <p-treeselect #node="ngModel" [(ngModel)]="selectedNodes" [invalid]="node.invalid && exampleForm.submitted" name="node" class="md:w-80 w-full" [options]="nodes" placeholder="Select Item" required />
                    @if (node.invalid && exampleForm.submitted) {
                        <p-message severity="error" size="small" variant="simple">Selection is required.</p-message>
                    }
                </div>
                <button pButton severity="secondary" type="submit">Submit</button>
            </form>
        </div>
    `,
    standalone: true,
    imports: [MessageModule, ToastModule, TreeSelectModule, ButtonModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectTemplateDrivenFormsDemo {
    private nodeService = inject(NodeService);

    messageService = inject(MessageService);

    selectedNodes: any;

    nodes!: any[];

    constructor() {
        this.nodeService.getFiles().then((files) => (this.nodes = files));
    }

    onSubmit(form: any) {
        if (form.valid) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form Submitted', life: 3000 });
        }
    }
}
```

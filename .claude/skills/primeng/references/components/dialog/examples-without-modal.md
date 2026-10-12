# Angular Dialog Component — Without Modal

## Without Modal

Mask layer behind the Dialog is configured with the modal property. By default, no modal layer is added.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="showDialog()">Show</button>
            <p-dialog header="Edit Profile" [(visible)]="visible" [style]="{ width: '25rem' }">
                <div class="flex flex-col gap-6">
                    <span class="text-surface-500 dark:text-surface-400">Update your information.</span>
                    <div class="flex flex-col gap-1">
                        <label pLabel for="username" class="font-semibold">Username</label>
                        <input pInputText id="username" [(ngModel)]="username" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label pLabel for="email" class="font-semibold">Email</label>
                        <input pInputText id="email" [(ngModel)]="email" />
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="button" pButton severity="secondary" (click)="visible = false">Cancel</button>
                        <button type="button" pButton (click)="visible = false">Save</button>
                    </div>
                </div>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [DialogModule, ButtonModule, InputTextModule, LabelModule, FormsModule]
})
export class DialogWithoutModalDemo {
    visible: boolean = false;

    username: string = '';

    email: string = '';

    showDialog() {
        this.visible = true;
    }
}
```

# Angular Dialog Component — Modal

## Modal

Mask layer behind the Dialog is enabled with the modal property, and dismissableMask allows closing it by clicking outside.

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
            <button type="button" pButton (click)="visible = true">Edit Profile</button>
            <p-dialog [(visible)]="visible" [modal]="true" [dismissableMask]="true" header="Edit Profile" [style]="{ width: '25rem' }">
                <div class="flex flex-col gap-6">
                    <span class="text-surface-500 dark:text-surface-400">Update your information. Click outside the dialog to dismiss.</span>
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
export class DialogModalDemo {
    visible: boolean = false;

    username: string = '';

    email: string = '';
}
```

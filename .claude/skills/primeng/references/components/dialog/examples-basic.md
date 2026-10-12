# Angular Dialog Component — Basic

## Basic

Dialog is used as a container and visibility is controlled with a binding to visible property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="visible = true">Edit Profile</button>
            <p-dialog [(visible)]="visible" [modal]="true" header="Edit Profile" [style]="{ width: '24rem' }">
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1.5">
                        <label pLabel for="name">Name</label>
                        <input pInputText id="name" [(ngModel)]="name" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label pLabel for="email">Email</label>
                        <input pInputText id="email" [(ngModel)]="email" />
                    </div>
                </div>
                <ng-template #footer>
                    <button type="button" pButton severity="secondary" variant="outlined" (click)="visible = false">Cancel</button>
                    <button type="button" pButton (click)="visible = false">Save</button>
                </ng-template>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [DialogModule, ButtonModule, InputTextModule, LabelModule, FormsModule]
})
export class DialogBasicDemo {
    visible: boolean = false;

    name: string = 'Amanda Miller';

    email: string = 'amanda@example.com';
}
```

# Angular Dialog Component — Confirmation

## Confirmation

A confirmation dialog can be built by disabling the header close button with closable and providing explicit actions in the content.

```typescript
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton severity="danger" (click)="visible = true">Delete Account</button>
            <p-dialog [(visible)]="visible" [modal]="true" [closable]="false" header="Delete your account." [style]="{ width: '26rem' }">
                <div class="flex flex-col gap-4">
                    <p class="text-surface-500 dark:text-surface-400 text-sm mt-0 mb-0">This action cannot be undone. All of your data, including projects, files, and settings will be permanently removed.</p>
                    <div class="flex justify-end gap-2">
                        <button type="button" pButton severity="secondary" (click)="visible = false">Cancel</button>
                        <button type="button" pButton severity="danger" (click)="visible = false">Delete</button>
                    </div>
                </div>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [DialogModule, ButtonModule]
})
export class DialogConfirmationDemo {
    visible: boolean = false;
}
```

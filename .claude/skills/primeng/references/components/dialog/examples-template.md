# Angular Dialog Component — Template

## Template

Dialog can be customized using header and footer templates.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="showDialog()">Show</button>
            <p-dialog [(visible)]="visible" [modal]="true" [style]="{ width: '25rem' }">
                <ng-template #header>
                    <div class="inline-flex items-center justify-center gap-2">
                        <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
                        <span class="font-bold whitespace-nowrap">Amy Elsner</span>
                    </div>
                </ng-template>
                <span class="text-surface-500 dark:text-surface-400 block mb-8 text-sm">Update your information.</span>
                <div class="flex items-center gap-4 mb-4">
                    <label for="username" class="font-semibold w-24 text-sm">Username</label>
                    <input pInputText id="username" class="flex-auto" autocomplete="off" />
                </div>
                <div class="flex items-center gap-4 mb-2">
                    <label for="email" class="font-semibold w-24 text-sm">Email</label>
                    <input pInputText id="email" class="flex-auto" autocomplete="off" />
                </div>
                <ng-template #footer>
                    <button type="button" pButton [text]="true" severity="secondary" (click)="visible = false">Cancel</button>
                    <button type="button" pButton [outlined]="true" severity="secondary" (click)="visible = false">Save</button>
                </ng-template>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, DialogModule, ButtonModule, InputTextModule]
})
export class DialogTemplateDemo {
    visible: boolean = false;

    showDialog() {
        this.visible = true;
    }
}
```

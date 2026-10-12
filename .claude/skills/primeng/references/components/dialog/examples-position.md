# Angular Dialog Component — Position

## Position

The position property is used to display a Dialog at all edges and corners of the screen.

```typescript
import { Component } from '@angular/core';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogPosition } from 'primeng/types/dialog';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-2 mb-2">
            <button type="button" pButton (click)="showDialog('left')" severity="secondary" class="min-w-40">Left</button>
            <button type="button" pButton (click)="showDialog('right')" severity="secondary" class="min-w-40">Right</button>
        </div>
        <div class="flex flex-wrap justify-center gap-2 mb-2">
            <button type="button" pButton (click)="showDialog('topleft')" severity="secondary" class="min-w-40">TopLeft</button>
            <button type="button" pButton (click)="showDialog('top')" severity="secondary" class="min-w-40">Top</button>
            <button type="button" pButton (click)="showDialog('topright')" severity="secondary" class="min-w-40">TopRight</button>
        </div>
        <div class="flex flex-wrap justify-center gap-2">
            <button type="button" pButton (click)="showDialog('bottomleft')" severity="secondary" class="min-w-40">BottomLeft</button>
            <button type="button" pButton (click)="showDialog('bottom')" severity="secondary" class="min-w-40">Bottom</button>
            <button type="button" pButton (click)="showDialog('bottomright')" severity="secondary" class="min-w-40">BottomRight</button>
        </div>
        <p-dialog header="Edit Profile" [modal]="true" [(visible)]="visible" [position]="position" [style]="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-8 text-sm">Update your information.</span>
            <div class="flex items-center gap-4 mb-4">
                <label for="username" class="font-semibold w-24 text-sm">Username</label>
                <input pInputText id="username" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex items-center gap-4 mb-8">
                <label for="email" class="font-semibold w-24 text-sm">Email</label>
                <input pInputText id="email" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-end gap-2">
                <button type="button" pButton severity="secondary" (click)="visible = false">Cancel</button>
                <button type="button" pButton (click)="visible = false">Save</button>
            </div>
        </p-dialog>
    `,
    standalone: true,
    imports: [DialogModule, ButtonModule, InputTextModule]
})
export class DialogPositionDemo {
    visible: boolean = false;

    position: DialogPosition = 'center';

    showDialog(position: DialogPosition) {
        this.position = position;
        this.visible = true;
    }
}
```

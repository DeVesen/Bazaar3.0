# Angular Dialog Component — Draggable

## Draggable

Enabling the draggable property lets the user reposition the Dialog by dragging it from its header.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog, DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="visible = true">Open Note</button>
            <p-dialog [(visible)]="visible" [draggable]="true" [modal]="true" header="Quick Note" [style]="{ width: '24rem' }">
                <div class="flex flex-col gap-4">
                    <p class="text-sm text-surface-500 dark:text-surface-400 mt-0 mb-0">Drag this dialog by its header to reposition it anywhere on the screen.</p>
                    <textarea pTextarea [(ngModel)]="note" class="w-full h-32 resize-none" placeholder="Type your note here..."></textarea>
                </div>
                <ng-template #footer>
                    <button type="button" pButton severity="secondary" (click)="visible = false">Discard</button>
                    <button type="button" pButton (click)="visible = false">Save Note</button>
                </ng-template>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [DialogModule, ButtonModule, TextareaModule, FormsModule]
})
export class DialogDraggableDemo {
    visible: boolean = false;

    note: string = '';
}
```

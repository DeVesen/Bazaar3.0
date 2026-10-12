# Angular Dialog Component — Maximizable

## Maximizable

Setting maximizable property to true enables the full screen mode.

```typescript
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <button type="button" pButton (click)="showDialog()">Show</button>
            <p-dialog header="Header" [modal]="true" [(visible)]="visible" [style]="{ width: '50rem' }" [breakpoints]="{ '1199px': '75vw', '575px': '90vw' }" [maximizable]="true">
                <p class="text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed …(lange Zeile gekürzt)
                    consequat. Duis aute irure dolor in reprehenderit in volupta …(lange Zeile gekürzt)
                </p>
            </p-dialog>
        </div>
    `,
    standalone: true,
    imports: [DialogModule, ButtonModule]
})
export class DialogMaximizableDemo {
    visible: boolean = false;

    showDialog() {
        this.visible = true;
    }
}
```

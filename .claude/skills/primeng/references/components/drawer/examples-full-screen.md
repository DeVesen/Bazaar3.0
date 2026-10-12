# Angular Drawer Component — Full Screen

## Full Screen

The full screen mode is enabled when fullScreen property is set as true .

```typescript
import { Component } from '@angular/core';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { WindowMaximize } from '@primeicons/angular/window-maximize';

@Component({
    template: `
        <div class="flex justify-center">
            <p-drawer [(visible)]="visible" header="Full Screen Drawer" [fullScreen]="true">
                <p>The full screen mode is enabled when position property is set as full.</p>
            </p-drawer>
            <button type="button" pButton iconOnly (click)="visible = true">
                <svg data-p-icon="window-maximize" />
            </button>
        </div>
    `,
    standalone: true,
    imports: [DrawerModule, ButtonModule, WindowMaximize]
})
export class DrawerFullscreenDemo {
    visible: boolean = false;
}
```

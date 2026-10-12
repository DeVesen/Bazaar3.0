# Angular Drawer Component — Basic

## Basic

A slide-in panel from the edge of the screen for contextual content.

```typescript
import { Component } from '@angular/core';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Bars } from '@primeicons/angular/bars';

@Component({
    template: `
        <div class="flex justify-center">
            <p-drawer [(visible)]="visible" header="Basic Drawer" styleClass="w-full! md:w-80!">
                <p>A slide-in panel from the edge of the screen for contextual content.</p>
            </p-drawer>
            <button type="button" pButton iconOnly (click)="visible = true">
                <svg data-p-icon="bars" />
            </button>
        </div>
    `,
    standalone: true,
    imports: [DrawerModule, ButtonModule, Bars]
})
export class DrawerBasicDemo {
    visible: boolean = false;
}
```

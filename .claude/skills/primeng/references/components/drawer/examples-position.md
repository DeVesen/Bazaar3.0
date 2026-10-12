# Angular Drawer Component — Position

## Position

The position of the drawer can be customized with the position property. The available values are left , right , top and bottom .

```typescript
import { Component } from '@angular/core';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { ArrowRight } from '@primeicons/angular/arrow-right';
import { ArrowLeft } from '@primeicons/angular/arrow-left';
import { ArrowDown } from '@primeicons/angular/arrow-down';
import { ArrowUp } from '@primeicons/angular/arrow-up';

@Component({
    template: `
        <p-drawer [(visible)]="visibleLeft" header="Left Drawer" position="left" styleClass="w-full! md:w-80!">
            <p>The position of the drawer can be customized with the position property. The available values are left, right, top and bottom.</p>
        </p-drawer>
        <p-drawer [(visible)]="visibleRight" header="Right Drawer" position="right" styleClass="w-full! md:w-80!">
            <p>The position of the drawer can be customized with the position property. The available values are left, right, top and bottom.</p>
        </p-drawer>
        <p-drawer [(visible)]="visibleTop" header="Top Drawer" position="top" [style]="{ height: 'auto' }">
            <p>The position of the drawer can be customized with the position property. The available values are left, right, top and bottom.</p>
        </p-drawer>
        <p-drawer [(visible)]="visibleBottom" header="Bottom Drawer" position="bottom" [style]="{ height: 'auto' }">
            <p>The position of the drawer can be customized with the position property. The available values are left, right, top and bottom.</p>
        </p-drawer>
        <div class="flex gap-2 justify-center">
            <button type="button" pButton iconOnly (click)="visibleLeft = true">
                <svg data-p-icon="arrow-right" />
            </button>
            <button type="button" pButton iconOnly (click)="visibleRight = true">
                <svg data-p-icon="arrow-left" />
            </button>
            <button type="button" pButton iconOnly (click)="visibleTop = true">
                <svg data-p-icon="arrow-down" />
            </button>
            <button type="button" pButton iconOnly (click)="visibleBottom = true">
                <svg data-p-icon="arrow-up" />
            </button>
        </div>
    `,
    standalone: true,
    imports: [DrawerModule, ButtonModule, ArrowRight, ArrowLeft, ArrowDown, ArrowUp]
})
export class DrawerPositionDemo {
    visibleLeft: boolean = false;

    visibleRight: boolean = false;

    visibleTop: boolean = false;

    visibleBottom: boolean = false;
}
```

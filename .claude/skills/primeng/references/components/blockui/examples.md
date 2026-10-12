# Angular BlockUI Component — Beispiele

## Basic

The element to block should be placed as a child of BlockUI and blocked property is required to control the state.

```typescript
import { Component } from '@angular/core';
import { BlockUIModule } from 'primeng/blockui';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <button type="button" pButton (click)="blockedPanel = true" class="me-2" severity="secondary">Block</button>
        <button type="button" pButton (click)="blockedPanel = false" severity="secondary">Unblock</button>
        <p-blockui [target]="pnl" [blocked]="blockedPanel" />
        <p-panel #pnl header="Header" class="mt-5">
            <p class="m-0 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do  …(lange Zeile gekürzt)
                consequat. Duis aute irure dolor in reprehenderit in voluptate v …(lange Zeile gekürzt)
            </p>
        </p-panel>
    `,
    standalone: true,
    imports: [BlockUIModule, PanelModule, ButtonModule]
})
export class BlockUIBasicDemo {
    blockedPanel: boolean = false;
}
```

## Document

If the target element is not specified, BlockUI blocks the document by default.

```typescript
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <p-blockui [blocked]="blockedDocument" />
            <button type="button" pButton (click)="blockDocument()">Block</button>
        </div>
    `,
    standalone: true,
    imports: [BlockUIModule, ButtonModule]
})
export class BlockUIDocumentDemo {
    private cd = inject(ChangeDetectorRef);

    blockedDocument: boolean = false;

    blockDocument() {
        this.blockedDocument = true;
        setTimeout(() => {
            this.blockedDocument = false;
            this.cd.markForCheck();
        }, 3000);
    }
}
```

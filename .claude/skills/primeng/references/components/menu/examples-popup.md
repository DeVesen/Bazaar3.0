# Angular Menu Component — Popup

## Popup

Popup mode is enabled by setting the popup property to true and calling the toggle method to display the menu relative to its target.

```typescript
import { Component, OnInit } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { Bars } from '@primeicons/angular/bars';
import { PIcon } from '@primeicons/angular/p-icon';

@Component({
    template: `
        <div class="flex justify-center">
            <p-menu #menu [model]="items" [popup]="true">
                <ng-template #item let-item>
                    <a pRipple class="flex items-center px-2.5 py-1.5 cursor-pointer">
                        <svg [pIcon]="item.icon"></svg>
                        <span class="ms-2 text-sm">{{ item.label }}</span>
                    </a>
                </ng-template>
            </p-menu>
            <button type="button" pButton severity="secondary" [outlined]="true" iconOnly aria-label="Apps" (click)="menu.toggle($event)"><svg data-p-icon="bars"></svg></button>
        </div>
    `,
    standalone: true,
    imports: [MenuModule, ButtonModule, RippleModule, Bars, PIcon]
})
export class MenuPopupDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Document',
                items: [
                    { label: 'New file', icon: 'file' },
                    { label: 'Open recent', icon: 'file-edit' },
                    { label: 'Duplicate', icon: 'copy' },
                    { label: 'Import', icon: 'download' },
                    { label: 'Export', icon: 'file-export' },
                    { label: 'Share', icon: 'share-alt' },
                    { label: 'Rename', icon: 'pencil' }
                ]
            }
        ];
    }
}
```

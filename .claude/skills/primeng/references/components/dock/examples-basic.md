# Angular Dock Component — Basic

## Basic

Dock requires a collection of menuitems as its model . Default location is bottom and other sides are also available when defined with the position property. Content of the dock component is defined by item template.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DockModule } from 'primeng/dock';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex flex-wrap gap-4 mb-7">
            @for (pos of positionOptions; track pos.value) {
                <div class="flex items-center">
                    <p-radiobutton name="dock" [value]="pos.value" [(ngModel)]="position" [inputId]="pos.label" />
                    <label [for]="pos.label" class="ml-2 text-sm"> {{ pos.label }} </label>
                </div>
            }
        </div>
        <div class="dock-window">
            <p-dock [model]="items" [position]="position">
                <ng-template #item let-item>
                    <img [pTooltip]="item.label" tooltipPosition="top" [src]="item.icon" [alt]="item.label" width="100%" />
                </ng-template>
            </p-dock>
        </div>
    `,
    styles: [
        `
            :host ::ng-deep {
                .dock-window {
                    width: 100%;
                    height: 450px;
                    position: relative;
                    background-image: url('https://primefaces.org/cdn/primeng/images/dock/window.jpg');
                    background-repeat: no-repeat;
                    background-size: cover;
                }

                .p-dock {
                    z-index: 1000;
                }
            }
        `
    ],
    standalone: true,
    imports: [DockModule, RadioButtonModule, TooltipModule, FormsModule]
})
export class DockBasicDemo implements OnInit {
    items: MenuItem[] | undefined;

    positionOptions = [
        {
            label: 'Bottom',
            value: 'bottom'
        },
        {
            label: 'Top',
            value: 'top'
        },
        {
            label: 'Left',
            value: 'left'
        },
        {
            label: 'Right',
            value: 'right'
        }
    ];

    ngOnInit() {
        this.items = [
            {
                label: 'Finder',
                icon: 'https://primefaces.org/cdn/primeng/images/dock/finder.svg'
            },
            {
                label: 'App Store',
                icon: 'https://primefaces.org/cdn/primeng/images/dock/appstore.svg'
            },
            {
                label: 'Photos',
                icon: 'https://primefaces.org/cdn/primeng/images/dock/photos.svg'
            },
            {
                label: 'Trash',
                icon: 'https://primefaces.org/cdn/primeng/images/dock/trash.png'
            }
        ];
    }
}
```

# Angular Speed Dial Component — Tooltip

## Tooltip

SpeedDial can be combined with Tooltip to display labels for action items.

```typescript
import { Component, OnInit } from '@angular/core';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div style="position: relative; height: 350px">
            <p-speeddial [model]="items" direction="up" [style]="{ position: 'absolute', right: 0, bottom: 0 }" [buttonProps]="{ severity: 'help', rounded: true }" [tooltipOptions]="{ tooltipPosition: 'left' }" />
            <p-speeddial [model]="items" direction="up" [style]="{ position: 'absolute', left: 0, bottom: 0 }" [buttonProps]="{ severity: 'danger', rounded: true }" [tooltipOptions]="{ tooltipPosition: 'right' }" />
        </div>
    `,
    standalone: true,
    imports: [SpeedDialModule]
})
export class SpeedDialTooltipDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Add',
                icon: 'pi pi-pencil'
            },
            {
                label: 'Update',
                icon: 'pi pi-refresh'
            },
            {
                label: 'Delete',
                icon: 'pi pi-trash'
            },
            {
                label: 'Upload',
                icon: 'pi pi-upload'
            },
            {
                label: 'External',
                icon: 'pi pi-external-link'
            }
        ];
    }
}
```

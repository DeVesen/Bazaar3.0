# Angular Speed Dial Component — Circle

## Circle

Items can be displayed around the button when type is set to circle . Additional radius property defines the radius of the circle.

```typescript
import { Component, OnInit } from '@angular/core';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex items-center justify-center" style="position: relative; height: 500px">
            <p-speeddial [model]="items" [radius]="80" type="circle" [style]="{ position: 'absolute' }" [buttonProps]="{ severity: 'warn', rounded: true }" />
        </div>
    `,
    standalone: true,
    imports: [SpeedDialModule]
})
export class SpeedDialCircleDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [{ icon: 'pi pi-pencil' }, { icon: 'pi pi-refresh' }, { ico …(lange Zeile gekürzt)
    }
}
```

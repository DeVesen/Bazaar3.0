# Angular Speed Dial Component — Mask

## Mask

Adding mask property displays a modal layer behind the popup items.

```typescript
import { Component, OnInit } from '@angular/core';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div style="position: relative; height: 360px">
            <p-speeddial [model]="items" direction="up" mask [style]="{ position: 'absolute', right: '1rem', bottom: '1rem' }" />
        </div>
    `,
    standalone: true,
    imports: [SpeedDialModule]
})
export class SpeedDialMaskDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [{ icon: 'pi pi-pencil' }, { icon: 'pi pi-refresh' }, { icon: 'pi pi-trash' }, { icon: 'pi pi-upload' }, { icon: 'pi pi-external-link' }];
    }
}
```

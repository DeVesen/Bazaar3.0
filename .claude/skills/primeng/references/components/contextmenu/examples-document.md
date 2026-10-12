# Angular ContextMenu Component — Document

## Document

Setting the global property to true attaches the context menu to the document.

```typescript
import { Component, OnInit } from '@angular/core';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="text-center">
            <p class="mb-0 text-sm">Right-click anywhere on this page to view the global ContextMenu.</p>
            <p-contextmenu [model]="items" [global]="true" />
        </div>
    `,
    standalone: true,
    imports: [ContextMenuModule]
})
export class ContextMenuDocumentDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            { label: 'Back', icon: 'pi pi-home' },
            { label: 'Reload', icon: 'pi pi-refresh' },
            { separator: true },
            { label: 'Copy', icon: 'pi pi-copy' },
            { label: 'Paste', icon: 'pi pi-clipboard' },
            { separator: true },
            {
                label: 'View',
                icon: 'pi pi-folder',
                items: [
                    { label: 'Zoom In', icon: 'pi pi-search-plus' },
                    { label: 'Zoom Out', icon: 'pi pi-search-minus' },
                    { label: 'Page Source', icon: 'pi pi-chart-line' }
                ]
            },
            { separator: true },
            { label: 'Open Link', icon: 'pi pi-external-link' },
            { label: 'Print', icon: 'pi pi-print' },
            { label: 'Inspect', icon: 'pi pi-question-circle' }
        ];
    }
}
```

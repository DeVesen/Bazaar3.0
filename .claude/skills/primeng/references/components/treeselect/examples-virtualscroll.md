# Angular TreeSelect Component — Virtualscroll

## Virtualscroll

VirtualScrolling is an efficient way of rendering the options by displaying a small subset of data in the viewport at any time. When dealing with huge number of options, it is suggested to enable VirtualScrolling to avoid performance issues. Usage is simple as setting virtualScroll property to true and defining virtualScrollItemSize to specify the height of an item.

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { NodeService } from '@/service/nodeservice';

@Component({
    template: `
        <div class="flex justify-center">
            <p-treeselect
                class="w-full md:w-80"
                [(ngModel)]="selectedNodes"
                [options]="nodes"
                display="chip"
                [metaKeySelection]="false"
                selectionMode="checkbox"
                placeholder="Select Item"
                [virtualScroll]="true"
                [virtualScrollItemSize]="35"
                [virtualScrollOptions]="{ scrollHeight: '200px' }"
            ></p-treeselect>
        </div>
    `,
    standalone: true,
    imports: [TreeSelectModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectVirtualScrollDemo {
    private nodeService = inject(NodeService);

    nodes!: any[];

    selectedNodes: any;

    constructor() {
        this.nodeService.getLargeTreeNodes().then((files) => (this.nodes = files));
    }
}
```

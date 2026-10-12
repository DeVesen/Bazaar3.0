# Angular Tree Component — Virtual Scroll

## Virtual Scroll

VirtualScroller is a performance-approach to handle huge data efficiently. Setting virtualScroll property as true and providing a virtualScrollItemSize in pixels would be enough to enable this functionality.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-tree [value]="nodes()" scrollHeight="250px" [virtualScroll]="true" [virtualScrollItemSize]="35" />
    `,
    standalone: true,
    imports: [TreeModule],
    providers: [NodeService]
})
export class TreeVirtualScrollDemo implements OnInit {
    private nodeService = inject(NodeService);

    nodes = signal<TreeNode[]>(undefined);

    ngOnInit() {
        this.nodes.set(this.nodeService.generateNodes(150));
    }
}
```

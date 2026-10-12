# Angular Tree Component — Virtualscrolllazy

## Virtualscrolllazy

VirtualScroller is a performance-approach to handle huge data efficiently. Setting virtualScroll property as true and providing a virtualScrollItemSize in pixels would be enough to enable this functionality.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-tree [value]="nodes()" scrollHeight="250px" [virtualScroll]="true" [lazy]="true" [virtualScrollItemSize]="35" (onNodeExpand)="nodeExpand($event)" [loading]="loading()" />
    `,
    standalone: true,
    imports: [TreeModule],
    providers: [NodeService]
})
export class TreeVirtualScrollLazyDemo implements OnInit {
    private nodeService = inject(NodeService);

    loading = signal<boolean>(false);

    nodes = signal<TreeNode[]>(undefined);

    ngOnInit() {
        this.loading.set(true);
        setTimeout(() => {
            this.nodes.set(this.nodeService.generateNodes(150));
            this.loading.set(false);
        }, 1000);
    }

    nodeExpand(event: any) {
        if (event.node) {
            this.loading.set(true);
            setTimeout(() => {
                event.node.children = this.nodeService.createNodes(5, event.node.key);
                this.loading.set(false);
                this.nodes.set([...this.nodes()]);
            }, 200);
        }
    }
}
```

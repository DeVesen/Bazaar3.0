# Angular Tree Component — Controlled

## Controlled

Tree state can be controlled programmatically with the expanded property of the tree nodes that defines whether a node is open or closed.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';
import { Plus } from '@primeicons/angular/plus';
import { Minus } from '@primeicons/angular/minus';

@Component({
    template: `
        <div class="flex flex-wrap gap-2 mb-6">
            <button type="button" pButton (click)="expandAll()">
                <svg data-p-icon="plus" />
                Expand All
            </button>
            <button type="button" pButton (click)="collapseAll()">
                <svg data-p-icon="minus" />
                Collapse All
            </button>
        </div>
        <p-tree [value]="nodes()" class="w-full md:w-120" />
    `,
    standalone: true,
    imports: [TreeModule, ButtonModule, Plus, Minus],
    providers: [NodeService]
})
export class TreeControlledDemo implements OnInit {
    nodes = signal<TreeNode[]>(undefined);

    private nodeService = inject(NodeService);

    ngOnInit() {
        this.nodeService.getTreeNodes().then((data: TreeNode[]) => this.nodes.set(data));
    }

    expandAll() {
        this.nodes.set(this.nodes().map((node) => this.toggleRecursive(node, true)));
    }

    collapseAll() {
        this.nodes.set(this.nodes().map((node) => this.toggleRecursive(node, false)));
    }

    private toggleRecursive(node: TreeNode, expanded: boolean): TreeNode {
        if (!node.children?.length) {
            return node;
        }

        return {
            ...node,
            expanded,
            children: node.children.map((child) => this.toggleRecursive(child, expanded))
        };
    }
}
```

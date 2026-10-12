# Angular Tree Component — Select All

## Select All

A header checkbox can be added to toggle the selection of every node at once. Its checked and indeterminate states are derived from the current selection.

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TreeModule } from 'primeng/tree';
import { NodeService } from '@/service/nodeservice';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-tree [value]="nodes()" selectionMode="checkbox" [(selection)]="selection" class="w-full md:w-120">
            <ng-template #header>
                <div class="flex items-center gap-2 px-2">
                    <p-checkbox [ngModel]="isAllSelected" [indeterminate]="isSomeSelected" [binary]="true" inputId="tree-select-all" (onChange)="toggleAll()" />
                    <label for="tree-select-all" class="font-medium">Select All</label>
                </div>
            </ng-template>
        </p-tree>
    `,
    standalone: true,
    imports: [CheckboxModule, TreeModule, FormsModule],
    providers: [NodeService]
})
export class TreeSelectAllDemo implements OnInit {
    private nodeService = inject(NodeService);

    nodes = signal<TreeNode[]>(undefined);

    selection: TreeNode[] = [];

    ngOnInit() {
        this.nodeService.getTreeNodes().then((data: TreeNode[]) => {
            data[0].expanded = true;
            this.nodes.set(data);
        });
    }

    private flatten(list: TreeNode[] = []): TreeNode[] {
        return list.reduce<TreeNode[]>((acc, node) => {
            acc.push(node);
            if (node.children) acc.push(...this.flatten(node.children));

            return acc;
        }, []);
    }

    get totalCount() {
        return this.flatten(this.nodes()).length;
    }

    get isAllSelected() {
        return this.totalCount > 0 && this.selection.length === this.totalCount;
    }

    get isSomeSelected() {
        return this.selection.length > 0 && !this.isAllSelected;
    }

    toggleAll() {
        this.selection = this.isAllSelected ? [] : this.flatten(this.nodes());
    }
}
```

# Angular Tree Component — Empty

## Empty

A custom placeholder can be displayed when there are no nodes to show using the empty template.

```typescript
import { Component, signal } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { TreeNode } from 'primeng/api';
import { Folder } from '@primeicons/angular/folder';
import { Plus } from '@primeicons/angular/plus';

@Component({
    template: `
        <p-tree [value]="nodes()" class="w-full md:w-120">
            <ng-template #node let-node>
                <span class="flex items-center gap-2">
                    <svg data-p-icon="folder" />
                    {{ node.label }}
                </span>
            </ng-template>
            <ng-template #empty>
                <div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div class="w-14 h-14 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                        <svg data-p-icon="folder" [size]="28" class="text-surface-400 dark:text-surface-500" />
                    </div>
                    <div>
                        <p class="m-0 font-semibold text-surface-900 dark:text-surface-0">No folders yet</p>
                        <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">Create your first folder to start building a tree.</p>
                    </div>
                    <button type="button" pButton size="small" (click)="addNode()">
                        <svg data-p-icon="plus" />
                        New Folder
                    </button>
                </div>
            </ng-template>
        </p-tree>
    `,
    standalone: true,
    imports: [TreeModule, ButtonModule, Folder, Plus]
})
export class TreeEmptyDemo {
    nodes = signal<TreeNode[]>([]);

    addNode() {
        this.nodes.update((nodes) => [...nodes, { key: `root-${nodes.length}`, label: `New Folder ${nodes.length + 1}` }]);
    }
}
```
